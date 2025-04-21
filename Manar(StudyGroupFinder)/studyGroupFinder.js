// js/studyGroupFinder.js
document.addEventListener('DOMContentLoaded', () => {
    // -- CONFIGURATION --
    const DATA_URL = 'study_groups.json';
    const ITEMS_PER_PAGE = 2;
  
    // -- STATE --
    let allGroups = [];
    let filtered = [];
    let currentPage = 1;
  
    // -- ELEMENT REFERENCES --
    const searchInput = document.querySelector('input[placeholder="Search for study groups..."]');
    const [filterSelect, sortSelect] = Array.from(document.querySelectorAll('select'))
      .reduce((acc, s) => {
        if (s.options[0].text.includes('Filter')) acc[0] = s;
        else if (s.options[0].text.includes('Sort')) acc[1] = s;
        return acc;
      }, []);
    const cardsContainer = document.querySelector('.columns.is-multiline:not(.mb-4)');
    const pagination = document.querySelector('nav.pagination');
    const prevBtn = pagination.querySelector('.pagination-previous');
    const nextBtn = pagination.querySelector('.pagination-next');
    const pageList = pagination.querySelector('.pagination-list');
    const createForm = document.querySelector('form');
  
    // -- FETCH & INITIALIZE --
    fetch('study_groups.json')
      .then(r => {
        if (!r.ok) throw new Error('Network error');
        return r.json();
      })
      .then(data => {
        allGroups = data;
        filtered = [...allGroups];
        render();
      })
      .catch(err => {
        cardsContainer.innerHTML = `<p class="notification is-danger">Failed to load groups: ${err.message}</p>`;
      });
  
    // -- RENDER ENTIRE VIEW --
    function render() {
      renderCards();
      renderPagination();
    }
  
    // -- RENDER GROUP CARDS --
    function renderCards() {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);
  
      cardsContainer.innerHTML = pageItems
        .map(g => `
          <div class="column is-half">
            <div class="box">
              <h5 class="title is-5">${g.name}</h5>
              <p><strong>Major:</strong> ${g.major}</p>
              <p><strong>Meeting:</strong> ${g.meeting}</p>
              <p><strong>Members:</strong> ${g.membersCount}/${g.maxMembers}</p>
              <a href="G-details.html?id=${g.id}" class="button is-primary is-small">View Details</a>
            </div>
          </div>`)
        .join('');
    }
  
    // -- RENDER PAGINATION CONTROLS --
    function renderPagination() {
      const pageCount = Math.ceil(filtered.length / ITEMS_PER_PAGE);
      prevBtn.classList.toggle('is-disabled', currentPage === 1);
      nextBtn.classList.toggle('is-disabled', currentPage === pageCount);
  
      // build page links
      pageList.innerHTML = '';
      for (let i = 1; i <= pageCount; i++) {
        pageList.innerHTML += `
          <li>
            <a class="pagination-link ${i === currentPage ? 'is-current' : ''}" data-page="${i}">${i}</a>
          </li>`;
      }
    }
  
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
      if (currentPage * ITEMS_PER_PAGE < filtered.length) {
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
  
    // -- FILTER & SORT --
    function applyFilters() {
      const q = searchInput.value.trim().toLowerCase();
      const major = filterSelect.value;
      const sort = sortSelect.value;
  
      filtered = allGroups.filter(g => {
        return g.name.toLowerCase().includes(q)
          && (major === 'Filter by Major' || g.major === major);
      });
  
      if (sort === 'Sort A to Z') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === 'Sort Z to A') {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
      }
  
      currentPage = 1;
      render();
    }
  
    // -- DETAILS PAGE POPULATION --
    if (document.title.includes('Details')) {
      const params = new URLSearchParams(location.search);
      const id = Number(params.get('id'));
      const group = allGroups.find(g => g.id === id);
      if (!group) return; // nothing to do
  
      // populate header info
      document.querySelector('.box h1').textContent = group.name;
      document.querySelector('.box .subtitle').textContent = `📚 Major: ${group.major}`;
      const ps = document.querySelectorAll('.box p');
      ps[0].innerHTML = `<strong>Meeting Time:</strong> ${group.meeting}`;
      ps[1].innerHTML = `<strong>Members:</strong> ${group.membersCount}/${group.maxMembers}`;
      ps[2].innerHTML = `<strong>Description:</strong> ${group.description}`;
  
      // members list
      const membersList = document.querySelectorAll('.box')[1].querySelector('ul');
      membersList.innerHTML = group.members
        .map(m => `<li><strong>${m.name}</strong> — ${m.major}</li>`)
        .join('');
  
      // comments
      const commentsBox = document.querySelectorAll('.box')[2];
      commentsBox.innerHTML = `
        <h2 class="title is-4">💬 Comments</h2>
        ${group.comments.map(c => `
          <div class="comment">
            <strong>${c.author}:</strong> ${c.text}
          </div>`).join('')}
        <div class="mt-5">
          <div class="field">
            <label class="label">Your Name</label>
            <div class="control">
              <input class="input" type="text" placeholder="Enter your name">
            </div>
          </div>
          <div class="field">
            <label class="label">Your Comment</label>
            <div class="control">
              <textarea class="textarea" placeholder="Write your comment..."></textarea>
            </div>
          </div>
          <button class="button is-primary mt-2">Post Comment</button>
        </div>`;
    }
  
    // -- CREATE FORM VALIDATION & HANDLING --
    createForm && createForm.addEventListener('submit', e => {
      e.preventDefault();
      const fld = createForm.querySelector.bind(createForm);
      const name = fld('input[placeholder="Enter group name"]').value.trim();
      const major = fld('select').value;
      const meeting = fld('input[placeholder^="e.g."]').value.trim();
      const count = Number(fld('input[type="number"]').value);
      const desc = fld('textarea[placeholder^="Describe"]').value.trim();
  
      // simple validation
      if (!name || major === 'Select Major' || !meeting || isNaN(count) || count < 1 || !desc) {
        return alert('Please fill out all required fields correctly.');
      }
  
      // add new group (in-memory only)
      const newId = Math.max(...allGroups.map(g => g.id)) + 1;
      allGroups.push({
        id: newId,
        name,
        major,
        meeting,
        membersCount: count,
        maxMembers: 50,
        description: desc,
        members: [],
        comments: []
      });
  
      filtered = [...allGroups];
      currentPage = Math.ceil(filtered.length / ITEMS_PER_PAGE);
      render();
      createForm.reset();
      alert('Study group created!');
    });
  
  });
  