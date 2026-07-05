/* 模块: js/ui.js */

// [FunctionDeclaration] Function: showPage
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

// [FunctionDeclaration] Function: getContactDetails
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

// [FunctionDeclaration] Function: renderWorldBookOptionsForElement
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

// [ExpressionStatement] Execution: Expression
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

// [FunctionDeclaration] Function: renderStickerOptionsForElement
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

// [ExpressionStatement] Execution: addEventListener
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

// [FunctionDeclaration] Function: setupEditPage
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

// [ExpressionStatement] Execution: addEventListener
avatarItem.addEventListener('click', () => avatarInput.click());

// [ExpressionStatement] Execution: addEventListener
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

// [ExpressionStatement] Execution: Expression
setupEditPage(nameItem, nameEditPage, newNameInput, nameSaveBtn, nameValueSpan, 'userName', 'name', '未设置');

// [ExpressionStatement] Execution: Expression
setupEditPage(phoneItem, phoneEditPage, phoneInput, phoneSaveBtn, phoneValueSpan, 'phone', 'phone', '未设置');

// [ExpressionStatement] Execution: Expression
setupEditPage(wechatIdItem, wechatIdEditPage, wechatIdInput, wechatIdSaveBtn, wechatIdValueSpan, 'wechatId', 'wechatId', 'user_2025');

// [ExpressionStatement] Execution: addEventListener
userPersonaItem.addEventListener('click', () => {
  const currentVal = userPersonaValueSpan.textContent;
  userPersonaInput.value = currentVal === '未设置' ? '' : currentVal;
  showPage(userPersonaEditPage);
  userPersonaInput.focus();
  userPersonaSaveBtn.classList.remove('active');
});

// [ExpressionStatement] Execution: addEventListener
userPersonaInput.addEventListener('input', () => {
  userPersonaSaveBtn.classList.add('active');
});

// [ExpressionStatement] Execution: addEventListener
userPersonaSaveBtn.addEventListener('click', async () => {
  if (!userPersonaSaveBtn.classList.contains('active')) return;
  const newVal = userPersonaInput.value.trim();
  userPersonaValueSpan.textContent = newVal || '未设置';
  await saveData('userPersona', newVal); // 保存到数据库
  showPage(personalInfoPage);
});

// [VariableDeclaration] Variables: selectedGender
let selectedGender = '';

// [ExpressionStatement] Execution: addEventListener
genderItem.addEventListener('click', () => {
    selectedGender = genderValueSpan.textContent;
    genderOptions.forEach(option => option.classList.toggle('selected', option.dataset.gender === selectedGender));
    showPage(genderEditPage);
  });

// [ExpressionStatement] Execution: forEach
genderOptions.forEach(option => {
    option.addEventListener('click', () => {
      selectedGender = option.dataset.gender;
      genderOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
    });
  });

// [ExpressionStatement] Execution: addEventListener
genderDoneBtn.addEventListener('click', async () => {
    if (selectedGender && selectedGender !== '未设置') {
      genderValueSpan.textContent = selectedGender;
      await saveData('gender', selectedGender);
    }
    showPage(personalInfoPage);
  });

// [ExpressionStatement] Execution: addEventListener
regionItem.addEventListener('click', () => {
    originalValues.region = regionValueSpan.textContent;
    regionInput.value = originalValues.region === '未设置' ? '' : originalValues.region;
    showPage(regionEditPage);
    regionInput.focus();
    regionSaveBtn.classList.remove('active');
  });

// [ExpressionStatement] Execution: addEventListener
regionInput.addEventListener('input', () => {
    const originalValue = originalValues.region === '未设置' ? '' : originalValues.region;
    regionSaveBtn.classList.toggle('active', regionInput.value.trim() !== originalValue);
  });

// [ExpressionStatement] Execution: addEventListener
regionSaveBtn.addEventListener('click', async () => {
    if (!regionSaveBtn.classList.contains('active')) return;
    const newRegion = regionInput.value.trim();
    regionValueSpan.textContent = newRegion || '未设置';
    await saveData('region', newRegion);
    showPage(personalInfoPage);
  });

// [ExpressionStatement] Execution: addEventListener
patItem.addEventListener('click', () => {
    originalValues.pat = patValueSpan.textContent;
    patInput.value = originalValues.pat === '未设置' ? '' : originalValues.pat;
    showPage(patEditPage);
    patInput.focus();
    patSaveBtn.classList.remove('active');
    updatePatPreview();
  });

// [FunctionDeclaration] Function: updatePatPreview
function updatePatPreview() { patPreview.textContent = `朋友拍了拍我${patInput.value.trim()}`; }

