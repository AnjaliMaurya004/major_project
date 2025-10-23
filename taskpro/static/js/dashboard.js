// File: static/js/dashboard.js

// Global variables
let tasks = [];
let currentFilter = 'all';
let currentEditingTask = null;

// API Configuration
const API_BASE_URL = '/api';

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('access_token');
}

// Check authentication
function checkAuth() {
    const token = getAuthToken();
    if (!token) {
        window.location.href = '/login/';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    window.location.href = '/login/';
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });
    
    if (response.status === 401) {
        logout();
        return;
    }
    
    return response;
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    // Display username
    const username = localStorage.getItem('username');
    document.getElementById('usernameDisplay').textContent = username || 'User';
    
    // Set minimum date for due date input
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDueDate').setAttribute('min', today);
    
    // Load tasks
    loadTasks();
    
    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Navigation filter
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            currentFilter = item.dataset.filter;
            filterTasks();
        });
    });
    
    // Search input
    document.getElementById('searchInput').addEventListener('input', filterTasks);
    
    // Priority filter
    document.getElementById('priorityFilter').addEventListener('change', filterTasks);
    
    // Task form submit
    document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
    
    // Close modal on outside click
    document.getElementById('taskModal').addEventListener('click', (e) => {
        if (e.target.id === 'taskModal') {
            closeTaskModal();
        }
    });
}

// Load tasks from API
async function loadTasks() {
    try {
        const response = await apiRequest('/tasks/?ordering=due_date');
        
        if (response.ok) {
            tasks = await response.json();
            renderTasks();
            updateStats();
        } else {
            showError('Failed to load tasks');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showError('An error occurred while loading tasks');
    }
}

// Render tasks
function renderTasks() {
    const container = document.getElementById('tasksContainer');
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No tasks yet</h3>
                <p>Create your first task to get started!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tasks.map(task => createTaskCard(task)).join('');
}

// Create task card HTML
function createTaskCard(task) {
    const dueDate = new Date(task.due_date);
    const isOverdue = dueDate < new Date() && task.status === 'PENDING';
    
    return `
        <div class="task-card priority-${task.priority} ${task.status === 'COMPLETED' ? 'completed' : ''}">
            <div class="task-header">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                <div class="task-badges">
                    <span class="badge badge-priority-${task.priority}">${task.priority}</span>
                    ${task.status === 'COMPLETED' ? '<span class="badge badge-status">Completed</span>' : ''}
                    ${isOverdue ? '<span class="badge badge-priority-HIGH">Overdue</span>' : ''}
                </div>
            </div>
            
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            
            <div class="task-meta">
                <div class="task-meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(task.due_date)}</span>
                </div>
                <div class="task-meta-item">
                    <i class="fas fa-clock"></i>
                    <span>Created ${getTimeAgo(task.created_at)}</span>
                </div>
            </div>
            
            <div class="task-actions">
                ${task.status === 'PENDING' ? 
                    `<button class="btn-complete" onclick="markTaskComplete(${task.id})">
                        <i class="fas fa-check"></i> Complete
                    </button>` :
                    `<button class="btn-pending" onclick="markTaskPending(${task.id})">
                        <i class="fas fa-undo"></i> Reopen
                    </button>`
                }
                <button class="btn-edit" onclick="editTask(${task.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// Filter tasks
function filterTasks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const priorityFilter = document.getElementById('priorityFilter').value;
    
    let filtered = tasks;
    
    // Filter by status
    if (currentFilter === 'pending') {
        filtered = filtered.filter(task => task.status === 'PENDING');
    } else if (currentFilter === 'completed') {
        filtered = filtered.filter(task => task.status === 'COMPLETED');
    }
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(task => 
            task.title.toLowerCase().includes(searchTerm) || 
            task.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by priority
    if (priorityFilter) {
        filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    const container = document.getElementById('tasksContainer');
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No tasks found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
    } else {
        container.innerHTML = filtered.map(task => createTaskCard(task)).join('');
    }
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const pending = tasks.filter(task => task.status === 'PENDING').length;
    const completed = tasks.filter(task => task.status === 'COMPLETED').length;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('pendingTasks').textContent = pending;
    document.getElementById('completedTasks').textContent = completed;
}

// Open task modal
function openTaskModal(task = null) {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const modalTitle = document.getElementById('modalTitle');
    const errorDiv = document.getElementById('modalError');
    
    errorDiv.style.display = 'none';
    form.reset();
    
    if (task) {
        modalTitle.textContent = 'Edit Task';
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDueDate').value = task.due_date;
        currentEditingTask = task;
    } else {
        modalTitle.textContent = 'Add New Task';
        document.getElementById('taskId').value = '';
        currentEditingTask = null;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close task modal
function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentEditingTask = null;
}

// Handle task form submit
async function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        priority: document.getElementById('taskPriority').value,
        due_date: document.getElementById('taskDueDate').value,
        status: currentEditingTask ? currentEditingTask.status : 'PENDING'
    };
    
    const errorDiv = document.getElementById('modalError');
    errorDiv.style.display = 'none';
    
    try {
        let response;
        if (taskId) {
            // Update existing task
            response = await apiRequest(`/tasks/${taskId}/`, {
                method: 'PUT',
                body: JSON.stringify(taskData)
            });
        } else {
            // Create new task
            response = await apiRequest('/tasks/', {
                method: 'POST',
                body: JSON.stringify(taskData)
            });
        }
        
        if (response.ok) {
            closeTaskModal();
            await loadTasks();
            showSuccess(taskId ? 'Task updated successfully!' : 'Task created successfully!');
        } else {
            const errorData = await response.json();
            let errorMsg = '';
            for (let key in errorData) {
                errorMsg += `${key}: ${errorData[key]}\n`;
            }
            errorDiv.textContent = errorMsg || 'Failed to save task';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error saving task:', error);
        errorDiv.textContent = 'An error occurred while saving the task';
        errorDiv.style.display = 'block';
    }
}

// Edit task
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        openTaskModal(task);
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await apiRequest(`/tasks/${taskId}/`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadTasks();
            showSuccess('Task deleted successfully!');
        } else {
            showError('Failed to delete task');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showError('An error occurred while deleting the task');
    }
}

// Mark task as complete
async function markTaskComplete(taskId) {
    try {
        const response = await apiRequest(`/tasks/${taskId}/mark_complete/`, {
            method: 'POST'
        });
        
        if (response.ok) {
            await loadTasks();
            showSuccess('Task marked as complete!');
        } else {
            showError('Failed to update task status');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showError('An error occurred while updating the task');
    }
}

// Mark task as pending
async function markTaskPending(taskId) {
    try {
        const response = await apiRequest(`/tasks/${taskId}/mark_pending/`, {
            method: 'POST'
        });
        
        if (response.ok) {
            await loadTasks();
            showSuccess('Task reopened!');
        } else {
            showError('Failed to update task status');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showError('An error occurred while updating the task');
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    
    return formatDate(dateString);
}

function showSuccess(message) {
    // Create temporary success notification
    const notification = document.createElement('div');
    notification.className = 'success-message';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: block;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showError(message) {
    // Create temporary error notification
    const notification = document.createElement('div');
    notification.className = 'error-message';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: block;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);