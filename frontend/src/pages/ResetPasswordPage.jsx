import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // We expect the user to be logged in at this point due to successful OTP
  // Let's get their ID from local storage profile
  const userProfileRaw = localStorage.getItem('medintel_user_profile');
  const userProfile = userProfileRaw ? JSON.parse(userProfileRaw) : null;

  useEffect(() => {
    if (!userProfile || !userProfile._id) {
      // If they somehow got here without being authenticated via OTP
      navigate('/login');
    }
  }, [userProfile, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMsg("New password and confirm password do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userProfile.token}` // Although our endpoint might not strictly require it if it's public, it's good practice
        },
        body: JSON.stringify({ userId: userProfile._id, newPassword: formData.newPassword })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Clear local storage completely to enforce new login
        localStorage.removeItem('medintel_auth_status');
        localStorage.removeItem('medintel_user_profile');
        window.dispatchEvent(new Event('profileUpdated'));
        
        // Redirect to login
        navigate('/login', { state: { successMsg: "Password reset successful! Please login with your new password." } });
      } else {
        setErrorMsg(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  // CSS Variables
  const pageContainer = "min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden";
  const bgBlurEffects = "absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none z-0";
  const mainCardWrapper = "w-full max-w-md bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white p-8 sm:p-10 z-10 relative";
  const submitBtnStyle = "w-full py-3.5 text-sm rounded-xl font-bold mt-2 shadow-lg shadow-blue-900/20";
  const inputStyle = "w-full bg-[#F1F5F9] border-none rounded-xl px-4 py-3.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 bg-white transition-all mb-4";
  const labelStyle = "block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1.5 ml-1";

  return (
    <div className={pageContainer}>
      <div className={bgBlurEffects}>
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-300 blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] rounded-full bg-teal-300 blur-[100px]"></div>
      </div>

      <div className={mainCardWrapper}>
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="font-bold text-2xl text-slate-900 tracking-tight inline-block cursor-pointer">
              MedIntel AI
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 mt-6 tracking-tight">Set New Password</h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">Please enter your new password below.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl text-center flex flex-col gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div>
            <label className={labelStyle}>New Password</label>
            <input required type="password" name="newPassword" placeholder="••••••••" value={formData.newPassword} onChange={handleChange} className={inputStyle} minLength="6" />
          </div>

          <div>
            <label className={labelStyle}>Confirm Password</label>
            <input required type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} className={inputStyle} minLength="6" />
          </div>

          <Button type="submit" variant="primary" className={submitBtnStyle} disabled={isLoading}>
            {isLoading ? "Updating..." : "Reset Password"}
          </Button>
        </form>

      </div>
    </div>
  );
};

export default ResetPasswordPage;
