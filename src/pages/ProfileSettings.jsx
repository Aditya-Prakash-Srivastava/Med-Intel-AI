import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/Button';
import { UserIcon, ShieldIcon, TrashIcon } from '../components/Icons'; // SVG icons bahar kardiye taaki yaha gandagi na ho
import { customAlert, customPrompt, customConfirm } from '../utils/CustomAlert';

/* =======================================
   1. MAIN COMPONENT: PROFILE SETTINGS
   ======================================= */
const ProfileSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null); 
  const [isUploading, setIsUploading] = useState(false); 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // 8 Second completion prompt banner
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if we arrived here right after logging in!
    if (location.state?.showProfileCompletePrompt) {
      setShowPrompt(true);
      
      // Auto-hide the banner after 8 seconds (8000ms) User Request!
      const timer = setTimeout(() => {
        setShowPrompt(false);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);

  // === Default Values & Local Storage (Browser ki memory se data laana) ===
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('medintel_user_profile');
    const parsedData = savedProfile ? JSON.parse(savedProfile) : {};
    
    return {
      _id: parsedData._id || "",
      token: parsedData.token || "",
      fullName: parsedData.fullName || "",
      dob: parsedData.dob || "",
      email: parsedData.email || "",
      countryCode: parsedData.countryCode || "+91",
      phone: parsedData.phone || "",
      gender: parsedData.gender || "Not Specified",
      height: parsedData.height || "",
      weight: parsedData.weight || "",
      age: parsedData.age || "",
      avatarUrl: parsedData.avatarUrl || "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='24' height='24' fill='%23DFE5E7'/%3E%3Cpath d='M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z' fill='%23FFFFFF'/%3E%3C/svg%3E",
      avatarPublicId: parsedData.avatarPublicId || "", // Cloudinary ki ID
      createdAt: parsedData.createdAt || null,
      passwordChangedAt: parsedData.passwordChangedAt || parsedData.createdAt || null
    };
  });

  const [security, setSecurity] = useState({
    currentPassword: "•••••••••••",
    newPassword: "",
    confirmNewPassword: ""
  });

  // === Event Handlers (Text Change karna) ===
  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleSecurityChange = (e) => setSecurity({ ...security, [e.target.name]: e.target.value });

  // === 1. Auto-Calculate Age based on DOB ===
  const handleDobChange = (e) => {
    const selectedDate = e.target.value;
    setProfile(prev => {
      let calculatedAge = prev.age; // fallback default
      if (selectedDate) {
        const birthDate = new Date(selectedDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        calculatedAge = age.toString();
      }
      return { ...prev, dob: selectedDate, age: calculatedAge };
    });
  };

  // === 2. Calculate Profile Completeness (Dynamic Percentage) ===
  const calculateCompleteness = () => {
    // Only check the strictly necessary fields required for AI analysis: name, phone, biometrics
    const fieldsToCheck = [
      profile.fullName, 
      profile.phone, 
      profile.height, 
      profile.weight
    ];
    // For simplicity, every valid filled string counts as completed.
    const filledFields = fieldsToCheck.filter(field => field && field.toString().trim() !== '' && field !== 'Not Specified');
    
    // We check 4 critical fields.
    const percentage = Math.round((filledFields.length / fieldsToCheck.length) * 100);
    return percentage;
  };
  const completenessPercent = calculateCompleteness();

  /* === DATE FORMATTING UTILS === */
  const memberSinceText = React.useMemo(() => {
    if (!profile.createdAt) return "Member since Jan 2024";
    const date = new Date(profile.createdAt);
    return `Member since ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  }, [profile.createdAt]);

  const lastPasswordChangeText = React.useMemo(() => {
    if (!profile.passwordChangedAt) return "Last password change: Recently";
    const then = new Date(profile.passwordChangedAt);
    const now = new Date();
    const diffTime = Math.abs(now - then);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Last password change: Today";
    if (diffDays < 30) return `Last password change: ${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `Last password change: ${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  }, [profile.passwordChangedAt]);

  /* =======================================
     2. API LOGIC: CLOUDINARY UPLOAD & DELETE
     ======================================= */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return; // Agar file select ni ki toh aage mat jao

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Agar pic alrady thi, toh uski ID bhi bhejo (Backend waha delete kardega!)
    if (profile.avatarPublicId) {
      formData.append('oldImageId', profile.avatarPublicId);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        // Naya Cloudinary link aur naya ID React ki state me set karo
        const updatedProfile = {
          ...profile,
          avatarUrl: data.fileUrl,
          avatarPublicId: data.publicId
        };
        
        setProfile(updatedProfile);
        
        // Auto-save photo permanently natively to MongoDB Atlas instantly so it doesn't vanish on future logs!
        if (profile._id) {
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/profile/${profile._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatarUrl: data.fileUrl, avatarPublicId: data.publicId, token: profile.token })
          })
          .then(res => res.json())
          .then(dbData => {
            localStorage.setItem('medintel_user_profile', JSON.stringify(dbData));
            window.dispatchEvent(new Event('profileUpdated')); // Sync completely across UI
          });
        } else {
            localStorage.setItem('medintel_user_profile', JSON.stringify(updatedProfile));
            window.dispatchEvent(new Event('profileUpdated'));
        }
        
        customAlert('Profile photo updated successfully!');
      } else {
        customAlert("We encountered an issue uploading your photo.", "error");
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      customAlert("Please check your connection and try again.", "error");
    } finally {
      setIsUploading(false); // Loading roko
      if (fileInputRef.current) fileInputRef.current.value = ""; // Input blank kardo
    }
  };


  /* =======================================
     3. DATABASE SAVE LOGIC (Aage banega)
     ======================================= */
  const handleFormSubmit = async (e) => {
    e.preventDefault(); 
    
    try {
      if (!profile._id) {
        customAlert("Your session has expired. Please log in again.", "error");
        return;
      }

      // Create payload that includes security data if they attempted to change password
      const submitPayload = { ...profile };
      if (security.newPassword) {
        if (security.newPassword !== security.confirmNewPassword) {
           customAlert("The new passwords you entered do not match.", "error");
           return;
        }
        submitPayload.currentPassword = security.currentPassword;
        submitPayload.newPassword = security.newPassword;
      }

      // Backend me PUT request bhej kar asli MongoDB database me form update karna
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/profile/${profile._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitPayload)
      });

      const updatedData = await response.json();

      if (response.ok) {
        // Naya synchronized data local storage me save karo taaki cache intact rahe
        localStorage.setItem('medintel_user_profile', JSON.stringify(updatedData));
        setProfile((prev) => ({ ...prev, ...updatedData }));
        
        // **FIRE EVENT TO UNLOCK SIDEBAR GLOBALLY IMMEDIATELY**
        window.dispatchEvent(new Event('profileUpdated'));
        
        if (submitPayload.newPassword) {
          // Reset security fields safely on success
          setSecurity({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
        }
        customAlert("Profile saved successfully!");
      } else {
        customAlert("Unable to save profile changes.", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      customAlert("We could not save your profile. Please try again.", "error");
    }
  };

  const handleChangePasswordAction = async (e) => {
    e.preventDefault(); 
    if (!security.currentPassword || !security.newPassword || !security.confirmNewPassword) {
      customAlert("Please fill all password fields.", "error");
      return;
    }
    if (security.newPassword !== security.confirmNewPassword) {
      customAlert("The new passwords do not match.", "error");
      return;
    }

    setIsChangingPassword(true);
    try {
      const submitPayload = { ...profile, currentPassword: security.currentPassword, newPassword: security.newPassword };
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/profile/${profile._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitPayload)
      });
      const updatedData = await response.json();
      if (response.ok) {
        localStorage.setItem('medintel_user_profile', JSON.stringify(updatedData));
        setProfile((prev) => ({ ...prev, ...updatedData }));
        window.dispatchEvent(new Event('profileUpdated'));
        setSecurity({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
        
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
      } else {
        customAlert("Unable to update password.", "error");
      }
    } catch (err) {
      console.error(err);
      customAlert("Unable to update password.", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/account/${profile._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.removeItem('medintel_user_profile');
        localStorage.removeItem('medintel_auth_status');
        sessionStorage.clear();
        customAlert("Your account has been deleted successfully.");
        navigate('/signup');
      } else {
        customAlert("Unable to delete account.", "error");
      }
    } catch (err) {
      console.error(err);
      customAlert("Unable to delete account.", "error");
    }
  };

  /* =======================================
     4. NORMAL TAILWIND STYLING STRINGS
     ======================================= */
  // Lambi classes ko hta kar ek variable mein daal diya taaki codes gande na lage
  const inputStyle = `w-full bg-[#F1F5F9] border-none rounded-lg px-4 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white transition-all`;
  const labelStyle = `block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5 ml-1`;

  // Photo load hone par thoda blur dikhane ke liye dynamic style
  const avatarStyle = `w-28 h-28 rounded-full overflow-hidden border-4 border-[#1A365D] p-1 mb-4 ${isUploading ? 'opacity-50 blur-sm' : 'opacity-100 transition-opacity'}`;


  /* =======================================
     5. RENDER THE UI
     ======================================= */
  return (
    <DashboardLayout headerTitle="Aura Health AI" headerSubtitle="Account Settings">
      
      {/* === 8-SECOND STRICT PROMPT BANNER === */}
      {showPrompt && (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-900 p-4 mb-6 rounded-lg shadow-sm animate-pulse flex items-start gap-3">
          <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
          </svg>
          <div>
            <h4 className="font-bold text-sm">Action Required: Complete Your Profile</h4>
            <p className="text-xs font-medium mt-1">
              For accurate and personalized AI medical results, please <strong>strictly fill out your Username, Phone Number, and Biometrics (Height/Weight)</strong> below and click Save Profile.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="h-full flex flex-col">
        
        {/* --- Top Title Bar --- */}
        <div className="flex justify-between items-start mb-6 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Profile Settings</h2>
            <p className="text-gray-500 text-sm max-w-md">Manage your clinical identity, personal biometric data, and security credentials.</p>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="px-5 py-2 text-sm rounded-xl font-bold text-gray-600 bg-gray-200/50 hover:bg-gray-200 shadow-none border border-transparent">
              Discard Changes
            </Button>
            <Button type="submit" variant="primary" className="px-5 py-2 text-sm rounded-xl font-bold bg-[#1A365D] hover:bg-[#002045]">
              Save Profile
            </Button>
          </div>
        </div>

        {/* --- Main 2 Columns Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 flex-1 min-h-0">
          
          {/* =======================
              COLUMN 1: AVATAR CARD
              ======================= */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-[24px] p-6 flex flex-col items-center text-center shadow-sm border border-gray-100 flex-1">
              
              <div className={avatarStyle}>
                <img src={profile.avatarUrl} alt="User avatar" className="w-full h-full object-cover rounded-full" />
              </div>

              {/* Fake hidden input, jispe react click karega code se */}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()} // Button input file trigger kar rha h!
                disabled={isUploading}
                className="text-xs font-bold text-teal-600 hover:text-teal-800 mb-4 bg-teal-50 px-4 py-1.5 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-wait transition-all"
              >
                {isUploading ? "Uploading..." : "Upload Photo"}
              </button>

              <h3 className="text-lg font-bold text-slate-900">{profile.fullName}</h3>
              <p className="text-teal-700 font-semibold text-xs mb-8">{memberSinceText}</p>

              {/* Sync Status Bottom Box */}
              <div className="w-full text-left border-t border-gray-100/60 pt-6 mt-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">Health Sync Status</span>
                  <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 text-[9px] uppercase font-bold tracking-wider rounded-full">Active</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div className="bg-[#13696a] h-full transition-all duration-500" style={{ width: `${completenessPercent}%` }}></div>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed font-semibold">{completenessPercent}% Profile completeness.</p>
              </div>

            </div>
          </div>


          {/* =======================
              COLUMN 2: FORM CARD
              ======================= */}
          <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
            
            {/* Box 1: Personal Data */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center"><UserIcon /></div>
                <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div><label className={labelStyle}>Full Name</label><input name="fullName" value={profile.fullName} onChange={handleProfileChange} className={inputStyle} /></div>
                <div><label className={labelStyle}>Date of Birth</label><input type="date" name="dob" value={profile.dob} onChange={handleDobChange} className={inputStyle} /></div>
                <div><label className={labelStyle}>Email Address</label><input name="email" value={profile.email} onChange={handleProfileChange} className={inputStyle} /></div>
                <div>
                  <label className={labelStyle}>Phone Number</label>
                  <div className="flex gap-2">
                    <select name="countryCode" value={profile.countryCode} onChange={handleProfileChange} className={`${inputStyle} w-[100px] cursor-pointer px-2 text-center`}>
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
                      <option value="+971">+971 (AE)</option>
                    </select>
                    <input 
                      name="phone" 
                      value={profile.phone} 
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, ''); // Digits only check
                        if (val.length <= 10) {
                          handleProfileChange({ target: { name: 'phone', value: val } });
                        }
                      }} 
                      placeholder="10-digit number" 
                      className={inputStyle} 
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Gender Identity</label>
                  <select name="gender" value={profile.gender} onChange={handleProfileChange} className={`${inputStyle} cursor-pointer`}>
                    <option value="Not Specified" disabled hidden>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div><label className={labelStyle}>Height (CM)</label><input name="height" value={profile.height} onChange={handleProfileChange} className={inputStyle} /></div>
                  <div><label className={labelStyle}>Weight (KG)</label><input name="weight" value={profile.weight} onChange={handleProfileChange} className={inputStyle} /></div>
                  <div><label className={labelStyle}>Age</label><input type="number" name="age" value={profile.age} onChange={handleProfileChange} placeholder="Yrs" className={inputStyle} /></div>
                </div>
              </div>
            </div>

            {/* Box 2: Security & Password */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center"><ShieldIcon /></div>
                <h3 className="text-lg font-bold text-slate-900">Security & Authentication</h3>
              </div>

              <div className="space-y-5">
                <div className="w-1/2 pr-3"><label className={labelStyle}>Current Password</label><input type="password" name="currentPassword" value={security.currentPassword} onChange={handleSecurityChange} placeholder="Enter your current password" className={inputStyle} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className={labelStyle}>New Password</label><input placeholder="Enter new password" type="password" name="newPassword" value={security.newPassword} onChange={handleSecurityChange} className={inputStyle} /></div>
                  <div>
                    <label className={labelStyle}>Confirm New Password</label>
                    <div className="flex gap-3">
                      <input placeholder="Re-type new password" type="password" name="confirmNewPassword" value={security.confirmNewPassword} onChange={handleSecurityChange} className={`${inputStyle} flex-1`} />
                      <button 
                        type="button" 
                        onClick={handleChangePasswordAction} 
                        disabled={isChangingPassword}
                        className="h-fit px-4 py-3 shrink-0 rounded-lg bg-[#1A365D] hover:bg-[#002045] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
                      >
                        {isChangingPassword ? "Saving..." : "Change"}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <Button type="button" variant="secondary" className="px-5 py-2 text-xs rounded-xl font-bold text-gray-700 bg-gray-100">Enable Two-Factor</Button>
                  <span className="text-[10px] text-gray-400 italic">{lastPasswordChangeText}</span>
                </div>
              </div>
            </div>

            {/* Bottom Delete Account Link */}
            <div className="text-right pt-2 pb-4">
              <button type="button" onClick={() => setShowDeleteConfirm(true)} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-600 hover:text-red-700 uppercase tracking-widest cursor-pointer transition-colors bg-white px-3 py-1.5 rounded-md hover:bg-red-50">
                <TrashIcon /> Request Account Deletion
              </button>
            </div>

          </div>
        </div>
      </form>

      {/* DELETION CONFIRMATION POPUP (WhatsApp Style) */}
      {showDeleteConfirm && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
           <div className="bg-white rounded-3xl w-full max-w-[480px] p-6 pt-7 shadow-2xl text-left">
              <h3 className="text-[20px] text-slate-800 mb-4 leading-5">Delete Account?</h3>
              <p className="text-[15px] text-slate-500 mb-10 leading-relaxed pr-2">
                This action is permanent. Your medical profile, all uploaded reports, AI analysis data, and personal details will be completely erased from our securely encrypted servers.
              </p>
              
              <div className="flex items-center justify-between">
                 <button 
                   onClick={() => setShowDeleteConfirm(false)} 
                   className="border border-gray-300 text-teal-600 px-6 py-2 rounded-full font-medium text-[15px] hover:bg-gray-50 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleDeleteAccount} 
                   className="bg-[#e41d3b] text-white px-7 py-2.5 rounded-full font-medium text-[15px] hover:bg-[#c91833] transition-colors"
                 >
                   Delete account
                 </button>
              </div>
           </div>
         </div>
      )}

      {/* SUCCESS TOAST FOR PASSWORD CHANGE */}
      {toastVisible && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-green-50 px-6 py-3 rounded-xl border border-green-200 shadow-xl flex items-center gap-3 animate-[fade-in-up_0.3s_ease-out]">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>
          </div>
          <span className="text-sm font-bold text-green-800">Password changed successfully!</span>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProfileSettings;
