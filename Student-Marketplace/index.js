

document.addEventListener("DOMContentLoaded", () => {
    const contentGrid = document.querySelector(".content-grid");
    const searchInput = document.querySelector(".search-input");
    const modalOverlay = document.querySelector(".modal-overlay");
    const modal = document.querySelector(".modal");
    const openModalBtn = document.getElementById("open-modal-btn");
    const closeModalBtn = document.querySelector(".close-modal-btn");
    const createCardBtn = document.querySelector(".create-card-btn");

    const titleInput = document.getElementById("card-title");
    const priceInput = document.getElementById("card-price");
    const tagsInput = document.getElementById("card-tags");
    const imageInput = document.getElementById("card-image");
    const imagePreview = document.getElementById("image-preview");

    const cardsData = [
        {
            price: "2100 BHD",
            imageUrl: "https://picsum.photos/seed/13/400/300",
            title: "Mastering UI/UX Design for Impactful Solutions",
            tags: ["UI/UX", "Not Urgent"],
            editedTime: "Edited 2h ago",
        },
        {
            price: "10 BHD",
            imageUrl: "https://picsum.photos/seed/133/400/300",
            title: "Mastering UI Design for Impactful Experiences",
            tags: ["Fundamental", "Not Urgent"],
            editedTime: "Edited 2h ago",
        },
        {
            price: "5 BHD",
            imageUrl: "https://picsum.photos/seed/132/400/300",
            title: "Where Innovation Meets Design",
            tags: ["Design", "Not Urgent"],
            editedTime: "Edited 2h ago",
        },
    ];

    function createCard(card) {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");

        cardDiv.innerHTML = `
        <div class="assigned-badge">${card.price} BHD</div>
        <div class="buy-badge">Buy</div>
        <img src="${card.imageUrl}" alt="${card.title}" class="card-image">
        <h3 class="card-title">${card.title}</h3>
        <div class="tags">
            ${card.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
        </div>
        <p class="card-info">Just Now</p>
    `;

        const buyBadge = cardDiv.querySelector('.buy-badge');
        buyBadge.addEventListener("click", AddToCart);

        contentGrid.appendChild(cardDiv);
    }

    function displayCards(cards) {
        contentGrid.innerHTML = "";
        cards.forEach(createCard);
    }

    function filterCards() {
        const searchText = searchInput.value.toLowerCase();
        const filteredCards = cardsData.filter(card =>
            card.title.toLowerCase().includes(searchText)
        );
        displayCards(filteredCards);
    }

    function openModal() {
        modalOverlay.style.display = "block";
        modal.style.display = "block";

    }

    function closeModal() {
        modalOverlay.style.display = "none";
        modal.style.display = "none";
        titleInput.value = "";
        priceInput.value = "";
        tagsInput.value = "";
        imageInput.value = "";
        imagePreview.src = "";
        imagePreview.classList.add("hidden");
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove("hidden");
            };
            reader.readAsDataURL(file);
        }
    }

    function addNewCard() {
        const title = titleInput.value.trim();
        const price = priceInput.value.trim();
        const tags = tagsInput.value.split(",").map(tag => tag.trim());
        const imageUrl = imagePreview.src;

        if (!title || !price || !imageUrl) {
            alert("Please fill in all fields and upload an image.");
            return;
        }

        const newCard = { title, price, tags, imageUrl };
        cardsData.push(newCard);
        createCard(newCard);
        closeModal();
    }

    let cartCount = 0;

    // Function to update cart count
    function updateCartCount() {
        document.getElementById("cart-count").textContent = cartCount;
    }

    // Simulated function for adding an item to the cart
    function AddToCart() {
        cartCount++;
        updateCartCount();
    }

    // Example: Add to cart when a card is created
    document.querySelector(".create-card-btn").addEventListener("click", () => {
        addToCart();
    });

    displayCards(cardsData);
    // Event Listeners
    openModalBtn.addEventListener("click", openModal);
    closeModalBtn.addEventListener("click", closeModal);
    createCardBtn.addEventListener("click", addNewCard);
    searchInput.addEventListener("input", filterCards);
    imageInput.addEventListener("change", handleImageUpload);
});
