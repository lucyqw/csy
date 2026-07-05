/* 模块: js/chat.js */

// [VariableDeclaration] Variables: startChatBtn
const startChatBtn = document.getElementById('startChatBtn');

// [VariableDeclaration] Variables: selectContactOverlay
const selectContactOverlay = document.getElementById('selectContactOverlay');

// [VariableDeclaration] Variables: selectContactList
const selectContactList = document.getElementById('selectContactList');

// [VariableDeclaration] Variables: closeSelectContact
const closeSelectContact = document.getElementById('closeSelectContact');

// [VariableDeclaration] Variables: chatRoomPage
const chatRoomPage = document.getElementById('chatRoomPage');

// [VariableDeclaration] Variables: chatBackBtn
const chatBackBtn = document.getElementById('chatBackBtn');

// [VariableDeclaration] Variables: chatTitle
const chatTitle = document.getElementById('chatTitle');

// [VariableDeclaration] Variables: chatMessagesContainer
const chatMessagesContainer = document.getElementById('chatMessagesContainer');

// [VariableDeclaration] Variables: chatInput
const chatInput = document.getElementById('chatInput');

// [VariableDeclaration] Variables: chatSendBtn
const chatSendBtn = document.getElementById('chatSendBtn');

// [VariableDeclaration] Variables: chatAiBtn
const chatAiBtn = document.getElementById('chatAiBtn');

// [VariableDeclaration] Variables: chatListContainer
const chatListContainer = document.getElementById('chatListContainer');

// [VariableDeclaration] Variables: currentChatId
let currentChatId = null;

// [VariableDeclaration] Variables: userAvatarUrl
let userAvatarUrl = '';

// [VariableDeclaration] Variables: activeChatSessionToken
let activeChatSessionToken = 0;

// [VariableDeclaration] Variables: wxDrafts
let wxDrafts = [];

// [VariableDeclaration] Variables: wxCurrentDraftIdx
let wxCurrentDraftIdx = 0;

// [VariableDeclaration] Variables: topRightMenu
const topRightMenu = document.getElementById('topRightMenu');

// [ExpressionStatement] Execution: addEventListener
startChatBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // 防止冒泡关闭菜单
    if (topRightMenu.style.display === 'none') {
        topRightMenu.style.display = 'block';
    } else {
        topRightMenu.style.display = 'none';
    }
});

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('click', () => {
    topRightMenu.style.display = 'none';
});

// [FunctionDeclaration] Function: hideSelectContactModal
function hideSelectContactModal() {
    selectContactOverlay.style.display = 'none';
}

// [ExpressionStatement] Execution: addEventListener
closeSelectContact.addEventListener('click', hideSelectContactModal);

// [ExpressionStatement] Execution: addEventListener
document.getElementById('cancelSelectContactBtn').addEventListener('click', hideSelectContactModal);

// [ExpressionStatement] Execution: addEventListener
selectContactOverlay.addEventListener('click', (e) => {
    if (e.target === selectContactOverlay) {
        hideSelectContactModal();
    }
});

// [FunctionDeclaration] Function: startChat
async function startChat(contactOrId) {
    selectContactOverlay.style.display = 'none';
    const id = contactOrId.id || contactOrId;
    currentChatId = id;
    
    // ★★★ 核心修改：默认加载最近 50 条 ★★★
    window.currentMsgLimit = 50; 
    
    // 强制从数据库恢复草稿箱
    await loadWxDrafts(id);
    
    const contact = await getContactDetails(id);
    chatTitle.textContent = contact.nickname;

    // 优先加载聊天专属头像
    const chatProfiles = await getData('my_chat_profiles') || {};
    const myProfile = chatProfiles[id];
    
    if (myProfile && myProfile.avatar) {
        userAvatarUrl = myProfile.avatar; 
    } else {
        userAvatarUrl = await getData('avatar') || ''; 
    }
    
    await renderMessages(contact.id);
    showPage(chatRoomPage);
    scrollToBottom();
    
    // 加载背景
    const contacts = await getData('customContacts') || [];
    const currentContact = contacts.find(c => c.id === id);
    if (currentContact && currentContact.chatBackground) {
        applyChatBackground(currentContact.chatBackground);
    } else {
        applyChatBackground(null);
    }
}

// [FunctionDeclaration] Function: formatWeChatTime
function formatWeChatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    
    // 获取具体时间组件
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const weekDay = date.getDay(); // 0-6, 0是周日
    
    // 补零函数
    const pad = n => n.toString().padStart(2, '0');
    const timeStr = `${pad(hour)}:${pad(minute)}`;
    
    // 计算时段 (凌晨/上午/下午/晚上)
    let period = "";
    if (hour >= 0 && hour < 6) period = "凌晨";
    else if (hour >= 6 && hour < 12) period = "上午";
    else if (hour >= 12 && hour < 13) period = "中午";
    else if (hour >= 13 && hour < 18) period = "下午";
    else period = "晚上";

    // 计算日期差 (用于判断昨天、一周内)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(year, date.getMonth(), day);
    const diffTime = today - targetDay;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // 1. 如果是今天
    if (diffDays === 0) {
        return timeStr; // 今天只显示时间，如 10:30
    }
    
    // 2. 如果是昨天
    if (diffDays === 1) {
        return `昨天 ${period} ${timeStr}`; // 如 昨天 上午 10:30
    }
    
    // 3. 如果是一周内 (且不是昨天)
    if (diffDays > 1 && diffDays < 7) {
        const weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
        return `${weeks[weekDay]} ${period} ${timeStr}`; // 如 星期二 下午 14:00
    }
    
    // 4. 如果是跨年了
    if (year !== now.getFullYear()) {
        return `${year}年${month}月${day}日 ${period} ${timeStr}`; // 如 2024年12月31日 晚上 22:42
    }
    
    // 5. 其他情况 (今年内，超过一周)
    return `${month}月${day}日 ${period} ${timeStr}`; // 如 3月15日 晚上 20:00
}

// [FunctionDeclaration] Function: renderMessages
async function renderMessages(chatId) {
    const allMessages = await getData('chat_messages_' + chatId) || [];
    
    // ★★★ 核心新增：判断是否为群聊 ★★★
    const contacts = await getData('customContacts') || [];
    const contact = contacts.find(c => c.id === chatId);
    const isGroup = contact ? !!contact.isGroup : false;
    
    // 小鱼新增：读取"显示群成员昵称"开关状态，并缓存到全局变量
    if (isGroup) {
        const savedState = await getData('showGroupNickname_' + chatId);
        window.currentShowNicknameState = savedState !== null ? savedState : true;
    } else {
        window.currentShowNicknameState = false; // 单聊不显示昵称
    }
    
    // ★★★ 核心新增：如果是群聊，建立 名字->头像 映射表 ★★★
    let memberAvatarMap = {};
    if (isGroup) {
        const memberIds = contact.memberIds || [];
        const members = contacts.filter(c => memberIds.includes(c.id));
        members.forEach(m => {
            memberAvatarMap[m.nickname] = m.avatar;
            if (m.realName) memberAvatarMap[m.realName] = m.avatar;
        });
    }
    
    // 1. 预处理为"渲染块 (Blocks)"
    let blocks = [];
    let currentOfflineBlock = null;

    allMessages.forEach(msg => {
        if (msg.isHidden || msg.type === 'system_separator') return;

        const source = msg.source || 'online';

        if (source === 'offline') {
            if (!currentOfflineBlock) {
                currentOfflineBlock = {
                    type: 'offline_group',
                    messages: [],
                    timestamp: msg.timestamp 
                };
                blocks.push(currentOfflineBlock);
            }
            currentOfflineBlock.messages.push(msg);
        } else {
            currentOfflineBlock = null;
            blocks.push({
                type: 'online_msg',
                message: msg,
                timestamp: msg.timestamp
            });
        }
    });

    // 2. 分页处理
    if (typeof window.currentMsgLimit === 'undefined') window.currentMsgLimit = 50;
    
    const totalBlocks = blocks.length;
    const blocksToRender = blocks.slice(-window.currentMsgLimit);
    const hasMore = totalBlocks > window.currentMsgLimit;
    
    const scrollContainer = chatMessagesContainer;
    const oldScrollHeight = scrollContainer.scrollHeight;
    const oldScrollTop = scrollContainer.scrollTop;
    const isNearBottom = oldScrollTop + scrollContainer.clientHeight >= oldScrollHeight - 100;
    
    chatMessagesContainer.innerHTML = '';
    
    // 3. 渲染"查看更多"
if (hasMore) {
    const loadMoreBtn = document.createElement('div');
    loadMoreBtn.className = 'load-more-btn'; // ★ 添加类名用于查找
    loadMoreBtn.style.textAlign = 'center';
    loadMoreBtn.style.padding = '10px';
    loadMoreBtn.style.fontSize = '12px';
    loadMoreBtn.style.color = '#576B95';
    loadMoreBtn.style.cursor = 'pointer';
    loadMoreBtn.innerHTML = `查看更多消息 (${totalBlocks - window.currentMsgLimit}条)`;
    
    loadMoreBtn.onclick = async () => {
        // ★★★ 核心修复：立即移除所有旧按钮 ★★★
        document.querySelectorAll('.load-more-btn').forEach(btn => btn.remove());
        
        const oldLimit = window.currentMsgLimit;
        window.currentMsgLimit += 50;
        
        const newBlocksStart = Math.max(0, totalBlocks - window.currentMsgLimit);
        const newBlocksEnd = totalBlocks - oldLimit;
        const newBlocks = blocks.slice(newBlocksStart, newBlocksEnd);
        
        if (newBlocks.length === 0) return;
        
        const preLoadHeight = scrollContainer.scrollHeight;
        const preScrollTop = scrollContainer.scrollTop;
        
        const fragment = document.createDocumentFragment();
        
        let lastRenderedTime = newBlocks.length > 0 ? newBlocks[0].timestamp : 0;
        const FIVE_MINUTES = 5 * 60 * 1000;
        
        newBlocks.forEach(block => {
            const currentBlockTime = block.timestamp;
            
            if (currentBlockTime - lastRenderedTime > FIVE_MINUTES) {
                const timeDiv = document.createElement('div');
                timeDiv.className = 'chat-timestamp';
                timeDiv.textContent = formatWeChatTime(currentBlockTime);
                fragment.appendChild(timeDiv);
            }
            lastRenderedTime = currentBlockTime;
            
            const tempContainer = document.createElement('div');
            chatMessagesContainer.appendChild(tempContainer);
            
            if (block.type === 'online_msg') {
                let avatarToUse = contact ? contact.avatar : '';
                if (isGroup && block.message.role === 'assistant' && block.message.senderName) {
                    avatarToUse = memberAvatarMap[block.message.senderName] || '';
                }
                appendMessageToUI(block.message, avatarToUse, isGroup);
            } else if (block.type === 'offline_group') {
                renderOfflineBlockUI(block.messages, contact ? contact.avatar : '', isGroup, memberAvatarMap);
            }
            
            while (tempContainer.nextSibling) {
                fragment.appendChild(tempContainer.nextSibling);
            }
            tempContainer.remove();
        });
        
        if (newBlocksStart > 0) {
            const newBtn = document.createElement('div');
            newBtn.className = 'load-more-btn';
            newBtn.style.cssText = loadMoreBtn.style.cssText;
            newBtn.innerHTML = `查看更多消息 (${newBlocksStart}条)`;
            newBtn.onclick = loadMoreBtn.onclick;
            fragment.insertBefore(newBtn, fragment.firstChild);
        }
        
        chatMessagesContainer.insertBefore(fragment, chatMessagesContainer.firstChild);
        
        const postLoadHeight = scrollContainer.scrollHeight;
        scrollContainer.scrollTop = preScrollTop + (postLoadHeight - preLoadHeight);
    };
    chatMessagesContainer.appendChild(loadMoreBtn);
}

    const otherAvatar = contact ? contact.avatar : '';
    
    if (blocksToRender.length === 0 && !hasMore) return;

    let lastRenderedTime = 0;
    const FIVE_MINUTES = 5 * 60 * 1000;

    // 4. 循环渲染 Block
    blocksToRender.forEach(block => {
        let currentBlockTime = block.timestamp;
        
        if (currentBlockTime - lastRenderedTime > FIVE_MINUTES) {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'chat-timestamp';
            timeDiv.textContent = formatWeChatTime(currentBlockTime);
            chatMessagesContainer.appendChild(timeDiv);
        }
        lastRenderedTime = currentBlockTime;

        if (block.type === 'online_msg') {
    // ★★★ 核心修改：传入 isGroup 参数 ★★★
    let avatarToUse = contact ? contact.avatar : '';
    if (isGroup && block.message.role === 'assistant' && block.message.senderName) {
        avatarToUse = memberAvatarMap[block.message.senderName] || '';
    }
    appendMessageToUI(block.message, avatarToUse, isGroup);
} else if (block.type === 'offline_group') {
    // ★★★ 核心修正：将 memberAvatarMap 传给子函数 ★★★
    renderOfflineBlockUI(block.messages, contact ? contact.avatar : '', isGroup, memberAvatarMap);
}
    });

    // 5. 草稿箱检测
    let lastVisibleMsg = null;

    for (let i = blocksToRender.length - 1; i >= 0; i--) {
        const block = blocksToRender[i];
        if (block.type === 'online_msg') {
            if (!block.message.isHidden && block.message.type !== 'system_separator') {
                lastVisibleMsg = block.message;
                break;
            }
        } else if (block.type === 'offline_group') {
            if (block.messages.length > 0) {
                lastVisibleMsg = block.messages[block.messages.length - 1];
                break;
            }
        }
    }

    if (lastVisibleMsg && lastVisibleMsg.role === 'assistant' && (lastVisibleMsg.source || 'online') !== 'offline') {
        renderDraftToolbar();
    }
    
    // 6. 恢复滚动
    setTimeout(() => {
        if (isNearBottom) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, 0);
}

// [FunctionDeclaration] Function: renderOfflineBlockUI
function renderOfflineBlockUI(messages, otherAvatar, isGroupChat = false, memberAvatarMap = {}) {
    if (messages.length === 0) return;

    const visibleMessages = messages.filter(m => !m.isHidden && m.type !== 'system_separator');
    
    if (visibleMessages.length === 0) {
        console.log('⚠️ 线下消息组已无可见内容，跳过渲染折叠框');
        return;
    }
    
    const toggleBtn = document.createElement('div');
    toggleBtn.className = 'offline-toggle-btn';
    
    const firstTime = new Date(visibleMessages[0].timestamp).toLocaleString('zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'});
    const lastTime = new Date(visibleMessages[visibleMessages.length - 1].timestamp).toLocaleString('zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'});
    
    toggleBtn.innerHTML = `<span>线下见面 ${firstTime} ~ ${lastTime} (${visibleMessages.length}条)</span>`;
    
    const offlineBox = document.createElement('div');
    offlineBox.className = 'offline-container';
    
    // ★★★ 核心修复：使用传入的 memberAvatarMap 同步查找头像 ★★★
    visibleMessages.forEach((msg) => {
        let avatarToUse = otherAvatar;
        
        if (isGroupChat && msg.role === 'assistant' && msg.senderName) {
            // 直接从映射表取值，不再使用异步 getData，确保渲染时头像立即可用
            avatarToUse = memberAvatarMap[msg.senderName] || otherAvatar;
        }
        
        appendMessageToUI(msg, avatarToUse, isGroupChat);
        const lastChild = chatMessagesContainer.lastChild;
        if (lastChild) {
            offlineBox.appendChild(lastChild);
        }
    });

    toggleBtn.onclick = function() {
        const isHidden = !offlineBox.classList.contains('show');
        if (isHidden) {
            offlineBox.classList.add('show');
            this.innerHTML = '<span>收起这段线下聊天</span>';
        } else {
            offlineBox.classList.remove('show');
            this.innerHTML = `<span>线下见面 ${firstTime} ~ ${lastTime} (${visibleMessages.length}条)</span>`;
        }
    };

    chatMessagesContainer.appendChild(toggleBtn);
    chatMessagesContainer.appendChild(offlineBox);
}

// [FunctionDeclaration] Function: renderDraftToolbar
function renderDraftToolbar() {
    const existingToolbar = document.querySelector('.wx-draft-toolbar');
    if (existingToolbar) existingToolbar.remove();

    const toolbar = document.createElement('div');
    toolbar.className = 'wx-draft-toolbar';
    toolbar.style.display = 'none'; 
    toolbar.style.alignItems = 'center';
    toolbar.style.gap = '10px';
    toolbar.style.padding = '5px 0 15px 55px';
    toolbar.style.marginTop = '-5px';
    toolbar.style.fontSize = '12px';
    toolbar.style.color = '#999';

    let navHtml = '';
    if (wxDrafts && wxDrafts.length > 1) {
        navHtml = `
            <div style="display:flex; align-items:center; gap:6px; background:rgba(0,0,0,0.05); padding:2px 8px; border-radius:10px;">
                <div onclick="switchWxDraft(-1)" style="cursor:pointer; padding:4px 8px; font-weight:bold; user-select:none;">❮</div>
                <div style="min-width:30px; text-align:center; font-variant-numeric:tabular-nums;">${wxCurrentDraftIdx + 1} / ${wxDrafts.length}</div>
                <div onclick="switchWxDraft(1)" style="cursor:pointer; padding:4px 8px; font-weight:bold; user-select:none;">❯</div>
            </div>
        `;
    }

    const refreshHtml = `
        <div onclick="regenerateLastWeChat()" title="重新生成" style="width:24px; height:24px; border-radius:50%; background:rgba(0,0,0,0.05); display:flex; align-items:center; justify-content:center; cursor:pointer;">
            <svg viewBox="0 0 24 24" style="width:14px; height:14px; fill:#666;">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
        </div>
    `;

    toolbar.innerHTML = navHtml + refreshHtml;
    chatMessagesContainer.appendChild(toolbar);

    // ★★★ 关键修改：获取上一条消息，无论是气泡、心声还是拍一拍 ★★★
// 小鱼修复：因为可能有隐藏消息（在DOM里不存在），所以 previousElementSibling 获取到的
// 就是视觉上的“最后一条可见消息”，这个逻辑其实是对的。
// 但为了保险，我们确保它绑定到了正确的元素上。

const lastElement = toolbar.previousElementSibling;

if (lastElement && (
    lastElement.classList.contains('message-bubble') || 
    lastElement.classList.contains('inner-voice-wrapper') || 
    lastElement.classList.contains('system-text-message') 
)) {
    // 先移除旧的监听器（防止重复绑定，虽然这里是新建元素，但是个好习惯）
    // 绑定点击事件
    lastElement.onclick = (e) => {
        if (typeof isMultiSelectMode !== 'undefined' && isMultiSelectMode) return;
        
        // 阻止冒泡，防止触发其他点击事件
        e.stopPropagation();

        // 切换显示/隐藏
        if (toolbar.style.display === 'none') {
            toolbar.style.display = 'flex';
            toolbar.style.animation = 'none';
            toolbar.offsetHeight; // 触发重绘
            toolbar.style.animation = 'fadeIn 0.3s ease-out forwards';
        } else {
            toolbar.style.display = 'none';
        }
    };
    
    // 确保拍一拍文字看起来可以点击
    if (lastElement.classList.contains('system-text-message')) {
        lastElement.style.cursor = 'pointer';
    }
}
}

// [FunctionDeclaration] Function: renderMessageGroup
function renderMessageGroup(messages, source, otherAvatar) {
    if (messages.length === 0) return;

    if (source === 'offline') {
        // === 线下消息组：创建折叠框 ===
        
        // ★★★ 核心修复：先收集"真实可见"的消息，再判断是否需要显示折叠框 ★★★
        const visibleMessages = messages.filter(m => !m.isHidden && m.type !== 'system_separator');
        
        // 如果过滤后没有可见消息，就不显示折叠框，直接退出
        if (visibleMessages.length === 0) {
            console.log('⚠️ 线下消息组已无可见内容，跳过渲染折叠框');
            return;
        }
        
        const toggleBtn = document.createElement('div');
        toggleBtn.className = 'offline-toggle-btn';
        
        // ★ 修正：使用过滤后的消息来计算时间（防止隐藏消息干扰）
        const firstTime = new Date(visibleMessages[0].timestamp).toLocaleString('zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'});
        const lastTime = new Date(visibleMessages[visibleMessages.length - 1].timestamp).toLocaleString('zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'});
        
        // ★ 修正：显示真实可见消息的数量
        toggleBtn.innerHTML = `<span>线下见面 ${firstTime} ~ ${lastTime} (${visibleMessages.length}条)</span>`;
        
        const offlineBox = document.createElement('div');
        offlineBox.className = 'offline-container';
        
        // ★ 修正：只渲染可见消息
        visibleMessages.forEach((msg) => {
            appendMessageToUI(msg, otherAvatar);
            const lastChild = chatMessagesContainer.lastChild;
            if (lastChild) {
                offlineBox.appendChild(lastChild);
            }
        });

        toggleBtn.onclick = function() {
            const isHidden = !offlineBox.classList.contains('show');
            if (isHidden) {
                offlineBox.classList.add('show');
                this.innerHTML = '<span>收起这段线下聊天</span>';
            } else {
                offlineBox.classList.remove('show');
                // ★ 修正：收起时也显示真实数量
                this.innerHTML = `<span>线下见面 ${firstTime} ~ ${lastTime} (${visibleMessages.length}条)</span>`;
            }
        };

        chatMessagesContainer.appendChild(toggleBtn);
        chatMessagesContainer.appendChild(offlineBox);

    } else {
        // === 线上消息组：直接显示（不变） ===
        messages.forEach((msg) => {
            appendMessageToUI(msg, otherAvatar);
        });
    }
}

// [VariableDeclaration] Variables: longPressTimer
let longPressTimer;

// [VariableDeclaration] Variables: currentSelectedMsgTimestamp
let currentSelectedMsgTimestamp = null;

// [VariableDeclaration] Variables: currentQuoteMsg
let currentQuoteMsg = null;

// [VariableDeclaration] Variables: isMultiSelectMode
let isMultiSelectMode = false;

// [VariableDeclaration] Variables: selectedTimestamps
let selectedTimestamps = new Set();

// [FunctionDeclaration] Function: quoteCurrentMessage
async function quoteCurrentMessage() {
    if (!currentSelectedMsgTimestamp) return;
    hideContextMenu(); // 关闭菜单

    const key = 'chat_messages_' + currentChatId;
    const messages = await getData(key) || [];
    const msg = messages.find(m => m.timestamp == currentSelectedMsgTimestamp);
    
    if (msg) {
        // 解析发送者名字
        let senderName = '对方';
        if (msg.role === 'user') {
            senderName = await getData('userName') || '我';
        } else if (msg.senderName) {
            senderName = msg.senderName;
        } else {
            const contacts = await getData('customContacts') || [];
            const contact = contacts.find(c => c.id === currentChatId);
            if (contact) senderName = contact.nickname;
        }

        // 解析内容摘要
        let contentText = msg.content;
        if (msg.type === 'sticker') {
            if (msg.content.startsWith('data:image')) contentText = '[图片]';
            else contentText = '[表情]';
        } else if (msg.type === 'voice') contentText = '[语音]';
        else if (msg.type === 'pat') contentText = msg.content;
        else if (msg.type === 'transfer') contentText = '[转账]';
        else if (msg.type === 'inner_voice') contentText = '[心声] ' + msg.content;
        
        // 记录引用数据
        currentQuoteMsg = {
            senderName: senderName,
            content: contentText
        };
        
        // 显示预览UI
        const previewText = `${senderName}: ${contentText}`;
        document.getElementById('quotePreviewText').textContent = previewText;
        document.getElementById('quotePreviewContainer').style.display = 'block';
        
        // 自动聚焦输入框
        document.getElementById('chatInput').focus();
    }
}

// [ExpressionStatement] Execution: Expression
window.cancelQuote = function() {
    currentQuoteMsg = null;
    const previewContainer = document.getElementById('quotePreviewContainer');
    if (previewContainer) previewContainer.style.display = 'none';
};

