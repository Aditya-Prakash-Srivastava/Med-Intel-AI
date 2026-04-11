import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../sections/HeroSection';
import FeaturesSection from '../sections/FeaturesSection';
import CTASection from '../sections/CTASection';

const Footer = () => (
  <footer className="border-t border-gray-100 bg-[#FAFAFA] py-8">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
      <p>&copy; 2026 MEDINTEL MEDICAL AI. SECURE CLINICAL ENVIRONMENT.</p>
      <div className="flex gap-6">
        <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-gray-600 transition-colors">HIPAA Compliance</a>
        <a href="#" className="hover:text-gray-600 transition-colors">Contact Security</a>
      </div>
    </div>
  </footer>
);

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('medintel_auth_status') === 'logged_in');
  }, []);

  return (
    <div className="font-sans antialiased text-slate-800 selection:bg-teal-100">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      {!isLoggedIn && <CTASection />}
      <Footer />
    </div>
  );
};

export default LandingPage;
