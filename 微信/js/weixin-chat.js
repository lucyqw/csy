/* 小鱼新增：聊天功能核心逻辑 */
const startChatBtn = document.getElementById('startChatBtn');
const selectContactOverlay = document.getElementById('selectContactOverlay');
const selectContactList = document.getElementById('selectContactList');
const closeSelectContact = document.getElementById('closeSelectContact');
const chatRoomPage = document.getElementById('chatRoomPage');
const chatBackBtn = document.getElementById('chatBackBtn');
const chatTitle = document.getElementById('chatTitle');
const chatMessagesContainer = document.getElementById('chatMessagesContainer');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const chatAiBtn = document.getElementById('chatAiBtn');
const chatListContainer = document.getElementById('chatListContainer');

let currentChatId = null;
let userAvatarUrl = '';

// ★★★ 小鱼新增：聊天会话令牌（核心修复）★★★
// 每次进入一个新的聊天界面，都刷新一次这个编号。
// 旧聊天的异步回复回来时，如果编号对不上，就禁止它往当前界面渲染。
let activeChatSessionToken = 0;

// ★ 小鱼新增：草稿箱状态
let wxDrafts = []; // 结构: [[msg1, msg2], [msg1, msg2]] (因为微信AI回复可能是多条分句)
let wxCurrentDraftIdx = 0;

// 1. 点击加号，显示/隐藏右上角黑色菜单
const topRightMenu = document.getElementById('topRightMenu');
startChatBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // 防止冒泡关闭菜单
    if (topRightMenu.style.display === 'none') {
        topRightMenu.style.display = 'block';
    } else {
        topRightMenu.style.display = 'none';
    }
});

// 点击屏幕其他地方关闭菜单
document.addEventListener('click', () => {
    topRightMenu.style.display = 'none';
});

// 封装一个关闭函数
function hideSelectContactModal() {
    selectContactOverlay.style.display = 'none';
}

// 右上角 X 按钮
closeSelectContact.addEventListener('click', hideSelectContactModal);

// 新增的底部取消按钮
document.getElementById('cancelSelectContactBtn').addEventListener('click', hideSelectContactModal);

// 点击遮罩层（弹窗外部的灰色区域）也能关闭
selectContactOverlay.addEventListener('click', (e) => {
    if (e.target === selectContactOverlay) {
        hideSelectContactModal();
    }
});

// 2. 开始聊天（进入聊天室）
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

// ★★★ 小鱼新增：微信时间格式化工具 (核心逻辑) ★★★
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

// ★★★ 小鱼重构：消息渲染函数 (适配群聊) ★★★
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

// ★★★ 小鱼重构：渲染线下消息块 (修复群聊头像显示) ★★★
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

// ★ 小鱼修复：渲染草稿箱工具栏（支持点击拍一拍显示）
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

// ★新增：分组渲染辅助函数
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

// 4. 将单条消息添加到界面 (包含多选框结构)
let longPressTimer;
let currentSelectedMsgTimestamp = null;
let currentQuoteMsg = null; // ★★★ 小鱼新增：记录当前正在引用的消息
let isMultiSelectMode = false;
let selectedTimestamps = new Set();

// ★★★ 小鱼新增：触发引用功能 ★★★
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

// ★★★ 小鱼新增：取消引用 ★★★
window.cancelQuote = function() {
    currentQuoteMsg = null;
    const previewContainer = document.getElementById('quotePreviewContainer');
    if (previewContainer) previewContainer.style.display = 'none';
};

// ★★★ 小鱼修正版 V4：转账图标精修版 (距离缩进+完美对齐) ★★★
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

// ★★★ 小鱼新增：回溯功能核心逻辑 ★★★
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

// ★★★ 小鱼新增：来源标记，用于判断返回哪里 ★★★
let isProfileFromContactList = false;

// ★★★ 小鱼新增：从通讯录列表打开角色主页 ★★★
window.openContactProfile = async function(id) {
    isProfileFromContactList = true; // 标记来源：通讯录
    currentChatId = id; // 设置当前操作ID
    await loadAndShowProfile(id);
};

// 辅助函数：加载并显示资料页
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

// ★★★ 小鱼修改：智能头像点击处理（单击/双击/长按） ★★★
let avatarClickTimer = null;
let avatarLongPressTimer = null;

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

document.addEventListener('touchend', () => {
    clearTimeout(avatarLongPressTimer);
}, { passive: true });

document.addEventListener('touchmove', () => {
    clearTimeout(avatarLongPressTimer);
}, { passive: true });

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

// ★★★ 终极版：执行拍一拍 (含后缀 + 震动) ★★★
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

// 资料页返回逻辑 (智能判断返回位置)
const cpBackBtn = document.getElementById('cpBackBtn');
if(cpBackBtn) {
    cpBackBtn.addEventListener('click', () => {
        if (isProfileFromContactList) {
            showPage(mainApp); // 如果来自通讯录，返回主界面
        } else {
            showPage(document.getElementById('chatRoomPage')); // 如果来自聊天，返回聊天
        }
    });
}

// 资料页"发消息"按钮逻辑
const cpSendBtn = document.getElementById('cpSendMessageBtn');
if(cpSendBtn) {
    cpSendBtn.addEventListener('click', () => {
        // 无论从哪来，点击发消息都进入聊天，并加载历史记录
        startChat(currentChatId);
    });
}

// 显示操作菜单（小鱼修复版：自动避免溢出屏幕）
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

// ★★★ 新增/确认：隐藏菜单的函数 ★★★
function hideContextMenu() {
    document.getElementById('msgContextMenu').style.display = 'none';
    document.getElementById('menuOverlay').style.display = 'none';
}

// ★★★ 关键：在脚本加载时就绑定点击空白关闭的事件 ★★★
// 请将这行代码放在所有函数的外面，或者放在 window.onload 里
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

// 点击空白区域或滚动时的处理
function handleOutsideClick() {
    // 如果长按菜单正在显示，则关闭它
    if (document.getElementById('msgContextMenu').style.display === 'flex') {
        hideContextMenu();
    }
    // 注意：此处已移除退出多选模式的逻辑
}

// --- 多选功能模块 ---

// 全局变量记录当前多选模式 ('delete' 或 'summary')
let currentMultiSelectType = 'delete';

// 进入多选模式 (纯净版，不再区分模式)
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

// 退出多选模式
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

// 切换单条消息的选中状态
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

// 更新多选计数
function updateMultiselectCounter() {
    const counter = document.getElementById('multiselectCounter');
    const count = selectedTimestamps.size;
    if (count > 0) {
        counter.textContent = `已选择 ${count} 条消息`;
    } else {
        counter.textContent = '请选择消息';
    }
}

// 执行多选删除
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

// 刷新AI回复：删除上一次AI的所有回复，并重新生成
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

// 切换底部功能面板
function toggleActionSheet() {
    const sheet = document.getElementById('chatActionSheet');
    const inputArea = document.querySelector('.chat-input-area');
    
    // 切换类名来触发CSS动画
    sheet.classList.toggle('open');
    inputArea.classList.toggle('sheet-open');
}

// 关闭底部功能面板
function closeActionSheet() {
    const sheet = document.getElementById('chatActionSheet');
    const inputArea = document.querySelector('.chat-input-area');
    const scrollBtn = document.getElementById('scrollToBottomBtn'); // 小鱼新增
    
    sheet.classList.remove('open');
    inputArea.classList.remove('sheet-open');
    scrollBtn.classList.remove('sheet-open'); // 小鱼新增：按钮复位
}

// 触发重新生成（点击面板里的按钮时调用）
function triggerRegenerate() {
    closeActionSheet(); // 先关闭面板
    refreshLastAIResponse(); // 再执行重生成
}

// 监听点击事件，点击聊天区域时关闭面板
document.getElementById('chatMessagesContainer').addEventListener('click', () => {
    closeActionSheet();
});

// 监听输入框聚焦，聚焦时关闭面板
document.getElementById('chatInput').addEventListener('focus', () => {
    closeActionSheet();
});

// 单条删除
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

// 5. 发送消息逻辑 (支持分句发送、表情解析和自动AI回复)
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

// ★★★ 小鱼重构：构建 API 消息的核心函数 (物理隔离版：单聊逻辑原封不动) ★★★
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

// ★★★ 核心函数：获取 AI 回复 (小鱼修复版：支持多图识别) ★★★
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

// ★★★ 小鱼新增：Token 估算函数 (简单的本地估算) ★★★
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

// ★★★ 小鱼终极修复：查看上下文按钮（改用事件委托，彻底解决动态渲染问题）★★★
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

// 更新统计信息的辅助函数
function updateCtxStats() {
    const text = document.getElementById('ctxEditor').value;
    const totalChars = text.length;
    const totalTokens = estimateTokens(text);
    
    document.getElementById('ctxTotalChars').textContent = totalChars;
    document.getElementById('ctxTotalTokens').textContent = totalTokens + " Tokens";
}

// ★★★ 新增：强制使用当前编辑的内容发送给 AI ★★★
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


// ★★★ 小鱼重构：处理 AI 响应 (支持群聊多角色分发) ★★★
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

// ★★★ 辅助：复制完整 JSON (保持原有功能) ★★★
async function copyContextToClipboard() {
    if (!currentChatId) return;
    const { apiMessages } = await buildApiMessages(currentChatId);
    const content = JSON.stringify(apiMessages, null, 2);
    
    const tempInput = document.createElement('textarea');
    tempInput.value = content;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    customAlert('完整 JSON 已复制到剪贴板');
}

// 小鱼优化：直接调用 webbox-ai.js 中的配置获取函数，拆除桥梁
async function getApiConfigForWechat(featureType = 'wechat') {
    // getApiConfigForFeature 是你在 webbox-ai.js 中定义的函数
    return await getApiConfigForFeature(featureType);
}

// 小鱼优化：直接读取记忆数据，拆除桥梁
async function requestMemoriesFromWebBox(characterId, count) {
    // getMemories 是 webbox-ai.js 中原有的函数
    const allMems = await getMemories(String(characterId)) || [];
    return allMems.slice(-count); // 只取最新的 count 条
}
// 调用 AI API 的通用函数
async function callAIAPI(messages, customSettings = null) {
    // ★★★ 核心修改：如果传入了自定义配置，直接使用；否则请求主界面配置 ★★★
    if (customSettings) {
        return await executeApiCall(messages, customSettings);
    }
    
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error('获取API配置超时，请检查主界面是否已打开'));
        }, 10000);
        
        const handler = async (event) => {
            if (!event.data || event.data.action !== 'api-settings-response') {
                return;
            }
            
            cleanup();
            
            const settings = event.data.payload;
            console.log('收到API配置:', settings);
            
                        // ★★★ 核心修改：调用提取出来的执行函数 ★★★
            try {
                const result = await executeApiCall(messages, settings);
                resolve(result);
            } catch (error) {
                console.error('API调用异常:', error);
                reject(error);
            }
        };
        
        function cleanup() {
            clearTimeout(timeoutId);
            window.removeEventListener('message', handler);
        }
        
        window.addEventListener('message', handler);
        console.log('向父窗口请求API配置...');
        window.parent.postMessage({ 
            action: 'get-api-settings',
            featureType: 'wechat' 
        }, '*');
    });
}

// ★★★ 小鱼新增：实际执行API调用的函数（从callAIAPI中提取） ★★★
async function executeApiCall(messages, settings) {
    if (!settings || !settings.apiKey) {
        throw new Error('请先在主界面设置API密钥');
    }
    
    const defaultUrls = {
        'openai': 'https://api.openai.com/v1/chat/completions',
        'deepseek': 'https://api.deepseek.com/v1/chat/completions',
        'custom': settings.baseUrl
    };
    
    const apiUrl = settings.baseUrl || defaultUrls[settings.type];
    if (!apiUrl) {
        throw new Error('API地址未配置');
    }
    
    const model = settings.model || (settings.type === 'deepseek' ? 'deepseek-chat' : 'gpt-3.5-turbo');
    
    console.log('准备调用API:', apiUrl, '模型:', model);
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7,
        })
    });
    
    console.log('API响应状态:', response.status);
    
    if (!response.ok) {
        let errorMsg = response.statusText;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error?.message || errorMsg;
        } catch (e) {
            // 忽略解析错误
        }
        throw new Error(`API调用失败: ${errorMsg}`);
    }
    
    const data = await response.json();
    console.log('API返回数据:', data);
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
    } else {
        throw new Error('API返回格式错误');
    }
}

// 辅助：保存消息到 IndexedDB
async function saveMessage(chatId, msg) {
    const key = 'chat_messages_' + chatId;
    const messages = await getData(key) || [];
    messages.push(msg);
    await saveData(key, messages);
}

// 辅助：更新首页会话列表 (已修复图片预览显示问题)
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

// ★★★ 小鱼重构：生成头像 DOM 字符串 (支持用户头像显示) ★★★
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

// 监听输入框，控制发送按钮显示 (适配分句模式)
chatInput.addEventListener('input', () => {
    checkSendBtnVisibility();
});

// 辅助函数：统一检查发送按钮可见性 (互斥切换模式)
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

// 重写渲染队列函数 (优化版：支持图片预览)
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

// 绑定遮罩层点击事件（点击空白关闭长按菜单）
document.getElementById('menuOverlay').addEventListener('click', handleOutsideClick);

// 绑定聊天区域滚动事件（滚动时关闭菜单并退出多选）
document.getElementById('chatMessagesContainer').addEventListener('scroll', handleOutsideClick);

/* 小鱼新增：AI按钮模式与分句逻辑 */
// ★★★ 修改：优先从本地存储读取模式，没有则默认为 normal ★★★
let aiReplyMode = localStorage.getItem('wechat_ai_reply_mode') || 'normal';

let splitMsgQueue = []; // 分句消息队列
let aiBtnLongPressTimer;
let isLongPressTriggered = false; // ★ 关键：标记是否触发了长按
const aiModeMenu = document.getElementById('aiModeMenu');
const iconMagic = document.getElementById('iconMagic');
const iconSplit = document.getElementById('iconSplit');
const splitMsgPreview = document.getElementById('splitMsgPreview');

// 1. AI按钮长按显示菜单
chatAiBtn.addEventListener('touchstart', (e) => {
  isLongPressTriggered = false; // 重置标记
  aiBtnLongPressTimer = setTimeout(() => {
    isLongPressTriggered = true; // ★ 标记为已触发长按
    showAiModeMenu();
    navigator.vibrate && navigator.vibrate(50); // 震动反馈
  }, 500);
}, { passive: true });

chatAiBtn.addEventListener('touchend', () => {
  clearTimeout(aiBtnLongPressTimer);
});

chatAiBtn.addEventListener('touchmove', () => {
  clearTimeout(aiBtnLongPressTimer);
  isLongPressTriggered = false; // 滑动时也重置标记
});

// 显示模式菜单
function showAiModeMenu() {
  aiModeMenu.style.display = 'flex';
  // 更新选中状态
  document.querySelectorAll('.ai-mode-item').forEach(item => {
    item.classList.toggle('active', item.dataset.mode === aiReplyMode);
  });
}

