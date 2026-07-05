/* 模块: js/change-icon.js */

// [Function] showChangeIconModal
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

// [Function] hideChangeIconModal
function hideChangeIconModal() {
    changeIconModal.classList.add('hidden');
    changeIconForm.reset();
    document.getElementById('change-app-name').value = ''; 
    currentEditingAppInfo = null; 
}

// [Expression] addEventListener
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

