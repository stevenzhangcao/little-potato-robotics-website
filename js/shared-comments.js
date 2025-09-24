/**
 * FTC Global Comment System
 * Shared comment functionality for all FTC simulators
 * Version: 1.0
 */

class FTCGlobalComments {
  constructor(simulatorId, options = {}) {
    this.simulatorId = simulatorId;
    this.storageKey = 'ftcGlobalComments';
    this.options = {
      showLocation: true,
      showSimulator: true,
      enableExport: true,
      enableImport: true,
      ...options
    };
  }

  // Initialize the comment system
  init() {
    this.loadComments();
    this.setupEventListeners();
    console.log(`FTC Global Comments initialized for ${this.simulatorId}`);
  }

  // Load comments from global storage
  loadComments() {
    const savedComments = localStorage.getItem(this.storageKey);
    if (savedComments) {
      try {
        const globalData = JSON.parse(savedComments);
        const comments = globalData.comments || [];
        
        // Filter comments for this simulator or global comments
        const relevantComments = comments.filter(comment => 
          !comment.simulator || comment.simulator === this.simulatorId || comment.simulator === 'global'
        );
        
        this.displayComments(relevantComments);
      } catch (error) {
        console.error('Error loading comments:', error);
        this.loadDefaultComments();
      }
    } else {
      this.loadDefaultComments();
    }
  }

  // Save comments to global storage
  saveComments(comments) {
    try {
      const existingData = JSON.parse(localStorage.getItem(this.storageKey) || '{"comments": [], "lastUpdated": null}');
      
      const globalData = {
        ...existingData,
        comments: comments,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(globalData));
      console.log('Comments saved to global storage');
    } catch (error) {
      console.error('Error saving comments:', error);
      this.showStatus('Warning: Comments may not be saved permanently.', 'error');
    }
  }

  // Load default comments for first-time users
  loadDefaultComments() {
    const defaultComments = [
      {
        id: 'global_welcome',
        userName: 'FTC Community',
        userLocation: 'Global',
        commentType: 'general',
        userComment: 'Welcome to the global FTC simulator community! Share your best parameters, report bugs, and suggest improvements. Your feedback helps make these simulators better for everyone!',
        timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000), // 1 week ago
        simulator: 'global',
        isDefault: true
      }
    ];

    // Add simulator-specific default comments
    if (this.simulatorId === 'ftc-launch-simulator') {
      defaultComments.push(
        {
          id: 'launch_1',
          userName: 'Team 30592',
          userLocation: 'Fremont, CA',
          commentType: 'parameters',
          userComment: 'Try these optimized settings: d0=40.64mm, d1=27mm, wheel friction=2.0, RPM=200. The higher friction and RPM give much better launch performance!',
          timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
          simulator: this.simulatorId,
          isDefault: true
        }
      );
    }

