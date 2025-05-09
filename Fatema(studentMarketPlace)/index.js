document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector(".search-input");
    const modalOverlay = document.querySelector(".modal-overlay");
    const modal = document.querySelector(".modal");
    const openModalBtn = document.getElementById("open-modal-btn");
    const closeModalBtn = document.querySelector(".close-modal-btn");

    const titleInput = document.getElementById("card-title");
    const priceInput = document.getElementById("card-price");
    const tagsInput = document.getElementById("card-tags");
    const imageInput = document.getElementById("card-image");
    const imagePreview = document.getElementById("image-preview");

    const contentGrid = document.querySelector(".content-grid");

    let cartCount = 0;
    let cardsArray = []; // مصفوفة لتخزين البطاقات

    function updateCartCount() {
        document.getElementById("cart-count").textContent = cartCount;
    }

    function AddToCart() {
        cartCount++;
        updateCartCount();
    }

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

        // تخزين البطاقة في المصفوفة
        cardsArray.push(newCard);

        // عرض البطاقة على الصفحة
        createCard(newCard); 

        //  JSON في الكونسول
        console.log(JSON.stringify(cardsArray, null, 2)); 

        closeModal(); 
    }

    openModalBtn.addEventListener("click", openModal);
    closeModalBtn.addEventListener("click", closeModal);
    document.querySelector(".create-card-btn").addEventListener("click", addNewCard);
    searchInput.addEventListener("input", filterCards);
    imageInput.addEventListener("change", handleImageUpload);
});
