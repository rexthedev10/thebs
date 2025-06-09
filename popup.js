document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggleExtension');
  const statusIndicator = toggleButton.querySelector('.status-indicator');
  const statusText = toggleButton.querySelector('.status-text');
  const contextInput = document.getElementById('contextInput');
  const saveContextBtn = document.getElementById('saveContextBtn');

  // Load current state and context
  chrome.storage.local.get(['isExtensionOn', 'userContext'], (result) => {
    const isOn = result.isExtensionOn || false;
    const savedContext = result.userContext || '';
    updateToggleState(isOn);
    contextInput.value = savedContext;
    updateContextButton(savedContext);
  });

  // Toggle extension on/off
  toggleButton.addEventListener('click', () => {
    chrome.storage.local.get(['isExtensionOn'], (result) => {
      const isOn = !result.isExtensionOn;
      updateToggleState(isOn);
      chrome.storage.local.set({ isExtensionOn: isOn });

      // Send message to all tabs to update state
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { 
            action: 'updateState', 
            isExtensionOn: isOn 
          }, () => {
            // Ignore connection errors for inactive tabs
            if (chrome.runtime.lastError) {
              console.log('Tab not responsive:', tab.id);
            }
          });
        });
      });
    });
  });

  // Save context
  saveContextBtn.addEventListener('click', () => {
    const contextText = contextInput.value.trim();
    chrome.storage.local.set({ userContext: contextText }, () => {
      updateContextButton(contextText);
      
      // Show feedback
      const originalText = saveContextBtn.textContent;
      saveContextBtn.textContent = '✅ Saved!';
      saveContextBtn.style.background = 'linear-gradient(135deg, #00d2d3, #54a0ff)';
      
      setTimeout(() => {
        saveContextBtn.textContent = originalText;
        saveContextBtn.style.background = '';
      }, 1500);

      // Send updated context to all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { 
            action: 'updateContext', 
            context: contextText 
          }, () => {
            // Ignore connection errors for inactive tabs
            if (chrome.runtime.lastError) {
              console.log('Tab not responsive:', tab.id);
            }
          });
        });
      });
    });
  });

  // Update context input in real-time
  contextInput.addEventListener('input', () => {
    const contextText = contextInput.value.trim();
    updateContextButton(contextText);
  });

  // Handle Enter key in context input
  contextInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveContextBtn.click();
    }
  });

  function updateToggleState(isOn) {
    statusText.textContent = isOn ? 'ON' : 'OFF';
    toggleButton.className = isOn ? 'primary-button toggle-button on' : 'primary-button toggle-button';
    statusIndicator.className = isOn ? 'status-indicator on' : 'status-indicator';
  }

  function updateContextButton(contextText) {
    saveContextBtn.textContent = 'Save Context';
    if (contextText) {
      saveContextBtn.style.opacity = '1';
    } else {
      saveContextBtn.style.opacity = '0.7';
    }
  }
});