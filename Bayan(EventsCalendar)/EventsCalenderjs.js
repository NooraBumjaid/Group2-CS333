
const eventContainer = document.querySelector('.calendar');
const searchInput = document.querySelector('.input');
const categoryFilter = document.querySelectorAll('select')[0];
const sortBy = document.querySelectorAll('select')[1];


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
        const response = await fetch('events.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        events = data;
        renderEvents(events);
    } catch (error) {
        console.error('Fetch error:', error);
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
            alert(Detail:\n${event.title}\nCategory: ${event.category});
        });
        weeksDiv.appendChild(eventDiv);
    });

    eventContainer.appendChild(weeksDiv);
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
    currentPage = 1; // Reset to page 1
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