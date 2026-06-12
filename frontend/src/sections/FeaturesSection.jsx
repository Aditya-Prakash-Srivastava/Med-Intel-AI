import React from 'react';

// === ICONS ===
const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-6 h-6 text-teal-600"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

const ChartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-6 h-6 text-blue-600"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22M2.25 18v-1.5M2.25 18H3.75"
    />
  </svg>
);

const BotIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-6 h-6 text-orange-600"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z"
    />
  </svg>
);

const FeaturesSection = () => {
  return (
    <section className="bg-[#FAFAFA] py-24">
      <div className="max-w-6xl mx-auto px-6">

        {/* === Section Header === */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B]">
            Advanced Care Foundation
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium">
            Our platform combines state-of-the-art machine learning
            with medical-grade security to empower your health journey.
          </p>
        </div>

        {/* === Grid for Features === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1: Secure Storage */}
          <div
            className={`
              bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100 
              flex flex-col relative overflow-hidden group
            `}
          >
            <div className="w-12 h-12 rounded-xl bg-teal-100/50 flex items-center justify-center mb-6">
              <ShieldIcon />
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-3">
              Secure Report Storage
            </h3>

            <p className="text-gray-500 text-sm leading-relaxed max-w-sm relative z-10">
              Your data is encrypted using military-grade AES-256 protocols.
              We prioritize privacy, ensuring your sensitive medical information
              remains exclusively yours and accessible only by you.
            </p>

            {/* Decorative background icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
              className={`
                w-48 h-48 text-gray-50 absolute -bottom-10 -right-10 
                transform rotate-12 group-hover:scale-110 
                transition-transform duration-500
              `}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>

          {/* Card 2: Track Journey */}
          <div
            className={`
              bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100 
              flex flex-col
            `}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
              <ChartIcon />
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-3">
              Track Your Health Journey
            </h3>

            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-8">
              Visualize trends in your health data over time. Monitor
              improvements and identify patterns with intuitive, clinical-grade charts.
            </p>

            {/* Mini Chart Graphic */}
            <div
              className={`
                flex-1 min-h-[100px] flex items-end gap-2 px-6 pb-2 pt-6 
                bg-gray-50 rounded-2xl border border-gray-100 mt-auto
              `}
            >
              <div className="flex-1 bg-teal-100 rounded-t-lg h-1/3"></div>
              <div className="flex-1 bg-teal-300 rounded-t-lg h-1/2"></div>
              <div className="flex-1 bg-teal-500 rounded-t-lg h-2/3"></div>
              <div className="flex-1 bg-teal-700 rounded-t-lg h-full"></div>
              <div className="flex-1 bg-teal-600 rounded-t-lg h-5/6"></div>
            </div>
          </div>

          {/* Card 3: Instant AI Analysis (Full Width) */}
          <div
            className={`
              md:col-span-2 bg-white rounded-3xl p-8 lg:p-10 shadow-sm 
              border border-gray-100 flex flex-col md:flex-row gap-8 
              items-center overflow-hidden
            `}
          >
            <div className="flex-1">
              <div className="w-12 h-12 rounded-xl bg-orange-100/50 flex items-center justify-center mb-6">
                <BotIcon />
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Instant AI Analysis
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed max-w-lg mb-8">
                No more waiting weeks for simplified explanations. Our
                medical-tuned AI processes your complex lab results and provides
                easy-to-understand summaries in seconds, highlighting what matters most.
              </p>

              <div className="flex gap-3">
                <span
                  className={`
                    px-3 py-1.5 rounded-full bg-cyan-100 text-cyan-800 
                    text-xs font-bold tracking-wide
                  `}
                >
                  Fast Processing
                </span>
                <span
                  className={`
                    px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-800 
                    text-xs font-bold tracking-wide
                  `}
                >
                  Accurate Results
                </span>
              </div>
            </div>

            {/* Right side image */}
            <div className="flex-1 w-full relative">
              <div className="aspect-video md:aspect-4/3 w-full rounded-2xl overflow-hidden shadow-inner">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600"
                  alt="AI Platform"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
