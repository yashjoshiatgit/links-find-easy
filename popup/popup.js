// DOM Elements
const tabLinks = document.getElementById('tab-links');
const tabAutofill = document.getElementById('tab-autofill');
const tabSettings = document.getElementById('tab-settings');
const linksList = document.querySelector('.links-container');
const addLinkBtn = document.getElementById('add-link-btn');
const linkModal = document.getElementById('link-modal');
const closeModal = document.querySelector('.close-modal');
const modalTitle = document.getElementById('modal-title');
const linkForm = document.getElementById('link-form');
const platformSelect = document.getElementById('platform-select');
const customPlatformField = document.getElementById('custom-platform-field');
const customPlatform = document.getElementById('custom-platform');
const platformUrl = document.getElementById('platform-url');
const displayName = document.getElementById('display-name');
const keywords = document.getElementById('keywords');
const cancelBtn = document.getElementById('cancel-btn');
const saveLinkBtn = document.getElementById('save-link-btn');
const searchInput = document.getElementById('search-links');
const clearAllBtn = document.getElementById('clear-all-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const autoDetectToggle = document.getElementById('auto-detect');
const showNotificationsToggle = document.getElementById('show-notifications');
const detectionStatus = document.getElementById('detection-status');
const detectedFields = document.querySelector('.detected-fields');
const autofillAllBtn = document.getElementById('autofill-all-btn');

// Global variables
let links = [];
let currentEditId = null;
let detectedFormFields = [];

// Platform icons (Font Awesome)
const platformIcons = {
  linkedin: 'fab fa-linkedin-in',
  github: 'fab fa-github',
  leetcode: 'fas fa-code',
  medium: 'fab fa-medium-m',
  codeforces: 'fas fa-laptop-code',
  hackerrank: 'fab fa-hackerrank',
  portfolio: 'fas fa-globe',
  twitter: 'fab fa-twitter',
  dribbble: 'fab fa-dribbble',
  behance: 'fab fa-behance',
  custom: 'fas fa-link'
};

// Initialize Extension
document.addEventListener('DOMContentLoaded', () => {
  loadLinks();
  initTabNavigation();
  initEventListeners();
  loadSettings();
  
  // If on autofill tab, scan for fields
  if (document.getElementById('autofill-section').classList.contains('active')) {
    scanForFormFields();
  }
});

// Load links from storage
function loadLinks() {
  chrome.storage.sync.get(['profileLinks'], (result) => {
    if (result.profileLinks) {
      links = result.profileLinks;
      renderLinks();
    }
  });
}

// Initialize tab navigation
function initTabNavigation() {
  const tabs = [
    { tab: tabLinks, content: 'links-section' },
    { tab: tabAutofill, content: 'autofill-section' },
    { tab: tabSettings, content: 'settings-section' }
  ];
  
  tabs.forEach(({ tab, content }) => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      document.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      document.getElementById(content).classList.add('active');
      
      // If autofill tab is selected, scan for form fields
      if (content === 'autofill-section') {
        scanForFormFields();
      }
    });
  });
}

// Initialize event listeners
function initEventListeners() {
  // Add link button
  addLinkBtn.addEventListener('click', () => {
    openModal();
  });
  
  // Close modal buttons
  closeModal.addEventListener('click', closeModalHandler);
  cancelBtn.addEventListener('click', closeModalHandler);
  
  // Platform type change
  platformSelect.addEventListener('change', () => {
    if (platformSelect.value === 'custom') {
      customPlatformField.classList.remove('hidden');
    } else {
      customPlatformField.classList.add('hidden');
    }
  });
  
  // Save link form
  linkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveLink();
  });
  
  // Search functionality
  searchInput.addEventListener('input', () => {
    renderLinks(searchInput.value.toLowerCase());
  });
  
  // Settings event listeners
  clearAllBtn.addEventListener('click', clearAllData);
  exportBtn.addEventListener('click', exportData);
  importBtn.addEventListener('click', importData);
  
  // Toggle settings
  autoDetectToggle.addEventListener('change', saveSettings);
  showNotificationsToggle.addEventListener('change', saveSettings);
  
  // Autofill button
  autofillAllBtn.addEventListener('click', () => {
    autofillAllFields();
  });
}

