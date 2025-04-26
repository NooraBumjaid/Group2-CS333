// News Post Class
class NewsPost {
    constructor(title, author, department, date, image, details, header) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.title = title;
        this.author = author;
        this.department = department;
        this.date = date;
        this.image = image;
        this.details = details;
        this.header = header;
        this.likes = 0;
        this.likedBy = new Set();
    }
}

// Comment Class
class Comment {
    constructor(username, text, postId, replyTo = null) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.username = username;
        this.text = text;
        this.postId = postId;
        this.replyTo = replyTo;
        this.timestamp = new Date().toISOString();
        this.likes = 0;
        this.likedBy = new Set();
    }
}

// Main Application Manager
class AppManager {
    constructor() {
        this.posts = [];
        this.comments = [];
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.isLoading = false;
        this.currentUser = 'user1'; // Simulate current user
        this.initializeApp();
    }

    async initializeApp() {
        this.loadFromLocalStorage();
        if (window.location.pathname.includes('rana.html')) {
            if (this.posts.length === 0) {
                await this.fetchInitialPosts();
            }
            this.renderPosts();
            this.setupMainPageListeners();
        } else if (window.location.pathname.includes('addpost.html')) {
            this.initializeDetailView();
        }
        this.setupCommonListeners();
    }

    loadFromLocalStorage() {
        // Load posts
        const savedPosts = localStorage.getItem('newsPosts');
        if (savedPosts) {
            const parsedPosts = JSON.parse(savedPosts);
            this.posts = parsedPosts.map(post => {
                const newPost = new NewsPost(
                    post.title,
                    post.author,
                    post.department,
                    post.date,
                    post.image,
                    post.details,
                    post.header
                );
                newPost.id = post.id;
                newPost.likes = post.likes;
                newPost.likedBy = new Set(post.likedBy);
                return newPost;
            });
        }

        // Load comments
        const savedComments = localStorage.getItem('comments');
        if (savedComments) {
            this.comments = JSON.parse(savedComments);
        }
    }

    saveToLocalStorage() {
        // Save posts
        const postsToSave = this.posts.map(post => ({
            ...post,
            likedBy: Array.from(post.likedBy)
        }));
        localStorage.setItem('newsPosts', JSON.stringify(postsToSave));

        // Save comments
        localStorage.setItem('comments', JSON.stringify(this.comments));
    }

    async fetchInitialPosts() {
        try {
            this.showLoading();
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            if (!response.ok) throw new Error('Failed to fetch news');
            
            const data = await response.json();
            this.posts = data.slice(0, 10).map(post => new NewsPost(
                post.title,
                'Author ' + post.userId,
                this.getRandomDepartment(),
                this.getRandomDate(),
                'collage.PNG',
                post.body,
                post.body.substring(0, 50) + '...'
            ));
            this.saveToLocalStorage();
            this.hideLoading();
        } catch (error) {
            console.error('Error fetching news:', error);
            this.showError('Failed to load news. Please try again later.');
            this.hideLoading();
        }
    }

    showLoading() {
        this.isLoading = true;
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.style.display = 'flex';
    }

