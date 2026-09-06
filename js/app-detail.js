// ── App Detail Page — ModPlay Store ──

function getBaseUrl() {
  const { hostname, pathname } = window.location;
  if (hostname.includes('github.io')) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 1) return `/${parts[0]}/`;
  }
  return '/';
}

async function loadApps() {
  const res = await fetch(`${getBaseUrl()}apps.json`);
  if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
  return res.json();
}

function getAppFromUrl(apps) {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const key = parts[parts.length - 2] || parts[parts.length - 1];
  return apps.find(a => a.key === key) || null;
}

// ── Theme ──
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = saved || (prefersDark ? 'dark' : 'light');
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
}

// ── Helpers ──
function stars(rating) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < 5; i++) {
    const filled = i < full || (i === full && hasHalf);
    html += `<svg viewBox="0 0 24 24" class="${filled ? '' : 'empty'}" style="width:16px;height:16px;color:var(--color-star)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 18.36l-6.15-1.97L6.91 18.36l5-4.87L2 9.27l6.91-3.01L12 2z" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5"/></svg>`;
  }
  return html;
}

function starsSmall(rating) {
  return Array(5).fill(0).map((_, i) =>
    `<svg class="${i < rating ? '' : 'empty'}" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 18.36l-6.15-1.97L6.91 18.36l5-4.87L2 9.27l6.91-3.01L12 2z" fill="${i < rating ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5"/></svg>`
  ).join('');
}

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  const colors = ['#01875f','#FF6D00','#6B5B95','#88B04B','#E4405F','#92A8D1','#955251','#B565A7'];
  return colors[Math.abs(h) % colors.length];
}

function initials(name) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

// ── Render ──
async function init() {
  initTheme();

  try {
    const apps = await loadApps();
    const app = getAppFromUrl(apps);
    if (!app) {
      document.getElementById('appRoot').innerHTML = `
        <div class="no-results" style="min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div class="no-results__icon">❌</div>
          <div class="no-results__text">App not found</div>
          <a href="/" style="margin-top:var(--sp-4)">← Back to store</a>
        </div>`;
      return;
    }

    document.title = `${app.name} — ModPlay`;
    renderApp(app);
  } catch (err) {
    console.error(err);
    document.getElementById('appRoot').innerHTML = `
      <div class="no-results" style="min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div class="no-results__icon">⚠️</div>
        <div class="no-results__text">Error loading app</div>
      </div>`;
  }
}

