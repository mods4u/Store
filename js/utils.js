// utils.js - shared utility functions
export function getBaseUrl() {
    const path = window.location.pathname;
    const hostname = window.location.hostname;
    const parts = path.split('/').filter(p => p !== '');

    // If we're on github.io, detect repo name from pathname
    if (hostname.includes('github.io')) {
        // pathname could be /, /repo/, or /repo/apps.json
        if (parts.length >= 1 && parts[0] !== '') {
            // We're on a repo subpath: use /repo/ as base
            return `/${parts[0]}/`;
        }
    }

    // Fallback to root
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