// ==UserScript==
// @name         YouTube Music Anti-AFK
// @namespace    ytmusic-anti-afk
// @version      1.0
// @description  Automatically bypasses YouTube Music's "Are you still there?" checks
// @author       You
// @match        https://music.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=music.youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // Logging with prefix for easier identification
    const log = (...args) => console.log('[YTMusic Anti-AFK]', ...args);
    
    // Toast notification system
    const toastSystem = {
        container: null,
        activeToasts: [],
        
        init() {
            // Create a container for our custom toasts
            this.container = document.createElement('div');
            this.container.id = 'ytmusic-anti-afk-toasts';
            Object.assign(this.container.style, {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: '9999',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end'
            });
            document.body.appendChild(this.container);
        },
        
        show(message, isSuccess) {
            const toast = document.createElement('div');
            const toastId = Date.now();
            toast.id = `toast-${toastId}`;
            
            // Style based on success/failure
            const backgroundColor = isSuccess ? '#43a047' : '#e53935';
            
            Object.assign(toast.style, {
                backgroundColor,
                color: 'white',
                padding: '12px 16px',
                borderRadius: '4px',
                margin: '8px 0',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minWidth: '250px',
                maxWidth: '350px',
                opacity: '0',
                transition: 'opacity 0.3s ease-in-out'
            });
            
            // Message
            const messageEl = document.createElement('div');
            messageEl.textContent = message;
            
            // Dismiss button
            const dismissBtn = document.createElement('button');
            dismissBtn.innerHTML = '✓';
            dismissBtn.title = 'Dismiss';
            Object.assign(dismissBtn.style, {
                marginLeft: '12px',
                background: 'transparent',
                border: '1px solid white',
                borderRadius: '50%',
                color: 'white',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
            });
            
            dismissBtn.addEventListener('click', () => this.dismiss(toastId));
            
            // Assemble toast
            toast.appendChild(messageEl);
            toast.appendChild(dismissBtn);
            
            // Add to document
            this.container.appendChild(toast);
            this.activeToasts.push(toastId);
            
            // Show with animation
            setTimeout(() => {
                toast.style.opacity = '1';
            }, 10);
            
            return toastId;
        },
        
        dismiss(id) {
            const toast = document.getElementById(`toast-${id}`);
            if (toast) {
                toast.style.opacity = '0';
                setTimeout(() => {
                    toast.remove();
                    this.activeToasts = this.activeToasts.filter(toastId => toastId !== id);
                }, 300);
            }
        },
        
        dismissAll() {
            [...this.activeToasts].forEach(id => this.dismiss(id));
        }
    };
    
    // Main Anti-AFK functionality
    const antiAFK = {
        observer: null,
        bypassCount: 0,
        
        init() {
            log('Initializing...');
            toastSystem.init();
            
            // Initial check for any existing modal
            this.checkForAfkModal();
            
            // Set up observer to detect modal appearance
            this.setupObserver();
            
            log('Initialization complete. Waiting for AFK modals...');
        },
        
        setupObserver() {
            // Create observer to watch for modal appearance
            this.observer = new MutationObserver(mutations => {
                // Check if any mutation directly involves the modal or its container
                const shouldCheck = mutations.some(mutation => {
                    // Check added nodes
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName === 'YTMUSIC-POPUP-CONTAINER' || 
                                node.tagName === 'TP-YT-PAPER-DIALOG' ||
                                node.querySelector('ytmusic-you-there-renderer')) {
                                return true;
                            }
                        }
                    }
                    
                    // Check attribute changes that might reveal a hidden modal
                    if (mutation.type === 'attributes' && 
                        (mutation.target.tagName === 'TP-YT-PAPER-DIALOG' || 
                         mutation.target.tagName === 'YTMUSIC-POPUP-CONTAINER')) {
                        return true;
                    }
                    
                    return false;
                });
                
                // If we found relevant changes, check for the AFK modal
                if (shouldCheck) {
                    this.checkForAfkModal();
                }
            });
            
            // Start observing changes to the document body
            this.observer.observe(document.body, { 
                childList: true, 
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'hidden', 'display']
            });
        },
        
        checkForAfkModal() {
            log('Checking for AFK modal...');
            
            // Get all possible modal elements that might contain the AFK check
            const modalContainers = document.querySelectorAll('ytmusic-popup-container tp-yt-paper-dialog');
            
            for (const container of modalContainers) {
                // Skip if not visible (display: none or hidden attribute)
                const computedStyle = window.getComputedStyle(container);
                if (computedStyle.display === 'none' || container.hasAttribute('hidden')) {
                    continue;
                }
                
                // Look for the "you there" renderer in visible containers
                const youThereRenderer = container.querySelector('ytmusic-you-there-renderer');
                if (youThereRenderer) {
                    // Check if it has the expected text content
                    const textElement = youThereRenderer.querySelector('.text');
                    if (textElement && 
                        (textElement.textContent.includes('Continue watching') || 
                        textElement.textContent.includes('Video paused'))) {
                        
                        log('Found AFK modal!', textElement.textContent);
                        this.bypassAFKCheck(youThereRenderer);
                        return;
                    }
                }
            }
            
            // Also check for warning notification that indicates upcoming AFK check
            const warningNotification = document.querySelector('ytmusic-notification-action-renderer yt-formatted-string[id="text"]');
            if (warningNotification && 
                warningNotification.textContent.includes('Still watching') && 
                warningNotification.textContent.includes('pause soon')) {
                
                log('Found AFK warning notification!');
                // Find the "Yes" button in the notification
                const yesButton = warningNotification.closest('tp-yt-paper-toast')?.querySelector('yt-button-renderer button');
                if (yesButton) {
                    log('Clicking "Yes" in warning notification');
                    this.clickButton(yesButton);
                    return;
                }
            }
            
            log('No AFK modal found');
        },
        
        bypassAFKCheck(rendererElement) {
            this.bypassCount++;
            const countText = this.bypassCount > 1 ? ` (#${this.bypassCount})` : '';
            log(`Attempting to bypass AFK check${countText}...`);
            
            try {
                // Find the Yes button within the renderer
                const yesButton = rendererElement.querySelector('.actions yt-button-renderer button');
                
                if (yesButton) {
                    log('Found "Yes" button, clicking...');
                    this.clickButton(yesButton);
                    
                    // Show success notification
                    toastSystem.show(`✅ Successfully bypassed AFK check${countText}. Music will continue playing.`, true);
                } else {
                    log('ERROR: "Yes" button not found in AFK modal');
                    toastSystem.show(`❌ Failed to bypass AFK check${countText}: Button not found.`, false);
                }
            } catch (error) {
                log('ERROR during AFK bypass:', error);
                toastSystem.show(`❌ Failed to bypass AFK check${countText}: ${error.message}`, false);
            }
        },
        
        clickButton(button) {
            // Click the button to bypass the AFK check
            button.click();
            
            // Double-check after a short delay that the modal was dismissed
            setTimeout(() => {
                const modalStillVisible = document.querySelector('ytmusic-popup-container tp-yt-paper-dialog:not([hidden])');
                if (modalStillVisible && modalStillVisible.querySelector('ytmusic-you-there-renderer')) {
                    log('Warning: Modal still visible after clicking. Trying again...');
                    button.click();
                }
            }, 500);
        }
    };
    
    // Initialize when the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => antiAFK.init());
    } else {
        antiAFK.init();
    }
})();