function renderApp(app) {
  const root = document.getElementById('appRoot');

  // Rating breakdown from reviews
  const counts = {5:0, 4:0, 3:0, 2:0, 1:0};
  (app.fakeReviews || []).forEach(r => counts[r.rating]++);
  const total = Object.values(counts).reduce((a,b) => a+b, 0) || 1;

  root.innerHTML = `
    <!-- Back Header -->
    <div class="app-header">
      <button class="app-header__back" onclick="history.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>
      </button>
      <span class="app-header__title">${app.name}</span>
    </div>

    <!-- Hero -->
    <div class="app-hero">
      <div class="app-hero__icon">
        <svg viewBox="0 0 72 72" fill="none"><rect width="72" height="72" rx="16" fill="${app.accentColor || '#01875f'}"/><text x="36" y="45" text-anchor="middle" fill="white" font-size="28" font-weight="bold" font-family="sans-serif">${app.name.charAt(0)}</text></svg>
      </div>
      <div class="app-hero__info">
        <h1 class="app-hero__name">${app.name}</h1>
        <div class="app-hero__dev">
          ${app.developer}
          ${app.verified ? '<svg viewBox="0 0 24 24"><path d="M9 16.2l-3.5-3.5-.7.7 4.2 4.2 8-8-.7-.7z" fill="currentColor"/></svg>' : ''}
        </div>
        <div class="app-hero__meta">${app.category} • ${app.contentRating} • ${app.downloads} downloads</div>
      </div>
      <button class="app-hero__install" id="installBtn">Install</button>
    </div>

    <!-- Stats -->
    <div class="stats">
      <div class="stats__col">
        <div class="stats__value">${stars(app.rating)} ${app.rating.toFixed(1)}</div>
        <div class="stats__label">${app.reviews} reviews</div>
      </div>
      <div class="stats__col">
        <div class="stats__value" style="font-size:var(--fs-lg)">${app.downloads}</div>
        <div class="stats__label">Downloads</div>
      </div>
      <div class="stats__col">
        <div class="stats__value" style="font-size:var(--fs-lg)">${app.contentRating}</div>
        <div class="stats__label">Content rating</div>
      </div>
    </div>

    <!-- Screenshots -->
    <div class="screenshots">
      <h3 class="screenshots__title">Screenshots</h3>
      <div class="screenshots__row">
        ${(app.screenshots || []).map((s, i) => `
          <div class="screenshots__card">
            <img src="${s}" onerror="this.outerHTML='<svg viewBox=\\'0 0 180 360\\'><rect width=\\'180\\' height=\\'360\\' fill=\\'var(--color-surface-variant)\\'/><text x=\\'90\\' y=\\'180\\' text-anchor=\\'middle\\' fill=\\'var(--color-on-surface-faint)\\' font-size=\\'14\\'>Screenshot ${i+1}</text></svg>'" alt="Screenshot ${i+1}">
          </div>`).join('')}
      </div>
    </div>

    <!-- Description -->
    <div class="description">
      <div class="description__header">
        <h3 class="description__title">About this app</h3>
        <button class="description__toggle" id="descToggle">Show more</button>
      </div>
      <div class="description__text collapsed" id="descText">${app.description || 'No description available.'}</div>
    </div>

    <!-- Reviews -->
    <div class="reviews">
      <div class="reviews__header">
        <div class="reviews__score">
          <div class="reviews__score-val">${app.rating.toFixed(1)}</div>
          <div class="reviews__score-stars">${stars(app.rating)}</div>
        </div>
        <div class="reviews__count">${app.reviews} reviews</div>
      </div>

      <!-- Breakdown -->
      <div class="breakdown">
        ${[5,4,3,2,1].map(r => `
          <div class="breakdown__row">
            <span class="breakdown__label">${r}</span>
            <div class="breakdown__bar">
              <div class="breakdown__fill" style="width:${(counts[r]/total)*100}%"></div>
            </div>
            <span class="breakdown__count">${counts[r]}</span>
          </div>`).join('')}
      </div>

      <!-- Review Cards -->
      ${(app.fakeReviews || []).map(r => `
        <div class="review">
          <div class="review__avatar" style="background:${avatarColor(r.author)}">${initials(r.author)}</div>
          <div class="review__body">
            <div class="review__meta">
              <span class="review__author">${r.author}</span>
              <span class="review__date">Just now</span>
            </div>
            <div class="review__stars">${starsSmall(r.rating)}</div>
            <p class="review__text">${r.text}</p>
            <div class="review__helpful">${(r.helpful || 0).toLocaleString()} found this helpful</div>
          </div>
        </div>`).join('')}
    </div>

    <!-- Info Grid -->
    <div class="info">
      <h3 class="section__title" style="margin-bottom:var(--sp-4)">Additional info</h3>
      <div class="info__grid">
        <div><div class="info__label">Updated</div><div class="info__value">${app.updated || 'N/A'}</div></div>
        <div><div class="info__label">Released</div><div class="info__value">${app.released || 'N/A'}</div></div>
        <div><div class="info__label">Category</div><div class="info__value">${app.category}</div></div>
        <div><div class="info__label">Developer</div><div class="info__value">${app.developer}</div></div>
        <div><div class="info__label">Downloads</div><div class="info__value">${app.downloads}</div></div>
        <div><div class="info__label">Content Rating</div><div class="info__value">${app.contentRating}</div></div>
      </div>
    </div>

    <!-- Security Warning (Educational) -->
    <div style="padding:var(--sp-5);background:var(--color-primary-container);margin:var(--sp-5);border-radius:var(--r-xl)">
      <h3 style="margin-bottom:var(--sp-2)">🔒 Security Training Note</h3>
      <p style="font-size:var(--fs-sm);color:var(--color-on-primary-container);line-height:1.6">
        This app listing is part of an <strong>educational security awareness project</strong>.
        The reviews shown are simulated examples. In a real store, always verify the developer,
        read multiple reviews for patterns, and check what permissions an app requests before installing.
      </p>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="var(--color-primary)"/><path d="M10 8l6 8-6 8h4l6-8-6-8h-4z" fill="white"/></svg>
          <span>ModPlay</span>
        </div>
        <div class="footer__links">
          <a href="/">Home</a>
          <a href="#">About</a>
          <a href="#">Security Training</a>
        </div>
        <div class="footer__meta">Custom APK Distribution • Educational Use Only</div>
      </div>
    </footer>
  `;

  // ── Event Listeners ──
  // Description toggle
  const descText = document.getElementById('descText');
  const descToggle = document.getElementById('descToggle');
  descToggle.addEventListener('click', () => {
    descText.classList.toggle('collapsed');
    descToggle.textContent = descText.classList.contains('collapsed') ? 'Show more' : 'Show less';
  });

  // Install button
  let downloading = false;
  const installBtn = document.getElementById('installBtn');
  const mobileInstall = document.getElementById('mobileInstall');

  function handleInstall() {
    if (downloading) return;
    downloading = true;
    installBtn.textContent = 'Downloading...';
    installBtn.classList.add('downloading');
    if (mobileInstall) mobileInstall.textContent = 'Downloading...';

    setTimeout(() => {
      const link = document.createElement('a');
      link.href = `${getBaseUrl()}apks/${app.key}.apk`;
      link.download = `${app.name}.apk`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      installBtn.textContent = 'Installed';
      if (mobileInstall) mobileInstall.textContent = 'Installed';

      setTimeout(() => {
        downloading = false;
        installBtn.textContent = 'Install';
        installBtn.classList.remove('downloading');
        if (mobileInstall) mobileInstall.textContent = 'Install';
      }, 3000);
    }, 1200);
  }

  installBtn.addEventListener('click', handleInstall);
  if (mobileInstall) mobileInstall.addEventListener('click', handleInstall);

  // Mobile bar
  const mobileBar = document.getElementById('mobileBar');
  if (window.innerWidth <= 768) {
    mobileBar.style.display = 'flex';
    document.getElementById('mobileIcon').innerHTML = `<svg viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="8" fill="${app.accentColor || '#01875f'}"/><text x="18" y="23" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="sans-serif">${app.name.charAt(0)}</text></svg>`;
    document.getElementById('mobileName').textContent = app.name;
    document.getElementById('mobileDev').textContent = app.developer;
  }
}

init();
