// Gen Pay - Interactive JavaScript
class GenPayApp {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.setupAnimations();
        this.setupIntersectionObserver();
    }

    init() {
        // Hide loading screen after page loads
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 1500);
        });

        // Initialize navigation state
        this.isNavOpen = false;
        this.lastScrollY = 0;
        
        // Initialize smooth scrolling
        this.initSmoothScroll();
        
        // Initialize mobile detection
        this.isMobile = window.innerWidth <= 768;
        
        // Initialize theme
        this.initTheme();
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    setupEventListeners() {
        // Navigation toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                this.toggleNavigation();
            });
        }

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
                this.closeNavigation();
            });
        });

        // Scroll events
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Resize events
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Button interactions
        this.setupButtonInteractions();

        // Form interactions
        this.setupFormInteractions();

        // Keyboard navigation
        this.setupKeyboardNavigation();
    }

    toggleNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        this.isNavOpen = !this.isNavOpen;
        
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = this.isNavOpen ? 'hidden' : '';
    }

    closeNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        this.isNavOpen = false;
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleScroll() {
        const navbar = document.querySelector('.navbar');
        const currentScrollY = window.scrollY;
        
        // Add/remove scrolled class
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll
        if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        this.lastScrollY = currentScrollY;
        
        // Update active navigation link
        this.updateActiveNavLink();
    }

    handleResize() {
        this.isMobile = window.innerWidth <= 768;
        
        // Close navigation on resize to desktop
        if (!this.isMobile && this.isNavOpen) {
            this.closeNavigation();
        }
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    initSmoothScroll() {
        // Polyfill for smooth scrolling if not supported
        if (!('scrollBehavior' in document.documentElement.style)) {
            this.polyfillSmoothScroll();
        }
    }

    scrollToSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    polyfillSmoothScroll() {
        // Simple smooth scroll polyfill
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupButtonInteractions() {
        // Get Started button
        const getStartedBtn = document.getElementById('get-started-btn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                this.showGetStartedModal();
            });
        }

        // Watch Demo button
        const watchDemoBtn = document.getElementById('watch-demo-btn');
        if (watchDemoBtn) {
            watchDemoBtn.addEventListener('click', () => {
                this.playDemo();
            });
        }

        // Download buttons
        const downloadBtns = document.querySelectorAll('.download-btn');
        downloadBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleDownload(btn);
            });
        });

        // Action buttons in phone mockup
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.animateAction(btn);
            });
        });
    }

    showGetStartedModal() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Get Started with Gen Pay</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="get-started-form">
                        <div class="form-group">
                            <label for="phone">Phone Number</label>
                            <input type="tel" id="phone" name="phone" placeholder="+1 (555) 123-4567" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" name="email" placeholder="you@example.com" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Create Account</button>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add modal styles
        this.addModalStyles();

        // Setup modal events
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            this.closeModal(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });

        // Setup form submission
        const form = modal.querySelector('#get-started-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleGetStarted(form);
        });

        // Animate modal in
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }

    addModalStyles() {
        if (document.getElementById('modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .modal-content {
                background: white;
                border-radius: 1rem;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .modal-overlay.active .modal-content {
                transform: scale(1);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #666;
                padding: 0.5rem;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #333;
            }
            
            .form-group input {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e5e7eb;
                border-radius: 0.5rem;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: #6366f1;
            }
        `;
        document.head.appendChild(styles);
    }

    handleGetStarted(form) {
        const formData = new FormData(form);
        const phone = formData.get('phone');
        const email = formData.get('email');
        
        // Simulate account creation
        this.showNotification('Account created successfully! Check your phone for verification.', 'success');
        
        // Close modal
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            this.closeModal(modal);
        }
    }

    playDemo() {
        this.showNotification('Demo video coming soon!', 'info');
    }

    handleDownload(btn) {
        const isAppStore = btn.classList.contains('app-store');
        const message = isAppStore ? 
            'Redirecting to App Store...' : 
            'Redirecting to Google Play Store...';
        
        this.showNotification(message, 'info');
        
        // Simulate redirect
        setTimeout(() => {
            this.showNotification('Download page will open in new tab', 'success');
        }, 1500);
    }

    animateAction(btn) {
        // Add ripple effect
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        btn.appendChild(ripple);
        
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        setTimeout(() => {
            btn.removeChild(ripple);
        }, 600);
        
        // Show action feedback
        const action = btn.textContent;
        this.showNotification(`${action} feature activated!`, 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            document.body.removeChild(existingNotification);
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add notification styles
        this.addNotificationStyles();
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    addNotificationStyles() {
        if (document.getElementById('notification-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                z-index: 1001;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 300px;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                border-left: 4px solid #10b981;
            }
            
            .notification-info {
                border-left: 4px solid #3b82f6;
            }
            
            .notification-warning {
                border-left: 4px solid #f59e0b;
            }
            
            .notification-error {
                border-left: 4px solid #ef4444;
            }
        `;
        document.head.appendChild(styles);
    }

    setupFormInteractions() {
        // Add input validation styles
        this.addFormStyles();
    }

    addFormStyles() {
        if (document.getElementById('form-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'form-styles';
        styles.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            .action-btn {
                position: relative;
                overflow: hidden;
            }
        `;
        document.head.appendChild(styles);
    }

    setupKeyboardNavigation() {
        // Escape key to close modal/navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close modal if open
                const modal = document.querySelector('.modal-overlay');
                if (modal) {
                    this.closeModal(modal);
                }
                
                // Close navigation if open
                if (this.isNavOpen) {
                    this.closeNavigation();
                }
            }
        });

        // Tab navigation enhancement
        this.setupFocusManagement();
    }

    setupFocusManagement() {
        // Add focus styles for better accessibility
        const style = document.createElement('style');
        style.textContent = `
            .btn:focus-visible,
            .nav-link:focus-visible,
            .action-btn:focus-visible {
                outline: 2px solid #6366f1;
                outline-offset: 2px;
            }
            
            .modal-close:focus-visible {
                outline: 2px solid #6366f1;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    setupAnimations() {
        // Add entrance animations to elements
        this.animateOnScroll();
    }

    animateOnScroll() {
        // Add animation classes to elements
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll('.feature-card, .step, .stat');
        animatedElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });

        // Add animation styles
        this.addAnimationStyles();
    }

    addAnimationStyles() {
        if (document.getElementById('animation-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'animation-styles';
        styles.textContent = `
            .animate-on-scroll {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .animate-on-scroll.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .feature-card {
                transition-delay: 0.1s;
            }
            
            .feature-card:nth-child(2) {
                transition-delay: 0.2s;
            }
            
            .feature-card:nth-child(3) {
                transition-delay: 0.3s;
            }
            
            .feature-card:nth-child(4) {
                transition-delay: 0.4s;
            }
            
            .feature-card:nth-child(5) {
                transition-delay: 0.5s;
            }
            
            .feature-card:nth-child(6) {
                transition-delay: 0.6s;
            }
        `;
        document.head.appendChild(styles);
    }

    setupIntersectionObserver() {
        // Lazy loading for images if needed
        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);
            }
        });
    }

    initTheme() {
        // Check for saved theme preference or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    // Public methods for external access
    static getInstance() {
        if (!window.genPayApp) {
            window.genPayApp = new GenPayApp();
        }
        return window.genPayApp;
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    GenPayApp.getInstance();
});

// Make app available globally for debugging
window.GenPayApp = GenPayApp;