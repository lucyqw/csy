/* 模块: js/large-icon.js */

// [Function] showSelectAppForLargeIcon
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

// [Function] selectAppForLargeIcon
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

// [Expression] addEventListener
document.getElementById('cancel-select-large-icon').addEventListener('click', () => {
    document.getElementById('select-large-icon-modal').classList.add('hidden');
});

// [Function] showLargeIconMenu
function showLargeIconMenu(event, slotNumber) {
    event.preventDefault(); 
    currentLargeIconSlot = slotNumber;
    document.getElementById('large-icon-menu-modal').classList.remove('hidden');
}

// [Function] changeLargeIconApp
function changeLargeIconApp() {
    document.getElementById('large-icon-menu-modal').classList.add('hidden');
    showSelectAppForLargeIcon(currentLargeIconSlot);
}

// [Function] removeLargeIconConfirm
async function removeLargeIconConfirm() {
    const removeLargeIconConfirm = await customConfirm('确定要移除这个大图标吗？');
if (removeLargeIconConfirm) {
        await removeLargeIcon(currentLargeIconSlot);
        showToast('已移除大图标');
        document.getElementById('large-icon-menu-modal').classList.add('hidden');
        await renderUI();
    }
}

// [Expression] addEventListener
document.getElementById('cancel-large-icon-menu').addEventListener('click', () => {
    document.getElementById('large-icon-menu-modal').classList.add('hidden');
});

