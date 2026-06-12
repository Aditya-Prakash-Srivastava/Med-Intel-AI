import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import Button from '../components/Button';

const CTASection = () => {
  return (
    // Added ID id="cta-section" so we can scroll here from the Hero button
    <section id="cta-section" className="bg-[#FAFAFA] pb-24 px-6">
      <div 
        className={`
          max-w-5xl mx-auto bg-[#1a2b4c] rounded-[2.5rem] 
          py-16 px-8 md:py-24 md:px-16 text-center shadow-lg 
          relative overflow-hidden
        `}
      >
        {/* === Decorative background blurs === */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-blue-500 blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-teal-500 blur-3xl"></div>
        </div>

        {/* === Content === */}
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Take Control of Your Health Data Today
          </h2>
          
          <p className="text-blue-100 text-lg mb-10">
            Join thousands of patients who use MedIntel Health AI to understand 
            their medical history with clarity and confidence.
          </p>
          
          <Link to="/signup">
            <Button 
              variant="white" 
              className="px-8 py-3.5 text-base font-bold shadow-xl hover:shadow-2xl"
            >
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
