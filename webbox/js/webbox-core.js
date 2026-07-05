    const fabContainer = document.getElementById('fab-container');
    const fabMain = document.getElementById('fab-main');
    const fabActionsContainer = document.getElementById('fab-actions-container');
    const launcherScreen = document.getElementById('phone-screen');
    const appViewer = document.getElementById('app-viewer');
    const appIframe = document.getElementById('app-iframe-main');
const appGrid = document.getElementById('app-grid');
const toastMsg = document.getElementById('toast-msg');

let currentOpenAppId = null;
let progressSaveInterval = null;

    
    const addAppModal = document.getElementById('add-app-modal');
    const addAppForm = document.getElementById('add-app-form');
    const cancelAddAppBtn = document.getElementById('cancel-add-app');
    const settingsModal = document.getElementById('settings-modal'); 
    const settingsAppList = document.getElementById('settings-app-list'); 
    const closeSettingsModalBtn = document.getElementById('close-settings-modal'); 

    const statusTimeEl = document.getElementById('status-time');
    const widgetGreetingEl = document.getElementById('widget-greeting');
    const widgetDateEl = document.getElementById('widget-date');
    const widgetTimeEl = document.getElementById('widget-time');
    
const STORAGE_KEY = 'ephone_custom_apps_desktop';
const RECYCLE_BIN_KEY = 'ephone_recycle_bin';
const LARGE_ICONS_KEY = 'ephone_large_icons'; 
const RECYCLE_BIN_SETTINGS_KEY = 'ephone_recycle_bin_settings';
const LAYOUT_KEY = 'ephone_layout_settings';
const FAB_ICON_KEY = 'ephone_fab_icon'; 
const FAB_SHAPE_KEY = 'ephone_fab_shape'; 
const FAB_EXPANDED_ICON_KEY = 'ephone_fab_expanded_icon'; 
const FAB_DRAG_ICON_KEY = 'ephone_fab_drag_icon'; 
const FONT_SETTINGS_KEY = 'ephone_font_settings';
const DOCK_APPS_KEY = 'ephone_dock_apps';
const ICON_SHAPE_KEY = 'ephone_icon_shape';
const FAB_SIZE_KEY = 'ephone_fab_size';
const TIME_WIDGET_STYLE_KEY = 'ephone_time_widget_style'; 
const FAB_WAKE_METHOD_KEY = 'ephone_fab_wake_method'; 
const defaultDockAppIcons = {};

async function getDockApps() {
    const saved = await localforage.getItem(DOCK_APPS_KEY);
    
    const initialDockApps = [
        { id: 'dock_settings', name: '设置', icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="#333"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61-.25-1.17-.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12-.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`, isDock: true },
        { id: 'dock_import_export', name: '数据管理', icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="#333"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>`, isDock: true },
        { id: 'dock_theme', name: '主题', icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="#333"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`, isDock: true }
    ];

    initialDockApps.forEach(app => {
        defaultDockAppIcons[app.id] = app.icon;
    });

    if (saved) {
        return saved;
    } else {
        await localforage.setItem(DOCK_APPS_KEY, initialDockApps);
        return initialDockApps;
    }
}

async function saveDockApps(apps) {
    return localforage.setItem(DOCK_APPS_KEY, apps);
}

async function applyAndSaveFabDragIcon(iconUrl) {
    await localforage.setItem(FAB_DRAG_ICON_KEY, iconUrl);
    await updateFabIcon();
}

function updateFabIconSettingsUI() {
    const isEnabled = document.getElementById('fab-shape-toggle').checked;
    const expandedSection = document.getElementById('fab-expanded-icon-section');
    const dragSection = document.getElementById('fab-drag-icon-section');

    if (isEnabled) {
        expandedSection.classList.remove('settings-section-disabled');
        dragSection.classList.remove('settings-section-disabled');
    } else {
        expandedSection.classList.add('settings-section-disabled');
        dragSection.classList.add('settings-section-disabled');
    }
}
async function applyAndSaveFabExpandedIcon(iconUrl) {
    await localforage.setItem(FAB_EXPANDED_ICON_KEY, iconUrl);
    await updateFabIcon();
}

async function restoreDefaultExpandedFabIcon() {
    await localforage.removeItem(FAB_EXPANDED_ICON_KEY);
    await updateFabIcon();
    showToast('已恢复默认展开图标');
}
const pageIndicators = document.getElementById('page-indicators');
const menuIconSvg = '<svg viewBox="0 0 24 24"><path d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1z"/></svg>';
    const closeIconSvg = '<svg viewBox="0 0 24 24"><path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7a.996.996 0 1 0-1.41 1.41L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/></svg>';
    
async function updateFabIcon(options = {}) {
    const { state } = options;

    const savedIcon = await localforage.getItem(FAB_ICON_KEY);
    const savedExpandedIcon = await localforage.getItem(FAB_EXPANDED_ICON_KEY);
    const savedDragIcon = await localforage.getItem(FAB_DRAG_ICON_KEY);
    const fabShapeIsOriginal = await localforage.getItem(FAB_SHAPE_KEY) || false;
    const isExpanded = fabMain.classList.contains('expanded');

    fabMain.classList.remove('custom-icon-mode', 'original-shape-mode', 'custom-expanded-mode');

    if (state === 'dragging' && savedDragIcon && fabShapeIsOriginal) {
        fabMain.classList.add('custom-icon-mode', 'original-shape-mode');
        fabMain.innerHTML = `<img src="${savedDragIcon}" alt="dragging">`;

    } else if (isExpanded) {
        if (savedExpandedIcon && fabShapeIsOriginal) {
            fabMain.classList.add('custom-icon-mode', 'original-shape-mode', 'custom-expanded-mode');
            fabMain.innerHTML = `<img src="${savedExpandedIcon}" alt="close">`;
        } else if (savedIcon && fabShapeIsOriginal) {
            fabMain.classList.add('custom-icon-mode', 'original-shape-mode', 'custom-expanded-mode');
            fabMain.innerHTML = `<img src="${savedIcon}" alt="menu">`;
        } else {
            fabMain.innerHTML = closeIconSvg;
        }
    } else {
        if (savedIcon) {
            fabMain.classList.add('custom-icon-mode');
            if (fabShapeIsOriginal) {
                fabMain.classList.add('original-shape-mode');
            }
            fabMain.innerHTML = `<img src="${savedIcon}" alt="menu">`;
        } else {
            fabMain.innerHTML = menuIconSvg;
        }
    }
}


async function getApps() { const defaultApps = []; const apps = await localforage.getItem(STORAGE_KEY); return apps || defaultApps; }
    async function saveApps(apps) { return localforage.setItem(STORAGE_KEY, apps); }
    
async function getLargeIcons() {
    const largeIcons = await localforage.getItem(LARGE_ICONS_KEY);
    return largeIcons || { slot1: null, slot2: null }; 
}

async function saveLargeIcons(largeIcons) {
    return localforage.setItem(LARGE_ICONS_KEY, largeIcons);
}

async function setLargeIcon(slotNumber, appId) {
    const largeIcons = await getLargeIcons();
    largeIcons[`slot${slotNumber}`] = appId;
    await saveLargeIcons(largeIcons);
}

async function removeLargeIcon(slotNumber) {
    const largeIcons = await getLargeIcons();
    largeIcons[`slot${slotNumber}`] = null;
    await saveLargeIcons(largeIcons);
}

let paginationTouchHandlers = null;

async function renderUI() {
    const apps = await getApps();
    apps.sort((a, b) => b.lastUsed - a.lastUsed);
    
    const layoutSettings = await localforage.getItem(LAYOUT_KEY) || { mode: 'scroll' };

    appGrid.innerHTML = '';
    pageIndicators.innerHTML = '';
    appGrid.className = '';
    appGrid.removeAttribute('style');
    
    if (paginationTouchHandlers) {
        appGrid.removeEventListener('wheel', paginationTouchHandlers.wheel);
        appGrid.removeEventListener('touchstart', paginationTouchHandlers.touchstart);
        appGrid.removeEventListener('touchmove', paginationTouchHandlers.touchmove);
        appGrid.removeEventListener('touchend', paginationTouchHandlers.touchend);
        paginationTouchHandlers = null;
    }

if (layoutSettings.mode === 'pagination') {
    pageIndicators.style.display = 'flex';
    appGrid.className = 'layout-pagination';

    const largeIcons = await getLargeIcons();
    
    const FIRST_PAGE_SMALL_ICONS = 8;  
    const OTHER_PAGE_ICONS = 16;       
    
    let smallIconApps = apps.filter(a => a.id !== largeIcons.slot1 && a.id !== largeIcons.slot2);
    
    let pageCount = 1; 
    if (smallIconApps.length > FIRST_PAGE_SMALL_ICONS) {
        const remainingApps = smallIconApps.length - FIRST_PAGE_SMALL_ICONS;
        const extraPages = Math.ceil(remainingApps / OTHER_PAGE_ICONS);
        pageCount = 1 + extraPages;
    }

    for (let i = 0; i < pageCount; i++) {
        const page = document.createElement('div');
        page.className = 'app-page';
        
if (i === 0) {
        if (largeIcons.slot1) {
    const app = apps.find(a => a.id === largeIcons.slot1);
    if (app) {
        page.innerHTML += `<div class="app-icon large-icon large-icon-slot1" onclick="openApp('${app.id}')" oncontextmenu="showLargeIconMenu(event, 1); return false;"><div class="icon-image"><img src="${app.icon}" alt="${app.name}" onerror="this.src='logo.png'"/></div><span class="icon-label">${app.name}</span></div>`;
    }
} else {
    page.innerHTML += `<div class="large-icon-placeholder placeholder-slot1" onclick="showSelectAppForLargeIcon(1)"><svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg><span>添加常用应用</span></div>`;
}
        
if (largeIcons.slot2) {
    const app = apps.find(a => a.id === largeIcons.slot2);
    if (app) {
        page.innerHTML += `<div class="app-icon large-icon large-icon-slot2" onclick="openApp('${app.id}')" oncontextmenu="showLargeIconMenu(event, 2); return false;"><div class="icon-image"><img src="${app.icon}" alt="${app.name}" onerror="this.src='logo.png'"/></div><span class="icon-label">${app.name}</span></div>`;
    }
} else {
    page.innerHTML += `<div class="large-icon-placeholder placeholder-slot2" onclick="showSelectAppForLargeIcon(2)"><svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg><span>添加常用应用</span></div>`;
}
    
    const firstPageApps = smallIconApps.slice(0, FIRST_PAGE_SMALL_ICONS);
firstPageApps.forEach(app => {
    page.innerHTML += `<div class="app-icon" onclick="openApp('${app.id}')"><div class="icon-image"><img src="${app.icon}" alt="${app.name}" onerror="this.src='logo.png'"/></div><span class="icon-label">${app.name}</span></div>`;
});
} else {
            
            const startIndex = FIRST_PAGE_SMALL_ICONS + (i - 1) * OTHER_PAGE_ICONS;
            const endIndex = startIndex + OTHER_PAGE_ICONS;
            const pageApps = smallIconApps.slice(startIndex, endIndex);
            
            pageApps.forEach(app => {
    page.innerHTML += `<div class="app-icon" onclick="openApp('${app.id}')"><div class="icon-image"><img src="${app.icon}" alt="${app.name}" onerror="this.src='logo.png'"/></div><span class="icon-label">${app.name}</span></div>`;
});
        }
        
        appGrid.appendChild(page);
        
        const dot = document.createElement('div');
        dot.className = 'page-dot';
        pageIndicators.appendChild(dot);
    }
    
    if (pageIndicators.children.length > 0) {
        pageIndicators.children[0].classList.add('active');
    }

    appGrid.onscroll = () => {
        const currentPage = Math.round(appGrid.scrollLeft / appGrid.clientWidth);
        for (let i = 0; i < pageIndicators.children.length; i++) {
            pageIndicators.children[i].classList.toggle('active', i === currentPage);
        }
    };

    let isWheeling = false;
    let touchStartX = 0;
    const swipeThreshold = 50;

    const wheelHandler = (e) => {
        if (isWheeling) return;
        e.preventDefault();
        const currentPage = Math.round(appGrid.scrollLeft / appGrid.clientWidth);
        if (e.deltaX > 0 || e.deltaY > 0) {
            if (currentPage < pageCount - 1) {
                appGrid.scrollTo({ left: (currentPage + 1) * appGrid.clientWidth, behavior: 'smooth' });
            }
        } else {
            if (currentPage > 0) {
                appGrid.scrollTo({ left: (currentPage - 1) * appGrid.clientWidth, behavior: 'smooth' });
            }
        }
        isWheeling = true;
        setTimeout(() => { isWheeling = false; }, 500);
    };

    const touchstartHandler = (e) => {
        touchStartX = e.touches[0].clientX;
    };

    const touchmoveHandler = (e) => {
        e.preventDefault();
    };

    const touchendHandler = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchEndX - touchStartX;
        const currentPage = Math.round(appGrid.scrollLeft / appGrid.clientWidth);

        let targetPage = currentPage;
        if (deltaX < -swipeThreshold) {
            targetPage = Math.min(currentPage + 1, pageCount - 1);
        } else if (deltaX > swipeThreshold) {
            targetPage = Math.max(currentPage - 1, 0);
        }

        appGrid.scrollTo({ left: targetPage * appGrid.clientWidth, behavior: 'smooth' });
    };

    appGrid.addEventListener('wheel', wheelHandler);
    appGrid.addEventListener('touchstart', touchstartHandler);
    appGrid.addEventListener('touchmove', touchmoveHandler, { passive: false });
    appGrid.addEventListener('touchend', touchendHandler);

    paginationTouchHandlers = {
        wheel: wheelHandler,
        touchstart: touchstartHandler,
        touchmove: touchmoveHandler,
        touchend: touchendHandler
    };
} else {
    pageIndicators.style.display = 'none';
    appGrid.className = 'layout-scroll';
    
    const largeIcons = await getLargeIcons();
    
        if (largeIcons.slot1) {
    const app = apps.find(a => a.id === largeIcons.slot1);
    if (app) {
        appGrid.innerHTML += `<div class="app-icon large-icon large-icon-slot1" onclick="openApp('${app.id}')" oncontextmenu="showLargeIconMenu(event, 1); return false;"><div class="icon-image"><img src="${app.icon}" alt="${app.name}" onerror="this.src='logo.png'"/></div><span class="icon-label">${app.name}</span></div>`;
    }
} else {
    appGrid.innerHTML += `<div class="large-icon-placeholder placeholder-slot1" onclick="showSelectAppForLargeIcon(1)"><svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg><span>添加常用应用</span></div>`;
}
        
if (largeIcons.slot2) {
    const app = apps.find(a => a.id === largeIcons.slot2);
    if (app) {
        appGrid.innerHTML += `<div class="app-icon large-icon large-icon-slot2" onclick="openApp('${app.id}')" oncontextmenu="showLargeIconMenu(event, 2); return false;"><div class="icon-image"><img src="${app.icon}" alt="${app.name}" onerror="this.src='logo.png'"/></div><span class="icon-label">${app.name}</span></div>`;
    }
} else {
    appGrid.innerHTML += `<div class="large-icon-placeholder placeholder-slot2" onclick="showSelectAppForLargeIcon(2)"><svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg><span>添加常用应用</span></div>`;
}
    
let appsToRender = apps.filter(app => app.id !== largeIcons.slot1 && app.id !== largeIcons.slot2);

appsToRender.forEach(app => {
    const appHtml = `<div class="app-icon" onclick="openApp('${app.id}')"><div class="icon-image"><img src="${app.icon}" alt="${app.name}" onerror="this.src='logo.png'"/></div><span class="icon-label">${app.name}</span></div>`;
    appGrid.innerHTML += appHtml;
});
}

fabActionsContainer.innerHTML = '';

const largeIcons = await getLargeIcons();
const fabApps = [];
const fabAppIds = new Set();
const MAX_FAB_APPS = 3; 

[largeIcons.slot1, largeIcons.slot2].forEach(appId => {
    if (appId && !fabAppIds.has(appId) && appId !== currentOpenAppId) {
        const app = apps.find(a => a.id === appId);
        if (app) {
            fabApps.push(app);
            fabAppIds.add(appId);
        }
    }
});

for (const app of apps) {
    if (fabApps.length >= MAX_FAB_APPS) break;
    if (!fabAppIds.has(app.id) && app.id !== currentOpenAppId && app.lastUsed > 0) {
        fabApps.push(app);
        fabAppIds.add(app.id);
    }
}

fabApps.forEach(app => {
    const isCommonApp = (app.id === largeIcons.slot1 || app.id === largeIcons.slot2);
    const indicatorClass = isCommonApp ? ' common-app-indicator' : '';

    const actionHtml = `<div class="fab-action-btn" onclick="openApp('${app.id}')"><span class="fab-label">${app.name}</span><div class="fab-mini-btn${indicatorClass}"><img src="${app.icon}" alt="${app.name}" onerror="this.src='logo.png'"/></div></div>`;
    fabActionsContainer.innerHTML += actionHtml;
});

const staticButtonsHtml = `
<div class="fab-action-btn" onclick="showMemoryModal()"><span class="fab-label">记忆</span><div class="fab-mini-btn"><svg viewBox="0 0 24 24" fill="#5D4037"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg></div></div>
<div class="fab-action-btn" onclick="showWorldBookModal()"><span class="fab-label">世界书</span><div class="fab-mini-btn"><svg viewBox="0 0 24 24" fill="#5D4037"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg></div></div>
<div class="fab-action-btn" onclick="showAddAppModal()"><span class="fab-label">添加应用</span><div class="fab-mini-btn"><svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg></div></div><div class="fab-action-btn" onclick="showMemoModal()"><span class="fab-label">备忘录</span><div class="fab-mini-btn"><svg viewBox="0 0 24 24" fill="#5D4037"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg></div></div><div class="fab-action-btn" onclick="showApiSettingsModal()"><span class="fab-label">API设置</span><div class="fab-mini-btn"><svg viewBox="0 0 24 24" fill="#5D4037"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div></div><div class="fab-action-btn" onclick="toggleFullScreen()"><span class="fab-label">全屏模式</span><div class="fab-mini-btn" id="fullscreen-icon-container"><svg viewBox="0 0 24 24" fill="#5D4037"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg></div></div><div class="fab-action-btn" onclick="hideFab()"><span class="fab-label">隐藏按钮</span><div class="fab-mini-btn"><svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg></div></div><div class="fab-action-btn" onclick="goHome()"><span class="fab-label">返回桌面</span><div class="fab-mini-btn"><svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></div></div>`;
fabActionsContainer.innerHTML += staticButtonsHtml; 
        await renderDockIcons(); 
}

async function renderDockIcons() {
    const dockApps = await getDockApps();
    const dockEl = document.getElementById('dock');
    dockEl.innerHTML = '';
    
    dockApps.forEach(app => {
        let onclick = '';
        if (app.id === 'dock_settings') onclick = 'showSettingsModal()';
        else if (app.id === 'dock_import_export') onclick = 'showImportExportModal()';
        else if (app.id === 'dock_theme') onclick = 'showThemeModal()';
        
        let iconHtml;
        if (app.icon.trim().startsWith('<svg')) {
            iconHtml = app.icon;
        } else {
            iconHtml = `<img src="${app.icon}" alt="${app.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">`;
        }
        
        dockEl.innerHTML += `
            <div class="dock-icon" onclick="${onclick}">
                ${iconHtml}
            </div>
        `;
    });
}

    async function showAddAppModal() { 
    addAppModal.classList.remove('hidden'); 
    setTimeout(() => {
        toggleAppSourceFields();
    }, 10);
}
    function hideAddAppModal() { addAppModal.classList.add('hidden'); addAppForm.reset(); }

function toggleAppSourceFields() {
    const appSource = document.querySelector('input[name="app-source"]:checked').value;
    const urlSection = document.getElementById('url-source-section');
    const fileSection = document.getElementById('file-source-section');
    const urlInput = document.getElementById('new-app-url');
    
    if (appSource === 'url') {
        urlSection.style.display = 'block';
        fileSection.style.display = 'none';
        urlInput.setAttribute('required', '');
    } else {
        urlSection.style.display = 'none';
        fileSection.style.display = 'block';
        urlInput.removeAttribute('required');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input[name="app-source"]').forEach(radio => {
        radio.addEventListener('change', toggleAppSourceFields);
    });
    toggleAppSourceFields();
});

function detectEncoding(uint8Array) {
    if (uint8Array.length >= 3 && uint8Array[0] === 0xEF && uint8Array[1] === 0xBB && uint8Array[2] === 0xBF) return 'UTF-8';
    if (uint8Array.length >= 2 && uint8Array[0] === 0xFF && uint8Array[1] === 0xFE) return 'UTF-16LE';
    if (uint8Array.length >= 2 && uint8Array[0] === 0xFE && uint8Array[1] === 0xFF) return 'UTF-16BE';
    
    let isValidUTF8 = true;
    for (let i = 0; i < Math.min(uint8Array.length, 1000); i++) {
        let byte = uint8Array[i];
        if (byte <= 0x7F) continue;
        else if (byte >= 0xC2 && byte <= 0xDF) {
            if (i + 1 >= uint8Array.length || (uint8Array[i + 1] & 0xC0) !== 0x80) { isValidUTF8 = false; break; }
            i += 1;
        } else if (byte >= 0xE0 && byte <= 0xEF) {
            if (i + 2 >= uint8Array.length || (uint8Array[i + 1] & 0xC0) !== 0x80 || (uint8Array[i + 2] & 0xC0) !== 0x80) { isValidUTF8 = false; break; }
            i += 2;
        } else if (byte >= 0xF0 && byte <= 0xF7) {
            if (i + 3 >= uint8Array.length || (uint8Array[i + 1] & 0xC0) !== 0x80 || (uint8Array[i + 2] & 0xC0) !== 0x80 || (uint8Array[i + 3] & 0xC0) !== 0x80) { isValidUTF8 = false; break; }
            i += 3;
        } else { isValidUTF8 = false; break; }
    }
    if (isValidUTF8) return 'UTF-8';
    return 'GBK';
}

function decodeText(arrayBuffer, encoding) {
    try {
        const decoder = new TextDecoder(encoding);
        return decoder.decode(arrayBuffer);
    } catch (e) {
        console.warn(`解码失败，编码: ${encoding}，回退到 UTF-8`, e);
        const decoder = new TextDecoder('UTF-8');
        return decoder.decode(arrayBuffer);
    }
}

function readFileAs(file, readAs) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        if (readAs === 'text') reader.readAsText(file);
        else if (readAs === 'arrayBuffer') reader.readAsArrayBuffer(file);
        else if (readAs === 'dataURL') reader.readAsDataURL(file);
        else reject(new Error('Invalid readAs type'));
    });
}

addAppForm.addEventListener('submit', async (event) => { 
    event.preventDefault(); 
    try {
        const name = document.getElementById('new-app-name').value.trim(); 
        if (!name) {
            showToast('请输入应用名称');
            return;
        }
        
        const appSource = document.querySelector('input[name="app-source"]:checked').value;
        const iconUrl = document.getElementById('new-app-icon-url').value; 
        const iconFile = document.getElementById('new-app-icon-file').files[0]; 
        
        const getIconData = async () => {
            if (iconFile) {
                return await readFileAs(iconFile, 'dataURL');
            }
            return iconUrl;
        };

        if (appSource === 'url') {
            let url = document.getElementById('new-app-url').value; 
            if (!url) { showToast('请输入网址'); return; }
            if (!url.startsWith('http')) { url = 'https://' + url; }
            
            let icon = await getIconData();
            if (!icon) {
                icon = `https://icon.horse/icon/${new URL(url).hostname}`;
            }
            await saveNewApp(name, url, icon, 'url', null); 

        } else if (appSource === 'file') {
            const localFile = document.getElementById('new-app-file').files[0];
            if (!localFile) {
                showToast('请选择一个本地文件');
                return;
            }
            
            let fileType = localFile.type;
            if (!fileType || fileType === '') {
                const fileName = localFile.name.toLowerCase();
                if (fileName.endsWith('.txt')) {
                    fileType = 'text/plain';
                } else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
                    fileType = 'text/html';
                }
            }
            
            let fileContent;
            if (fileType === 'text/plain') {
                const buffer = await readFileAs(localFile, 'arrayBuffer');
                const uint8Array = new Uint8Array(buffer);
                const encoding = detectEncoding(uint8Array);
                fileContent = decodeText(buffer, encoding);
            } else if (fileType === 'text/html') {
                const buffer = await readFileAs(localFile, 'arrayBuffer');
                const uint8Array = new Uint8Array(buffer);
                const encoding = detectEncoding(uint8Array);
                fileContent = decodeText(buffer, encoding);
            } else if (fileType.startsWith('text/')) {
                fileContent = await readFileAs(localFile, 'text');
            } else {
                const buffer = await readFileAs(localFile, 'arrayBuffer');
                fileContent = new Blob([buffer], { type: fileType });
            }

            let icon = await getIconData();
            if (!icon) {
                icon = 'logo.png';
            }
            
            await saveNewApp(name, fileContent, icon, 'file', fileType);
        }
    } catch (error) {
        console.error("添加应用失败:", error);
        showToast("操作失败，请检查文件或链接是否有效");
    }
});

