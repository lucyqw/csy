/* 模块: js/translate.js */

// [VariableDeclaration] Variables: TRANSLATE_ICON_SVG
const TRANSLATE_ICON_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block; vertical-align:middle; margin-left:4px; opacity:0.5;"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>`;

// [VariableDeclaration] Variables: currentTranslateEngine
let currentTranslateEngine = localStorage.getItem('translate_engine') || 'libre';

// [VariableDeclaration] Variables: translateEngineTimer
let translateEngineTimer = null;

// [VariableDeclaration] Variables: translateLongPressed
let translateLongPressed = false;

// [FunctionDeclaration] Function: startTranslateEngineTimer
function startTranslateEngineTimer(e) {
    translateLongPressed = false;
    translateEngineTimer = setTimeout(() => {
        translateLongPressed = true;
        hideContextMenu(); // 关闭长按菜单
        showTranslateEngineModal(); // 弹出引擎选择
        if (navigator.vibrate) navigator.vibrate(50);
    }, 600);
}

// [FunctionDeclaration] Function: clearTranslateEngineTimer
function clearTranslateEngineTimer() {
    clearTimeout(translateEngineTimer);
}

// [FunctionDeclaration] Function: showTranslateEngineModal
function showTranslateEngineModal() {
    // 更新勾选状态
    document.getElementById('engineCheckGoogle').style.display =
        currentTranslateEngine === 'google' ? 'block' : 'none';
    document.getElementById('engineCheckLibre').style.display =
        currentTranslateEngine === 'libre' ? 'block' : 'none';

    document.getElementById('translateEngineModal').style.display = 'flex';
}

// [FunctionDeclaration] Function: selectTranslateEngine
function selectTranslateEngine(engine) {
    currentTranslateEngine = engine;
    localStorage.setItem('translate_engine', engine);
    document.getElementById('translateEngineModal').style.display = 'none';

    const names = { google: '谷歌翻译', libre: 'LibreTranslate' };
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = `已切换为 ${names[engine]}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
}

// [FunctionDeclaration] Function: translateCurrentMessage
async function translateCurrentMessage() {
    // 如果是长按触发的，不执行翻译
    if (translateLongPressed) { translateLongPressed = false; return; }

    if (!currentSelectedMsgTimestamp) return;
    hideContextMenu();

    // 1. 取出消息内容
    const key = 'chat_messages_' + currentChatId;
    const messages = await getData(key) || [];
    const msg = messages.find(m => m.timestamp == currentSelectedMsgTimestamp);

    if (!msg || !msg.content) return;

    // 不支持图片、拍一拍
    if (msg.type === 'sticker' || msg.type === 'pat') {
        const t = document.createElement('div');
        t.className = 'toast-message';
        t.textContent = '该消息类型不支持翻译';
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 1500);
        return;
    }

    // 语音消息只取文字部分
    let textToTranslate = msg.content;
    const voiceMatch = textToTranslate.match(/^\[VOICE:\d+:(.+)\]$/);
    if (voiceMatch) textToTranslate = voiceMatch[1];

    // 2. 找到气泡元素
    const bubbleEl = document.querySelector(`[data-timestamp="${currentSelectedMsgTimestamp}"]`);
    if (!bubbleEl) return;

    // 3. 如果面板已存在则重新翻译
    let panel = bubbleEl.querySelector('.translation-panel');
    if (panel) {
        panel.classList.add('show');
        const oldSpan = panel.querySelector('.translation-text');
        if (oldSpan) {
            oldSpan.textContent = '正在重新翻译...';
            panel.style.color = '#576B95';
            panel.style.fontStyle = 'italic';
        }
        panel._isRetranslate = true;
    }

    // 4. 首次翻译：加图标标记 + 创建面板
const msgContent = bubbleEl.querySelector('.msg-content') || bubbleEl.querySelector('.inner-voice-content');
if (!panel || !panel._isRetranslate) {
    if (msgContent && !msgContent.querySelector('.translated-mark')) {
        const mark = document.createElement('span');
        mark.className = 'translated-mark';
        mark.innerHTML = TRANSLATE_ICON_SVG;
        msgContent.appendChild(mark);
    }

    panel = document.createElement('div');
    panel.className = 'voice-text-panel translation-panel show';
    panel.style.cssText = 'color:#576B95; font-style:italic; cursor:pointer; user-select:none;';
    panel.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="#576B95" style="vertical-align:middle; margin-right:4px; flex-shrink:0;"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg><span class="translation-text">正在翻译...</span>`;

    panel.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('show');
        const mark = bubbleEl.querySelector('.translated-mark');
        if (mark) mark.style.opacity = panel.classList.contains('show') ? '0.5' : '1';
    });

    if (msgContent && !msgContent.dataset.translateBound) {
        msgContent.dataset.translateBound = '1';
        msgContent.addEventListener('click', (e) => {
            const p = bubbleEl.querySelector('.translation-panel');
            if (!p) return;
            e.stopPropagation();
            p.classList.toggle('show');
            const mark = bubbleEl.querySelector('.translated-mark');
            if (mark) mark.style.opacity = p.classList.contains('show') ? '0.5' : '1';
        });
    }

    const innerMain = bubbleEl.querySelector('.inner-voice-main');

