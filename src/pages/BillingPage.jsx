import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function BillingPage() {
   return (
      <DashboardLayout headerTitle="Billing & Subscriptions" headerSubtitle="Manage Plans">
         <div className="flex flex-col items-center justify-center -mt-4 pb-12">

            {/* Head Intro */}
            <div className="text-center mb-12 max-w-xl">
               <h2 className="text-[34px] font-extrabold text-[#0a192f] mb-3 tracking-tight">Upgrade Your Medical AI</h2>
               <p className="text-[15px] font-medium text-gray-500 leading-relaxed">
                  Get the most accurate clinical insights directly tailored to your health architecture.
                  Unlock premium AI capacity and expanded functionality today.
               </p>
            </div>

            {/* Pricing Cards Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">

               {/* STANDARD TIER CARD (Current) */}
               <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm p-8 flex flex-col relative overflow-hidden transition-all duration-300">
                  <div className="mb-8">
                     <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-4">Current Plan</span>
                     <h3 className="text-2xl font-bold text-[#0a192f]">Standard Tier</h3>
                     <div className="mt-4 flex items-end gap-1">
                        <span className="text-[42px] font-extrabold text-[#0a192f] leading-none">$0</span>
                        <span className="text-gray-500 font-medium text-sm mb-1.5">/month</span>
                     </div>
                     <p className="text-sm font-medium text-gray-500 mt-4">Essential tools to manage your casual medical report indexing locally.</p>
                  </div>

                  <div className="flex-1 space-y-4 mb-8">
                     <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-gray-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        <span className="text-[14px] font-medium text-gray-700">Store up to 10 clinical reports securely</span>
                     </div>
                     <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-gray-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        <span className="text-[14px] font-medium text-gray-700">Basic AI Clinical Responses</span>
                     </div>
                     <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-gray-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        <span className="text-[14px] font-medium text-gray-700">Interactive Question & Answer module</span>
                     </div>
                  </div>

                  <button disabled className="w-full bg-gray-50 text-gray-400 border border-gray-200 py-3.5 rounded-xl font-bold text-[14px]">
                     Free Default
                  </button>
               </div>

               {/* PREMIUM TIER CARD */}
               <div className="bg-[#0a192f] rounded-[24px] border border-[#112240] shadow-2xl p-8 flex flex-col relative overflow-hidden transform hover:-translate-y-2 transition-all duration-300">

                  {/* Gradient glow accent */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

                  <div className="mb-8 relative z-10">
                     <span className="bg-linear-to-r from-blue-500 to-teal-400 text-white shadow shadow-blue-500/30 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-4">Recommended</span>
                     <h3 className="text-2xl font-bold text-white">Premium Tier</h3>
                     <div className="mt-4 flex items-end gap-1">
                        <span className="text-[42px] font-extrabold text-white leading-none">$19</span>
                        <span className="text-gray-400 font-medium text-sm mb-1.5">/month</span>
                     </div>
                     <p className="text-sm font-medium text-gray-400 mt-4">Advanced diagnostic limits and conversational AI for profound intelligence.</p>
                  </div>

                  <div className="flex-1 space-y-4 mb-8 relative z-10">
                     <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-teal-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        <span className="text-[14px] font-medium text-gray-200">Store <strong className="text-white">Unlimited</strong> clinical responses</span>
                     </div>
                     <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-teal-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        <span className="text-[14px] font-medium text-gray-200">Enhanced & Detailed Medical Reports using Gemini Pro</span>
                     </div>
                     <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-teal-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        <span className="text-[14px] font-bold text-teal-300">Premium AI-Trained Model & Highly Accurate RAG Chatbot</span>
                     </div>
                     <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-teal-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        <span className="text-[14px] font-medium text-gray-200">Priority Clinical Support Team</span>
                     </div>
                  </div>

                  <button className="relative z-10 w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 py-3.5 rounded-xl font-bold text-[14px] transition-colors border border-blue-400/30">
                     Upgrade to Premium
                  </button>
               </div>

            </div>

            <div className="mt-12 text-center">
               <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-4">Enterprise Partnerships</p>
               <p className="text-[13px] font-medium text-gray-500 max-w-sm mx-auto">
                  Looking to deploy MedIntel specifically for your hospital network or clinic APIs? <a href="#" className="text-blue-600 font-bold hover:underline">Contact Sales</a>
               </p>
            </div>

         </div>
      </DashboardLayout>
   );
}
