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

        cardDiv.addEventListener("click", () => {
            const detailsModal = document.createElement("div");
            detailsModal.classList.add("modal-overlay");
            detailsModal.innerHTML = `
                <div class="modal">
                    <h2>${card.title}</h2>
                    <img src="${card.imageUrl}" alt="${card.title}" style="width: 100%;">
                    <p><strong>Price:</strong> ${card.price} BHD</p>
                    <p><strong>Tags:</strong> ${card.tags.join(", ")}</p>
                    <div id="comments-section">
                        <h3>Comments</h3>
                        <div id="comment-list"></div>
                        <input type="text" id="new-comment" placeholder="Write a comment...">
                        <button onclick="addComment()">Post</button>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()">Close</button>
                </div>
            `;
            document.body.appendChild(detailsModal);
        });

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


    document.addEventListener("DOMContentLoaded", () => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        function updateCartCount() {
            document.getElementById("cart-count").textContent = cart.length;
        }
        updateCartCount();

        document.querySelectorAll(".buy-badge").forEach(buyBtn => {
            buyBtn.addEventListener("click", (e) => {
                const card = e.target.closest(".card");
                const title = card.querySelector(".card-title").textContent;
                const price = parseFloat(card.querySelector(".assigned-badge").textContent);
                const imageUrl = card.querySelector("img").src;

                cart.push({ title, price, imageUrl });
                localStorage.setItem("cart", JSON.stringify(cart));
                updateCartCount();
            });
        });


    });



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
        createCard(newCard);
        closeModal();
    }

    function filterCards() {
        const searchTerm = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll(".card");
        cards.forEach(card => {
            const title = card.querySelector(".card-title").textContent.toLowerCase();
            card.style.display = title.includes(searchTerm) ? "block" : "none";
        });
    }
    document.getElementById("filter-select").addEventListener("change", filterByCategory);

    function filterByCategory() {
        const selected = document.getElementById("filter-select").value.toLowerCase();
        const cards = document.querySelectorAll(".card");

        cards.forEach(card => {
            const tags = Array.from(card.querySelectorAll(".tag")).map(tag =>
                tag.textContent.toLowerCase()
            );
            const showCard = selected === "all" || tags.includes(selected);
            card.style.display = showCard ? "block" : "none";
        });
    }


    function sortCards() {
        const sortValue = document.getElementById("sort-select").value;
        let sortedCards = Array.from(document.querySelectorAll(".content-grid .card"));

        if (sortValue === "PriceHigh") {
            sortedCards.sort((a, b) => {
                const priceA = parseFloat(a.querySelector(".assigned-badge").textContent);
                const priceB = parseFloat(b.querySelector(".assigned-badge").textContent);
                return priceB - priceA; // أعلى سعر أول
            });
        } else if (sortValue === "PriceLow") {
            sortedCards.sort((a, b) => {
                const priceA = parseFloat(a.querySelector(".assigned-badge").textContent);
                const priceB = parseFloat(b.querySelector(".assigned-badge").textContent);
                return priceA - priceB; // أقل سعر أول
            });
        }

        const contentGrid = document.querySelector(".content-grid");
        contentGrid.innerHTML = "";
        sortedCards.forEach(card => contentGrid.appendChild(card));
    }

    openModalBtn.addEventListener("click", openModal);
    closeModalBtn.addEventListener("click", closeModal);
    document.querySelector(".create-card-btn").addEventListener("click", addNewCard);
    searchInput.addEventListener("input", filterCards);
    imageInput.addEventListener("change", handleImageUpload);
    document.getElementById("sort-select").addEventListener("change", sortCards);
});

function addComment() {
    const commentInput = document.getElementById("new-comment");
    const commentList = document.getElementById("comment-list");

    if (commentInput && commentInput.value.trim() !== "") {
        const newComment = document.createElement("p");
        newComment.textContent = commentInput.value.trim();
        commentList.appendChild(newComment);
        commentInput.value = "";
    }
}



function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    document.getElementById("cart-count").textContent = cartItems.length;
}




document.getElementById("cart-count").addEventListener("click", () => {
    window.location.href = "market.html";
});


document.querySelectorAll(".buy-badge").forEach(btn => {
    btn.addEventListener("click", AddToCart);
});

function AddToCart(e) {
    e.stopPropagation(); 
    const card = e.target.closest(".card");
    const title = card.querySelector(".card-title").textContent;
    const price = parseFloat(card.querySelector(".assigned-badge").textContent);
    const imageUrl = card.querySelector("img").src;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ title, price, imageUrl });
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();

   ; 
}
document.addEventListener("DOMContentLoaded", () => {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");

    let total = 0;

    cartItems.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("item");
        div.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.title}" style="width: 100px; height: 100px; margin-right: 10px; border-radius: 8px;">
            <div>
                <div class="item-title" style="font-weight:bold">${item.title}</div>
                <div>${item.price.toFixed(2)} BHD</div>
            </div>
        `;
        total += parseFloat(item.price);
        cartContainer.appendChild(div);
    });

    totalEl.textContent = "Total: " + total.toFixed(2) + " BHD";
});






