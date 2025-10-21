// Counter Plugin JavaScript
class CounterPlugin {
    constructor() {
        this.counter = 0;
        this.totalClicks = 0;
        this.sessionStartTime = new Date();
        
        // Initialize plugin
        this.init();
    }
    
    async init() {
        // Load saved data from storage
        await this.loadData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update display
        this.updateDisplay();
        
        // Start session timer
        this.startSessionTimer();
        
        console.log('Counter Plugin initialized');
    }
    
    async loadData() {
        try {
            // Check if plugin API is available
            if (typeof window.pluginAPI !== 'undefined' && window.pluginAPI.storage) {
                const savedCounter = await window.pluginAPI.storage.get('counter');
                const savedTotalClicks = await window.pluginAPI.storage.get('totalClicks');
                
                this.counter = savedCounter !== null ? savedCounter : 0;
                this.totalClicks = savedTotalClicks !== null ? savedTotalClicks : 0;
            } else {
                // Fallback to localStorage if plugin API is not available
                const savedCounter = localStorage.getItem('counter-plugin-counter');
                const savedTotalClicks = localStorage.getItem('counter-plugin-totalClicks');
                
                this.counter = savedCounter !== null ? parseInt(savedCounter) || 0 : 0;
                this.totalClicks = savedTotalClicks !== null ? parseInt(savedTotalClicks) || 0 : 0;
            }
        } catch (error) {
            console.warn('Failed to load data from storage:', error);
            // Use default values
            this.counter = 0;
            this.totalClicks = 0;
        }
    }
    
    async saveData() {
        try {
            // Check if plugin API is available
            if (typeof window.pluginAPI !== 'undefined' && window.pluginAPI.storage) {
                await window.pluginAPI.storage.set('counter', this.counter);
                await window.pluginAPI.storage.set('totalClicks', this.totalClicks);
            } else {
                // Fallback to localStorage
                localStorage.setItem('counter-plugin-counter', this.counter.toString());
                localStorage.setItem('counter-plugin-totalClicks', this.totalClicks.toString());
            }
        } catch (error) {
            console.warn('Failed to save data to storage:', error);
        }
    }
    
    setupEventListeners() {
        const incrementBtn = document.getElementById('incrementBtn');
        const decrementBtn = document.getElementById('decrementBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        if (incrementBtn) {
            incrementBtn.addEventListener('click', () => this.increment());
        }
        
        if (decrementBtn) {
            decrementBtn.addEventListener('click', () => this.decrement());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                case '+':
                    event.preventDefault();
                    this.increment();
                    break;
                case 'ArrowDown':
                case '-':
                    event.preventDefault();
                    this.decrement();
                    break;
                case 'r':
                case 'R':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.reset();
                    }
                    break;
            }
        });
    }
    
    async increment() {
        this.counter++;
        this.totalClicks++;
        await this.saveData();
        this.updateDisplay();
        this.animateButton('incrementBtn');
        
        // Send notification for milestones
        if (this.counter % 10 === 0 && this.counter > 0) {
            this.showNotification(`Counter reached ${this.counter}!`);
        }
    }
    
    async decrement() {
        this.counter--;
        this.totalClicks++;
        await this.saveData();
        this.updateDisplay();
        this.animateButton('decrementBtn');
    }
    
    async reset() {
        const previousCounter = this.counter;
        this.counter = 0;
        this.totalClicks++;
        await this.saveData();
        this.updateDisplay();
        this.animateButton('resetBtn');
        
        if (previousCounter !== 0) {
            this.showNotification(`Counter reset from ${previousCounter} to 0`);
        }
    }
    
    updateDisplay() {
        const counterValueElement = document.getElementById('counterValue');
        const totalClicksElement = document.getElementById('totalClicks');
        
        if (counterValueElement) {
            counterValueElement.textContent = this.counter;
            
            // Add visual feedback for counter value
            counterValueElement.classList.remove('positive', 'negative', 'zero');
            if (this.counter > 0) {
                counterValueElement.classList.add('positive');
            } else if (this.counter < 0) {
                counterValueElement.classList.add('negative');
            } else {
                counterValueElement.classList.add('zero');
            }
        }
        
        if (totalClicksElement) {
            totalClicksElement.textContent = this.totalClicks;
        }
    }
    
    animateButton(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.add('clicked');
            setTimeout(() => {
                button.classList.remove('clicked');
            }, 150);
        }
    }
    
    startSessionTimer() {
        const sessionTimeElement = document.getElementById('sessionTime');
        
        const updateSessionTime = () => {
            const now = new Date();
            const elapsed = Math.floor((now - this.sessionStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            
            if (sessionTimeElement) {
                sessionTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        };
        
        // Update immediately and then every second
        updateSessionTime();
        setInterval(updateSessionTime, 1000);
    }
    
    async showNotification(message) {
        try {
            // Try to use plugin API notification
            if (typeof window.pluginAPI !== 'undefined' && window.pluginAPI.notifications) {
                await window.pluginAPI.notifications.show('Counter Plugin', message);
            } else {
                // Fallback to browser notification
                if ('Notification' in window) {
                    if (Notification.permission === 'granted') {
                        new Notification('Counter Plugin', { body: message });
                    } else if (Notification.permission !== 'denied') {
                        const permission = await Notification.requestPermission();
                        if (permission === 'granted') {
                            new Notification('Counter Plugin', { body: message });
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to show notification:', error);
        }
    }
}

// Initialize the plugin when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.counterPlugin = new CounterPlugin();
});

// Handle plugin communication if API is available
if (typeof window.pluginAPI !== 'undefined' && window.pluginAPI.communication) {
    window.pluginAPI.communication.onMessage((message) => {
        console.log('Received message:', message);
        
        // Handle different message types
        switch (message.type) {
            case 'getCounter':
                window.pluginAPI.communication.sendMessage({
                    type: 'counterValue',
                    value: window.counterPlugin ? window.counterPlugin.counter : 0
                });
                break;
            case 'setCounter':
                if (window.counterPlugin && typeof message.value === 'number') {
                    window.counterPlugin.counter = message.value;
                    window.counterPlugin.saveData();
                    window.counterPlugin.updateDisplay();
                }
                break;
            case 'reset':
                if (window.counterPlugin) {
                    window.counterPlugin.reset();
                }
                break;
        }
    });
}

// Export for potential external access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CounterPlugin;
}