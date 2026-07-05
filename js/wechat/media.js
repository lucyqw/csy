/* 模块: js/media.js */

// [FunctionDeclaration] Function: openVoiceInputModal
function openVoiceInputModal() {
    closeActionSheet(); // 关闭底部面板
    document.getElementById('voiceInputModal').style.display = 'flex';
    document.getElementById('voiceTextInput').value = '';
    document.getElementById('voiceTextInput').focus();
}

// [FunctionDeclaration] Function: sendVoiceMessage
async function sendVoiceMessage() {
    const text = document.getElementById('voiceTextInput').value.trim();
    if (!text) return;
    
    document.getElementById('voiceInputModal').style.display = 'none';
    
    // 计算假时长：每3个字算1秒，最少1秒，最多60秒
    let duration = Math.ceil(text.length / 3);
    if (duration < 1) duration = 1;
    if (duration > 60) duration = 60;
    
    // 构造消息内容：特殊前缀标识
    // 格式：[VOICE:时长:实际文本]
    const content = `[VOICE:${duration}:${text}]`;
    
    const msg = {
        role: 'user',
        type: 'text', // 依然用 text 类型，但在渲染时特殊处理
        content: content,
        timestamp: Date.now()
    };
    
    // 清空草稿箱
    wxDrafts = [];
    await saveData('chat_drafts_' + currentChatId, null);
    
    appendMessageToUI(msg);
    scrollToBottom();
    await saveMessage(currentChatId, msg);
    await updateChatList(currentChatId, '[语音]', Date.now());
    
    // 触发 AI 回复
    if (aiReplyMode === 'immediate') {
        setTimeout(() => getAIResponse(currentChatId), 500);
    }
}

// [FunctionDeclaration] Function: playVoice
function playVoice(bubble) {
    // 找到同级的文字面板 (它是 bubble 的下一个兄弟元素)
    const textPanel = bubble.nextElementSibling;

    // 1. 如果正在播放，就停止（复原）
    if (bubble.classList.contains('playing')) {
        bubble.classList.remove('playing');
        if(textPanel) textPanel.classList.remove('show'); // 隐藏文字
        return;
    }
    
    // 2. 停止其他所有正在播放的（互斥逻辑）
    document.querySelectorAll('.voice-bubble.playing').forEach(el => {
        el.classList.remove('playing');
        // 找到对应的文字面板并隐藏
        const panel = el.nextElementSibling;
        if(panel && panel.classList.contains('voice-text-panel')) {
            panel.classList.remove('show');
        }
    });
    
    // 3. 开始播放当前语音
    bubble.classList.add('playing');
    if(textPanel) textPanel.classList.add('show'); // 显示文字
    
    // 4. 倒计时结束（时长 * 1000ms）
    const duration = parseInt(bubble.dataset.duration) || 2;
    setTimeout(() => {
        // 只有当它还在播放时才自动停止（防止用户中途手动停止后，定时器又把它关了一次）
        if (bubble.classList.contains('playing')) {
            bubble.classList.remove('playing');
            if(textPanel) textPanel.classList.remove('show'); // 隐藏文字
        }
    }, duration * 1000);
}

