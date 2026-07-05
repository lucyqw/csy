/* 模块: js/notifications.js */

// [VariableDeclaration] Variables: notifTimer
let notifTimer = null;

// [VariableDeclaration] Variables: notifQueueTimer
let notifQueueTimer = null;

// [VariableDeclaration] Variables: currentNotifChatId
let currentNotifChatId = null;

// [VariableDeclaration] Variables: notifMessageQueue
let notifMessageQueue = [];

// [VariableDeclaration] Variables: notifCurrentIndex
let notifCurrentIndex = 0;

// [VariableDeclaration] Variables: notifIsSequencePlaying
let notifIsSequencePlaying = false;

// [VariableDeclaration] Variables: notifCurrentDismissResolver
let notifCurrentDismissResolver = null;

// [VariableDeclaration] Variables: notifTouchStartX
let notifTouchStartX = 0;

// [VariableDeclaration] Variables: notifTouchStartY
let notifTouchStartY = 0;

// [VariableDeclaration] Variables: notifTouchCurrentX
let notifTouchCurrentX = 0;

// [VariableDeclaration] Variables: notifTouchCurrentY
let notifTouchCurrentY = 0;

// [VariableDeclaration] Variables: notifIsDragging
let notifIsDragging = false;

// [VariableDeclaration] Variables: notifHasSwipedToClose
let notifHasSwipedToClose = false;

// [VariableDeclaration] Variables: notifSwipeDirectionLock
let notifSwipeDirectionLock = '';

// [FunctionDeclaration] Function: resetHeadsUpNotificationStyles
function resetHeadsUpNotificationStyles() {
    const notif = document.getElementById('heads-up-notification');
    if (!notif) return;

    notif.style.display = '';
    notif.style.transform = '';
    notif.style.opacity = '';
    notif.style.transition = '';
}

// [FunctionDeclaration] Function: closeCurrentNotificationUI
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

// [FunctionDeclaration] Function: resetHeadsUpNotificationPosition
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

// [FunctionDeclaration] Function: playNextNotificationInQueue
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

// [FunctionDeclaration] Function: showHeadsUpNotification
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

// [FunctionDeclaration] Function: handleNotificationClick
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

// [ExpressionStatement] Execution: addEventListener
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

// [ExpressionStatement] Execution: addEventListener
window.addEventListener('DOMContentLoaded', async () => {
    await loadUserData();
    // ★ 页面加载完成后，检测并恢复未结束的通话
    await restoreCallState();
});

// [ExpressionStatement] Execution: addEventListener
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

