/* 模块: js/recycle-bin.js */

// [Function] getRecycleBinApps
async function getRecycleBinApps() {
    const apps = await localforage.getItem(RECYCLE_BIN_KEY);
    return apps || [];
}

// [Function] saveRecycleBinApps
async function saveRecycleBinApps(apps) {
    return localforage.setItem(RECYCLE_BIN_KEY, apps);
}

// [Function] showRecycleBinModal
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

// [Function] hideRecycleBinModal
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

// [Function] restoreApp
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

// [Function] permanentlyDeleteApp
async function permanentlyDeleteApp(appId) {
    const permDeleteConfirm = await customConfirm('此操作将彻底删除该应用，无法恢复。确定要继续吗？');
if (!permDeleteConfirm) return;

    let recycleBinApps = await getRecycleBinApps();
    recycleBinApps = recycleBinApps.filter(app => app.id != appId);
    await saveRecycleBinApps(recycleBinApps);

    showToast('已彻底删除');
    await showRecycleBinModal();
}

// [Expression] addEventListener
document.getElementById('close-recycle-bin-modal-btn').addEventListener('click', hideRecycleBinModal);

// [Function] showRecycleBinSettingsModal
async function showRecycleBinSettingsModal() {
    const settings = await localforage.getItem(RECYCLE_BIN_SETTINGS_KEY) || { ttl: 30 }; 
    const selectedRadio = document.querySelector(`input[name="ttl"][value="${settings.ttl}"]`);
    if (selectedRadio) {
        selectedRadio.checked = true;
    }
    recycleBinSettingsModal.classList.remove('hidden');
    fabContainer.style.display = 'none'; 
}

// [Function] hideRecycleBinSettingsModal
function hideRecycleBinSettingsModal() {
    recycleBinSettingsModal.classList.add('hidden');
    
    const recycleBinModalOpen = (recycleBinModal.style.display === 'flex' && recycleBinModal.classList.contains('active'));
    
    if (!recycleBinModalOpen) {
        fabContainer.style.display = 'block';
    }
}

// [Expression] addEventListener
recycleBinSettingsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(recycleBinSettingsForm);
    const ttl = formData.get('ttl');
    
    await localforage.setItem(RECYCLE_BIN_SETTINGS_KEY, { ttl: ttl });
    showToast('设置已保存');
    hideRecycleBinSettingsModal();
});

// [Expression] addEventListener
cancelRecycleBinSettingsBtn.addEventListener('click', hideRecycleBinSettingsModal);

// [Function] cleanupRecycleBin
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

