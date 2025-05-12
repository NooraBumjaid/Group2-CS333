// reviewDetails.js
document.addEventListener('DOMContentLoaded', () => {
    const loading   = document.getElementById('loading');
    const errorElem = document.getElementById('error');
    const container = document.getElementById('review-container');
  
    // Get id from URL ?id=...
    const params = new URLSearchParams(window.location.search);
    const id     = params.get('id');
    console.log('ID from URL:', id);
  
    // Fetch all reviews from backend, then find the one with the matching id
    function fetchReviewDetails() {
        loading.textContent = 'Loading review details…';
        fetch('https://c150bfca-91c9-4938-8c8b-bbb4731b4509-00-30m016fqcb5lc.sisko.replit.dev/get_reviews.php')
            .then(response => response.json())
            .then(data => {
                if (!data.reviews || !Array.isArray(data.reviews)) {
                    throw new Error('Invalid data from backend');
                }
                // Find the review with the matching id
                const review = data.reviews.find(r => String(r.id) === String(id));
                if (review) {
                    render(review);
                    loading.textContent = '';
                } else {
                    errorElem.textContent = 'Could not load details: Review not found.';
                    loading.textContent = '';
                }
            })
            .catch(err => {
                loading.textContent = '';
                errorElem.textContent = 'Failed to load review details: ' + err.message;
                console.error(err);
            });
    }
  
    function render(r) {
      document.querySelector('h2.title').textContent = `${r.courseName} – Review Details`;
      container.innerHTML = `
        <p><strong>Department:</strong> ${r.department}</p>
        <div class="box mt-4">
          <p><strong>Rating:</strong> ${r.ratingStars} (${r.rating})</p>
          <p id="reviewTextDisplay">"${r.reviewText}"</p>
          <p><em>- ${r.reviewer}</em></p>
          <p><strong>Date:</strong> ${new Date(r.date).toLocaleDateString()}</p>
          <div class="buttons mt-2" id="review-actions">
            <button class="button is-warning" id="editReviewBtn">✏️ Edit Review</button>
            <button class="button is-danger" id="deleteReviewBtn">🗑️ Delete Review</button>
          </div>
          <form id="editReviewForm" style="display:none; margin-top:1em;">
            <div class="field">
              <label class="label">Edit Review Text</label>
              <textarea class="textarea" id="editReviewText">${r.reviewText}</textarea>
            </div>
            <div class="field">
              <label class="label">Edit Rating</label>
              <input class="input" type="number" id="editReviewRating" min="1" max="5" value="${r.rating}" />
            </div>
            <div class="buttons">
              <button type="submit" class="button is-success">Save</button>
              <button type="button" class="button is-light" id="cancelEditBtn">Cancel</button>
            </div>
          </form>
        </div>
        <div id="comments-section" class="content mb-3"></div>
      `;
      loadComments(r.id);
      setupCommentForm(r.id);

      // Edit button
      document.getElementById('editReviewBtn').onclick = function() {
        document.getElementById('editReviewForm').style.display = '';
        document.getElementById('reviewTextDisplay').style.display = 'none';
        this.style.display = 'none';
        document.getElementById('deleteReviewBtn').style.display = 'none';
      };

      // Cancel edit
      document.getElementById('cancelEditBtn').onclick = function() {
        document.getElementById('editReviewForm').style.display = 'none';
        document.getElementById('reviewTextDisplay').style.display = '';
        document.getElementById('editReviewBtn').style.display = '';
        document.getElementById('deleteReviewBtn').style.display = '';
      };

      // Save edit
      document.getElementById('editReviewForm').onsubmit = function(e) {
        e.preventDefault();
        const newText = document.getElementById('editReviewText').value.trim();
        const newRating = parseInt(document.getElementById('editReviewRating').value, 10);
        fetch('https://c150bfca-91c9-4938-8c8b-bbb4731b4509-00-30m016fqcb5lc.sisko.replit.dev/edit_review.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: r.id,
            reviewText: newText,
            rating: newRating,
            ratingStars: '★'.repeat(newRating) + '☆'.repeat(5 - newRating)
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert('Review updated!');
            fetchReviewDetails();
          } else {
            alert('Error: ' + data.error);
          }
        });
      };

      // Delete button
      document.getElementById('deleteReviewBtn').onclick = function() {
        if (confirm('Are you sure you want to delete this review?')) {
          fetch('https://c150bfca-91c9-4938-8c8b-bbb4731b4509-00-30m016fqcb5lc.sisko.replit.dev/delete_review.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: r.id })
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              alert('Review deleted!');
              window.location.href = 'courseReview.html';
            } else {
              alert('Error: ' + data.error);
            }
          });
        }
      };
    }
  
    function setupCommentForm(reviewId) {
      const form = document.getElementById('commentForm');
      if (!form) return;
      form.onsubmit = function(e) {
        e.preventDefault();
        const nameF = form.querySelector('input[type="text"]');
        const comF  = form.querySelector('textarea');
        if (!nameF.value.trim() || !comF.value.trim()) {
          alert('Please fill in both fields.');
          return;
        }
        submitComment(reviewId, nameF.value.trim(), comF.value.trim());
        form.reset();
      };
    }
  
    // Submit review (saves to backend)
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
      reviewForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const courseName = document.getElementById('courseName').value.trim();
        const reviewer = document.getElementById('reviewerName').value.trim();
        const departmentRadio = reviewForm.querySelector('input[name="department"]:checked');
        const department = departmentRadio ? departmentRadio.parentElement.textContent.trim() : '';
        const professor = document.getElementById('professor').value.trim();
        const ratingText = document.getElementById('rating').value;
        const ratingStars = ratingText.split(' ')[0];
        const reviewText = document.getElementById('reviewText').value.trim();
  
        if (!courseName || !department || !reviewer || !ratingStars || !reviewText) {
          alert('Please fill in all required fields.');
          return;
        }
  
        fetch('https://c150bfca-91c9-4938-8c8b-bbb4731b4509-00-30m016fqcb5lc.sisko.replit.dev/add_review.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseName,
            reviewer,
            department,
            professor,
            rating: ratingStars.replace(/[^★]/g, '').length,
            ratingStars,
            reviewText
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('Review submitted!');
            fetchReviewDetails(); // Reload details from backend
            reviewForm.reset();
          } else {
            alert('Error: ' + data.error);
          }
        })
        .catch(err => {
          alert('Network or server error: ' + err);
        });
      });
    }
  
 function submitComment(reviewId, commenter, commentText) {
  fetch('https://c150bfca-91c9-4938-8c8b-bbb4731b4509-00-30m016fqcb5lc.sisko.replit.dev/add_comment.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reviewId: reviewId,
      commenter: commenter,
      comment: commentText
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      loadComments(reviewId); // Reload comments from backend
    } else {
      alert('Error: ' + data.error);
    }
  })
  .catch(err => {
    alert('Network error: ' + err.message);
  });
}
  
  function loadComments(reviewId) {
  fetch('https://c150bfca-91c9-4938-8c8b-bbb4731b4509-00-30m016fqcb5lc.sisko.replit.dev/get_comments.php?reviewId=' + reviewId)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const commentsSection = document.getElementById('comments-section');
        if (data.comments.length === 0) {
          commentsSection.innerHTML = "<p>No comments yet.</p>";
        } else {
          commentsSection.innerHTML = data.comments.map(c =>
            `<p><strong>${c.commenter}:</strong> ${c.comment}</p>`
          ).join('');
        }
      } else {
        alert('Error loading comments: ' + data.error);
      }
    })
    .catch(err => {
      alert('Network error loading comments: ' + err.message);
    });
}
  
    fetchReviewDetails();
  });  
