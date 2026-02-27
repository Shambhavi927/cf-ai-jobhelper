export default {
  async fetch(request, env, ctx) {
    
    // Handle CORS for browser requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Serve the chat UI for GET requests
    if (request.method === 'GET') {
      return new Response(getHTML(), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Handle chat messages for POST requests
    if (request.method === 'POST') {
      const { message, history } = await request.json();

      const messages = [
        {
          role: 'system',
          content: `You are JobHelper AI, a friendly career assistant specializing in:
          - CV and resume writing tips
          - Job search strategies
          - Interview preparation
          - Career advice for software engineers
          - Salary negotiation tips
          Keep responses concise, practical and encouraging.`
        },
        ...history,
        { role: 'user', content: message }
      ];

      const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages
      });

      return new Response(JSON.stringify({ 
        response: response.response 
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }
  },
};

function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JobHelper AI</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      background: #0a0a0f;
      color: #f0ede8;
      font-family: 'DM Sans', sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .container {
      width: 100%;
      max-width: 750px;
      height: 90vh;
      display: flex;
      flex-direction: column;
      padding: 2rem;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      background: linear-gradient(135deg, #c9a84c, #e8c97a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .header p {
      color: #8a8799;
      font-size: 0.85rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 0.3rem;
    }

    .chat-box {
      flex: 1;
      overflow-y: auto;
      background: #13131a;
      border: 1px solid rgba(201, 168, 76, 0.15);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message {
      max-width: 80%;
      padding: 1rem 1.2rem;
      border-radius: 12px;
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .message.user {
      background: linear-gradient(135deg, #c9a84c, #e8c97a);
      color: #0a0a0f;
      align-self: flex-end;
      font-weight: 500;
    }

    .message.assistant {
      background: #1c1c26;
      border: 1px solid rgba(201, 168, 76, 0.15);
      color: #f0ede8;
      align-self: flex-start;
    }

    .message.loading {
      background: #1c1c26;
      border: 1px solid rgba(201, 168, 76, 0.15);
      color: #8a8799;
      align-self: flex-start;
    }

    .input-area {
      display: flex;
      gap: 1rem;
    }

    input {
      flex: 1;
      background: #13131a;
      border: 1px solid rgba(201, 168, 76, 0.15);
      border-radius: 12px;
      padding: 1rem 1.2rem;
      color: #f0ede8;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.3s ease;
    }

    input:focus {
      border-color: #c9a84c;
    }

    button {
      background: linear-gradient(135deg, #c9a84c, #e8c97a);
      color: #0a0a0f;
      border: none;
      border-radius: 12px;
      padding: 1rem 1.5rem;
      font-family: 'DM Sans', sans-serif;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.3s ease;
    }

    button:hover { opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }

    .welcome {
      text-align: center;
      color: #8a8799;
      margin: auto;
    }

    .welcome h3 {
      font-family: 'Playfair Display', serif;
      color: #c9a84c;
      margin-bottom: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>JobHelper AI</h1>
      <p>Your Career Assistant</p>
    </div>

    <div class="chat-box" id="chatBox">
      <div class="welcome">
        <h3>Welcome to JobHelper AI</h3>
        <p>Ask me anything about CVs, job searching, interviews or career advice!</p>
      </div>
    </div>

    <div class="input-area">
      <input 
        type="text" 
        id="userInput" 
        placeholder="Ask about CVs, interviews, job search..." 
        onkeypress="if(event.key==='Enter') sendMessage()"
      />
      <button onclick="sendMessage()" id="sendBtn">Send</button>
    </div>
  </div>

  <script>
    let history = [];

    async function sendMessage() {
      const input = document.getElementById('userInput');
      const message = input.value.trim();
      if (!message) return;

      const chatBox = document.getElementById('chatBox');
      const sendBtn = document.getElementById('sendBtn');

      // Clear welcome message
      const welcome = chatBox.querySelector('.welcome');
      if (welcome) welcome.remove();

      // Add user message
      chatBox.innerHTML += '<div class="message user">' + message + '</div>';
      input.value = '';
      sendBtn.disabled = true;

      // Add loading message
      const loadingId = 'loading-' + Date.now();
      chatBox.innerHTML += '<div class="message loading" id="' + loadingId + '">Thinking...</div>';
      chatBox.scrollTop = chatBox.scrollHeight;

      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, history })
        });

        const data = await res.json();
        
        // Remove loading
        document.getElementById(loadingId).remove();
        
        // Add assistant response
        chatBox.innerHTML += '<div class="message assistant">' + data.response + '</div>';
        
        // Update history
        history.push({ role: 'user', content: message });
        history.push({ role: 'assistant', content: data.response });

        // Keep history to last 10 messages
        if (history.length > 10) history = history.slice(-10);

      } catch (error) {
        document.getElementById(loadingId).remove();
        chatBox.innerHTML += '<div class="message assistant">Sorry, something went wrong. Please try again.</div>';
      }

      sendBtn.disabled = false;
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  </script>
</body>
</html>`;
}