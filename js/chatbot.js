// FTC Interview Practice Chatbot
// Handles audio input, speech-to-text, and conversation with Gemini API

class FTCChatbot {
    constructor() {
        this.isOpen = false;
        this.isRecording = false;
        this.recognition = null;
        this.conversationHistory = [];
        this.currentQuestion = null;
        this.assessmentMode = false; // Tracks if we're in assessment phase
        this.currentTranscript = '';
        
        // API endpoint - Replace with your serverless function URL
        // Example: 'https://your-domain.netlify.app/.netlify/functions/chat'
        // Or: 'https://your-project.vercel.app/api/chat'
        // See context.txt for setup instructions
        this.apiEndpoint = 'YOUR_SERVERLESS_FUNCTION_URL_HERE';
        
        this.init();
    }
    
    init() {
        this.setupUI();
        this.setupSystemPrompt();
    }
    
    setupUI() {
        const toggle = document.getElementById('chatbot-toggle');
        const closeBtn = document.getElementById('chatbot-close');
        const window = document.getElementById('chatbot-window');
        const recordBtn = document.getElementById('audio-record-btn');
        
        if (!window || !recordBtn) {
            console.error('Chatbot UI elements not found');
            return;
        }
        
        // Toggle button is optional (not present in chat.html)
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleChatbot());
        }
        
        // Close button is optional (not present in chat.html)
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleChatbot());
        }
        
        // If no toggle button, keep window open
        if (!toggle && window) {
            window.classList.add('open');
        }
        
        // Record button - hold to record
        recordBtn.addEventListener('mousedown', () => this.startRecording());
        recordBtn.addEventListener('mouseup', () => this.stopRecording());
        recordBtn.addEventListener('mouseleave', () => this.stopRecording());
        
        // Touch events for mobile
        recordBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startRecording();
        });
        recordBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopRecording();
        });
        
        // Send and cancel buttons
        document.getElementById('send-transcript-btn').addEventListener('click', () => this.sendAnswer());
        document.getElementById('cancel-transcript-btn').addEventListener('click', () => this.cancelTranscript());
    }
    
    setupSystemPrompt() {
        // System instruction for the AI
        this.systemPrompt = `You are an FTC (FIRST Tech Challenge) interview practice assistant. Your role is to:
1. Ask relevant questions about robotics, team experience, technical knowledge, and FTC competition
2. Listen to the user's answers and ask thoughtful follow-up questions
3. After 3-5 questions, provide constructive feedback on:
   - Answer quality and completeness
   - Areas of strength
   - Specific suggestions for improvement
   - What interviewers are looking for

Be encouraging but honest. Help the user improve their interview skills.`;
    }
    
    async startRecording() {
        if (this.isRecording) {
            console.log('Already recording, ignoring start request');
            return;
        }
        
        // Check if we're on HTTPS or localhost (required for Speech Recognition API)
        const isSecure = window.location.protocol === 'https:' || 
                        window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
        
        if (!isSecure) {
            this.showError('Speech recognition requires HTTPS or localhost. Please use a secure connection or test locally.');
            console.error('Not on HTTPS or localhost:', window.location.href);
            return;
        }
        
        // Use browser's Speech Recognition API directly
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            const browserInfo = navigator.userAgent;
            this.showError(`Speech recognition not available in your browser. Please use Chrome, Edge, or Safari. Current: ${browserInfo}`);
            console.error('Speech Recognition API not available');
            return;
        }
        
        console.log('Starting speech recognition...');
        console.log('Protocol:', window.location.protocol);
        console.log('Hostname:', window.location.hostname);
        
        try {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true; // Enable interim results for real-time feedback
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 1;
            
            // Track if we've received any results
            this.hasReceivedResults = false;
            
            this.recognition.onstart = () => {
                console.log('Speech recognition started');
                this.hasReceivedResults = false;
                const statusDiv = document.getElementById('audio-status');
                if (statusDiv) {
                    statusDiv.textContent = 'Listening... Speak now!';
                }
            };
            
            this.recognition.onresult = (event) => {
                console.log('Speech recognition result event:', event);
                this.hasReceivedResults = true;
                
                let finalTranscript = '';
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    const confidence = event.results[i][0].confidence;
                    console.log(`Result ${i}: "${transcript}" (confidence: ${confidence}, final: ${event.results[i].isFinal})`);
                    
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                // Update current transcript with final results
                if (finalTranscript.trim()) {
                    this.currentTranscript = (this.currentTranscript || '') + finalTranscript;
                    console.log('Final transcript added:', finalTranscript);
                    console.log('Total transcript so far:', this.currentTranscript);
                }
                
                // Show interim results in real-time
                if (interimTranscript && this.isRecording) {
                    this.updateInterimTranscript(interimTranscript);
                } else if (finalTranscript && this.isRecording) {
                    // Also show final results while still recording
                    this.updateInterimTranscript(finalTranscript);
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error, event);
                
                // Don't stop recording for 'no-speech' errors - that's normal
                if (event.error === 'no-speech') {
                    console.log('No speech detected yet (this is normal)');
                    // Don't stop, just continue listening
                    return;
                }
                
                // For other errors, stop recording
                this.stopRecording();
                
                let errorMessage = 'Could not process speech. ';
                switch(event.error) {
                    case 'audio-capture':
                        errorMessage = 'No microphone found. Please check your microphone is connected and working.';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings and refresh the page.';
                        break;
                    case 'aborted':
                        errorMessage = 'Speech recognition was aborted. Please try again.';
                        break;
                    case 'network':
                        errorMessage = 'Network error. Speech recognition requires internet connection. Please check your connection.';
                        break;
                    case 'service-not-allowed':
                        errorMessage = 'Speech recognition service not allowed. Please check your browser settings.';
                        break;
                    case 'bad-grammar':
                        errorMessage = 'Grammar error in speech recognition.';
                        break;
                    case 'language-not-supported':
                        errorMessage = 'Language not supported.';
                        break;
                    default:
                        errorMessage += `Error: ${event.error}. Please try again.`;
                }
                this.showError(errorMessage);
            };
            
            this.recognition.onend = () => {
                console.log('Recognition ended. Is recording:', this.isRecording, 'Has results:', this.hasReceivedResults);
                
                if (this.isRecording) {
                    // If still recording (button still held), restart recognition
                    // But only if we haven't received any results yet, or if we want continuous listening
                    if (!this.hasReceivedResults) {
                        console.log('No results yet, restarting recognition...');
                        try {
                            // Small delay before restarting
                            setTimeout(() => {
                                if (this.isRecording) {
                                    this.recognition.start();
                                }
                            }, 100);
                        } catch (e) {
                            console.error('Error restarting recognition:', e);
                            this.stopRecording();
                        }
                    } else {
                        // We have results, but user is still holding - keep listening
                        console.log('Has results, but still recording - will process when released');
                    }
                } else {
                    // Recording stopped, process the transcript
                    console.log('Recording stopped. Final transcript:', this.currentTranscript);
                    if (this.currentTranscript && this.currentTranscript.trim()) {
                        this.showTranscript(this.currentTranscript.trim());
                        this.currentTranscript = '';
                        this.hasReceivedResults = false;
                    } else {
                        // No transcript captured
                        if (!this.hasReceivedResults) {
                            this.showError('No speech detected. Please try speaking clearly and hold the button while speaking.');
                        } else {
                            this.showError('Could not capture your speech. Please try again.');
                        }
                        this.hasReceivedResults = false;
                    }
                }
            };
            
            this.currentTranscript = '';
            
            // Reset status message
            const statusDiv = document.getElementById('audio-status');
            if (statusDiv) {
                statusDiv.textContent = 'Listening... Speak now!';
                statusDiv.style.color = '#4A90E2';
            }
            
            // Clear any previous transcript
            this.currentTranscript = '';
            this.hasReceivedResults = false;
            
            this.recognition.start();
            this.isRecording = true;
            this.updateRecordingUI(true);
            
            console.log('Speech recognition started successfully');
            console.log('Browser:', navigator.userAgent);
            console.log('Microphone available:', navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
            
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.isRecording = false;
            this.updateRecordingUI(false);
            this.showError('Could not start speech recognition. Please check microphone permissions and try again.');
        }
    }
    
    stopRecording() {
        if (!this.isRecording) return;
        
        console.log('Stopping recording...');
        this.isRecording = false;
        this.updateRecordingUI(false);
        
        // Clear interim transcript display
        this.clearInterimTranscript();
        
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                console.error('Error stopping recognition:', e);
            }
        }
        
        // Wait a moment for final results, then process transcript
        setTimeout(() => {
            console.log('Processing final transcript after stop:', this.currentTranscript);
            if (this.currentTranscript && this.currentTranscript.trim()) {
                this.showTranscript(this.currentTranscript.trim());
                const finalText = this.currentTranscript.trim();
                this.currentTranscript = '';
                this.hasReceivedResults = false;
            } else {
                // Show message if no transcript
                const statusDiv = document.getElementById('audio-status');
                if (statusDiv) {
                    if (this.hasReceivedResults) {
                        statusDiv.textContent = 'Speech detected but could not be transcribed. Please try again.';
                    } else {
                        statusDiv.textContent = 'No speech detected. Please speak clearly and hold the button while speaking.';
                    }
                    setTimeout(() => {
                        statusDiv.textContent = 'Click and hold to record your answer';
                    }, 4000);
                }
                this.hasReceivedResults = false;
            }
        }, 800); // Increased delay to allow final results to come through
    }
    
    updateInterimTranscript(text) {
        const statusDiv = document.getElementById('audio-status');
        if (statusDiv && text) {
            statusDiv.textContent = `Listening: ${text}...`;
        }
    }
    
    clearInterimTranscript() {
        const statusDiv = document.getElementById('audio-status');
        if (statusDiv && !this.isRecording) {
            statusDiv.textContent = 'Click and hold to record your answer';
        }
    }
    
    showTranscript(text) {
        const transcriptDiv = document.getElementById('chatbot-transcript');
        const transcriptText = document.getElementById('transcript-text');
        
        if (transcriptDiv && transcriptText) {
            transcriptText.textContent = text;
            transcriptDiv.style.display = 'block';
            console.log('Transcript displayed:', text);
            
            // Scroll transcript into view
            transcriptDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            console.error('Transcript elements not found');
        }
    }
    
    cancelTranscript() {
        const transcriptDiv = document.getElementById('chatbot-transcript');
        const transcriptText = document.getElementById('transcript-text');
        
        if (transcriptDiv) {
            transcriptDiv.style.display = 'none';
        }
        if (transcriptText) {
            transcriptText.textContent = '';
        }
        this.currentTranscript = '';
    }
    
    async sendAnswer() {
        const transcriptText = document.getElementById('transcript-text');
        const text = transcriptText ? transcriptText.textContent : '';
        
        if (!text.trim()) {
            this.showError('Please record an answer first.');
            return;
        }
        
        // Add user message to conversation
        this.conversationHistory.push({
            role: 'user',
            content: text
        });
        
        // Display user message
        this.addMessage(text, 'user');
        
        // Hide transcript area
        this.cancelTranscript();
        
        // Get AI response
        await this.getAIResponse();
    }
    
    async getAIResponse() {
        try {
            // Check if API endpoint is configured
            if (this.apiEndpoint === 'YOUR_SERVERLESS_FUNCTION_URL_HERE') {
                this.hideLoading();
                this.showError('API endpoint not configured. Please set up your serverless function and update the apiEndpoint in chatbot.js. See context.txt for instructions.');
                return;
            }
            
            this.showLoading('Thinking...');
            
            // If this is the first message, start with a question
            if (this.conversationHistory.length === 1) {
                await this.askFirstQuestion();
                return;
            }
            
            // Send conversation to API
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: this.conversationHistory[this.conversationHistory.length - 1].content,
                    history: this.conversationHistory.slice(0, -1),
                    systemPrompt: this.systemPrompt
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            const aiMessage = result.text || result.message || 'No response received.';
            
            // Add AI response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: aiMessage
            });
            
            // Check if this is assessment/feedback
            if (this.isAssessmentMessage(aiMessage)) {
                this.assessmentMode = true;
                this.addMessage(aiMessage, 'assistant', true);
            } else {
                this.addMessage(aiMessage, 'assistant');
            }
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.hideLoading();
            this.showError('Could not get response from AI. Please check your serverless function configuration and try again.');
        }
    }
    
    async askFirstQuestion() {
        const firstQuestion = "Let's start! Can you tell me about your experience with robotics and what drew you to FTC?";
        
        this.conversationHistory.push({
            role: 'assistant',
            content: firstQuestion
        });
        
        this.addMessage(firstQuestion, 'assistant');
    }
    
    isAssessmentMessage(message) {
        // Check if message contains feedback keywords
        const feedbackKeywords = ['feedback', 'suggestion', 'improve', 'strength', 'weakness', 'assessment', 'evaluation'];
        return feedbackKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }
    
    addMessage(text, role, isAssessment = false) {
        const messagesDiv = document.getElementById('chatbot-messages');
        if (!messagesDiv) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message chatbot-message-${role} ${isAssessment ? 'chatbot-assessment' : ''}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = text;
        
        messageDiv.appendChild(messageContent);
        messagesDiv.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        // Hide loading
        this.hideLoading();
    }
    
    updateRecordingUI(isRecording) {
        const recordBtn = document.getElementById('audio-record-btn');
        const statusDiv = document.getElementById('audio-status');
        
        if (!recordBtn) return;
        
        if (isRecording) {
            recordBtn.classList.add('recording');
            recordBtn.innerHTML = '<i class="fas fa-stop"></i> <span data-en="Recording..." data-zh="录音中...">Recording...</span>';
            if (statusDiv) {
                statusDiv.textContent = 'Recording...';
            }
        } else {
            recordBtn.classList.remove('recording');
            recordBtn.innerHTML = '<i class="fas fa-microphone"></i> <span data-en="Hold to Record" data-zh="按住录音">Hold to Record</span>';
            if (statusDiv) {
                statusDiv.textContent = 'Click and hold to record your answer';
            }
        }
    }
    
    showLoading(message) {
        const messagesDiv = document.getElementById('chatbot-messages');
        if (!messagesDiv) return;
        
        let loadingDiv = document.getElementById('chatbot-loading');
        
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'chatbot-loading';
            loadingDiv.className = 'chatbot-loading';
            messagesDiv.appendChild(loadingDiv);
        }
        
        loadingDiv.textContent = message;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    hideLoading() {
        const loadingDiv = document.getElementById('chatbot-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
    
    showError(message) {
        const messagesDiv = document.getElementById('chatbot-messages');
        if (!messagesDiv) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'chatbot-message chatbot-error';
        errorDiv.textContent = message;
        messagesDiv.appendChild(errorDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    toggleChatbot() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbot-window');
        
        if (!window) return;
        
        if (this.isOpen) {
            window.classList.add('open');
            // Start conversation if it's the first time
            if (this.conversationHistory.length === 0) {
                setTimeout(() => this.askFirstQuestion(), 500);
            }
        } else {
            window.classList.remove('open');
        }
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ftcChatbot = new FTCChatbot();
});

