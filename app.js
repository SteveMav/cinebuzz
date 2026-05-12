const CINEBUZZ_MOVIES = [
  {
    id: "michael",
    title: "Michael",
    genre: "Biopic musical / Drame",
    duration: "2h 32",
    rating: "Tous publics",
    poster: "assets/poster-michael.jpg",
    tags: ["now", "event"],
    cinema: "CineBuzz - UTEX",
    version: "VOSTFR",
    next: "18:20",
    synopsis: "Le parcours musical et humain de Michael Jackson, entre scene, famille, ambition et heritage pop mondial."
  },
  {
    id: "devil-prada-2",
    title: "Le Diable s'habille en Prada 2",
    genre: "Comedie dramatique",
    duration: "1h 58",
    rating: "Tous publics",
    poster: "assets/poster-devil-prada-2.jpg",
    tags: ["now"],
    cinema: "Premier Shopping Mall",
    version: "VF",
    next: "19:10",
    synopsis: "La mode, les medias et les ambitions se croisent a nouveau dans une suite elegante, mordante et tres attendue."
  },
  {
    id: "mortal-kombat-2",
    title: "Mortal Kombat II",
    genre: "Action / Arts martiaux",
    duration: "2h 05",
    rating: "12+",
    poster: "assets/poster-mortal-kombat-2.jpg",
    tags: ["now", "event"],
    cinema: "CineBuzz - UTEX",
    version: "3D VF",
    next: "20:30",
    synopsis: "Les combattants entrent dans une nouvelle arene, avec des combats plus massifs et un spectacle pense pour grand ecran."
  },
  {
    id: "super-mario-galaxy",
    title: "The Super Mario Galaxy Movie",
    genre: "Animation / Aventure",
    duration: "1h 42",
    rating: "Famille",
    poster: "assets/poster-super-mario-galaxy.webp",
    tags: ["now", "family"],
    cinema: "Premier Shopping Mall",
    version: "VF",
    next: "15:45",
    synopsis: "Mario, Peach, Bowser et leurs allies partent pour une aventure cosmique coloree, ideale pour une sortie famille."
  }
];

const savedTheme = localStorage.getItem("cinebuzzTheme") || "dark";
document.documentElement.dataset.theme = savedTheme;

const CINEBUZZ_SCHEDULE = [
  {
    day: "Mar. 12 mai",
    label: "Aujourd'hui",
    date: "2026-05-12",
    items: [
      { movieId: "michael", cinema: "UTEX", version: "VOSTFR", times: ["16:00", "18:20", "21:00"] },
      { movieId: "devil-prada-2", cinema: "Premier Shopping Mall", version: "VF", times: ["17:30", "19:10", "21:20"] },
      { movieId: "mortal-kombat-2", cinema: "UTEX", version: "3D VF", times: ["18:00", "20:30", "22:10"] }
    ]
  },
  {
    day: "Mer. 13 mai",
    label: "Demain",
    date: "2026-05-13",
    items: [
      { movieId: "super-mario-galaxy", cinema: "Premier Shopping Mall", version: "VF", times: ["13:30", "15:45", "18:00"] },
      { movieId: "michael", cinema: "UTEX", version: "VF", times: ["16:40", "19:30"] },
      { movieId: "mortal-kombat-2", cinema: "Premier Shopping Mall", version: "VOSTFR", times: ["20:00", "22:30"] }
    ]
  },
  {
    day: "Jeu. 14 mai",
    label: "Jeudi",
    date: "2026-05-14",
    items: [
      { movieId: "devil-prada-2", cinema: "UTEX", version: "VOSTFR", times: ["16:20", "18:50", "21:15"] },
      { movieId: "super-mario-galaxy", cinema: "Premier Shopping Mall", version: "VF", times: ["14:00", "16:15"] },
      { movieId: "mortal-kombat-2", cinema: "UTEX", version: "VF", times: ["19:40", "22:00"] }
    ]
  }
];

const CINEBUZZ_PRICES = {
  adult: 10,
  child: 8,
  couple: 16,
  popcorn: 5,
  drink: 3
};

const CINEBUZZ_OCCUPIED_SEATS = new Set(["A1", "A2", "B6", "C7", "D2", "E8"]);

