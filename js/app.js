// ── ModPlay Store — Main Application ──

// ── Utility Functions ──
export function getBaseUrl() {
  const { hostname, pathname } = window.location;
  if (hostname.includes('github.io')) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 1) return `/${parts[0]}/`;
  }
  return '/';
}

export async function loadApps() {
  const res = await fetch(`${getBaseUrl()}apps.json`);
  if (!res.ok) throw new Error(`Failed to load apps: ${res.status}`);
  return res.json();
}

export function getAppFromUrl(apps) {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const key = parts[parts.length - 2] || parts[parts.length - 1];
  return apps.find(a => a.key === key) || null;
}

// ── Theme Toggle ──
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = saved || (prefersDark ? 'dark' : 'light');

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
}

// ── Search ──
function initSearch(apps) {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClear');
  const content = document.getElementById('content');
  const searchResults = document.getElementById('searchResults');

  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    clearBtn.style.display = q ? 'flex' : 'none';

    if (!q) {
      content.style.display = '';
      searchResults.style.display = 'none';
      return;
    }

    const matches = apps.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.developer.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      (a.description && a.description.toLowerCase().includes(q))
    );

    content.style.display = 'none';
    searchResults.style.display = '';

    if (matches.length === 0) {
      searchResults.innerHTML = `
        <div class="no-results">
          <div class="no-results__icon">🔍</div>
          <div class="no-results__text">No results for "${input.value}"</div>
        </div>`;
    } else {
      searchResults.innerHTML = `
        <div class="section fade-in">
          <h2 class="section__title">Search results (${matches.length})</h2>
          <div class="carousel">${matches.map(renderAppCard).join('')}</div>
        </div>`;
      bindCardClicks(searchResults, apps);
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    content.style.display = '';
    searchResults.style.display = 'none';
    input.focus();
  });
}

// ── Tab Switching ──
function initTabs(apps) {
  const tabs = document.getElementById('navTabs');
  if (!tabs) return;

  tabs.addEventListener('click', e => {
    const btn = e.target.closest('.tabs__item');
    if (!btn) return;

    tabs.querySelectorAll('.tabs__item').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const tab = btn.dataset.tab;
    renderTab(tab, apps);
  });
}

// ── Render Storefront ──
function renderTab(tab, apps) {
  const content = document.getElementById('content');
  const skeleton = document.getElementById('skeleton');
  skeleton.style.display = 'none';
  content.style.display = '';
  content.innerHTML = '';

  switch (tab) {
    case 'for-you':
      renderForYou(apps, content);
      break;
    case 'top-charts':
      renderTopCharts(apps, content);
      break;
    case 'categories':
      renderCategories(apps, content);
      break;
    case 'security':
      renderSecurity(apps, content);
      break;
    default:
      renderForYou(apps, content);
  }

  bindCardClicks(content, apps);
}

function renderForYou(apps, container) {
  // Featured carousel (editorChoice apps)
  const featured = apps.filter(a => a.editorChoice);
  if (featured.length) {
    const section = el('div', 'section fade-in');
    section.innerHTML = `
      <h2 class="section__title">Editor's Choice</h2>
      <div class="carousel">${featured.map(renderFeaturedCard).join('')}</div>`;
    container.appendChild(section);
  }

  // Recommended
  renderCarousel('Recommended for you', apps.slice(0, 6), container);

  // Trending (by rating)
  const trending = [...apps].sort((a, b) => b.rating - a.rating).slice(0, 6);
  renderCarousel('Trending now', trending, container);

  // Recently updated
  const recent = [...apps].sort((a, b) => new Date(b.updated) - new Date(a.updated)).slice(0, 6);
  renderCarousel('Recently updated', recent, container);
}

function renderTopCharts(apps, container) {
  const byDownloads = [...apps].sort((a, b) => parseDownloads(b.downloads) - parseDownloads(a.downloads));
  renderCarousel('Most downloaded', byDownloads, container);

  const byRating = [...apps].sort((a, b) => b.rating - a.rating);
  renderCarousel('Highest rated', byRating, container);
}

function renderCategories(apps, container) {
  const cats = [...new Set(apps.map(a => a.category))];
  cats.forEach(cat => {
    const catApps = apps.filter(a => a.category === cat);
    renderCarousel(cat, catApps, container);
  });
}

