/**
 * Campus News Portal - Core JavaScript Functionality
 */

// Debug script loading
console.log('======== SCRIPT.JS LOADED ========');
console.log('Window API object available:', !!window.newsApi);
console.log('Document readyState:', document.readyState);

// Simple function to check our page setup
function diagnoseEnvironment() {
    console.log('---- CHECKING PAGE ----');
    console.log('1. API loaded:', !!window.newsApi);
    console.log('2. Portal ready:', !!window.newsPortal);
    console.log('3. JSON file:', window.location.origin + '/example.json');
    console.log('4. Page path:', window.location.pathname);
    
    // Check our container
    const container = document.getElementById('news-cards-container');
    console.log('5. Container found:', !!container);
    
    // Count images
    const imgElements = document.querySelectorAll('img');
    console.log('6. Images found:', imgElements.length);
    console.log('--------------------');
}

// Run diagnosis after a short delay to ensure DOM is ready
setTimeout(diagnoseEnvironment, 1000);

// Clear localStorage for testing (remove this in production)
localStorage.clear();
console.log("localStorage cleared to force data reload");

class NewsPortal {
    constructor() {
        // Initialize variables
        this.posts = [];
        this.comments = [];
        this.currentPage = 1;
        this.postsPerPage = 3;
        this.currentFilter = '';
        this.currentSort = 'newest';
        this.currentSearch = '';
        this.isLoading = false;
        this.currentUser = 'user1'; // Default user ID for likes
        
        // Initialize the portal
        this.initCommonListeners();
        this.loadData();
    }
    
    // Helper method to simulate delay for async operations
    async simulateDelay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Initialize common elements for all pages
     */
    initCommonListeners() {
        // Show loading spinner immediately when page loads
        this.showLoading();
        
        const pagePath = window.location.pathname.split('/').pop();
        
        if (!pagePath || pagePath === '' || pagePath.includes('rana.html')) {
            // Main page initialization
            this.initMainPageListeners();
        } else if (pagePath.includes('addpost.html')) {
            // Post detail/edit page initialization
            this.initDetailPageListeners();
        } else if (pagePath.includes('addcomment.html')) {
            // Comment page initialization
            this.initCommentPageListeners();
        }
    }

