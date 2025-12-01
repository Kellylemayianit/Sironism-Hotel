// =============================================================================
// SIRONOSIM GARDENS HOTEL - CHAT WIDGET
// Mobile-optimized, cross-browser compatible chat widget
// =============================================================================

(function() {
    'use strict';
    
    // --- Configuration ---
    // !!! REPLACE THESE WITH YOUR ACTUAL VALUES !!!
    var N8N_WEBHOOK_URL = "YOUR_N8N_TEST_WEBHOOK_URL_HERE"; 
    var API_SECRET_KEY = "YOUR_SECRET_API_KEY_HERE";
    
    // Chat widget initialization
    function initChatWidget() {
        var chatToggleBtn = document.getElementById('chat-toggle-btn');
        var chatCloseBtn = document.getElementById('chat-close-btn');
        var chatWindow = document.getElementById('chat-window');
        var chatSendBtn = document.getElementById('chat-send-btn');
        var chatInput = document.getElementById('chat-input');
        var chatMessages = document.getElementById('chat-messages');
        
        // Check if all elements exist
        if (!chatToggleBtn || !chatCloseBtn || !chatWindow || 
            !chatSendBtn || !chatInput || !chatMessages) {
            console.log('Chat widget elements not found - they may load later');
            return;
        }
        
        // Configuration warning
        if (N8N_WEBHOOK_URL === "YOUR_N8N_TEST_WEBHOOK_URL_HERE" || 
            API_SECRET_KEY === "YOUR_SECRET_API_KEY_HERE") {
            console.warn("⚠️ WARNING: Please update N8N_WEBHOOK_URL and API_SECRET_KEY in chat.js!");
        }
        
        // --- Utility Functions ---
        
        // Toggle chat window visibility with mobile enhancements
        function toggleChat() {
            var isMobileDevice = window.innerWidth <= 480;
            
            if (chatWindow.classList.contains('chat-window-hidden')) {
                // Opening chat
                chatWindow.classList.remove('chat-window-hidden');
                
                // Lock body scroll on mobile
                if (isMobileDevice) {
                    document.body.classList.add('chat-open');
                    var scrollY = window.scrollY || window.pageYOffset;
                    document.body.style.top = '-' + scrollY + 'px';
                }
                
                // Focus input with delay for mobile keyboard
                if (chatInput) {
                    setTimeout(function() {
                        chatInput.focus();
                    }, isMobileDevice ? 300 : 100);
                }
                scrollToBottom();
            } else {
                // Closing chat
                chatWindow.classList.add('chat-window-hidden');
                
                // Unlock body scroll on mobile
                if (isMobileDevice) {
                    var scrollY = document.body.style.top;
                    document.body.classList.remove('chat-open');
                    document.body.style.top = '';
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
                }
                
                // Blur input to close mobile keyboard
                if (chatInput) {
                    chatInput.blur();
                }
            }
        }
        
        // Scroll messages to bottom
        function scrollToBottom() {
            if (chatMessages) {
                setTimeout(function() {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 100);
            }
        }
        
        // Add message to UI
        function addMessage(text, sender) {
            if (!chatMessages) return;
            
            var messageDiv = document.createElement('div');
            messageDiv.className = 'chat-message ' + (sender === 'user' ? 'user-message' : 'bot-message');
            messageDiv.textContent = text;
            chatMessages.appendChild(messageDiv);
            scrollToBottom();
        }
        
        // Add loading indicator
        function addLoadingIndicator() {
            if (!chatMessages) return null;
            
            var loadingDiv = document.createElement('div');
            loadingDiv.className = 'chat-message bot-message chat-loading';
            loadingDiv.id = 'chat-loading-indicator';
            loadingDiv.textContent = 'Typing';
            chatMessages.appendChild(loadingDiv);
            scrollToBottom();
            return loadingDiv;
        }
        
        // Remove loading indicator
        function removeLoadingIndicator() {
            var loadingDiv = document.getElementById('chat-loading-indicator');
            if (loadingDiv && loadingDiv.parentNode) {
                loadingDiv.parentNode.removeChild(loadingDiv);
            }
        }
        
        // Get or create user ID
        function getUserId() {
            var userId;
            try {
                userId = localStorage.getItem('sironosimUserId');
                if (!userId) {
                    userId = 'web_user_' + new Date().getTime();
                    localStorage.setItem('sironosimUserId', userId);
                }
            } catch (e) {
                // Fallback if localStorage is not available
                userId = 'web_user_' + new Date().getTime();
            }
            return userId;
        }
        
        // Send message to N8N using jQuery AJAX (works with your existing setup)
        function sendMessageToN8N() {
            if (!chatInput) return;
            
            var messageText = chatInput.value.trim();
            if (messageText === "") return;
            
            // Display user's message
            addMessage(messageText, 'user');
            chatInput.value = '';
            
            // On mobile, briefly blur then refocus to manage keyboard
            var isMobileDevice = window.innerWidth <= 480;
            if (isMobileDevice && chatInput) {
                chatInput.blur();
                setTimeout(function() {
                    if (chatInput) chatInput.focus();
                }, 100);
            }
            
            // Show loading indicator
            addLoadingIndicator();
            
            // Get user ID
            var userId = getUserId();
            
            // Prepare request data
            var requestData = {
                message: messageText,
                from: userId
            };
            
            // Use jQuery AJAX (already available in your project)
            if (typeof jQuery !== 'undefined' && jQuery.ajax) {
                jQuery.ajax({
                    url: N8N_WEBHOOK_URL,
                    type: 'POST',
                    contentType: 'application/json',
                    headers: {
                        'x-api-key': API_SECRET_KEY
                    },
                    data: JSON.stringify(requestData),
                    success: function(data) {
                        removeLoadingIndicator();
                        var botResponse = data.response || data.message || 
                                         "Sorry, I am unable to connect to the assistant right now.";
                        addMessage(botResponse, 'bot');
                    },
                    error: function(xhr, status, error) {
                        removeLoadingIndicator();
                        console.error('Chat error:', error);
                        
                        if (xhr.status === 401) {
                            addMessage("Security check failed. Please check the API key.", 'bot');
                        } else {
                            addMessage("An error occurred. Please try again later.", 'bot');
                        }
                    },
                    timeout: 30000 // 30 second timeout
                });
            } else {
                // Fallback to fetch if jQuery not available
                fallbackFetch(requestData);
            }
        }
        
        // Fallback fetch function (if jQuery not loaded)
        function fallbackFetch(requestData) {
            if (typeof fetch !== 'undefined') {
                fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_SECRET_KEY
                    },
                    body: JSON.stringify(requestData)
                })
                .then(function(response) {
                    if (response.status === 401) {
                        throw new Error('Security check failed');
                    }
                    return response.json();
                })
                .then(function(data) {
                    removeLoadingIndicator();
                    var botResponse = data.response || data.message || 
                                     "Sorry, I am unable to connect to the assistant right now.";
                    addMessage(botResponse, 'bot');
                })
                .catch(function(error) {
                    removeLoadingIndicator();
                    console.error('Chat error:', error);
                    if (error.message === 'Security check failed') {
                        addMessage("Security check failed. Please check the API key.", 'bot');
                    } else {
                        addMessage("An error occurred. Please try again later.", 'bot');
                    }
                });
            } else {
                removeLoadingIndicator();
                addMessage("Your browser doesn't support this feature. Please update your browser.", 'bot');
            }
        }
        
        // --- Event Listeners (using jQuery if available, fallback to vanilla JS) ---
        
        if (typeof jQuery !== 'undefined') {
            // Use jQuery event binding (consistent with your site)
            jQuery(chatToggleBtn).on('click', toggleChat);
            jQuery(chatCloseBtn).on('click', toggleChat);
            jQuery(chatSendBtn).on('click', sendMessageToN8N);
            jQuery(chatInput).on('keypress', function(e) {
                if (e.which === 13 || e.keyCode === 13) {
                    e.preventDefault();
                    sendMessageToN8N();
                }
            });
            
            // Handle window resize/orientation change
            jQuery(window).on('orientationchange resize', function() {
                if (!jQuery(chatWindow).hasClass('chat-window-hidden')) {
                    scrollToBottom();
                }
            });
        } else {
            // Fallback to vanilla JavaScript
            if (chatToggleBtn.addEventListener) {
                chatToggleBtn.addEventListener('click', toggleChat, false);
                chatCloseBtn.addEventListener('click', toggleChat, false);
                chatSendBtn.addEventListener('click', sendMessageToN8N, false);
                chatInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' || e.keyCode === 13) {
                        e.preventDefault();
                        sendMessageToN8N();
                    }
                }, false);
            }
        }
        
        console.log('✅ Chat widget initialized successfully');
    }
    
    // --- Initialize when DOM is ready ---
    
    // Try jQuery first (since it's available in your project)
    if (typeof jQuery !== 'undefined') {
        jQuery(document).ready(function() {
            // Small delay to ensure all elements are loaded
            setTimeout(initChatWidget, 100);
        });
    } else {
        // Fallback to vanilla JavaScript
        if (document.readyState === 'loading') {
            if (document.addEventListener) {
                document.addEventListener('DOMContentLoaded', initChatWidget);
            } else if (document.attachEvent) {
                document.attachEvent('onreadystatechange', function() {
                    if (document.readyState === 'complete') {
                        initChatWidget();
                    }
                });
            }
        } else {
            // DOM already loaded
            initChatWidget();
        }
    }
    
})();

// =============================================================================
// END OF CHAT WIDGET
// =============================================================================