// Application State
let state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  courses: [],
  users: [],
  currentTab: 'courses'
};

// UI Elements
const toast = document.getElementById('toast');
const headerNav = document.getElementById('headerNav');
const userNameDisplay = document.getElementById('userName');
const userRoleDisplay = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');

const authSection = document.getElementById('authSection');
const loginFormContainer = document.getElementById('loginFormContainer');
const registerFormContainer = document.getElementById('registerFormContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toRegister = document.getElementById('toRegister');
const toLogin = document.getElementById('toLogin');

const dashboardSection = document.getElementById('dashboardSection');
const tabLinks = document.querySelectorAll('.nav-link');
const tabPanes = document.querySelectorAll('.tab-pane');
const instructorElements = document.querySelectorAll('.instructor-only');

// Course Panel Elements
const coursesGrid = document.getElementById('coursesGrid');
const coursesLoading = document.getElementById('coursesLoading');
const coursesEmpty = document.getElementById('coursesEmpty');
const courseSearch = document.getElementById('courseSearch');
const addCourseBtn = document.getElementById('addCourseBtn');
const courseModal = document.getElementById('courseModal');
const courseForm = document.getElementById('courseForm');
const courseModalTitle = document.getElementById('courseModalTitle');
const closeCourseModalBtn = document.getElementById('closeCourseModalBtn');
const cancelCourseBtn = document.getElementById('cancelCourseBtn');

// User Panel Elements
const usersTableBody = document.getElementById('usersTableBody');
const usersLoading = document.getElementById('usersLoading');
const usersEmpty = document.getElementById('usersEmpty');
const addUserBtn = document.getElementById('addUserBtn');
const userModal = document.getElementById('userModal');
const userForm = document.getElementById('userForm');
const userModalTitle = document.getElementById('userModalTitle');
const closeUserModalBtn = document.getElementById('closeUserModalBtn');
const cancelUserBtn = document.getElementById('cancelUserBtn');
const userPasswordGroup = document.getElementById('userPasswordGroup');

// Helper: Show notification Toast
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast toast-${type}`;
  
  // Quick bounce in
  setTimeout(() => {
    toast.classList.remove('hidden');
  }, 50);

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

// Helper: Setup API headers
function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  return headers;
}

// Update UI based on auth state
function updateAuthUI() {
  if (state.token && state.user) {
    // Logged in
    authSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    headerNav.style.display = 'flex';
    userNameDisplay.textContent = state.user.name;
    userRoleDisplay.textContent = state.user.role;
    
    // Manage Instructor-specific UI
    if (state.user.role === 'instructor') {
      instructorElements.forEach(el => el.style.display = 'block');
    } else {
      instructorElements.forEach(el => el.style.display = 'none');
      // If student was on users tab, force them to courses tab
      if (state.currentTab === 'users') {
        switchTab('courses');
      }
    }
    
    fetchCourses();
    if (state.user.role === 'instructor') {
      fetchUsers();
    }
  } else {
    // Logged out
    authSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
    headerNav.style.display = 'none';
  }
}

// Tab Switching
function switchTab(tabId) {
  state.currentTab = tabId;
  tabLinks.forEach(link => {
    if (link.dataset.tab === tabId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  tabPanes.forEach(pane => {
    if (pane.id === `${tabId}Tab`) {
      pane.style.display = 'block';
    } else {
      pane.style.display = 'none';
    }
  });
}

// --- API ACTIONS ---

// Register
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const role = document.querySelector('input[name="regRole"]:checked').value;

  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    showToast('Registration successful! Welcome to StudyStack.');
    registerForm.reset();
    updateAuthUI();
  } catch (error) {
    showToast(error.message, 'error');
  }
});

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    showToast('Logged in successfully!');
    loginForm.reset();
    updateAuthUI();
  } catch (error) {
    showToast(error.message, 'error');
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showToast('Logged out successfully.');
  updateAuthUI();
});

// Fetch Courses
async function fetchCourses() {
  coursesLoading.style.display = 'flex';
  coursesGrid.style.display = 'none';
  coursesEmpty.style.display = 'none';

  try {
    const res = await fetch('/api/courses', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch courses');
    const courses = await res.json();
    state.courses = courses;
    renderCourses(courses);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    coursesLoading.style.display = 'none';
  }
}

// Render Courses
function renderCourses(coursesToRender) {
  coursesGrid.innerHTML = '';
  
  if (coursesToRender.length === 0) {
    coursesGrid.style.display = 'none';
    coursesEmpty.style.display = 'flex';
    return;
  }

  coursesGrid.style.display = 'grid';
  coursesEmpty.style.display = 'none';

  coursesToRender.forEach(course => {
    const isInstructor = state.user && state.user.role === 'instructor';
    
    // Set a default background if no custom image is supplied
    const imageUrl = course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop';
    
    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
      <div class="course-card-banner" style="background-image: url('${escapeHTML(imageUrl)}');"></div>
      <div class="course-card-content">
        <div class="course-card-header">
          <h3>${escapeHTML(course.title)}</h3>
          <span class="course-instructor">
            <i class="fa-regular fa-user"></i> ${escapeHTML(course.instructor)}
          </span>
        </div>
        <div class="course-card-footer">
          <span class="course-price">$${course.price}</span>
          <div class="course-actions">
            ${isInstructor ? `
              <button class="btn btn-secondary btn-sm" onclick="openEditCourseModal('${course._id}')">
                <i class="fa-regular fa-pen-to-square"></i> Edit
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteCourse('${course._id}')">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            ` : `
              <button class="btn btn-primary btn-sm" onclick="enrollCourse('${course._id}')">
                Enroll
              </button>
            `}
          </div>
        </div>
      </div>
    `;
    coursesGrid.appendChild(card);
  });
}

