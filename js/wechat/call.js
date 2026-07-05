/* 模块: js/call.js */

// [VariableDeclaration] Variables: callSystemHtml
const callSystemHtml = `
<style>
@keyframes callPulse {
    0% { box-shadow: 0 0 0 0 rgba(7, 193, 96, 0.7); }
    70% { box-shadow: 0 0 0 15px rgba(7, 193, 96, 0); }
    100% { box-shadow: 0 0 0 0 rgba(7, 193, 96, 0); }
}
</style>

<!-- 底部选择弹窗 -->
<div id="callSelectActionSheet" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:100000; align-items:flex-end;">
    <div style="width:100%; background:#F7F7F7; border-radius:16px 16px 0 0; overflow:hidden;">
        <div style="background:#fff; height:60px; display:flex; align-items:center; justify-content:center; font-size:17px; color:#333; border-bottom:1px solid #F0F0F0; cursor:pointer;" onclick="customAlert('暂未开放视频通话，请选择语音通话')">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:10px;"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            视频通话
        </div>
        <div id="startVoiceCallBtn" style="background:#fff; height:60px; display:flex; align-items:center; justify-content:center; font-size:17px; color:#333; cursor:pointer;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:10px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            语音通话
        </div>
        <div style="height:8px; background:#F7F7F7;"></div>
        <div onclick="document.getElementById('callSelectActionSheet').style.display='none'" style="background:#fff; height:60px; display:flex; align-items:center; justify-content:center; font-size:17px; color:#333; cursor:pointer;">取消</div>
    </div>
</div>

<!-- ★ 新增：AI主动来电界面 -->
<div id="incomingCallOverlay" style="display:none; position:fixed; inset:0; background:linear-gradient(180deg, #2A2D31 0%, #111214 100%); z-index:100001; flex-direction:column; align-items:center; padding-top:max(env(safe-area-inset-top), 40px); color:white; font-family:system-ui, sans-serif;">
    <div id="incomingMinimizeBtn" style="position:absolute; top:max(env(safe-area-inset-top), 20px); left:20px; padding:10px; cursor:pointer; z-index:100002;">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="4" width="12" height="12" rx="2" ry="2"></rect>
            <rect x="10" y="10" width="10" height="10" rx="2" ry="2"></rect>
        </svg>
    </div>
    
    <div id="incomingCallAvatar" style="width:110px; height:110px; border-radius:16px; background-size:cover; background-position:center; margin-top:10vh; margin-bottom:20px; box-shadow:0 10px 30px rgba(0,0,0,0.3);"></div>
    <div id="incomingCallName" style="font-size:28px; font-weight:500; margin-bottom:12px; letter-spacing:1px;"></div>
    
    <div style="margin-top:auto; margin-bottom:12vh; font-size:16px; color:#aaa; letter-spacing:1px;">邀请你语音通话...</div>
    
    <div style="display:flex; justify-content:space-around; width:100%; max-width:320px; padding:0 30px; margin-bottom:8vh; box-sizing:border-box;">
        <div id="incomingRejectBtn" style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <div style="width:72px; height:72px; border-radius:50%; background:#FA5151; display:flex; align-items:center; justify-content:center; margin-bottom:12px; box-shadow:0 4px 15px rgba(250,81,81,0.4);">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="white"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
            </div>
            <span style="font-size:14px; color:#aaa;">拒绝</span>
        </div>
        <div id="incomingAcceptBtn" style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <div style="width:72px; height:72px; border-radius:50%; background:#07C160; display:flex; align-items:center; justify-content:center; margin-bottom:12px; animation: callPulse 2s infinite;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <span style="font-size:14px; color:#aaa;">接听</span>
        </div>
    </div>
</div>

<!-- 全屏语音通话界面 -->
<div id="voiceCallOverlay" style="display:none; position:fixed; inset:0; background:linear-gradient(180deg, #2A2D31 0%, #111214 100%); z-index:100001; flex-direction:column; align-items:center; padding-top:max(env(safe-area-inset-top), 40px); color:white; font-family:system-ui, sans-serif;">
    
    <!-- 左上角小窗模式按钮 -->
    <div id="minimizeCallBtn" style="position:absolute; top:max(env(safe-area-inset-top), 30px); left:10px; padding:10px; cursor:pointer; z-index:100002;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="4" width="12" height="12" rx="2" ry="2"></rect>
            <rect x="10" y="10" width="10" height="10" rx="2" ry="2"></rect>
        </svg>
    </div>

    <!-- 右上角钟表按钮 -->
    <div id="openCallHistoryBtn" style="position:absolute; top:max(env(safe-area-inset-top), 30px); right:10px; padding:10px; cursor:pointer; z-index:100002;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
    </div>

    <div id="callAvatar" style="width:110px; height:110px; border-radius:16px; background-size:cover; background-position:center; margin-top:6vh; margin-bottom:20px; box-shadow:0 10px 30px rgba(0,0,0,0.3);"></div>
    <div id="callName" style="font-size:28px; font-weight:500; margin-bottom:12px; letter-spacing:1px;"></div>
    <div id="callStatus" style="font-size:15px; color:#888; margin-bottom:40px; letter-spacing:1px;">等待对方接受邀请...</div>
    
    <div id="callSubtitle" style="display:none; font-size:20px; color:white; text-align:center; padding:0 30px; margin-top:auto; margin-bottom:40px; min-height:60px; line-height:1.5; text-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
    
    <div style="display:flex; flex-direction:column-reverse; width:100%; margin-top:auto; margin-bottom:max(env(safe-area-inset-bottom), 20px);">
        <!-- 底部按钮区 -->
        <div style="display:flex; justify-content:space-between; width:100%; max-width:320px; padding:0 30px; margin:0 auto; box-sizing:border-box;">
            <div style="display:flex; flex-direction:column; align-items:center;">
                <div style="width:68px; height:68px; border-radius:50%; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; margin-bottom:12px;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                </div>
                <span style="font-size:13px; color:#aaa;">麦克风已开</span>
            </div>
            <div id="callHangupBtn" style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
                <div style="width:68px; height:68px; border-radius:50%; background:#FA5151; display:flex; align-items:center; justify-content:center; margin-bottom:12px; box-shadow:0 4px 15px rgba(250,81,81,0.4);">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="white"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
                </div>
                <span style="font-size:13px; color:#aaa;">取消</span>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center;">
                <div style="width:68px; height:68px; border-radius:50%; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; margin-bottom:12px;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                </div>
                <span style="font-size:13px; color:#aaa;">扬声器已关</span>
            </div>
        </div>
        
        <div id="callInputArea" style="display:none; width:100%; padding:15px 20px 20px 20px; box-sizing:border-box; background:transparent;">
            <div style="display:flex; gap:12px; align-items:center;">
                <input id="callInput" type="text" placeholder="回复对方..." style="flex:1; height:44px; border-radius:22px; border:none; padding:0 20px; outline:none; font-size:15px; background:rgba(255,255,255,0.18); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); color:white; box-shadow:inset 0 1px 3px rgba(0,0,0,0.2);">
                <button id="callSendBtn" style="width:64px; height:44px; border-radius:22px; background:rgba(7,193,96,0.85); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); color:white; border:none; font-size:15px; font-weight:600; cursor:pointer; box-shadow:0 2px 8px rgba(7,193,96,0.3);">发送</button>
            </div>
        </div>
    </div>
</div>

<!-- 通话记录半透明面板 -->
<div id="callHistoryPanel" style="display:none; position:fixed; inset:0; background:rgba(20,20,20,0.85); z-index:100003; flex-direction:column; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);">
    <div style="padding-top:max(env(safe-area-inset-top), 20px); background:rgba(20,20,20,0.5); flex-shrink:0;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:15px 24px; border-bottom:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:22px; font-weight:bold; color:white; letter-spacing:1px;">通话记录</div>
            <div id="closeCallHistoryBtn" style="cursor:pointer; padding:5px;">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
        </div>
    </div>
    <div id="callHistoryList" style="flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; padding:24px; box-sizing:border-box; overscroll-behavior-y:contain;"></div>
</div>

<!-- 全局悬浮小窗 -->
<div id="floatingCallWindow" style="display:none; position:fixed; top:max(env(safe-area-inset-top, 80px), 80px); left:auto; right:15px; width:72px; height:72px; background:white; border-radius:18px; box-shadow:0 6px 20px rgba(0,0,0,0.15); z-index:999999; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; transition:transform 0.2s ease;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#07C160" style="margin-bottom:4px;">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
    <span id="floatingCallTime" style="color:#07C160; font-size:15px; font-weight:600; font-variant-numeric:tabular-nums; letter-spacing:0.5px;">等待</span>
</div>
`;

