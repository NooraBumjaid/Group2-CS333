document.addEventListener("DOMContentLoaded", function() { 
    const activityCard = document.getElementById('activity-card');
    const loadingSpinner = document.getElementById('loading-spinner');
    const commentsList = document.getElementById('comments-list');
    const commentInput = document.getElementById('comment-input');
    const addCommentBtn = document.getElementById('add-comment-btn');
    
    // Dummy Activity Data (to be replaced with actual Fetch API logic)
    const activityData = JSON.parse(localStorage.getItem('activityDetails'));


    // Dummy Comments Data
    let comments = [];

    // Show loading state
    function showLoading() {
        loadingSpinner.style.display = 'block';
        activityCard.style.display = 'none';
    }

    // Hide loading state
    function hideLoading() {
        loadingSpinner.style.display = 'none';
        activityCard.style.display = 'block';
    }

    // Fetch Activity Details (Simulated here)
    async function fetchActivityDetails() {
        showLoading();
    
        try {
            setTimeout(() => {
                if (activityData) {
                    renderActivityDetails(activityData);
                } else {
                    alert("No activity details found.");
                }
            }, 500); 
        } catch (error) {
            alert('Error loading activity details.');
        }
    }
    

    // Render Activity Details
    function renderActivityDetails(data) {
        hideLoading();

        activityCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${data.title}</h5>
                <p><strong>Date:</strong> ${data.date}</p>
                <p><strong>Description:</strong> ${data.description}</p>
            </div>
        `;
        activityCard.style.display = 'block';
    }

    // Render Comments
    function renderComments() {
        if (comments.length === 0) {
            commentsList.innerHTML = "<p>No comments yet.</p>";
        } else {
            commentsList.innerHTML = comments.map(comment => {
                return `<p>${comment}</p>`;
            }).join('');
        }
    }

    // Handle Add Comment
    addCommentBtn.addEventListener('click', function() {
        const commentText = commentInput.value.trim();

        if (commentText === "") {
            alert("Please enter a comment.");
            return;
        }

        comments.push(commentText);
        renderComments();
        commentInput.value = '';  // Clear the input
    });

    // Initial fetch and render
    fetchActivityDetails();
});

