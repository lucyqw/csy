/* 模块: js/apps-core.js */

// [Function] getDockApps
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

// [Function] saveDockApps
async function saveDockApps(apps) {
    return localforage.setItem(DOCK_APPS_KEY, apps);
}

// [Function] getApps
async function getApps() { const defaultApps = []; const apps = await localforage.getItem(STORAGE_KEY); return apps || defaultApps; }

// [Function] saveApps
async function saveApps(apps) { return localforage.setItem(STORAGE_KEY, apps); }

// [Function] getLargeIcons
async function getLargeIcons() {
    const largeIcons = await localforage.getItem(LARGE_ICONS_KEY);
    return largeIcons || { slot1: null, slot2: null }; 
}

// [Function] saveLargeIcons
async function saveLargeIcons(largeIcons) {
    return localforage.setItem(LARGE_ICONS_KEY, largeIcons);
}

// [Function] setLargeIcon
async function setLargeIcon(slotNumber, appId) {
    const largeIcons = await getLargeIcons();
    largeIcons[`slot${slotNumber}`] = appId;
    await saveLargeIcons(largeIcons);
}

// [Function] removeLargeIcon
async function removeLargeIcon(slotNumber) {
    const largeIcons = await getLargeIcons();
    largeIcons[`slot${slotNumber}`] = null;
    await saveLargeIcons(largeIcons);
}

// [Function] renderUI
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

// [Function] renderDockIcons
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

// [Function] showAddAppModal
async function showAddAppModal() { 
    addAppModal.classList.remove('hidden'); 
    setTimeout(() => {
        toggleAppSourceFields();
    }, 10);
}

// [Function] hideAddAppModal
function hideAddAppModal() { addAppModal.classList.add('hidden'); addAppForm.reset(); }

// [Function] toggleAppSourceFields
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

// [Expression] addEventListener
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input[name="app-source"]').forEach(radio => {
        radio.addEventListener('change', toggleAppSourceFields);
    });
    toggleAppSourceFields();
});

// [Function] detectEncoding
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

// [Function] decodeText
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

// [Function] readFileAs
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

// [Expression] addEventListener
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

// [Function] saveNewApp
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

// [Expression] addEventListener
cancelAddAppBtn.addEventListener('click', hideAddAppModal);

// [Function] deleteApp
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

// [Expression] addEventListener
document.getElementById('close-settings-modal-btn').addEventListener('click', hideSettingsModal);

// [Function] updateAppIcon
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

// [Function] restoreDockAppIcon
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

// [Expression] addEventListener
cancelChangeIconBtn.addEventListener('click', hideChangeIconModal);

// [Function] openApp
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
    
    // 小鱼优化：如果是微信（通过名字判断），直接显示内部的 div 容器
    if (appToOpen.name === '微信') {
        const wechatDiv = document.getElementById('wechat-native-app');
        if (wechatDiv) {
            wechatDiv.style.display = 'flex';
            // 触发微信内部的初始化渲染（如果需要）
            if (typeof renderChatList === 'function') {
                renderChatList();
            }
        }
    } else {
        // 其他第三方网址应用，暂不处理或提示
        showToast('当前架构已升级，仅支持原生微信应用');
    }
    
    appViewer.style.display = 'flex'; 
    setTimeout(() => appViewer.classList.add('active'), 10); 
    closeMenu(); 
    await renderUI(); 
}

