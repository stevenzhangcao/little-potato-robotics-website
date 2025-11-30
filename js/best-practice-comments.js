/**
 * FTC Best Practice Comments System
 * Handles comments and feedback for the Best Practice page
 */

const BEST_PRACTICE_STORAGE_KEY = 'ftcBestPracticeComments';
const PAGE_ID = 'ftc-best-practice';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadComments();
});

// Load comments from localStorage
function loadComments() {
    const savedData = localStorage.getItem(BEST_PRACTICE_STORAGE_KEY);
    let comments = [];
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            comments = data.comments || [];
        } catch (error) {
            console.error('Error loading comments:', error);
            comments = getDefaultComments();
        }
    } else {
        comments = getDefaultComments();
        saveComments(comments);
    }
    
    displayComments(comments);
}

// Get default comments for first-time users
function getDefaultComments() {
    return [
        {
            id: 'welcome_1',
            userName: 'Little Potato Robotics',
            userLocation: 'Fremont, CA',
            commentType: 'best-practice',
            userComment: 'Welcome to the FTC Best Practices community forum! Share your experiences, tips, and feedback to help build a comprehensive resource for all FTC teams.',
            timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000),
            isDefault: true
        }
    ];
}

// Save comments to localStorage
function saveComments(comments) {
    try {
        const data = {
            comments: comments,
            lastUpdated: new Date().toISOString(),
            version: '1.0'
        };
        localStorage.setItem(BEST_PRACTICE_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving comments:', error);
        showCommentStatus('Warning: Comments may not be saved permanently.', 'error');
    }
}

// Display comments in the UI
function displayComments(comments) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No comments yet. Be the first to share a best practice!</p>';
        return;
    }
    
    // Sort comments by timestamp (newest first)
    const sortedComments = comments.sort((a, b) => b.timestamp - a.timestamp);
    
    sortedComments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        commentsList.appendChild(commentElement);
    });
}

// Create comment element from data
function createCommentElement(commentData) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-item';
    commentDiv.dataset.commentId = commentData.id;
    
    // Get color based on comment type
    const colors = {
        'best-practice': '#4CAF50',
        'tip': '#2196F3',
        'feedback': '#FF9800',
        'improvement': '#9C27B0',
        'general': '#757575'
    };
    
    const typeLabels = {
        'best-practice': 'Best Practice',
        'tip': 'Tip/Suggestion',
        'feedback': 'Feedback',
        'improvement': 'Improvement',
        'general': 'General Comment'
    };
    
    const borderColor = colors[commentData.commentType] || '#757575';
    const typeLabel = typeLabels[commentData.commentType] || 'Comment';
    
    commentDiv.style.borderLeftColor = borderColor;
    
    // Format timestamp
    const timeAgo = formatTimeAgo(commentData.timestamp);
    
    commentDiv.innerHTML = `
        <div class="comment-header">
            <div>
                <span class="comment-author">${escapeHtml(commentData.userName)}</span>
                <span class="comment-type" style="background: ${borderColor}; color: white;">${typeLabel}</span>
            </div>
        </div>
        <div class="comment-meta">
            ${timeAgo}
            ${commentData.userLocation ? ` • ${escapeHtml(commentData.userLocation)}` : ''}
            ${commentData.isDefault ? ' • Default comment' : ''}
        </div>
        <div class="comment-content">${escapeHtml(commentData.userComment)}</div>
    `;
    
    return commentDiv;
}

// Format timestamp to human-readable format
function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    
    if (seconds < 60) {
        return 'Just now';
    } else if (minutes < 60) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days < 7) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (weeks < 4) {
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (months < 12) {
        return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
        return new Date(timestamp).toLocaleDateString();
    }
}

// Submit new comment
function submitComment() {
    const userName = document.getElementById('userName').value.trim();
    const userLocation = document.getElementById('userLocation').value.trim();
    const commentType = document.getElementById('commentType').value;
    const userComment = document.getElementById('userComment').value.trim();
    
    // Validation
    if (!userName || !userComment) {
        showCommentStatus('Please fill in both name and comment fields.', 'error');
        return;
    }
    
    if (userComment.length < 10) {
        showCommentStatus('Please write a more detailed comment (at least 10 characters).', 'error');
        return;
    }
    
    // Create new comment object
    const newComment = {
        id: 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userName: userName,
        userLocation: userLocation || null,
        commentType: commentType,
        userComment: userComment,
        timestamp: Date.now(),
        isDefault: false
    };
    
    // Load existing comments
    const savedData = localStorage.getItem(BEST_PRACTICE_STORAGE_KEY);
    let existingComments = [];
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            existingComments = data.comments || [];
        } catch (error) {
            console.error('Error loading existing comments:', error);
        }
    }
    
    // Add new comment to the beginning
    existingComments.unshift(newComment);
    
    // Save updated comments
    saveComments(existingComments);
    
    // Refresh display
    displayComments(existingComments);
    
    // Clear form
    document.getElementById('userName').value = '';
    document.getElementById('userLocation').value = '';
    document.getElementById('userComment').value = '';
    document.getElementById('commentType').value = 'best-practice';
    
    // Show success message
    showCommentStatus('Thank you for your contribution! Your comment has been added.', 'success');
    
    // Scroll to comments
    setTimeout(() => {
        document.getElementById('commentsList').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Show status message
function showCommentStatus(message, type) {
    const statusDiv = document.getElementById('commentStatus');
    if (!statusDiv) return;
    
    statusDiv.textContent = message;
    statusDiv.className = `comment-status ${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusDiv.className = 'comment-status';
        statusDiv.textContent = '';
    }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make submitComment available globally
window.submitComment = submitComment;