async function saveNewApp(name, content, icon, sourceType, fileMimeType = null) { 
    const apps = await getApps(); 
    
    const newApp = { 
        id: 'app_' + Date.now(), 
        name, 
        icon, 
        lastUsed: 0,
        sourceType: sourceType,
        url: sourceType === 'url' ? content : null,
        fileContent: sourceType === 'file' ? content : null,
        fileType: fileMimeType,
        scrollPercentage: sourceType === 'file' ? 0 : null
    }; 
    apps.push(newApp); 
    await saveApps(apps); 
    showToast(`"${name}" 添加成功!`); 
    await renderUI(); 
    hideAddAppModal(); 
}
    cancelAddAppBtn.addEventListener('click', hideAddAppModal);

    async function showSettingsModal() {
    const apps = await getApps();
    const dockApps = await getDockApps();
    settingsAppList.innerHTML = '';
    
dockApps.forEach(app => {
    let iconHtml;
    if (app.icon.trim().startsWith('<svg')) {
        iconHtml = `<div style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">${app.icon.replace('width="28"', 'width="24"').replace('height="28"', 'height="24"')}</div>`;
    } else {
        iconHtml = `<img src="${app.icon}" alt="${app.name}">`;
    }

const itemHtml = `
    <div class="settings-app-item" style="background: #FFF2D6;">
        ${iconHtml}
        <span>${app.name} <small style="color:#999;">(系统)</small></span>
        <button class="change-icon-btn" onclick="showChangeIconModal('${app.id}', true)">更改</button>
        <button class="restore-app-btn" onclick="restoreDockAppIcon('${app.id}')">恢复</button>
    </div>
`;
    settingsAppList.innerHTML += itemHtml;
});
    
    if (apps.length === 0) {
        settingsAppList.innerHTML += '<p style="text-align:center; color:#999; padding:20px;">还没有其他应用</p>';
    } else {
        apps.forEach(app => {
            const itemHtml = `
                <div class="settings-app-item">
                    <img src="${app.icon}" alt="${app.name}">
                    <span>${app.name}</span>
                    <button class="change-icon-btn" onclick="showChangeIconModal('${app.id}', false)">更改</button>
                    <button class="delete-app-btn" onclick="deleteApp('${app.id}')">删除</button>
                </div>
            `;
            settingsAppList.innerHTML += itemHtml;
        });
    }
    settingsModal.style.display = 'flex';
    setTimeout(() => settingsModal.classList.add('active'), 10);
    closeMenu();
    fabContainer.style.display = 'none'; 
}

function hideSettingsModal() {
    settingsModal.classList.remove('active');
    setTimeout(() => {
        settingsModal.style.display = 'none';
        fabContainer.style.display = 'block'; 
    }, 300);
}

async function deleteApp(appId) {
    const recycleBinSettings = await localforage.getItem(RECYCLE_BIN_SETTINGS_KEY) || { ttl: 30 };
    const isImmediateDelete = (recycleBinSettings.ttl === 'immediate');
    
    let confirmMessage;
    if (isImmediateDelete) {
        confirmMessage = ' 立即删除模式已开启\n\n应用将被直接彻底删除，无法恢复！\n\n确定继续吗？';
    } else {
        confirmMessage = '删除的应用将移至回收站，您可以在回收站中恢复或彻底删除。';
    }
    
    const deleteConfirm = await customConfirm(confirmMessage);
    if (!deleteConfirm) return;

    const largeIcons = await getLargeIcons();
    let largeIconConfigChanged = false;

    if (largeIcons.slot1 === appId) {
        largeIcons.slot1 = null;
        largeIconConfigChanged = true;
    }
    if (largeIcons.slot2 === appId) {
        largeIcons.slot2 = null;
        largeIconConfigChanged = true;
    }

    if (largeIconConfigChanged) {
        await saveLargeIcons(largeIcons);
    }

    let apps = await getApps();
    const appToDelete = apps.find(app => app.id == appId);
    
    if (!appToDelete) {
        showToast('未找到该应用');
        return;
    }

    const updatedApps = apps.filter(app => app.id != appId);
    await saveApps(updatedApps);

    if (isImmediateDelete) {
        showToast(`"${appToDelete.name}" 已彻底删除`);
    } else {
        let recycleBinApps = await getRecycleBinApps();
        appToDelete.deletedTime = Date.now();
        recycleBinApps.push(appToDelete);
        await saveRecycleBinApps(recycleBinApps);
        showToast('应用已移至回收站');
    }
    
   await renderUI();
   await showSettingsModal();
}

