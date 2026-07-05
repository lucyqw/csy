/* 模块: js/transfer.js */

// [VariableDeclaration] Variables: currentTransferMoney
let currentTransferMoney = '';

// [VariableDeclaration] Variables: currentTransferNote
let currentTransferNote = '';

// [VariableDeclaration] Variables: currentTransferTargetId
let currentTransferTargetId = null;

// [ExpressionStatement] Execution: Expression
window.editTransferNote = async function() {
    const note = await customPrompt('请输入转账说明（最多60个字）：', currentTransferNote);
    if (note !== null) {
        currentTransferNote = note.trim().substring(0, 60); 
        const btn = document.getElementById('transferNoteBtn');
        if (currentTransferNote) {
            btn.innerHTML = `${currentTransferNote} <span style="color: #576B95; margin-left: 6px;">修改</span>`;
            btn.style.color = '#333'; 
        } else {
            btn.innerHTML = '添加转账说明';
            btn.style.color = '#576B95'; 
        }
    }
};

// [ExpressionStatement] Execution: Expression
window.openTransferPage = async function() {
  if (!currentChatId) return;
  closeActionSheet(); // 关闭底部菜单

  const contact = await getContactDetails(currentChatId);
  if (!contact) return;

  if (contact.isGroup) {
      // 群聊：打开选择收款方页面
      await renderGroupTransferSelect(contact);
      showPage(document.getElementById('groupTransferSelectPage'));
  } else {
      // 单聊：直接进入转账页
      currentTransferTargetId = currentChatId;
      await renderTransferPageUI(contact);
  }
};

// [FunctionDeclaration] Function: renderGroupTransferSelect
async function renderGroupTransferSelect(groupContact) {
    const listContainer = document.getElementById('groupTransferMemberList');
    listContainer.innerHTML = '';
    
    const allContacts = await getData('customContacts') || [];
    const memberIds = groupContact.memberIds || [];
    
    // 过滤出群成员，排除自己
    const members = allContacts.filter(c => memberIds.includes(c.id) && c.id !== 'user_self');
    
    if (members.length === 0) {
        listContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">群内没有其他成员</div>';
        return;
    }

    members.forEach(m => {
        const row = document.createElement('div');
        row.className = 'contact-item';
        row.style.borderBottom = '1px solid #F0F0F0';
        
        const displayAvatar = m.avatar || 'https://iili.io/fkc3RwJ.jpg';
        
        row.innerHTML = `
            <div class="contact-icon" style="background-image: url(${displayAvatar}); background-size: cover; background-color: #ccc; width: 40px; height: 40px; margin-right: 12px; border-radius: 4px;"></div>
            <span class="contact-name">${m.nickname}</span>
        `;
        
        // 点击某人后，记录目标ID，并跳转到输入金额页面
        row.onclick = async () => {
            currentTransferTargetId = m.id;
            await renderTransferPageUI(m);
        };
        
        listContainer.appendChild(row);
    });
}

// [ExpressionStatement] Execution: Expression
window.closeGroupTransferSelect = function() {
    showPage(document.getElementById('chatRoomPage'));
};

// [FunctionDeclaration] Function: renderTransferPageUI
async function renderTransferPageUI(targetContact) {
  let displayName = targetContact.nickname;
  if (targetContact.realName) {
    const lastChar = targetContact.realName.slice(-1);
    displayName = `${targetContact.nickname} (**${lastChar})`;
  } else {
    const lastChar = targetContact.nickname.slice(-1);
    displayName = `${targetContact.nickname} (**${lastChar})`;
  }

  let wxId = targetContact.wechatId || '未设置';
  
  document.getElementById('transferTargetName').textContent = `转账给 ${displayName}`;
  document.getElementById('transferTargetId').textContent = `微信号：${wxId}`;
  
  const avatarEl = document.getElementById('transferTargetAvatar');
  if (targetContact.avatar) {
    avatarEl.style.backgroundImage = `url(${targetContact.avatar})`;
    avatarEl.innerHTML = '';
  } else {
    avatarEl.style.backgroundImage = '';
    avatarEl.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>';
  }

  currentTransferMoney = '';
  currentTransferNote = ''; 
  document.getElementById('transferNoteBtn').innerHTML = '添加转账说明'; 
  document.getElementById('transferNoteBtn').style.color = '#576B95';
  
  updateMoneyDisplay();
  showPage(document.getElementById('transferPage'));
}

// [ExpressionStatement] Execution: Expression
window.closeTransferPage = async function() {
  const contact = await getContactDetails(currentChatId);
  if (contact && contact.isGroup) {
      showPage(document.getElementById('groupTransferSelectPage')); // 群聊退回选人
  } else {
      showPage(document.getElementById('chatRoomPage')); // 单聊退回聊天
  }
};

