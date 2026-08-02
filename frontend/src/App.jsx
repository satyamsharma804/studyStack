import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import CourseModal from './components/CourseModal';
import UserModal from './components/UserModal';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Modals state
  const [courseModal, setCourseModal] = useState({ open: false, course: null, callback: null });
  const [userModal, setUserModal] = useState({ open: false, editUser: null, callback: null });

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Active Tab state for navigation
  const [activeTab, setActiveTab] = useState('courses');

  // Theme side effects
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'success');
      return nextTheme;
    });
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Automatically clear toasts after 3.5s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAuth = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.');
  };

  const openCourseModal = (course = null, callback = null) => {
    setCourseModal({ open: true, course, callback });
  };

  const openUserModal = (editUser = null, callback = null) => {
    setUserModal({ open: true, editUser, callback });
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans overflow-x-hidden">
      
      {/* Aurora floating blurred glows */}
      <div className="absolute top-0 right-[10%] w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse duration-[6000ms]"></div>
      <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse duration-[8000ms]"></div>

      {/* Toast Alerts */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl font-medium text-sm shadow-xl border bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-300 transform scale-100 animate-in fade-in slide-in-from-top-6 ${
          toast.type === 'success' 
            ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/5' 
            : 'border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-rose-500/5'
        }`}>
          {toast.type === 'success' ? (
            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <i className="fa-solid fa-check text-xs"></i>
            </div>
          ) : (
            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <i className="fa-solid fa-triangle-exclamation text-xs"></i>
            </div>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/75 dark:bg-slate-950/75 border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 text-xl font-bold tracking-tight select-none">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                <i className="fa-solid fa-graduation-cap text-base"></i>
              </div>
              <span className="font-outfit text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
                Study<span className="text-indigo-600 dark:text-indigo-400">Stack</span>
              </span>
            </div>

            {token && user && (
              <nav className="flex items-center gap-1.5 ml-4">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
                    activeTab === 'courses' 
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Courses
                </button>
                {user.role === 'instructor' && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
                      activeTab === 'users' 
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Users
                  </button>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="w-9.5 h-9.5 flex items-center justify-center border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition duration-200"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <i className="fa-regular fa-sun text-base animate-spin-slow"></i>
              ) : (
                <i className="fa-regular fa-moon text-base"></i>
              )}
            </button>

            {token && user && (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 text-xs font-semibold rounded-full border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm animate-in fade-in duration-200">
                  <i className="fa-solid fa-circle-user text-indigo-500 text-sm"></i>
                  <span>{user.name}</span>
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] uppercase rounded-md font-bold tracking-wider">
                    {user.role}
                  </span>
                </span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200/50 dark:border-slate-800/50 transition"
                >
                  <i className="fa-solid fa-right-from-bracket"></i> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="py-4">
        {token && user ? (
          <Dashboard 
            user={user} 
            token={token} 
            showToast={showToast} 
            openCourseModal={openCourseModal}
            openUserModal={openUserModal}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        ) : (
          <Auth setAuth={handleAuth} showToast={showToast} />
        )}
      </main>

      {/* Course Modal */}
      {courseModal.open && (
        <CourseModal 
          course={courseModal.course}
          token={token}
          onClose={() => setCourseModal({ open: false, course: null, callback: null })}
          onSuccess={courseModal.callback}
          showToast={showToast}
        />
      )}

      {/* User Modal */}
      {userModal.open && (
        <UserModal 
          editUser={userModal.editUser}
          token={token}
          onClose={() => setUserModal({ open: false, editUser: null, callback: null })}
          onSuccess={userModal.callback}
          showToast={showToast}
        />
      )}

    </div>
  );
}
