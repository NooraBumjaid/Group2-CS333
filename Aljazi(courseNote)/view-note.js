document.addEventListener('DOMContentLoaded', () => {
    const detailEl   = document.getElementById('noteDetail');
    const commentsEl = document.getElementById('commentsContainer');
    const form       = document.getElementById('commentForm');
  
    const params = new URLSearchParams(window.location.search);
    const id     = parseInt(params.get('id'), 10);
  
    fetch('courseNotes.json')
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => {
        const note = data.find(n => n.id === id);
        if (!note) {
          detailEl.innerHTML = '<p>Note not found.</p>';
          return;
        }
        renderDetail(note);
        renderComments(note.comments);
        setupForm(note);
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
           <a href="${n.fileUrl}" download class="button is-link is-small">Download PDF</a>
        </p>
        <br>
        <div class="buttons mt-2">
          <button class="button is-small is-warning"
                  onclick="return confirm('Edit this note?');">✏️ Edit</button>
          <button class="button is-small is-danger"
                  onclick="return confirm('Delete this note?');">🗑️ Delete</button>
        </div>
        <br>
      `;
    }
  
    function renderComments(list) {
      if (list.length === 0) {
        commentsEl.innerHTML = '<p>No comments yet.</p>';
      } else {
        commentsEl.innerHTML = list
          .map(c => `<p><strong>${c.name}:</strong> ${c.comment}</p>`)
          .join('');
      }
    }
  
    function setupForm(note) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const name    = form.querySelector('input').value.trim();
        const comment = form.querySelector('textarea').value.trim();
        if (!name || !comment) {
          alert('Please fill both fields.');
          return;
        }
        note.comments.push({ name, comment });
        renderComments(note.comments);
        form.reset();
      });
    }
  });
  