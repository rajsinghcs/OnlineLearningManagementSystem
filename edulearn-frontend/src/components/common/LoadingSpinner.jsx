import React from 'react';

const LoadingSpinner = ({ fullPage }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-8 p-12">
      <div className="relative">
        {/* Futuristic Hexagonal/Circular Spinner */}
        <div className="h-24 w-24 rounded-3xl border-t-2 border-b-2 border-[#3b82f6] animate-spin shadow-[0_0_30px_rgba(59,130,246,0.3)]"></div>
        <div className="absolute top-0 left-0 h-24 w-24 rounded-3xl border-l-2 border-r-2 border-indigo-500/20 animate-pulse"></div>
        
        {/* Center Sparkle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#3b82f6] rounded-full blur-[2px] animate-ping"></div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-white text-xs font-black uppercase tracking-[0.5em] animate-pulse">Syncing Network</p>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">Authenticating Node _</p>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-[#020617] z-[9999] flex items-center justify-center overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[400px] w-full">
      {content}
    </div>
  );
};

export default LoadingSpinner;
