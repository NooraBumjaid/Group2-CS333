/**
 * Campus News Portal - Core JavaScript Functionality
 */

class NewsPortal {
    constructor() {
        // Initialize state
        this.posts = [];
        this.comments = [];
        this.currentPageNum = 1; // For pagination
        this.postsPerPage = 3; // Changed to 3 posts per page as requested
        this.currentSearch = '';
        this.currentDepartment = '';
        this.currentSort = 'sort-by-date'; // Default to newest first
        this.isLoading = false;
        this.currentUser = 'user1'; // Default user for likes
        this.currentPostId = null;
        
        // Show loading spinner immediately
        this.showLoading();
        
        // Determine which page we're on
        this.currentPageName = window.location.pathname.split('/').pop();
        
        // Initialize common UI components first
        this.initCommonListeners();
        
        // Wait a short time to ensure spinner is visible, then initialize page
        setTimeout(() => {
            // Initialize the application based on the current page
            if (this.currentPageName.includes('rana.html') || this.currentPageName === '' || this.currentPageName === '/') {
                // Main news listing page
                this.initMainPageListeners();
            } else if (this.currentPageName.includes('addpost.html')) {
                // Post detail/edit page
                this.initDetailPageListeners();
            } else if (this.currentPageName.includes('addcomment.html')) {
                // Comment add/edit page
                this.initCommentPageListeners();
            }
            
            // Load initial data after a slight delay
            this.loadData();
        }, 300);
    }

    /**
     * Initialize common elements for all pages
     */
    initCommonListeners() {
        // Show loading spinner immediately when page loads
        this.showLoading();
        
        // Set up notification container
        const notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        // Load Font Awesome if not already loaded
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
    }
    
