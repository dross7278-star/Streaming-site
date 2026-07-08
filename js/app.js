/* ═══════════════════════════════════════════════════════════════
   STREAMFLIX — App Logic
   Netflix Clone: login/logout, browsing, search, modal
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── Movie Database ─────────────────────────────────────────── */
const MOVIES = [
  // ── Action ───────────────────────────────────────────────────
  {
    id: 1,
    title: 'Thunderstrike',
    description: "A rogue intelligence agent uncovers a global conspiracy and must outmaneuver an entire nation's military apparatus before a deadly weapon falls into the wrong hands.",
    year: 2023, rating: 'PG-13', match: 97,
    genre: ['action', 'thriller'],
    genreLabel: 'Action • Thriller',
    cast: 'Marcus Reed, Elena Voss, Dani Torres',
    duration: '2h 18m',
    color1: '#1a1a2e', color2: '#16213e', accent: '#e94560',
    featured: true,
    badge: 'STREAMFLIX ORIGINAL',
  },
  {
    id: 2,
    title: 'Iron Barricade',
    description: 'When a small town police officer stumbles upon a bioweapon cache, she has 24 hours to disarm it before sunrise — alone, outgunned, and without backup.',
    year: 2022, rating: 'R', match: 94,
    genre: ['action'],
    genreLabel: 'Action',
    cast: 'Sasha Monroe, Cliff Harmon',
    duration: '1h 58m',
    color1: '#2d1b00', color2: '#5c2d00', accent: '#ff8c00',
    featured: false,
  },
  {
    id: 3,
    title: 'Velocity Zero',
    description: "A precision driver turned fugitive must compete in an underground race circuit controlled by the mob to buy his family's freedom.",
    year: 2024, rating: 'PG-13', match: 91,
    genre: ['action'],
    genreLabel: 'Action • Crime',
    cast: 'Dario Chase, Lyra Sims, Bo Nakamura',
    duration: '2h 02m',
    color1: '#0d0d0d', color2: '#1a0a2e', accent: '#7b2fff',
    featured: false,
  },
  {
    id: 4,
    title: 'Red Horizon',
    description: 'Navy SEALs are dropped into a hostile territory with no extraction plan — survival is a mission in itself.',
    year: 2023, rating: 'R', match: 89,
    genre: ['action'],
    genreLabel: 'Action • War',
    cast: 'Alex Crane, Mia Sun',
    duration: '2h 24m',
    color1: '#1a0000', color2: '#3d0000', accent: '#cc0000',
    featured: false,
  },

  // ── Comedy ───────────────────────────────────────────────────
  {
    id: 5,
    title: 'Chaos Theory',
    description: 'A by-the-book wedding planner accidentally books the same venue for three very different weddings on the same day — and must somehow make it all work.',
    year: 2023, rating: 'PG-13', match: 93,
    genre: ['comedy', 'romance'],
    genreLabel: 'Comedy • Romance',
    cast: 'Penny Walsh, Oliver Brooks',
    duration: '1h 46m',
    color1: '#0a1628', color2: '#1e3a5f', accent: '#ffd700',
    featured: false,
  },
  {
    id: 6,
    title: 'The Wrong Boss',
    description: 'After a mix-up at a job placement agency, a down-on-his-luck accountant ends up working as the personal assistant to a world-famous pop star.',
    year: 2024, rating: 'PG', match: 88,
    genre: ['comedy'],
    genreLabel: 'Comedy',
    cast: 'Jerry Kim, Stella Fox',
    duration: '1h 38m',
    color1: '#1a2a00', color2: '#2d4a00', accent: '#76c442',
    featured: false,
  },
  {
    id: 7,
    title: 'Roommates from Hell',
    description: 'Four strangers who have nothing in common are forced to share a tiny apartment in Manhattan after a building collapse — with hilarious results.',
    year: 2022, rating: 'R', match: 85,
    genre: ['comedy'],
    genreLabel: 'Comedy',
    cast: 'Tara Singh, Ben Wolfe, Cleo Martin, Jax Frey',
    duration: '1h 52m',
    color1: '#1e0028', color2: '#3d0055', accent: '#ff69b4',
    featured: false,
  },

  // ── Drama ─────────────────────────────────────────────────────
  {
    id: 8,
    title: 'The Last Witness',
    description: 'A retired judge is called back into service when the only witness to a mob assassination is his estranged daughter.',
    year: 2023, rating: 'R', match: 96,
    genre: ['drama', 'thriller'],
    genreLabel: 'Drama • Thriller',
    cast: 'Reginald Hayes, Sara Quinn',
    duration: '2h 08m',
    color1: '#0a0a14', color2: '#141428', accent: '#4169e1',
    featured: true,
    badge: 'AWARD WINNING',
  },
  {
    id: 9,
    title: 'Broken Orbit',
    description: 'A grieving astronaut volunteers for a one-way mission to the outer planets, only to discover a signal that changes everything humanity knows about the cosmos.',
    year: 2024, rating: 'PG-13', match: 98,
    genre: ['drama', 'sci-fi'],
    genreLabel: 'Drama • Sci-Fi',
    cast: 'Nora Vance, Elias Kwan, Amara Odel',
    duration: '2h 31m',
    color1: '#000814', color2: '#001d3d', accent: '#0077b6',
    featured: true,
    badge: 'STREAMFLIX ORIGINAL',
  },
  {
    id: 10,
    title: 'Paper Walls',
    description: 'A novelist moves back to his hometown to care for his ailing father and reconnects with the woman he left behind twenty years ago.',
    year: 2023, rating: 'PG-13', match: 91,
    genre: ['drama', 'romance'],
    genreLabel: 'Drama • Romance',
    cast: 'Nathan Cole, Isla Moore',
    duration: '1h 54m',
    color1: '#1a1208', color2: '#2d2010', accent: '#d4a017',
    featured: false,
  },

  // ── Sci-Fi ────────────────────────────────────────────────────
  {
    id: 11,
    title: 'Quantum Drift',
    description: 'A physics graduate student discovers she can shift between parallel timelines — but each jump erases her identity in the dimension she leaves.',
    year: 2024, rating: 'PG-13', match: 95,
    genre: ['sci-fi', 'thriller'],
    genreLabel: 'Sci-Fi • Thriller',
    cast: 'Zara Lin, Dev Patel-Cruz',
    duration: '2h 12m',
    color1: '#040023', color2: '#0d0050', accent: '#7400b8',
    featured: true,
    badge: 'STREAMFLIX ORIGINAL',
  },
  {
    id: 12,
    title: 'Neon Colony',
    description: 'In a hyper-corporate future where memories are monetized, a data thief tries to delete the one memory that makes her human.',
    year: 2023, rating: 'R', match: 92,
    genre: ['sci-fi'],
    genreLabel: 'Sci-Fi • Cyberpunk',
    cast: 'Ryu Tanaka, Priya Mehta',
    duration: '2h 04m',
    color1: '#000a14', color2: '#001428', accent: '#00f5ff',
    featured: false,
  },
  {
    id: 13,
    title: 'Deep Signal',
    description: 'First contact is made — but the alien message reveals that Earth has only 72 hours to respond or be quarantined from the galaxy forever.',
    year: 2024, rating: 'PG', match: 90,
    genre: ['sci-fi'],
    genreLabel: 'Sci-Fi • Adventure',
    cast: 'Dr. Gwen Park, Major Luis Reyes',
    duration: '1h 59m',
    color1: '#001a00', color2: '#003300', accent: '#00ff88',
    featured: false,
  },

  // ── Horror ────────────────────────────────────────────────────
  {
    id: 14,
    title: 'Hollow Creek',
    description: "A family's dream vacation to a remote lakeside cabin turns into a nightmare when they realize they've been invited — not as guests, but as prey.",
    year: 2023, rating: 'R', match: 87,
    genre: ['horror', 'thriller'],
    genreLabel: 'Horror • Thriller',
    cast: 'Dave Alston, Mona Reed, Tyler Marsh',
    duration: '1h 42m',
    color1: '#0a0a00', color2: '#1a1a00', accent: '#b8860b',
    featured: false,
  },
  {
    id: 15,
    title: 'The Whispering Dark',
    description: 'A sound engineer recording ambient audio in an abandoned asylum begins to hear voices in the silence — voices that know her name.',
    year: 2024, rating: 'R', match: 84,
    genre: ['horror'],
    genreLabel: 'Psychological Horror',
    cast: 'Lily Chen, Oscar Grant',
    duration: '1h 36m',
    color1: '#0a0005', color2: '#200010', accent: '#9b1d20',
    featured: false,
  },
  {
    id: 16,
    title: 'Root & Bone',
    description: 'After an ancient forest is razed for development, something old and patient wakes up — and it wants its land back.',
    year: 2022, rating: 'R', match: 82,
    genre: ['horror'],
    genreLabel: 'Folk Horror',
    cast: 'Freya Lund, Ivar Strand',
    duration: '1h 49m',
    color1: '#061206', color2: '#0d1f0d', accent: '#228b22',
    featured: false,
  },

  // ── Animation ─────────────────────────────────────────────────
  {
    id: 17,
    title: 'Starforge',
    description: 'An orphaned young inventor and her clockwork fox companion race across a steampunk empire to prevent a corrupt general from weaponizing the sun.',
    year: 2024, rating: 'PG', match: 99,
    genre: ['animation', 'adventure'],
    genreLabel: 'Animated • Adventure',
    cast: 'Voices: Maya Bell, Finn James, Ro Singh',
    duration: '1h 55m',
    color1: '#1a0d00', color2: '#2d1800', accent: '#ff6b00',
    featured: true,
    badge: 'STREAMFLIX ANIMATED',
  },
  {
    id: 18,
    title: 'Ocean Whisperers',
    description: 'Three young merfolk must navigate the politics of the deep sea to save their coral kingdom from a rising acidic current.',
    year: 2023, rating: 'G', match: 96,
    genre: ['animation'],
    genreLabel: 'Animated • Family',
    cast: 'Voices: Lily Sun, Marco Rivera',
    duration: '1h 42m',
    color1: '#001428', color2: '#002847', accent: '#00bfff',
    featured: false,
  },
  {
    id: 19,
    title: 'Pixel Rangers',
    description: 'When a retro video game gains sentience, its 8-bit heroes must escape into the real world to stop a virus from deleting their world — and ours.',
    year: 2024, rating: 'PG', match: 93,
    genre: ['animation', 'comedy'],
    genreLabel: 'Animated • Comedy',
    cast: 'Voices: Chris Tatum, Jade Wu',
    duration: '1h 38m',
    color1: '#1a0028', color2: '#2d0050', accent: '#ff00ff',
    featured: false,
  },

  // ── Documentary ───────────────────────────────────────────────
  {
    id: 20,
    title: 'The Hidden Ocean',
    description: 'A three-year expedition to the bottom of the Pacific reveals ecosystems so alien they challenge the definition of life itself.',
    year: 2023, rating: 'G', match: 97,
    genre: ['documentary'],
    genreLabel: 'Documentary • Nature',
    cast: 'Narrated by Sir David Whitmore',
    duration: '1h 48m',
    color1: '#000a28', color2: '#001447', accent: '#1e90ff',
    featured: false,
  },
  {
    id: 21,
    title: 'Code & Country',
    description: 'Inside the secretive world of elite government hackers — the men and women who fight wars without weapons on the digital frontier.',
    year: 2024, rating: 'PG-13', match: 94,
    genre: ['documentary', 'thriller'],
    genreLabel: 'Documentary • Tech',
    cast: 'Various interviews, classified sources',
    duration: '1h 52m',
    color1: '#001400', color2: '#002800', accent: '#00cc44',
    featured: false,
  },
  {
    id: 22,
    title: 'Invisible Cities',
    description: 'Urban archaeologists excavate beneath six major world cities, unearthing layers of civilizations, disasters, and stories that history forgot.',
    year: 2023, rating: 'G', match: 91,
    genre: ['documentary'],
    genreLabel: 'Documentary • History',
    cast: 'Narrated by Elena Baptiste',
    duration: '2h 06m',
    color1: '#1a1000', color2: '#2d1c00', accent: '#c8860a',
    featured: false,
  },

  // ── More titles for Trending & New ───────────────────────────
  {
    id: 23,
    title: 'Rogue Circuit',
    description: 'An AI gains self-awareness aboard a deep-space mining vessel and must decide whether humanity deserves to survive.',
    year: 2024, rating: 'R', match: 96,
    genre: ['sci-fi', 'thriller'],
    genreLabel: 'Sci-Fi • Thriller',
    cast: 'AI voice: VELA-9, Crew: Jana Ross',
    duration: '2h 15m',
    color1: '#0a000f', color2: '#140020', accent: '#cc00ff',
    featured: true,
    badge: 'NEW RELEASE',
  },
  {
    id: 24,
    title: 'The Sand Sovereign',
    description: 'An exiled desert queen forges an unlikely alliance with her greatest enemy to reclaim a throne stolen through blood magic.',
    year: 2024, rating: 'PG-13', match: 93,
    genre: ['action', 'drama'],
    genreLabel: 'Action • Fantasy',
    cast: 'Amara Diallo, Yusuf Al-Rashid',
    duration: '2h 28m',
    color1: '#1a0e00', color2: '#33200a', accent: '#e8a000',
    featured: false,
  },
  {
    id: 25,
    title: 'Afterglow',
    description: "Two strangers meet at opposite ends of life's journey — a teenager on her first day of college, a widower on his last day of work — and form an unexpected bond.",
    year: 2023, rating: 'PG', match: 95,
    genre: ['drama', 'romance'],
    genreLabel: 'Drama • Romance',
    cast: 'Grace Kim, Henry Ashton',
    duration: '1h 44m',
    color1: '#200a00', color2: '#3d1200', accent: '#ff7043',
    featured: false,
  },
  {
    id: 26,
    title: 'Last Signal',
    description: 'A remote lighthouse keeper receives a distress broadcast from a ship that sank fifty years ago — and the voice on the radio knows her name.',
    year: 2024, rating: 'R', match: 89,
    genre: ['horror', 'mystery'],
    genreLabel: 'Horror • Mystery',
    cast: 'Fiona Drake, Samuel Grey',
    duration: '1h 55m',
    color1: '#000814', color2: '#001428', accent: '#0077b6',
    featured: false,
  },
];

