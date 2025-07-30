import React, { useState, useRef } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Header from "../../Common/Header";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both user name and password.");
      return;
    }
    setError("");
    // For now, just log the credentials
    console.log("Login submitted:", { username, password });
    if (onLogin) onLogin();
    navigate("/fabric-entry");
  };

  return (
    <div className="flex justify-center items-center bg-white top-0 left-0 w-full ">
      <div className="max-w-[380px] w-[380px] p-0 border-2 border-[#bfc9d1] rounded-lg bg-[#e9ecef] shadow-md text-center">
        <Header title="Swissfort Mfg." customStyle="rounded-t-lg min-h-[30px] py-1 px-3" />
        <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6">
          <div className="flex justify-center gap-6 mb-6">
            <div className="flex flex-col items-start">
              <label htmlFor="username" className="font-bold text-lg text-gray-500 mb-1">User Name</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-28 px-2 py-1.5 text-base rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
                autoComplete="username"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    passwordRef.current?.focus();
                  }
                }}
              />
            </div>
            <div className="flex flex-col items-start relative">
              <label htmlFor="password" className="font-bold text-lg text-gray-500 mb-1">Password</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-28 px-2 py-1.5 text-base rounded border border-gray-300 pr-8 focus:outline-none focus:ring-2 focus:ring-sky-300"
                autoComplete="current-password"
                ref={passwordRef}
              />
              <span
                onClick={() => setShowPassword((v) => !v)}
                className={`absolute right-2 top-10 cursor-pointer select-none text-lg ${showPassword ? 'text-sky-600' : 'text-gray-400'}`}
                title={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
                role="button"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>
          {error && <div className="text-red-600 mb-3 text-base">{error}</div>}
          <button
            type="submit"
            className="w-60 py-3 text-xl font-bold bg-[#bfc9d1] text-[#222] border border-[#bfc9d1] rounded mt-2 shadow-sm hover:bg-[#c9d6e2] transition-colors"
          >
            OK
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login; 