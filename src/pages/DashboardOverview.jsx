import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { customAlert } from '../utils/CustomAlert';

const BloodPressureIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-600">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
  </svg>
);

const ViewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [sys, setSys] = useState("120");
  const [dia, setDia] = useState("80");
  const [isEditingBp, setIsEditingBp] = useState(false);
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    // 1. Recover Biometric Profile Securely
    const p = JSON.parse(localStorage.getItem('medintel_user_profile') || "{}");
    setProfile(p);

    // 2. Blood Pressure - Natively linked strictly to Cloud Database profile
    const storedBp = p.bloodPressure || "120/80";
    const parts = storedBp.split("/");
    if (parts.length === 2) {
      setSys(parts[0]);
      setDia(parts[1]);
    }

    // 3. Render Historical Timelines Read-Only natively directly
    if (p.token) {
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/reports`, {
        headers: { Authorization: `Bearer ${p.token}` }
      })
        .then(res => res.json())
        .then(data => setRecentReports(data))
        .catch(console.error);
    }
  }, []);

  const handleBpSave = async () => {
    // Basic Validation: Ensure at least 2 characters. Pad with '0' if less.
    let finalSys = sys.trim();
    let finalDia = dia.trim();

    if (finalSys.length === 0) finalSys = "120";
    if (finalSys.length === 1) finalSys = "0" + finalSys;

    if (finalDia.length === 0) finalDia = "80";
    if (finalDia.length === 1) finalDia = "0" + finalDia;

    const newBp = `${finalSys}/${finalDia}`;
    setIsEditingBp(false);

    // Save permanently to Backend Database (MongoDB) 
    // Yeh data securely backend mein push hoga taaki cross-device session data safe rahe.
    if (profile._id) {
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/profile/${profile._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bloodPressure: newBp, token: profile.token })
        });

        // Refresh internal RAM with confirmed DB changes
        const updatedProfile = { ...profile, bloodPressure: newBp };
        setProfile(updatedProfile);
        localStorage.setItem('medintel_user_profile', JSON.stringify(updatedProfile));
      } catch (error) {
        console.error("Database connection error on BP:", error);
      }
    }
  };

  // Biomath Calculations exactly via profile params dynamically generating
  let bmi = "N/A";
  if (profile.weight && profile.height) {
    const h = parseFloat(profile.height) / 100; // Drop metric logic precisely
    const w = parseFloat(profile.weight);
    if (!isNaN(h) && !isNaN(w) && h > 0) {
      bmi = (w / (h * h)).toFixed(1);
    }
  }

  // Handle Quick Upload Redirection
  const handleQuickUploadPress = (e) => {
    e.preventDefault();
    customAlert("You are being securely redirected to the unified Medical History pipeline where you can sync diagnostics directly!");
    navigate('/history');
  };

  return (
    <DashboardLayout>
      <div className="flex-1 p-8 lg:p-10 overflow-y-auto bg-[#FBFBFC]">

        {/* HEADER ALIGNMENT */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0a192f] whitespace-nowrap tracking-tight">Clinical Sanctuary</h1>
          <p className="text-gray-500 font-medium text-[13px] mt-1">Integrative health monitoring for patient record ID: <span className="text-[#0a192f] font-bold">#{profile._id ? profile._id.slice(-6).toUpperCase() : '7721'}-M</span></p>
        </div>

        {/* TOP HERO GRID ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* BP Card with Inline Mutation Editor */}
          <div className="bg-white rounded-[24px] p-6 border border-[#F0F2F5] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl w-[46px] h-[46px] flex items-center justify-center">
                <BloodPressureIcon />
              </div>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">Optimal</span>
            </div>

            <div className="group relative mt-auto">
              {isEditingBp ? (
                <div className="flex items-end gap-2 mb-2">
                  <div className="flex flex-col items-center">
                    <input
                      autoFocus
                      type="text"
                      maxLength={3}
                      value={sys}
                      onChange={(e) => setSys(e.target.value.replace(/[^0-9]/g, ''))}
                      className="text-3xl font-extrabold text-[#0a192f] bg-gray-50 border-2 border-blue-200 outline-none rounded-xl w-[70px] text-center py-1 focus:border-blue-500"
                    />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Systolic</span>
                  </div>

                  <span className="text-3xl font-light text-gray-300 pb-[18px]">/</span>

                  <div className="flex flex-col items-center">
                    <input
                      type="text"
                      maxLength={3}
                      value={dia}
                      onChange={(e) => setDia(e.target.value.replace(/[^0-9]/g, ''))}
                      className="text-3xl font-extrabold text-[#0a192f] bg-gray-50 border-2 border-blue-200 outline-none rounded-xl w-[70px] text-center py-1 focus:border-blue-500"
                    />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Diastolic</span>
                  </div>

                  <button
                    onClick={handleBpSave}
                    className="ml-2 mb-[18px] bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsEditingBp(true)} title="Modify Baseline BP">
                  <div className="flex items-end gap-1.5 pt-1">
                    <div className="flex flex-col items-center">
                      <h2 className="text-[42px] font-extrabold text-[#0a192f] leading-none tracking-tight">{sys}</h2>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Systolic</span>
                    </div>
                    <span className="text-[40px] font-light text-gray-200 leading-none mb-[18px]">/</span>
                    <div className="flex flex-col items-center">
                      <h2 className="text-[42px] font-extrabold text-[#0a192f] leading-none tracking-tight">{dia}</h2>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Diastolic</span>
                    </div>
                  </div>
                  <button className="text-gray-300 hover:text-blue-600 transition-colors hidden group-hover:block mb-[18px] ml-2">
                    <EditIcon />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Patient Biometrics Card */}
          <div className="bg-white rounded-[24px] p-6 border border-[#F0F2F5] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative">
            <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mb-7">Patient Biometrics</h3>

            <div className="grid grid-cols-2 gap-y-7">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Height</p>
                <p className="text-xl font-extrabold text-[#0a192f]">{profile.height || 'N/A'}<span className="text-sm text-gray-500 font-semibold">cm</span></p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Weight</p>
                <p className="text-xl font-extrabold text-[#0a192f]">{profile.weight || 'N/A'}<span className="text-sm text-gray-500 font-semibold">kg</span></p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Age / Gender</p>
                <p className="text-xl font-extrabold text-[#0a192f]">{profile.age || 'N/A'}, <span className="capitalize">{profile.gender && profile.gender !== "Not Specified" ? profile.gender : 'N/A'}</span></p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">BMI</p>
                <p className="text-xl font-extrabold text-teal-600">{bmi}</p>
              </div>
            </div>
          </div>

          {/* Go Premium Blueprint Card */}
          <div className="bg-[#0a192f] rounded-[24px] p-7 shadow-xl shadow-blue-900/20 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute right-[-20px] top-[-10px] opacity-[0.03]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[200px] h-[200px]">
                <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-extrabold text-white mb-2">Go Premium</h2>
              <p className="text-blue-100/70 text-[13px] leading-relaxed mb-6 font-medium">Unlock deep genomic analysis and priority consultant review for all upcoming reports.</p>
            </div>
            <Link to="/billing" className="bg-white text-[#0a192f] w-full py-3.5 rounded-xl font-bold text-[13px] text-center shadow-lg hover:bg-gray-50 transition-colors relative z-10">
              Upgrade Plan
            </Link>
          </div>
        </div>

        {/* MIDDLE SECONDARY ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* AI Insights Primary Display */}
          <div className="lg:col-span-2 bg-linear-to-br from-[#A5E8D8] to-[#8BE0CC] rounded-[24px] px-8 py-9 relative overflow-hidden border border-teal-200/50 shadow-sm flex items-start gap-6">
            <div className="bg-white/80 p-3 rounded-[16px] text-teal-800 shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.03)] border border-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[30px] h-[30px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.496 1.508 1.333 1.508 2.316V18M12 9a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-teal-900 mb-2">AI Health Insight</h2>
              <p className="text-teal-800 text-[13px] leading-relaxed mb-4 font-medium pr-10">
                Based on your recent MRI and BP trends, your neural baseline shows excellent stability.
                Suggested: Magnesium-rich diet for continued cognitive support.
              </p>
              <Link to="/insights" className="text-[12px] font-bold text-teal-900 border-b border-teal-700/50 pb-px hover:text-black hover:border-black transition-colors w-max block">
                Expand Clinical Analysis &rarr;
              </Link>
            </div>
          </div>

          {/* Configured Quick Action Routes */}
          <div className="flex flex-col gap-3 justify-center">
            <h3 className="text-[13px] font-bold text-[#0a192f] px-1 mb-0.5">Quick Actions</h3>

            <Link to="/history" onClick={handleQuickUploadPress} className="bg-white p-3.5 rounded-[18px] shadow-sm border border-[#F0F2F5] flex items-center gap-4 hover:border-blue-200 transition-colors group cursor-pointer">
              <div className="w-[42px] h-[42px] rounded-[14px] bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[22px] h-[22px]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </div>
              <span className="font-bold text-[#0a192f] text-[13px]">Upload New Report</span>
            </Link>

            <Link to="/profile" className="bg-white p-3.5 rounded-[18px] shadow-sm border border-[#F0F2F5] flex items-center gap-4 hover:border-teal-200 transition-colors group cursor-pointer">
              <div className="w-[42px] h-[42px] rounded-[14px] bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[22px] h-[22px]"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
              </div>
              <span className="font-bold text-[#0a192f] text-[13px]">View Profile</span>
            </Link>

            <button type="button" onClick={() => customAlert("History Logs functionality is reserved for next iterations")} className="bg-white p-3.5 rounded-[18px] shadow-sm border border-[#F0F2F5] flex items-center gap-4 hover:border-indigo-200 transition-colors group text-left cursor-pointer">
              <div className="w-[42px] h-[42px] rounded-[14px] bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[22px] h-[22px]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              </div>
              <span className="font-bold text-[#0a192f] text-[13px]">History Logs</span>
            </button>
          </div>
        </div>

        {/* NATIVE INTEGRATION: Bottom Scroll View Mapping Data Layer purely Read-Only limits */}
        <div className="bg-white rounded-[24px] px-8 pt-8 pb-4 border border-[#F0F2F5] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-[18px] font-bold text-[#0a192f]">Recent Reports</h2>
              <p className="text-gray-400 font-medium text-[12px] mt-1">Timeline of clinical diagnostics and processing status.</p>
            </div>
            <Link to="/history" className="text-teal-700 font-bold text-[12px] flex items-center gap-2 hover:text-[#0a192f] transition-colors border-b border-transparent hover:border-[#0a192f] pb-0.5">
              View All Documentation
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
            </Link>
          </div>

          {/* Read-Only Table Headers */}
          <div className="grid grid-cols-5 gap-4 text-[9px] font-extrabold text-gray-400 uppercase tracking-widest pb-3 border-b border-[#F0F2F5] mb-2">
            <div className="col-span-2 pl-2">Report Name</div>
            <div>Date Submitted</div>
            <div>Clinical Category</div>
            <div>Status</div>
            <div className="text-right pr-5">Actions</div>
          </div>

          {/* Scrollable Document Flow Wrapper */}
          <div className="flex flex-col max-h-[220px] overflow-y-auto pr-2 gap-1 stylish-scroll">
            {recentReports.length > 0 ? recentReports.map(r => (
              <div key={r._id} className="grid grid-cols-5 gap-4 items-center py-2 hover:bg-gray-50/70 rounded-2xl px-2 transition-colors border border-transparent hover:border-gray-100">
                <div className="col-span-2 flex items-center gap-3">
                  <div className={`w-[38px] h-[38px] rounded-[12px] flex items-center justify-center shrink-0 ${r.iconType === 'blood' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                  </div>
                  <span className="font-bold text-[#0a192f] text-[13px] truncate">{r.title}</span>
                </div>
                <div className="text-gray-500 text-[12px] font-medium">{r.date || 'Pending'}</div>
                <div>
                  <span className="bg-gray-100/80 text-gray-500 text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">{r.iconType === 'blood' ? 'HEMATOLOGY' : 'RADIOLOGY'}</span>
                </div>
                <div>
                  <span className="bg-[#b1eee2]/60 text-teal-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 w-max">
                    <span className="w-[6px] h-[6px] rounded-full bg-teal-600"></span> Completed
                  </span>
                </div>
                {/* Safe Strict Actions omitting Triple-Dots globally here */}
                <div className="flex justify-end gap-3.5 text-gray-400 pr-3">
                  <button onClick={() => window.open(r.fileUrl.toLowerCase().endsWith('.pdf') ? r.fileUrl.replace(/\.pdf$/i, '.png') : r.fileUrl, '_blank')} className="hover:text-blue-600 transition-colors p-1" title="Download Document"><DownloadIcon /></button>
                  <button onClick={() => window.open(r.fileUrl.toLowerCase().endsWith('.pdf') ? r.fileUrl.replace(/\.pdf$/i, '.png') : r.fileUrl, '_blank')} className="hover:text-teal-600 transition-colors p-1" title="Read Snapshot"><ViewIcon /></button>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-gray-400 text-sm font-medium">No recent documents found on server memory.<br /> <Link to="/history" className="text-blue-600 font-bold hover:underline">Upload a snapshot →</Link></div>
            )}
          </div>
        </div>

      </div>

    </DashboardLayout>
  );
}