// Render links in the list
function renderLinks(searchTerm = '') {
  linksList.innerHTML = '';
  
  if (links.length === 0) {
    linksList.innerHTML = `
      <div class="empty-state">
        <p>No profile links added yet.</p>
        <p>Click "Add New Link" to get started.</p>
      </div>
    `;
    return;
  }
  
  const filteredLinks = searchTerm 
    ? links.filter(link => {
        const platformName = link.customPlatform || link.platform;
        return platformName.toLowerCase().includes(searchTerm) || 
               link.url.toLowerCase().includes(searchTerm) ||
               (link.displayName && link.displayName.toLowerCase().includes(searchTerm));
      })
    : links;
  
  filteredLinks.forEach(link => {
    const platformName = link.customPlatform || capitalizeFirstLetter(link.platform);
    const displayText = link.displayName || platformName;
    const icon = platformIcons[link.platform] || 'fas fa-link';
    
    const linkItem = document.createElement('div');
    linkItem.className = 'link-item fade-in';
    linkItem.innerHTML = `
      <div class="platform-icon">
        <i class="${icon}"></i>
      </div>
      <div class="link-details">
        <div class="platform-name">${displayText}</div>
        <div class="platform-url">${link.url}</div>
      </div>
      <div class="link-actions">
        <button class="action-btn copy" title="Copy URL" data-id="${link.id}">
          <i class="fas fa-copy"></i>
        </button>
        <button class="action-btn edit" title="Edit" data-id="${link.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete" title="Delete" data-id="${link.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    linksList.appendChild(linkItem);
  });
  
  // Add event listeners to buttons
  document.querySelectorAll('.action-btn.copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const linkId = btn.getAttribute('data-id');
      const link = links.find(l => l.id === linkId);
      copyToClipboard(link.url);
      showToast('Copied to clipboard!');
    });
  });
  
  document.querySelectorAll('.action-btn.edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const linkId = btn.getAttribute('data-id');
      editLink(linkId);
    });
  });
  
  document.querySelectorAll('.action-btn.delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const linkId = btn.getAttribute('data-id');
      deleteLink(linkId);
    });
  });
}

// Open modal for adding/editing link
function openModal(linkId = null) {
  modalTitle.textContent = linkId ? 'Edit Link' : 'Add New Link';
  currentEditId = linkId;
  
  if (linkId) {
    const link = links.find(l => l.id === linkId);
    
    platformSelect.value = link.platform;
    platformUrl.value = link.url;
    displayName.value = link.displayName || '';
    keywords.value = link.keywords || '';
    
    if (link.platform === 'custom') {
      customPlatformField.classList.remove('hidden');
      customPlatform.value = link.customPlatform || '';
    } else {
      customPlatformField.classList.add('hidden');
    }
  } else {
    // Reset form for new link
    linkForm.reset();
    customPlatformField.classList.add('hidden');
  }
  
  linkModal.style.display = 'block';
}

// Close modal
function closeModalHandler() {
  linkModal.style.display = 'none';
  currentEditId = null;
  linkForm.reset();
}

function saveLink() {
  const platform = platformSelect.value;
  const url = platformUrl.value.trim();
  const name = displayName.value.trim();
  const keywordList = keywords.value.trim();
  let customName = '';

  if (platform === 'custom') {
    customName = customPlatform.value.trim();
    if (!customName) {
      showToast('Please enter a name for the custom platform', 'error');
      return;
    }
  }

  chrome.storage.sync.get(['profileLinks'], (result) => {
    let updatedLinks = result.profileLinks || [];

    // Check for duplicate platform (except for custom platforms)
    if (platform !== 'custom') {
      const platformExists = updatedLinks.some(
        link => link.platform === platform && link.id !== currentEditId
      );
      
      if (platformExists) {
        showToast('This platform already exists! Use custom platform!', 'error');
        return;
      }
    }

    const newLink = {
      id: currentEditId || generateId(),
      platform,
      url,
      displayName: name,
      keywords: keywordList,
      customPlatform: customName,
    };

    if (currentEditId) {
      // Update existing link
      updatedLinks = updatedLinks.map(link => 
        link.id === currentEditId ? newLink : link
      );
    } else {
      // Add new link
      updatedLinks.push(newLink);
    }

    // Save to storage
    chrome.storage.sync.set({ profileLinks: updatedLinks }, () => {
      // Update local links array
      links = updatedLinks;
      // Re-render the list
      renderLinks();
      closeModalHandler();
      showToast(`Link ${currentEditId ? 'updated' : 'added'} successfully!`);
    });
  });
}

// Edit link
function editLink(linkId) {
  openModal(linkId);
}

// Delete link
function deleteLink(linkId) {
  if (confirm('Are you sure you want to delete this link?')) {
    links = links.filter(link => link.id !== linkId);
    
    chrome.storage.sync.set({ profileLinks: links }, () => {
      renderLinks();
      showToast('Link deleted successfully!');
    });
  }
}

// Clear all data
function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    chrome.storage.sync.clear(() => {
      links = [];
      renderLinks();
      loadSettings();
      showToast('All data cleared successfully!');
    });
  }
}

// Export data
function exportData() {
  chrome.storage.sync.get(['profileLinks', 'settings'], (result) => {
    const data = {
      profileLinks: result.profileLinks || [],
      settings: result.settings || getDefaultSettings()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'profile-link-manager-backup.json';
    a.click();
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  });
}

// Import data
function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (data.profileLinks) {
          chrome.storage.sync.set({ profileLinks: data.profileLinks }, () => {
            links = data.profileLinks;
            renderLinks();
          });
        }
        
        if (data.settings) {
          chrome.storage.sync.set({ settings: data.settings }, () => {
            loadSettings();
          });
        }
        
        showToast('Data imported successfully!');
      } catch (err) {
        showToast('Invalid backup file!', 'error');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

// Load settings
function loadSettings() {
  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || getDefaultSettings();
    
    autoDetectToggle.checked = settings.autoDetect;
    showNotificationsToggle.checked = settings.showNotifications;
  });
}

// Save settings
function saveSettings() {
  const settings = {
    autoDetect: autoDetectToggle.checked,
    showNotifications: showNotificationsToggle.checked
  };
  
  chrome.storage.sync.set({ settings }, () => {
    showToast('Settings saved!');
  });
}

// Get default settings
function getDefaultSettings() {
  return {
    autoDetect: true,
    showNotifications: true
  };
}

// Scan for form fields on the current page
function scanForFormFields() {
  detectionStatus.innerHTML = `
    <div class="scanning-indicator"></div>
    <span>Scanning page for form fields...</span>
  `;
  autofillAllBtn.disabled = true;
  detectedFields.innerHTML = '';

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const activeTab = tabs[0];
    
    try {
      // First check if we can access the page
      if (!activeTab.url || activeTab.url.startsWith('chrome://')) {
        throw new Error('Cannot access this page');
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: detectFormFields,
      });

      if (!results || !results[0]) {
        throw new Error('No results from page scan');
      }

      const fields = results[0].result || [];
      
      if (fields.length === 0) {
        detectionStatus.innerHTML = '<i class="fas fa-info-circle"></i> No form fields found on this page';
        return;
      }

      // Match fields with links
      const matchedFields = fields.map(field => {
        const match = findBestMatch(field, links);
        return { ...field, ...match };
      });

      detectedFormFields = matchedFields.filter(f => f.confidence > 0);
      
      if (detectedFormFields.length > 0) {
        detectionStatus.innerHTML = `
          <i class="fas fa-check-circle"></i> 
          Found ${detectedFormFields.length} fillable field${detectedFormFields.length > 1 ? 's' : ''}
        `;
        autofillAllBtn.disabled = false;
      } else {
        detectionStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> No matching fields found';
      }
      
      renderDetectedFields(detectedFormFields);
      
    } catch (error) {
      console.error('Scanning error:', error);
      detectionStatus.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i> 
        Cannot scan this page. Please make sure you're on a regular webpage.
      `;
    }
  });
}

