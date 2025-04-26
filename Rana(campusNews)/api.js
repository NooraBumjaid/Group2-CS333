/**
 * Mock News API Client
 * This simulates a real API service but works with localStorage for persistence.
 */

class NewsAPI {
    constructor() {
        this.posts = [];
        this.comments = [];
        this.currentUser = 'user1'; // Default user ID for demonstration
    }
    
    initMockData(posts, comments) {
        this.posts = posts || [];
        this.comments = comments || [];
        console.log('Mock API initialized with:', {
            posts: this.posts.length,
            comments: this.comments.length
        });
    }

    async simulateDelay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async getPosts() {
        await this.simulateDelay();
        return [...this.posts];
    }
    
    async getPost(id) {
        await this.simulateDelay();
        return this.posts.find(post => post.id === id) || null;
    }
    
    async createPost(postData) {
        await this.simulateDelay();
        
        const newPost = {
            ...postData,
            id: postData.id || `post_${Date.now()}`,
            date: postData.date || new Date().toISOString().split('T')[0],
            likes: 0,
            likedBy: []
        };
        
        this.posts.push(newPost);
        return newPost;
    }
    
    async updatePost(id, postData) {
        await this.simulateDelay();
        
        const index = this.posts.findIndex(post => post.id === id);
        if (index === -1) {
            throw new Error(`Post with ID ${id} not found`);
        }
        
        this.posts[index] = { ...this.posts[index], ...postData };
        return this.posts[index];
    }
    
    async deletePost(id) {
        await this.simulateDelay();
        
        const index = this.posts.findIndex(post => post.id === id);
        if (index === -1) {
            throw new Error(`Post with ID ${id} not found`);
        }
        
        const deletedPost = this.posts[index];
        this.posts.splice(index, 1);
        
        // Also delete all comments for this post
        this.comments = this.comments.filter(comment => comment.postId !== id);
        
        return deletedPost;
    }
    
    async getComments(postId = null) {
        await this.simulateDelay();
        
        if (postId) {
            return this.comments.filter(comment => comment.postId === postId);
        }
        return [...this.comments];
    }
    
    async createComment(commentData) {
        await this.simulateDelay();
        
        const newComment = {
            ...commentData,
            id: commentData.id || `comment_${Date.now()}`,
            timestamp: commentData.timestamp || new Date().toISOString(),
            likes: 0,
            likedBy: []
        };
        
        this.comments.push(newComment);
        return newComment;
    }
    
    async deleteComment(id) {
        await this.simulateDelay();
        
        const index = this.comments.findIndex(comment => comment.id === id);
        if (index === -1) {
            throw new Error(`Comment with ID ${id} not found`);
        }
        
        const deletedComment = this.comments[index];
        this.comments.splice(index, 1);
        
        // Also delete replies to this comment
        this.comments = this.comments.filter(comment => comment.replyTo !== id);
        
        return deletedComment;
    }
    
    async searchPosts(criteria) {
        await this.simulateDelay();
        
        let filteredPosts = [...this.posts];
        
        // Filter by search term
        if (criteria.term) {
            const searchTerm = criteria.term.toLowerCase();
            filteredPosts = filteredPosts.filter(post => 
                post.title.toLowerCase().includes(searchTerm) ||
                post.details.toLowerCase().includes(searchTerm) ||
                post.author.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filter by department
        if (criteria.department) {
            filteredPosts = filteredPosts.filter(post => 
                post.department === criteria.department
            );
        }
        
        // Sort posts
        if (criteria.sort) {
            switch (criteria.sort) {
                case 'newest':
                    filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
                    break;
                case 'oldest':
                    filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
                    break;
                case 'popular':
                    filteredPosts.sort((a, b) => b.likes - a.likes);
                    break;
                case 'az':
                    filteredPosts.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'za':
                    filteredPosts.sort((a, b) => b.title.localeCompare(a.title));
                    break;
                default:
                    // Default is newest first
                    filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
            }
        } else {
            // Default sort by date (newest first)
            filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        
        return filteredPosts;
    }
    
    async likePost(id, userId = this.currentUser) {
        await this.simulateDelay();
        
        const post = this.posts.find(p => p.id === id);
        if (!post) {
            throw new Error(`Post with ID ${id} not found`);
        }
        
        if (!post.likedBy) {
            post.likedBy = [];
        }
        
        const alreadyLiked = post.likedBy.includes(userId);
        
        if (alreadyLiked) {
            // User already liked the post, so unlike it
            post.likedBy = post.likedBy.filter(uid => uid !== userId);
            post.likes = post.likedBy.length;
            return { post, liked: false };
        } else {
            // User hasn't liked the post, so like it
            post.likedBy.push(userId);
            post.likes = post.likedBy.length;
            return { post, liked: true };
        }
    }
    
    async likeComment(id, userId = this.currentUser) {
        await this.simulateDelay();
        
        const comment = this.comments.find(c => c.id === id);
        if (!comment) {
            throw new Error(`Comment with ID ${id} not found`);
        }
        
        if (!comment.likedBy) {
            comment.likedBy = [];
        }
        
        const alreadyLiked = comment.likedBy.includes(userId);
        
        if (alreadyLiked) {
            // User already liked the comment, so unlike it
            comment.likedBy = comment.likedBy.filter(uid => uid !== userId);
            comment.likes = comment.likedBy.length;
            return { comment, liked: false };
        } else {
            // User hasn't liked the comment, so like it
            comment.likedBy.push(userId);
            comment.likes = comment.likedBy.length;
            return { comment, liked: true };
        }
    }
}

// Create a global instance with debugging
console.log('Creating window.newsApi instance...');
window.newsApi = new NewsAPI();
console.log('window.newsApi created successfully:', !!window.newsApi);

// Diagnostic check that will run on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('API.js DOMContentLoaded check: window.newsApi exists:', !!window.newsApi);
});