// [FunctionDeclaration] Function: appendMessageToUI
function appendMessageToUI(msg, otherAvatar, isGroupChat = false) {
    // 跳过隐藏消息
    if (msg.isHidden || msg.type === 'system_separator') return;
    
    // 系统消息/拍一拍
    if (msg.type === 'pat' || msg.type === 'system_text') {
        const div = document.createElement('div');
        div.className = 'system-text-message';
        div.textContent = msg.content;
        div.dataset.timestamp = msg.timestamp;
        
        // 绑定事件
        div.addEventListener('touchstart', (e) => {
            if (isMultiSelectMode) return;
            longPressTimer = setTimeout(() => showContextMenu(e, div, msg.timestamp), 500);
        });
        div.addEventListener('touchend', () => clearTimeout(longPressTimer));
        div.addEventListener('touchmove', () => clearTimeout(longPressTimer));
        div.addEventListener('contextmenu', (e) => { e.preventDefault(); if (!isMultiSelectMode) showContextMenu(e, div, msg.timestamp); });
        div.addEventListener('click', (e) => {
            if (isMultiSelectMode) {
                e.stopPropagation();
                toggleMessageSelection(div, msg.timestamp);
            }
        });

        chatMessagesContainer.appendChild(div);
        return; 
    }
    
    // 特殊处理：心声类型
    if (msg.type === 'inner_voice') {
        const wrapper = document.createElement('div');
        wrapper.className = 'inner-voice-wrapper message-bubble';
        wrapper.dataset.timestamp = msg.timestamp;
        
        let toggleText = '查看心声';
        if (isGroupChat && msg.senderName) {
            toggleText = `查看${msg.senderName}的心声`;
        }
        
        wrapper.innerHTML = `
            <div class="inner-voice-main">
                <div class="inner-voice-toggle" onclick="
                    if (!document.querySelector('.chat-messages').classList.contains('multi-select-mode')) {
                        const content = this.nextElementSibling;
                        const isShowing = content.classList.toggle('show');
                        this.textContent = isShowing ? '收起心声' : this.dataset.defaultText;
                    }
                " data-default-text="${toggleText}">${toggleText}</div>
                <div class="inner-voice-content">${msg.content}</div>
            </div>
            <div class="msg-checkbox"><div class="msg-checkbox-icon"></div></div>
        `;
        
        if (!isGroupChat && currentChatId) {
            getData('customContacts').then(contacts => {
                const contact = (contacts || []).find(c => c.id === currentChatId);
                if (contact) {
                    const toggleBtn = wrapper.querySelector('.inner-voice-toggle');
                    const customText = `查看${contact.nickname}的心声`;
                    if (toggleBtn) {
                        toggleBtn.textContent = customText;
                        toggleBtn.dataset.defaultText = customText;
                    }
                }
            });
        }
        
        const mainContent = wrapper.querySelector('.inner-voice-main');
        mainContent.addEventListener('touchstart', (e) => {
            if (isMultiSelectMode) return;
            longPressTimer = setTimeout(() => { showContextMenu(e, wrapper, msg.timestamp); }, 500);
        });
        mainContent.addEventListener('touchend', () => clearTimeout(longPressTimer));
        mainContent.addEventListener('touchmove', () => clearTimeout(longPressTimer));
        mainContent.addEventListener('contextmenu', (e) => { e.preventDefault(); if (!isMultiSelectMode) showContextMenu(e, wrapper, msg.timestamp); });
        wrapper.addEventListener('click', (e) => { if (isMultiSelectMode) { e.stopPropagation(); toggleMessageSelection(wrapper, msg.timestamp); } });
        
    chatMessagesContainer.appendChild(wrapper);

    // ★ 新增：心声消息也恢复已保存的翻译结果
    if (msg.translation) {
        const innerVoiceContentEl = wrapper.querySelector('.inner-voice-content');
        const innerMain = wrapper.querySelector('.inner-voice-main');

        // 在心声文字末尾加翻译图标标记
        if (innerVoiceContentEl && !innerVoiceContentEl.querySelector('.translated-mark')) {
            const mark = document.createElement('span');
            mark.className = 'translated-mark';
            mark.innerHTML = TRANSLATE_ICON_SVG;
            innerVoiceContentEl.appendChild(mark);
        }

        // 点击心声内容区域折叠/展开翻译
        if (innerVoiceContentEl && !innerVoiceContentEl.dataset.translateBound) {
            innerVoiceContentEl.dataset.translateBound = '1';
            innerVoiceContentEl.addEventListener('click', (e) => {
                const p = wrapper.querySelector('.translation-panel');
                if (!p) return;
                e.stopPropagation();
                p.classList.toggle('show');
                const mk = wrapper.querySelector('.translated-mark');
                if (mk) mk.style.opacity = p.classList.contains('show') ? '0.5' : '1';
            });
        }

        // 创建翻译结果面板（默认折叠，不加 show）
const restoredPanel = document.createElement('div');
restoredPanel.className = 'voice-text-panel translation-panel';
restoredPanel.style.cssText = 'color:#333; cursor:pointer; user-select:none;';
restoredPanel.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="#576B95" style="vertical-align:middle; margin-right:4px; flex-shrink:0;"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg><span class="translation-text">${msg.translation}</span>`;

// 末尾图标设为"未展开"状态
if (innerVoiceContentEl) {
    const mk = innerVoiceContentEl.querySelector('.translated-mark');
    if (mk) mk.style.opacity = '1';
}

// 点击面板本身折叠/展开
restoredPanel.addEventListener('click', (e) => {
    e.stopPropagation();
    restoredPanel.classList.toggle('show');
    const mk = wrapper.querySelector('.translated-mark');
    if (mk) mk.style.opacity = restoredPanel.classList.contains('show') ? '0.5' : '1';
});

        // 插入到 inner-voice-main 里，宽度与心声气泡一致
restoredPanel.style.width = '100%';
restoredPanel.style.boxSizing = 'border-box';

const wrapperDiv = document.createElement('div');
wrapperDiv.style.cssText = `width:75%; display:flex; justify-content:center; margin-top:4px;`;
wrapperDiv.appendChild(restoredPanel);

if (innerMain) {
    innerMain.appendChild(wrapperDiv);
} else {
    wrapper.appendChild(wrapperDiv);
}
    }

    return; 
}

    // --- 普通气泡逻辑 ---
    const isSelf = msg.role === 'user';
    const bubble = document.createElement('div');
    bubble.dataset.timestamp = msg.timestamp;

    if (msg.senderName) {
        bubble.dataset.senderName = msg.senderName;
    }

    const groupClass = isGroupChat ? 'is-group' : '';
    bubble.className = `message-bubble ${isSelf ? 'self' : 'other'} ${groupClass}`;

    let avatar = isSelf ? userAvatarUrl : otherAvatar;
    if (!avatar) avatar = 'https://iili.io/fkc3RwJ.jpg';

    const avatarStyle = `background-image: url(${avatar})`;
    const avatarText = '';

    let nameHtml = '';
    if (isGroupChat && !isSelf && msg.senderName) {
        const showNickname = window.currentShowNicknameState !== undefined ? window.currentShowNicknameState : true;
        if (showNickname) {
            nameHtml = `<div class="chat-sender-name">${msg.senderName}</div>`;
        }
    }
    
    let contentHtml = '';
    let contentStyle = ''; 
    let additionalBubbleClass = ''; 
    
    // 1. 图片处理
    if (msg.type === 'sticker') {
        if (msg.content.startsWith('data:image')) {
            const descText = msg.ai_description || 'AI正在分析画面...';
            contentHtml = `
                <div class="img-flip-container">
                    <div class="img-flipper">
                        <div class="img-front clickable-img-front">
                            <img src="${msg.content}" style="max-width: 140px; max-height: 140px; border-radius: 4px; display: block;">
                        </div>
                        <div class="img-back clickable-img-back">${descText}</div>
                    </div>
                </div>
            `;
            contentStyle = 'background: transparent; padding: 0; overflow: visible;';
        } else {
            contentHtml = `<img src="${msg.content}" style="max-width: 120px; max-height: 120px; border-radius: 4px; display: block;">`;
            contentStyle = 'background: transparent; padding: 0;';
        }
    } 
// 2. 转账处理 (★ 核心修改点：支持转账说明显示 ★)
else if (msg.type === 'transfer') {
    const amount = parseFloat(msg.amount || 0).toFixed(2);
    const status = msg.transferStatus || 'pending'; // pending, accepted, returned
    
    let iconSvg = '';
    
// ★ 核心修改：如果有转账说明，优先显示说明，否则显示"请收款"
let descText = msg.transferNote ? msg.transferNote : '请收款';

// ★ 新增：如果是群聊且是我发出的转账，前缀加上“转账给XXX”
if (isSelf && isGroupChat && msg.targetName && !msg.isReceipt) {
    descText = `转账给${msg.targetName}` + (msg.transferNote ? `-${msg.transferNote}` : '');
}

let processedClass = ''; // 用于标记是否变色

    // 图标 1: 待收款 (双向箭头)
    const iconPending = `
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <circle cx="21" cy="21" r="19" stroke="white" stroke-width="2.5"/>
            <path d="M27 18 H15 l4.5 -4.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 24 H27 l-4.5 4.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

    // 图标 2: 已接收 (对勾)
    const iconAccepted = `
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <circle cx="21" cy="21" r="19" stroke="white" stroke-width="2.5"/>
            <polyline points="12 21 18 27 30 15" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

    // 图标 3: 已退还 (侧放U型箭头)
    const iconReturned = `
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <circle cx="21" cy="21" r="19" stroke="white" stroke-width="2.5"/>
            <path d="M24 28 A 5 5 0 0 0 24 18 L 13 18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 14 L 13 18 L 17 22" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

    // 根据状态设置
    if (msg.isReceipt) {
        // 如果是收款回执气泡
        if (status === 'returned') {
            iconSvg = iconReturned;
            descText = '已退还';
        } else {
            iconSvg = iconAccepted;
            descText = '已收款';
        }
        processedClass = 'transfer-processed';
    } else if (status === 'accepted') {
        iconSvg = iconAccepted;
        descText = '已被接收'; // 状态改变后，覆盖说明文字
        processedClass = 'transfer-processed'; 
    } else if (status === 'returned') {
        iconSvg = iconReturned;
        descText ='已被退还'; // 状态改变后，覆盖说明文字
        processedClass = 'transfer-processed'; 
    } else {
        // 待收款状态：使用上面定义的 descText (即转账说明或请收款)
        iconSvg = iconPending;
    }

    contentHtml = `
        <div class="transfer-bubble">
            <div class="transfer-content-top">
                <div class="transfer-icon-circle">
                    ${iconSvg}
                </div>
                <div class="transfer-text-col">
                    <span class="transfer-amt">¥${amount}</span>
                    <span class="transfer-desc">${descText}</span>
                </div>
            </div>
            <div class="transfer-footer">微信转账</div>
        </div>
    `;
    contentStyle = 'background: transparent !important; padding: 0 !important; border: none !important; box-shadow: none !important;';
    additionalBubbleClass = `transfer-mode ${processedClass}`;
}
    // 3. 语音与文本处理
    else {
        const voiceMatch = (typeof msg.content === 'string') ? msg.content.match(/^\[VOICE:(\d+):(.+)\]$/) : null;

        if (voiceMatch) {
            const duration = parseInt(voiceMatch[1]);
            const text = voiceMatch[2];
            const width = Math.min(80 + duration * 6, 240);
            
            const waveIcon = isSelf ? 
                `<svg class="voice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 12h.01" stroke-width="4" /><path d="M14 7.5c-1.5 1-2 2.5-2 4.5s.5 3.5 2 4.5" /><path d="M11 4.5c-3 2-4 4.5-4 7.5s1 5.5 4 7.5" /></svg>` :
                `<svg class="voice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h.01" stroke-width="4" /><path d="M10 7.5c1.5 1 2 2.5 2 4.5s-.5 3.5-2 4.5" /><path d="M13 4.5c3 2 4 4.5 4 7.5s-1 5.5-4 7.5" /></svg>`;

            contentHtml = `
                <div class="voice-wrapper">
                    <div class="voice-bubble" style="width: ${width}px" data-duration="${duration}" onclick="playVoice(this); event.stopPropagation();">
                        <span class="voice-duration">${duration}"</span>
                        ${waveIcon}
                    </div>
                    <div class="voice-text-panel">${text}</div>
                </div>
            `;
            contentStyle = 'background: transparent; padding: 0; box-shadow: none; border: none;'; 
            bubble.dataset.voiceText = text; 
            additionalBubbleClass = 'voice-mode';
        } else {
            contentHtml = msg.content || '';
        }
    }

    // 组合最终的类名
const finalClass = additionalBubbleClass;

const alignSelf = isSelf ? 'flex-end' : 'flex-start';

// ★★★ 小鱼新增：构建独立的引用气泡 (显示在回复消息下方) ★★★
let quoteHtml = '';
if (msg.quote) {
    quoteHtml = `
        <div class="quote-bubble" style="background: rgba(200, 200, 200, 0.5); padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #555; margin-top: 4px; max-width: 100%; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; word-break: break-all; align-self: ${alignSelf};">
            ${msg.quote.senderName}: ${msg.quote.content}
        </div>
    `;
}

bubble.innerHTML = `
    <div class="msg-avatar" style="${avatarStyle}">${avatarText}</div>
    
    <div style="display: flex; flex-direction: column; align-items: ${alignSelf}; max-width: 70%;">
        ${nameHtml}
        <div class="msg-content ${finalClass}" style="${contentStyle}; max-width: 100%;">${contentHtml}</div>
        ${quoteHtml}
    </div>
    
    <div class="msg-checkbox"><div class="msg-checkbox-icon"></div></div>
`;
    
    // 绑定事件
    const contentDiv = bubble.querySelector('.msg-content');
    contentDiv.addEventListener('touchstart', (e) => { if (isMultiSelectMode) return; longPressTimer = setTimeout(() => showContextMenu(e, bubble, msg.timestamp), 500); });
    contentDiv.addEventListener('touchend', () => clearTimeout(longPressTimer));
    contentDiv.addEventListener('touchmove', () => clearTimeout(longPressTimer));
    contentDiv.addEventListener('contextmenu', (e) => { e.preventDefault(); if (!isMultiSelectMode) showContextMenu(e, bubble, msg.timestamp); });

    const rollbackHtml = `
        <div class="msg-rollback-container">
            <div class="msg-rollback-btn" onclick="rollbackToMessage(${msg.timestamp}, event)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 6L5 12L11 18V6Z"/>
                    <path d="M18 6L12 12L18 18V6Z"/>
                </svg>
            </div>
        </div>
    `;
    bubble.insertAdjacentHTML('beforeend', rollbackHtml);

    bubble.addEventListener('click', (e) => {
    if (isMultiSelectMode) {
        e.stopPropagation();
        toggleMessageSelection(bubble, msg.timestamp);
        return;
    }
    
// ★★★ 新增：如果是AI发来的转账，点击打开详情页 (无论是否已收款) ★★★
if (msg.type === 'transfer' && !isSelf && !msg.isReceipt) {
    // 增加判断：只有点击的区域属于气泡内容（卡片本身）时才触发，点击头像或空白处不触发
    if (e.target.closest('.msg-content')) {
        e.stopPropagation(); // 阻止显示回溯按钮
        
        // ★★★ 核心修复：点击时实时去数据库捞取最新状态，防止缓存旧数据 ★★★
        (async () => {
            const key = 'chat_messages_' + currentChatId;
            const allMsgs = await getData(key) || [];
            // 通过时间戳找到最新的那个消息对象
            const freshMsg = allMsgs.find(m => m.timestamp === msg.timestamp);
            
            // 如果找到了就用新的(状态已更新)，没找到就用旧的兜底
            openReceiveMoneyPage(freshMsg || msg);
        })();
        
        return;
    }
}

    if (!e.target.closest('.msg-avatar') && !e.target.closest('.img-flip-container')) {
        const btnContainer = bubble.querySelector('.msg-rollback-container');
        if (btnContainer) {
            const isHidden = getComputedStyle(btnContainer).display === 'none';
            document.querySelectorAll('.msg-rollback-container').forEach(el => el.style.display = 'none');
            if (isHidden) {
                btnContainer.style.display = 'flex';
            }
        }
    }
});

    chatMessagesContainer.appendChild(bubble);

// ★ 新增：如果该消息有已保存的翻译结果，自动恢复显示
if (msg.translation) {
    // 兼容普通气泡和心声气泡的文字容器
    const msgContentEl = bubble.querySelector('.msg-content') || bubble.querySelector('.inner-voice-content');
    if (msgContentEl && !msgContentEl.querySelector('.translated-mark')) {
        const mark = document.createElement('span');
        mark.className = 'translated-mark';
        mark.innerHTML = TRANSLATE_ICON_SVG;
        msgContentEl.appendChild(mark);

        // 点击原气泡可折叠/展开翻译
        if (!msgContentEl.dataset.translateBound) {
            msgContentEl.dataset.translateBound = '1';
            msgContentEl.addEventListener('click', (e) => {
                const p = bubble.querySelector('.translation-panel');
                if (!p) return;
                e.stopPropagation();
                p.classList.toggle('show');
                const mk = bubble.querySelector('.translated-mark');
                if (mk) mk.style.opacity = p.classList.contains('show') ? '0.5' : '1';
            });
        }
    }

    // 创建翻译结果面板（默认折叠，不加 show）
const restoredPanel = document.createElement('div');
restoredPanel.className = 'voice-text-panel translation-panel';
restoredPanel.style.cssText = 'color:#333; cursor:pointer; user-select:none;';
restoredPanel.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="#576B95" style="vertical-align:middle; margin-right:4px; flex-shrink:0;"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg><span class="translation-text">${msg.translation}</span>`;

// 末尾图标也同步设为"未展开"状态（不透明度高一点提示可点击）
if (msgContentEl) {
    const mk = msgContentEl.querySelector('.translated-mark');
    if (mk) mk.style.opacity = '1';
}

restoredPanel.addEventListener('click', (e) => {
    e.stopPropagation();
    restoredPanel.classList.toggle('show');
    const mk = bubble.querySelector('.translated-mark');
    if (mk) mk.style.opacity = restoredPanel.classList.contains('show') ? '0.5' : '1';
});

    // 插入到气泡末尾 (心声居中对齐)
    let alignDir = msg.role === 'user' ? 'flex-end' : 'flex-start';
    if (msg.type === 'inner_voice') alignDir = 'center';

    const wrapperDiv = document.createElement('div');
    wrapperDiv.style.cssText = `width:100%; display:flex; justify-content:${alignDir}; margin-top:4px; padding:0 50px;`;
    wrapperDiv.appendChild(restoredPanel);
    
    const innerMain = bubble.querySelector('.inner-voice-main');
    if (innerMain) {
        innerMain.appendChild(wrapperDiv); // 心声插入到主体内
    } else {
        bubble.style.flexWrap = 'wrap';
        bubble.appendChild(wrapperDiv); // 普通气泡插入
    }
}
    
    if (msg.type === 'sticker' && msg.content.startsWith('data:image')) {
        const flipContainer = bubble.querySelector('.img-flip-container');
        const frontEl = bubble.querySelector('.clickable-img-front');
        const backEl = bubble.querySelector('.clickable-img-back');

        if (flipContainer) {
            let startX = 0;
            flipContainer.addEventListener('touchstart', (e) => { if (isMultiSelectMode) return; startX = e.changedTouches[0].screenX; }, { passive: true });
            flipContainer.addEventListener('touchend', (e) => {
                if (isMultiSelectMode) return;
                const diff = startX - e.changedTouches[0].screenX;
                if (diff > 30) flipContainer.classList.add('flipped');
                else if (diff < -30) flipContainer.classList.remove('flipped');
            }, { passive: true });
            if (frontEl) frontEl.onclick = (e) => { if (!isMultiSelectMode) { e.stopPropagation(); openFullScreenViewer(msg, false); } };
            if (backEl) backEl.onclick = (e) => { if (!isMultiSelectMode) { e.stopPropagation(); openFullScreenViewer(msg, true); } };
        }
    }
}

// [ExpressionStatement] Execution: Expression
window.rollbackToMessage = async function(targetTimestamp, event) {
    event.stopPropagation(); // 阻止冒泡，防止触发气泡点击
    
    // ★★★ 修改：提示文案更准确 ★★★
    if (!await customConfirm('确定要回溯到这条消息吗？\n\n⚠️ 注意：\n1. 该消息会被保留\n2. 该消息之后的所有消息将被删除\n3. 此操作无法撤销')) {
        return;
    }

    const key = 'chat_messages_' + currentChatId;
    let messages = await getData(key) || [];
    
    // ★★★ 核心修改：改为 <= （保留目标消息本身）★★★
    const newMessages = messages.filter(m => m.timestamp <= targetTimestamp);
    
    // 保存数据库
    await saveData(key, newMessages);
    
    // 清空草稿箱（防止逻辑冲突）
    wxDrafts = [];
    await saveData('chat_drafts_' + currentChatId, null);
    
    // 刷新界面
    document.getElementById('chatMessagesContainer').innerHTML = ''; // 清空DOM
    await renderMessages(currentChatId); // 重新渲染
    scrollToBottom();
    
    // 更新首页预览
    const lastMsg = newMessages[newMessages.length - 1];
    if (lastMsg) {
        let preview = lastMsg.content;
        if (lastMsg.type === 'sticker') preview = '[表情]';
        else if (lastMsg.type === 'pat') preview = '[拍一拍]';
        await updateChatList(currentChatId, preview, lastMsg.timestamp);
    } else {
        await updateChatList(currentChatId, '', Date.now());
    }
};

// [VariableDeclaration] Variables: isProfileFromContactList
let isProfileFromContactList = false;

// [ExpressionStatement] Execution: Expression
window.openContactProfile = async function(id) {
    isProfileFromContactList = true; // 标记来源：通讯录
    currentChatId = id; // 设置当前操作ID
    await loadAndShowProfile(id);
};

// [FunctionDeclaration] Function: loadAndShowProfile
async function loadAndShowProfile(id) {
    window.currentProfileId = id; // ★★★ 小鱼新增：把当前查看的角色ID存到全局变量里 ★★★
    const contact = await getContactDetails(id);
    if (!contact) return;

    const cpAvatar = document.getElementById('cpAvatar');
    const cpNickname = document.getElementById('cpNickname');
    const cpWechatId = document.getElementById('cpWechatId');

    if (cpAvatar) {
        // ★★★ 修改：默认头像逻辑 ★★★
        const displayAvatar = contact.avatar || 'https://iili.io/fkc3RwJ.jpg';
        cpAvatar.style.backgroundImage = `url(${displayAvatar})`;
        cpAvatar.innerHTML = '';
        
        // ★★★ 小鱼修改：显示真名作为主标题 ★★★
        cpNickname.textContent = contact.realName || contact.nickname;

        // ★★★ 小鱼修改：如果没有微信号，临时生成一个 ★★★
        let displayWxId = contact.wechatId;
        if (!displayWxId) {
          const nameForWxId = contact.realName || contact.nickname || '';
          if (nameForWxId.trim() && window.pinyinPro) {
            try {
              const py = window.pinyinPro.pinyin(nameForWxId, { toneType: 'none', type: 'array' }).join('');
              displayWxId = 'char_' + py.toLowerCase();
            } catch (e) {
              displayWxId = '未设置';
            }
          } else {
            displayWxId = '未设置';
          }
        }
        cpWechatId.textContent = '微信号：' + displayWxId;
        
        showPage(document.getElementById('contactProfilePage'));
    }
}

// [VariableDeclaration] Variables: avatarClickTimer
let avatarClickTimer = null;

// [VariableDeclaration] Variables: avatarLongPressTimer
let avatarLongPressTimer = null;

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('touchstart', (e) => {
    const avatar = e.target.closest('.msg-avatar');
    if (!avatar) return;
    
    const bubble = avatar.closest('.message-bubble');
    if (!bubble || bubble.classList.contains('self') || isMultiSelectMode) return;
    
    const senderName = bubble.dataset.senderName;
    if (!senderName) return;
    
    avatarLongPressTimer = setTimeout(() => {
        const input = document.getElementById('chatInput');
        input.value += `@${senderName} `;
        input.focus();
        if (navigator.vibrate) navigator.vibrate(50);
    }, 600);
}, { passive: true });

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('touchend', () => {
    clearTimeout(avatarLongPressTimer);
}, { passive: true });

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('touchmove', () => {
    clearTimeout(avatarLongPressTimer);
}, { passive: true });

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('click', async (e) => {
    const avatar = e.target.closest('.msg-avatar');
    if (!avatar) return;
    
    const bubble = avatar.closest('.message-bubble');
    if (!bubble || bubble.classList.contains('self') || isMultiSelectMode) return; 
    
if (avatarClickTimer) {
    clearTimeout(avatarClickTimer);
    avatarClickTimer = null;
    
    const senderName = bubble.dataset.senderName;
    triggerPatAction(senderName);
} else {
        avatarClickTimer = setTimeout(async () => {
            avatarClickTimer = null;
            isProfileFromContactList = false; 
            
            let targetId = currentChatId;
            const senderName = bubble.dataset.senderName;
            if (senderName) {
                const contacts = await getData('customContacts') || [];
                const member = contacts.find(c => c.nickname === senderName || c.realName === senderName);
                if (member) targetId = member.id;
            }
            
            await loadAndShowProfile(targetId);
        }, 300);
    }
});

// [FunctionDeclaration] Function: triggerPatAction
async function triggerPatAction(targetNickname = null) {
    if (!currentChatId) return;

    let targetName = '"对方"';
    
    if (targetNickname) {
        targetName = `"${targetNickname}"`;
    } else {
        const contacts = await getData('customContacts') || [];
        const contact = contacts.find(c => c.id === currentChatId);
        targetName = contact ? `"${contact.nickname}"` : '"对方"';
    }
    
    const myPatSuffix = (await getData('pat')) || ''; 
    const patText = `我拍了拍${targetName}${myPatSuffix}`;

    const msg = {
        role: 'user',
        type: 'pat',
        content: patText,
        timestamp: Date.now()
    };

    appendMessageToUI(msg);
    scrollToBottom();
    await saveMessage(currentChatId, msg);
    await updateChatList(currentChatId, '[拍一拍]', Date.now());

    // ★★★ 关键：这里控制屏幕震动 (50毫秒) ★★★
    // 注意：苹果手机(iOS)因系统限制不支持网页震动，安卓手机支持
    if (navigator.vibrate) navigator.vibrate(50);
}

// [VariableDeclaration] Variables: cpBackBtn
const cpBackBtn = document.getElementById('cpBackBtn');

// [IfStatement] AnonymousBlock
if(cpBackBtn) {
    cpBackBtn.addEventListener('click', () => {
        if (isProfileFromContactList) {
            showPage(mainApp); // 如果来自通讯录，返回主界面
        } else {
            showPage(document.getElementById('chatRoomPage')); // 如果来自聊天，返回聊天
        }
    });
}

// [VariableDeclaration] Variables: cpSendBtn
const cpSendBtn = document.getElementById('cpSendMessageBtn');

// [IfStatement] AnonymousBlock
if(cpSendBtn) {
    cpSendBtn.addEventListener('click', () => {
        // 无论从哪来，点击发消息都进入聊天，并加载历史记录
        startChat(currentChatId);
    });
}

// [FunctionDeclaration] Function: showContextMenu
function showContextMenu(event, bubbleElement, timestamp) {
    event.preventDefault(); 
    currentSelectedMsgTimestamp = timestamp;
    
    const menu = document.getElementById('msgContextMenu');
    const overlay = document.getElementById('menuOverlay');
    
    // 1. 智能查找定位目标
    let target = bubbleElement.querySelector('.msg-content');
    if (!target) target = bubbleElement.querySelector('.inner-voice-toggle');
    if (!target && bubbleElement.classList.contains('system-text-message')) {
        target = bubbleElement;
    }
    if (!target) target = bubbleElement;
    
    const rect = target.getBoundingClientRect();
    
    // 2. 显示菜单（但位置先设为屏幕外，防止闪烁）
    menu.style.display = 'grid'; 
    menu.style.visibility = 'hidden'; // 暂时隐藏
    overlay.style.display = 'block'; 
    
    // 3. 获取菜单实际尺寸（必须在显示后才能获取）
    const menuRect = menu.getBoundingClientRect();
    const menuWidth = menuRect.width;
    const menuHeight = menuRect.height;
    
    // 4. 获取视口尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 5. 计算初始位置（默认在目标上方居中）
    let topPos = rect.top - menuHeight - 10; // 上方，留10px间隙
    let leftPos = rect.left + rect.width / 2 - menuWidth / 2; // 水平居中
    
    // 6. 边界检测与修正
    
    // 6.1 垂直方向：如果顶部放不下，改为底部
    if (topPos < 10) {
        topPos = rect.bottom + 10; // 放在目标下方
    }
    // 如果底部也放不下，强制贴顶显示
    if (topPos + menuHeight > viewportHeight - 10) {
        topPos = viewportHeight - menuHeight - 10;
    }
    
    // 6.2 水平方向：如果左侧溢出
    if (leftPos < 10) {
        leftPos = 10;
    }
    // 如果右侧溢出
    if (leftPos + menuWidth > viewportWidth - 10) {
        leftPos = viewportWidth - menuWidth - 10;
    }
    
    // 7. 应用修正后的位置
    menu.style.top = topPos + 'px';
    menu.style.left = leftPos + 'px';
    menu.style.transform = 'none'; // 移除原有的 translateX，避免冲突
    
    // 8. 显示菜单
    menu.style.visibility = 'visible';
    
    if (navigator.vibrate) navigator.vibrate(50);
}

// [FunctionDeclaration] Function: hideContextMenu
function hideContextMenu() {
    document.getElementById('msgContextMenu').style.display = 'none';
    document.getElementById('menuOverlay').style.display = 'none';
}

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('menuOverlay');
    if (overlay) {
        overlay.addEventListener('click', hideContextMenu);
        // 防止触摸穿透
        overlay.addEventListener('touchstart', (e) => {
            e.preventDefault(); // 阻止触摸事件传递到底层
            hideContextMenu();
        });
    }
});

// [FunctionDeclaration] Function: handleOutsideClick
function handleOutsideClick() {
    // 如果长按菜单正在显示，则关闭它
    if (document.getElementById('msgContextMenu').style.display === 'flex') {
        hideContextMenu();
    }
    // 注意：此处已移除退出多选模式的逻辑
}

// [VariableDeclaration] Variables: currentMultiSelectType
let currentMultiSelectType = 'delete';

// [FunctionDeclaration] Function: enterMultiSelectMode
function enterMultiSelectMode() {
    hideContextMenu();
    closeActionSheet(); // 关闭底部面板
    
    isMultiSelectMode = true;
    selectedTimestamps.clear();
    
    // 切换顶部栏显示
    document.querySelector('.nav-bar-normal').style.display = 'none';
    document.querySelector('.nav-bar-multiselect').style.display = 'flex';
    
    // 界面变化：隐藏输入框，显示底部双按钮操作栏
    chatMessagesContainer.classList.add('multi-select-mode');
    document.querySelector('.chat-input-area').style.display = 'none';
    document.getElementById('multiSelectBottomBar').style.display = 'flex';
    
    // 默认选中刚才长按的那一条
    if (currentSelectedMsgTimestamp) {
        const bubbles = document.querySelectorAll('.message-bubble, .system-text-message, .inner-voice-wrapper');
        bubbles.forEach(b => {
            if (b.dataset.timestamp == currentSelectedMsgTimestamp) {
                toggleMessageSelection(b, currentSelectedMsgTimestamp);
            }
        });
    } else {
        updateMultiselectCounter();
    }
}

// [FunctionDeclaration] Function: exitMultiSelectMode
function exitMultiSelectMode() {
    if (!isMultiSelectMode) return;
    
    isMultiSelectMode = false;
    selectedTimestamps.clear();
    
    // 切换顶部栏显示
    document.querySelector('.nav-bar-normal').style.display = 'flex';
    document.querySelector('.nav-bar-multiselect').style.display = 'none';
    
    // 界面恢复：隐藏底部栏，显示输入框
    document.querySelectorAll('.message-bubble, .system-text-message, .inner-voice-wrapper').forEach(b => b.classList.remove('selected'));
    chatMessagesContainer.classList.remove('multi-select-mode');
    document.querySelector('.chat-input-area').style.display = 'flex';
    document.getElementById('multiSelectBottomBar').style.display = 'none';
}

// [FunctionDeclaration] Function: toggleMessageSelection
function toggleMessageSelection(bubble, timestamp) {
    if (selectedTimestamps.has(timestamp)) {
        selectedTimestamps.delete(timestamp);
        bubble.classList.remove('selected');
    } else {
        selectedTimestamps.add(timestamp);
        bubble.classList.add('selected');
    }
    // 更新计数
    updateMultiselectCounter();
}

// [FunctionDeclaration] Function: updateMultiselectCounter
function updateMultiselectCounter() {
    const counter = document.getElementById('multiselectCounter');
    const count = selectedTimestamps.size;
    if (count > 0) {
        counter.textContent = `已选择 ${count} 条消息`;
    } else {
        counter.textContent = '请选择消息';
    }
}

// [FunctionDeclaration] Function: deleteSelectedMessages
async function deleteSelectedMessages() {
    if (selectedTimestamps.size === 0) return;
    
    const confirmDelete = await customConfirm(`确定删除这 ${selectedTimestamps.size} 条消息吗？`);
    if (!confirmDelete) return;

    // 1. 数据库操作
    const key = 'chat_messages_' + currentChatId;
    let messages = await getData(key) || [];
    
    // ★★★ 核心新增：智能检测并删除关联的"（继续）"占位符 ★★★
    const finalTimestampsToDelete = new Set(selectedTimestamps);
    
    // 检查是否删除了AI消息
    const deletedAnyAI = messages.some(m => 
        selectedTimestamps.has(m.timestamp) && m.role === 'assistant'
    );
    
    if (deletedAnyAI) {
        // 从后往前遍历，找到每条被删除的AI消息
        for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            
            // 如果这条消息即将被删除，且是AI回复
            if (selectedTimestamps.has(msg.timestamp) && msg.role === 'assistant') {
                // 向前查找最近的"（继续）"占位符
                for (let j = i - 1; j >= 0; j--) {
                    const prevMsg = messages[j];
                    
                    // 找到隐藏的"（继续）"就标记删除
                    if (prevMsg.isHidden && prevMsg.content === '（继续）') {
                        finalTimestampsToDelete.add(prevMsg.timestamp);
                        console.log('✅ 检测到AI续写，自动删除前置占位符');
                        break; // 找到就停止
                    }
                    
                    // 如果遇到其他用户消息，说明没有关联的占位符，停止查找
                    if (prevMsg.role === 'user' && !prevMsg.isHidden) {
                        break;
                    }
                }
            }
        }
    }
    
    // 执行删除（使用扩展后的删除列表）
let newMessages = messages.filter(m => !finalTimestampsToDelete.has(m.timestamp));

// ★★★ 小鱼新增：深度清洁逻辑 ★★★
const hasVisibleMessages = newMessages.some(m => !m.isHidden && m.type !== 'system_separator');

if (!hasVisibleMessages) {
    // 如果删完后没有可见消息了，彻底清空数据库
    newMessages = [];
    // 彻底清空界面（包括残留的时间戳）
    document.getElementById('chatMessagesContainer').innerHTML = '';
    // 强制重置草稿箱
    wxDrafts = [];
    await saveData('chat_drafts_' + currentChatId, null);
}

await saveData(key, newMessages);

// 2. 界面更新
if (hasVisibleMessages) {
    // 如果还有消息，只移除选中的元素
    selectedTimestamps.forEach(ts => {
        const el = document.querySelector(`[data-timestamp="${ts}"]`);
        if (el) {
            // 尝试移除关联的时间戳（简单的向前查找）
            const prev = el.previousElementSibling;
            if (prev && prev.classList.contains('chat-timestamp')) {
                prev.remove();
            }
            el.remove();
        }
    });
} else {
    // 如果已清空，无需通过ID查找移除，上面 innerHTML='' 已经处理了
}
    
    // 3. 更新首页会话预览
    const lastVisibleMsg = [...newMessages].reverse().find(m => !m.isHidden && m.type !== 'system_separator');
    if (lastVisibleMsg) {
        let previewText = '';
        if (lastVisibleMsg.type === 'sticker') previewText = '[图片]';
        else if (lastVisibleMsg.type === 'pat') previewText = '[拍一拍]';
        else previewText = lastVisibleMsg.content;
        await updateChatList(currentChatId, previewText, lastVisibleMsg.timestamp);
    } else {
        await updateChatList(currentChatId, '[无消息]', Date.now());
    }

    exitMultiSelectMode();
}

// [FunctionDeclaration] Function: refreshLastAIResponse
async function refreshLastAIResponse() {
    const refreshBtn = document.getElementById('chatRefreshBtn');
    
    // 先检查是否在聊天窗口
    if (!currentChatId) {
        customAlert('请先进入聊天窗口');
        return;
    }
    
    try {
        // 1. 获取聊天记录
        const key = 'chat_messages_' + currentChatId;
        let messages = await getData(key) || [];
        
        if (messages.length === 0) {
            customAlert('暂无消息');
            return;
        }
        
// 2. 找到最后一组AI回复
let lastAiGroupTimestamps = [];

for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];

    // ★★★ 关键修复：遇到隐形的“（继续）”隔断时，立刻停止！保护上一段内容 ★★★
    // 必须放在通用的 isHidden 判断之前
    if (msg.isHidden && msg.content === '（继续）') {
        break; // 遇到隔断，说明本次刷新到此为止，不要再往上删了
    }
    
    // 如果是其他隐藏消息（如场景分隔符），标记删除，继续往前找
    if (msg.isHidden || msg.type === 'system_separator') {
        lastAiGroupTimestamps.push(msg.timestamp);
        continue; 
    }

    // 如果是AI消息，标记删除
    if (msg.role === 'assistant') {
        lastAiGroupTimestamps.push(msg.timestamp);
    } 
    // 如果遇到普通用户消息，说明这一轮AI回复结束了，停止
    else if (msg.role === 'user') {
        break;
    }
}
        
        if (lastAiGroupTimestamps.length === 0) {
            customAlert('没有AI回复可以刷新');
            return;
        }
        
        // 3. 删除这组AI消息（从数据库）
        const newMessages = messages.filter(m => !lastAiGroupTimestamps.includes(m.timestamp));
        await saveData(key, newMessages);
        
// 4. 删除这组AI消息（从界面）
// 小鱼修复：同时选择普通气泡、心声折叠栏、以及【拍一拍系统消息】
const uiElements = document.querySelectorAll('.message-bubble, .inner-voice-wrapper, .system-text-message');
uiElements.forEach(el => {
    if (lastAiGroupTimestamps.includes(parseInt(el.dataset.timestamp))) {
        el.remove();
    }
});
        
        // 5. 开始旋转动画
        refreshBtn.classList.add('spinning');
        
        // 6. 重新生成AI回复
        await getAIResponse(currentChatId);
        
    } catch (error) {
        console.error('刷新回复时出错:', error);
        customAlert('刷新失败，请稍后再试');
    }
}

// [FunctionDeclaration] Function: toggleActionSheet
function toggleActionSheet() {
    const sheet = document.getElementById('chatActionSheet');
    const inputArea = document.querySelector('.chat-input-area');
    
    // 切换类名来触发CSS动画
    sheet.classList.toggle('open');
    inputArea.classList.toggle('sheet-open');
}

// [FunctionDeclaration] Function: closeActionSheet
function closeActionSheet() {
    const sheet = document.getElementById('chatActionSheet');
    const inputArea = document.querySelector('.chat-input-area');
    const scrollBtn = document.getElementById('scrollToBottomBtn'); // 小鱼新增
    
    sheet.classList.remove('open');
    inputArea.classList.remove('sheet-open');
    scrollBtn.classList.remove('sheet-open'); // 小鱼新增：按钮复位
}

// [FunctionDeclaration] Function: triggerRegenerate
function triggerRegenerate() {
    closeActionSheet(); // 先关闭面板
    refreshLastAIResponse(); // 再执行重生成
}

// [ExpressionStatement] Execution: addEventListener
document.getElementById('chatMessagesContainer').addEventListener('click', () => {
    closeActionSheet();
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('chatInput').addEventListener('focus', () => {
    closeActionSheet();
});

// [FunctionDeclaration] Function: deleteCurrentMessage
async function deleteCurrentMessage() {
    if (!currentSelectedMsgTimestamp) return;
    hideContextMenu();

    const key = 'chat_messages_' + currentChatId;
    let messages = await getData(key) || [];

    // 1. 找到要删除的消息，并收集所有关联的时间戳 (包括可能的隐藏续写占位符)
    const msgToDelete = messages.find(m => m.timestamp == currentSelectedMsgTimestamp);
    let timestampsToDelete = [currentSelectedMsgTimestamp];

    if (msgToDelete && msgToDelete.role === 'assistant') {
        const msgIndex = messages.findIndex(m => m.timestamp == currentSelectedMsgTimestamp);
        for (let j = msgIndex - 1; j >= 0; j--) {
            const prevMsg = messages[j];
            if (prevMsg.isHidden && prevMsg.content === '（继续）') {
                timestampsToDelete.push(prevMsg.timestamp);
                break;
            }
            if (prevMsg.role === 'user' && !prevMsg.isHidden) {
                break;
            }
        }
    }

    // 2. 从数据库中彻底删除这些消息
let newMessages = messages.filter(m => !timestampsToDelete.includes(m.timestamp));

// ★★★ 小鱼新增：深度清洁逻辑 ★★★
// 检查剩余消息中是否还有“可见消息”
const hasVisibleMessages = newMessages.some(m => !m.isHidden && m.type !== 'system_separator');

if (!hasVisibleMessages) {
    // 如果没有可见消息了，说明剩下的全是隐藏垃圾（如AI指令），彻底清空！
    newMessages = []; 
    // 既然空了，直接清空整个界面，防止残留时间戳
    document.getElementById('chatMessagesContainer').innerHTML = '';
    // 强制重置草稿箱
    wxDrafts = [];
    await saveData('chat_drafts_' + currentChatId, null);
}

await saveData(key, newMessages);

// 3. 界面更新
if (hasVisibleMessages) {
    // 如果还有消息，仅移除当前元素（保持丝滑）
    const targetElement = document.querySelector(`[data-timestamp="${currentSelectedMsgTimestamp}"]`);
    if (targetElement) {
        // 顺便检查一下它的上一个兄弟元素是不是时间戳，是的话也移除（防止时间戳孤零零留下）
        const prev = targetElement.previousElementSibling;
        if (prev && prev.classList.contains('chat-timestamp')) {
            prev.remove();
        }
        
        targetElement.style.transition = 'opacity 0.2s, height 0.2s';
        targetElement.style.opacity = '0';
        setTimeout(() => targetElement.remove(), 200);
    }
} else {
    // 如果已经清空了，显示“暂无消息”占位符（可选，或者直接留白）
    // updateChatList 会处理会话列表的预览
}

    // 4. 更新首页会话列表的预览
    const lastVisibleMsg = [...newMessages].reverse().find(m => !m.isHidden && m.type !== 'system_separator');
    if (lastVisibleMsg) {
        let preview = '';
        if (lastVisibleMsg.type === 'sticker') preview = '[表情]';
        else if (lastVisibleMsg.type === 'pat') preview = '[拍一拍]';
        else preview = lastVisibleMsg.content;
        await updateChatList(currentChatId, preview, lastVisibleMsg.timestamp);
    } else {
        await updateChatList(currentChatId, '[无消息]', Date.now());
    }
}

// [ExpressionStatement] Execution: addEventListener
chatSendBtn.addEventListener('click', async () => {
    // ★ 小鱼终极修复：发送新消息时，彻底清空草稿箱，开启全新回合
    wxDrafts = [];
    wxCurrentDraftIdx = 0;
    await saveData('chat_drafts_' + currentChatId, null); 

    // ★★★ 新增：视觉清理 —— 立即移除界面上残留的旧草稿箱工具栏 ★★★
    const existingToolbar = document.querySelector('.wx-draft-toolbar');
    if (existingToolbar) existingToolbar.remove();

    const currentInput = chatInput.value.trim();
    
    if (!currentInput && splitMsgQueue.length === 0) return;
    if (!currentChatId) return;
    
    // ★★★ 核心新增：在发送前检查是否需要插入分隔符 ★★★
    await insertSceneSeparator(currentChatId, 'online');
    
    // 准备要发送的消息列表
    let messagesToSend = [...splitMsgQueue];
    if (currentInput) {
        messagesToSend.push(currentInput);
    }
    
    // 清空状态
    chatInput.value = '';
    splitMsgQueue = [];
    renderSplitQueue();
    chatSendBtn.classList.remove('visible');
    
    // 批量发送
let lastContent = '';
for (let content of messagesToSend) {
    let msgType = 'text';
    let finalContent = content;
    let stickerDesc = '';

    // ★★★ 1. 检测是否为图片数据 (Base64) ★★★
    if (content.startsWith('data:image')) {
        msgType = 'sticker'; // 复用 sticker 类型来显示图片
        finalContent = content;
        stickerDesc = '用户图片';
    }
    // ★★★ 2. 检测是否为表情占位符 [表情：名称] ★★★
    else {
        const stickerMatch = content.match(/^\[表情：(.+)\]$/);
        if (stickerMatch) {
            const desc = stickerMatch[1];
            const stickerUrl = await findStickerUrlByDesc(desc);
            if (stickerUrl) {
                msgType = 'sticker';
                finalContent = stickerUrl;
                stickerDesc = desc;
            }
        }
    }

const userMsg = {
    role: 'user',
    type: msgType,
    content: finalContent,
    desc: stickerDesc,
    timestamp: Date.now() + Math.random()
};

// ★★★ 小鱼新增：附加引用信息 ★★★
if (currentQuoteMsg) {
    userMsg.quote = currentQuoteMsg;
    cancelQuote(); // 发送后清空引用状态和预览UI
}

// 1. 显示
        appendMessageToUI(userMsg);
        // 2. 保存
        await saveMessage(currentChatId, userMsg);
        
        // 如果是表情，列表预览显示为[表情]
        lastContent = (msgType === 'sticker') ? '[表情]' : content;
        
        // 稍微延迟，模拟发送间隔
        await new Promise(r => setTimeout(r, 100));
    }
    
    scrollToBottom();
    
    // 3. 更新会话列表
    if (lastContent) {
        await updateChatList(currentChatId, lastContent, Date.now());
    }
    
    // ★★★ 关键修改：如果是“立即回复”模式，发送完所有消息后，立即触发AI ★★★
    if (aiReplyMode === 'immediate') {
        chatAiBtn.classList.add('btn-pulse');
        setTimeout(async () => {
            try {
                await getAIResponse(currentChatId);
            } catch (e) {
                console.error("自动回复失败", e);
            } finally {
                chatAiBtn.classList.remove('btn-pulse');
            }
        }, 500);
    }
});

// [FunctionDeclaration] Function: buildApiMessages
async function buildApiMessages(chatId) {
    const contact = await getContactDetails(chatId);
    if (!contact) throw new Error("找不到联系人");
    
    // 1. 获取聊天记录 (公共步骤)
    let messages = await getData('chat_messages_' + chatId) || [];
    
    // 定义变量，用于最后返回
    let finalSystemPrompt = "";
    let availableStickers = []; 

    // ============================================================
    // 分支 A：群聊模式 (这是新增的功能)
    // ============================================================
    if (contact.isGroup) {
// 获取群成员
const allContacts = await getData('customContacts') || [];
const memberIds = contact.memberIds || [];
const members = allContacts.filter(c => memberIds.includes(c.id));

// ★★★ 核心修复：同时读取群聊总结记忆和成员个人记忆 ★★★
let groupMemoryPrompt = "";

// 1. 获取群聊专属总结记忆
const groupMountCount = await getData('groupMemoryMount_' + chatId);
const finalGroupMountCount = groupMountCount !== null ? parseInt(groupMountCount) : 5; // ★ 增加 parseInt 保底

if (finalGroupMountCount > 0) {
    try {
        const groupMemories = await requestMemoriesFromWebBox(chatId, finalGroupMountCount);
        if (groupMemories && groupMemories.length > 0) {
            // ★★★ 核心修复：反转数组，确保从旧到新排列 ★★★
            const sortedGroupMemories = groupMemories.reverse();
            groupMemoryPrompt += `\n## 【群聊历史总结记忆】\n以下是群内发生过的核心事件：\n`;
            groupMemoryPrompt += sortedGroupMemories.map((m, i) => `${i+1}. ${m.content}`).join('\n');
            groupMemoryPrompt += `\n`;
        }
    } catch (e) {
        console.error(`获取群聊记忆失败`, e);
    }
}

