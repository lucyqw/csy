/* 模块: js/topic.js */

// [FunctionDeclaration] Function: startNewTopicFlow
async function startNewTopicFlow() {
    closeActionSheet(); // 关闭面板
    
    if (!currentChatId) return;
    
    // 检查是否有消息可存档
    const key = 'chat_messages_' + currentChatId;
    const messages = await getData(key) || [];
    
    if (messages.length === 0) {
        customAlert('当前没有聊天记录，无需存档。');
        return;
    }

    if (await customConfirm('【开启新话题】\n\n系统将：\n1. 自动保存当前所有聊天记录到“历史存档”\n2. 清空当前屏幕，开始全新对话\n\n确定要继续吗？')) {
        await archiveAndReset(currentChatId, messages);
    }
}

// [FunctionDeclaration] Function: archiveAndReset
async function archiveAndReset(chatId, messages) {
    // A. 生成存档数据
    const archiveKey = 'chat_archives_' + chatId;
    let archives = await getData(archiveKey) || [];
    
    // 获取最后一条消息作为摘要
    const lastMsg = messages[messages.length - 1];
    let summary = '[无内容]';
    if (lastMsg) {
        if (lastMsg.type === 'text') summary = lastMsg.content;
        else if (lastMsg.type === 'sticker') summary = '[表情/图片]';
        else if (lastMsg.type === 'voice') summary = '[语音]';
        else summary = lastMsg.content;
    }
    // 截取前20个字
    if (summary.length > 20) summary = summary.substring(0, 20) + '...';

    const newArchive = {
        id: Date.now(),
        dateStr: new Date().toLocaleString(),
        summary: summary,
        msgCount: messages.length,
        data: messages // 完整数据
    };
    
    // B. 保存存档 (新存档在最前)
    archives.unshift(newArchive);
    await saveData(archiveKey, archives);
    
        // C. 清空当前聊天
    await saveData('chat_messages_' + chatId, []);
    
    // D. 清空草稿
    wxDrafts = [];
    wxCurrentDraftIdx = 0;
    await saveData('chat_drafts_' + chatId, null);

    // E. 立即刷新界面
    document.getElementById('chatMessagesContainer').innerHTML = '';
    await updateChatList(chatId, '[新话题]', Date.now());

await customAlert('✅ 已归档并开启新话题！\n你可以随时在"聊天信息 -> 历史话题存档"中找回旧记录。');
}

// [ExpressionStatement] Execution: Expression
window.openArchivePage = async function() {
    if (!currentChatId) return;
    await renderArchiveList();
    showPage(document.getElementById('topicArchivePage'));
};

// [FunctionDeclaration] Function: renderArchiveList
async function renderArchiveList() {
    const container = document.getElementById('archiveListContainer');
    const key = 'chat_archives_' + currentChatId;
    const archives = await getData(key) || [];

    if (archives.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:50px; color:#999; font-size: 14px;">暂无存档记录</div>';
        return;
    }

    container.innerHTML = archives.map(arc => `
        <div class="discover-section" style="margin-bottom: 10px;">
            <div class="discover-item" onclick="viewArchive(${arc.id})">
                <div style="flex: 1; padding: 5px 0;">
                    <div style="font-size: 15px; color: #000; margin-bottom: 6px; font-weight: 500;">${arc.dateStr}</div>
                    <div style="font-size: 13px; color: #999;">${arc.msgCount}条消息 - ${arc.summary}</div>
                </div>
                <span class="contact-arrow">›</span>
            </div>
        </div>
    `).join('');
}

// [VariableDeclaration] Variables: currentViewingArchiveId
let currentViewingArchiveId = null;

// [ExpressionStatement] Execution: Expression
window.viewArchive = async function(archiveId) {
    const key = 'chat_archives_' + currentChatId;
    const archives = await getData(key) || [];
    const archive = archives.find(a => a.id === archiveId);
    
    if (!archive) return;
    currentViewingArchiveId = archiveId;

    // 渲染预览内容 (简化版渲染，只显示文本和图片占位)
    const previewBox = document.getElementById('archivePreviewContent');
    const contacts = await getData('customContacts') || [];
    const contact = contacts.find(c => c.id === currentChatId);
    const otherName = contact ? contact.nickname : '对方';

    previewBox.innerHTML = archive.data.map(msg => {
        // 跳过隐藏消息
        if(msg.isHidden) return '';
        
        const isSelf = msg.role === 'user';
        const name = isSelf ? '我' : otherName;
        const bg = isSelf ? '#95EC69' : '#FFFFFF';
        const align = isSelf ? 'flex-end' : 'flex-start';
        
        let content = msg.content;
        if (msg.type === 'sticker') content = '[图片/表情]';
        else if (msg.type === 'voice') content = '[语音消息]';
        else if (msg.type === 'pat') content = `[系统] ${msg.content}`;
        else if (msg.type === 'inner_voice') content = `[心声] ${msg.content}`;

        return `
            <div style="display: flex; flex-direction: column; align-items: ${align}; margin-bottom: 12px;">
                <span style="font-size: 10px; color: #999; margin-bottom: 2px;">${name}</span>
                <div style="background: ${bg}; padding: 8px 12px; border-radius: 6px; font-size: 14px; max-width: 85%; word-wrap: break-word; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    ${content}
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('archivePreviewModal').style.display = 'flex';
};

// [ExpressionStatement] Execution: addEventListener
document.getElementById('btnRestoreArchive').addEventListener('click', async () => {
    if (!currentViewingArchiveId || !currentChatId) return;

    if (await customConfirm('确定要恢复这个话题吗？\n\n⚠️ 警告：当前聊天界面的内容将被覆盖！\n(建议先将当前内容也归档为新话题后再恢复)')) {
        const key = 'chat_archives_' + currentChatId;
        const archives = await getData(key) || [];
        const archive = archives.find(a => a.id === currentViewingArchiveId);

        if (archive) {
            // 恢复数据
            await saveData('chat_messages_' + currentChatId, archive.data);
            
            // 刷新聊天界面
            document.getElementById('archivePreviewModal').style.display = 'none';
            // 如果是从聊天信息页进来的，需要先跳回聊天页
            showPage(document.getElementById('chatRoomPage')); 
            
            // 重新渲染消息
            await renderMessages(currentChatId); 
            scrollToBottom();
            
await customAlert('✅ 话题已成功恢复！');
        }
    }
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('btnDeleteArchive').addEventListener('click', async () => {
    if (!currentViewingArchiveId || !currentChatId) return;

    if (await customConfirm('确定要永久删除这条存档吗？此操作无法撤销。')) {
        const key = 'chat_archives_' + currentChatId;
        let archives = await getData(key) || [];
        archives = archives.filter(a => a.id !== currentViewingArchiveId);
        
        await saveData(key, archives);
        
        document.getElementById('archivePreviewModal').style.display = 'none';
        renderArchiveList(); // 刷新列表
    }
});