    /**
     * Initialize the main news listing page
     */
    initMainPageListeners() {
        console.log('Initializing main page listeners');
        
        // Filter dropdown
        const filterSelect = document.querySelector('#news-filter select');
        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                const selectedValue = filterSelect.value === 'no-filter-option' ? '' : filterSelect.value;
                this.currentFilter = selectedValue;
                this.currentPage = 1;
                this.renderPosts();
            });
        }
        
        // Sort dropdown
        const sortSelect = document.querySelector('#news-sort select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                let selectedValue = 'newest'; // Default
                
                switch (sortSelect.value) {
                    case 'sort-by-date':
                        selectedValue = 'newest';
                        break;
                    case 'most-popular':
                        selectedValue = 'popular';
                        break;
                    case 'from-A-to-Z':
                        selectedValue = 'az';
                        break;
                    case 'from-Z-to-A':
                        selectedValue = 'za';
                        break;
                }
                
                this.currentSort = selectedValue;
                this.renderPosts();
            });
        }
        
        // Search input
        const searchInput = document.getElementById('search-news');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.currentSearch = searchInput.value;
                this.currentPage = 1;
                this.renderPosts();
            });
        }
        
        // Add post button to toggle form visibility
        const addPostBtn = document.getElementById('add-post-btn');
        if (addPostBtn) {
            addPostBtn.addEventListener('click', () => {
                // Find the add post form
                const addPostForm = document.getElementById('add-post-form');
                if (addPostForm) {
                    // Toggle its visibility
                    addPostForm.style.display = addPostForm.style.display === 'none' ? 'block' : 'none';
                }
            });
        }

        // Add post form cancel button
        const cancelPostBtn = document.getElementById('cancel-post');
        if (cancelPostBtn) {
            cancelPostBtn.addEventListener('click', () => {
                document.getElementById('add-post-form').style.display = 'none';
            });
        }
        
        // Form submission for adding/editing post directly on the main page
        const postForm = document.getElementById('post-form');
        if (postForm) {
            postForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePostSubmission();
            });
        }
    }

    /**
     * Initialize the post detail/edit page
     */
    initDetailPageListeners() {
        console.log('Initializing detail page listeners');
        
        // Get post ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        
        if (!postId) {
            // If no post ID, this is a new post
            document.getElementById('post-view').style.display = 'none';
            document.getElementById('add-post-form').style.display = 'block';
            document.getElementById('comments-section').style.display = 'none';
            
            // Update form title
            const formTitle = document.getElementById('form-title');
            if (formTitle) formTitle.textContent = 'Add New Post';
            
            // Handle form submission
            const postForm = document.getElementById('post-form');
            if (postForm) {
                postForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handlePostSubmission();
                });
            }
            
            // Cancel button
            const cancelBtn = document.getElementById('cancel-post');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    window.location.href = 'rana.html';
                });
            }
        } else {
            // This is viewing/editing an existing post
            document.getElementById('post-view').style.display = 'block';
            document.getElementById('add-post-form').style.display = 'none';
            
            // Edit post button
            const editBtn = document.getElementById('edit-post-btn');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    this.showEditPostForm(postId);
                });
            }
            
            // Delete post button
            const deleteBtn = document.getElementById('delete-post-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.deletePost(postId);
                });
            }
            
            // Like post button
            const likeBtn = document.getElementById('like-post-btn');
            if (likeBtn) {
                // Add transition for smooth animation
                likeBtn.style.transition = 'transform 0.2s ease, background-color 0.2s ease';
                
                // Add hover effect
                likeBtn.addEventListener('mouseenter', () => {
                    if (!likeBtn.classList.contains('is-active')) {
                        likeBtn.style.backgroundColor = '#ff7c9c';
                    }
                });
                
                likeBtn.addEventListener('mouseleave', () => {
                    if (!likeBtn.classList.contains('is-active')) {
                        likeBtn.style.backgroundColor = '#ff5c7c';
                    }
                });
                
                // Add click with visual feedback
                likeBtn.addEventListener('click', () => {
                    // Visual feedback animation
                    likeBtn.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        likeBtn.style.transform = 'scale(1)';
                    }, 200);
                    
                    this.toggleLike(postId);
                });
            }
            
            // Add comment button/link
            const addCommentLink = document.getElementById('add-comment-link');
            if (addCommentLink) {
                addCommentLink.href = `addcomment.html?postId=${postId}`;
            }
            
            // Form submission for editing
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
                    document.getElementById('post-view').style.display = 'block';
                    document.getElementById('add-post-form').style.display = 'none';
                });
            }
        }
    }

    /**
     * Initialize the comment page
     */
    initCommentPageListeners() {
        console.log('Initializing comment page listeners');
        
        // Get post ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('postId');
        const commentId = urlParams.get('replyTo');
        
        if (!postId) {
            alert('No post ID provided. Redirecting to main page.');
            window.location.href = 'rana.html';
            return;
        }
        
        // Set post ID in form - using correct ID from HTML
        const postIdInput = document.getElementById('postId');
        if (postIdInput) postIdInput.value = postId;
        
        // Set reply to ID in form if this is a reply
        const replyToInput = document.getElementById('replyToId');
        if (replyToInput && commentId) {
            replyToInput.value = commentId;
            
            // Update form title if this is a reply
            const formTitle = document.getElementById('form-title');
            if (formTitle) {
                const replyingToComment = this.comments.find(c => c.id === commentId);
                if (replyingToComment) {
                    formTitle.textContent = `Replying to ${replyingToComment.username}`;
                }
            }
        }
        
        // Form submission for adding comment - using correct ID from HTML
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCommentSubmission();
            });
        }
        
        // Back button - fixed to work with the ID in HTML
        const backBtn = document.getElementById('back-button');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = `addpost.html?id=${postId}`;
            });
        }
        
        // Cancel button - fixed to work with the ID in HTML
        const cancelBtn = document.getElementById('cancel-button');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                window.location.href = `addpost.html?id=${postId}`;
            });
        }
    }

    /**
     * Load data from localStorage or example.json
     */
    async loadData() {
        this.showLoading();
        
        try {
            console.log('Loading data...');
            
            // Clear localStorage for testing
            localStorage.removeItem('posts');
            localStorage.removeItem('comments');
            
            // Try to get data from localStorage first
            const savedPosts = localStorage.getItem('posts');
            const savedComments = localStorage.getItem('comments');
            
            // If we have saved data, use it
            if (savedPosts && savedComments) {
                console.log('Loading data from localStorage');
                this.posts = JSON.parse(savedPosts) || [];
                this.comments = JSON.parse(savedComments) || [];
            } else {
                // Otherwise load from api.js which will load from example.json
                console.log('Loading data from example.json via api.js');
                try {
                    // First, check if newsApi exists, or try to wait for it
                    if (!window.newsApi) {
                        console.log('WARNING: window.newsApi not found! Waiting 500ms to see if it loads...');
                        await this.simulateDelay(500); // Wait a bit to see if it loads
                        console.log('After waiting: window.newsApi exists:', !!window.newsApi);
                    }
                    
                    // Try to use newsApi if available
                    if (window.newsApi) {
                        // Load data directly from example.json
                        console.log('Attempting to fetch example.json...');
                        const response = await fetch('example.json');
                        console.log('Fetch response:', response);
                        if (!response.ok) {
                            console.error('Fetch failed:', response.status, response.statusText);
                            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
                        }
                        
                        // Get the raw text first to check if it's valid JSON
                        const responseText = await response.text();
                        console.log('Response text (first 100 chars):', responseText.substring(0, 100));
                        
                        try {
                            const data = JSON.parse(responseText);
                            console.log('JSON parsed successfully, found posts:', data.posts?.length);
                        } catch (parseError) {
                            console.error('JSON parse error:', parseError);
                            throw parseError;
                        }
                        
                        // Initialize the API with our data
                        console.log('Initializing newsApi with data:', {
                            posts: data.posts?.length || 0,
                            comments: data.comments?.length || 0
                        });
                        window.newsApi.initMockData(data.posts, data.comments);
                        
                        // Get the data from the API
                        this.posts = await window.newsApi.getPosts();
                        this.comments = await window.newsApi.getComments();
                        
                        // Save to localStorage for future use
                        this.savePosts();
                        
                        console.log('Data loaded successfully from example.json via api.js');
                    } else {
                        throw new Error('NewsAPI not found. Make sure api.js is loaded before script.js');
                    }
                } catch (apiError) {
                    console.error('Error loading from API:', apiError);
                    
                    // Fallback to direct loading from example.json
                    console.log('Falling back to direct loading from example.json');
                    const response = await fetch('example.json');
                    if (!response.ok) {
                        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    this.posts = data.posts || [];
                    this.comments = data.comments || [];
                    
                    // Save to localStorage for future use
                    this.savePosts();
                }
            }
            
            // Initialize the current page
            const pagePath = window.location.pathname.split('/').pop();
            
            if (!pagePath || pagePath === '' || pagePath.includes('rana.html')) {
                // Main page - render post listing
                this.renderPosts();
            } else if (pagePath.includes('addpost.html')) {
                // Post detail page - render post details and comments
                const urlParams = new URLSearchParams(window.location.search);
                const postId = urlParams.get('id');
                
                if (postId) {
                    this.updatePostDetails(postId);
                    this.renderComments(postId);
                }
            }
            
            console.log(`Loaded ${this.posts.length} posts and ${this.comments.length} comments`);
            return { posts: this.posts, comments: this.comments };
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('Failed to load data: ' + error.message, 'is-danger');
            
            // Create empty arrays if we failed to load data
            if (!this.posts) this.posts = [];
            if (!this.comments) this.comments = [];
            
            return { posts: [], comments: [] };
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Update post details on the detail page
     */
    updatePostDetails(postId) {
        const post = this.getPost(postId);
        
        if (!post) {
            this.showNotification('Post not found', 'is-warning');
            return;
        }
        
        // Set the post details in the UI
        document.title = post.title;
        
        const titleElement = document.getElementById('post-title');
        if (titleElement) titleElement.textContent = post.title;
        
        const authorElement = document.getElementById('post-author');
        if (authorElement) authorElement.textContent = post.author;
        
        const dateElement = document.getElementById('post-date');
        if (dateElement) dateElement.textContent = this.formatDate(post.date);
        
        const departmentElement = document.getElementById('post-department');
        if (departmentElement) departmentElement.textContent = post.department;
        
        const detailsElement = document.getElementById('post-details');
        if (detailsElement) detailsElement.textContent = post.details;
        
        const imageElement = document.getElementById('post-image');
        if (imageElement) imageElement.src = this.getImageUrl(post.image);
        
        // Update like button
        const likeButton = document.getElementById('like-post-btn');
        const likeCount = document.getElementById('like-count');
        const likeIcon = document.getElementById('like-icon');
        
        if (likeCount) likeCount.textContent = post.likes || 0;
        
        if (likeButton && post.likedBy) {
            // Add transition for smooth animation
            likeButton.style.transition = 'transform 0.2s ease, background-color 0.2s ease';
            
            if (post.likedBy.includes(this.currentUser)) {
                likeButton.classList.add('is-active');
                likeButton.style.backgroundColor = '#ff2c5c'; // Darker heart color for active
                if (likeIcon) likeIcon.textContent = '❤️';
            } else {
                likeButton.classList.remove('is-active');
                likeButton.style.backgroundColor = '#ff5c7c'; // Regular heart color
                if (likeIcon) likeIcon.textContent = '🤍';
            }
        }
    }

    /**
     * Render comments for the current post
     */
    renderComments(postId) {
        const commentsContainer = document.querySelector('.comments-container');
        
        if (!commentsContainer) {
            console.error('Comments container not found');
            return;
        }
        
        // Clear the container
        commentsContainer.innerHTML = '';
        
        // Get comments for this post
        const postComments = this.comments.filter(comment => comment.postId === postId && comment.replyTo === null);
        
        if (postComments.length === 0) {
            commentsContainer.innerHTML = `
                <div class="notification is-info is-light">
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            `;
            return;
        }
        
        // Render each top-level comment with its replies
        postComments.forEach(comment => {
            const commentElement = this.createCommentElement(comment);
            commentsContainer.appendChild(commentElement);
        });
    }

    /**
     * Create comment element with replies
     */
    createCommentElement(comment) {
        // Create the main comment box
        const commentBox = document.createElement('div');
        commentBox.className = 'box mb-4';
        commentBox.id = `comment-${comment.id}`;
        
        // Format timestamp
        const commentDate = new Date(comment.timestamp);
        const timeAgo = this.getTimeAgo(commentDate);
        
        // Create the comment content
        commentBox.innerHTML = `
            <article class="media">
                <div class="media-left">
                    <figure class="image is-48x48">
                        <img src="${this.getImageUrl(comment.profilePic || 'https://bulma.io/images/placeholders/96x96.png')}" alt="Profile">
                    </figure>
                </div>
                <div class="media-content">
                    <div class="content">
                        <p>
                            <strong>${this.escapeHtml(comment.username)}</strong> 
                            <small>${timeAgo}</small>
                            ${comment.replyTo ? `<span class="reply-indicator">Replying to comment</span>` : ''}
                            <br>
                            ${this.escapeHtml(comment.text)}
                        </p>
                    </div>
                    <nav class="level is-mobile">
                        <div class="level-left">
                            <a class="level-item reply-comment-btn" data-id="${comment.id}" aria-label="reply">
                                <span class="icon is-small">
                                    <i class="fas fa-reply">↩️</i>
                                </span>
                                <span>Reply</span>
                            </a>
                            <a class="level-item like-comment-btn" data-id="${comment.id}" aria-label="like">
                                <span class="icon is-small">
                                    ${comment.likedBy && comment.likedBy.includes(this.currentUser) ? '❤️' : '🤍'}
                                </span>
                                <span class="ml-1">${comment.likes || 0}</span>
                            </a>
                            <a class="level-item edit-comment-btn" data-id="${comment.id}" aria-label="edit">
                                <span class="icon is-small">
                                    <i class="fas fa-edit">✏️</i>
                                </span>
                                <span>Edit</span>
                            </a>
                            <a class="level-item delete-comment-btn" data-id="${comment.id}" aria-label="delete">
                                <span class="icon is-small">
                                    <i class="fas fa-trash-alt">🗑️</i>
                                </span>
                                <span>Delete</span>
                            </a>
                        </div>
                    </nav>
                </div>
            </article>
        `;
        
        // Add event listeners
        const likeBtn = commentBox.querySelector('.like-comment-btn');
        if (likeBtn) {
            likeBtn.addEventListener('click', () => {
                this.toggleCommentLike(comment.id);
            });
        }
        
        const replyBtn = commentBox.querySelector('.reply-comment-btn');
        if (replyBtn) {
            replyBtn.addEventListener('click', () => {
                // Get post ID from URL
                const urlParams = new URLSearchParams(window.location.search);
                const postId = urlParams.get('id');
                if (postId) {
                    window.location.href = `addcomment.html?postId=${postId}&replyTo=${comment.id}`;
                }
            });
        }
        
        const editBtn = commentBox.querySelector('.edit-comment-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                // Not implemented in this simplified version
                alert('Edit comment functionality not implemented in this version');
            });
        }
        
        const deleteBtn = commentBox.querySelector('.delete-comment-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this comment?')) {
                    this.deleteComment(comment.id);
                }
            });
        }
        
        // Get replies to this comment
        const replies = this.comments.filter(c => c.replyTo === comment.id);
        
        // If there are replies, add them
        if (replies.length > 0) {
            const repliesContainer = document.createElement('div');
            repliesContainer.className = 'comment-replies mt-4';
            
            replies.forEach(reply => {
                const replyElement = this.createCommentElement(reply);
                repliesContainer.appendChild(replyElement);
            });
            
            commentBox.appendChild(repliesContainer);
        }
        
        return commentBox;
    }

    /**
     * Get a post by ID
     */
    getPost(id) {
        return this.posts.find(post => post.id === id);
    }

    /**
     * Get filtered and sorted posts based on current criteria
     */
    getFilteredAndSortedPosts() {
        // First filter the posts
        let filteredPosts = [...this.posts];
        
        // Filter by department if a filter is selected
        if (this.currentFilter) {
            filteredPosts = filteredPosts.filter(post => post.department === this.currentFilter);
        }
        
        // Filter by search term if one is entered
        if (this.currentSearch) {
            const searchTerm = this.currentSearch.toLowerCase();
            filteredPosts = filteredPosts.filter(post => 
                post.title.toLowerCase().includes(searchTerm) ||
                post.details.toLowerCase().includes(searchTerm) ||
                post.author.toLowerCase().includes(searchTerm) ||
                post.department.toLowerCase().includes(searchTerm)
            );
        }
        
        // Sort the posts based on current sort option
        switch (this.currentSort) {
            case 'newest':
                filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'popular':
                filteredPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                break;
            case 'az':
                filteredPosts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'za':
                filteredPosts.sort((a, b) => b.title.localeCompare(a.title));
                break;
            default:
                filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        
        return filteredPosts;
    }

    /**
     * Render posts with pagination
     */
    renderPosts() {
        console.log('==== RENDERING POSTS =====');
        console.log('Total posts in array:', this.posts.length);
        console.log('Container ID being used: news-cards-container');
        console.log('Current filter:', this.currentFilter);
        console.log('Current sort:', this.currentSort);
        console.log('Current search:', this.currentSearch);
        console.log('==========================');
        this.showLoading();
        
        try {
            // Get the container - check more specific details with enhanced debugging
            console.log('Looking for container with ID: news-cards-container');
            console.log('All elements with class columns:', document.querySelectorAll('.columns').length);
            console.log('All available DIV IDs:', Array.from(document.querySelectorAll('div[id]')).map(el => el.id));
            
            // First try the exact ID
            let postsContainer = document.getElementById('news-cards-container');
            
            // If not found, look for similar containers as fallback
            if (!postsContainer) {
                console.warn('Posts container not found with ID: news-cards-container');
                
                // Try alternate potential container options
                const alternateContainers = [
                    document.querySelector('.news-posts-card .columns'),
                    document.querySelector('.columns.is-multiline'),
                    document.querySelector('.content .columns')
                ];
                
                for (const container of alternateContainers) {
                    if (container) {
                        console.log('Found alternate container:', container.tagName, container.className);
                        postsContainer = container;
                        break;
                    }
                }
                
                if (!postsContainer) {
                    console.error('No suitable container found for posts');
                    return;
                }
            }
            
            console.log('Using container:', postsContainer.tagName, postsContainer.className, 'with ID:', postsContainer.id);
            
            // Clear the container
            postsContainer.innerHTML = '';
            
            // Get filtered and sorted posts
            const filteredPosts = this.getFilteredAndSortedPosts();
            
            // If no posts, show message
            if (filteredPosts.length === 0) {
                postsContainer.innerHTML = `
                    <div class="column is-full">
                        <div class="notification is-warning">
                            <p>No posts found. Try a different search or filter.</p>
                        </div>
                    </div>
                `;
                
                // Hide pagination
                const paginationContainer = document.getElementById('pagination-pages');
                if (paginationContainer) {
                    paginationContainer.innerHTML = '';
                }
                
                return;
            }
            
            // Calculate pagination
            const totalPosts = filteredPosts.length;
            const totalPages = Math.ceil(totalPosts / this.postsPerPage);
            
            // Make sure current page is valid
            if (this.currentPage > totalPages) {
                this.currentPage = totalPages;
            } else if (this.currentPage < 1) {
                this.currentPage = 1;
            }
            
            // Get posts for current page
            const startIndex = (this.currentPage - 1) * this.postsPerPage;
            const endIndex = Math.min(startIndex + this.postsPerPage, totalPosts);
            const postsToShow = filteredPosts.slice(startIndex, endIndex);
            
            // Create a card for each post
            postsToShow.forEach(post => {
                // Format date
                const dateObj = new Date(post.date);
                const formattedDate = this.formatDate(post.date);
                
                // Create column for the card with fixed width
                const column = document.createElement('div');
                column.className = 'column is-4'; // Use is-4 for better sizing/consistency
                column.style.padding = '15px';
                
                // Create card HTML matching the provided design image
                column.innerHTML = `
                    <div class="card" style="width: 100%; margin: 0; height: 450px; display: flex; flex-direction: column; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; background-color: #fff; overflow: hidden;">
                        <div style="padding: 15px 20px; background-color: #f9f9f9;">
                            <div style="margin: 0 0 5px 0; font-size: 15px; color: #666;">Date: ${formattedDate}</div>
                            <div style="margin: 0; font-size: 15px; font-weight: 600; color: #333; background-color: #f0f5f9; display: inline-block; padding: 3px 10px; border-radius: 4px;">Department: ${post.department}</div>
                        </div>
                        <div style="height: 250px; width: 100%; padding: 0; position: relative; overflow: hidden; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                            <img src="${this.getImageUrl(post.image)}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">
                        </div>
                        <div style="padding: 15px 20px; flex-grow: 1; overflow: hidden; background-color: #fff;">
                            <div style="font-size: 14px; margin: 0 0 8px 0; color: #444; display: inline-block; font-weight: 500; padding: 4px 8px; background-color: #f8f8f8; border-radius: 4px; border: 1px solid #eee;">Author: ${post.author}</div>
                            <h3 style="font-size: 14px; font-weight: bold; margin: 0; line-height: 1.3; color: #333; max-height: 36px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; text-overflow: ellipsis;">${post.title}</h3>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; gap: 15px;">
                            <div class="like-btn" style="display: flex; align-items: center; justify-content: center; background-color: #ff5c7c; padding: 8px 15px; height: 36px; border-radius: 4px; transition: all 0.2s ease; cursor: pointer; user-select: none;" data-id="${post.id}">
                                <span style="color: white; font-weight: bold; font-size: 18px;">❤️</span>
                                <span style="font-size: 15px; color: white; margin-left: 5px;">${post.likes || 0}</span>
                            </div>
                            <a href="addpost.html?id=${post.id}" style="background-color: #3498db; color: white; padding: 8px 15px; height: 36px; text-decoration: none; font-size: 14px; border-radius: 4px; font-weight: bold; display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease, background-color 0.2s ease;">
                                <span style="margin-right: 5px;">👀</span> View Details
                            </a>
                        </div>
                    </div>
                `;
                
                // Add like button event listener to the heart container
                const likeContainer = column.querySelector('.like-btn');
                if (likeContainer) {
                    // Add hover effect for better UX
                    likeContainer.addEventListener('mouseenter', () => {
                        likeContainer.style.backgroundColor = '#ff2c5c';
                        likeContainer.style.transform = 'scale(1.05)';
                    });
                    
                    likeContainer.addEventListener('mouseleave', () => {
                        likeContainer.style.backgroundColor = '#ff5c7c';
                        likeContainer.style.transform = 'scale(1)';
                    });
                    
                    // Add click handler with visual feedback
                    likeContainer.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Visual feedback when clicked
                        likeContainer.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            likeContainer.style.transform = 'scale(1)';
                        }, 100);
                        
                        this.toggleLike(post.id);
                    });
                }
                
                // Also handle click on "View Details" link
                const viewDetailsLink = column.querySelector('a[href*="addpost.html"]');
                if (viewDetailsLink) {
                    viewDetailsLink.style.cursor = 'pointer';
                    
                    // Add hover effect
                    viewDetailsLink.addEventListener('mouseenter', () => {
                        viewDetailsLink.style.backgroundColor = '#2980b9';
                    });
                    
                    viewDetailsLink.addEventListener('mouseleave', () => {
                        viewDetailsLink.style.backgroundColor = '#3498db';
                    });
                    
                    // Add click effect
                    viewDetailsLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        // Add visual feedback when clicked
                        viewDetailsLink.style.transform = 'scale(0.95)';
                        
                        // Navigate to the post page after a short delay for animation
                        setTimeout(() => {
                            window.location.href = `addpost.html?id=${post.id}`;
                        }, 100);
                    });
                }
                
                // Add to container
                postsContainer.appendChild(column);
            });
            
            // Render pagination
            this.renderPagination(totalPages);
            
        } catch (error) {
            console.error('Error rendering posts:', error);
            this.showNotification('Error rendering posts: ' + error.message, 'is-danger');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Render pagination controls
     */
    renderPagination(totalPages) {
        const paginationContainer = document.getElementById('pagination-pages');
        
        if (!paginationContainer) {
            console.error('Pagination container not found');
            return;
        }
        
        // Clear the container
        paginationContainer.innerHTML = '';
        
        // Don't show pagination if only one page
        if (totalPages <= 1) {
            return;
        }
        
        // Create a simple pagination div exactly matching the design
        const pagination = document.createElement('div');
        pagination.style.display = 'flex';
        pagination.style.justifyContent = 'center';
        pagination.style.alignItems = 'center';
        pagination.style.margin = '40px 0 20px';
        
        // Previous text
        const previousText = document.createElement('span');
        previousText.textContent = 'Previous';
        previousText.style.margin = '0 20px 0 0';
        previousText.style.cursor = this.currentPage > 1 ? 'pointer' : 'default';
        previousText.style.color = this.currentPage > 1 ? '#000' : '#aaa';
        
        if (this.currentPage > 1) {
            previousText.addEventListener('click', () => {
                this.currentPage--;
                this.renderPosts();
            });
        }
        
        // Page number button (only show 1)
        const pageButton = document.createElement('div');
        pageButton.textContent = '1';
        pageButton.style.border = '1px solid #000';
        pageButton.style.width = '40px';
        pageButton.style.height = '40px';
        pageButton.style.display = 'flex';
        pageButton.style.alignItems = 'center';
        pageButton.style.justifyContent = 'center';
        pageButton.style.margin = '0 20px';
        pageButton.style.cursor = 'pointer';
        
        // Next text
        const nextText = document.createElement('span');
        nextText.textContent = 'Next';
        nextText.style.margin = '0 0 0 0';
        nextText.style.cursor = this.currentPage < totalPages ? 'pointer' : 'default';
        nextText.style.color = this.currentPage < totalPages ? '#000' : '#aaa';
        
        if (this.currentPage < totalPages) {
            nextText.addEventListener('click', () => {
                this.currentPage++;
                this.renderPosts();
            });
        }
        
        // Add all elements to the pagination container
        pagination.appendChild(previousText);
        pagination.appendChild(pageButton);
        pagination.appendChild(nextText);
        
        paginationContainer.appendChild(pagination);
    }

    /**
     * This method is no longer used but kept as a reference
     * for the original pagination implementation
     */

    /**
     * Toggle like on a post
     */
    toggleLike(postId) {
        console.log(`Toggling like for post ID: ${postId}`);
        this.showLoading();
        
        try {
            const post = this.getPost(postId);
            
            if (!post) {
                throw new Error('Post not found');
            }
            
            // Ensure likes is initialized
            if (typeof post.likes !== 'number') {
                post.likes = 0;
            }
            
            // Initialize likedBy array if it doesn't exist
            if (!Array.isArray(post.likedBy)) {
                post.likedBy = [];
            }
            
            // Check if user already liked the post
            const alreadyLiked = post.likedBy.includes(this.currentUser);
            console.log(`Current like state: ${alreadyLiked ? 'liked' : 'not liked'}`);
            
            if (alreadyLiked) {
                // Remove like
                console.log('Removing like');
                post.likedBy = post.likedBy.filter(userId => userId !== this.currentUser);
                // Maintain consistent like count - don't reset to likedBy length
                post.likes = Math.max(0, post.likes - 1);
            } else {
                // Add like
                console.log('Adding like');
                post.likedBy.push(this.currentUser);
                // Increment likes directly
                post.likes += 1;
            }
            
            console.log(`New like count: ${post.likes}, Liked by: ${post.likedBy.length} users`);
            
            // Save changes
            this.savePosts();
            
            // Update UI based on current page
            const pagePath = window.location.pathname.split('/').pop();
            console.log(`Current page: ${pagePath}`);
            
            if (!pagePath || pagePath === '' || pagePath.includes('rana.html')) {
                // Main page - find the specific like button for this post
                console.log('Updating main page like button');
                const postCards = document.querySelectorAll('.column.is-4');
                console.log(`Found ${postCards.length} cards to check`);
                
                // For better debugging
                if (postCards.length === 0) {
                    // Try alternate selectors if the default one fails
                    const allColumns = document.querySelectorAll('.column');
                    console.log(`Found ${allColumns.length} general columns to check as fallback`);
                }
                
                for (const card of postCards) {
                    const link = card.querySelector(`a[href*="${post.id}"]`);
                    if (link) {
                        console.log('Found matching card');
                        // Found the correct card, update its like count
                        const likeContainer = card.querySelector('.like-btn');
                        
                        if (likeContainer) {
                            // Get the like count span
                            const likeCount = likeContainer.querySelector('span:last-child');
                            if (likeCount) {
                                console.log(`Updating like count to ${post.likes}`);
                                likeCount.textContent = post.likes;
                            }
                            
                            // Indicate liked state with color
                            const isLiked = post.likedBy.includes(this.currentUser);
                            likeContainer.style.backgroundColor = isLiked ? '#ff2c5c' : '#ff5c7c';
                            
                            // Show heart animation or visual feedback
                            likeContainer.style.transition = 'transform 0.2s ease, background-color 0.2s ease';
                            likeContainer.style.transform = 'scale(1.2)';
                            setTimeout(() => {
                                likeContainer.style.transform = 'scale(1)';
                            }, 200);
                        } else {
                            console.log('Like container not found in card');
                        }
                        break;
                    }
                }
            } else if (pagePath.includes('addpost.html')) {
                // Post detail page - update like button
                console.log('Updating detail page like button');
                const likeButton = document.getElementById('like-post-btn');
                const likeCount = document.getElementById('like-count');
                const likeIcon = document.getElementById('like-icon');
                
                if (likeCount) {
                    console.log(`Updating like count to ${post.likes}`);
                    likeCount.textContent = post.likes;
                }
                
                if (likeButton) {
                    // Update active state based on NEW state (after toggle)
                    const isNowLiked = post.likedBy.includes(this.currentUser);
                    console.log(`Post is now ${isNowLiked ? 'liked' : 'not liked'}`);
                    
                    if (isNowLiked) { // Post is now liked
                        likeButton.classList.add('is-active');
                        likeButton.style.backgroundColor = '#ff2c5c'; // Darker heart color
                        if (likeIcon) likeIcon.textContent = '❤️';
                    } else { // Post is now unliked
                        likeButton.classList.remove('is-active');
                        likeButton.style.backgroundColor = '#ff5c7c'; // Regular heart color
                        if (likeIcon) likeIcon.textContent = '🤍';
                    }
                    
                    // Show animation effect for the like button
                    likeButton.style.transition = 'transform 0.2s ease';
                    likeButton.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        likeButton.style.transform = 'scale(1)';
                    }, 200);
                }
            }
            
            // Use API if available, but don't block on API errors
            if (window.newsApi) {
                try {
                    console.log('Calling API to update like status');
                    window.newsApi.likePost(postId, this.currentUser)
                        .then(result => {
                            console.log('Post like toggled via API:', result);
                        })
                        .catch(error => {
                            console.error('Error toggling like via API (handled):', error);
                            // Continue with local changes even if API fails
                        });
                } catch (apiError) {
                    console.error('API error caught (handled):', apiError);
                    // Continue with local changes even if API fails
                }
            }
            
        } catch (error) {
            console.error('Error toggling like:', error);
            this.showNotification('Error toggling like: ' + error.message, 'is-danger');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Save posts to localStorage
     */
    savePosts() {
        localStorage.setItem('posts', JSON.stringify(this.posts));
        localStorage.setItem('comments', JSON.stringify(this.comments));
    }

    /**
     * Toggle like on a comment
     */
    toggleCommentLike(commentId) {
        console.log(`Toggling like for comment ID: ${commentId}`);
        this.showLoading();
        
        try {
            const comment = this.comments.find(c => c.id === commentId);
            
            if (!comment) {
                throw new Error('Comment not found');
            }
            
            // Ensure likes is initialized
            if (typeof comment.likes !== 'number') {
                comment.likes = 0;
            }
            
            // Initialize likedBy array if it doesn't exist
            if (!Array.isArray(comment.likedBy)) {
                comment.likedBy = [];
            }
            
            // Check if user already liked the comment
            const alreadyLiked = comment.likedBy.includes(this.currentUser);
            console.log(`Current comment like state: ${alreadyLiked ? 'liked' : 'not liked'}`);
            
            if (alreadyLiked) {
                // Remove like
                comment.likedBy = comment.likedBy.filter(userId => userId !== this.currentUser);
                // Maintain consistent like count - don't reset to likedBy length
                comment.likes = Math.max(0, comment.likes - 1);
            } else {
                // Add like
                comment.likedBy.push(this.currentUser);
                // Increment likes directly
                comment.likes += 1;
            }
            
            console.log(`New comment like count: ${comment.likes}`);
            
            // Save changes
            this.savePosts();
            
            // Update UI
            const commentElement = document.querySelector(`#comment-${commentId} .like-comment-btn`);
            if (commentElement) {
                const icon = commentElement.querySelector('.icon');
                const count = commentElement.querySelector('.ml-1');
                
                // Update heart icon (opposite of previous state since we're toggling)
                if (icon) {
                    icon.innerHTML = alreadyLiked ? '🤍' : '❤️';
                    
                    // Add visual feedback
                    icon.style.transition = 'transform 0.2s ease';
                    icon.style.transform = 'scale(1.3)';
                    setTimeout(() => {
                        icon.style.transform = 'scale(1)';
                    }, 200);
                }
                
                // Update count
                if (count) count.textContent = comment.likes;
                
                // Add visual feedback to the button
                commentElement.style.transition = 'transform 0.2s ease';
                commentElement.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    commentElement.style.transform = 'scale(1)';
                }, 200);
            }
            
            // Use API if available but don't block on errors
            if (window.newsApi) {
                try {
                    window.newsApi.likeComment(commentId, this.currentUser)
                        .then(result => {
                            console.log('Comment like toggled via API:', result);
                        })
                        .catch(error => {
                            console.error('Error toggling comment like via API (handled):', error);
                            // Continue with local changes even if API fails
                        });
                } catch (apiError) {
                    console.error('API error caught (handled):', apiError);
                    // Continue with local changes even if API fails
                }
            }
            
        } catch (error) {
            console.error('Error toggling comment like:', error);
            this.showNotification('Error toggling comment like: ' + error.message, 'is-danger');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle post form submission
     */
    handlePostSubmission(editPostId = null) {
        this.showLoading();
        
        try {
            // Get form data
            const title = document.getElementById('post-title').value;
            const author = document.getElementById('post-author').value;
            const department = document.getElementById('department-select').value;
            const header = document.getElementById('post-header').value;
            const details = document.getElementById('post-details').value;
            const imageInput = document.getElementById('post-image');
            
            // Validate required fields
            if (!title || !author || !department || !header || !details) {
                throw new Error('Please fill out all required fields');
            }
            
            // Create post object
            const post = {
                id: editPostId || `post_${Date.now()}`,
                title,
                author,
                department,
                header,
                details,
                date: new Date().toISOString().split('T')[0],
                image: 'collage.PNG', // Default image
                likes: 0,
                likedBy: []
            };
            
            // Handle image upload
            if (imageInput.files && imageInput.files[0]) {
                // In a real application, you would upload the image to a server
                // For this simplified version, we'll just use the default image
                const reader = new FileReader();
                reader.onload = (e) => {
                    // In a real app, you'd save this to a server
                    console.log('Image data:', e.target.result);
                };
                reader.readAsDataURL(imageInput.files[0]);
                
                // Set image based on file name
                const fileName = imageInput.files[0].name.toLowerCase();
                if (fileName.includes('woman') || fileName.includes('female')) {
                    post.image = 'woman.PNG';
                } else if (fileName.includes('man') || fileName.includes('male')) {
                    post.image = 'man.PNG';
                } else {
                    post.image = 'collage.PNG';
                }
            }
            
            // If editing, update the post
            if (editPostId) {
                // Preserve likes and likedBy from original post
                const originalPost = this.getPost(editPostId);
                if (originalPost) {
                    post.likes = originalPost.likes || 0;
                    post.likedBy = originalPost.likedBy || [];
                    
                    // If no new image was selected, keep the original
                    if (!imageInput.files || !imageInput.files[0]) {
                        post.image = originalPost.image;
                    }
                }
                
                this.finishPostEditing(post);
            } else {
                // Add new post
                this.savePost(post);
            }
        } catch (error) {
            console.error('Error submitting post:', error);
            this.showNotification('Error submitting post: ' + error.message, 'is-danger');
            this.hideLoading();
        }
    }

    /**
     * Save post to the posts array
     */
    savePost(post) {
        try {
            // Add to posts array
            this.posts.push(post);
            
            // Save to localStorage
            this.savePosts();
            
            // Use API if available
            if (window.newsApi) {
                window.newsApi.createPost(post)
                    .then(result => {
                        console.log('Post created via API:', result);
                    })
                    .catch(error => {
                        console.error('Error creating post via API:', error);
                    });
            }
            
            // Show success message
            this.showNotification('Post created successfully!', 'is-success');
            
            // Hide form
            const formElement = document.getElementById('add-post-form');
            if (formElement) formElement.style.display = 'none';
            
            // Re-render posts to show the new post
            this.renderPosts();
        } catch (error) {
            console.error('Error saving post:', error);
            this.showNotification('Error saving post: ' + error.message, 'is-danger');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Finish post editing
     */
    finishPostEditing(post) {
        try {
            // Find the post index
            const index = this.posts.findIndex(p => p.id === post.id);
            
            if (index === -1) {
                throw new Error('Post not found');
            }
            
            // Update the post
            this.posts[index] = post;
            
            // Save to localStorage
            this.savePosts();
            
            // Use API if available
            if (window.newsApi) {
                window.newsApi.updatePost(post.id, post)
                    .then(result => {
                        console.log('Post updated via API:', result);
                    })
                    .catch(error => {
                        console.error('Error updating post via API:', error);
                    });
            }
            
            // Show success message
            this.showNotification('Post updated successfully!', 'is-success');
            
            // Hide form and show post view
            const formElement = document.getElementById('add-post-form');
            const viewElement = document.getElementById('post-view');
            
            if (formElement) formElement.style.display = 'none';
            if (viewElement) viewElement.style.display = 'block';
            
            // Update post details
            this.updatePostDetails(post.id);
        } catch (error) {
            console.error('Error updating post:', error);
            this.showNotification('Error updating post: ' + error.message, 'is-danger');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Show the edit post form
     */
    showEditPostForm(postId) {
        this.showLoading();
        
        try {
            const post = this.getPost(postId);
            
            if (!post) {
                throw new Error('Post not found');
            }
            
            // Hide post view, show form
            document.getElementById('post-view').style.display = 'none';
            document.getElementById('add-post-form').style.display = 'block';
            
            // Update form title
            const formTitle = document.getElementById('form-title');
            if (formTitle) formTitle.textContent = 'Edit Post';
            
            // Fill form with post data
            const titleInput = document.getElementById('post-title');
            const authorInput = document.getElementById('post-author');
            const departmentSelect = document.getElementById('department-select');
            const headerInput = document.getElementById('post-header');
            const detailsInput = document.getElementById('post-details');
            
            if (titleInput) titleInput.value = post.title;
            if (authorInput) authorInput.value = post.author;
            if (departmentSelect) departmentSelect.value = post.department;
            if (headerInput) headerInput.value = post.header;
            if (detailsInput) detailsInput.value = post.details;
        } catch (error) {
            console.error('Error showing edit form:', error);
            this.showNotification('Error showing edit form: ' + error.message, 'is-danger');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Delete a post
     */
    deletePost(postId) {
        this.showLoading();
        
        try {
            // Confirm deletion
            if (!confirm('Are you sure you want to delete this post?')) {
                this.hideLoading();
                return;
            }
            
            // Find the post
            const postIndex = this.posts.findIndex(post => post.id === postId);
            
            if (postIndex === -1) {
                throw new Error('Post not found');
            }
            
            // Remove the post
            this.posts.splice(postIndex, 1);
            
            // Remove related comments
            this.comments = this.comments.filter(comment => comment.postId !== postId);
            
            // Save to localStorage
            this.savePosts();
            
            // Use API if available
            if (window.newsApi) {
                window.newsApi.deletePost(postId)
                    .then(result => {
                        console.log('Post deleted via API:', result);
                    })
                    .catch(error => {
                        console.error('Error deleting post via API:', error);
                    });
            }
            
            // Show success message
            this.showNotification('Post deleted successfully!', 'is-success');
            
            // Redirect to main page
            setTimeout(() => {
                window.location.href = 'rana.html';
            }, 1000);
        } catch (error) {
            console.error('Error deleting post:', error);
            this.showNotification('Error deleting post: ' + error.message, 'is-danger');
            this.hideLoading();
        }
    }

    /**
     * Handle comment form submission
     */
    handleCommentSubmission() {
        this.showLoading();
        
        try {
            // Get form data using the correct IDs from the HTML
            const username = document.getElementById('username').value;
            const text = document.getElementById('commentText').value;
            const postId = document.getElementById('postId').value;
            const replyTo = document.getElementById('replyToId')?.value || null;
            
            // Validate required fields
            if (!username || !text || !postId) {
                throw new Error('Please fill out all required fields');
            }
            
            // Create comment object
            const comment = {
                id: `comment_${Date.now()}`,
                username,
                text,
                postId,
                replyTo,
                timestamp: new Date().toISOString(),
                likes: 0,
                likedBy: [],
                profilePic: this.getRandomAvatar(username)
            };
            
            // Save the comment
            this.saveComment(comment);
        } catch (error) {
            console.error('Error submitting comment:', error);
            this.showNotification('Error submitting comment: ' + error.message, 'is-danger');
            this.hideLoading();
        }
    }

    /**
     * Save comment to the comments array
     */
    saveComment(comment) {
        try {
            // Add to comments array
            this.comments.push(comment);
            
            // Save to localStorage
            this.savePosts();
            
            // Use API if available
            if (window.newsApi) {
                window.newsApi.createComment(comment)
                    .then(result => {
                        console.log('Comment created via API:', result);
                    })
                    .catch(error => {
                        console.error('Error creating comment via API:', error);
                    });
            }
            
            // Show success message
            this.showNotification('Comment added successfully!', 'is-success');
            
            // Redirect to post page
            setTimeout(() => {
                window.location.href = `addpost.html?id=${comment.postId}`;
            }, 1000);
        } catch (error) {
            console.error('Error saving comment:', error);
            this.showNotification('Error saving comment: ' + error.message, 'is-danger');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Delete a comment
     */
    deleteComment(commentId) {
        this.showLoading();
        
        try {
            // Find the comment
            const commentIndex = this.comments.findIndex(comment => comment.id === commentId);
            
            if (commentIndex === -1) {
                throw new Error('Comment not found');
            }
            
            const comment = this.comments[commentIndex];
            
            // Remove the comment
            this.comments.splice(commentIndex, 1);
            
            // Remove replies to this comment
            this.comments = this.comments.filter(c => c.replyTo !== commentId);
            
            // Save to localStorage
            this.savePosts();
            
            // Use API if available
            if (window.newsApi) {
                window.newsApi.deleteComment(commentId)
                    .then(result => {
                        console.log('Comment deleted via API:', result);
                    })
                    .catch(error => {
                        console.error('Error deleting comment via API:', error);
                    });
            }
            
            // Show success message
            this.showNotification('Comment deleted successfully!', 'is-success');
            
            // Re-render comments
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');
            
            if (postId) {
                this.renderComments(postId);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            this.showNotification('Error deleting comment: ' + error.message, 'is-danger');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Show loading spinner
     */
    showLoading() {
        this.isLoading = true;
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = 'flex';
        }
    }

    /**
     * Hide loading spinner
     */
    hideLoading() {
        this.isLoading = false;
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            setTimeout(() => {
                spinner.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'is-info') {
        // Simple notification system - easier to understand for university students
        const container = document.getElementById('notification-container');
        
        // If no container, just use alert instead
        if (!container) {
            alert(message);
            return;
        }
        
        // Create a basic notification
        const notification = document.createElement('div');
        notification.className = `notification ${type} mb-2`;
        notification.innerHTML = `
            <button class="delete"></button>
            ${message}
        `;
        
        // Basic close button
        const closeBtn = notification.querySelector('.delete');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                notification.remove();
            });
        }
        
        // Add it to the page
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(function() {
            notification.remove();
        }, 5000);
    }

    /**
     * Format date string
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Get time ago string (e.g. "2 hours ago")
     */
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) return interval + ' years ago';
        if (interval === 1) return '1 year ago';
        
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return interval + ' months ago';
        if (interval === 1) return '1 month ago';
        
        interval = Math.floor(seconds / 86400);
        if (interval > 1) return interval + ' days ago';
        if (interval === 1) return '1 day ago';
        
        interval = Math.floor(seconds / 3600);
        if (interval > 1) return interval + ' hours ago';
        if (interval === 1) return '1 hour ago';
        
        interval = Math.floor(seconds / 60);
        if (interval > 1) return interval + ' minutes ago';
        if (interval === 1) return '1 minute ago';
        
        if (seconds < 10) return 'just now';
        
        return Math.floor(seconds) + ' seconds ago';
    }

    /**
     * Generate a random avatar URL
     */
    getRandomAvatar(username) {
        // Simply return the base64 image directly to avoid loading issues
        return 'data:image/jpeg;base64,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';
    }

    /**
     * Truncate text to a specific length, preserving whole words where possible
     */
    truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        
        // Make it very short and sweet
        const shortened = text.substring(0, maxLength);
        const lastSpace = shortened.lastIndexOf(' ');
        
        // Always use word boundary
        if (lastSpace > 0) {
            return shortened.substring(0, lastSpace);
        }
        
        // Fallback - very rare
        return shortened;
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
    
    /**
     * Convert relative image paths to absolute URLs or use backup image if not found
     */
    getImageUrl(imagePath) {
        // If it's already an absolute URL or data URL, return as is
        if (imagePath && (imagePath.startsWith('http') || imagePath.startsWith('data:'))) {
            return imagePath;
        }
        
        // Default to a safe placeholder
        const placeholder = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAyADIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KK5Pxx8SNA+G+mpPrNyxlmJW1tIQGmuGAyQo7DjJJIAycCgDoNQ1K00fT7i/v7qCztLaNpZZ5nCJGgGSxJ6ACvG7z9q3T9a1K50/4feANc8aXMDiOSaBzFZI/91XZQXY+oUgd8mvD/ABt4g+NH7Y3jO6lWbUF0G1uFjtYrIm3sLHeOUjC5aSTB5Zi+O5r7o+Ffwz0L4U+ErfQtBt9qAfvbmUASXM+Bl5G7nngdAOBQB806Z+1b44+Hs63vxA+Fz7yALi50eXECY7wzxsdnsN4NY/ij/gpzPJqun+D9S+FGu3fiCG4E8UFglq0NwMZ3QyS3MeTwchlYYPIFfT3xY/5EDxH/ANgq6/8ARbV+Rv7I3jXw/L4p8eeBvE2jabq9h4s0ExNDexLKDcxJuigIbllZmcY9QaAP1s8M+KdF8YaLBrGgalZ6tp8y7o57WQOp98dj6EYI7it2vAfgJ+z0vw/8VjxdN4l1nUtTvLb7PPBPLi0VNwcMsW0AnjByTyPbA9+oAKKKKACvj39t/wCJU0un6D4Dsrgxw3BeW+ChvmCgGJWHoSpYe6V9g3l5DY2c11cyLFBChklkc4CqBkk1+dH7P51T9oj9pK88Q+MpJbsLeXN+YJm/dRSfcto0H8Kpu49FoAt/sZeHvBfhX4h+NNY8JabFHqc+lpaa1dkb5b9Rn5GbsiAvtAGAXPrX2lXw/wCMrO0/Zv8A2qLjxhbQfZvCXilDdXkSjCQ3xXJfHbc2GA7EBq+wo5FljWRGDIwDKynIIPII9DQAUX9hbajYz2l3Es1tPG0UsbjKupGCCPUEV+Z37Vn7LGqfBnWH8X+B7WXUPCsmZvIsoDI2myMcBkC8mEnjI+6Thuh2/qLSEAjIyDQB+SX7KfjuL4f/AB98Or5ywwaki6XcTPwkYlYCJye4Eg2596/W6vyL/ap8BXHwv+P2v67ZWzLouuudThuIx8izNkTIfYtlz/v1+p/g3Xofhj8MLDxBdBjDZ6TFczBBy5ES5A9zigA8HeM9G8d6JFq+g30d7aSZU4+V4m/iR1PDKfUV0VfGf7CPiqfxH8MtRe7be2nalJDET/zySOMD8N29v+A19mUANkdY0Z2YKqjJJOABXwh+xFpb+O/jJ46+IF9GZf3pggkbln+0TMZWPvtCL+NfZ/jDURonhDXNQJx9ksp5s+mxCa/O/wDYC8TWWmeM/GGh3MqpNqVlbzQKxwZCjyKwH0DH86AOm/ac8QSePvGfhr4WaPP532i5F5q5hbDJbKf3Uke7r5jsOnU7B3r7B0DRLXw3oWn6TYoI7Sxt47aFB0VEUKo/ICvhX4mzxWH7fHw7urhxHbEWCFm4G9d0af8AfTECvvqgAr8y/wBsr4N3vwu+J1x400aCS48I6wwuUkhXcLO4bBeJx2BJJXtznqK/TSq+o6fba1pl3p17EJrO8he3mjPR0dSrD8QaAP3N+Enj1/iV8LvDfiZ0WOXULJJJkX7qyqAsi/g4YfhWz4x8E6L490t7LXLGO5Rm3Qz/AHZrd+m+Nx8yn6dOoIPNeT/sZ+JY/Ef7OfhgKwE2mRS6ZKAc4MUhC5+qFD+NfQFAHhXhn9lHwhoviS21i7uNV1VrWQSw2t5cbo4JBwHXYqknuAcDoRXutFFABRRRQB+df/BQvTvK8X+B9U2/LdaXNb7vXy5SePpKa8G+EGqPo/xW8FXsZwYtYtDn0+cor7a/b+8MPrfwVttXjUsuja1HI7AfdjlR4yfxZEr82tO1G50q+gvLK4ltLqBvMimhfZIjdnU9CDnoaAP2lorwH4A/tL6f8UWi0PWVi03xQqdCD5V5j+KHd0P95c5HUZBx78DkZHSgDz74rfCPQPixo/2fUl+zajagtZajGv724T1HZlzwynrweQSD8Yar+zv8Q/hze3uoaTpd94g0i1hea6XS0N3bRhRnmS3EjIR6kLX6KUUAUP8AhJNH/wCgpY/+BCf41+4lfh3X7iUAFFFFABWN4q8LaX4v0KbStYtFurSXsRhkb+F1P3WXuCK2aKAPzf8Ai9+yb4t8D3ktxollL4m0NgWWS1jzc28fYSwqDuHqyAj3PSvMPDnx5+Inw/vYxp/iLUYYoWw9rdO1zbTL7Ojbf1Ffrb0rzjxd8AvAnjiVp9Q0GGC8ckm5sH+zOx/vEpwfxzQB4d8I/wBupLqSGw8e6WttI+FGp6epeJs/xSQkllHurH2Ffa1heQapY29/ZzJcWt1GssMqH5ZEYZBHsQa+LfEv7D2nwyvN4a8R3UBzlIdRiWZfp5ihSPyNct4Z+EHxc+APis3Hw+8TG/0F8F7J5GmtMjt5M6MVHuGIoA/SuivnXwd+2doOrvBZ+KdKn0SZsK13BmWz56lsAunsQT7CvoTTdSttXsbe9sp47i1uEEkUsbBldSMgg9jQBdooooA/Duuv+Gvwo8UfFTVRZeHdMluVUnzrlhmG2T1eRukY9s5PYGun+Bf7P3iL4z6v5dtC9jokDD7XqbxnygOvloDxK/sOBn5iK/VH4dfDvQ/hf4ct9G0K1WC3j+aWUjMlxIRgySN3Y/l0HQUAZ3wv+FWg/CPw8NL0SLfI+GubyYDzriXGNzn09ABwO9dhRRQAUUUUAcH8Vfg54a+LWmJBrULRXcGTb31uQs8B7joQV/unIPuK+G/HX7G/xB8G3sraSkerRZ/d3Mcrm1lXodoDFlP1yfcV+gtFAH5q6f8ACf4g6NqK2V/4T1cXJGQqWcjyKfRk27gfcEVq6P8AD7x83izTo9N8K6oL0XEZhJtJF8rDDMuQuApxnNfpTRQB47+z78BbL4P6fdXl5eNqWv3wCTXO3asMQOSkSk8DJ5Y8k9gK9iooqQCiiigAooooAKKKKACiiigAooooAKKKKAP/2Q==';
        
        // Check if the image specified in the JSON exists
        if (!imagePath) {
            console.log('No image path provided, using placeholder.');
            return placeholder;
        }
        
        // Known image patterns
        if (imagePath === 'collage.PNG' || imagePath === 'man.PNG' || imagePath === 'woman.PNG') {
            // Use embedded base64 images since local PNG files are having issues loading
            return placeholder;
        }
        
        // For any other cases, try to get from server with a fallback
        try {
            // Make it relative to the current page
            const baseUrl = window.location.origin + '/';
            return baseUrl + imagePath;
        } catch (error) {
            console.error('Error getting image URL:', error);
            return placeholder;
        }
    }
}

// Initialize the portal when the page is fully loaded
function initializePortal() {
    try {
        console.log('Initializing NewsPortal instance');
        console.log('newsApi exists:', !!window.newsApi);
        window.newsPortal = new NewsPortal();
        console.log('NewsPortal created successfully with:', {
            posts: window.newsPortal.posts.length,
            comments: window.newsPortal.comments.length
        });
    } catch (error) {
        console.error('Error initializing NewsPortal:', error);
    }
}

// Try both DOMContentLoaded and load events to ensure initialization
document.addEventListener('DOMContentLoaded', initializePortal);
window.addEventListener('load', () => {
    // If not initialized by DOMContentLoaded, do it now
    if (!window.newsPortal) {
        console.log('NewsPortal not initialized by DOMContentLoaded, trying again');
        initializePortal();
    }
});