// [ExpressionStatement] Execution: addEventListener
patInput.addEventListener('input', () => {
    updatePatPreview();
    const originalValue = originalValues.pat === '未设置' ? '' : originalValues.pat;
    patSaveBtn.classList.toggle('active', patInput.value.trim() !== originalValue);
  });

// [ExpressionStatement] Execution: addEventListener
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

// [ExpressionStatement] Execution: addEventListener
signatureItem.addEventListener('click', () => {
    originalValues.signature = signatureValueSpan.textContent;
    signatureInput.value = originalValues.signature === '未填写' ? '' : originalValues.signature;
    showPage(signatureEditPage);
    signatureInput.focus();
    signatureSaveBtn.classList.remove('active');
    signatureCounter.textContent = 30 - signatureInput.value.length;
  });

// [ExpressionStatement] Execution: addEventListener
signatureInput.addEventListener('input', () => {
    signatureCounter.textContent = 30 - signatureInput.value.length;
    const originalValue = originalValues.signature === '未填写' ? '' : originalValues.signature;
    signatureSaveBtn.classList.toggle('active', signatureInput.value !== originalValue);
  });

// [ExpressionStatement] Execution: addEventListener
signatureSaveBtn.addEventListener('click', async () => {
    if (!signatureSaveBtn.classList.contains('active')) return;
    const newSignature = signatureInput.value.trim();
    signatureValueSpan.textContent = newSignature || '未填写';
    await saveData('signature', newSignature);
    showPage(personalInfoPage);
  });

// [ExpressionStatement] Execution: addEventListener
ringtoneItem.addEventListener('click', () => showPage(ringtonePage));

// [ExpressionStatement] Execution: addEventListener
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

// [ExpressionStatement] Execution: addEventListener
ringtonePlayer.addEventListener('ended', () => {
    ringtonePreviewBtn.classList.remove('playing');
  });

// [ExpressionStatement] Execution: addEventListener
historyLinkBtn.addEventListener('click', () => {
    showPage(ringtoneHistoryPage);
  });

// [ExpressionStatement] Execution: addEventListener
document.querySelector('.back-from-history').addEventListener('click', () => {
    showPage(ringtonePage);
  });

// [ExpressionStatement] Execution: addEventListener
showRingtoneModalBtn.addEventListener('click', () => { ringtoneChangeModal.style.display = 'flex'; });

// [ExpressionStatement] Execution: addEventListener
cancelRingtoneChange.addEventListener('click', () => {
    ringtoneChangeModal.style.display = 'none';
    ringtoneUrlInput.value = '';
    ringtoneFileInput.value = '';
    fileNameSpan.textContent = '';
    ringtoneNameInput.value = '';
  });

// [ExpressionStatement] Execution: addEventListener
ringtoneFileInput.addEventListener('change', () => {
    if (ringtoneFileInput.files.length > 0) {
      fileNameSpan.textContent = ringtoneFileInput.files[0].name;
      ringtoneUrlInput.value = '';
    }
  });

// [ExpressionStatement] Execution: addEventListener
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

// [ExpressionStatement] Execution: addEventListener
profileHeader.addEventListener('click', () => showPage(personalInfoPage));

// [ExpressionStatement] Execution: addEventListener
backButton.addEventListener('click', () => showPage(mainApp));

// [ExpressionStatement] Execution: forEach
document.querySelectorAll('.back-from-edit').forEach(btn => {
    btn.addEventListener('click', () => showPage(personalInfoPage));
  });

// [VariableDeclaration] Variables: titleMap
const titleMap = { 'chats': '微信', 'contacts': '通讯录', 'discover': '发现', 'profile': '我' };

// [ExpressionStatement] Execution: forEach
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

// [VariableDeclaration] Variables: actionSwiperWindow
const actionSwiperWindow = document.getElementById('actionSwiperWindow');

// [VariableDeclaration] Variables: actionSheetTrack
const actionSheetTrack = document.getElementById('actionSheetTrack');

// [VariableDeclaration] Variables: actionIndicators
const actionIndicators = document.querySelectorAll('.indicator-dot');

// [VariableDeclaration] Variables: actionCurrentPage
let actionCurrentPage = 0;

// [VariableDeclaration] Variables: actionTouchStartX
let actionTouchStartX = 0;

// [VariableDeclaration] Variables: actionTouchMoveX
let actionTouchMoveX = 0;

// [VariableDeclaration] Variables: actionTotalPages
const actionTotalPages = 2;

// [IfStatement] AnonymousBlock
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

// [FunctionDeclaration] Function: updateActionSwiper
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

