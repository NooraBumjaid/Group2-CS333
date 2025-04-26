// ========== State ==========
let posts = JSON.parse(localStorage.getItem('newsPosts')) || [];
let currentPage = 1;
const postsPerPage = 3;

// ========== DOM Elements ==========
const addPostBtn = document.getElementById('add-post-btn');
const addPostForm = document.getElementById('add-post-form');
const submitPostBtn = document.getElementById('submit-post-btn');
const cancelPostBtn = document.getElementById('cancel-post-btn');
const newsCardsContainer = document.getElementById('news-cards-container');
const searchInput = document.getElementById('search-news');
const filterSelect = document.getElementById('news-filter').querySelector('select');
const sortSelect = document.getElementById('news-sort').querySelector('select');
const paginationPrevious = document.querySelector('.pagination-previous');
const paginationNext = document.querySelector('.pagination-next');
const loadingSpinner = document.getElementById('loading-spinner');

// ========== Event Listeners ==========
addPostBtn.addEventListener('click', () => {
  addPostForm.style.display = 'block';
});

cancelPostBtn.addEventListener('click', () => {
  addPostForm.style.display = 'none';
  clearForm();
});

submitPostBtn.addEventListener('click', (e) => {
  e.preventDefault();
  submitPost();
});

searchInput.addEventListener('input', () => {
  currentPage = 1;
  renderPosts();
});

filterSelect.addEventListener('change', () => {
  currentPage = 1;
  renderPosts();
});

sortSelect.addEventListener('change', () => {
  currentPage = 1;
  renderPosts();
});

paginationPrevious.addEventListener('click', (e) => {
  e.preventDefault();
  if (currentPage > 1) {
    currentPage--;
    renderPosts();
  }
});

paginationNext.addEventListener('click', (e) => {
  e.preventDefault();
  const maxPage = Math.ceil(filteredPosts().length / postsPerPage);
  if (currentPage < maxPage) {
    currentPage++;
    renderPosts();
  }
});

// ========== Functions ==========

// Submit a new post
function submitPost() {
  const title = document.getElementById('post-title').value.trim();
  const author = document.getElementById('post-author').value.trim();
  const department = document.getElementById('post-department').value;
  const header = document.getElementById('post-header').value.trim();
  const details = document.getElementById('post-details').value.trim();
  const imageInput = document.getElementById('post-image');
  const imageFile = imageInput.files[0];

  // Basic validation
  if (!title || !author || !department || !header || !details || !imageFile) {
    alert('Please fill out all fields and upload an image.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    const newPost = {
      id: Date.now(),
      title,
      author,
      department,
      header,
      details,
      image: event.target.result,
      likes: 0,
      liked: false,
      createdAt: new Date().toISOString()
    };

    posts.push(newPost);
    savePosts();
    clearForm();
    addPostForm.style.display = 'none';
    showLoading();
  };

  reader.readAsDataURL(imageFile);
}

// Show loading spinner briefly
function showLoading() {
  loadingSpinner.style.display = 'flex';
  setTimeout(() => {
    loadingSpinner.style.display = 'none';
    renderPosts();
  }, 1500);
}

// Save posts to localStorage
function savePosts() {
  localStorage.setItem('newsPosts', JSON.stringify(posts));
}

// Clear the form after submitting or cancelling
function clearForm() {
  document.getElementById('post-title').value = '';
  document.getElementById('post-author').value = '';
  document.getElementById('post-department').value = '';
  document.getElementById('post-header').value = '';
  document.getElementById('post-details').value = '';
  document.getElementById('post-image').value = '';
}

// Filter posts based on search and filter options
function filteredPosts() {
  let filtered = [...posts];

  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(post =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.author.toLowerCase().includes(searchTerm) ||
      post.department.toLowerCase().includes(searchTerm)
    );
  }

  const departmentFilter = filterSelect.value;
  if (departmentFilter) {
    filtered = filtered.filter(post => post.department === departmentFilter);
  }

  // Sorting
  const sortOption = sortSelect.value;
  if (sortOption === 'date') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortOption === 'popularity') {
    filtered.sort((a, b) => b.likes - a.likes);
  } else if (sortOption === 'az') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === 'za') {
    filtered.sort((a, b) => b.title.localeCompare(a.title));
  }

  return filtered;
}

// Render the posts to the page
function renderPosts() {
  newsCardsContainer.innerHTML = '';

  const filtered = filteredPosts();
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = filtered.slice(startIndex, endIndex);

  paginatedPosts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'column is-one-third';
    card.innerHTML = `
      <div class="card" style="height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
        <div class="card-image">
          <figure class="image is-4by3">
            <img src="${post.image}" alt="News Image" style="object-fit: cover; width: 100%; height: 200px;">
          </figure>
        </div>
        <div class="card-content">
          <div class="content">
            <h2 class="title is-5">${post.title}</h2>
            <p><strong>Author:</strong> ${post.author}</p>
            <p><strong>Department:</strong> ${post.department}</p>
            <p>${post.header}</p>
          </div>
        </div>
        <footer class="card-footer" style="margin-top: auto;">
          <a href="#" class="card-footer-item like-btn" data-id="${post.id}">
            <i class="fas fa-heart ${post.liked ? 'has-text-danger' : ''}"></i> <span>${post.likes}</span>
          </a>
          <a href="addpost.html?id=${post.id}" class="card-footer-item">View Post</a>
        </footer>
      </div>
    `;
    newsCardsContainer.appendChild(card);
  });

  updatePagination();
  setupLikeButtons();
}

// Like/unlike functionality
function setupLikeButtons() {
  const likeButtons = document.querySelectorAll('.like-btn');

  likeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const postId = Number(button.getAttribute('data-id'));
      const post = posts.find(p => p.id === postId);

      if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        savePosts();
        renderPosts();
      }
    });
  });
}

// Update pagination controls
function updatePagination() {
  const filtered = filteredPosts();
  const maxPage = Math.ceil(filtered.length / postsPerPage);

  paginationPrevious.parentElement.style.visibility = (currentPage > 1) ? 'visible' : 'hidden';
  paginationNext.parentElement.style.visibility = (currentPage < maxPage) ? 'visible' : 'hidden';
}

// Initial render
renderPosts();