// Find best match for a field
function findBestMatch(field, links) {
  let bestMatch = { confidence: 0, link: null };
  
  // Combine all text fields for matching
  const fieldText = [
    field.label,
    field.placeholder,
    field.name,
    field.id
  ].filter(Boolean).join(' ').toLowerCase();

  for (const link of links) {
    let confidence = 0;
    
    // Check exact platform matches
    if (fieldText.includes(link.platform.toLowerCase())) {
      confidence = 0.9;
    }
    
    // Check custom platform name
    else if (link.customPlatform && 
             fieldText.includes(link.customPlatform.toLowerCase())) {
      confidence = 0.8;
    }
    
    // Check keywords
    else if (link.keywords) {
      const keywords = link.keywords.toLowerCase().split(',');
      for (const keyword of keywords) {
        if (fieldText.includes(keyword.trim())) {
          confidence = Math.max(confidence, 0.7);
          break;
        }
      }
    }

    if (confidence > bestMatch.confidence) {
      bestMatch = { confidence, link };
    }
  }

  return bestMatch;
}

// Render detected form fields
function renderDetectedFields(fields) {
  detectedFields.innerHTML = '';
  
  fields.forEach(field => {
    // Find matching link based on platform or label
    const matchingLink = findMatchingLink(field);
    
    const fieldItem = document.createElement('div');
    fieldItem.className = 'field-item fade-in';
    fieldItem.innerHTML = `
      <div class="field-details">
        <div class="field-name">${field.label}</div>
        ${matchingLink ? `<div class="suggested-link">Suggested: ${matchingLink.displayName || matchingLink.customPlatform || capitalizeFirstLetter(matchingLink.platform)}</div>` : ''}
      </div>
      <div class="field-actions">
        ${matchingLink ? `
          <button class="action-btn fill" title="Fill this field" data-field-id="${field.id}" data-link-id="${matchingLink.id}">
            <i class="fas fa-magic"></i>
          </button>
        ` : `
          <button class="action-btn no-match" title="No matching link found" disabled>
            <i class="fas fa-exclamation-circle"></i>
          </button>
        `}
      </div>
    `;
    
    detectedFields.appendChild(fieldItem);
  });
  
  // Add event listeners to fill buttons
  document.querySelectorAll('.action-btn.fill').forEach(btn => {
    btn.addEventListener('click', () => {
      const fieldId = btn.getAttribute('data-field-id');
      const linkId = btn.getAttribute('data-link-id');
      
      fillField(fieldId, linkId);
    });
  });
}