// 隐藏模式菜单（点击其他地方或点击菜单外区域）
document.addEventListener('click', (e) => {
  if (!e.target.closest('#chatAiBtn') && !e.target.closest('#aiModeMenu')) {
    aiModeMenu.style.display = 'none';
  }
});

// ★ 小鱼新增：点击菜单项后也重置长按标记
document.querySelectorAll('.ai-mode-item').forEach(item => {
  item.addEventListener('click', () => {
    isLongPressTriggered = false; // 防止选择模式后立即触发点击
  });
});

// 2. 切换模式逻辑
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

// ★★★ 新增：页面加载时初始化按钮图标状态 ★★★
// 确保页面刷新后，图标能正确反映当前的模式
document.addEventListener('DOMContentLoaded', () => {
    updateAiBtnUI();
});

function updateAiBtnUI() {
  if (aiReplyMode === 'immediate') {
    iconMagic.style.display = 'none';
    iconSplit.style.display = 'block';
  } else {
    iconMagic.style.display = 'block';
    iconSplit.style.display = 'none';
  }
}

// 3. AI按钮点击事件 (分流逻辑)
let isAiProcessing = false;
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

// 渲染分句队列
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

// 允许点击删除队列中的某一句
window.removeSplitMsg = function(index) {
  splitMsgQueue.splice(index, 1);
  renderSplitQueue();
}

// 退出聊天
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

// 滚动到底部
function scrollToBottom() {
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    // 滚到底部后，强制隐藏按钮
    document.getElementById('scrollToBottomBtn').style.display = 'none';
}

// ★★★ 小鱼新增：监听滚动，控制“回到底部”按钮显示 ★★★
const scrollToBottomBtn = document.getElementById('scrollToBottomBtn');

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

// 点击按钮，快速回到底部
scrollToBottomBtn.addEventListener('click', () => {
    // 使用平滑滚动效果 (behavior: 'smooth') 可能会有点慢，这里用瞬间跳转更像微信
    // 如果想要动画，可以把下面这行改成: chatMessagesContainer.scrollTo({ top: chatMessagesContainer.scrollHeight, behavior: 'smooth' });
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
});
// 初始化时加载会话列表
const originalLoadUserData2 = loadUserData;
loadUserData = async function() {
    await originalLoadUserData2();
    await renderChatList();
};

/* 小鱼新增：聊天表情发送逻辑 (已重构为底部面板模式) */
const chatStickerOverlay = document.getElementById('chatStickerOverlay');
const chatStickerLibTab = document.getElementById('chatStickerLibTab');
const chatStickerGridContainer = document.getElementById('chatStickerGrid');

// --- 小鱼新增：扩充后的 Emoji 列表 ---
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

// 打开/关闭选择器 (修复版：强制清除隐藏状态 + 确保层级)
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

// 新增：关闭表情面板的专用函数
function closeStickerPicker() {
  const picker = document.getElementById('chatStickerOverlay');
  const inputArea = document.querySelector('.chat-input-area');
  
  picker.classList.remove('open');
  inputArea.classList.remove('sticker-open');
  // 小鱼新增：按钮复位
  document.getElementById('scrollToBottomBtn').classList.remove('sticker-open');
}

// 修改：点击聊天区域时，同时关闭表情面板
document.getElementById('chatMessagesContainer').addEventListener('click', () => {
    closeActionSheet();   // 关闭 +号 面板
    closeStickerPicker(); // 关闭 表情 面板
});

// 修改：点击输入框时，同时关闭两个面板
document.getElementById('chatInput').addEventListener('focus', () => {
    closeActionSheet();
    closeStickerPicker(); // ★★★ 恢复这行，唤起键盘时关闭表情面板 ★★★
});

// 修改：打开“+”号面板时，自动关闭表情面板
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

// 渲染顶部库标签 (图标模式) - (此函数不变，保留)
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

// 切换库 - (此函数不变，保留)
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

// 渲染表情网格 (含长按逻辑 + 标题更新 + 动画 + 最近使用功能)
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

// 显示长按弹窗的辅助函数 (修复版：实现真实功能)
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

// 点击任意地方关闭弹窗
document.addEventListener('touchstart', (e) => {
  const popup = document.getElementById('stickerPreviewPopup');
  // 如果点击的不是弹窗本身，也不是触发长按的表情，就关闭
  if (popup.style.display === 'block' && !e.target.closest('#stickerPreviewPopup') && !e.target.closest('.chat-sticker-item')) {
    popup.style.display = 'none';
  }
});

// 小鱼新增：点击 Emoji 直接上屏到输入框，并存入最近使用
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

// 发送表情 (修复版：发送后保持面板打开)
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

// ★★★ 小鱼新增：辅助函数，用于通过表情名称查找URL ★★★
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

/* ★ 小鱼新增：自动插入线上/线下分界线的系统消息 */
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

/* ========================================
   小鱼新增：自定义弹窗系统（替代浏览器原生弹窗）
   ======================================== */

// 1. 自定义 alert（提示框）
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

// 2. 自定义 confirm（确认框）- 小鱼升级版：支持复选框 (极限压缩间距版)
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

// 3. 自定义 prompt（输入框）
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

// --- 小鱼新增：微信内部弹窗控制逻辑 (支持上滑/右滑仅关闭当前一条) ---
let notifTimer = null;
let notifQueueTimer = null;
let currentNotifChatId = null;

// 小鱼新增：当前通知队列状态
let notifMessageQueue = [];
let notifCurrentIndex = 0;
let notifIsSequencePlaying = false;
let notifCurrentDismissResolver = null;

// 小鱼新增：弹窗滑动状态
let notifTouchStartX = 0;
let notifTouchStartY = 0;
let notifTouchCurrentX = 0;
let notifTouchCurrentY = 0;
let notifIsDragging = false;
let notifHasSwipedToClose = false;

// 小鱼新增：滑动方向锁
// 可选值：'' / 'right' / 'up'
let notifSwipeDirectionLock = '';

// 小鱼新增：统一重置样式
function resetHeadsUpNotificationStyles() {
    const notif = document.getElementById('heads-up-notification');
    if (!notif) return;

    notif.style.display = '';
    notif.style.transform = '';
    notif.style.opacity = '';
    notif.style.transition = '';
}

// 小鱼新增：不带业务逻辑的关闭当前弹窗UI
function closeCurrentNotificationUI(withAnimation = true, direction = 'up') {
    return new Promise((resolve) => {
        const notif = document.getElementById('heads-up-notification');
        if (!notif) {
            resolve();
            return;
        }

        if (notifTimer) clearTimeout(notifTimer);

        // 小鱼修复：先锁住当前状态，防止 .show 移除时再触发默认隐藏动画
        const finishClose = () => {
            // 先彻底隐藏，再移除 show，避免出现“第二次向上消失”
            notif.style.transition = 'none';
            notif.style.opacity = '0';
            notif.style.display = 'none';

            // 强制重绘，确保 display:none 先生效
            void notif.offsetHeight;

            notif.classList.remove('show');

            // 清理内联样式，给下一次显示做准备
            notif.style.display = '';
            notif.style.transition = '';
            notif.style.transform = '';
            notif.style.opacity = '';

            resolve();
        };

        if (withAnimation) {
            notif.style.transition = 'transform 0.22s ease, opacity 0.22s ease';

            if (direction === 'right') {
                notif.style.transform = 'translateX(120%)';
            } else {
                notif.style.transform = 'translateY(-100px)';
            }

            notif.style.opacity = '0';

            setTimeout(() => {
                finishClose();
            }, 220);
        } else {
            finishClose();
        }
    });
}

// 小鱼新增：回弹函数
function resetHeadsUpNotificationPosition() {
    const notif = document.getElementById('heads-up-notification');
    if (!notif) return;

    notif.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
    notif.style.transform = 'translate(0, 0)';
    notif.style.opacity = '1';

    setTimeout(() => {
        notif.style.transition = '';
    }, 200);
}

// 小鱼新增：显示当前索引的消息
async function playNextNotificationInQueue() {
    const notif = document.getElementById('heads-up-notification');
    const nameEl = document.getElementById('notif-sender-name');
    const msgEl = document.getElementById('notif-message-text');
    const avatarEl = document.getElementById('notif-avatar-img');

    if (!notif) return;

    // 队列播放完毕
    if (notifCurrentIndex >= notifMessageQueue.length) {
        notifIsSequencePlaying = false;
        notifMessageQueue = [];
        notifCurrentIndex = 0;
        return;
    }

    const currentContent = notifMessageQueue[notifCurrentIndex];
    const countPrefix = notifCurrentIndex === 0 ? '' : `[${notifCurrentIndex + 1}条] `;

    msgEl.textContent = countPrefix + currentContent;
    nameEl.textContent = notif.dataset.senderName || '';
    avatarEl.src = notif.dataset.senderAvatar || 'https://iili.io/fkc3RwJ.jpg';

notifHasSwipedToClose = false;
notifIsDragging = false;
notifSwipeDirectionLock = '';
resetHeadsUpNotificationStyles();

// 小鱼修复：先确保元素已经恢复正常显示状态，再加 show
notif.style.display = '';

await new Promise(r => setTimeout(r, 50));

notif.classList.add('show');
if (navigator.vibrate) navigator.vibrate(30);

    // 等待“自动关闭 / 手动滑掉 / 点击进入聊天”
    await new Promise((resolve) => {
        notifCurrentDismissResolver = resolve;

        notifTimer = setTimeout(async () => {
    await closeCurrentNotificationUI(true, 'up');
    resolve();
}, notifCurrentIndex < notifMessageQueue.length - 1 ? 2500 : 5000);
    });

    notifCurrentDismissResolver = null;
    notifCurrentIndex++;

    // 多条之间留一点间隔
    if (notifCurrentIndex < notifMessageQueue.length) {
        await new Promise(r => {
            notifQueueTimer = setTimeout(r, 350);
        });
        await playNextNotificationInQueue();
    } else {
        notifIsSequencePlaying = false;
        notifMessageQueue = [];
        notifCurrentIndex = 0;
    }
}

async function showHeadsUpNotification(charId, name, messagesArray, avatar) {
    const notif = document.getElementById('heads-up-notification');
    if (!notif) return;

    currentNotifChatId = charId;

    // 存一下发送者信息，给播放函数用
    notif.dataset.senderName = name || '';
    notif.dataset.senderAvatar = avatar || 'https://iili.io/fkc3RwJ.jpg';

    const msgs = Array.isArray(messagesArray) ? messagesArray : [messagesArray];

    if (notifTimer) clearTimeout(notifTimer);
    if (notifQueueTimer) clearTimeout(notifQueueTimer);

    // 核心：新的通知来了，重新覆盖当前队列
    notifMessageQueue = msgs;
    notifCurrentIndex = 0;

    // 如果当前有弹窗，先立即隐藏旧的，再播放新的
    notif.classList.remove('show');
    resetHeadsUpNotificationStyles();

    if (notifIsSequencePlaying) {
        notifIsSequencePlaying = false;
        if (notifCurrentDismissResolver) {
            notifCurrentDismissResolver();
            notifCurrentDismissResolver = null;
        }
    }

    notifIsSequencePlaying = true;
    await playNextNotificationInQueue();
}

// 点击弹窗直接跳转到对应聊天
async function handleNotificationClick() {
    if (notifHasSwipedToClose || notifIsDragging) return;

    if (notifTimer) clearTimeout(notifTimer);
    if (notifQueueTimer) clearTimeout(notifQueueTimer);

    await closeCurrentNotificationUI(true, 'up');

    // 终止整个队列，因为用户已经点进去聊天了
    notifIsSequencePlaying = false;
    notifMessageQueue = [];
    notifCurrentIndex = 0;

    if (notifCurrentDismissResolver) {
        notifCurrentDismissResolver();
        notifCurrentDismissResolver = null;
    }

    if (currentNotifChatId) {
        await startChat(currentNotifChatId);
    }
}

// 小鱼新增：给消息弹窗绑定上滑/右滑关闭手势
document.addEventListener('DOMContentLoaded', () => {
    const notif = document.getElementById('heads-up-notification');
    if (!notif) return;

    notif.addEventListener('touchstart', (e) => {
    if (!notif.classList.contains('show')) return;

    const touch = e.changedTouches[0];
    notifTouchStartX = touch.clientX;
    notifTouchStartY = touch.clientY;
    notifTouchCurrentX = touch.clientX;
    notifTouchCurrentY = touch.clientY;
    notifIsDragging = true;
    notifHasSwipedToClose = false;
    notifSwipeDirectionLock = ''; // 每次开始拖动时重置方向锁

    notif.style.transition = 'none';

    if (notifTimer) clearTimeout(notifTimer);
}, { passive: true });

notif.addEventListener('touchmove', (e) => {
    if (!notifIsDragging || !notif.classList.contains('show')) return;

    const touch = e.changedTouches[0];
    notifTouchCurrentX = touch.clientX;
    notifTouchCurrentY = touch.clientY;

    const deltaX = notifTouchCurrentX - notifTouchStartX;
    const deltaY = notifTouchCurrentY - notifTouchStartY;

    // 小鱼新增：先锁定方向，锁定后只允许单方向移动
    if (!notifSwipeDirectionLock) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // 位移太小，先不判定，避免误锁
        if (absX < 8 && absY < 8) return;

        if (deltaX > 0 && absX > absY) {
            notifSwipeDirectionLock = 'right';
        } else if (deltaY < 0 && absY > absX) {
            notifSwipeDirectionLock = 'up';
        } else {
            return;
        }
    }

    let moveX = 0;
    let moveY = 0;
    let finalOpacity = 1;

    // 右滑模式：只走X轴
    if (notifSwipeDirectionLock === 'right') {
        moveX = Math.max(deltaX, 0);
        finalOpacity = 1 - Math.min(moveX / 180, 0.7);
        notif.style.transform = `translateX(${moveX}px)`;
        notif.style.opacity = finalOpacity;
    }

    // 上滑模式：只走Y轴
    if (notifSwipeDirectionLock === 'up') {
        moveY = Math.min(deltaY, 0);
        finalOpacity = 1 - Math.min(Math.abs(moveY) / 180, 0.7);
        notif.style.transform = `translateY(${moveY}px)`;
        notif.style.opacity = finalOpacity;
    }
}, { passive: true });

notif.addEventListener('touchend', async () => {
    if (!notifIsDragging || !notif.classList.contains('show')) return;

    notifIsDragging = false;

    const deltaX = notifTouchCurrentX - notifTouchStartX;
    const deltaY = notifTouchCurrentY - notifTouchStartY;

    const shouldCloseByRightSwipe =
        notifSwipeDirectionLock === 'right' && deltaX > 80;

    const shouldCloseByUpSwipe =
        notifSwipeDirectionLock === 'up' && deltaY < -60;

    if (shouldCloseByRightSwipe || shouldCloseByUpSwipe) {
        notifHasSwipedToClose = true;

        await closeCurrentNotificationUI(
            true,
            shouldCloseByRightSwipe ? 'right' : 'up'
        );

        // 这里只结束当前这一条，不清空整个队列
        if (notifCurrentDismissResolver) {
            notifCurrentDismissResolver();
            notifCurrentDismissResolver = null;
        }
    } else {
        notifSwipeDirectionLock = '';
        resetHeadsUpNotificationPosition();

        // 没关掉则恢复自动消失计时
        notifTimer = setTimeout(async () => {
    await closeCurrentNotificationUI(true, 'up');
    if (notifCurrentDismissResolver) {
        notifCurrentDismissResolver();
        notifCurrentDismissResolver = null;
    }
}, notifCurrentIndex < notifMessageQueue.length - 1 ? 2500 : 5000);
    }
}, { passive: true });

notif.addEventListener('touchcancel', () => {
    if (!notifIsDragging) return;
    notifIsDragging = false;
    notifSwipeDirectionLock = '';
    resetHeadsUpNotificationPosition();
}, { passive: true });
});