/* ── Catalog grouped by row ─────────────────────────────────── */
const ROWS = [
  { id: 'trending',      label: 'Trending Now',            filter: m => [23,9,11,1,8,17,25].includes(m.id) },
  { id: 'new',           label: 'New on StreamFlix',        filter: m => [23,24,13,15,19,12,26].includes(m.id) },
  { id: 'action',        label: 'Action & Adventure',       filter: m => m.genre.includes('action') },
  { id: 'comedy',        label: 'Comedy',                   filter: m => m.genre.includes('comedy') },
  { id: 'drama',         label: 'Drama',                    filter: m => m.genre.includes('drama') },
  { id: 'sci-fi',        label: 'Science Fiction',          filter: m => m.genre.includes('sci-fi') },
  { id: 'horror',        label: 'Horror',                   filter: m => m.genre.includes('horror') },
  { id: 'animation',     label: 'Animation',                filter: m => m.genre.includes('animation') },
  { id: 'documentary',   label: 'Documentaries',            filter: m => m.genre.includes('documentary') },
  { id: 'romance',       label: 'Romance',                  filter: m => m.genre.includes('romance') },
  { id: 'originals',     label: 'StreamFlix Originals',     filter: m => m.featured },
];

/* ── DOM helpers ─────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

/* ── State ───────────────────────────────────────────────────── */
let currentUser = null;
let searchOpen  = false;
let myList      = new Set();
let featuredIndex = 0;
let featuredMovies = [];
let heroInterval = null;
let currentFilter = 'all';

