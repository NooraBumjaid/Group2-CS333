// Wait for the DOM to be fully loaded before running any code
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded successfully!');
    
    // Initialize event listeners and functionality
    initializeNavigation();
    initializeCommentInteractions();
    initializePostInteractions();
    initializeMainPageFeatures();
    initializeAddPostFunctionality();
    initializePagination();
    initializeCommentSubmission();
});

// Function to handle navigation between pages
function initializeNavigation() {
    // Handle "Back to Main Page" buttons
    const backButtons = document.querySelectorAll('.button.custom-blue');
    if (backButtons.length > 0) {
        backButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                window.location.href = 'rana.html';
            });
        });
    }

    // Handle "View Details" buttons on the main page
    const viewDetailsButtons = document.querySelectorAll('a.button.is-info.is-small');
    if (viewDetailsButtons.length > 0) {
        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                
                // Get the post data to store in session storage
                const postCard = button.closest('.box');
                if (postCard) {
                    const title = postCard.querySelector('.title.is-6').textContent;
                    const author = postCard.querySelector('p.is-size-7 strong').textContent;
                    const date = postCard.querySelector('.is-size-7.has-text-grey').textContent.replace('Date: ', '');
                    const details = postCard.querySelector('[id^="news-details-"]').textContent;
                    const imgSrc = postCard.querySelector('img').src;
                    
                    // Store post data in session storage to use in the post page
                    sessionStorage.setItem('currentPost', JSON.stringify({
                        title: title,
                        author: author,
                        date: date,
                        details: details,
                        image: imgSrc
                    }));
                }
                
                window.location.href = 'addpost.html';
            });
        });
    }

    // Handle "Add Post Comment" button on the post page
    const addCommentBtn = document.querySelector('.button.is-primary');
    if (addCommentBtn && addCommentBtn.textContent.includes('Add Post Comment')) {
        addCommentBtn.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = 'addcomment.html';
        });
    }
}

// Function to handle comment interactions
function initializeCommentInteractions() {
    // Handle comment "Like" buttons
    const commentLikeButtons = document.querySelectorAll('.box .button.is-small.is-primary');
    if (commentLikeButtons.length > 0) {
        commentLikeButtons.forEach(button => {
            // Initialize like count for each comment
            let likeCount = 0;
            
            button.addEventListener('click', function() {
                likeCount++;
                
                // Update the button text to include the like count
                if (button.querySelector('span')) {
                    // If a span already exists for the count, update it
                    button.querySelector('span').textContent = likeCount;
                } else {
                    // Otherwise, create and append the count
                    button.innerHTML = `❤️Like <span>${likeCount}</span>`;
                }
            });
        });
    }
    
    // Handle comment "Reply" buttons
    const replyButtons = document.querySelectorAll('.box .button.is-small.is-info');
    if (replyButtons.length > 0) {
        replyButtons.forEach(button => {
            if (button.textContent.includes('Reply')) {
                button.addEventListener('click', function() {
                    // Find the author of the comment being replied to
                    const commentBox = button.closest('.box');
                    const authorElement = commentBox.querySelector('strong');
                    const parentAuthor = authorElement ? authorElement.textContent : 'Unknown';
                    
                    // Set reply info in sessionStorage
                    sessionStorage.setItem('isReply', 'true');
                    sessionStorage.setItem('parentCommentAuthor', parentAuthor);
                    
                    // Navigate to comment page
                    window.location.href = 'addcomment.html';
                });
            }
        });
    }
    
    // Handle comment "Delete" buttons
    const deleteButtons = document.querySelectorAll('.box .button.is-small.is-danger');
    if (deleteButtons.length > 0) {
        deleteButtons.forEach(button => {
            if (button.textContent.includes('Delete')) {
                button.addEventListener('click', function() {
                    // Confirm deletion
                    const confirmDelete = confirm('Are you sure you want to delete this comment?');
                    
                    if (confirmDelete) {
                        // Find the parent comment box and remove it
                        const commentBox = button.closest('.box');
                        if (commentBox) {
                            commentBox.remove();
                        }
                    }
                    // If not confirmed, do nothing
                });
            }
        });
    }
}

