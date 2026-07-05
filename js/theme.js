/* 模块: js/theme.js */

// [Function] showThemeModal
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

// [Function] hideThemeModal
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

// [Function] restoreDefaultWallpaper
function restoreDefaultWallpaper() {
    document.getElementById('wallpaper-url-input').value = '';
    document.getElementById('wallpaper-file-input').value = '';
    wallpaperDiv.style.backgroundImage = `url('wallpaper.png')`;
    pendingThemeRestores.wallpaper = true;
    showToast('已重置壁纸预览，点击“应用”生效');
}

// [Function] applyAndSaveWallpaper
async function applyAndSaveWallpaper(imageUrl) {
    wallpaperDiv.style.backgroundImage = `url('${imageUrl}')`;
    await localforage.setItem(WALLPAPER_KEY, imageUrl);
}

// [Expression] addEventListener
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

// [Function] applyFontSettings
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

// [Function] restoreDefaultFontSettings
function restoreDefaultFontSettings() {
    document.getElementById('font-family-select').selectedIndex = 0;
    document.getElementById('font-color-input').value = '#5D4037';
    applyFontSettings(null); 
    pendingThemeRestores.font = true;
    showToast('已重置字体预览，点击“应用”生效');
}

// [Function] applyIconShape
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

// [Function] updateIconShape
function updateIconShape(value) {
    // 仅预览，不再直接保存到数据库
    const numericValue = parseInt(value, 10);
    applyIconShape(numericValue);
}

// [Function] applyFabSize
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

// [Function] updateFabSize
function updateFabSize(value) {
    // 仅预览，不再直接保存到数据库
    const numericValue = parseInt(value, 10);
    applyFabSize(numericValue);
}

