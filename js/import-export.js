/* 模块: js/import-export.js */

// [Function] showImportExportModal
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

// [Function] hideImportExportModal
function hideImportExportModal() {
    importExportModal.classList.remove('active');
    setTimeout(() => {
        importExportModal.style.display = 'none';
        fabContainer.style.display = 'block';
    }, 300);
}

// [Function] getWeChatDataViaBridge
function getWeChatDataViaBridge() {
    return new Promise((resolve, reject) => {
        const bridge = document.getElementById('wechat-data-bridge');
        if (!bridge || !bridge.contentWindow) {
            return reject(new Error('未找到微信通信桥梁!'));
        }
        const listener = (event) => {
            if (event.source === bridge.contentWindow && event.data.action === 'wechat-data-response') {
                window.removeEventListener('message', listener);
                resolve(event.data.payload);
            }
        };
        window.addEventListener('message', listener);
        setTimeout(() => {
            window.removeEventListener('message', listener);
            reject(new Error('获取微信数据超时!'));
        }, 5000);
        bridge.contentWindow.postMessage({ action: 'export-wechat-data' }, '*');
    });
}

// [Function] exportAllData
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

// [Function] importAllData
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

// [Expression] addEventListener
document.getElementById('close-import-export-modal-btn').addEventListener('click', hideImportExportModal);

// [Function] exportWorldBook
async function exportWorldBook() {
    const entries = await getWorldEntries();
    if (entries.length === 0) {
        showToast('没有数据可导出');
        return;
    }
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `世界书备份_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('导出成功');
}

// [Function] importWorldBook
async function importWorldBook(input) {
    const file = input.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        let parsedData;
        
        try {
            parsedData = JSON.parse(text);
        } catch (e) {
            throw new Error('不是有效的JSON文件');
        }

        let rawEntries = [];

        if (Array.isArray(parsedData)) {
            rawEntries = parsedData;
        } else if (parsedData.ephone_world_book && Array.isArray(parsedData.ephone_world_book)) {
            rawEntries = parsedData.ephone_world_book;
            showToast('检测到全能备份，已提取世界书数据');
        } else if (typeof parsedData === 'object') {
            const possibleArray = Object.values(parsedData).find(val => Array.isArray(val));
            if (possibleArray) {
                rawEntries = possibleArray;
            }
        }

        if (rawEntries.length === 0) {
            throw new Error('文件中未找到有效的世界书数据');
        }

        const processedEntries = rawEntries.map(e => {
            let title = e.title || e.name || e.key || e.command || e.id || '未命名条目';
            let content = e.content || e.text || e.prompt || e.value || e.description || '';
            let category = e.category || e.tag || e.group || '未分类';

            if (!content && typeof e === 'string') {
                content = e; 
                title = content.substring(0, 10) + '...';
            }

            return {
                id: e.id || ('import_' + Date.now() + Math.random()),
                title: String(title),
                content: String(content),
                category: String(category)
            };
        }).filter(e => e.content);

        if (processedEntries.length === 0) {
            throw new Error('解析后没有有效数据');
        }

        const confirmImport = await customConfirm(`解析出 ${processedEntries.length} 条数据。\n点击【确定】追加到现有数据\n点击【取消】覆盖现有数据`);
        
        let currentEntries = [];
        if (confirmImport) {
            currentEntries = await getWorldEntries();
        } 

        const mergedMap = new Map();
        currentEntries.forEach(e => mergedMap.set(e.id, e));
        processedEntries.forEach(e => {
            if (mergedMap.has(e.id) && confirmImport) {
                e.id = 'import_' + Date.now() + Math.random();
            }
            mergedMap.set(e.id, e);
        });

        const finalEntries = Array.from(mergedMap.values());
        await localforage.setItem(WORLD_BOOK_KEY, finalEntries);
        
        renderWorldBookList();
        showToast(`成功导入 ${processedEntries.length} 条数据`);
    } catch (e) {
        console.error(e);
        await customAlert('导入失败：' + e.message);
    }
    input.value = ''; 
}

