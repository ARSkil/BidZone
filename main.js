// Данные товаров (можно заменить загрузкой с сервера или из файла)
const productsData = [
  {
    id: 1,
    title: { en: "Electric Scooter", ru: "Электросамокат", es: "Patinete eléctrico" },
    category: { en: "Vehicles", ru: "Транспорт", es: "Vehículos" },
    price: 350,
    date: "2025-07-25",
    image: "assets/sample1.jpg"
  },
  {
    id: 2,
    title: { en: "Smartphone", ru: "Смартфон", es: "Teléfono inteligente" },
    category: { en: "Electronics", ru: "Электроника", es: "Electrónica" },
    price: 600,
    date: "2025-07-28",
    image: "assets/sample2.jpg"
  },
  {
    id: 3,
    title: { en: "Wireless Headphones", ru: "Беспроводные наушники", es: "Auriculares inalámbricos" },
    category: { en: "Electronics", ru: "Электроника", es: "Electrónica" },
    price: 120,
    date: "2025-07-20",
    image: "assets/sample3.jpg"
  },
  {
    id: 4,
    title: { en: "Gaming Laptop", ru: "Игровой ноутбук", es: "Portátil para juegos" },
    category: { en: "Computers", ru: "Компьютеры", es: "Ordenadores" },
    price: 1500,
    date: "2025-07-18",
    image: "assets/sample4.jpg"
  },
  {
    id: 5,
    title: { en: "Mountain Bike", ru: "Горный велосипед", es: "Bicicleta de montaña" },
    category: { en: "Vehicles", ru: "Транспорт", es: "Vehículos" },
    price: 800,
    date: "2025-07-22",
    image: "assets/sample5.jpg"
  },
  // ...добавь остальные товары по аналогии
];

// Мультиязычные тексты интерфейса
const translations = {
  en: {
    login: "Login",
    logout: "Logout",
    placeBid: "Place Bid",
    mustLogin: "You must log in to place a bid",
    cardRequired: "You must link a card to place a bid",
    bidSuccess: "Bid placed successfully!",
    confirm: "Confirm",
    cancel: "Cancel",
    minPrice: "Min price:",
    maxPrice: "Max price:",
    category: "Category:",
    allCategories: "All Categories",
    filter: "Filter"
  },
  ru: {
    login: "Войти",
    logout: "Выйти",
    placeBid: "Сделать ставку",
    mustLogin: "Вы должны войти, чтобы сделать ставку",
    cardRequired: "Для ставки нужно привязать карту",
    bidSuccess: "Ставка успешно сделана!",
    confirm: "Подтвердить",
    cancel: "Отмена",
    minPrice: "Минимальная цена:",
    maxPrice: "Максимальная цена:",
    category: "Категория:",
    allCategories: "Все категории",
    filter: "Фильтр"
  },
  es: {
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    placeBid: "Ofertar",
    mustLogin: "Debe iniciar sesión para ofertar",
    cardRequired: "Debe vincular una tarjeta para ofertar",
    bidSuccess: "¡Oferta realizada con éxito!",
    confirm: "Confirmar",
    cancel: "Cancelar",
    minPrice: "Precio mínimo:",
    maxPrice: "Precio máximo:",
    category: "Categoría:",
    allCategories: "Todas las categorías",
    filter: "Filtrar"
  }
};

// Текущий язык (сохраняется в localStorage)
let currentLang = localStorage.getItem("lang") || "en";

// Функция для установки языка и обновления интерфейса
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  // Переводим статичные тексты
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  // Обновляем кнопку входа/выхода
  updateLoginButton();
  // Обновляем фильтр категорий (названия)
  fillCategoryFilter();
  // Перерисовываем товары с новым языком
  applyFilters();
}