const CINEBUZZ_DEFAULT_BOOKING = {
  movieId: "michael",
  dayIndex: 0,
  cinema: "UTEX",
  version: "VOSTFR",
  time: "18:20",
  tickets: {
    adult: 2,
    child: 0,
    couple: 0
  },
  seats: ["C4", "C5"],
  snacks: []
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function movieById(id) {
  return CINEBUZZ_MOVIES.find((movie) => movie.id === id) || CINEBUZZ_MOVIES[0];
}

function bookingFromStorage() {
  try {
    return { ...CINEBUZZ_DEFAULT_BOOKING, ...JSON.parse(localStorage.getItem("cinebuzzBooking") || "{}") };
  } catch {
    return { ...CINEBUZZ_DEFAULT_BOOKING };
  }
}

function saveBooking(booking) {
  localStorage.setItem("cinebuzzBooking", JSON.stringify(booking));
}

function userFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("cinebuzzUser") || "null");
  } catch {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem("cinebuzzUser", JSON.stringify(user));
}

function computeTotals(booking) {
  const tickets = booking.tickets || CINEBUZZ_DEFAULT_BOOKING.tickets;
  const snacks = booking.snacks || [];
  const ticketTotal =
    tickets.adult * CINEBUZZ_PRICES.adult +
    tickets.child * CINEBUZZ_PRICES.child +
    tickets.couple * CINEBUZZ_PRICES.couple;
  const snackTotal = snacks.reduce((sum, snack) => sum + CINEBUZZ_PRICES[snack], 0);
  const seats = (booking.seats || []).length;
  return {
    ticketTotal,
    snackTotal,
    total: ticketTotal + snackTotal,
    seats
  };
}

function ticketCountLabel(booking) {
  const tickets = booking.tickets || CINEBUZZ_DEFAULT_BOOKING.tickets;
  const count = tickets.adult + tickets.child + tickets.couple * 2;
  return `${count} place${count > 1 ? "s" : ""}`;
}

function applyHeader() {
  const header = $("[data-header]");
  const nav = $("[data-nav]");
  const navToggle = $("[data-nav-toggle]");
  if (!header || !nav || !navToggle) return;

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });

  window.addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  });
}

function applyThemeToggle() {
  const nav = $("[data-nav]");
  if (!nav || $("[data-theme-toggle]", nav)) return;

  const button = document.createElement("button");
  button.className = "theme-toggle";
  button.type = "button";
  button.dataset.themeToggle = "";
  nav.insertBefore(button, nav.querySelector(".nav-action"));

  function updateButton() {
    const isLight = document.documentElement.dataset.theme === "light";
    button.setAttribute("aria-label", isLight ? "Passer au theme sombre" : "Passer au theme clair");
    button.title = isLight ? "Theme sombre" : "Theme clair";
    button.dataset.themeLabel = isLight ? "Sombre" : "Clair";
    button.innerHTML = `<i data-lucide="${isLight ? "moon" : "sun"}"></i>`;
    window.lucide?.createIcons();
  }

  button.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("cinebuzzTheme", nextTheme);
    updateButton();
  });

  updateButton();
}

function applyMobileTabbar() {
  if ($(".mobile-tabbar")) return;
  const page = document.body.dataset.page || "";
  const tabbar = document.createElement("nav");
  tabbar.className = "mobile-tabbar";
  tabbar.setAttribute("aria-label", "Navigation mobile");
  tabbar.innerHTML = `
    <a href="index.html" class="${page === "home" ? "is-active" : ""}">
      <i data-lucide="home"></i>
      <span>Accueil</span>
    </a>
    <a href="films.html" class="${page === "films" || page === "film" ? "is-active" : ""}">
      <i data-lucide="clapperboard"></i>
      <span>Films</span>
    </a>
    <a href="reservation.html" class="${page === "reservation" || page === "checkout" || page === "confirmation" ? "is-active" : ""}">
      <i data-lucide="ticket"></i>
      <span>Reserver</span>
    </a>
    <a href="compte.html" class="${page === "account" || page === "login" || page === "signup" ? "is-active" : ""}">
      <i data-lucide="user"></i>
      <span>Compte</span>
    </a>
  `;
  document.body.appendChild(tabbar);
}

