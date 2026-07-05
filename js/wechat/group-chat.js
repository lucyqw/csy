/* 模块: js/group-chat.js */

// [VariableDeclaration] Variables: menuGroupChat
const menuGroupChat = document.getElementById('menuGroupChat');

// [VariableDeclaration] Variables: menuAddFriend
const menuAddFriend = document.getElementById('menuAddFriend');

// [VariableDeclaration] Variables: groupSelectPage
const groupSelectPage = document.getElementById('groupSelectPage');

// [VariableDeclaration] Variables: closeGroupSelect
const closeGroupSelect = document.getElementById('closeGroupSelect');

// [VariableDeclaration] Variables: groupContactList
const groupContactList = document.getElementById('groupContactList');

// [VariableDeclaration] Variables: createGroupBtn
const createGroupBtn = document.getElementById('createGroupBtn');

// [VariableDeclaration] Variables: selectedGroupMembers
let selectedGroupMembers = new Set();

// [ExpressionStatement] Execution: addEventListener
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

// [ExpressionStatement] Execution: addEventListener
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

// [ExpressionStatement] Execution: addEventListener
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

// [FunctionDeclaration] Function: updateCreateGroupBtn
function updateCreateGroupBtn() {
    const count = selectedGroupMembers.size;
    createGroupBtn.textContent = `完成(${count})`;
    if (count > 0) {
        createGroupBtn.classList.add('active');
    } else {
        createGroupBtn.classList.remove('active');
    }
}

// [VariableDeclaration] Variables: groupOperationMode
let groupOperationMode = 'create';

// [ExpressionStatement] Execution: Expression
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

// [FunctionDeclaration] Function: renderGroupSelect
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

// [FunctionDeclaration] Function: updateCreateGroupBtn
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

// [ExpressionStatement] Execution: addEventListener
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

// [ExpressionStatement] Execution: Expression
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

// [ExpressionStatement] Execution: Expression
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

// [ExpressionStatement] Execution: Expression
window.closeWorldBookModal = function() {
    document.getElementById('worldBookModal').style.display = 'none';
};

// [ExpressionStatement] Execution: addEventListener
document.getElementById('worldBookModal').addEventListener('click', (e) => {
    if (e.target.id === 'worldBookModal') {
        closeWorldBookModal();
    }
});

// [ExpressionStatement] Execution: push
allFullscreenPages.push(document.getElementById('groupListPage'));

// [VariableDeclaration] Variables: groupChatsBtn
const groupChatsBtn = document.getElementById('groupChatsBtn');

// [VariableDeclaration] Variables: groupListPage
const groupListPage = document.getElementById('groupListPage');

// [VariableDeclaration] Variables: groupListBackBtn
const groupListBackBtn = document.getElementById('groupListBackBtn');

// [VariableDeclaration] Variables: groupListContainer
const groupListContainer = document.getElementById('groupListContainer');

// [VariableDeclaration] Variables: groupListCount
const groupListCount = document.getElementById('groupListCount');

// [ExpressionStatement] Execution: addEventListener
groupChatsBtn.addEventListener('click', async () => {
    await renderGroupListPage();
    showPage(groupListPage);
});

// [ExpressionStatement] Execution: addEventListener
groupListBackBtn.addEventListener('click', () => {
    showPage(mainApp); // 返回主界面
});

// [FunctionDeclaration] Function: renderGroupListPage
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

