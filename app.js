

<div class="g_id_signin"
     data-type="standard"
     data-shape="rectangular"
     data-theme="outline"
     data-text="signin_with"
     data-size="large"
     data-logo_alignment="left">
</div>

function handleGoogleCredentialResponse(response) {
  // response.credential - JWT токен с инфо о пользователе
  // Можно декодировать, получить email и имя
  const userObject = parseJwt(response.credential);
  console.log("Google User:", userObject);
  // Сохраняй логин как обычно
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("currentUser", userObject.email || userObject.name);
  alert("Login with Google successful!");
  window.location.href = "index.html";
}

// JWT парсер (простая функция)
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));
  return JSON.parse(jsonPayload);
}

window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;

const translations = {
    en: {
        minPrice: "Min price:",
        maxPrice: "Max price:",
        filter: "Filter",
        confirm: "Confirm",
        mustLogin: "You must log in to place a bid",
        cardRequired: "You must link a card to place a bid",
        cardLinked: "Card linked successfully!",
        bidSuccess: "Bid placed successfully!",
        login: "Login",
        logout: "Logout",
        placeBid: "Place Bid"
    },
    ru: {
        minPrice: "Минимальная цена:",
        maxPrice: "Максимальная цена:",
        filter: "Фильтр",
        confirm: "Подтвердить",
        mustLogin: "Вы должны войти, чтобы сделать ставку",
        cardRequired: "Для ставки нужно привязать карту",
        cardLinked: "Карта успешно привязана!",
        bidSuccess: "Ставка успешно сделана!",
        login: "Войти",
        logout: "Выйти",
        placeBid: "Сделать ставку"
    },
    es: {
        minPrice: "Precio mínimo:",
        maxPrice: "Precio máximo:",
        filter: "Filtrar",
        confirm: "Confirmar",
        mustLogin: "Debe iniciar sesión para ofertar",
        cardRequired: "Debe vincular una tarjeta para ofertar",
        cardLinked: "¡Tarjeta vinculada con éxito!",
        bidSuccess: "¡Oferta realizada con éxito!",
        login: "Iniciar sesión",
        logout: "Cerrar sesión",
        placeBid: "Ofertar"
    }
};

let currentLang = localStorage.getItem("lang") || "en";
let filteredProducts = null;

</script>
<div id="g_id_onload"
     data-client_id="ВАШ_GOOGLE_CLIENT_ID"
     data-login_uri="https://yourdomain.com/google-login-callback"
     data-auto_prompt="false">
</div>

// Установка языка
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        el.textContent = translations[lang][key];
    });
    renderProducts(filteredProducts);
    updateLoginButton();
}

// Загрузка товаров (заглушка)
async function loadProducts() {
    // здесь твоя логика загрузки products
}

// Рендер товаров
function renderProducts(filtered = null) {
    const list = document.getElementById("product-list");
    list.innerHTML = "";
    const productsToRender = filtered || products;
    productsToRender.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <div>
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
                <p>${product.date}</p>
            </div>
            <button onclick="placeBid(${product.id})" data-i18n="placeBid">${translations[currentLang].placeBid}</button>
        `;
        list.appendChild(card);
    });
}

// Применение фильтров
function applyFilters() {
    const min = parseFloat(document.getElementById("price-min").value) || 0;
    const max = parseFloat(document.getElementById("price-max").value) || Infinity;
    filteredProducts = products.filter(p => p.price >= min && p.price <= max);
    renderProducts(filteredProducts);
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
    showNotification(translations[currentLang].cardLinked, "#28a745");
}

// Ставка
function placeBid(productId) {
    let loggedIn = localStorage.getItem("loggedIn") === "true";
    let cardLinked = localStorage.getItem("cardLinked") === "true";

    if (!loggedIn) {
        showNotification(translations[currentLang].mustLogin, "#dc3545");
        setTimeout(() => window.location.href = "login.html", 1500);
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
    const note = document.createElement("div");
    note.className = "notification";
    note.style.background = color;
    note.textContent = message;
    document.body.appendChild(note);
    setTimeout(() => {
        note.remove();
    }, 3000);
}

// Кнопка входа/выхода
function updateLoginButton() {
    let authBtn = document.getElementById("auth-btn");
    if (!authBtn) return;

    if (localStorage.getItem("loggedIn") === "true") {
        authBtn.textContent = translations[currentLang].logout;
        authBtn.onclick = () => {
            localStorage.removeItem("loggedIn");
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        };
    } else {
        authBtn.textContent = translations[currentLang].login;
        authBtn.onclick = () => {
            window.location.href = "login.html";
        };
    }
}

// При загрузке страницы
window.onload = () => {
    loadProducts();
    setLanguage(currentLang);
};