document.getElementById('close-settings-modal-btn').addEventListener('click', hideSettingsModal);

const recycleBinModal = document.getElementById('recycle-bin-modal');
const recycleBinList = document.getElementById('recycle-bin-list');
const closeRecycleBinModalBtn = document.getElementById('close-recycle-bin-modal');

async function getRecycleBinApps() {
    const apps = await localforage.getItem(RECYCLE_BIN_KEY);
    return apps || [];
}

async function saveRecycleBinApps(apps) {
    return localforage.setItem(RECYCLE_BIN_KEY, apps);
}

async function showRecycleBinModal() {
    const recycleBinApps = await getRecycleBinApps();
    recycleBinList.innerHTML = '';
    
    if (recycleBinApps.length === 0) {
        recycleBinList.innerHTML = '<p style="text-align:center; color:#999; padding: 20px;">回收站是空的</p>';
    } else {
        recycleBinApps.forEach(app => {
    const deletedDate = new Date(app.deletedTime).toLocaleDateString();
    const itemHtml = `
        <div class="recycle-bin-item">
            <img src="${app.icon}" alt="${app.name}">
            <div style="flex-grow: 1;">
                <span>${app.name}</span>
                <p class="deleted-date">删除于: ${deletedDate}</p>
            </div>
            <button class="restore-app-btn" onclick="restoreApp('${app.id}')">恢复</button>
            <button class="permanently-delete-btn" onclick="permanentlyDeleteApp('${app.id}')">删除</button>
        </div>
    `;
    recycleBinList.innerHTML += itemHtml;
});
    }
    recycleBinModal.style.display = 'flex';
    setTimeout(() => recycleBinModal.classList.add('active'), 10);
    closeMenu();
    fabContainer.style.display = 'none'; 
}

async function hideRecycleBinModal() {
    recycleBinModal.classList.remove('active');
    setTimeout(async () => {
        recycleBinModal.style.display = 'none';
        
        const settingsModalOpen = (settingsModal.style.display === 'flex' && settingsModal.classList.contains('active'));
        
        if (settingsModalOpen) {
            await showSettingsModal();
        } else {
            fabContainer.style.display = 'block';
        }
    }, 300);
}

async function restoreApp(appId) {
    let recycleBinApps = await getRecycleBinApps();
    const appToRestore = recycleBinApps.find(app => app.id == appId);
    
    if (!appToRestore) {
        showToast('未找到该应用');
        return;
    }

    recycleBinApps = recycleBinApps.filter(app => app.id != appId);
    await saveRecycleBinApps(recycleBinApps);

    let apps = await getApps();
    appToRestore.lastUsed = 0;
    apps.push(appToRestore);
    await saveApps(apps);

    showToast(`"${appToRestore.name}" 已恢复`);
    
    await renderUI();
    
    const recycleBinList = document.getElementById('recycle-bin-list');
    recycleBinList.innerHTML = '';
    
    const updatedRecycleBin = await getRecycleBinApps();
    if (updatedRecycleBin.length === 0) {
        recycleBinList.innerHTML = '<p style="text-align:center; color:#999; padding: 20px;">回收站是空的</p>';
    } else {
        updatedRecycleBin.forEach(app => {
            const deletedDate = new Date(app.deletedTime).toLocaleDateString();
            const itemHtml = `
                <div class="recycle-bin-item">
                    <img src="${app.icon}" alt="${app.name}">
                    <div style="flex-grow: 1;">
                        <span>${app.name}</span>
                        <p class="deleted-date">删除于: ${deletedDate}</p>
                    </div>
                    <button class="restore-app-btn" onclick="restoreApp('${app.id}')">恢复</button>
                    <button class="permanently-delete-btn" onclick="permanentlyDeleteApp('${app.id}')">删除</button>
                </div>
            `;
            recycleBinList.innerHTML += itemHtml;
        });
    }
}

async function permanentlyDeleteApp(appId) {
    const permDeleteConfirm = await customConfirm('此操作将彻底删除该应用，无法恢复。确定要继续吗？');
if (!permDeleteConfirm) return;

    let recycleBinApps = await getRecycleBinApps();
    recycleBinApps = recycleBinApps.filter(app => app.id != appId);
    await saveRecycleBinApps(recycleBinApps);

    showToast('已彻底删除');
    await showRecycleBinModal();
}

document.getElementById('close-recycle-bin-modal-btn').addEventListener('click', hideRecycleBinModal);

const MEMO_KEY = 'ephone_memos';
const memoModal = document.getElementById('memo-modal');
const memoEditModal = document.getElementById('memo-edit-modal');
const memoList = document.getElementById('memo-list');
const memoEditForm = document.getElementById('memo-edit-form');
const memoItemsContainer = document.getElementById('memo-items-container');
let currentEditingMemoId = null;

async function getMemos() {
    return await localforage.getItem(MEMO_KEY) || [];
}

async function saveMemos(memos) {
    await localforage.setItem(MEMO_KEY, memos);
}

async function showMemoModal() {
    const memos = await getMemos();
    memoList.innerHTML = '';
    
    if (memos.length === 0) {
        memoList.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#999; padding:40px;">还没有笔记<br>点击右上角 + 创建第一条笔记</p>';
    } else {
        memos.sort((a, b) => b.time - a.time).forEach(memo => {
            const date = new Date(memo.time).toLocaleDateString();
            
            let itemsHTML = '';
            if (memo.items && memo.items.length > 0) {
                itemsHTML = memo.items.map(item => `<div class="memo-item-tag" onclick="copyTagText(event, '${item.replace(/'/g, "\\'")}')">${item}</div>`).join('');
            }

            memoList.innerHTML += `
                <div class="memo-item" onclick="editMemo('${memo.id}')">
                    <div class="memo-delete-btn" onclick="event.stopPropagation(); deleteMemo('${memo.id}')">×</div>
                    ${memo.title ? `<div class="memo-title">${memo.title}</div>` : ''}
                    <div class="memo-items-display-container">${itemsHTML}</div>
                    <div class="memo-time">${date}</div>
                </div>
            `;
        });
    }
    memoModal.style.display = 'flex';
    setTimeout(() => memoModal.classList.add('active'), 10);
    closeMenu(); 
    fabContainer.style.display = 'none'; 
}

function autoGrowTextarea(element) {
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight) + 'px';
}

function renderMemoEditItem(text = '') {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'memo-edit-item';
    itemDiv.innerHTML = `
        <textarea rows="1" placeholder="输入内容...">${text}</textarea>
        <button type="button" class="remove-item-btn">×</button>
    `;
    
    const textarea = itemDiv.querySelector('textarea');
    
    textarea.addEventListener('input', () => autoGrowTextarea(textarea));
    
    setTimeout(() => autoGrowTextarea(textarea), 0);
    
    itemDiv.querySelector('.remove-item-btn').onclick = () => itemDiv.remove();
    memoItemsContainer.appendChild(itemDiv);
}

function showAddMemoForm() {
    currentEditingMemoId = null;
    document.getElementById('memo-edit-title').textContent = '新建笔记';
    document.getElementById('memo-title').value = '';
    memoItemsContainer.innerHTML = ''; 
    renderMemoEditItem(); 
    memoEditModal.style.display = 'flex';
    setTimeout(() => memoEditModal.classList.add('active'), 10);
    fabContainer.style.display = 'none'; 
}

async function editMemo(memoId) {
    const memos = await getMemos();
    const memo = memos.find(m => m.id === memoId);
    if (memo) {
        currentEditingMemoId = memoId;
        document.getElementById('memo-edit-title').textContent = '编辑笔记';
        document.getElementById('memo-title').value = memo.title || '';
        memoItemsContainer.innerHTML = ''; 
        if (memo.items && memo.items.length > 0) {
            memo.items.forEach(item => renderMemoEditItem(item));
        } else {
            renderMemoEditItem(); 
        }
        memoEditModal.style.display = 'flex';
        setTimeout(() => memoEditModal.classList.add('active'), 10);
        fabContainer.style.display = 'none'; 
    }
}

memoEditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('memo-title').value.trim();
    const itemInputs = memoItemsContainer.querySelectorAll('.memo-edit-item textarea'); 
    const items = Array.from(itemInputs).map(input => input.value.trim()).filter(item => item);

    if (!title && items.length === 0) {
        showToast('标题和内容至少要填写一项');
        return;
    }
    
    let memos = await getMemos();
    if (currentEditingMemoId) {
        const memo = memos.find(m => m.id === currentEditingMemoId);
        if (memo) {
            memo.title = title;
            memo.items = items;
            memo.time = Date.now();
        }
    } else {
        memos.push({
            id: 'memo_' + Date.now(),
            title: title,
            items: items,
            time: Date.now()
        });
    }
    await saveMemos(memos);
    showToast(currentEditingMemoId ? '已更新' : '已保存');
    closeMemoEditModal();
    await showMemoModal();
});

async function deleteMemo(memoId) {
    const deleteMemoConfirm = await customConfirm('确定要删除这条笔记吗？');
if (!deleteMemoConfirm) return;
    let memos = await getMemos();
    memos = memos.filter(m => m.id !== memoId);
    await saveMemos(memos);
    showToast('已删除');
    await showMemoModal();
}

function closeMemoModal() {
    memoModal.classList.remove('active');
    setTimeout(() => {
        memoModal.style.display = 'none';
        fabContainer.style.display = 'block'; 
    }, 300);
}

function closeMemoEditModal() {
    memoEditModal.classList.remove('active');
    setTimeout(() => {
        memoEditModal.style.display = 'none';
        fabContainer.style.display = 'block'; 
    }, 300);
}

async function copyTagText(event, text) {
    event.stopPropagation(); 

    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            showToast('内容已复制');
            return; 
        } catch (err) {
            console.error('现代复制API失败，将使用经典方法:', err);
        }
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed'; 
    textArea.style.top = '-9999px';   
    textArea.style.left = '-9999px';
    textArea.setAttribute('readonly', ''); 

    document.body.appendChild(textArea);

    textArea.select(); 
    textArea.setSelectionRange(0, 99999); 

    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {
        console.error('经典复制命令执行出错:', err);
    }

    document.body.removeChild(textArea); 

    if (success) {
        showToast('内容已复制');
    } else {
        showToast('复制失败');
    }
}

document.getElementById('add-memo-item-btn').addEventListener('click', () => renderMemoEditItem());
document.getElementById('close-memo-modal').addEventListener('click', closeMemoModal);
document.getElementById('cancel-memo-edit').addEventListener('click', closeMemoEditModal);

const recycleBinSettingsModal = document.getElementById('recycle-bin-settings-modal');
const recycleBinSettingsForm = document.getElementById('recycle-bin-settings-form');
const cancelRecycleBinSettingsBtn = document.getElementById('cancel-recycle-bin-settings');

async function showRecycleBinSettingsModal() {
    const settings = await localforage.getItem(RECYCLE_BIN_SETTINGS_KEY) || { ttl: 30 }; 
    const selectedRadio = document.querySelector(`input[name="ttl"][value="${settings.ttl}"]`);
    if (selectedRadio) {
        selectedRadio.checked = true;
    }
    recycleBinSettingsModal.classList.remove('hidden');
    fabContainer.style.display = 'none'; 
}

function hideRecycleBinSettingsModal() {
    recycleBinSettingsModal.classList.add('hidden');
    
    const recycleBinModalOpen = (recycleBinModal.style.display === 'flex' && recycleBinModal.classList.contains('active'));
    
    if (!recycleBinModalOpen) {
        fabContainer.style.display = 'block';
    }
}

recycleBinSettingsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(recycleBinSettingsForm);
    const ttl = formData.get('ttl');
    
    await localforage.setItem(RECYCLE_BIN_SETTINGS_KEY, { ttl: ttl });
    showToast('设置已保存');
    hideRecycleBinSettingsModal();
});

cancelRecycleBinSettingsBtn.addEventListener('click', hideRecycleBinSettingsModal);

async function cleanupRecycleBin() {
    const settings = await localforage.getItem(RECYCLE_BIN_SETTINGS_KEY) || { ttl: 30 };
    const ttl = settings.ttl;

    if (ttl === 'never') {
        return; 
    }

    const ttlMilliseconds = parseInt(ttl) * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let recycleBinApps = await getRecycleBinApps();

    const keptApps = recycleBinApps.filter(app => (now - app.deletedTime) < ttlMilliseconds);

    if (keptApps.length < recycleBinApps.length) {
        await saveRecycleBinApps(keptApps);
        console.log(`${recycleBinApps.length - keptApps.length}个应用已从回收站自动清理。`);
    }
}

const importExportModal = document.getElementById('import-export-modal');
const closeImportExportModalBtn = document.getElementById('close-import-export-modal-btn');