// 2. 获取各成员的个人记忆
let personalMemoryPrompt = "";
for (const member of members) {
    const mountCount = member.memoryMount !== undefined ? parseInt(member.memoryMount) : 5;
    if (mountCount > 0) {
        try {
            const memories = await requestMemoriesFromWebBox(member.id, mountCount);
            if (memories && memories.length > 0) {
                // ★★★ 核心修复：反转数组，确保从旧到新排列 ★★★
                const sortedMemories = memories.reverse();
                personalMemoryPrompt += `\n### [${member.nickname} 的个人记忆]\n`;
                personalMemoryPrompt += sortedMemories.map(m => `- ${m.content}`).join('\n');
            }
        } catch (e) {
            console.error(`获取${member.nickname}的记忆失败`, e);
        }
    }
}

if (personalMemoryPrompt) {
    groupMemoryPrompt += `\n## 【成员个人记忆库】\n以下是各成员与用户的私下羁绊和记忆，请在扮演时自然体现：\n${personalMemoryPrompt}\n`;
}

// 2. 构建成员列表 (小鱼优化：强调真名与昵称的关系)
const memberListStr = members.map(m => {
    // 如果有真名且真名不等于昵称，格式化为：真名 (群内显示昵称: 昵称)
    const nameStr = (m.realName && m.realName !== m.nickname) 
        ? `${m.realName} (群内显示昵称: ${m.nickname})` 
        : m.nickname;
    return `- **${nameStr}**: ${m.persona || '无特殊设定'}`;
}).join('\n');

    // 3. 获取用户资料 (用于群聊上下文)
    const [gName, gGender, gPersona] = await Promise.all([
        getData('userName'), getData('gender'), getData('userPersona')
    ]);
    const userName = gName || '用户';

    // 4. 时间感知
    let timePromptContent = "";
    const now = new Date();
    timePromptContent = `当前时间：${now.toLocaleString('zh-CN', { hour12: false })}`;

    // ★★★ 5. 小鱼新增：智能收集表情包（去重+归属标记） ★★★
    const allStickerLibs = await getData('stickerLibs') || [];
    const stickerOwnershipMap = new Map(); // 格式: {库ID: [角色名数组]}
    const allStickerData = new Map(); // 格式: {库ID: {库名, 表情列表}}
    
    // 遍历所有成员，收集表情包归属
    members.forEach(m => {
        const allowedLibIds = m.allowedStickerLibs || [];
        allowedLibIds.forEach(libId => {
            if (!stickerOwnershipMap.has(libId)) {
                stickerOwnershipMap.set(libId, []);
            }
            stickerOwnershipMap.get(libId).push(m.nickname);
            
            // 同时收集表情包数据
            if (!allStickerData.has(libId)) {
                const lib = allStickerLibs.find(l => l.id === libId);
                if (lib) {
                    allStickerData.set(libId, {
                        name: lib.name,
                        stickers: lib.stickers || []
                    });
                }
            }
        });
    });
    
    // 构建表情包说明文本
    let stickerPrompt = "";
    if (allStickerData.size > 0) {
        const stickerSections = [];
        
        allStickerData.forEach((libData, libId) => {
            const owners = stickerOwnershipMap.get(libId);
            const stickerNames = libData.stickers
                .filter(s => s.desc && s.desc.trim())
                .map(s => s.desc.trim());
            
            if (stickerNames.length === 0) return; // 跳过空库
            
            // 填充 availableStickers（供后续解析使用）
            libData.stickers.forEach(s => {
                if (s.desc && s.desc.trim()) {
                    availableStickers.push({ name: s.desc.trim(), url: s.url });
                }
            });
            
            // 构建归属说明
            let ownerText = "";
            if (owners.length === 1) {
                ownerText = `【${owners[0]}专属】`;
            } else if (owners.length === members.length) {
                ownerText = `【全体共有】`;
            } else {
                ownerText = `【${owners.join('、')}共有】`;
            }
            
            stickerSections.push(`${ownerText} ${libData.name}: [${stickerNames.join(', ')}]`);
        });
        
                if (stickerSections.length > 0) {
            stickerPrompt = `
**表情包使用规则 (极度重要)**：
${stickerSections.join('\n')}

- **使用方法**: {"type": "face", "content": "表情名称"}
- **绝对禁令**: 必须完全匹配上述列表中的名称，**绝对禁止**捏造不存在的表情名！只有对应角色才能使用其专属/共有的表情。`;
        }
    }
    
    if (!stickerPrompt) {
        stickerPrompt = `**表情包使用规则**：
- 群内目前**没有任何**自定义表情包。
- **绝对禁令**：**绝对禁止**任何角色使用 {"type": "face"} 格式！`;
    }

                // 6. 群聊专用 Prompt (重构版：格式要求置顶，防掉格式)
    finalSystemPrompt = `
你现在正在模拟一个微信群聊。你的任务是同时扮演群内的多个角色。

# 【最高优先级：回复格式要求 (JSON Array)】
你必须严格遵守以下 JSON 数组格式输出，绝对不要包含 markdown 代码块标记(\`\`\`json)或其他多余文本。
[
  {"name": "角色昵称", "type": "text", "content": "普通文本内容"},
  {"name": "角色昵称", "type": "voice", "content": "(语气形容) 语音内容"},
  {"name": "角色昵称", "type": "face", "content": "表情名称"},
  {"name": "角色昵称", "type": "virtual_image", "content": "画面的详细视觉描述"},
  {"name": "角色昵称", "type": "pat", "content": "拍一拍后缀"},
  {"name": "角色昵称", "type": "img_desc", "content": "对用户发送图片的画面描述"},
  {"name": "角色昵称", "type": "transfer_send", "amount": "66.66", "content": "转账说明文字"},
  {"name": "角色昵称", "type": "transfer_accept", "content": "谢谢(接受转账)"},
  {"name": "角色昵称", "type": "transfer_return", "content": "无功不受禄(拒绝转账)"}
{"name": "角色昵称", "type": "quote", "quoteSender": "被引用者名字", "quoteContent": "被引用的原文", "content": "回复内容"}
]

**字段与功能指令详解**:
1. **"name" (身份铁律)**: 必填。必须是下方【群成员名单】中的名字。**绝对禁止扮演真人用户("${userName}")**。
2. **"type" & "content"**:
   - **voice**: content 必须以括号开头描述语气，如 "(开心) 哈哈"。
   - **virtual_image**: 当角色想发照片时，content 填画面描述，系统会转为图片。
   - **img_desc**: 若用户最新发了图片，必须包含此类型，content 简述画面内容。
   - **transfer_send**: 发起转账。必须包含 "amount" (数字字符串，如 "100.00") 和 "content" (转账附言，必填)。
   - **transfer_accept / transfer_return**: 接收或退回用户的转账。
   
${stickerPrompt}

---

# 【群成员名单及人设】
${memberListStr}

# 【用户资料 (群成员之一)】
- 昵称：${userName}
- 性别：${gGender || '未知'}
- 设定：${gPersona || '无'}

${groupMemoryPrompt}

# 【行为准则】
1. **多角色互动**: 角色之间可以互相聊天、吐槽，不要只围着用户转，营造热闹的群聊氛围。
2. **发言频率**: 一次回复包含 1-5 条消息。
3. **环境感知**: ${timePromptContent}
`;
}
// ============================================================
// 分支 B：单聊模式 (这里完全保留了你原先的逻辑和代码结构)
// ============================================================
else {
    // ★★★ 修复：从角色数据读取记忆挂载数量 ★★★
    let memoryPrompt = "";
    const mountCount = contact.memoryMount !== undefined ? parseInt(contact.memoryMount) : 5; // 强制转为数字
    
if (mountCount > 0) {
    try {
        const memories = await requestMemoriesFromWebBox(chatId, mountCount);
        if (memories && memories.length > 0) {
            // ★★★ 核心修复：反转数组，确保最旧的在前，最新的在后 ★★★
            const sortedMemories = memories.reverse();
            const memList = sortedMemories.map((m, i) => `${i+1}. ${m.content}`).join('\n');
            memoryPrompt = `
# 【长期记忆 (Long-term Memory)】
以下是你们之前的互动记忆，请在对话中自然体现这些信息，不要生硬复述：
${memList}
`;
        }
    } catch (e) {
        console.error('记忆挂载失败', e);
    }
}

        // ★★★ 新增：跨群聊记忆挂载逻辑 ★★★
        const isGroupMountEnabled = await getData('groupMountEnabled_' + chatId);
if (isGroupMountEnabled) {
    const mountedGroups = await getData('mountedGroupIds_' + chatId) || [];
    const savedGroupMountLimit = await getData('groupMountLimit_' + chatId);
    const groupMountLimit = savedGroupMountLimit !== null ? savedGroupMountLimit : 30;
    const savedGroupChatLimit = await getData('groupChatLimit_' + chatId);
    const groupChatLimit = savedGroupChatLimit !== null ? savedGroupChatLimit : 30;

    if (mountedGroups.length > 0) {
        try {
            let allGroupMemories = [];
            let allGroupChats = [];
            const contacts = await getData('customContacts') || [];
            
            // 获取长期记忆
            if (groupMountLimit > 0) {
                const promises = mountedGroups.map(gid => requestMemoriesFromWebBox(gid, groupMountLimit));
                const results = await Promise.all(promises);

                results.forEach((mems, index) => {
                    const gid = mountedGroups[index];
                    const gContact = contacts.find(c => String(c.id) === String(gid));
                    const gName = gContact ? gContact.nickname : '未知群聊';
                    
                    mems.forEach(m => {
                        allGroupMemories.push({
                            ...m,
                            groupName: gName,
                            sortTime: m.timestamp || m.id || 0 
                        });
                    });
                });

                allGroupMemories.sort((a, b) => a.sortTime - b.sortTime);
                const topMemories = allGroupMemories.slice(0, groupMountLimit);

                if (topMemories.length > 0) {
                    memoryPrompt += `\n# 【关联的群聊长期记忆】\n以下是你在其他群聊中发生的核心事件总结：\n`;
                    memoryPrompt += topMemories.map((m, i) => `${i+1}. [${m.groupName}] ${m.content}`).join('\n');
                    memoryPrompt += `\n`;
                }
            }

            // 获取短期记忆（原始聊天记录）
if (groupChatLimit > 0) {
    for (const gid of mountedGroups) {
        const gContact = contacts.find(c => String(c.id) === String(gid));
        const gName = gContact ? gContact.nickname : '未知群聊';
        const gMessages = await getData('chat_messages_' + gid) || [];
        
        gMessages.filter(m => !m.isHidden && m.type !== 'system_separator')
            .forEach(m => {
                allGroupChats.push({
                    ...m,
                    groupName: gName,
                    isGroupChat: true
                });
            });
    }
    
    // 按时间排序后取最新的N条
    allGroupChats.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    allGroupChats = allGroupChats.slice(-groupChatLimit);
}

            // 混合排序（将在历史记录处理时进行）
            window.crossGroupChats = allGroupChats;

        } catch (e) {
            console.error('群聊记忆挂载获取失败', e);
        }
    }
}

        // --- 1. 世界书 (原逻辑) ---
        let worldBookPrompt = "";
        if (contact.worldBookIds && contact.worldBookIds.length > 0) {
            const rawWb = localStorage.getItem('wechat_world_book_shared');
            const allEntries = rawWb ? JSON.parse(rawWb) : [];
            const activeEntries = allEntries.filter(e => contact.worldBookIds.includes(e.id));
            if (activeEntries.length > 0) {
                worldBookPrompt = activeEntries.map(e => `[${e.title}]: ${e.content}`).join('\n');
            }
        }

        // --- 2. 用户资料准备 (原逻辑) ---
        const chatProfiles = await getData('my_chat_profiles') || {};
        const chatProfile = chatProfiles[chatId] || {}; 
        const [globalName, globalGender, globalRegion, globalPhone, globalWechatId, globalSign, globalPersona] = await Promise.all([
              getData('userName'), getData('gender'), getData('region'),
              getData('phone'), getData('wechatId'), getData('signature'), getData('userPersona')
            ]);

        const myName = chatProfile.nickname || globalName || '用户'; 
        const myGender = chatProfile.gender || globalGender;
        const myRegion = chatProfile.region || globalRegion;
        const myPersona = chatProfile.persona || globalPersona;

        // --- 3. 表情包准备 (原逻辑) ---
        let stickerPrompt = "";
        if (contact.allowedStickerLibs && contact.allowedStickerLibs.length > 0) {
            const allLibs = await getData('stickerLibs') || [];
            const targetLibs = allLibs.filter(lib => contact.allowedStickerLibs.includes(lib.id));
            targetLibs.forEach(lib => {
                if (lib.stickers) {
                    lib.stickers.forEach(s => {
                        if (s.desc && s.desc.trim()) {
                            availableStickers.push({ name: s.desc.trim(), url: s.url });
                        }
                    });
                }
            });
        }
        
                if (availableStickers.length > 0) {
            const stickerNames = availableStickers.map(s => s.name).join(', ');
            const stickerExamples = availableStickers.slice(0, 3).map(s => s.name).join('、');
            stickerPrompt = `**表情包使用规则 (极度重要)**：
- 你拥有的可用表情：[${stickerNames}]
- **发送格式**：{"type": "face", "content": "表情名称"}
- **绝对禁令**：content 必须且只能是上述列表中的精确名称，**绝对禁止**捏造不存在的表情名！`;
        } else {
            stickerPrompt = `**表情包使用规则**：
- 你目前**没有任何**自定义表情包。
- **绝对禁令**：**绝对禁止**使用 {"type": "face"} 格式！`;
        }

// --- 4. 心声与时间 (修复版：从数据库读取) ---
const savedInnerVoiceState = await getData('innerVoice_' + chatId);
const innerVoiceEnabled = savedInnerVoiceState === true;

const innerVoicePrompt = innerVoiceEnabled ? `
# 3. 【特殊指令：心声模式 (ON)】
系统检测到"心声开关"已打开。
**规则**：
1. 本次回复的 JSON 数组中，**必须**包含至少 1 条 {"type": "inner_voice", ...} 消息。
2. 心声内容应反映角色真实的潜台词、吐槽、阴暗面或对用户的真实看法（可与表面对话形成反差）。` : '';

// ★★★ 核心修改：时间信息不再放入 System Prompt，改为稍后追加到消息列表末尾 ★★★
let timePromptContent = ""; // 保留变量，但内容为空

        // --- 5. 构建单聊 System Prompt (原汁原味) ---
        const charTrueName = (contact.realName && contact.realName.trim()) ? contact.realName : contact.nickname;
        
        // ★★★ 小鱼修改：强化昵称与真名的区分 ★★★
        let nameInstruction = `- **你的真实身份**：你是 "${charTrueName}"（这是你的真名）。`;
        if (contact.realName && contact.realName !== contact.nickname) {
            nameInstruction += `\n- **关于备注昵称**：用户在微信通讯录中给你的备注是 "${contact.nickname}"，这仅用于界面显示和消息归属标记。**在对话中你必须使用真名 "${charTrueName}"**，绝对不要在聊天内容中提及或使用备注昵称 "${contact.nickname}"。`;
        } else {
            nameInstruction += `\n- **身份确认**：你在通讯录中的显示名称也是 "${charTrueName}"。`;
        }

// ★★★ 核心修复：根据开关动态决定是否在格式示例中暴露 inner_voice ★★★
const innerVoiceFormatLine = innerVoiceEnabled ? '\n  {"type": "inner_voice", "content": "内心独白"},' : '';

let rawSystemPrompt = `
# 1. 【最高优先级】回复格式要求 (Output Format)
你必须严格遵守以下 JSON 数组格式输出，不要包含 markdown 代码块标记：
[
  {"type": "text", "content": "对话内容"},
  {"type": "face", "content": "表情名称"},
  {"type": "voice", "content": "语音内容"},
  {"type": "virtual_image", "content": "画面的详细视觉描述"},${innerVoiceFormatLine}
  {"type": "pat", "content": "拍一拍后缀"},
  {"type": "call_invite", "content": "发起语音通话"},
  {"type": "img_desc", "content": "对用户发送图片的画面描述"},
  {"type": "moment", "content": "发朋友圈的文字内容"},
  {"type": "moment_like", "postId": "帖子ID"},
  {"type": "moment_comment", "postId": "帖子ID", "content": "评论内容"}
{"type": "quote", "quoteSender": "被引用者名字", "quoteContent": "被引用的原文", "content": "你的回复内容"}
]
**朋友圈互动说明**：
- 当你看到系统提示用户或其他角色发了朋友圈时，你可以选择点赞或评论
- 点赞格式：{"type": "moment_like", "postId": "帖子的时间戳ID"}
- 评论格式：{"type": "moment_comment", "postId": "帖子的时间戳ID", "content": "你的评论内容"}
- 注意：postId 必须是系统提示中给出的准确数字
- 如果系统提示中额外提供了【关系提示】，你必须优先按照“你眼中的发帖人关系”来决定评论语气、亲密度、是否主动互动
- 如果存在双向关系，说明双方都认可该关系，你可以更自然地体现这种熟悉度
**特殊指令说明**：
- **发送图片**：如果你想给用户发照片、截图或风景图，请使用 {"type": "virtual_image", "content": "这里写画面的详细描述"}。系统会自动将其转换为一张图片卡片显示给用户。
- **发朋友圈**：如果你想更新自己的朋友圈动态，请使用 {"type": "moment", "content": "文案"}。该消息不会出现在聊天窗口，而是直接发布到朋友圈。
- **引用回复**：如果你想引用用户之前说过的某句话进行回复，请使用 {"type": "quote", "quoteSender": "发送者名字", "quoteContent": "被引用的原文（尽量简短）", "content": "你的回复"}。系统会在你的回复下方显示一个灰色的引用气泡。
**特殊规则**：若用户最新一条消息包含图片，你**必须**在回复数组中包含一项 {"type": "img_desc", ...}，详细描述你看到的画面内容（50字以内），用于系统记忆。
**格式禁忌**：绝对不要在 content 中包含 [线上]、[线下]、[系统提示] 等标签。

# 2. 核心规则 (Core Rules)
${nameInstruction}
- **场景**：当前处于 **线上聊天模式（微信对话）**。请使用文字聊天的语气（而非面对面）。
- **节奏**：模拟真人习惯，一次性回复 3-8 条短消息，避免长篇大论。
- **★★★ 关于昵称的特别说明 ★★★**：
  * 系统内部使用"昵称"字段用于界面显示和消息归属判断（例如标记"这是谁发的消息"）。
  * **你在对话中绝对不要提及或使用昵称，必须使用真名 "${charTrueName}"**。
  * 如果用户直接询问"你的名字是什么"或类似问题，你应该回答你的真名 "${charTrueName}"。

- **语音消息规范**：
  1. **格式**：{"type": "voice", "content": "实际说的话"}
  2. **声音描述**：必须用括号标注，如 "(语气温柔)" "(声音低沉磁性)" "(带着笑意)"
  3. **使用场景**：只在情感强烈、需要传达语气时使用，普通对话仍然用文字。
  4. **示例**：
     - {"type": "voice", "content": "(语气温和)你还好吗？"}
     - {"type": "voice", "content": "(声音低沉磁性)我想你了。"}
- **处理转账**: 若用户发来转账，你可以决定接收或退回。
   - 接收转账: {"type": "transfer_accept", "content": "谢谢"}
   - 退回转账: {"type": "transfer_return", "content": "无功不受禄"}
- **发起转账**: 如果你想给用户钱（如发红包、退款、给零花钱），请使用：
   - 格式: {"type": "transfer_send", "amount": "88.00", "content": "转账说明文字"}
   - **关键规则**:
     * amount: 必须是数字字符串，最多两位小数，如 "66.66"
     * content: **必填项**，用于填写转账附言（如"生日快乐"、"感谢你的帮助"），最多60个字
     * 转账说明会同时显示在转账卡片和对方的收款页面，请认真填写有温度的文字
   - 示例:
     * {"type": "transfer_send", "amount": "520.00", "content": "今天是你的生日，小小心意不成敬意"}
     * {"type": "transfer_send", "amount": "100.00", "content": "周末加班辛苦了，请你喝咖啡"}

- **拍一拍规范 (★★★ 严格限制 ★★★)**：
  1. **绝对禁止滥用**：**严禁**在每一轮回复的末尾都习惯性地添加拍一拍！这会让对话显得非常机械和令人反感。
  2. **使用频率**：请将使用频率控制在 **10% 以下**。只有在用户先拍了你，或者情境**极度**需要（如极度的撒娇、安慰或挑逗）时才可偶尔使用。
  3. **默认行为**：在 90% 的情况下，请**只发送文本和表情**，不要发送拍一拍。
  4. **格式**：{"type": "pat", "content": "后缀"}。
${stickerPrompt}

${innerVoicePrompt}

# 3. 你的角色人设 (Character Persona)
${contact.persona || '无特殊设定'}

# 4. 用户人设 (User Profile)
- 名字：${myName}
- 性别：${myGender || '未知'}
- 地区：${myRegion || '未知'}
- 备注/设定：${myPersona || '无'}
(请根据用户资料进行互动)

# 5. 世界书与设定 (World Book)
${worldBookPrompt || '无额外世界观设定'}

${memoryPrompt}

# 6. 环境与时间 (Environment)
${timePromptContent || '(无特殊时间设定)'}
- **场景切换**：若看到 [线下] 标签，说明那是面对面发生的；回到 [线上] 则变为微信交流。
`;

        // 关键词替换
        processedSystemPrompt = rawSystemPrompt;
        processedSystemPrompt = processedSystemPrompt.replace(/\{\{char\}\}/gi, charTrueName);
        processedSystemPrompt = processedSystemPrompt.replace(/代码助手/g, charTrueName);
        processedSystemPrompt = processedSystemPrompt.replace(/<char>/gi, charTrueName);
        processedSystemPrompt = processedSystemPrompt.replace(/\{\{user\}\}/gi, myName);
        processedSystemPrompt = processedSystemPrompt.replace(/<user>/gi, myName);
        processedSystemPrompt = processedSystemPrompt.replace(/\buser\b/gi, myName);
        
        finalSystemPrompt = processedSystemPrompt;
    }

    // ============================================================
    // 历史记录处理 (这是唯一必须对单聊/群聊都做的公共修改)
    // ============================================================
    
    // 1. 读取上下文轮数限制