function renderMovieCards(target, movies, options = {}) {
  if (!target) return;

  target.innerHTML = movies.map((movie) => `
    <article class="movie-card">
      <a href="film.html?id=${movie.id}" aria-label="Voir ${movie.title}">
        <img src="${movie.poster}" alt="Affiche ${movie.title}">
        <div class="movie-info">
          <div class="movie-meta">
            <span class="chip accent">${movie.next}</span>
            <span class="chip">${movie.version}</span>
            ${options.showRating ? `<span class="chip">${movie.rating}</span>` : ""}
          </div>
          <h3>${movie.title}</h3>
          <p>${movie.genre}</p>
          <p>${movie.cinema}</p>
        </div>
      </a>
    </article>
  `).join("");
}

function renderScheduleList(target, dayIndex = 0, selectedSession = null) {
  if (!target) return;
  const day = CINEBUZZ_SCHEDULE[dayIndex];

  target.innerHTML = day.items.map((item) => {
    const movie = movieById(item.movieId);
    return `
      <article class="showtime-card">
        <div>
          <h3>${movie.title}</h3>
          <p>${movie.genre} - ${item.version}</p>
        </div>
        <div class="showtime-tags">
          ${item.times.map((time) => {
            const isActive = selectedSession &&
              selectedSession.movieId === item.movieId &&
              selectedSession.cinema === item.cinema &&
              selectedSession.time === time;
            return `
              <a class="time-button ${isActive ? "is-active" : ""}" href="reservation.html?movie=${item.movieId}&day=${dayIndex}&time=${time}">
                ${time}
              </a>
            `;
          }).join("")}
        </div>
        <span class="cinema-pill">${item.cinema}</span>
      </article>
    `;
  }).join("");
}

function initHomePage() {
  const movieGrid = $("[data-movie-grid]");
  const dayTabs = $("[data-day-tabs]");
  const scheduleList = $("[data-schedule-list]");
  let filter = "all";
  let dayIndex = 0;

  function renderMovies() {
    const movies = filter === "all" ? CINEBUZZ_MOVIES : CINEBUZZ_MOVIES.filter((movie) => movie.tags.includes(filter));
    renderMovieCards(movieGrid, movies);
  }

  function renderDays() {
    if (!dayTabs) return;
    dayTabs.innerHTML = CINEBUZZ_SCHEDULE.map((day, index) => `
      <button class="day-tab ${index === dayIndex ? "is-active" : ""}" type="button" data-day-index="${index}">
        <strong>${day.day}</strong> ${day.label}
      </button>
    `).join("");
  }

  $$("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      filter = button.dataset.filter;
      $$("[data-filter]").forEach((tab) => tab.classList.toggle("is-active", tab === button));
      renderMovies();
    });
  });

  dayTabs?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-day-index]");
    if (!button) return;
    dayIndex = Number(button.dataset.dayIndex);
    renderDays();
    renderScheduleList(scheduleList, dayIndex);
  });

  renderMovies();
  renderDays();
  renderScheduleList(scheduleList, dayIndex);
}

function initFilmsPage() {
  const grid = $("[data-film-list]");
  const search = $("[data-film-search]");
  const filterSelect = $("[data-film-filter]");

  function render() {
    const term = (search?.value || "").trim().toLowerCase();
    const filter = filterSelect?.value || "all";
    const movies = CINEBUZZ_MOVIES.filter((movie) => {
      const matchesTerm = `${movie.title} ${movie.genre} ${movie.cinema}`.toLowerCase().includes(term);
      const matchesFilter = filter === "all" || movie.tags.includes(filter);
      return matchesTerm && matchesFilter;
    });
    renderMovieCards(grid, movies, { showRating: true });
  }

  search?.addEventListener("input", render);
  filterSelect?.addEventListener("change", render);
  render();
}

