import React, { useState, useEffect } from 'react';

export default function Dashboard({ user, token, showToast, openCourseModal, openUserModal, activeTab, setActiveTab }) {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const isInstructor = user && user.role === 'instructor';

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const res = await fetch('/api/courses');
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!isInstructor) return;
    setUsersLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    if (isInstructor) {
      fetchUsers();
    }
  }, [token, user]);

  const handleDeleteCourse = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete course');
      showToast('Course deleted successfully.', 'success');
      fetchCourses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete user');
      showToast('User deleted successfully.', 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEnroll = (course) => {
    showToast(`Successfully enrolled in ${course.title}!`, 'success');
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics calculations
  const avgPrice = courses.length 
    ? Math.round(courses.reduce((sum, c) => sum + Number(c.price || 0), 0) / courses.length) 
    : 0;

  const uniqueInstructors = new Set(courses.map(c => c.instructor)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <main className="w-full">
        
        {/* COURSES TAB */}
        {activeTab === 'courses' && (
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white tracking-tight">Courses</h1>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1.5 font-medium">{courses.length} course{courses.length !== 1 ? 's' : ''} available</p>
              </div>
              {isInstructor && (
                <button 
                  onClick={() => openCourseModal(null, fetchCourses)}
                  className="flex items-center gap-2 px-4.5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-95 rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <i className="fa-solid fa-plus text-sm"></i> Add Course
                </button>
              )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {/* Total Courses */}
              <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl shadow-sm">
                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <i className="fa-solid fa-book text-lg"></i>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{courses.length}</div>
                  <div className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Courses</div>
                </div>
              </div>

              {/* Avg Price */}
              <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl shadow-sm">
                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <i className="fa-solid fa-dollar-sign text-lg"></i>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">₹{avgPrice.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Avg Price</div>
                </div>
              </div>

              {/* Instructors */}
              <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl shadow-sm">
                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <i className="fa-solid fa-user-tie text-lg"></i>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{uniqueInstructors}</div>
                  <div className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Instructors</div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-450"></i>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses by title or instructor..."
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition shadow-sm"
              />
            </div>

            {coursesLoading ? (
              <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="w-9 h-9 border-[3.5px] border-slate-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fetching courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <i className="fa-solid fa-book-open-reader text-4xl text-slate-350 dark:text-slate-650 mb-3.5"></i>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No courses found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Try searching for something else or add a new course.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <div key={course._id} className="relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition duration-300 transform hover:-translate-y-1">
                    
                    {/* Actions (Top Right Overlay) */}
                    {isInstructor && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                        <button 
                          onClick={() => openCourseModal(course, fetchCourses)}
                          className="w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/30 dark:border-slate-700/30 rounded-lg text-xs font-semibold shadow-sm transition"
                          title="Edit Course"
                        >
                          <i className="fa-regular fa-edit text-xs text-indigo-500"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteCourse(course._id)}
                          className="w-8 h-8 flex items-center justify-center bg-rose-50/90 hover:bg-rose-600 dark:bg-rose-950/90 dark:hover:bg-rose-600 text-rose-600 dark:text-rose-455 hover:text-white border border-rose-250/20 dark:border-rose-900/10 rounded-lg text-xs font-semibold shadow-sm transition"
                          title="Delete Course"
                        >
                          <i className="fa-regular fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    )}

                    {/* Course Background Image Banner */}
                    <div 
                      className="h-[140px] bg-cover bg-center bg-no-repeat bg-slate-100 dark:bg-slate-800 border-b border-slate-200/50 dark:border-slate-800/50"
                      style={{ backgroundImage: `url('${course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'}')` }}
                    ></div>

                    {/* Details Body */}
                    <div className="flex-1 flex flex-col p-5">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5 tracking-tight line-clamp-1">{course.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
                        <i className="fa-regular fa-user text-indigo-500"></i>
                        <span>{course.instructor}</span>
                      </div>

                      {/* Pricing & Footer Information */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                          ₹{Number(course.price || 0).toLocaleString()}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && isInstructor && (
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white tracking-tight">Users</h1>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1.5 font-medium">{users.length} registered users</p>
              </div>
              <button 
                onClick={() => openUserModal(null, fetchUsers)}
                className="flex items-center gap-2 px-4.5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-95 rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <i className="fa-solid fa-plus text-sm"></i> Add User
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl shadow-sm">
                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <i className="fa-solid fa-users text-lg"></i>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{users.length}</div>
                  <div className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Users</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl shadow-sm">
                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <i className="fa-solid fa-user-graduate text-lg"></i>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {users.filter(u => u.role === 'student').length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Students</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl shadow-sm">
                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <i className="fa-solid fa-chalkboard-user text-lg"></i>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {users.filter(u => u.role === 'instructor').length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Instructors</div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-450"></i>
              <input 
                type="text" 
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition shadow-sm"
              />
            </div>

            {usersLoading ? (
              <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="w-9 h-9 border-[3.5px] border-slate-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fetching users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <i className="fa-solid fa-users-slash text-4xl text-slate-350 dark:text-slate-650 mb-3.5"></i>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No users found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Register new members using the button above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {users
                  .filter(u => 
                    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                  )
                  .map(u => {
                    const initials = u.name
                      .split(' ')
                      .map(n => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();
                    
                    const avatarBg = u.role === 'instructor' 
                      ? 'from-emerald-450 to-teal-500 dark:from-emerald-500 dark:to-teal-600 shadow-emerald-500/10'
                      : initials.charCodeAt(0) % 2 === 0
                        ? 'from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 shadow-purple-500/10'
                        : 'from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 shadow-indigo-500/10';

                    return (
                      <div key={u._id} className="flex items-center gap-4.5 p-4.5 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition duration-200 relative group">
                        
                        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl text-white font-extrabold text-sm shadow-md bg-gradient-to-tr ${avatarBg}`}>
                          {initials}
                        </div>

                        <div className="flex-1 min-w-0 pr-16">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{u.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                            <i className="fa-regular fa-envelope text-slate-400"></i>
                            <span className="truncate">{u.email}</span>
                          </div>
                          <div className="mt-2.5">
                            <span className="inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border border-slate-250/20 dark:border-slate-700/50 text-slate-650 dark:text-slate-350 rounded-md">
                              {u.role}
                            </span>
                          </div>
                        </div>

                        <div className="absolute right-4.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button 
                            onClick={() => openUserModal(u, fetchUsers)}
                            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-200/30 dark:border-slate-700/30 rounded-lg text-xs font-semibold transition"
                            title="Edit User"
                          >
                            <i className="fa-regular fa-edit text-xs text-indigo-500"></i>
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            className="w-8 h-8 flex items-center justify-center bg-rose-50 hover:bg-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-600 text-rose-600 dark:text-rose-455 hover:text-white border border-rose-250/20 dark:border-rose-900/10 rounded-lg text-xs font-semibold transition"
                            title="Delete User"
                          >
                            <i className="fa-regular fa-trash-can text-xs"></i>
                          </button>
                        </div>

                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
