  /* 小鱼注释：IndexedDB数据库管理 (已优化为更健壮的异步模式) */
  const DB_NAME = 'WeChatDB', DB_VERSION = 1, STORE_NAME = 'userProfile';
  let db = null;

  function initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = (event) => reject(`数据库打开失败: ${event.target.error}`);
      request.onsuccess = (event) => {
        db = event.target.result;
        console.log('数据库打开成功');
        resolve(db);
      };
      request.onupgradeneeded = (event) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          console.log('对象仓库创建成功');
        }
      };
    });
  }

  function saveData(key, value) {
    return new Promise((resolve, reject) => {
      if (!db) return reject('数据库未初始化，无法保存数据');
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      transaction.oncomplete = () => {
        console.log(`数据事务完成: ${key} 已保存`);
        resolve();
      };
      transaction.onerror = (event) => {
        console.error(`数据事务错误: ${event.target.error}`);
        reject(event.target.error);
      };
      const objectStore = transaction.objectStore(STORE_NAME);
      objectStore.put({ id: key, value: value });
    });
  }

  function getData(key) {
    return new Promise((resolve, reject) => {
      if (!db) return reject('数据库未初始化，无法读取数据');
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.get(key);
      
      request.onsuccess = () => {
        resolve(request.result ? request.result.value : null);
      };
      request.onerror = (event) => {
        console.error(`读取数据请求错误: ${event.target.error}`);
        reject(event.target.error);
      };
    });
  }

  /* 小鱼注释：DOM元素获取 */
  const mainApp = document.getElementById('mainApp');
  const personalInfoPage = document.getElementById('personalInfoPage');
  const ringtoneHistoryPage = document.getElementById('ringtoneHistoryPage');
  
  /* 小鱼修复：将 createCharacterPage 加入管理列表，解决返回按钮失效问题 */
/* 小鱼修复：将 groupSelectPage 加入管理列表 */
const allFullscreenPages = [
  mainApp, personalInfoPage,
  document.getElementById('nameEditPage'), document.getElementById('genderEditPage'),
  document.getElementById('regionEditPage'), document.getElementById('patEditPage'),
  document.getElementById('signatureEditPage'), document.getElementById('phoneEditPage'),
  document.getElementById('wechatIdEditPage'), document.getElementById('ringtonePage'),
  ringtoneHistoryPage,
  document.getElementById('createCharacterPage'),
  document.getElementById('chatRoomPage'),
  document.getElementById('chatInfoPage'),
  document.getElementById('contactProfilePage'),
  document.getElementById('chatBackgroundSettingsPage'),
  document.getElementById('dataSettingsPage'),
  document.getElementById('myChatProfilePage'),
  document.getElementById('userPersonaEditPage'),
  document.getElementById('stickerLibraryPage'), 
  document.getElementById('stickerDetailPage'),
  document.getElementById('topicArchivePage'),
  // ★★★ 新增这一行 ★★★
  document.getElementById('groupSelectPage'),
  document.getElementById('groupTransferSelectPage') // ★ 新增：群聊转账选人页面
];

  const tabItems = document.querySelectorAll('.tab-item');
  const pages = document.querySelectorAll('.page');
  const navBar = document.querySelector('#mainApp .nav-bar');
  const navTitle = document.getElementById('navTitle');
  const profileHeader = document.querySelector('.profile-header');
  const backButton = document.getElementById('backButton');
  const profileAvatar = document.querySelector('.profile-avatar');
  const profileName = document.querySelector('.profile-name');
  const profileIdSpan = document.querySelector('.profile-id');
  const avatarInput = document.getElementById('avatarInput');
  const infoAvatar = document.querySelector('.info-avatar');
  const avatarItem = document.querySelector('#personalInfoPage .discover-item:first-child');

  const nameItem = document.querySelector('#personalInfoPage .discover-section:first-child .discover-item:nth-child(2)');
  const genderItem = document.querySelector('#personalInfoPage .discover-section:first-child .discover-item:nth-child(3)');
  const regionItem = document.querySelector('#personalInfoPage .discover-section:first-child .discover-item:nth-child(4)');
  const phoneItem = document.querySelector('#personalInfoPage .discover-section:first-child .discover-item:nth-child(5)');
  const wechatIdItem = document.querySelector('#personalInfoPage .discover-section:first-child .discover-item:nth-child(6)');
  const patItem = document.querySelector('#personalInfoPage .discover-section:first-child .discover-item:nth-child(8)');
  const signatureItem = document.querySelectorAll('#personalInfoPage .discover-section')[1].querySelector('.discover-item');
// 小鱼新增：获取我的人设相关元素
const userPersonaItem = document.getElementById('userPersonaItem');
const userPersonaEditPage = document.getElementById('userPersonaEditPage');
const userPersonaInput = document.getElementById('userPersonaInput');
const userPersonaSaveBtn = document.getElementById('userPersonaSaveBtn');
const userPersonaValueSpan = userPersonaItem.querySelector('.item-value');