if (innerMain) {
    // 心声：宽度撑满与心声气泡一致的75%容器，居中
    panel.style.width = '100%';
    panel.style.boxSizing = 'border-box';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `width:75%; display:flex; justify-content:center; margin-top:4px;`;
    wrapper.appendChild(panel);
    innerMain.appendChild(wrapper);
} else {
    // 普通气泡：左右对齐
    const alignDir = msg.role === 'user' ? 'flex-end' : 'flex-start';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `width:100%; display:flex; justify-content:${alignDir}; margin-top:4px; padding:0 50px;`;
    wrapper.appendChild(panel);
    bubbleEl.style.flexWrap = 'wrap';
    bubbleEl.appendChild(wrapper);
}
}

    // 5. 调用翻译接口
    const isChinese = /[\u4e00-\u9fa5]/.test(textToTranslate);
    const targetLang = isChinese ? 'en' : 'zh-CN';
    let translated = '';

    try {
        if (currentTranslateEngine === 'google') {
            // 谷歌翻译（需加速器）
            const encoded = encodeURIComponent(textToTranslate);
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encoded}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('谷歌翻译请求失败，请检查加速器是否开启');
            const data = await res.json();
            if (data && data[0]) {
                data[0].forEach(seg => { if (seg && seg[0]) translated += seg[0]; });
            }
        } else {
            // LibreTranslate（无需加速器）
            const libreTarget = isChinese ? 'en' : 'zh';
            const mirrors = [
                'https://translate.fedilab.app/translate',
                'https://libretranslate.de/translate',
                'https://translate.argosopentech.com/translate'
            ];
            let lastError = null;
            for (const baseUrl of mirrors) {
                try {
                    const res = await fetch(baseUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ q: textToTranslate, source: 'auto', target: libreTarget, format: 'text' })
                    });
                    if (!res.ok) continue;
                    const data = await res.json();
                    if (data && data.translatedText) { translated = data.translatedText; break; }
                } catch (e) { lastError = e; continue; }
            }
            if (!translated) throw new Error(lastError ? lastError.message : '所有节点均不可用');
        }

        if (!translated) throw new Error('未获取到翻译结果');

        // 6. 显示结果
        const textSpan = panel.querySelector('.translation-text');
        if (textSpan) {
            textSpan.textContent = translated;
            panel.style.color = '#333';
            panel.style.fontStyle = 'normal';
        }

        // 7. 保存到数据库
        const allMsgs = await getData(key) || [];
        const targetMsg = allMsgs.find(m => m.timestamp == currentSelectedMsgTimestamp);
        if (targetMsg) {
            targetMsg.translation = translated;
            await saveData(key, allMsgs);
        }

    } catch (e) {
        console.error('翻译失败:', e);
        const textSpan = panel.querySelector('.translation-text');
        if (textSpan) {
            textSpan.textContent = '翻译失败：' + e.message;
            panel.style.color = '#FA5151';
            panel.style.fontStyle = 'normal';
        }
    }
}

