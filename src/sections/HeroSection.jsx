import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import Button from '../components/Button';

// === ICONS ===
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className="w-3.5 h-3.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

const BoltIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-teal-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);


const HeroSection = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('medintel_auth_status') === 'logged_in');
  }, []);

  return (
    <section
      className={`
        max-w-7xl mx-auto px-6 
        pt-16 pb-24 lg:pt-24 lg:pb-32 
        flex flex-col lg:flex-row 
        items-center gap-12 lg:gap-8
      `}
    >
      {/* === Left Content === */}
      <div className="flex-1 space-y-8 text-center lg:text-left z-10">
        <Badge icon={CheckIcon}>
          HIPAA COMPLIANT SECURITY
        </Badge>

        <h1
          className={`
            text-4xl md:text-5xl lg:text-6xl font-bold 
            text-slate-900 leading-[1.15] tracking-tight
          `}
        >
          AI-Powered<br />
          Health Insights,<br />
          <span className="text-teal-700">Tailored for You</span>
        </h1>

        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed">
          Upload your medical reports and get instant, clear analysis
          from our advanced AI. Secure, private, and simple to use clinical
          intelligence at your fingertips.
        </p>

        <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
          <Button 
            variant="primary" 
            className="px-8 py-3 text-base"
            onClick={() => {
              if (isLoggedIn) {
                 navigate('/dashboard');
              } else {
                 const element = document.getElementById('cta-section');
                 if (element) {
                   element.scrollIntoView({ behavior: 'smooth' });
                 }
              }
            }}
          >
            Get Started
          </Button>
          
          {!isLoggedIn && (
            <a href="/login">
              <Button variant="secondary" className="px-8 py-3 text-base">
                Log In
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* === Right Image/Dashboard Mockup === */}
      <div className="flex-1 w-full relative">

        {/* Background decorative blob */}
        <div
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            w-[120%] h-[120%] bg-linear-to-tr from-teal-50 to-blue-50 
            rounded-full blur-3xl -z-10
          `}
        ></div>

        {/* Main Dashboard Mockup Card */}
        <div
          className={`
            relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl 
            border border-slate-700 aspect-square lg:aspect-4/3 
            w-full max-w-lg mx-auto 
            transform hover:-translate-y-2 transition-transform duration-500
          `}
        >
          {/* Mockup Top bar */}
          <div
            className={`
              absolute top-0 w-full h-8 bg-slate-800/50 flex items-center 
              px-4 gap-2 backdrop-blur-sm border-b border-slate-700
            `}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
          </div>

          {/* Mockup Grid Data */}
          <div className="absolute inset-0 pt-8 p-6 grid grid-cols-2 gap-4">
            <div className="border border-blue-500/30 bg-blue-500/10 rounded-xl p-4 flex flex-col">
              <div className="h-4 w-1/2 bg-blue-400/20 rounded mb-4"></div>
              <div className="flex-1 border-b border-l border-blue-500/30 relative">
                {/* Fake chart line */}
                <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,80 Q20,20 40,60 T80,40 T100,20" fill="none" stroke="#38bdf8" strokeWidth="2" />
                </svg>
              </div>
            </div>

            <div className="border border-blue-500/30 bg-blue-500/10 rounded-xl p-4 flex flex-col gap-2">
              <div className="h-4 w-3/4 bg-blue-400/20 rounded"></div>
              <div className="h-3 w-full bg-blue-400/10 rounded"></div>
              <div className="h-3 w-5/6 bg-blue-400/10 rounded"></div>
              <div className="h-3 w-full bg-blue-400/10 rounded"></div>
            </div>

            <div className="col-span-2 border border-blue-500/30 bg-blue-500/10 rounded-xl p-4 flex flex-col gap-3">
              <div className="h-4 w-1/3 bg-blue-400/20 rounded"></div>
              <div className="flex gap-2 h-full items-end">
                <div className="w-1/6 bg-blue-500/40 h-1/2 rounded-t"></div>
                <div className="w-1/6 bg-blue-500/60 h-3/4 rounded-t"></div>
                <div className="w-1/6 bg-blue-500/40 h-2/3 rounded-t"></div>
                <div className="w-1/6 bg-teal-400/60 h-full rounded-t"></div>
                <div className="w-1/6 bg-blue-500/40 h-1/2 rounded-t"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating AI Status Modal */}
        <div
          className={`
            absolute -bottom-6 -left-6 lg:bottom-12 lg:-left-12 
            bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl 
            border border-white/50 flex items-center gap-4 
            animate-bounce pointer-events-none
          `}
        >
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
            <BoltIcon />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              AI Status
            </p>
            <p className="text-sm font-bold text-slate-800">
              Analyzing Data...
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
