// Storefront main.js
import { getBaseUrl } from './utils.js';

// Fetch apps data and render storefront
async function renderStorefront() {
    try {
        const response = await fetch(`${getBaseUrl()}apps.json`);
        const apps = await response.json();
        
        // Show skeleton for 800ms
        const skeletonLoader = document.getElementById('skeleton-loader');
        const storefrontContent = document.getElementById('storefront-content');
        
        setTimeout(() => {
            skeletonLoader.style.display = 'none';
            storefrontContent.style.display = 'block';
            
            // Render featured carousel (featured && editorChoice)
            const featuredApps = apps.filter(app => app.featured && app.editorChoice);
            renderFeaturedCarousel(featuredApps, storefrontContent);
            
            // Render category rows
            renderCategoryRow('Recommended for you', apps.slice(0, 6), storefrontContent); // Just first 6 for demo
            renderCategoryRow('Top charts', [...apps].sort((a, b) => {
                // Parse download strings like "500M+" -> numeric value for sorting
                const parseDownloads = (str) => {
                    const num = parseFloat(str);
                    if (str.endsWith('B+')) return num * 1000;
                    if (str.endsWith('M+')) return num;
                    return num;
                };
                return parseDownloads(b.downloads) - parseDownloads(a.downloads);
            }).slice(0, 6), storefrontContent);
            
            renderCategoryRow('Trending apps', [...apps].sort((a, b) => b.rating - a.rating).slice(0, 6), storefrontContent);
            renderCategoryRow('New & updated', [...apps].sort((a, b) => new Date(b.updated) - new Date(a.updated)).slice(0, 6), storefrontContent);
        }, 800);
    } catch (error) {
        console.error('Error loading apps data:', error);
        document.getElementById('skeleton-loader').innerHTML = '<p>Failed to load apps data</p>';
    }
}

function renderFeaturedCarousel(apps, container) {
    const carousel = document.createElement('div');
    carousel.className = 'featured-carousel';
    carousel.innerHTML = `<h2 class="section-title">Editor's Choice</h2>`;
    
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel-container';
    
    apps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card featured-card';
        card.innerHTML = `
            <div class="featured-image">
                <img src="${app.screenshots[0]}" onerror="this.onerror=null;this.src='https://via.placeholder.com/320x200/01875f/fff?text=No+Image'" alt="${app.name}">
            </div>
            <div class="featured-content">
                <div class="featured-badges">
                    <span class="featured-badge">Editor's Choice</span>
                </div>
                <h3 class="featured-title">${app.name}</h3>
                <p class="featured-developer">${app.developer}</p>
            </div>
        `;
        card.onclick = () => {
            window.location.href = `${getBaseUrl()}${app.key}/`;
        };
        carouselContainer.appendChild(card);
    });
    
    carousel.appendChild(carouselContainer);
    container.appendChild(carousel);
}

function renderCategoryRow(title, apps, container) {
    const section = document.createElement('div');
    section.className = 'category-row';
    section.innerHTML = `<h2 class="section-title">${title}</h2>`;
    
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel-container';
    
    apps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.innerHTML = `
            <div class="app-icon">
                <img src="${getBaseUrl()}assets/icons/${app.key}.png" onerror="this.onerror=null;this.outerHTML='<div class=\"app-icon\"><svg width=\"48\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"${app.accentColor || \"#01875f\"}\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" fill=\"white\" font-size=\"16\" font-weight=\"bold\">${app.name.charAt(0).toUpperCase()}</text></svg></div>'">
            </div>
            <div class="app-info">
                <div class="app-name">${app.name}</div>
                <div class="app-developer">${app.developer}</div>
                <div class="app-rating">
                    <svg class="star" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 18.36l-6.15-1.97L6.91 18.36l5-4.87L2 9.27l6.91-3.01L12 2z" fill="var(--md-sys-color-star)"/></svg>
                    <span>${app.rating}</span>
                </div>
            </div>
        `;
        card.onclick = () => {
            window.location.href = `${getBaseUrl()}${app.key}/`;
        };
        carouselContainer.appendChild(card);
    });
    
    section.appendChild(carouselContainer);
    container.appendChild(section);
}

// Utility to get base URL for GitHub Pages
function getBaseUrl() {
    const path = window.location.pathname;
    const parts = path.split('/');
    // If we're on github.io, the repo name is parts[1]
    if (parts.length > 2 && parts[1] !== '' && parts[2] !== '') {
        return `/${parts[1]}/`;
    }
    return '/';
}

// Initialize
renderStorefront();