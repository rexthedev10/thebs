// Background script to handle API calls
const apiKey = 'AIzaSyDAin-HfM5nuTX77_o3RJykDvdfShsDH2Y';
const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function generateReply(text, mood, userContext, sendResponse) {
  const prompt = `
    You are an AI designed to craft thoughtful, context-aware replies for webpage content.
    Follow these steps to think through and generate a suitable reply:
    1. Read and analyze this text from a webpage, likely a post: "${text.substring(0, 1000)}"
    2. Determine the context:
       - Type: Is this a social media post, blog article, forum comment, news piece, or other?
       - Topic: What is the main subject (e.g., technology, health, travel)?
       - Tone: What is the current tone (e.g., casual, formal, urgent, humorous)?
       - Intent: What is the purpose (e.g., inform, ask a question, praise, seek help)?
       - Key Details: Identify 2-3 critical points or ideas in the post.
    3. Incorporate user-provided context: "${userContext || 'No additional context provided'}"
       - Use this to enhance the reply (e.g., add product details, background info).
    4. Think deeply:
       - Who is the likely audience (e.g., friends, readers, professionals)?
       - What emotions or reactions does the post evoke?
       - How does the requested mood (${mood}) shape the reply? For example:
         - Happy: Use upbeat, enthusiastic, positive language.
         - Serious: Be thoughtful, professional, and focused.
         - Funny: Add lighthearted, humorous, playful elements.
         - Supportive: Be encouraging, empathetic, and helpful.
    5. Generate a concise reply (2-3 sentences):
       - Incorporate the context (type, topic, intent) and user-provided context.
       - Reference at least one key detail from the post or user context.
       - Apply the ${mood} mood to shape the tone and style.
       - Keep it engaging, relevant, and appropriate.
    Current date: June 08, 2025, 08:27 PM IST.
    Ensure the reply feels natural, thoughtful, and tailored to the post.
  `;

  try {
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
      throw new Error('API request failed: ' + response.statusText);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No reply generated';
    sendResponse({ reply: reply });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateReply') {
    generateReply(request.text, request.mood || 'neutral', request.context || '', sendResponse);
    return true; // Indicates async response
  } else if (request.action === 'updateState') {
    sendResponse({ status: 'updated' });
  }
});