function initFilmDetailPage() {
  const params = new URLSearchParams(location.search);
  const movie = movieById(params.get("id"));
  const hero = $("[data-film-hero]");
  const details = $("[data-film-details]");
  const showtimes = $("[data-film-showtimes]");
  if (!hero || !details || !showtimes) return;

  hero.style.backgroundImage = `linear-gradient(90deg, rgba(8, 6, 4, 0.96), rgba(8, 6, 4, 0.58)), url("${movie.poster}")`;
  details.innerHTML = `
    <p class="eyebrow">Film en vedette</p>
    <h1>${movie.title}</h1>
    <p class="hero-copy">${movie.synopsis}</p>
    <div class="movie-meta detail-meta">
      <span class="chip accent">${movie.next}</span>
      <span class="chip">${movie.genre}</span>
      <span class="chip">${movie.duration}</span>
      <span class="chip">${movie.rating}</span>
    </div>
    <div class="hero-actions">
      <a class="button button-primary" href="reservation.html?movie=${movie.id}"><i data-lucide="ticket-check"></i> Reserver</a>
      <a class="button button-secondary" href="films.html"><i data-lucide="arrow-left"></i> Tous les films</a>
    </div>
  `;

  const cards = CINEBUZZ_SCHEDULE.flatMap((day, dayIndex) => {
    return day.items
      .filter((item) => item.movieId === movie.id)
      .map((item) => ({ ...item, day, dayIndex }));
  });

  showtimes.innerHTML = cards.map((item) => `
    <article class="showtime-card">
      <div>
        <h3>${item.day.day}</h3>
        <p>${item.cinema} - ${item.version}</p>
      </div>
      <div class="showtime-tags">
        ${item.times.map((time) => `
          <a class="time-button" href="reservation.html?movie=${movie.id}&day=${item.dayIndex}&time=${time}">${time}</a>
        `).join("")}
      </div>
      <span class="cinema-pill">${ticketCountLabel(CINEBUZZ_DEFAULT_BOOKING)}</span>
    </article>
  `).join("");
}

function initReservationPage() {
  const params = new URLSearchParams(location.search);
  const booking = bookingFromStorage();
  if (params.get("movie")) booking.movieId = params.get("movie");
  if (params.get("day")) booking.dayIndex = Number(params.get("day"));
  if (params.get("time")) booking.time = params.get("time");

  const day = CINEBUZZ_SCHEDULE[booking.dayIndex] || CINEBUZZ_SCHEDULE[0];
  const firstItem = day.items.find((item) => item.movieId === booking.movieId) || day.items[0];
  booking.movieId = firstItem.movieId;
  booking.cinema = firstItem.cinema;
  booking.version = firstItem.version;
  booking.time = firstItem.times.includes(booking.time) ? booking.time : firstItem.times[0];
  saveBooking(booking);

  const movieSelect = $("[data-booking-movie]");
  const daySelect = $("[data-booking-day]");
  const timeSelect = $("[data-booking-time]");
  const seatGrid = $("[data-seat-grid]");

  if (movieSelect) {
    movieSelect.innerHTML = CINEBUZZ_MOVIES.map((movie) => `<option value="${movie.id}">${movie.title}</option>`).join("");
    movieSelect.value = booking.movieId;
  }

  if (daySelect) {
    daySelect.innerHTML = CINEBUZZ_SCHEDULE.map((item, index) => `<option value="${index}">${item.day}</option>`).join("");
    daySelect.value = String(booking.dayIndex);
  }

  function fillTimes() {
    const currentDay = CINEBUZZ_SCHEDULE[booking.dayIndex];
    const item = currentDay.items.find((entry) => entry.movieId === booking.movieId) || currentDay.items[0];
    booking.movieId = item.movieId;
    booking.cinema = item.cinema;
    booking.version = item.version;
    booking.time = item.times.includes(booking.time) ? booking.time : item.times[0];
    if (timeSelect) {
      timeSelect.innerHTML = item.times.map((time) => `<option value="${time}">${time}</option>`).join("");
      timeSelect.value = booking.time;
    }
    saveBooking(booking);
    renderBookingSummary(booking);
  }

  function renderSeats() {
    if (!seatGrid) return;
    const rows = ["A", "B", "C", "D", "E", "F"];
    const selected = new Set(booking.seats || []);
    const seats = rows.flatMap((row) => Array.from({ length: 8 }, (_, index) => `${row}${index + 1}`));

    seatGrid.innerHTML = seats.map((seat) => {
      const occupied = CINEBUZZ_OCCUPIED_SEATS.has(seat);
      const isSelected = selected.has(seat);
      const className = occupied ? "is-occupied" : isSelected ? "is-selected" : "";
      return `<button class="seat ${className}" type="button" ${occupied ? "disabled" : ""} data-seat="${seat}">${seat}</button>`;
    }).join("");
  }

  movieSelect?.addEventListener("change", () => {
    booking.movieId = movieSelect.value;
    fillTimes();
  });

  daySelect?.addEventListener("change", () => {
    booking.dayIndex = Number(daySelect.value);
    fillTimes();
  });

  timeSelect?.addEventListener("change", () => {
    booking.time = timeSelect.value;
    saveBooking(booking);
    renderBookingSummary(booking);
  });

  $$("[data-ticket-row]").forEach((row) => {
    row.addEventListener("click", (event) => {
      const button = event.target.closest("[data-ticket-action]");
      if (!button) return;
      const type = row.dataset.ticketRow;
      const nextValue = button.dataset.ticketAction === "plus" ? booking.tickets[type] + 1 : booking.tickets[type] - 1;
      booking.tickets[type] = Math.max(0, nextValue);
      saveBooking(booking);
      renderBookingSummary(booking);
    });
  });

  seatGrid?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-seat]");
    if (!button || button.disabled) return;
    const seat = button.dataset.seat;
    const selected = new Set(booking.seats || []);
    selected.has(seat) ? selected.delete(seat) : selected.add(seat);
    booking.seats = Array.from(selected);
    saveBooking(booking);
    renderSeats();
    renderBookingSummary(booking);
  });

  $$("[data-snack]").forEach((button) => {
    const snack = button.dataset.snack;
    button.classList.toggle("is-active", booking.snacks.includes(snack));
    button.addEventListener("click", () => {
      const snacks = new Set(booking.snacks || []);
      snacks.has(snack) ? snacks.delete(snack) : snacks.add(snack);
      booking.snacks = Array.from(snacks);
      button.classList.toggle("is-active", snacks.has(snack));
      saveBooking(booking);
      renderBookingSummary(booking);
    });
  });

  fillTimes();
  renderSeats();
  renderBookingSummary(booking);
}

