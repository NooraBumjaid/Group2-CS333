// تعريف العناصر
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const sortSelect = document.getElementById('sort-select');
const loadingIndicator = document.getElementById('loading-indicator');
const paginationContainer = document.getElementById('pagination-container');
const activitiesContainer = document.getElementById('page1'); // مكان عرض الأنشطة

const itemsPerPage = 2; // عدد العناصر بالصفحة
let currentPage = 1; 
let activitiesData = []; 

// جلب البيانات
async function fetchData() {
  try {
    loadingIndicator.style.display = 'block'; 
    const response = await fetch('data.json'); 
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    activitiesData = await response.json();
    loadingIndicator.style.display = 'none'; 
    displayActivities();
  } catch (error) {
    loadingIndicator.style.display = 'none'; 
    console.error('Error fetching data:', error);
    alert('Error loading data. Please try again later.');
  }
}

// عرض الأنشطة
function displayActivities() {
  activitiesContainer.innerHTML = ''; 

  // تصفية البيانات حسب البحث والفئة
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = filterCategory.value;

  let filteredActivities = activitiesData.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm) ||
                          activity.description.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ترتيب البيانات
  const sortValue = sortSelect.value;
  if (sortValue === 'newest') {
    filteredActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortValue === 'oldest') {
    filteredActivities.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortValue === 'a_to_z') {
    filteredActivities.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === 'z_to_a') {
    filteredActivities.sort((a, b) => b.title.localeCompare(a.title));
  }

  // حساب الصفحات
  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (currentPage > totalPages) {
    currentPage = 1; // لو غيرت الفلتر وصارت الصفحة الحالية أكبر من المتاحة ترجع للأولى
  }

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const activitiesToShow = filteredActivities.slice(start, end);

  // عرض العناصر
  activitiesToShow.forEach(activity => {
    const activityCard = document.createElement('div');
    activityCard.classList.add('col-md-6', 'mb-4');
    activityCard.innerHTML = `
      <div class="card box">
        <div class="card-body">
          <h5 class="card-title">${activity.title}</h5>
          <p>Date: ${activity.date}</p>
          <button class="btn btn-primary" onclick="window.location.href='details.html?id=${activity.id}'">Show Details</button>
        </div>
      </div>
    `;
    activitiesContainer.appendChild(activityCard);
  });

  // تحديث الصفحات
  updatePagination(totalPages);
}

// تحديث أزرار الصفحات
function updatePagination(totalPages) {
  paginationContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.classList.add('btn', 'btn-secondary', 'm-1');
    pageButton.innerText = i;
    if (i === currentPage) {
      pageButton.classList.add('active');
    }
    pageButton.onclick = () => {
      currentPage = i;
      displayActivities();
    };
    paginationContainer.appendChild(pageButton);
  }
}

// استماع للبحث والفلاتر والترتيب
searchInput.addEventListener('input', () => {
  currentPage = 1;
  displayActivities();
});
filterCategory.addEventListener('change', () => {
  currentPage = 1;
  displayActivities();
});
sortSelect.addEventListener('change', () => {
  currentPage = 1;
  displayActivities();
});

// أول تشغيل
fetchData('data.json');





