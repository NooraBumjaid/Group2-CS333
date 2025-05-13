document.addEventListener('DOMContentLoaded', () => {
  const loadingElem = document.getElementById('loading');
  const errorElem = document.getElementById('error');
  const reviewsContainer = document.getElementById('reviews-container');
  const searchInput = document.querySelector('input[type="text"][placeholder="Search course reviews..."]');
  const tabLinks = document.querySelectorAll('.tabs ul li a');
  const paginationList = document.querySelector('.pagination-list');
  const sortSelect = document.getElementById('sortSelect');

  let allReviews = [];
  let filteredReviews = [];
  let currentPage = 1;
  const pageSize = 2; 
  let currentDepartment = 'All';
  let currentSearch = '';

  // Listen for department radio changes
  document.querySelectorAll('input[name="department"]').forEach(radio => {
    radio.addEventListener('change', function() {
      applyFilters();
    });
  });

  //  search i
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      currentSearch = searchInput.value.trim().toLowerCase();
      applyFilters();
    });
  }

  // Department filter
  tabLinks.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      tabLinks.forEach(t => t.parentElement.classList.remove('is-active'));
      this.parentElement.classList.add('is-active');
      currentDepartment = this.textContent.trim();
      applyFilters();
    });
  });

  // Fetch reviews 
  function fetchReviews() {
    loadingElem.textContent = 'Loading reviews…';
    fetch('https://c150bfca-91c9-4938-8c8b-bbb4731b4509-00-30m016fqcb5lc.sisko.replit.dev/get_reviews.php?course_id=0')
      .then(response => response.json())
      .then(data => {
        // Remove duplicate reviews by id
        const seen = new Set();
        allReviews = data.reviews.filter(r => {
          if (seen.has(r.id)) return false;
          seen.add(r.id);
          return true;
        });
        applyFilters();
        loadingElem.textContent = '';
      })
      .catch(err => {
        loadingElem.textContent = '';
        errorElem.textContent = 'Failed to load reviews: ' + err.message;
        console.error(err);
      });
  }

  // Apply department and search filters
  function applyFilters() {
    filteredReviews = allReviews.filter(r => {
      const reviewDept = (r.department || '').trim().toLowerCase();
      const deptFilter = currentDepartment.trim().toLowerCase();
      const matchesDept = (deptFilter === 'all') || (reviewDept === deptFilter);
      const matchesSearch = !currentSearch || (
        (r.courseName && r.courseName.toLowerCase().includes(currentSearch)) ||
        (r.reviewText && r.reviewText.toLowerCase().includes(currentSearch))
      );
      return matchesDept && matchesSearch;
    });

    // Sort
    const sortValue = sortSelect.value;
    if (sortValue === 'rating') {
      filteredReviews.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortValue === 'date') {
      filteredReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    currentPage = 1;
    renderReviews();
    renderPagination();
  }

  // Render reviews in two columns per row
  function renderReviews() {
    reviewsContainer.innerHTML = '';
    const start = (currentPage - 1) * pageSize;
    const pageReviews = filteredReviews.slice(start, start + pageSize);

    if (!pageReviews.length) {
      reviewsContainer.innerHTML = '<p>No reviews found.</p>';
      return;
    }

    // Render each review only once, two per row
    for (let i = 0; i < pageReviews.length; i += 2) {
      const row = document.createElement('div');
      row.className = 'columns';
      for (let j = 0; j < 2; j++) {
        const reviewIndex = i + j;
        if (reviewIndex >= pageReviews.length) break;
        const r = pageReviews[reviewIndex];
        const col = document.createElement('div');
        col.className = 'column is-half';
        col.innerHTML = `
          <div class="box review-box">
            <h5 class="title is-5">${r.courseName || ''}</h5>
            <p><strong>Department:</strong> ${r.department || ''}</p>
            <p><strong>Rating:</strong> ${r.ratingStars ? r.ratingStars : r.rating}</p>
            <p>"${r.reviewText}"</p>
            <p><em>- ${r.reviewer}</em></p>
            <a class="button is-link" href="courseDetail.html?id=${r.id}">View</a>
          </div>
        `;
        row.appendChild(col);
      }
      reviewsContainer.appendChild(row);
    }
  }

  function renderPagination() {
    const totalPages = Math.ceil(filteredReviews.length / pageSize);
    paginationList.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'pagination-link' + (i === currentPage ? ' is-current' : '');
      a.textContent = i;
      a.onclick = () => {
        currentPage = i;
        renderReviews();
        renderPagination();
      };
      li.appendChild(a);
      paginationList.appendChild(li);
    }
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
  }

  // Pagination button event listeners
  document.getElementById('prevBtn').addEventListener('click', function(e) {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderReviews();
      renderPagination();
    }
  });
  document.getElementById('nextBtn').addEventListener('click', function(e) {
    e.preventDefault();
    const totalPages = Math.ceil(filteredReviews.length / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      renderReviews();
      renderPagination();
    }
  });

  // Submit review 
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', function(event) {
      event.preventDefault();

      // Safely access the form fields
      const courseNameField = document.getElementById('courseName');
      const reviewerField = document.getElementById('reviewerName');
      const ratingField = document.getElementById('rating');
      const reviewTextField = document.getElementById('reviewText');

      // Check if the elements exist before accessing
      console.log('courseNameField:', courseNameField);
      console.log('reviewerField:', reviewerField);
      console.log('ratingField:', ratingField);
      console.log('reviewTextField:', reviewTextField);

      if (!courseNameField || !reviewerField || !ratingField || !reviewTextField) {
        alert('One or more required fields are missing.');
        return;
      }

      const courseName = courseNameField.value.trim();
      const reviewer = reviewerField.value.trim();
      const departmentRadio = reviewForm.querySelector('input[name="department"]:checked');
      const department = departmentRadio ? departmentRadio.value.trim() : '';
      const professor = document.getElementById('professor') ? document.getElementById('professor').value.trim() : '';
      const ratingText = ratingField.value;
      const ratingStars = ratingText.split(' ')[0];
      // Count the number of '★' in ratingStars for the integer rating
      const rating = (ratingStars.match(/⭐/g) || []).length;
      const reviewText = reviewTextField.value.trim();

      // Debugging the collected values
      console.log({
        courseName,
        reviewer,
        department,
        professor,
        rating,
        ratingStars,
        reviewText
      });

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
          rating,
          ratingStars,
          reviewText
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Review submitted!');
          fetchReviews(); // Reload reviews from backend
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

  sortSelect.addEventListener('change', function() {
    applyFilters(); // re-apply filters and sorting
  });

  function starsFromRating(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  fetchReviews();
});