// Заполняем выпадающий список категорий из товаров (уникальные)
function fillCategoryFilter() {
  const select = document.getElementById("category-filter");
  // Сохраним выбранное
  const selected = select.value;
  // Очистка
  select.innerHTML = "";
  // Добавляем "Все категории"
  const optAll = document.createElement("option");
  optAll.value = "all";
  optAll.textContent = translations[currentLang].allCategories;
  select.appendChild(optAll);

  // Собираем уникальные категории по текущему языку
  const categoriesSet = new Set(productsData.map(p => p.category[currentLang]));
  Array.from(categoriesSet).sort().forEach(catName => {
    const opt = document.createElement("option");
    opt.value = catName;
    opt.textContent = catName;
    select.appendChild(opt);
  });

  // Восстанавливаем выбор
  if ([...select.options].some(o => o.value === selected)) {
    select.value = selected;
  } else {
    select.value = "all";
  }
}

// Рендер списка товаров с учетом фильтров
function renderProducts(products) {
  const list = document.getElementById("product-list");
  list.innerHTML = "";
  if (products.length === 0) {
    list.innerHTML = `<p style="text-align:center; padding:20px; color:#64748b;">No products found</p>`;
    return;
  }
  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title[currentLang]}" />
      <div class="product-info">
        <h3>${product.title[currentLang]}</h3>
        <p class="category">${product.category[currentLang]}</p>
        <p class="price">$${product.price}</p>
        <p class="date">${product.date}</p>
        <button data-id="${product.id}">${translations[currentLang].placeBid}</button>
      </div>
    `;
    // Ставим обработчик на кнопку
    card.querySelector("button").onclick = () => placeBid(product.id);
    list.appendChild(card);
  });
}

// Фильтрация товаров по цене и категории
function applyFilters() {
  const min = parseFloat(document.getElementById("price-min").value) || 0;
  const maxInput = document.getElementById("price-max").value;
  const max = maxInput ? parseFloat(maxInput) : Infinity;
  const category = document.getElementById("category-filter").value;

  const filtered = productsData.filter(p => {
    const priceOk = p.price >= min && p.price <= max;
    const categoryOk = category === "all" || p.category[currentLang] === category;
    return priceOk && categoryOk;
  });
  renderProducts(filtered);
}

// Обновляем кнопку входа/выхода
function updateLoginButton() {
  const authBtn = document.getElementById("auth-btn");
  const loggedIn = localStorage.getItem("loggedIn") === "true";
  if (!authBtn) return;
  if (loggedIn) {
    authBtn.textContent = translations[currentLang].logout;
    authBtn.onclick = () => {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("cardLinked");
      updateLoginButton();
      applyFilters();
      alert("Logged out");
    };
  } else {
    authBtn.textContent = translations[currentLang].login;
    authBtn.onclick = () => {
      window.location.href = "login.html"; // или открой модалку логина
    };
  }
}

// Модалка привязки карты
const cardModal = document.getElementById("card-modal");
const confirmCardBtn = document.getElementById("confirm-card-btn");
const cancelCardBtn = document.getElementById("cancel-card-btn");

// Открыть модалку
function openModal() {
  cardModal.style.display = "flex";
}

// Закрыть модалку
function closeModal() {
  cardModal.style.display = "none";
}

// Подтверждение привязки карты
confirmCardBtn.onclick = () => {
  localStorage.setItem("cardLinked", "true");
  alert(translations[currentLang].bidSuccess);
  closeModal();
};

cancelCardBtn.onclick = closeModal;

// Логика ставки
function placeBid(productId) {
  const loggedIn = localStorage.getItem("loggedIn") === "true";
  const cardLinked = localStorage.getItem("cardLinked") === "true";

  if (!loggedIn) {
    alert(translations[currentLang].mustLogin);
    setTimeout(() => window.location.href = "login.html", 1200);
    return;
  }
  if (!cardLinked) {
    openModal();
    return;
  }
  alert(translations[currentLang].bidSuccess);
  // Тут можно добавить логику для отправки ставки на сервер
}

// При изменении языка в селекте
document.getElementById("lang-select").onchange = e => setLanguage(e.target.value);

// При клике по фильтру
document.getElementById("filter-btn").onclick = () => applyFilters();

// Инициализация страницы
window.onload = () => {
  // Установим язык в селекте
  document.getElementById("lang-select").value = currentLang;
  // Установим язык в интерфейсе
  setLanguage(currentLang);
  // Заполним категории
  fillCategoryFilter();
  // Отобразим товары
  applyFilters();
  // Обновим кнопку входа/выхода
  updateLoginButton();
};