async function showImportExportModal() {
    const apps = await getApps();
    const memos = await getMemos();
    const recycleBin = await getRecycleBinApps();
    
    const themeSettings = {
        layout: await localforage.getItem(LAYOUT_KEY),
        font: await localforage.getItem(FONT_SETTINGS_KEY),
        wallpaper: await localforage.getItem(WALLPAPER_KEY),
        fabIcon: await localforage.getItem(FAB_ICON_KEY),
        fabShape: await localforage.getItem(FAB_SHAPE_KEY),
        fabExpandedIcon: await localforage.getItem(FAB_EXPANDED_ICON_KEY),
        fabDragIcon: await localforage.getItem(FAB_DRAG_ICON_KEY),
        iconShape: await localforage.getItem(ICON_SHAPE_KEY),
        fabSize: await localforage.getItem(FAB_SIZE_KEY),
        timeWidget: await localforage.getItem(TIME_WIDGET_STYLE_KEY)
    };
    
    const themeCount = Object.values(themeSettings).filter(v => v !== null).length;
    
    const appData = JSON.stringify({
        apps, memos, recycleBin,
        dockApps: await getDockApps(),
        largeIcons: await getLargeIcons(),
        settings: themeSettings
    });
    const appDataSizeBytes = new Blob([appData]).size;
    const appDataSizeKB = (appDataSizeBytes / 1024).toFixed(2);
    const appDataSizeMB = (appDataSizeBytes / 1024 / 1024).toFixed(2);
    const displayAppDataSize = appDataSizeBytes > 1024 * 1024 ? `${appDataSizeMB} MB` : `${appDataSizeKB} KB`;

    const VIRTUAL_QUOTA_BYTES = 2 * 1024 * 1024 * 1024; 
    let browserUsageBytes = 0;
    let usagePercent = 0;
    
    if (navigator.storage && navigator.storage.estimate) {
        try {
            const estimate = await navigator.storage.estimate();
            browserUsageBytes = estimate.usage || 0;
            usagePercent = ((browserUsageBytes / VIRTUAL_QUOTA_BYTES) * 100).toFixed(2);
            if (usagePercent > 100) usagePercent = 100.00;
        } catch (e) {
            console.error('获取存储配额失败:', e);
        }
    }
    
    const browserUsageKB = (browserUsageBytes / 1024).toFixed(2);
    const browserUsageMB = (browserUsageBytes / 1024 / 1024).toFixed(2);
    const displayBrowserUsage = browserUsageBytes > 1024 * 1024 ? `${browserUsageMB} MB` : `${browserUsageKB} KB`;

    document.getElementById('stat-apps').textContent = apps.length;
    document.getElementById('stat-memos').textContent = memos.length;
    document.getElementById('stat-recycle').textContent = recycleBin.length;
    document.getElementById('stat-theme').textContent = themeCount;
    document.getElementById('stat-app-data-size').textContent = displayAppDataSize;
    document.getElementById('stat-browser-usage').textContent = displayBrowserUsage;
    document.getElementById('stat-quota').textContent = "约 2 GB";
    document.getElementById('stat-percentage').textContent = usagePercent;
    document.getElementById('stat-progress').style.width = usagePercent + '%';
    
    importExportModal.style.display = 'flex';
    setTimeout(() => importExportModal.classList.add('active'), 10);
    closeMenu();
    fabContainer.style.display = 'none';
}

function hideImportExportModal() {
    importExportModal.classList.remove('active');
    setTimeout(() => {
        importExportModal.style.display = 'none';
        fabContainer.style.display = 'block';
    }, 300);
}

