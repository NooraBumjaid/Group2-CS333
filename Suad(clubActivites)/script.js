// Activity data (to be replaced later with data fetched from an API)
const activities = [
  { title: "Graphic Design Workshop", date: "10 MAR 2025", category: "workshops" },
  { title: "Web Development Course", date: "13 MAR 2025", category: "courses" },
  { title: "UI/UX Workshop", date: "15 MAR 2025", category: "workshops" },
  { title: "JavaScript Course", date: "20 MAR 2025", category: "courses" },
];

// Function to save activity details to localStorage
function viewDetails(title, date, category) {
  // Save the activity details to localStorage
  localStorage.setItem('activityTitle', title);
  localStorage.setItem('activityDate', date);
  localStorage.setItem('activityCategory', category);

  // Redirect to details page
  window.location.href = 'details.html';
}


let currentPage = 1;
const activitiesPerPage = 2;
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const filterCategory = document.getElementById("filter-category");
const paginationContainer = document.getElementById("pagination-container");

// Function to filter activities based on search, category, and sorting
function filterActivities() {
  let filteredActivities = [...activities];

  // Apply search
  const searchQuery = searchInput.value.toLowerCase();
  if (searchQuery) {
    filteredActivities = filteredActivities.filter(activity =>
      activity.title.toLowerCase().includes(searchQuery)
    );
  }

  // Apply category filter
  const selectedCategory = filterCategory.value;
  if (selectedCategory !== "all") {
    filteredActivities = filteredActivities.filter(activity =>
      activity.category === selectedCategory
    );
  }

  // Apply sorting
  if (sortSelect.value === "newest") {
    filteredActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortSelect.value === "oldest") {
    filteredActivities.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortSelect.value === "a_to_z") {
    filteredActivities.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortSelect.value === "z_to_a") {
    filteredActivities.sort((a, b) => b.title.localeCompare(a.title));
  }

  return filteredActivities;
}

// Function to display activities on the page
function displayActivities() {
  const filteredActivities = filterActivities();
  const startIndex = (currentPage - 1) * activitiesPerPage;
  const currentPageActivities = filteredActivities.slice(startIndex, startIndex + activitiesPerPage);

  // Display activities
  const activitiesContainer = document.querySelector('.content .row');
  activitiesContainer.innerHTML = '';

  currentPageActivities.forEach(activity => {
    const activityCard = document.createElement('div');
    activityCard.classList.add('col-md-6', 'mb-4');
    activityCard.innerHTML = `
      <div class="card box">
        <div class="card-body">
          <h5 class="card-title">${activity.title}</h5>
          <p>Date: ${activity.date}</p>
          <button class="btn btn-primary" onclick="window.location.href='details.html'">Show Details</button>
        </div>
      </div>
    `;
    activitiesContainer.appendChild(activityCard);
  });

  updatePagination(filteredActivities.length);
}

// Function to update pagination
function updatePagination(totalActivities) {
  const totalPages = Math.ceil(totalActivities / activitiesPerPage);
  paginationContainer.innerHTML = '';

  const paginationList = document.createElement('ul');
  paginationList.classList.add('pagination', 'justify-content-center');

  // Previous button
  const prevItem = document.createElement('li');
  prevItem.classList.add('page-item');
  if (currentPage === 1) {
    prevItem.classList.add('disabled');
  }
  prevItem.innerHTML = `<a class="page-link" href="#">Back</a>`;
  prevItem.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      displayActivities();
    }
  });
  paginationList.appendChild(prevItem);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement('li');
    pageItem.classList.add('page-item');
    if (i === currentPage) {
      pageItem.classList.add('active');
    }
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = i;
      displayActivities();
    });
    paginationList.appendChild(pageItem);
  }

  // Next button
  const nextItem = document.createElement('li');
  nextItem.classList.add('page-item');
  if (currentPage === totalPages) {
    nextItem.classList.add('disabled');
  }
  nextItem.innerHTML = `<a class="page-link" href="#">Next</a>`;
  nextItem.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      displayActivities();
    }
  });
  paginationList.appendChild(nextItem);

  paginationContainer.appendChild(paginationList);
}

// Event listeners for input changes and page load
searchInput.addEventListener('input', displayActivities);
sortSelect.addEventListener('change', displayActivities);
filterCategory.addEventListener('change', displayActivities);

// Initial page load
displayActivities();
