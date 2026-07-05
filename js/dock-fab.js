/* 模块: js/dock-fab.js */

// [Function] getWeChatContactsDirectly
function getWeChatContactsDirectly() {
    return new Promise((resolve) => {
        // 尝试打开微信的数据库 (WeChatDB)
        const request = indexedDB.open('WeChatDB', 1);
        request.onerror = () => { console.log('无法打开微信数据库'); resolve([]); };
        request.onsuccess = (event) => {
            const db = event.target.result;
            // 检查是否存在 userProfile 表
            if (!db.objectStoreNames.contains('userProfile')) {
                db.close(); resolve([]); return;
            }
            const transaction = db.transaction(['userProfile'], 'readonly');
            const objectStore = transaction.objectStore('userProfile');
            // 获取 customContacts (自定义角色列表)
            const getRequest = objectStore.get('customContacts');
            getRequest.onsuccess = () => {
                const result = getRequest.result;
                // 微信存的数据结构是 {id: 'customContacts', value: [...]}
                if (result && result.value && Array.isArray(result.value)) {
                    resolve(result.value);
                } else {
                    resolve([]);
                }
                db.close();
            };
            getRequest.onerror = () => { db.close(); resolve([]); };
        };
    });
}

// [Function] applyAndSaveFabDragIcon
async function applyAndSaveFabDragIcon(iconUrl) {
    await localforage.setItem(FAB_DRAG_ICON_KEY, iconUrl);
    await updateFabIcon();
}

// [Function] updateFabIconSettingsUI
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

// [Function] applyAndSaveFabExpandedIcon
async function applyAndSaveFabExpandedIcon(iconUrl) {
    await localforage.setItem(FAB_EXPANDED_ICON_KEY, iconUrl);
    await updateFabIcon();
}

// [Function] restoreDefaultExpandedFabIcon
async function restoreDefaultExpandedFabIcon() {
    await localforage.removeItem(FAB_EXPANDED_ICON_KEY);
    await updateFabIcon();
    showToast('已恢复默认展开图标');
}

// [Function] updateFabIcon
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

// [Function] restoreDefaultFabIcon
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

// [Expression] addEventListener
document.getElementById('close-theme-modal').addEventListener('click', hideThemeModal);

// [Function] hideFab
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

// [Function] showFab
function showFab() { fabContainer.classList.remove('ghost-mode'); }

// [Function] toggleMenu
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

// [Function] closeMenu
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

// [Expression] addEventListener
document.addEventListener('click', e => { if (!fabContainer.contains(e.target) && fabContainer.classList.contains('menu-open')) { closeMenu(); } });

// [Expression] addEventListener
fabMain.addEventListener('mousedown', startDrag);

// [Expression] addEventListener
fabMain.addEventListener('touchstart', startDrag, { passive: false });

// [Function] startDrag
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

// [Function] onDrag
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

// [Function] stopDrag
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

// [Expression] AnonymousBlock
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

// [Expression] addEventListener
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

// [Expression] AnonymousBlock
(async function initFabWakeMethod() {
    const savedMethod = await localforage.getItem(FAB_WAKE_METHOD_KEY) || 'click';
    await applyFabWakeMethod(savedMethod);
})();

// [Function] applyFabWakeMethod
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