async function exportAllData() {
    try {
        showToast('正在打包所有数据...');
        
        const allKeys = [
    STORAGE_KEY, RECYCLE_BIN_KEY, LARGE_ICONS_KEY, RECYCLE_BIN_SETTINGS_KEY,
    LAYOUT_KEY, FAB_ICON_KEY, FAB_SHAPE_KEY, FAB_EXPANDED_ICON_KEY,
    FAB_DRAG_ICON_KEY, FONT_SETTINGS_KEY, DOCK_APPS_KEY, ICON_SHAPE_KEY,
    MEMO_KEY, WALLPAPER_KEY, FAB_SIZE_KEY, TIME_WIDGET_STYLE_KEY, 
    FAB_WAKE_METHOD_KEY, API_SETTINGS_KEY, API_PRESETS_KEY,
    SECONDARY_API_SETTINGS_KEY, API_USAGE_CONFIG_KEY // 新增：副API和功能分配配置
];

        const allData = {};
        const promises = allKeys.map(key => 
            localforage.getItem(key).then(value => {
                if (value !== null) {
                    allData[key] = value;
                }
            })
        );
        
        await Promise.all(promises);

        try {
            showToast('正在获取微信数据...');
            const wechatData = await getWeChatDataViaBridge();
            allData['wechat_data_package'] = wechatData;
            showToast('微信数据获取成功！');
        } catch (e) {
            console.error(e);
            showToast('未检测到微信数据，继续导出...');
        }

        allData.meta = {
            exportTime: new Date().toISOString(),
            version: '2.0'
        };

        const jsonStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `WebBox全能备份_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('✅ 全能备份已导出！');
    } catch (error) {
        console.error('导出失败:', error);
        await customAlert('导出失败，请重试');
    }
}

async function importAllData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const importConfirm = await customConfirm('【重要】导入备份将覆盖当前所有设置！确定要继续吗？');
    if (!importConfirm) {
        event.target.value = '';
        return;
    }

    try {
        const fileContent = await file.text();
        const importedData = JSON.parse(fileContent);

        if (typeof importedData !== 'object' || importedData === null || !importedData.meta) {
            throw new Error('这是一个无效的备份文件！');
        }

        showToast('正在恢复备份，请稍候...');
        await localforage.clear();
        
        const importPromises = [];
        for (const key in importedData) {
            if (key !== 'meta' && key !== 'wechat_data_package') {
                importPromises.push(localforage.setItem(key, importedData[key]));
            }
        }
        await Promise.all(importPromises);

        if (importedData['wechat_data_package']) {
            showToast('正在向微信导入数据...');
            const bridge = document.getElementById('wechat-data-bridge');
            if (bridge && bridge.contentWindow) {
                bridge.contentWindow.postMessage({
                    action: 'import-wechat-data',
                    payload: importedData['wechat_data_package']
                }, '*');
            }
        }
        
        showToast('✅ 恢复成功！页面即将自动刷新。');
        setTimeout(() => { location.reload(); }, 2000);

    } catch (error) {
        console.error('导入失败:', error);
        await customAlert('导入失败：' + error.message);
        event.target.value = '';
    }
}

document.getElementById('close-import-export-modal-btn').addEventListener('click', hideImportExportModal);

// ★★★ 小鱼修复：此监听器已删除，统一使用下方支持副API的监听器 ★★★

async function clearAllData() {
const clearConfirm = await customConfirm('【高危操作】\n\n您确定要清空所有数据吗？\n\n此操作将删除所有应用、设置、备忘录和自定义主题，且无法恢复！');
if (!clearConfirm) return;

    try {
        showToast('正在清空数据，应用即将重置...');

        await localforage.clear();

        setTimeout(() => {
            location.reload();
        }, 2000);

    } catch (error) {
        console.error('清空数据失败:', error);
        await customAlert('清空数据时发生错误，请重试。');
    }
}

const themeModal = document.getElementById('theme-modal');
const themeForm = document.getElementById('theme-form');
const closeThemeModalBtn = document.getElementById('close-theme-modal');
const wallpaperDiv = document.getElementById('wallpaper');
const WALLPAPER_KEY = 'ephone_wallpaper_url'; 

// 引入状态变量，记录用户是否点击了“恢复默认”但还没点“应用”
let pendingThemeRestores = { wallpaper: false, fabIcon: false, font: false, global: false };

async function showThemeModal() {
    const layoutSettings = await localforage.getItem(LAYOUT_KEY) || { mode: 'scroll' };
    const selectedRadio = document.querySelector(`input[name="layout"][value="${layoutSettings.mode}"]`);
    if (selectedRadio) selectedRadio.checked = true;

    const fabShapeIsOriginal = await localforage.getItem(FAB_SHAPE_KEY) || false;
    document.getElementById('fab-shape-toggle').checked = fabShapeIsOriginal;
    
    const fontSettings = await localforage.getItem(FONT_SETTINGS_KEY);
if (fontSettings) {
    document.getElementById('font-family-select').value = fontSettings.family;
    document.getElementById('font-color-input').value = fontSettings.color;
} else {
    document.getElementById('font-family-select').selectedIndex = 0;
    document.getElementById('font-color-input').value = '#5D4037';
}

    const savedIconShape = await localforage.getItem(ICON_SHAPE_KEY);
    document.getElementById('icon-shape-slider').value = savedIconShape !== null ? savedIconShape : 60;

    const savedFabSize = await localforage.getItem(FAB_SIZE_KEY);
    const fabSizeValue = savedFabSize !== null ? savedFabSize : 64;
    document.getElementById('fab-size-slider').value = fabSizeValue;
    document.getElementById('fab-size-display').textContent = fabSizeValue;
    
    updateFabIconSettingsUI();
    
    const savedWakeMethod = await localforage.getItem(FAB_WAKE_METHOD_KEY) || 'click';
    document.getElementById('fab-wake-method-select').value = savedWakeMethod;
    
    themeModal.style.display = 'flex';
    setTimeout(() => themeModal.classList.add('active'), 10);
    
    closeMenu();
    fabContainer.style.display = 'none'; 
}

function hideThemeModal() {
    themeModal.classList.remove('active');
    setTimeout(async () => {
        themeModal.style.display = 'none';
        themeForm.reset();
        fabContainer.style.display = 'block'; 
        
        // 如果用户没点“应用”就关闭了，我们需要把界面恢复成数据库里保存的真实状态
        pendingThemeRestores = { wallpaper: false, fabIcon: false, font: false, global: false };
        
        const savedWallpaper = await localforage.getItem(WALLPAPER_KEY);
        wallpaperDiv.style.backgroundImage = savedWallpaper ? `url('${savedWallpaper}')` : `url('wallpaper.png')`;
        
        const savedFontSettings = await localforage.getItem(FONT_SETTINGS_KEY);
        applyFontSettings(savedFontSettings);
        
        const savedIconShape = await localforage.getItem(ICON_SHAPE_KEY);
        applyIconShape(savedIconShape !== null ? savedIconShape : 60);
        
        const savedFabSize = await localforage.getItem(FAB_SIZE_KEY);
        applyFabSize(savedFabSize !== null ? savedFabSize : 64);
        
        const savedTimeWidgetStyle = await localforage.getItem(TIME_WIDGET_STYLE_KEY);
        applyTimeWidgetStyle(savedTimeWidgetStyle);
        
        await updateFabIcon();
    }, 300);
}

function restoreDefaultWallpaper() {
    document.getElementById('wallpaper-url-input').value = '';
    document.getElementById('wallpaper-file-input').value = '';
    wallpaperDiv.style.backgroundImage = `url('wallpaper.png')`;
    pendingThemeRestores.wallpaper = true;
    showToast('已重置壁纸预览，点击“应用”生效');
}

async function applyAndSaveWallpaper(imageUrl) {
    wallpaperDiv.style.backgroundImage = `url('${imageUrl}')`;
    await localforage.setItem(WALLPAPER_KEY, imageUrl);
}

// 核心：只有点击应用时，才统一写入数据库
themeForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // 1. 壁纸保存逻辑
    if (pendingThemeRestores.global || pendingThemeRestores.wallpaper) {
        await localforage.removeItem(WALLPAPER_KEY);
    }
    const wallpaperUrl = document.getElementById('wallpaper-url-input').value;
    const wallpaperFile = document.getElementById('wallpaper-file-input').files[0];
    if (wallpaperFile) {
        const reader = new FileReader();
        reader.onload = (e) => applyAndSaveWallpaper(e.target.result);
        reader.readAsDataURL(wallpaperFile);
    } else if (wallpaperUrl) {
        applyAndSaveWallpaper(wallpaperUrl);
    }

    // 2. 悬浮按钮保存逻辑
    if (pendingThemeRestores.global || pendingThemeRestores.fabIcon) {
        await localforage.removeItem(FAB_ICON_KEY);
        await localforage.removeItem(FAB_SHAPE_KEY);
        await localforage.removeItem(FAB_EXPANDED_ICON_KEY);
        await localforage.removeItem(FAB_DRAG_ICON_KEY);
    }
    
    const fabShapeIsOriginal = document.getElementById('fab-shape-toggle').checked;
    await localforage.setItem(FAB_SHAPE_KEY, fabShapeIsOriginal);
    
    const fabIconUrl = document.getElementById('fab-icon-url-input').value;
    const fabIconFile = document.getElementById('fab-icon-file-input').files[0];
    if (fabIconFile) {
        const reader = new FileReader();
        reader.onload = (e) => localforage.setItem(FAB_ICON_KEY, e.target.result).then(updateFabIcon);
        reader.readAsDataURL(fabIconFile);
    } else if (fabIconUrl) {
        await localforage.setItem(FAB_ICON_KEY, fabIconUrl);
    }

    const fabExpandedIconUrl = document.getElementById('fab-expanded-icon-url-input').value;
    const fabExpandedIconFile = document.getElementById('fab-expanded-icon-file-input').files[0];
    if (fabExpandedIconFile) {
        const reader = new FileReader();
        reader.onload = (e) => localforage.setItem(FAB_EXPANDED_ICON_KEY, e.target.result).then(updateFabIcon);
        reader.readAsDataURL(fabExpandedIconFile);
    } else if (fabExpandedIconUrl) {
        await localforage.setItem(FAB_EXPANDED_ICON_KEY, fabExpandedIconUrl);
    }
    
    const fabDragIconUrl = document.getElementById('fab-drag-icon-url-input').value;
    const fabDragIconFile = document.getElementById('fab-drag-icon-file-input').files[0];
    if (fabDragIconFile) {
        const reader = new FileReader();
        reader.onload = (e) => localforage.setItem(FAB_DRAG_ICON_KEY, e.target.result).then(updateFabIcon);
        reader.readAsDataURL(fabDragIconFile);
    } else if (fabDragIconUrl) {
        await localforage.setItem(FAB_DRAG_ICON_KEY, fabDragIconUrl);
    }

    // 3. 字体保存逻辑
    if (pendingThemeRestores.global || pendingThemeRestores.font) {
        await localforage.removeItem(FONT_SETTINGS_KEY);
    } else {
        const fontFamily = document.getElementById('font-family-select').value;
        const fontColor = document.getElementById('font-color-input').value;
        await localforage.setItem(FONT_SETTINGS_KEY, { family: fontFamily, color: fontColor });
    }

    // 4. 布局与唤醒方式
    const selectedLayout = document.querySelector('input[name="layout"]:checked').value;
    await localforage.setItem(LAYOUT_KEY, { mode: selectedLayout });
    const selectedWakeMethod = document.getElementById('fab-wake-method-select').value;
    await localforage.setItem(FAB_WAKE_METHOD_KEY, selectedWakeMethod);
    await applyFabWakeMethod(selectedWakeMethod);

    // 5. 图标形状 & 悬浮按钮大小
    const iconShapeVal = parseInt(document.getElementById('icon-shape-slider').value, 10);
    await localforage.setItem(ICON_SHAPE_KEY, iconShapeVal);
    const fabSizeVal = parseInt(document.getElementById('fab-size-slider').value, 10);
    await localforage.setItem(FAB_SIZE_KEY, fabSizeVal);

    // 6. 全局恢复的其他清理
    if (pendingThemeRestores.global) {
        await localforage.removeItem(TIME_WIDGET_STYLE_KEY);
        let dockApps = await getDockApps();
        dockApps.forEach(app => {
            if (defaultDockAppIcons[app.id]) app.icon = defaultDockAppIcons[app.id];
        });
        await saveDockApps(dockApps);
        await renderDockIcons();
    }

    // 重置状态
    pendingThemeRestores = { wallpaper: false, fabIcon: false, font: false, global: false };
    
    await updateFabIcon();
    await renderUI();
    
    showToast('主题设置已应用！');
    hideThemeModal(); 
});

function restoreDefaultFabIcon() {
    document.getElementById('fab-icon-url-input').value = '';
    document.getElementById('fab-icon-file-input').value = '';
    document.getElementById('fab-expanded-icon-url-input').value = '';
    document.getElementById('fab-expanded-icon-file-input').value = '';
    document.getElementById('fab-drag-icon-url-input').value = '';
    document.getElementById('fab-drag-icon-file-input').value = '';
    document.getElementById('fab-shape-toggle').checked = false;
    updateFabIconSettingsUI();
    
    fabMain.classList.remove('custom-icon-mode', 'original-shape-mode', 'custom-expanded-mode');
    fabMain.innerHTML = menuIconSvg;
    
    pendingThemeRestores.fabIcon = true;
    showToast('已重置按钮预览，点击“应用”生效');
}

document.getElementById('close-theme-modal').addEventListener('click', hideThemeModal);

let currentLargeIconSlot = null; 

async function showSelectAppForLargeIcon(slotNumber) {
    currentLargeIconSlot = slotNumber;
    const apps = await getApps();
    const largeIcons = await getLargeIcons();
    const selectLargeIconList = document.getElementById('select-large-icon-list');
    selectLargeIconList.innerHTML = '';
    
    const availableApps = apps.filter(app => 
        app.id !== largeIcons.slot1 && app.id !== largeIcons.slot2
    );
    
    if (availableApps.length === 0) {
        selectLargeIconList.innerHTML = '<p style="text-align:center; color:#999;">没有可用的应用</p>';
    } else {
        availableApps.forEach(app => {
            const itemHtml = `
                <div style="display: flex; align-items: center; padding: 10px; border: 1px solid #eee; border-radius: 8px; cursor: pointer;" onclick="selectAppForLargeIcon('${app.id}')">
                    <img src="${app.icon}" alt="${app.name}" style="width: 48px; height: 48px; border-radius: 12px; margin-right: 15px; object-fit: cover;">
                    <span style="font-weight: 500; flex-grow: 1;">${app.name}</span>
                </div>
            `;
            selectLargeIconList.innerHTML += itemHtml;
        });
    }
    
    document.getElementById('select-large-icon-modal').classList.remove('hidden');
}

async function selectAppForLargeIcon(appId) {
    await setLargeIcon(currentLargeIconSlot, appId);
    showToast('已设置为大图标');
    
    const modal = document.getElementById('select-large-icon-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    currentLargeIconSlot = null; 
    await renderUI(); 
}

document.getElementById('cancel-select-large-icon').addEventListener('click', () => {
    document.getElementById('select-large-icon-modal').classList.add('hidden');
});

function showLargeIconMenu(event, slotNumber) {
    event.preventDefault(); 
    currentLargeIconSlot = slotNumber;
    document.getElementById('large-icon-menu-modal').classList.remove('hidden');
}

function changeLargeIconApp() {
    document.getElementById('large-icon-menu-modal').classList.add('hidden');
    showSelectAppForLargeIcon(currentLargeIconSlot);
}

async function removeLargeIconConfirm() {
    const removeLargeIconConfirm = await customConfirm('确定要移除这个大图标吗？');
if (removeLargeIconConfirm) {
        await removeLargeIcon(currentLargeIconSlot);
        showToast('已移除大图标');
        document.getElementById('large-icon-menu-modal').classList.add('hidden');
        await renderUI();
    }
}

document.getElementById('cancel-large-icon-menu').addEventListener('click', () => {
    document.getElementById('large-icon-menu-modal').classList.add('hidden');
});

const changeIconModal = document.getElementById('change-icon-modal');
const changeIconForm = document.getElementById('change-icon-form');
const cancelChangeIconBtn = document.getElementById('cancel-change-icon');
let currentEditingAppInfo = null; 

async function showChangeIconModal(appId, isDockApp = false) {
    currentEditingAppInfo = { id: appId, isDock: isDockApp };
    
    let currentName = '';
    
    if (isDockApp) {
        const dockApps = await getDockApps();
        const app = dockApps.find(a => a.id == appId);
        if (app) currentName = app.name;
    } else {
        const apps = await getApps();
        const app = apps.find(a => a.id == appId);
        if (app) {
            currentName = app.name;
        }
    }
    
    document.getElementById('change-app-name').value = currentName;
    
    changeIconModal.classList.remove('hidden');
}

function hideChangeIconModal() {
    changeIconModal.classList.add('hidden');
    changeIconForm.reset();
    document.getElementById('change-app-name').value = ''; 
    currentEditingAppInfo = null; 
}

changeIconForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const iconUrl = document.getElementById('change-icon-url').value;
    const iconFile = document.getElementById('change-icon-file').files[0];

    if (!iconUrl && !iconFile) {
        let currentIcon = '';
        if (currentEditingAppInfo.isDock) {
            const dockApps = await getDockApps();
            const app = dockApps.find(a => a.id == currentEditingAppInfo.id);
            if (app) currentIcon = app.icon;
        } else {
            const apps = await getApps();
            const app = apps.find(a => a.id == currentEditingAppInfo.id);
            if (app) currentIcon = app.icon;
        }
        updateAppIcon(currentIcon); 
        return;
    }

    if (iconFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const iconDataUrl = e.target.result;
            updateAppIcon(iconDataUrl);
        };
        reader.readAsDataURL(iconFile);
    } else {
        updateAppIcon(iconUrl);
    }
});

async function updateAppIcon(newIcon) {
    if (!currentEditingAppInfo) return; 

    const newName = document.getElementById('change-app-name').value.trim();
    if (!newName) {
        showToast('应用名称不能为空');
        return;
    }

    if (currentEditingAppInfo.isDock) {
        let dockApps = await getDockApps();
        const app = dockApps.find(a => a.id == currentEditingAppInfo.id);
        if (app) {
            app.icon = newIcon;
            app.name = newName; 
            await saveDockApps(dockApps);
            showToast('应用已更新');
            await renderDockIcons();
            await showSettingsModal();
            hideChangeIconModal();
        }
    } else {
        let apps = await getApps();
const app = apps.find(a => a.id == currentEditingAppInfo.id);
if (app) {
    app.icon = newIcon;
    app.name = newName;
    
    await saveApps(apps);
    showToast('应用已更新');
    await renderUI();
    await showSettingsModal();
    hideChangeIconModal();
}
    }
}

async function restoreDockAppIcon(appId) {
    const defaultIcon = defaultDockAppIcons[appId];
    if (!defaultIcon) {
        showToast('找不到原始图标');
        return;
    }

    let dockApps = await getDockApps();
    const app = dockApps.find(a => a.id == appId);
    if (app) {
        app.icon = defaultIcon; 
        await saveDockApps(dockApps);
        showToast('图标已恢复');
        await renderDockIcons(); 
        await showSettingsModal(); 
    }
}

cancelChangeIconBtn.addEventListener('click', hideChangeIconModal);

async function openApp(appId) { 
    const apps = await getApps(); 
    const appToOpen = apps.find(app => app.id == appId); 
    if (!appToOpen) { showToast('找不到该应用'); return; } 
    
    currentOpenAppId = appId;
    
    appToOpen.lastUsed = Date.now(); 
    await saveApps(apps); 
    document.body.classList.add('app-open'); 
    launcherScreen.style.opacity = '0'; 
    launcherScreen.style.pointerEvents = 'none'; 
    
    appIframe.removeAttribute('src');
    appIframe.removeAttribute('srcdoc');

    if (appToOpen.sourceType === 'file' && appToOpen.fileContent) {
        const type = appToOpen.fileType;
        const content = appToOpen.fileContent;
        
appIframe.onload = null;

        if (type === 'text/html') {
            appIframe.srcdoc = content;
        } else if (type === 'text/plain') {
            const escapedContent = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            appIframe.srcdoc = `<pre style="font-family: monospace; white-space: pre-wrap; word-wrap: break-word; padding: 20px; font-size: 16px;">${escapedContent}</pre>`;
        } else {
            const blobUrl = URL.createObjectURL(content);
            appIframe.src = blobUrl;
        }
    } else {
        appIframe.src = appToOpen.url;
    }
    
    appViewer.style.display = 'flex'; 
    setTimeout(() => appViewer.classList.add('active'), 10); 
    closeMenu(); 
    await renderUI(); 
}
    
function updateTimeWidget() { 
  const now = new Date(); 
  const hours = now.getHours(); 
  const minutes = now.getMinutes().toString().padStart(2, '0'); 
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); 
  const date = now.getDate().toString().padStart(2, '0'); 
  const day = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()]; 
  let greeting = 'Hi, '; 
  if (hours < 12) greeting += 'good morning'; 
  else if (hours < 18) greeting += 'good afternoon'; 
  else greeting += 'good evening'; 
  const timeString = `${hours}:${minutes}`; 
  statusTimeEl.textContent = `՞ฅ ${timeString} ฅ՞`; /* 状态栏显示带符号 */
  widgetTimeEl.textContent = timeString; /* 时间插件不带符号 */
  widgetGreetingEl.textContent = greeting; 
  widgetDateEl.textContent = `${month}月${date}日 ${day}`; 
}
    function updateBatteryStatus() { if ('getBattery' in navigator) { navigator.getBattery().then(function(battery) { const batteryLevelEl = document.getElementById('battery-level'); const batteryPercentEl = document.getElementById('status-battery-percent'); function updateUI() { const level = Math.floor(battery.level * 100); batteryPercentEl.textContent = `${level}%`; batteryLevelEl.style.width = `${level}%`; batteryLevelEl.classList.remove('battery-high', 'battery-medium', 'battery-low'); if (level > 50) { batteryLevelEl.classList.add('battery-high'); } else if (level > 20) { batteryLevelEl.classList.add('battery-medium'); } else { batteryLevelEl.classList.add('battery-low'); } } updateUI(); battery.addEventListener('levelchange', updateUI); battery.addEventListener('chargingchange', updateUI); }); } }
async function goHome() {
    closeMemoModal();           
    closeMemoEditModal();       
    hideThemeModal();           

    clearInterval(progressSaveInterval);
    currentOpenAppId = null;

    await renderUI();

    document.body.classList.remove('app-open'); 
    launcherScreen.style.opacity = '1'; 
    launcherScreen.style.pointerEvents = 'auto'; 
    setTimeout(() => { 
        appViewer.classList.remove('active'); 
        appViewer.style.display = 'none'; 
        
        if (appIframe.src.startsWith('blob:')) {
            URL.revokeObjectURL(appIframe.src);
        }
        
        appIframe.src = 'about:blank'; 
        appIframe.srcdoc = '';
    }, 300); 
closeMenu(); 
}
const enterFullscreenSvg = '<svg viewBox="0 0 24 24" fill="#555"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
const exitFullscreenSvg = '<svg viewBox="0 0 24 24" fill="#555"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>';

    async function hideFab() { 
    closeMenu(); 
    const mainRect = fabMain.getBoundingClientRect(); 
    fabContainer.style.left = mainRect.left + 'px'; 
    fabContainer.style.top = mainRect.top + 'px'; 
    fabContainer.style.bottom = 'auto'; 
    fabContainer.style.right = 'auto'; 
    fabContainer.classList.add('ghost-mode'); 
    
    const method = await localforage.getItem(FAB_WAKE_METHOD_KEY) || 'click';
    const tips = {
        'click': '已隐藏。单击顶部栏可唤出。',
        'dblclick': '已隐藏。双击顶部栏可唤出。',
        'swipe': '已隐藏。下滑顶部栏可唤出。'
    };
    showToast(tips[method]);
}
    function showFab() { fabContainer.classList.remove('ghost-mode'); }
    function showToast(text) {
    const toastIcon = document.getElementById('toast-icon');
    const toastText = document.getElementById('toast-text');
    
    toastText.textContent = text;
    
    toastIcon.src = 'illustration.png';
    
    toastMsg.classList.add('show');
    
    setTimeout(() => {
        toastMsg.classList.remove('show');
    }, 3000);
}
    
function toggleMenu() { 
    if (fabContainer.classList.contains('ghost-mode')) { 
        showFab(); 
        setTimeout(() => { 
            fabContainer.classList.add('menu-open'); 
            fabMain.classList.add('expanded'); 
            updateFabIcon();
        }, 50); 
        return; 
    } 
    
    fabContainer.classList.remove('edge-snapped'); 
    
    // 如果即将展开菜单，且此时按钮有一半在屏幕外面，先把它拉回屏幕内侧防止内容被遮挡
    if (!fabContainer.classList.contains('menu-open')) {
        const rect = fabContainer.getBoundingClientRect();
        if (rect.left < 0) {
            fabContainer.style.left = '0px';
        } else if (rect.right > window.innerWidth) {
            fabContainer.style.left = (window.innerWidth - rect.width) + 'px';
        }
    }
    
    fabContainer.classList.toggle('menu-open'); 
    fabMain.classList.toggle('expanded'); 
    updateFabIcon();
}

function closeMenu() { 
    fabContainer.classList.remove('menu-open'); 
    fabMain.classList.remove('expanded'); 
    updateFabIcon();
    
    // 菜单收起后，如果在边缘附近，自动向屏幕外隐入一半
    setTimeout(() => {
        const rect = fabContainer.getBoundingClientRect();
        // 修复：若元素被隐藏(比如打开了设置窗口)，跳过吸附逻辑，防止坐标归零导致错误向左贴边
        if (rect.width === 0 && rect.height === 0) return; 
        
        const halfWidth = rect.width / 2;
        const screenWidth = window.innerWidth;
        const edgeThreshold = 10;
        
        let newLeft = rect.left;
        let isSnapped = false;
        
        if (rect.left <= edgeThreshold) {
            newLeft = -halfWidth;
            isSnapped = true;
        } else if (rect.right >= screenWidth - edgeThreshold) {
            newLeft = screenWidth - halfWidth;
            isSnapped = true;
        }
        
        if (isSnapped) {
            fabContainer.style.left = newLeft + 'px';
            fabContainer.classList.add('edge-snapped');
        }
    }, 300);
}

document.addEventListener('click', e => { if (!fabContainer.contains(e.target) && fabContainer.classList.contains('menu-open')) { closeMenu(); } });

let isDragging = false, hasMoved = false, startX, startY, initialLeft, initialTop; const dragThreshold = 5;
fabMain.addEventListener('mousedown', startDrag); fabMain.addEventListener('touchstart', startDrag, { passive: false });

function startDrag(e) {
    if (fabContainer.classList.contains('ghost-mode')) return;
    
    isDragging = true;
    hasMoved = false;
    
    const touch = e.type === 'touchstart' ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    
    const rect = fabContainer.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    
    fabContainer.style.bottom = 'auto';
    fabContainer.style.right = 'auto';
    fabContainer.style.left = initialLeft + 'px';
    fabContainer.style.top = initialTop + 'px';
    
    fabContainer.classList.add('dragging');
    fabContainer.classList.remove('edge-snapped'); // 拖拽开始时恢复完全可见
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
}

function onDrag(e) {
    if (!isDragging) return;
    
    const touch = e.type === 'touchmove' ? e.touches[0] : e;
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    
    if (!hasMoved && (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold)) {
        hasMoved = true;
        e.preventDefault();
        updateFabIcon({ state: 'dragging' });
        if (fabContainer.classList.contains('menu-open')) closeMenu(); // 拖拽时自动收起菜单
    }
    
    if (hasMoved) {
        e.preventDefault();
        
        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;
        
        const fabRect = fabContainer.getBoundingClientRect();
        const halfWidth = fabRect.width / 2;
        
        // 核心修改：允许左右各有一半按钮移出屏幕界限
        const minX = -halfWidth;
        const maxX = window.innerWidth - halfWidth;
        const minY = 44; // 避开顶部状态栏(44px)
        const maxY = window.innerHeight - fabRect.height;
        
        newLeft = Math.max(minX, Math.min(newLeft, maxX));
        newTop = Math.max(minY, Math.min(newTop, maxY));
        
        fabContainer.style.left = newLeft + 'px';
        fabContainer.style.top = newTop + 'px';
    }
}

function stopDrag() {
    if (hasMoved) {
        fabContainer.classList.remove('dragging');
        
        const fabRect = fabContainer.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const halfWidth = fabRect.width / 2;
        const edgeThreshold = 10; // 只要距离边缘 < 30px，就会触发吸附
        
        let finalLeft = fabRect.left;
        let isSnapped = false;
        
        // 吸附到屏幕左外侧一半
        if (finalLeft <= edgeThreshold) {
            finalLeft = -halfWidth;
            isSnapped = true;
        } 
        // 吸附到屏幕右外侧一半
        else if (finalLeft + fabRect.width >= screenWidth - edgeThreshold) {
            finalLeft = screenWidth - halfWidth;
            isSnapped = true;
        }
        
        fabContainer.style.left = finalLeft + 'px';
        
        setTimeout(() => {
            if (isSnapped && !fabContainer.classList.contains('menu-open')) {
                fabContainer.classList.add('edge-snapped');
            } else {
                fabContainer.classList.remove('edge-snapped');
            }
            updateFabIcon();
        }, 300);
    }
    
    isDragging = false;
    hasMoved = false;
    
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
}

// 页面加载完成后检查一次，如果在边缘就隐入外侧一半
setTimeout(() => {
    const rect = fabContainer.getBoundingClientRect();
    const halfWidth = rect.width / 2;
    const screenWidth = window.innerWidth;
    const edgeThreshold = 10;
    
    let isSnapped = false;
    let finalLeft = rect.left;
    if (rect.left <= edgeThreshold) {
        finalLeft = -halfWidth;
        isSnapped = true;
    } else if (rect.right >= screenWidth - edgeThreshold) {
        finalLeft = screenWidth - halfWidth;
        isSnapped = true;
    }

    if (isSnapped) {
        fabContainer.style.left = finalLeft + 'px';
        fabContainer.classList.add('edge-snapped');
    }
}, 1000);

    fabMain.addEventListener('click', e => { 
    e.stopPropagation(); 
    
    if (!hasMoved) {
        if (fabContainer.classList.contains('edge-snapped')) {
            // 修复：如果处于贴边状态，点击仅解除贴边并拉回屏幕内，不打开菜单
            fabContainer.classList.remove('edge-snapped');
            const rect = fabContainer.getBoundingClientRect();
            if (rect.left < 0) {
                fabContainer.style.left = '0px';
            } else if (rect.right > window.innerWidth) {
                fabContainer.style.left = (window.innerWidth - rect.width) + 'px';
            }
            return;
        }
        toggleMenu(); 
    }
});
(async function initFabWakeMethod() {
    const savedMethod = await localforage.getItem(FAB_WAKE_METHOD_KEY) || 'click';
    await applyFabWakeMethod(savedMethod);
})();

function applyFontSettings(settings) {
  const root = document.documentElement;
  if (settings && settings.family) {
    root.style.setProperty('--global-font-family', settings.family);
  } else {
    root.style.removeProperty('--global-font-family');
  }

  if (settings && settings.color) {
    root.style.setProperty('--global-font-color', settings.color);
  } else {
    root.style.removeProperty('--global-font-color');
  }
}

function restoreDefaultFontSettings() {
    document.getElementById('font-family-select').selectedIndex = 0;
    document.getElementById('font-color-input').value = '#5D4037';
    applyFontSettings(null); 
    pendingThemeRestores.font = true;
    showToast('已重置字体预览，点击“应用”生效');
}

function applyIconShape(value) {
    const mapRange = (num, in_min, in_max, out_min, out_max) => {
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    };

    const smallRadius = mapRange(value, 0, 100, 0, 29); 
    const largeRadius = mapRange(value, 0, 100, 0, 50); 
    const dockRadius = mapRange(value, 0, 100, 0, 30);  

    const root = document.documentElement;
    root.style.setProperty('--app-icon-radius', `${smallRadius}px`);
    root.style.setProperty('--large-icon-radius', `${largeRadius}px`);
    root.style.setProperty('--dock-icon-radius', `${dockRadius}px`);

    document.getElementById('icon-shape-slider').value = value;
}

function updateIconShape(value) {
    // 仅预览，不再直接保存到数据库
    const numericValue = parseInt(value, 10);
    applyIconShape(numericValue);
}

function applyFabSize(size) {
    const root = document.documentElement;
    root.style.setProperty('--fab-size', `${size}px`);
    
    const displayEl = document.getElementById('fab-size-display');
    if (displayEl) {
        displayEl.textContent = size;
    }
    
    const sliderEl = document.getElementById('fab-size-slider');
    if (sliderEl) {
        sliderEl.value = size;
    }
}

function updateFabSize(value) {
    // 仅预览，不再直接保存到数据库
    const numericValue = parseInt(value, 10);
    applyFabSize(numericValue);
}
let userWantsFullscreen = false;
let fileDialogOpen = false;
let fullscreenRetryCount = 0;
const MAX_RETRY = 5;
let lastFullscreenAttempt = 0;

function toggleFullScreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        userWantsFullscreen = true;
        fullscreenRetryCount = 0;
        enterFullscreen();
    } else {
        userWantsFullscreen = false;
        exitFullscreen();
    }
}

function applyTimeWidgetStyle(style) {
    const root = document.documentElement;
    const timeWidget = document.getElementById('time-widget');
    let customStyleTag = document.getElementById('time-widget-custom-css-permanent');

    if (style && style.customCSS) {
        if (!customStyleTag) {
            customStyleTag = document.createElement('style');
            customStyleTag.id = 'time-widget-custom-css-permanent';
            document.head.appendChild(customStyleTag);
        }
        customStyleTag.innerHTML = style.customCSS;

        root.style.removeProperty('--time-widget-bg');
        root.style.removeProperty('--time-widget-border');
        root.style.removeProperty('--time-widget-text');
        root.style.removeProperty('--time-widget-time');
        root.style.removeProperty('--time-widget-opacity');
        root.style.removeProperty('--time-widget-text-size');
        root.style.removeProperty('--time-widget-time-size');
        timeWidget.style.border = '';
        timeWidget.style.backgroundImage = '';
        timeWidget.className = 'time-widget'; 
        return; 
    }

    if (customStyleTag) {
        customStyleTag.innerHTML = ''; 
    }
    
    if (style) {
        root.style.setProperty('--time-widget-bg', style.bgColor || '#FFFBEB');
        root.style.setProperty('--time-widget-text', style.textColor || '#8B5A2B');
        root.style.setProperty('--time-widget-time', style.timeColor || '#5D4037');
        
        const opacity = style.opacity !== undefined ? style.opacity / 100 : 1;
        root.style.setProperty('--time-widget-opacity', opacity);
        
        const textSize = style.textSize || 16;
        const timeSize = style.timeSize || 64;
        root.style.setProperty('--time-widget-text-size', textSize + 'px');
        root.style.setProperty('--time-widget-time-size', timeSize + 'px');
        
        if (style.showBorder === false) {
            timeWidget.style.border = 'none';
        } else {
            root.style.setProperty('--time-widget-border', style.borderColor || '#FFC0CB');
            timeWidget.style.border = '4px solid var(--time-widget-border)';
        }
        
        if (style.bgImage) {
    const timeWidgetBefore = timeWidget;
    let bgImageStyle = document.getElementById('time-widget-bg-image-style');
    if (!bgImageStyle) {
        bgImageStyle = document.createElement('style');
        bgImageStyle.id = 'time-widget-bg-image-style';
        document.head.appendChild(bgImageStyle);
    }
    bgImageStyle.innerHTML = `
        #time-widget::before {
            background-image: url(${style.bgImage}) !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
        }
    `;
} else {
    const bgImageStyle = document.getElementById('time-widget-bg-image-style');
    if (bgImageStyle) {
        bgImageStyle.remove();
    }
}
        
        timeWidget.classList.remove('pattern-dots', 'pattern-waves', 'pattern-grid', 'pattern-stars', 'pattern-bubbles');
        
        if (style.showPattern === true && style.patternStyle && style.patternStyle !== 'none') {
            timeWidget.classList.add('pattern-' + style.patternStyle);
        }
} else { 
    root.style.removeProperty('--time-widget-bg');
    root.style.removeProperty('--time-widget-border');
    root.style.removeProperty('--time-widget-text');
    root.style.removeProperty('--time-widget-time');
    root.style.removeProperty('--time-widget-opacity');
    root.style.removeProperty('--time-widget-text-size');
    root.style.removeProperty('--time-widget-time-size');
    
    const bgImageStyle = document.getElementById('time-widget-bg-image-style');
    if (bgImageStyle) {
        bgImageStyle.remove();
    }
    
    timeWidget.style.border = '';
    timeWidget.className = 'time-widget';
}
}

let originalTimeWidgetStyle = null;

const originalTimeWidgetCSS = `/* 
  小鱼AI提示：这是时间插件最原始的CSS代码！
  您可以把它当作一个模板，在此基础上修改。
*/

/* 整体容器样式 */
#time-widget {
  /* (关键!) 声明“我是定位的基准”，这样里面的小元素才能相对于我来移动。 */
  position: relative; 
  
  /* (关键!) 隐藏超出圆角边框的内容，比如花纹。 */
  overflow: hidden; 
  
  /* 边框样式: 粗细 样式 颜色 */
  border: 4px solid #FFC0CB; 
  
  /* 文字颜色 (问候语/日期) */
  color: #8B5A2B;
  
  /* 鼠标放上去时，变成小手的形状 */
  cursor: pointer;
  
  /* 阴影效果: x偏移 y偏移 模糊度 颜色 */
  box-shadow: 0 4px 12px rgba(212, 175, 155, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  
  /* 所有变化的过渡动画效果，持续0.3秒 */
  transition: all 0.3s ease;
}

/* 鼠标悬停时的效果 */
#time-widget:hover {
  /* 向上移动2像素 */
  transform: translateY(-2px);
  
  /* 阴影变得更明显 */
  box-shadow: 0 6px 16px rgba(212, 175, 155, 0.4);
}

