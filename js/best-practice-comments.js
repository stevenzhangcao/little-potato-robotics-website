/**
 * FTC Best Practice Comments System
 * Sends comments as emails via EmailJS
 */

const PAGE_ID = 'ftc-best-practice';

// Initialize EmailJS when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS with public key
    try {
        if (typeof emailjs !== 'undefined') {
            emailjs.init('VzlpHD2wwgOBDvjrm');
            console.log('EmailJS initialized successfully for best practice comments');
        }
    } catch (error) {
        console.error('EmailJS initialization failed:', error);
    }
    
    // No need to load comments since we're sending emails
    // Just show a message that comments are sent via email
    displayEmailInfo();
});

// Display info about email submission
function displayEmailInfo() {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    commentsList.innerHTML = `
        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px; text-align: center; color: var(--text-secondary);">
            <i class="fas fa-envelope" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 10px;"></i>
            <p style="margin: 10px 0;"><strong data-en="Your feedback is important to us!" data-zh="您的反馈对我们很重要！">Your feedback is important to us!</strong></p>
            <p style="margin: 10px 0;" data-en="When you submit a comment, it will be sent directly to our team via email. We review all submissions and may add valuable contributions to this page." data-zh="当您提交评论时，它将通过电子邮件直接发送给我们的团队。我们会审查所有提交，并可能将有价值的贡献添加到此页面。">When you submit a comment, it will be sent directly to our team via email. We review all submissions and may add valuable contributions to this page.</p>
        </div>
    `;
}

// Submit comment as email
async function submitComment() {
    const userName = document.getElementById('userName').value.trim();
    const teamId = document.getElementById('teamId').value.trim();
    const connectionMethod = document.getElementById('connectionMethod').value.trim();
    const userLocation = document.getElementById('userLocation').value.trim();
    const commentType = document.getElementById('commentType').value;
    const userComment = document.getElementById('userComment').value.trim();
    
    // Validation
    if (!userName || !teamId || !connectionMethod || !userComment) {
        showCommentStatus('Please fill in all required fields (Name, Team ID, Connection Method, and Comment).', 'error');
        return;
    }
    
    if (userComment.length < 10) {
        showCommentStatus('Please write a more detailed comment (at least 10 characters).', 'error');
        return;
    }
    
    // Check if EmailJS is available
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS is not loaded');
        showCommentStatus('Email service is not available. Please refresh the page and try again.', 'error');
        return;
    }
    
    // Ensure EmailJS is initialized
    try {
        if (!emailjs.init) {
            console.error('EmailJS init function not available');
            showCommentStatus('Email service initialization failed. Please refresh the page.', 'error');
            return;
        }
        emailjs.init('VzlpHD2wwgOBDvjrm');
    } catch (initError) {
        console.error('EmailJS initialization error:', initError);
        showCommentStatus('Email service initialization failed. Please refresh the page.', 'error');
        return;
    }
    
    // Get comment type label
    const typeLabels = {
        'best-practice': 'Best Practice',
        'tip': 'Tip/Suggestion',
        'feedback': 'Feedback',
        'improvement': 'Improvement',
        'general': 'General Comment'
    };
    
    const typeLabel = typeLabels[commentType] || 'Comment';
    
    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span data-en="Sending..." data-zh="发送中...">Sending...</span>';
        submitBtn.disabled = true;
    }
    
    // Format simple message (same format as contact form)
    const emailMessage = `FTC Best Practice Comment

Name: ${userName}
Team ID: ${teamId}
Connection Method: ${connectionMethod}
Location: ${userLocation || 'Not provided'}
Category: ${typeLabel}

Comment/Recommendation:
${userComment}`;
    
    // Prepare email template parameters (same structure as contact form)
    const templateParams = {
        // Sender information (same as contact form)
        from_name: userName,
        from_email: connectionMethod.includes('@') ? connectionMethod : 'noreply@littlepotatorobotics.com',
        user_name: userName,
        user_email: connectionMethod.includes('@') ? connectionMethod : 'noreply@littlepotatorobotics.com',
        
        // Message content (same format as contact form)
        subject: `FTC Best Practice ${typeLabel} from ${userName} (${teamId})`,
        message: emailMessage,
        user_message: emailMessage,
        message_text: emailMessage,
        
        // Recipient information (template will handle this)
        to_email: 'littlepotatorobotics@gmail.com',
        to_name: 'Little Potato Robotics Team',
        
        // Additional context (same as contact form)
        website: 'Little Potato Robotics',
        team_name: 'Little Potato Robotics',
        team_number: '30592',
        location: 'Fremont, California',
        
        // Timestamp
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        
        // Form type
        form_type: 'Best Practice Comment',
        source: 'FTC Best Practice Page'
    };
    
    // Send email using EmailJS (same service and template as contact form)
    console.log('Sending best practice comment email...');
    console.log('Using Service ID: service_u5yub0k');
    console.log('Using Template ID: template_wb9r0jk');
    console.log('Template params:', templateParams);
    
    // Use same service and template as contact form
    emailjs.send('service_u5yub0k', 'template_wb9r0jk', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            console.log('Email sent successfully to littlepotatorobotics@gmail.com');
            
            // Show success message
            showCommentStatus('Thank you for your contribution! Your comment has been sent to our team via email.', 'success');
            
            // Clear form
            document.getElementById('userName').value = '';
            document.getElementById('teamId').value = '';
            document.getElementById('connectionMethod').value = '';
            document.getElementById('userLocation').value = '';
            document.getElementById('userComment').value = '';
            document.getElementById('commentType').value = 'best-practice';
            
            // Scroll to status message
            setTimeout(() => {
                const statusDiv = document.getElementById('commentStatus');
                if (statusDiv) {
                    statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
        }, function(error) {
            console.error('EmailJS Error:', error);
            console.error('Error Status:', error.status);
            console.error('Error Text:', error.text);
            console.error('Error Code:', error.code);
            console.error('Full Error Object:', error);
            
            // Provide more specific error messages
            let errorMessage = 'Sorry, there was an error sending your comment. ';
            
            if (error.status === 400) {
                errorMessage += 'Invalid request. Please check that all fields are filled correctly.';
            } else if (error.status === 401) {
                errorMessage += 'Authentication failed. Please contact the website administrator.';
            } else if (error.status === 404) {
                errorMessage += 'Service or template not found. Please verify the service ID (service_nkctrli) and template ID (template_651hno6) are correct.';
            } else if (error.status === 429) {
                errorMessage += 'Too many requests. Please wait a moment and try again.';
            } else if (error.status === 500) {
                errorMessage += 'Server error. Please try again later.';
            } else if (error.text) {
                errorMessage += `Error: ${error.text}. Please try again or email us directly at littlepotatorobotics@gmail.com`;
            } else {
                errorMessage += `Error code: ${error.status || 'Unknown'}. Please try again or email us directly at littlepotatorobotics@gmail.com`;
            }
            
            showCommentStatus(errorMessage, 'error');
        })
        .finally(function() {
            // Reset button state
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
}

// Show status message
function showCommentStatus(message, type) {
    const statusDiv = document.getElementById('commentStatus');
    if (!statusDiv) return;
    
    statusDiv.textContent = message;
    statusDiv.className = `comment-status ${type}`;
    
    // Auto-hide after 8 seconds for success, 10 seconds for error
    const hideDelay = type === 'success' ? 8000 : 10000;
    setTimeout(() => {
        statusDiv.className = 'comment-status';
        statusDiv.textContent = '';
    }, hideDelay);
}

// Make submitComment available globally
window.submitComment = submitComment;