// [ExpressionStatement] Execution: insertAdjacentHTML
document.body.insertAdjacentHTML('beforeend', callSystemHtml);

// [VariableDeclaration] Variables: isCallActive
let isCallActive = false;

// [VariableDeclaration] Variables: windowIsIncomingCall
let windowIsIncomingCall = false;

// [VariableDeclaration] Variables: callStartTime
let callStartTime = 0;

// [VariableDeclaration] Variables: callTimerInterval
let callTimerInterval = null;

// [VariableDeclaration] Variables: callVibrateInterval
let callVibrateInterval = null;

// [VariableDeclaration] Variables: currentCallHistory
let currentCallHistory = [];

// [VariableDeclaration] Variables: currentCallUserName
let currentCallUserName = '闻念';

// [VariableDeclaration] Variables: callInitiator
let callInitiator = 'user';

// [FunctionDeclaration] Function: startCallRing
async function startCallRing() {
    const ringtoneData = await getData('ringtone');
    const player = document.getElementById('ringtonePlayer');
    
    // 如果有设置铃声，优先播放铃声
    if (ringtoneData && ringtoneData.src && player) {
        player.src = ringtoneData.src;
        player.loop = true; // 循环播放
        player.play().catch(e => {
            console.warn("铃声自动播放受限，降级为振动", e);
            fallbackVibrate();
        });
    } else {
        // 没有铃声则直接振动
        fallbackVibrate();
    }
}