/* (高级技巧) 这是插件的"背景层"，专门用来放背景色、背景图和花纹，
   好处是它的透明度不会影响到上面的文字。*/
#time-widget::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  
  /* 背景颜色 */
  background-color: #FFFBEB;
  
  /* 背景图片设置 */
  background-size: cover;        /* 让图片覆盖整个区域，保持比例 */
  background-position: center;   /* 让图片居中显示 */
  background-repeat: no-repeat;  /* 不重复平铺图片 */
  
  /* 背景透明度 (0=完全透明, 1=完全不透明) */
  opacity: 1;
  
  /* 圆角，与外层容器保持一致 */
  border-radius: 20px;
  
  /* (关键!) 把它放到所有文字内容的下面，免得挡住文字。 */
  z-index: -1; 
}

/* 问候语/日期 样式 */
#widget-greeting, #widget-date {
  /* 文字大小 */
  font-size: 16px;
}

/* 时间数字 样式 */
#widget-time {
  /* 时间颜色 */
  color: #5D4037;
  
  /* 时间大小 */
  font-size: 64px;
}

/* --- 以下是各种花纹的样式，您可以修改颜色、大小、间距 --- */

/* 彩色波点花纹 */
#time-widget.pattern-dots::before {
  background-image: radial-gradient(circle at 15% 20%, rgba(255, 182, 193, 0.5) 8px, transparent 8px), radial-gradient(circle at 85% 15%, rgba(173, 216, 230, 0.5) 6px, transparent 6px), radial-gradient(circle at 25% 75%, rgba(255, 218, 185, 0.5) 7px, transparent 7px), radial-gradient(circle at 70% 80%, rgba(221, 160, 221, 0.5) 5px, transparent 5px), radial-gradient(circle at 45% 40%, rgba(255, 245, 157, 0.5) 6px, transparent 6px), radial-gradient(circle at 90% 60%, rgba(152, 251, 152, 0.5) 8px, transparent 8px), radial-gradient(circle at 10% 50%, rgba(255, 192, 203, 0.5) 5px, transparent 5px), radial-gradient(circle at 60% 25%, rgba(176, 224, 230, 0.5) 7px, transparent 7px);
}

/* 斜纹波浪花纹 */
#time-widget.pattern-waves::before {
  background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 192, 203, 0.15) 10px, rgba(255, 192, 203, 0.15) 20px);
}

/* 网格纹理花纹 */
#time-widget.pattern-grid::before {
  background-image: linear-gradient(rgba(255, 192, 203, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 192, 203, 0.2) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 星星点点花纹 */
#time-widget.pattern-stars::before {
  background-image: radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.6) 3px, transparent 3px), radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.5) 4px, transparent 4px), radial-gradient(circle at 30% 80%, rgba(255, 215, 0, 0.4) 2px, transparent 2px), radial-gradient(circle at 70% 70%, rgba(255, 215, 0, 0.5) 3px, transparent 3px), radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.6) 2px, transparent 2px), radial-gradient(circle at 90% 85%, rgba(255, 215, 0, 0.4) 3px, transparent 3px), radial-gradient(circle at 15% 60%, rgba(255, 215, 0, 0.5) 2px, transparent 2px);
}

