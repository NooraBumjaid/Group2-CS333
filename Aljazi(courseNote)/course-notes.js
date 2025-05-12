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
  fetch('https://e41faa77-0b61-42c3-9e5d-e5a955a616b5-00-3thv5js94eldr.sisko.replit.dev/db.php')
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
            <button class="button is-warning is-small edit-btn" data-id="${note.id}">✏️ Edit</button>
            <button class="button is-danger is-small delete-btn" data-id="${note.id}">🗑️ Delete</button>
          </div>
        `;
        notesContainer.appendChild(col);
      });
    }
    renderPagination();
    setupEditDeleteButtons();
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
    const form = document.getElementById('addNoteForm');
    console.log('Form selected:', form);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const courseName = form.querySelector('input[placeholder="Enter course name"]').value.trim();
      const noteTitle  = form.querySelector('input[placeholder="Enter note title"]').value.trim();
      const desc       = form.querySelector('input[placeholder="Enter note description"]').value.trim();
      const file       = fileInput.files[0];
      const dept       = form.querySelector('input[name="department"]:checked')?.value;

      // Check file size - limit to 2MB for Replit
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      if (file && file.size > MAX_FILE_SIZE) {
        alert('Your file is too large. Please keep files under 2MB due to server limitations.');
        return;
      }

      if (!courseName || !noteTitle || !desc || !file || !dept) {
        alert('Please fill all fields and upload a file.');
        return;
      }

      // Disable submit button to prevent double submission
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      const formData = new FormData();
      formData.append('action', 'add');
      formData.append('courseName', courseName);
      formData.append('noteTitle', noteTitle);
      formData.append('description', desc);
      formData.append('department', dept);
      formData.append('file', file);

      fetch('https://e41faa77-0b61-42c3-9e5d-e5a955a616b5-00-3thv5js94eldr.sisko.replit.dev/db.php', {
        method: 'POST',
        body: formData
      })
      .then(async res => {
        let data;
        try {
          data = await res.json();
        } catch (e) {
          data = { error: 'Invalid JSON or server error' };
        }
        if (!res.ok) {
          alert('Add failed: ' + (data.error || res.statusText));
          console.error('Add note error:', data.error || res.statusText);
          throw new Error(data.error || res.statusText);
        }
        return data;
      })
      .then(data => {
        if (data.success) {
          // Reset form
          form.reset();
          fileName.textContent = 'No file uploaded';
          
          // Add new note to local data
          const newNote = {
            id: data.id,
            courseName,
            noteTitle,
            description: desc,
            department: dept,
            fileUrl: data.fileUrl
          };
          notesData.unshift(newNote);
          
          // Refresh the display
          applyFilters();
          
          // Show success message
          alert('Note added successfully!');
        } else {
          alert('Failed to add note: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(err => {
        console.error('Add note error:', err);
        alert('Add note error: ' + err.message);
      })
      .finally(() => {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      });
    });
  }

  function setupEditDeleteButtons() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = function() {
        const note = notesData.find(n => String(n.id) === String(btn.dataset.id));
        openEditModal(note);
      };
    });
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = function() {
        if (!confirm('Are you sure you want to delete this note?')) return;
        fetch('https://e41faa77-0b61-42c3-9e5d-e5a955a616b5-00-3thv5js94eldr.sisko.replit.dev/db.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', id: btn.dataset.id })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Remove from local data and re-render
            notesData = notesData.filter(n => String(n.id) !== String(btn.dataset.id));
            applyFilters();
          } else {
            alert('Delete failed');
          }
        });
      };
    });
  }

  // Modal helpers
  function showModal(id) {
    document.getElementById(id).classList.add('is-active');
  }
  function hideModal(id) {
    document.getElementById(id).classList.remove('is-active');
  }
  // Open edit modal and fill fields
  function openEditModal(note) {
    document.getElementById('editNoteId').value = note.id;
    document.getElementById('editCourseName').value = note.courseName;
    document.getElementById('editNoteTitle').value = note.noteTitle;
    document.getElementById('editDescription').value = note.description;
    document.getElementById('editDepartment').value = note.department;
    document.getElementById('editFileUrl').value = note.fileUrl;
    showModal('editNoteModal');
  }
  document.getElementById('closeEditModal').onclick = () => hideModal('editNoteModal');
  document.getElementById('editNoteForm').onsubmit = function(e) {
    e.preventDefault();
    const id = document.getElementById('editNoteId').value;
    const courseName = document.getElementById('editCourseName').value;
    const noteTitle = document.getElementById('editNoteTitle').value;
    const description = document.getElementById('editDescription').value;
    const department = document.getElementById('editDepartment').value;
    const fileUrl = document.getElementById('editFileUrl').value;
    fetch('https://e41faa77-0b61-42c3-9e5d-e5a955a616b5-00-3thv5js94eldr.sisko.replit.dev/db.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'edit',
        id, courseName, noteTitle, description, department, fileUrl
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        hideModal('editNoteModal');
        // Update local data and re-render
        const idx = notesData.findIndex(n => String(n.id) === String(id));
        if (idx !== -1) {
          notesData[idx] = { id: Number(id), courseName, noteTitle, description, department, fileUrl };
          applyFilters();
        }
      } else {
        alert('Edit failed');
      }
    });
  };
});