// [FunctionDeclaration] Function: fallbackVibrate
function fallbackVibrate() {
    if (navigator.vibrate) {
        // ★ 修复：更柔和的振动节奏（振动300ms，停顿1500ms）
        navigator.vibrate([300, 1500, 300, 1500]);
        if (callVibrateInterval) clearInterval(callVibrateInterval);
        callVibrateInterval = setInterval(() => navigator.vibrate([300, 1500]), 1800);
    }
}

// [FunctionDeclaration] Function: stopCallRing
function stopCallRing() {
    const player = document.getElementById('ringtonePlayer');
    if (player) {
        player.pause();
        player.currentTime = 0;
    }
    if (callVibrateInterval) clearInterval(callVibrateInterval);
    if (navigator.vibrate) navigator.vibrate(0); // 强制停止振动
}

// [VariableDeclaration] Variables: originalAppendMessageToUI
const originalAppendMessageToUI = appendMessageToUI;

// [ExpressionStatement] Execution: Expression
window.appendMessageToUI = function(msg, otherAvatar, isGroupChat = false) {
    // 1. 拦截新发出的来电指令
    if (msg.type === 'call_invite') {
        // 立即修改数据库中的类型，防止刷新页面时重复弹窗
        getData('chat_messages_' + currentChatId).then(msgs => {
            if (msgs) {
                const idx = msgs.findIndex(m => m.timestamp === msg.timestamp);
                if (idx !== -1) {
                    msgs[idx].type = 'call_invite_processed';
                    msgs[idx].content = '发起了语音通话 ᯅ';
                    msgs[idx].isHidden = true; // ★ 增加隐藏属性，防止首页列表预览显示
                    saveData('chat_messages_' + currentChatId, msgs);
                }
            }
        });

        const incomingOverlay = document.getElementById('incomingCallOverlay');
        if (incomingOverlay) {
            const avatarUrl = otherAvatar || 'https://iili.io/fkc3RwJ.jpg';
            document.getElementById('incomingCallAvatar').style.backgroundImage = `url(${avatarUrl})`;
            
            // 准确获取角色名称
            getData('customContacts').then(contacts => {
                const c = (contacts || []).find(x => x.id === currentChatId);
                const dName = msg.senderName || (c ? c.nickname : '对方');
                document.getElementById('incomingCallName').textContent = dName;
            });
            
            incomingOverlay.style.display = 'flex';
            windowIsIncomingCall = true;
            callInitiator = 'ai'; // ★ 标记为 AI 发起
            
            startCallRing(); // ★ 触发铃声或振动
        }
        return; // 拦截，不在聊天界面渲染
    }
    
    // 2. 处理历史记录中的来电指令（已处理过的）
    if (msg.type === 'call_invite_processed') {
        return; // ★ 彻底拦截，绝对不在聊天界面显示
    }
    
    originalAppendMessageToUI(msg, otherAvatar, isGroupChat);
};