// 小鱼新增：将新页面加入页面管理器，防止返回按钮失效
allFullscreenPages.push(userPersonaEditPage);

const nameValueSpan = nameItem.querySelector('.item-value');

    const ringtoneItem = document.querySelectorAll('#personalInfoPage .discover-section')[2].querySelector('.discover-item');
  const genderValueSpan = document.createElement('span');
  genderValueSpan.className = 'item-value';
  genderItem.insertBefore(genderValueSpan, genderItem.querySelector('.contact-arrow'));

  const regionValueSpan = document.createElement('span');
  regionValueSpan.className = 'item-value';
  regionItem.insertBefore(regionValueSpan, regionItem.querySelector('.contact-arrow'));
  
  const phoneValueSpan = document.createElement('span');
  phoneValueSpan.className = 'item-value';
  phoneItem.insertBefore(phoneValueSpan, phoneItem.querySelector('.contact-arrow'));

  const wechatIdValueSpan = wechatIdItem.querySelector('.item-value');

  const patValueSpan = document.createElement('span');
  patValueSpan.className = 'item-value';
  patItem.insertBefore(patValueSpan, patItem.querySelector('.contact-arrow'));

  const signatureValueSpan = signatureItem.querySelector('.item-value');

  const ringtoneValueSpan = document.createElement('span');
  ringtoneValueSpan.className = 'item-value';
  ringtoneItem.insertBefore(ringtoneValueSpan, ringtoneItem.querySelector('.contact-arrow'));

  const nameEditPage = document.getElementById('nameEditPage'), newNameInput = document.getElementById('newNameInput'), nameSaveBtn = document.getElementById('nameSaveBtn');
  const genderEditPage = document.getElementById('genderEditPage'), genderOptions = document.querySelectorAll('.gender-option'), genderDoneBtn = document.getElementById('genderDoneBtn');
  const regionEditPage = document.getElementById('regionEditPage'), regionInput = document.getElementById('regionInput'), regionSaveBtn = document.getElementById('regionSaveBtn');
  const patEditPage = document.getElementById('patEditPage'), patInput = document.getElementById('patInput'), patSaveBtn = document.getElementById('patSaveBtn'), patPreview = document.getElementById('patPreview');
  const signatureEditPage = document.getElementById('signatureEditPage'), signatureInput = document.getElementById('signatureInput'), signatureSaveBtn = document.getElementById('signatureSaveBtn'), signatureCounter = document.getElementById('signatureCounter');
  const phoneEditPage = document.getElementById('phoneEditPage'), phoneInput = document.getElementById('phoneInput'), phoneSaveBtn = document.getElementById('phoneSaveBtn');
  const wechatIdEditPage = document.getElementById('wechatIdEditPage'), wechatIdInput = document.getElementById('wechatIdInput'), wechatIdSaveBtn = document.getElementById('wechatIdSaveBtn');
  const ringtonePage = document.getElementById('ringtonePage'), ringtonePreviewBtn = document.getElementById('ringtonePreviewBtn'), ringtoneName = document.getElementById('ringtoneName'), showRingtoneModalBtn = document.getElementById('showRingtoneModalBtn'), ringtoneChangeModal = document.getElementById('ringtoneChangeModal'), ringtoneUrlInput = document.getElementById('ringtoneUrlInput'), ringtoneFileInput = document.getElementById('ringtoneFileInput'), fileNameSpan = document.getElementById('fileName'), ringtoneNameInput = document.getElementById('ringtoneNameInput'), cancelRingtoneChange = document.getElementById('cancelRingtoneChange'), saveRingtoneChange = document.getElementById('saveRingtoneChange'), ringtonePlayer = document.getElementById('ringtonePlayer');
  
  // 新增：历史记录和删除相关元素
  const ringtoneHistoryList = document.getElementById('ringtoneHistoryList');
  const historyLinkBtn = document.querySelector('#ringtonePage .nav-bar > span');
  const historyMenuBtn = document.getElementById('historyMenuBtn');
  const historyActionSheetOverlay = document.getElementById('historyActionSheetOverlay');
  const multiSelectDeleteBtn = document.getElementById('multiSelectDeleteBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const cancelActionBtn = document.getElementById('cancelActionBtn');
  const multiDeleteBar = document.getElementById('multiDeleteBar');
  const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
  const cancelMultiDeleteBtn = document.getElementById('cancelMultiDeleteBtn');

  let originalValues = { name: '', gender: '', region: '', pat: '', signature: '', phone: '', wechatId: '', ringtone: null };
  let currentRingtone = null;
  let ringtoneHistory = [];

  function showPage(pageToShow) {
  allFullscreenPages.forEach(page => page && (page.style.display = 'none'));

  // ★★★ 小鱼新增：离开朋友圈页时，自动清理所有朋友圈浮层 ★★★
  if (pageToShow !== document.getElementById('momentsPage')) {
    const momentCommentBar = document.getElementById('momentCommentBar');
    if (momentCommentBar) momentCommentBar.remove();

    const globalMomentActionMenu = document.getElementById('globalMomentActionMenu');
    if (globalMomentActionMenu) globalMomentActionMenu.remove();

    const momentEditMenu = document.getElementById('momentEditMenu');
    if (momentEditMenu) momentEditMenu.remove();
  }

  if (pageToShow) pageToShow.style.display = 'flex';
}
  
  /* 小鱼新增：核心角色数据获取函数 (支持备注/覆盖) */
async function getContactDetails(id) {
  // 1. 获取通讯录原数据
  const contacts = await getData('customContacts') || [];
  const original = contacts.find(c => c.id === id);
  if (!original) return null;

  // 2. 获取覆盖数据 (备注/专属人设)
  const overrides = await getData('contactOverrides') || {};
  const override = overrides[id] || {};

  // 3. 合并数据 (覆盖层优先)
  const mergedLibs = (override.allowedStickerLibs !== undefined) ? override.allowedStickerLibs : original.allowedStickerLibs;
  const mergedWBs = (override.worldBookIds !== undefined) ? override.worldBookIds : original.worldBookIds;

  return {
    ...original,
    nickname: override.nickname || original.nickname,
    avatar: override.avatar || original.avatar,
    persona: override.persona || original.persona,
    allowedStickerLibs: mergedLibs,
    worldBookIds: mergedWBs // 合并后的世界书ID
  };
}

/* 快捷编辑页功能已删除 */

// 小鱼优化：通用的世界书渲染函数（支持分类折叠）
function renderWorldBookOptionsForElement(elementId, selectedIds = []) {
  const area = document.getElementById(elementId);
  const rawData = localStorage.getItem('wechat_world_book_shared');
  const entries = rawData ? JSON.parse(rawData) : [];
  
  if (entries.length === 0) {
    area.innerHTML = '<div style="color:#999; font-size:12px;">暂无世界书条目，请在WebBox桌面悬浮菜单中添加</div>';
    return;
  }

  area.innerHTML = ''; // 清空原有内容

  // 1. 提取所有分类并去重
  const categories = [...new Set(entries.map(e => e.category || '未分类'))].sort();

  // 2. 按分类生成折叠栏
  categories.forEach(cat => {
    const catEntries = entries.filter(e => (e.category || '未分类') === cat);
    
    // 计算该分类下选中的数量
    const selectedCount = catEntries.filter(e => selectedIds.includes(e.id)).length;
    const countText = selectedCount > 0 ? `<span style="color:#07C160; margin-left:6px; font-size:13px;">(${selectedCount})</span>` : '';
    const activeClass = selectedCount > 0 ? 'active' : ''; // 如果有选中的，默认文字高亮一点(可选)
    const showClass = selectedCount > 0 ? 'show' : ''; // 可选：如果有选中的，默认展开，这里暂时默认不展开，保持整洁

    // 生成唯一ID
    const catContentId = 'wb-cat-' + elementId + '-' + Math.random().toString(36).substr(2, 9);

    const groupHtml = `
      <div class="wb-category-group">
        <div class="wb-category-header ${activeClass}" onclick="toggleWbCategory('${catContentId}', this)">
          <span>${cat} ${countText}</span>
          <span class="wb-category-arrow">▼</span>
        </div>
        <div id="${catContentId}" class="wb-category-content ${showClass}">
          ${catEntries.map(entry => {
            const isChecked = selectedIds.includes(entry.id) ? 'checked' : '';
            return `
              <label class="wb-item-row">
                <input type="checkbox" class="world-book-checkbox" value="${entry.id}" ${isChecked} style="margin-right: 12px; width: 18px; height: 18px; accent-color: #07C160;">
                <div style="overflow:hidden; flex: 1;">
                    <div style="font-size: 15px; color: #333;">${entry.title}</div>
                    <div style="font-size: 12px; color: #999; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${entry.content}</div>
                </div>
              </label>
            `;
          }).join('')}
        </div>
      </div>
    `;
    area.insertAdjacentHTML('beforeend', groupHtml);
  });
}

// 小鱼新增：切换折叠状态的辅助函数
window.toggleWbCategory = function(contentId, headerEl) {
  const content = document.getElementById(contentId);
  if (content.classList.contains('show')) {
    content.classList.remove('show');
    headerEl.classList.remove('active');
  } else {
    content.classList.add('show');
    headerEl.classList.add('active');
  }
};

// 保留通用的表情包渲染函数（新建角色页仍需要）
async function renderStickerOptionsForElement(elementId, selectedLibIds = []) {
  const area = document.getElementById(elementId);
  const libs = await getData('stickerLibs') || [];
  
  if (libs.length === 0) {
    area.innerHTML = '<div style="color:#999; font-size:12px;">暂无表情包库，请去"我-表情"添加</div>';
    return;
  }

  area.innerHTML = libs.map(lib => {
    const isChecked = selectedLibIds.includes(lib.id) ? 'checked' : '';
    return `
      <label style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer;">
        <input type="checkbox" class="sticker-select-checkbox" value="${lib.id}" ${isChecked} style="margin-right: 10px;">
        <span style="font-size: 15px;">${lib.name}</span>
        <span style="font-size: 12px; color: #999; margin-left: auto;">${lib.stickers ? lib.stickers.length : 0}张</span>
      </label>
    `;
  }).join('');
}

// 直接进入通讯录编辑页
document.getElementById('cpFriendProfileRow').addEventListener('click', async () => {
  // ★★★ 小鱼修复：优先读取“当前查看的ID”，如果没有才用“当前聊天的ID” ★★★
  const targetId = window.currentProfileId || currentChatId;
  if (!targetId) return;
  
  // ★★★ 核心修改：先清除覆盖数据，再进入编辑页 ★★★
  const overrides = await getData('contactOverrides') || {};
  delete overrides[targetId]; // 使用 targetId
  await saveData('contactOverrides', overrides);
  
  // 调用编辑函数（此时会读取通讯录的原始数据）
  await editCharacter(targetId); // 使用 targetId
  
  // 修改页面标题
  pageTitle.textContent = "编辑朋友资料";
});

// 辅助：刷新资料页显示
async function refreshProfilePageDisplay() {
    const contact = await getContactDetails(currentChatId);
    if (!contact) return;
    
    const cpAvatar = document.getElementById('cpAvatar');
    const cpNickname = document.getElementById('cpNickname');
    
    if (contact.avatar) {
        cpAvatar.style.backgroundImage = `url(${contact.avatar})`;
        cpAvatar.innerHTML = '';
    } else {
        cpAvatar.style.backgroundImage = '';
        cpAvatar.innerHTML = contact.nickname[0];
    }
    cpNickname.textContent = contact.nickname;
}

  async function loadUserData() {
    try {
      await initDB();
      // 小鱼修改：增加了 userPersona (我的人设) 的读取
const [avatar, userName, gender, region, phone, wechatId, pat, signature, ringtone, history, userPersona] = await Promise.all([
  getData('avatar'), getData('userName'), getData('gender'), getData('region'),
  getData('phone'), getData('wechatId'), getData('pat'), getData('signature'), 
  getData('ringtone'), getData('ringtoneHistory'), getData('userPersona')
]);

// 小鱼新增：显示人设
if(userPersonaValueSpan) userPersonaValueSpan.textContent = userPersona || '未设置';

      if (avatar) {
        profileAvatar.style.backgroundImage = `url(${avatar})`;
        profileAvatar.style.backgroundSize = 'cover';
        profileAvatar.textContent = '';
        infoAvatar.style.backgroundImage = `url(${avatar})`;
        infoAvatar.style.backgroundSize = 'cover';
      }
      
      // ★★★ 小鱼修改：生成用户默认微信号 user_拼音 ★★★
let defaultUserWxId = 'user_unknown';
if (userName && userName.trim()) {
  try {
    const py = window.pinyinPro.pinyin(userName, { toneType: 'none', type: 'array' }).join('');
    defaultUserWxId = 'user_' + py.toLowerCase();
  } catch (e) {
    defaultUserWxId = 'user_' + userName.toLowerCase().replace(/\s+/g, '');
  }
}

profileName.textContent = userName || 'user';
nameValueSpan.textContent = userName || '未设置';
genderValueSpan.textContent = gender || '未设置';
regionValueSpan.textContent = region || '未设置';
phoneValueSpan.textContent = phone || '未设置';
wechatIdValueSpan.textContent = wechatId || defaultUserWxId;
profileIdSpan.textContent = `微信号: ${wechatId || defaultUserWxId}`;
      patValueSpan.textContent = pat || '未设置';
      signatureValueSpan.textContent = signature || '未填写';
      
      ringtoneHistory = history || [];
      
      if (ringtone) {
        currentRingtone = ringtone;
        ringtonePlayer.src = ringtone.src;
        ringtoneName.textContent = ringtone.name;
        ringtoneValueSpan.textContent = ringtone.name;
      } else {
        currentRingtone = { src: '', name: '微信' };
        ringtoneName.textContent = '微信';
        ringtoneValueSpan.textContent = '默认';
      }
      
      renderRingtoneHistory();
    } catch (error) {
      console.error('数据加载失败:', error);
    }
  }

  /* 小鱼新增：渲染铃声历史记录列表 */
  function renderRingtoneHistory(isMultiSelectMode = false) {
    if (ringtoneHistory.length === 0) {
      ringtoneHistoryList.innerHTML = '<div class="history-empty">暂无历史记录</div>';
      return;
    }
    
    ringtoneHistoryList.innerHTML = ringtoneHistory.map((item, index) => {
      const isCurrent = currentRingtone && item.name === currentRingtone.name;
      return `
        <div class="history-item ${isCurrent ? 'current' : ''} ${isMultiSelectMode ? 'multi-select-mode' : ''}" data-index="${index}">
          ${isMultiSelectMode ? '' : '<div class="history-item-icon">♪</div>'}
          <span class="history-item-name">${item.name}</span>
          ${isCurrent && !isMultiSelectMode ? '<span style="color: var(--primary-color); font-size: 14px;">当前</span>' : ''}
        </div>
      `;
    }).join('');
    
    if (!isMultiSelectMode) {
      document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', async function() {
          const index = parseInt(this.dataset.index);
          await switchToRingtone(ringtoneHistory[index]);
        });
      });
    } else {
      document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', function() {
          this.classList.toggle('selected');
        });
      });
    }
  }

  /* 小鱼新增：切换到指定铃声 */
  async function switchToRingtone(ringtoneData) {
    if (!ringtonePlayer.paused) {
      ringtonePlayer.pause();
    }
    ringtonePlayer.currentTime = 0;
    ringtonePreviewBtn.classList.remove('playing');
    
    currentRingtone = ringtoneData;
    ringtonePlayer.src = ringtoneData.src;
    ringtoneName.textContent = ringtoneData.name;
    ringtoneValueSpan.textContent = ringtoneData.name;
    await saveData('ringtone', ringtoneData);
    renderRingtoneHistory();
    showPage(ringtonePage);
  }

  /* 小鱼新增：历史记录页面操作 */
  historyMenuBtn.addEventListener('click', () => {
    historyActionSheetOverlay.style.display = 'flex';
  });
  
  cancelActionBtn.addEventListener('click', () => {
    historyActionSheetOverlay.style.display = 'none';
  });
  
  historyActionSheetOverlay.addEventListener('click', (e) => {
    if (e.target === historyActionSheetOverlay) {
      historyActionSheetOverlay.style.display = 'none';
    }
  });

  clearHistoryBtn.addEventListener('click', async () => {
    if (await customConfirm('确定要清空所有历史记录吗？')) {
      ringtoneHistory = [];
      await saveData('ringtoneHistory', []);
      renderRingtoneHistory();
      historyActionSheetOverlay.style.display = 'none';
    }
  });
  
  multiSelectDeleteBtn.addEventListener('click', () => {
    historyActionSheetOverlay.style.display = 'none';
    multiDeleteBar.style.display = 'flex';
    renderRingtoneHistory(true); // 进入多选模式
  });

  cancelMultiDeleteBtn.addEventListener('click', () => {
    multiDeleteBar.style.display = 'none';
    renderRingtoneHistory(false); // 退出多选模式
  });
  
  deleteSelectedBtn.addEventListener('click', async () => {
    const selectedItems = document.querySelectorAll('.history-item.selected');
    if (selectedItems.length === 0) {
      customAlert('请选择要删除的铃声');
      return;
    }
    
    const indexesToDelete = Array.from(selectedItems).map(item => parseInt(item.dataset.index)).sort((a, b) => b - a);
    
    indexesToDelete.forEach(index => {
      ringtoneHistory.splice(index, 1);
    });
    
    await saveData('ringtoneHistory', ringtoneHistory);
    multiDeleteBar.style.display = 'none';
    renderRingtoneHistory(false);
  });

  function setupEditPage(item, page, input, saveBtn, valueSpan, dataKey, originalKey, placeholder) {
    item.addEventListener('click', () => {
      originalValues[originalKey] = valueSpan.textContent;
      input.value = (originalValues[originalKey] === placeholder || originalValues[originalKey] === 'user_2025') ? '' : originalValues[originalKey];
      showPage(page);
      input.focus();
      saveBtn.classList.remove('active');
    });

    input.addEventListener('input', () => {
      const originalValue = (originalValues[originalKey] === placeholder || originalValues[originalKey] === 'user_2025') ? '' : originalValues[originalKey];
      saveBtn.classList.toggle('active', input.value.trim() !== originalValue);
    });

    saveBtn.addEventListener('click', async () => {
      if (!saveBtn.classList.contains('active')) return;
      const newValue = input.value.trim();
      valueSpan.textContent = newValue || placeholder;
      
      if (dataKey === 'userName') {
        profileName.textContent = newValue || 'user';
      }
      if (dataKey === 'wechatId') {
        profileIdSpan.textContent = `微信号: ${newValue || 'user_2025'}`;
      }

      try {
        await saveData(dataKey, newValue);
        showPage(personalInfoPage);
      } catch (error) {
        customAlert('保存失败，请稍后再试');
      }
    });
  }

  avatarItem.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target.result;
        profileAvatar.style.backgroundImage = `url(${imageData})`;
        profileAvatar.style.backgroundSize = 'cover';
        profileAvatar.textContent = '';
        infoAvatar.style.backgroundImage = `url(${imageData})`;
        infoAvatar.style.backgroundSize = 'cover';
        await saveData('avatar', imageData);
      };
      reader.readAsDataURL(file);
    }
  });

  setupEditPage(nameItem, nameEditPage, newNameInput, nameSaveBtn, nameValueSpan, 'userName', 'name', '未设置');
  setupEditPage(phoneItem, phoneEditPage, phoneInput, phoneSaveBtn, phoneValueSpan, 'phone', 'phone', '未设置');
  setupEditPage(wechatIdItem, wechatIdEditPage, wechatIdInput, wechatIdSaveBtn, wechatIdValueSpan, 'wechatId', 'wechatId', 'user_2025');
  /* 小鱼新增：我的人设编辑逻辑 */
