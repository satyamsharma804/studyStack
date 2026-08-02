import React, { useState } from 'react';

export default function Auth({ setAuth, showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('student');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuth(data.token, data.user);
      showToast('Logged in successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, role: regRole })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuth(data.token, data.user);
      showToast('Account created successfully! Welcome to StudyStack.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center p-4">
      <div className="w-full max-w-[430px] rounded-3xl border border-slate-200/60 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl transition-all duration-300">
        
        {isLogin ? (
          <div>
            <div className="text-center mb-7">
              <h2 className="text-3xl font-extrabold font-outfit tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Welcome Back</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Access your courses and stack up your knowledge</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <i className="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type="email" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com" 
                    required 
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type="password" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••" 
                    required 
                    minLength={8}
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition duration-200"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 mt-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transform hover:-translate-y-0.5"
              >
                Sign In <i className="fa-solid fa-arrow-right ml-1"></i>
              </button>
            </form>

            <div className="text-center mt-7 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <p>Don't have an account? <a href="#" onClick={() => setIsLogin(false)} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Create an account</a></p>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-7">
              <h2 className="text-3xl font-extrabold font-outfit tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Create Account</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Join StudyStack and jumpstart your learning</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <i className="fa-regular fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type="text" 
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="John Doe" 
                    required 
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <i className="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type="email" 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com" 
                    required 
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type="password" 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••" 
                    required 
                    minLength={8}
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 uppercase tracking-wider mb-2">Select Your Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegRole('student')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl border text-xs font-bold transition duration-200 ${regRole === 'student' ? 'border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-500/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-500 dark:text-slate-400'}`}
                  >
                    <i className="fa-solid fa-user-graduate text-base"></i>
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('instructor')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl border text-xs font-bold transition duration-200 ${regRole === 'instructor' ? 'border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-500/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-500 dark:text-slate-400'}`}
                  >
                    <i className="fa-solid fa-chalkboard-user text-base"></i>
                    <span>Instructor</span>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 mt-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transform hover:-translate-y-0.5"
              >
                Register <i className="fa-solid fa-user-plus ml-1"></i>
              </button>
            </form>

            <div className="text-center mt-7 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <p>Already have an account? <a href="#" onClick={() => setIsLogin(true)} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Sign In</a></p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