// Function to handle post interactions
function initializePostInteractions() {
    // Check if on post detail page and try to load post data
    if (window.location.pathname.includes('addpost.html')) {
        // Try to get post data from session storage
        const postData = JSON.parse(sessionStorage.getItem('currentPost'));
        if (postData) {
            // Update post details with the stored data
            document.querySelector('.title.is-2').textContent = postData.title;
            document.querySelector('.subtitle.is-6 strong').textContent = postData.author;
            document.querySelector('.subtitle.is-6').innerHTML = 
                document.querySelector('.subtitle.is-6').innerHTML.replace(/Date: .*?(?=<\/p>|$)/, `Date: ${postData.date}`);
            document.querySelector('.content p').textContent = postData.details;
            document.querySelector('.image img').src = postData.image;
        }
    }

    // Handle post "Like" button
    const postLikeButton = document.querySelector('.buttons.is-centered .button.is-small.is-primary');
    if (postLikeButton) {
        // Initialize like count for the post
        let postLikeCount = 0;
        
        postLikeButton.addEventListener('click', function() {
            postLikeCount++;
            
            // Update the button text to include the like count
            if (postLikeButton.querySelector('span')) {
                // If a span already exists for the count, update it
                postLikeButton.querySelector('span').textContent = postLikeCount;
            } else {
                // Otherwise, create and append the count
                postLikeButton.innerHTML = `❤️Like <span>${postLikeCount}</span>`;
            }
        });
    }
    
    // Handle post "Delete" button
    const postDeleteButton = document.querySelector('.buttons.is-centered .button.is-danger');
    if (postDeleteButton && postDeleteButton.textContent.includes('Delete Post')) {
        postDeleteButton.addEventListener('click', function() {
            // Confirm deletion
            const confirmDelete = confirm('Are you sure you want to delete this post?');
            
            if (confirmDelete) {
                // Redirect to main page after deletion
                window.location.href = 'rana.html';
            }
            // If not confirmed, do nothing
        });
    }
}

// Function to handle main page features (rana.html)
function initializeMainPageFeatures() {
    // Handle Add Post button to show form
    const addPostBtn = document.getElementById('add-post-btn');
    const addPostForm = document.getElementById('add-post-form');
    
    if (addPostBtn && addPostForm) {
        // Initially hide the form
        addPostForm.style.display = 'none';
        
        addPostBtn.addEventListener('click', function() {
            // Toggle the form visibility
            if (addPostForm.style.display === 'none') {
                addPostForm.style.display = 'block';
            } else {
                addPostForm.style.display = 'none';
            }
        });
    }
    
    // Handle search functionality
    const searchInput = document.getElementById('search-news');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const newsCards = document.querySelectorAll('.news-posts-card .column.is-one-quarter');
            
            newsCards.forEach(card => {
                const title = card.querySelector('.title.is-6').textContent.toLowerCase();
                const author = card.querySelector('p.is-size-7 strong').textContent.toLowerCase();
                const details = card.querySelector('[id^="news-details-"]').textContent.toLowerCase();
                
                // Show or hide based on search term
                if (title.includes(searchTerm) || author.includes(searchTerm) || details.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // After filtering, reapply pagination
            updatePagination();
        });
    }
    
    // Handle sorting functionality
    const sortSelect = document.querySelector('#news-sort select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortOption = this.value;
            const newsCardsContainer = document.querySelector('.news-posts-card .columns.is-multiline');
            const newsCards = Array.from(document.querySelectorAll('.news-posts-card .column.is-one-quarter'));
            
            // Clear existing cards
            while (newsCardsContainer.firstChild) {
                newsCardsContainer.removeChild(newsCardsContainer.firstChild);
            }
            
            // Sort cards based on selected option
            if (sortOption === 'sort-by-date') {
                // Sort by date
                newsCards.sort((a, b) => {
                    const dateA = new Date(a.querySelector('.is-size-7.has-text-grey').textContent.replace('Date: ', ''));
                    const dateB = new Date(b.querySelector('.is-size-7.has-text-grey').textContent.replace('Date: ', ''));
                    return dateB - dateA; // Newest first
                });
            } else if (sortOption === 'most-popular') {
                // Sort by likes (popularity)
                newsCards.sort((a, b) => {
                    const likesA = parseInt(a.querySelector('.button.is-primary.is-small span').textContent) || 0;
                    const likesB = parseInt(b.querySelector('.button.is-primary.is-small span').textContent) || 0;
                    return likesB - likesA; // Most likes first
                });
            } else if (sortOption === 'from-A-to-Z') {
                // Sort alphabetically A to Z
                newsCards.sort((a, b) => {
                    const titleA = a.querySelector('.title.is-6').textContent;
                    const titleB = b.querySelector('.title.is-6').textContent;
                    return titleA.localeCompare(titleB);
                });
            } else if (sortOption === 'from-Z-to-A') {
                // Sort alphabetically Z to A
                newsCards.sort((a, b) => {
                    const titleA = a.querySelector('.title.is-6').textContent;
                    const titleB = b.querySelector('.title.is-6').textContent;
                    return titleB.localeCompare(titleA);
                });
            }
            
            // Re-append sorted cards
            newsCards.forEach(card => {
                newsCardsContainer.appendChild(card);
            });
            
            // After sorting, reapply pagination
            updatePagination();
        });
    }
}

