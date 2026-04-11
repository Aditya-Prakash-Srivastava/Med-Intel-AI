import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// === ICONS ===
const NotificationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);


const Navbar = () => {
  const navigate = useNavigate();
  // Dropdown open/close state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Auth state taaki pata chale User login hai ya nahi
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Profile details lane ke liye (photo wgaira)
  const [profile, setProfile] = useState({
    fullName: "Guest User",
    email: "Not signed in",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" // Default guest photo
  });

  // Jab Navbar load ho toh data localStorage se check karein (jaise hi page khule)
  useEffect(() => {
    const syncAuth = () => {
      const authStatus = localStorage.getItem('medintel_auth_status');
      if (authStatus === 'logged_in') {
        setIsLoggedIn(true);
        const savedProfile = localStorage.getItem('medintel_user_profile');
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile)); // User ka asol data aur photo nikal lo!
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    syncAuth(); // First run on mount
    
    // Custom event listener for global cross-component real-time updates!
    window.addEventListener('profileUpdated', syncAuth);
    return () => window.removeEventListener('profileUpdated', syncAuth);
  }, []);

  // Action: Logout
  const handleLogout = () => {
    localStorage.removeItem('medintel_auth_status'); // Session clean
    localStorage.removeItem('medintel_user_profile');
    setIsLoggedIn(false);
    setIsDropdownOpen(false); // Dropdown band kardo
    window.dispatchEvent(new Event('profileUpdated')); // Global sync clear
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">

        {/* Logo and Right Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="font-bold text-xl text-slate-900 tracking-tight">
            MedIntel AI
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-500">
            {isLoggedIn ? (
               <>
                 <Link to="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
                 <Link to="/reports" className="hover:text-slate-900 transition-colors">Reports</Link>
                 <Link to="/insights" className="hover:text-slate-900 transition-colors">Insights</Link>
                 <Link to="/billing" className="hover:text-slate-900 transition-colors">Premium</Link>
               </>
            ) : (
               <>
                 <button onClick={() => alert('Please sign in to access your Dashboard')} className="opacity-50 cursor-not-allowed hover:text-slate-900 transition-colors">Dashboard</button>
                 <button onClick={() => alert('Please sign in to access Medical Reports')} className="opacity-50 cursor-not-allowed hover:text-slate-900 transition-colors">Reports</button>
                 <button onClick={() => alert('Please sign in to access AI Health Insights')} className="opacity-50 cursor-not-allowed hover:text-slate-900 transition-colors">Insights</button>
                 <button onClick={() => alert('Please sign in to view Premium Subscriptions')} className="opacity-50 cursor-not-allowed hover:text-slate-900 transition-colors">Premium</button>
               </>
            )}
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4 text-gray-500">
          <button className="hover:text-slate-900 transition-colors">
            <NotificationIcon />
          </button>

          <button className="hover:text-slate-900 transition-colors">
            <SettingsIcon />
          </button>

          {/* Profile Dropdown Area (Right side relative container) */}
          <div className="relative ml-2">
            
            {/* Round Avatar Button jispe click karne se Dropdown khulega (Bina redirect ke) */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 hover:ring-2 hover:ring-teal-500 hover:ring-offset-2 transition-all cursor-pointer focus:outline-none block"
              title="User Menu"
            >
              <img
                src={profile.avatarUrl} // Dynamic URL
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>

            {/* DROPDOWN MENU KHOLEGA AGAR isDropdownOpen TRUE HAI TAI */}
            {isDropdownOpen && (
              <div className="absolute top-12 right-0 w-60 bg-white border border-gray-100 shadow-xl rounded-2xl p-2 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                
                {/* 1. Agar User Login nahi hai */}
                {!isLoggedIn && (
                  <div className="flex flex-col">
                    <div className="px-3 pt-2 pb-3 mb-2 border-b border-gray-50">
                      <p className="text-sm font-bold text-slate-900">Welcome to MedIntel AI</p>
                      <p className="text-xs text-gray-500 font-medium">Please sign in to access data.</p>
                    </div>
                    <Link to="/login" className="px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-xl transition-colors">Log In</Link>
                    <Link to="/signup" className="px-4 py-2.5 text-sm font-semibold text-teal-700 bg-teal-50/50 hover:bg-teal-50 rounded-xl transition-colors mt-1">Create Free Account</Link>
                  </div>
                )}

                {/* 2. Agar User Login Hai */}
                {isLoggedIn && (
                  <div className="flex flex-col">
                    <div className="px-3 pt-2 pb-3 mb-2 border-b border-gray-50">
                      <p className="text-sm font-bold text-slate-900 truncate">{profile.fullName}</p>
                      <p className="text-xs text-gray-400 font-medium truncate">{profile.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Dashboard & Settings</Link>
                    <button onClick={handleLogout} className="text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1">
                      Log Out
                    </button>
                  </div>
                )}

              </div>
            )}
            {/* Dropdown End */}
            
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
