const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Report = require('../models/Report');
const Otp = require('../models/Otp');
const cloudinary = require('../config/cloudinary');
const { Resend } = require('resend');

// Generate Secure User Session Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medintel_super_secret_key_2026', {
    expiresIn: '30d',
  });
};

// --- WELCOME EMAIL ---
// 1) RESEND_API_KEY (resend.com) — sends to signup email, no terminal needed
// 2) Else Gmail: EMAIL_USER + EMAIL_PASS (App Password; spaces stripped automatically)

const WELCOME_SUBJECT = 'Welcome to MedIntel - Your Clinical AI Assistant';

const welcomeEmailHtml = (userName) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #0f766e; padding: 32px 24px; text-align: center;">
             <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 0.5px;">Welcome to MedIntel</h1>
             <p style="color: #ccfbf1; margin-top: 8px; font-size: 14px;">Intelligent Clinical Health Document Parsing</p>
          </div>
          <div style="padding: 40px 32px; background-color: #ffffff;">
             <p style="font-size: 16px; color: #374151;">Hi <strong>${userName}</strong>,</p>
             <p style="font-size: 16px; color: #374151; line-height: 1.6;">Thank you for joining MedIntel! We are thrilled to have you here. Our secure, HIPAA-compliant AI is designed to help you quickly understand complex medical reports, prescriptions, and diagnostics.</p>
             <div style="margin: 32px 0; padding: 20px; background-color: #f0fdfa; border-left: 4px solid #14b8a6; border-radius: 4px;">
               <p style="font-size: 15px; color: #0f766e; margin: 0; font-weight: bold;">Upcoming Feature: Medicine Reminder ⏰</p>
               <p style="font-size: 14px; color: #0f766e; margin-top: 6px; line-height: 1.5;">We will soon launch our automated medicine reminder system to notify and help you track your dosages flawlessly. Stay tuned!</p>
             </div>
             <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #0a192f; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">Access Dashboard</a>
             </div>
          </div>
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f3f4f6;">
             <p style="font-size: 12px; color: #9ca3af; margin: 0;">© 2026 MedIntel AI. Secure Ephemeral Cloud Instance.</p>
          </div>
        </div>
      `;

const createGmailContext = () => {
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').replace(/\s/g, '');
  if (!emailUser || !emailPass) return null;
  return {
    transporter: nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: emailUser, pass: emailPass },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    }),
    fromAddr: `"MedIntel" <${emailUser}>`,
  };
};

const sendWelcomeEmail = async (userEmail, userName) => {
  const html = welcomeEmailHtml(userName);
  const resendKey = (process.env.RESEND_API_KEY || '').trim();

  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const from = (process.env.RESEND_FROM || 'MedIntel <onboarding@resend.dev>').trim();
      const { error } = await resend.emails.send({
        from,
        to: userEmail,
        subject: WELCOME_SUBJECT,
        html,
      });
      if (!error) return;
      console.error('[Email] Resend:', error.message || JSON.stringify(error));
    } catch (e) {
      console.error('[Email] Resend:', e.message || e);
    }
  }

  try {
    const ctx = createGmailContext();
    if (!ctx) {
      if (!resendKey) {
        console.log(
          `[Email] Welcome skipped for ${userEmail}: add RESEND_API_KEY in backend/.env (see https://resend.com/api-keys) or Gmail EMAIL_USER + EMAIL_PASS`
        );
      } else {
        console.log(
          `[Email] Welcome not sent to ${userEmail}: Resend failed — check RESEND_API_KEY / RESEND_FROM, or set Gmail EMAIL_USER + EMAIL_PASS as fallback`
        );
      }
      return;
    }

    await ctx.transporter.sendMail({
      from: ctx.fromAddr,
      to: userEmail,
      subject: WELCOME_SUBJECT,
      html,
    });
  } catch (error) {
    console.error('Nodemailer Email Error:', error.message || error);
    const code = error.responseCode || error.code;
    if (code === 535 || String(error.message || '').includes('Invalid login')) {
      console.error('[Email] Gmail rejected login — use a Google App Password, or use Resend (RESEND_API_KEY).');
    }
  }
};