// [ExpressionStatement] Execution: addEventListener
document.getElementById('incomingRejectBtn').addEventListener('click', async () => {
    document.getElementById('incomingCallOverlay').style.display = 'none';
    stopCallRing(); // ★ 停止铃声/振动
    windowIsIncomingCall = false;
    
    // ★ 以角色身份在聊天界面显示“已取消”
    const contact = await getContactDetails(currentChatId);
    const recordMsg = {
        role: 'assistant',
        type: 'text',
        content: '已拒绝 ᯅ',
        senderName: contact.nickname,
        timestamp: Date.now()
    };
    await saveMessage(currentChatId, recordMsg);
    originalAppendMessageToUI(recordMsg, contact.avatar, contact.isGroup);
    scrollToBottom();
    await updateChatList(currentChatId, '已拒绝 ᯅ', Date.now());
    
    // 告诉 AI 用户拒绝了
    const { apiMessages } = await buildApiMessages(currentChatId);
    apiMessages.push({
        role: 'user',
        content: `[系统提示] 用户拒绝了你的语音通话邀请。请用一两句话回复缓解尴尬或表达遗憾。`
    });
    try {
        const wechatApiConfig = await getApiConfigForWechat('wechat');
        let response = await callAIAPI(apiMessages, wechatApiConfig);
        await handleAIResponsePayload(response, contact, [], currentChatId, activeChatSessionToken);
    } catch(e) {}
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('incomingAcceptBtn').addEventListener('click', async () => {
    document.getElementById('incomingCallOverlay').style.display = 'none';
    stopCallRing(); // ★ 停止铃声/振动
    windowIsIncomingCall = false;
    
    document.getElementById('voiceCallOverlay').style.display = 'flex';
    document.getElementById('callAvatar').style.backgroundImage = document.getElementById('incomingCallAvatar').style.backgroundImage;
    document.getElementById('callName').textContent = document.getElementById('incomingCallName').textContent;
    document.getElementById('callStatus').textContent = '00:00';
    
    const subEl = document.getElementById('callSubtitle');
    subEl.style.display = 'block';
    subEl.textContent = '...';
    
    document.getElementById('callInputArea').style.display = 'none';
    document.querySelector('#callHangupBtn span').textContent = '挂断';
    
    isCallActive = true;
    callStartTime = Date.now();
    if (callTimerInterval) clearInterval(callTimerInterval);
    callTimerInterval = setInterval(() => {
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        const m = String(Math.floor(duration / 60)).padStart(2, '0');
        const s = String(duration % 60).padStart(2, '0');
        document.getElementById('callStatus').textContent = `${m}:${s}`;
        const floatingTimeEl = document.getElementById('floatingCallTime');
        if (floatingTimeEl) floatingTimeEl.textContent = `${m}:${s}`;
    }, 1000);
    
    currentCallHistory = [];
    currentCallUserName = await getData('userName') || '闻念';
    if (typeof renderCallHistory === 'function') renderCallHistory();
    
    const { apiMessages } = await buildApiMessages(currentChatId);
    apiMessages.push({
        role: 'user',
        content: `[系统提示] 用户已接听了你的语音通话。请直接说出 3~5 句开场白（严格使用 [{"type": "call_accept", "content": "第一句话"}, ...] 格式）`
    });
    
    await fetchAndPlayCallResponse(apiMessages);
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('incomingMinimizeBtn').addEventListener('click', () => {
    document.getElementById('incomingCallOverlay').style.display = 'none';
    const floatingWindow = document.getElementById('floatingCallWindow');
    floatingWindow.style.display = 'flex';
    document.getElementById('floatingCallTime').textContent = '来电中';
});

// [ExpressionStatement] Execution: Expression
window.renderCallHistory = function() {
    const listEl = document.getElementById('callHistoryList');
    if (!listEl) return;
    
    if (currentCallHistory.length === 0) {
        listEl.innerHTML = '<div style="text-align:center; color:rgba(255,255,255,0.4); margin-top:40px; font-size:14px;">暂无通话记录</div>';
        return;
    }
    
    listEl.innerHTML = currentCallHistory.map(item => {
        const isAI = item.role === 'ai';
        const nameColor = isAI ? '#E6D3A8' : '#C4A47C'; 
        
        const starIcon = isAI ? `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:4px; margin-top:-2px;">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>` : '';
            
        const voiceIcon = isAI ? `
            <div style="display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; border-radius:50%; background:rgba(255,255,255,0.15); margin-left:8px;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </div>` : '';
            
        const paddingLeft = isAI ? '20px' : '0px';
        
        return `
        <div style="display:flex; flex-direction:column; margin-bottom:24px; animation: fadeIn 0.3s ease;">
            <div style="display:flex; align-items:center; color:${nameColor}; font-size:15px; margin-bottom:8px;">
                ${starIcon}
                <span style="font-weight:500; letter-spacing:1px;">${item.name}</span>
                ${voiceIcon}
            </div>
            <div style="color:#F5F5F5; font-size:16px; line-height:1.6; padding-left:${paddingLeft}; letter-spacing:0.5px;">
                ${item.content}
            </div>
        </div>
        `;
    }).join('');
    
    listEl.scrollTop = listEl.scrollHeight;
};

// [ExpressionStatement] Execution: addEventListener
document.getElementById('openCallHistoryBtn').addEventListener('click', () => {
    document.getElementById('callHistoryPanel').style.display = 'flex';
    renderCallHistory(); 
    setTimeout(() => {
        const listEl = document.getElementById('callHistoryList');
        if (listEl) listEl.scrollTop = listEl.scrollHeight;
    }, 50);
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('closeCallHistoryBtn').addEventListener('click', () => {
    document.getElementById('callHistoryPanel').style.display = 'none';
});

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('DOMContentLoaded', () => {
    const historyList = document.getElementById('callHistoryList');
    if (historyList) {
        historyList.addEventListener('touchmove', (e) => {
            e.stopPropagation(); 
        }, { passive: false });
    }
});

// [VariableDeclaration] Variables: isDraggingCallWindow
let isDraggingCallWindow = false;

// [VariableDeclaration] Variables: callWindowStartX, callWindowStartY
let callWindowStartX, callWindowStartY;

// [VariableDeclaration] Variables: callWindowInitialLeft, callWindowInitialTop
let callWindowInitialLeft, callWindowInitialTop;

// [VariableDeclaration] Variables: floatingWindow
const floatingWindow = document.getElementById('floatingCallWindow');

// [ExpressionStatement] Execution: addEventListener
floatingWindow.addEventListener('touchstart', (e) => {
    isDraggingCallWindow = false;
    const touch = e.touches[0];
    callWindowStartX = touch.clientX;
    callWindowStartY = touch.clientY;
    
    const rect = floatingWindow.getBoundingClientRect();
    callWindowInitialLeft = rect.left;
    callWindowInitialTop = rect.top;
    
    floatingWindow.style.transition = 'none'; 
}, { passive: true });

// [ExpressionStatement] Execution: addEventListener
floatingWindow.addEventListener('touchmove', (e) => {
    if (!isCallActive && !windowIsIncomingCall) return;
    const touch = e.touches[0];
    const dx = touch.clientX - callWindowStartX;
    const dy = touch.clientY - callWindowStartY;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isDraggingCallWindow = true;
    }
    
    if (isDraggingCallWindow) {
        e.preventDefault(); 
        let newLeft = callWindowInitialLeft + dx;
        let newTop = callWindowInitialTop + dy;
        
        const maxX = window.innerWidth - floatingWindow.offsetWidth;
        const maxY = window.innerHeight - floatingWindow.offsetHeight;
        
        newLeft = Math.max(0, Math.min(newLeft, maxX));
        newTop = Math.max(0, Math.min(newTop, maxY));
        
        floatingWindow.style.left = newLeft + 'px';
        floatingWindow.style.top = newTop + 'px';
        floatingWindow.style.right = 'auto'; 
    }
}, { passive: false });

// [ExpressionStatement] Execution: addEventListener
floatingWindow.addEventListener('touchend', (e) => {
    if (!isCallActive && !windowIsIncomingCall) return;
    floatingWindow.style.transition = 'all 0.3s ease'; 
    if (isDraggingCallWindow) {
        const rect = floatingWindow.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        if (centerX < window.innerWidth / 2) {
            floatingWindow.style.left = '15px';
        } else {
            floatingWindow.style.left = (window.innerWidth - rect.width - 15) + 'px';
        }
    }
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('minimizeCallBtn').addEventListener('click', () => {
    document.getElementById('voiceCallOverlay').style.display = 'none';
    document.getElementById('callHistoryPanel').style.display = 'none'; 
    document.getElementById('floatingCallWindow').style.display = 'flex';
});

// [ExpressionStatement] Execution: addEventListener
floatingWindow.addEventListener('click', (e) => {
    if (isDraggingCallWindow) {
        e.stopPropagation();
        return; 
    }
    document.getElementById('floatingCallWindow').style.display = 'none';
    
    if (windowIsIncomingCall) {
        document.getElementById('incomingCallOverlay').style.display = 'flex';
    } else {
        document.getElementById('voiceCallOverlay').style.display = 'flex';
        const listEl = document.getElementById('callHistoryList');
        if(listEl) listEl.scrollTop = listEl.scrollHeight;
    }
});

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('DOMContentLoaded', () => {
    const actionItems = document.querySelectorAll('.action-item');
    let foundCallBtn = false;
    actionItems.forEach(item => {
        const textEl = item.querySelector('.action-text');
        if (textEl && textEl.textContent.trim() === '视频通话') {
            item.onclick = () => {
                closeActionSheet();
                document.getElementById('callSelectActionSheet').style.display = 'flex';
            };
            foundCallBtn = true;
        }
    });
    
    if (!foundCallBtn) {
        const track = document.getElementById('actionSheetTrack');
        if (track) {
            const firstPage = track.querySelector('.action-page');
            if (firstPage) {
                const callBtnHtml = `
                <div class="action-item" onclick="closeActionSheet(); document.getElementById('callSelectActionSheet').style.display = 'flex';">
                    <div class="action-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                    </div>
                    <span class="action-text">视频通话</span>
                </div>`;
                firstPage.insertAdjacentHTML('beforeend', callBtnHtml);
            }
        }
    }
});

// [VariableDeclaration] Variables: callAutoReplyTimer
let callAutoReplyTimer = null;

// [FunctionDeclaration] Function: resetCallAutoReplyTimer
function resetCallAutoReplyTimer() {
    if (callAutoReplyTimer) clearTimeout(callAutoReplyTimer);
    if (!isCallActive) return;
    
    callAutoReplyTimer = setTimeout(async () => {
        if (!isCallActive) return;
        const inputVal = document.getElementById('callInput').value.trim();
        if (inputVal !== '') {
            resetCallAutoReplyTimer();
            return;
        }
        
        document.getElementById('callSubtitle').textContent = '...';
        document.getElementById('callSubtitle').style.color = '#aaa';
        
        const { apiMessages } = await buildApiMessages(currentChatId);
        apiMessages.push({
            role: 'user',
            content: `[语音通话中] (用户长时间未说话) 请根据当前情境主动找话题、继续刚才的话题或询问用户在干嘛，必须根据人设生成 3~5 句连贯的回复（严格使用 [{"type": "call_accept", "content": "第一句话"}...] 格式）`
        });
        
        await fetchAndPlayCallResponse(apiMessages);
    }, 60000); 
}

// [FunctionDeclaration] Function: saveCallState
async function saveCallState() {
    if (!currentChatId) return;
    const state = isCallActive ? {
        chatId: currentChatId,
        startTime: callStartTime,
        history: currentCallHistory,
        userName: currentCallUserName,
        initiator: callInitiator,
        avatarUrl: document.getElementById('callAvatar') ? document.getElementById('callAvatar').style.backgroundImage : '',
        callerName: document.getElementById('callName') ? document.getElementById('callName').textContent : ''
    } : null;
    await saveData('active_call_state', state);
}

// [FunctionDeclaration] Function: restoreCallState
async function restoreCallState() {
    const state = await getData('active_call_state');
    if (!state || !state.chatId) return; // 没有残留通话，直接返回

    // 恢复全局变量
    currentChatId = state.chatId;
    currentCallHistory = state.history || [];
    currentCallUserName = state.userName || '闻念';
    callInitiator = state.initiator || 'user';
    callStartTime = state.startTime || 0;
    isCallActive = true;

    // 恢复悬浮小窗
    const floatingWindow = document.getElementById('floatingCallWindow');
    const floatingTimeEl = document.getElementById('floatingCallTime');

    if (floatingWindow) {
        floatingWindow.style.display = 'flex';
        floatingWindow.style.top = 'max(env(safe-area-inset-top, 80px), 80px)';
        floatingWindow.style.left = 'auto';
        floatingWindow.style.right = '15px';
    }

    // 恢复计时器（从真实开始时间推算，而非从0开始）
    if (callStartTime > 0 && floatingTimeEl) {
        const updateTime = () => {
            const duration = Math.floor((Date.now() - callStartTime) / 1000);
            const m = String(Math.floor(duration / 60)).padStart(2, '0');
            const s = String(duration % 60).padStart(2, '0');
            if (floatingTimeEl) floatingTimeEl.textContent = `${m}:${s}`;
            const statusEl = document.getElementById('callStatus');
            if (statusEl) statusEl.textContent = `${m}:${s}`;
        };
        updateTime(); // 立即更新一次，防止第一秒显示空白
        callTimerInterval = setInterval(updateTime, 1000);
    } else if (floatingTimeEl) {
        floatingTimeEl.textContent = '等待';
    }

    // 恢复全屏界面的头像和名字（供点击小窗后展示）
    const callAvatarEl = document.getElementById('callAvatar');
    const callNameEl = document.getElementById('callName');
    if (callAvatarEl && state.avatarUrl) callAvatarEl.style.backgroundImage = state.avatarUrl;
    if (callNameEl && state.callerName) callNameEl.textContent = state.callerName;

    // 同步刷新通话记录面板（数据已恢复，随时可以打开查看）
    if (typeof renderCallHistory === 'function') renderCallHistory();

    // ★ 核心修复：恢复全屏界面的字幕内容
    // 从历史记录中取出最后一条，回显到字幕框，让用户重新进入时不会看到空白
    const subEl = document.getElementById('callSubtitle');
    if (subEl && currentCallHistory.length > 0) {
        const lastRecord = currentCallHistory[currentCallHistory.length - 1];
        subEl.style.display = 'block';
        subEl.textContent = lastRecord.content;
        // 根据发言方决定字幕颜色：AI说的白色，用户说的绿色
        subEl.style.color = lastRecord.role === 'user' ? '#95EC69' : 'white';
    } else if (subEl && callStartTime > 0) {
        // 如果通话已接通但暂无记录（刚接通就退出了），显示省略号占位
        subEl.style.display = 'block';
        subEl.textContent = '...';
        subEl.style.color = '#aaa';
    }

    // ★ 同步恢复挂断按钮的文字（已接通显示"挂断"，等待中显示"取消"）
    const hangupSpan = document.querySelector('#callHangupBtn span');
    if (hangupSpan) {
        hangupSpan.textContent = callStartTime > 0 ? '挂断' : '取消';
    }

    console.log(`✅ 通话状态已恢复，聊天ID: ${currentChatId}，历史记录: ${currentCallHistory.length}条`);
}

// [FunctionDeclaration] Function: fetchAndPlayCallResponse
async function fetchAndPlayCallResponse(apiMessages) {
    if (callAutoReplyTimer) clearTimeout(callAutoReplyTimer); 
    try {
        const wechatApiConfig = await getApiConfigForWechat('wechat');
        let response = await callAIAPI(apiMessages, wechatApiConfig);
        
        let replyMsgs = [];
        try {
            let cleanStr = response.replace(/```json/g, '').replace(/```/g, '');
            const firstBracket = cleanStr.indexOf('[');
            const lastBracket = cleanStr.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
                const msgs = JSON.parse(cleanStr.substring(firstBracket, lastBracket + 1));
                replyMsgs = msgs.filter(m => m.type === 'call_accept' || m.type === 'text');
            } else {
                throw new Error("API未返回标准JSON数组");
            }
        } catch (parseError) {
            console.warn("通话解析降级：", parseError);
            const rawText = response.replace(/```.*/g, '').replace(/\[\{.*\}\]/g, '').trim();
            const sentences = rawText.split(/(?<=[。！？!?])/).filter(s => s.trim());
            replyMsgs = sentences.map(s => ({ content: s.trim() }));
        }
        
        const contact = await getContactDetails(currentChatId);
        
        for (const replyMsg of replyMsgs) {
            if (!isCallActive) break; 
            
            const subEl = document.getElementById('callSubtitle');
            subEl.style.display = 'block';
            subEl.textContent = replyMsg.content;
            subEl.style.color = 'white';
            
            currentCallHistory.push({
                role: 'ai',
                name: contact.realName || contact.nickname,
                content: replyMsg.content
            });
            if (typeof renderCallHistory === 'function') renderCallHistory();
            
            await saveCallState(); // ★ 每条新记录写入后立即持久化
            await new Promise(r => setTimeout(r, 2500));
        }
        resetCallAutoReplyTimer();
    } catch (e) {
        console.error(e);
        if (isCallActive) {
            document.getElementById('callSubtitle').textContent = `信号异常：${e.message || '网络连接失败'}`;
            document.getElementById('callSubtitle').style.color = '#FA5151';
            resetCallAutoReplyTimer(); 
        }
    }
}

// [ExpressionStatement] Execution: addEventListener
document.getElementById('callSendBtn').addEventListener('click', async () => {
    const input = document.getElementById('callInput');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    
    document.getElementById('callInputArea').style.display = 'none';
    
    document.getElementById('callSubtitle').textContent = text;
    document.getElementById('callSubtitle').style.color = '#95EC69'; 
    
    currentCallHistory.push({
        role: 'user',
        name: currentCallUserName,
        content: text
    });
    if (typeof renderCallHistory === 'function') renderCallHistory();
    
    const { apiMessages } = await buildApiMessages(currentChatId);
    apiMessages.push({
        role: 'user',
        content: `[语音通话中] 用户对你说："${text}"。请直接回复你接下来要说的话，必须根据人设生成 3~5 句连贯的回复（严格使用 [{"type": "call_accept", "content": "第一句话"}, {"type": "call_accept", "content": "第二句话"}...] 格式）`
    });
    
    await fetchAndPlayCallResponse(apiMessages);
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('callInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('callSendBtn').click();
});

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const buttonArea = document.querySelector('#voiceCallOverlay > div:last-child > div:first-child');
        if (buttonArea) {
            const micColumn = buttonArea.querySelector('div:first-child');
            if (micColumn) {
                micColumn.style.cursor = 'pointer';
                micColumn.onclick = () => {
                    const inputArea = document.getElementById('callInputArea');
                    if (inputArea.style.display === 'none' || !inputArea.style.display) {
                        inputArea.style.display = 'block';
                        setTimeout(() => document.getElementById('callInput').focus(), 100);
                    } else {
                        inputArea.style.display = 'none';
                    }
                };
            }
        }
    }, 300); 
});

// [VariableDeclaration] Variables: oldStartBtn
const oldStartBtn = document.getElementById('startVoiceCallBtn');

// [VariableDeclaration] Variables: newStartBtn
const newStartBtn = oldStartBtn.cloneNode(true);

// [ExpressionStatement] Execution: replaceChild
oldStartBtn.parentNode.replaceChild(newStartBtn, oldStartBtn);

// [ExpressionStatement] Execution: addEventListener
newStartBtn.addEventListener('click', async () => {
    if (!currentChatId) return;
    
    document.getElementById('callSelectActionSheet').style.display = 'none';
    document.getElementById('voiceCallOverlay').style.display = 'flex';
    document.getElementById('floatingCallWindow').style.display = 'none'; 
    
    document.getElementById('floatingCallWindow').style.top = 'max(env(safe-area-inset-top, 80px), 80px)';
    document.getElementById('floatingCallWindow').style.left = 'auto';
    document.getElementById('floatingCallWindow').style.right = '15px';
    
    const contact = await getContactDetails(currentChatId);
    document.getElementById('callAvatar').style.backgroundImage = `url(${contact.avatar || 'https://iili.io/fkc3RwJ.jpg'})`;
    document.getElementById('callName').textContent = contact.nickname;
    document.getElementById('callStatus').textContent = '等待对方接受邀请...';
    document.getElementById('floatingCallTime').textContent = '等待'; 
    document.getElementById('callSubtitle').style.display = 'none';
    document.getElementById('callInputArea').style.display = 'none';
    document.querySelector('#callHangupBtn span').textContent = '取消';
    
    currentCallHistory = [];
    currentCallUserName = await getData('userName') || '闻念';
    if (typeof renderCallHistory === 'function') renderCallHistory();
    
isCallActive = true;
windowIsIncomingCall = false;
callInitiator = 'user';
callStartTime = 0; 
if (callAutoReplyTimer) clearTimeout(callAutoReplyTimer);

await saveCallState(); // ★ 通话开始时立即持久化
startCallRing();

    const { apiMessages, availableStickers } = await buildApiMessages(currentChatId);
    
    apiMessages.push({
        role: 'user',
        content: `[系统级别绝对指令] 用户向你发起了语音通话。请根据当前情境和人设决定是否接听。
如果你想拒绝，必须严格回复 3~5 句话解释原因：[{"type": "call_reject", "content": "拒绝的理由1"}, {"type": "call_reject", "content": "理由2"}...]
如果你想接听，必须严格回复 3~5 句话作为开场白：[{"type": "call_accept", "content": "接通后的开场白1"}, {"type": "call_accept", "content": "开场白2"}...]
注意：只能选择其中一种状态，必须是JSON数组格式！`
    });

    try {
        const wechatApiConfig = await getApiConfigForWechat('wechat');
        let response = await callAIAPI(apiMessages, wechatApiConfig);
        await handleAIResponsePayload(response, contact, availableStickers, currentChatId, activeChatSessionToken);
        
        if (isCallActive) {
            resetCallAutoReplyTimer();
        }
    } catch (e) {
        console.error("通话请求失败", e);
        stopCallRing(); // ★ 报错时停止铃声
        clearInterval(callVibrateInterval);
        clearInterval(callTimerInterval);
        if (callAutoReplyTimer) clearTimeout(callAutoReplyTimer);
        document.getElementById('voiceCallOverlay').style.display = 'none';
        document.getElementById('floatingCallWindow').style.display = 'none';
        isCallActive = false;
        callStartTime = 0;
        
        const recordMsg = {
            role: 'user',
            type: 'text',
            content: '对方无响应 ᯅ',
            timestamp: Date.now()
        };
        await saveMessage(currentChatId, recordMsg);
        originalAppendMessageToUI(recordMsg, null, false);
        scrollToBottom();
        await updateChatList(currentChatId, '对方无响应 ᯅ', Date.now());
    }
});

// [VariableDeclaration] Variables: oldHangupBtn
const oldHangupBtn = document.getElementById('callHangupBtn');

// [VariableDeclaration] Variables: newHangupBtn
const newHangupBtn = oldHangupBtn.cloneNode(true);

// [ExpressionStatement] Execution: replaceChild
oldHangupBtn.parentNode.replaceChild(newHangupBtn, oldHangupBtn);

// [ExpressionStatement] Execution: addEventListener
newHangupBtn.addEventListener('click', async () => {
    if (!isCallActive) return;
    stopCallRing(); // ★ 主动挂断时停止铃声
    clearInterval(callVibrateInterval);
    clearInterval(callTimerInterval);
    if (callAutoReplyTimer) clearTimeout(callAutoReplyTimer); 
    document.getElementById('voiceCallOverlay').style.display = 'none';
    document.getElementById('callHistoryPanel').style.display = 'none'; 
    document.getElementById('floatingCallWindow').style.display = 'none'; 
    isCallActive = false;
    
    let recordText = '已取消 ᯅ';
    let isRealCall = false; 
    if (callStartTime > 0) {
        isRealCall = true;
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        const m = String(Math.floor(duration / 60)).padStart(2, '0');
        const s = String(duration % 60).padStart(2, '0');
        recordText = `通话时长 ${m}:${s} ᯅ`;
    }
    
    const contact = await getContactDetails(currentChatId);
    const recordRole = callInitiator === 'ai' ? 'assistant' : 'user';
    const recordMsg = {
        role: recordRole,
        type: 'text',
        content: recordText,
        senderName: recordRole === 'assistant' ? contact.nickname : undefined,
        timestamp: Date.now()
    };
    await saveMessage(currentChatId, recordMsg);
    originalAppendMessageToUI(recordMsg, recordRole === 'assistant' ? contact.avatar : null, contact.isGroup);
    scrollToBottom();
    await updateChatList(currentChatId, recordText, Date.now());
    
    callStartTime = 0;
await saveData('active_call_state', null); // ★ 通话结束后彻底清除持久化记录

if (isRealCall) {
        setTimeout(async () => {
            const { apiMessages, availableStickers } = await buildApiMessages(currentChatId);
            apiMessages.push({
                role: 'user',
                content: `[系统提示] 语音通话刚刚结束。请根据刚才的通话内容和人设，在微信聊天里主动发 3~5 条文字消息作为通话后的跟进（例如：叮嘱、道别、回味等）。严格使用 [{"type": "text", "content": "第一句话"}, {"type": "text", "content": "第二句话"}...] 格式。`
            });
            
            try {
                document.getElementById('chatTitle').textContent = '对方正在输入...';
                document.getElementById('chatTitle').classList.add('typing-blink-effect');
                
                const wechatApiConfig = await getApiConfigForWechat('wechat');
                let response = await callAIAPI(apiMessages, wechatApiConfig);
                await handleAIResponsePayload(response, contact, availableStickers, currentChatId, activeChatSessionToken);
            } catch (e) {
                console.error("通话后追击回复失败", e);
            }
        }, 800);
    }
});

