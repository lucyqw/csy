/* 模块: js/time-widget.js */

// [Function] applyTimeWidgetStyle
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

// [Function] showTimeWidgetSettingsStandalone
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

// [Function] hideTimeWidgetSettingsStandalone
function hideTimeWidgetSettingsStandalone() {
    document.getElementById('time-widget-settings-modal').classList.add('hidden');
    window.tempTimeWidgetBgImageStandalone = undefined;
}

// [Function] previewTimeWidgetStyle
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

// [Function] hideTimeWidgetSettingsStandalone
function hideTimeWidgetSettingsStandalone() {
    document.getElementById('time-widget-settings-modal').classList.add('hidden');
    window.tempTimeWidgetBgImageStandalone = undefined;
}

// [Function] updateTimeWidgetBorderUIStandalone
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

// [Function] updateTimeWidgetPatternUIStandalone
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

// [Function] restoreDefaultTimeWidgetStyleStandalone
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

// [Function] restoreDefaultTimeWidgetStyle
async function restoreDefaultTimeWidgetStyle() {
    await restoreDefaultTimeWidgetStyleStandalone();
}

// [Function] setupStandaloneTimeWidgetListeners
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

// [Function] restoreGlobalBeautification
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

// [Expression] AnonymousBlock
setupStandaloneTimeWidgetListeners();