// --- OTP LOGIC ---
const otpEmailHtml = (userName, otpCode) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #0f766e; padding: 32px 24px; text-align: center;">
             <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 0.5px;">Verify Registration</h1>
             <p style="color: #ccfbf1; margin-top: 8px; font-size: 14px;">MedIntel Account Security</p>
          </div>
          <div style="padding: 40px 32px; background-color: #ffffff; text-align: center;">
             <p style="font-size: 16px; color: #374151;">Hi <strong>${userName}</strong>,</p>
             <p style="font-size: 16px; color: #374151; line-height: 1.6;">Use the verification code below to complete your sign-up process. This code will expire in 10 minutes.</p>
             <div style="margin: 32px auto; display: inline-block; padding: 16px 32px; background-color: #f3f4f6; letter-spacing: 6px; font-size: 32px; font-weight: bold; color: #000; border-radius: 8px;">
               ${otpCode}
             </div>
          </div>
        </div>
      `;

const generateAndSendOtp = async (req, res) => {
  console.log("🔥 API HIT: /api/auth/send-otp");
  console.log("Body Payload:", req.body);
  try {
    let { fullName, email } = req.body;
    if (!email || !fullName) {
      console.log("❌ Missing email or name");
      return res.status(400).json({ message: "Email and Full Name are required" });
    }

    email = email.toLowerCase().trim();

    console.log("🔍 Checking if user exists in DB...");
    // Prevent OTP sending if email is already registered
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("❌ Account already exists");
      return res.status(400).json({ message: "Account already exists with this email address" });
    }

    console.log("✅ User DB check passed, generating OTP logic...");
    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Clear any previous OTP entries for this email
    await Otp.deleteMany({ email });

    // Hash before save for security
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    await Otp.create({ email, otp: hashedOtp });

    // Try Emailing User
    const html = otpEmailHtml(fullName, otpCode);
    const resendKey = (process.env.RESEND_API_KEY || '').trim();

    let emailSent = false;

    if (resendKey) {
      console.log("📨 [RESEND] API Key found. Sending OTP via Resend HTTP API...");
      try {
        const resend = new Resend(resendKey);
        const { data, error } = await resend.emails.send({
          from: 'MedIntel <onboarding@resend.dev>',
          to: email,
          subject: 'Your MedIntel Verification Code',
          html,
        });
        if (error) {
          console.error('❌ [RESEND] API returned error:', JSON.stringify(error));
        } else {
          console.log('✅ [RESEND] Email sent successfully! ID:', data?.id);
          emailSent = true;
        }
      } catch (e) {
        console.error('❌ [RESEND] Exception caught:', e.message);
      }
    } else {
      console.log("⚠️ [RESEND] No RESEND_API_KEY found in environment.");
    }

    if (!emailSent) {
      console.log("📨 Attempting to send OTP via normal Gmail SMTP fallback...");
      // Fallback to Gmail (works on localhost, blocked on Render free tier)
      const ctx = createGmailContext();
      if (ctx) {
        console.log("⏳ Hitting Gmail servers...");
        try {
          await ctx.transporter.sendMail({
            from: ctx.fromAddr,
            to: email,
            subject: 'Your MedIntel Verification Code',
            html,
          });
          console.log("✅ Gmail Mail sent!");
          emailSent = true;
        } catch (gmailErr) {
          console.error("❌ Gmail SMTP also failed:", gmailErr.message);
        }
      } else {
        console.log("❌ Gmail config entirely missing. Nodemailer skipped.");
      }
    }

    if (!emailSent) {
      console.error("🔥 ALL email methods failed! No OTP was delivered.");
      return res.status(500).json({ message: "Email service unavailable. Please try Google Sign-up instead." });
    }

    console.log("✅ Response 200: OTP sent successfully");
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("🔥 CATCH BLOCK HIT: OTP Logic failed!", error);
    res.status(500).json({ message: `OTP Error: ${error.message}` });
  }
};


// @desc Verify OTP without creating user (for multistep forms)
const verifyOtpOnly = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const emailTrimmed = email.toLowerCase().trim();

    const validOtpRecord = await Otp.findOne({ email: emailTrimmed }).sort({ createdAt: -1 });
    if (!validOtpRecord) return res.status(400).json({ message: "OTP expired or not requested." });

    const isMatch = await bcrypt.compare(otp, validOtpRecord.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP code provided." });

    res.status(200).json({ message: "OTP Verified successfully" });
  } catch (error) {
    res.status(500).json({ message: `Verification Error: ${error.message}` });
  }
};

// @desc Generate OTP for Forgot Password flow
const forgotPasswordSendOtp = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    email = email.toLowerCase().trim();

    // Ensure user actually exists before sending OTP
    const userExists = await User.findOne({ email });
    if (!userExists) return res.status(404).json({ message: "No account found with this email address" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email });

    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    await Otp.create({ email, otp: hashedOtp });

    // Use existing OTP HTML helper
    const html = otpEmailHtml(userExists.fullName, otpCode);
    const resendKey = (process.env.RESEND_API_KEY || '').trim();

    let emailSent = false;

    if (resendKey) {
      console.log("📨 [RESEND] Sending forgot-password OTP via Resend...");
      try {
        const resend = new Resend(resendKey);
        const { data, error } = await resend.emails.send({
          from: 'MedIntel <onboarding@resend.dev>',
          to: email,
          subject: 'MedIntel Password Reset Code',
          html,
        });
        if (error) {
          console.error('❌ [RESEND] Forgot PW error:', JSON.stringify(error));
        } else {
          console.log('✅ [RESEND] Forgot PW email sent! ID:', data?.id);
          emailSent = true;
        }
      } catch (e) {
        console.error('❌ [RESEND] Forgot PW exception:', e.message);
      }
    }

    if (!emailSent) {
      const ctx = createGmailContext();
      if (ctx) {
        console.log("⏳ Forgot PW: Hitting Gmail servers...");
        try {
          await ctx.transporter.sendMail({
            from: ctx.fromAddr,
            to: email,
            subject: 'MedIntel Password Reset Code',
            html,
          });
          emailSent = true;
        } catch (gmailErr) {
          console.error("❌ Gmail SMTP forgot-pw failed:", gmailErr.message);
        }
      }
    }

    if (!emailSent) {
      return res.status(500).json({ message: "Email service unavailable. Please try again later." });
    }

    res.status(200).json({ message: "Password reset OTP sent successfully" });
  } catch (error) {
    console.error("🔥 Forgot PW OTP Error:", error);
    res.status(500).json({ message: `OTP Error: ${error.message}` });
  }
};

// @desc Verify OTP for Forgot Password and Authenticate User (Passwordless logic for "Continue")
const forgotPasswordVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const emailTrimmed = email.toLowerCase().trim();

    const validOtpRecord = await Otp.findOne({ email: emailTrimmed }).sort({ createdAt: -1 });
    if (!validOtpRecord) return res.status(400).json({ message: "OTP expired or not requested." });

    const isMatch = await bcrypt.compare(otp, validOtpRecord.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP code provided." });

    // OTP is valid. Find the user to log them in.
    const user = await User.findOne({ email: emailTrimmed });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove the used OTP
    await Otp.deleteMany({ email: emailTrimmed });

    // Return full login payload
    res.json({
      action: 'logged_in', _id: user.id, fullName: user.fullName, email: user.email, countryCode: user.countryCode, phone: user.phone,
      dob: user.dob, gender: user.gender, height: user.height, weight: user.weight, age: user.age,
      bloodPressure: user.bloodPressure, avatarUrl: user.avatarUrl, token: generateToken(user._id),
      createdAt: user.createdAt, passwordChangedAt: user.passwordChangedAt
    });
  } catch (error) {
    res.status(500).json({ message: `Verification Error: ${error.message}` });
  }
};

// @desc Reset user password
const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) return res.status(400).json({ message: "User ID and New Password are required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordChangedAt = new Date();

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: `Reset Password Error: ${error.message}` });
  }
};

// @desc    Register a new unique user
const registerUser = async (req, res) => {
  try {
    let { fullName, email, password, otp } = req.body;
    if (!fullName || !email || !password || !otp) return res.status(400).json({ message: "Please fill all required fields including OTP" });

    // Enforce lowercase uniform comparisons
    email = email.toLowerCase().trim();

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Account already exists with this email address" });

    // Verify OTP
    const validOtpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!validOtpRecord) return res.status(400).json({ message: "OTP expired or not requested. Please request a new OTP." });

    const isMatch = await bcrypt.compare(otp, validOtpRecord.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP code provided." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ fullName, email, password: hashedPassword });
    if (user) {
      await Otp.deleteMany({ email }); // Clear OTP
      // Trigger Welcome Email (Async background process without blocking rendering)
      sendWelcomeEmail(user.email, user.fullName);
      res.status(201).json({ action: 'registered', message: "Account created successfully" });
    } else {
      res.status(400).json({ message: "Invalid user data received" });
    }
  } catch (error) { res.status(500).json({ message: `Server Error: ${error.message}` }); }
};

// @desc    Authenticate existing user dynamically
const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      res.json({
        action: 'logged_in', _id: user.id, fullName: user.fullName, email: user.email, countryCode: user.countryCode, phone: user.phone,
        dob: user.dob, gender: user.gender, height: user.height, weight: user.weight, age: user.age,
        bloodPressure: user.bloodPressure, avatarUrl: user.avatarUrl, token: generateToken(user._id),
        createdAt: user.createdAt, passwordChangedAt: user.passwordChangedAt
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) { res.status(500).json({ message: `Server Error: ${error.message}` }); }
};

// @desc    Google OAuth Verify for SIGNUP
const googleSignup = async (req, res) => {
  try {
    const { googleToken } = req.body;
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${googleToken}` } });
    const googleProfile = await response.json();
    if (!googleProfile.email) return res.status(400).json({ message: "Google authentication failed" });

    const user = await User.findOne({ email: googleProfile.email.toLowerCase().trim() });

    if (user) return res.status(400).json({ message: "Account already exists with this Google email address" });

    const newUser = await User.create({
      fullName: googleProfile.name,
      email: googleProfile.email.toLowerCase().trim(),
      googleId: googleProfile.sub,
      avatarUrl: googleProfile.picture || "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='24' height='24' fill='%23DFE5E7'/%3E%3Cpath d='M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z' fill='%23FFFFFF'/%3E%3C/svg%3E"
    });

    // Trigger Welcome Email
    sendWelcomeEmail(newUser.email, newUser.fullName);

    return res.status(201).json({ action: 'registered', message: "Account created successfully via Google!" });
  } catch (error) { res.status(500).json({ message: `Google Server Error: ${error.message}` }); }
};