window.addEventListener('DOMContentLoaded', async () => {
    await loadUserData();
    // ★ 页面加载完成后，检测并恢复未结束的通话
    await restoreCallState();
});

// ★★★ 小鱼新增：微信的“电话接线员” ★★★
window.addEventListener('message', async (event) => {
  // 1. 处理跳转指令 (新增)
  if (event.data && event.data.action === 'jump-to-chat') {
      const targetId = event.data.chatId;
      console.log('微信收到跳转指令，目标ID:', targetId);
      
      // 确保数据已加载
      if (!db) await initDB();
      
      // 只有当不在该聊天界面时才跳转，避免重复刷新
      if (currentChatId !== targetId) {
          // 调用现有的开始聊天函数
          await startChat(targetId);
      }
      return;
  }

  // 2. 原有的数据导出/导入逻辑
  if (event.data && event.data.action === 'export-wechat-data') {
        // 接到“导出数据”的电话
        console.log('微信收到导出请求...');
        try {
            const allWeChatData = {};
            const keys = [
                'avatar', 'userName', 'gender', 'region', 'phone', 'wechatId', 'pat', 
                'signature', 'ringtone', 'ringtoneHistory', 'customContacts'
            ];

            // 使用微信自己的getData函数（基于IndexedDB）来收集所有数据
            for (const key of keys) {
                const data = await getData(key);
                if (data !== null && data !== undefined) {
                    allWeChatData[key] = data;
                }
            }
            
            // 通过电话线把数据报送回去
            event.source.postMessage({
                action: 'wechat-data-response',
                payload: allWeChatData
            }, event.origin);
            console.log('微信数据已发送。');

        } catch (e) {
            console.error('微信导出数据时出错:', e);
        }

    } else if (event.data && event.data.action === 'import-wechat-data') {
        // 接到“导入数据”的电话
        console.log('微信收到导入请求...');
        const dataToImport = event.data.payload;
        if (dataToImport && typeof dataToImport === 'object') {
            try {
                // 使用微信自己的saveData函数（基于IndexedDB）来保存每一项数据
                for (const key in dataToImport) {
                    await saveData(key, dataToImport[key]);
                }
                console.log('微信数据导入完成！');
                // 导入后重新加载一次数据以更新UI
                await loadUserData();
                 // 你可以加一个提示，但因为这个窗口是隐藏的，所以提示给用户看不到
                 // customAlert('微信数据已恢复！');
            } catch (e) {
                console.error('微信导入数据时出错:', e);
            }
        }
    }
  });
  /* --- 聊天信息设置页逻辑 --- */

const chatInfoPage = document.getElementById('chatInfoPage');
const chatInfoEntryBtn = document.getElementById('chatInfoEntryBtn');
const chatInfoBackBtn = document.getElementById('chatInfoBackBtn');
const chatMembersContainer = document.getElementById('chatMembersContainer');
const topChatSwitch = document.getElementById('topChatSwitch');
const clearChatHistoryBtn = document.getElementById('clearChatHistoryBtn');
const setChatBgBtn = document.getElementById('setChatBgBtn');
const chatBgInput = document.getElementById('chatBgInput');

