/* 模块: js/chat-info.js */

// [VariableDeclaration] Variables: chatInfoPage
const chatInfoPage = document.getElementById('chatInfoPage');

// [VariableDeclaration] Variables: chatInfoEntryBtn
const chatInfoEntryBtn = document.getElementById('chatInfoEntryBtn');

// [VariableDeclaration] Variables: chatInfoBackBtn
const chatInfoBackBtn = document.getElementById('chatInfoBackBtn');

// [VariableDeclaration] Variables: chatMembersContainer
const chatMembersContainer = document.getElementById('chatMembersContainer');

// [VariableDeclaration] Variables: topChatSwitch
const topChatSwitch = document.getElementById('topChatSwitch');

// [VariableDeclaration] Variables: clearChatHistoryBtn
const clearChatHistoryBtn = document.getElementById('clearChatHistoryBtn');

// [VariableDeclaration] Variables: setChatBgBtn
const setChatBgBtn = document.getElementById('setChatBgBtn');

// [VariableDeclaration] Variables: chatBgInput
const chatBgInput = document.getElementById('chatBgInput');

// [ExpressionStatement] Execution: Expression
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

// [ExpressionStatement] Execution: addEventListener
chatInfoEntryBtn.addEventListener('click', window.renderChatInfoPage);

// [ExpressionStatement] Execution: addEventListener
chatInfoBackBtn.addEventListener('click', () => {
    showPage(chatRoomPage);
});

// [ExpressionStatement] Execution: addEventListener
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

// [ExpressionStatement] Execution: addEventListener
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

// [ExpressionStatement] Execution: addEventListener
document.getElementById('innerVoiceSwitch').addEventListener('change', async (e) => {
    const isEnabled = e.target.checked;
    await saveData('innerVoice_' + currentChatId, isEnabled);
});

// [ExpressionStatement] Execution: addEventListener
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