userPersonaItem.addEventListener('click', () => {
  const currentVal = userPersonaValueSpan.textContent;
  userPersonaInput.value = currentVal === '未设置' ? '' : currentVal;
  showPage(userPersonaEditPage);
  userPersonaInput.focus();
  userPersonaSaveBtn.classList.remove('active');
});

userPersonaInput.addEventListener('input', () => {
  userPersonaSaveBtn.classList.add('active');
});

userPersonaSaveBtn.addEventListener('click', async () => {
  if (!userPersonaSaveBtn.classList.contains('active')) return;
  const newVal = userPersonaInput.value.trim();
  userPersonaValueSpan.textContent = newVal || '未设置';
  await saveData('userPersona', newVal); // 保存到数据库
  showPage(personalInfoPage);
});

  let selectedGender = '';
  genderItem.addEventListener('click', () => {
    selectedGender = genderValueSpan.textContent;
    genderOptions.forEach(option => option.classList.toggle('selected', option.dataset.gender === selectedGender));
    showPage(genderEditPage);
  });
  genderOptions.forEach(option => {
    option.addEventListener('click', () => {
      selectedGender = option.dataset.gender;
      genderOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
    });
  });
  genderDoneBtn.addEventListener('click', async () => {
    if (selectedGender && selectedGender !== '未设置') {
      genderValueSpan.textContent = selectedGender;
      await saveData('gender', selectedGender);
    }
    showPage(personalInfoPage);
  });

  regionItem.addEventListener('click', () => {
    originalValues.region = regionValueSpan.textContent;
    regionInput.value = originalValues.region === '未设置' ? '' : originalValues.region;
    showPage(regionEditPage);
    regionInput.focus();
    regionSaveBtn.classList.remove('active');
  });
  regionInput.addEventListener('input', () => {
    const originalValue = originalValues.region === '未设置' ? '' : originalValues.region;
    regionSaveBtn.classList.toggle('active', regionInput.value.trim() !== originalValue);
  });
  regionSaveBtn.addEventListener('click', async () => {
    if (!regionSaveBtn.classList.contains('active')) return;
    const newRegion = regionInput.value.trim();
    regionValueSpan.textContent = newRegion || '未设置';
    await saveData('region', newRegion);
    showPage(personalInfoPage);
  });

  patItem.addEventListener('click', () => {
    originalValues.pat = patValueSpan.textContent;
    patInput.value = originalValues.pat === '未设置' ? '' : originalValues.pat;
    showPage(patEditPage);
    patInput.focus();
    patSaveBtn.classList.remove('active');
    updatePatPreview();
  });
  function updatePatPreview() { patPreview.textContent = `朋友拍了拍我${patInput.value.trim()}`; }
  patInput.addEventListener('input', () => {
    updatePatPreview();
    const originalValue = originalValues.pat === '未设置' ? '' : originalValues.pat;
    patSaveBtn.classList.toggle('active', patInput.value.trim() !== originalValue);
  });
  // ★★★ 小鱼修改：落实拍一拍后缀的保存逻辑 ★★★
