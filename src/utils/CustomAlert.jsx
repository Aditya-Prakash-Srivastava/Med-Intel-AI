import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const ModalWrapper = ({ children }) => (
  <div className="fixed inset-0 flex items-center justify-center z-9999 bg-slate-900/50 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-[zoom-in_0.2s_ease-out]">
      {children}
    </div>
  </div>
);

const AlertUI = ({ message, type, onClose }) => {
  const isError = type === 'error';
  return (
    <ModalWrapper>
      <div className={`px-5 py-4 border-b flex items-center gap-3 ${isError ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
        {isError ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
             <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
        )}
        <h3 className="font-bold text-sm tracking-wide">{isError ? 'Notice' : 'Information'}</h3>
      </div>
      <div className="p-6 text-slate-700 text-[14px] font-medium leading-relaxed">
        {message}
      </div>
      <div className="p-4 bg-gray-50 flex justify-end">
        <button onClick={onClose} className="px-6 py-2 bg-[#0a192f] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(10,25,47,0.2)] hover:bg-[#112240] transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none">
          Got it
        </button>
      </div>
    </ModalWrapper>
  );
};

const PromptUI = ({ message, defaultValue = '', onSubmit, onClose }) => {
  const [val, setVal] = useState(defaultValue);
  return (
    <ModalWrapper>
      <div className="px-5 py-4 border-b bg-teal-50 border-teal-100 text-teal-700 flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
        </svg>
        <h3 className="font-bold text-sm tracking-wide">Input Required</h3>
      </div>
      <div className="p-6">
        <p className="text-slate-700 text-[14px] font-medium mb-3">{message}</p>
        <input 
          autoFocus 
          value={val} 
          onChange={e => setVal(e.target.value)} 
          onKeyDown={(e) => { if(e.key === 'Enter') { onSubmit(val); onClose(); } }}
          className="w-full px-4 py-2.5 bg-[#F1F5F9] border-none rounded-xl text-[14px] text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all shadow-inner" 
        />
      </div>
      <div className="p-4 bg-gray-50 flex justify-end gap-3">
        <button onClick={onClose} className="px-5 py-2 text-slate-500 text-[13px] font-bold hover:bg-gray-200 rounded-xl transition-colors focus:outline-none">
          Cancel
        </button>
        <button onClick={() => { onSubmit(val); onClose(); }} className="px-6 py-2 bg-teal-600 text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(13,148,136,0.2)] hover:bg-teal-700 transition-colors focus:ring-2 focus:ring-teal-500 focus:outline-none">
          Submit
        </button>
      </div>
    </ModalWrapper>
  );
};

const ConfirmUI = ({ message, onConfirm, onCancel }) => {
  return (
    <ModalWrapper>
      <div className="px-5 py-4 border-b bg-orange-50 border-orange-100 text-orange-700 flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
           <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
        </svg>
        <h3 className="font-bold text-sm tracking-wide">Confirmation Required</h3>
      </div>
      <div className="p-6 text-slate-700 text-[14px] font-medium leading-relaxed">
        {message}
      </div>
      <div className="p-4 bg-gray-50 flex justify-end gap-3">
        <button onClick={onCancel} className="px-5 py-2 text-slate-500 text-[13px] font-bold hover:bg-gray-200 rounded-xl transition-colors focus:outline-none">
          Cancel
        </button>
        <button onClick={onConfirm} className="px-6 py-2 bg-orange-600 text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(234,88,12,0.2)] hover:bg-orange-700 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none">
          Yes, Proceed
        </button>
      </div>
    </ModalWrapper>
  );
};

let activeRoot = null;
let activeDiv = null;

const cleanup = () => {
  if (activeRoot) {
    activeRoot.unmount();
    activeRoot = null;
  }
  if (activeDiv) {
    activeDiv.remove();
    activeDiv = null;
  }
};

const setupRoot = () => {
  cleanup();
  activeDiv = document.createElement('div');
  document.body.appendChild(activeDiv);
  activeRoot = createRoot(activeDiv);
  return activeRoot;
};

export const customAlert = (message, type = 'info') => {
  const root = setupRoot();
  root.render(<AlertUI message={message} type={type} onClose={cleanup} />);
};

export const customPrompt = (message, defaultValue = '') => {
  return new Promise((resolve) => {
    const root = setupRoot();
    const handleClose = () => { cleanup(); resolve(null); };
    const handleSubmit = (val) => { cleanup(); resolve(val); };
    root.render(<PromptUI message={message} defaultValue={defaultValue} onSubmit={handleSubmit} onClose={handleClose} />);
  });
};

export const customConfirm = (message) => {
  return new Promise((resolve) => {
    const root = setupRoot();
    const handleCancel = () => { cleanup(); resolve(false); };
    const handleConfirm = () => { cleanup(); resolve(true); };
    root.render(<ConfirmUI message={message} onConfirm={handleConfirm} onCancel={handleCancel} />);
  });
};