// ★★★ 小鱼修复：将渲染逻辑提取为全局函数，确保任何时候都能强制刷新 ★★★
window.renderChatInfoPage = async function() {
    // 强制关闭面板
    closeActionSheet();
    closeStickerPicker();

    if (!currentChatId) return;
    
    // 1. 强制从数据库获取最新数据
    const contacts = await getData('customContacts') || [];
    const contact = contacts.find(c => c.id === currentChatId);
    if (!contact) return;

    const isGroup = contact.isGroup;
    let memberCount = 0; 

    // --- A. 准备成员数据 ---
    let membersHtml = '';
    
    if (isGroup) {
        // 群聊：获取真实成员
        const allContacts = await getData('customContacts') || [];
        const memberIds = contact.memberIds || [];
        memberCount = memberIds.length;

        // 生成成员列表 HTML
        for (let i = 0; i < memberIds.length; i++) {
            // if (i >= 18) break; // 注释掉限制，显示所有成员(或者保留限制)
            
            const mid = memberIds[i];
            let mName = '';
            let mAvatar = '';
            
            if (mid === 'user_self') {
                mName = await getData('userName') || '我';
                mAvatar = await getData('avatar');
            } else {
                const m = allContacts.find(c => c.id === mid);
                if (m) {
                    mName = m.nickname;
                    mAvatar = m.avatar;
                } else {
                    mName = '未知';
                }
            }
            
            const avatarStyle = mAvatar ? `background-image: url(${mAvatar})` : 'background-color: #ccc';
            const avatarContent = !mAvatar ? mName[0] : '';

            membersHtml += `
                <div class="member-item">
                    <div class="member-avatar-img" style="${avatarStyle}; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
                        ${avatarContent}
                    </div>
                    <span class="member-name-text">${mName}</span>
                </div>
            `;
        }
        
        // 群聊特有的 + 和 - 按钮 (带点击事件)
        membersHtml += `
            <div class="member-item" onclick="openGroupManage('add')"><div class="add-member-btn">+</div></div>
            <div class="member-item" onclick="openGroupManage('remove')"><div class="add-member-btn">-</div></div>
        `;

    } else {
        // 单聊：只显示对方和加号
        const avatarStyle = contact.avatar ? `background-image: url(${contact.avatar})` : 'background-color: #ccc';
        const avatarText = !contact.avatar ? contact.nickname[0] : '';
        membersHtml = `
            <div class="member-item">
                <div class="member-avatar-img" style="${avatarStyle}; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                    ${avatarText}
                </div>
                <span class="member-name-text">${contact.nickname}</span>
            </div>
            <div class="member-item" onclick="openGroupManage('add')"><div class="add-member-btn">+</div></div>
        `;
    }

    // --- B. 动态构建设置列表 HTML ---
    const contentDiv = document.querySelector('#chatInfoPage .content');
    contentDiv.innerHTML = ''; // 清空旧内容
    
    // 读取状态
const sessions = await getData('chat_sessions') || [];
const session = sessions.find(s => s.id === currentChatId);
const isTop = session ? !!session.isTop : false;
const savedInnerVoice = await getData('innerVoice_' + currentChatId);
const isInnerVoice = savedInnerVoice !== null ? savedInnerVoice : false;
const savedLimit = await getData('contextLimit_' + currentChatId) || 20;
// 小鱼新增：读取时间概念状态（默认从角色数据读取，如果没有则默认开启）
const isTimeEnabled = contact.timeAwareness !== false;
// 小鱼新增：读取"显示群成员昵称"开关状态（默认开启）
const savedShowNickname = await getData('showGroupNickname_' + currentChatId);
const isShowNickname = savedShowNickname !== null ? savedShowNickname : true;

// ★★★ 新增：读取群聊总结记忆读取条数（默认5） ★★★
const savedGroupMemoryMount = await getData('groupMemoryMount_' + currentChatId);
const groupMemoryMountVal = savedGroupMemoryMount !== null ? savedGroupMemoryMount : 5;

const savedGroupChatLimit = await getData('groupChatLimit_' + currentChatId);
const groupChatLimitVal = savedGroupChatLimit !== null ? savedGroupChatLimit : 30;

    let settingsHtml = '';

    if (isGroup) {
        // === 群聊界面 ===
        const myName = await getData('userName') || 'user';
        
        settingsHtml = `
            <div class="member-section" id="chatMembersContainer">${membersHtml}</div>

            <div class="settings-group">
                <div class="settings-row" id="editGroupNameRow">
                    <span>群聊名称</span>
                    <span class="item-value" style="flex:1; text-align:right; margin-right:10px;">${contact.nickname || '未命名'}</span>
                    <span class="arrow-right">›</span>
                </div>
                <div class="settings-row">
                    <span>群二维码</span>
                    <div style="flex:1; text-align:right; margin-right:10px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#666"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zM3 13h8v8H3v-8zm2 2v4h4v-4H5zM13 3h8v8h-8V3zm2 2v4h4V5h-4zM13 13h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zm-6 2h2v2h-2v-2zm2 2h2v2h-2v-2z"/></svg>
                    </div>
                    <span class="arrow-right">›</span>
                </div>
                <!-- 其他菜单项保持不变 -->
                <div class="settings-row"><span>群公告</span><span class="arrow-right">›</span></div>
                <div class="settings-row"><span>群管理</span><span class="arrow-right">›</span></div>
                <div class="settings-row"><span>备注</span><span class="arrow-right">›</span></div>
            </div>
            
            <!-- 这里省略了中间通用的菜单代码，为了节省篇幅，实际运行时请保留原来的菜单结构 -->
            <!-- 关键是上面的 member-section 已经更新 -->
            
<div class="settings-group">
    <div class="settings-row"><span>查找聊天记录</span><span class="arrow-right">›</span></div>
    <div class="settings-row" onclick="openArchivePage()"><span>历史话题存档</span><span class="arrow-right">›</span></div>
    <!-- 小鱼新增：世界书管理入口 -->
    <div class="settings-row" id="worldBookManageBtn"><span>世界书/提示词</span><span class="arrow-right">›</span></div>
    <!-- ★★★ 新增：群聊也添加上下文查看入口 ★★★ -->
    <div class="settings-row" id="viewContextBtn_Dynamic"><span>查看上下文 (Debug)</span><span class="arrow-right">›</span></div>
<!-- 小鱼新增：时间概念开关 -->
<div class="settings-row">
    <span>时间概念 (AI感知当前时间)</span>
    <label class="ios-switch"><input type="checkbox" id="dynamicTimeSwitch" ${isTimeEnabled ? 'checked' : ''}><span class="ios-slider"></span></label>
</div>
</div>

            <div class="settings-group">
                <div class="settings-row">
                    <span>消息免打扰</span>
                    <label class="ios-switch"><input type="checkbox"><span class="ios-slider"></span></label>
                </div>
                <div class="settings-row">
                    <span>置顶聊天</span>
                    <label class="ios-switch"><input type="checkbox" id="dynamicTopSwitch" ${isTop ? 'checked' : ''}><span class="ios-slider"></span></label>
                </div>
                <div class="settings-row">
                    <span>保存到通讯录</span>
                    <label class="ios-switch"><input type="checkbox"><span class="ios-slider"></span></label>
                </div>
            </div>

            <div class="settings-group">
                <div class="settings-row">
                    <span>我在群里的昵称</span>
                    <span class="item-value" style="flex:1; text-align:right; margin-right:10px;">${myName}</span>
                    <span class="arrow-right">›</span>
                </div>
<div class="settings-row">
    <span>显示群成员昵称</span>
    <label class="ios-switch"><input type="checkbox" id="dynamicShowNicknameSwitch" ${isShowNickname ? 'checked' : ''}><span class="ios-slider"></span></label>
</div>
            </div>

            <div class="settings-group">
                <div class="settings-row">
                    <span>心声模式</span>
                    <label class="ios-switch"><input type="checkbox" id="dynamicInnerVoiceSwitch" ${isInnerVoice ? 'checked' : ''}><span class="ios-slider"></span></label>
                </div>
<div class="settings-row" id="dynamicContextRow">
    <span>AI记忆轮数</span>
    <div style="display:flex; align-items:center; color:#999; font-size:14px;">
        <span id="contextLimitValue">${savedLimit}条</span>
        <span class="arrow-right" style="margin-left:5px;">›</span>
    </div>
</div>

<!-- ★★★ 新增：群聊总结记忆读取设置 ★★★ -->
<div class="settings-row" id="dynamicGroupMemoryRow">
    <span>群聊总结记忆读取</span>
    <div style="display:flex; align-items:center; color:#999; font-size:14px;">
        <span id="groupMemoryMountValue">${groupMemoryMountVal}条</span>
        <span class="arrow-right" style="margin-left:5px;">›</span>
    </div>
</div>

<!-- ★★★ 已移除：记忆挂载设置已转移至"编辑角色资料"页面 ★★★ -->

<!-- ★★★ 新增：自动总结设置 (已修复默认0) ★★★ -->
<div class="settings-row" id="dynamicAutoSummaryRow">
    <span>自动总结间隔</span>
    <div style="display:flex; align-items:center; color:#999; font-size:14px;">
        <span id="autoSummaryValue">${(await getData('autoSummary_' + currentChatId)) || 0}轮</span>
        <span class="arrow-right" style="margin-left:5px;">›</span>
    </div>
</div>
<!-- ★★★ 已移除：群聊记忆分发功能 ★★★ -->
                <div class="settings-row" id="dynamicSetBgBtn"><span>设置当前聊天背景</span><span class="arrow-right">›</span></div>
                <div class="settings-row" id="dynamicClearBtn"><span>清空聊天记录</span><span class="arrow-right">›</span></div>
            </div>

<div class="settings-group">
    <!-- ★★★ 修改：添加 ID="exitGroupBtn"，并去掉了 onclick 属性 ★★★ -->
    <div class="settings-row" id="exitGroupBtn" style="justify-content: center; color: #FA5151; font-weight: 600; cursor: pointer;">
        删除并退出
    </div>
</div>
<div style="height: 50px;"></div>
        `;
} else {
    // === 单聊界面 ===
    
    // ★★★ 新增：读取群聊记忆挂载设置 ★★★
const isGroupMountEnabled = (await getData('groupMountEnabled_' + currentChatId)) || false;
const savedGroupMountLimit = await getData('groupMountLimit_' + currentChatId);
const groupMountLimit = savedGroupMountLimit !== null ? savedGroupMountLimit : 30;
const mountedGroups = (await getData('mountedGroupIds_' + currentChatId)) || [];

    settingsHtml = `
        <div class="member-section" id="chatMembersContainer">${membersHtml}</div>
        
<div class="settings-group">
    <div class="settings-row"><span>查找聊天记录</span><span class="arrow-right">›</span></div>
    <div class="settings-row" onclick="openArchivePage()"><span>历史话题存档</span><span class="arrow-right">›</span></div>
    <div class="settings-row" id="worldBookManageBtn"><span>世界书/提示词</span><span class="arrow-right">›</span></div>
<div class="settings-row">
    <span>时间概念 (AI感知当前时间)</span>
    <label class="ios-switch"><input type="checkbox" id="dynamicTimeSwitch" ${isTimeEnabled ? 'checked' : ''}><span class="ios-slider"></span></label>
</div>
    <div class="settings-row" id="viewContextBtn_Dynamic"><span>查看上下文 (Debug)</span><span class="arrow-right">›</span></div>
</div>

            <div class="settings-group">
                <div class="settings-row">
                    <span>消息免打扰</span>
                    <label class="ios-switch"><input type="checkbox"><span class="ios-slider"></span></label>
                </div>
                <div class="settings-row">
                    <span>置顶聊天</span>
                    <label class="ios-switch"><input type="checkbox" id="dynamicTopSwitch" ${isTop ? 'checked' : ''}><span class="ios-slider"></span></label>
                </div>
                <div class="settings-row">
                    <span>心声模式</span>
                    <label class="ios-switch"><input type="checkbox" id="dynamicInnerVoiceSwitch" ${isInnerVoice ? 'checked' : ''}><span class="ios-slider"></span></label>
                </div>
<div class="settings-row" id="dynamicContextRow">
    <span>AI记忆轮数</span>
    <div style="display:flex; align-items:center; color:#999; font-size:14px;">
        <span id="contextLimitValue">${savedLimit}条</span>
        <span class="arrow-right" style="margin-left:5px;">›</span>
    </div>
</div>
<div class="settings-row" id="dynamicAutoSummaryRow">
    <span>自动总结间隔</span>
    <div style="display:flex; align-items:center; color:#999; font-size:14px;">
        <span id="autoSummaryValue">${(await getData('autoSummary_' + currentChatId)) || 0}轮</span>
        <span class="arrow-right" style="margin-left:5px;">›</span>
    </div>
</div>
            </div>

            <!-- ★★★ 新增：群聊记忆挂载专属模块 ★★★ -->
            <div class="settings-group">
                <div class="settings-row">
                    <span>群聊记忆挂载</span>
                    <label class="ios-switch"><input type="checkbox" id="dynamicGroupMountSwitch" ${isGroupMountEnabled ? 'checked' : ''}><span class="ios-slider"></span></label>
                </div>
                <div class="settings-row" id="dynamicSelectGroupRow" style="display: ${isGroupMountEnabled ? 'flex' : 'none'};">
                    <span>选择挂载的群聊</span>
                    <div style="display:flex; align-items:center; color:#999; font-size:14px;">
                        <span id="mountedGroupCount">${mountedGroups.length}个</span>
                        <span class="arrow-right" style="margin-left:5px;">›</span>
                    </div>
                </div>
<div class="settings-row" id="dynamicGroupMountLimitRow" style="display: ${isGroupMountEnabled ? 'flex' : 'none'};">
    <span>长期记忆读取总数</span>
    <div style="display:flex; align-items:center; color:#999; font-size:14px;">
        <span id="groupMountLimitValue">${groupMountLimit}条</span>
        <span class="arrow-right" style="margin-left:5px;">›</span>
    </div>
</div>
<div class="settings-row" id="dynamicGroupChatLimitRow" style="display: ${isGroupMountEnabled ? 'flex' : 'none'};">
    <span>短期记忆读取总数</span>
    <div style="display:flex; align-items:center; color:#999; font-size:14px;">
        <span id="groupChatLimitValue">${groupChatLimitVal}条</span>
        <span class="arrow-right" style="margin-left:5px;">›</span>
    </div>
</div>
            </div>
            
            <div class="settings-group">
                <div class="settings-row" id="dynamicSetBgBtn"><span>设置当前聊天背景</span><span class="arrow-right">›</span></div>
                <div class="settings-row" id="dynamicClearBtn"><span>清空聊天记录</span><span class="arrow-right">›</span></div>
            </div>
            <div style="height: 50px;"></div>
        `;
    }

    // 更新标题
    document.querySelector('#chatInfoPage h1').textContent = `聊天信息${isGroup ? `(${memberCount})` : ''}`;
    
    // 注入 HTML
    contentDiv.innerHTML = settingsHtml;

    // --- C. 重新绑定事件 (必须重新绑定，因为DOM被重写了) ---
    // 1. 置顶开关
    const topSwitch = document.getElementById('dynamicTopSwitch');
    if (topSwitch) {
        topSwitch.addEventListener('change', async (e) => {
            const val = e.target.checked;
            let sess = await getData('chat_sessions') || [];
            const idx = sess.findIndex(s => s.id === currentChatId);
            if (idx !== -1) {
                sess[idx].isTop = val;
                sess.sort((a, b) => (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0) || b.time - a.time);
                await saveData('chat_sessions', sess);
                renderChatList();
            }
        });
    }
    // 2. 心声
const voiceSwitch = document.getElementById('dynamicInnerVoiceSwitch');
if (voiceSwitch) voiceSwitch.addEventListener('change', async (e) => await saveData('innerVoice_' + currentChatId, e.target.checked));

// 2.5 小鱼新增：显示群成员昵称开关
const showNicknameSwitch = document.getElementById('dynamicShowNicknameSwitch');
if (showNicknameSwitch) {
    showNicknameSwitch.addEventListener('change', async (e) => {
        await saveData('showGroupNickname_' + currentChatId, e.target.checked);
        // 立即刷新聊天界面，让修改生效
        await renderMessages(currentChatId);
    });
}
    // 3. 记忆轮数
const ctxRow = document.getElementById('dynamicContextRow');
if (ctxRow) ctxRow.addEventListener('click', async () => {
    const input = await customPrompt("AI记忆轮数", savedLimit);
    if (input) { await saveData('contextLimit_' + currentChatId, parseInt(input)); renderChatInfoPage(); }
});

// ★★★ 新增：群聊总结记忆读取设置 ★★★
const groupMemoryRow = document.getElementById('dynamicGroupMemoryRow');
if (groupMemoryRow) {
    groupMemoryRow.addEventListener('click', async () => {
        const currentVal = parseInt(document.getElementById('groupMemoryMountValue').textContent);
        const input = await customPrompt("请输入群聊总结记忆读取条数\n(从群聊历史中挑选最新的N条)", currentVal || 5);
        
        if (input !== null) {
            const num = parseInt(input);
            if (!isNaN(num) && num >= 0) {
                await saveData('groupMemoryMount_' + currentChatId, num);
                document.getElementById('groupMemoryMountValue').textContent = num + '条';
            } else {
                customAlert("请输入大于等于0的有效数字");
            }
        }
    });
}

// ★★★ 新增：单聊的群聊记忆挂载事件绑定 ★★★
const gmSwitch = document.getElementById('dynamicGroupMountSwitch');
const selGroupRow = document.getElementById('dynamicSelectGroupRow');
const gmLimitRow = document.getElementById('dynamicGroupMountLimitRow');

if (gmSwitch) {
    gmSwitch.addEventListener('change', async (e) => {
        const isEnabled = e.target.checked;
        await saveData('groupMountEnabled_' + currentChatId, isEnabled);
        if (selGroupRow) selGroupRow.style.display = isEnabled ? 'flex' : 'none';
        if (gmLimitRow) gmLimitRow.style.display = isEnabled ? 'flex' : 'none';
        // ★★★ 核心修复：同步控制短期记忆行的显示 ★★★
        const gcLimitRow = document.getElementById('dynamicGroupChatLimitRow');
        if (gcLimitRow) gcLimitRow.style.display = isEnabled ? 'flex' : 'none';
    });
}

if (selGroupRow) {
    selGroupRow.addEventListener('click', () => {
        if (typeof openMountGroupModal === 'function') openMountGroupModal();
    });
}

if (gmLimitRow) {
    gmLimitRow.addEventListener('click', async () => {
        const currentVal = parseInt(document.getElementById('groupMountLimitValue').textContent);
        const input = await customPrompt("请输入读取群聊长期记忆的总条数\n(0表示不读取)", currentVal || 30);
        if (input !== null) {
            const num = parseInt(input);
            if (!isNaN(num) && num >= 0) {
                await saveData('groupMountLimit_' + currentChatId, num);
                document.getElementById('groupMountLimitValue').textContent = num + '条';
            }
        }
    });
}

const gcLimitRow = document.getElementById('dynamicGroupChatLimitRow');
if (gcLimitRow) {
    gcLimitRow.addEventListener('click', async () => {
        const currentVal = parseInt(document.getElementById('groupChatLimitValue').textContent);
        const input = await customPrompt("请输入读取群聊短期记忆的总条数\n(0表示不读取)", currentVal || 30);
        if (input !== null) {
            const num = parseInt(input);
            if (!isNaN(num) && num >= 0) {
                await saveData('groupChatLimit_' + currentChatId, num);
                document.getElementById('groupChatLimitValue').textContent = num + '条';
            }
        }
    });
}

// ★★★ 新增：自动总结间隔监听器 ★★★
const autoSumRow = document.getElementById('dynamicAutoSummaryRow');
if (autoSumRow) autoSumRow.addEventListener('click', async () => {
    const currentVal = parseInt(document.getElementById('autoSummaryValue').textContent);
    // 小鱼修正：弹窗默认值改为0
    const input = await customPrompt("每多少轮对话自动总结一次记忆？\n(0表示关闭)", currentVal || 0);
    
    if (input !== null) {
        const num = parseInt(input);
        if (!isNaN(num) && num >= 0) {
            await saveData('autoSummary_' + currentChatId, num);
            document.getElementById('autoSummaryValue').textContent = num + '轮';
            // 重置当前计数器
            await saveData('chat_turn_count_' + currentChatId, 0);
        }
    }
});
    // 4. 清空
    const clrBtn = document.getElementById('dynamicClearBtn');
    if (clrBtn) clrBtn.addEventListener('click', () => clearChatHistoryBtn.click());
    // 5. 背景
    const bgBtn = document.getElementById('dynamicSetBgBtn');
    if (bgBtn) bgBtn.addEventListener('click', () => setChatBgBtn.click());
    // 6. Debug
    const dbgBtn = document.getElementById('viewContextBtn_Dynamic');
    if (dbgBtn) dbgBtn.addEventListener('click', () => document.getElementById('viewContextBtn').click());
    // 7. 改名
    const editNameRow = document.getElementById('editGroupNameRow');
    if (editNameRow) {
        editNameRow.addEventListener('click', async () => {
            const newName = await customPrompt('修改群聊名称', contact.nickname);
            if (newName) {
                let allContacts = await getData('customContacts');
                allContacts.find(c => c.id === currentChatId).nickname = newName;
                await saveData('customContacts', allContacts);
                renderChatInfoPage(); // 自刷新
            }
        });
    }
    
    // 8. 小鱼新增：世界书管理按钮
    const wbBtn = document.getElementById('worldBookManageBtn');
    if (wbBtn) {
        wbBtn.addEventListener('click', () => {
            openWorldBookManager();
        });
    }
    
    // 9. 小鱼新增：时间概念开关
    const timeSwitch = document.getElementById('dynamicTimeSwitch');
    if (timeSwitch) {
        timeSwitch.addEventListener('change', async (e) => {
            const isEnabled = e.target.checked;
            let contacts = await getData('customContacts') || [];
            const contactIndex = contacts.findIndex(c => c.id === currentChatId);
            if (contactIndex !== -1) {
                contacts[contactIndex].timeAwareness = isEnabled;
                await saveData('customContacts', contacts);
            }
        });
    }

    // 10. ★★★ 小鱼新增：退出群聊按钮逻辑 ★★★
const exitGroupBtn = document.getElementById('exitGroupBtn');
if (exitGroupBtn) {
    exitGroupBtn.addEventListener('click', async () => {
        // ★★★ 小鱼修改：唤起带复选框的确认弹窗 ★★★
        const result = await customConfirm('确定要删除并退出该群聊吗？\n此操作将清空所有聊天记录且无法撤销。', {
            checkboxText: '同时清空该群聊的所有总结记忆'
        });
        
        const isConfirmed = typeof result === 'object' ? result.confirmed : result;
        const isChecked = typeof result === 'object' ? result.checked : false;

        if (isConfirmed) {
            // ★★★ 小鱼新增：如果勾选了同步删除，通知父窗口清空记忆 ★★★
            if (isChecked && window.parent !== window) {
                window.parent.postMessage({
                    action: 'clear-memories',
                    data: { characterId: String(currentChatId) }
                }, '*');
            }

            // 1. 删除群聊联系人数据
                let contacts = await getData('customContacts') || [];
                contacts = contacts.filter(c => c.id !== currentChatId);
                await saveData('customContacts', contacts);

                // 2. 删除聊天记录和草稿
                await saveData('chat_messages_' + currentChatId, []);
                await saveData('chat_drafts_' + currentChatId, null);

                // 3. 删除会话列表
                let sessions = await getData('chat_sessions') || [];
                sessions = sessions.filter(s => s.id !== currentChatId);
                await saveData('chat_sessions', sessions);

                // 4. 清除其他关联数据 (配置、昵称开关等)
                await saveData('innerVoice_' + currentChatId, null);
                await saveData('contextLimit_' + currentChatId, null);
                await saveData('showGroupNickname_' + currentChatId, null);

                // 5. 刷新界面并返回首页
                currentChatId = null; 
                await renderChatList(); // 刷新首页列表
                showPage(mainApp); // 返回首页
            }
        });
    }

    showPage(chatInfoPage);
};

// 绑定按钮点击事件，直接调用新函数
chatInfoEntryBtn.addEventListener('click', window.renderChatInfoPage);

// 2. 返回聊天页
chatInfoBackBtn.addEventListener('click', () => {
    showPage(chatRoomPage);
});

// 3. 清空聊天记录
clearChatHistoryBtn.addEventListener('click', async () => {
    // ★★★ 小鱼修改：唤起带复选框的确认弹窗 ★★★
    const result = await customConfirm('确定删除和该联系人的聊天记录吗？', {
        checkboxText: '同时清空该角色的所有总结记忆'
    });
    
    const isConfirmed = typeof result === 'object' ? result.confirmed : result;
    const isChecked = typeof result === 'object' ? result.checked : false;

    if (isConfirmed) {
        // 清空数据库消息
        await saveData('chat_messages_' + currentChatId, []);
        
        // 清空界面消息
        document.getElementById('chatMessagesContainer').innerHTML = '';
        
        // 更新会话列表预览
        await updateChatList(currentChatId, '', Date.now());
        
        // ★★★ 小鱼新增：如果勾选了同步删除，通知父窗口清空记忆 ★★★
        if (isChecked && window.parent !== window) {
            window.parent.postMessage({
                action: 'clear-memories',
                data: {
                    characterId: String(currentChatId)
                }
            }, '*');
            customAlert('聊天记录及总结记忆已清空');
        } else {
            customAlert('聊天记录已清空');
        }
    }
});

// 4. 置顶聊天
topChatSwitch.addEventListener('change', async (e) => {
    const isTop = e.target.checked;
    let sessions = await getData('chat_sessions') || [];
    const sessionIndex = sessions.findIndex(s => s.id === currentChatId);
    
    if (sessionIndex !== -1) {
        sessions[sessionIndex].isTop = isTop;
        sessions.sort((a, b) => {
            if (a.isTop !== b.isTop) return b.isTop - a.isTop;
            return b.time - a.time;
        });
        await saveData('chat_sessions', sessions);
        renderChatList();
    }
});

// 心声开关监听器
document.getElementById('innerVoiceSwitch').addEventListener('change', async (e) => {
    const isEnabled = e.target.checked;
    await saveData('innerVoice_' + currentChatId, isEnabled);
});

