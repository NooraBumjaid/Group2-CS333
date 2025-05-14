const eventContainer = document.querySelector('.calendar');
const searchInput = document.querySelector('.input');
const categoryFilter = document.querySelectorAll('select')[0];
const sortBy = document.querySelectorAll('select')[1];
const commentSection = document.querySelector('.comments');

let events = [];
let currentPage = 1;
const eventsPerPage = 3;

function showLoading() {
    eventContainer.innerHTML = "<p>Loading events...</p>";
}

function showError() {
    eventContainer.innerHTML = "<p>Failed to load events. Please try again later.</p>";
}

async function fetchEvents() {
    showLoading();
    try {
        const response = await fetch('http://localhost/your-php-endpoint/get-events.php');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        events = data;
        renderEvents(events);
    } catch (error) {
        showError();
    }
}

function renderEvents(eventList) {
    eventContainer.innerHTML = '';
    const start = (currentPage - 1) * eventsPerPage;
    const end = start + eventsPerPage;
    const paginatedEvents = eventList.slice(start, end);

    paginatedEvents.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event';
        eventDiv.textContent = ${event.date} - ${event.title};
        eventDiv.addEventListener('click', () => showEventDetails(event));
        eventContainer.appendChild(eventDiv);
    });
}

function showEventDetails(event) {
    const eventDetails = `
        <h2>${event.title}</h2>
        <p>Date: ${event.date}</p>
        <p>Category: ${event.category}</p>
        <p>${event.description}</p>
    `;
    commentSection.innerHTML = eventDetails;
    fetchComments(event.id);
}

async function fetchComments(eventId) {
    try {
        const response = await fetch(http://localhost/your-php-endpoint/get-comments.php?event_id=${eventId});
        if (!response.ok) {
            throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        renderComments(data);
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}

function renderComments(comments) {
    const commentList = document.createElement('ul');
    comments.forEach(comment => {
        const li = document.createElement('li');
        li.textContent = ${comment.author}: ${comment.comment};
        commentList.appendChild(li);
    });
    commentSection.appendChild(commentList);

    const commentForm = document.createElement('form');
    commentForm.innerHTML = `
        <input type="text" name="comment" placeholder="Add a comment" required />
        <button type="submit">Submit</button>
    `;
    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const comment = commentForm.comment.value;
        await addComment(comment, comments[0].event_id);
    });
    commentSection.appendChild(commentForm);
}

async function addComment(comment, eventId) {
    try {
        const response = await fetch('http://localhost/your-php-endpoint/add-comment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: event_id=${eventId}&comment=${comment}
        });
        if (!response.ok) {
            throw new Error('Failed to add comment');
        }
        fetchComments(eventId);
    } catch (error) {
        console.error('Error adding comment:', error);
    }
}

searchInput.addEventListener('input', function() {
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

categoryFilter.addEventListener('change', function() {
    const selectedCategory = categoryFilter.value;
    let filtered = [...events];

    if (selectedCategory !== "Filter by Category") {
        filtered = events.filter(event => event.category === selectedCategory);
    }

    currentPage = 1;
    renderEvents(filtered);
});

sortBy.addEventListener('change', function() {
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
    button.addEventListener('click', function() {
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
