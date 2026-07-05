/**
 * Shared Frontend Utilities
 * Renders toast notifications, formatting, markdown rendering, and loader states.
 */

// Toast notification trigger
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Escape HTML utility
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Formatting helpers
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Markdown parser
function renderMarkdown(md) {
  if (!md) return '';
  try {
    if (window.marked && window.marked.parse) {
      return window.marked.parse(md);
    }
  } catch (e) {
    console.error("Markdown rendering error:", e);
  }
  return md; // Fallback
}

// Expandable panels initializer
function initExpandables() {
  document.querySelectorAll('.expandable-header').forEach(header => {
    // Prevent duplicate listeners
    if (header.dataset.listenerAttached) return;
    
    header.addEventListener('click', () => {
      const panel = header.parentElement;
      const content = header.nextElementSibling;
      
      panel.classList.toggle('open');
      if (panel.classList.contains('open')) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = '0px';
      }
    });
    header.dataset.listenerAttached = 'true';
  });
}

// Loader toggle helpers
function setLoaderState(loaderId, contentId, isLoading) {
  const loader = document.getElementById(loaderId);
  const content = document.getElementById(contentId);
  
  if (loader && content) {
    if (isLoading) {
      loader.style.display = 'block';
      content.style.display = 'none';
    } else {
      loader.style.display = 'none';
      content.style.display = 'block';
    }
  }
}

// Simple debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Global exposure
window.showToast = showToast;
window.escapeHtml = escapeHtml;
window.formatCurrency = formatCurrency;
window.formatNumber = formatNumber;
window.formatDate = formatDate;
window.renderMarkdown = renderMarkdown;
window.initExpandables = initExpandables;
window.setLoaderState = setLoaderState;
window.debounce = debounce;