/* ═══════════════════════════════════════════════════════════════
   POSTER GENERATION — CSS gradient "posters"
   ═══════════════════════════════════════════════════════════════ */
function buildPosterHTML(movie) {
  return `
    <div class="movie-poster-gradient"
         style="background: linear-gradient(135deg, ${movie.color1} 0%, ${movie.color2} 60%, ${movie.accent}33 100%);">
      <div style="width:40px;height:40px;border-radius:50%;background:${movie.accent}33;
                  border:2px solid ${movie.accent};margin-bottom:10px;display:flex;
                  align-items:center;justify-content:center;">
        <svg viewBox="0 0 24 24" fill="${movie.accent}" width="18" height="18">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      </div>
      <div class="poster-title" style="color:${movie.accent};">${escapeHtml(movie.title)}</div>
    </div>`;
}

function buildHeroStyle(movie) {
  return `background: linear-gradient(135deg, ${movie.color1} 0%, ${movie.color2} 50%, ${movie.accent}22 100%);`;
}

/* ═══════════════════════════════════════════════════════════════
   AUTH — Login / Logout
   ═══════════════════════════════════════════════════════════════ */
function initLogin() {
  const form     = $('login-form');
  const emailIn  = $('login-email');
  const passIn   = $('login-password');
  const emailErr = $('email-error');
  const passErr  = $('password-error');
  const loginBtn = $('login-btn');

  on(form, 'submit', e => {
    e.preventDefault();
    let valid = true;
    emailErr.textContent = '';
    passErr.textContent  = '';

    const email = emailIn.value.trim();
    const pass  = passIn.value;

    // Basic validation
    if (!email) {
      emailErr.textContent = 'Please enter your email.';
      emailIn.classList.add('error');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailErr.textContent = 'Please enter a valid email address.';
      emailIn.classList.add('error');
      valid = false;
    } else {
      emailIn.classList.remove('error');
    }

    if (!pass) {
      passErr.textContent = 'Your password must be at least 4 characters.';
      passIn.classList.add('error');
      valid = false;
    } else if (pass.length < 4) {
      passErr.textContent = 'Your password must be at least 4 characters.';
      passIn.classList.add('error');
      valid = false;
    } else {
      passIn.classList.remove('error');
    }

    if (!valid) return;

    // Simulate sign-in loading
    loginBtn.textContent = 'Signing in…';
    loginBtn.disabled = true;

    setTimeout(() => {
      currentUser = email;
      loginBtn.textContent = 'Sign In';
      loginBtn.disabled = false;
      transitionToPage('login-page', 'browse-page');
      initBrowse();
    }, 900);
  });

  // Clear error on input
  on(emailIn, 'input', () => {
    emailErr.textContent = '';
    emailIn.classList.remove('error');
  });
  on(passIn, 'input', () => {
    passErr.textContent = '';
    passIn.classList.remove('error');
  });

  // Sign-up link (demo)
  on($('signup-link'), 'click', e => {
    e.preventDefault();
    showToast('Sign-up coming soon! Use any email & password to demo.');
  });
}