// ★★★ 小鱼修复：上下文轮数限制点击监听器（改用事件委托，兼容动态渲染）★★★
document.addEventListener('click', async (e) => {
    // 判断是否点击了"AI记忆轮数"这一行（不管是静态的还是动态的ID）
    const row = e.target.closest('#contextLimitRow, #dynamicContextRow');
    if (row) {
        const currentVal = parseInt(document.getElementById('contextLimitValue').textContent);
        const input = await customPrompt("请输入AI读取历史消息的轮数（默认20）：\n(线上线下消息一视同仁，均计入总数)", currentVal || 20);
        
        if (input !== null) {
            const num = parseInt(input);
            if (!isNaN(num) && num > 0) {
                await saveData('contextLimit_' + currentChatId, num);
                document.getElementById('contextLimitValue').textContent = num + '条';
            } else {
                customAlert("请输入有效的数字");
            }
        }
    }
});

// 5. 设置聊天背景
const chatBackgroundSettingsPage = document.getElementById('chatBackgroundSettingsPage');
const chatBgBackBtn = document.getElementById('chatBgBackBtn');
const selectBgImageBtn = document.getElementById('selectBgImageBtn');

// 入口：点击“设置当前聊天背景” -> 跳转到背景菜单页
setChatBgBtn.addEventListener('click', () => {
    showPage(chatBackgroundSettingsPage);
});

// 返回：从背景菜单页 -> 返回聊天信息页
chatBgBackBtn.addEventListener('click', () => {
    showPage(document.getElementById('chatInfoPage'));
});

// 功能：点击“选择背景图” -> 触发文件选择
selectBgImageBtn.addEventListener('click', () => {
    chatBgInput.click();
});

// 小鱼新增：恢复默认背景逻辑
const restoreDefaultBgBtn = document.getElementById('restoreDefaultBgBtn');
restoreDefaultBgBtn.addEventListener('click', async () => {
    let contacts = await getData('customContacts') || [];
    const index = contacts.findIndex(c => c.id === currentChatId);
    
    if (index !== -1) {
        // 删除背景属性
        delete contacts[index].chatBackground;
        await saveData('customContacts', contacts);
        
        // 立即应用默认背景（灰色）
        applyChatBackground(null);
        
        customAlert('已恢复默认背景');
    }
});

chatBgInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const bgUrl = event.target.result;
            
            // ★ 修复：确保保存到正确的数据结构
            let contacts = await getData('customContacts') || [];
            const index = contacts.findIndex(c => c.id === currentChatId);
            if (index !== -1) {
                contacts[index].chatBackground = bgUrl;
                await saveData('customContacts', contacts);
                console.log('背景已保存:', bgUrl.substring(0, 50)); // 调试日志
                
                applyChatBackground(bgUrl);
                customAlert('背景设置成功');
            } else {
                console.error('未找到联系人ID:', currentChatId);
            }
        };
        reader.readAsDataURL(file);
    }
});

// 辅助函数：应用背景
function applyChatBackground(url) {
    const container = document.querySelector('.chat-room-container');
    if (url) {
        container.style.backgroundImage = `url(${url})`;
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
    } else {
        container.style.backgroundImage = '';
        container.style.backgroundColor = '#EDEDED';
    }
}

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

/* 小鱼新增：表情包管理系统 */
const stickerEntryBtn = document.getElementById('stickerEntryBtn');
const stickerLibraryPage = document.getElementById('stickerLibraryPage');
const stickerDetailPage = document.getElementById('stickerDetailPage');
const stickerLibContainer = document.getElementById('stickerLibContainer');
const addLibraryBtn = document.getElementById('addLibraryBtn');
const backToLibList = document.getElementById('backToLibList');
const stickerGrid = document.getElementById('stickerGrid');
const currentLibTitle = document.getElementById('currentLibTitle');
const openImportModalBtn = document.getElementById('openImportModalBtn');
const importStickerOverlay = document.getElementById('importStickerOverlay');
const importTabs = document.querySelectorAll('.import-tab');
const importLocalPanel = document.getElementById('importLocalPanel');
const importUrlPanel = document.getElementById('importUrlPanel');
const stickerFileInput = document.getElementById('stickerFileInput');
const importUrlInput = document.getElementById('importUrlInput');
const cancelImportBtn = document.getElementById('cancelImportBtn');
const confirmImportBtn = document.getElementById('confirmImportBtn');

// 将新页面加入页面管理器
allFullscreenPages.push(stickerLibraryPage, stickerDetailPage);

let currentLibId = null; // 当前正在查看的库ID
let importMode = 'local'; // local 或 url

// 1. 进入表情管理首页
stickerEntryBtn.addEventListener('click', async () => {
  await renderStickerLibraries();
  showPage(stickerLibraryPage);
});

// 返回按钮
document.querySelector('.back-from-sticker').addEventListener('click', () => showPage(mainApp));
backToLibList.addEventListener('click', () => showPage(stickerLibraryPage));

// 2. 渲染库列表 (小鱼修改：支持长按删除)
async function renderStickerLibraries() {
  let libs = await getData('stickerLibs') || [];
  if (libs.length === 0) {
    libs = [{ id: Date.now(), name: '默认表情', stickers: [] }];
    await saveData('stickerLibs', libs);
  }

  // 先生成HTML结构，但去掉 onclick 属性，改用 JS 绑定
  stickerLibContainer.innerHTML = libs.map(lib => {
    const count = lib.stickers ? lib.stickers.length : 0;
    const cover = count > 0 ? lib.stickers[0].url : '';
    const coverStyle = cover ? `background-image: url(${cover})` : '';
    const coverContent = cover ? '' : '无封面';
    
// 小鱼修改：如果名称为空，显示"未命名"
const displayName = (lib.name && lib.name.trim() !== '') ? lib.name : '未命名';

return `
  <div class="sticker-lib-item" data-id="${lib.id}" data-name="${displayName}">
    <div class="sticker-lib-cover" style="${coverStyle}">${coverContent}</div>
    <div style="flex: 1;">
      <div style="font-size: 16px; font-weight: 500;">${displayName}</div>
      <div style="font-size: 13px; color: #999;">${count}个表情</div>
    </div>
    <span class="contact-arrow">›</span>
  </div>
`;
  }).join('');

  // 为每个列表项绑定触摸事件
  document.querySelectorAll('.sticker-lib-item').forEach(item => {
    let pressTimer = null;
    let isLongPress = false;
    const libId = parseInt(item.dataset.id);
    const libName = item.dataset.name;

// 触摸开始
item.addEventListener('touchstart', (e) => {
  isLongPress = false;
  pressTimer = setTimeout(async () => {  // ← 关键修改：添加 async
    isLongPress = true;
    // 长按触发删除确认
    navigator.vibrate && navigator.vibrate(50); // 震动反馈
    if (await customConfirm(`确定要删除表情包库 "${libName}" 吗？\n(库内表情将一并删除)`)) {
      deleteStickerLibrary(libId);
    }
  }, 600); // 600毫秒视为长按
});

    // 触摸移动 (如果手指滑动了，就取消长按判定)
    item.addEventListener('touchmove', () => {
      clearTimeout(pressTimer);
    });

    // 触摸结束
    item.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
    });

    // 点击事件 (如果是长按触发了，就不执行点击跳转)
    item.addEventListener('click', () => {
      if (!isLongPress) {
        openStickerLib(libId, libName);
      }
    });
  });
}

// 小鱼新增：删除表情库函数
async function deleteStickerLibrary(id) {
  let libs = await getData('stickerLibs') || [];
  const newLibs = libs.filter(l => l.id !== id);
  await saveData('stickerLibs', newLibs);
  renderStickerLibraries();
}

// 3. 新建库
addLibraryBtn.addEventListener('click', async () => {
  const name = await customPrompt('请输入表情包专辑名称：');
  if (name) {
    let libs = await getData('stickerLibs') || [];
    libs.push({ id: Date.now(), name: name, stickers: [] });
    await saveData('stickerLibs', libs);
    renderStickerLibraries();
  }
});

// 小鱼新增：点击标题重命名
currentLibTitle.addEventListener('click', async () => {
  if (!currentLibId) return;
  
  const oldName = currentLibTitle.textContent;
  const newName = await customPrompt('重命名表情专辑', oldName);
  
  if (newName && newName.trim() !== '' && newName !== oldName) {
    let libs = await getData('stickerLibs') || [];
    const lib = libs.find(l => l.id === currentLibId);
    if (lib) {
      lib.name = newName.trim();
      await saveData('stickerLibs', libs);
      currentLibTitle.textContent = lib.name;
      // 后台刷新列表，这样返回时名字也是新的
      renderStickerLibraries();
    }
  }
});

// 4. 打开库详情
window.openStickerLib = async function(id, name) {
  currentLibId = id;
  currentLibTitle.textContent = name;
  await renderStickerGrid();
  showPage(stickerDetailPage);
};

// 小鱼修改：渲染表情网格（点击弹出菜单）
let currentStickerIndex = null; // 记录当前操作的表情索引

async function renderStickerGrid() {
  let libs = await getData('stickerLibs') || [];
  const lib = libs.find(l => l.id === currentLibId);
  if (!lib) return;

  stickerGrid.innerHTML = (lib.stickers || []).map((s, index) => `
    <div class="sticker-img-box" style="background-image: url(${s.url})" data-index="${index}">
      ${s.desc ? `<div class="sticker-desc">${s.desc}</div>` : ''}
    </div>
  `).join('');

  // 为每个表情绑定点击事件
  document.querySelectorAll('.sticker-img-box').forEach(box => {
    box.addEventListener('click', () => {
      currentStickerIndex = parseInt(box.dataset.index);
      showStickerActionSheet();
    });
  });
}

// 小鱼新增：显示表情操作菜单
function showStickerActionSheet() {
  document.getElementById('stickerActionOverlay').style.display = 'flex';
}

// 小鱼新增：绑定菜单按钮
const stickerActionOverlay = document.getElementById('stickerActionOverlay');
const renameStickerBtn = document.getElementById('renameStickerBtn');
const deleteStickerBtn = document.getElementById('deleteStickerBtn');
const cancelStickerActionBtn = document.getElementById('cancelStickerActionBtn');

cancelStickerActionBtn.addEventListener('click', () => {
  stickerActionOverlay.style.display = 'none';
});

stickerActionOverlay.addEventListener('click', (e) => {
  if (e.target === stickerActionOverlay) {
    stickerActionOverlay.style.display = 'none';
  }
});

// 命名按钮
renameStickerBtn.addEventListener('click', async () => {
  if (currentStickerIndex === null) return;
  
  let libs = await getData('stickerLibs') || [];
  const lib = libs.find(l => l.id === currentLibId);
  if (!lib) return;

  const oldDesc = lib.stickers[currentStickerIndex].desc || '';
  const newDesc = await customPrompt('为这个表情命名', oldDesc);
  
  if (newDesc !== null) {
    lib.stickers[currentStickerIndex].desc = newDesc.trim();
    await saveData('stickerLibs', libs);
    renderStickerGrid();
  }
  
  stickerActionOverlay.style.display = 'none';
});

// 删除按钮
deleteStickerBtn.addEventListener('click', async () => {
  if (currentStickerIndex === null) return;
  
  if (await customConfirm('确定删除这张表情吗？')) {
    let libs = await getData('stickerLibs') || [];
    const lib = libs.find(l => l.id === currentLibId);
    if (lib) {
      lib.stickers.splice(currentStickerIndex, 1);
      await saveData('stickerLibs', libs);
      renderStickerGrid();
    }
  }
  
  stickerActionOverlay.style.display = 'none';
});

// 5. 导入相关逻辑
openImportModalBtn.addEventListener('click', () => {
  importStickerOverlay.style.display = 'flex';
  importUrlInput.value = '';
  stickerFileInput.value = '';
  // 小鱼新增：每次打开时清空前缀输入框，防止误用旧前缀
  document.getElementById('urlPrefixInput').value = '';
});

cancelImportBtn.addEventListener('click', () => {
  importStickerOverlay.style.display = 'none';
});

// 切换Tab
importTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    importTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    importMode = tab.dataset.type;
    
    if (importMode === 'local') {
      importLocalPanel.style.display = 'flex';
      importUrlPanel.style.display = 'none';
    } else {
      importLocalPanel.style.display = 'none';
      importUrlPanel.style.display = 'flex';
    }
  });
});

// 小鱼新增：本地文件选择后实时预览
const localImagePreviewGrid = document.getElementById('localImagePreviewGrid');
stickerFileInput.addEventListener('change', () => {
  localImagePreviewGrid.innerHTML = ''; // 清空旧预览
  
  if (stickerFileInput.files.length === 0) return;
  
  Array.from(stickerFileInput.files).forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.style.cssText = 'aspect-ratio: 1; background-size: cover; background-position: center; border-radius: 6px; position: relative;';
      div.style.backgroundImage = `url(${e.target.result})`;
      
      // 添加序号角标
      div.innerHTML = `<div style="position: absolute; top: 2px; left: 2px; background: rgba(0,0,0,0.5); color: white; font-size: 10px; padding: 2px 5px; border-radius: 3px;">${index + 1}</div>`;
      
      localImagePreviewGrid.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
});

// ★★★ 小鱼新增：AI 智能分拣功能 ★★★
document.getElementById('aiSortStickersBtn').addEventListener('click', async () => {
    const inputArea = document.getElementById('importUrlInput');
    const rawText = inputArea.value.trim();
    const btn = document.getElementById('aiSortStickersBtn');
    
    if (!rawText) {
        customAlert('请先粘贴包含图片链接的杂乱文本到输入框中');
        return;
    }

    // 1. 锁定界面状态
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = '正在分析...';
    btn.style.opacity = '0.6';
    btn.disabled = true;

try {
    // 2. 获取 API 配置 (★ 修改：明确告诉主程序这是 stickerSort 请求)
    const apiConfig = await getApiConfigForWechat('stickerSort');

            // 3. 构建 Prompt (★ 小鱼修改：强制要求生成名称)
        const systemPrompt = `你是一个专业的数据清洗助手。
任务：从用户提供的文本中提取图片链接（URL），并确保每一条都有对应的中文描述（表情名）。

严格输出格式：
表情名: URL

重要规则：
1. 如果原文本包含描述（如 "开心: http..."），直接使用。
2. 如果原文本只有URL（如 "http.../img001.jpg"），你必须根据文件名或上下文自动生成一个简短的中文名字（如 "表情"、"img001"、"未命名"）。
3. ★★★ 绝对不要只输出 URL，每一行必须包含冒号 ":"。 ★★★
4. 去除重复链接。
5. 不要输出 Markdown 代码块，只输出纯文本。`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `请整理以下文本：\n\n${rawText}` }
        ];

        // 4. 调用 AI
        const result = await callAIAPI(messages, apiConfig);

        // 5. 清洗结果 (防止AI还是输出了markdown)
        let cleanResult = result.replace(/```\w*\n?/g, '').replace(/```/g, '').trim();
        
        // 6. 回填到输入框
        inputArea.value = cleanResult;
        
        // 7. 提示成功
        // 创建一个临时的成功提示
        const toast = document.createElement('div');
        toast.textContent = '✅ 格式化完成';
        toast.style.cssText = 'position:absolute; bottom: 80px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.7); color:white; padding:8px 16px; border-radius:4px; font-size:12px; animation: fadeInOut 2s forwards;';
        document.getElementById('importUrlPanel').appendChild(toast);
        setTimeout(() => toast.remove(), 2000);

    } catch (error) {
        console.error('AI 分拣失败:', error);
        customAlert('AI 分拣失败: ' + error.message);
    } finally {
        // 8. 恢复按钮状态
        btn.innerHTML = originalBtnText;
        btn.style.opacity = '1';
        btn.disabled = false;
    }
});

