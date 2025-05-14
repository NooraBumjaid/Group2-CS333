// studyGroupFinder.js
// Dynamic Study Group Finder & Details
document.addEventListener('DOMContentLoaded', () => {
  const isDetails = new URLSearchParams(location.search).has('id');

  const DATA_URL = 'https://c33825e1-9adc-4542-b422-483cd5eb20eb-00-1v3adseq5j3mo.sisko.replit.dev/get_groups.php';
  const DETAILS_URL = 'https://c33825e1-9adc-4542-b422-483cd5eb20eb-00-1v3adseq5j3mo.sisko.replit.dev/get_group_details.php?id='; 
  const ITEMS_PER_PAGE = 2;

  let allGroups = [], filtered = [], currentPage = 1;

  let searchInput, filterSelect, sortSelect, cardsContainer, pagination, prevBtn, nextBtn, pageList, createForm;

  function setupListPage() {
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
    createGroupBox.style.display = 'none'; 

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
      createForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name    = createForm.querySelector('input[placeholder="Enter group name"]').value.trim();
        const major   = createForm.querySelector('select').value;
        const meeting = createForm.querySelector('input[placeholder^="e.g."]').value.trim();
        const count   = Number(createForm.querySelector('input[type="number"]').value);
        const desc    = createForm.querySelector('textarea[placeholder^="Describe"]').value.trim();

        const raw = document.getElementById('members-textarea').value.trim().split('\n').map(line => {
          const [n, m] = line.split('-').map(s => s.trim());
          return n && m ? { name: n, major: m } : null;
          }).filter(x => x !== null);

        const formData = {
          name,
          major,
          meeting,
          membersCount: count,
          maxMembers: 50,
          description: desc,
          members: createForm.querySelector('textarea').value
        };

        console.log('Submitting:', formData); 

        try {
          const response = await fetch('https://c33825e1-9adc-4542-b422-483cd5eb20eb-00-1v3adseq5j3mo.sisko.replit.dev/create_group.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });

          const result = await response.json();
          console.log('Server response:', result);

          if (result.status === 'success') {
            alert("Group created successfully!");
            createForm.reset();
            createGroupBox.style.display = 'none';
            window.location.reload();
          } else {
            alert(`Error: ${result.message || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Fetch error:', error);
          alert("Network error - check console");
        }
      });
    }
    render();
  }


  function isDetailsPage() {
    return new URLSearchParams(location.search).has('id');
  }

  // -- FETCH & INITIALIZE -------------------

  if (isDetails) {
    const id = new URLSearchParams(location.search).get('id');
    fetch(DETAILS_URL + id)
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(group => {
        populateDetailsPage(group);
      })
      .catch(err => {
        document.querySelector('.container').innerHTML =
          `<p class="notification is-danger">Error loading group: ${err.message}</p>`;
      });

  } else {
    // FINDER PAGE: fetch list of groups
    fetch(DATA_URL)
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => {
        allGroups = data;
        filtered  = [...allGroups];
        setupListPage();           // render the cards & pagination
      })
      .catch(err => {
        cardsContainer.innerHTML =
          `<p class="notification is-danger">Error loading groups: ${err.message}</p>`;
      });
  }



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

    fetch(`https://c33825e1-9adc-4542-b422-483cd5eb20eb-00-1v3adseq5j3mo.sisko.replit.dev/get_groups.php?search=${encodeURIComponent(q)}&major=${encodeURIComponent(major)}&sort=${sort}`)
    .then(res => res.json())
    .then(groups => {
      filtered = groups;
      currentPage = 1;
      render();
    });
  }

  /**
   * Renders details.html using the group object fetched earlier.
   * @param {Object} group  — the JSON returned by get_group_details.php
   */
  function populateDetailsPage(group) {
    const id = group.id;

    // — Info box —
    const infoBox = document.querySelector('.box');
    infoBox.querySelector('h1').textContent = group.name;
    infoBox.querySelector('h2').textContent = `📚 Major: ${group.major}`;
    const ps = infoBox.querySelectorAll('p');
    ps[0].innerHTML = `<strong>Meeting Time:</strong> ${group.meeting}`;
    const mCount = group.membersCount;
    const mMax   = group.maxMembers;
    ps[1].innerHTML = `<strong>Members:</strong> ${mCount}` + (mMax != null ? `/${mMax}` : '');
    ps[2].innerHTML = `<strong>Description:</strong> ${group.description}`;

    // — Edit / Delete buttons —
    const editBtn   = document.getElementById('edit-btn');
    const deleteBtn = infoBox.querySelector('a.button.is-danger');

    const modal = document.getElementById('edit-modal');
    editBtn.addEventListener('click', e => {
      e.preventDefault();
      /// populate the fields:
      document.getElementById('edit-group-id').value  = group.id;
      document.getElementById('edit-name').value      = group.name;
      document.getElementById('edit-major').value     = group.major;
      document.getElementById('edit-meeting').value   = group.meeting;
      document.getElementById('edit-description').value = group.description;

      // pre-fill the members textarea
      document.getElementById('edit-members').value = group.members.map(m => `${m.name}: ${m.major}`).join('\n');

      // show the modal:
      modal.classList.add('is-active');
    });

    // close handlers:
    document.getElementById('close-edit-modal').addEventListener('click', () => modal.classList.remove('is-active'));
    document.getElementById('cancel-edit').addEventListener('click', () => modal.classList.remove('is-active'));

    deleteBtn.addEventListener('click', e => {
      e.preventDefault();
      if (!confirm(`Delete "${group.name}"?`)) return;
      fetch(`https://c33825e1-9adc-4542-b422-483cd5eb20eb-00-1v3adseq5j3mo.sisko.replit.dev/delete_group.php?id=${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            window.location.href = 'SGF.html';
          }
        });
    });

    // ← UPDATE-GROUP HANDLER →
    document.getElementById('save-edit').addEventListener('click', e => {
      e.preventDefault();

      // collect basic fields
      const id          = group.id;
      const name        = document.getElementById('edit-name').value.trim();
      const major       = document.getElementById('edit-major').value;
      const meeting     = document.getElementById('edit-meeting').value.trim();
      const description = document.getElementById('edit-description').value.trim();

      // read & parse the members textarea
      const rawLines = document
        .getElementById('edit-members')
        .value
        .trim()
        .split('\n');

      const members = rawLines
        .map(line => {
          const [n, m] = line.split(/\s*:\s*/).map(s => s.trim());
          return n && m ? { name: n, major: m } : null;
        })
        .filter(x => x !== null);

      // build the payload including members
      const updated = { id, name, major, meeting, description, members };

      // send to the server
      fetch('https://c33825e1-9adc-4542-b422-483cd5eb20eb-00-1v3adseq5j3mo.sisko.replit.dev/edit_group.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => {
        if (data.status === 'success') {
          document.getElementById('edit-modal').classList.remove('is-active');
          location.reload();
        } else {
          throw new Error(data.message || 'Update failed');
        }
      })
      .catch(err => {
        alert('Error updating group: ' + err.message);
      });
    });


    // — Members list —
    const membersUl = document.querySelectorAll('.box')[1].querySelector('ul');
    membersUl.innerHTML = group.members
      .map(m => `<li><strong>${m.name}</strong>: ${m.major}</li>`)
      .join('');

    // — Comments section —
    const commentsBox = document.querySelectorAll('.box')[2];
    commentsBox.innerHTML =
      `<h2 class="title is-4">💬 Comments</h2>` +
      group.comments.map(c =>
        `<div class="comment"><strong>${c.author}:</strong> ${c.text}</div>`
      ).join('') +
      `<div class="mt-5">
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
         <button id="post-comment-btn" class="button is-primary mt-2">Post Comment</button>
       </div>`;

    // – Post-comment handler –
    const postBtn = document.getElementById('post-comment-btn');
    postBtn.addEventListener('click', e => {
      e.preventDefault();

      const author = commentsBox.querySelector('input').value.trim();
      const text   = commentsBox.querySelector('textarea').value.trim();

      if (!author || !text) {
        return alert('Please enter both your name and comment.');
      }

      fetch('https://c33825e1-9adc-4542-b422-483cd5eb20eb-00-1v3adseq5j3mo.sisko.replit.dev/post_comment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: group.id, author, text })
      })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => {
        if (data.status === 'success') {
          // locally append and re-render
          group.comments.push({ author, text });
          populateDetailsPage(group);
        } else {
          throw new Error(data.message || 'Failed to post comment');
        }
      })
      .catch(err => {
        alert('Error posting comment: ' + err.message);
      });
    });


    // — Update-group handler —
    document.getElementById('save-edit').addEventListener('click', e => {
      e.preventDefault();
      const updated = {
        id:          id,
        name:        document.getElementById('edit-name').value,
        major:       document.getElementById('edit-major').value,
        meeting:     document.getElementById('edit-meeting').value,
        description: document.getElementById('edit-description').value
      };
      fetch('https://c33825e1-9adc-4542-b422-483cd5eb20eb-00-1v3adseq5j3mo.sisko.replit.dev/edit_group.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
        .then(res => {
          if (!res.ok) throw new Error(res.statusText);
          return res.json();
        })
      .then(data => {
        if (data.status === 'success') {
          location.reload();
        }
      });
    });
  }

})