function initLogout() {
  on($('logout-btn'), 'click', e => {
    e.preventDefault();
    if (heroInterval) clearInterval(heroInterval);
    currentUser   = null;
    myList        = new Set();
    currentFilter = 'all';
    transitionToPage('browse-page', 'login-page');
    // Reset login form
    $('login-form').reset();
    $('email-error').textContent = '';
    $('password-error').textContent = '';
    $('login-email').classList.remove('error');
    $('login-password').classList.remove('error');
  });
}

/* ═══════════════════════════════════════════════════════════════
   PAGE TRANSITIONS — fade in / fade out
   ═══════════════════════════════════════════════════════════════ */
function transitionToPage(fromId, toId) {
  const from = $(fromId);
  const to   = $(toId);

  // Fade out the current page
  from.classList.add('fade-out');

  setTimeout(() => {
    from.classList.remove('active', 'fade-out');
    from.style.display = '';
    to.classList.add('active');
    window.scrollTo(0, 0);
  }, 600);
}

/* ═══════════════════════════════════════════════════════════════
   BROWSE PAGE
   ═══════════════════════════════════════════════════════════════ */
function initBrowse() {
  // Update user display
  if (currentUser) {
    const name = currentUser.split('@')[0];
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);
    $('user-display-name').textContent = displayName;
    // Set avatar background to a consistent color based on name
    const avatarEl = $('avatar-img');
    avatarEl.style.background = stringToColor(displayName);
    avatarEl.onerror = function() { this.style.display = 'none'; };
  }

  buildRows();
  buildHero();
  initNavScroll();
  initNavFilter();
  initSearch();
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#e50914','#e6b400','#0077b6','#6a0dad','#2ecc71','#e67e22'];
  return colors[Math.abs(hash) % colors.length];
}