function renderBookingSummary(booking) {
  const movie = movieById(booking.movieId);
  const day = CINEBUZZ_SCHEDULE[booking.dayIndex] || CINEBUZZ_SCHEDULE[0];
  const totals = computeTotals(booking);
  const summary = $("[data-booking-summary]");
  if (summary) {
    summary.innerHTML = `
      <div class="summary-movie">
        <img src="${movie.poster}" alt="">
        <div>
          <strong>${movie.title}</strong>
          <span>${day.day} - ${booking.time}</span>
          <span>${booking.cinema} - ${booking.version}</span>
        </div>
      </div>
      <dl class="price-list">
        <div><dt>Billets</dt><dd>${totals.ticketTotal} USD</dd></div>
        <div><dt>Snacks</dt><dd>${totals.snackTotal} USD</dd></div>
        <div><dt>Sieges</dt><dd>${totals.seats} selectionne${totals.seats > 1 ? "s" : ""}</dd></div>
      </dl>
      <div class="grand-total"><span>Total</span><strong>${totals.total} USD</strong></div>
      <a class="button button-primary full-width" href="paiement.html"><i data-lucide="credit-card"></i> Continuer</a>
    `;
  }

  Object.entries(booking.tickets).forEach(([type, value]) => {
    const output = $(`[data-ticket-count="${type}"]`);
    if (output) output.textContent = value;
  });

  const session = $("[data-current-session]");
  if (session) session.textContent = `${movie.title} - ${day.day} - ${booking.time}`;
  window.lucide?.createIcons();
}

function initCheckoutPage() {
  const booking = bookingFromStorage();
  const user = userFromStorage();
  const accountLine = $("[data-checkout-account]");
  const form = $("[data-payment-form]");
  renderStaticSummary(booking, $("[data-checkout-summary]"));

  if (accountLine) {
    accountLine.textContent = user ? `Connecte comme ${user.name}` : "Connexion possible avec votre compte CineBuzz.";
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const order = {
      id: `CBZ-${Math.floor(100000 + Math.random() * 899999)}`,
      createdAt: "12 mai 2026",
      booking,
      user: user || {
        name: form.elements.name.value || "Client CineBuzz",
        email: form.elements.email.value || "client@cinebuzz.cd"
      }
    };
    localStorage.setItem("cinebuzzLastOrder", JSON.stringify(order));
    location.href = "confirmation.html";
  });
}

