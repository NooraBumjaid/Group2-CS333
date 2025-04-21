// reviewDetails.js
document.addEventListener('DOMContentLoaded', () => {
    const loading   = document.getElementById('loading');
    const errorElem = document.getElementById('error');
    const container = document.getElementById('review-container');
  
    // 1) get id from URL ?id=java
    const params = new URLSearchParams(window.location.search);
    const id     = params.get('id');
  
    fetch('reviews.json')
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(data => {
        const review = data.find(r => r.id === id);
        if (!review) throw new Error('Review not found');
        loading.textContent = '';
        render(review);
        setupCommentForm();
      })
      .catch(err => {
        loading.textContent = '';
        errorElem.textContent = 'Could not load details.';
        console.error(err);
      });
  
    function render(r) {
      document.querySelector('h2.title').textContent = `${r.courseName} – Review Details`;
      container.innerHTML = `
        <p><strong>Department:</strong> ${r.department}</p>
        <div class="box mt-4">
          <p><strong>Rating:</strong> ${r.ratingStars} (${r.rating})</p>
          <p>"${r.reviewText}"</p>
          <p><em>- ${r.reviewer}</em></p>
        </div>
        <div id="comments-section" class="content mb-3">
          ${r.comments.map(c => `
            <p><strong>${c.commenter}:</strong> ${c.comment}</p>
            <div class="buttons mt-2">
              <button class="button is-small is-warning" onclick="return confirm('Edit?');">✏️ Edit</button>
              <button class="button is-small is-danger"  onclick="return confirm('Delete?');">🗑️ Delete</button>
            </div>
          `).join('')}
        </div>
      `;
    }
  
    function setupCommentForm() {
      const form = document.querySelector('form');
      form.addEventListener('submit', e => {
        e.preventDefault();
        const nameF = form.querySelector('input[type="text"]');
        const comF  = form.querySelector('textarea');
        if (!nameF.value.trim() || !comF.value.trim()) {
          alert('Please fill in both fields.');
          return;
        }
        const sec = document.getElementById('comments-section');
        const div = document.createElement('div');
        div.innerHTML = `
          <p><strong>${nameF.value}:</strong> ${comF.value}</p>
          <div class="buttons mt-2">
            <button class="button is-small is-warning" onclick="return confirm('Edit?');">✏️ Edit</button>
            <button class="button is-small is-danger"  onclick="return confirm('Delete?');">🗑️ Delete</button>
          </div>`;
        sec.appendChild(div);
        form.reset();
      });
    }
  });
  