/* ── Hero banner ─────────────────────────────────────────────── */
function buildHero() {
  featuredMovies = MOVIES.filter(m => m.featured);
  if (!featuredMovies.length) featuredMovies = MOVIES.slice(0, 5);
  featuredIndex = Math.floor(Math.random() * featuredMovies.length);
  renderHero(featuredMovies[featuredIndex]);

  // Auto-rotate hero every 8s
  heroInterval = setInterval(() => {
    featuredIndex = (featuredIndex + 1) % featuredMovies.length;
    renderHero(featuredMovies[featuredIndex]);
  }, 8000);

  on($('hero-play-btn'), 'click', () => {
    openModal(featuredMovies[featuredIndex]);
  });
  on($('hero-more-btn'), 'click', () => {
    openModal(featuredMovies[featuredIndex]);
  });
}

function renderHero(movie) {
  $('hero-backdrop').style.cssText = buildHeroStyle(movie);
  $('hero-title').textContent = movie.title;
  $('hero-description').textContent = movie.description;
  $('hero-badge').textContent = movie.badge || 'STREAMFLIX ORIGINAL';
  $('hero-meta').innerHTML = `
    <span class="match">${movie.match}% Match</span>
    <span class="year">${movie.year}</span>
    <span class="rating">${movie.rating}</span>
    <span>${movie.duration}</span>
  `;
  // Animate in
  const content = $('hero-content');
  content.style.opacity = '0';
  content.style.transform = 'translateY(20px)';
  requestAnimationFrame(() => {
    content.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    content.style.opacity = '1';
    content.style.transform = 'translateY(0)';
  });
}