patSaveBtn.addEventListener('click', async () => {
  if (!patSaveBtn.classList.contains('active')) return;
  
  const newPat = patInput.value.trim();
  
  // 1. 更新页面上的显示
  patValueSpan.textContent = newPat || '未设置';
  
  // 2. 存入数据库 (关键：键名为 'pat')
  await saveData('pat', newPat);
  
  // 3. 提示并返回
  // alert('拍一拍设置已保存'); // 可选：如果你想要弹窗提示就取消注释
  showPage(personalInfoPage);
});

  signatureItem.addEventListener('click', () => {
    originalValues.signature = signatureValueSpan.textContent;
    signatureInput.value = originalValues.signature === '未填写' ? '' : originalValues.signature;
    showPage(signatureEditPage);
    signatureInput.focus();
    signatureSaveBtn.classList.remove('active');
    signatureCounter.textContent = 30 - signatureInput.value.length;
  });
  signatureInput.addEventListener('input', () => {
    signatureCounter.textContent = 30 - signatureInput.value.length;
    const originalValue = originalValues.signature === '未填写' ? '' : originalValues.signature;
    signatureSaveBtn.classList.toggle('active', signatureInput.value !== originalValue);
  });
  signatureSaveBtn.addEventListener('click', async () => {
    if (!signatureSaveBtn.classList.contains('active')) return;
    const newSignature = signatureInput.value.trim();
    signatureValueSpan.textContent = newSignature || '未填写';
    await saveData('signature', newSignature);
    showPage(personalInfoPage);
  });

  ringtoneItem.addEventListener('click', () => showPage(ringtonePage));
  
  ringtonePreviewBtn.addEventListener('click', () => {
    if (ringtonePlayer.paused) {
      ringtonePlayer.play().catch(e => customAlert("无法播放铃声。"));
      ringtonePreviewBtn.classList.add('playing');
    } else {
      ringtonePlayer.pause();
      ringtonePlayer.currentTime = 0;
      ringtonePreviewBtn.classList.remove('playing');
    }
  });
  
  ringtonePlayer.addEventListener('ended', () => {
    ringtonePreviewBtn.classList.remove('playing');
  });
  
  historyLinkBtn.addEventListener('click', () => {
    showPage(ringtoneHistoryPage);
  });
  
  document.querySelector('.back-from-history').addEventListener('click', () => {
    showPage(ringtonePage);
  });

  showRingtoneModalBtn.addEventListener('click', () => { ringtoneChangeModal.style.display = 'flex'; });
  cancelRingtoneChange.addEventListener('click', () => {
    ringtoneChangeModal.style.display = 'none';
    ringtoneUrlInput.value = '';
    ringtoneFileInput.value = '';
    fileNameSpan.textContent = '';
    ringtoneNameInput.value = '';
  });
  ringtoneFileInput.addEventListener('change', () => {
    if (ringtoneFileInput.files.length > 0) {
      fileNameSpan.textContent = ringtoneFileInput.files[0].name;
      ringtoneUrlInput.value = '';
    }
  });

  saveRingtoneChange.addEventListener('click', async () => {
    const url = ringtoneUrlInput.value.trim();
    const file = ringtoneFileInput.files[0];
    const customName = ringtoneNameInput.value.trim();
    
    if (!url && !file) return customAlert('请输入URL或选择一个文件。');

    const processRingtone = async (src, defaultName) => {
      const finalName = customName || defaultName;
      const data = { src, name: finalName };
      
      const existingIndex = ringtoneHistory.findIndex(item => item.name === finalName);
      if (existingIndex === -1) {
        ringtoneHistory.unshift(data);
        if (ringtoneHistory.length > 20) {
          ringtoneHistory.pop();
        }
        await saveData('ringtoneHistory', ringtoneHistory);
      }
      
      if (!ringtonePlayer.paused) {
        ringtonePlayer.pause();
      }
      ringtonePlayer.currentTime = 0;
      ringtonePreviewBtn.classList.remove('playing');
      
      currentRingtone = data;
      ringtonePlayer.src = data.src;
      ringtoneName.textContent = data.name;
      ringtoneValueSpan.textContent = data.name;
      await saveData('ringtone', data);
      renderRingtoneHistory();
      cancelRingtoneChange.click();
      customAlert('铃声已更换！');
    };

    if (url) {
      await processRingtone(url, url.split('/').pop() || '网络铃声');
    } else if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => await processRingtone(e.target.result, file.name);
      reader.readAsDataURL(file);
    }
  });

  profileHeader.addEventListener('click', () => showPage(personalInfoPage));
  backButton.addEventListener('click', () => showPage(mainApp));
  document.querySelectorAll('.back-from-edit').forEach(btn => {
    btn.addEventListener('click', () => showPage(personalInfoPage));
  });

