// App page functionality
import { getBaseUrl, loadAppsData, getAppFromUrl } from './utils.js';

let currentApp = null;
let appsData = [];

// DOM elements
const installButton = document.querySelector('.install-button');
const installButtonSmall = document.querySelector('.install-button-small');
const appNameElement = document.querySelector('.app-name-large');
const developerElement = document.querySelector('.developer-row');
const verifiedBadge = document.querySelector('.verified-badge');
const statsRating = document.querySelector('.stat-rating');
const statsValue = document.querySelector('.stat-value');
const statsLabel = document.querySelector('.stat-label');
const screenshotCarousel = document.querySelector('.screenshot-carousel');
const aboutText = document.querySelector('.about-text');
const aboutToggle = document.querySelector('.about-toggle');
const reviewsScoreValue = document.querySelector('.reviews-score-value');
const reviewsScoreStars = document.querySelector('.reviews-score-stars');
const reviewsCount = document.querySelector('.reviews-count');
const ratingBreakdown = document.querySelector('.breakdown-fill');
const reviewCardsContainer = document.querySelector('.review-card'); // Will be parent
const additionalInfoItems = document.querySelectorAll('.info-value');
const mobileInstallButton = document.querySelector('.install-button-small');

// State for download button
let isDownloading = false;
let downloadTimeout = null;

// Initialize app page
async function initAppPage() {
    try {
        // Load apps data
        appsData = await loadAppsData();
        
        // Get app from URL
        currentApp = getAppFromUrl(appsData);
        if (!currentApp) {
            document.body.innerHTML = '<h1>App not found</h1><a href="javascript:history.back()">Go back</a>';
            return;
        }
        
        // Set document title
        document.title = `${currentApp.name} - Google Play Store`;
        
        // Populate app data
        populateAppData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Handle collapsed/expanded description
        setupDescriptionToggle();
        
    } catch (error) {
        console.error('Error initializing app page:', error);
        document.body.innerHTML = '<h1>Error loading app</h1><a href="javascript:history.back()">Go back</a>';
    }
}

