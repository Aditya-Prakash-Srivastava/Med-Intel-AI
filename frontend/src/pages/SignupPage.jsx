import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import Button from '../components/Button';
import { GoogleIcon } from '../components/Icons'; // Icon yahan import ho gaya

const SignupPage = () => {
  // === 1. Routing Setup ===
  const navigate = useNavigate();

  // === 2. Form Data State (Memory) ===
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [step, setStep] = useState(1); // 1 = Info, 2 = OTP, 3 = Password
  const [otpValue, setOtpValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // === 3. Actions / Logic ===
  const handleChange = (e) => {
    // Jab user type karega, form data auto update hoga
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/google/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ googleToken: tokenResponse.access_token })
        });
        const data = await res.json();
        
        if (res.ok) {
          // Exactly mirrors manual flow -> Navigates to /login with successful flag!
          navigate('/login', { state: { successMsg: data.message } });
        } else {
          setErrorMsg(data.message || 'Google Auth failed');
        }
      } catch(err) {
        setErrorMsg('Server connection error.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setErrorMsg('Google Popup was closed or failed.')
  });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: formData.fullName, email: formData.email })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
      } else {
        setErrorMsg(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setErrorMsg('Server connection error. Is backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: otpValue })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(3);
      } else {
        setErrorMsg(data.message || 'Invalid OTP code.');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const payload = { ...formData, otp: otpValue };
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        navigate('/login', { state: { successMsg: 'Account created successfully! Please log in.' } });
      } else {
        setErrorMsg(data.message || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('Server connection error. Is backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  // === 4. Clean CSS Variables (Tailwind) ===
  // Styling ko variables mein daalne se neeche wala HTML padhne mein saaf dikhta hai
  const pageContainer = "min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden";
  const bgBlurEffects = "absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none z-0";
  const mainCardWrapper = "w-full max-w-md bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white p-8 sm:p-10 z-10 relative";

  const googleBtnStyle = "w-full flex items-center justify-center bg-white border border-gray-200 text-slate-700 font-bold text-sm py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm mb-6";
  const submitBtnStyle = "w-full py-3.5 text-sm rounded-xl font-bold mt-2 shadow-lg shadow-blue-900/20";

  // Input UI styles
  const inputStyle = "w-full bg-[#F1F5F9] border-none rounded-xl px-4 py-3.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/40 bg-white transition-all mb-4";
  const labelStyle = "block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1.5 ml-1";


  // === 5. Render UI ===
  return (
    <div className={pageContainer}>

      {/* Decorative Blur Backgrounds */}
      <div className={bgBlurEffects}>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-300 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-300 blur-[100px]"></div>
      </div>

      {/* Center White Card */}
      <div className={mainCardWrapper}>

        {/* Title Header */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="font-bold text-2xl text-slate-900 tracking-tight inline-block cursor-pointer">
              MedIntel AI
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 mt-6 tracking-tight">Create your account</h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">Join thousands resolving clinical data instantly.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Google Signup Button */}
        <button type="button" onClick={() => googleLogin()} className={googleBtnStyle}>
          <GoogleIcon />
          Sign up with Google
        </button>

        {/* Or Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">OR</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {/* Steps Flow Engine */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="flex flex-col">
            <div>
              <label className={labelStyle}>Full Name</label>
              <input required type="text" name="fullName" placeholder="Aditya Prakash Srivastava" value={formData.fullName} onChange={handleChange} className={inputStyle} />
            </div>

            <div>
              <label className={labelStyle}>Email Address</label>
              <input required type="email" name="email" placeholder="aditya@example.com" value={formData.email} onChange={handleChange} className={inputStyle} />
            </div>

            <Button type="submit" variant="primary" className={submitBtnStyle} disabled={isLoading}>
              {isLoading ? "Sending OTP..." : "Continue"}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col">
            <div className="mb-5 text-center px-4">
              <p className="text-sm font-medium text-slate-600 mb-1">We've sent a 6-digit code to</p>
              <p className="text-teal-700 font-bold">{formData.email}</p>
            </div>
            
            <div>
              <label className={labelStyle}>Verification Code (OTP)</label>
              <input required type="text" placeholder="------" value={otpValue} onChange={(e) => setOtpValue(e.target.value)} className={`${inputStyle} text-center tracking-[0.5em] text-xl font-bold`} maxLength={6} />
            </div>

            <Button type="submit" variant="primary" className={submitBtnStyle} disabled={isLoading || otpValue.length !== 6}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
            
            <button type="button" onClick={() => setStep(1)} className="mt-5 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors w-max mx-auto">
              ← Change Email or Name
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSignup} className="flex flex-col">
            <div className="mb-5 text-center px-4">
              <p className="text-sm font-medium text-teal-700 mb-1">✓ Email Verified Successfully!</p>
              <p className="text-slate-500 text-sm">Please create a strong password for your account.</p>
            </div>

            <div>
              <label className={labelStyle}>Create Password</label>
              <input required type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className={inputStyle} />
            </div>

            <Button type="submit" variant="primary" className={submitBtnStyle} disabled={isLoading}>
              {isLoading ? "Registering..." : "Create Free Account"}
            </Button>
          </form>
        )}

        {/* Redirect to Login */}
        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-bold hover:text-teal-700 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
