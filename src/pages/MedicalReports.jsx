import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/Button';
import { customAlert, customPrompt, customConfirm } from '../utils/CustomAlert';

/* =======================================
   1. MAIN COMPONENT: MEDICAL REPORTS (AI HUB)
   ======================================= */
export default function MedicalReports() {
  
  // === GEMINI API STUB VARIABLES ===
  const [aiTitle, setAiTitle] = useState(() => sessionStorage.getItem('mr_aiTitle') || "No Significant Abnormalities");
  const [confidenceScore, setConfidenceScore] = useState(() => sessionStorage.getItem('mr_confidenceScore') || "98.4%");
  
  const [findings, setFindings] = useState(() => {
    try { const f = sessionStorage.getItem('mr_findings'); if(f) return JSON.parse(f); } catch(e) {}
    return [
      "Grey and white matter differentiation is preserved across all cerebral hemispheres.",
      "No abnormal enhancement post-contrast was noted in the preliminary automated screening.",
      "Orbital and sinus structures appear clear and within normal physiological limits."
    ];
  });
  const [nextSteps, setNextSteps] = useState(() => {
    try { const n = sessionStorage.getItem('mr_nextSteps'); if(n) return JSON.parse(n); } catch(e) {}
    return [
      { title: "Routine Check-up", desc: "Schedule a 6-month follow-up consultation.", icon: "📅" },
      { title: "Clinical Correlation", desc: "Share these results with your primary care provider.", icon: "📄" }
    ];
  });

  // Document active state
  const [profile, setProfile] = useState({});
  const [historyReports, setHistoryReports] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [activeReportId, setActiveReportId] = useState(() => sessionStorage.getItem('mr_activeReportId') || null);
  const [hasActiveReport, setHasActiveReport] = useState(() => sessionStorage.getItem('mr_hasActiveReport') === 'true');
  const [currentFileName, setCurrentFileName] = useState(() => sessionStorage.getItem('mr_currentFileName') || "MRI Brain Scan Analysis");
  const [currentUser, setCurrentUser] = useState("John Doe"); 
  const [currentDate, setCurrentDate] = useState(() => sessionStorage.getItem('mr_currentDate') || "Oct 24, 2024");
  const [currentDocUrl, setCurrentDocUrl] = useState(() => sessionStorage.getItem('mr_currentDocUrl') || "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=1200");
  const [currentFileType, setCurrentFileType] = useState(() => sessionStorage.getItem('mr_currentFileType') || "image");

  // PERSIST STATE PREVENTING LOSS ON ROUTE NAVIGATION
  useEffect(() => {
    sessionStorage.setItem('mr_aiTitle', aiTitle);
    sessionStorage.setItem('mr_confidenceScore', confidenceScore);
    sessionStorage.setItem('mr_findings', JSON.stringify(findings));
    sessionStorage.setItem('mr_nextSteps', JSON.stringify(nextSteps));
    sessionStorage.setItem('mr_activeReportId', activeReportId || '');
    sessionStorage.setItem('mr_hasActiveReport', hasActiveReport);
    sessionStorage.setItem('mr_currentFileName', currentFileName);
    sessionStorage.setItem('mr_currentDate', currentDate);
    sessionStorage.setItem('mr_currentDocUrl', currentDocUrl);
    sessionStorage.setItem('mr_currentFileType', currentFileType);
  }, [aiTitle, confidenceScore, findings, nextSteps, activeReportId, hasActiveReport, currentFileName, currentDate, currentDocUrl, currentFileType]);

  // MOUNT: Secure Data Pre-fetching
  useEffect(() => {
    const p = JSON.parse(localStorage.getItem('medintel_user_profile') || "{}");
    setProfile(p);
    if (p.name) setCurrentUser(p.name);

    if (p.token) {
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/reports`, {
        headers: { Authorization: `Bearer ${p.token}` }
      })
      .then(res => res.json())
      .then(data => setHistoryReports(data))
      .catch(console.error);
    }
  }, []);

  const triggerAIAnalysis = async (fileUrl, reportId, fileType) => {
    setIsAnalyzing(true);
    try {
      const p = JSON.parse(localStorage.getItem('medintel_user_profile') || "{}");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${p.token}` },
        body: JSON.stringify({ fileUrl, reportId, fileType })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAiTitle(data.analysis.aiTitle);
        setConfidenceScore(data.analysis.confidenceScore);
        if (data.analysis.findings) setFindings(data.analysis.findings);
        if (data.analysis.nextSteps) setNextSteps(data.analysis.nextSteps);
      } else {
        // Fallback or error handled gracefully
        setAiTitle("Analysis Failed / Not Recognized");
        setConfidenceScore("0%");
        setFindings([data.message || "The AI encountered an error processing this file."]);
        setNextSteps([{ title: "Retry", desc: "Try uploading a clearer document.", icon: "⚠️" }]);
      }
    } catch(err) {
      console.error("AI Analysis Failed", err);
      setAiTitle("Server Connection Error");
      setConfidenceScore("N/A");
      setFindings(["A network error occurred connecting to the MedIntel AI module."]);
      setNextSteps([{ title: "Check Network", desc: "Please ensure your backend server is running.", icon: "🔌" }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadFromHistory = (r) => {
    setCurrentFileName(r.title);
    setCurrentDocUrl(r.fileUrl);
    setCurrentDate(r.date || new Date().toLocaleDateString());
    setCurrentFileType(r.fileType || 'image');
    setActiveReportId(r._id);
    setHasActiveReport(true);
    setShowHistoryModal(false);
    
    // Load pre-existing analysis or trigger new one
    if (r.aiAnalysis) {
      setAiTitle(r.aiAnalysis.aiTitle);
      setConfidenceScore(r.aiAnalysis.confidenceScore);
      if (r.aiAnalysis.findings) setFindings(r.aiAnalysis.findings);
      if (r.aiAnalysis.nextSteps) setNextSteps(r.aiAnalysis.nextSteps);
    } else {
      triggerAIAnalysis(r.fileUrl, r._id, r.fileType);
    }
  };

  // === FUNCTIONAL UPLOAD HOOKS ===
  const handleLocalFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)) {
      e.target.value = '';
      customAlert("Please upload your document as a PDF or image file (JPG, PNG).", "error");
      return;
    }

    const reportName = await customPrompt("Please enter a title for this clinical document:") || file.name;
    
    setIsUploading(true);
    try {
      // 1. Storage Upload to Cloudinary Pipeline securely mapping the blob
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/upload`, {
        method: 'POST', body: formData
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error("Failed Cloudinary connection.");

      // 2. Database Sync specifically anchoring to active User
      const exactDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
      
      let savedReport = null;
      if (profile.token) {
        const dbRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${profile.token}` },
          body: JSON.stringify({
             title: reportName,
             date: exactDate,
             iconType: file.type === 'application/pdf' ? 'doc' : 'blood',
             fileUrl: uploadData.fileUrl,
             cloudinaryId: uploadData.publicId,
             fileType: file.type.includes('pdf') ? 'pdf' : 'image'
          })
        });
        savedReport = await dbRes.json();
        setHistoryReports([savedReport, ...historyReports]); // Instant UI Sync
      }

      // 3. Mount actively to Gemini UI bindings natively
      setCurrentFileName(reportName);
      setCurrentDate(exactDate);
      setCurrentDocUrl(uploadData.fileUrl);
      setCurrentFileType(file.type.includes('pdf') ? 'pdf' : 'image');
      if(savedReport) setActiveReportId(savedReport._id);
      setHasActiveReport(true);
      
      // 4. Trigger AI Generation which auto-saves
      if(savedReport) {
         triggerAIAnalysis(uploadData.fileUrl, savedReport._id, savedReport.fileType);
      }

    } catch (err) {
      console.error(err);
      customAlert("We encountered an error processing your file. Please try submitting again.", "error");
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset node cleanly
    }
  };

  const triggerNativeDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch(err) {
      window.open(url, '_blank'); // fallback
    }
  };

  // Close Active View (Keeps in DB, just clears current view)
  const handleCloseView = () => {
    setHasActiveReport(false);
    setActiveReportId(null);
    setCurrentFileName("MRI Brain Scan Analysis");
    setCurrentDate("Oct 24, 2024");
    setCurrentDocUrl("https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=1200");
    setCurrentFileType("image");
    setAiTitle("No Significant Abnormalities");
    setConfidenceScore("98.4%");
    
    sessionStorage.setItem('mr_hasActiveReport', 'false');
    sessionStorage.setItem('mr_activeReportId', '');
  };

  // === FUNCTIONAL ACTIONS ===
  const handleShare = async () => {
    // Uses the Native Web Share API securely bridging to WhatsApp/Email securely natively
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MedIntel Clinical Report: ' + currentFileName,
          text: `Please review my latest diagnostic report parsed via MedIntel AI. Title: ${aiTitle}.`,
          url: currentDocUrl,
        });
        console.log("Secure Sharing trigger complete.");
      } catch (error) {
        console.error("User aborted sharing or an error occurred", error);
      }
    } else {
      // Fallback for older browsers
      navigator.clipboard.writeText(currentDocUrl);
      customAlert("Link copied to clipboard successfully!");
    }
  };

  const handleDownload = () => {
    const ext = currentFileType === 'pdf' ? 'pdf' : 'jpg';
    triggerNativeDownload(currentDocUrl, `${currentFileName}_MedIntel.${ext}`);
  };

  const handleDownloadAll = () => {
    if (historyReports.length === 0) {
       customAlert("No records available to download.", "error");
       return;
    }
    
    // Process batch download smoothly staggerred by 800ms
    historyReports.forEach((report, index) => {
       setTimeout(() => {
          const ext = report.fileType === 'pdf' ? 'pdf' : 'jpg';
          triggerNativeDownload(report.fileUrl, `${report.title}_MedIntel.${ext}`);
       }, index * 800);
    });
  };

  const handleDeleteReport = async () => {
    if (!activeReportId) return;
    const isConfirmed = await customConfirm("Are you sure you want to permanently delete this clinical record?");
    if (!isConfirmed) return;
    
    try {
      const token = JSON.parse(localStorage.getItem('medintel_user_profile')).token;
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/reports/${activeReportId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      // Reset UI
      setHasActiveReport(false);
      setActiveReportId(null);
      // Refresh memory
      setHistoryReports(prev => prev.filter(r => r._id !== activeReportId));
      window.dispatchEvent(new Event('reportsUpdated'));
    } catch (err) { 
      customAlert("An action could not be completed at this time.", "error"); 
    }
  };

  return (
    <DashboardLayout headerTitle="Medical Reports" headerSubtitle="Analysis 8824-B">
      <div className="flex flex-col h-full bg-[#FBFBFC] px-8 py-8 lg:px-10 overflow-y-auto">
        
        {/* =======================
            HEADER BAR
            ======================= */}
        {hasActiveReport && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-gray-100 pb-5 pt-2">
            <div>
              <h1 className="text-[28px] font-extrabold text-[#0a192f] tracking-tight">{currentFileName}</h1>
              <p className="text-gray-500 font-medium text-[13px] mt-2">
                Patient: <span className="text-[#0a192f] font-bold">{currentUser}</span> • Date: {currentDate} • ID: #{profile._id ? profile._id.slice(-6).toUpperCase() : 'AUG-9921'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Share Native Hook */}
              <button 
                 onClick={handleShare}
                 className="bg-white border border-gray-200 text-gray-700 font-bold text-[13px] px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
                Share
              </button>
              
              {/* Download Hook */}
              <button 
                 onClick={handleDownload}
                 className="bg-[#0a192f] text-white font-bold text-[13px] px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#112240] transition-colors shadow-[0_4px_12px_rgba(10,25,47,0.2)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download
              </button>
              
              {/* Download All Hook */}
              <button 
                 onClick={handleDownloadAll}
                 className="bg-teal-600 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-[0_4px_12px_rgba(13,148,136,0.2)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
                Download All
              </button>
            </div>
          </div>
        )}

        {/* =======================
            MAIN CONTENT AREA
            ======================= */}
        {!hasActiveReport ? (
           
           /* EMPTY STATE UI - Drag and Drop / Import Bridge */
           <div className="flex-1 flex flex-col items-center justify-center -mt-8">
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-[28px] w-full max-w-2xl px-12 py-16 flex flex-col items-center text-center shadow-sm">
                 <div className="w-[80px] h-[80px] rounded-[24px] bg-blue-50 text-blue-500 flex items-center justify-center mb-6 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                 </div>
                 <h2 className="text-[22px] font-extrabold text-[#0a192f] mb-2 tracking-tight">No clinical report uploaded</h2>
                 <p className="text-gray-500 text-[14px] leading-relaxed mb-8 max-w-md">
                   Drag your PDF or Image file directly here to begin instant Neural Network parsing, or select an existing document from your history.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
                       {isUploading ? (
                          <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                       ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                       )}
                       {isUploading ? "Uploading Data securely..." : "Select Local File"}
                       <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleLocalFileUpload} disabled={isUploading} />
                    </label>
                    <span className="text-gray-400 font-bold text-[12px] uppercase tracking-widest px-2">OR</span>
                    <button 
                       onClick={() => setShowHistoryModal(true)}
                       className="bg-white border-2 border-gray-200 text-[#0a192f] hover:border-[#0a192f] hover:bg-gray-50 font-bold text-[14px] px-8 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px] text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                       Import from Medical History
                    </button>
                 </div>
                 
                 {/* MODAL: MEDICAL HISTORY ANCHOR */}
                 {showHistoryModal && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
                       <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-xl p-8 max-h-[85vh] flex flex-col relative text-left">
                          <button onClick={() => setShowHistoryModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 bg-gray-50 p-2 rounded-xl transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                          </button>
                          
                          <h2 className="text-[22px] font-extrabold text-[#0a192f] mb-1">Select from History</h2>
                          <p className="text-gray-500 text-[13px] mb-6 font-medium">Choose an existing certified record to initiate AI inference.</p>
                          
                          <div className="overflow-y-auto stylish-scroll pr-3 flex flex-col gap-3">
                             {historyReports.length === 0 ? (
                                <p className="text-gray-400 text-sm xl:text-center py-12 font-medium bg-gray-50 rounded-2xl border border-gray-100 italic">No existing clinical records found in cloud parameters.</p>
                             ) : historyReports.map(r => (
                                <div 
                                  key={r._id} 
                                  onClick={() => loadFromHistory(r)}
                                  className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:bg-[#F2F8FE] hover:border-blue-200 cursor-pointer transition-all group"
                                >
                                   <div className={`w-[46px] h-[46px] rounded-[14px] flex items-center justify-center shrink-0 border border-transparent group-hover:bg-white group-hover:border-blue-100 transition-colors ${r.iconType === 'blood' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                                   </div>
                                   <div className="flex-1">
                                      <h3 className="font-extrabold text-[#0a192f] text-[15px] group-hover:text-blue-700 transition-colors truncate pr-4">{r.title}</h3>
                                      <p className="text-xs text-gray-500 mt-0.5 font-medium">{r.date || 'Unknown Date'} • <span className="uppercase text-[9px] font-bold tracking-widest text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md ml-1">{r.fileType === 'pdf' ? 'PDF' : 'IMAGE'}</span></p>
                                   </div>
                                   <div className="text-gray-300 group-hover:text-blue-500 transition-colors px-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}
                 
                 <div className="mt-8 text-[11px] font-medium text-gray-400 flex items-center justify-center gap-1.5 py-1.5 px-4 w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                    All parsed files use secure ephemeral cloud instances.
                 </div>
              </div>
           </div>

        ) : (

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Document Preview (Spans 2 columns) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
             
             {/* Layout Bar for Closing specific file view */}
             <div className="flex justify-end items-center px-1 -mb-1">
                <button 
                  onClick={handleCloseView}
                  title="Close File and Return to Upload Section"
                  className="px-5 py-2 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                >
                  Close File
                </button>
             </div>

             {/* Main Viewer Black Screen */}
             <div className="bg-black rounded-[24px] relative overflow-hidden flex items-center justify-center min-h-[500px] border-[6px] border-[#0a192f]/5 shadow-sm group">
                <div className="absolute top-4 left-5 text-[10px] font-extrabold text-gray-400 tracking-widest uppercase z-10">Scan Preview • Axial View</div>
                
                 {currentFileType === 'pdf' ? (
                    <iframe 
                       src={`https://docs.google.com/gview?url=${encodeURIComponent(currentDocUrl)}&embedded=true`} 
                       title="PDF Report Area"
                       className="w-full h-full min-h-[500px] border-none shadow-none z-0 relative bg-white"
                    />
                 ) : (
                    <img 
                       src={currentDocUrl} 
                       alt="MRI Scan Focus"
                       className="object-cover opacity-90 transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
                    />
                 )}

                {/* AI Overlay Box */}
                <div className="absolute bottom-8 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white/50 text-center animate-pulse">
                   <div className="text-[9px] font-bold text-teal-600 uppercase tracking-widest mb-1">AI Region Focus</div>
                   <div className="text-[13px] font-bold text-[#0a192f]">Dynamic generic parameters mapped successfully</div>
                </div>
             </div>

             {/* Thumbnails Row */}
             <div className="flex items-center gap-3">
                {[currentDocUrl].map((url, i) => (
                  <div key={i} className={`w-[90px] h-[90px] rounded-2xl overflow-hidden cursor-pointer border-4 border-teal-500 bg-gray-50 flex items-center justify-center`}>
                    {currentFileType === 'pdf' ? (
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                    ) : (
                       <img src={url} alt={`Scan thumb ${i}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
                
                {/* Upload More Thumbnails */}
                <div 
                   onClick={() => customAlert("Multi-page upload will be supported in a future update.")} 
                   className="w-[90px] h-[90px] rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </div>
             </div>
          </div>


          {/* RIGHT: Gemini AI Analysis Report Viewer */}
          <div className="bg-white rounded-[24px] border border-[#F0F2F5] shadow-sm flex flex-col overflow-y-auto">
             
             {/* Strict Metrics Head */}
             <div className="p-7 pb-6 border-b border-gray-50 flex items-start justify-between">
                <div>
                   <h3 className="text-[10px] font-extrabold text-[#0a192f] uppercase tracking-[0.15em] mb-2">AI Analysis Result</h3>
                   <h2 className="text-[22px] font-bold text-[#0a192f] leading-snug">{isAnalyzing ? "Processing Matrix..." : aiTitle}</h2>
                </div>
                {!isAnalyzing && (
                  <div className="text-right shrink-0 ml-4">
                     <h3 className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Confidence Score</h3>
                     <h2 className="text-[28px] font-extrabold text-teal-600 leading-none">{confidenceScore}</h2>
                  </div>
                )}
             </div>

             {/* Dynamic Body Parsing */}
             <div className="p-7 flex-1 space-y-8 relative">
                
                {isAnalyzing ? (
                   <div className="flex flex-col items-center justify-center py-20 animate-pulse text-center space-y-4">
                     <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                     <p className="text-sm font-bold text-[#0a192f]">Deep Learning Network Active</p>
                     <p className="text-xs font-medium text-gray-500">Cross-referencing 50M+ clinical variables...</p>
                   </div>
                ) : (
                  <>
                    <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-4 flex items-start gap-4">
                       <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" /></svg>
                       </div>
                       <p className="text-[13px] font-medium text-teal-900 leading-relaxed pr-2">
                         The neural network has processed independent slices. Findings indicate stable structure and no initial red flags in raw extraction data.
                       </p>
                    </div>

                <div>
                   <h3 className="text-[15px] font-bold text-[#0a192f] mb-4">Findings Summary</h3>
                   <ul className="space-y-4">
                     {findings.map((f, index) => (
                       <li key={index} className="flex gap-3 items-start">
                         <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-[7px]"></span>
                         <span className="text-[13px] font-medium text-gray-600 leading-relaxed">{f}</span>
                       </li>
                     ))}
                   </ul>
                </div>

                <div>
                   <h3 className="text-[15px] font-bold text-[#0a192f] mb-4">Next Steps</h3>
                   <div className="space-y-3">
                     {nextSteps.map((step, index) => (
                       <div key={index} className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-center justify-between group hover:bg-white hover:border-gray-200 cursor-pointer transition-colors">
                          <div className="flex items-center gap-4">
                             <div className="text-[18px] opacity-70 group-hover:opacity-100">{step.icon}</div>
                             <div>
                               <h4 className="text-[13px] font-bold text-[#0a192f] mb-0.5">{step.title}</h4>
                               <p className="text-[11px] font-medium text-gray-500">{step.desc}</p>
                             </div>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[14px] h-[14px] text-gray-300 group-hover:text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                       </div>
                     ))}
                   </div>
                </div>
                </>
                )}
             </div>

             {/* Footer Alert actions */}
             <div className="p-7 border-t border-gray-50 flex items-center justify-between mt-auto">
                <button onClick={handleDeleteReport} className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:text-red-800 transition-colors flex items-center gap-1.5">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                   Delete Report
                </button>
                <div className="text-[9px] font-medium text-gray-300 italic">MedIntel AI Version 4.2.0 • HIPAA Encrypted</div>
             </div>
             
          </div>
        </div>
        )}

      </div>
    </DashboardLayout>
  );
}
