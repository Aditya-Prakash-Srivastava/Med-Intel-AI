import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  DownloadIcon, DotsVerticalIcon, CloudUploadIcon, DocIcon,
  DropPlusIcon, CapsuleIcon, HeartMonitorIcon, LungsIcon, ChartIcon
} from '../components/Icons';
import { customAlert, customPrompt, customConfirm } from '../utils/CustomAlert';

/* ==============================================================
   MEDICAL HISTORY PAGE
   Clean minimal interface dynamically hooked into user uploads.
============================================================== */

const MedicalHistory = () => {

  const [reports, setReports] = useState([]);
  const [viewAnalysisModal, setViewAnalysisModal] = useState(null);
  const [viewDocumentModal, setViewDocumentModal] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Automatically fetch reports initially & listen for background global uploads
  const fetchReports = async () => {
    try {
      const storedProfile = JSON.parse(localStorage.getItem('medintel_user_profile') || "{}");
      if (!storedProfile.token) return;

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/reports`, {
        headers: { Authorization: `Bearer ${storedProfile.token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Failed to load records from backend:", error);
    }
  };

  useEffect(() => {
    fetchReports();
    window.addEventListener('reportsUpdated', fetchReports);
    return () => window.removeEventListener('reportsUpdated', fetchReports);
  }, []);

  // Action APIs
  const handleRename = async (id, currentTitle) => {
    const newTitle = await customPrompt("Enter a new title for this report:", currentTitle);
    if (!newTitle || newTitle === currentTitle) return;

    try {
      const token = JSON.parse(localStorage.getItem('medintel_user_profile')).token;
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle })
      });
      fetchReports(); // Refresh cleanly
    } catch (err) { customAlert("Unable to rename file.", "error"); }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await customConfirm("Are you sure you want to permanently delete this clinical record?");
    if (!isConfirmed) return;

    try {
      const token = JSON.parse(localStorage.getItem('medintel_user_profile')).token;
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/reports/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReports(); // Refresh cleanly removing element locally natively
    } catch (err) { customAlert("Unable to delete file.", "error"); }
  };

  // The 'Download All' button will still open tabs natively.
  // The 'View Document' button directly triggers the UI modal inline.

  // Icon Matcher (Dynamically picks icon based on the recorded type)
  const getIconForType = (iconType) => {
    if (iconType === 'blood') return <DropPlusIcon />;
    if (iconType === 'mri') return <CapsuleIcon />;
    return <DocIcon />;
  };

  const isPdfDocument = (report) => {
    const fileType = (report?.fileType || '').toLowerCase();
    const fileUrl = (report?.fileUrl || '').toLowerCase();
    return fileType === 'pdf' || fileUrl.includes('.pdf');
  };

  const handleDownloadAll = async () => {
    if (reports.length === 0) {
       customAlert("No records available to download.", "error");
       return;
    }
    if (await customConfirm(`Are you sure you want to download ${reports.length} reports? (Ensure popups are allowed)`)) {
      reports.forEach((r, idx) => {
        setTimeout(() => {
          let safeUrl = r.fileUrl;
          if (isPdfDocument(r)) {
            safeUrl = `https://docs.google.com/gview?url=${encodeURIComponent(r.fileUrl)}&embedded=true`;
          }
          window.open(safeUrl, '_blank', 'noopener,noreferrer');
        }, idx * 400); // slight staggered timeout to prevent adblock/popup rejection
      });
    }
  };

  const handleDownload = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <DashboardLayout headerTitle="Clinical Sanctuary AI" headerSubtitle="Medical Records">

      {/* === TOP TITLE BAR === */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-teal-600 tracking-[0.2em] uppercase mb-2">
            <span className="text-gray-400">REPOSITORY</span>
            <span className="text-gray-300 mx-1">›</span>
            <span>HISTORICAL ARCHIVE</span>
          </div>
          <h2 className="text-[32px] leading-tight font-bold text-[#0a192f] mb-1.5">Medical History</h2>
          <p className="text-gray-500 text-sm max-w-xl font-medium">
            Central database of your clinical records and AI-processed diagnostic data. Use these for longitudinal health tracking.
          </p>
        </div>
        <button onClick={handleDownloadAll} className="flex items-center gap-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-800 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shrink-0">
          <DownloadIcon /> Download All
        </button>
      </div>

      {/* === TABLE GRID LAYOUT === */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 mb-12" onClick={() => setOpenMenuId(null)}>

        {/* Table Head */}
        <div className="grid grid-cols-[minmax(200px,1fr)_120px_minmax(220px,1.5fr)_280px] gap-6 px-8 py-5 bg-[#FAFAFA] rounded-t-[23px] border-b border-gray-100 text-[10px] font-bold text-gray-500 tracking-widest uppercase items-center">
          <div>Report Type</div>
          <div>Date</div>
          <div>AI Analysis Snippet</div>
          <div className="text-right">Action</div>
        </div>

        {/* Table Rows Map */}
        <div className="flex flex-col">
          {reports.map((r, i) => (
            <div key={i} className="group grid grid-cols-[minmax(200px,1fr)_120px_minmax(220px,1.5fr)_280px] gap-6 px-8 py-6 items-center border-b border-gray-50 last:border-0 hover:bg-[#fafbfc] last:rounded-b-[23px] transition-colors">

              {/* Col 1: Icon + Title */}
              <div className="flex gap-4 items-center min-w-0">
                <div className={`w-[42px] h-[42px] rounded-2xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-500`}>
                  {getIconForType(r.iconType)}
                </div>
                <div className="truncate pr-2">
                  <h4 className="font-bold text-[#0a192f] text-[15px] leading-snug truncate">{r.title}</h4>
                  <p className="text-[12px] text-gray-500 font-medium truncate mt-0.5">{r.subtitle}</p>
                </div>
              </div>

              {/* Col 2: Date */}
              <div className="text-[13px] font-bold text-slate-700">{r.date}</div>

              {/* Col 3: AI Snippet */}
              <div className="min-w-0 overflow-hidden pr-4 flex-1">
                <p className="text-[13.5px] text-slate-600 italic leading-relaxed font-serif line-clamp-2 text-ellipsis overflow-hidden">
                  {r.snippet}
                </p>
              </div>

              {/* Col 4: Action Buttons */}
              <div className="flex items-center gap-3 justify-end relative">

                {r.aiAnalysis && (
                  <button onClick={() => setViewAnalysisModal(r.aiAnalysis)} className="bg-teal-50 text-teal-700 px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:bg-teal-100 transition-colors shadow-sm">
                    View <br /> Analysis
                  </button>
                )}

                <button onClick={() => setViewDocumentModal(r)} className="bg-[#0a192f] text-white px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:bg-[#112240] transition-colors shadow-md shadow-blue-900/10">
                  View <br /> Document
                </button>

                {/* Triple Dots with Hover Dropdown (Rename/Download/Remove) */}
                <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setOpenMenuId((prevId) => (prevId === r._id ? null : r._id))}
                    className="text-gray-400 hover:text-slate-800 transition-colors p-1.5 focus:outline-none cursor-pointer rounded-lg bg-transparent hover:bg-gray-100"
                  >
                    <DotsVerticalIcon />
                  </button>

                  {/* The Hidden Dropdown Menu Container */}
                  {openMenuId === r._id && (
                    <div className="absolute right-0 top-8 mt-1 w-36 bg-white border border-gray-100 shadow-2xl shadow-slate-200/50 rounded-xl flex flex-col z-50 overflow-hidden">
                      <button onClick={() => { setOpenMenuId(null); handleRename(r._id, r.title); }} className="text-left px-5 py-3 text-xs font-bold text-gray-700 hover:bg-slate-50 border-b border-gray-50 flex items-center justify-between">Rename</button>
                      <button onClick={() => { setOpenMenuId(null); handleDownload(r.fileUrl); }} className="text-left px-5 py-3 text-xs font-bold text-teal-700 hover:bg-teal-50 border-b border-gray-50 flex items-center justify-between">Download</button>
                      <button onClick={() => { setOpenMenuId(null); handleDelete(r._id); }} className="text-left px-5 py-3 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center justify-between">Remove</button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          ))}

          {/* Fallback empty state if no user reports present */}
          {reports.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
              <p className="text-gray-400 font-bold text-sm tracking-wide">NO CLINICAL RECORDS FOUND</p>
              <p className="text-gray-400 text-xs mt-2 w-1/2">Click the "Upload New Report" button in the left sidebar to add diagnostic documents to your archive.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI ANALYSIS MODAL POPUP */}
      {viewAnalysisModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-2xl p-8 max-h-[85vh] flex flex-col relative text-left overflow-y-auto">
            <button onClick={() => setViewAnalysisModal(null)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 bg-gray-50 p-2 rounded-xl transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>

            <div className="mb-6 pb-4 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="text-[10px] font-extrabold text-[#0a192f] uppercase tracking-[0.15em] mb-1">AI Analysis Result</h3>
                <h2 className="text-[20px] font-bold text-[#0a192f] leading-snug">{viewAnalysisModal.aiTitle || "Analysis Result"}</h2>
              </div>
              <div className="text-right shrink-0 ml-4 mr-8">
                <h3 className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Confidence Score</h3>
                <h2 className="text-[24px] font-extrabold text-teal-600 leading-none">{viewAnalysisModal.confidenceScore || "N/A"}</h2>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-[15px] font-bold text-[#0a192f] mb-3">Findings Summary</h3>
                <ul className="space-y-3">
                  {viewAnalysisModal.findings?.map((f, index) => (
                    <li key={index} className="flex gap-3 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-[7px]"></span>
                      <span className="text-[13px] font-medium text-gray-600 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-[#0a192f] mb-3">Next Steps</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewAnalysisModal.nextSteps?.map((step, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex flex-col gap-2">
                      <div className="text-[18px]">{step.icon}</div>
                      <h4 className="text-[13px] font-bold text-[#0a192f]">{step.title}</h4>
                      <p className="text-[11px] font-medium text-gray-500 leading-snug">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL POPUP */}
      {viewDocumentModal && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-6xl h-[92vh] p-4 md:p-5 flex flex-col relative text-left">
            <button
              onClick={() => setViewDocumentModal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 font-bold bg-gray-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              Close Document
            </button>

            <div className="mb-3 pb-3 border-b border-gray-100 flex flex-col pr-28 shrink-0">
              <h3 className="text-[10px] font-extrabold text-[#0a192f] uppercase tracking-[0.15em] mb-1">Live Document Viewer</h3>
              <h2 className="text-[18px] font-bold text-[#0a192f] leading-snug truncate">{viewDocumentModal.title}</h2>
            </div>

            <div className="flex-1 w-full relative bg-white rounded-xl overflow-hidden border border-gray-200">
              {isPdfDocument(viewDocumentModal) ? (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(viewDocumentModal.fileUrl)}&embedded=true`}
                  title="PDF Viewer"
                  className="w-full h-full border-none shadow-none"
                />
              ) : (
                <img
                  src={viewDocumentModal.fileUrl}
                  alt="Document Preview"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default MedicalHistory;