// 确认导入
confirmImportBtn.addEventListener('click', async () => {
  let newStickers = [];

  if (importMode === 'local') {
    // 本地文件处理
    if (stickerFileInput.files.length === 0) return customAlert('请选择图片');
    
    // 简单的Promise封装用于读取文件
    const readFile = (file) => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ url: e.target.result, desc: '' }); // 本地图片暂无描述
      reader.readAsDataURL(file);
    });

    const promises = Array.from(stickerFileInput.files).map(file => readFile(file));
    newStickers = await Promise.all(promises);

} else {
  // URL 批量解析处理 (支持前缀补全)
  const text = importUrlInput.value.trim();
  const prefix = document.getElementById('urlPrefixInput').value.trim(); // 获取前缀
  
  if (!text) return customAlert('请输入内容');

  const lines = text.split(/\n/);
  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    let url = '';
    let desc = '';
    
    // 1. 尝试寻找完整的 http 链接
    const httpIndex = line.search(/https?:\/\//i);
    
    if (httpIndex !== -1) {
      // 情况A：行内包含完整URL，忽略前缀设置
      url = line.substring(httpIndex).trim();
      desc = line.substring(0, httpIndex).trim();
    } else {
      // 情况B：行内没有完整URL，尝试使用前缀拼接
      // 先尝试分离描述 (格式如 "开心：img.jpg" 或 "img.jpg")
      const colonMatch = line.match(/[:：]/);
      
      if (colonMatch) {
        desc = line.substring(0, colonMatch.index).trim();
        url = line.substring(colonMatch.index + 1).trim();
      } else {
        // 没有冒号，整行都是文件名
        desc = '';
        url = line;
      }
      
      // 如果有前缀，进行拼接
      if (prefix && url) {
         // 智能处理斜杠，防止出现 // (http://除外)
         if (prefix.endsWith('/') && url.startsWith('/')) {
           url = prefix + url.substring(1);
         } else if (!prefix.endsWith('/') && !url.startsWith('/')) {
           url = prefix + '/' + url;
         } else {
           url = prefix + url;
         }
      }
    }

    // 清理描述末尾的冒号
    desc = desc.replace(/[:：]$/, '').trim();

    // 最终校验：必须是合法的URL才添加
    if (url && url.match(/^https?:\/\//i)) {
      newStickers.push({ url: url, desc: desc });
    }
  });
}

  if (newStickers.length > 0) {
    let libs = await getData('stickerLibs') || [];
    const libIndex = libs.findIndex(l => l.id === currentLibId);
    if (libIndex !== -1) {
      libs[libIndex].stickers.push(...newStickers);
      await saveData('stickerLibs', libs);
      renderStickerGrid();
      importStickerOverlay.style.display = 'none';
      customAlert(`成功添加 ${newStickers.length} 个表情`);
    }
  } else {
    customAlert('未能识别有效图片');
  }
});

// 小鱼优化：一键复制到剪切板（带视觉反馈）
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

// 小鱼优化：打开自定义编辑弹窗（图片编辑描述，文字编辑内容）
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

// 关闭编辑弹窗
function closeEditModal() {
    document.getElementById('editMsgModal').style.display = 'none';
}

// 保存编辑后的消息（小鱼修复版：支持编辑图片描述）
async function saveEditedMessage() {
    const input = document.getElementById('customEditInput');
    const newContent = input.value.trim();
    
    const key = 'chat_messages_' + currentChatId;
    let messages = await getData(key) || [];
    const msgIndex = messages.findIndex(m => m.timestamp == currentSelectedMsgTimestamp);
    
    if (msgIndex !== -1) {
        const msg = messages[msgIndex];
        
        // ★★★ 核心修改：判断是图片还是普通消息 ★★★
        if (msg.type === 'sticker' && msg.content.startsWith('data:image')) {
            // --- 情况A：图片消息 -> 修改 ai_description ---
            
            // 允许清空描述（用户可以手动清除让AI重新识别）
            messages[msgIndex].ai_description = newContent || null;
            await saveData(key, messages);
            
            // 更新界面：图片卡片的背面
            const targetElement = document.querySelector(`[data-timestamp="${currentSelectedMsgTimestamp}"]`);
            if (targetElement) {
                const backEl = targetElement.querySelector('.img-back');
                if (backEl) {
                    backEl.textContent = newContent || 'AI正在分析画面...';
                }
            }
            
        } else {
            // --- 情况B：普通消息 -> 修改 content ---
            
            if (!newContent) {
                customAlert('消息内容不能为空');
                return;
            }
            
            messages[msgIndex].content = newContent;
            await saveData(key, messages);
            
            // 更新界面
            const targetElement = document.querySelector(`[data-timestamp="${currentSelectedMsgTimestamp}"]`);
            if (targetElement) {
                const contentDiv = targetElement.querySelector('.msg-content');
                if (contentDiv) contentDiv.textContent = newContent;
                
                const innerVoiceDiv = targetElement.querySelector('.inner-voice-content');
                if (innerVoiceDiv) innerVoiceDiv.textContent = newContent;
                
                if (targetElement.classList.contains('system-text-message')) {
                    targetElement.textContent = newContent;
                }
            }
            
            // 如果是最后一条消息，更新会话列表预览
            if (msgIndex === messages.length - 1) {
                const preview = (msg.type === 'sticker') ? '[表情]' : newContent;
                await updateChatList(currentChatId, preview, msg.timestamp);
            }
        }
    }
    
    closeEditModal();
}

/* ========================================
   小鱼新增：翻译功能 (支持多引擎，长按切换)
   ======================================== */

// 翻译图标SVG字符串（复用）
const TRANSLATE_ICON_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block; vertical-align:middle; margin-left:4px; opacity:0.5;"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>`;

// 当前翻译引擎（从本地存储读取，默认libre）
let currentTranslateEngine = localStorage.getItem('translate_engine') || 'libre';

// 长按计时器
let translateEngineTimer = null;
let translateLongPressed = false;

// 长按开始
function startTranslateEngineTimer(e) {
    translateLongPressed = false;
    translateEngineTimer = setTimeout(() => {
        translateLongPressed = true;
        hideContextMenu(); // 关闭长按菜单
        showTranslateEngineModal(); // 弹出引擎选择
        if (navigator.vibrate) navigator.vibrate(50);
    }, 600);
}

// 长按结束
function clearTranslateEngineTimer() {
    clearTimeout(translateEngineTimer);
}

// 显示引擎选择弹窗，并标记当前选中
function showTranslateEngineModal() {
    // 更新勾选状态
    document.getElementById('engineCheckGoogle').style.display =
        currentTranslateEngine === 'google' ? 'block' : 'none';
    document.getElementById('engineCheckLibre').style.display =
        currentTranslateEngine === 'libre' ? 'block' : 'none';

    document.getElementById('translateEngineModal').style.display = 'flex';
}

// 用户选择引擎后保存并提示
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

// 主翻译函数
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

/* 小鱼新增：资料设置页面逻辑 */
const dataSettingsPage = document.getElementById('dataSettingsPage');
const cpMoreBtn = document.getElementById('cpMoreBtn');
const dsBackBtn = document.getElementById('dsBackBtn');
const dsDeleteBtn = document.getElementById('dsDeleteBtn');
const dsEditRemarkRow = document.getElementById('dsEditRemarkRow');

// 1. 进入资料设置页
if (cpMoreBtn) {
  cpMoreBtn.addEventListener('click', () => {
    showPage(dataSettingsPage);
  });
}

// 2. 返回角色主页
if (dsBackBtn) {
  dsBackBtn.addEventListener('click', () => {
    showPage(document.getElementById('contactProfilePage'));
  });
}

// 3. 资料设置页里的"设置备注和标签" -> 跳转到编辑页
if (dsEditRemarkRow) {
  dsEditRemarkRow.addEventListener('click', async () => {
    if (!currentChatId) return;
    
    // ★ 小鱼新增：编辑前，先获取当前的旧昵称记录下来
    const beforeContacts = await getData('customContacts') || [];
    const oldContact = beforeContacts.find(c => c.id === currentChatId);
    const oldNickname = oldContact ? oldContact.nickname : null;

    // 清除覆盖数据并进入编辑
    const overrides = await getData('contactOverrides') || {};
    delete overrides[currentChatId];
    await saveData('contactOverrides', overrides);
    
    // 呼出原生编辑界面，等待用户编辑完成
    await editCharacter(currentChatId);
    pageTitle.textContent = "设置备注和标签";

    // ★ 小鱼新增：编辑完成后，获取新昵称并扫描全库替换旧昵称
    if (oldNickname) {
        const afterContacts = await getData('customContacts') || [];
        const newContact = afterContacts.find(c => c.id === currentChatId);
        const newNickname = newContact ? newContact.nickname : null;

        // 如果名字真的发生了改变，执行全面清理和数据同步
        if (newNickname && oldNickname !== newNickname) {
            console.log(`检测到改名：【${oldNickname}】 -> 【${newNickname}】，开始同步数据...`);
            
            // 同步一：群聊历史消息中的发送者名称
            const groups = afterContacts.filter(c => c.isGroup);
            for (const group of groups) {
                const chatKey = 'chat_messages_' + group.id;
                let chatMsgs = await getData(chatKey) || [];
                let changed = false;
                chatMsgs.forEach(msg => {
                    if (msg.senderName === oldNickname) {
                        msg.senderName = newNickname;
                        changed = true;
                    }
                });
                if (changed) await saveData(chatKey, chatMsgs);
            }

            // 同步二：朋友圈的作者名、点赞列表、评论列表
            let moments = await getData('moments_posts') || [];
            let momentsChanged = false;
            moments.forEach(post => {
                if (post.authorName === oldNickname) {
                    post.authorName = newNickname;
                    momentsChanged = true;
                }
                if (post.likes && post.likes.includes(oldNickname)) {
                    post.likes = post.likes.map(name => name === oldNickname ? newNickname : name);
                    momentsChanged = true;
                }
                if (post.comments) {
                    post.comments.forEach(comment => {
                        if (comment.authorName === oldNickname) {
                            comment.authorName = newNickname;
                            momentsChanged = true;
                        }
                        if (comment.replyToAuthorName === oldNickname) {
                            comment.replyToAuthorName = newNickname;
                            momentsChanged = true;
                        }
                    });
                }
            });
            if (momentsChanged) await saveData('moments_posts', moments);

            // 提示用户同步已完成
            if(typeof customAlert === 'function') {
                customAlert(`检测到角色已改名为“${newNickname}”\n对应的历史群聊记录及朋友圈相关数据已全部同步更新完成！`);
            }
        }
    }
  });
}

// 4. 删除联系人逻辑
if (dsDeleteBtn) {
  dsDeleteBtn.addEventListener('click', async () => {
    if (await customConfirm('将联系人删除，同时删除与该联系人的聊天记录？')) {
      let contacts = await getData('customContacts') || [];

      // ★★★ 小鱼新增：遍历所有群聊，将该角色从成员列表中移除 ★★★
      contacts.forEach(c => {
        if (c.isGroup && Array.isArray(c.memberIds)) {
          // 过滤掉当前要删除的ID
          c.memberIds = c.memberIds.filter(mid => mid !== currentChatId);
        }
      });

      // 1. 删除通讯录数据 (过滤掉被删除的人)
      contacts = contacts.filter(c => c.id !== currentChatId);
      await saveData('customContacts', contacts);
      
      // 2. 删除聊天记录
      await saveData('chat_messages_' + currentChatId, []);
      
      // 3. 删除会话列表
      let sessions = await getData('chat_sessions') || [];
      sessions = sessions.filter(s => s.id !== currentChatId);
      await saveData('chat_sessions', sessions);
      
      // 4. 删除覆盖数据
      const overrides = await getData('contactOverrides') || {};
      delete overrides[currentChatId];
      
      await saveData('contactOverrides', overrides);

      // 5. 刷新界面并返回首页
      renderCustomContacts(contacts);
      await renderChatList();
      showPage(mainApp);
    }
  });
}

/* ========================================
   小鱼新增：我的聊天资料管理系统
   ======================================== */

// 1. 打开聊天资料编辑页
window.openMyChatProfile = async function() {
  if (!currentChatId) return;
  
  // 关闭底部面板
  closeActionSheet();
  
  // 1. 获取专属资料
  const chatProfiles = await getData('my_chat_profiles') || {};
  const localProfile = chatProfiles[currentChatId]; // 可能为 undefined
  
  // 2. 获取全局资料
  const [gName, gGender, gRegion, gAvatar, gPersona] = await Promise.all([
      getData('userName'), 
      getData('gender'), 
      getData('region'), 
      getData('avatar'), 
      getData('userPersona')
  ]);

  // 3. 决定显示什么 (如果设定了专属资料就用专属的，否则预填全局资料)
  // 注意：如果 localProfile 存在，即使属性为空字符串，也应该显示为空（代表用户特意清空了）
  // 但如果 localProfile 根本不存在，则显示全局资料
  
  const nickname = localProfile ? (localProfile.nickname || '') : (gName || '');
  const gender = localProfile ? (localProfile.gender || '') : (gGender || '');
  const region = localProfile ? (localProfile.region || '') : (gRegion || '');
  const persona = localProfile ? (localProfile.persona || '') : (gPersona || '');
  
  // 头像逻辑
  let displayAvatar = '';
  if (localProfile && localProfile.avatar !== undefined) {
      displayAvatar = localProfile.avatar; // 可能是 null
  } else {
      displayAvatar = gAvatar; // 预填全局头像
  }

  // ★★★ 关键：初始化临时头像变量，确保不修改直接保存时也能保存全局头像
  tempMcpAvatar = displayAvatar || '';

  // 4. 回填到界面
  document.getElementById('mcpNickname').value = nickname;
  document.getElementById('mcpGender').value = gender;
  document.getElementById('mcpRegion').value = region;
  document.getElementById('mcpPersona').value = persona;
  
  const avatarPreview = document.getElementById('mcpAvatarPreview');
  if (displayAvatar) {
    avatarPreview.style.backgroundImage = `url(${displayAvatar})`;
    avatarPreview.textContent = '';
  } else {
    avatarPreview.style.backgroundImage = '';
    avatarPreview.textContent = '点击更换';
  }
  
  showPage(document.getElementById('myChatProfilePage'));
};

// 2. 头像上传逻辑
let tempMcpAvatar = '';
document.getElementById('mcpAvatarPreview').addEventListener('click', () => {
  document.getElementById('mcpAvatarInput').click();
});

