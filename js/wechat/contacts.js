/* 模块: js/contacts.js */

// [VariableDeclaration] Variables: newFriendBtn
const newFriendBtn = document.getElementById('newFriendBtn');

// [VariableDeclaration] Variables: createCharacterPage
const createCharacterPage = document.getElementById('createCharacterPage');

// [VariableDeclaration] Variables: saveCharacterBtn
const saveCharacterBtn = document.getElementById('saveCharacterBtn');

// [VariableDeclaration] Variables: charAvatarPreview
const charAvatarPreview = document.getElementById('charAvatarPreview');

// [VariableDeclaration] Variables: charAvatarInput
const charAvatarInput = document.getElementById('charAvatarInput');

// [VariableDeclaration] Variables: charRealName
const charRealName = document.getElementById('charRealName');

// [VariableDeclaration] Variables: charNickname
const charNickname = document.getElementById('charNickname');

// [VariableDeclaration] Variables: charPersona
const charPersona = document.getElementById('charPersona');

// [VariableDeclaration] Variables: customContactsList
const customContactsList = document.getElementById('customContactsList');

// [VariableDeclaration] Variables: backFromCreateBtn
const backFromCreateBtn = document.querySelector('.back-from-create');

// [VariableDeclaration] Variables: pageTitle
const pageTitle = createCharacterPage.querySelector('h1');

// [VariableDeclaration] Variables: tempCharAvatar
let tempCharAvatar = '';

// [VariableDeclaration] Variables: currentEditingId
let currentEditingId = null;

// [FunctionDeclaration] Function: renderCharStickerOptions
async function renderCharStickerOptions(selectedLibIds = []) {
  const area = document.getElementById('charStickerSelectArea');
  const libs = await getData('stickerLibs') || [];
  
  if (libs.length === 0) {
    area.innerHTML = '<div style="color:#999; font-size:12px;">暂无表情包库，请去“我-表情”添加</div>';
    return;
  }

  area.innerHTML = libs.map(lib => {
    const isChecked = selectedLibIds.includes(lib.id) ? 'checked' : '';
    return `
      <label style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer;">
        <input type="checkbox" class="char-sticker-checkbox" value="${lib.id}" ${isChecked} style="margin-right: 10px;">
        <span style="font-size: 15px;">${lib.name}</span>
        <span style="font-size: 12px; color: #999; margin-left: auto;">${lib.stickers ? lib.stickers.length : 0}张</span>
      </label>
    `;
  }).join('');
}

// [ExpressionStatement] Execution: addEventListener
newFriendBtn.addEventListener('click', async () => {
  // ★★★ 修复核心：进入新建模式前，强制清空当前聊天ID，防止保存时跳错页面 ★★★
  currentChatId = null; 

  currentEditingId = null;
  pageTitle.textContent = "新建角色";
  
  charRealName.value = '';
  charNickname.value = '';
  charPersona.value = '';
  tempCharAvatar = '';
  charAvatarPreview.style.backgroundImage = '';
  charAvatarPreview.textContent = '点击传头像';
  
  // 使用通用函数渲染 (ID为 charStickerSelectArea)
await renderStickerOptionsForElement('charStickerSelectArea', []);
// 世界书渲染已删除

showPage(createCharacterPage);
});

// [ExpressionStatement] Execution: Expression
window.editCharacter = async function(id) {
  currentEditingId = id;
  pageTitle.textContent = "编辑角色";
  
  const contacts = await getData('customContacts') || [];
  const target = contacts.find(c => c.id === id);
  
if (target) {
  charRealName.value = target.realName || '';
  charNickname.value = target.nickname || '';
  charPersona.value = target.persona || '';
  
  // ★★★ 新增：回显记忆挂载数量 ★★★
  document.getElementById('charMemoryMount').value = target.memoryMount || 5;
  
  // 时间观念设置已移除，在聊天信息页管理
  
  tempCharAvatar = target.avatar || '';
    if (tempCharAvatar) {
      charAvatarPreview.style.backgroundImage = `url(${tempCharAvatar})`;
      charAvatarPreview.textContent = '';
    } else {
      charAvatarPreview.style.backgroundImage = '';
      charAvatarPreview.textContent = '点击传头像';
    }
    
        // 使用通用函数渲染，并回显已选库
await renderStickerOptionsForElement('charStickerSelectArea', target.allowedStickerLibs || []);
// 世界书渲染已删除，请前往聊天信息页管理

showPage(createCharacterPage);
  }
};

// [ExpressionStatement] Execution: addEventListener
backFromCreateBtn.addEventListener('click', () => {
  if (currentEditingId) {
    // 如果是编辑模式，返回资料页
    showPage(document.getElementById('contactProfilePage'));
  } else {
    // 如果是新建模式，返回通讯录
    showPage(mainApp);
  }
});

// [ExpressionStatement] Execution: addEventListener
charAvatarPreview.addEventListener('click', () => charAvatarInput.click());

// [ExpressionStatement] Execution: addEventListener
charAvatarInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (event) => {
      tempCharAvatar = event.target.result;
      charAvatarPreview.style.backgroundImage = `url(${tempCharAvatar})`;
      charAvatarPreview.textContent = '';
    };
    reader.readAsDataURL(file);
  }
});