// [ExpressionStatement] Execution: Expression
window.inputMoney = function(key) {
  if (key === 'del') {
    currentTransferMoney = currentTransferMoney.slice(0, -1);
    updateMoneyDisplay();
    return;
  }
  if (key === '.') {
    if (currentTransferMoney === '') return;
    if (currentTransferMoney.includes('.')) return;
  }
  if (currentTransferMoney.includes('.')) {
    const parts = currentTransferMoney.split('.');
    if (parts[1].length >= 2) return;
  }
  if (parseFloat(currentTransferMoney + key) > 200000) return;

  currentTransferMoney += key;
  updateMoneyDisplay();
};

// [FunctionDeclaration] Function: updateMoneyDisplay
function updateMoneyDisplay() {
  const display = document.getElementById('transferAmountDisplay');
  const btn = document.getElementById('btnSendTransfer');
  
  if (currentTransferMoney === '') {
    display.innerHTML = '<span class="cursor-blink"></span>';
    btn.classList.add('disabled');
  } else {
    display.innerHTML = currentTransferMoney + '<span class="cursor-blink"></span>';
    btn.classList.remove('disabled');
  }
}

// [ExpressionStatement] Execution: Expression
window.confirmTransfer = async function() {
  const amount = parseFloat(currentTransferMoney);
  if (!amount || amount <= 0) return;

  showPage(document.getElementById('chatRoomPage')); // 确认后直接回聊天界面

  // 获取实际收款人信息
  const allContacts = await getData('customContacts') || [];
  const targetContact = allContacts.find(c => c.id === currentTransferTargetId);
  const targetName = targetContact ? targetContact.nickname : '对方';

  // 构造发给AI看的内容 (群聊中明确指出转给谁)
  const contact = await getContactDetails(currentChatId);
  let aiContent = contact.isGroup ? `[转账给 ${targetName}] ¥${amount.toFixed(2)}` : `[转账] ¥${amount.toFixed(2)}`;
  if (currentTransferNote) {
      aiContent += ` (说明: ${currentTransferNote})`;
  }

  const msg = {
    role: 'user',
    type: 'transfer', 
    amount: amount.toFixed(2),
    transferNote: currentTransferNote, 
    content: aiContent, 
    targetId: currentTransferTargetId, // ★ 记录给谁的
    targetName: targetName,            // ★ 记录名字
    timestamp: Date.now()
  };

  wxDrafts = [];
  await saveData('chat_drafts_' + currentChatId, null);
  
  await saveMessage(currentChatId, msg);
  appendMessageToUI(msg, null, contact.isGroup); 
  scrollToBottom();
  await updateChatList(currentChatId, `[转账] ¥${amount.toFixed(2)}`, Date.now());

  if (typeof aiReplyMode !== 'undefined' && aiReplyMode === 'immediate') {
      setTimeout(() => getAIResponse(currentChatId), 500);
  }
};

// [VariableDeclaration] Variables: currentReceivingMsgTimestamp
let currentReceivingMsgTimestamp = null;

