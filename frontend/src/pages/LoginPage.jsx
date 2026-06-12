import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import Button from '../components/Button';
import { GoogleIcon } from '../components/Icons'; // Icon yahan import ho gaya

const LoginPage = () => {
  // === 1. Routing Setup ===
  const navigate = useNavigate();
  const location = useLocation();

  // === 2. State & Memory ===
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Extract success message milti hai agar sidha Signup page se bheja gaya ho
  const successMsg = location.state?.successMsg || '';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/google/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ googleToken: tokenResponse.access_token })
        });
        const data = await res.json();

        if (res.ok) {
          // Completely mimics manual logins mapping directly to user configuration check
          localStorage.setItem('medintel_auth_status', 'logged_in');
          localStorage.setItem('medintel_user_profile', JSON.stringify(data));
          window.dispatchEvent(new Event('profileUpdated'));
          
          if (!data.phone) {
            navigate('/profile', { state: { showProfileCompletePrompt: true } });
          } else {
            navigate('/dashboard');
          }
        } else {
          setErrorMsg(data.message || 'Google Auth Failed');
        }
      } catch (err) {
        setErrorMsg('Server connection error. Is backend running?');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setErrorMsg('Google Popup was closed or failed.')
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        // Backend successfully returned the user document
        localStorage.setItem('medintel_auth_status', 'logged_in');
        localStorage.setItem('medintel_user_profile', JSON.stringify(data));
        window.dispatchEvent(new Event('profileUpdated'));
        
        // Smart Routine Logic Check
        if (!data.phone) {
          navigate('/profile', { state: { showProfileCompletePrompt: true } });
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMsg(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setErrorMsg('Server connection error. Is backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  // === 4. Clean CSS Variables (Tailwind) ===
  const pageContainer = "min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden";
  const bgBlurEffects = "absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none z-0";
  const mainCardWrapper = "w-full max-w-md bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white p-8 sm:p-10 z-10 relative";

  const googleBtnStyle = "w-full flex items-center justify-center bg-white border border-gray-200 text-slate-700 font-bold text-sm py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm mb-6";
  const submitBtnStyle = "w-full py-3.5 text-sm rounded-xl font-bold mt-2 shadow-lg shadow-blue-900/20";

  const inputStyle = "w-full bg-[#F1F5F9] border-none rounded-xl px-4 py-3.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 bg-white transition-all mb-4";
  const labelStyle = "block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1.5 ml-1";


  // === 5. Render UI ===
  return (
    <div className={pageContainer}>

      {/* Decorative Blur Backgrounds */}
      <div className={bgBlurEffects}>
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-300 blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] rounded-full bg-teal-300 blur-[100px]"></div>
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
          <h2 className="text-2xl font-bold text-slate-900 mt-6 tracking-tight">Welcome back</h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">Please enter your details to sign in.</p>
        </div>

        {/* Dynamic Alert Messages (Jaise naya account banne pe notification aana) */}
        {successMsg && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded-xl text-center">
            {successMsg}
          </div>
        )}

        {/* Jab Login fail hota ho */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl text-center flex flex-col gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Login Button */}
        <button type="button" onClick={() => googleLogin()} className={googleBtnStyle}>
          <GoogleIcon />
          Log in with Google
        </button>

        {/* Or Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">OR</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {/* Standard Email Auth Form */}
        <form onSubmit={handleLogin} className="flex flex-col">

          <div>
            <label className={labelStyle}>Email Address</label>
            <input required type="email" name="email" placeholder="aditya@example.com" value={formData.email} onChange={handleChange} className={inputStyle} />
          </div>

          <div>
            <div className="flex justify-between">
              <label className={labelStyle}>Password</label>
              <Link to="/forgot-password" className="text-[11px] font-bold text-blue-600 hover:underline">Forgot password?</Link>
            </div>
            <input required type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className={inputStyle} />
          </div>

          <Button type="submit" variant="primary" className={submitBtnStyle} disabled={isLoading}>
            {isLoading ? "Logging In..." : "Log In"}
          </Button>

        </form>

        {/* Redirect to Signup */}
        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