// [ExpressionStatement] Execution: addEventListener
saveCharacterBtn.addEventListener('click', async () => {
  const realName = charRealName.value.trim();
  const nickname = charNickname.value.trim();
  const persona = charPersona.value.trim();

  if (!nickname && !realName) {
    customAlert('请至少输入真名或昵称');
    return;
  }

  // ★★★ 关键修复1：强制保存当前聊天ID到临时变量，防止被清空 ★★★
  const savedChatId = currentChatId;
  const savedEditingId = currentEditingId;

  let contacts = await getData('customContacts') || [];

const stickerArea = document.getElementById('charStickerSelectArea');
const selectedLibs = Array.from(stickerArea.querySelectorAll('.sticker-select-checkbox:checked'))
                          .map(cb => parseInt(cb.value));

// ★★★ 新增：读取记忆挂载设置 ★★★
const memoryMount = parseInt(document.getElementById('charMemoryMount').value) || 5;

// 生成微信号
let wechatId = '';
  const nameForWxId = realName || nickname || '';
  if (nameForWxId.trim()) {
    try {
      const py = window.pinyinPro.pinyin(nameForWxId, { toneType: 'none', type: 'array' }).join('');
      wechatId = 'char_' + py.toLowerCase();
    } catch (e) {
      wechatId = 'char_' + nameForWxId.toLowerCase().replace(/\s+/g, '');
    }
  }

  // ★★★ 关键修复2：用临时变量判断编辑还是新建 ★★★
if (savedEditingId) {
  // 编辑现有角色
  const index = contacts.findIndex(c => c.id === savedEditingId);
  if (index !== -1) {
    contacts[index] = {
      ...contacts[index],
      realName, 
      nickname, 
      persona, 
      avatar: tempCharAvatar,
      allowedStickerLibs: selectedLibs,
      wechatId: wechatId,
      memoryMount: memoryMount // ★★★ 新增：保存挂载数量 ★★★
    };
  }
} else {
  // 新建角色
  const newId = Date.now();
  contacts.push({
    id: newId,
    realName,
    nickname: nickname || realName,
    persona,
    avatar: tempCharAvatar,
    allowedStickerLibs: selectedLibs,
    worldBookIds: [],
    wechatId: wechatId,
    timeAwareness: true,
    memoryMount: memoryMount // ★★★ 新增：保存挂载数量 ★★★
  });
    
    // ★★★ 关键修复3：新建完成后弹出成功提示 ★★★
    console.log('✅ 新建角色成功，ID:', newId);
  }

  // 保存到数据库
  await saveData('customContacts', contacts);

  // 刷新通讯录列表
  renderCustomContacts(contacts);

  // 清除覆盖数据
  if (savedEditingId) {
    const overrides = await getData('contactOverrides') || {};
    delete overrides[savedEditingId];
    await saveData('contactOverrides', overrides);
  }

  // ★★★ 关键修复4：根据来源智能返回 ★★★
  if (savedChatId && savedEditingId) {
    // 情况A：从聊天页进入编辑 -> 返回资料页
    const updatedContact = contacts.find(c => c.id === savedEditingId);
    if (updatedContact) {
      document.getElementById('chatTitle').textContent = updatedContact.nickname;
      
      const cpAvatar = document.getElementById('cpAvatar');
      const cpNickname = document.getElementById('cpNickname');
      
      if (updatedContact.avatar) {
        cpAvatar.style.backgroundImage = `url(${updatedContact.avatar})`;
        cpAvatar.innerHTML = '';
      } else {
        cpAvatar.style.backgroundImage = '';
        cpAvatar.style.backgroundColor = '#ccc';
        cpAvatar.innerHTML = updatedContact.nickname[0] || '?';
      }
      cpNickname.textContent = updatedContact.nickname;
      
      let sessions = await getData('chat_sessions') || [];
      const sessionIndex = sessions.findIndex(s => s.id === savedChatId);
      if (sessionIndex !== -1) {
        sessions[sessionIndex].name = updatedContact.nickname;
        sessions[sessionIndex].avatar = updatedContact.avatar;
        await saveData('chat_sessions', sessions);
        await renderChatList();
      }
    }
    showPage(document.getElementById('contactProfilePage'));
  } else {
    // 情况B：从通讯录新建 -> 返回主界面并弹提示
    showPage(mainApp);
    // ★★★ 延迟弹窗，确保页面切换完成后再显示 ★★★
setTimeout(async () => {
  await customAlert('角色创建成功！');
}, 100);
  }
});

// [FunctionDeclaration] Function: renderCustomContacts
function renderCustomContacts(contacts) {
  if (!contacts) return;
  
  // ★★★ 小鱼修改：过滤掉群聊，只显示单人好友 ★★★
  const visibleContacts = contacts.filter(c => !c.isGroup);

  customContactsList.innerHTML = visibleContacts.map(contact => {
    // ★★★ 修改：如果没有头像，使用指定的默认图片 ★★★
    const displayAvatar = contact.avatar || 'https://iili.io/fkc3RwJ.jpg';
    
    // 统一使用图片样式渲染
    const avatarHtml = `<div class="contact-icon" style="background-image: url(${displayAvatar}); background-size: cover; border-radius: 4px;"></div>`;

    // ★★★ 修改：点击进入 openContactProfile (角色主页) ★★★
    return `
      <div class="contact-item" onclick="openContactProfile(${contact.id})">
        ${avatarHtml}
        <div style="display:flex; flex-direction:column; justify-content:center;">
          <span class="contact-name">${contact.nickname}</span>
          <span style="font-size: 12px; color: #999; margin-left: 14px;">${contact.realName ? '真名: ' + contact.realName : ''}</span>
        </div>
      </div>
    `;
  }).join('');
}

