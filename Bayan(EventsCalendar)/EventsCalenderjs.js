
const eventContainer = document.querySelector('.calendar');
const searchInput = document.querySelector('.input');
const categoryFilter = document.querySelectorAll('select')[0];
const sortBy = document.querySelectorAll('select')[1];

let events = [];
let currentPage = 1;
const eventsPerPage = 3;

function showLoading() {
    eventContainer.innerHTML += "<p>Loading events...</p>";
}

function showError() {
    eventContainer.innerHTML += "<p>Failed to load events. Please try again later.</p>";
}

async function fetchEvents() {
    showLoading();
    try {
        const response = await fetch('events.json');
        if (!response.ok) throw new Error('Network issue');
        const data = await response.json();
        events = data;
        renderEvents(events);
    } catch (error) {
        showError();
    }
}

function renderEvents(eventList) {
    document.querySelectorAll('.week').forEach(w => w.remove());

    const weekDiv = document.createElement('div');
    weekDiv.className = 'week';

    const start = (currentPage - 1) * eventsPerPage;
    const end = start + eventsPerPage;
    const paginated = eventList.slice(start, end);

    paginated.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event';
        eventDiv.innerHTML = <strong>${event.date} - ${event.title}</strong>;
        eventDiv.addEventListener('click', () => showEventDetails(event));
        weekDiv.appendChild(eventDiv);
    });

    eventContainer.appendChild(weekDiv);
}

function showEventDetails(event) {
    const modal = document.createElement('div');
    modal.className = 'modal is-active';
    modal.innerHTML = `
        <div class="modal-background"></div>
        <div class="modal-content box">
            <h3 class="title is-4">${event.title}</h3>
            <p><strong>Date:</strong> ${event.date}</p>
            <p><strong>Category:</strong> ${event.category}</p>
            <hr>
            <h4 class="subtitle is-6">Comments:</h4>
            <div class="comments"></div>
            <textarea class="textarea" placeholder="Write a comment..."></textarea>
            <button class="button is-link mt-2">Post Comment</button>
        </div>
        <button class="modal-close is-large" aria-label="close"></button>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.modal-close').onclick = () => modal.remove();
    modal.querySelector('.modal-background').onclick = () => modal.remove();
    modal.querySelector('button.button').onclick = () => {
        const text = modal.querySelector('textarea').value.trim();
        if (text !== '') {
            const p = document.createElement('p');
            p.textContent = text;
            modal.querySelector('.comments').appendChild(p);
            modal.querySelector('textarea').value = '';
        }
    };
}

searchInput.addEventListener('input', () => {
    const keyword = searchInput.value.trim().toLowerCase();
    const filtered = events.filter(e =>
        e.title.toLowerCase().includes(keyword) ||
        e.date.toLowerCase().includes(keyword)
    );
    currentPage = 1;
    renderEvents(filtered);
});

categoryFilter.addEventListener('change', () => {
    const cat = categoryFilter.value;
    const filtered = cat === "Filter by Category" ? events : events.filter(e => e.category === cat);
    currentPage = 1;
    renderEvents(filtered);
});

sortBy.addEventListener('change', () => {
    const option = sortBy.value;
    const sorted = [...events];
    if (option === 'Date') sorted.sort((a, b) => a.date.localeCompare(b.date));
    if (option === 'Name') sorted.sort((a, b) => a.title.localeCompare(b.title));
    if (option === 'Category') sorted.sort((a, b) => a.category.localeCompare(b.category));
    currentPage = 1;
    renderEvents(sorted);
});

document.querySelectorAll('.buttons .button').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.textContent === 'Previous') currentPage = Math.max(1, currentPage - 1);
        else if (btn.textContent === 'Next') currentPage++;
        else currentPage = parseInt(btn.textContent);
        renderEvents(events);
    });
});

fetchEvents();
