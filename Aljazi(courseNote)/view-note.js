document.addEventListener('DOMContentLoaded', () => {
    const detailEl   = document.getElementById('noteDetail');
    const commentsEl = document.getElementById('commentsContainer');
    const form       = document.getElementById('commentForm');
  
    const params = new URLSearchParams(window.location.search);
    const id     = parseInt(params.get('id'), 10);
  
    let noteData = null;
  
    fetch('https://e41faa77-0b61-42c3-9e5d-e5a955a616b5-00-3thv5js94eldr.sisko.replit.dev/db.php')
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => {
        const note = data.find(n => Number(n.id) === id);
        if (!note) {
          detailEl.innerHTML = '<p>Note not found.</p>';
          return;
        }
        noteData = note;
        renderDetail(note);
        loadComments();
        setupForm();
      })
      .catch(err => {
        detailEl.innerHTML = `<p>Error: ${err.message}</p>`;
      });
  
    function renderDetail(n) {
      detailEl.innerHTML = `
        <h4 class="title is-4">${n.courseName}</h4>
        <p><strong>Department:</strong> ${n.department.replace('-', ' ')}</p>
        <p><strong>Note Title:</strong> ${n.noteTitle}</p>
        <p><strong>Description:</strong> ${n.description}</p>
        <p><strong>Uploaded File:</strong>
           <a href="https://e41faa77-0b61-42c3-9e5d-e5a955a616b5-00-3thv5js94eldr.sisko.replit.dev/${n.fileUrl}" target="_blank" class="button is-link is-small">Download PDF</a>
        </p>
        <br>
        <div class="buttons mt-2">
          <button class="button is-small is-warning" id="editBtn">✏️ Edit</button>
          <button class="button is-small is-danger" id="deleteBtn">🗑️ Delete</button>
        </div>
        <br>
      `;
      setupEditDeleteButtons();
    }
  
    function loadComments() {
      fetch(`https://e41faa77-0b61-42c3-9e5d-e5a955a616b5-00-3thv5js94eldr.sisko.replit.dev/db.php?comments=1&note_id=${id}`)
        .then(res => res.json())
        .then(renderComments);
    }
  
    function renderComments(list) {
      if (!list || list.length === 0) {
        commentsEl.innerHTML = '<p>No comments yet.</p>';
      } else {
        commentsEl.innerHTML = list
          .map(c => `<p><strong>${c.name}:</strong> ${c.comment}</p>`)
          .join('');
      }
    }
  
    function setupForm() {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const name    = form.querySelector('input').value.trim();
        const comment = form.querySelector('textarea').value.trim();
        if (!name || !comment) {
          alert('Please fill both fields.');
          return;
        }
        const formData = new FormData();
        formData.append('action', 'add_comment');
        formData.append('note_id', id);
        formData.append('name', name);
        formData.append('comment', comment);

        fetch('https://e41faa77-0b61-42c3-9e5d-e5a955a616b5-00-3thv5js94eldr.sisko.replit.dev/db.php', {
          method: 'POST',
          body: formData
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            form.reset();
            loadComments();
          } else {
            alert('Failed to add comment');
          }
        });
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
          noteData = { id: Number(id), courseName, noteTitle, description, department, fileUrl };
          renderDetail(noteData);
        } else {
          alert('Edit failed');
        }
      });
    };
    function setupEditDeleteButtons() {
      document.getElementById('editBtn').onclick = function() {
        openEditModal(noteData);
      };
      document.getElementById('deleteBtn').onclick = function() {
        if (!confirm('Are you sure you want to delete this note?')) return;
        fetch('https://e41faa77-0b61-42c3-9e5d-e5a955a616b5-00-3thv5js94eldr.sisko.replit.dev/db.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', id: noteData.id })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert('Note deleted!');
            window.location.href = 'courseNote.html';
          } else {
            alert('Delete failed');
          }
        });
      };
    }
  });
  