    /**
     * Initialize the main news listing page
     */
    initMainPageListeners() {
        console.log('Initializing main page listeners');
        
        // Search input
        const searchInput = document.getElementById('search-news');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.currentPageNum = 1; // Reset to first page when searching
                this.renderPosts();
            });
        }

        // Department filter
        const departmentSelect = document.querySelector('#news-filter select');
        if (departmentSelect) {
            departmentSelect.addEventListener('change', (e) => {
                this.currentDepartment = e.target.value === 'no-filter-option' ? '' : e.target.value;
                this.currentPageNum = 1; // Reset to first page when filtering
                this.renderPosts();
            });
        }

        // Sort options
        const sortSelect = document.querySelector('#news-sort select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderPosts();
            });
        }

        // Add post button (show form)
        const addPostBtn = document.getElementById('add-post-btn');
        if (addPostBtn) {
            addPostBtn.addEventListener('click', () => {
                const addPostForm = document.getElementById('add-post-form');
                if (addPostForm) {
                    addPostForm.style.display = 'block';
                    // Clear form
                    const form = document.getElementById('post-form');
                    if (form) form.reset();
                    
                    const formTitle = document.getElementById('form-title');
                    if (formTitle) formTitle.textContent = 'Add New Post';
                }
            });
        }

        // Post form submission
        const postForm = document.getElementById('post-form');
        if (postForm) {
            postForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePostSubmission();
            });
        }

        // Cancel post button (hide form)
        const cancelPostBtn = document.getElementById('cancel-post');
        if (cancelPostBtn) {
            cancelPostBtn.addEventListener('click', () => {
                const addPostForm = document.getElementById('add-post-form');
                if (addPostForm) {
                    addPostForm.style.display = 'none';
                }
            });
        }
    }
    
    /**
     * Initialize the post detail/edit page
     */
    initDetailPageListeners() {
        console.log('Initializing post detail page listeners');
        
        // Get post ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        this.currentPostId = postId;
        
        if (!postId) {
            // No post ID provided, redirect to main page
            window.location.href = 'rana.html';
            return;
        }
        
        // Function to set up event listeners
        const setupListeners = () => {
            console.log('Setting up detail page event listeners');
            
            // Like button
            const likeBtn = document.getElementById('like-post-btn');
            if (likeBtn) {
                likeBtn.addEventListener('click', () => {
                    this.toggleLike(postId);
                    this.updatePostDetails();
                });
            }
            
            // Edit button
            const editBtn = document.getElementById('edit-post-btn');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    this.showEditPostForm(postId);
                });
            }
            
            // Delete button
            const deleteBtn = document.getElementById('delete-post-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (confirm('Are you sure you want to delete this post?')) {
                        this.deletePost(postId);
                    }
                });
            }
            
            // Add comment link
            const addCommentLink = document.getElementById('add-comment-link');
            if (addCommentLink) {
                console.log('Found Add Comment link, setting href to:', `addcomment.html?id=${postId}`);
                addCommentLink.href = `addcomment.html?id=${postId}`;
            } else {
                console.log('Add Comment link not found');
            }
        };
        
        // Function to set up form-related event listeners
        const setupFormListeners = () => {
            // Post form submission (for edit)
            const postForm = document.getElementById('post-form');
            if (postForm) {
                postForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handlePostSubmission(postId);
                });
            }
            
            // Cancel edit button
            const cancelBtn = document.getElementById('cancel-post');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    // Reset the form
                    const form = document.getElementById('post-form');
                    if (form) {
                        form.reset();
                    }
                    
                    // Hide the form
                    const addPostForm = document.getElementById('add-post-form');
                    if (addPostForm) {
                        addPostForm.style.display = 'none';
                    }
                    
                    // Show post view with the original data
                    const postView = document.getElementById('post-view');
                    if (postView) {
                        postView.style.display = 'block';
                        this.updatePostDetails(); // Restore original post details
                    }
                });
            }
        };
        
        // Set up all event listeners
        const setupAllListeners = () => {
            setupListeners();
            setupFormListeners();
        };
        
        // If the DOM is already loaded, set up listeners immediately
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setupAllListeners();
        } else {
            // Otherwise, wait for the DOM to be fully loaded
            document.addEventListener('DOMContentLoaded', setupAllListeners);
        }
    }
    
    /**
     * Initialize the comment page
     */
    initCommentPageListeners() {
        console.log('Initializing comment page listeners');
        
        // Get post ID and other parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        const replyToId = urlParams.get('replyTo');
        const editCommentId = urlParams.get('edit');
        
        this.currentPostId = postId;
        
        if (!postId) {
            // No post ID provided, redirect to main page
            window.location.href = 'rana.html';
            return;
        }
        
        // Set up back button
        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = `addpost.html?id=${postId}`;
            });
        }
        
        // Set up comment form
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            // Set the hidden post ID field
            const postIdField = document.getElementById('postId');
            if (postIdField) {
                postIdField.value = postId;
            }
            
            // Set up reply info if replying to a comment
            if (replyToId) {
                const replyToIdField = document.getElementById('replyToId');
                if (replyToIdField) {
                    replyToIdField.value = replyToId;
                }
                
                // Show reply indicator
                const replyIndicator = document.getElementById('reply-indicator');
                const replyUsername = document.getElementById('reply-to-username');
                
                if (replyIndicator && replyUsername) {
                    // Find the comment being replied to
                    this.loadData().then(() => {
                        const comment = this.comments.find(c => c.id === replyToId);
                        if (comment) {
                            replyUsername.textContent = comment.username;
                            replyIndicator.style.display = 'block';
                        }
                    });
                }
                
                // Cancel reply button
                const cancelReplyBtn = document.getElementById('cancel-reply');
                if (cancelReplyBtn) {
                    cancelReplyBtn.addEventListener('click', () => {
                        // Clear reply to field and hide indicator
                        const replyToIdField = document.getElementById('replyToId');
                        if (replyToIdField) {
                            replyToIdField.value = '';
                        }
                        
                        replyIndicator.style.display = 'none';
                    });
                }
            }
            
            // Setup for editing a comment
            if (editCommentId) {
                const editCommentIdField = document.getElementById('editCommentId');
                if (editCommentIdField) {
                    editCommentIdField.value = editCommentId;
                }
                
                // Load comment data
                this.loadData().then(() => {
                    const comment = this.comments.find(c => c.id === editCommentId);
                    if (comment) {
                        // Set form title
                        const formTitle = document.getElementById('form-title');
                        if (formTitle) {
                            formTitle.textContent = '✏️ Edit Comment';
                        }
                        
                        // Fill form fields
                        const usernameField = document.getElementById('username');
                        const commentTextField = document.getElementById('commentText');
                        
                        if (usernameField) {
                            usernameField.value = comment.username;
                        }
                        
                        if (commentTextField) {
                            commentTextField.value = comment.text;
                        }
                        
                        // Set submit button text
                        const submitButtonText = document.getElementById('submit-button-text');
                        if (submitButtonText) {
                            submitButtonText.textContent = 'Update Comment';
                        }
                    }
                });
            }
            
            // Handle form submission
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCommentSubmission();
            });
            
            // Cancel button
            const cancelButton = document.getElementById('cancel-button');
            if (cancelButton) {
                cancelButton.addEventListener('click', () => {
                    window.location.href = `addpost.html?id=${postId}`;
                });
            }
            
            // Type of submission handler
            const radioButtons = document.querySelectorAll('input[name="submissionType"]');
            radioButtons.forEach(radio => {
                radio.addEventListener('change', () => {
                    // Hide all fields first
                    document.querySelector('.uploadField').style.display = 'none';
                    document.querySelector('.linkField').style.display = 'none';
                    
                    // Show the appropriate field based on selection
                    if (radio.value === 'photo') {
                        document.querySelector('.uploadField').style.display = 'block';
                    } else if (radio.value === 'link') {
                        document.querySelector('.linkField').style.display = 'block';
                    }
                });
            });
        }
    }

    /**
     * Load data from localStorage or example.json
     */
    async loadData() {
        this.showLoading();
        
        try {
            // Try to get data from localStorage first
            const savedPosts = localStorage.getItem('posts');
            const savedComments = localStorage.getItem('comments');
            
            // If we have saved data, use it
            if (savedPosts && savedComments) {
                console.log('Loading data from localStorage');
                this.posts = JSON.parse(savedPosts) || [];
                this.comments = JSON.parse(savedComments) || [];
            } else {
                // Otherwise load from example.json
                console.log('Loading data from example.json');
                const response = await fetch('example.json');
                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('Data loaded from example.json:', data);
                
                // Store the posts and comments
                this.posts = data.posts || [];
                this.comments = data.comments || [];
                
                // Save to localStorage for future use
                this.savePosts();
            }
            
            // Initialize the current page
            const pagePath = window.location.pathname.split('/').pop();
            
            if (pagePath.includes('rana.html') || pagePath === '' || pagePath === '/') {
                // Main page - render post listing
                this.renderPosts();
            } else if (pagePath.includes('addpost.html')) {
                // Post detail page - render post details and comments
                this.updatePostDetails();
                this.renderComments();
            }
            
            return { posts: this.posts, comments: this.comments };
        } catch (error) {
            console.error('Error loading data:', error);
            
            // If we have no data at all, create empty arrays
            if (!this.posts || !this.posts.length) {
                this.posts = [];
            }
            if (!this.comments || !this.comments.length) {
                this.comments = [];
            }
            
            this.showNotification('Failed to load data. Using empty data set.', 'is-warning');
            
            // Still try to render whatever we have
            const pagePath = window.location.pathname.split('/').pop();
            if (pagePath.includes('rana.html') || pagePath === '' || pagePath === '/') {
                this.renderPosts();
            }
            
            return { posts: this.posts, comments: this.comments };
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * Update post details on the detail page
     */
    updatePostDetails() {
        // If not on the detail page, return
        if (!window.location.pathname.includes('addpost.html')) {
            return;
        }
        
        // Get post ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        
        if (!postId) {
            window.location.href = 'rana.html';
            return;
        }
        
        // Find the post
        const post = this.posts.find(p => p.id === postId);
        if (!post) {
            this.showNotification('Post not found', 'is-danger');
            setTimeout(() => {
                window.location.href = 'rana.html';
            }, 2000);
            return;
        }
        
        // Update the add comment link
        const addCommentLink = document.getElementById('add-comment-link');
        if (addCommentLink) {
            console.log('Setting add comment link href in updatePostDetails');
            addCommentLink.href = `addcomment.html?id=${postId}`;
        }
        
        // Update elements
        document.title = post.title;
        
        const titleElement = document.getElementById('post-title');
        if (titleElement) titleElement.textContent = post.title;
        
        const authorElement = document.getElementById('post-author');
        if (authorElement) authorElement.textContent = post.author;
        
        const dateElement = document.getElementById('post-date');
        if (dateElement) dateElement.textContent = this.formatDate(post.date);
        
        const departmentElement = document.getElementById('post-department');
        if (departmentElement) departmentElement.textContent = post.department;
        
        const imageElement = document.getElementById('post-image');
        if (imageElement) imageElement.src = post.image;
        
        const detailsElement = document.getElementById('post-details');
        if (detailsElement) detailsElement.innerHTML = post.details;
        
        // Update like button
        const likeBtn = document.getElementById('like-post-btn');
        const likeIcon = document.getElementById('like-icon');
        const likeCount = document.getElementById('like-count');
        
        if (likeBtn && likeCount) {
            // Convert likedBy to array if needed
            const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
            
            // Check if current user has liked
            const isLiked = likedBy.includes(this.currentUser);
            
            // Update button appearance
            if (isLiked) {
                likeBtn.classList.add('is-danger', 'is-active');
                likeBtn.classList.remove('is-light');
                if (likeIcon) {
                    likeIcon.textContent = '❤️';
                    likeIcon.style.transition = 'transform 0.3s ease';
                }
            } else {
                likeBtn.classList.remove('is-danger', 'is-active');
                likeBtn.classList.add('is-light');
                if (likeIcon) {
                    likeIcon.textContent = '🤍';
                    likeIcon.style.transition = 'transform 0.3s ease';
                }
            }
            
            // Update count
            likeCount.textContent = post.likes || 0;
        }
        
        // Setup edit button
        const editBtn = document.getElementById('edit-post-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.showEditPostForm(post.id);
            });
        }
        
        // Setup delete button
        const deleteBtn = document.getElementById('delete-post-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                    this.deletePost(post.id);
                }
            });
        }
    }
    
    /**
     * Render comments for the current post
     */
    renderComments() {
        // If not on the detail page, return
        if (!window.location.pathname.includes('addpost.html')) {
            return;
        }
        
        const commentsContainer = document.querySelector('.comments-container');
        if (!commentsContainer) return;
        
        // Get post ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        
        if (!postId) return;
        
        // Get comments for this post
        const postComments = this.comments.filter(comment => comment.postId === postId);
        
        // Clear comments container
        commentsContainer.innerHTML = '';
        
        if (postComments.length === 0) {
            commentsContainer.innerHTML = `
                <div class="notification is-info">
                    No comments yet. Be the first to comment!
                </div>
            `;
            return;
        }
        
        // Get top-level comments (no replyTo)
        const topLevelComments = postComments.filter(comment => !comment.replyTo);
        
        // Render each top-level comment
        topLevelComments.forEach(comment => {
            const commentElement = this.createCommentElement(comment);
            commentsContainer.appendChild(commentElement);
        });
    }
    
    /**
     * Create comment element with replies
     */
    createCommentElement(comment) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'box mb-5';
        commentDiv.dataset.commentId = comment.id;
        
        // Get replies to this comment
        const replies = this.comments.filter(c => c.replyTo === comment.id);
        
        // Format timestamp
        let timestamp = comment.timestamp;
        try {
            const date = new Date(comment.timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffMins < 1) {
                timestamp = 'Just now';
            } else if (diffMins < 60) {
                timestamp = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
            } else if (diffHours < 24) {
                timestamp = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else if (diffDays < 7) {
                timestamp = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            } else {
                timestamp = this.formatDate(comment.timestamp);
            }
        } catch (error) {
            console.warn('Invalid timestamp format:', comment.timestamp);
        }
        
        // If this is a reply, get parent comment info for "replying to" text
        let replyingToText = '';
        if (comment.replyTo) {
            const parentComment = this.comments.find(c => c.id === comment.replyTo);
            if (parentComment) {
                replyingToText = `<small class="is-block has-text-grey mb-2">
                    <span class="icon is-small"><i class="fas fa-reply"></i></span>
                    Replying to <strong>${parentComment.username}</strong>
                </small>`;
            }
        }
        
        // Create comment HTML with indentation based on reply level
        commentDiv.innerHTML = `
            <article class="media">
                <figure class="media-left">
                    <p class="image is-64x64">
                        <img class="is-rounded" src="${comment.profilePic || 'https://bulma.io/images/placeholders/128x128.png'}" 
                            alt="${comment.username}'s profile">
                    </p>
                </figure>
                <div class="media-content">
                    <div class="content">
                        <p>
                            <strong>${comment.username}</strong>
                            <small class="has-text-grey">${timestamp}</small>
                            ${replyingToText}
                            <br>
                            ${comment.text}
                        </p>
                        
                        ${comment.attachment ? `
                            <div class="attachment mt-2">
                                ${comment.attachment.type === 'photo' ? 
                                    `<img src="${comment.attachment.content}" alt="Attachment" style="max-width: 300px;">` : 
                                    `<a href="${comment.attachment.content}" target="_blank" rel="noopener noreferrer">
                                        <span class="icon"><i class="fas fa-link"></i></span> ${comment.attachment.content}
                                    </a>`
                                }
                            </div>
                        ` : ''}
                    </div>
                    <nav class="level is-mobile">
                        <div class="level-left">
                            <a class="level-item reply-btn" title="Reply">
                                <span class="icon is-small"><i class="fas fa-reply"></i></span>
                                <span>Reply</span>
                            </a>
                            <a class="level-item like-comment-btn ${Array.isArray(comment.likedBy) && comment.likedBy.includes(this.currentUser) ? 'has-text-danger' : ''}" title="Like">
                                <span class="icon is-small"><i class="fas fa-heart"></i></span>
                                <span>${comment.likes || 0}</span>
                            </a>
                            <a class="level-item edit-comment-btn" title="Edit">
                                <span class="icon is-small"><i class="fas fa-edit"></i></span>
                                <span>Edit</span>
                            </a>
                            <a class="level-item delete-comment-btn" title="Delete">
                                <span class="icon is-small"><i class="fas fa-trash"></i></span>
                                <span>Delete</span>
                            </a>
                        </div>
                    </nav>
                </div>
            </article>
            
            <!-- Replies will be added here -->
            <div class="comment-replies ml-5 pl-3" style="${replies.length > 0 ? '' : 'display: none;'}"></div>
        `;
        
        // Add event listeners
        const replyBtn = commentDiv.querySelector('.reply-btn');
        const likeBtn = commentDiv.querySelector('.like-comment-btn');
        const editBtn = commentDiv.querySelector('.edit-comment-btn');
        const deleteBtn = commentDiv.querySelector('.delete-comment-btn');
        
        if (replyBtn) {
            replyBtn.addEventListener('click', () => {
                window.location.href = `addcomment.html?id=${comment.postId}&replyTo=${comment.id}`;
            });
        }
        
        if (likeBtn) {
            likeBtn.addEventListener('click', () => {
                this.toggleCommentLike(comment.id);
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                window.location.href = `addcomment.html?id=${comment.postId}&edit=${comment.id}`;
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this comment?')) {
                    this.deleteComment(comment.id);
                }
            });
        }
        
        // Add replies
        if (replies.length > 0) {
            const repliesContainer = commentDiv.querySelector('.comment-replies');
            
            replies.forEach(reply => {
                const replyElement = this.createCommentElement(reply);
                repliesContainer.appendChild(replyElement);
            });
        }
        
        return commentDiv;
    }

    /**
     * Filter and sort posts based on current criteria
     */
    getFilteredAndSortedPosts() {
        let filteredPosts = [...this.posts];
        
        // Apply search filter
        if (this.currentSearch) {
            filteredPosts = filteredPosts.filter(post => 
                post.title.toLowerCase().includes(this.currentSearch) || 
                post.details.toLowerCase().includes(this.currentSearch) ||
                post.header.toLowerCase().includes(this.currentSearch) ||
                post.author.toLowerCase().includes(this.currentSearch)
            );
        }
        
        // Apply department filter
        if (this.currentDepartment) {
            filteredPosts = filteredPosts.filter(post => 
                post.department === this.currentDepartment
            );
        }
        
        // Always sort by date first for consistent ordering
        filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Then apply any additional sorting if specified
        if (this.currentSort) {
            switch(this.currentSort) {
                case 'sort-by-date':
                    // Already sorted by date
                    break;
                case 'most-popular':
                    filteredPosts.sort((a, b) => {
                        // Primary sort by likes
                        const likeDiff = (b.likes || 0) - (a.likes || 0);
                        // Secondary sort by date if likes are equal
                        return likeDiff !== 0 ? likeDiff : new Date(b.date) - new Date(a.date);
                    });
                    break;
                case 'from-A-to-Z':
                    filteredPosts.sort((a, b) => {
                        // Primary sort by title
                        const titleCompare = a.title.localeCompare(b.title);
                        // Secondary sort by date if titles are equal
                        return titleCompare !== 0 ? titleCompare : new Date(b.date) - new Date(a.date);
                    });
                    break;
                case 'from-Z-to-A':
                    filteredPosts.sort((a, b) => {
                        // Primary sort by title (reversed)
                        const titleCompare = b.title.localeCompare(a.title);
                        // Secondary sort by date if titles are equal
                        return titleCompare !== 0 ? titleCompare : new Date(b.date) - new Date(a.date);
                    });
                    break;
            }
        }
        
        return filteredPosts;
    }

    /**
     * Render posts with pagination
     */
    renderPosts() {
        const postsContainer = document.getElementById('news-cards-container');
        const paginationContainer = document.getElementById('pagination-pages');
        
        if (!postsContainer || !paginationContainer) {
            console.error('Required containers not found');
            return;
        }
        
        // Get filtered and sorted posts
        const filteredPosts = this.getFilteredAndSortedPosts();
        
        // Calculate pagination
        const totalPosts = filteredPosts.length;
        const totalPages = Math.ceil(totalPosts / this.postsPerPage);
        
        // Make sure current page is valid
        if (this.currentPageNum > totalPages) {
            this.currentPageNum = Math.max(1, totalPages);
        }
        
        // Get current page posts
        const startIndex = (this.currentPageNum - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const currentPagePosts = filteredPosts.slice(startIndex, endIndex);
        
        // Render posts
        postsContainer.innerHTML = '';
        
        if (currentPagePosts.length === 0) {
            postsContainer.innerHTML = `
                <div class="column is-full">
                    <div class="notification is-info">
                        No posts found. Try a different search or filter.
                    </div>
                </div>
            `;
            paginationContainer.innerHTML = '';
            return;
        }
        
        currentPagePosts.forEach(post => {
            // Count comments for this post
            const commentCount = this.comments.filter(c => c.postId === post.id).length;
            
            // Create post card
            const postCard = document.createElement('div');
            postCard.className = 'column is-one-third'; // Changed to is-one-third for wider cards
            postCard.innerHTML = `
                <div class="box" style="transition: transform 0.3s ease, box-shadow 0.3s ease; height: 100%;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 5px rgba(0,0,0,0.1)'">
                    <!-- Date -->
                    <p class="is-size-7 has-text-grey">Date: ${this.formatDate(post.date)}</p>
                    
                    <!-- Department -->
                    <p class="is-size-7 has-text-info has-background-info-light px-2 py-1" style="display: inline-block; border-radius: 4px; margin: 5px 0;">
                        <strong>Department: ${post.department}</strong>
                    </p>
                    
                    <!-- Image -->
                    <figure class="image is-4by3">
                        <img src="${post.image}" alt="${post.title}" style="width: 100%; height: auto;">
                    </figure>
                    
                    <!-- Title -->
                    <h3 class="title is-6" style="height: 3em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${post.title}</h3>
                    
                    <!-- Author -->
                    <p class="is-size-7"><strong>By: ${post.author}</strong></p>
                    
                    <!-- News Details -->
                    <div class="mt-2">
                        <p class="is-size-7" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${post.header}</p>
                    </div>
                    
                    <!-- Buttons -->
                    <div class="buttons mt-3" style="display: flex; justify-content: space-between;">
                        <a href="addpost.html?id=${post.id}" class="button is-info is-small">View Details</a>
                        <div>
                            <button class="button is-small like-button ${Array.isArray(post.likedBy) && post.likedBy.includes(this.currentUser) ? 'is-danger' : 'is-light'}" 
                                    data-like-id="${post.id}">
                                <span class="icon like-icon" style="transition: transform 0.3s ease;">
                                    ${Array.isArray(post.likedBy) && post.likedBy.includes(this.currentUser) ? '❤️' : '🤍'}
                                </span>
                                <span class="like-count">${post.likes || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add event listener for like button
            const likeButton = postCard.querySelector('.like-button');
            if (likeButton) {
                likeButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    const postId = likeButton.getAttribute('data-like-id');
                    this.toggleLike(postId);
                });
            }
            
            postsContainer.appendChild(postCard);
        });
        
        // Render pagination
        this.renderPagination(totalPages);
    }

    /**
     * Render pagination controls
     */
    renderPagination(totalPages) {
        const paginationContainer = document.getElementById('pagination-pages');
        if (!paginationContainer) return;
        
        // Clear pagination
        paginationContainer.innerHTML = '';
        
        // Create very simple pagination: Previous, current page, Next
        const paginationDiv = document.createElement('div');
        paginationDiv.className = 'pagination is-centered mt-4 mb-4';
        paginationDiv.style.display = 'flex';
        paginationDiv.style.justifyContent = 'center';
        paginationDiv.style.alignItems = 'center';
        paginationDiv.style.border = '1px solid #dbdbdb';
        paginationDiv.style.borderRadius = '4px';
        paginationDiv.style.backgroundColor = '#f5f5f5';
        paginationDiv.style.padding = '5px';
        paginationDiv.style.maxWidth = '400px';
        paginationDiv.style.margin = '0 auto';
        
        // Previous button
        const prevButton = document.createElement('a');
        prevButton.className = `${this.currentPageNum === 1 ? 'is-disabled' : ''}`;
        prevButton.innerHTML = '← Previous';
        prevButton.style.margin = '0 5px';
        prevButton.style.padding = '5px 10px';
        prevButton.style.cursor = this.currentPageNum === 1 ? 'default' : 'pointer';
        prevButton.style.color = this.currentPageNum === 1 ? '#999' : '#4a4a4a';
        if (this.currentPageNum > 1) {
            prevButton.addEventListener('click', () => {
                this.currentPageNum--;
                this.renderPosts();
            });
        }
        paginationDiv.appendChild(prevButton);
        
        // Show only current page number
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPageNum) {
                const pageLink = document.createElement('a');
                pageLink.className = 'is-current';
                pageLink.style.backgroundColor = '#f14668';
                pageLink.style.color = 'white';
                pageLink.style.borderRadius = '4px';
                pageLink.style.padding = '5px 10px';
                pageLink.style.margin = '0 5px';
                pageLink.style.fontWeight = 'bold';
                pageLink.setAttribute('aria-label', `Page ${i}`);
                pageLink.textContent = i;
                paginationDiv.appendChild(pageLink);
                break;
            }
        }
        
        // Next button
        const nextButton = document.createElement('a');
        nextButton.className = `${this.currentPageNum === totalPages ? 'is-disabled' : ''}`;
        nextButton.innerHTML = 'Next →';
        nextButton.style.margin = '0 5px';
        nextButton.style.padding = '5px 10px';
        nextButton.style.cursor = this.currentPageNum === totalPages ? 'default' : 'pointer';
        nextButton.style.color = this.currentPageNum === totalPages ? '#999' : '#4a4a4a';
        if (this.currentPageNum < totalPages) {
            nextButton.addEventListener('click', () => {
                this.currentPageNum++;
                this.renderPosts();
            });
        }
        paginationDiv.appendChild(nextButton);
        
        paginationContainer.appendChild(paginationDiv);
    }

    /**
     * Create a pagination item (page number)
     */
    createPageItem(pageNumber) {
        const pageItem = document.createElement('li');
        const pageLink = document.createElement('a');
        pageLink.className = `pagination-link ${pageNumber === this.currentPageNum ? 'is-current' : ''}`;
        pageLink.setAttribute('aria-label', `Page ${pageNumber}`);
        pageLink.textContent = pageNumber;
        
        if (pageNumber !== this.currentPageNum) {
            pageLink.addEventListener('click', () => {
                this.currentPageNum = pageNumber;
                this.renderPosts();
            });
        }
        
        pageItem.appendChild(pageLink);
        return pageItem;
    }

    /**
     * Toggle like on a post
     */
    toggleLike(postId) {
        // Show loading spinner
        this.showLoading();
        
        const post = this.posts.find(p => p.id === postId);
        if (!post) {
            this.hideLoading();
            return;
        }
        
        // Initialize likedBy as array if it's not already
        if (!Array.isArray(post.likedBy)) {
            post.likedBy = [];
        }
        
        const userIndex = post.likedBy.indexOf(this.currentUser);
        
        if (userIndex === -1) {
            // Add like
            post.likedBy.push(this.currentUser);
            post.likes = (post.likes || 0) + 1;
        } else {
            // Remove like
            post.likedBy.splice(userIndex, 1);
            post.likes = Math.max(0, (post.likes || 1) - 1);
        }
        
        // Update ALL like buttons for this post (to keep likes in sync across cards and posts)
        const allLikeBtns = document.querySelectorAll(`[data-like-id="${postId}"]`);
        allLikeBtns.forEach(likeBtn => {
            const likeIcon = likeBtn.querySelector('.like-icon');
            const likeCount = likeBtn.querySelector('.like-count');
            
            if (likeIcon) {
                // Update heart style based on liked state
                if (post.likedBy.includes(this.currentUser)) {
                    likeIcon.textContent = '❤️';
                    likeIcon.style.transform = 'scale(1.2)';
                    setTimeout(() => { 
                        likeIcon.style.transform = 'scale(1)';
                    }, 200);
                    likeBtn.classList.add('is-danger', 'is-active');
                    likeBtn.classList.remove('is-light');
                } else {
                    likeIcon.textContent = '🤍';
                    likeBtn.classList.remove('is-danger', 'is-active');
                    likeBtn.classList.add('is-light');
                }
            }
            
            if (likeCount) {
                likeCount.textContent = post.likes;
            }
        });
        
        // Save the updated posts to localStorage to persist changes across pages
        this.savePosts();
        
        console.log(`Like toggled for post ${postId}. New likes: ${post.likes}`);
        
        // Hide loading spinner after a short delay
        setTimeout(() => {
            this.hideLoading();
        }, 300);
    }
    
    /**
     * Save posts to localStorage
     */
    savePosts() {
        try {
            localStorage.setItem('posts', JSON.stringify(this.posts));
            localStorage.setItem('comments', JSON.stringify(this.comments));
        } catch (error) {
            console.error('Error saving posts to localStorage:', error);
        }
    }
    
    /**
     * Toggle like on a comment
     */
    toggleCommentLike(commentId) {
        // Show loading spinner
        this.showLoading();
        
        const comment = this.comments.find(c => c.id === commentId);
        if (!comment) {
            this.hideLoading();
            return;
        }
        
        // Initialize likedBy as array if it's not already
        if (!Array.isArray(comment.likedBy)) {
            comment.likedBy = [];
        }
        
        const userIndex = comment.likedBy.indexOf(this.currentUser);
        
        if (userIndex === -1) {
            // Add like
            comment.likedBy.push(this.currentUser);
            comment.likes = (comment.likes || 0) + 1;
        } else {
            // Remove like
            comment.likedBy.splice(userIndex, 1);
            comment.likes = Math.max(0, (comment.likes || 1) - 1);
        }
        
        // Update UI
        this.renderComments();
        
        // Save to localStorage to persist changes
        this.savePosts();
        
        console.log(`Like toggled for comment ${commentId}. New likes: ${comment.likes}`);
        
        // Hide loading spinner after a short delay
        setTimeout(() => {
            this.hideLoading();
        }, 300);
    }

    /**
     * Handle post form submission
     */
    handlePostSubmission(editPostId = null) {
        this.showLoading();
        
        // Get form values - note that the IDs might differ between pages
        // Try different IDs to find the correct elements
        const titleElement = document.getElementById('post-title') || document.querySelector('[name="title"]');
        const authorElement = document.getElementById('post-author') || document.querySelector('[name="author"]');
        const departmentElement = document.getElementById('department-select') || document.querySelector('[name="department"]');
        const headerElement = document.getElementById('post-header') || document.querySelector('[name="header"]');
        const detailsElement = document.getElementById('post-details') || document.querySelector('[name="details"]');
        const imageElement = document.getElementById('post-image') || document.querySelector('[name="image"]');
        
        if (!titleElement || !authorElement || !departmentElement || !headerElement || !detailsElement) {
            this.showNotification('Could not find all form elements', 'is-danger');
            this.hideLoading();
            return;
        }
        
        const title = titleElement.value.trim();
        const author = authorElement.value.trim();
        const department = departmentElement.value;
        const header = headerElement.value.trim();
        const details = detailsElement.value.trim();
        
        // Validate form
        if (!title) {
            this.showNotification('Please enter a title', 'is-danger');
            this.hideLoading();
            return;
        }
        
        if (!author) {
            this.showNotification('Please enter an author name', 'is-danger');
            this.hideLoading();
            return;
        }
        
        if (!department) {
            this.showNotification('Please select a department', 'is-danger');
            this.hideLoading();
            return;
        }
        
        if (!header) {
            this.showNotification('Please enter a header/summary', 'is-danger');
            this.hideLoading();
            return;
        }
        
        if (!details) {
            this.showNotification('Please enter post details', 'is-danger');
            this.hideLoading();
            return;
        }
        
        // Check if editing or creating
        if (editPostId) {
            // Editing existing post
            const post = this.posts.find(p => p.id === editPostId);
            if (!post) {
                this.showNotification('Post not found', 'is-danger');
                this.hideLoading();
                return;
            }
            
            // Update post
            post.title = title;
            post.author = author;
            post.department = department;
            post.header = header;
            post.details = details;
            
            // Handle new image
            if (imageElement && imageElement.files && imageElement.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    post.image = e.target.result; // Data URL
                    this.finishPostEditing(post);
                };
                reader.readAsDataURL(imageElement.files[0]);
            } else {
                this.finishPostEditing(post);
            }
        } else {
            // Creating new post
            const newPost = {
                id: 'post_' + Date.now(), // Generate unique ID
                title,
                author,
                department,
                header,
                details,
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
                image: 'collage.PNG', // Default image
                likes: 0,
                likedBy: []
            };
            
            // Handle image if provided
            if (imageElement && imageElement.files && imageElement.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    newPost.image = e.target.result; // Data URL
                    this.savePost(newPost);
                };
                reader.readAsDataURL(imageElement.files[0]);
            } else {
                this.savePost(newPost);
            }
        }
    }

    /**
     * Save post to the posts array
     */
    savePost(post) {
        // Add to beginning of posts array
        this.posts.unshift(post);
        
        // Save to localStorage
        this.savePosts();
        
        // Hide form
        const addPostForm = document.getElementById('add-post-form');
        if (addPostForm) {
            addPostForm.style.display = 'none';
        }
        
        // Reset form
        const form = document.getElementById('post-form');
        if (form) {
            form.reset();
        }
        
        // Show success notification
        this.showNotification('Post added successfully!', 'is-success');
        
        // Refresh posts display
        this.currentPageNum = 1; // Go to first page to see the new post
        this.renderPosts();
        
        this.hideLoading();
    }
    
    /**
     * Finish post editing
     */
    finishPostEditing(post) {
        // Save to localStorage
        this.savePosts();
        
        // Hide form
        const addPostForm = document.getElementById('add-post-form');
        if (addPostForm) {
            addPostForm.style.display = 'none';
        }
        
        // Show post view
        const postView = document.getElementById('post-view');
        if (postView) {
            postView.style.display = 'block';
        }
        
        // Update post details
        this.updatePostDetails();
        
        // Show success notification
        this.showNotification('Post updated successfully!', 'is-success');
        
        this.hideLoading();
    }
    
    /**
     * Show the edit post form
     */
    showEditPostForm(postId) {
        // Show loading spinner
        this.showLoading();
        
        const post = this.posts.find(p => p.id === postId);
        if (!post) {
            this.showNotification('Post not found', 'is-danger');
            this.hideLoading();
            return;
        }
        
        // Hide post view
        const postView = document.getElementById('post-view');
        if (postView) {
            postView.style.display = 'none';
        }
        
        // Show edit form
        const addPostForm = document.getElementById('add-post-form');
        if (addPostForm) {
            addPostForm.style.display = 'block';
        }
        
        // Set form title
        const formTitle = document.getElementById('form-title');
        if (formTitle) {
            formTitle.textContent = 'Edit Post';
        }
        
        // Try to find form fields regardless of where they are in the DOM
        // This handles different possible IDs and attribute selectors
        const titleInput = document.getElementById('post-title') || document.querySelector('[name="title"]');
        const authorInput = document.getElementById('post-author') || document.querySelector('[name="author"]');
        const departmentSelect = document.getElementById('department-select') || document.querySelector('[name="department"]');
        const headerInput = document.getElementById('post-header') || document.querySelector('[name="header"]');
        const detailsInput = document.getElementById('post-details') || document.querySelector('[name="details"]');
        
        if (titleInput) titleInput.value = post.title;
        if (authorInput) authorInput.value = post.author;
        if (departmentSelect) departmentSelect.value = post.department;
        if (headerInput) headerInput.value = post.header;
        if (detailsInput) detailsInput.value = post.details;
        
        // Hide loading spinner after a short delay
        setTimeout(() => {
            this.hideLoading();
        }, 300);
    }
    
    /**
     * Delete a post
     */
    deletePost(postId) {
        this.showLoading();
        
        // Find post
        const postIndex = this.posts.findIndex(p => p.id === postId);
        if (postIndex === -1) {
            this.showNotification('Post not found', 'is-danger');
            this.hideLoading();
            return;
        }
        
        // Remove post
        this.posts.splice(postIndex, 1);
        
        // Also remove all comments for this post
        this.comments = this.comments.filter(c => c.postId !== postId);
        
        // Save to localStorage
        this.savePosts();
        
        // Show success notification
        this.showNotification('Post deleted successfully', 'is-success');
        
        // Redirect to main page
        setTimeout(() => {
            window.location.href = 'rana.html';
        }, 1500);
    }
    
    /**
     * Handle comment form submission
     */
    handleCommentSubmission() {
        this.showLoading();
        
        // Get form values
        const username = document.getElementById('username').value.trim();
        const commentText = document.getElementById('commentText').value.trim();
        const postId = document.getElementById('postId').value;
        const replyToId = document.getElementById('replyToId').value || null;
        const editCommentId = document.getElementById('editCommentId').value || null;
        
        // Get attachment
        const submissionType = document.querySelector('input[name="submissionType"]:checked').value;
        let attachment = null;
        
        if (submissionType === 'photo') {
            const uploadField = document.getElementById('uploadField');
            if (uploadField.files && uploadField.files[0]) {
                // We'll handle the file attachment later
                attachment = {
                    type: 'photo',
                    content: null
                };
            }
        } else if (submissionType === 'link') {
            const linkField = document.getElementById('linkField');
            if (linkField.value.trim()) {
                attachment = {
                    type: 'link',
                    content: linkField.value.trim()
                };
            }
        }
        
        // Validate form
        if (!username) {
            this.showNotification('Please enter your name', 'is-danger');
            this.hideLoading();
            return;
        }
        
        if (!commentText) {
            this.showNotification('Please enter your comment', 'is-danger');
            this.hideLoading();
            return;
        }
        
        if (!postId) {
            this.showNotification('Invalid post ID', 'is-danger');
            this.hideLoading();
            return;
        }
        
        // Check if editing or creating
        if (editCommentId) {
            // Editing existing comment
            const comment = this.comments.find(c => c.id === editCommentId);
            if (!comment) {
                this.showNotification('Comment not found', 'is-danger');
                this.hideLoading();
                return;
            }
            
            // Update comment
            comment.username = username;
            comment.text = commentText;
            
            // Update attachment
            if (attachment) {
                if (attachment.type === 'photo') {
                    const uploadField = document.getElementById('uploadField');
                    if (uploadField.files && uploadField.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            comment.attachment = {
                                type: 'photo',
                                content: e.target.result
                            };
                            this.finishCommentEditing(comment);
                        };
                        reader.readAsDataURL(uploadField.files[0]);
                        return; // We'll continue in the callback
                    }
                } else {
                    comment.attachment = attachment;
                }
            }
            
            this.finishCommentEditing(comment);
        } else {
            // Creating new comment
            const newComment = {
                id: 'comment_' + Date.now(), // Generate unique ID
                username,
                text: commentText,
                postId,
                replyTo: replyToId,
                timestamp: new Date().toISOString(),
                likes: 0,
                likedBy: [],
                profilePic: `https://i.pravatar.cc/150?u=${Date.now()}-${username}`,
                attachment
            };
            
            // Handle photo attachment
            if (attachment && attachment.type === 'photo') {
                const uploadField = document.getElementById('uploadField');
                if (uploadField.files && uploadField.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        newComment.attachment.content = e.target.result;
                        this.saveComment(newComment);
                    };
                    reader.readAsDataURL(uploadField.files[0]);
                    return; // We'll continue in the callback
                }
            }
            
            this.saveComment(newComment);
        }
    }
    
    /**
     * Save comment to the comments array
     */
    saveComment(comment) {
        // Ensure timestamp is in ISO format
        if (!comment.timestamp) {
            comment.timestamp = new Date().toISOString();
        }
        
        // Ensure we have a profile pic
        if (!comment.profilePic) {
            comment.profilePic = this.getRandomAvatar(comment.username);
        }
        
        // Add to comments array
        this.comments.push(comment);
        
        // Save to localStorage
        this.savePosts();
        
        // Show success notification
        this.showNotification('Comment added successfully!', 'is-success');
        
        // Spinner will remain visible while redirecting
        // (it's already shown in handleCommentSubmission)
        
        // Redirect back to post
        setTimeout(() => {
            window.location.href = `addpost.html?id=${comment.postId}`;
        }, 1500);
    }
    
    /**
     * Finish comment editing
     */
    finishCommentEditing(comment) {
        // Save to localStorage
        this.savePosts();
        
        // Show success notification
        this.showNotification('Comment updated successfully!', 'is-success');
        
        // Spinner will remain visible while redirecting
        // (it's already shown in handleCommentSubmission)
        
        // Redirect back to post
        setTimeout(() => {
            window.location.href = `addpost.html?id=${comment.postId}`;
        }, 1500);
    }
    
    /**
     * Delete a comment
     */
    deleteComment(commentId) {
        this.showLoading();
        
        // Find comment
        const comment = this.comments.find(c => c.id === commentId);
        if (!comment) {
            this.showNotification('Comment not found', 'is-danger');
            this.hideLoading();
            return;
        }
        
        const postId = comment.postId;
        
        // Find all replies to this comment recursively
        const allCommentIds = [commentId];
        
        const findReplies = (parentId) => {
            const replies = this.comments.filter(c => c.replyTo === parentId);
            replies.forEach(reply => {
                allCommentIds.push(reply.id);
                findReplies(reply.id); // Find nested replies
            });
        };
        
        findReplies(commentId);
        
        // Remove all comments and replies
        this.comments = this.comments.filter(c => !allCommentIds.includes(c.id));
        
        // Save to localStorage
        this.savePosts();
        
        // Show success notification
        this.showNotification('Comment deleted successfully', 'is-success');
        
        // Refresh comments
        this.renderComments();
        
        this.hideLoading();
    }

    /**
     * Show loading spinner
     */
    showLoading() {
        this.isLoading = true;
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = 'flex';
            spinner.classList.add('is-active');
            
            // Make sure the modal background is visible
            const modalBg = spinner.querySelector('.modal-background');
            if (modalBg) {
                modalBg.style.opacity = '0.7';
            }
            
            // Make sure the spinner animation is more visible
            const spinnerEl = spinner.querySelector('.spinner');
            if (spinnerEl) {
                spinnerEl.style.width = '60px';
                spinnerEl.style.height = '60px';
                spinnerEl.style.borderWidth = '6px';
                spinnerEl.style.borderColor = '#3273dc';
                spinnerEl.style.borderRightColor = 'transparent';
                spinnerEl.style.borderTopColor = 'transparent';
            }
            
            // Make the loading text more visible
            const loadingText = spinner.querySelector('p');
            if (loadingText) {
                loadingText.style.fontSize = '1.2rem';
                loadingText.style.fontWeight = 'bold';
                loadingText.style.color = '#3273dc';
            }
            
            console.log('Loading spinner shown');
        }
    }

    /**
     * Hide loading spinner
     */
    hideLoading() {
        this.isLoading = false;
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            // Add a slight delay to ensure it was visible
            setTimeout(() => {
                spinner.classList.remove('is-active');
                spinner.style.display = 'none';
                console.log('Loading spinner hidden');
            }, 300);
        }
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'is-info') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <button class="delete"></button>
            <p>${message}</p>
        `;
        
        // Add delete button functionality
        const deleteButton = notification.querySelector('.delete');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                notification.remove();
            });
        }
        
        // Add to container
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    /**
     * Format date string
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.warn('Invalid date format:', dateString);
            return dateString;
        }
    }
    
    /**
     * Generate a random avatar URL
     */
    getRandomAvatar(username) {
        // Using pravatar.cc to generate random avatars
        return `https://i.pravatar.cc/150?u=${Date.now()}-${username}`;
    }
    
    /**
     * Truncate text to a specific length
     */
    truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    /**
     * Generate a unique ID
     */
    generateId(prefix = '') {
        return prefix + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize the news portal when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create news portal instance
    window.newsPortal = new NewsPortal();
});