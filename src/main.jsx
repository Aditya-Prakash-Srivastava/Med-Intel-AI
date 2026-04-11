import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

// 🛡️ User ka generated active Google Auth ID yahan inject kar diya gaya hai
const GOOGLE_CLIENT_ID = "3335446989-4ketf9k6js48r1djb8atnjv3v6886pd9.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