// Function to handle adding new posts
function initializeAddPostFunctionality() {
    if (!window.location.pathname.includes('rana.html')) return;
    
    // Get the submit button in the add post form
    const submitBtn = document.querySelector('#add-post-form .button.is-success');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Get form values
            const titleInput = document.querySelector('#add-post-form input[placeholder="Enter the title of the news"]');
            const authorInput = document.querySelector('#add-post-form input[placeholder="Enter the author\'s name"]');
            const detailsInput = document.querySelector('#add-post-form textarea');
            const fileInput = document.querySelector('#add-post-form input[type="file"]');
            
            if (titleInput && authorInput && detailsInput) {
                const title = titleInput.value;
                const author = authorInput.value;
                const details = detailsInput.value;
                
                // Validate inputs
                if (!title || !author || !details) {
                    alert('Please fill out all fields.');
                    return;
                }
                
                // Create a new post card
                const newPost = createNewPostCard(title, author, details, fileInput);
                
                // Add to the news grid
                const newsGrid = document.querySelector('.news-posts-card .columns.is-multiline');
                if (newsGrid) {
                    newsGrid.prepend(newPost); // Add to the beginning
                    
                    // Reset form
                    titleInput.value = '';
                    authorInput.value = '';
                    detailsInput.value = '';
                    if (fileInput) fileInput.value = '';
                    
                    // Hide form
                    document.getElementById('add-post-form').style.display = 'none';
                    
                    // Update pagination
                    updatePagination();
                    
                    // Show success message
                    alert('Post added successfully!');
                }
            }
        });
    }
    
    // Get the cancel button
    const cancelBtn = document.querySelector('#add-post-form .button.is-danger');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Clear form
            const titleInput = document.querySelector('#add-post-form input[placeholder="Enter the title of the news"]');
            const authorInput = document.querySelector('#add-post-form input[placeholder="Enter the author\'s name"]');
            const detailsInput = document.querySelector('#add-post-form textarea');
            const fileInput = document.querySelector('#add-post-form input[type="file"]');
            
            if (titleInput) titleInput.value = '';
            if (authorInput) authorInput.value = '';
            if (detailsInput) detailsInput.value = '';
            if (fileInput) fileInput.value = '';
            
            // Hide form
            document.getElementById('add-post-form').style.display = 'none';
        });
    }
}

// Helper function to create a new post card
function createNewPostCard(title, author, details, fileInput) {
    const today = new Date();
    const dateString = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    
    const column = document.createElement('div');
    column.className = 'column is-one-quarter';
    
    // Get image URL - use default if no file selected
    let imageUrl = 'collage.PNG'; // Default image
    if (fileInput && fileInput.files && fileInput.files[0]) {
        imageUrl = URL.createObjectURL(fileInput.files[0]);
    }
    
    // Use the structure from your existing cards
    column.innerHTML = `
      <div class="box">
        <!-- Date -->
        <p class="is-size-7 has-text-grey">Date: ${dateString}</p>

        <!-- Image -->
        <figure class="image is-4by3">
          <img src="${imageUrl}" alt="News Image" style="width: 100%; height: auto;">
        </figure>

        <!-- Title -->
        <h3 class="title is-6">${title}</h3>

        <!-- Author -->
        <p class="is-size-7"><strong>By: ${author}</strong></p>

        <!-- News Details -->
        <div id="news-details-new" class="mt-4">
          <p class="is-size-7">${details}</p>
        </div>

        <!-- Buttons -->
        <div class="buttons mt-4">
          <a href="#" class="button is-info is-small">View Details</a>
          <button class="button is-primary is-small">
            <span class="icon">
              <i class="fas fa-heart">❤️</i>
            </span>
            <span>0</span>
          </button>
        </div>
      </div>
    `;
    
    // Add event listener to the View Details button
    const viewDetailsBtn = column.querySelector('.button.is-info.is-small');
    viewDetailsBtn.addEventListener('click', function(event) {
        event.preventDefault();
        
        // Store post data in session storage
        sessionStorage.setItem('currentPost', JSON.stringify({
            title: title,
            author: author,
            date: dateString,
            details: details,
            image: imageUrl
        }));
        
        window.location.href = 'addpost.html';
    });
    
    return column;
}