    hideLoading() {
        this.isLoading = false;
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'notification is-danger';
        errorDiv.textContent = message;
        const container = document.querySelector('.main-content') || document.body;
        container.prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'notification is-success';
        successDiv.textContent = message;
        const container = document.querySelector('.main-content') || document.body;
        container.prepend(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
    }

    getRandomDepartment() {
        const departments = ['Engineering', 'Business', 'Science', 'Arts & Design', 
                           'Medicine & Health', 'Law', 'Education', 'Sports', 'Technology'];
        return departments[Math.floor(Math.random() * departments.length)];
    }

    getRandomDate() {
        const start = new Date(2024, 0, 1);
        const end = new Date(2025, 11, 31);
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
            .toLocaleDateString();
    }
        // Continue from previous part...

        createPostCard(post) {
            const isLiked = post.likedBy.has(this.currentUser);
            return `
                <div class="column is-one-quarter">
                    <div class="box">
                        <p class="is-size-7 has-text-grey">Date: ${post.date}</p>
                        <p class="is-size-7 has-text-info has-background-info-light px-2 py-1" style="display: inline-block; border-radius: 4px; margin: 5px 0;">
                            <strong>Department: ${post.department}</strong>
                        </p>
                        <figure class="image is-4by3">
                            <img src="${post.image}" alt="News Image" style="width: 100%; height: auto;">
                        </figure>
                        <h3 class="title is-6">${post.title}</h3>
                        <p class="is-size-7"><strong>By: ${post.author}</strong></p>
                        <div class="mt-4">
                            <p class="is-size-7">${post.header}</p>
                        </div>
                        <div class="buttons mt-4">
                            <a href="addpost.html?id=${post.id}" class="button is-info is-small">View Details</a>
                            <button class="button is-primary is-small like-button ${isLiked ? 'is-active' : ''}" data-id="${post.id}">
                                <span class="icon">${isLiked ? '💖' : '❤️'}</span>
                                <span class="like-count">${post.likes}</span>
                            </button>
                            <button class="button is-warning is-small edit-button" data-id="${post.id}">
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    
        createCommentElement(comment, level = 0) {
            const isLiked = comment.likedBy?.has(this.currentUser);
            const replyToComment = comment.replyTo ? 
                this.comments.find(c => c.id === comment.replyTo) : null;
    
            return `
                <div class="box" style="margin-left: ${level * 20}px">
                    ${replyToComment ? `
                        <p class="is-size-7 has-text-info mb-2">
                            Replying to ${replyToComment.username}'s comment
                        </p>
                    ` : ''}
                    <div class="columns is-vcentered">
                        <div class="column is-narrow">
                            <figure class="image is-48x48">
                                <img src="woman.PNG" alt="Profile Picture" style="border-radius: 50%;">
                            </figure>
                        </div>
                        <div class="column">
                            <strong>${comment.username}</strong>
                            <p class="is-size-7 has-text-grey">${new Date(comment.timestamp).toLocaleString()}</p>
                        </div>
                        <div class="column is-narrow">
                            <button class="button is-small is-primary like-comment-button ${isLiked ? 'is-active' : ''}" 
                                    data-comment-id="${comment.id}">
                                <span class="icon">${isLiked ? '💖' : '❤️'}</span>
                                <span class="like-count">${comment.likes || 0}</span>
                            </button>
                            <button class="button is-small is-info reply-button" data-comment-id="${comment.id}">
                                Reply
                            </button>
                        </div>
                    </div>
                    <div class="content mt-3">
                        <p>${comment.text}</p>
                    </div>
                    <div class="has-text-right">
                        <button class="button is-small is-danger delete-comment-button" 
                                data-comment-id="${comment.id}">🗑️ Delete</button>
                        <button class="button is-small is-info edit-comment-button" 
                                data-comment-id="${comment.id}">Edit</button>
                    </div>
                </div>
            `;
        }
    
        renderPosts() {
            const container = document.querySelector('.news-posts-card .columns');
            if (!container) return;
    
            container.innerHTML = '';
            const startIndex = (this.currentPage - 1) * this.postsPerPage;
            const endIndex = startIndex + this.postsPerPage;
            const visiblePosts = this.getFilteredAndSortedPosts().slice(startIndex, endIndex);
    
            visiblePosts.forEach(post => {
                container.innerHTML += this.createPostCard(post);
            });
    
            this.setupPagination();
        }
    
        renderComments(postId) {
            const container = document.querySelector('.comments-container');
            if (!container) return;
    
            const postComments = this.comments.filter(c => c.postId === postId);
            const commentTree = this.buildCommentTree(postComments);
            
            container.innerHTML = '';
            commentTree.forEach(comment => {
                this.renderCommentThread(comment, container);
            });
        }
    
        buildCommentTree(comments) {
            const rootComments = comments.filter(c => !c.replyTo);
            return rootComments.map(comment => ({
                ...comment,
                replies: this.getCommentReplies(comment.id, comments)
            }));
        }
    
        getCommentReplies(parentId, allComments) {
            const replies = allComments.filter(c => c.replyTo === parentId);
            return replies.map(reply => ({
                ...reply,
                replies: this.getCommentReplies(reply.id, allComments)
            }));
        }
    
        renderCommentThread(comment, container, level = 0) {
            container.innerHTML += this.createCommentElement(comment, level);
            comment.replies?.forEach(reply => {
                this.renderCommentThread(reply, container, level + 1);
            });
        }
    
        setupPagination() {
            const totalPosts = this.getFilteredAndSortedPosts().length;
            const totalPages = Math.ceil(totalPosts / this.postsPerPage);
            const paginationList = document.getElementById('pagination-pages');
            if (!paginationList) return;
    
            paginationList.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const pageLink = document.createElement('a');
                pageLink.href = '#';
                pageLink.className = `pagination-link ${i === this.currentPage ? 'is-current' : ''}`;
                pageLink.textContent = i;
                pageLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.currentPage = i;
                    this.renderPosts();
                });
                paginationList.appendChild(pageLink);
            }
        }
    
        getFilteredAndSortedPosts() {
            let filteredPosts = [...this.posts];
            
            const departmentFilter = document.querySelector('#news-filter select')?.value;
            if (departmentFilter && departmentFilter !== 'no-filter-option') {
                filteredPosts = filteredPosts.filter(post => 
                    post.department.toLowerCase() === departmentFilter.toLowerCase()
                );
            }
    
            const searchTerm = document.querySelector('#search-news')?.value.toLowerCase();
            if (searchTerm) {
                filteredPosts = filteredPosts.filter(post =>
                    post.title.toLowerCase().includes(searchTerm) ||
                    post.details.toLowerCase().includes(searchTerm) ||
                    post.author.toLowerCase().includes(searchTerm)
                );
            }
    
            const sortOption = document.querySelector('#news-sort select')?.value;
            switch (sortOption) {
                case 'sort-by-date':
                    filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
                    break;
                case 'most-popular':
                    filteredPosts.sort((a, b) => b.likes - a.likes);
                    break;
                case 'from-A-to-Z':
                    filteredPosts.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'from-Z-to-A':
                    filteredPosts.sort((a, b) => b.title.localeCompare(a.title));
                    break;
            }
    
            return filteredPosts;
        }
    
        setupMainPageListeners() {
            // Search input listener
            const searchInput = document.querySelector('#search-news');
            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    this.currentPage = 1;
                    this.renderPosts();
                });
            }
    
            // Department filter listener
            const departmentFilter = document.querySelector('#news-filter select');
            if (departmentFilter) {
                departmentFilter.addEventListener('change', () => {
                    this.currentPage = 1;
                    this.renderPosts();
                });
            }
    
            // Sort listener
            const sortSelect = document.querySelector('#news-sort select');
            if (sortSelect) {
                sortSelect.addEventListener('change', () => {
                    this.currentPage = 1;
                    this.renderPosts();
                });
            }
    
            // Add post form toggle
            const addPostBtn = document.getElementById('add-post-btn');
            const addPostForm = document.getElementById('add-post-form');
            if (addPostBtn && addPostForm) {
                addPostBtn.addEventListener('click', () => {
                    addPostForm.style.display = 'block';
                    const editingPost = JSON.parse(localStorage.getItem('editingPost') || 'null');
                    if (editingPost) {
                        document.getElementById('form-title').textContent = 'Edit Post';
                        document.getElementById('post-title').value = editingPost.title;
                        document.getElementById('post-author').value = editingPost.author;
                        document.getElementById('department-select').value = editingPost.department;
                        document.getElementById('post-header').value = editingPost.header;
                        document.getElementById('post-details').value = editingPost.details;
                    }
                });
            }
    
            // Handle post form submission
            const postForm = document.querySelector('#add-post-form form');
            if (postForm) {
                postForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(postForm);
                    const postData = {
                        title: formData.get('title'),
                        author: formData.get('author'),
                        department: formData.get('department'),
                        header: formData.get('header'),
                        details: formData.get('details'),
                        date: new Date().toLocaleDateString(),
                        image: 'collage.PNG'
                    };
    
                    const editingPost = JSON.parse(localStorage.getItem('editingPost') || 'null');
                    if (editingPost) {
                        const index = this.posts.findIndex(p => p.id === editingPost.id);
                        if (index !== -1) {
                            this.posts[index] = { ...this.posts[index], ...postData };
                        }
                        localStorage.removeItem('editingPost');
                    } else {
                        const newPost = new NewsPost(
                            postData.title,
                            postData.author,
                            postData.department,
                            postData.date,
                            postData.image,
                            postData.details,
                            postData.header
                        );
                        this.posts.unshift(newPost);
                    }
    
                    this.saveToLocalStorage();
                    this.renderPosts();
                    postForm.reset();
                    addPostForm.style.display = 'none';
                    this.showSuccess('Post saved successfully!');
                });
            }
        }
    
        setupCommonListeners() {
            // Like button listeners
            document.addEventListener('click', (e) => {
                if (e.target.closest('.like-button')) {
                    const button = e.target.closest('.like-button');
                    const postId = button.dataset.id;
                    const post = this.posts.find(p => p.id === postId);
                    if (post) {
                        if (post.likedBy.has(this.currentUser)) {
                            post.likedBy.delete(this.currentUser);
                            post.likes--;
                            button.classList.remove('is-active');
                            button.querySelector('.icon').textContent = '❤️';
                        } else {
                            post.likedBy.add(this.currentUser);
                            post.likes++;
                            button.classList.add('is-active');
                            button.querySelector('.icon').textContent = '💖';
                        }
                        button.querySelector('.like-count').textContent = post.likes;
                        this.saveToLocalStorage();
                    }
                }
            });
    
            // Comment like button listeners
            document.addEventListener('click', (e) => {
                if (e.target.closest('.like-comment-button')) {
                    const button = e.target.closest('.like-comment-button');
                    const commentId = button.dataset.commentId;
                    const comment = this.comments.find(c => c.id === commentId);
                    if (comment) {
                        if (!comment.likedBy) comment.likedBy = new Set();
                        if (!comment.likes) comment.likes = 0;
    
                        if (comment.likedBy.has(this.currentUser)) {
                            comment.likedBy.delete(this.currentUser);
                            comment.likes--;
                            button.classList.remove('is-active');
                            button.querySelector('.icon').textContent = '❤️';
                        } else {
                            comment.likedBy.add(this.currentUser);
                            comment.likes++;
                            button.classList.add('is-active');
                            button.querySelector('.icon').textContent = '💖';
                        }
                        button.querySelector('.like-count').textContent = comment.likes;
                        this.saveToLocalStorage();
                    }
                }
            });
    
            // Edit button listeners
            document.addEventListener('click', (e) => {
                if (e.target.closest('.edit-button')) {
                    const button = e.target.closest('.edit-button');
                    const postId = button.dataset.id;
                    const post = this.posts.find(p => p.id === postId);
                    if (post) {
                        localStorage.setItem('editingPost', JSON.stringify(post));
                        window.location.href = 'rana.html#add-post-form';
                    }
                }
            });
    
            // Comment management listeners
            document.addEventListener('click', (e) => {
                if (e.target.matches('.reply-button')) {
                    const commentId = e.target.dataset.commentId;
                    const comment = this.comments.find(c => c.id === commentId);
                    if (comment) {
                        localStorage.setItem('replyingTo', JSON.stringify({
                            commentId: comment.id,
                            username: comment.username,
                            postId: comment.postId
                        }));
                        window.location.href = 'addcomment.html';
                    }
                }
    
                if (e.target.matches('.edit-comment-button')) {
                    const commentId = e.target.dataset.commentId;
                    const comment = this.comments.find(c => c.id === commentId);
                    if (comment) {
                        localStorage.setItem('editingComment', JSON.stringify(comment));
                        window.location.href = 'addcomment.html';
                    }
                }
    
                if (e.target.matches('.delete-comment-button')) {
                    const commentId = e.target.dataset.commentId;
                    if (confirm('Are you sure you want to delete this comment?')) {
                        this.comments = this.comments.filter(c => c.id !== commentId);
                        this.saveToLocalStorage();
                        this.renderComments(this.getCurrentPostId());
                    }
                }
            });
    
            // Handle comment form
            const commentForm = document.getElementById('commentForm');
            if (commentForm) {
                const replyingTo = JSON.parse(localStorage.getItem('replyingTo') || 'null');
                const editingComment = JSON.parse(localStorage.getItem('editingComment') || 'null');
    
                if (replyingTo) {
                    document.getElementById('reply-indicator').style.display = 'block';
                    document.getElementById('reply-to-username').textContent = replyingTo.username;
                }
    
                if (editingComment) {
                    document.getElementById('form-title').textContent = 'Edit Comment';
                    document.getElementById('username').value = editingComment.username;
                    document.getElementById('commentText').value = editingComment.text;
                }
    
                commentForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(commentForm);
                    const commentData = {
                        username: formData.get('username'),
                        text: formData.get('commentText'),
                        postId: this.getCurrentPostId(),
                        replyTo: replyingTo?.commentId || null
                    };
    
                    if (editingComment) {
                        const index = this.comments.findIndex(c => c.id === editingComment.id);
                        if (index !== -1) {
                            this.comments[index] = { ...this.comments[index], ...commentData };
                        }
                    } else {
                        const newComment = new Comment(
                            commentData.username,
                            commentData.text,
                            commentData.postId,
                            commentData.replyTo
                        );
                        this.comments.push(newComment);
                    }
    
                    this.saveToLocalStorage();
                    localStorage.removeItem('replyingTo');
                    localStorage.removeItem('editingComment');
                    window.location.href = `addpost.html?id=${commentData.postId}`;
                });
            }
        }
    
        getCurrentPostId() {
            return new URLSearchParams(window.location.search).get('id');
        }
    
        initializeDetailView() {
            const postId = this.getCurrentPostId();
            if (!postId) return;
    
            const post = this.posts.find(p => p.id === postId);
            if (!post) {
                this.showError('Post not found');
                return;
            }
    
            // Populate post details
            document.getElementById('post-title').textContent = post.title;
            document.getElementById('post-author').textContent = post.author;
            document.getElementById('post-date').textContent = post.date;
            document.getElementById('post-department').textContent = post.department;
            document.getElementById('post-image').src = post.image;
            document.getElementById('post-details').textContent = post.details;
    
            // Setup like button
            const likeButton = document.getElementById('like-post-btn');
            const likeIcon = document.getElementById('like-icon');
            const likeCount = document.getElementById('like-count');
            
            if (likeButton && likeIcon && likeCount) {
                const isLiked = post.likedBy.has(this.currentUser);
                likeIcon.textContent = isLiked ? '💖' : '❤️';
                likeCount.textContent = post.likes;
                if (isLiked) likeButton.classList.add('is-active');
            }
    
            // Render comments
            this.renderComments(postId);
        }
    }
    
    // Initialize the application
    document.addEventListener('DOMContentLoaded', () => {
        new AppManager();
    });