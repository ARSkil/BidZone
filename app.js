let currentLang = 'en';
let products = [];

// Переводы интерфейса
const translations = {
    en: {
        minPrice: "Min Price:",
        maxPrice: "Max Price:",
        dateAdded: "Date Added:",
        applyFilters: "Apply Filters",
        linkCard: "Link Your Card",
        confirm: "Confirm",
        mustLogin: "You must log in to place a bid",
        cardRequired: "You must link a card to place a bid",
        bidSuccess: "Bid placed successfully!"
    },
    ru: {
        minPrice: "Минимальная цена:",
        maxPrice: "Максимальная цена:",
        dateAdded: "Дата добавления:",
        applyFilters: "Применить фильтры",
        linkCard: "Привяжите карту",
        confirm: "Подтвердить",
        mustLogin: "Вы должны войти, чтобы сделать ставку",
        cardRequired: "Для ставки нужно привязать карту",
        bidSuccess: "Ставка успешно сделана!"
    },
    es: {
        minPrice: "Precio mínimo:",
        maxPrice: "Precio máximo:",
        dateAdded: "Fecha de agregado:",
        applyFilters: "Aplicar filtros",
        linkCard: "Vincule su tarjeta",
        confirm: "Confirmar",
        mustLogin: "Debe iniciar sesión para ofertar",
        cardRequired: "Debe vincular una tarjeta para ofertar",
        bidSuccess: "¡Oferta realizada con éxito!"
    }
};

// Устанавливаем язык
function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
        let key = el.getAttribute("data-i18n");
        el.textContent = translations[lang][key];
    });
    renderProducts();
}

// Загружаем товары
async function loadProducts() {
    try {
        const res = await fetch('data/products.json');
        products = await res.json();
        renderProducts();
    } catch (err) {
        console.error("Ошибка загрузки товаров", err);
    }
}

// Рендерим товары
function renderProducts(filtered = null) {
    const list = document.getElementById("product-list");
    list.innerHTML = "";
    let data = filtered || products;

    data.forEach(product => {
        let card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <img src="${product.image}" alt="${product.title[currentLang]}">
            <div class="info">
                <h3>${product.title[currentLang]}</h3>
                <p>$${product.price}</p>
                <p>${product.date}</p>
            </div>
            <button onclick="placeBid(${product.id})" data-i18n="placeBid">Place Bid</button>
        `;
        list.appendChild(card);
    });
}

// Фильтрация
function applyFilters() {
    const min = parseFloat(document.getElementById("price-min").value) || 0;
    const max = parseFloat(document.getElementById("price-max").value) || Infinity;
    const date = document.getElementById("date-filter").value;

    let filtered = products.filter(p => {
        let priceMatch = p.price >= min && p.price <= max;
        let dateMatch = date ? p.date >= date : true;
        return priceMatch && dateMatch;
    });

    renderProducts(filtered);
}

// Модальное окно
function openModal() {
    document.getElementById("card-modal").style.display = "block";
}

function closeModal() {
    document.getElementById("card-modal").style.display = "none";
}

function confirmCard() {
    localStorage.setItem("cardLinked", "true");
    closeModal();
    showNotification(translations[currentLang].cardRequired, "#28a745");
}

// Делать ставку
function placeBid(productId) {
    let loggedIn = localStorage.getItem("loggedIn") === "true";
    let cardLinked = localStorage.getItem("cardLinked") === "true";

    if (!loggedIn) {
        showNotification(translations[currentLang].mustLogin, "#dc3545");
        return;
    }
    if (!cardLinked) {
        openModal();
        return;
    }

    showNotification(translations[currentLang].bidSuccess, "#28a745");
}

// Уведомления
function showNotification(message, color) {
    const n = document.getElementById("notification");
    n.textContent = message;
    n.style.background = color;
    n.style.display = "block";
    setTimeout(() => {
        n.style.display = "none";
    }, 3000);
}

// При загрузке
window.onload = () => {
    loadProducts();
    setLanguage(currentLang);
};