/* 泡泡气球花纹 */
#time-widget.pattern-bubbles::before {
  background-image: radial-gradient(circle at 25% 25%, rgba(173, 216, 230, 0.3) 15px, transparent 15px), radial-gradient(circle at 75% 30%, rgba(255, 182, 193, 0.25) 20px, transparent 20px), radial-gradient(circle at 50% 70%, rgba(221, 160, 221, 0.3) 18px, transparent 18px), radial-gradient(circle at 15% 75%, rgba(255, 218, 185, 0.25) 12px, transparent 12px), radial-gradient(circle at 85% 75%, rgba(152, 251, 152, 0.3) 16px, transparent 16px);
}
`;

async function showTimeWidgetSettingsStandalone() {
    const savedStyle = await localforage.getItem(TIME_WIDGET_STYLE_KEY) || {};
    
    originalTimeWidgetStyle = JSON.parse(JSON.stringify(savedStyle));
    
    document.getElementById('time-widget-bg-picker-standalone').value = savedStyle.bgColor || '#FFFBEB';
    document.getElementById('time-widget-border-picker-standalone').value = savedStyle.borderColor || '#FFC0CB';
    document.getElementById('time-widget-text-picker-standalone').value = savedStyle.textColor || '#8B5A2B';
    document.getElementById('time-widget-time-picker-standalone').value = savedStyle.timeColor || '#5D4037';
    
    const opacity = savedStyle.opacity !== undefined ? savedStyle.opacity : 100;
    document.getElementById('time-widget-opacity-slider-standalone').value = opacity;
    document.getElementById('time-widget-opacity-display-standalone').textContent = opacity;
    
    const textSize = savedStyle.textSize || 16;
    const timeSize = savedStyle.timeSize || 64;
    document.getElementById('time-widget-text-size-slider-standalone').value = textSize;
    document.getElementById('time-widget-text-size-display-standalone').textContent = textSize;
    document.getElementById('time-widget-time-size-slider-standalone').value = timeSize;
    document.getElementById('time-widget-time-size-display-standalone').textContent = timeSize;
    
    document.getElementById('time-widget-border-toggle-standalone').checked = savedStyle.showBorder !== false;
    document.getElementById('time-widget-pattern-toggle-standalone').checked = savedStyle.showPattern || false;
    document.getElementById('time-widget-pattern-select-standalone').value = savedStyle.patternStyle || 'none';
    
    updateTimeWidgetBorderUIStandalone();
    updateTimeWidgetPatternUIStandalone();
    
    if (savedStyle.bgImage) {
        document.getElementById('remove-time-widget-bg-image-standalone').style.display = 'block';
    } else {
        document.getElementById('remove-time-widget-bg-image-standalone').style.display = 'none';
    }

    const customCssInput = document.getElementById('time-widget-custom-css-input');
    if (savedStyle.customCSS) {
        customCssInput.value = savedStyle.customCSS;
    } else {
        customCssInput.value = originalTimeWidgetCSS;
    }
    
    document.getElementById('time-widget-settings-modal').classList.remove('hidden');
}

function hideTimeWidgetSettingsStandalone() {
    document.getElementById('time-widget-settings-modal').classList.add('hidden');
    window.tempTimeWidgetBgImageStandalone = undefined;
}

function previewTimeWidgetStyle() {
    const settings = {
        bgColor: document.getElementById('time-widget-bg-picker-standalone').value,
        borderColor: document.getElementById('time-widget-border-picker-standalone').value,
        showBorder: document.getElementById('time-widget-border-toggle-standalone').checked,
        textColor: document.getElementById('time-widget-text-picker-standalone').value,
        timeColor: document.getElementById('time-widget-time-picker-standalone').value,
        opacity: parseInt(document.getElementById('time-widget-opacity-slider-standalone').value),
        textSize: parseInt(document.getElementById('time-widget-text-size-slider-standalone').value),
        timeSize: parseInt(document.getElementById('time-widget-time-size-slider-standalone').value),
        showPattern: document.getElementById('time-widget-pattern-toggle-standalone').checked,
        patternStyle: document.getElementById('time-widget-pattern-select-standalone').value,
        bgImage: window.tempTimeWidgetBgImageStandalone || originalTimeWidgetStyle.bgImage || null
    };
    applyTimeWidgetStyle(settings);
}

function hideTimeWidgetSettingsStandalone() {
    document.getElementById('time-widget-settings-modal').classList.add('hidden');
    window.tempTimeWidgetBgImageStandalone = undefined;
}

function updateTimeWidgetBorderUIStandalone() {
    const toggle = document.getElementById('time-widget-border-toggle-standalone');
    const picker = document.getElementById('time-widget-border-picker-standalone');
    
    if (toggle.checked) {
        picker.disabled = false;
        picker.style.opacity = '1';
    } else {
        picker.disabled = true;
        picker.style.opacity = '0.5';
    }
}

function updateTimeWidgetPatternUIStandalone() {
    const toggle = document.getElementById('time-widget-pattern-toggle-standalone');
    const select = document.getElementById('time-widget-pattern-select-standalone');
    
    if (toggle.checked) {
        select.disabled = false;
        select.style.opacity = '1';
    } else {
        select.disabled = true;
        select.style.opacity = '0.5';
    }
}

async function restoreDefaultTimeWidgetStyleStandalone() {
    await localforage.removeItem(TIME_WIDGET_STYLE_KEY);
    applyTimeWidgetStyle(null);
    
    document.getElementById('time-widget-bg-picker-standalone').value = '#FFFBEB';
    document.getElementById('time-widget-border-picker-standalone').value = '#FFC0CB';
    document.getElementById('time-widget-text-picker-standalone').value = '#8B5A2B';
    document.getElementById('time-widget-time-picker-standalone').value = '#5D4037';
    document.getElementById('time-widget-opacity-slider-standalone').value = 100;
    document.getElementById('time-widget-opacity-display-standalone').textContent = '100';
    document.getElementById('time-widget-text-size-slider-standalone').value = 16;
    document.getElementById('time-widget-text-size-display-standalone').textContent = '16';
    document.getElementById('time-widget-time-size-slider-standalone').value = 64;
    document.getElementById('time-widget-time-size-display-standalone').textContent = '64';
    document.getElementById('time-widget-border-toggle-standalone').checked = true;
    document.getElementById('time-widget-pattern-toggle-standalone').checked = false;
    document.getElementById('time-widget-pattern-select-standalone').value = 'none';
    
    updateTimeWidgetBorderUIStandalone();
    updateTimeWidgetPatternUIStandalone();
    
    const timeWidget = document.getElementById('time-widget');
    timeWidget.classList.remove('pattern-dots', 'pattern-waves', 'pattern-grid', 'pattern-stars', 'pattern-bubbles');
    
    window.tempTimeWidgetBgImageStandalone = undefined;
    document.getElementById('time-widget-bg-image-input-standalone').value = '';
    document.getElementById('remove-time-widget-bg-image-standalone').style.display = 'none';
    
    showToast('已恢复默认配色');
}

async function restoreDefaultTimeWidgetStyle() {
    await restoreDefaultTimeWidgetStyleStandalone();
} 


function enterFullscreen() {
    const now = Date.now();
    if (now - lastFullscreenAttempt < 100) return; 
    lastFullscreenAttempt = now;
    
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
        docElm.requestFullscreen().catch(() => {});
    } else if (docElm.webkitRequestFullscreen) {
        docElm.webkitRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

function updateFullscreenIcon() {
    const iconContainer = document.getElementById('fullscreen-icon-container');
    if (!iconContainer) return;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
        iconContainer.innerHTML = exitFullscreenSvg;
    } else {
        iconContainer.innerHTML = enterFullscreenSvg;
    }
}

function tryRestoreFullscreen() {
    if (!userWantsFullscreen) return;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
        fullscreenRetryCount = 0;
        return;
    }
    
    fullscreenRetryCount++;
    if (fullscreenRetryCount > MAX_RETRY) {
        console.log('全屏恢复达到最大重试次数');
        fullscreenRetryCount = 0;
        return;
    }
    
    console.log(`尝试恢复全屏 (第${fullscreenRetryCount}次)`);
    enterFullscreen();
    
    setTimeout(() => {
        if (userWantsFullscreen && !document.fullscreenElement && !document.webkitFullscreenElement) {
            tryRestoreFullscreen();
        } else {
            fullscreenRetryCount = 0;
        }
    }, 1000);
}

function handleFullscreenChange() {
    updateFullscreenIcon();
    closeMenu();
    
    if (userWantsFullscreen && !document.fullscreenElement && !document.webkitFullscreenElement) {
        if (fileDialogOpen) {
            console.log('文件对话框打开中，等待关闭');
            return;
        }
        console.log('检测到全屏退出，准备恢复');
        setTimeout(() => {
            tryRestoreFullscreen();
        }, 500);
    }
}

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

document.addEventListener('click', (e) => {
    let target = e.target;
    
    for (let i = 0; i < 3; i++) {
        if (!target) break;
        
        if (target.tagName === 'INPUT' && target.type === 'file') {
            if (userWantsFullscreen) {
                fileDialogOpen = true;
                console.log('检测到文件输入框点击');
            }
            break;
        }
        
        if (target.tagName === 'LABEL' && target.htmlFor) {
            const input = document.getElementById(target.htmlFor);
            if (input && input.type === 'file') {
                if (userWantsFullscreen) {
                    fileDialogOpen = true;
                    console.log('通过label检测到文件选择');
                }
                break;
            }
        }
        
        if (target.tagName === 'BUTTON') {
            const onclick = target.getAttribute('onclick') || '';
            if (onclick.includes('.click()') || onclick.includes('file')) {
                if (userWantsFullscreen) {
                    fileDialogOpen = true;
                    console.log('通过按钮检测到文件选择触发');
                }
                break;
            }
        }
        
        target = target.parentElement;
    }
}, true); 

let focusTimer;
let blurTime = 0;

window.addEventListener('blur', () => {
    if (userWantsFullscreen && !fileDialogOpen) {
        blurTime = Date.now();
    }
});

window.addEventListener('focus', () => {
    if (fileDialogOpen) {
        console.log('窗口重新获得焦点，文件对话框可能已关闭');
        clearTimeout(focusTimer);
        focusTimer = setTimeout(() => {
            fileDialogOpen = false;
            console.log('确认文件对话框关闭，开始恢复全屏');
            if (userWantsFullscreen) {
                setTimeout(() => {
                    tryRestoreFullscreen();
                }, 300);
            }
        }, 200);
    } else if (userWantsFullscreen && blurTime > 0 && Date.now() - blurTime > 1000) {
        console.log('检测到长时间失焦后恢复，尝试进入全屏');
        setTimeout(() => {
            tryRestoreFullscreen();
        }, 500);
    }
    blurTime = 0;
});

document.addEventListener('change', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'file') {
        console.log('文件已选择（change事件）');
        setTimeout(() => {
            fileDialogOpen = false;
            if (userWantsFullscreen) {
                tryRestoreFullscreen();
            }
        }, 300);
    }
}, true);

let lastCheckTime = Date.now();
setInterval(() => {
    const now = Date.now();
    
    if (fileDialogOpen && now - lastCheckTime > 5000) {
        if (document.hasFocus()) {
            console.log('定期检查：超时清除文件对话框标记');
            fileDialogOpen = false;
            if (userWantsFullscreen) {
                tryRestoreFullscreen();
            }
        }
    }
    
    if (userWantsFullscreen && !document.fullscreenElement && !document.webkitFullscreenElement && !fileDialogOpen) {
        if (now - lastFullscreenAttempt > 3000) { 
            console.log('定期检查：发现全屏丢失，尝试恢复');
            tryRestoreFullscreen();
        }
    }
    
    lastCheckTime = now;
}, 2000); 

document.addEventListener('DOMContentLoaded', async () => { 
    
    const savedWallpaper = await localforage.getItem(WALLPAPER_KEY);
    if (savedWallpaper) {
        document.getElementById('wallpaper').style.backgroundImage = `url('${savedWallpaper}')`;
    }

const savedFontSettings = await localforage.getItem(FONT_SETTINGS_KEY);
if (savedFontSettings) {
    applyFontSettings(savedFontSettings);
}

const savedIconShape = await localforage.getItem(ICON_SHAPE_KEY);
applyIconShape(savedIconShape !== null ? savedIconShape : 60);

const savedFabSize = await localforage.getItem(FAB_SIZE_KEY);
applyFabSize(savedFabSize !== null ? savedFabSize : 64);
    
    await updateFabIcon(); 
const savedTimeWidgetStyle = await localforage.getItem(TIME_WIDGET_STYLE_KEY);
if (savedTimeWidgetStyle) {
    applyTimeWidgetStyle(savedTimeWidgetStyle);
}
    
    await cleanupRecycleBin(); 
    
    await renderUI(); 
    updateTimeWidget(); 
    setInterval(updateTimeWidget, 1000); 
    updateBatteryStatus(); 
});
    // 小鱼修正：增加协议判断，防止在本地 file:// 打开时报错
if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => {
            console.log('Service Worker 注册跳过或失败 (本地环境可忽略)');
        });
    });
}

function generateAnnotatedCSS(style) {
    const safeStyle = style || {};
    const showBorder = safeStyle.showBorder !== false;
    const borderStyle = showBorder ? `4px solid ${safeStyle.borderColor || '#FFC0CB'}` : 'none';
    const opacity = (safeStyle.opacity !== undefined ? safeStyle.opacity : 100) / 100;
    const showPattern = safeStyle.showPattern === true && safeStyle.patternStyle && safeStyle.patternStyle !== 'none';

    let cssText = `/* 
  小鱼AI提示：您可以在这里直接修改CSS代码来自定义时间插件！
  修改会实时生效，点击“应用”按钮即可保存。
*/

/* 整体容器样式 */
#time-widget {
  /* 边框样式: 粗细 样式 颜色 */
  border: ${borderStyle};
  
  /* 文字颜色 (问候语/日期) */
  color: ${safeStyle.textColor || '#8B5A2B'};
}

/* 问候语/日期 样式 */
#widget-greeting, #widget-date {
  /* 文字大小 */
  font-size: ${safeStyle.textSize || 16}px;
}

/* 时间数字 样式 */
#widget-time {
  /* 时间颜色 */
  color: ${safeStyle.timeColor || '#5D4037'};
  
  /* 时间大小 */
  font-size: ${safeStyle.timeSize || 64}px;
}