// @desc    Google OAuth Verify for LOGIN
const googleLoginEndpoint = async (req, res) => {
  try {
    const { googleToken } = req.body;
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${googleToken}` } });
    const googleProfile = await response.json();
    if (!googleProfile.email) return res.status(400).json({ message: "Google authentication failed" });

    const user = await User.findOne({ email: googleProfile.email.toLowerCase().trim() });

    if (!user) return res.status(401).json({ message: 'Account not found. Please sign up first.' });

    return res.json({
      action: 'logged_in', _id: user.id, fullName: user.fullName, email: user.email, countryCode: user.countryCode, phone: user.phone,
      dob: user.dob, gender: user.gender, height: user.height, weight: user.weight, age: user.age,
      bloodPressure: user.bloodPressure, avatarUrl: user.avatarUrl, token: generateToken(user._id),
      createdAt: user.createdAt, passwordChangedAt: user.passwordChangedAt
    });
  } catch (error) { res.status(500).json({ message: `Google Server Error: ${error.message}` }); }
};

// @desc    Save User Profile data
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = req.body.fullName || user.fullName;
    if (req.body.email) {
      const parsedEmail = req.body.email.toLowerCase().trim();
      if (parsedEmail !== user.email) {
        const existingEmail = await User.findOne({ email: parsedEmail });
        if (existingEmail) {
          return res.status(400).json({ message: "This email address is already registered." });
        }
        user.email = parsedEmail;
      }
    }
    user.phone = req.body.phone || user.phone;
    user.countryCode = req.body.countryCode || user.countryCode;
    user.dob = req.body.dob || user.dob;
    user.gender = req.body.gender || user.gender;
    user.height = req.body.height || user.height;
    user.weight = req.body.weight || user.weight;
    user.age = req.body.age || user.age;
    if (req.body.bloodPressure) { user.bloodPressure = req.body.bloodPressure; }

    // Check if user is requesting a password change
    if (req.body.newPassword && req.body.currentPassword) {
      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password does not match. Security verification failed." });
      }
      // Hash new password using bcrypt
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.newPassword, salt);
      user.passwordChangedAt = new Date();
    }

    // If we passed an uploaded avatar, sync it
    if (req.body.avatarUrl) {
      user.avatarUrl = req.body.avatarUrl;
    }

    const updatedUser = await user.save();

    // Return the formatted user string
    res.json({
      _id: updatedUser.id, fullName: updatedUser.fullName, email: updatedUser.email,
      countryCode: updatedUser.countryCode, phone: updatedUser.phone,
      dob: updatedUser.dob, gender: updatedUser.gender, height: updatedUser.height, weight: updatedUser.weight, age: updatedUser.age,
      bloodPressure: updatedUser.bloodPressure, avatarUrl: updatedUser.avatarUrl, token: req.body.token, // echo back their token securely
      createdAt: updatedUser.createdAt, passwordChangedAt: updatedUser.passwordChangedAt
    });
  } catch (error) {
    res.status(500).json({ message: `Update Error: ${error.message}` });
  }
};

// @desc    Delete Account & All Data
const deleteAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Delete user's avatar from cloudinary if exists
    if (user.avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      } catch (e) {
        console.error("Cloudinary avatar delete error ignored", e);
      }
    }

    // 2. Fetch and delete all user's reports from cloudinary
    const userReports = await Report.find({ userId });
    for (const report of userReports) {
      if (report.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(report.cloudinaryId);
        } catch (e) {
          console.error("Cloudinary report delete error ignored", e);
        }
      }
    }

    // 3. Delete all reports from DB
    await Report.deleteMany({ userId });

    // 4. Delete user record from DB
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: "Account and associated data completely removed." });
  } catch (error) {
    console.error("Account Deletion Error:", error);
    res.status(500).json({ message: `Deletion Error: ${error.message}` });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleSignup,
  googleLoginEndpoint,
  updateProfile,
  generateAndSendOtp,
  verifyOtpOnly,
  forgotPasswordSendOtp,
  forgotPasswordVerifyOtp,
  resetPassword,
  sendWelcomeEmail,
  deleteAccount,
};