const titleMap = { 'chats': '微信', 'contacts': '通讯录', 'discover': '发现', 'profile': '我' };
tabItems.forEach(item => {
  item.addEventListener('click', function() {
    const targetTab = this.getAttribute('data-tab');
    
    // 小鱼修复：清除所有页面的动画类和样式
    pages.forEach(page => {
      page.classList.remove('active', 'slide-from-left', 'slide-to-right', 'slide-to-left');
      page.style.display = 'none'; // 确保所有页面都隐藏
      page.style.position = ''; // 重置position
      page.style.opacity = '';
      page.style.transform = '';
    });
    
    tabItems.forEach(tab => tab.classList.remove('active'));
    this.classList.add('active');
    
    // 小鱼修复：正确显示目标页面
    const targetPage = document.getElementById(targetTab);
    targetPage.style.display = 'block';
    targetPage.classList.add('active');
    
    navTitle.textContent = titleMap[targetTab];
    navBar.classList.toggle('nav-bar-hidden', targetTab === 'profile');
  });
});
/* 小鱼新增：主界面左右滑动切换功能（已优化全屏滑动+动画效果） */
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const swipeThreshold = 60; // 最小水平滑动距离
const verticalThreshold = 40; // 最大垂直滑动距离（防止误触）

mainApp.addEventListener('touchstart', (e) => {
  // 只在主应用界面生效，不影响其他全屏页面
  if (mainApp.style.display !== 'none') {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }
}, { passive: true });