// Function to handle pagination
function initializePagination() {
    if (!window.location.pathname.includes('rana.html')) return;
    
    // Get pagination elements
    const paginationLinks = document.querySelectorAll('.pagination-link');
    const prevButton = document.querySelector('.pagination-previous');
    const nextButton = document.querySelector('.pagination-next');
    
    if (paginationLinks.length > 0) {
        // Set initial page
        let currentPage = 1;
        updatePagination(currentPage);
        
        // Add click events to numbered links
        paginationLinks.forEach(link => {
            if (!link.classList.contains('pagination-previous') && !link.classList.contains('pagination-next')) {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    
                    // Update current page
                    currentPage = parseInt(this.textContent);
                    
                    // Update active link
                    paginationLinks.forEach(l => l.classList.remove('is-current'));
                    this.classList.add('is-current');
                    
                    // Update visible posts
                    updatePagination(currentPage);
                });
            }
        });
        
        // Add click events to prev/next buttons
        if (prevButton) {
            prevButton.addEventListener('click', function(event) {
                event.preventDefault();
                if (currentPage > 1) {
                    currentPage--;
                    
                    // Update active link
                    paginationLinks.forEach(l => {
                        l.classList.remove('is-current');
                        if (parseInt(l.textContent) === currentPage) {
                            l.classList.add('is-current');
                        }
                    });
                    
                    // Update visible posts
                    updatePagination(currentPage);
                }
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', function(event) {
                event.preventDefault();
                const totalPages = Math.ceil(document.querySelectorAll('.news-posts-card .column.is-one-quarter').length / 3);
                if (currentPage < totalPages) {
                    currentPage++;
                    
                    // Update active link
                    paginationLinks.forEach(l => {
                        l.classList.remove('is-current');
                        if (parseInt(l.textContent) === currentPage) {
                            l.classList.add('is-current');
                        }
                    });
                    
                    // Update visible posts
                    updatePagination(currentPage);
                }
            });
        }
    }
}

// Helper function to update pagination display
function updatePagination(page) {
    const postsPerPage = 3;
    const allPosts = document.querySelectorAll('.news-posts-card .column.is-one-quarter');
    
    // If page not specified, use the current active page
    if (!page) {
        const currentActiveLink = document.querySelector('.pagination-link.is-current');
        page = currentActiveLink ? parseInt(currentActiveLink.textContent) : 1;
    }
    
    // Calculate start and end indices
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    
    // Show/hide posts based on pagination
    allPosts.forEach((post, index) => {
        if (index >= startIndex && index < endIndex) {
            post.style.display = '';
        } else {
            post.style.display = 'none';
        }
    });
    
    // Update pagination links if needed (if pages changed due to adding posts)
    const totalPages = Math.ceil(allPosts.length / postsPerPage);
    const paginationList = document.querySelector('.pagination-list');
    
    // Only update if we need to add pages
    if (paginationList && totalPages > document.querySelectorAll('.pagination-link:not(.pagination-previous):not(.pagination-next)').length) {
        // Remove all existing page links (excluding prev/next)
        const oldLinks = document.querySelectorAll('.pagination-link:not(.pagination-previous):not(.pagination-next)');
        oldLinks.forEach(link => link.remove());
        
        // Add updated page links
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = 'pagination-link' + (i === page ? ' is-current' : '');
            a.href = '#';
            a.textContent = i;
            
            // Add event listener
            a.addEventListener('click', function(event) {
                event.preventDefault();
                
                // Update current page and active link
                const links = document.querySelectorAll('.pagination-link:not(.pagination-previous):not(.pagination-next)');
                links.forEach(l => l.classList.remove('is-current'));
                this.classList.add('is-current');
                
                // Update visible posts
                updatePagination(i);
            });
            
            li.appendChild(a);
            
            // Insert before the Next button
            const nextButton = document.querySelector('.pagination-next');
            if (nextButton && nextButton.parentNode) {
                nextButton.parentNode.before(li);
            } else {
                paginationList.appendChild(li);
            }
        }
    }
}