const contextLimit = (await getData('contextLimit_' + chatId)) || 20;
let recentMessages = messages
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    .slice(-contextLimit);

// ★★★ 核心修复：混入群聊记忆并插入场景切换标记 ★★★
if (window.crossGroupChats && window.crossGroupChats.length > 0) {
    const allMixed = [...recentMessages, ...window.crossGroupChats]
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    
    // 插入场景切换标记
    const lastGroupIndex = allMixed.map(m => m.isGroupChat).lastIndexOf(true);
    if (lastGroupIndex !== -1 && lastGroupIndex < allMixed.length - 1) {
        allMixed.splice(lastGroupIndex + 1, 0, {
            role: 'user',
            content: '[系统提示：场景已切换为私聊，请基于当前场景继续对话]',
            timestamp: allMixed[lastGroupIndex].timestamp + 0.5,
            isHidden: true,
            type: 'system_separator'
        });
    }
    
    recentMessages = allMixed;
    delete window.crossGroupChats;
}

// 3. 组装最终消息
// ★★★ 核心重构：构建带时间戳的消息列表 ★★★
const apiMessages = [{ role: 'system', content: finalSystemPrompt }];

let lastDisplayedTime = null; // 记录上一条显示的时间戳

// ★★★ 核心修复：改用 for...of 循环以支持 await ★★★
for (let index = 0; index < recentMessages.length; index++) {
    const msg = recentMessages[index];
    const source = msg.source || 'online';
    const sourceLabel = source === 'offline' ? '[线下]' : '[线上]';
    
    // 跳过"继续"指令的特殊处理
    if (msg.isHidden && msg.content === '（继续）') {
        apiMessages.push({ role: 'user', content: "（请继续上一条的发言...）" });
        continue;
    }

    // ★★★ 核心新增：检查是否需要插入时间提示 ★★★
    if (contact.timeAwareness !== false && msg.timestamp) {
        const currentTime = formatWeChatTime(msg.timestamp);
        
        // 如果时间戳发生变化，插入一条系统提示
        if (currentTime !== lastDisplayedTime) {
            apiMessages.push({
                role: 'system',
                content: `[时间提示] 以下消息发送于: ${currentTime}`
            });
            lastDisplayedTime = currentTime;
        }
    }

    // 构建消息前缀（群聊需要显示发送者名字）
    let prefix = "";
    if (contact.isGroup && msg.role === 'assistant' && msg.senderName) {
        prefix = `${msg.senderName}: `;
    }

    // 处理朋友圈隐藏消息（多模态：文字+图片数组）
    if (msg.type === 'moment_hidden') {
      // ★★★ 核心修复：实时从数据库读取最新的点赞和评论 ★★★
      const momentId = msg.momentId || msg.timestamp;
      let moments = await getData('moments_posts') || [];
      const currentPost = moments.find(p => String(p.id) === String(momentId));
      
      // 判断这条朋友圈消息之后是否已经存在AI回复
      const msgIndexInAll = messages.findIndex(m => m.timestamp === msg.timestamp);
      const msgsAfter = messages.slice(msgIndexInAll + 1);
      const hasAiReplyAfter = msgsAfter.some(m => 
        m.role === 'assistant' && !m.isHidden
      );

      if (hasAiReplyAfter) {
        // 下一轮及以后：把图片替换为文字描述，节省token
        let textOnly = '';
        if (Array.isArray(msg.content)) {
          // 提取文字部分
          const textPart = msg.content.find(p => p.type === 'text');
          textOnly = textPart ? textPart.text : '[朋友圈动态]';

          // 如果有已识别的图片描述，追加进去
          if (msg.imageDescriptions && msg.imageDescriptions.length > 0) {
            textOnly += ' 图片内容：' + msg.imageDescriptions.join('；');
          } else {
            textOnly += '（图片已省略）';
          }
        } else {
          textOnly = typeof msg.content === 'string' ? msg.content : '[朋友圈动态]';
        }

        // ★★★ 核心新增：追加最新的互动信息 ★★★
        if (currentPost) {
          const likes = currentPost.likes || [];
          const comments = currentPost.comments || [];
          
          if (likes.length > 0) {
            textOnly += ` 当前点赞：${likes.join('、')}。`;
          }
          if (comments.length > 0) {
            const commentList = comments.map(c => `${c.authorName}: ${c.content}`).join('；');
            textOnly += ` 当前评论：${commentList}。`;
          }
        }

        apiMessages.push({
          role: 'user',
          content: textOnly
        });
      } else {
        // 同一轮（AI尚未回复）：发送原始多模态内容，让AI看到图片
        let finalContent = msg.content;
        
        // ★★★ 核心新增：如果是数组格式，更新文字部分以包含最新互动 ★★★
        if (Array.isArray(msg.content) && currentPost) {
          const textPartIndex = msg.content.findIndex(p => p.type === 'text');
          if (textPartIndex !== -1) {
            let updatedText = msg.content[textPartIndex].text;
            
            const likes = currentPost.likes || [];
            const comments = currentPost.comments || [];
            
            if (likes.length > 0) {
              updatedText += ` 当前点赞：${likes.join('、')}。`;
            }
            if (comments.length > 0) {
              const commentList = comments.map(c => `${c.authorName}: ${c.content}`).join('；');
              updatedText += ` 当前评论：${commentList}。`;
            }
            
            // 创建新数组，替换文字部分
            finalContent = [...msg.content];
            finalContent[textPartIndex] = { type: 'text', text: updatedText };
          }
        }
        // ★★★ 如果是字符串格式，也追加互动信息 ★★★
        else if (typeof msg.content === 'string' && currentPost) {
          let updatedText = msg.content;
          
          const likes = currentPost.likes || [];
          const comments = currentPost.comments || [];
          
          if (likes.length > 0) {
            updatedText += ` 当前点赞：${likes.join('、')}。`;
          }
          if (comments.length > 0) {
            const commentList = comments.map(c => `${c.authorName}: ${c.content}`).join('；');
            updatedText += ` 当前评论：${commentList}。`;
          }
          
          finalContent = updatedText;
        }
        
        apiMessages.push({
          role: 'user',
          content: finalContent
        });
      }
      continue;
    }

    // 处理图片消息
    if (msg.type === 'sticker' && msg.content && msg.content.startsWith('data:image')) {
        const descText = msg.ai_description ? `：${msg.ai_description}` : '';
        const textContent = `${prefix}${sourceLabel} [发送了一张图片${descText}]`;

        if (msg.ai_description) {
            apiMessages.push({ role: msg.role, content: textContent });
            continue;
        }

        const isRecent = index > recentMessages.length - 5; 
        if (isRecent) {
            const sizeInMB = (msg.content.length * 0.75) / (1024 * 1024);
            if (sizeInMB > 5) {
                apiMessages.push({ role: msg.role, content: textContent + " (文件过大)" });
                continue;
            }
            
            apiMessages.push({
                role: msg.role,
                content: [
                    { type: "text", text: textContent },
                    { type: "image_url", image_url: { url: msg.content } }
                ]
            });
            continue;
        } else {
            apiMessages.push({ role: msg.role, content: textContent });
            continue;
        }
    }

    // 处理其他类型消息
    let content = msg.content;

    if (msg.type === 'transfer') {
        if (msg.isReceipt) {
            content = `[已领取了你的转账 ¥${msg.amount}]`;
        } else {
            let noteText = "";
            if (msg.transferNote) {
                noteText = ` (说明: "${msg.transferNote}")`;
            }
            content = `[向你转账了 ¥${msg.amount} 元${noteText}]`;
        }
    }
    else if (typeof content === 'string' && content.startsWith('[VOICE:')) {
        const voiceMatch = content.match(/^\[VOICE:\d+:(.+)\]$/);
        const voiceText = voiceMatch ? voiceMatch[1] : '语音';
        content = `[语音:${voiceText}]`;
    } else if (msg.type === 'sticker') {
        content = `[发送了表情: ${msg.desc || '图片'}]`;
    } else if (msg.type === 'inner_voice') {
    content = `[内心独白: ${msg.content}]`;
}

// ★★★ 小鱼新增：将引用信息加入AI上下文 ★★★
if (msg.quote) {
    content = `[引用了 ${msg.quote.senderName} 的消息: "${msg.quote.content}"]\n` + content;
}

// 添加最终消息
apiMessages.push({ 
    role: msg.role, 
    content: prefix + sourceLabel + " " + content 
});
}

