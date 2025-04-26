// courseReview.js
document.addEventListener('DOMContentLoaded', () => {
    const loadingElem      = document.getElementById('loading');
    const errorElem        = document.getElementById('error');
    const reviewsContainer = document.getElementById('reviews-container');
    const searchInput      = document.querySelector('input[placeholder="Search course reviews..."]');
    const sortSelect       = document.querySelector('select');
    const tabLinks         = document.querySelectorAll('.tabs ul li a');
    const prevBtn          = document.querySelector('.pagination-previous');
    const nextBtn          = document.querySelector('.pagination-next');
    const pageList         = document.querySelector('.pagination-list');
  
    let reviews     = [];
    let filtered    = [];
    let currentPage = 1;
    const pageSize  = 2;
    let currentDept = 'All';
    let currentSort = 'rating';
  
    function fetchReviews() {
      loadingElem.textContent = 'Loading reviews…';
      fetch('reviews.json')
        .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
        .then(data => {
          reviews  = data;
          filtered = [...reviews];
          loadingElem.textContent = '';
          init();
        })
        .catch(err => {
          loadingElem.textContent = '';
          errorElem.textContent   = 'Failed to load reviews.';
          console.error(err);
        });
    }
  
    function init() {
      renderTabs();
      applyFilters();
      setupEventListeners();
    }
  
    function renderTabs() {
      tabLinks.forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          tabLinks.forEach(l => l.parentElement.classList.remove('is-active'));
          link.parentElement.classList.add('is-active');
          currentDept = link.textContent.trim();
          currentPage = 1;
          applyFilters();
        });
      });
    }
  
    function setupEventListeners() {
      searchInput.addEventListener('input', () => {
        currentPage = 1;
        applyFilters();
      });
      sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        currentPage = 1;
        applyFilters();
      });
      prevBtn.addEventListener('click', e => {
        e.preventDefault();
        if (currentPage > 1) {
          currentPage--;
          renderReviews();
          renderPagination();
        }
      });
      nextBtn.addEventListener('click', e => {
        e.preventDefault();
        const totalPages = Math.ceil(filtered.length / pageSize);
        if (currentPage < totalPages) {
          currentPage++;
          renderReviews();
          renderPagination();
        }
      });
    }
  
    function applyFilters() {
      const q = searchInput.value.trim().toLowerCase();
      filtered = reviews.filter(r => {
        const dept = r.department.trim();
        const matchesDept = currentDept === 'All' || dept === currentDept;
        const haystack = [r.courseName, dept, r.reviewText, r.reviewer]
                           .join(' ').toLowerCase();
        return matchesDept && (!q || haystack.includes(q));
      });
  
      if (currentSort === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
  
      renderReviews();
      renderPagination();
    }
  
    function renderReviews() {
      reviewsContainer.innerHTML = '';
      const start = (currentPage - 1) * pageSize;
      filtered.slice(start, start + pageSize).forEach(r => {
        const col = document.createElement('div');
        col.className = 'column is-half';
        col.innerHTML = `
          <div class="box review-box">
            <div>
              <h5 class="title is-5">${r.courseName}</h5>
              <p><strong>Department:</strong> ${r.department.trim()}</p>
              <p><strong>Rating:</strong> ${r.ratingStars} (${r.rating})</p>
              ${r.professor ? `<p><strong>Preferred Professor:</strong> ${r.professor}</p>` : ''}
              <p>"${r.reviewText}"</p>
              <p><em>- ${r.reviewer}</em></p>
            </div>
            <div>
              <a href="${r.detailPage}" class="button is-link is-small mt-2">👀 View</a>
            </div>
          </div>`;
        reviewsContainer.appendChild(col);
      });
    }
  
    function renderPagination() {
      pageList.innerHTML = '';
      const totalPages = Math.ceil(filtered.length / pageSize);
  
      for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.innerHTML = `<a class="pagination-link ${i === currentPage ? 'is-current':''}" href="#">${i}</a>`;
        li.querySelector('a').addEventListener('click', e => {
          e.preventDefault();
          currentPage = i;
          renderReviews();
          renderPagination();
        });
        pageList.appendChild(li);
      }
  
      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = currentPage === totalPages;
    }
  
    fetchReviews();
  });
  