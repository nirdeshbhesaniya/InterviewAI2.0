import React, { useState, useEffect } from 'react';
import { MonitorX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DesktopOnlyGuard = ({ children, featureName = "this feature" }) => {
  // Use a slightly larger breakpoint like 1024 (lg) for tests/interviews so tablets are okay but real mobile forms are blocked?
  // User says "mobile size view", typically < 768px.
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="bg-[rgb(var(--bg-card))] p-8 rounded-3xl shadow-xl border border-[rgb(var(--border))] max-w-sm w-full mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500"></div>
          
          <div className="w-20 h-20 bg-[rgb(var(--accent))]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[rgb(var(--accent))]">
            <MonitorX size={40} className="drop-shadow-sm" />
          </div>
          
          <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-3">
            Mobile Restricted
          </h2>
          
          <p className="text-[rgb(var(--text-secondary))] leading-relaxed text-[15px] mb-8">
            Please open <span className="font-semibold text-[rgb(var(--text-primary))]">{" " + featureName + " "}</span> in your laptop or computer to feel better and experience the real environment optimally.
          </p>
          
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-3.5 bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--accent))]/10 text-[rgb(var(--text-primary))] hover:text-[rgb(var(--accent))] rounded-xl font-medium transition-all duration-300 border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))]/30 flex items-center justify-center gap-2"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default DesktopOnlyGuard;