/* ── Movie Rows ──────────────────────────────────────────────── */
function buildRows() {
  const section = $('rows-section');
  section.innerHTML = '';

  ROWS.forEach(row => {
    const movies = MOVIES.filter(row.filter);
    if (!movies.length) return;

    const rowEl = document.createElement('div');
    rowEl.className = 'movie-row';
    rowEl.dataset.rowId = row.id;

    rowEl.innerHTML = `
      <div class="row-title">
        ${escapeHtml(row.label)}
        <span class="row-explore">Explore All ›</span>
      </div>
      <div class="row-slider-wrapper">
        <button class="slider-btn slider-btn--left" aria-label="Scroll left">&#8249;</button>
        <div class="row-slider">
          ${movies.map(m => buildCardHTML(m)).join('')}
        </div>
        <button class="slider-btn slider-btn--right" aria-label="Scroll right">&#8250;</button>
      </div>
    `;

    // Slider scroll
    const slider = rowEl.querySelector('.row-slider');
    rowEl.querySelector('.slider-btn--left').addEventListener('click', () => {
      slider.scrollBy({ left: -slider.clientWidth * 0.8, behavior: 'smooth' });
    });
    rowEl.querySelector('.slider-btn--right').addEventListener('click', () => {
      slider.scrollBy({ left: slider.clientWidth * 0.8, behavior: 'smooth' });
    });

    // Card clicks
    rowEl.querySelectorAll('.movie-card').forEach(card => {
      const mid = parseInt(card.dataset.movieId, 10);
      const movie = MOVIES.find(m => m.id === mid);
      if (!movie) return;

      card.querySelector('.overlay-play').addEventListener('click', e => {
        e.stopPropagation();
        openModal(movie);
      });
      card.querySelector('.overlay-add').addEventListener('click', e => {
        e.stopPropagation();
        toggleMyList(movie, e.currentTarget);
      });
      card.querySelector('.overlay-chevron').addEventListener('click', e => {
        e.stopPropagation();
        openModal(movie);
      });
      card.addEventListener('click', () => openModal(movie));
    });

    section.appendChild(rowEl);
  });
}

