/**
 * ===================================================================
 * WEDDING PREPARATION PLANNER - JAVASCRIPT CONTROLLER
 * Features:
 *  - Persistent localStorage storage & recovery
 *  - Indian Rupee (₹) formatting & automatic live recalculations
 *  - Budget tracker with estimated vs actual variance & progress bar
 *  - Shopping checklist with search, category filter, status tabs & sorting
 *  - Wedding preparation task manager with priority & overdue alerts
 *  - Organizer notes notebook
 *  - CSV export, JSON backup & restore, safe deletion confirmation
 * ===================================================================
 */

// Storage Keys
const STORAGE_KEY = 'eternal_vows_wedding_planner_data_v2';
const LEGACY_STORAGE_KEY = 'eternal_vows_wedding_planner_data_v1';

// Default initial starter dataset (items empty by default)
const DEFAULT_STARTER_DATA = {
  budget: 1500000, // ₹ 15,00,000 (15 Lakhs)
  weddingDate: getDefaultWeddingDate(60), // 60 days from now
  items: [],
  tasks: [
    {
      id: 'task_1',
      title: 'Finalizing wedding outfits and trial schedule',
      dueDate: getOffsetDateString(10),
      priority: 'High',
      status: 'Completed',
      notes: 'Both lehenga and sherwani alterations finalized.',
      createdAt: Date.now() - 5000000
    },
    {
      id: 'task_2',
      title: 'Booking professional bridal makeup artist',
      dueDate: getOffsetDateString(15),
      priority: 'High',
      status: 'Completed',
      notes: 'Shreya Studios confirmed and advance paid.',
      createdAt: Date.now() - 4000000
    },
    {
      id: 'task_3',
      title: 'Shopping for wedding jewellery & ornaments',
      dueDate: getOffsetDateString(20),
      priority: 'High',
      status: 'Completed',
      notes: 'Kundan set purchased from Tanishq with Hallmark certification.',
      createdAt: Date.now() - 3500000
    },
    {
      id: 'task_4',
      title: 'Preparing and finalizing master guest list',
      dueDate: getOffsetDateString(25),
      priority: 'Medium',
      status: 'In Progress',
      notes: 'Current count is 320 guests across both families.',
      createdAt: Date.now() - 3000000
    },
    {
      id: 'task_5',
      title: 'Arranging digital & physical wedding invitations',
      dueDate: getOffsetDateString(30),
      priority: 'High',
      status: 'Pending',
      notes: 'Courier boxes ordered; digital PDF/video card ready for WhatsApp.',
      createdAt: Date.now() - 2500000
    },
    {
      id: 'task_6',
      title: 'Booking wedding photographer and videographer',
      dueDate: getOffsetDateString(32),
      priority: 'High',
      status: 'Completed',
      notes: 'Contract signed for 3 days of events with drone rights.',
      createdAt: Date.now() - 2000000
    },
    {
      id: 'task_7',
      title: 'Planning wedding functions itinerary (Mehendi, Sangeet, Wedding)',
      dueDate: getOffsetDateString(40),
      priority: 'Medium',
      status: 'In Progress',
      notes: 'DJ track list in progress with choreographer.',
      createdAt: Date.now() - 1500000
    },
    {
      id: 'task_8',
      title: 'Completing personal care & salon preparations',
      dueDate: getOffsetDateString(45),
      priority: 'Medium',
      status: 'Pending',
      notes: 'Dermatologist skincare routine and spa appointments booked.',
      createdAt: Date.now() - 1000000
    }
  ],
  notes: [
    {
      id: 'note_1',
      title: 'Wedding Venue Coordinator & Key Contacts',
      category: 'Venue & Logistics',
      content: 'The Grand Palace Resort\nManager: Mr. Rajesh Kumar (+91 98112-34567)\nCheck-in for bride/groom suites: 11:00 AM on 14th Nov.\nBanquet Hall capacity: 450 guests.',
      updatedAt: 'Just now'
    },
    {
      id: 'note_2',
      title: 'Auspicious Muhurat & Ceremony Schedule',
      category: 'Ceremonies & Muhurat',
      content: 'Mehendi & Sangeet: 5:00 PM onwards\nBaraat Assembly: 6:30 PM\nVarmala (Exchange of garlands): 8:15 PM\nHastamelap & Pheras: 10:45 PM (Auspicious muhurat specified by Panditji).',
      updatedAt: 'Yesterday'
    },
    {
      id: 'note_3',
      title: 'Return Gifts & Sweet Box Distribution Plan',
      category: 'Vendor Contacts',
      content: 'Distribute 1 luxury sweet box per family.\nExtra 25 boxes kept in room 204 for outstation relatives.\nAssigned cousin Aman (+91 98765-11223) to manage the gift reception desk.',
      updatedAt: '2 days ago'
    }
  ]
};

// Application state
let state = {
  budget: 0,
  weddingDate: '',
  items: [],
  tasks: [],
  notes: [],
  filterCategory: 'ALL',
  filterStatus: 'ALL',
  searchQuery: '',
  sortExpense: 'default',
  taskFilterStatus: 'ALL',
  taskFilterPriority: 'ALL'
};

// Global confirm action holder
let pendingConfirmCallback = null;

/**
 * ===================================================================
 * HELPER FUNCTIONS
 * ===================================================================
 */

/**
 * Formats a numeric value into the Indian Rupee (₹) standard
 * e.g., 1500000 -> ₹ 15,00,000
 */
function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Parses numeric inputs safely
 */
function cleanNumber(val) {
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
}

/**
 * Returns date string YYYY-MM-DD offset by given days
 */
function getOffsetDateString(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Generates default wedding date in YYYY-MM-DD
 */
function getDefaultWeddingDate(daysAhead) {
  return getOffsetDateString(daysAhead);
}

/**
 * Generates unique ID
 */
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * Escape HTML to avoid XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Category Icon Mapper
 */
function getCategoryIcon(cat) {
  const map = {
    'Bridal Outfits': 'fa-solid fa-person-dress',
    'Jewellery and Accessories': 'fa-solid fa-gem',
    'Makeup and Skincare': 'fa-solid fa-wand-magic-sparkles',
    'Haircare': 'fa-solid fa-spa',
    'Footwear and Bags': 'fa-solid fa-shoe-prints',
    "Groom's Shopping": 'fa-solid fa-user-tie',
    'Wedding Gifts': 'fa-solid fa-gift',
    'Household Items': 'fa-solid fa-house-chimney-window',
    'Wedding Decorations': 'fa-solid fa-champagne-glasses',
    'Food': 'fa-solid fa-utensils',
    'Travel': 'fa-solid fa-plane-departure',
    'Photography': 'fa-solid fa-camera-retro',
    'Other Expenses': 'fa-solid fa-receipt'
  };
  return map[cat] || 'fa-solid fa-tag';
}

/**
 * Shows interactive toast notification
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-circle-check';
  if (type === 'danger') icon = 'fa-triangle-exclamation';
  if (type === 'info') icon = 'fa-circle-info';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove after 3.5s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Shows custom confirmation modal
 */
function showConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById('modalConfirm');
  const titleEl = document.getElementById('confirmModalTitle');
  const msgEl = document.getElementById('confirmModalMessage');

  titleEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: #c5221f;"></i> ${escapeHtml(title)}`;
  msgEl.textContent = message;
  pendingConfirmCallback = onConfirm;

  openModal(modal);
}

/**
 * ===================================================================
 * LOCAL STORAGE & STATE PERSISTENCE
 * ===================================================================
 */

