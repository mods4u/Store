// utils.js - shared utility functions
export function getBaseUrl() {
    const path = window.location.pathname;
    const parts = path.split('/');
    // If we're on github.io, the repo name is parts[1]
    if (parts.length > 2 && parts[1] !== '' && parts[2] !== '') {
        return `/${parts[1]}/`;
    }
    return '/';
}

export async function loadAppsData() {
    const response = await fetch(`${getBaseUrl()}apps.json`);
    if (!response.ok) {
        throw new Error(`Failed to load apps data: ${response.status}`);
    }
    return await response.json();
}

export function getAppFromUrl(apps) {
    const path = window.location.pathname;
    // Remove leading/trailing slashes and split
    const parts = path.split('/').filter(part => part !== '');
    // Expected format: [repo, appKey] or [appKey] depending on base URL
    // We'll look for the app key in the apps array by matching the second-to-last or last part
    const appKey = parts[parts.length - 2] || parts[parts.length - 1];
    return apps.find(app => app.key === appKey) || null;
}