// Enroll course action (demo action)
window.enrollCourse = function(courseId) {
  const course = state.courses.find(c => c._id === courseId);
  showToast(`Enrolled successfully in: ${course.title}!`);
};

// Course Modal Form submit
courseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('courseId').value;
  const title = document.getElementById('courseTitle').value;
  const price = Number(document.getElementById('coursePrice').value);
  const instructor = document.getElementById('courseInstructor').value;
  const image = document.getElementById('courseImage').value;

  const url = id ? `/api/courses/${id}` : '/api/courses';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify({ title, price, instructor, image })
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to save course');
    }

    showToast(id ? 'Course updated successfully!' : 'Course created successfully!');
    courseModal.style.display = 'none';
    courseForm.reset();
    fetchCourses();
  } catch (error) {
    showToast(error.message, 'error');
  }
});

// Delete Course
window.deleteCourse = async function(id) {
  if (!confirm('Are you sure you want to delete this course?')) return;

  try {
    const res = await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete course');
    showToast('Course deleted successfully.');
    fetchCourses();
  } catch (error) {
    showToast(error.message, 'error');
  }
};

// Open Add Course Modal
addCourseBtn.addEventListener('click', () => {
  courseModalTitle.textContent = 'Add Course';
  document.getElementById('courseId').value = '';
  courseForm.reset();
  courseModal.style.display = 'flex';
});

// Open Edit Course Modal
window.openEditCourseModal = function(id) {
  const course = state.courses.find(c => c._id === id);
  if (!course) return;

  courseModalTitle.textContent = 'Edit Course';
  document.getElementById('courseId').value = course._id;
  document.getElementById('courseTitle').value = course.title;
  document.getElementById('coursePrice').value = course.price;
  document.getElementById('courseInstructor').value = course.instructor;
  document.getElementById('courseImage').value = course.image || '';
  
  courseModal.style.display = 'flex';
};

// File Upload logic
const courseImageFile = document.getElementById('courseImageFile');
courseImageFile.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  showToast('Uploading image from device...', 'success');

  try {
    const headers = {};
    if (state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: headers,
      body: formData
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    
    document.getElementById('courseImage').value = data.imageUrl;
    showToast('Image uploaded successfully!');
  } catch (error) {
    showToast(`Upload error: ${error.message}`, 'error');
  }
});

// Course Modal controls
closeCourseModalBtn.addEventListener('click', () => courseModal.style.display = 'none');
cancelCourseBtn.addEventListener('click', () => courseModal.style.display = 'none');

// Fetch Platform Users
async function fetchUsers() {
  usersLoading.style.display = 'flex';
  usersEmpty.style.display = 'none';

  try {
    const res = await fetch('/api/users', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch users');
    const users = await res.json();
    state.users = users;
    renderUsers(users);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    usersLoading.style.display = 'none';
  }
}

// Render Users
function renderUsers(usersList) {
  usersTableBody.innerHTML = '';
  
  if (usersList.length === 0) {
    usersEmpty.style.display = 'flex';
    return;
  }

  usersEmpty.style.display = 'none';

  usersList.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHTML(user.name)}</td>
      <td>${escapeHTML(user.email)}</td>
      <td><span class="role-pill">${user.role}</span></td>
      <td>${new Date(user.createdAt).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="openEditUserModal('${user._id}')">
          <i class="fa-regular fa-edit"></i> Edit
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteUser('${user._id}')">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </td>
    `;
    usersTableBody.appendChild(row);
  });
}

// User Modal Form submit (Instructor CRUD for users)
userForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('userId').value;
  const name = document.getElementById('userNameInput').value;
  const email = document.getElementById('userEmailInput').value;
  const role = document.getElementById('userRoleInput').value;
  
  const payload = { name, email, role };
  
  if (!id) {
    payload.password = document.getElementById('userPasswordInput').value;
  } else {
    const pwd = document.getElementById('userPasswordInput').value;
    if (pwd) payload.password = pwd;
  }

  const url = id ? `/api/users/${id}` : '/api/users';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to save user');
    }

    showToast(id ? 'User updated successfully!' : 'User created successfully!');
    userModal.style.display = 'none';
    userForm.reset();
    fetchUsers();
  } catch (error) {
    showToast(error.message, 'error');
  }
});

// Delete User
window.deleteUser = async function(id) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete user');
    showToast('User deleted successfully.');
    fetchUsers();
  } catch (error) {
    showToast(error.message, 'error');
  }
};

// Open Add User Modal
addUserBtn.addEventListener('click', () => {
  userModalTitle.textContent = 'Create User';
  document.getElementById('userId').value = '';
  document.getElementById('userPasswordInput').required = true;
  userForm.reset();
  userModal.style.display = 'flex';
});

// Open Edit User Modal
window.openEditUserModal = function(id) {
  const user = state.users.find(u => u._id === id);
  if (!user) return;

  userModalTitle.textContent = 'Edit User';
  document.getElementById('userId').value = user._id;
  document.getElementById('userNameInput').value = user.name;
  document.getElementById('userEmailInput').value = user.email;
  document.getElementById('userRoleInput').value = user.role;
  document.getElementById('userPasswordInput').required = false; // Optional password during update
  document.getElementById('userPasswordInput').placeholder = 'Leave blank to keep current';

  userModal.style.display = 'flex';
};

// User Modal controls
closeUserModalBtn.addEventListener('click', () => userModal.style.display = 'none');
cancelUserBtn.addEventListener('click', () => userModal.style.display = 'none');

// Search Courses filtering
courseSearch.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = state.courses.filter(course => 
    course.title.toLowerCase().includes(query) || 
    course.instructor.toLowerCase().includes(query)
  );
  renderCourses(filtered);
});

// Toggles inside Auth card
toRegister.addEventListener('click', (e) => {
  e.preventDefault();
  loginFormContainer.style.display = 'none';
  registerFormContainer.style.display = 'block';
});

toLogin.addEventListener('click', (e) => {
  e.preventDefault();
  registerFormContainer.style.display = 'none';
  loginFormContainer.style.display = 'block';
});

// Sidebar nav triggers
tabLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tabId = link.dataset.tab;
    switchTab(tabId);
  });
});

// Register Form role option stylings
const roleCards = document.querySelectorAll('.role-card');
roleCards.forEach(card => {
  card.addEventListener('click', () => {
    roleCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    const input = card.querySelector('input');
    input.checked = true;
  });
});

// HTML escaping helper
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Theme Toggle logic
const themeToggleBtn = document.getElementById('themeToggleBtn');
const currentTheme = localStorage.getItem('theme') || 'light';

// Set initial theme
if (currentTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
} else {
  document.documentElement.setAttribute('data-theme', 'light');
}

themeToggleBtn.addEventListener('click', () => {
  const activeTheme = document.documentElement.getAttribute('data-theme');
  if (activeTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    showToast('Theme switched to Light mode');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    showToast('Theme switched to Dark mode');
  }
});

// Initialise App
updateAuthUI();
