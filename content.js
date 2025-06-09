// State to track if extension is on or off
let isExtensionOn = false;
let savedUserContext = '';

// Add a button to generate AI reply
const generateButton = document.createElement('button');
generateButton.innerText = 'Generate AI Reply';
generateButton.style.position = 'fixed';
generateButton.style.bottom = '20px'; // Adjusted to center it nicely
generateButton.style.right = '20px';
generateButton.style.zIndex = '9999';
generateButton.style.padding = '12px 24px';
generateButton.style.background = 'linear-gradient(135deg, #2c3e50, #3498db)'; // Blue gradient
generateButton.style.color = 'white';
generateButton.style.border = 'none';
generateButton.style.borderRadius = '10px';
generateButton.style.cursor = 'pointer';
generateButton.style.fontFamily = 'Arial, sans-serif';
generateButton.style.fontSize = '16px';
generateButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
generateButton.style.transition = 'transform 0.2s, background 0.3s';
generateButton.style.display = 'none'; // Hidden until turned on
generateButton.onmouseover = () => generateButton.style.transform = 'scale(1.05)';
generateButton.onmouseout = () => generateButton.style.transform = 'scale(1)';
document.body.appendChild(generateButton);

// Create a container for the reply section
const replyContainer = document.createElement('div');
replyContainer.style.position = 'fixed';
replyContainer.style.top = '20px';
replyContainer.style.right = '20px';
replyContainer.style.zIndex = '9999';
replyContainer.style.background = 'linear-gradient(135deg, #ecf0f1, #bdc3c7)';
replyContainer.style.padding = '15px';
replyContainer.style.border = '1px solid #95a5a6';
replyContainer.style.borderRadius = '12px';
replyContainer.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.1)';
replyContainer.style.maxWidth = '350px';
replyContainer.style.display = 'none';
replyContainer.style.fontFamily = 'Arial, sans-serif';
document.body.appendChild(replyContainer);

// Function to read text from the page
function getPageText() {
  const selectedText = window.getSelection().toString();
  return selectedText || document.body.innerText;
}