function saveState() {
  try {
    const payload = {
      budget: state.budget,
      weddingDate: state.weddingDate,
      items: state.items,
      tasks: state.tasks,
      notes: state.notes
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
    showToast('Failed to save to local storage', 'danger');
  }
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      state.budget = Number(parsed.budget) || 0;
      state.weddingDate = parsed.weddingDate || getDefaultWeddingDate(60);
      state.items = Array.isArray(parsed.items) ? parsed.items : [];
      state.tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
      state.notes = Array.isArray(parsed.notes) ? parsed.notes : [];
    } else {
      // Check legacy storage and migrate with all items removed as requested
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        try {
          const parsedLegacy = JSON.parse(legacy);
          state.budget = Number(parsedLegacy.budget) || DEFAULT_STARTER_DATA.budget;
          state.weddingDate = parsedLegacy.weddingDate || DEFAULT_STARTER_DATA.weddingDate;
          state.items = []; // All items removed
          state.tasks = Array.isArray(parsedLegacy.tasks) ? parsedLegacy.tasks : DEFAULT_STARTER_DATA.tasks;
          state.notes = Array.isArray(parsedLegacy.notes) ? parsedLegacy.notes : DEFAULT_STARTER_DATA.notes;
          saveState();
        } catch (e) {
          initStarterData();
        }
      } else {
        initStarterData();
      }
    }
  } catch (err) {
    console.warn('Error reading from localStorage, loading starter data:', err);
    initStarterData();
  }
}

function initStarterData() {
  state.budget = DEFAULT_STARTER_DATA.budget;
  state.weddingDate = DEFAULT_STARTER_DATA.weddingDate;
  state.items = JSON.parse(JSON.stringify(DEFAULT_STARTER_DATA.items));
  state.tasks = JSON.parse(JSON.stringify(DEFAULT_STARTER_DATA.tasks));
  state.notes = JSON.parse(JSON.stringify(DEFAULT_STARTER_DATA.notes));
  saveState();
}

/**
 * ===================================================================
 * DASHBOARD & FINANCIAL CALCULATIONS
 * ===================================================================
 */

function updateDashboard() {
  const totalBudget = state.budget;

  // Total Estimated Cost: (estPrice * qty) for all items not marked "Not Required"
  let totalEstimated = 0;
  // Total Actual Spending: (actualPrice * qty) for purchased items or items with recorded actual price
  let totalActual = 0;
  let purchasedCount = 0;
  let pendingCount = 0;

  state.items.forEach(item => {
    if (item.status !== 'Not Required') {
      const qty = item.quantity || 1;
      const estTotal = (cleanNumber(item.estPrice)) * qty;
      totalEstimated += estTotal;

      if (item.status === 'Purchased') {
        purchasedCount++;
        // If actual price recorded, use it; otherwise fallback to estimated
        const actPrice = cleanNumber(item.actualPrice) > 0 ? cleanNumber(item.actualPrice) : cleanNumber(item.estPrice);
        totalActual += actPrice * qty;
      } else {
        pendingCount++;
        // If pending but has actual price recorded
        if (cleanNumber(item.actualPrice) > 0) {
          totalActual += cleanNumber(item.actualPrice) * qty;
        }
      }
    }
  });

  const remainingBudget = totalBudget - totalActual;
  const variance = totalActual - totalEstimated; // positive means spent more than estimated
  const totalItems = state.items.length;

  // Completed Tasks Count
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.status === 'Completed').length;
  const tasksPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 1. Update DOM Metric Cards
  document.getElementById('dashTotalBudget').textContent = formatINR(totalBudget);
  document.getElementById('dashEstimatedCost').textContent = formatINR(totalEstimated);
  document.getElementById('dashActualSpending').textContent = formatINR(totalActual);
  document.getElementById('dashRemainingBudget').textContent = formatINR(remainingBudget);
  document.getElementById('dashTotalItems').textContent = totalItems;
  document.getElementById('dashCompletedTasks').textContent = `${completedTasks} / ${totalTasks}`;

  // Subtext values
  const estDiffPercent = totalBudget > 0 ? Math.round((totalEstimated / totalBudget) * 100) : 0;
  document.getElementById('dashEstimatedDiff').textContent = `${estDiffPercent}% of wedding fund`;
  document.getElementById('dashActualPurchasedCount').textContent = `${purchasedCount} paid • ${pendingCount} pending`;
  document.getElementById('dashItemsStatus').textContent = `${purchasedCount} Purchased • ${pendingCount} Pending`;
  document.getElementById('dashTasksPercent').textContent = `${tasksPercent}% tasks completed`;

  // Remaining budget indicator styling
  const remainingCard = document.getElementById('cardRemainingWrapper');
  const remainingStatusText = document.getElementById('dashRemainingStatus');
  if (remainingBudget < 0) {
    remainingCard.classList.add('is-deficit');
    remainingStatusText.textContent = `Deficit of ${formatINR(Math.abs(remainingBudget))}`;
  } else {
    remainingCard.classList.remove('is-deficit');
    remainingStatusText.textContent = `${formatINR(remainingBudget)} surplus left`;
  }

  // 2. Budget Usage Progress Bar
  const budgetUsageStats = document.getElementById('budgetUsageStats');
  const budgetUsageBadge = document.getElementById('budgetUsageBadge');
  const budgetProgressBar = document.getElementById('budgetProgressBar');

  let usagePercent = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;
  budgetUsageStats.textContent = `Spent ${formatINR(totalActual)} of ${formatINR(totalBudget)}`;
  budgetUsageBadge.textContent = `${usagePercent}% Used`;

  // Constrain visual bar between 0 and 100%
  const visualBarWidth = Math.min(100, Math.max(0, usagePercent));
  budgetProgressBar.style.width = `${visualBarWidth}%`;

  if (usagePercent > 100) {
    budgetUsageBadge.classList.add('is-high');
    budgetProgressBar.classList.add('is-high');
    budgetUsageBadge.textContent = `${usagePercent}% (Over Budget)`;
  } else {
    budgetUsageBadge.classList.remove('is-high');
    budgetProgressBar.classList.remove('is-high');
  }

  // 3. Variance Difference Note
  const varDiffEl = document.getElementById('dashVarianceDifference');
  const varMsgEl = document.getElementById('dashVarianceMessage');
  
  if (variance > 0) {
    varDiffEl.textContent = `+${formatINR(variance)} (Above Estimates)`;
    varDiffEl.style.color = '#c5221f';
    varMsgEl.textContent = 'Actual spending currently exceeds initial estimated projections.';
  } else if (variance < 0) {
    varDiffEl.textContent = `-${formatINR(Math.abs(variance))} (Under Estimates)`;
    varDiffEl.style.color = '#137333';
    varMsgEl.textContent = 'Great savings! Spending is currently under estimated budget.';
  } else {
    varDiffEl.textContent = '₹0';
    varDiffEl.style.color = 'inherit';
    varMsgEl.textContent = 'Actual spending matches your exact estimates perfectly.';
  }
}

/**
 * ===================================================================
 * SECTION 2: CATEGORY BREAKDOWN RENDERER
 * ===================================================================
 */

const ALL_EXPENSE_CATEGORIES = [
  'Bridal Outfits',
  'Jewellery and Accessories',
  'Makeup and Skincare',
  'Haircare',
  'Footwear and Bags',
  "Groom's Shopping",
  'Wedding Gifts',
  'Household Items',
  'Wedding Decorations',
  'Food',
  'Travel',
  'Photography',
  'Other Expenses'
];