function renderStaticSummary(booking, target) {
  if (!target) return;
  const movie = movieById(booking.movieId);
  const day = CINEBUZZ_SCHEDULE[booking.dayIndex] || CINEBUZZ_SCHEDULE[0];
  const totals = computeTotals(booking);
  target.innerHTML = `
    <div class="summary-movie">
      <img src="${movie.poster}" alt="">
      <div>
        <strong>${movie.title}</strong>
        <span>${day.day} - ${booking.time}</span>
        <span>${booking.cinema} - ${booking.version}</span>
      </div>
    </div>
    <dl class="price-list">
      <div><dt>Places</dt><dd>${ticketCountLabel(booking)}</dd></div>
      <div><dt>Sieges</dt><dd>${(booking.seats || []).join(", ") || "A choisir"}</dd></div>
      <div><dt>Snacks</dt><dd>${(booking.snacks || []).length ? booking.snacks.join(", ") : "Aucun"}</dd></div>
    </dl>
    <div class="grand-total"><span>Total</span><strong>${totals.total} USD</strong></div>
  `;
}

function initConfirmationPage() {
  const order = JSON.parse(localStorage.getItem("cinebuzzLastOrder") || "null");
  const booking = order?.booking || bookingFromStorage();
  const code = order?.id || "CBZ-248613";
  const target = $("[data-confirmation]");
  renderStaticSummary(booking, $("[data-confirmation-summary]"));
  if (target) {
    target.innerHTML = `
      <span class="success-icon"><i data-lucide="check"></i></span>
      <p class="eyebrow">Reservation confirmee</p>
      <h1>${code}</h1>
      <p class="hero-copy">Le billet est pret dans l'espace client. Vous pouvez le presenter a l'entree de la salle.</p>
      <div class="qr-demo" aria-label="QR code billet"></div>
      <div class="hero-actions">
        <a class="button button-primary" href="compte.html"><i data-lucide="user"></i> Voir mon compte</a>
        <a class="button button-secondary" href="films.html"><i data-lucide="clapperboard"></i> Nouveau film</a>
      </div>
    `;
  }
}

function initAuthPage(mode) {
  const form = $("[data-auth-form]");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get("name") || "Client CineBuzz";
    const email = formData.get("email") || "client@cinebuzz.demo";
    saveUser({
      name,
      email,
      phone: formData.get("phone") || "+243 82 885 6382",
      mode
    });
    location.href = "compte.html";
  });
}

function initAccountPage() {
  const user = userFromStorage() || {
    name: "Client CineBuzz",
    email: "client@cinebuzz.cd",
    phone: "+243 82 885 6382"
  };
  const booking = bookingFromStorage();
  const profile = $("[data-account-profile]");
  const orderTarget = $("[data-account-order]");
  if (profile) {
    profile.innerHTML = `
      <strong>${user.name}</strong>
      <span>${user.email}</span>
      <span>${user.phone}</span>
    `;
  }
  renderStaticSummary(booking, orderTarget);

  const logout = $("[data-logout]");
  logout?.addEventListener("click", () => {
    localStorage.removeItem("cinebuzzUser");
    location.href = "connexion.html";
  });
}

function boot() {
  applyThemeToggle();
  applyHeader();
  applyMobileTabbar();
  const page = document.body.dataset.page;
  if (page === "home") initHomePage();
  if (page === "films") initFilmsPage();
  if (page === "film") initFilmDetailPage();
  if (page === "reservation") initReservationPage();
  if (page === "checkout") initCheckoutPage();
  if (page === "confirmation") initConfirmationPage();
  if (page === "login") initAuthPage("login");
  if (page === "signup") initAuthPage("signup");
  if (page === "account") initAccountPage();
  window.lucide?.createIcons();
}

document.addEventListener("DOMContentLoaded", boot);