// [ExpressionStatement] Execution: Expression
window.openReceiveMoneyPage = function(msg) {
    currentReceivingMsgTimestamp = msg.timestamp;
    const status = msg.transferStatus; // pending, accepted, returned
    
    // --- 填充基础数据 ---
    document.getElementById('receiveAmount').textContent = parseFloat(msg.amount).toFixed(2);
    
    // 格式化转账时间
    const transDate = new Date(msg.timestamp);
    const transTimeStr = transDate.toLocaleString('zh-CN', {year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'});
    document.getElementById('receiveTime').textContent = transTimeStr;

    // --- 获取UI元素 ---
const iconDiv = document.getElementById('receiveIcon');
const statusDiv = document.getElementById('receiveStatus');
const balanceLink = document.getElementById('receiveBalanceLink');
const collectRow = document.getElementById('collectTimeRow');
const actionArea = document.getElementById('receiveActionArea');

// ★ 新增：处理转账说明显示
const noteRow = document.getElementById('receiveNoteRow');
const noteContent = document.getElementById('receiveNoteContent');

if (msg.transferNote && msg.transferNote.trim() !== '') {
    noteRow.style.display = 'flex';
    noteContent.textContent = msg.transferNote;
} else {
    noteRow.style.display = 'none';
}

// --- 根据状态切换界面 ---
    if (status === 'accepted') {
        // === 模式A：已收款 (绿色对勾) ===
        iconDiv.innerHTML = `
            <svg viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="30" fill="#07C160"/>
                <polyline points="17 31 25 39 43 21" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
        
        statusDiv.textContent = "你已收款，资金已存入零钱";
        balanceLink.style.display = 'block';
        
        collectRow.style.display = 'flex';
        collectRow.querySelector('span:first-child').textContent = "收款时间";
        const collectDate = msg.collectTimestamp ? new Date(msg.collectTimestamp) : new Date();
        const collectTimeStr = collectDate.toLocaleString('zh-CN', {year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'});
        document.getElementById('collectTime').textContent = collectTimeStr;
        
        actionArea.style.display = 'none'; // 隐藏按钮
        
    } else if (status === 'returned') {
        // === 模式B：已退还 (黄色箭头) ===
iconDiv.innerHTML = `
    <svg viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="30" fill="#F6C446"/>
        <path d="M34 40 A 7 7 0 0 0 34 26 L 20 26" stroke="white" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M25 20 L 20 26 L 25 32" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
            
        statusDiv.textContent = "你已退还";
        balanceLink.style.display = 'none';
        
        collectRow.style.display = 'flex';
        collectRow.querySelector('span:first-child').textContent = "退款时间"; // 修改标签为退款时间
        const returnDate = msg.returnTimestamp ? new Date(msg.returnTimestamp) : new Date();
        const returnTimeStr = returnDate.toLocaleString('zh-CN', {year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'});
        document.getElementById('collectTime').textContent = returnTimeStr;
        
        actionArea.style.display = 'none'; // 隐藏按钮

    } else {
        // === 模式C：待收款 (蓝绿时钟) ===
        iconDiv.innerHTML = `
            <svg viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="30" fill="#3eb575" fill-opacity="0.1"/>
                <circle cx="30" cy="30" r="28" stroke="#2ea168" stroke-width="2" fill="none"/>
                <polyline points="30 16 30 30 40 40" stroke="#2ea168" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
            
        statusDiv.textContent = "待你收款";
        balanceLink.style.display = 'none';
        collectRow.style.display = 'none';
        actionArea.style.display = 'flex'; // 显示按钮
    }
    
    document.getElementById('receiveMoneyPage').style.display = 'flex';
};

// [ExpressionStatement] Execution: addEventListener
document.getElementById('confirmReceiveBtn').addEventListener('click', async () => {
    if (!currentReceivingMsgTimestamp || !currentChatId) return;
    
    const key = 'chat_messages_' + currentChatId;
    let messages = await getData(key) || [];
    
    const msgIndex = messages.findIndex(m => m.timestamp == currentReceivingMsgTimestamp);
    if (msgIndex !== -1) {
        messages[msgIndex].transferStatus = 'accepted';
        messages[msgIndex].collectTimestamp = Date.now();
        await saveData(key, messages);
        
        // 更新聊天界面气泡
        updateChatBubbleAfterAction(currentReceivingMsgTimestamp, 'accepted');
        
        // 刷新当前页面
        openReceiveMoneyPage(messages[msgIndex]);

        // 发送"已收款"回执
        sendTransferReceipt(messages[msgIndex].amount, 'accepted');
    }
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('returnTransferLink').addEventListener('click', async () => {
    if (!currentReceivingMsgTimestamp || !currentChatId) return;
    
    if (!await customConfirm('确认退还这笔转账给对方吗？')) return;

    const key = 'chat_messages_' + currentChatId;
    let messages = await getData(key) || [];
    
    const msgIndex = messages.findIndex(m => m.timestamp == currentReceivingMsgTimestamp);
    if (msgIndex !== -1) {
        // 更新状态为 returned
        messages[msgIndex].transferStatus = 'returned';
        messages[msgIndex].returnTimestamp = Date.now(); // 记录退还时间
        await saveData(key, messages);
        
        // 更新聊天界面气泡
        updateChatBubbleAfterAction(currentReceivingMsgTimestamp, 'returned');
        
        // 刷新当前页面 (显示黄色图标)
        openReceiveMoneyPage(messages[msgIndex]);

        // 发送"已退还"回执
        sendTransferReceipt(messages[msgIndex].amount, 'returned');
    }
});

// [FunctionDeclaration] Function: updateChatBubbleAfterAction
function updateChatBubbleAfterAction(timestamp, status) {
    const bubble = document.querySelector(`[data-timestamp="${timestamp}"]`);
    if (bubble) {
        const iconContainer = bubble.querySelector('.transfer-icon-circle');
        if (iconContainer) {
            // 根据状态切换图标
            if (status === 'accepted') {
                iconContainer.innerHTML = `<svg width="42" height="42" viewBox="0 0 42 42" fill="none"><circle cx="21" cy="21" r="19" stroke="white" stroke-width="2.5"/><polyline points="12 21 18 27 30 15" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            } else {
                // 退还图标
                iconContainer.innerHTML = `<svg width="42" height="42" viewBox="0 0 42 42" fill="none"><circle cx="21" cy="21" r="19" stroke="white" stroke-width="2.5"/><path d="M24 28 A 5 5 0 0 0 24 18 L 13 18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 14 L 13 18 L 17 22" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            }
        }
        
        const descEl = bubble.querySelector('.transfer-desc');
        if (descEl) {
            // ★★★ 核心：AI发来的转账，我退还了 -> 显示"已被退还" ★★★
            descEl.textContent = status === 'accepted' ? '已被接收' : '已被退还';
        }
        
        const contentDiv = bubble.querySelector('.msg-content');
        if (contentDiv) contentDiv.classList.add('transfer-processed');
    }
}

// [FunctionDeclaration] Function: sendTransferReceipt
async function sendTransferReceipt(amount, status) {
    const contentText = status === 'accepted' ? '[已收款]' : '[已退还]';
    
    // ★★★ 核心：回执卡片，如果是退还，不需要区分谁发的，都显示"已退还" ★★★
    // 只有橙色气泡才需要区分 "已被退还" vs "已退还"
    
    const receiptMsg = {
        role: 'user',
        type: 'transfer',
        transferStatus: status, // accepted 或 returned
        amount: amount,
        content: contentText, 
        isReceipt: true, 
        timestamp: Date.now()
    };

    await saveMessage(currentChatId, receiptMsg);
    appendMessageToUI(receiptMsg, userAvatarUrl, false); 
    scrollToBottom();
    await updateChatList(currentChatId, contentText, Date.now());
}

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('DOMContentLoaded', () => {
    // 找到 action-sheet 里的第6个按钮（转账）
    // 原代码结构中，转账是第2页的第2个，或者第1页的第6个，根据你的代码：
    // <!-- 6. 转账 --> ... <span class="action-text">转账</span>
    
    const actionItems = document.querySelectorAll('.action-item');
    actionItems.forEach(item => {
        if (item.querySelector('.action-text').textContent.trim() === '转账') {
            item.onclick = openTransferPage;
        }
    });
});

// [ExpressionStatement] Execution: Expression
window.openMountGroupModal = async function() {
    if (!currentChatId) return;
    
    // 1. 动态创建弹窗DOM（如果不存在）
    if (!document.getElementById('mountGroupModal')) {
        const modalHtml = `
        <div id="mountGroupModal" class="custom-modal-overlay" style="z-index: 10005; align-items: flex-end; display: none;">
            <div style="width: 100%; background: #fff; border-radius: 12px 12px 0 0; padding: 20px; box-sizing: border-box; max-height: 70vh; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <span style="font-size: 16px; font-weight: 500;">选择挂载的群聊</span>
                    <span id="closeMountGroupModal" style="color: #999; font-size: 24px; cursor: pointer; padding: 0 10px;">×</span>
                </div>
                <div id="mountGroupList" style="flex: 1; overflow-y: auto; margin-bottom: 15px;"></div>
                <button id="saveMountGroupBtn" style="width: 100%; padding: 12px; background: #07C160; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">保存</button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 绑定关闭事件
        document.getElementById('closeMountGroupModal').onclick = () => {
            document.getElementById('mountGroupModal').style.display = 'none';
        };
        document.getElementById('mountGroupModal').onclick = (e) => {
            if (e.target.id === 'mountGroupModal') e.target.style.display = 'none';
        };
    }

    // 2. 获取数据
    const contacts = await getData('customContacts') || [];
    const groups = contacts.filter(c => c.isGroup);
    const mountedGroups = (await getData('mountedGroupIds_' + currentChatId)) || [];

    // 3. 渲染列表
    const listDiv = document.getElementById('mountGroupList');
    if (groups.length === 0) {
        listDiv.innerHTML = '<div style="text-align:center; color:#999; padding:20px;">暂无群聊</div>';
    } else {
        listDiv.innerHTML = groups.map(g => {
            const isChecked = mountedGroups.includes(g.id) ? 'checked' : '';
            return `
            <label style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer;">
                <input type="checkbox" class="mount-group-cb" value="${g.id}" ${isChecked} style="margin-right: 12px; width: 18px; height: 18px; accent-color: #07C160;">
                <div style="flex: 1; font-size: 16px;">${g.nickname}</div>
            </label>`;
        }).join('');
    }

    // 4. 显示弹窗并绑定保存事件
    document.getElementById('mountGroupModal').style.display = 'flex';
    
    document.getElementById('saveMountGroupBtn').onclick = async () => {
        const cbs = document.querySelectorAll('.mount-group-cb:checked');
        const selectedIds = Array.from(cbs).map(cb => cb.value); // 保持字符串
        
        await saveData('mountedGroupIds_' + currentChatId, selectedIds);
        
        const countSpan = document.getElementById('mountedGroupCount');
        if (countSpan) countSpan.textContent = selectedIds.length + '个';
        
        document.getElementById('mountGroupModal').style.display = 'none';
        customAlert(`已挂载 ${selectedIds.length} 个群聊`);
    };
};