function buildCardHTML(movie) {
  return `
    <div class="movie-card" data-movie-id="${movie.id}" tabindex="0" role="button"
         aria-label="${escapeHtml(movie.title)}">
      <div class="movie-card-inner">
        <div class="movie-poster">
          ${buildPosterHTML(movie)}
        </div>
        <div class="movie-card-overlay">
          <div class="overlay-title">${escapeHtml(movie.title)}</div>
          <div class="overlay-actions">
            <button class="overlay-play" aria-label="Play ${escapeHtml(movie.title)}">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
            <button class="overlay-add" aria-label="Add to my list">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <button class="overlay-chevron" aria-label="More info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
          <div class="overlay-meta">
            <span class="overlay-match">${movie.match}%</span>
            <span class="overlay-year">${movie.year}</span>
            <span class="overlay-rating">${movie.rating}</span>
            <span class="overlay-genre">${movie.genreLabel.split('•')[0].trim()}</span>
          </div>
        </div>
      </div>
    </div>`;
}

/* ── My List toggle ──────────────────────────────────────────── */
function toggleMyList(movie, btn) {
  if (myList.has(movie.id)) {
    myList.delete(movie.id);
    showToast(`Removed "${movie.title}" from My List`);
    // Change icon back to +
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>`;
  } else {
    myList.add(movie.id);
    showToast(`Added "${movie.title}" to My List`);
    // Change icon to checkmark
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`;
  }

  // Update modal list button if open
  const modalListBtn = $('modal-list-btn');
  if (modalListBtn.dataset.movieId == movie.id) {
    updateModalListBtn(movie.id);
  }
}