// ★★★ 核心新增：在消息列表末尾追加时间感知信息 ★★★
if (contact.timeAwareness !== false) {
    const now = new Date();
    const nowStr = now.toLocaleString('zh-CN', { hour12: false });

    // ===== 新增：星期几 =====
    const weekdayMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekdayStr = weekdayMap[now.getDay()];

    let lunarStr = "";
    let festivalList = [];

    try {
        // ===== 1. 农历信息 + 农历节日 =====
        if (typeof Lunar !== 'undefined') {
            const lunar = Lunar.fromDate(now);
            lunarStr = ` (农历:${lunar.getMonthInChinese()}月${lunar.getDayInChinese()})`;

            const lunarFestivals = lunar.getFestivals ? (lunar.getFestivals() || []) : [];
            if (lunarFestivals.length > 0) {
                festivalList.push(...lunarFestivals);
            }

            // 如果 Lunar 库支持节气，也一起带上
            if (lunar.getJieQi) {
                const jieQi = lunar.getJieQi();
                if (jieQi) {
                    festivalList.push(jieQi);
                }
            }
        }

        // ===== 2. 公历节日（重点：补上愚人节） =====
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const solarKey = `${month}-${day}`;

        const solarFestivalMap = {
            '1-1': '元旦',
            '2-14': '情人节',
            '3-8': '妇女节',
            '3-12': '植树节',
            '4-1': '愚人节',
            '5-1': '劳动节',
            '5-4': '青年节',
            '6-1': '儿童节',
            '7-1': '建党节',
            '8-1': '建军节',
            '9-10': '教师节',
            '10-1': '国庆节',
            '10-31': '万圣节',
            '12-24': '平安夜',
            '12-25': '圣诞节'
        };

        if (solarFestivalMap[solarKey]) {
            festivalList.push(solarFestivalMap[solarKey]);
        }

        // 去重，防止重复显示
        festivalList = [...new Set(festivalList)];

    } catch (e) {
        console.warn("节日/农历计算失败，已忽略", e);
    }

    let festivalStr = "";
    if (festivalList.length > 0) {
        festivalStr = ` [节日:${festivalList.join('、')}]`;
    }

    let timeDiffDesc = "这是你们的第一条消息。";

    // ★★★ 核心修改：从后往前查找最后一条用户消息 ★★★
    let lastUserMsg = null;
    for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        // 跳过隐藏消息和系统消息
        if (msg.isHidden || msg.type === 'system_separator') continue;
        // 找到第一条用户消息就停止
        if (msg.role === 'user') {
            lastUserMsg = msg;
            break;
        }
    }

    if (lastUserMsg) {
        const diffMs = now.getTime() - lastUserMsg.timestamp;
        const diffMins = Math.floor(diffMs / 60000);
        let durationStr = "";
        
        if (diffMins < 1) durationStr = "不到1分钟";
        else if (diffMins < 60) durationStr = `${diffMins}分钟`;
        else if (diffMins < 1440) durationStr = `${Math.floor(diffMins / 60)}小时`;
        else durationStr = `${Math.floor(diffMins / 1440)}天`;

        // 判断是线下还是线上场景
        if (lastUserMsg.source === 'offline') {
            timeDiffDesc = `距离用户上次线下见面发言，已经过去了 ${durationStr}。`;
        } else {
            if (diffMins < 1) {
                timeDiffDesc = "用户刚刚发来消息（不到1分钟）。";
            } else if (diffMins < 5) {
                timeDiffDesc = `用户 ${durationStr} 前发来消息，请及时回复。`;
            } else if (diffMins < 60) {
                timeDiffDesc = `距离用户上次发言已过去 ${durationStr}，对方可能在等待回复。`;
            } else if (diffMins < 1440) {
                timeDiffDesc = `用户已经 ${durationStr} 没有说话了。`;
            } else {
                timeDiffDesc = `用户已经 ${durationStr} 没有联系你了，可能需要主动关心。`;
            }
        }
    }
    
    // 构建时间提示消息（作为最后一条"系统消息"）
    const timeHint = `[系统提示] 当前时间: ${nowStr}，${weekdayStr}${lunarStr}${festivalStr}。${timeDiffDesc} 请根据此时间、星期、节日氛围调整作息状态和对话内容；如果今天是特殊节日，请自然体现对应的节日氛围。`;
    
    apiMessages.push({
        role: 'system',
        content: timeHint
    });
}

return { apiMessages, availableStickers, contact };
}

// [FunctionDeclaration] Function: getAIResponse
async function getAIResponse(chatId) {
    const requestSessionToken = activeChatSessionToken;
    const originalChatTitle = chatTitle.textContent;

    // ★★★ 小鱼新增：统一判断“当前是不是还在这个聊天会话里” ★★★
    const canUpdateCurrentUI = () => {
        return currentChatId === chatId &&
               activeChatSessionToken === requestSessionToken &&
               document.getElementById('chatRoomPage').style.display !== 'none';
    };

    try {
        // ★★★ 新增：开始前先清一次旧闪烁，避免残留 ★★★
        if (canUpdateCurrentUI()) {
            chatTitle.classList.remove('typing-blink-effect');
            chatTitle.textContent = originalChatTitle;
        }

        // 1. 获取聊天记录
        const key = 'chat_messages_' + chatId;
        let messages = await getData(key) || [];
        
        // --- 阶段 A: 智能识图预处理 (批量检查) ---
        const mainConfig = await getApiConfigForWechat('wechat');
        const imgConfig = await getApiConfigForWechat('imageRecognition');
        
        if (JSON.stringify(mainConfig) !== JSON.stringify(imgConfig)) {
            let pendingImages = [];
            
            for (let i = messages.length - 1; i >= 0; i--) {
                const msg = messages[i];
                if (msg.role === 'assistant' && !msg.isHidden) break;
                
                if (msg.role === 'user' &&
                    msg.type === 'sticker' &&
                    msg.content.startsWith('data:image') &&
                    !msg.ai_description) {
                    pendingImages.unshift({ index: i, msg: msg });
                }
            }
            
            if (pendingImages.length > 0) {
                console.log(`检测到 ${pendingImages.length} 张待识别图片...`);
                
                for (let k = 0; k < pendingImages.length; k++) {
                    const item = pendingImages[k];
                    
                    if (canUpdateCurrentUI()) {
                        chatTitle.textContent = `正在识别图片 (${k + 1}/${pendingImages.length})...`;
                        chatTitle.classList.add('typing-blink-effect');
                    }
                    
                    try {
                        const visionMessages = [
                            { role: "system", content: "你是一个视觉助手。请用简练的语言(50字以内)客观描述这张图片的内容，不要发散，不要带感情色彩。" },
                            { 
                                role: "user", 
                                content: [
                                    { type: "text", text: "请描述这张图片" },
                                    { type: "image_url", image_url: { url: item.msg.content } }
                                ]
                            }
                        ];
                        
                        const description = await callAIAPI(visionMessages, imgConfig);
                        console.log(`图片 ${k+1} 识别完成:`, description);
                        
                        messages[item.index].ai_description = description;
                        await saveData(key, messages);
                        
                        if (canUpdateCurrentUI()) {
                            const imgBubble = document.querySelector(`[data-timestamp="${item.msg.timestamp}"]`);
                            if (imgBubble) {
                                const backEl = imgBubble.querySelector('.img-back');
                                if (backEl) backEl.textContent = description;
                            }
                        }
                        
                    } catch (err) {
                        console.error(`图片 ${k+1} 识别失败:`, err);
                    }
                }
            }
        }

        // --- 阶段 B: 常规回复流程 ---
        messages = await getData(key) || [];
        const lastDbMsg = messages[messages.length - 1];
        
        const lastMsgNeedsBarrier = lastDbMsg && (
            (lastDbMsg.role === 'assistant' && !lastDbMsg.isHidden) ||
            (lastDbMsg.type === 'moment_hidden' && lastDbMsg.isHidden)
        );

        if (lastMsgNeedsBarrier) {
            const hiddenSeparator = {
                role: 'user',
                content: '（继续）',
                type: 'text',
                timestamp: Date.now(),
                isHidden: true
            };
            await saveMessage(chatId, hiddenSeparator);
            
            if (canUpdateCurrentUI()) {
                wxDrafts = [];
                wxCurrentDraftIdx = 0;
                await saveData('chat_drafts_' + chatId, null);
                const existingToolbar = document.querySelector('.wx-draft-toolbar');
                if (existingToolbar) existingToolbar.remove();
            }
        }

        const { apiMessages, availableStickers, contact } = await buildApiMessages(chatId);

        if (canUpdateCurrentUI()) {
            chatTitle.textContent = '对方正在输入...';
            chatTitle.classList.add('typing-blink-effect');
        }

        const wechatApiConfig = await getApiConfigForWechat('wechat');
        let response = await callAIAPI(apiMessages, wechatApiConfig);
        
        await handleAIResponsePayload(response, contact, availableStickers, chatId, requestSessionToken);
    
        const autoInterval = (await getData('autoSummary_' + chatId)) || 0;
        if (autoInterval > 0) {
            let currentCount = (await getData('chat_turn_count_' + chatId)) || 0;
            currentCount++;
            console.log(`当前对话轮数: ${currentCount}/${autoInterval}`);
            
            if (currentCount >= autoInterval) {
                if (currentChatId === chatId) {
                    await summarizeMemory(true);
                }
                currentCount = 0;
                await saveData('chat_turn_count_' + chatId, currentCount);
            } else {
('_turn_count_' + chatId, currentCount);
            }
        }
    
    } catch (error) {
        console.error('AI 回复失败:', error);
        const contacts = await getData('customContacts') || [];
        const contact = contacts.find(c => c.id === chatId);
        
        const errorMsg = {
            role: 'assistant',
            content: '抱歉，我现在无法回复，请稍后再试',
            timestamp: Date.now()
        };

            await saveMessage(chatId, errorMsg);

    if (canUpdateCurrentUI()) {
        appendMessageToUI(errorMsg, contact ? contact.avatar : '');
        // ★ 小鱼修复：即使 AI 报错，也要把重试/草稿箱工具栏挂上去
        renderDraftToolbar();
        scrollToBottom();
    }
} finally {
        // ★★★ 修改：只要还是当前聊天，就无条件清理闪烁 ★★★
        if (currentChatId === chatId) {
            chatTitle.textContent = originalChatTitle;
            chatTitle.classList.remove('typing-blink-effect');
        }
    }
}

// [FunctionDeclaration] Function: estimateTokens
function estimateTokens(text) {
    if (!text) return 0;
    // 粗略算法：汉字算 1.5-2 token，英文单词算 1.3 token
    // 这里使用更通用的估算：
    // 1. 计算中文字符数
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    // 2. 计算非中文字符数
    const otherChars = text.length - chineseChars;
    // 3. 估算公式: 汉字*2 + 其他*1 (稍微保守一点的估计，防止超限)
    return Math.ceil(chineseChars * 2 + otherChars * 1.1);
}

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('click', async (e) => {
    // 判断是否点击了"查看上下文"按钮（兼容静态和动态ID）
    const btn = e.target.closest('#viewContextBtn, #viewContextBtn_Dynamic');
    if (btn && currentChatId) {
        try {
            const { apiMessages } = await buildApiMessages(currentChatId);
            
            const editor = document.getElementById('ctxEditor');
            const totalCharsEl = document.getElementById('ctxTotalChars');
            const totalTokensEl = document.getElementById('ctxTotalTokens');
            
            // 1. 格式化 JSON 并填入编辑器
            const formattedJson = JSON.stringify(apiMessages, null, 2);
            editor.value = formattedJson;
            
            // 2. 更新统计
            updateCtxStats();
            
            // 3. 监听输入，实时更新统计
            editor.oninput = updateCtxStats;

            // 4. 显示弹窗
            document.getElementById('contextModal').style.display = 'flex';
            
        } catch (error) {
            customAlert('生成上下文失败: ' + error.message);
            console.error(error);
        }
    }
});

// [FunctionDeclaration] Function: updateCtxStats
function updateCtxStats() {
    const text = document.getElementById('ctxEditor').value;
    const totalChars = text.length;
    const totalTokens = estimateTokens(text);
    
    document.getElementById('ctxTotalChars').textContent = totalChars;
    document.getElementById('ctxTotalTokens').textContent = totalTokens + " Tokens";
}

// [ExpressionStatement] Execution: addEventListener
document.getElementById('forceSendContextBtn').addEventListener('click', async () => {
    if (!currentChatId) return;
    
    // 记录原始标题，用于 finally 恢复
    // 注意：这里要获取当前显示的标题（通常是对方名字），而不是 '对方正在输入...'
    // 如果当前已经是 '对方正在输入...'，尝试从 contact 获取，或者直接保留原逻辑
    const originalChatTitle = chatTitle.textContent === '对方正在输入...' ? '聊天中' : chatTitle.textContent;

    try {
        const editorContent = document.getElementById('ctxEditor').value;
        let customMessages;
        
        // 1. 尝试解析用户修改后的 JSON
        try {
            customMessages = JSON.parse(editorContent);
            if (!Array.isArray(customMessages)) throw new Error("必须是数组格式");
        } catch (e) {
            customAlert("JSON 格式错误，请检查语法！\n" + e.message);
            return;
        }
        
        // 2. 关闭弹窗
        document.getElementById('contextModal').style.display = 'none';
        
        // 3. 强制调用 API
        // ★★★ 核心修复：开启闪烁 ★★★
        chatTitle.textContent = '对方正在输入...';
        chatTitle.classList.add('typing-blink-effect'); // <--- 添加这行
        
        // 获取表情包列表 (为了解析回复)
        const contact = await getContactDetails(currentChatId);
        const { availableStickers } = await buildApiMessages(currentChatId); // 仅获取表情列表
        
        const wechatApiConfig = await getApiConfigForWechat();
        let response = await callAIAPI(customMessages, wechatApiConfig);
        
        // 4. 解析并显示回复
        await handleAIResponsePayload(response, contact, availableStickers, currentChatId, activeChatSessionToken);
        
    } catch (e) {
        console.error('强制发送失败:', e);
        customAlert('发送失败: ' + e.message);
    } finally {
        // ★★★ 核心修复：移除闪烁并恢复标题 ★★★
        // 如果 handleAIResponsePayload 成功执行，它会把标题改成 contact.nickname
        // 如果失败，我们需要手动恢复
        if (chatTitle.textContent === '对方正在输入...') {
            chatTitle.textContent = originalChatTitle;
        }
        chatTitle.classList.remove('typing-blink-effect'); // <--- 添加这行
    }
});