function populateAppData() {
    if (!currentApp) return;
    
    // App header
    appNameElement.textContent = currentApp.name;
    developerElement.innerHTML = `
        <span>${currentApp.developer}</span>
        ${currentApp.verified ? '<svg class="verified-badge" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.2l-3.5-3.5-.7.7 4.2 4.2 8-8-.7-.7z" fill="var(--md-sys-color-primary)"/></svg>' : ''}
    `;
    
    // Install button text
    installButton.textContent = 'INSTALL';
    installButtonSmall.textContent = 'INSTALL';
    
    // Stats row
    statsRating.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        star.className = 'star';
        star.setAttribute('viewBox', '0 0 24 24');
        star.setAttribute('fill', 'none');
        star.innerHTML = '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 18.36l-6.15-1.97L6.91 18.36l5-4.87L2 9.27l6.91-3.01L12 2z" fill="var(--md-sys-color-star)"/>';
        if (i < Math.floor(currentApp.rating)) {
            star.classList.add('full');
        } else if (i === Math.floor(currentApp.rating) && currentApp.rating % 1 !== 0) {
            star.classList.add('half');
        }
        statsRating.appendChild(star);
    }
    statsValue.textContent = currentApp.rating.toFixed(1);
    statsLabel.textContent = currentApp.reviews;
    
    // Screenshot carousel
    screenshotCarousel.innerHTML = '';
    currentApp.screenshots.forEach((screenshot, index) => {
        const screenshotCard = document.createElement('div');
        screenshotCard.className = 'screenshot-card';
        screenshotCard.innerHTML = `
            <img src="${screenshot}" onerror="this.onerror=null;this.outerHTML='<div class=\"screenshot-card\"><svg width=\"200\" height=\"400\" viewBox=\"0 0 200 400\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"200\" height=\"400\" fill=\"var(--md-sys-color-outline-variant)\"/><text x=\"100\" y=\"200\" text-anchor=\"middle\" dy=\"0.3em\" fill=\"var(--md-sys-color-on-surface-variant)\" font-size=\"16\">Screenshot ${index + 1}</text></svg></div>'">
        `;
        screenshotCarousel.appendChild(screenshotCard);
    });
    
    // Description
    aboutText.textContent = currentApp.description;
    
    // Reviews
    reviewsScoreValue.textContent = currentApp.rating.toFixed(1);
    reviewsScoreStars.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        star.className = 'star';
        star.setAttribute('viewBox', '0 0 24 24');
        star.setAttribute('fill', 'none');
        star.innerHTML = '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 18.36l-6.15-1.97L6.91 18.36l5-4.87L2 9.27l6.91-3.01L12 2z" fill="var(--md-sys-color-star)"/>';
        if (i < Math.floor(currentApp.rating)) {
            star.classList.add('full');
        } else if (i === Math.floor(currentApp.rating) && currentApp.rating % 1 !== 0) {
            star.classList.add('half');
        }
        reviewsScoreStars.appendChild(star);
    }
    reviewsCount.textContent = currentApp.reviews;
    
    // Rating breakdown (simplified - in real app would calculate from fakeReviews)
    const ratingCounts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    currentApp.fakeReviews.forEach(review => {
        ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
    });
    
    const breakdownRows = ratingBreakdown.closest('.rating-breakdown').querySelectorAll('.breakdown-row');
    breakdownRows.forEach((row, index) => {
        const rating = 5 - index;
        const count = ratingCounts[rating] || 0;
        const percentage = (count / currentApp.fakeReviews.length) * 100;
        row.querySelector('.breakdown-fill').style.width = `${percentage}%`;
        row.querySelector('.breakdown-count').textContent = count;
    });
    
    // Review cards
    const reviewsContainer = document.querySelector('.reviews-section');
    // Clear existing review cards (except template)
    const existingCards = reviewsContainer.querySelectorAll('.review-card:not([data-template])');
    existingCards.forEach(card => card.remove());
    
    // Add fake reviews
    currentApp.fakeReviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
            <div class="review-avatar">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="${getAvatarColor(review.author)}" stroke-width="1.5"/>
                    <text x="12" y="16" text-anchor="middle" fill="${getAvatarColor(review.author)}" font-size="10" font-weight="bold">${getInitials(review.author)}</text>
                </svg>
            </div>
            <div class="review-content">
                <div class="review-header">
                    <span class="review-author">${review.author}</span>
                    <span class="review-date">Just now</span>
                </div>
                <div class="review-stars">
                    ${Array(5).fill(0).map((_, i) => i < review.rating ? '<svg class="star" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 18.36l-6.15-1.97L6.91 18.36l5-4.87L2 9.27l6.91-3.01L12 2z" fill="var(--md-sys-color-star)"/></svg>' : '<svg class="star" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 18.36l-6.15-1.97L6.91 18.36l5-4.87L2 9.27l6.91-3.01L12 2z" fill="none" stroke="var(--md-sys-color-outline)" stroke-width="1.5"/></svg>').join('')}
                </div>
                <p class="review-text">${review.text}</p>
                <div class="review-helpful">${review.helpful.toLocaleString()} found this helpful</div>
            </div>
        `;
        reviewsContainer.appendChild(reviewCard);
    });
    
    // Additional info
    const infoValues = document.querySelectorAll('.info-value');
    if (infoValues.length >= 4) {
        infoValues[0].textContent = currentApp.updated;
        infoValues[1].textContent = currentApp.released;
        infoValues[2].textContent = currentApp.category;
        infoValues[3].textContent = currentApp.developer;
    }
    
    // Set up install button
    setupInstallButton();
}

function getAvatarColor(name) {
    // Simple hash function to generate consistent colors
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#01875f', '#FF6D00', '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1', '#955251', '#B565A7'];
    return colors[Math.abs(hash) % colors.length];
}

function getInitials(name) {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
}

function setupEventListeners() {
    // Back button (handled by history.back() in template)
    const backButton = document.querySelector('.app-back-button');
    if (backButton) {
        backButton.addEventListener('click', () => history.back());
    }
    
    // Description toggle
    if (aboutToggle) {
        aboutToggle.addEventListener('click', toggleDescription);
    }
    
    // Install buttons
    if (installButton) {
        installButton.addEventListener('click', handleInstallClick);
    }
    if (installButtonSmall) {
        installButtonSmall.addEventListener('click', handleInstallClick);
    }
}

function toggleDescription() {
    aboutText.classList.toggle('collapsed');
    aboutToggle.textContent = aboutText.classList.contains('collapsed') ? 'Show more' : 'Show less';
}

function setupInstallButton() {
    isDownloading = false;
    installButton.textContent = 'INSTALL';
    installButtonSmall.textContent = 'INSTALL';
    installButton.disabled = false;
    installButtonSmall.disabled = false;
    
    // Reset any ongoing animations
    installButton.classList.remove('active');
    installButtonSmall.classList.remove('active');
}

function handleInstallClick() {
    if (isDownloading) return;
    
    isDownloading = true;
    
    // Update both buttons
    installButton.textContent = 'DOWNLOADING...';
    installButtonSmall.textContent = 'DOWNLOADING...';
    installButton.disabled = true;
    installButtonSmall.disabled = true;
    
    // Add ripple effect
    installButton.classList.add('active');
    installButtonSmall.classList.add('active');
    
    // Simulate download delay
    downloadTimeout = setTimeout(() => {
        triggerDownload();
    }, 1200);
}

function triggerDownload() {
    // Change to downloading state
    installButton.textContent = 'DOWNLOADING...';
    installButtonSmall.textContent = 'DOWNLOADING...';
    
    // Create download link
    const apkUrl = `${getBaseUrl()}apks/${currentApp.key}.apk`;
    const downloadLink = document.createElement('a');
    downloadLink.href = apkUrl;
    downloadLink.download = `${currentApp.name}.apk`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Set timeout for downloaded state
    setTimeout(() => {
        installButton.textContent = 'DOWNLOADED';
        installButtonSmall.textContent = 'DOWNLOADED';
        
        // Reset after 2.5s
        setTimeout(() => {
            setupInstallButton();
        }, 2500);
    }, 800);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAppPage);