import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { customAlert, customPrompt } from '../utils/CustomAlert';

// Bahar se saare lambe SVG icons import kar liye taaki code saaf dikhe
import { GridIcon, DocIcon, BrainIcon, BillIcon, SupportIcon, CogIcon, LogoutIcon, BellIcon, HistoryIcon } from '../components/Icons';

/* === 1. Menu Button Component === 
   Sidebar ke buttons ka structure yahan ek baar likha gaya hai,
   taaki niche navigation area mein code aasan aur sidha dikhe.
*/
const SidebarButton = ({ icon: Icon, label, path, isActive, onClick, isDisabled }) => {
  // Agar button active hai (current page hai), toh blue rang lagega, warna simple gray.
  let buttonColors = "text-gray-500 hover:bg-gray-50 hover:text-slate-800";
  if (isActive) buttonColors = "bg-blue-50 text-blue-700";
  if (isDisabled) buttonColors = "text-gray-400 opacity-50 cursor-not-allowed hover:bg-transparent";

  // Agar onClick function diya gaya hai (jaise Logout), toh as a button render kardo warna Link as usual.
  if (onClick || isDisabled) {
    const handleClick = (e) => {
      if (isDisabled) {
        e.preventDefault();
        customAlert("Please complete your profile details before accessing this feature.", "error");
      } else if (onClick) {
        onClick(e);
      }
    };
    return (
      <button onClick={handleClick} className={`w-full flex flex-row items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${buttonColors} text-left`}>
        <Icon />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Link to={path} className={`flex flex-row items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${buttonColors}`}>
      <Icon />
      <span>{label}</span>
    </Link>
  );
};

/* === 2. Main Layout Structure === */
const DashboardLayout = ({ children, headerTitle, headerSubtitle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Dashboard owner ka profile data yahan aayega
  const [profile, setProfile] = useState({
    fullName: "Aditya Prakash Srivastava",
    avatarUrl: "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='24' height='24' fill='%23DFE5E7'/%3E%3Cpath d='M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z' fill='%23FFFFFF'/%3E%3C/svg%3E" // Fallback
  });

  // Load hotay hi data fetch
  useEffect(() => {
    const syncProfile = () => {
      const saved = localStorage.getItem('medintel_user_profile');
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    };

    syncProfile();

    // Listen to Profile settings updates real-time globally
    window.addEventListener('profileUpdated', syncProfile);
    return () => window.removeEventListener('profileUpdated', syncProfile);
  }, []);

  // Secure Local Logout Function (Dashboard se)
  const handleLogout = () => {
    localStorage.removeItem('medintel_auth_status');
    navigate('/login');
  };

  // CHECKING PROFILE COMPLETION STATUS FOR SIDEBAR LOCKDOWN
  const isProfileComplete = profile && profile.fullName && profile.phone && profile.height && profile.weight;

  const [avatarLoading, setAvatarLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // UPLOAD REPORT (NATIVE FILE PICKER TRIGGER)
  const handleUploadNewReportClick = () => {
    if (!isProfileComplete) {
      customAlert("Please complete your profile details before uploading reports.", "error");
      return;
    }
    fileInputRef.current.click();
  };

  // Process File, Send to Cloudinary, Map to Database
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Type Protection (Only Images/PDF)
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      e.target.value = '';
      customAlert("Please upload your document as a PDF or image file (JPG, PNG).", "error");
      return;
    }

    const reportName = await customPrompt("Please enter a title for this clinical document (e.g. Brain MRI):");
    if (!reportName) {
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      // 1. Storage Upload to Cloudinary Pipeline
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/upload`, {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadData.success) throw new Error(uploadData.message || "Failed Cloudinary connection.");
      
      // 2. Database Sync specifically anchoring to Active User (MongoDB)
      const token = JSON.parse(localStorage.getItem('medintel_user_profile') || "{}").token;
      
      // Dynamic Date
      const exactDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
      
      const dbRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: reportName,
          date: exactDate,
          iconType: file.type === 'application/pdf' ? 'doc' : 'blood',
          fileUrl: uploadData.fileUrl,
          cloudinaryId: uploadData.publicId,
          fileType: file.type.includes('pdf') ? 'pdf' : 'image'
        })
      });
      
      if (dbRes.ok) {
        window.dispatchEvent(new Event('reportsUpdated'));
      } else {
        const errJson = await dbRes.json();
        throw new Error(errJson.message);
      }
    } catch (error) {
      customAlert("We encountered an issue uploading your file. Please try again.", "error");
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset the input block completely
    }
  };

  return (
    // Pura page screen ke barabar (`h-screen`) fix rahega aur chipkega nahi.
    <div className="flex flex-row h-screen bg-[#FBFBFC] overflow-hidden font-sans text-slate-800">

      {/* =========================================
          LEFT SIDEBAR AREA
      ============================================= */}
      <aside className="w-64 flex flex-col border-r border-gray-100 bg-white shadow-sm z-30 shrink-0">

        {/* User ka Profile Aur Status Sidebar Ke Top Par */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shrink-0 overflow-hidden ${avatarLoading ? 'bg-gray-200' : 'bg-blue-600'}`}>
               <img src={profile.avatarUrl} alt="User" className={`w-full h-full object-cover transition-opacity duration-300 ${avatarLoading ? 'opacity-0' : 'opacity-100'}`} onLoad={() => setAvatarLoading(false)} />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-sm text-slate-900 truncate">{profile.fullName || "Loading..."}</h3>
              <p className="text-xs text-blue-600 font-bold mt-0.5" style={{ fontSize: "11px" }}>Clinical User</p>
            </div>
          </div>
        </div>

        {/* Beech Ke Menu Links */}
        <nav className="flex-1 px-4 pt-6 space-y-1 overflow-y-auto">
          <SidebarButton icon={GridIcon} label="Overview" path="/dashboard" isActive={location.pathname === '/dashboard'} isDisabled={!isProfileComplete} />
          <SidebarButton icon={DocIcon} label="Medical Reports" path="/reports" isActive={location.pathname === '/reports'} isDisabled={!isProfileComplete} />
          <SidebarButton icon={HistoryIcon} label="Medical History" path="/history" isActive={location.pathname === '/history'} isDisabled={!isProfileComplete} />
          <SidebarButton icon={BrainIcon} label="AI Health Insights" path="/insights" isActive={location.pathname === '/insights'} isDisabled={!isProfileComplete} />
          <SidebarButton icon={BillIcon} label="Billing" path="/billing" isActive={location.pathname === '/billing'} isDisabled={!isProfileComplete} />
        </nav>

        {/* Niche Wala Menu (Settings & Logout) */}
        <div className="px-4 py-6 mt-auto border-t border-gray-100 bg-white flex flex-col gap-2">
          
          {/* UPLOAD NEW REPORT BUTTON */}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" className="hidden" />
          <button onClick={handleUploadNewReportClick} disabled={isUploading} className="w-full bg-[#0a192f] hover:bg-[#112240] text-white flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[13px] font-bold shadow-md mb-2 transition-colors disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
            </svg>
            {isUploading ? "Syncing..." : "Upload New Report"}
          </button>

          <SidebarButton icon={CogIcon} label="Account Settings" path="/profile" isActive={location.pathname === '/profile'} />
          {/* Ye function trigger karega handleLogout ko! */}
          <SidebarButton icon={LogoutIcon} label="Logout" isActive={false} onClick={handleLogout} />
        </div>
      </aside>

      {/* =========================================
          RIGHT MAIN CONTENT AREA
          ========================================= */}
      <div className="flex-1 flex flex-col h-full min-w-0">

        {/* Upar Wala Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">

          {/* Breadcrumbs (e.g. Aura Health AI / Account Settings) */}
          <div className="flex items-center gap-3 text-sm font-semibold text-gray-400">
            <span className="text-slate-800">{headerTitle}</span>
            <span>/</span>
            <span>{headerSubtitle}</span>
          </div>

          {/* Right side me Profile Info aur Notification */}
          <div className="flex flex-row items-center gap-6">
            <button className="text-gray-400 hover:text-slate-900 transition-colors">
              <BellIcon />
            </button>
            <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
               <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer text-right">
                <div>
                  {/* Dynamically reading data directly from LocalStorage! */}
                  <p className="text-sm font-bold text-slate-900">{profile.fullName}</p>
                  <div className="flex justify-end">
                    <p className="text-[9px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 mt-0.5 rounded-full tracking-widest uppercase border border-teal-100 shadow-sm w-fit flex items-center gap-1">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" /></svg>
                       STANDARD PLAN
                    </p>
                  </div>
                </div>
                <img
                  src={profile.avatarUrl} // Dynamic Photo!
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full object-cover shadow-sm ml-1 ring-2 ring-transparent hover:ring-teal-100 transition-all"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Jo bhi naya page khulega (Profile ya Reports), wo yahan beech mein render hoga */}
        <main className="flex-1 overflow-y-auto px-10 py-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