// Function to display reply and buttons
function displayReply(response, selectedMood = 'neutral', userContext = '') {
  if (response.error) {
    replyContainer.innerHTML = `<p style="color: #e74c3c; margin: 0;">Error: ${response.error}</p>`;
    replyContainer.style.display = 'block';
    return;
  }

  const moodContext = {
    neutral: 'Neutral: Balanced and general response.',
    happy: 'Happy: Upbeat, enthusiastic, and positive reply.',
    serious: 'Serious: Thoughtful, professional, and focused tone.',
    funny: 'Funny: Lighthearted, humorous, and playful response.',
    supportive: 'Supportive: Encouraging, empathetic, and helpful reply.'
  };

  const contextDisplay = userContext || savedUserContext;
  const contextInfo = contextDisplay ? `<p style="margin: 0 0 10px; font-size: 11px; color: #7f8c8d; font-style: italic;">Context: ${contextDisplay.substring(0, 50)}${contextDisplay.length > 50 ? '...' : ''}</p>` : '';

  replyContainer.innerHTML = `
    <div style="overflow-x: auto; white-space: nowrap; padding: 2px 0; margin-bottom: 15px; scrollbar-width: none; -ms-overflow-style: none;">
      <div style="display: inline-flex; gap: 2px; background-color: transparent; padding: 2px; align-items: center;">
        <button id="happyBtn" style="padding: 8px 15px; background: transparent; color: #2c3e50; border: 2px solid #95a5a6; border-radius: 20%; cursor: pointer; font-size: 16px; transition: transform 0.2s; text-shadow: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); min-width: 80px; height: 40px; line-height: 16px; text-align: center; box-sizing: border-box;">Happy</button>
        <button id="seriousBtn" style="padding: 8px 15px; background: transparent; color: #2c3e50; border: 2px solid #95a5a6; border-radius: 20%; cursor: pointer; font-size: 16px; transition: transform 0.2s; text-shadow: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); min-width: 80px; height: 40px; line-height: 16px; text-align: center; box-sizing: border-box;">Serious</button>
        <button id="funnyBtn" style="padding: 8px 15px; background: transparent; color: #2c3e50; border: 2px solid #95a5a6; border-radius: 20%; cursor: pointer; font-size: 16px; transition: transform 0.2s; text-shadow: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); min-width: 80px; height: 40px; line-height: 16px; text-align: center; box-sizing: border-box;">Funny</button>
        <button id="supportiveBtn" style="padding: 8px 15px; background: transparent; color: #2c3e50; border: 2px solid #95a5a6; border-radius: 20%; cursor: pointer; font-size: 16px; transition: transform 0.2s; text-shadow: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); min-width: 80px; height: 40px; line-height: 16px; text-align: center; box-sizing: border-box;">Supportive</button>
      </div>
      <style>
        div::-webkit-scrollbar { display: none; }
      </style>
    </div>
    ${contextInfo}
    <p style="margin: 0 0 15px; color: #2c3e50;"><strong>AI Reply:</strong> ${response.reply}</p>
    <div style="text-align: center; margin-bottom: 10px;">
      <button id="addContextBtn" style="padding: 8px 15px; background: transparent; color: #2c3e50; border: 2px solid #95a5a6; border-radius: 20%; cursor: pointer; font-size: 16px; transition: transform 0.2s; text-shadow: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); min-width: 100px; height: 40px; line-height: 16px; text-align: center; box-sizing: border-box; margin-right: 5px;">Add Context</button>
      <button id="copyReplyBtn" style="padding: 8px 15px; background: transparent; color: #2c3e50; border: 2px solid #95a5a6; border-radius: 20%; cursor: pointer; font-size: 16px; transition: transform 0.2s; text-shadow: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); min-width: 80px; height: 40px; line-height: 16px; text-align: center; box-sizing: border-box; margin-right: 5px;">Copy</button>
      <button id="cutReplyBtn" style="padding: 8px 15px; background: transparent; color: #2c3e50; border: 2px solid #95a5a6; border-radius: 20%; cursor: pointer; font-size: 16px; transition: transform 0.2s; text-shadow: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); min-width: 80px; height: 40px; line-height: 16px; text-align: center; box-sizing: border-box;">×</button>
    </div>
    <p style="margin: 0; font-size: 12px; color: #7f8c8d;"><em>${moodContext[selectedMood]}</em></p>
  `;
  replyContainer.style.display = 'block';

  const buttons = ['addContextBtn', 'copyReplyBtn', 'cutReplyBtn', 'happyBtn', 'seriousBtn', 'funnyBtn', 'supportiveBtn'];
  buttons.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('mouseover', () => btn.style.transform = 'scale(1.05)');
      btn.addEventListener('mouseout', () => btn.style.transform = 'scale(1)');
    }
  });

  const addContextBtn = document.getElementById('addContextBtn');
  if (addContextBtn) {
    addContextBtn.addEventListener('click', () => {
      const contextText = prompt('Add context to improve the AI reply (optional):', savedUserContext);
      if (contextText !== null) {
        chrome.runtime.sendMessage({
          action: 'generateReply',
          text: getPageText(),
          mood: selectedMood,
          context: contextText
        }, (newResponse) => {
          displayReply(newResponse, selectedMood, contextText);
        });
      }
    });
  }

  const copyBtn = document.getElementById('copyReplyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const replyText = response.reply;
      navigator.clipboard.writeText(replyText).then(() => {
        copyBtn.innerText = 'Copied!';
        copyBtn.style.color = '#666';
        setTimeout(() => {
          copyBtn.innerText = 'Copy';
          copyBtn.style.color = '#2c3e50';
        }, 2000);
      }).catch(err => {
        replyContainer.innerHTML += `<p style="color: #e74c3c; margin: 5px 0 0;">Copy failed: ${err}</p>`;
      });
    });
  }

  const cutBtn = document.getElementById('cutReplyBtn');
  if (cutBtn) {
    cutBtn.addEventListener('click', () => {
      replyContainer.style.display = 'none';
    });
  }

  const emotions = ['happy', 'serious', 'funny', 'supportive'];
  emotions.forEach(mood => {
    const btn = document.getElementById(`${mood}Btn`);
    if (btn) {
      btn.addEventListener('click', () => {
        const finalContext = userContext || savedUserContext;
        chrome.runtime.sendMessage({
          action: 'generateReply',
          text: getPageText(),
          mood: mood,
          context: finalContext
        }, (newResponse) => {
          displayReply(newResponse, mood, finalContext);
        });
      });
    }
  });
}

// Load initial state and context
chrome.storage.local.get(['isExtensionOn', 'userContext'], (result) => {
  isExtensionOn = result.isExtensionOn || false;
  savedUserContext = result.userContext || '';
  updateUIState();
});

// Listen for state update messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateState') {
    isExtensionOn = message.isExtensionOn;
    updateUIState();
    sendResponse({ status: 'updated' });
  } else if (message.action === 'updateContext') {
    savedUserContext = message.context || '';
    sendResponse({ status: 'context updated' });
  }
});

// Update UI based on extension state
function updateUIState() {
  if (isExtensionOn) {
    generateButton.style.display = 'block';
  } else {
    generateButton.style.display = 'none';
    replyContainer.style.display = 'none';
  }
}

// Generate button handler
generateButton.addEventListener('click', () => {
  if (!isExtensionOn) return;
  const text = getPageText();
  if (!text) {
    replyContainer.innerHTML = '<p style="color: #e74c3c; margin: 0;">No text found on the page!</p>';
    replyContainer.style.display = 'block';
    return;
  }
  chrome.runtime.sendMessage({
    action: 'generateReply',
    text: text,
    mood: 'neutral',
    context: savedUserContext
  }, (response) => {
    if (response) {
      displayReply(response, 'neutral', savedUserContext);
    } else {
      replyContainer.innerHTML = '<p style="color: #e74c3c; margin: 0;">Failed to get response.</p>';
      replyContainer.style.display = 'block';
    }
  });
});