const eventContainer = document.querySelector('.calendar');
const searchInput = document.querySelector('.input');
const categoryFilter = document.querySelectorAll('select')[0];
const sortBy = document.querySelectorAll('select')[1];
const commentBox = document.querySelector('#comment-box');
const commentList = document.querySelector('#comment-list');

let events = [];
let currentPage = 1;
const eventsPerPage = 3;

const BASE_URL = 'https://eventsCalener.librabfa.repl.co'; // change if needed

function showLoading() {
  eventContainer.innerHTML = "<p>Loading events...</p>";
}

function showError() {
  eventContainer.innerHTML = "<p>Failed to load events. Please try again later.</p>";
}

async function fetchEvents() {
  showLoading();
  try {
    const response = await fetch(${BASE_URL}/GetEvents.php);
    const data = await response.json();
    events = data;
    renderEvents(events);
  } catch (error) {
    console.error(error);
    showError();
  }
}

function renderEvents(eventList) {
  const oldWeeks = document.querySelectorAll('.week');
  oldWeeks.forEach(week => week.remove());

  const weeksDiv = document.createElement('div');
  weeksDiv.classList.add('week');

  const start = (currentPage - 1) * eventsPerPage;
  const end = start + eventsPerPage;
  const paginatedEvents = eventList.slice(start, end);

  paginatedEvents.forEach(event => {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event';
    eventDiv.textContent = ${event.date} - ${event.title};
    eventDiv.addEventListener('click', () => {
      showEventDetails(event);
    });
    weeksDiv.appendChild(eventDiv);
  });

  eventContainer.appendChild(weeksDiv);
}

function showEventDetails(event) {
  const details = ${event.title}\nDate: ${event.date}\nCategory: ${event.category};
  alert(details);
  loadComments(event.id);

  const commentForm = document.createElement('div');
  commentForm.innerHTML = `
    <textarea id="comment-box" placeholder="Write your comment"></textarea>
    <button onclick="submitComment(${event.id})">Add Comment</button>
    <ul id="comment-list"></ul>
  `;
  document.querySelector('.calendar').appendChild(commentForm);
}

async function loadComments(eventId) {
  try {
    const response = await fetch(${BASE_URL}/GetComments.php?event_id=${eventId});
    const comments = await response.json();
    const commentList = document.querySelector('#comment-list');
    commentList.innerHTML = '';
    comments.forEach(c => {
      const li = document.createElement('li');
      li.textContent = c.content;
      commentList.appendChild(li);
    });
  } catch (err) {
    console.error('Error loading comments:', err);
  }
}

async function submitComment(eventId) {
  const commentBox = document.querySelector('#comment-box');
  const content = commentBox.value.trim();
  if (!content) return alert("Please enter a comment!");

  try {
    await fetch(${BASE_URL}/AddComments.php, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId, content })
    });
    commentBox.value = '';
    loadComments(eventId);
  } catch (err) {
    console.error('Error submitting comment:', err);
  }
}

searchInput.addEventListener('input', function () {
  const keyword = searchInput.value.trim().toLowerCase();
  if (keyword.length < 2) {
    eventContainer.innerHTML = "<p>Please type at least 2 letters to search.</p>";
    return;
  }
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(keyword) ||
    event.date.toLowerCase().includes(keyword)
  );
  currentPage = 1;
  renderEvents(filteredEvents);
});

categoryFilter.addEventListener('change', function () {
  const selected = categoryFilter.value;
  let filtered = [...events];
  if (selected !== "Filter by Category") {
    filtered = events.filter(event => event.category === selected);
  }
  currentPage = 1;
  renderEvents(filtered);
});

sortBy.addEventListener('change', function () {
  const sortOption = sortBy.value;
  let sorted = [...events];
  if (sortOption === 'Date') {
    sorted.sort((a, b) => a.date.localeCompare(b.date));
  } else if (sortOption === 'Name') {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === 'Category') {
    sorted.sort((a, b) => a.category.localeCompare(b.category));
  }
  currentPage = 1;
  renderEvents(sorted);
});

document.querySelectorAll('.buttons .button').forEach(button => {
  button.addEventListener('click', function () {
    if (this.textContent === 'Previous' && currentPage > 1) {
      currentPage--;
    } else if (this.textContent === 'Next' && (currentPage * eventsPerPage) < events.length) {
      currentPage++;
    } else if (!isNaN(this.textContent)) {
      currentPage = parseInt(this.textContent);
    }
    renderEvents(events);
  });
});

fetchEvents();