// [FunctionDeclaration] Function: handleAIResponsePayload
async function handleAIResponsePayload(response, contact, availableStickers, chatId, sessionToken = null) {
    let responseMsgs = [];
    try {
        let cleanStr = response.replace(/```json/g, '').replace(/```/g, '');
        const firstBracket = cleanStr.indexOf('[');
        const lastBracket = cleanStr.lastIndexOf(']');
        
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            cleanStr = cleanStr.substring(firstBracket, lastBracket + 1);
            responseMsgs = JSON.parse(cleanStr);
        } else {
            throw new Error("没有找到JSON数组括号");
        }
        if (!Array.isArray(responseMsgs)) throw new Error("解析结果不是数组");
    } catch (e) {
        console.warn("JSON解析失败，尝试降级处理:", e);
        let cleanText = response.replace(/\[(线上|线下)\]\s*/g, '').trim();
        const lines = cleanText.split(/\n+/).filter(line => line.trim());
        responseMsgs = lines.map(line => ({ type: 'text', content: line.trim() }));
    }

    const processedMsgs = [];
    const emojiRegex = /\[发送了表情:\s*([^\]]+)\]/g;
    responseMsgs.forEach(msg => {
        if (msg.type === 'text' && msg.content.includes('[发送了表情:')) {
            const parts = msg.content.split(emojiRegex);
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i].trim();
                if (!part) continue;
                if (i % 2 === 0) processedMsgs.push({ type: 'text', content: part });
                else processedMsgs.push({ type: 'face', content: part });
            }
        } else {
            processedMsgs.push(msg);
        }
    });

    const chatTitleEl = document.getElementById('chatTitle');
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // ★★★ 小鱼新增：判断是否允许渲染到“当前可见聊天界面” ★★★
    const canRenderToCurrentUI = () => {
        return currentChatId === chatId &&
               (sessionToken === null || activeChatSessionToken === sessionToken) &&
               document.getElementById('chatRoomPage').style.display !== 'none';
    };

    let memberAvatarMap = {};
    if (contact.isGroup) {
        const allContacts = await getData('customContacts') || [];
        const memberIds = contact.memberIds || [];
        const members = allContacts.filter(c => memberIds.includes(c.id));
        members.forEach(m => {
            memberAvatarMap[m.nickname] = m.avatar;
            if (m.realName) memberAvatarMap[m.realName] = m.avatar;
        });
    }

    let notificationMsgs = [];

    for (let i = 0; i < processedMsgs.length; i++) {
        let msgType = processedMsgs[i].type || 'text';
        let msgContent = processedMsgs[i].content;
        let senderName = processedMsgs[i].name;
        
        if (msgType !== 'moment_like' && (!msgContent || String(msgContent).trim() === '')) continue;

        if (canRenderToCurrentUI()) {
            chatTitleEl.textContent = '对方正在输入...';
            chatTitleEl.classList.add('typing-blink-effect');
        }
        
        await sleep(Math.random() * 700 + 800);

        let currentAvatar = contact.avatar;
        if (contact.isGroup && senderName) {
            currentAvatar = memberAvatarMap[senderName] || '';
        }

// --- 语音通话被拒绝 (支持多句) ---
if (msgType === 'call_reject') {
    // 仅在第一条拒绝消息时执行挂断UI操作
    if (typeof isCallActive !== 'undefined' && isCallActive) {
        if (typeof stopCallRing === 'function') stopCallRing(); // ★ 修复：AI拒接时立即停止铃声
        if (typeof callVibrateInterval !== 'undefined') clearInterval(callVibrateInterval);
        
        const callOverlay = document.getElementById('voiceCallOverlay');
        const floatingWindow = document.getElementById('floatingCallWindow');
        if (callOverlay) callOverlay.style.display = 'none';
        if (floatingWindow) floatingWindow.style.display = 'none'; // ★ 拒接时隐藏小窗
        isCallActive = false;
        
        const recordMsg = {
            role: 'user',
            type: 'text',
            content: '对方已拒绝 ᯅ',
            timestamp: Date.now() - 1
        };
        await saveMessage(chatId, recordMsg);
        if (canRenderToCurrentUI()) {
            appendMessageToUI(recordMsg, currentAvatar, contact.isGroup);
        }
    }
    // 将所有拒接消息转换为普通文本，发送到聊天界面
    msgType = 'text';
}

// --- 语音通话被接通 (支持多句轮播及记录保存) ---
if (msgType === 'call_accept') {
    if (typeof isCallActive !== 'undefined' && isCallActive) {
        // 仅在第一条接通消息时初始化计时器
        if (typeof callStartTime !== 'undefined' && callStartTime === 0) {
            if (typeof stopCallRing === 'function') stopCallRing(); // ★ 修复：AI接通时立即停止铃声
            if (typeof callVibrateInterval !== 'undefined') clearInterval(callVibrateInterval);
            
            const statusEl = document.getElementById('callStatus');
            const hangupSpan = document.querySelector('#callHangupBtn span');
            const floatingTimeEl = document.getElementById('floatingCallTime'); // ★ 获取小窗时间元素
            
            if (statusEl) statusEl.textContent = '00:00';
            if (floatingTimeEl) floatingTimeEl.textContent = '00:00';
            if (hangupSpan) hangupSpan.textContent = '挂断';
            
            callStartTime = Date.now();
            callTimerInterval = setInterval(() => {
                const duration = Math.floor((Date.now() - callStartTime) / 1000);
                const m = String(Math.floor(duration / 60)).padStart(2, '0');
                const s = String(duration % 60).padStart(2, '0');
                if (statusEl) statusEl.textContent = `${m}:${s}`;
                if (floatingTimeEl) floatingTimeEl.textContent = `${m}:${s}`; // ★ 同步更新小窗时间
            }, 1000);
        }
        
        // 逐句更新字幕
        const subtitleEl = document.getElementById('callSubtitle');
        if (subtitleEl) {
            subtitleEl.style.display = 'block';
            subtitleEl.textContent = msgContent;
            subtitleEl.style.color = 'white';
        }
        
        // ★ 新增：将 AI 的话存入通话记录面板
        if (typeof currentCallHistory !== 'undefined') {
            currentCallHistory.push({
                role: 'ai',
                name: contact.realName || contact.nickname,
                content: msgContent
            });
            if (typeof renderCallHistory === 'function') renderCallHistory();
        }
    }
    continue; // 接通的话语只显示在字幕，不发到聊天界面
}

        // --- 朋友圈发帖 ---
        if (msgType === 'moment') {
    let moments = await getData('moments_posts') || [];
    const newMomentId = Date.now();

    // 计算发帖人ID
    let posterId = contact.id;
    if (contact.isGroup && senderName) {
        const allContacts = await getData('customContacts') || [];
        const member = allContacts.find(c => c.nickname === senderName || c.realName === senderName);
        if (member) {
            posterId = member.id;
        }
    }

    const newMoment = {
        id: newMomentId,
        authorId: posterId, // ★ 核心新增：记录发帖人ID
        authorName: senderName || contact.nickname,
        authorAvatar: currentAvatar || 'https://iili.io/fkc3RwJ.jpg',
        content: msgContent,
        timestamp: newMomentId
    };

    moments.unshift(newMoment);
    await saveData('moments_posts', moments);

    // ★ 核心新增：把这条朋友圈分发给“同标签组”的其他角色，并附加关系提示
    const targetContacts = await getSameTagVisibleCharacters(posterId);

    for (const viewer of targetContacts) {
        const relationPrompt = await getMomentRelationPrompt(viewer.id, posterId);

        let momentTextDesc = `[系统提示：${newMoment.authorName} 刚发了一条朋友圈（帖子ID: ${newMoment.id}）`;
        if (msgContent) {
            momentTextDesc += `，内容是："${msgContent}"`;
        }
        momentTextDesc += `。你已经在朋友圈看到了这条动态。`;

if (relationPrompt) {
    momentTextDesc += ` 补充背景：${relationPrompt}`;
}

        momentTextDesc += ` 你可以选择点赞或评论这条朋友圈。如果你和发帖人关系亲近，可以更自然、更主动；如果关系疏远或复杂，也请按人设克制回应。切勿把这条背景信息当作对方直接给你发来的私聊消息。]`;

        const chatKey = 'chat_messages_' + viewer.id;
        let chatMsgs = await getData(chatKey) || [];

        chatMsgs.push({
            role: 'user',
            type: 'moment_hidden',
            content: momentTextDesc,
            momentId: newMoment.id,
            timestamp: newMoment.id,
            isHidden: true,
            source: 'online'
        });

        await saveData(chatKey, chatMsgs);
    }

    continue;
}

        // --- 朋友圈点赞 ---
if (msgType === 'moment_like') {
    const postId = processedMsgs[i].postId;
    if (!postId) continue;
    
    let moments = await getData('moments_posts') || [];
    const postIndex = moments.findIndex(p => String(p.id) === String(postId));
    
    if (postIndex !== -1) {
        const post = moments[postIndex];
        post.likes = post.likes || [];
        const aiName = senderName || contact.nickname;
        if (!post.likes.includes(aiName)) {
            post.likes.push(aiName);
            await saveData('moments_posts', moments);
            
            // ★ 新增：将点赞动作写入未读消息池
            await addMomentUnreadMsg({
                type: 'like',
                postId: postId,
                authorName: aiName,
                authorAvatar: currentAvatar || 'https://iili.io/fkc3RwJ.jpg',
                timestamp: Date.now()
            });

            if (document.getElementById('momentsPage').style.display !== 'none') {
                await renderMomentsFeed();
            }
        }
    }
    continue;
}

// --- 朋友圈评论 ---
if (msgType === 'moment_comment') {
    const postId = processedMsgs[i].postId;
    const commentContent = processedMsgs[i].content;
    if (!postId || !commentContent) continue;
    
    let moments = await getData('moments_posts') || [];
    const postIndex = moments.findIndex(p => String(p.id) === String(postId));
    
    if (postIndex !== -1) {
        const post = moments[postIndex];
        post.comments = post.comments || [];
        const aiName = senderName || contact.nickname;
        
        post.comments.push({
            id: Date.now(),
            authorName: aiName,
            authorAvatar: currentAvatar || 'https://iili.io/fkc3RwJ.jpg',
            content: commentContent,
            timestamp: Date.now()
        });
        
        await saveData('moments_posts', moments);
        
        // ★ 新增：将评论动作写入未读消息池
        await addMomentUnreadMsg({
            type: 'comment',
            postId: postId,
            authorName: aiName,
            authorAvatar: currentAvatar || 'https://iili.io/fkc3RwJ.jpg',
            content: commentContent,
            timestamp: Date.now()
        });

        if (document.getElementById('momentsPage').style.display !== 'none') {
            await renderMomentsFeed();
        }
    }
    continue;
}

        // --- 图片描述 ---
        if (msgType === 'img_desc') {
            const key = 'chat_messages_' + chatId;
            let allMsgs = await getData(key) || [];
            let savedDesc = false;

            for (let k = allMsgs.length - 1; k >= 0; k--) {
                if (allMsgs[k].role === 'user' &&
                    allMsgs[k].type === 'sticker' &&
                    typeof allMsgs[k].content === 'string' &&
                    allMsgs[k].content.startsWith('data:image')) {
                    allMsgs[k].ai_description = msgContent;
                    await saveData(key, allMsgs);

                    if (canRenderToCurrentUI()) {
                        const imgBubble = document.querySelector(`[data-timestamp="${allMsgs[k].timestamp}"]`);
                        if (imgBubble) {
                            const backEl = imgBubble.querySelector('.img-back');
                            if (backEl) backEl.textContent = msgContent;
                        }
                    }
                    savedDesc = true;
                    break;
                }

                if (allMsgs[k].type === 'moment_hidden' && Array.isArray(allMsgs[k].content)) {
                    if (!allMsgs[k].imageDescriptions) {
                        allMsgs[k].imageDescriptions = [];
                    }
                    const imgCount = allMsgs[k].content.filter(p => p.type === 'image_url').length;
                    if (allMsgs[k].imageDescriptions.length < imgCount) {
                        allMsgs[k].imageDescriptions.push(msgContent);
                        await saveData(key, allMsgs);
                    }
                    savedDesc = true;
                    break;
                }
            }
            continue;
        }

        // --- AI主动发起转账 ---
        if (msgType === 'transfer_send') {
            const amount = parseFloat(processedMsgs[i].amount || 0).toFixed(2);
            const note = processedMsgs[i].content || '转账给您';
            
            const aiMsg = {
                role: 'assistant',
                type: 'transfer',
                amount: amount,
                transferNote: note,
                content: `[转账] ¥${amount} (说明: ${note})`,
                transferStatus: 'pending',
                timestamp: Date.now(),
                senderName: senderName
            };

            await saveMessage(chatId, aiMsg);
            if (canRenderToCurrentUI()) {
                appendMessageToUI(aiMsg, currentAvatar, contact.isGroup);
                scrollToBottom();
            }
            notificationMsgs.push('[转账]');
            continue;
        }

        // --- AI接收/退回转账 ---
        if (msgType === 'transfer_accept' || msgType === 'transfer_return') {
            const key = 'chat_messages_' + chatId;
            let allMsgs = await getData(key) || [];
            
            let targetMsgIndex = -1;
            for (let k = allMsgs.length - 1; k >= 0; k--) {
                if (allMsgs[k].role === 'user' && allMsgs[k].type === 'transfer' && !allMsgs[k].transferStatus) {
                    if (contact.isGroup) {
                        if (allMsgs[k].targetName === senderName) {
                            targetMsgIndex = k;
                            break;
                        }
                    } else {
                        targetMsgIndex = k;
                        break;
                    }
                }
            }

            if (targetMsgIndex !== -1) {
                const targetMsg = allMsgs[targetMsgIndex];
                const isAccept = msgType === 'transfer_accept';
                
                targetMsg.transferStatus = isAccept ? 'accepted' : 'returned';
                await saveData(key, allMsgs);

                if (canRenderToCurrentUI()) {
                    const userBubble = document.querySelector(`[data-timestamp="${targetMsg.timestamp}"]`);
                    if (userBubble) {
                        const descEl = userBubble.querySelector('.transfer-desc');
                        if (descEl) descEl.textContent = isAccept ? '已被接收' : '已被退还';
                        
                        const iconContainer = userBubble.querySelector('.transfer-icon-circle');
                        if (iconContainer) {
                            iconContainer.innerHTML = isAccept
                                ? `<svg width="42" height="42" viewBox="0 0 42 42" fill="none"><circle cx="21" cy="21" r="19" stroke="white" stroke-width="2.5"/><polyline points="12 21 18 27 30 15" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                                : `<svg width="42" height="42" viewBox="0 0 42 42" fill="none"><circle cx="21" cy="21" r="19" stroke="white" stroke-width="2.5"/><path d="M24 28 A 5 5 0 0 0 24 18 L 13 18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 14 L 13 18 L 17 22" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
                        }
                        
                        const contentDiv = userBubble.querySelector('.msg-content');
                        if (contentDiv) {
                            contentDiv.classList.add('transfer-processed');
                        }
                    }
                }

                const aiMsg = {
                    role: 'assistant',
                    type: 'transfer',
                    amount: targetMsg.amount,
                    transferStatus: isAccept ? 'accepted' : 'returned',
                    content: isAccept ? `[已收款 ¥${targetMsg.amount}]` : `[已退还 ¥${targetMsg.amount}]`,
                    isReceipt: true,
                    timestamp: Date.now(),
                    senderName: senderName
                };

                await saveMessage(chatId, aiMsg);
                if (canRenderToCurrentUI()) {
                    appendMessageToUI(aiMsg, currentAvatar, contact.isGroup);
                    scrollToBottom();
                }
            }

            notificationMsgs.push(msgType === 'transfer_accept' ? '[已收款]' : '[已退还]');
            continue;
        }

        // --- 拍一拍 ---
        if (msgType === 'pat') {
            let suffix = msgContent.replace(/^拍了拍/, '').trim();
            let patText = `"${senderName || contact.nickname}" 拍了拍我${suffix}`;
            const aiMsg = {
                role: 'assistant',
                type: 'pat',
                content: patText,
                timestamp: Date.now(),
                senderName: senderName
            };

            await saveMessage(chatId, aiMsg);
            if (canRenderToCurrentUI()) {
                appendMessageToUI(aiMsg, currentAvatar, contact.isGroup);
                scrollToBottom();
                if (navigator.vibrate) navigator.vibrate(50);
            }
            notificationMsgs.push('[拍一拍]');
        }
        // --- 虚拟图片 ---
        else if (msgType === 'virtual_image') {
            const base64Img = getVirtualImageBase64();
            const aiMsg = {
                role: 'assistant',
                type: 'sticker',
                content: base64Img,
                ai_description: msgContent,
                desc: 'AI图片',
                timestamp: Date.now(),
                senderName: senderName
            };

            await saveMessage(chatId, aiMsg);
            if (canRenderToCurrentUI()) {
                appendMessageToUI(aiMsg, currentAvatar, contact.isGroup);
                scrollToBottom();
            }
            notificationMsgs.push('[图片]');
        }
        // --- 语音 ---
        else if (msgType === 'voice') {
            const voicePattern = /^\(([^)]+)\)(.+)$/;
            const match = msgContent.match(voicePattern);
            let actualText = msgContent;
            if (match) {
                actualText = match[2].trim();
            }
            let duration = Math.ceil(actualText.length / 3);
            if (duration < 1) duration = 1;
            if (duration > 60) duration = 60;

            const voiceContent = `[VOICE:${duration}:${actualText}]`;
            const aiMsg = {
                role: 'assistant',
                type: 'text',
                content: voiceContent,
                timestamp: Date.now(),
                senderName: senderName
            };

            if (canRenderToCurrentUI()) {
                chatTitleEl.textContent = '对方正在录音...';
                chatTitleEl.classList.add('typing-blink-effect');
            }
            await sleep(Math.min(duration * 300, 2000));

            await saveMessage(chatId, aiMsg);
            if (canRenderToCurrentUI()) {
                appendMessageToUI(aiMsg, currentAvatar, contact.isGroup);
                chatTitleEl.textContent = contact.nickname;
                chatTitleEl.classList.remove('typing-blink-effect');
                scrollToBottom();
            }
            notificationMsgs.push('[语音]');
        }
// --- 表情 ---
else if (msgType === 'face') {
    // 小鱼修复：支持同名表情随机抽取，不再永远使用第一个
    const matchedStickers = availableStickers.filter(s => s.name === msgContent);
    
    let finalType = 'text';
    let finalContent = `[${msgContent}]`;

    if (matchedStickers.length > 0) {
        // 如果有多个同名表情，随机选一个
        const randomIndex = Math.floor(Math.random() * matchedStickers.length);
        const sticker = matchedStickers[randomIndex];

        finalType = 'sticker';
        finalContent = sticker.url;
    }

    const aiMsg = {
        role: 'assistant',
        type: finalType,
        content: finalContent,
        desc: finalType === 'sticker' ? msgContent : '',
        timestamp: Date.now(),
        senderName: senderName
    };

    await saveMessage(chatId, aiMsg);
    if (canRenderToCurrentUI()) {
        appendMessageToUI(aiMsg, currentAvatar, contact.isGroup);
        scrollToBottom();
    }
    notificationMsgs.push('[表情]');
}

// ★★★ 小鱼新增：引用回复处理 ★★★
else if (msgType === 'quote') {
    const quoteSender = processedMsgs[i].quoteSender || '对方';
    const quoteContent = processedMsgs[i].quoteContent || '';
    const replyContent = msgContent || '';
    
    if (!replyContent) continue; // 如果没有回复内容就跳过
    
    const aiMsg = {
        role: 'assistant',
        type: 'text',
        content: replyContent,
        quote: {
            senderName: quoteSender,
            content: quoteContent
        },
        timestamp: Date.now(),
        senderName: senderName
    };
    
    appendMessageToUI(aiMsg, currentAvatar, contact.isGroup);
    await saveMessage(chatId, aiMsg);
    scrollToBottom();
    
    notificationMsgs.push(`[引用] ${replyContent}`);
}

        // --- 文本 ---
        else if (msgType === 'text') {
            const sentences = msgContent.match(/[^。！？\.\!\?]+[。！？\.\!\?]*/g) || [msgContent];
            for (let j = 0; j < sentences.length; j++) {
                const sentence = sentences[j].trim();
                if (!sentence) continue;
                
                notificationMsgs.push(sentence);
                
                if (j > 0) {
                    if (canRenderToCurrentUI()) {
                        chatTitleEl.textContent = '对方正在输入...';
                        chatTitleEl.classList.add('typing-blink-effect');
                    }
                    await sleep(Math.random() * 500 + 500);
                }

                const aiMsg = {
                    role: 'assistant',
                    type: 'text',
                    content: sentence,
                    timestamp: Date.now(),
                    senderName: senderName
                };

                await saveMessage(chatId, aiMsg);
                if (canRenderToCurrentUI()) {
                    appendMessageToUI(aiMsg, currentAvatar, contact.isGroup);
                    chatTitleEl.textContent = contact.nickname;
                    chatTitleEl.classList.remove('typing-blink-effect');
                    scrollToBottom();
                }
            }
        }
        // --- 其他类型 ---
        else {
            const aiMsg = {
                role: 'assistant',
                type: msgType,
                content: msgContent.trim(),
                timestamp: Date.now(),
                senderName: senderName
            };

            await saveMessage(chatId, aiMsg);
            if (canRenderToCurrentUI()) {
                appendMessageToUI(aiMsg, currentAvatar, contact.isGroup);
                scrollToBottom();
            }
            notificationMsgs.push(msgContent.trim());
        }

        if (canRenderToCurrentUI()) {
            chatTitleEl.textContent = contact.nickname;
            chatTitleEl.classList.remove('typing-blink-effect');
        }

        if (i < processedMsgs.length - 1) {
            await sleep(Math.random() * 400 + 200);
        }
    }

    // 只有当前还在这个聊天时，才操作当前草稿工具栏
    if (canRenderToCurrentUI()) {
        renderDraftToolbar();
    }

    if (processedMsgs.length > 0) {
        const lastMsg = processedMsgs[processedMsgs.length - 1];
        let previewText = '';
        if (lastMsg.type === 'face' || lastMsg.type === 'sticker') previewText = '[表情]';
        else if (lastMsg.type === 'pat') previewText = '[拍了拍你]';
        else previewText = lastMsg.content || '';
        await updateChatList(chatId, previewText, Date.now());
    }

    const chatRoomPage = document.getElementById('chatRoomPage');
    const isNotInCurrentChat = (chatRoomPage.style.display === 'none') || (currentChatId !== chatId);

    if (isNotInCurrentChat && notificationMsgs.length > 0) {
        showHeadsUpNotification(chatId, contact.nickname, notificationMsgs, contact.avatar);
    }
}

// [FunctionDeclaration] Function: saveMessage
async function saveMessage(chatId, msg) {
    const key = 'chat_messages_' + chatId;
    const messages = await getData(key) || [];
    messages.push(msg);
    await saveData(key, messages);
}

// [FunctionDeclaration] Function: updateChatList
async function updateChatList(chatId, lastContent, time) {
    const key = 'chat_messages_' + chatId;
    const messages = await getData(key) || [];
    
    // 找到最后一条可见消息
    const lastVisibleMsg = [...messages].reverse().find(m => !m.isHidden && m.type !== 'system_separator');

    let previewContent = '';
    let previewTime = time;

    if (lastVisibleMsg) {
        // 1. 语音消息
        const voiceMatch = (typeof lastVisibleMsg.content === 'string') 
            ? lastVisibleMsg.content.match(/^\[VOICE:(\d+):(.+)\]$/) 
            : null;
        
        if (voiceMatch) {
            const duration = voiceMatch[1];
            previewContent = `[语音]`; // 微信列表通常只显示[语音]，不显示秒数，保持简洁
        } 
        // 2. 图片/表情消息 (核心修改部分)
        else if (lastVisibleMsg.type === 'sticker') {
            // ★★★ 核心修复：通过内容是否以 data:image 开头来区分是【图片】还是【表情】
            if (lastVisibleMsg.content && lastVisibleMsg.content.startsWith('data:image')) {
                previewContent = '[图片]';
            } else {
                const descText = lastVisibleMsg.desc || '表情';
                previewContent = `[动画表情]${descText !== '表情' ? ' ' + descText : ''}`;
            }
        } 
        // 3. 拍一拍
        else if (lastVisibleMsg.type === 'pat') {
            previewContent = lastVisibleMsg.content;
        } 
        // 4. 普通文本
        else {
            previewContent = lastVisibleMsg.content;
        }
        
        previewTime = lastVisibleMsg.timestamp;
    } else {
        // 如果没有可见消息，使用传入的 lastContent (通常用于刚创建会话或刚清空时)
        previewContent = lastContent;
    }

    let sessions = await getData('chat_sessions') || [];
    // 先移除旧的会话条目
    sessions = sessions.filter(s => s.id !== chatId);
    
    const contacts = await getData('customContacts') || [];
    const contact = contacts.find(c => c.id === chatId);
    
    if (contact) {
        // 重新插入更新后的条目
        sessions.unshift({
            id: chatId,
            name: contact.nickname,
            avatar: contact.avatar,
            content: previewContent,
            time: previewTime,
            isTop: sessions.find(s => s.id === chatId)?.isTop || false // 保持置顶状态
        });
        
        // 重新排序：置顶的在通过时间排序
        sessions.sort((a, b) => {
            if (a.isTop !== b.isTop) return (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0);
            return b.time - a.time;
        });

        await saveData('chat_sessions', sessions);
        renderChatList();
    }
}

// [FunctionDeclaration] Function: getAvatarDom
async function getAvatarDom(contact, allContacts) {
    const DEFAULT_IMG = 'https://iili.io/fkc3RwJ.jpg';

    // 1. 如果是单人
    if (!contact.isGroup) {
        // ★★★ 修改：使用默认图片 ★★★
        const url = contact.avatar || DEFAULT_IMG;
        return `<div class="avatar" style="background-image: url(${url}); background-size: cover; display: flex; align-items: center; justify-content: center; color: white;"></div>`;
    }

    // 2. 如果是群聊，生成九宫格
    const memberIds = contact.memberIds || [];
    
    const memberPromises = memberIds.map(async id => {
        if (id === 'user_self') {
            const userAvatar = await getData('avatar');
            const userName = await getData('userName') || '我';
            // ★★★ 修改：如果是自己且没头像，也用默认图 ★★★
            return {
                id: 'user_self',
                avatar: userAvatar || DEFAULT_IMG,
                nickname: userName
            };
        } else {
            const m = allContacts.find(c => c.id === id);
            if (m) {
                // ★★★ 修改：如果是成员且没头像，用默认图 ★★★
                return { ...m, avatar: m.avatar || DEFAULT_IMG };
            }
            return null;
        }
    });
    
    const members = (await Promise.all(memberPromises)).filter(Boolean);
    
    if (members.length === 0) {
         return `<div class="avatar" style="background-color: #ccc; display: flex; align-items: center; justify-content: center; color: white;">群</div>`;
    }

    const showMembers = members.slice(0, 9);
    const count = showMembers.length;
    let gridClass = count <= 4 ? 'mode-2' : 'mode-3';
    
    let html = `<div class="wechat-group-avatar ${gridClass}">`;
    showMembers.forEach(m => {
        // 这里的 m.avatar 已经在上面处理过默认值了
        html += `<div style="background-image: url(${m.avatar});"></div>`;
    });
    html += `</div>`;
    
    return html;
}

