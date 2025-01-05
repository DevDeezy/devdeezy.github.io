class ChatWidget {
  constructor() {
    this.chatLabel = document.querySelector(".chat-label");
    this.chatButton = document.querySelector(".chat-widget-button");
    this.chatContainer = document.querySelector(".chat-container");
    this.closeButton = document.querySelector(".close-chat");
    this.sendButton = document.querySelector(".send-message");
    this.chatInput = document.querySelector(".chat-input");
    this.chatMessages = document.querySelector(".chat-messages");
    this.clearButton = document.querySelector(".clear-chat");
    this.labelCloseButton = document.querySelector(".chat-label-close");

    // Initialize the chat as closed
    this.chatContainer.classList.remove("active");

    this.setupEventListeners();
    this.isProcessing = false;

    // Load saved messages
    this.loadMessages();

    // Set timeout to hide label after 5 seconds
    setTimeout(() => {
      this.hideLabel();
    }, 5000);
  }

  setupEventListeners() {
    this.chatButton.addEventListener("click", () => this.toggleChat());
    this.closeButton.addEventListener("click", () => this.toggleChat());
    this.sendButton.addEventListener("click", () => this.sendMessage());
    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.sendMessage();
      }
    });
    this.clearButton?.addEventListener("click", () => this.clearHistory());
    this.labelCloseButton?.addEventListener("click", () => this.hideLabel());
  }

  toggleChat() {
    // Hide label when opening chat
    this.hideLabel();

    // Toggle the active class
    this.chatContainer.classList.toggle("active");

    // If opening the chat, focus the input
    if (this.chatContainer.classList.contains("active")) {
      this.chatInput.focus();
    }
  }

  async sendMessage() {
    if (this.isProcessing || !this.chatInput.value.trim()) return;

    const userMessage = this.chatInput.value.trim();
    this.addMessage(userMessage, "user");
    this.chatInput.value = "";
    this.isProcessing = true;

    const loadingMessage = this.addLoadingMessage();

    try {
      const response = await fetch(
        "https://scintillating-cupcake-093ebf.netlify.app/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userMessage }),
        }
      );

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      console.log(data);
      loadingMessage.remove();
      this.addMessage(data.response, "bot");
    } catch (error) {
      loadingMessage.remove();
      this.addMessage(
        "Sorry, I encountered an error. Please try again later.",
        "bot"
      );
      console.error("Error:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  async addMessage(message, type) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message", `${type}-message`);

    // If it's a user message, add it immediately
    if (type === "user") {
      messageElement.textContent = message;
      this.chatMessages.appendChild(messageElement);
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
      this.saveMessage(message, type);
      return;
    }

    // For bot messages, add typewriter effect
    this.chatMessages.appendChild(messageElement);
    await this.typeWriter(messageElement, message);
    this.saveMessage(message, type);
  }

  typeWriter(element, text, speed = 30) {
    return new Promise((resolve) => {
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        } else {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }

  addLoadingMessage() {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message", "bot-message", "loading");

    const loadingDots = document.createElement("div");
    loadingDots.classList.add("loading-dots");

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("span");
      loadingDots.appendChild(dot);
    }

    messageElement.appendChild(loadingDots);
    this.chatMessages.appendChild(messageElement);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

    return messageElement;
  }

  // New methods for message persistence
  saveMessage(message, type) {
    const messages = this.getSavedMessages();
    messages.push({ message, type });
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }

  getSavedMessages() {
    const savedMessages = localStorage.getItem("chatMessages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  }

  loadMessages() {
    const messages = this.getSavedMessages();
    messages.forEach(({ message, type }) => {
      const messageElement = document.createElement("div");
      messageElement.classList.add("chat-message", `${type}-message`);
      messageElement.textContent = message;
      this.chatMessages.appendChild(messageElement);
    });
    if (messages.length > 0) {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
  }

  // Optional: Add method to clear chat history
  clearHistory() {
    localStorage.removeItem("chatMessages");
    this.chatMessages.innerHTML = "";
  }

  hideLabel() {
    if (this.chatLabel) {
      this.chatLabel.style.opacity = "0";
      setTimeout(() => {
        this.chatLabel.style.display = "none";
      }, 300); // Wait for fade out animation
    }
  }
}

// Initialize the chat widget
document.addEventListener("DOMContentLoaded", () => {
  new ChatWidget();
});

// Add theme toggle functionality
function toggleTheme() {
  const body = document.body;
  const button = document.querySelector(".theme-toggle");

  if (body.getAttribute("data-theme") === "dark") {
    body.removeAttribute("data-theme");
    button.innerHTML = "🌙 Dark Mode";
    localStorage.setItem("theme", "light");
  } else {
    body.setAttribute("data-theme", "dark");
    button.innerHTML = "☀️ Light Mode";
    localStorage.setItem("theme", "dark");
  }
}

// Check for saved theme preference
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const button = document.querySelector(".theme-toggle");

  if (savedTheme === "dark") {
    document.body.setAttribute("data-theme", "dark");
    button.innerHTML = "☀️ Light Mode";
  }
});