mainApp.addEventListener('touchend', (e) => {
  if (mainApp.style.display !== 'none') {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }
}, { passive: true });

function handleSwipe() {
  const deltaX = touchEndX - touchStartX;
  const deltaY = Math.abs(touchEndY - touchStartY);

  // 如果垂直滑动距离太大，认为是上下滚动，不触发页面切换
  if (deltaY > verticalThreshold) {
    return;
  }

  // 检查水平滑动距离是否超过阈值
  if (Math.abs(deltaX) < swipeThreshold) {
    return;
  }

  // 找到当前激活的标签索引
  const currentIndex = Array.from(tabItems).findIndex(tab => tab.classList.contains('active'));
  let targetIndex = -1;

  if (deltaX > 0 && currentIndex > 0) {
    // 向右滑动（切换到上一个标签）
    targetIndex = currentIndex - 1;
    animatePageTransition(currentIndex, targetIndex, 'right');
  } else if (deltaX < 0 && currentIndex < tabItems.length - 1) {
    // 向左滑动（切换到下一个标签）
    targetIndex = currentIndex + 1;
    animatePageTransition(currentIndex, targetIndex, 'left');
  }
}

/* 小鱼新增：页面切换动画函数 */
function animatePageTransition(fromIndex, toIndex, direction) {
  const fromPage = pages[fromIndex];
  const toPage = pages[toIndex];

  // 清除所有动画类
  pages.forEach(page => {
    page.classList.remove('slide-from-left', 'slide-to-right', 'slide-to-left');
  });

  if (direction === 'left') {
    // 向左滑动
    toPage.style.display = 'block';
    toPage.style.position = 'absolute';
    toPage.style.transform = 'translateX(100%)';
    toPage.style.opacity = '0';
    
    setTimeout(() => {
      toPage.style.transform = 'translateX(0)';
      toPage.style.opacity = '1';
      fromPage.style.transform = 'translateX(-100%)';
      fromPage.style.opacity = '0';
      
      setTimeout(() => {
        fromPage.classList.remove('active');
        fromPage.style.display = 'none';
        fromPage.style.transform = '';
        fromPage.style.opacity = '';
        fromPage.style.position = '';
        
        toPage.classList.add('active');
        toPage.style.position = '';
        toPage.style.transform = '';
        toPage.style.opacity = '';
      }, 300);
    }, 10);
  } else {
    // 向右滑动
    toPage.style.display = 'block';
    toPage.style.position = 'absolute';
    toPage.style.transform = 'translateX(-100%)';
    toPage.style.opacity = '0';
    
    setTimeout(() => {
      toPage.style.transform = 'translateX(0)';
      toPage.style.opacity = '1';
      fromPage.style.transform = 'translateX(100%)';
      fromPage.style.opacity = '0';
      
      setTimeout(() => {
        fromPage.classList.remove('active');
        fromPage.style.display = 'none';
        fromPage.style.transform = '';
        fromPage.style.opacity = '';
        fromPage.style.position = '';
        
        toPage.classList.add('active');
        toPage.style.position = '';
        toPage.style.transform = '';
        toPage.style.opacity = '';
      }, 300);
    }, 10);
  }

  // 更新底部标签栏和标题
  tabItems.forEach(tab => tab.classList.remove('active'));
  tabItems[toIndex].classList.add('active');
  
  const targetTab = tabItems[toIndex].getAttribute('data-tab');
  navTitle.textContent = titleMap[targetTab];
  navBar.classList.toggle('nav-bar-hidden', targetTab === 'profile');
}
  document.body.addEventListener('touchmove', (e) => {
  if (!e.target.closest('.content, .ringtone-content, .chat-messages, textarea, input, .modal-content, #chatStickerOverlay, #momentsFeedContainer, #momentsPage')) e.preventDefault();
}, { passive: false });