// [FunctionDeclaration] Function: renderChatList
async function renderChatList() {
    const sessions = await getData('chat_sessions') || [];
    const allContacts = await getData('customContacts') || [];
    chatListContainer.innerHTML = '';
    
    if (sessions.length === 0) {
        chatListContainer.innerHTML = '<div style="text-align: center; margin-top: 100px; color: #999; font-size: 14px;">暂无消息<br>点击右上角 + 号开始聊天</div>';
        return;
    }

    const updatedSessions = sessions.map(session => {
        const contact = allContacts.find(c => c.id === session.id);
        const name = contact ? contact.nickname : session.name;
        return { ...session, name, contactObj: contact };
    });
    
    // ★ 改用 for...of 以支持 await
    for (const session of updatedSessions) {
        const date = new Date(session.time);
        const timeStr = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        const div = document.createElement('div');
        div.className = 'chat-item';
        if (session.isTop) div.style.backgroundColor = '#F7F7F7';
        
        const contactForAvatar = session.contactObj || { isGroup: false, avatar: session.avatar, nickname: session.name };
        const avatarHtml = await getAvatarDom(contactForAvatar, allContacts); // ★ 加上 await

        div.innerHTML = `
            ${avatarHtml}
            <div class="chat-info">
                <div class="chat-header">
                    <span class="chat-name">${session.name}</span>
                    <span class="chat-time">${timeStr}</span>
                </div>
                <div class="chat-preview">${session.content}</div>
            </div>
        `;
        
        div.onclick = async () => {
            startChat(session.id);
        };
        
        chatListContainer.appendChild(div);
    }
}

// [ExpressionStatement] Execution: addEventListener
chatInput.addEventListener('input', () => {
    checkSendBtnVisibility();
});

// [FunctionDeclaration] Function: checkSendBtnVisibility
function checkSendBtnVisibility() {
    const hasInput = chatInput.value.trim().length > 0;
    const hasQueue = typeof splitMsgQueue !== 'undefined' && splitMsgQueue.length > 0;
    
    const plusBtn = document.getElementById('chatRefreshBtn');
    const sendBtn = document.getElementById('chatSendBtn');

    if (hasInput || hasQueue) {
        // 有字时：隐藏+号，显示发送
        plusBtn.style.display = 'none';
        sendBtn.style.display = 'block';
        sendBtn.classList.add('visible'); // 保持原有样式逻辑
    } else {
        // 无字时：显示+号，隐藏发送
        plusBtn.style.display = 'block';
        sendBtn.style.display = 'none';
        sendBtn.classList.remove('visible');
    }
}

// [ExpressionStatement] Execution: Expression
window.renderSplitQueue = function() {
  if (splitMsgQueue.length > 0) {
    splitMsgPreview.style.display = 'flex';
    splitMsgPreview.innerHTML = splitMsgQueue.map((msg, index) => {
      // ★ 判断是否为图片数据
      let displayText = msg;
      if (typeof msg === 'string' && msg.startsWith('data:image')) {
          displayText = '[图片]';
      }
      // ★ 判断是否为表情占位符
      else if (typeof msg === 'string' && msg.startsWith('[表情：')) {
          // 保持原样显示 [表情：开心]
      }
      
      return `
      <div class="split-msg-bubble" onclick="removeSplitMsg(${index})">
        ${displayText} <span style="opacity:0.6; margin-left:4px;">×</span>
      </div>
    `}).join('');
  } else {
    splitMsgPreview.style.display = 'none';
  }
  // 每次队列变动，都检查按钮状态
  checkSendBtnVisibility();
}

// [ExpressionStatement] Execution: addEventListener
document.getElementById('menuOverlay').addEventListener('click', handleOutsideClick);

// [ExpressionStatement] Execution: addEventListener
document.getElementById('chatMessagesContainer').addEventListener('scroll', handleOutsideClick);

// [VariableDeclaration] Variables: aiReplyMode
let aiReplyMode = localStorage.getItem('wechat_ai_reply_mode') || 'normal';

// [VariableDeclaration] Variables: splitMsgQueue
let splitMsgQueue = [];

// [VariableDeclaration] Variables: aiBtnLongPressTimer
let aiBtnLongPressTimer;

// [VariableDeclaration] Variables: isLongPressTriggered
let isLongPressTriggered = false;

// [VariableDeclaration] Variables: aiModeMenu
const aiModeMenu = document.getElementById('aiModeMenu');

// [VariableDeclaration] Variables: iconMagic
const iconMagic = document.getElementById('iconMagic');

// [VariableDeclaration] Variables: iconSplit
const iconSplit = document.getElementById('iconSplit');

// [VariableDeclaration] Variables: splitMsgPreview
const splitMsgPreview = document.getElementById('splitMsgPreview');

// [ExpressionStatement] Execution: addEventListener
chatAiBtn.addEventListener('touchstart', (e) => {
  isLongPressTriggered = false; // 重置标记
  aiBtnLongPressTimer = setTimeout(() => {
    isLongPressTriggered = true; // ★ 标记为已触发长按
    showAiModeMenu();
    navigator.vibrate && navigator.vibrate(50); // 震动反馈
  }, 500);
}, { passive: true });

// [ExpressionStatement] Execution: addEventListener
chatAiBtn.addEventListener('touchend', () => {
  clearTimeout(aiBtnLongPressTimer);
});

// [ExpressionStatement] Execution: addEventListener
chatAiBtn.addEventListener('touchmove', () => {
  clearTimeout(aiBtnLongPressTimer);
  isLongPressTriggered = false; // 滑动时也重置标记
});

// [FunctionDeclaration] Function: showAiModeMenu
function showAiModeMenu() {
  aiModeMenu.style.display = 'flex';
  // 更新选中状态
  document.querySelectorAll('.ai-mode-item').forEach(item => {
    item.classList.toggle('active', item.dataset.mode === aiReplyMode);
  });
}

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('click', (e) => {
  if (!e.target.closest('#chatAiBtn') && !e.target.closest('#aiModeMenu')) {
    aiModeMenu.style.display = 'none';
  }
});

// [ExpressionStatement] Execution: forEach
document.querySelectorAll('.ai-mode-item').forEach(item => {
  item.addEventListener('click', () => {
    isLongPressTriggered = false; // 防止选择模式后立即触发点击
  });
});

// [ExpressionStatement] Execution: forEach
document.querySelectorAll('.ai-mode-item').forEach(item => {
  item.addEventListener('click', () => {
    aiReplyMode = item.dataset.mode;
    
    // ★★★ 新增：保存设置到本地存储 ★★★
    localStorage.setItem('wechat_ai_reply_mode', aiReplyMode);

    aiModeMenu.style.display = 'none';
    updateAiBtnUI();
    
    // 如果切回普通模式，清空队列
    if (aiReplyMode === 'normal') {
      splitMsgQueue = [];
      renderSplitQueue();
    }
  });
});

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('DOMContentLoaded', () => {
    updateAiBtnUI();
});

// [FunctionDeclaration] Function: updateAiBtnUI
function updateAiBtnUI() {
  if (aiReplyMode === 'immediate') {
    iconMagic.style.display = 'none';
    iconSplit.style.display = 'block';
  } else {
    iconMagic.style.display = 'block';
    iconSplit.style.display = 'none';
  }
}

// [VariableDeclaration] Variables: isAiProcessing
let isAiProcessing = false;

// [ExpressionStatement] Execution: addEventListener
chatAiBtn.addEventListener('click', async () => {
  // ★★★ 关键修复：如果刚刚触发了长按，忽略本次点击 ★★★
  if (isLongPressTriggered) {
    isLongPressTriggered = false; // 重置标记
    return;
  }

  // 如果菜单是打开的，点击不触发功能
  if (aiModeMenu.style.display === 'flex') return;

  // 视觉反馈
  chatAiBtn.classList.add('btn-pulse');
  setTimeout(() => chatAiBtn.classList.remove('btn-pulse'), 200);

  // === 分句模式逻辑 (保持不变) ===
  if (aiReplyMode === 'immediate') {
    const content = chatInput.value.trim();
    if (content) {
      splitMsgQueue.push(content); // 加入队列
      renderSplitQueue(); // 渲染预览
      chatInput.value = ''; // 清空输入框
      chatInput.focus();
      checkSendBtnVisibility(); // 更新发送按钮状态
    }
    return; // 结束，不触发AI
  }

  // === 普通模式逻辑 (统一入口) ===
  if (isAiProcessing) return;
  
  if (!currentChatId) {
      customAlert('请先选择一个联系人开始聊天');
      return;
  }
  
  // 检查是否有历史消息 (只要有消息就能触发，不分是谁发的)
  const messages = await getData('chat_messages_' + currentChatId) || [];
  if (messages.length === 0) {
      customAlert('请先发送至少一条消息');
      return;
  }
  
  // 锁定按钮，防止重复点击
  isAiProcessing = true;
  chatAiBtn.style.opacity = '0.5';
  chatAiBtn.style.pointerEvents = 'none';
  
  try {
      // ★★★ 核心修改：无论上一条是谁发的，统一调用升级后的 getAIResponse ★★★
      // (升级后的 getAIResponse 会自动检测：如果是AI发的，它会自动注入隐藏指令让AI续写)
      await getAIResponse(currentChatId);
  } catch (error) {
      console.error('AI回复出错:', error);
      customAlert('AI回复失败，请稍后再试');
  } finally {
      // 解锁按钮
      isAiProcessing = false;
      chatAiBtn.style.opacity = '1';
      chatAiBtn.style.pointerEvents = 'auto';
  }
});

// [FunctionDeclaration] Function: renderSplitQueue
function renderSplitQueue() {
  if (splitMsgQueue.length > 0) {
    splitMsgPreview.style.display = 'flex';
    splitMsgPreview.innerHTML = splitMsgQueue.map((msg, index) => `
      <div class="split-msg-bubble" onclick="removeSplitMsg(${index})">
        ${msg} <span style="opacity:0.6; margin-left:4px;">×</span>
      </div>
    `).join('');
  } else {
    splitMsgPreview.style.display = 'none';
  }
}

// [ExpressionStatement] Execution: Expression
window.removeSplitMsg = function(index) {
  splitMsgQueue.splice(index, 1);
  renderSplitQueue();
}

// [ExpressionStatement] Execution: addEventListener
chatBackBtn.addEventListener('click', () => {
    // ★★★ 修复核心：退出时强制关闭所有面板 ★★★
    closeActionSheet();   // 关闭 +号 面板
    closeStickerPicker(); // 关闭 表情 面板

    // ★ 新增：退出时折叠所有翻译面板
    document.querySelectorAll('.translation-panel').forEach(p => {
        p.classList.remove('show');
    });

    currentChatId = null;
    chatInput.value = '';
    chatSendBtn.classList.remove('visible');
    
    // ★★★ 核心新增：退出时立即清空DOM和重置分页，彻底释放内存 ★★★
    chatMessagesContainer.innerHTML = ''; 
    window.currentMsgLimit = 50;
    
    showPage(mainApp);
    renderChatList();
});

// [FunctionDeclaration] Function: scrollToBottom
function scrollToBottom() {
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    // 滚到底部后，强制隐藏按钮
    document.getElementById('scrollToBottomBtn').style.display = 'none';
}

// [VariableDeclaration] Variables: scrollToBottomBtn
const scrollToBottomBtn = document.getElementById('scrollToBottomBtn');

// [ExpressionStatement] Execution: addEventListener
chatMessagesContainer.addEventListener('scroll', () => {
    // 计算距离底部的距离 = 总高度 - 卷去的高度 - 可视高度
    const distanceToBottom = chatMessagesContainer.scrollHeight - chatMessagesContainer.scrollTop - chatMessagesContainer.clientHeight;
    
    // 如果距离底部超过 500px，显示按钮；否则隐藏
    if (distanceToBottom > 1500) {
        scrollToBottomBtn.style.display = 'flex';
    } else {
        scrollToBottomBtn.style.display = 'none';
    }
});

// [ExpressionStatement] Execution: addEventListener
scrollToBottomBtn.addEventListener('click', () => {
    // 使用平滑滚动效果 (behavior: 'smooth') 可能会有点慢，这里用瞬间跳转更像微信
    // 如果想要动画，可以把下面这行改成: chatMessagesContainer.scrollTo({ top: chatMessagesContainer.scrollHeight, behavior: 'smooth' });
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
});

// [VariableDeclaration] Variables: originalLoadUserData2
const originalLoadUserData2 = loadUserData;

// [ExpressionStatement] Execution: Expression
loadUserData = async function() {
    await originalLoadUserData2();
    await renderChatList();
};

// [VariableDeclaration] Variables: chatStickerOverlay
const chatStickerOverlay = document.getElementById('chatStickerOverlay');

// [VariableDeclaration] Variables: chatStickerLibTab
const chatStickerLibTab = document.getElementById('chatStickerLibTab');

// [VariableDeclaration] Variables: chatStickerGridContainer
const chatStickerGridContainer = document.getElementById('chatStickerGrid');

// [VariableDeclaration] Variables: commonEmojis
const commonEmojis = [
      // 经典黄脸
  "😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","😋","😎","😗","😙","😚","🙂","🤗","🤩",
  "🤔","🤨","😐","😑","😶","🙄","😏","😣","😥","😮","🤐","😯","😪","😫","😴","😌","😛","😜",
  "😝","🤤","😒","😓","😔","😕","🙃","🤑","😲","☹️","🙁","😖","😞","😟","😤","😢","😭","😦",
  "😧","😨","😩","🤯","😬","😰","😱","🥵","🥶","😳","🤪","😵","😡","😠","🤬","😷","🤒","🤕",
  "🤢","🤮","🤧","😇","🤠","🥳","🥴","🥺","🤥","🤫","🤭","🧐","🤓","🥰","😍","😘",
  // 手势与身体
  "👌","👀","👍","👎","🤝","✌️","🙏","💪","👈","👉","👆","👇","✋","👋","👊","👏","👐","🫶",
  // 情感与爱
  "❤️","💔","🌹","🥀","💋","💕","💞","💓","💗","💖","💘","💝",

  // 动物与自然
  "🐷","🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐸","🐵","🐔","🐧","🐦",
  "🌲","🌳","🌴","🌵","🌷","🌸","🌼","🌻","☀️","🌙","⭐","☁️","🔥","💧",
  // 物体与符号
  "🆘","🎉","🎁","🎂","🎈","💣","💢","💤","💥","💦","💨","💩","👻","💀","👽","🤖"
];

// [ExpressionStatement] Execution: Expression
window.openChatStickerPicker = async function() {
  // 1. 先关闭“+号”面板
  closeActionSheet();
  
  const picker = document.getElementById('chatStickerOverlay');
  const inputArea = document.querySelector('.chat-input-area');

  // ★★★ 核心修复：强制清除旧代码残留的 display: none ★★★
  // 这行代码非常重要，它能覆盖掉 HTML 标签里可能残留的 style="display:none"
  picker.style.display = 'flex'; 

  // 2. 如果面板已经打开，就关闭它
  if (picker.classList.contains('open')) {
    closeStickerPicker();
    return;
  }
  
  // 3. 获取数据并渲染
  let userLibs = await getData('stickerLibs') || [];
  const defaultEmojiLib = { id: 'default_emoji', name: '默认', isEmoji: true, cover: '' };
  const allLibs = [defaultEmojiLib, ...userLibs];
  
  renderChatStickerTabs(allLibs, 'default_emoji');
  renderChatStickers(defaultEmojiLib);

  // 4. 打开面板
  picker.classList.add('open');
  inputArea.classList.add('sticker-open');
  // 小鱼新增：按钮随动
  document.getElementById('scrollToBottomBtn').classList.add('sticker-open');
};

// [FunctionDeclaration] Function: closeStickerPicker
function closeStickerPicker() {
  const picker = document.getElementById('chatStickerOverlay');
  const inputArea = document.querySelector('.chat-input-area');
  
  picker.classList.remove('open');
  inputArea.classList.remove('sticker-open');
  // 小鱼新增：按钮复位
  document.getElementById('scrollToBottomBtn').classList.remove('sticker-open');
}

// [ExpressionStatement] Execution: addEventListener
document.getElementById('chatMessagesContainer').addEventListener('click', () => {
    closeActionSheet();   // 关闭 +号 面板
    closeStickerPicker(); // 关闭 表情 面板
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('chatInput').addEventListener('focus', () => {
    closeActionSheet();
    closeStickerPicker(); // ★★★ 恢复这行，唤起键盘时关闭表情面板 ★★★
});

// [FunctionDeclaration] Function: toggleActionSheet
function toggleActionSheet() {
    const sheet = document.getElementById('chatActionSheet');
    const inputArea = document.querySelector('.chat-input-area');
    const scrollBtn = document.getElementById('scrollToBottomBtn'); // 小鱼新增
    
    // ★ 新增：打开 + 号菜单前，先强制关闭表情面板
    closeStickerPicker();

    // 切换类名来触发CSS动画
    sheet.classList.toggle('open');
    inputArea.classList.toggle('sheet-open');
    scrollBtn.classList.toggle('sheet-open'); // 小鱼新增：按钮随动
}

// [FunctionDeclaration] Function: renderChatStickerTabs
function renderChatStickerTabs(libs, activeId) {
  chatStickerLibTab.innerHTML = libs.map(lib => {
    const isActive = lib.id == activeId ? 'active' : '';
    if (lib.id === 'default_emoji') {
  // ★★★ 修复：强制设置背景色（激活时白色，未激活时透明，覆盖掉默认的灰色） ★★★
  return `
    <div class="sticker-tab-btn ${isActive}" onclick="switchChatStickerLib('${lib.id}')" style="background-color: ${isActive ? '#FFFFFF' : 'transparent'};">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="${isActive ? '#333' : '#000000'}">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
      </svg>
    </div>
  `;
}
    let coverStyle = '';
    if (lib.stickers && lib.stickers.length > 0) {
        coverStyle = `background-image: url(${lib.stickers[0].url});`;
    }
    return `
      <div class="sticker-tab-btn ${isActive}" onclick="switchChatStickerLib('${lib.id}')" style="${coverStyle}">
        ${(!lib.stickers || lib.stickers.length === 0) ? '<span style="font-size:10px; color:#999">空</span>' : ''}
      </div>
    `;
  }).join('');
}

// [ExpressionStatement] Execution: Expression
window.switchChatStickerLib = async function(libId) {
  let userLibs = await getData('stickerLibs') || [];
  const defaultEmojiLib = { id: 'default_emoji', name: '默认', isEmoji: true };
  const allLibs = [defaultEmojiLib, ...userLibs];
  const lib = allLibs.find(l => l.id == libId);
  if (lib) {
    renderChatStickerTabs(allLibs, libId);
    renderChatStickers(lib);
  }
};

// [FunctionDeclaration] Function: renderChatStickers
function renderChatStickers(lib) {
  // 动画重置
  chatStickerGridContainer.classList.remove('sticker-grid-anim');
  void chatStickerGridContainer.offsetWidth; 
  chatStickerGridContainer.classList.add('sticker-grid-anim');

  // A. 如果是 Emoji 库 (渲染最近使用 + 所有表情)
  if (lib.isEmoji) {
    chatStickerGridContainer.style.gridTemplateColumns = 'repeat(8, 1fr)';
    
    let recents = JSON.parse(localStorage.getItem('wechat_recent_emojis') || '[]');
    let html = '';

    // Emoji面板不需要顶部的大标题，直接显示分区
    if (recents.length > 0) {
        html += '<div class="emoji-section-title">最近使用</div>';
        html += recents.map(emoji => `
          <div class="emoji-cell" onclick="sendEmojiAsText('${emoji}')">${emoji}</div>
        `).join('');
    }

    html += '<div class="emoji-section-title">所有表情</div>';
    html += commonEmojis.map(emoji => `
      <div class="emoji-cell" onclick="sendEmojiAsText('${emoji}')">${emoji}</div>
    `).join('');

    chatStickerGridContainer.innerHTML = html;
    return;
  }

  // B. 如果是自定义图片库
  chatStickerGridContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';

  // ★★★ 小鱼修改：在这里构建标题 HTML，让它成为网格的第一项 ★★★
  let html = '';
  // 插入标题 (使用之前定义的 emoji-section-title 样式，它会自动跨全行)
  html += `<div class="emoji-section-title">${lib.name || '表情'}</div>`;

  if (!lib.stickers || lib.stickers.length === 0) {
    html += '<div style="grid-column: 1/-1; text-align: center; color: #999; padding: 20px;">暂无表情，请去管理页添加</div>';
    chatStickerGridContainer.innerHTML = html;
    return;
  }

  // 追加表情图片
  html += lib.stickers.map((s, index) => {
    const descHtml = s.desc ? `<span class="chat-sticker-desc">${s.desc}</span>` : '';
    return `
      <div class="chat-sticker-item" 
           data-index="${index}"
           data-url="${s.url}"
           data-desc="${s.desc || ''}"
           style="background-image: url(${s.url});">
        ${descHtml}
      </div>
    `;
  }).join('');

  chatStickerGridContainer.innerHTML = html;

  // 绑定图片表情的事件
  const items = chatStickerGridContainer.querySelectorAll('.chat-sticker-item');
  items.forEach(item => {
    let timer = null;
    let isLongPress = false;
    item.addEventListener('touchstart', (e) => {
      isLongPress = false;
      timer = setTimeout(() => {
        isLongPress = true;
        showStickerPopup(item, lib);
        if (navigator.vibrate) navigator.vibrate(50);
      }, 500);
    }, { passive: true });
    item.addEventListener('touchmove', () => clearTimeout(timer));
    item.addEventListener('touchend', () => clearTimeout(timer));
    item.addEventListener('click', () => {
      if (!isLongPress) sendStickerMessage(item.dataset.url, item.dataset.desc);
    });
  });
}

// [FunctionDeclaration] Function: showStickerPopup
function showStickerPopup(targetEl, lib) {
  const popup = document.getElementById('stickerPreviewPopup');
  const img = document.getElementById('previewImg');
  const desc = document.getElementById('previewDesc');
  
  // 获取按钮
  // 注意：我们需要重新获取按钮元素，因为之前的代码可能没有给"移到前面"按钮加ID
  // 建议在HTML结构中给第一个按钮加个ID，或者用 querySelector 获取
  const moveBtn = popup.querySelector('.preview-actions button:first-child');
  const deleteBtn = document.getElementById('previewDeleteBtn');
  
  // 1. 填充数据
  const url = targetEl.dataset.url;
  const txt = targetEl.dataset.desc;
  const index = parseInt(targetEl.dataset.index);
  
  img.src = url;
  desc.textContent = txt || '表情';
  
  // 2. 计算位置
  const rect = targetEl.getBoundingClientRect();
  const containerRect = document.querySelector('.sticker-content-wrapper').getBoundingClientRect();
  const centerLeft = (rect.left + rect.width / 2) - containerRect.left;
  const bottomPos = containerRect.bottom - rect.top + 10; 
  
  popup.style.left = centerLeft + 'px';
  popup.style.bottom = bottomPos + 'px';
  popup.style.display = 'block';
  
  // ★★★ 3. 绑定"移到前面"事件 ★★★
  moveBtn.onclick = async () => {
    if (index === 0) {
        popup.style.display = 'none';
        return; // 已经在第一个了
    }
    
    // 数组操作：删除当前，插入到头部
    const item = lib.stickers.splice(index, 1)[0];
    lib.stickers.unshift(item);
    
    // 保存并刷新
    let allLibs = await getData('stickerLibs');
    const libIndex = allLibs.findIndex(l => l.id === lib.id);
    if (libIndex !== -1) allLibs[libIndex] = lib;
    
    await saveData('stickerLibs', allLibs);
    renderChatStickers(lib); // 重新渲染界面
    popup.style.display = 'none';
  };

  // ★★★ 4. 绑定"删除"事件 ★★★
  deleteBtn.onclick = async () => {
    // 直接删除，不弹confirm，体验更像微信
    lib.stickers.splice(index, 1);
    
    // 保存并刷新
    let allLibs = await getData('stickerLibs');
    const libIndex = allLibs.findIndex(l => l.id === lib.id);
    if (libIndex !== -1) allLibs[libIndex] = lib;
    
    await saveData('stickerLibs', allLibs);
    renderChatStickers(lib);
    popup.style.display = 'none';
  };
}

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('touchstart', (e) => {
  const popup = document.getElementById('stickerPreviewPopup');
  // 如果点击的不是弹窗本身，也不是触发长按的表情，就关闭
  if (popup.style.display === 'block' && !e.target.closest('#stickerPreviewPopup') && !e.target.closest('.chat-sticker-item')) {
    popup.style.display = 'none';
  }
});

// [ExpressionStatement] Execution: Expression
window.sendEmojiAsText = function(emoji) {
  const input = document.getElementById('chatInput');
  input.value += emoji;
  // input.focus(); 
  input.dispatchEvent(new Event('input'));

  // --- 小鱼新增：更新最近使用列表 ---
  let recents = JSON.parse(localStorage.getItem('wechat_recent_emojis') || '[]');
  
  // 1. 如果已存在，先删除（为了把它移到最前面）
  recents = recents.filter(e => e !== emoji);
  
  // 2. 添加到头部
  recents.unshift(emoji);
  
  // 3. 限制最多显示8个
  if (recents.length > 8) {
      recents.length = 8;
  }
  
  // 4. 保存
  localStorage.setItem('wechat_recent_emojis', JSON.stringify(recents));

  // 5. 立即刷新表情面板以显示最新状态
  // 构造一个伪造的 lib 对象来触发渲染
  const defaultEmojiLib = { id: 'default_emoji', name: '默认', isEmoji: true };
  renderChatStickers(defaultEmojiLib);
};

// [ExpressionStatement] Execution: Expression
window.sendStickerMessage = async function(url, desc) {
  if (!currentChatId) return;

  // 如果是分句模式，依然直接上屏
  if (aiReplyMode === 'immediate') {
      const stickerName = desc || '图片';
      const textToInsert = `[表情：${stickerName}]`;
      chatInput.value += textToInsert;
      checkSendBtnVisibility();
      chatInput.focus();
      return; 
  }
  
  // ★★★ 小鱼修复：发送表情时，也必须强制清空草稿箱 ★★★
  wxDrafts = [];
  wxCurrentDraftIdx = 0;
  await saveData('chat_drafts_' + currentChatId, null);
  
  // 立即移除界面上的草稿工具栏
  const existingToolbar = document.querySelector('.wx-draft-toolbar');
  if (existingToolbar) existingToolbar.remove();
  
  // ★★★ 关键：这里不要调用 closeStickerPicker() ★★★
  // 保持面板打开，方便连发
  
  const stickerMsg = {
    role: 'user',
    type: 'sticker',
    content: url,
    desc: desc,
    timestamp: Date.now()
  };
  
  appendMessageToUI(stickerMsg);
  scrollToBottom();
  await saveMessage(currentChatId, stickerMsg);
  await updateChatList(currentChatId, `[表情]`, Date.now());
};

// [FunctionDeclaration] Function: findStickerUrlByDesc
async function findStickerUrlByDesc(desc) {
    const libs = await getData('stickerLibs') || [];
    for (const lib of libs) {
        if (lib.stickers) {
            // 查找描述匹配的表情
            const found = lib.stickers.find(s => s.desc === desc);
            if (found) return found.url;
        }
    }
    return null; // 没找到
}

// [FunctionDeclaration] Function: insertSceneSeparator
async function insertSceneSeparator(chatId, newSource) {
    const key = 'chat_messages_' + chatId;
    let messages = await getData(key) || [];
    
    if (messages.length === 0) return; // 空聊天不需要分隔
    
    const lastMsg = messages[messages.length - 1];
    
    // ★★★ 核心修复：获取上一条消息的来源，如果为空则默认为 'online' ★★★
    // 这样避免了普通消息被误判为“未知场景”，从而导致重复插入提示
    const lastSource = lastMsg.source || 'online';
    
    // 如果最后一条消息的场景和即将发送的场景不同，插入分隔符
    if (lastSource !== newSource) {
        const separator = {
            role: 'user',
            type: 'system_separator', // ★ 标记为系统消息
            content: `[系统提示：场景已切换为${newSource === 'online' ? '线上聊天' : '线下见面'}，请基于当前场景继续对话]`,
            timestamp: Date.now(),
            source: newSource, // 继承新场景的标记
            isHidden: true // ★ 标记为隐藏消息
        };
        
        messages.push(separator);
        await saveData(key, messages);
        console.log(`✅ 已自动插入${newSource}场景分隔符`);
    }
}

// [ExpressionStatement] Execution: Expression
window.customAlert = function(message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('customAlertOverlay');
    const content = document.getElementById('customAlertContent');
    const okBtn = document.getElementById('customAlertOkBtn');
    
    content.textContent = message;
    overlay.style.display = 'flex';
    
    const handleOk = () => {
      overlay.style.display = 'none';
      okBtn.removeEventListener('click', handleOk);
      resolve();
    };
    
    okBtn.addEventListener('click', handleOk);
  });
};

