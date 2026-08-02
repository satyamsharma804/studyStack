import React, { useState, useEffect } from 'react';

export default function CourseModal({ course, token, onClose, onSuccess, showToast }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [instructor, setInstructor] = useState('');
  const [image, setImage] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const isEdit = !!course;

  useEffect(() => {
    if (course) {
      setTitle(course.title || '');
      setPrice(course.price || '');
      setInstructor(course.instructor || '');
      setImage(course.image || '');
    } else {
      setTitle('');
      setPrice('');
      setInstructor('');
      setImage('');
    }
  }, [course]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    showToast('Uploading image from device...', 'success');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setImage(data.imageUrl);
      showToast('Image uploaded successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title, price: Number(price), instructor, image };
    const url = isEdit ? `/api/courses/${course._id}` : '/api/courses';
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

      if (!res.ok) throw new Error(data.error || 'Failed to save course');

      showToast(isEdit ? 'Course updated successfully!' : 'Course created successfully!', 'success');
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
          <h3 className="font-extrabold font-outfit text-lg text-slate-900 dark:text-white">{isEdit ? 'Edit Course Details' : 'Add New Course'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-2xl line-height-1">&times;</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Course Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Full Stack Web Development" 
              required 
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Price ($)</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 99" 
              min="0"
              required 
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Instructor Name</label>
            <input 
              type="text" 
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="e.g. Dr. Jane Smith" 
              required 
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Course Background Image</label>
            <div className="flex flex-col gap-2.5 p-3.5 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileUpload}
                className="text-xs text-slate-500 file:mr-3.5 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700 cursor-pointer transition"
              />
              <div className="relative text-center my-1 text-[10px] font-bold text-slate-450 uppercase">
                <span className="bg-slate-50 dark:bg-slate-950 px-2 relative z-1">OR</span>
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-200 dark:bg-slate-800/80"></div>
              </div>
              <input 
                type="text" 
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Enter image URL directly..." 
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition"
              />
            </div>
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
              disabled={uploading}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-650 rounded-xl transition shadow"
            >
              Save Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
