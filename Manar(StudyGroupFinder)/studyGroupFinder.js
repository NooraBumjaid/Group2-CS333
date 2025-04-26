// studyGroupFinder.js
// Dynamic Study Group Finder & Details
document.addEventListener('DOMContentLoaded', () => {
  const isDetails = new URLSearchParams(location.search).has('id');

  const DATA_URL = 'study_groups.json';
  const ITEMS_PER_PAGE = 2;
  
  let allGroups = [], filtered = [], currentPage = 1;

  let searchInput, filterSelect, sortSelect, cardsContainer, pagination, prevBtn, nextBtn, pageList, createForm;
  
  // -- ELEMENT REFERENCES --
  if (!isDetails) {
    searchInput = document.querySelector('input[placeholder="Search for study groups..."]');
    const selects = Array.from(document.querySelectorAll('select'));
    filterSelect = selects.find(s => s.options[0].text.includes('Filter'));
    sortSelect = selects.find(s => s.options[0].text.includes('Sort'));
    cardsContainer = document.getElementById('cards-container');
    pagination = document.querySelector('nav.pagination');
    prevBtn = pagination.querySelector('.pagination-previous');
    nextBtn = pagination.querySelector('.pagination-next');
    pageList = pagination.querySelector('.pagination-list');
    createForm = document.querySelector('form');

    const showFormBtn    = document.getElementById('show-create-form');
    const createGroupBox = document.getElementById('create-group-container');
    createGroupBox.style.display = 'none';  // hide initially
  
    showFormBtn.addEventListener('click', e => {
      e.preventDefault();
      createGroupBox.style.display =
        createGroupBox.style.display === 'none' ? 'block' : 'none';
    });

    const cancelBtn = document.getElementById('cancel-create-form');
    cancelBtn.addEventListener('click', e => {
      e.preventDefault();
      createForm.reset();
      createGroupBox.style.display = 'none';
    });

    // -- EVENT LISTENERS --
    searchInput.addEventListener('input', applyFilters);
    filterSelect.addEventListener('change', applyFilters);
    sortSelect.addEventListener('change', applyFilters);
    
    prevBtn.addEventListener('click', e => {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        render();
      }
    });

    nextBtn.addEventListener('click', e => {
      e.preventDefault();
      if (currentPage < Math.ceil(filtered.length / ITEMS_PER_PAGE)) {
        currentPage++;
        render();
      }
    });

    pageList.addEventListener('click', e => {
      if (e.target.matches('.pagination-link')) {
        currentPage = Number(e.target.dataset.page);
        render();
      }
    });

    if (createForm) {
      createForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = createForm.querySelector('input[placeholder="Enter group name"]').value.trim();
        const major = createForm.querySelector('select').value;
        const meeting = createForm.querySelector('input[placeholder^="e.g."]').value.trim();
        const count = Number(createForm.querySelector('input[type="number"]').value);
        const desc = createForm.querySelector('textarea[placeholder^="Describe"]').value.trim();
        if (!name || major === 'Select Major' || !meeting || isNaN(count) || count < 1 || !desc) {
          return alert('Please fill out all required fields correctly.');
        }
        const newId = Math.max(...allGroups.map(g => g.id)) + 1;
        allGroups.push({ id: newId, name, major, meeting, membersCount: count, maxMembers: 50, description: desc, members: [], comments: [] });
        filtered = [...allGroups];
        currentPage = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        render();
        createForm.reset();
        createGroupBox.style.display = 'none';
        alert('Study group created!');
      });
    }
    // Initial render for the finder page
    render();
  }

  // Check if on details page
  function isDetailsPage() {
    return new URLSearchParams(location.search).has('id');
  }
  
  // -- FETCH & INITIALIZE --
  fetch(DATA_URL)
    .then(res => {
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    })
    .then(data => {
      allGroups = data;
      filtered = [...allGroups];
      if (isDetailsPage()) {
        populateDetailsPage();
      } else {
        render();
      }
    })
    .catch(err => {
      const container = isDetailsPage()? document.querySelector('.container') : cardsContainer;
      container.innerHTML = `<p class="notification is-danger">Error: ${err.message}</p>`;
    });

  
  // -- RENDER LIST & PAGINATION --
  function render() {
    renderCards();
    renderPagination();
  }
  
  // -- RENDER GROUP CARDS --
  function renderCards() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);
  
    cardsContainer.innerHTML = pageItems.map(g => `
        <div class="column is-half">
          <div class="box">
            <h5 class="title is-5">${g.name}</h5>
            <p><strong>Major:</strong> ${g.major}</p>
            <p><strong>Meeting:</strong> ${g.meeting}</p>
            <p><strong>Members:</strong> ${g.membersCount}/${g.maxMembers}</p>
            <a href="details.html?id=${g.id}" class="button is-primary is-small">View Details</a>
          </div>
        </div>`).join('');
  }
  
  // -- RENDER PAGINATION CONTROLS --
  function renderPagination() {
    const pageCount = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    prevBtn.classList.toggle('is-disabled', currentPage === 1);
    nextBtn.classList.toggle('is-disabled', currentPage === pageCount);
    pageList.innerHTML = Array.from({ length: pageCount }, (_, i) => `
      <li><a class="pagination-link ${i + 1 === currentPage ? 'is-current' : ''}" data-page="${i + 1}">${i + 1}</a></li>`).join('');
  }
  
  // -- FILTER & SORT --
  function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    const major = filterSelect.value;
    const sort = sortSelect.value;
  
    filtered = allGroups.filter(g => {
      return g.name.toLowerCase().includes(q) && (major === 'Filter by Major' || g.major === major);
    });
  
    if (sort === 'Sort A to Z') {
      filtered.sort((a, b) => a.name.localeCompare(b.name)); } 
    else if (sort === 'Sort Z to A') {
      filtered.sort((a, b) => b.name.localeCompare(a.name)); }
  
    currentPage = 1;
    render();
  }
  
  // Populate details page
  function populateDetailsPage() {
    const params = new URLSearchParams(location.search);
    const id = Number(params.get('id'));
    const group = allGroups.find(g => g.id === id);
    if (!group) {
      document.querySelector('.container').innerHTML = '<p class="notification is-warning">Group not found.</p>';
      return;
    }
    // Info box
    const infoBox = document.querySelector('.box');
    infoBox.querySelector('h1').textContent = group.name;
    infoBox.querySelector('h2').textContent = `📚 Major: ${group.major}`;
    const ps = infoBox.querySelectorAll('p');
    ps[0].innerHTML = `<strong>Meeting Time:</strong> ${group.meeting}`;
    ps[1].innerHTML = `<strong>Members:</strong> ${group.membersCount}/${group.maxMembers}`;
    ps[2].innerHTML = `<strong>Description:</strong> ${group.description}`;

    const editBtn   = infoBox.querySelector('a.button.is-warning');
    const deleteBtn = infoBox.querySelector('a.button.is-danger');

    editBtn.addEventListener('click', e => {
      e.preventDefault();
      alert(`Are you sure you want to edit "${group.name}" ?`);
    });

    deleteBtn.addEventListener('click', e => {
      e.preventDefault();
      alert(`Are you sure you want to delete "${group.name}" ?`);
    });

    // Members Box
    const membersUl = document.querySelectorAll('.box')[1].querySelector('ul');
    membersUl.innerHTML = group.members.map(m => `<li><strong>${m.name}</strong> — ${m.major}</li>`).join('');
    // Comments Box
    const commentsBox = document.querySelectorAll('.box')[2];
    commentsBox.innerHTML = `<h2 class="title is-4">💬 Comments</h2>` +
      group.comments.map(c => `<div class="comment"><strong>${c.author}:</strong> ${c.text}</div>`).join('') +
      `<div class="mt-5">
         <div class="field"><label class="label">Your Name</label><div class="control"><input class="input" type="text" placeholder="Enter your name"></div></div>
         <div class="field"><label class="label">Your Comment</label><div class="control"><textarea class="textarea" placeholder="Write your comment..."></textarea></div></div>
         <button class="button is-primary mt-2">Post Comment</button>
       </div>`;

    const postBtn = commentsBox.querySelector('button');
    const nameInput = commentsBox.querySelector('input[placeholder="Enter your name"]');
    const textInput = commentsBox.querySelector('textarea[placeholder="Write your comment..."]');
    
    postBtn.addEventListener('click', e => {
      e.preventDefault();
      const author = nameInput.value.trim();
      const text   = textInput.value.trim();
      if (!author || !text) {
        return alert('Please enter both your name and comment.');
      }
      // 1) add to in-memory array
      group.comments.push({ author, text });
      // 2) re-render this box (will include the new comment)
      populateDetailsPage();
    });
  }
});

  