/* 小鱼新增：角色管理逻辑（包含新建和编辑） */
const newFriendBtn = document.getElementById('newFriendBtn');
const createCharacterPage = document.getElementById('createCharacterPage');
const saveCharacterBtn = document.getElementById('saveCharacterBtn');
const charAvatarPreview = document.getElementById('charAvatarPreview');
const charAvatarInput = document.getElementById('charAvatarInput');
const charRealName = document.getElementById('charRealName');
const charNickname = document.getElementById('charNickname');
const charPersona = document.getElementById('charPersona');
const customContactsList = document.getElementById('customContactsList');
const backFromCreateBtn = document.querySelector('.back-from-create');
const pageTitle = createCharacterPage.querySelector('h1'); // 获取标题元素

let tempCharAvatar = ''; // 临时存储头像
let currentEditingId = null; // 关键：用来记录当前是在“新建”还是“编辑”

// 小鱼新增：渲染表情库选择列表
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

// 1. 点击“新的朋友” -> 进入新建模式
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

// 2. 点击列表中的角色 -> 进入编辑模式
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

// 3. 返回按钮 (小鱼修复：智能判断返回路径)
backFromCreateBtn.addEventListener('click', () => {
  if (currentEditingId) {
    // 如果是编辑模式，返回资料页
    showPage(document.getElementById('contactProfilePage'));
  } else {
    // 如果是新建模式，返回通讯录
    showPage(mainApp);
  }
});

// 4. 头像上传处理
charAvatarPreview.addEventListener('click', () => charAvatarInput.click());
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

// 5. 保存按钮（智能判断是新建还是更新）
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

// 6. 渲染列表（修改了onclick事件，指向打开主页函数）
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

// 7. 加载入口
const originalLoadUserData = loadUserData;
loadUserData = async function() {
  await originalLoadUserData();
  try {
    const contacts = await getData('customContacts') || [];
    renderCustomContacts(contacts);
  } catch (e) {
    console.log('暂无自定义联系人');
  }
};