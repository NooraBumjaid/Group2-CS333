document.addEventListener('DOMContentLoaded', () => {
    const notesContainer     = document.getElementById('courseNotes');
    const searchInput        = document.getElementById('searchInput');
    const departmentFilter   = document.querySelector('#departmentFilter select');
    const sortSelect         = document.querySelector('#sortSelect select');
    const prevBtn            = document.querySelector('.pagination-previous');
    const nextBtn            = document.querySelector('.pagination-next');
    const paginationList     = document.querySelector('.pagination-list');
  
    let notesData     = [];
    let filteredNotes = [];
    let currentPage   = 1;
    const pageSize    = 2;
  
    // Show loading
    const loading = document.createElement('p');
    loading.textContent = 'Loading notes…';
    notesContainer.parentNode.insertBefore(loading, notesContainer);
  
    // Fetch JSON
    fetch('courseNotes.json')
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => {
        notesData     = data;
        filteredNotes = data;
        renderNotes();
        setupListeners();
      })
      .catch(err => {
        loading.textContent = `Failed to load notes: ${err.message}`;
      })
      .finally(() => {
        loading.remove();
      });
  
    function renderNotes() {
      notesContainer.innerHTML = '';
      const start = (currentPage - 1) * pageSize;
      const end   = start + pageSize;
      const slice = filteredNotes.slice(start, end);
  
      if (slice.length === 0) {
        notesContainer.innerHTML = '<p>No notes found.</p>';
      } else {
        slice.forEach(note => {
          const col = document.createElement('div');
          col.className = 'column is-half course-note';
          col.setAttribute('data-department', note.department);
          col.innerHTML = `
            <div class="box">
              <h5 class="title is-5">${note.courseName}</h5>
              <h6 class="title is-6">${note.noteTitle}</h6>
              <p>${note.description}</p>
              <a href="view.html?id=${note.id}" class="button is-primary is-small">👀 View</a>
            </div>
          `;
          notesContainer.appendChild(col);
        });
      }
      renderPagination();
    }
  
    function renderPagination() {
      paginationList.innerHTML = '';
      const pageCount = Math.ceil(filteredNotes.length / pageSize);
  
      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = currentPage === pageCount || pageCount === 0;
  
      for (let i = 1; i <= pageCount; i++) {
        const li = document.createElement('li');
        li.innerHTML = `<a class="pagination-link ${i === currentPage ? 'is-current' : ''}" href="#">${i}</a>`;
        li.addEventListener('click', e => {
          e.preventDefault();
          currentPage = i;
          renderNotes();
        });
        paginationList.appendChild(li);
      }
    }
  
    function applyFilters() {
      const term = searchInput.value.toLowerCase();
      const dept = departmentFilter.value;
      const sort = sortSelect.value;
  
      filteredNotes = notesData.filter(n => {
        const matchesText = 
          n.courseName.toLowerCase().includes(term) ||
          n.noteTitle.toLowerCase().includes(term) ||
          n.description.toLowerCase().includes(term);
        const matchesDept = dept ? (n.department === dept) : true;
        return matchesText && matchesDept;
      });
  
      if (sort) {
        filteredNotes.sort((a, b) =>
          sort === 'asc'
            ? a.courseName.localeCompare(b.courseName)
            : b.courseName.localeCompare(a.courseName)
        );
      }
  
      currentPage = 1;
      renderNotes();
    }
  
    function setupListeners() {
      searchInput.addEventListener('input', applyFilters);
      departmentFilter.addEventListener('change', applyFilters);
      sortSelect.addEventListener('change', applyFilters);
  
      prevBtn.addEventListener('click', e => {
        e.preventDefault();
        if (currentPage > 1) {
          currentPage--;
          renderNotes();
        }
      });
      nextBtn.addEventListener('click', e => {
        e.preventDefault();
        const pageCount = Math.ceil(filteredNotes.length / pageSize);
        if (currentPage < pageCount) {
          currentPage++;
          renderNotes();
        }
      });
  
      // File input UI
      const fileInput = document.getElementById('noteFile');
      const fileName  = document.getElementById('file-name');
      const removeBtn = document.getElementById('removeFileButton');
  
      fileInput.addEventListener('change', () => {
        fileName.textContent = fileInput.files[0]?.name || 'No file uploaded';
      });
      removeBtn.addEventListener('click', () => {
        fileInput.value = '';
        fileName.textContent = 'No file uploaded';
      });
  
      // Form submit
      const form = document.querySelector('.content form');
      form.addEventListener('submit', e => {
        e.preventDefault();
        const courseName = form.querySelector('input[placeholder="Enter course name"]').value.trim();
        const noteTitle  = form.querySelector('input[placeholder="Enter note title"]').value.trim();
        const desc       = form.querySelector('input[placeholder="Enter note description"]').value.trim();
        const file       = fileInput.files[0];
        const dept       = form.querySelector('input[name="department"]:checked')?.value;
  
        if (!courseName || !noteTitle || !desc || !file || !dept) {
          alert('Please fill all fields and upload a file.');
          return;
        }
  
        const newId   = notesData.length ? Math.max(...notesData.map(n=>n.id)) + 1 : 1;
        const blobUrl = URL.createObjectURL(file);
        const newNote = {
          id: newId,
          courseName,
          noteTitle,
          description: desc,
          department: dept,
          fileUrl: blobUrl,
          comments: []
        };
  
        notesData.push(newNote);
        applyFilters();
        form.reset();
        fileName.textContent = 'No file uploaded';
        alert('New note added!');
      });
    }
  });
  