function renderSecurity(apps, container) {
  const intro = el('div', 'section fade-in');
  intro.innerHTML = `
    <div style="padding:var(--sp-5);background:var(--color-primary-container);border-radius:var(--r-xl);margin-bottom:var(--sp-5)">
      <h2 style="font-size:var(--fs-xl);margin-bottom:var(--sp-3)">🔒 Security Awareness Training</h2>
      <p style="color:var(--color-on-primary-container);max-width:600px">
        This store is an <strong>educational project</strong> demonstrating how app stores work.
        Each app listing contains security training elements — fake reviews, metadata,
        and download flows — designed to teach awareness about app store safety.
      </p>
    </div>`;
  container.appendChild(intro);

  renderCarousel('All apps', apps, container);

  // Security tips
  const tips = el('div', 'section fade-in');
  tips.innerHTML = `
    <h2 class="section__title">🛡️ Security Tips</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:var(--sp-4)">
      ${[
        { icon: '⚠️', title: 'Verify Developer', desc: 'Always check the developer name and verified badge before installing.' },
        { icon: '⭐', title: 'Read Reviews', desc: 'Look for patterns in reviews — many similar positive reviews can be fake.' },
        { icon: '📊', title: 'Check Permissions', desc: 'Review what permissions an app requests. Unnecessary permissions are a red flag.' },
        { icon: '🔄', title: 'Keep Updated', desc: 'Outdated apps may contain known security vulnerabilities.' },
      ].map(t => `
        <div style="padding:var(--sp-4);background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--r-lg)">
          <div style="font-size:24px;margin-bottom:var(--sp-2)">${t.icon}</div>
          <h4 style="margin-bottom:var(--sp-2)">${t.title}</h4>
          <p style="font-size:var(--fs-sm);color:var(--color-on-surface-muted)">${t.desc}</p>
        </div>`).join('')}
    </div>`;
  container.appendChild(tips);
}

// ── Card Renderers ──
function renderFeaturedCard(app) {
  return `
    <div class="featured" data-key="${app.key}">
      <img class="featured__img" src="${app.screenshots?.[0] || ''}" onerror="this.style.background='var(--color-primary-container)'" alt="${app.name}">
      <div class="featured__overlay">
        <span class="featured__badge">Editor's Choice</span>
        <div class="featured__name">${app.name}</div>
        <div class="featured__dev">${app.developer}</div>
      </div>
    </div>`;
}

function renderAppCard(app) {
  return `
    <div class="app-card" data-key="${app.key}">
      <div class="app-card__icon">
        <svg viewBox="0 0 56 56" fill="none"><rect width="56" height="56" rx="12" fill="${app.accentColor || '#01875f'}"/><text x="28" y="35" text-anchor="middle" fill="white" font-size="22" font-weight="bold" font-family="sans-serif">${app.name.charAt(0)}</text></svg>
      </div>
      <div class="app-card__info">
        <div class="app-card__name">${app.name}</div>
        <div class="app-card__dev">${app.developer}</div>
        <div class="app-card__rating">
          <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 18.36l-6.15-1.97L6.91 18.36l5-4.87L2 9.27l6.91-3.01L12 2z" fill="currentColor"/></svg>
          ${app.rating}
        </div>
      </div>
    </div>`;
}

function renderCarousel(title, apps, container) {
  const section = el('div', 'section fade-in');
  section.innerHTML = `
    <h2 class="section__title">${title}</h2>
    <div class="carousel">${apps.map(renderAppCard).join('')}</div>`;
  container.appendChild(section);
}

function bindCardClicks(root, apps) {
  root.querySelectorAll('[data-key]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const key = card.dataset.key;
      window.location.href = `${getBaseUrl()}${key}/`;
    });
  });
}

// ── Helpers ──
function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

function parseDownloads(str) {
  if (!str) return 0;
  const num = parseFloat(str);
  if (str.includes('B')) return num * 1000;
  if (str.includes('M')) return num;
  return num;
}

// ── Initialize Storefront ──
async function init() {
  initTheme();

  try {
    const apps = await loadApps();
    initSearch(apps);
    initTabs(apps);

    // Show content after brief delay
    setTimeout(() => {
      document.getElementById('skeleton').style.display = 'none';
      renderTab('for-you', apps);
    }, 600);
  } catch (err) {
    console.error('Failed to load:', err);
    document.getElementById('skeleton').innerHTML = `
      <div class="no-results">
        <div class="no-results__icon">❌</div>
        <div class="no-results__text">Failed to load apps</div>
      </div>`;
  }
}

init();
