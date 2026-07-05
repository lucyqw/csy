/* 模块: js/message-actions.js */

// [FunctionDeclaration] Function: copyCurrentMessage
async function copyCurrentMessage() {
    if (!currentSelectedMsgTimestamp) return;
    hideContextMenu(); // 关闭菜单

    const key = 'chat_messages_' + currentChatId;
    const messages = await getData(key) || [];
    const msg = messages.find(m => m.timestamp == currentSelectedMsgTimestamp);
    
    if (msg && msg.content) {
        // 创建一个临时的 textarea 元素来辅助复制（兼容性更好）
        const tempInput = document.createElement('textarea');
        tempInput.value = msg.content;
        document.body.appendChild(tempInput);
        tempInput.select();
        
        try {
            // 执行复制命令
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            // 显示“已复制”提示
            const toast = document.createElement('div');
            toast.className = 'toast-message';
            toast.textContent = '已复制';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 1500);
            
        } catch (err) {
            document.body.removeChild(tempInput);
            console.error('复制失败', err);
            customAlert('复制失败，请手动长按文字复制');
        }
    }
}

// [FunctionDeclaration] Function: editCurrentMessage
async function editCurrentMessage() {
    if (!currentSelectedMsgTimestamp) return;
    hideContextMenu(); // 关闭菜单

    const key = 'chat_messages_' + currentChatId;
    const messages = await getData(key) || [];
    const msg = messages.find(m => m.timestamp == currentSelectedMsgTimestamp);
    
    if (msg) {
        const modal = document.getElementById('editMsgModal');
        const input = document.getElementById('customEditInput');
        
        // ★★★ 核心修改：如果是图片消息，编辑描述；否则编辑内容 ★★★
        if (msg.type === 'sticker' && msg.content.startsWith('data:image')) {
            // 情况A：图片消息 -> 编辑 ai_description
            input.value = msg.ai_description || '';
            input.placeholder = '请输入图片的文字描述（用于AI理解画面内容）';
        } else {
            // 情况B：普通消息 -> 编辑 content
            input.value = msg.content;
            input.placeholder = '编辑消息内容';
        }
        
        // 显示弹窗
        modal.style.display = 'flex';
        input.focus();
    }
}

