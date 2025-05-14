

const newsApi = {
    // Base API URL - points to Flask API endpoint
    baseUrl: 'index.php?api=1',

    /**
     * Handles API errors
     * @param {Response} response - Fetch response object
     * @returns {Promise} - Promise that resolves to JSON response or rejects with error
     */
    async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                error: `HTTP error ${response.status}`
            }));
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        return response.json();
    },

    /**
     * Fetches all posts from the database
     * @returns {Promise} - Promise that resolves to array of posts
     */
    async getPosts() {
        try {
            const response = await fetch(`${this.baseUrl}?action=getPosts`);
            return this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    },

    /**
     * Fetches a single post by ID
     * @param {string} id - Post ID
     * @returns {Promise} - Promise that resolves to post object
     */
    async getPost(id) {
        try {
            const response = await fetch(`${this.baseUrl}?action=getPost&id=${id}`);
            return this.handleResponse(response);
        } catch (error) {
            console.error(`Error fetching post ${id}:`, error);
            throw error;
        }
    },

    /**
     * Creates a new post
     * @param {Object} postData - Post data object
     * @returns {Promise} - Promise that resolves to success response
     */
    async createPost(postData) {
        try {
            const response = await fetch(`${this.baseUrl}?action=createPost`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    },

    /**
     * Updates an existing post
     * @param {string} id - Post ID
     * @param {Object} postData - Updated post data
     * @returns {Promise} - Promise that resolves to success response
     */
    async updatePost(id, postData) {
        try {
            const response = await fetch(`${this.baseUrl}?action=updatePost&id=${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error(`Error updating post ${id}:`, error);
            throw error;
        }
    },

    /**
     * Deletes a post
     * @param {string} id - Post ID
     * @returns {Promise} - Promise that resolves to success response
     */
    async deletePost(id) {
        try {
            const response = await fetch(`${this.baseUrl}?action=deletePost&id=${id}`, {
                method: 'POST'
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error(`Error deleting post ${id}:`, error);
            throw error;
        }
    },

    /**
     * Fetches comments for a post
     * @param {string} postId - Post ID
     * @returns {Promise} - Promise that resolves to array of comments
     */
    async getComments(postId) {
        try {
            const response = await fetch(`${this.baseUrl}?action=getComments&postId=${postId}`);
            return this.handleResponse(response);
        } catch (error) {
            console.error(`Error fetching comments for post ${postId}:`, error);
            throw error;
        }
    },

    /**
     * Creates a new comment
     * @param {Object} commentData - Comment data object
     * @returns {Promise} - Promise that resolves to success response
     */
    async createComment(commentData) {
        try {
            const response = await fetch(`${this.baseUrl}?action=createComment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commentData)
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        }
    },

    /**
     * Updates an existing comment
     * @param {string} id - Comment ID
     * @param {Object} commentData - Updated comment data
     * @returns {Promise} - Promise that resolves to success response
     */
    async updateComment(id, commentData) {
        try {
            console.log('API: Updating comment', id);
            console.log('API: Comment data:', commentData);
            const response = await fetch(`${this.baseUrl}?action=updateComment&id=${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commentData)
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error(`Error updating comment ${id}:`, error);
            throw error;
        }
    },

    /**
     * Deletes a comment
     * @param {string} id - Comment ID
     * @returns {Promise} - Promise that resolves to success response
     */
    async deleteComment(id) {
        try {
            const response = await fetch(`${this.baseUrl}?action=deleteComment&id=${id}`, {
                method: 'POST'
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error(`Error deleting comment ${id}:`, error);
            throw error;
        }
    },

    /**
     * Likes a post
     * @param {string} id - Post ID
     * @returns {Promise} - Promise that resolves to success response
     */
    async likePost(id) {
        try {
            console.log(`API: Liking post ${id}`);
            const url = `${this.baseUrl}?action=likePost&id=${id}`;
            console.log(`API: Request URL: ${url}`);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`API: Response status: ${response.status}`);
            const result = await this.handleResponse(response);
            console.log(`API: Response data:`, result);
            return result;
        } catch (error) {
            console.error(`Error liking post ${id}:`, error);
            throw error;
        }
    },

    /**
     * Likes a comment
     * @param {string} id - Comment ID
     * @returns {Promise} - Promise that resolves to success response
     */
    async likeComment(id) {
        try {
            const response = await fetch(`${this.baseUrl}?action=likeComment&id=${id}`, {
                method: 'POST'
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error(`Error liking comment ${id}:`, error);
            throw error;
        }
    }
};

// Make the API available globally
window.newsApi = newsApi;
console.log('API.js loaded - Campus News Portal API initialized');