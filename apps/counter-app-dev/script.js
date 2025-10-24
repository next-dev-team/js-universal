// Enhanced Counter Plugin for Development Mode
class CounterAppDev {
  constructor() {
    this.counter = 0;
    this.totalClicks = 0;
    this.hotReloads = 0;
    this.sessionStartTime = new Date();
    this.performanceScore = null;
    this.messageCount = 0;

    // Debug: Check if pluginAPI is available
    console.log(
      "[CounterAppDev] Constructor - window.pluginAPI:",
      window.pluginAPI
    );
    console.log(
      "[CounterAppDev] Constructor - window.devPluginAPI:",
      window.devPluginAPI
    );
    console.log(
      "[CounterAppDev] Constructor - typeof window.pluginAPI:",
      typeof window.pluginAPI
    );

    // Development mode detection
    this.isDevelopment = window.pluginAPI?.isDevelopment?.() || false;
    this.pluginId = window.pluginAPI?.getPluginId?.() || "counter-app-dev";

    console.log(
      "[CounterAppDev] Constructor - isDevelopment:",
      this.isDevelopment
    );
    console.log("[CounterAppDev] Constructor - pluginId:", this.pluginId);

    // Initialize plugin
    this.init();
  }

  async init() {
    console.log("[CounterAppDev] Initializing in development mode...");

    // Load saved data from storage
    await this.loadData();

    // Setup event listeners
    this.setupEventListeners();

    // Setup development controls
    this.setupDevControls();

    // Setup communication listeners
    this.setupCommunication();

    // Update display
    this.updateDisplay();

    // Start session timer
    this.startSessionTimer();

    // Update dev info
    this.updateDevInfo();

    // Track initialization
    if (window.pluginAPI?.dev?.events) {
      window.pluginAPI.dev.events.track("plugin_initialized", {
        pluginId: this.pluginId,
        isDevelopment: this.isDevelopment,
        timestamp: Date.now(),
      });
    }

    console.log("[CounterAppDev] Plugin initialized successfully");
  }

  async loadData() {
    try {
      // Use development storage if available
      const storage =
        window.pluginAPI?.dev?.storage || window.pluginAPI?.storage;

      const savedCounter = await storage.get("counter");
      const savedTotalClicks = await storage.get("totalClicks");
      const savedHotReloads = await storage.get("hotReloads");

      this.counter = savedCounter !== null ? savedCounter : 0;
      this.totalClicks = savedTotalClicks !== null ? savedTotalClicks : 0;
      this.hotReloads = savedHotReloads !== null ? savedHotReloads : 0;

      console.log("[CounterAppDev] Data loaded:", {
        counter: this.counter,
        totalClicks: this.totalClicks,
        hotReloads: this.hotReloads,
      });
    } catch (error) {
      console.warn("[CounterAppDev] Failed to load data from storage:", error);
      // Use default values
      this.counter = 0;
      this.totalClicks = 0;
      this.hotReloads = 0;
    }
  }

  async saveData() {
    try {
      // Use development storage if available
      const storage =
        window.pluginAPI?.dev?.storage || window.pluginAPI?.storage;

      await storage.set("counter", this.counter);
      await storage.set("totalClicks", this.totalClicks);
      await storage.set("hotReloads", this.hotReloads);

      console.log("[CounterAppDev] Data saved successfully");
    } catch (error) {
      console.warn("[CounterAppDev] Failed to save data to storage:", error);
    }
  }

  setupEventListeners() {
    const incrementBtn = document.getElementById("incrementBtn");
    const decrementBtn = document.getElementById("decrementBtn");
    const resetBtn = document.getElementById("resetBtn");

    if (incrementBtn) {
      incrementBtn.addEventListener("click", () => this.increment());
    }

    if (decrementBtn) {
      decrementBtn.addEventListener("click", () => this.decrement());
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.reset());
    }