    const globalData = {
      comments: defaultComments,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(globalData));
    this.displayComments(defaultComments.filter(c => c.simulator === this.simulatorId || c.simulator === 'global'));
  }

  // Display comments in the UI
  displayComments(comments) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    
    // Sort comments by timestamp (newest first)
    const sortedComments = comments.sort((a, b) => b.timestamp - a.timestamp);
    
    sortedComments.forEach(comment => {
      const commentElement = this.createCommentElement(comment);
      commentsList.appendChild(commentElement);
    });
  }

  // Create comment element from data
  createCommentElement(commentData) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-item';
    commentDiv.dataset.commentId = commentData.id;
    
    // Get color based on comment type
    const colors = {
      'improvement': '#4CAF50',
      'parameters': '#4CAF50', 
      'bug': '#f44336',
      'feature': '#FF9800',
      'general': '#2196F3'
    };
    
    const typeLabels = {
      'improvement': 'Improvement Suggestion',
      'parameters': 'Best Parameters',
      'bug': 'Bug Report', 
      'feature': 'Feature Request',
      'general': 'General Comment'
    };
    
    const borderColor = colors[commentData.commentType] || '#2196F3';
    const typeLabel = typeLabels[commentData.commentType] || 'Comment';
    
    commentDiv.style.cssText = `
      background: #f8f9fa; 
      padding: 10px; 
      margin-bottom: 10px; 
      border-radius: 6px; 
      border-left: 4px solid ${borderColor};
      transition: all 0.3s ease;
    `;
    
    // Format timestamp
    const timeAgo = this.formatTimeAgo(commentData.timestamp);
    
    commentDiv.innerHTML = `
      <div style="font-weight: bold; color: #333; margin-bottom: 5px;">${commentData.userName} - ${typeLabel}</div>
      <div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">
        ${typeLabel} • ${timeAgo}
        ${this.options.showLocation && commentData.userLocation ? ` • ${commentData.userLocation}` : ''}
        ${this.options.showSimulator && commentData.simulator && commentData.simulator !== this.simulatorId ? ` • From ${commentData.simulator.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}` : ''}
      </div>
      <div style="color: #555;">${commentData.userComment}</div>
      ${commentData.isDefault ? '<div style="font-size: 0.8em; color: #999; margin-top: 5px; font-style: italic;">Default comment</div>' : ''}
    `;
    
    return commentDiv;
  }

  // Format timestamp to human-readable format
  formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  // Submit a new comment
  submitComment() {
    const userName = document.getElementById('userName')?.value?.trim();
    const userLocation = document.getElementById('userLocation')?.value?.trim();
    const commentType = document.getElementById('commentType')?.value;
    const userComment = document.getElementById('userComment')?.value?.trim();
    
    // Validation
    if (!userName || !userComment) {
      this.showStatus('Please fill in both name and comment fields.', 'error');
      return;
    }
    
    if (userComment.length < 10) {
      this.showStatus('Please write a more detailed comment (at least 10 characters).', 'error');
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
      simulator: this.simulatorId,
      isDefault: false
    };
    
    // Load existing global comments
    const globalData = JSON.parse(localStorage.getItem(this.storageKey) || '{"comments": []}');
    const existingComments = globalData.comments || [];
    
    // Add new comment to the beginning
    existingComments.unshift(newComment);
    
    // Save updated comments to global storage
    this.saveComments(existingComments);
    
    // Refresh display (filter for current simulator)
    const relevantComments = existingComments.filter(comment => 
      !comment.simulator || comment.simulator === this.simulatorId || comment.simulator === 'global'
    );
    this.displayComments(relevantComments);
    
    // Clear form
    if (document.getElementById('userName')) document.getElementById('userName').value = '';
    if (document.getElementById('userLocation')) document.getElementById('userLocation').value = '';
    if (document.getElementById('userComment')) document.getElementById('userComment').value = '';
    if (document.getElementById('commentType')) document.getElementById('commentType').value = 'improvement';
    
    // Show success message
    this.showStatus('Thank you for your comment! It has been saved to the global community forum.', 'success');
    
    // Scroll to show the new comment
    const newCommentElement = document.querySelector(`[data-comment-id="${newComment.id}"]`);
    if (newCommentElement) {
      newCommentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    console.log('New comment submitted to global storage:', newComment);
  }

  // Show status message
  showStatus(message, type) {
    const statusDiv = document.getElementById('commentStatus');
    if (!statusDiv) return;
    
    statusDiv.style.display = 'block';
    statusDiv.textContent = message;
    
    if (type === 'success') {
      statusDiv.style.cssText = `
        margin-top: 10px; 
        padding: 10px; 
        border-radius: 6px; 
        display: block;
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      `;
    } else if (type === 'error') {
      statusDiv.style.cssText = `
        margin-top: 10px; 
        padding: 10px; 
        border-radius: 6px; 
        display: block;
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      `;
    }
    
    // Hide status after 5 seconds
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 5000);
  }

  // Setup event listeners
  setupEventListeners() {
    // Comment submission
    const submitBtn = document.getElementById('submitComment');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitComment());
    }
    
    // Allow Enter key to submit comment
    const commentTextarea = document.getElementById('userComment');
    if (commentTextarea) {
      commentTextarea.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          this.submitComment();
        }
      });
    }
  }

  // Export comments to JSON file
  exportComments() {
    try {
      const globalData = JSON.parse(localStorage.getItem(this.storageKey) || '{"comments": []}');
      const comments = globalData.comments || [];
      
      if (comments.length === 0) {
        this.showStatus('No comments to export.', 'error');
        return;
      }
      
      // Create export data with metadata
      const exportData = {
        exportDate: new Date().toISOString(),
        simulatorVersion: '1.0',
        totalComments: comments.length,
        globalComments: true,
        comments: comments
      };
      
      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `ftc-global-comments-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      this.showStatus(`Successfully exported ${comments.length} global comments to JSON file.`, 'success');
      console.log('Global comments exported:', exportData);
    } catch (error) {
      console.error('Error exporting comments:', error);
      this.showStatus('Error exporting comments. Please try again.', 'error');
    }
  }
}

// Export for use in other simulators
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FTCGlobalComments;
} else if (typeof window !== 'undefined') {
  window.FTCGlobalComments = FTCGlobalComments;
}