document.getElementById('mcpAvatarInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (event) => {
      tempMcpAvatar = event.target.result;
      const preview = document.getElementById('mcpAvatarPreview');
      preview.style.backgroundImage = `url(${tempMcpAvatar})`;
      preview.textContent = '';
    };
    reader.readAsDataURL(file);
  }
});

// 3. 保存按钮逻辑
document.getElementById('mcpSaveBtn').addEventListener('click', async () => {
  if (!currentChatId) return;
  
  // 收集表单数据
  const newProfile = {
    nickname: document.getElementById('mcpNickname').value.trim(),
    gender: document.getElementById('mcpGender').value,
    region: document.getElementById('mcpRegion').value.trim(),
    persona: document.getElementById('mcpPersona').value.trim(),
    avatar: tempMcpAvatar || null
  };
  
  // 保存到数据库
  const chatProfiles = await getData('my_chat_profiles') || {};
  chatProfiles[currentChatId] = newProfile;
  await saveData('my_chat_profiles', chatProfiles);
  
  // 更新聊天窗口的头像显示
  updateChatUserAvatar();
  
  customAlert('保存成功');
  showPage(document.getElementById('chatRoomPage'));
});

// 4. 返回按钮
document.getElementById('mcpBackBtn').addEventListener('click', () => {
  showPage(document.getElementById('chatRoomPage'));
});

// 5. 恢复全局资料按钮
document.getElementById('mcpRestoreBtn').addEventListener('click', async () => {
  if (!currentChatId) return;
  
  if (await customConfirm('确定要将当前聊天的资料恢复为全局设置吗？')) {
    // 1. 读取全局资料
    const [gName, gGender, gRegion, gAvatar, gPersona] = await Promise.all([
        getData('userName'), 
        getData('gender'), 
        getData('region'), 
        getData('avatar'), 
        getData('userPersona')
    ]);
    
    // 2. 填充到表单
    document.getElementById('mcpNickname').value = gName || '';
    document.getElementById('mcpGender').value = gGender || '';
    document.getElementById('mcpRegion').value = gRegion || '';
    document.getElementById('mcpPersona').value = gPersona || '';
    
    const avatarPreview = document.getElementById('mcpAvatarPreview');
    if (gAvatar) {
      avatarPreview.style.backgroundImage = `url(${gAvatar})`;
      avatarPreview.textContent = '';
      tempMcpAvatar = gAvatar;
    } else {
      avatarPreview.style.backgroundImage = '';
      avatarPreview.textContent = '点击更换';
      tempMcpAvatar = '';
    }
    
    customAlert('已恢复为全局资料，请点击右上角"保存"按钮');
  }
});

// 6. 辅助函数：更新聊天界面中用户自己的头像
async function updateChatUserAvatar() {
  const chatProfiles = await getData('my_chat_profiles') || {};
  const profile = chatProfiles[currentChatId];
  
  if (profile && profile.avatar) {
    userAvatarUrl = profile.avatar; // 更新全局变量
  } else {
    userAvatarUrl = await getData('avatar') || ''; // 使用全局头像
  }
  
  // 刷新已显示的消息头像
  document.querySelectorAll('.message-bubble.self .msg-avatar').forEach(avatar => {
    if (userAvatarUrl) {
      avatar.style.backgroundImage = `url(${userAvatarUrl})`;
      avatar.textContent = '';
    } else {
      avatar.style.backgroundImage = '';
      avatar.textContent = '我';
    }
  });
}

/* ========================================
   小鱼新增：微信草稿箱与图片发送核心逻辑
   ======================================== */

// 重新生成 (草稿箱模式 - 小鱼修复版：支持清除旧图片描述)
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

// ★★★ 小鱼修复：切换草稿 (支持群聊头像和名字显示) ★★★
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

// 3. 应用草稿辅助函数
async function applyWxDraft(baseMessages, draftGroup) {
    const key = 'chat_messages_' + currentChatId;
    const newHistory = [...baseMessages, ...draftGroup];
    
    await saveData(key, newHistory);
    await saveWxDrafts();
    
    // ★★★ 优化：只在必要时全量刷新（例如从外部调用） ★★★
    // 如果是切换草稿/重新生成调用，它们已经自己处理了DOM更新
    // 这里只刷新数据库，不触发界面重绘
}

// 4. 发送图片逻辑 (修复版：支持分句模式)
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
/* ★ 小鱼新增：草稿箱数据持久化核心函数 */

// 保存当前草稿箱状态到数据库
async function saveWxDrafts() {
    if (!currentChatId) return;
    const key = 'chat_drafts_' + currentChatId;
    if (wxDrafts.length > 0) {
        await saveData(key, { drafts: wxDrafts, idx: wxCurrentDraftIdx });
    } else {
        await saveData(key, null); // 如果为空，清除数据库记录
    }
}

// 读取草稿箱状态
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

// ★★★ 小鱼新增：表情面板滑动切换逻辑 + 滚动优化 ★★★
const stickerGridEl = document.getElementById('chatStickerGrid');
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

// ★★★ 小鱼新增：打开全屏查看器 ★★★
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

// 1. 打开语音输入弹窗
function openVoiceInputModal() {
    closeActionSheet(); // 关闭底部面板
    document.getElementById('voiceInputModal').style.display = 'flex';
    document.getElementById('voiceTextInput').value = '';
    document.getElementById('voiceTextInput').focus();
}

// 2. 发送语音消息
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

// 3. 播放语音动画 + 显示底部文字
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

/* ========================================
   小鱼新增：开启新话题与存档系统 (终极版)
   ======================================== */

// 1. 将新页面加入页面管理器
allFullscreenPages.push(document.getElementById('topicArchivePage'));

// 2. 开启新话题流程
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

// 3. 执行存档并重置
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

// 4. 打开存档列表页
window.openArchivePage = async function() {
    if (!currentChatId) return;
    await renderArchiveList();
    showPage(document.getElementById('topicArchivePage'));
};

// 5. 渲染存档列表
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

// 6. 预览存档详情
let currentViewingArchiveId = null;

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

// 7. 恢复存档按钮逻辑
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

// 8. 删除存档按钮逻辑
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

/* --- 小鱼新增：底部面板滑动逻辑 --- */
const actionSwiperWindow = document.getElementById('actionSwiperWindow');
const actionSheetTrack = document.getElementById('actionSheetTrack');
const actionIndicators = document.querySelectorAll('.indicator-dot');

let actionCurrentPage = 0;
let actionTouchStartX = 0;
let actionTouchMoveX = 0;
const actionTotalPages = 2; // 总页数

// 1. 触摸开始
if (actionSwiperWindow) {
  actionSwiperWindow.addEventListener('touchstart', (e) => {
    actionTouchStartX = e.touches[0].clientX;
  }, { passive: true });

  // 2. 触摸结束 (判断滑动方向)
  actionSwiperWindow.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = actionTouchStartX - touchEndX;
    const threshold = 50; // 滑动阈值

    if (diff > threshold) {
      // 向左滑 -> 下一页
      if (actionCurrentPage < actionTotalPages - 1) {
        actionCurrentPage++;
      }
    } else if (diff < -threshold) {
      // 向右滑 -> 上一页
      if (actionCurrentPage > 0) {
        actionCurrentPage--;
      }
    }
    
    updateActionSwiper();
  }, { passive: true });
}

// 更新滑动位置和指示点
function updateActionSwiper() {
  // 移动轨道 (0% -> -50% -> -100% ...)
  // 注意：因为宽度是 200%，所以移动一页是移动整个宽度的 50%
  const translateVal = actionCurrentPage * 50; 
  actionSheetTrack.style.transform = `translateX(-${translateVal}%)`;
  
  // 更新指示点
  actionIndicators.forEach((dot, index) => {
    dot.classList.toggle('active', index === actionCurrentPage);
  });
}

/* --- 小鱼新增：内部相机控制逻辑 (定格/重拍版) --- */
let cameraStream = null;
let currentFacingMode = 'environment'; // 默认后置摄像头
let capturedBlob = null; // 存储拍照后的数据

// 1. 打开相机入口
async function openCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      await startCameraStream();
      document.getElementById('internalCameraModal').style.display = 'flex';
      resetCameraUI(); // 每次打开都重置界面状态
    } catch (err) {
      console.error("相机启动失败:", err);
      document.getElementById('cameraInput').click();
    }
  } else {
    document.getElementById('cameraInput').click();
  }
}

// 2. 启动视频流
async function startCameraStream() {
  if (cameraStream) stopCameraStream();

  const constraints = {
    audio: false,
    video: {
      facingMode: currentFacingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  };

  cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
  const videoEl = document.getElementById('cameraVideo');
  videoEl.srcObject = cameraStream;
  videoEl.play();
}

// 3. 停止视频流
function stopCameraStream() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
}

// 4. 关闭相机界面
function closeInternalCamera() {
  stopCameraStream();
  document.getElementById('internalCameraModal').style.display = 'none';
}

// 5. 切换前后摄像头
async function switchCamera() {
  currentFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment';
  await startCameraStream();
}

// 6. ★★★ 拍照并定格 (核心修改) ★★★
function takePhoto() {
  const videoEl = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvas');
  const context = canvas.getContext('2d');

  // 设置画布尺寸与视频一致
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;

  // 绘制当前帧 (定格)
  context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

  // 切换显示：隐藏视频，显示画布(定格画面)
  videoEl.style.display = 'none';
  canvas.style.display = 'block';

  // 切换按钮状态
  updateUIForReview();
}

// 7. ★★★ 重拍 (核心新增) ★★★
function retakePhoto() {
  const videoEl = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvas');

  // 切换显示：隐藏画布，显示视频(继续预览)
  canvas.style.display = 'none';
  videoEl.style.display = 'block';

  // 恢复按钮状态
  resetCameraUI();
}

// 8. ★★★ 确认发送 (核心新增) ★★★
function confirmSendPhoto() {
  const canvas = document.getElementById('cameraCanvas');
  // 转换为图片数据
  const imgUrl = canvas.toDataURL('image/jpeg', 0.8);
  
  // 发送
  sendCapturedImage(imgUrl);
  
  // 关闭
  closeInternalCamera();
}

// 辅助：重置UI到预览状态
function resetCameraUI() {
  const leftBtn = document.getElementById('cameraLeftBtn');
  const rightBtn = document.getElementById('cameraRightBtn');
  const shutterBtn = document.getElementById('cameraShutterBtn');
  const videoEl = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvas');

  // 显示视频，隐藏画布
  videoEl.style.display = 'block';
  canvas.style.display = 'none';

  // 中间快门显示
  shutterBtn.style.display = 'block';

  // 左侧：关闭图标
  leftBtn.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  leftBtn.onclick = closeInternalCamera; // 绑定关闭事件

  // 右侧：切换图标
  rightBtn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>';
  rightBtn.onclick = switchCamera; // 绑定切换事件
}