function renderCategoryBreakdown() {
  const container = document.getElementById('categoryBreakdownGrid');
  if (!container) return;

  // Group items by category
  const categoryStats = {};
  ALL_EXPENSE_CATEGORIES.forEach(cat => {
    categoryStats[cat] = {
      count: 0,
      estimated: 0,
      actual: 0
    };
  });

  state.items.forEach(item => {
    const cat = item.category || 'Other Expenses';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { count: 0, estimated: 0, actual: 0 };
    }

    if (item.status !== 'Not Required') {
      const qty = item.quantity || 1;
      categoryStats[cat].count++;
      categoryStats[cat].estimated += (cleanNumber(item.estPrice)) * qty;

      if (item.status === 'Purchased') {
        const actPrice = cleanNumber(item.actualPrice) > 0 ? cleanNumber(item.actualPrice) : cleanNumber(item.estPrice);
        categoryStats[cat].actual += actPrice * qty;
      } else if (cleanNumber(item.actualPrice) > 0) {
        categoryStats[cat].actual += cleanNumber(item.actualPrice) * qty;
      }
    }
  });

  // Calculate grand total actual to determine percentages
  let grandActual = 0;
  Object.values(categoryStats).forEach(s => grandActual += s.actual);

  // Render Category Cards
  let html = '';
  ALL_EXPENSE_CATEGORIES.forEach(cat => {
    const stat = categoryStats[cat];
    const catIcon = getCategoryIcon(cat);
    const percentOfTotal = grandActual > 0 ? Math.round((stat.actual / grandActual) * 100) : 0;
    const estBarWidth = stat.estimated > 0 ? Math.min(100, Math.round((stat.actual / stat.estimated) * 100)) : 0;

    html += `
      <div class="cat-card">
        <div class="cat-header">
          <div class="cat-icon-badge">
            <i class="${catIcon}"></i>
          </div>
          <div class="cat-title-wrap">
            <h4 class="cat-name">${escapeHtml(cat)}</h4>
            <span class="cat-item-count">${stat.count} active ${stat.count === 1 ? 'item' : 'items'}</span>
          </div>
        </div>

        <div class="cat-spending-row">
          <span class="cat-spending-label">Spent:</span>
          <span class="cat-actual-amount">${formatINR(stat.actual)}</span>
        </div>

        <div class="cat-mini-bar" title="${estBarWidth}% of category estimate spent">
          <div class="cat-mini-fill" style="width: ${estBarWidth}%;"></div>
        </div>

        <div class="cat-meta-row">
          <span>Est: ${formatINR(stat.estimated)}</span>
          <span>${percentOfTotal}% of total spend</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * ===================================================================
 * SECTION 3: SHOPPING LIST & EXPENSE PLANNER
 * ===================================================================
 */

function renderShoppingList() {
  const tbody = document.getElementById('itemsTableBody');
  const emptyState = document.getElementById('emptyItemsState');
  const counterEl = document.getElementById('tableItemCounter');
  if (!tbody) return;

  // 1. Filter items
  let filtered = [...state.items];

  // Category filter
  if (state.filterCategory !== 'ALL') {
    filtered = filtered.filter(i => i.category === state.filterCategory);
  }

  // Status filter
  if (state.filterStatus !== 'ALL') {
    filtered = filtered.filter(i => i.status === state.filterStatus);
  }

  // Search filter
  if (state.searchQuery.trim() !== '') {
    const q = state.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(i => {
      const nameMatch = (i.name || '').toLowerCase().includes(q);
      const shopMatch = (i.shop || '').toLowerCase().includes(q);
      const notesMatch = (i.notes || '').toLowerCase().includes(q);
      const catMatch = (i.category || '').toLowerCase().includes(q);
      return nameMatch || shopMatch || notesMatch || catMatch;
    });
  }

  // 2. Sort items
  if (state.sortExpense === 'costHighLow') {
    filtered.sort((a, b) => {
      const valA = (cleanNumber(a.actualPrice) || cleanNumber(a.estPrice)) * (a.quantity || 1);
      const valB = (cleanNumber(b.actualPrice) || cleanNumber(b.estPrice)) * (b.quantity || 1);
      return valB - valA;
    });
  } else if (state.sortExpense === 'costLowHigh') {
    filtered.sort((a, b) => {
      const valA = (cleanNumber(a.actualPrice) || cleanNumber(a.estPrice)) * (a.quantity || 1);
      const valB = (cleanNumber(b.actualPrice) || cleanNumber(b.estPrice)) * (b.quantity || 1);
      return valA - valB;
    });
  } else if (state.sortExpense === 'nameAZ') {
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (state.sortExpense === 'status') {
    const order = { 'Pending': 1, 'Purchased': 2, 'Not Required': 3 };
    filtered.sort((a, b) => (order[a.status] || 9) - (order[b.status] || 9));
  } else {
    // Default newest first
    filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  // Update item counter
  if (counterEl) {
    counterEl.textContent = `Showing ${filtered.length} of ${state.items.length} items`;
  }

  // Render Rows
  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  let rowsHtml = '';
  filtered.forEach(item => {
    const qty = item.quantity || 1;
    const estTotal = (cleanNumber(item.estPrice)) * qty;
    const hasActual = cleanNumber(item.actualPrice) > 0;
    const actTotal = hasActual ? cleanNumber(item.actualPrice) * qty : null;

    // Status class
    let statusClass = 'status-pending';
    let statusIcon = 'fa-clock';
    if (item.status === 'Purchased') {
      statusClass = 'status-purchased';
      statusIcon = 'fa-circle-check';
    } else if (item.status === 'Not Required') {
      statusClass = 'status-not-required';
      statusIcon = 'fa-ban';
    }

    // Toggle button icon
    const toggleIcon = item.status === 'Purchased' ? 'fa-arrow-rotate-left' : 'fa-check';
    const toggleTitle = item.status === 'Purchased' ? 'Mark as Pending' : 'Mark as Purchased';

    rowsHtml += `
      <tr data-id="${item.id}">
        <td>
          <div class="item-name-cell">
            <span class="item-title">${escapeHtml(item.name)}</span>
            ${item.notes ? `<span class="item-notes" title="${escapeHtml(item.notes)}"><i class="fa-regular fa-note-sticky"></i> ${escapeHtml(item.notes)}</span>` : ''}
          </div>
        </td>
        <td>
          <span class="item-cat-badge">
            <i class="${getCategoryIcon(item.category)}"></i> ${escapeHtml(item.category)}
          </span>
        </td>
        <td><strong>${qty}</strong></td>
        <td>
          <div>${formatINR(estTotal)}</div>
          ${qty > 1 ? `<small class="form-hint">${formatINR(item.estPrice)}/ea</small>` : ''}
        </td>
        <td>
          ${hasActual 
            ? `<div><strong>${formatINR(actTotal)}</strong></div>${qty > 1 ? `<small class="form-hint">${formatINR(item.actualPrice)}/ea</small>` : ''}` 
            : '<span class="text-light" style="font-size:0.8rem; color:#9c8a92;">— Not yet known —</span>'}
        </td>
        <td>
          ${item.shop 
            ? `<span><i class="fa-solid fa-store" style="color: #b76e79; font-size: 0.75rem;"></i> ${escapeHtml(item.shop)}</span>` 
            : '<span style="color:#bbb;">—</span>'}
        </td>
        <td>
          <span class="status-badge ${statusClass}">
            <i class="fa-solid ${statusIcon}"></i> ${item.status}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="action-btn btn-toggle-status" data-action="toggle-status" data-id="${item.id}" title="${toggleTitle}">
              <i class="fa-solid ${toggleIcon}"></i>
            </button>
            <button class="action-btn" data-action="edit-item" data-id="${item.id}" title="Edit Item">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="action-btn btn-delete" data-action="delete-item" data-id="${item.id}" title="Delete Item">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHtml;
}

/**
 * ===================================================================
 * SECTION 4: WEDDING PREPARATION TASKS
 * ===================================================================
 */

function renderTaskList() {
  const container = document.getElementById('taskListContainer');
  const emptyState = document.getElementById('emptyTasksState');
  if (!container) return;

  let filtered = [...state.tasks];

  // Status Filter
  if (state.taskFilterStatus !== 'ALL') {
    filtered = filtered.filter(t => t.status === state.taskFilterStatus);
  }

  // Priority Filter
  if (state.taskFilterPriority !== 'ALL') {
    filtered = filtered.filter(t => t.priority === state.taskFilterPriority);
  }

  // Sort: pending first, then by due date
  filtered.sort((a, b) => {
    if (a.status === 'Completed' && b.status !== 'Completed') return 1;
    if (a.status !== 'Completed' && b.status === 'Completed') return -1;
    return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  const todayStr = new Date().toISOString().split('T')[0];

  let html = '';
  filtered.forEach(task => {
    const isCompleted = task.status === 'Completed';
    const isOverdue = task.dueDate && task.dueDate < todayStr && !isCompleted;

    // Priority class
    let priClass = 'priority-medium';
    if (task.priority === 'High') priClass = 'priority-high';
    if (task.priority === 'Low') priClass = 'priority-low';

    // Due date display
    let dueDateFormatted = 'No deadline';
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      dueDateFormatted = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    html += `
      <div class="task-item ${isCompleted ? 'completed' : ''}" data-id="${task.id}">
        <div class="task-checkbox-wrap">
          <div class="task-custom-checkbox" data-action="toggle-task" data-id="${task.id}" title="${isCompleted ? 'Mark as incomplete' : 'Mark as complete'}">
            ${isCompleted ? '<i class="fa-solid fa-check"></i>' : ''}
          </div>
        </div>

        <div class="task-body">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-meta">
            <span class="priority-badge ${priClass}">${task.priority} Priority</span>
            <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
              <i class="fa-regular fa-calendar"></i> ${dueDateFormatted} ${isOverdue ? '(Overdue)' : ''}
            </span>
            ${task.notes ? `<span><i class="fa-regular fa-comment-dots"></i> ${escapeHtml(task.notes)}</span>` : ''}
          </div>
        </div>

        <div class="task-actions">
          <button class="action-btn" data-action="edit-task" data-id="${task.id}" title="Edit Task">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="action-btn btn-delete" data-action="delete-task" data-id="${task.id}" title="Delete Task">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * ===================================================================
 * SECTION 5: WEDDING NOTES
 * ===================================================================
 */

function renderNotes() {
  const container = document.getElementById('notesGridContainer');
  if (!container) return;

  if (state.notes.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon"><i class="fa-solid fa-note-sticky"></i></div>
        <h3>No wedding notes yet</h3>
        <p>Keep track of vendor contacts, rituals, auspicious timings, and thoughts.</p>
        <button class="btn btn-primary btn-sm" id="btnEmptyNotesAdd">
          <i class="fa-solid fa-plus"></i> Add First Note
        </button>
      </div>
    `;
    const btn = document.getElementById('btnEmptyNotesAdd');
    if (btn) btn.addEventListener('click', openAddNoteModal);
    return;
  }

  let html = '';
  state.notes.forEach(note => {
    html += `
      <div class="note-card" data-id="${note.id}">
        <div class="note-header">
          <h4 class="note-title">${escapeHtml(note.title)}</h4>
          <span class="note-tag">${escapeHtml(note.category || 'General')}</span>
        </div>
        <div class="note-content">${escapeHtml(note.content)}</div>
        <div class="note-footer">
          <span><i class="fa-regular fa-clock"></i> ${escapeHtml(note.updatedAt || 'Recent')}</span>
          <div class="action-buttons">
            <button class="action-btn" data-action="edit-note" data-id="${note.id}" title="Edit Note">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="action-btn btn-delete" data-action="delete-note" data-id="${note.id}" title="Delete Note">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * ===================================================================
 * WEDDING COUNTDOWN TIMER
 * ===================================================================
 */

function updateWeddingCountdown() {
  const daysEl = document.getElementById('cdDays');
  const hoursEl = document.getElementById('cdHours');
  const minsEl = document.getElementById('cdMins');
  const badgeEl = document.getElementById('cdStatusBadge');

  if (!state.weddingDate) {
    daysEl.textContent = '0';
    hoursEl.textContent = '0';
    minsEl.textContent = '0';
    badgeEl.textContent = 'Choose wedding date';
    return;
  }

  const targetDate = new Date(`${state.weddingDate}T00:00:00`);
  const now = new Date();
  const diffMs = targetDate - now;

  if (diffMs <= 0) {
    daysEl.textContent = '0';
    hoursEl.textContent = '0';
    minsEl.textContent = '0';
    badgeEl.textContent = '🎉 Happy Wedding Day!';
    return;
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const diffMins = Math.floor((diffMs / (1000 * 60)) % 60);

  daysEl.textContent = diffDays;
  hoursEl.textContent = diffHours;
  minsEl.textContent = diffMins;
  badgeEl.textContent = `${diffDays} days to go!`;
}

/**
 * ===================================================================
 * MODALS MANAGEMENT
 * ===================================================================
 */

function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('active');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('active');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m));
}

// 1. Budget Modal
function openBudgetModal() {
  const modal = document.getElementById('modalBudget');
  const input = document.getElementById('budgetAmountInput');
  const preview = document.getElementById('budgetFormatPreview');

  input.value = state.budget || '';
  preview.textContent = `Preview: ${formatINR(state.budget || 0)}`;
  openModal(modal);
  setTimeout(() => input.focus(), 100);
}

// 2. Item Modal (Add / Edit)
function openAddItemModal(editId = null) {
  const modal = document.getElementById('modalItem');
  const form = document.getElementById('formItem');
  const title = document.getElementById('itemModalTitle');
  form.reset();

  if (editId) {
    const item = state.items.find(i => i.id === editId);
    if (!item) return;
    title.innerHTML = '<i class="fa-solid fa-pen"></i> Edit Shopping Item & Expense';
    document.getElementById('itemIdInput').value = item.id;
    document.getElementById('itemNameInput').value = item.name;
    document.getElementById('itemCategoryInput').value = item.category;
    document.getElementById('itemQuantityInput').value = item.quantity;
    document.getElementById('itemEstPriceInput').value = item.estPrice;
    document.getElementById('itemActualPriceInput').value = item.actualPrice || '';
    document.getElementById('itemShopInput').value = item.shop || '';
    document.getElementById('itemStatusInput').value = item.status;
    document.getElementById('itemNotesInput').value = item.notes || '';
  } else {
    title.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> Add Shopping Item & Expense';
    document.getElementById('itemIdInput').value = '';
    document.getElementById('itemQuantityInput').value = '1';
    document.getElementById('itemStatusInput').value = 'Pending';
  }

  openModal(modal);
  setTimeout(() => document.getElementById('itemNameInput').focus(), 100);
}

// 3. Task Modal (Add / Edit)
function openAddTaskModal(editId = null) {
  const modal = document.getElementById('modalTask');
  const form = document.getElementById('formTask');
  const title = document.getElementById('taskModalTitle');
  form.reset();

  if (editId) {
    const task = state.tasks.find(t => t.id === editId);
    if (!task) return;
    title.innerHTML = '<i class="fa-solid fa-pen"></i> Edit Preparation Task';
    document.getElementById('taskIdInput').value = task.id;
    document.getElementById('taskTitleInput').value = task.title;
    document.getElementById('taskDueDateInput').value = task.dueDate || '';
    document.getElementById('taskPriorityInput').value = task.priority;
    document.getElementById('taskStatusInput').value = task.status;
    document.getElementById('taskNotesInput').value = task.notes || '';
  } else {
    title.innerHTML = '<i class="fa-solid fa-list-check"></i> Add Preparation Task';
    document.getElementById('taskIdInput').value = '';
    document.getElementById('taskPriorityInput').value = 'Medium';
    document.getElementById('taskStatusInput').value = 'Pending';
  }

  openModal(modal);
  setTimeout(() => document.getElementById('taskTitleInput').focus(), 100);
}

// 4. Note Modal (Add / Edit)
function openAddNoteModal(editId = null) {
  const modal = document.getElementById('modalNote');
  const form = document.getElementById('formNote');
  const title = document.getElementById('noteModalTitle');
  form.reset();

  if (editId) {
    const note = state.notes.find(n => n.id === editId);
    if (!note) return;
    title.innerHTML = '<i class="fa-solid fa-pen"></i> Edit Wedding Note';
    document.getElementById('noteIdInput').value = note.id;
    document.getElementById('noteTitleInput').value = note.title;
    document.getElementById('noteCategoryInput').value = note.category;
    document.getElementById('noteContentInput').value = note.content;
  } else {
    title.innerHTML = '<i class="fa-solid fa-book-bookmark"></i> Add Wedding Note';
    document.getElementById('noteIdInput').value = '';
    document.getElementById('noteCategoryInput').value = 'Vendor Contacts';
  }

  openModal(modal);
  setTimeout(() => document.getElementById('noteTitleInput').focus(), 100);
}

/**
 * ===================================================================
 * DATA EXPORT & BACKUP
 * ===================================================================
 */

/**
 * Export wedding expenses and checklist to CSV
 */
function exportExpensesToCSV() {
  if (state.items.length === 0) {
    showToast('No items to export', 'info');
    return;
  }

  const headers = [
    'Item Name',
    'Category',
    'Quantity',
    'Estimated Price (INR)',
    'Total Estimated (INR)',
    'Actual Price (INR)',
    'Total Actual (INR)',
    'Shop / Website',
    'Status',
    'Notes'
  ];

  const rows = state.items.map(item => {
    const qty = item.quantity || 1;
    const estTotal = (cleanNumber(item.estPrice)) * qty;
    const actTotal = cleanNumber(item.actualPrice) > 0 ? cleanNumber(item.actualPrice) * qty : 0;

    return [
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      qty,
      cleanNumber(item.estPrice),
      estTotal,
      cleanNumber(item.actualPrice),
      actTotal,
      `"${(item.shop || '').replace(/"/g, '""')}"`,
      `"${item.status}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Wedding_Expenses_Planner_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Expenses successfully exported to CSV!', 'success');
}

/**
 * Download pre-formatted sample sheet template for adding wedding data
 */
function downloadSampleSheetCSV() {
  const headers = [
    'Item Name',
    'Category',
    'Quantity',
    'Estimated Price (INR)',
    'Actual Price (INR)',
    'Shop / Website',
    'Purchase Status',
    'Notes'
  ];

  const sampleRows = [
    ['Bridal Lehenga (Pastel Rose Gold)', 'Bridal Outfits', '1', '125000', '130000', 'Karol Bagh Boutique', 'Purchased', 'Trial scheduled 2 weeks before wedding'],
    ['Bridal Kundan & Polki Jewellery Set', 'Jewellery and Accessories', '1', '350000', '340000', 'Tanishq Jewellers', 'Purchased', 'Includes choker necklace and earrings'],
    ['Bridal Makeup Artist (3 Functions)', 'Makeup and Skincare', '1', '65000', '60000', 'Glamour Studios', 'Purchased', 'Advance paid 20000'],
    ['Groom\'s Sherwani & Stole', 'Groom\'s Shopping', '1', '75000', '72000', 'Manyavar Mohey', 'Purchased', 'Includes safa and matching mojari'],
    ['Wedding Photography & Cinematic Film', 'Photography', '1', '180000', '175000', 'Memories Studio', 'Purchased', 'Drone coverage and 2 albums included'],
    ['Luxury Return Gift Hampers', 'Wedding Gifts', '150', '600', '0', 'Saffron Confectionery', 'Pending', 'Dry fruits and brass diya set per box'],
    ['Floral Mandap & Stage Decoration', 'Wedding Decorations', '1', '220000', '0', 'Royal Blooms Décor', 'Pending', 'Pastel roses and warm fairy lights theme'],
    ['Bridal Footwear (Heels & Juttis)', 'Footwear and Bags', '2', '7500', '6750', 'Fizzy Goblet', 'Purchased', 'Cushioned comfortable soles'],
    ['Pre-Bridal Hair Spa & Treatment Kit', 'Haircare', '1', '12000', '0', 'Salon & Spa', 'Pending', '4 sessions booked'],
    ['Silver Puja Thali & Wedding Essentials', 'Household Items', '1', '28000', '0', 'Zaveri Bazaar', 'Pending', 'Requires coconut and silver coins'],
    ['Catering & Welcome Drinks', 'Food', '300', '1200', '0', 'Royal Caterers', 'Pending', 'North Indian & Continental spread'],
    ['Guest Hotel Accommodation & Cabs', 'Travel', '10', '15000', '0', 'Grand Palace Hotel', 'Pending', 'Rooms for outstation family']
  ];

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [
    headers.join(','),
    ...sampleRows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'Wedding_Planner_Sample_Sheet.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Sample Sheet downloaded successfully!', 'success');
}

/**
 * Robust CSV parser for importing wedding data sheets
 */
function parseCSVText(csvText) {
  const lines = [];
  let row = [''];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push('');
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      if (row.length > 1 || row[0] !== '') {
        lines.push(row);
      }
      row = [''];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== '') {
    lines.push(row);
  }

  if (lines.length < 2) return [];

  // Parse header
  const rawHeaders = lines[0].map(h => h.trim().toLowerCase());
  const headerMap = {};
  rawHeaders.forEach((h, idx) => {
    if (h.includes('item') || h.includes('name')) headerMap.name = idx;
    else if (h.includes('category') || h.includes('cat')) headerMap.category = idx;
    else if (h.includes('quantity') || h.includes('qty')) headerMap.quantity = idx;
    else if (h.includes('est') || h.includes('estimate')) headerMap.estPrice = idx;
    else if (h.includes('act') || h.includes('actual') || h.includes('spent')) headerMap.actualPrice = idx;
    else if (h.includes('shop') || h.includes('store') || h.includes('website')) headerMap.shop = idx;
    else if (h.includes('status')) headerMap.status = idx;
    else if (h.includes('note')) headerMap.notes = idx;
  });

  if (headerMap.name === undefined) headerMap.name = 0;
  if (headerMap.category === undefined) headerMap.category = 1;
  if (headerMap.quantity === undefined) headerMap.quantity = 2;
  if (headerMap.estPrice === undefined) headerMap.estPrice = 3;
  if (headerMap.actualPrice === undefined) headerMap.actualPrice = 4;
  if (headerMap.shop === undefined) headerMap.shop = 5;
  if (headerMap.status === undefined) headerMap.status = 6;
  if (headerMap.notes === undefined) headerMap.notes = 7;

  const validCategories = [
    'Bridal Outfits', 'Jewellery and Accessories', 'Makeup and Skincare',
    'Haircare', 'Footwear and Bags', "Groom's Shopping", 'Wedding Gifts',
    'Household Items', 'Wedding Decorations', 'Food', 'Travel', 'Photography', 'Other Expenses'
  ];

  const parsedItems = [];
  for (let i = 1; i < lines.length; i++) {
    const r = lines[i];
    const name = (r[headerMap.name] || '').trim();
    if (!name) continue;

    let cat = (r[headerMap.category] || '').trim();
    const matchedCat = validCategories.find(c => c.toLowerCase() === cat.toLowerCase());
    if (matchedCat) {
      cat = matchedCat;
    } else {
      cat = 'Other Expenses';
    }

    const qty = Math.max(1, parseInt(r[headerMap.quantity]) || 1);
    const estPrice = cleanNumber(r[headerMap.estPrice]);
    const actVal = r[headerMap.actualPrice] !== undefined ? cleanNumber(r[headerMap.actualPrice]) : 0;
    const shop = (r[headerMap.shop] || '').trim();
    
    let status = (r[headerMap.status] || 'Pending').trim();
    if (/purchased/i.test(status)) status = 'Purchased';
    else if (/not/i.test(status)) status = 'Not Required';
    else status = 'Pending';

    const notes = (r[headerMap.notes] || '').trim();

    parsedItems.push({
      id: generateId('item'),
      name,
      category: cat,
      quantity: qty,
      estPrice,
      actualPrice: actVal > 0 ? actVal : (status === 'Purchased' ? estPrice : 0),
      shop,
      status,
      notes,
      createdAt: Date.now() + i
    });
  }

  return parsedItems;
}

/**
 * Export full JSON backup
 */
function exportJSONBackup() {
  const data = {
    appName: 'Eternal Vows Wedding Preparation Planner',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    budget: state.budget,
    weddingDate: state.weddingDate,
    items: state.items,
    tasks: state.tasks,
    notes: state.notes
  };

  const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', jsonStr);
  link.setAttribute('download', `Wedding_Planner_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Full backup file downloaded safely!', 'success');
}

/**
 * Import JSON backup
 */
function handleJSONImport(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (typeof parsed.budget !== 'undefined' || Array.isArray(parsed.items)) {
        state.budget = Number(parsed.budget) || 0;
        state.weddingDate = parsed.weddingDate || '';
        state.items = Array.isArray(parsed.items) ? parsed.items : [];
        state.tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
        state.notes = Array.isArray(parsed.notes) ? parsed.notes : [];

        saveState();
        refreshAllViews();
        showToast('Wedding backup restored successfully!', 'success');
      } else {
        showToast('Invalid wedding backup file format.', 'danger');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not parse the backup file.', 'danger');
    }
  };
  reader.readAsText(file);
}

/**
 * Safe reset all data
 */
function handleResetAllData() {
  showConfirmModal(
    'Reset All Wedding Data?',
    'This will permanently delete all your custom expenses, budget, tasks, and notes from this browser. This cannot be undone.',
    () => {
      localStorage.removeItem(STORAGE_KEY);
      state.budget = 0;
      state.weddingDate = '';
      state.items = [];
      state.tasks = [];
      state.notes = [];
      saveState();
      refreshAllViews();
      showToast('All wedding data has been reset.', 'info');
    }
  );
}

/**
 * Load sample demo data
 */
function handleLoadSampleData() {
  showConfirmModal(
    'Load Sample Wedding Data?',
    'This will replace your current planner with a realistic ₹15,00,000 wedding budget dataset, checklist items, and tasks.',
    () => {
      initStarterData();
      refreshAllViews();
      showToast('Sample wedding data loaded!', 'success');
    }
  );
}

/**
 * ===================================================================
 * REFRESH ALL VIEWS
 * ===================================================================
 */

function refreshAllViews() {
  // Sync wedding date input
  const dateInput = document.getElementById('weddingDateInput');
  if (dateInput) {
    dateInput.value = state.weddingDate || '';
  }

  updateWeddingCountdown();
  updateDashboard();
  renderCategoryBreakdown();
  renderShoppingList();
  renderTaskList();
  renderNotes();
}

/**
 * ===================================================================
 * EVENT LISTENERS SETUP
 * ===================================================================
 */

function setupEventListeners() {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('show');
    });
  }

  // Close mobile nav when link clicked
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mainNav) mainNav.classList.remove('show');
    });
  });

  // 2. Wedding Date change
  const weddingDateInput = document.getElementById('weddingDateInput');
  if (weddingDateInput) {
    weddingDateInput.addEventListener('change', (e) => {
      state.weddingDate = e.target.value;
      saveState();
      updateWeddingCountdown();
      showToast('Wedding date updated!', 'info');
    });
  }

  // 3. Set Budget Buttons
  const btnOpenSetBudget = document.getElementById('btnOpenSetBudget');
  const btnEditBudgetQuick = document.getElementById('btnEditBudgetQuick');
  if (btnOpenSetBudget) btnOpenSetBudget.addEventListener('click', openBudgetModal);
  if (btnEditBudgetQuick) btnEditBudgetQuick.addEventListener('click', openBudgetModal);

  // Live preview inside Budget input
  const budgetAmountInput = document.getElementById('budgetAmountInput');
  const budgetFormatPreview = document.getElementById('budgetFormatPreview');
  if (budgetAmountInput && budgetFormatPreview) {
    budgetAmountInput.addEventListener('input', (e) => {
      const val = cleanNumber(e.target.value);
      budgetFormatPreview.textContent = `Preview: ${formatINR(val)}`;
    });
  }

  // Budget Form Submit
  const formBudget = document.getElementById('formBudget');
  if (formBudget) {
    formBudget.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = cleanNumber(document.getElementById('budgetAmountInput').value);
      state.budget = val;
      saveState();
      updateDashboard();
      closeModal(document.getElementById('modalBudget'));
      showToast(`Total wedding budget updated to ${formatINR(val)}!`, 'success');
    });
  }

  // 4. Add & Clear Item Buttons
  const btnOpenAddItem = document.getElementById('btnOpenAddItem');
  const btnAddNewItemMain = document.getElementById('btnAddNewItemMain');
  const btnEmptyStateAddItem = document.getElementById('btnEmptyStateAddItem');
  const btnClearAllItems = document.getElementById('btnClearAllItems');

  if (btnOpenAddItem) btnOpenAddItem.addEventListener('click', () => openAddItemModal());
  if (btnAddNewItemMain) btnAddNewItemMain.addEventListener('click', () => openAddItemModal());
  if (btnEmptyStateAddItem) btnEmptyStateAddItem.addEventListener('click', () => openAddItemModal());

  if (btnClearAllItems) {
    btnClearAllItems.addEventListener('click', () => {
      if (state.items.length === 0) {
        showToast('There are no items to remove', 'info');
        return;
      }
      showConfirmModal(
        'Remove All Items?',
        `Are you sure you want to remove all ${state.items.length} items from your shopping checklist? This cannot be undone.`,
        () => {
          state.items = [];
          saveState();
          refreshAllViews();
          showToast('All items have been removed.', 'info');
        }
      );
    });
  }

  // Item Form Submit
  const formItem = document.getElementById('formItem');
  if (formItem) {
    formItem.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('itemIdInput').value;
      const name = document.getElementById('itemNameInput').value.trim();
      const category = document.getElementById('itemCategoryInput').value;
      const quantity = Math.max(1, parseInt(document.getElementById('itemQuantityInput').value) || 1);
      const estPrice = cleanNumber(document.getElementById('itemEstPriceInput').value);
      const actualPriceVal = document.getElementById('itemActualPriceInput').value;
      const actualPrice = actualPriceVal !== '' ? cleanNumber(actualPriceVal) : null;
      const shop = document.getElementById('itemShopInput').value.trim();
      const status = document.getElementById('itemStatusInput').value;
      const notes = document.getElementById('itemNotesInput').value.trim();

      if (!name) {
        showToast('Please provide an item name', 'danger');
        return;
      }

      if (editId) {
        // Edit existing item
        const item = state.items.find(i => i.id === editId);
        if (item) {
          item.name = name;
          item.category = category;
          item.quantity = quantity;
          item.estPrice = estPrice;
          item.actualPrice = actualPrice;
          item.shop = shop;
          item.status = status;
          item.notes = notes;
          showToast(`Updated "${name}"`, 'success');
        }
      } else {
        // Add new item
        const newItem = {
          id: generateId('item'),
          name,
          category,
          quantity,
          estPrice,
          actualPrice,
          shop,
          status,
          notes,
          createdAt: Date.now()
        };
        state.items.unshift(newItem);
        showToast(`Added "${name}" to checklist!`, 'success');
      }

      saveState();
      refreshAllViews();
      closeModal(document.getElementById('modalItem'));
    });
  }

  // 5. Items Table Delegate Actions (Toggle status, Edit, Delete)
  const itemsTableBody = document.getElementById('itemsTableBody');
  if (itemsTableBody) {
    itemsTableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const itemId = btn.dataset.id;
      const item = state.items.find(i => i.id === itemId);
      if (!item) return;

      if (action === 'toggle-status') {
        item.status = item.status === 'Purchased' ? 'Pending' : 'Purchased';
        // If marked purchased and actual price was empty, set it to estimated price
        if (item.status === 'Purchased' && (item.actualPrice === null || item.actualPrice === 0)) {
          item.actualPrice = item.estPrice;
        }
        saveState();
        refreshAllViews();
        showToast(`Marked "${item.name}" as ${item.status}`, 'success');
      } else if (action === 'edit-item') {
        openAddItemModal(itemId);
      } else if (action === 'delete-item') {
        showConfirmModal(
          'Delete Item?',
          `Are you sure you want to remove "${item.name}" from your wedding planner?`,
          () => {
            state.items = state.items.filter(i => i.id !== itemId);
            saveState();
            refreshAllViews();
            showToast(`Deleted "${item.name}"`, 'info');
          }
        );
      }
    });
  }

  // 6. Search & Filters for Shopping/Expenses
  const searchInput = document.getElementById('searchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');
  if (searchInput && btnClearSearch) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      btnClearSearch.style.display = state.searchQuery ? 'block' : 'none';
      renderShoppingList();
    });

    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      btnClearSearch.style.display = 'none';
      renderShoppingList();
      searchInput.focus();
    });
  }

  // Category filter dropdown
  const filterCategory = document.getElementById('filterCategory');
  if (filterCategory) {
    filterCategory.addEventListener('change', (e) => {
      state.filterCategory = e.target.value;
      renderShoppingList();
    });
  }

  // Status pills filter
  const statusFilterPills = document.getElementById('statusFilterPills');
  if (statusFilterPills) {
    statusFilterPills.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      statusFilterPills.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filterStatus = btn.dataset.status;
      renderShoppingList();
    });
  }

  // Sort dropdown
  const sortExpense = document.getElementById('sortExpense');
  if (sortExpense) {
    sortExpense.addEventListener('change', (e) => {
      state.sortExpense = e.target.value;
      renderShoppingList();
    });
  }

  // 7. Tasks Management
  const btnAddNewTaskMain = document.getElementById('btnAddNewTaskMain');
  if (btnAddNewTaskMain) btnAddNewTaskMain.addEventListener('click', () => openAddTaskModal());

  // Task Filter Pills
  const taskStatusFilters = document.getElementById('taskStatusFilters');
  if (taskStatusFilters) {
    taskStatusFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      taskStatusFilters.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.taskFilterStatus = btn.dataset.taskStatus;
      renderTaskList();
    });
  }

  // Task Priority Filter
  const filterTaskPriority = document.getElementById('filterTaskPriority');
  if (filterTaskPriority) {
    filterTaskPriority.addEventListener('change', (e) => {
      state.taskFilterPriority = e.target.value;
      renderTaskList();
    });
  }

  // Task Form Submit
  const formTask = document.getElementById('formTask');
  if (formTask) {
    formTask.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('taskIdInput').value;
      const title = document.getElementById('taskTitleInput').value.trim();
      const dueDate = document.getElementById('taskDueDateInput').value;
      const priority = document.getElementById('taskPriorityInput').value;
      const status = document.getElementById('taskStatusInput').value;
      const notes = document.getElementById('taskNotesInput').value.trim();

      if (!title) {
        showToast('Please enter a task description', 'danger');
        return;
      }

      if (editId) {
        const task = state.tasks.find(t => t.id === editId);
        if (task) {
          task.title = title;
          task.dueDate = dueDate;
          task.priority = priority;
          task.status = status;
          task.notes = notes;
          showToast(`Task updated!`, 'success');
        }
      } else {
        const newTask = {
          id: generateId('task'),
          title,
          dueDate,
          priority,
          status,
          notes,
          createdAt: Date.now()
        };
        state.tasks.unshift(newTask);
        showToast('Added preparation task!', 'success');
      }

      saveState();
      refreshAllViews();
      closeModal(document.getElementById('modalTask'));
    });
  }

  // Task list event delegation (checkbox toggle, edit, delete)
  const taskListContainer = document.getElementById('taskListContainer');
  if (taskListContainer) {
    taskListContainer.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.dataset.action;
      const taskId = target.dataset.id;
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return;

      if (action === 'toggle-task') {
        task.status = task.status === 'Completed' ? 'Pending' : 'Completed';
        saveState();
        refreshAllViews();
        showToast(task.status === 'Completed' ? `Completed: "${task.title}" 🎉` : `Reopened: "${task.title}"`, 'info');
      } else if (action === 'edit-task') {
        openAddTaskModal(taskId);
      } else if (action === 'delete-task') {
        showConfirmModal(
          'Delete Task?',
          `Remove "${task.title}" from your preparations?`,
          () => {
            state.tasks = state.tasks.filter(t => t.id !== taskId);
            saveState();
            refreshAllViews();
            showToast('Task removed', 'info');
          }
        );
      }
    });
  }

  // 8. Notes Management
  const btnAddNewNote = document.getElementById('btnAddNewNote');
  if (btnAddNewNote) btnAddNewNote.addEventListener('click', () => openAddNoteModal());

  const formNote = document.getElementById('formNote');
  if (formNote) {
    formNote.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('noteIdInput').value;
      const title = document.getElementById('noteTitleInput').value.trim();
      const category = document.getElementById('noteCategoryInput').value;
      const content = document.getElementById('noteContentInput').value.trim();

      if (!title || !content) {
        showToast('Please enter note title and details', 'danger');
        return;
      }

      if (editId) {
        const note = state.notes.find(n => n.id === editId);
        if (note) {
          note.title = title;
          note.category = category;
          note.content = content;
          note.updatedAt = 'Just now';
          showToast('Note updated!', 'success');
        }
      } else {
        const newNote = {
          id: generateId('note'),
          title,
          category,
          content,
          updatedAt: 'Just now'
        };
        state.notes.unshift(newNote);
        showToast('Added new note!', 'success');
      }

      saveState();
      renderNotes();
      closeModal(document.getElementById('modalNote'));
    });
  }

  // Notes event delegation (edit, delete)
  const notesGridContainer = document.getElementById('notesGridContainer');
  if (notesGridContainer) {
    notesGridContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const noteId = btn.dataset.id;
      const note = state.notes.find(n => n.id === noteId);
      if (!note) return;

      if (action === 'edit-note') {
        openAddNoteModal(noteId);
      } else if (action === 'delete-note') {
        showConfirmModal(
          'Delete Note?',
          `Are you sure you want to delete note "${note.title}"?`,
          () => {
            state.notes = state.notes.filter(n => n.id !== noteId);
            saveState();
            renderNotes();
            showToast('Note deleted', 'info');
          }
        );
      }
    });
  }

  // 9. Data, Backup & CSV Exports
  const btnExportCSV = document.getElementById('btnExportCSV');
  const btnQuickExportSummary = document.getElementById('btnQuickExportSummary');
  if (btnExportCSV) btnExportCSV.addEventListener('click', exportExpensesToCSV);
  if (btnQuickExportSummary) btnQuickExportSummary.addEventListener('click', exportExpensesToCSV);

  const btnBackupJSON = document.getElementById('btnBackupJSON');
  if (btnBackupJSON) btnBackupJSON.addEventListener('click', exportJSONBackup);

  const importFileInput = document.getElementById('importFileInput');
  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleJSONImport(e.target.files[0]);
        e.target.value = ''; // Reset input
      }
    });
  }

  const btnResetAllData = document.getElementById('btnResetAllData');
  if (btnResetAllData) btnResetAllData.addEventListener('click', handleResetAllData);

  const btnLoadDemoData = document.getElementById('btnLoadDemoData');
  if (btnLoadDemoData) btnLoadDemoData.addEventListener('click', handleLoadSampleData);

  // 10. Sample Sheet & CSV Import Modal Handling
  let parsedCsvPendingItems = [];

  const btnOpenSampleSheetModal = document.getElementById('btnOpenSampleSheetModal');
  const btnOpenSampleSheetModalFromSettings = document.getElementById('btnOpenSampleSheetModalFromSettings');
  const modalSampleSheet = document.getElementById('modalSampleSheet');

  function openSampleSheetModal() {
    parsedCsvPendingItems = [];
    const previewArea = document.getElementById('csvPreviewArea');
    const confirmBtn = document.getElementById('btnConfirmImportCsv');
    const fileNameDisplay = document.getElementById('csvFileNameDisplay');
    const fileInput = document.getElementById('modalCsvFileInput');

    if (previewArea) previewArea.style.display = 'none';
    if (confirmBtn) confirmBtn.setAttribute('disabled', 'true');
    if (fileNameDisplay) fileNameDisplay.textContent = 'No file chosen yet';
    if (fileInput) fileInput.value = '';

    openModal(modalSampleSheet);
  }

  if (btnOpenSampleSheetModal) btnOpenSampleSheetModal.addEventListener('click', openSampleSheetModal);
  if (btnOpenSampleSheetModalFromSettings) btnOpenSampleSheetModalFromSettings.addEventListener('click', openSampleSheetModal);

  const btnDownloadSampleSheet = document.getElementById('btnDownloadSampleSheet');
  const btnDownloadSampleSheetModal = document.getElementById('btnDownloadSampleSheetModal');
  if (btnDownloadSampleSheet) btnDownloadSampleSheet.addEventListener('click', downloadSampleSheetCSV);
  if (btnDownloadSampleSheetModal) btnDownloadSampleSheetModal.addEventListener('click', downloadSampleSheetCSV);

  const modalCsvFileInput = document.getElementById('modalCsvFileInput');
  if (modalCsvFileInput) {
    modalCsvFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const fileNameDisplay = document.getElementById('csvFileNameDisplay');
      if (fileNameDisplay) fileNameDisplay.textContent = file.name;

      const reader = new FileReader();
      reader.onload = function(evt) {
        parsedCsvPendingItems = parseCSVText(evt.target.result);
        const previewArea = document.getElementById('csvPreviewArea');
        const previewCount = document.getElementById('csvPreviewCount');
        const previewList = document.getElementById('csvPreviewList');
        const confirmBtn = document.getElementById('btnConfirmImportCsv');

        if (parsedCsvPendingItems.length > 0) {
          if (previewCount) previewCount.textContent = parsedCsvPendingItems.length;
          if (previewList) {
            previewList.innerHTML = parsedCsvPendingItems.slice(0, 10).map(item => 
              `<div style="display:flex; justify-content:space-between; padding:3px 0; border-bottom:1px solid #f0f0f0;">
                 <span><strong>${escapeHtml(item.name)}</strong> (${escapeHtml(item.category)})</span>
                 <span>Qty: ${item.quantity} • Est: ${formatINR(item.estPrice * item.quantity)}</span>
               </div>`
            ).join('') + (parsedCsvPendingItems.length > 10 ? `<div style="padding-top:4px; color:#888; text-align:center;">+ ${parsedCsvPendingItems.length - 10} more items</div>` : '');
          }
          if (previewArea) previewArea.style.display = 'block';
          if (confirmBtn) confirmBtn.removeAttribute('disabled');
          showToast(`Read ${parsedCsvPendingItems.length} items from CSV`, 'info');
        } else {
          if (previewArea) previewArea.style.display = 'none';
          if (confirmBtn) confirmBtn.setAttribute('disabled', 'true');
          showToast('Could not find valid items in this CSV file. Please download the sample format to compare.', 'danger');
        }
      };
      reader.readAsText(file);
    });
  }

  const btnConfirmImportCsv = document.getElementById('btnConfirmImportCsv');
  if (btnConfirmImportCsv) {
    btnConfirmImportCsv.addEventListener('click', () => {
      if (!parsedCsvPendingItems || parsedCsvPendingItems.length === 0) {
        showToast('No items to import', 'danger');
        return;
      }

      const replaceAll = document.getElementById('csvReplaceExistingCheckbox') && document.getElementById('csvReplaceExistingCheckbox').checked;

      if (replaceAll) {
        state.items = [...parsedCsvPendingItems];
      } else {
        state.items = [...parsedCsvPendingItems, ...state.items];
      }

      saveState();
      refreshAllViews();
      closeModal(modalSampleSheet);
      showToast(`Successfully added ${parsedCsvPendingItems.length} items to your planner!`, 'success');
      parsedCsvPendingItems = [];
    });
  }

  // 10. Generic Modal Close buttons (data-close-modal)
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  // Close modals when clicking backdrop
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  // ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // 11. Confirmation Modal Ok/Cancel
  const btnConfirmOk = document.getElementById('btnConfirmOk');
  const btnConfirmCancel = document.getElementById('btnConfirmCancel');
  if (btnConfirmOk) {
    btnConfirmOk.addEventListener('click', () => {
      if (typeof pendingConfirmCallback === 'function') {
        pendingConfirmCallback();
      }
      closeModal(document.getElementById('modalConfirm'));
      pendingConfirmCallback = null;
    });
  }
  if (btnConfirmCancel) {
    btnConfirmCancel.addEventListener('click', () => {
      closeModal(document.getElementById('modalConfirm'));
      pendingConfirmCallback = null;
    });
  }

  // 11. PWA Install App Buttons
  const btnInstallApp = document.getElementById('btnInstallApp');
  const btnInstallAppSettings = document.getElementById('btnInstallAppSettings');
  const btnTriggerInstallPromptModal = document.getElementById('btnTriggerInstallPromptModal');

  if (btnInstallApp) btnInstallApp.addEventListener('click', triggerInstallFlow);
  if (btnInstallAppSettings) btnInstallAppSettings.addEventListener('click', triggerInstallFlow);
  if (btnTriggerInstallPromptModal) btnTriggerInstallPromptModal.addEventListener('click', triggerInstallFlow);
}