// Function to handle comment submission
function initializeCommentSubmission() {
    // Check if on the comment page
    if (window.location.pathname.includes('addcomment.html')) {
        // Get comment information from sessionStorage if this is a reply
        const isReply = sessionStorage.getItem('isReply') === 'true';
        const parentCommentAuthor = sessionStorage.getItem('parentCommentAuthor');
        
        // If it's a reply, show that in the form
        if (isReply && parentCommentAuthor) {
            const formTitle = document.querySelector('.title.has-text-centered');
            if (formTitle) {
                formTitle.textContent = `Reply to ${parentCommentAuthor}'s comment`;
            }
        }
        
        // Handle the comment submission
        const submitBtn = document.querySelector('.buttons.is-centered .button.is-primary');
        if (submitBtn) {
            submitBtn.addEventListener('click', function(event) {
                event.preventDefault();
                
                // Get the comment content
                const commentText = document.querySelector('textarea').value;
                
                // Get the submission type
                const submissionType = document.querySelector('input[name="submission-type"]:checked').value;
                
                // Get any photo or link
                let photoUrl = '';
                let linkUrl = '';
                
                if (submissionType === 'photo') {
                    const photoInput = document.querySelector('.photo-field input[type="file"]');
                    if (photoInput && photoInput.files.length > 0) {
                        photoUrl = URL.createObjectURL(photoInput.files[0]);
                    }
                } else if (submissionType === 'link') {
                    const linkInput = document.querySelector('.link-field input[type="url"]');
                    if (linkInput) {
                        linkUrl = linkInput.value;
                    }
                }
                
                // Validate inputs
                if (!commentText) {
                    alert('Please enter a comment.');
                    return;
                }
                
                // Create comment data object
                const commentData = {
                    author: 'Current User', // This would normally come from user login
                    text: commentText,
                    photoUrl: photoUrl,
                    linkUrl: linkUrl,
                    isReply: isReply,
                    parentAuthor: parentCommentAuthor,
                    timestamp: new Date().toISOString()
                };
                
                // Store in sessionStorage for the post page to use
                const existingComments = JSON.parse(sessionStorage.getItem('pendingComments') || '[]');
                existingComments.push(commentData);
                sessionStorage.setItem('pendingComments', JSON.stringify(existingComments));
                
                // Redirect back to the post page
                window.location.href = 'addpost.html';
            });
        }
        
        // Handle cancel button
        const cancelBtn = document.querySelector('.buttons.is-centered .button.is-danger');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function(event) {
                event.preventDefault();
                // Clear the reply flag
                sessionStorage.removeItem('isReply');
                sessionStorage.removeItem('parentCommentAuthor');
                // Redirect back to post page
                window.location.href = 'addpost.html';
            });
        }
        
        // Handle radio button changes to show/hide appropriate fields
        const radioButtons = document.querySelectorAll('input[name="submission-type"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                const photoField = document.querySelector('.photo-field');
                const linkField = document.querySelector('.link-field');
                
                if (this.value === 'photo') {
                    photoField.style.display = 'block';
                    linkField.style.display = 'none';
                } else if (this.value === 'link') {
                    photoField.style.display = 'none';
                    linkField.style.display = 'block';
                } else {
                    photoField.style.display = 'none';
                    linkField.style.display = 'none';
                }
            });
        });
    }
    
    // Check if on post page to handle displaying pending comments
    if (window.location.pathname.includes('addpost.html')) {
        // Get any pending comments
        const pendingComments = JSON.parse(sessionStorage.getItem('pendingComments') || '[]');
        if (pendingComments.length > 0) {
            // Get the comment section container
            const commentSection = document.querySelector('.box.mt-4');
            if (commentSection) {
                // Add each pending comment
                pendingComments.forEach(comment => {
                    const newComment = createCommentElement(comment);
                    
                    if (comment.isReply) {
                        // For replies, find the parent comment to insert after
                        const allComments = commentSection.querySelectorAll('.box');
                        let parentFound = false;
                        
                        for (let i = 0; i < allComments.length; i++) {
                            const authorElement = allComments[i].querySelector('strong');
                            if (authorElement && authorElement.textContent === comment.parentAuthor) {
                                // Insert after this comment with extra indent
                                newComment.classList.add('ml-5'); // Add margin for indentation
                                
                                // Add "reply to" text at the top
                                const replyIndicator = document.createElement('div');
                                replyIndicator.classList.add('has-text-info', 'is-size-7', 'mb-2');
                                replyIndicator.textContent = `↪ Reply to ${comment.parentAuthor}`;
                                newComment.querySelector('.columns.is-vcentered').before(replyIndicator);
                                
                                allComments[i].after(newComment);
                                parentFound = true;
                                break;
                            }
                        }
                        
                        // If parent not found, just add at the end
                        if (!parentFound) {
                            commentSection.appendChild(newComment);
                        }
                    } else {
                        // For regular comments, just append to the end
                        commentSection.appendChild(newComment);
                    }
                });
                
                // Clear the pending comments
                sessionStorage.removeItem('pendingComments');
            }
        }
    }
}

