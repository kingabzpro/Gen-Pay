// Payment Processing Module
class PaymentProcessor {
    constructor() {
        this.transactions = [];
        this.balance = 1234.56;
        this.init();
    }

    init() {
        this.loadMockData();
        this.setupPaymentForm();
        this.setupTransactionHistory();
    }

    loadMockData() {
        // Mock transaction data
        this.transactions = [
            { id: 1, name: 'Coffee Shop', amount: -4.50, time: '2 min ago', icon: '☕' },
            { id: 2, name: 'Salary Deposit', amount: 2500.00, time: '1 hour ago', icon: '💰' },
            { id: 3, name: 'Netflix Subscription', amount: -15.99, time: '1 day ago', icon: '📺' },
            { id: 4, name: 'Friend Transfer', amount: 50.00, time: '2 days ago', icon: '👥' },
            { id: 5, name: 'Grocery Store', amount: -87.32, time: '3 days ago', icon: '🛒' }
        ];
    }

    setupPaymentForm() {
        // Enhanced payment form validation
        const form = document.getElementById('payment-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processPayment(form);
            });
        }
    }

    processPayment(form) {
        const formData = new FormData(form);
        const recipient = formData.get('recipient');
        const amount = parseFloat(formData.get('amount'));
        const note = formData.get('note');

        // Validation
        if (!recipient || !amount || amount <= 0) {
            this.showPaymentError('Please fill in all fields correctly');
            return;
        }

        if (amount > this.balance) {
            this.showPaymentError('Insufficient funds');
            return;
        }

        // Process payment
        const transaction = {
            id: Date.now(),
            name: recipient,
            amount: -amount,
            time: 'Just now',
            icon: '💸',
            note: note
        };

        this.addTransaction(transaction);
        this.updateBalance(-amount);
        this.showPaymentSuccess(`$${amount.toFixed(2)} sent to ${recipient}`);
        form.reset();
    }

    addTransaction(transaction) {
        this.transactions.unshift(transaction);
        this.updateTransactionDisplay();
    }

    updateBalance(amount) {
        this.balance += amount;
        const balanceElement = document.querySelector('.balance');
        if (balanceElement) {
            balanceElement.textContent = `$${this.balance.toFixed(2)}`;
            
            // Animate balance change
            balanceElement.classList.add('balance-change');
            setTimeout(() => {
                balanceElement.classList.remove('balance-change');
            }, 1000);
        }
    }

    updateTransactionDisplay() {
        const container = document.querySelector('.recent-transactions');
        if (!container) return;

        const recentTransactions = this.transactions.slice(0, 3);
        container.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction">
                <span class="transaction-icon">${transaction.icon}</span>
                <div class="transaction-details">
                    <span class="transaction-name">${transaction.name}</span>
                    <span class="transaction-time">${transaction.time}</span>
                </div>
                <span class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                    ${transaction.amount > 0 ? '+' : ''}$${Math.abs(transaction.amount).toFixed(2)}
                </span>
            </div>
        `).join('');

        // Add animation to new transactions
        const firstTransaction = container.querySelector('.transaction');
        if (firstTransaction) {
            firstTransaction.classList.add('new-transaction');
        }
    }

    setupTransactionHistory() {
        // Initialize transaction display
        this.updateTransactionDisplay();
    }

    showPaymentSuccess(message) {
        this.showNotification(message, 'success');
    }

    showPaymentError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Reuse main app notification system
        if (window.genPayApp) {
            window.genPayApp.showNotification(message, type);
        }
    }

    // QR Code functionality
    generateQRCode(data) {
        // Simple QR code placeholder (in production, use a QR library)
        return `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                <rect width="200" height="200" fill="white"/>
                <text x="100" y="100" text-anchor="middle" font-size="12">QR Code</text>
                <text x="100" y="120" text-anchor="middle" font-size="8">${data}</text>
            </svg>
        `)}`;
    }

    // Currency conversion
    convertCurrency(amount, fromCurrency, toCurrency) {
        // Mock conversion rates (in production, use real API)
        const rates = {
            USD: 1,
            EUR: 0.85,
            GBP: 0.73,
    JPY: 110.0
        };

        const usdAmount = amount / rates[fromCurrency];
        return usdAmount * rates[toCurrency];
    }

    // Analytics
    getSpendingByCategory() {
        const categories = {};
        
        this.transactions
            .filter(t => t.amount < 0) // Only expenses
            .forEach(transaction => {
                const category = this.categorizeTransaction(transaction.name);
                categories[category] = (categories[category] || 0) + Math.abs(transaction.amount);
            });

        return categories;
    }

    categorizeTransaction(name) {
        const categories = {
            'Food & Drink': ['coffee', 'restaurant', 'food', 'drink', 'bar'],
            'Entertainment': ['netflix', 'spotify', 'movie', 'game'],
            'Shopping': ['amazon', 'store', 'shop', 'buy'],
            'Transport': ['uber', 'taxi', 'gas', 'transport'],
            'Bills': ['electric', 'water', 'internet', 'phone'],
            'Other': []
        };

        const lowerName = name.toLowerCase();
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerName.includes(keyword))) {
                return category;
            }
        }
        
        return 'Other';
    }

    // Export functionality
    exportTransactions(format = 'csv') {
        let content = '';
        
        if (format === 'csv') {
            content = 'Date,Name,Amount,Type\n';
            this.transactions.forEach(t => {
                const type = t.amount > 0 ? 'Credit' : 'Debit';
                content += `${t.time},${t.name},${Math.abs(t.amount)},${type}\n`;
            });
        } else if (format === 'json') {
            content = JSON.stringify(this.transactions, null, 2);
        }

        this.downloadFile(content, `transactions.${format}`, format === 'json' ? 'application/json' : 'text/csv');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Security features
class SecurityManager {
    constructor() {
        this.attempts = 0;
        this.maxAttempts = 3;
        this.lockoutTime = 5 * 60 * 1000; // 5 minutes
    }

    validateInput(input, type) {
        const patterns = {
            phone: /^\+?[\d\s\-\(\)]+$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            amount: /^\d+(\.\d{1,2})?$/
        };

        if (patterns[type]) {
            return patterns[type].test(input);
        }
        
        return true; // No validation for unknown types
    }

    sanitizeInput(input) {
        // Basic XSS prevention
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    encryptData(data) {
        // Simple encoding (in production, use proper encryption)
        return btoa(JSON.stringify(data));
    }

    decryptData(encryptedData) {
        try {
            return JSON.parse(atob(encryptedData));
        } catch (e) {
            return null;
        }
    }

    checkRateLimit() {
        const now = Date.now();
        const lastAttempt = localStorage.getItem('lastAttempt') || 0;
        
        if (now - lastAttempt < this.lockoutTime && this.attempts >= this.maxAttempts) {
            return false;
        }
        
        return true;
    }

    recordAttempt() {
        this.attempts++;
        localStorage.setItem('lastAttempt', Date.now());
        
        if (this.attempts >= this.maxAttempts) {
            return false; // Locked out
        }
        
        return true;
    }

    resetAttempts() {
        this.attempts = 0;
        localStorage.removeItem('lastAttempt');
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        this.measurePageLoad();
        this.measureInteractions();
        this.setupErrorTracking();
    }

    measurePageLoad() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const navigation = performance.getEntriesByType('navigation')[0];
                
                this.metrics.pageLoad = {
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                    totalTime: navigation.loadEventEnd - navigation.navigationStart
                };

                console.log('Page Load Metrics:', this.metrics.pageLoad);
            });
        }
    }

    measureInteractions() {
        // Track button clicks, form submissions, etc.
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn')) {
                this.recordInteraction('button_click', e.target.textContent);
            }
        });

        document.addEventListener('submit', (e) => {
            this.recordInteraction('form_submit', e.target.id);
        });
    }

    recordInteraction(type, details) {
        if (!this.metrics.interactions) {
            this.metrics.interactions = [];
        }

        this.metrics.interactions.push({
            type,
            details,
            timestamp: Date.now()
        });
    }

    setupErrorTracking() {
        window.addEventListener('error', (e) => {
            this.recordError(e.message, e.filename, e.lineno);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.recordError('Unhandled Promise Rejection', '', 0, e.reason);
        });
    }

    recordError(message, file, line, details = null) {
        if (!this.metrics.errors) {
            this.metrics.errors = [];
        }

        this.metrics.errors.push({
            message,
            file,
            line,
            details,
            timestamp: Date.now()
        });

        console.error('Error recorded:', { message, file, line, details });
    }

    getMetrics() {
        return this.metrics;
    }

    exportMetrics() {
        const data = JSON.stringify(this.metrics, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'performance-metrics.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize payment processor
    window.paymentProcessor = new PaymentProcessor();
    
    // Initialize security manager
    window.securityManager = new SecurityManager();
    
    // Initialize performance monitor
    window.performanceMonitor = new PerformanceMonitor();
    
    // Add enhanced styles for payment features
    const paymentStyles = document.createElement('style');
    paymentStyles.textContent = `
        .balance-change {
            animation: balancePulse 1s ease;
        }
        
        @keyframes balancePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); color: #10b981; }
        }
        
        .transaction-amount.positive {
            color: #10b981;
        }
        
        .transaction-amount.negative {
            color: #ef4444;
        }
        
        .new-transaction {
            animation: slideInRight 0.5s ease;
        }
        
        .payment-form {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(paymentStyles);
});

// Export for global access
window.PaymentProcessor = PaymentProcessor;
window.SecurityManager = SecurityManager;
window.PerformanceMonitor = PerformanceMonitor;