    // Add keyboard shortcuts
    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowUp":
        case "+":
          event.preventDefault();
          this.increment();
          break;
        case "ArrowDown":
        case "-":
          event.preventDefault();
          this.decrement();
          break;
        case "r":
        case "R":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            this.reset();
          }
          break;
        case "F5":
          event.preventDefault();
          this.reloadPlugin();
          break;
      }
    });
  }

  setupDevControls() {
    // Reload button
    const reloadBtn = document.getElementById("reloadBtn");
    if (reloadBtn) {
      reloadBtn.addEventListener("click", () => this.reloadPlugin());
    }

    // Clear storage button
    const clearStorageBtn = document.getElementById("clearStorageBtn");
    if (clearStorageBtn) {
      clearStorageBtn.addEventListener("click", () => this.clearStorage());
    }

    // Test notification button
    const testNotificationBtn = document.getElementById("testNotificationBtn");
    if (testNotificationBtn) {
      testNotificationBtn.addEventListener("click", () =>
        this.testNotification()
      );
    }

    // Performance test button
    const performanceTestBtn = document.getElementById("performanceTestBtn");
    if (performanceTestBtn) {
      performanceTestBtn.addEventListener("click", () =>
        this.runPerformanceTest()
      );
    }

    // Crash test button
    const crashTestBtn = document.getElementById("crashTestBtn");
    if (crashTestBtn) {
      crashTestBtn.addEventListener("click", () => this.crashTest());
    }

    // Recovery test button
    const recoveryTestBtn = document.getElementById("recoveryTestBtn");
    if (recoveryTestBtn) {
      recoveryTestBtn.addEventListener("click", () => this.recoveryTest());
    }

    // Communication test buttons
    const sendMessageBtn = document.getElementById("sendMessageBtn");
    if (sendMessageBtn) {
      sendMessageBtn.addEventListener("click", () => this.sendTestMessage());
    }

    const broadcastBtn = document.getElementById("broadcastBtn");
    if (broadcastBtn) {
      broadcastBtn.addEventListener("click", () => this.broadcastTestMessage());
    }
  }

  setupCommunication() {
    // Listen for plugin messages
    if (window.pluginAPI?.communication?.onMessage) {
      window.pluginAPI.communication.onMessage((message) => {
        this.handleMessage(message);
      });
    }
  }

  handleMessage(message) {
    this.messageCount++;
    console.log("[CounterAppDev] Received message:", message);

    // Display message in UI
    const messagesContainer = document.getElementById("messagesReceived");
    if (messagesContainer) {
      const messageElement = document.createElement("div");
      messageElement.style.marginBottom = "5px";
      messageElement.style.fontSize = "11px";
      messageElement.innerHTML = `
                <strong>#${this.messageCount}</strong> ${
        message.from || "Unknown"
      }: 
                ${JSON.stringify(message.data || message)}
            `;
      messagesContainer.appendChild(messageElement);

      // Keep only last 10 messages
      while (messagesContainer.children.length > 10) {
        messagesContainer.removeChild(messagesContainer.firstChild);
      }

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Handle different message types
    if (message.data && typeof message.data === "object") {
      switch (message.data.type) {
        case "getCounter":
          this.sendMessage({
            type: "counterValue",
            value: this.counter,
            timestamp: Date.now(),
          });
          break;
        case "setCounter":
          if (typeof message.data.value === "number") {
            this.counter = message.data.value;
            this.saveData();
            this.updateDisplay();
          }
          break;
        case "reset":
          this.reset();
          break;
        case "increment":
          this.increment();
          break;
        case "decrement":
          this.decrement();
          break;
      }
    }
  }

  async increment() {
    this.counter++;
    this.totalClicks++;
    await this.saveData();
    this.updateDisplay();
    this.animateButton("incrementBtn");

    // Send notification for milestones
    if (this.counter % 10 === 0 && this.counter > 0) {
      this.showNotification(`Counter reached ${this.counter}!`);
    }

    // Track event
    if (window.pluginAPI?.dev?.events) {
      window.pluginAPI.dev.events.track("counter_incremented", {
        newValue: this.counter,
        totalClicks: this.totalClicks,
      });
    }
  }

  async decrement() {
    this.counter--;
    this.totalClicks++;
    await this.saveData();
    this.updateDisplay();
    this.animateButton("decrementBtn");

    // Track event
    if (window.pluginAPI?.dev?.events) {
      window.pluginAPI.dev.events.track("counter_decremented", {
        newValue: this.counter,
        totalClicks: this.totalClicks,
      });
    }
  }

  async reset() {
    const previousCounter = this.counter;
    this.counter = 0;
    this.totalClicks++;
    await this.saveData();
    this.updateDisplay();
    this.animateButton("resetBtn");

    if (previousCounter !== 0) {
      this.showNotification(`Counter reset from ${previousCounter} to 0`);
    }

    // Track event
    if (window.pluginAPI?.dev?.events) {
      window.pluginAPI.dev.events.track("counter_reset", {
        previousValue: previousCounter,
        totalClicks: this.totalClicks,
      });
    }
  }

  updateDisplay() {
    const counterValueElement = document.getElementById("counterValue");
    const totalClicksElement = document.getElementById("totalClicks");
    const hotReloadsElement = document.getElementById("hotReloads");
    const performanceScoreElement = document.getElementById("performanceScore");

    if (counterValueElement) {
      counterValueElement.textContent = this.counter;

      // Add visual feedback for counter value
      counterValueElement.classList.remove("positive", "negative", "zero");
      if (this.counter > 0) {
        counterValueElement.classList.add("positive");
      } else if (this.counter < 0) {
        counterValueElement.classList.add("negative");
      } else {
        counterValueElement.classList.add("zero");
      }
    }

    if (totalClicksElement) {
      totalClicksElement.textContent = this.totalClicks;
    }

    if (hotReloadsElement) {
      hotReloadsElement.textContent = this.hotReloads;
    }

    if (performanceScoreElement) {
      performanceScoreElement.textContent = this.performanceScore || "--";
    }
  }

  updateDevInfo() {
    const pluginIdDisplay = document.getElementById("pluginIdDisplay");
    const devModeDisplay = document.getElementById("devModeDisplay");
    const sessionStartDisplay = document.getElementById("sessionStartDisplay");

    if (pluginIdDisplay) {
      pluginIdDisplay.textContent = this.pluginId;
    }

    if (devModeDisplay) {
      devModeDisplay.textContent = this.isDevelopment ? "Yes" : "No";
    }

    if (sessionStartDisplay) {
      sessionStartDisplay.textContent =
        this.sessionStartTime.toLocaleTimeString();
    }
  }

  animateButton(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.classList.add("clicked");
      setTimeout(() => {
        button.classList.remove("clicked");
      }, 150);
    }
  }

  startSessionTimer() {
    const sessionTimeElement = document.getElementById("sessionTime");

    const updateSessionTime = () => {
      const now = new Date();
      const elapsed = Math.floor((now - this.sessionStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;

      if (sessionTimeElement) {
        sessionTimeElement.textContent = `${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }
    };

    // Update immediately and then every second
    updateSessionTime();
    setInterval(updateSessionTime, 1000);
  }

  async showNotification(message) {
    try {
      if (window.pluginAPI?.notifications?.show) {
        await window.pluginAPI.notifications.show("Counter App Dev", message);
      } else {
        console.log("[CounterAppDev] Notification:", message);
      }
    } catch (error) {
      console.warn("[CounterAppDev] Failed to show notification:", error);
    }
  }

  // Development-specific methods
  async reloadPlugin() {
    try {
      if (window.pluginAPI?.dev?.reload) {
        const result = await window.pluginAPI.dev.reload();
        console.log("[CounterAppDev] Reload result:", result);

        if (result.success) {
          this.hotReloads++;
          await this.saveData();
          this.updateDisplay();

          // Show hot reload indicator
          this.showHotReloadIndicator();

          // Update last reload time
          const lastReloadDisplay =
            document.getElementById("lastReloadDisplay");
          if (lastReloadDisplay) {
            lastReloadDisplay.textContent = new Date().toLocaleTimeString();
          }
        }
      } else {
        console.warn("[CounterAppDev] Hot reload not available");
      }
    } catch (error) {
      console.error("[CounterAppDev] Failed to reload plugin:", error);
    }
  }

  showHotReloadIndicator() {
    const indicator = document.getElementById("hotReloadIndicator");
    if (indicator) {
      indicator.classList.add("show");
      setTimeout(() => {
        indicator.classList.remove("show");
      }, 2000);
    }
  }

  async clearStorage() {
    try {
      const storage =
        window.pluginAPI?.dev?.storage || window.pluginAPI?.storage;
      if (storage?.clear) {
        await storage.clear();
        console.log("[CounterAppDev] Storage cleared");

        // Reset counters
        this.counter = 0;
        this.totalClicks = 0;
        this.hotReloads = 0;
        await this.saveData();
        this.updateDisplay();

        this.showNotification("Storage cleared successfully");
      }
    } catch (error) {
      console.error("[CounterAppDev] Failed to clear storage:", error);
    }
  }

  async testNotification() {
    await this.showNotification("Test notification from Counter App Dev!");
  }

  async runPerformanceTest() {
    try {
      if (window.pluginAPI?.dev?.performance) {
        const performance = window.pluginAPI.dev.performance;

        // Start performance test
        performance.mark("performance-test-start");

        // Simulate some work
        await new Promise((resolve) => setTimeout(resolve, 100));

        // End performance test
        performance.mark("performance-test-end");
        performance.measure(
          "performance-test",
          "performance-test-start",
          "performance-test-end"
        );

        // Calculate score (simplified)
        const entries = performance.getEntries();
        const testEntry = entries.find((entry) =>
          entry.name.includes("performance-test")
        );

        if (testEntry) {
          this.performanceScore = Math.round(1000 / testEntry.duration);
          this.updateDisplay();
          this.showNotification(
            `Performance test completed! Score: ${this.performanceScore}`
          );
        }
      }
    } catch (error) {
      console.error("[CounterAppDev] Performance test failed:", error);
    }
  }

  crashTest() {
    console.log("[CounterAppDev] Simulating crash...");
    // Simulate a crash by throwing an error
    setTimeout(() => {
      throw new Error("Simulated crash for testing purposes");
    }, 1000);
  }

  recoveryTest() {
    console.log("[CounterAppDev] Testing recovery...");
    // Test recovery by reloading the plugin
    this.reloadPlugin();
  }

  async sendTestMessage() {
    try {
      if (window.pluginAPI?.communication?.sendMessage) {
        const message = {
          type: "test",
          from: this.pluginId,
          data: {
            counter: this.counter,
            timestamp: Date.now(),
            message: "Hello from Counter App Dev!",
          },
        };

        // Send to a specific plugin (if any)
        await window.pluginAPI.communication.sendMessage("main-app", message);
        this.showNotification("Test message sent!");
      }
    } catch (error) {
      console.error("[CounterAppDev] Failed to send test message:", error);
    }
  }

  async broadcastTestMessage() {
    try {
      if (window.pluginAPI?.communication?.sendMessage) {
        const message = {
          type: "broadcast",
          from: this.pluginId,
          data: {
            counter: this.counter,
            timestamp: Date.now(),
            message: "Broadcast from Counter App Dev!",
          },
        };

        // Broadcast to all plugins
        await window.pluginAPI.communication.sendMessage("broadcast", message);
        this.showNotification("Broadcast message sent!");
      }
    } catch (error) {
      console.error("[CounterAppDev] Failed to broadcast test message:", error);
    }
  }

  sendMessage(message) {
    // Send message back to sender (for testing)
    if (window.pluginAPI?.communication?.sendMessage) {
      window.pluginAPI.communication.sendMessage("main-app", message);
    }
  }
}

// Initialize the plugin when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.counterAppDev = new CounterAppDev();
});

// Handle hot reload
if (window.pluginAPI?.dev?.events) {
  window.pluginAPI.dev.events.track("script_loaded", {
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  });
}

// Export for potential external access
if (typeof module !== "undefined" && module.exports) {
  module.exports = CounterAppDev;
}