/* ── Nav scroll effect ───────────────────────────────────────── */
function initNavScroll() {
  const nav = $('main-nav');
  const onScroll = () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ── Nav genre filter ────────────────────────────────────────── */
function initNavFilter() {
  document.querySelectorAll('.nav-link[data-filter]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const filter = link.dataset.filter;
      currentFilter = filter;

      // Active state
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active-link'));
      link.classList.add('active-link');

      // Filter rows
      document.querySelectorAll('.movie-row').forEach(row => {
        if (filter === 'all') {
          row.classList.remove('hidden');
        } else {
          const rowId = row.dataset.rowId;
          const show = rowId === filter || rowId === 'trending' || rowId === 'new' || rowId === 'originals';
          row.classList.toggle('hidden', !show);
        }
      });

      // Scroll to rows
      $('rows-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   SEARCH
   ═══════════════════════════════════════════════════════════════ */
function initSearch() {
  const wrapper  = $('search-wrapper');
  const toggleBtn = $('search-toggle');
  const input    = $('search-input');

  on(toggleBtn, 'click', () => {
    searchOpen = !searchOpen;
    wrapper.classList.toggle('open', searchOpen);
    if (searchOpen) {
      input.focus();
    } else {
      input.value = '';
      closeSearchResults();
    }
  });

  on(input, 'input', () => {
    const q = input.value.trim();
    if (q.length >= 1) {
      performSearch(q);
    } else {
      closeSearchResults();
    }
  });

  on(input, 'keydown', e => {
    if (e.key === 'Escape') {
      searchOpen = false;
      wrapper.classList.remove('open');
      input.value = '';
      closeSearchResults();
      toggleBtn.focus();
    }
  });

  // Close search when clicking outside
  document.addEventListener('click', e => {
    if (searchOpen && !wrapper.contains(e.target) && !$('search-results-overlay')?.contains(e.target)) {
      // Keep open if results are showing
    }
  });
}

function performSearch(query) {
  const q = query.toLowerCase();
  const results = MOVIES.filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.description.toLowerCase().includes(q) ||
    m.genreLabel.toLowerCase().includes(q) ||
    m.cast.toLowerCase().includes(q) ||
    String(m.year).includes(q)
  );

  renderSearchResults(query, results);
}

function renderSearchResults(query, results) {
  closeSearchResults(false);

  const overlay = document.createElement('div');
  overlay.id = 'search-results-overlay';
  overlay.className = 'search-results-overlay';

  if (results.length === 0) {
    overlay.innerHTML = `
      <p class="search-results-title">Searching for "<span>${escapeHtml(query)}</span>"</p>
      <p class="search-no-results">Your search for "${escapeHtml(query)}" did not have any matches.</p>`;
  } else {
    overlay.innerHTML = `
      <p class="search-results-title">Results for "<span>${escapeHtml(query)}</span>"</p>
      <div class="search-grid">
        ${results.map(m => buildCardHTML(m)).join('')}
      </div>`;
  }

  $('browse-page').appendChild(overlay);

  // Attach card click handlers
  overlay.querySelectorAll('.movie-card').forEach(card => {
    const mid = parseInt(card.dataset.movieId, 10);
    const movie = MOVIES.find(m => m.id === mid);
    if (!movie) return;

    card.querySelector('.overlay-play').addEventListener('click', e => {
      e.stopPropagation();
      openModal(movie);
    });
    card.querySelector('.overlay-add').addEventListener('click', e => {
      e.stopPropagation();
      toggleMyList(movie, e.currentTarget);
    });
    card.querySelector('.overlay-chevron').addEventListener('click', e => {
      e.stopPropagation();
      openModal(movie);
    });
    card.addEventListener('click', () => openModal(movie));
  });
}

function closeSearchResults(clear = true) {
  const existing = $('search-results-overlay');
  if (existing) existing.remove();
  if (clear) {
    $('search-input').value = '';
  }
}

/* ═══════════════════════════════════════════════════════════════
   MODAL
   ═══════════════════════════════════════════════════════════════ */
function openModal(movie) {
  const overlay = $('modal-overlay');

  // Hero
  $('modal-hero').style.cssText = buildHeroStyle(movie);
  $('modal-title').textContent = movie.title;

  // Meta
  $('modal-meta').innerHTML = `
    <span class="match">${movie.match}% Match</span>
    <span class="year">${movie.year}</span>
    <span class="rating">${movie.rating}</span>
    <span class="seasons">${movie.duration}</span>
    <span class="hd">HD</span>
  `;

  $('modal-description').textContent = movie.description;
  $('modal-genres').innerHTML  = `<strong>Genres:</strong> ${escapeHtml(movie.genreLabel)}`;
  $('modal-cast').innerHTML    = `<strong>Cast:</strong> ${escapeHtml(movie.cast)}`;
  $('modal-maturity').innerHTML = `<strong>Maturity rating:</strong> ${movie.rating}`;

  // List button
  const listBtn = $('modal-list-btn');
  listBtn.dataset.movieId = movie.id;
  updateModalListBtn(movie.id);

  on(listBtn, 'click', () => toggleMyList(movie, listBtn));
  on($('modal-play-btn'), 'click', () => {
    showToast(`Playing "${movie.title}"…`);
  });

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function updateModalListBtn(movieId) {
  const btn = $('modal-list-btn');
  if (myList.has(movieId)) {
    btn.classList.add('added');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`;
    btn.setAttribute('aria-label', 'Remove from My List');
  } else {
    btn.classList.remove('added');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>`;
    btn.setAttribute('aria-label', 'Add to My List');
  }
}

function initModal() {
  on($('modal-close'), 'click', closeModal);
  on($('modal-overlay'), 'click', e => {
    if (e.target === $('modal-overlay')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('modal-overlay').classList.contains('open')) {
      closeModal();
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   TOAST NOTIFICATION
   ═══════════════════════════════════════════════════════════════ */
let toastTimer = null;

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════ */
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
  return String(str).replace(/[&<>"']/g, c => map[c]);
}

/* ═══════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initLogout();
  initModal();

  // Keyboard: Enter on movie cards
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.classList.contains('movie-card')) {
      const mid = parseInt(e.target.dataset.movieId, 10);
      const movie = MOVIES.find(m => m.id === mid);
      if (movie) openModal(movie);
    }
  });
});