// [ExpressionStatement] Execution: Expression
window.customConfirm = function(message, options = {}) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('customConfirmOverlay');
    const content = document.getElementById('customConfirmContent');
    const okBtn = document.getElementById('customConfirmOkBtn');
    const cancelBtn = document.getElementById('customConfirmCancelBtn');
    
    // ★★★ 核心修复下猛药：极限压缩上下内边距 (上12px, 左右15px, 下8px) ★★★
    content.style.padding = '12px 15px 8px 15px';
    content.style.minHeight = '0'; // 强制清除可能存在的默认高度
    
    if (options.checkboxText) {
      // 渲染文本和复选框 (大幅缩小 margin-bottom，让两行紧紧靠在一起)
      content.innerHTML = `
        <div style="margin-bottom: 6px; white-space: pre-wrap; word-break: break-word; line-height: 1.3; font-size: 15px; color: #000;">${message}</div>
        <label style="display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666; cursor: pointer; padding-bottom: 4px;">
          <input type="checkbox" id="customConfirmCheckbox" style="margin-right: 6px; width: 14px; height: 14px; accent-color: #FA5151;">
          ${options.checkboxText}
        </label>
      `;
    } else {
      // 没复选框时的普通弹窗，稍微给点上下缓冲
      content.innerHTML = `<div style="white-space: pre-wrap; word-break: break-word; line-height: 1.3; font-size: 15px; color: #000; padding: 8px 0;">${message}</div>`;
    }
    
    overlay.style.display = 'flex';
    
    const handleOk = () => {
      let isChecked = false;
      if (options.checkboxText) {
        const cb = document.getElementById('customConfirmCheckbox');
        if (cb) isChecked = cb.checked;
      }
      overlay.style.display = 'none';
      cleanup();
      // 如果有复选框，返回对象；否则返回布尔值（兼容旧代码）
      resolve(options.checkboxText ? { confirmed: true, checked: isChecked } : true);
    };
    
    const handleCancel = () => {
      overlay.style.display = 'none';
      cleanup();
      resolve(options.checkboxText ? { confirmed: false, checked: false } : false);
    };
    
    const cleanup = () => {
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
    };
    
    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
  });
};

// [ExpressionStatement] Execution: Expression
window.customPrompt = function(message, defaultValue = '') {
  return new Promise((resolve) => {
    const overlay = document.getElementById('customPromptOverlay');
    const content = document.getElementById('customPromptContent');
    const input = document.getElementById('customPromptInput');
    const okBtn = document.getElementById('customPromptOkBtn');
    const cancelBtn = document.getElementById('customPromptCancelBtn');
    
    content.textContent = message;
    input.value = defaultValue;
    overlay.style.display = 'flex';
    
    setTimeout(() => input.focus(), 100);
    
    const handleOk = () => {
      const value = input.value;
      overlay.style.display = 'none';
      cleanup();
      resolve(value);
    };
    
    const handleCancel = () => {
      overlay.style.display = 'none';
      cleanup();
      resolve(null);
    };
    
    const handleEnter = (e) => {
      if (e.key === 'Enter') handleOk();
    };
    
    const cleanup = () => {
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      input.removeEventListener('keypress', handleEnter);
    };
    
    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    input.addEventListener('keypress', handleEnter);
  });
};

// [FunctionDeclaration] Function: startChat
async function startChat(contactOrId) {
    selectContactOverlay.style.display = 'none';
    const id = contactOrId.id || contactOrId;

    // ★★★ 小鱼核心修复：进入任意聊天时，刷新会话令牌 ★★★
    activeChatSessionToken++;
    const mySessionToken = activeChatSessionToken;

    currentChatId = id;

    // ★★★ 新增：每次进入聊天，先强制清掉旧的“正在输入闪烁”状态 ★★★
    chatTitle.classList.remove('typing-blink-effect');
    chatTitle.textContent = '聊天中';
    
    // ★ 关键修复：进入聊天时，强制从数据库恢复草稿箱
    await loadWxDrafts(id);
    
    const contact = await getContactDetails(id);
    if (!contact) return;

    // 如果在异步过程中，用户又切去了别的聊天，则终止本次界面更新
    if (mySessionToken !== activeChatSessionToken || currentChatId !== id) return;

    // ★★★ 再次确保进入新聊天后标题是干净状态 ★★★
    chatTitle.classList.remove('typing-blink-effect');
    chatTitle.textContent = contact.nickname;

    // 优先加载聊天专属头像
    const chatProfiles = await getData('my_chat_profiles') || {};
    const myProfile = chatProfiles[id];
    
    if (myProfile && myProfile.avatar) {
        userAvatarUrl = myProfile.avatar; 
    } else {
        userAvatarUrl = await getData('avatar') || ''; 
    }

    // 再次确认没有切走
    if (mySessionToken !== activeChatSessionToken || currentChatId !== id) return;
    
    await renderMessages(contact.id);

    // renderMessages 期间也可能切走，所以还要再判断一次
    if (mySessionToken !== activeChatSessionToken || currentChatId !== id) return;

    showPage(chatRoomPage);
    scrollToBottom();
    
    // 加载背景
    const contacts = await getData('customContacts') || [];
    const currentContact = contacts.find(c => c.id === id);

    // 再次确认没有切走
    if (mySessionToken !== activeChatSessionToken || currentChatId !== id) return;

    if (currentContact && currentContact.chatBackground) {
        applyChatBackground(currentContact.chatBackground);
    } else {
        applyChatBackground(null);
    }

    // ★★★ 核心新增：立即创建会话条目（即使没有消息） ★★★
    let sessions = await getData('chat_sessions') || [];
    const exists = sessions.find(s => s.id === id);
    if (!exists) {
        await updateChatList(id, '', Date.now());
    }
}

// [FunctionDeclaration] Function: regenerateLastWeChat
async function regenerateLastWeChat() {
    if (!currentChatId) return;
    
    const key = 'chat_messages_' + currentChatId;
    let messages = await getData(key) || [];
    if (messages.length === 0) return;

    // 1. 找到最后连续的AI消息组
    let lastAiGroup = [];
    let cutIndex = 0; // 切割点

    for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];

        // 遇到隐形的“（继续）”隔断时，立刻停止
        if (msg.isHidden && msg.content === '（继续）') {
            cutIndex = i + 1; 
            break; 
        }

        // 跳过其他隐藏消息
        if (msg.isHidden || msg.type === 'system_separator') {
            continue;
        }

        if (msg.role === 'assistant') {
            lastAiGroup.unshift(msg);
        } else if (msg.role === 'user') {
            cutIndex = i + 1;
            break;
        }
    }

    if (lastAiGroup.length === 0) {
        customAlert('最后一条不是AI回复，无法刷新');
        return;
    }

    // A. 第一次刷新，保存当前为草稿1
    if (wxDrafts.length === 0) {
        wxDrafts.push(lastAiGroup);
        wxCurrentDraftIdx = 0;
        await saveWxDrafts();
    }

    // ★★★ 核心优化：只删除AI消息的DOM节点 ★★★
    const timestampsToRemove = new Set(lastAiGroup.map(m => m.timestamp));
    document.querySelectorAll('.message-bubble, .inner-voice-wrapper, .system-text-message').forEach(el => {
        if (timestampsToRemove.has(parseInt(el.dataset.timestamp))) {
            el.remove(); 
        }
    });
    
    const oldToolbar = document.querySelector('.wx-draft-toolbar');
    if (oldToolbar) oldToolbar.remove();

    // B. 准备基础消息 (用户消息历史)
    let baseMessages = messages.slice(0, cutIndex);

    // ============================================================
    // ★★★ 小鱼新增：检查是否需要清洗旧的图片描述 ★★★
    // ============================================================
    try {
        const mainConfig = await getApiConfigForWechat('wechat');
        const imgConfig = await getApiConfigForWechat('imageRecognition');

        // 如果配置相同，说明“识图功能”未勾选（或者都指向同一个主模型）
        // 此时我们需要清除图片描述，强迫主模型重新看图
        if (JSON.stringify(mainConfig) === JSON.stringify(imgConfig)) {
            let hasCleaned = false;
            
            // 倒序检查上一轮用户的发言
            for (let i = baseMessages.length - 1; i >= 0; i--) {
                const msg = baseMessages[i];
                
                // 遇到上一轮AI回复就停止，只处理最近一轮用户的
                if (msg.role === 'assistant' && !msg.isHidden) break;

                // 如果发现有描述的图片，清除描述
if (msg.role === 'user' && msg.type === 'sticker' && msg.ai_description) {
    console.log('检测到识图已关闭，正在清除旧图片描述...');
    msg.ai_description = null; // ★ 清除数据，确保下次请求发送原图
    hasCleaned = true;

    // ★ 更新界面显示为占位符
    const bubble = document.querySelector(`[data-timestamp="${msg.timestamp}"]`);
    if (bubble) {
        const backEl = bubble.querySelector('.img-back');
        // 小鱼修改：显示占位符，等待新的描述生成
        if (backEl) backEl.textContent = 'AI正在分析画面...'; 
    }
}
            }
            
            if (hasCleaned) {
                console.log('图片描述清洗完成，准备重新生成');
            }
        }
    } catch (e) {
        console.warn('获取配置失败，跳过清洗步骤', e);
    }
    // ============================================================

    // 更新数据库（此时 baseMessages 可能已经被清洗过）
    await saveData(key, baseMessages);

    // C. 生成新回复
    try {
        await getAIResponse(currentChatId); 
        
        // D. 获取新生成的回复
        const newAllMessages = await getData(key) || [];
        const newAiGroup = newAllMessages.slice(cutIndex);
        
        // E. 存入草稿箱
        if (newAiGroup.length > 0) {
            wxDrafts.push(newAiGroup);
            wxCurrentDraftIdx = wxDrafts.length - 1;
            await saveWxDrafts();
        }
        
        renderDraftToolbar();

    } catch (e) {
        console.error(e);
        customAlert('生成失败');
        if (wxDrafts.length > 0) {
            await applyWxDraft(baseMessages, wxDrafts[wxCurrentDraftIdx]);
        }
    }
}

// [FunctionDeclaration] Function: switchWxDraft
async function switchWxDraft(direction) {
    if (wxDrafts.length === 0) return;
    
    let newIdx = wxCurrentDraftIdx + direction;
    if (newIdx < 0) newIdx = 0;
    if (newIdx >= wxDrafts.length) newIdx = wxDrafts.length - 1;
    
    if (newIdx === wxCurrentDraftIdx) return;
    
    wxCurrentDraftIdx = newIdx;
    
    // 找到当前显示的AI消息
    const key = 'chat_messages_' + currentChatId;
    let messages = await getData(key) || [];
    
    let cutIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role !== 'assistant') {
            cutIndex = i + 1;
            break;
        }
    }
    
    // 只删除旧AI消息的DOM
    const oldAiGroup = messages.slice(cutIndex);
    const oldTimestamps = new Set(oldAiGroup.map(m => m.timestamp));

    document.querySelectorAll('.message-bubble, .inner-voice-wrapper, .system-text-message').forEach(el => {
        if (oldTimestamps.has(parseInt(el.dataset.timestamp))) {
            el.remove();
        }
    });
    
    // 移除旧工具栏
    const oldToolbar = document.querySelector('.wx-draft-toolbar');
    if (oldToolbar) oldToolbar.remove();
    
    // 构建新历史记录
    const baseMessages = messages.slice(0, cutIndex);
    const newDraft = wxDrafts[wxCurrentDraftIdx];
    const newHistory = [...baseMessages, ...newDraft];
    
    // 保存到数据库
    await saveData(key, newHistory);
    await saveWxDrafts();
    
    // ★★★ 核心修复：准备群聊头像映射 ★★★
    const contacts = await getData('customContacts') || [];
    const contact = contacts.find(c => c.id === currentChatId);
    const isGroup = contact ? !!contact.isGroup : false;
    
    let memberAvatarMap = {};
    if (isGroup) {
        const memberIds = contact.memberIds || [];
        const members = contacts.filter(c => memberIds.includes(c.id));
        members.forEach(m => {
            memberAvatarMap[m.nickname] = m.avatar;
            if (m.realName) memberAvatarMap[m.realName] = m.avatar;
        });
    }
    
    // ★★★ 追加新消息到界面 ★★★
    const defaultAvatar = contact ? contact.avatar : '';
    
    newDraft.forEach((msg) => {
        let avatarToUse = defaultAvatar;
        
        // 如果是群聊且有发送者名字，查找对应头像
        if (isGroup && msg.role === 'assistant' && msg.senderName) {
            avatarToUse = memberAvatarMap[msg.senderName] || '';
        }
        
        // 关键：传入 resolvedAvatar 和 isGroup 参数
        appendMessageToUI(msg, avatarToUse, isGroup);
    });
    
    // 重绘工具栏
    renderDraftToolbar();
    scrollToBottom();
}

// [FunctionDeclaration] Function: applyWxDraft
async function applyWxDraft(baseMessages, draftGroup) {
    const key = 'chat_messages_' + currentChatId;
    const newHistory = [...baseMessages, ...draftGroup];
    
    await saveData(key, newHistory);
    await saveWxDrafts();
    
    // ★★★ 优化：只在必要时全量刷新（例如从外部调用） ★★★
    // 如果是切换草稿/重新生成调用，它们已经自己处理了DOM更新
    // 这里只刷新数据库，不触发界面重绘
}

// [FunctionDeclaration] Function: handleSendImage
async function handleSendImage(input) {
    const file = input.files[0];
    if (!file || !currentChatId) return;
    
    // ★★★ 核心新增：压缩图片函数 ★★★
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 1024;
                    if (width > maxSize || height > maxSize) {
                        if (width > height) {
                            height = (height / width) * maxSize;
                            width = maxSize;
                        } else {
                            width = (width / height) * maxSize;
                            height = maxSize;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(compressedBase64);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };
    
    // 压缩图片
    const imgUrl = await compressImage(file);
    
    // ★★★ 核心修改：如果是分句模式，不发送，只入队 ★★★
    if (aiReplyMode === 'immediate') {
        // 使用特殊格式标记这是一张图片：[图片:BASE64数据]
        // 但为了预览栏显示好看，我们只显示 [图片]，数据存入队列时带上标记
        
        // 注意：splitMsgQueue 存储的是真实要发送的内容
        // 我们约定：如果内容以 "data:image" 开头，它就是图片
        splitMsgQueue.push(imgUrl);
        
        renderSplitQueue(); // 更新预览栏
        checkSendBtnVisibility(); // 显示发送按钮
        
        // 清空input并关闭面板
        input.value = '';
        closeActionSheet();
        return; // ★ 结束函数，不执行后续发送逻辑
    }

    // --- 以下是普通模式的发送逻辑 (保持不变) ---
    
    const msg = {
        role: 'user',
        type: 'sticker',
        content: imgUrl,
        desc: '用户图片',
        timestamp: Date.now()
    };
    
    wxDrafts = [];
    await saveData('chat_drafts_' + currentChatId, null);

    const existingToolbar = document.querySelector('.wx-draft-toolbar');
    if (existingToolbar) existingToolbar.remove();
    
    await saveMessage(currentChatId, msg);
    appendMessageToUI(msg);
    scrollToBottom();
    
    await updateChatList(currentChatId, '[图片]', Date.now());
    
    input.value = '';
    closeActionSheet();
}

// [FunctionDeclaration] Function: saveWxDrafts
async function saveWxDrafts() {
    if (!currentChatId) return;
    const key = 'chat_drafts_' + currentChatId;
    if (wxDrafts.length > 0) {
        await saveData(key, { drafts: wxDrafts, idx: wxCurrentDraftIdx });
    } else {
        await saveData(key, null); // 如果为空，清除数据库记录
    }
}

// [FunctionDeclaration] Function: loadWxDrafts
async function loadWxDrafts(id) {
    const key = 'chat_drafts_' + id;
    const data = await getData(key);
    if (data && Array.isArray(data.drafts)) {
        wxDrafts = data.drafts;
        wxCurrentDraftIdx = data.idx || 0;
    } else {
        wxDrafts = [];
        wxCurrentDraftIdx = 0;
    }
}

// [VariableDeclaration] Variables: stickerGridEl
const stickerGridEl = document.getElementById('chatStickerGrid');

// [IfStatement] AnonymousBlock
if (stickerGridEl) {
  let touchStartX = 0;
  let touchStartY = 0;

  // 1. 触摸开始
  stickerGridEl.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

// 2. 触摸结束 (判断滑动方向 + 动画)
stickerGridEl.addEventListener('touchend', async (e) => {
  const touchEndX = e.changedTouches[0].screenX;
  const touchEndY = e.changedTouches[0].screenY;
  
  const diffX = touchEndX - touchStartX;
  const diffY = Math.abs(touchEndY - touchStartY);

  if (Math.abs(diffX) > 60 && diffY < 40) {
    let userLibs = await getData('stickerLibs') || [];
    const defaultEmojiLib = { id: 'default_emoji', name: '默认', isEmoji: true };
    const allLibs = [defaultEmojiLib, ...userLibs];

    const tabs = Array.from(document.querySelectorAll('#chatStickerLibTab .sticker-tab-btn'));
    const currentIndex = tabs.findIndex(t => t.classList.contains('active'));

    if (currentIndex === -1) return;

    const grid = document.getElementById('chatStickerGrid');

    if (diffX < 0) {
      // 向左滑 -> 下一个库
      if (currentIndex < allLibs.length - 1) {
        // 1. 先播放滑出动画
        grid.classList.add('slide-out-left');
        setTimeout(() => {
          // 2. 切换数据
          switchChatStickerLib(allLibs[currentIndex + 1].id);
          // 3. 移除滑出类，添加滑入类
          grid.classList.remove('slide-out-left');
          grid.classList.add('slide-in-right');
          // 4. 清理滑入类
          setTimeout(() => grid.classList.remove('slide-in-right'), 200);
        }, 200);
      }
    } else {
      // 向右滑 -> 上一个库
      if (currentIndex > 0) {
        grid.classList.add('slide-out-right');
        setTimeout(() => {
          switchChatStickerLib(allLibs[currentIndex - 1].id);
          grid.classList.remove('slide-out-right');
          grid.classList.add('slide-in-left');
          setTimeout(() => grid.classList.remove('slide-in-left'), 200);
        }, 200);
      }
    }
  }
}, { passive: true });

  // 3. 滚动事件 (保留原有逻辑：滚动时关闭长按弹窗)
  stickerGridEl.addEventListener('scroll', () => {
    const popup = document.getElementById('stickerPreviewPopup');
    if (popup && popup.style.display === 'block') {
      popup.style.display = 'none';
    }
  });
}

// [FunctionDeclaration] Function: openFullScreenViewer
function openFullScreenViewer(msg, isBackSide) {
    const viewer = document.getElementById('fullScreenViewer');
    const contentBox = document.getElementById('viewerContent');
    
    // 清空旧内容
    contentBox.innerHTML = '';
    
    if (isBackSide) {
        // --- 情况A：背面（显示文字描述）---
        const descText = msg.ai_description || 'AI正在分析画面...';
        const textEl = document.createElement('div');
        textEl.style.cssText = 'color: white; font-size: 18px; line-height: 1.6; padding: 20px; max-width: 90%; white-space: pre-wrap; text-align: center;';
        textEl.textContent = descText;
        contentBox.appendChild(textEl);
    } else {
        // --- 情况B：正面（显示大图）---
        const imgEl = document.createElement('img');
        imgEl.src = msg.content;
        imgEl.style.cssText = 'max-width: 100%; max-height: 100%; object-fit: contain;';
        contentBox.appendChild(imgEl);
    }
    
    // 显示查看器
    viewer.style.display = 'flex';
    
    // 绑定关闭事件 (点击任意处关闭)
    viewer.onclick = () => {
        viewer.style.display = 'none';
        contentBox.innerHTML = ''; // 清理内存
        viewer.onclick = null; // 解绑事件
    };
}