/* 背景层样式 (伪元素) */
#time-widget::before {
  /* 背景颜色 */
  background-color: ${safeStyle.bgColor || '#FFFBEB'};
  
  /* 背景透明度 (0=完全透明, 1=完全不透明) */
  opacity: ${opacity};
`;

    let bgImageDeclarations = '';
    if (safeStyle.bgImage) {
        bgImageDeclarations += `
  /* 背景图片 (会覆盖背景色) */
  background-image: url("${safeStyle.bgImage}");
  background-size: cover;
  background-position: center;`;
    }

    if (showPattern) {
        let patternCss = '';
        switch (safeStyle.patternStyle) {
            case 'dots': patternCss = `radial-gradient(circle at 15% 20%, rgba(255, 182, 193, 0.5) 8px, transparent 8px), radial-gradient(circle at 85% 15%, rgba(173, 216, 230, 0.5) 6px, transparent 6px), radial-gradient(circle at 25% 75%, rgba(255, 218, 185, 0.5) 7px, transparent 7px), radial-gradient(circle at 70% 80%, rgba(221, 160, 221, 0.5) 5px, transparent 5px), radial-gradient(circle at 45% 40%, rgba(255, 245, 157, 0.5) 6px, transparent 6px), radial-gradient(circle at 90% 60%, rgba(152, 251, 152, 0.5) 8px, transparent 8px), radial-gradient(circle at 10% 50%, rgba(255, 192, 203, 0.5) 5px, transparent 5px), radial-gradient(circle at 60% 25%, rgba(176, 224, 230, 0.5) 7px, transparent 7px)`; break;
            case 'waves': patternCss = `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 192, 203, 0.15) 10px, rgba(255, 192, 203, 0.15) 20px)`; break;
            case 'grid': patternCss = `linear-gradient(rgba(255, 192, 203, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 192, 203, 0.2) 1px, transparent 1px)`; break;
            case 'stars': patternCss = `radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.6) 3px, transparent 3px), radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.5) 4px, transparent 4px), radial-gradient(circle at 30% 80%, rgba(255, 215, 0, 0.4) 2px, transparent 2px), radial-gradient(circle at 70% 70%, rgba(255, 215, 0, 0.5) 3px, transparent 3px), radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.6) 2px, transparent 2px), radial-gradient(circle at 90% 85%, rgba(255, 215, 0, 0.4) 3px, transparent 3px), radial-gradient(circle at 15% 60%, rgba(255, 215, 0, 0.5) 2px, transparent 2px)`; break;
            case 'bubbles': patternCss = `radial-gradient(circle at 25% 25%, rgba(173, 216, 230, 0.3) 15px, transparent 15px), radial-gradient(circle at 75% 30%, rgba(255, 182, 193, 0.25) 20px, transparent 20px), radial-gradient(circle at 50% 70%, rgba(221, 160, 221, 0.3) 18px, transparent 18px), radial-gradient(circle at 15% 75%, rgba(255, 218, 185, 0.25) 12px, transparent 12px), radial-gradient(circle at 85% 75%, rgba(152, 251, 152, 0.3) 16px, transparent 16px)`; break;
        }
        bgImageDeclarations += `
  /* 装饰花纹 (会叠加在背景之上) */
  background-image: ${patternCss};`;
        if (safeStyle.patternStyle === 'grid') {
            bgImageDeclarations += `
  background-size: 20px 20px;`;
        }
    }

    cssText += bgImageDeclarations;
    cssText += `
}`;
    return cssText;
}

function setupStandaloneTimeWidgetListeners() {
    const controlsToPreview = [
        'time-widget-bg-picker-standalone', 'time-widget-border-picker-standalone', 
        'time-widget-text-picker-standalone', 'time-widget-time-picker-standalone',
        'time-widget-opacity-slider-standalone', 'time-widget-text-size-slider-standalone',
        'time-widget-time-size-slider-standalone', 'time-widget-border-toggle-standalone',
        'time-widget-pattern-toggle-standalone', 'time-widget-pattern-select-standalone'
    ];

const previewAndSyncCss = () => {
    let finalBgImage = null;
    if (window.tempTimeWidgetBgImageStandalone !== undefined) {
        finalBgImage = window.tempTimeWidgetBgImageStandalone;
    } else if (originalTimeWidgetStyle && originalTimeWidgetStyle.bgImage) {
        finalBgImage = originalTimeWidgetStyle.bgImage;
    }
    
    const settings = {
        bgColor: document.getElementById('time-widget-bg-picker-standalone').value,
        borderColor: document.getElementById('time-widget-border-picker-standalone').value,
        showBorder: document.getElementById('time-widget-border-toggle-standalone').checked,
        textColor: document.getElementById('time-widget-text-picker-standalone').value,
        timeColor: document.getElementById('time-widget-time-picker-standalone').value,
        opacity: parseInt(document.getElementById('time-widget-opacity-slider-standalone').value),
        textSize: parseInt(document.getElementById('time-widget-text-size-slider-standalone').value),
        timeSize: parseInt(document.getElementById('time-widget-time-size-slider-standalone').value),
        showPattern: document.getElementById('time-widget-pattern-toggle-standalone').checked,
        patternStyle: document.getElementById('time-widget-pattern-select-standalone').value,
        bgImage: finalBgImage 
    };
    
    applyTimeWidgetStyle(settings);
    
    const customCssInput = document.getElementById('time-widget-custom-css-input');
    customCssInput.value = generateAnnotatedCSS(settings);
};

    controlsToPreview.forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', previewAndSyncCss);
        el.addEventListener('change', previewAndSyncCss);
    });

    const customCssInput = document.getElementById('time-widget-custom-css-input');
    customCssInput.addEventListener('input', () => {
        let previewStyleTag = document.getElementById('time-widget-live-preview-style');
        if (!previewStyleTag) {
            previewStyleTag = document.createElement('style');
            previewStyleTag.id = 'time-widget-live-preview-style';
            document.head.appendChild(previewStyleTag);
        }
        previewStyleTag.innerHTML = customCssInput.value;
    });

    document.getElementById('time-widget-opacity-slider-standalone').addEventListener('input', function() {
        document.getElementById('time-widget-opacity-display-standalone').textContent = this.value;
    });
    document.getElementById('time-widget-text-size-slider-standalone').addEventListener('input', function() {
        document.getElementById('time-widget-text-size-display-standalone').textContent = this.value;
    });
    document.getElementById('time-widget-time-size-slider-standalone').addEventListener('input', function() {
        document.getElementById('time-widget-time-size-display-standalone').textContent = this.value;
    });

    document.getElementById('time-widget-border-toggle-standalone').addEventListener('change', updateTimeWidgetBorderUIStandalone);
    document.getElementById('time-widget-pattern-toggle-standalone').addEventListener('change', updateTimeWidgetPatternUIStandalone);

    document.getElementById('time-widget-bg-image-input-standalone').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            window.tempTimeWidgetBgImageStandalone = event.target.result;
            document.getElementById('remove-time-widget-bg-image-standalone').style.display = 'block';
            previewAndSyncCss(); 
        };
        reader.readAsDataURL(file);
    });
document.getElementById('apply-bg-image-url-standalone').addEventListener('click', function() {
    const urlInput = document.getElementById('time-widget-bg-image-url-standalone');
    const imageUrl = urlInput.value.trim();
    
    if (!imageUrl) {
        showToast('请先输入图片URL');
        return;
    }
    
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        showToast('请输入完整的URL（以http://或https://开头）');
        return;
    }
    
    window.tempTimeWidgetBgImageStandalone = imageUrl;
    document.getElementById('remove-time-widget-bg-image-standalone').style.display = 'block';
    previewAndSyncCss(); 
    showToast('已应用图片URL，点击下方"应用"保存');
});

document.getElementById('remove-time-widget-bg-image-standalone').addEventListener('click', function() {
    window.tempTimeWidgetBgImageStandalone = null;
    document.getElementById('time-widget-bg-image-input-standalone').value = '';
    document.getElementById('time-widget-bg-image-url-standalone').value = ''; 
    this.style.display = 'none';
    previewAndSyncCss(); 
    showToast('已移除背景图片');
});

    document.getElementById('cancel-time-widget-settings-standalone').addEventListener('click', function() {
        const previewTag = document.getElementById('time-widget-live-preview-style');
        if (previewTag) previewTag.remove();
        if (originalTimeWidgetStyle) {
            applyTimeWidgetStyle(originalTimeWidgetStyle);
        }
        hideTimeWidgetSettingsStandalone();
    });

    document.getElementById('reset-time-widget-settings-standalone').addEventListener('click', async function() {
        await localforage.removeItem(TIME_WIDGET_STYLE_KEY);
        applyTimeWidgetStyle(null); 
        hideTimeWidgetSettingsStandalone();
        showToast('已恢复默认配色');
    });

document.getElementById('apply-time-widget-settings-standalone').addEventListener('click', async function() {
    const customCssText = document.getElementById('time-widget-custom-css-input').value;
    
    let finalBgImage = null;
    if (window.tempTimeWidgetBgImageStandalone !== undefined) {
        finalBgImage = window.tempTimeWidgetBgImageStandalone;
    } else if (originalTimeWidgetStyle && originalTimeWidgetStyle.bgImage) {
        finalBgImage = originalTimeWidgetStyle.bgImage;
    }
    
    const settings = {
        bgColor: document.getElementById('time-widget-bg-picker-standalone').value,
        borderColor: document.getElementById('time-widget-border-picker-standalone').value,
        showBorder: document.getElementById('time-widget-border-toggle-standalone').checked,
        textColor: document.getElementById('time-widget-text-picker-standalone').value,
        timeColor: document.getElementById('time-widget-time-picker-standalone').value,
        opacity: parseInt(document.getElementById('time-widget-opacity-slider-standalone').value),
        textSize: parseInt(document.getElementById('time-widget-text-size-slider-standalone').value),
        timeSize: parseInt(document.getElementById('time-widget-time-size-slider-standalone').value),
        showPattern: document.getElementById('time-widget-pattern-toggle-standalone').checked,
        patternStyle: document.getElementById('time-widget-pattern-select-standalone').value,
        bgImage: finalBgImage, 
        customCSS: customCssText
    };
    
    await localforage.setItem(TIME_WIDGET_STYLE_KEY, settings);
    applyTimeWidgetStyle(settings);
    
    const previewTag = document.getElementById('time-widget-live-preview-style');
    if (previewTag) previewTag.remove();
    
    window.tempTimeWidgetBgImageStandalone = undefined;
    showToast('时间插件设置已应用！');
    hideTimeWidgetSettingsStandalone();
});
document.getElementById('restore-original-css-btn').addEventListener('click', function() {
    const customCssInput = document.getElementById('time-widget-custom-css-input');
    customCssInput.value = originalTimeWidgetCSS;
    
    let previewStyleTag = document.getElementById('time-widget-live-preview-style');
    if (!previewStyleTag) {
        previewStyleTag = document.createElement('style');
        previewStyleTag.id = 'time-widget-live-preview-style';
        document.head.appendChild(previewStyleTag);
    }
    previewStyleTag.innerHTML = originalTimeWidgetCSS;
    
    showToast('已恢复为原始CSS代码');
});
}
async function restoreGlobalBeautification() {
    const confirm = await customConfirm("确定要重置所有美化设置的预览吗？\n点击“应用”后将正式恢复初始状态。");
    if (!confirm) return;
    
    // 调用前面写好的重置预览功能
    restoreDefaultWallpaper();
    restoreDefaultFabIcon();
    restoreDefaultFontSettings();
    
    document.getElementById('icon-shape-slider').value = 60;
    applyIconShape(60);
    
    document.getElementById('fab-size-slider').value = 64;
    document.getElementById('fab-size-display').textContent = 64;
    applyFabSize(64);
    
    document.querySelector('input[name="layout"][value="scroll"]').checked = true;
    document.getElementById('fab-wake-method-select').value = 'click';
    
    applyTimeWidgetStyle(null); // 预览取消时间插件
    
    pendingThemeRestores.global = true;
    showToast('已重置所有预览，点击“应用”生效');
}

setupStandaloneTimeWidgetListeners(); 
async function applyFabWakeMethod(method) {
    const fabTrigger = document.getElementById('global-fab-trigger');
    
    const newTrigger = fabTrigger.cloneNode(true);
    fabTrigger.parentNode.replaceChild(newTrigger, fabTrigger);
    
    const handleTriggerTap = (event) => {
        if (fabContainer.classList.contains('ghost-mode')) {
            showFab();
            showToast('已唤出菜单');
            event.preventDefault();
        }
    };
    
    if (method === 'click') {
        newTrigger.addEventListener('click', handleTriggerTap);
        newTrigger.addEventListener('touchend', handleTriggerTap);
    } else if (method === 'dblclick') {
        newTrigger.addEventListener('dblclick', handleTriggerTap);
        
        let lastTapTime = 0;
        newTrigger.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            if (currentTime - lastTapTime < 300) {
                handleTriggerTap(e);
            }
            lastTapTime = currentTime;
        });
} else if (method === 'swipe') {
    let touchStartY = 0;
    let hasSwiped = false;
    
    newTrigger.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        hasSwiped = false;
    });
    
    newTrigger.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - touchStartY;
        
        if (deltaY > 30) {
            hasSwiped = true;
        }
    });
    
    newTrigger.addEventListener('touchend', (e) => {
        if (hasSwiped) {
            handleTriggerTap(e);
        }
    });
}
}

function customConfirm(message) {
    return new Promise((resolve) => {
        const dialog = document.getElementById('custom-confirm-dialog');
        const messageEl = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok-btn');
        const cancelBtn = document.getElementById('confirm-cancel-btn');
        
        messageEl.textContent = message;
        dialog.classList.remove('hidden');
        
        const handleOk = () => {
            dialog.classList.add('hidden');
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            resolve(true);
        };
        
        const handleCancel = () => {
            dialog.classList.add('hidden');
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            resolve(false);
        };
        
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
    });
}

function customAlert(message) {
    return new Promise((resolve) => {
        const dialog = document.getElementById('custom-alert-dialog');
        const messageEl = document.getElementById('alert-message');
        const okBtn = document.getElementById('alert-ok-btn');
        
        messageEl.textContent = message;
        dialog.classList.remove('hidden');
        
        const handleOk = () => {
            dialog.classList.add('hidden');
            okBtn.removeEventListener('click', handleOk);
            resolve();
        };
        
        okBtn.addEventListener('click', handleOk);
    });
}

// 小鱼修正：仅在网络环境下注册 Service Worker，解决 file:// 协议报错问题
if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => {
            // 在没有 sw.js 文件或本地环境时忽略错误
            console.log('PWA Service Worker 未启用 (本地模式)');
        });
    });
}