// Find matching link for a detected field
function findMatchingLink(field) {
  if (!links.length) return null;
  
  // If we have a specific platform match
  if (field.platform && field.platform !== 'generic' && field.platform !== 'unknown') {
    const exactMatch = links.find(link => link.platform === field.platform);
    if (exactMatch) return exactMatch;
  }
  
  // Try to match based on keywords in field label and link keywords
  const labelWords = field.label.toLowerCase().split(/\s+/);
  
  for (const link of links) {
    // Check if any of the link's keywords match the label
    if (link.keywords) {
      const linkKeywords = link.keywords.toLowerCase().split(/\s*,\s*/);
      
      for (const keyword of linkKeywords) {
        if (labelWords.some(word => word.includes(keyword) || keyword.includes(word))) {
          return link;
        }
      }
    }
    
    // Check if platform name is in the label
    const platformName = link.customPlatform?.toLowerCase() || link.platform.toLowerCase();
    if (labelWords.some(word => word.includes(platformName) || platformName.includes(word))) {
      return link;
    }
  }
  
  // If no match and field is generic, return first link as fallback
  if (field.platform === 'generic' || field.platform === 'unknown') {
    return links[0];
  }
  
  return null;
}

// Fill a single field
function fillField(fieldId, linkId) {
  const field = detectedFormFields.find(f => f.id === fieldId);
  const link = links.find(l => l.id === linkId);
  
  if (!field || !link) return;
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    
    chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      args: [field.selector, link.url],
      function: (selector, value) => {
        const element = document.querySelector(selector);
        if (element) {
          element.value = value;
          // Trigger change event
          const event = new Event('input', { bubbles: true });
          element.dispatchEvent(event);
          const changeEvent = new Event('change', { bubbles: true });
          element.dispatchEvent(changeEvent);
          return true;
        }
        return false;
      }
    }, (results) => {
      if (chrome.runtime.lastError) {
        showToast('Error filling field', 'error');
        return;
      }
      
      if (results[0].result) {
        showToast('Field filled successfully!');
      } else {
        showToast('Could not find field on page', 'error');
      }
    });
  });
}

// Autofill all fields
function autofillAllFields() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    
    // For each detected field that has a matching link
    const fillableFields = detectedFormFields.filter(field => {
      const matchingLink = findMatchingLink(field);
      return !!matchingLink;
    });
    
    if (fillableFields.length === 0) {
      showToast('No fields to autofill', 'warning');
      return;
    }
    
    const fieldData = fillableFields.map(field => {
      const matchingLink = findMatchingLink(field);
      return {
        selector: field.selector,
        value: matchingLink.url
      };
    });
    
    chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      args: [fieldData],
      function: (fieldsToFill) => {
        const results = fieldsToFill.map(({ selector, value }) => {
          const element = document.querySelector(selector);
          if (element) {
            element.value = value;
            // Trigger change event
            const event = new Event('input', { bubbles: true });
            element.dispatchEvent(event);
            const changeEvent = new Event('change', { bubbles: true });
            element.dispatchEvent(changeEvent);
            return true;
          }
          return false;
        });
        
        return results.filter(Boolean).length;
      }
    }, (results) => {
      if (chrome.runtime.lastError) {
        showToast('Error filling fields', 'error');
        return;
      }
      
      const filledCount = results[0].result;
      if (filledCount > 0) {
        showToast(`Successfully filled ${filledCount} fields!`);
      } else {
        showToast('Could not fill any fields', 'error');
      }
    });
  });
}

// Helper: Copy to clipboard
function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// Helper: Generate unique ID
function generateId() {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Helper: Capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper: Show toast notification
function showToast(message, type = 'success') {
  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || getDefaultSettings();
    
    if (!settings.showNotifications) return;
    
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove toast after animation completes (3s total)
    setTimeout(() => {
      toast.remove();
    }, 3000);
  });
}

// Remove the old toast styles since they're now in popup.css
const toastStylesElement = document.querySelector('style');
if (toastStylesElement) {
  toastStylesElement.remove();
}