/**
 * ===================================================================
 * PROGRESSIVE WEB APP (PWA) & SERVICE WORKER
 * ===================================================================
 */

let deferredInstallPrompt = null;

// Catch native PWA beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;

  // Make install buttons visible and prominent
  const btnInstallApp = document.getElementById('btnInstallApp');
  const btnTriggerInstallPromptModal = document.getElementById('btnTriggerInstallPromptModal');
  const btnInstallAppSettings = document.getElementById('btnInstallAppSettings');

  if (btnInstallApp) btnInstallApp.style.display = 'inline-flex';
  if (btnTriggerInstallPromptModal) btnTriggerInstallPromptModal.style.display = 'inline-flex';
  if (btnInstallAppSettings) {
    btnInstallAppSettings.classList.add('btn-primary');
    btnInstallAppSettings.classList.remove('btn-outline');
  }
});

// Trigger installation flow
function triggerInstallFlow() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('Installing Wedding Planner...', 'info');
      }
      deferredInstallPrompt = null;
    });
  } else {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      showToast('Wedding Planner is already installed and running!', 'info');
    } else {
      // Show instructional modal for browser/iOS Safari
      openModal(document.getElementById('modalInstallApp'));
    }
  }
}

// App installed successfully
window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  const btnInstallApp = document.getElementById('btnInstallApp');
  if (btnInstallApp) btnInstallApp.style.display = 'none';

  const statusText = document.getElementById('installCardStatusText');
  if (statusText) statusText.innerHTML = '<span class="status-badge status-purchased"><i class="fa-solid fa-circle-check"></i> Installed as Standalone App</span>';

  const installBtnText = document.getElementById('installBtnText');
  if (installBtnText) installBtnText.textContent = 'App Installed';

  const btnSettings = document.getElementById('btnInstallAppSettings');
  if (btnSettings) btnSettings.setAttribute('disabled', 'true');

  showToast('Wedding Planner installed successfully! 🎉', 'success');
});

// Register Service Worker for offline capability
function registerServiceWorker() {
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('Wedding Planner ServiceWorker registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.log('ServiceWorker registration skipped or failed:', err);
        });
    });
  }
}

/**
 * ===================================================================
 * INITIALIZATION ON PAGE LOAD
 * ===================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setupEventListeners();
  refreshAllViews();
  registerServiceWorker();

  // Check if already standalone on load
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isStandalone) {
    const statusText = document.getElementById('installCardStatusText');
    if (statusText) statusText.innerHTML = '<span class="status-badge status-purchased"><i class="fa-solid fa-circle-check"></i> Running as Installed App</span>';
    const installBtnText = document.getElementById('installBtnText');
    if (installBtnText) installBtnText.textContent = 'Installed';
    const btnInstallApp = document.getElementById('btnInstallApp');
    if (btnInstallApp) btnInstallApp.style.display = 'none';
  } else {
    // Show install button in header on desktop/mobile browsers
    const btnInstallApp = document.getElementById('btnInstallApp');
    if (btnInstallApp) btnInstallApp.style.display = 'inline-flex';
  }

  // Periodic countdown check every minute
  setInterval(updateWeddingCountdown, 60000);
});