// 辅助：更新UI到定格/预览状态
function updateUIForReview() {
  const leftBtn = document.getElementById('cameraLeftBtn');
  const rightBtn = document.getElementById('cameraRightBtn');
  const shutterBtn = document.getElementById('cameraShutterBtn');

  // 中间快门隐藏
  shutterBtn.style.display = 'none';

  // 左侧：变为"重拍" (刷新循环箭头图标)
  leftBtn.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="1 4 1 10 7 10"></polyline>
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
    </svg>
  `;
  leftBtn.onclick = retakePhoto; // 绑定重拍事件

  // 右侧：变为"发送" (绿色圆圈+白色对勾)
  rightBtn.innerHTML = `
    <div style="width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
  `;
  rightBtn.onclick = confirmSendPhoto; // 绑定发送事件
}

// 小鱼新增：通用图片压缩函数 (提升为全局，方便复用)
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                let width = img.width;
                let height = img.height;
                const maxSize = 1024; // Max width/height for moments images

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
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
                resolve(compressedBase64);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// 9. Image compression utility (reused from chat image sending)
// This function needs to be defined once globally or within the scope
// where it's used. I'll put it here for now.
async function sendCapturedImage(imgUrl) {
  if (!currentChatId) return;

  if (typeof aiReplyMode !== 'undefined' && aiReplyMode === 'immediate') {
      splitMsgQueue.push(imgUrl);
      renderSplitQueue();
      checkSendBtnVisibility();
      return;
  }

  if (typeof wxDrafts !== 'undefined') wxDrafts = [];
  await saveData('chat_drafts_' + currentChatId, null);
  const existingToolbar = document.querySelector('.wx-draft-toolbar');
  if (existingToolbar) existingToolbar.remove();

  const msg = {
      role: 'user',
      type: 'sticker',
      content: imgUrl,
      desc: '拍摄照片',
      timestamp: Date.now()
  };

  await saveMessage(currentChatId, msg);
  appendMessageToUI(msg);
  scrollToBottom();
  await updateChatList(currentChatId, '[图片]', Date.now());
}
/* ========================================
   小鱼新增：相册多功能逻辑 (本地/虚拟图片)
   ======================================== */

// 1. 打开相册选择菜单
function openAlbumChoiceMenu() {
  closeActionSheet(); // 关闭底部的功能面板
  document.getElementById('albumChoiceOverlay').style.display = 'flex';
}

// 2. 触发本地上传 (原来的功能)
function triggerLocalUpload() {
  document.getElementById('albumChoiceOverlay').style.display = 'none';
  document.getElementById('chatImageInput').click();
}

// 3. 打开文字图片输入框
function openTextImageModal() {
  document.getElementById('albumChoiceOverlay').style.display = 'none';
  document.getElementById('textImageModal').style.display = 'flex';
  document.getElementById('textImageDescInput').value = ''; // 清空输入
  document.getElementById('textImageDescInput').focus();
}

// 4. 发送虚拟文字图片 (用户版 - 已调用通用工具)
async function sendVirtualTextImage() {
  const desc = document.getElementById('textImageDescInput').value.trim();
  if (!desc) {
    customAlert('请填写图片描述');
    return;
  }
  
  document.getElementById('textImageModal').style.display = 'none';

  // ★ 调用通用工具生成图片
  const base64Img = getVirtualImageBase64();

  // 如果是分句模式
  if (typeof aiReplyMode !== 'undefined' && aiReplyMode === 'immediate') {
      splitMsgQueue.push(base64Img); 
      renderSplitQueue();
      checkSendBtnVisibility();
      return;
  }

  // 清空草稿箱
  if (typeof wxDrafts !== 'undefined') wxDrafts = [];
  if (currentChatId) await saveData('chat_drafts_' + currentChatId, null);
  const existingToolbar = document.querySelector('.wx-draft-toolbar');
  if (existingToolbar) existingToolbar.remove();

  const msg = {
      role: 'user',
      type: 'sticker',
      content: base64Img,
      ai_description: desc, // 用户输入的描述
      desc: '虚拟图片',
      timestamp: Date.now()
  };

  if (currentChatId) {
      await saveMessage(currentChatId, msg);
      appendMessageToUI(msg);
      scrollToBottom();
      await updateChatList(currentChatId, '[图片]', Date.now());
  }
}

// 绑定遮罩层点击关闭
document.getElementById('albumChoiceOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'albumChoiceOverlay') e.target.style.display = 'none';
});
// --- 小鱼新增：通用虚拟图片生成器 (确保用户和AI发的图长得一样) ---
function getVirtualImageBase64() {
  const svgString = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500" style="background-color: #F2F2F2;">
    <!-- 1. 白色卡片背景 -->
    <rect x="20" y="20" width="360" height="460" rx="12" ry="12" fill="white" stroke="#E0E0E0" stroke-width="2"/>
    <!-- 2. 中间的风景画图标 -->
    <g transform="translate(100, 140)">
      <rect x="0" y="0" width="200" height="150" rx="8" fill="#F7F7F7" stroke="#DDDDDD" stroke-width="2"/>
      <circle cx="150" cy="50" r="18" fill="#DDDDDD"/>
      <path d="M0 150 L80 60 L160 150 Z" fill="#CCCCCC"/>
      <path d="M100 150 L150 90 L200 150 Z" fill="#E0E0E0"/>
    </g>
    <!-- 3. 底部文字提示 -->
    <text x="50%" y="80%" text-anchor="middle" fill="#333333" font-size="22" font-weight="bold" font-family="sans-serif">虚拟图片</text>
    <text x="50%" y="86%" text-anchor="middle" fill="#CCCCCC" font-size="12" font-family="sans-serif">左滑翻转查看详情</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
}

/* ========================================
   小鱼新增：群聊功能逻辑
   ======================================== */
const menuGroupChat = document.getElementById('menuGroupChat');
const menuAddFriend = document.getElementById('menuAddFriend');
const groupSelectPage = document.getElementById('groupSelectPage');
const closeGroupSelect = document.getElementById('closeGroupSelect');
const groupContactList = document.getElementById('groupContactList');
const createGroupBtn = document.getElementById('createGroupBtn');

let selectedGroupMembers = new Set(); // 存储被选中的联系人ID

// A. 点击菜单中的"添加朋友" -> 走原来的逻辑
menuAddFriend.addEventListener('click', async () => {
    // 复用原来的选择弹窗逻辑
    const contacts = await getData('customContacts') || [];
    
    // ★★★ 核心修改：过滤掉群聊，只显示单人联系人 ★★★
    const validContacts = contacts.filter(c => !c.isGroup);
    
    selectContactList.innerHTML = '';
    if (validContacts.length === 0) {
        selectContactList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">通讯录暂无角色</div>';
    } else {
        validContacts.forEach(contact => {
            const div = document.createElement('div');
            div.className = 'contact-item';
            div.style.padding = '10px 15px';
            
            // ★★★ 修改：使用默认头像 ★★★
            const displayAvatar = contact.avatar || 'https://iili.io/fkc3RwJ.jpg';
            div.innerHTML = `
                <div class="contact-icon" style="background-image: url(${displayAvatar}); background-size: cover; background-color: #ccc;"></div>
                <span class="contact-name">${contact.nickname}</span>
            `;
            div.onclick = () => startChat(contact);
            selectContactList.appendChild(div);
        });
    }
    selectContactOverlay.style.display = 'flex';
});

// B. 点击菜单中的“发起群聊” -> 打开多选页面
menuGroupChat.addEventListener('click', async () => {
    groupOperationMode = 'create'; // ★ 标记为创建模式
    document.querySelector('#groupSelectPage h1').textContent = '发起群聊'; // 恢复标题
    
    selectedGroupMembers.clear();
    updateCreateGroupBtn();
    
    const contacts = await getData('customContacts') || [];
    groupContactList.innerHTML = '';

    // ★★★ 小鱼修改：过滤掉群聊，只保留单人好友 ★★★
const validContacts = contacts.filter(c => !c.isGroup);

if (validContacts.length === 0) {
    groupContactList.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">暂无好友，无法建群</div>';
} else {
    validContacts.forEach(contact => {
        const row = document.createElement('div');
        row.className = 'group-contact-row';
            row.innerHTML = `
                <div class="group-checkbox"></div>
                <div class="contact-icon" style="background-image: url(${contact.avatar || ''}); background-size: cover; background-color: #ccc; width: 40px; height: 40px; margin-right: 12px;">${!contact.avatar ? contact.nickname[0] : ''}</div>
                <span class="contact-name">${contact.nickname}</span>
            `;
            // 点击行，切换选中状态
            row.onclick = () => {
                row.classList.toggle('selected');
                if (selectedGroupMembers.has(contact.id)) {
                    selectedGroupMembers.delete(contact.id);
                } else {
                    selectedGroupMembers.add(contact.id);
                }
                updateCreateGroupBtn();
            };
            groupContactList.appendChild(row);
        });
    }
    
    showPage(groupSelectPage);
});

// C. 关闭群聊选择页 (小鱼修改：智能判断返回路径)
closeGroupSelect.addEventListener('click', () => {
    // 如果是"新建群聊"模式，取消后返回首页
    if (groupOperationMode === 'create') {
        showPage(mainApp);
    } 
    // 如果是"加人"或"减人"模式，取消后返回聊天信息页
    else {
        showPage(document.getElementById('chatInfoPage'));
    }
});

// D. 更新“完成”按钮状态
function updateCreateGroupBtn() {
    const count = selectedGroupMembers.size;
    createGroupBtn.textContent = `完成(${count})`;
    if (count > 0) {
        createGroupBtn.classList.add('active');
    } else {
        createGroupBtn.classList.remove('active');
    }
}

// ★★★ 小鱼新增：群聊管理核心逻辑 (加人/减人/新建) ★★★
let groupOperationMode = 'create'; // create, add, remove

// 1. 打开管理页面 (由+和-按钮调用)
window.openGroupManage = async function(mode) {
    if (!currentChatId) return;
    groupOperationMode = mode;
    selectedGroupMembers.clear();
    
    // 获取当前群聊信息
    const contacts = await getData('customContacts') || [];
    const currentGroup = contacts.find(c => c.id === currentChatId);
    if (!currentGroup) return;
    
    const currentMemberIds = currentGroup.memberIds || [];
    
    // 设置界面文案
    const pageTitle = document.querySelector('#groupSelectPage h1');
    const btn = document.getElementById('createGroupBtn');
    
    if (mode === 'add') {
        pageTitle.textContent = '选择联系人';
        // 过滤出“不在群里”的联系人
        const availableContacts = contacts.filter(c => !c.isGroup && !currentMemberIds.includes(c.id));
        renderGroupSelect(availableContacts);
    } else {
        pageTitle.textContent = `聊天成员(${currentMemberIds.length - 1})`; // 减去自己
        // 过滤出“在群里”的联系人 (排除自己)
        const currentMembers = contacts.filter(c => currentMemberIds.includes(c.id) && c.id !== 'user_self');
        renderGroupSelect(currentMembers);
    }
    
    updateCreateGroupBtn(); // 刷新按钮文字
    showPage(groupSelectPage);
};

// 2. 渲染选择列表的辅助函数
function renderGroupSelect(displayContacts) {
    groupContactList.innerHTML = '';
    if (displayContacts.length === 0) {
        groupContactList.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">没有可选择的联系人</div>';
        return;
    }
    
    displayContacts.forEach(contact => {
        const row = document.createElement('div');
        row.className = 'group-contact-row';
        row.innerHTML = `
            <div class="group-checkbox"></div>
            <div class="contact-icon" style="background-image: url(${contact.avatar || ''}); background-size: cover; background-color: #ccc; width: 40px; height: 40px; margin-right: 12px;">${!contact.avatar ? contact.nickname[0] : ''}</div>
            <span class="contact-name">${contact.nickname}</span>
        `;
        row.onclick = () => {
            row.classList.toggle('selected');
            if (selectedGroupMembers.has(contact.id)) {
                selectedGroupMembers.delete(contact.id);
            } else {
                selectedGroupMembers.add(contact.id);
            }
            updateCreateGroupBtn();
        };
        groupContactList.appendChild(row);
    });
}

// 3. 更新按钮文字 (适配不同模式)
function updateCreateGroupBtn() {
    const count = selectedGroupMembers.size;
    const btn = document.getElementById('createGroupBtn');
    
    if (groupOperationMode === 'create') {
        btn.textContent = `完成(${count})`;
        btn.style.color = '#FFFFFF';
        btn.style.background = count > 0 ? 'var(--primary-color)' : '#E2E2E2';
    } else if (groupOperationMode === 'add') {
        btn.textContent = `完成(${count})`;
        btn.style.color = '#FFFFFF';
        btn.style.background = count > 0 ? 'var(--primary-color)' : '#E2E2E2';
    } else {
        // 删除模式
        btn.textContent = `删除(${count})`;
        btn.style.color = '#FFFFFF';
        btn.style.background = count > 0 ? '#FA5151' : '#E2E2E2'; // 红色按钮
    }
    
    if (count > 0) btn.classList.add('active');
    else btn.classList.remove('active');
}

// E. 点击"完成/删除"按钮 -> 执行逻辑
createGroupBtn.addEventListener('click', async () => {
    if (selectedGroupMembers.size === 0) return;
    
    let contacts = await getData('customContacts') || [];

    // === 情况1: 新建群聊 ===
    if (groupOperationMode === 'create') {
        const members = contacts.filter(c => selectedGroupMembers.has(c.id));
        let groupName = members.slice(0, 3).map(c => c.nickname).join('、');
        if (members.length > 3) groupName += `等${members.length}人`;

        const groupId = 'group_' + Date.now();
        const finalMemberIds = ['user_self', ...Array.from(selectedGroupMembers)];

        const newGroup = {
            id: groupId,
            nickname: groupName,
            realName: groupName,
            avatar: '',
            isGroup: true,
            memberIds: finalMemberIds,
            persona: '这是一个群聊。你(AI)需要同时扮演所有群成员。',
            allowedStickerLibs: [],
            worldBookIds: []
        };

        contacts.push(newGroup);
        await saveData('customContacts', contacts);
        if (typeof renderCustomContacts === 'function') renderCustomContacts(contacts);
        
        // ★ 修改：先启动聊天，再显示聊天信息页
        await startChat(newGroup);
        // 模拟点击聊天窗口右上角的三个点按钮，进入聊天信息页
        setTimeout(() => {
            document.getElementById('chatInfoEntryBtn').click();
        }, 300);
    } 
    
    // === 情况2: 添加成员 ===
else if (groupOperationMode === 'add') {
    const groupIndex = contacts.findIndex(c => c.id === currentChatId);
    if (groupIndex !== -1) {
        const newIds = Array.from(selectedGroupMembers);
        contacts[groupIndex].memberIds.push(...newIds);
        await saveData('customContacts', contacts);
        
        // ★ 核心修复：直接调用全局渲染函数，确保刷新
        await window.renderChatInfoPage();
        
        setTimeout(() => {
            customAlert(`已添加 ${newIds.length} 位成员`);
        }, 100);
    }
}

// === 情况3: 删除成员 ===
else if (groupOperationMode === 'remove') {
    const groupIndex = contacts.findIndex(c => c.id === currentChatId);
    if (groupIndex !== -1) {
        const idsToRemove = Array.from(selectedGroupMembers);
        contacts[groupIndex].memberIds = contacts[groupIndex].memberIds.filter(id => !idsToRemove.includes(id));
        await saveData('customContacts', contacts);
        
        // ★ 核心修复：直接调用全局渲染函数，确保刷新
        await window.renderChatInfoPage();
        
        setTimeout(() => {
            customAlert(`已移除 ${idsToRemove.length} 位成员`);
        }, 100);
    }
}
});

/* ========================================
   小鱼新增：聊天信息页的世界书管理系统
   ======================================== */

// 1. 打开世界书管理弹窗
window.openWorldBookManager = async function() {
    if (!currentChatId) return;
    
    // 读取当前角色已绑定的世界书ID
    const contact = await getContactDetails(currentChatId);
    const currentWorldBooks = contact.worldBookIds || [];
    
    // 渲染选择界面（复用之前写好的渲染函数）
    renderWorldBookOptionsForElement('worldBookSelectionArea', currentWorldBooks);
    
    // 显示弹窗
    document.getElementById('worldBookModal').style.display = 'flex';
};

// 2. 保存世界书选择
window.saveWorldBookSelection = async function() {
    if (!currentChatId) return;
    
    // 收集勾选的世界书ID
    const checkedBoxes = document.querySelectorAll('#worldBookSelectionArea .world-book-checkbox:checked');
    const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);
    
    // 保存到数据库
    let contacts = await getData('customContacts') || [];
    const contactIndex = contacts.findIndex(c => c.id === currentChatId);
    
    if (contactIndex !== -1) {
        contacts[contactIndex].worldBookIds = selectedIds;
        await saveData('customContacts', contacts);
        
        // 关闭弹窗并提示
        closeWorldBookModal();
        customAlert(`已绑定 ${selectedIds.length} 条世界书`);
    }
};

// 3. 关闭弹窗
window.closeWorldBookModal = function() {
    document.getElementById('worldBookModal').style.display = 'none';
};

// 4. 点击遮罩层关闭
document.getElementById('worldBookModal').addEventListener('click', (e) => {
    if (e.target.id === 'worldBookModal') {
        closeWorldBookModal();
    }
});

/* ========================================
   小鱼新增：群聊列表页逻辑
   ======================================== */

// 1. 将新页面加入页面管理器，防止返回失效
allFullscreenPages.push(document.getElementById('groupListPage'));

const groupChatsBtn = document.getElementById('groupChatsBtn');
const groupListPage = document.getElementById('groupListPage');
const groupListBackBtn = document.getElementById('groupListBackBtn');
const groupListContainer = document.getElementById('groupListContainer');
const groupListCount = document.getElementById('groupListCount');

// 2. 点击通讯录的"群聊"按钮 -> 进入列表页
groupChatsBtn.addEventListener('click', async () => {
    await renderGroupListPage();
    showPage(groupListPage);
});

// 3. 返回按钮
groupListBackBtn.addEventListener('click', () => {
    showPage(mainApp); // 返回主界面
});

// 4. 渲染群聊列表核心函数
async function renderGroupListPage() {
    const contacts = await getData('customContacts') || [];
    // 筛选出所有群聊
    const groups = contacts.filter(c => c.isGroup);
    
    groupListContainer.innerHTML = '';
    
    if (groups.length === 0) {
        groupListContainer.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">暂无群聊</div>';
    }

    // 使用 for...of 循环以支持 await
    for (const group of groups) {
        // 复用 getAvatarDom 生成九宫格头像
        const avatarHtml = await getAvatarDom(group, contacts);
        
        const div = document.createElement('div');
        div.className = 'contact-item'; // 复用通讯录条目样式
        div.style.borderBottom = '1px solid #F0F0F0';
        
        // 稍微缩小一点头像以适配列表 (50px -> 45px)
        div.innerHTML = `
            <div style="margin-right: 14px; transform: scale(0.9); transform-origin: left center;">${avatarHtml}</div>
            <span class="contact-name">${group.nickname}</span>
        `;
        
        // 点击进入聊天
        div.onclick = () => startChat(group.id);
        groupListContainer.appendChild(div);
    }
    
    // 更新底部计数
    groupListCount.textContent = `${groups.length}个群聊`;
}