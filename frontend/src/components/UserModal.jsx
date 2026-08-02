import React, { useState, useEffect } from 'react';

export default function UserModal({ editUser, token, onClose, onSuccess, showToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const isEdit = !!editUser;

  useEffect(() => {
    if (editUser) {
      setName(editUser.name || '');
      setEmail(editUser.email || '');
      setRole(editUser.role || 'student');
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setRole('student');
      setPassword('');
    }
  }, [editUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, email, role };
    
    if (password) {
      payload.password = password;
    } else if (!isEdit) {
      showToast('Password is required for new users', 'error');
      return;
    }

    const url = isEdit ? `/api/users/${editUser._id}` : '/api/users';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save user');

      showToast(isEdit ? 'User updated successfully!' : 'User created successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md z-50">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold font-outfit text-lg text-slate-900 dark:text-white">{isEdit ? 'Edit User Details' : 'Create New User'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-2xl line-height-1">&times;</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe" 
              required 
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com" 
              required 
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Password {isEdit ? '(Leave blank to keep current)' : ''}
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? '••••••••' : 'Password (Min 8 chars)'}
              required={!isEdit}
              minLength={8}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Platform Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition appearance-none bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%239ca3af%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.85rem_center] bg-no-repeat pr-10"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200/50 dark:border-slate-800/50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow"
            >
              Save User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
