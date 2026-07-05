/* 模块: js/ringtone.js */

// [FunctionDeclaration] Function: renderRingtoneHistory
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

// [FunctionDeclaration] Function: switchToRingtone
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

// [ExpressionStatement] Execution: addEventListener
historyMenuBtn.addEventListener('click', () => {
    historyActionSheetOverlay.style.display = 'flex';
  });

// [ExpressionStatement] Execution: addEventListener
cancelActionBtn.addEventListener('click', () => {
    historyActionSheetOverlay.style.display = 'none';
  });

// [ExpressionStatement] Execution: addEventListener
historyActionSheetOverlay.addEventListener('click', (e) => {
    if (e.target === historyActionSheetOverlay) {
      historyActionSheetOverlay.style.display = 'none';
    }
  });

// [ExpressionStatement] Execution: addEventListener
clearHistoryBtn.addEventListener('click', async () => {
    if (await customConfirm('确定要清空所有历史记录吗？')) {
      ringtoneHistory = [];
      await saveData('ringtoneHistory', []);
      renderRingtoneHistory();
      historyActionSheetOverlay.style.display = 'none';
    }
  });

// [ExpressionStatement] Execution: addEventListener
multiSelectDeleteBtn.addEventListener('click', () => {
    historyActionSheetOverlay.style.display = 'none';
    multiDeleteBar.style.display = 'flex';
    renderRingtoneHistory(true); // 进入多选模式
  });

// [ExpressionStatement] Execution: addEventListener
cancelMultiDeleteBtn.addEventListener('click', () => {
    multiDeleteBar.style.display = 'none';
    renderRingtoneHistory(false); // 退出多选模式
  });

// [ExpressionStatement] Execution: addEventListener
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

