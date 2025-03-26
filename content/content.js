// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "autofillProfileLinks") {
      // Implement autofill logic here based on the message data
      autofillLinks(message.links);
    } else if (message.action === "detectProfileLinks") {
      // Implement profile link detection logic here
      detectLinks();
    }
  });
  
  function autofillLinks(links) {
    console.log("Autofilling links:", links);
    alert("Autofilling links! Check the console for details."); // Replace with actual logic
  }
  
  function detectLinks() {
    // This function will detect profile links on the current page.
    console.log("Detecting links on the page.");
    alert("Detecting links! Check the console for details."); // Replace with actual logic
  }

function detectFormFields() {
  try {
    const formFields = [];
    const selectors = [
      'input[type="url"]',
      'input[type="text"]',
      'input:not([type])',
      'textarea',
      'input[placeholder*="link" i]',
      'input[placeholder*="profile" i]',
      'input[placeholder*="website" i]',
      'input[placeholder*="url" i]',
      'input[name*="link" i]',
      'input[name*="profile" i]',
      'input[name*="url" i]',
      'input[id*="link" i]',
      'input[id*="profile" i]',
      'input[id*="url" i]'
    ];

    const elements = document.querySelectorAll(selectors.join(','));
    
    elements.forEach((element, index) => {
      // Skip hidden elements
      if (element.type === 'hidden' || !isElementVisible(element)) {
        return;
      }

      const labelText = getLabelText(element);
      const uniqueSelector = generateUniqueSelector(element);

      if (uniqueSelector) {
        formFields.push({
          id: 'field_' + index,
          selector: uniqueSelector,
          type: element.type || 'text',
          label: labelText || element.placeholder || element.name || 'Unnamed Field',
          placeholder: element.placeholder || '',
          value: element.value || ''
        });
      }
    });

    return formFields;
  } catch (error) {
    console.error('Error detecting form fields:', error);
    return [];
  }
}

function isElementVisible(element) {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0';
}

function generateUniqueSelector(element) {
  if (element.id) {
    return '#' + CSS.escape(element.id);
  }

  if (element.name) {
    const nameSelector = `[name="${CSS.escape(element.name)}"]`;
    if (document.querySelectorAll(nameSelector).length === 1) {
      return nameSelector;
    }
  }

  // Generate path
  const path = [];
  let current = element;
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.tagName.toLowerCase();
    if (current.className) {
      const classes = Array.from(current.classList)
        .map(c => CSS.escape(c))
        .join('.');
      if (classes) {
        selector += '.' + classes;
      }
    }
    path.unshift(selector);
    current = current.parentNode;
  }

  return path.join(' > ');
}

function getLabelText(element) {
  // Try to find an associated label
  let label = document.querySelector(`label[for="${element.id}"]`);
  
  if (!label) {
    // Try parent label
    label = element.closest('label');
  }
  
  if (!label) {
    // Look for aria-label
    return element.getAttribute('aria-label') || 
           element.placeholder ||
           element.name ||
           '';
  }

  return label.textContent.trim();
}

function autofillFields(fields) {
  let filledCount = 0;
  
  fields.forEach(field => {
    const element = document.querySelector(field.selector);
    if (element) {
      element.value = field.value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      filledCount++;
    }
  });

  return filledCount;
}