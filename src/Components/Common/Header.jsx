import React from "react";

function Header({ title, customStyle = "" }) {
  return (
    <header
      className={`sticky top-0 z-40 bg-sky-300 flex items-center justify-between ${customStyle}`}
    >
      <img src="/vite.svg" alt="Logo" className="h-5 object-contain" />
      <div className="font-bold text-[18px] text-black">{title}</div>
      <div className="flex items-center gap-2.5">
        {/* Placeholder logo: can replace src with your logo */}
        
        <span className="font-bold text-lg text-black tracking-wide">Login</span>
      </div>
    </header>
  );
}

export default Header; 