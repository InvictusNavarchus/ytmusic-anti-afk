// ==UserScript==
// @name         YouTube Music Anti-AFK
// @namespace    https://github.com/InvictusNavarchus/ytmusic-anti-afk
// @downloadURL  https://raw.githubusercontent.com/InvictusNavarchus/ytmusic-anti-afk/master/ytmusic-anti-afk.user.js
// @updateURL    https://raw.githubusercontent.com/InvictusNavarchus/ytmusic-anti-afk/master/ytmusic-anti-afk.user.js
// @version      0.2.0
// @description  Automatically bypasses YouTube Music's "Are you still there?" checks
// @author       Invictus
// @match        https://music.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=music.youtube.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_download
// ==/UserScript==

(function() {
    'use strict';
    
    // Logging with prefix for easier identification
    const log = (...args) => console.log('[YTMusic Anti-AFK]', ...args);
    
    // Storage utility for bypass logs
    const storage = {
        KEY_BYPASS_LOGS: 'ytmusic_anti_afk_bypass_logs',
        
        // Get all logged bypass attempts
        getLogs() {
            return GM_getValue(this.KEY_BYPASS_LOGS, []);
        },
        
        // Add a new bypass attempt log
        addLog(success, message) {
            const logs = this.getLogs();
            logs.push({
                timestamp: new Date().toISOString(),
                success,
                message
            });
            GM_setValue(this.KEY_BYPASS_LOGS, logs);
            return logs;
        },
        
        // Clear all logs
        clearLogs() {
            GM_setValue(this.KEY_BYPASS_LOGS, []);
        }
    };
    
    // CSV Export functionality
    const csvExporter = {
        generateCSV() {
            const logs = storage.getLogs();
            if (logs.length === 0) {
                return null;
            }
            
            // CSV Headers
            let csv = 'Timestamp,Status,Message\n';
            
            // Add each log entry as a CSV row
            logs.forEach(log => {
                // Format the timestamp for better readability
                const timestamp = log.timestamp;
                const status = log.success ? 'Success' : 'Failure';
                // Escape any commas in the message
                const message = log.message ? `"${log.message.replace(/"/g, '""')}"` : '';
                
                csv += `${timestamp},${status},${message}\n`;
            });
            
            return csv;
        },
        
        downloadCSV() {
            const csv = this.generateCSV();
            if (!csv) {
                toastSystem.show('❌ No bypass logs to export', false);
                return;
            }
            
            // Generate filename with current date
            const date = new Date().toISOString().split('T')[0];
            const filename = `ytmusic-anti-afk-logs-${date}.csv`;
            
            // Use GM_download to initiate the download
            GM_download({
                url: URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'})),
                name: filename,
                saveAs: true,
                onload: () => {
                    toastSystem.show(`✅ Successfully exported ${storage.getLogs().length} log entries`, true);
                },
                onerror: (error) => {
                    toastSystem.show(`❌ Failed to export logs: ${error}`, false);
                }
            });
        }
    };
    
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
        },
        
        showWithAction(message, isSuccess, actionText, actionCallback) {
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
            
            // Action button
            const actionBtn = document.createElement('button');
            actionBtn.textContent = actionText;
            Object.assign(actionBtn.style, {
                marginLeft: '12px',
                background: 'transparent',
                border: '1px solid white',
                borderRadius: '4px',
                color: 'white',
                padding: '4px 8px',
                cursor: 'pointer'
            });
            
            actionBtn.addEventListener('click', () => {
                actionCallback();
                this.dismiss(toastId);
            });
            
            // Dismiss button
            const dismissBtn = document.createElement('button');
            dismissBtn.innerHTML = '✓';
            dismissBtn.title = 'Dismiss';
            Object.assign(dismissBtn.style, {
                marginLeft: '8px',
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
            toast.appendChild(actionBtn);
            toast.appendChild(dismissBtn);
            
            // Add to document
            this.container.appendChild(toast);
            this.activeToasts.push(toastId);
            
            // Show with animation
            setTimeout(() => {
                toast.style.opacity = '1';
            }, 10);
            
            return toastId;
        }
    };
    
    // Main Anti-AFK functionality
    const antiAFK = {
        observer: null,
        bypassCount: 0,
        statsButton: null,
        
        init() {
            log('Initializing...');
            toastSystem.init();
            
            // Initial check for any existing modal
            this.checkForAfkModal();
            
            // Set up observer to detect modal appearance
            this.setupObserver();
            
            // Add stats button to page
            this.addStatsButton();
            
            log('Initialization complete. Waiting for AFK modals...');
        },
        
        addStatsButton() {
            // Create a floating button for exporting logs
            this.statsButton = document.createElement('button');
            this.statsButton.textContent = '📊';
            this.statsButton.title = 'Export Anti-AFK Logs';
            
            Object.assign(this.statsButton.style, {
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                zIndex: '9999',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(33, 33, 33, 0.7)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            });
            
            this.statsButton.addEventListener('click', () => {
                const logs = storage.getLogs();
                const logCount = logs.length;
                
                if (logCount > 0) {
                    toastSystem.showWithAction(
                        `📊 ${logCount} bypass logs recorded`, 
                        true,
                        'Export CSV', 
                        () => csvExporter.downloadCSV()
                    );
                } else {
                    toastSystem.show('No bypass logs recorded yet', false);
                }
            });
            
            document.body.appendChild(this.statsButton);
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
                    
                    // Log the successful bypass
                    const successMessage = `Successfully bypassed AFK check${countText}`;
                    storage.addLog(true, successMessage);
                    
                    // Show success notification
                    toastSystem.show(`✅ ${successMessage}. Music will continue playing.`, true);
                } else {
                    const errorMessage = `Failed to bypass AFK check${countText}: Button not found.`;
                    
                    // Log the failure
                    storage.addLog(false, errorMessage);
                    
                    log('ERROR: "Yes" button not found in AFK modal');
                    toastSystem.show(`❌ ${errorMessage}`, false);
                }
            } catch (error) {
                const errorMessage = `Failed to bypass AFK check${countText}: ${error.message}`;
                
                // Log the error
                storage.addLog(false, errorMessage);
                
                log('ERROR during AFK bypass:', error);
                toastSystem.show(`❌ ${errorMessage}`, false);
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
                    
                    // Log this retry attempt
                    storage.addLog(true, "Retried bypass click - modal persisted after first attempt");
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
