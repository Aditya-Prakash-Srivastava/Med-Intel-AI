import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Options (Continue or Reset Password)
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // CSS Variables
  const pageContainer = "min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden";
  const bgBlurEffects = "absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none z-0";
  const mainCardWrapper = "w-full max-w-md bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white p-8 sm:p-10 z-10 relative";
  const submitBtnStyle = "w-full py-3.5 text-sm rounded-xl font-bold mt-2 shadow-lg shadow-blue-900/20";
  const inputStyle = "w-full bg-[#F1F5F9] border-none rounded-xl px-4 py-3.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 bg-white transition-all mb-4";
  const labelStyle = "block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1.5 ml-1";

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
      } else {
        setErrorMsg(data.message || 'Error sending OTP');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (res.ok) {
        // Log user in automatically so they can continue or reset password
        localStorage.setItem('medintel_auth_status', 'logged_in');
        localStorage.setItem('medintel_user_profile', JSON.stringify(data));
        window.dispatchEvent(new Event('profileUpdated'));
        setStep(3);
      } else {
        setErrorMsg(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    // User is already logged in now due to previous step
    navigate('/dashboard');
  };

  const handleCreateNewPassword = () => {
    // Go to reset password page
    navigate('/reset-password');
  };

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
          <h2 className="text-2xl font-bold text-slate-900 mt-6 tracking-tight">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Enter OTP"}
            {step === 3 && "Success!"}
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {step === 1 && "Enter your email to receive an OTP."}
            {step === 2 && "Enter the 6-digit OTP sent to your email."}
            {step === 3 && "You can continue to the dashboard or create a new password."}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="flex flex-col">
            <div>
              <label className={labelStyle}>Email Address</label>
              <input required type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} />
            </div>
            <Button type="submit" variant="primary" className={submitBtnStyle} disabled={isLoading}>
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </Button>
            <p className="text-center text-sm text-gray-500 mt-6 font-medium">
              Remember your password?{' '}
              <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">
                Log in
              </Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col">
            <div>
              <label className={labelStyle}>6-Digit OTP</label>
              <input required type="text" placeholder="XXXXXX" value={otp} onChange={(e) => setOtp(e.target.value)} className={inputStyle} maxLength="6" />
            </div>
            <Button type="submit" variant="primary" className={submitBtnStyle} disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
            <p className="text-center text-sm text-gray-500 mt-6 font-medium">
              <button type="button" onClick={() => setStep(1)} className="text-blue-600 font-bold hover:underline">
                Change Email
              </button>
            </p>
          </form>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <Button type="button" onClick={handleCreateNewPassword} variant="primary" className={submitBtnStyle}>
              Create a new password
            </Button>
            <Button type="button" onClick={handleContinue} variant="secondary" className="w-full py-3.5 text-sm rounded-xl font-bold bg-white text-slate-700 border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
              Continue to Dashboard
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