// Helper function to create a comment element
function createCommentElement(commentData) {
    const commentBox = document.createElement('div');
    commentBox.className = 'box mt-3';
    commentBox.style.padding = '15px';
    
    // Create the HTML structure for the comment
    let commentHtml = `
        <div class="columns is-vcentered">
          <div class="column is-narrow">
            <figure class="image is-48x48">
              <img src="woman.PNG" alt="Profile Picture" style="border-radius: 50%;">
            </figure>
          </div>
          <div class="column">
            <strong>${commentData.author}</strong>
          </div>
          <div class="column is-narrow">
            <button class="button is-small is-primary">❤️Like</button>
            <button class="button is-small is-info ml-2">Reply</button>
          </div>
        </div>

        <div class="content mt-3">
          <p>${commentData.text}</p>
    `;
    
    // Add photo if present
    if (commentData.photoUrl) {
        commentHtml += `
          <figure class="image mt-2" style="max-width: 300px;">
            <img src="${commentData.photoUrl}" alt="Uploaded Photo">
          </figure>
        `;
    }
    
    // Add link if present
    if (commentData.linkUrl) {
        commentHtml += `
          <p class="mt-2">
            <a href="${commentData.linkUrl}" target="_blank" rel="noopener noreferrer">${commentData.linkUrl}</a>
          </p>
        `;
    }
    
    // Close the content div and add the bottom buttons
    commentHtml += `
        </div>

        <div class="has-text-right">
          <button class="button is-small is-danger">Delete</button>
          <button class="button is-small is-info ml-2">Edit</button>
        </div>
    `;
    
    commentBox.innerHTML = commentHtml;
    
    // Add event listeners for the new buttons
    const likeButton = commentBox.querySelector('.button.is-small.is-primary');
    if (likeButton) {
        likeButton.addEventListener('click', function() {
            let likeCount = 0;
            if (likeButton.querySelector('span')) {
                likeCount = parseInt(likeButton.querySelector('span').textContent);
            }
            likeCount++;
            
            if (likeButton.querySelector('span')) {
                likeButton.querySelector('span').textContent = likeCount;
            } else {
                likeButton.innerHTML = `❤️Like <span>${likeCount}</span>`;
            }
        });
    }
    
    const replyButton = commentBox.querySelector('.button.is-small.is-info');
    if (replyButton) {
        replyButton.addEventListener('click', function() {
            // Find the author of this comment
            const authorElement = commentBox.querySelector('strong');
            const parentAuthor = authorElement ? authorElement.textContent : 'Unknown';
            
            // Set reply info in sessionStorage
            sessionStorage.setItem('isReply', 'true');
            sessionStorage.setItem('parentCommentAuthor', parentAuthor);
            
            // Navigate to comment page
            window.location.href = 'addcomment.html';
        });
    }
    
    const deleteButton = commentBox.querySelector('.button.is-small.is-danger');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            const confirmDelete = confirm('Are you sure you want to delete this comment?');
            if (confirmDelete) {
                commentBox.remove();
            }
        });
    }
    
    return commentBox;
}
