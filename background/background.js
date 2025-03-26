// Listen for installation event
chrome.runtime.onInstalled.addListener(() => {
    // Initialize default settings if not already set
    chrome.storage.sync.get(['settings'], (result) => {
      if (!result.settings) {
        chrome.storage.sync.set({
          settings: {
            autoDetect: true,
            showNotifications: true
          }
        });
      }
    });
    
    // Initialize empty profile links array if not already set
    chrome.storage.sync.get(['profileLinks'], (result) => {
      if (!result.profileLinks) {
        chrome.storage.sync.set({ profileLinks: [] });
      }
    });
  });
  
  // Listen for messages from content script or popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getLinks') {
      chrome.storage.sync.get(['profileLinks'], (result) => {
        sendResponse({ links: result.profileLinks || [] });
      });
      return true; // Required for async response
    }
    
    if (message.action === 'getSettings') {
      chrome.storage.sync.get(['settings'], (result) => {
        sendResponse({ settings: result.settings || {
          autoDetect: true,
          showNotifications: true
        }});
      });
      return true; // Required for async response
    }
  });
