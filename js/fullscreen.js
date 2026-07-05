/* 模块: js/fullscreen.js */

// [Function] toggleFullScreen
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

// [Function] enterFullscreen
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

// [Function] exitFullscreen
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

// [Function] updateFullscreenIcon
function updateFullscreenIcon() {
    const iconContainer = document.getElementById('fullscreen-icon-container');
    if (!iconContainer) return;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
        iconContainer.innerHTML = exitFullscreenSvg;
    } else {
        iconContainer.innerHTML = enterFullscreenSvg;
    }
}

// [Function] tryRestoreFullscreen
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

// [Function] handleFullscreenChange
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

// [Expression] addEventListener
document.addEventListener('fullscreenchange', handleFullscreenChange);

// [Expression] addEventListener
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

// [Expression] addEventListener
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

// [Expression] addEventListener
window.addEventListener('blur', () => {
    if (userWantsFullscreen && !fileDialogOpen) {
        blurTime = Date.now();
    }
});

// [Expression] addEventListener
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

// [Expression] addEventListener
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

// [Expression] AnonymousBlock
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

// [Expression] addEventListener
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

// [If] AnonymousBlock
if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => {
            console.log('Service Worker 注册跳过或失败 (本地环境可忽略)');
        });
    });
}

// [Function] generateAnnotatedCSS
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

