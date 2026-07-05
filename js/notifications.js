/* 模块: js/notifications.js */

// [Function] startActiveMsgSystem
async function startActiveMsgSystem() {
    if (activeMsgTimer) clearInterval(activeMsgTimer);
    
    // 每分钟检查一次
    activeMsgTimer = setInterval(async () => {
        await checkAndSendActiveMsg();
    }, 60 * 1000); 
    
    console.log("✅ 微信主动发消息系统已启动 (后台运行中)");
}

// [Function] checkAndSendActiveMsg
async function checkAndSendActiveMsg() {
    // 1. 读取配置
    const config = await localforage.getItem(API_ACTIVE_MSG_CONFIG_KEY);
    if (!config || !config.enabled || !config.selectedChars || config.selectedChars.length === 0) return;

    // 2. 检查时间间隔
    const lastRunTime = await localforage.getItem('last_active_msg_time') || 0;
    const intervalMs = (config.interval || 30) * 60 * 1000;
    const now = Date.now();

    if (now - lastRunTime < intervalMs) return; // 时间还没到

    // 3. 随机抽取一个幸运角色
    const charId = config.selectedChars[Math.floor(Math.random() * config.selectedChars.length)];
    
    // 4. 获取角色详情
    const contacts = await getWxData('customContacts') || [];
    const character = contacts.find(c => c.id === charId);
    if (!character) return;

    // 5. 获取聊天记录
    const historyKey = `chat_messages_${charId}`;
    let history = await getWxData(historyKey) || [];

    // 6. 防打扰检查：如果最后一条消息是用户刚发的(10分钟内)，不要打断
    if (history.length > 0) {
        const lastMsg = history[history.length - 1];
        if (lastMsg.role === 'user' && (now - lastMsg.timestamp < 10 * 60 * 1000)) {
            console.log("用户刚发过言，暂不主动打扰");
            return;
        }
    }

    console.log(`🤖 正在为角色 [${character.realName || character.nickname}] 生成主动消息...`);

    // ======================================================
    // ★★★ 核心升级：构建与微信完全一致的 Prompt 环境 ★★★
    // ======================================================

    // A. 获取用户资料 (User Profile)
    const [uName, uGender, uRegion, uPhone, uWxId, uSign, uPersona] = await Promise.all([
        getWxData('userName'), getWxData('gender'), getWxData('region'),
        getWxData('phone'), getWxData('wechatId'), getWxData('signature'), getWxData('userPersona')
    ]);

    // B. 获取世界书 (World Book)
    let worldBookPrompt = "";
    if (character.worldBookIds && character.worldBookIds.length > 0) {
        const rawWb = localStorage.getItem('wechat_world_book_shared'); // 世界书存在localStorage
        const allEntries = rawWb ? JSON.parse(rawWb) : [];
        const activeEntries = allEntries.filter(e => character.worldBookIds.includes(e.id));
        if (activeEntries.length > 0) {
            worldBookPrompt = "\n# 世界观与补充设定 (World Book)：\n" + 
                activeEntries.map(e => `[${e.title}]: ${e.content}`).join('\n') + "\n";
        }
    }

    // C. 获取表情包 (Stickers)
    let stickerPrompt = "";
    let availableStickers = []; 
    if (character.allowedStickerLibs && character.allowedStickerLibs.length > 0) {
        const allLibs = await getWxData('stickerLibs') || [];
        const targetLibs = allLibs.filter(lib => character.allowedStickerLibs.includes(lib.id));
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
        stickerPrompt = `
# 可用表情包指令：
你拥有以下表情包（名称）：[${stickerNames}]。
**⚠️ 表情使用铁律（违反将导致显示错误）：**
1. **只能用上面【】内的名称**，一个字都不能改！不要自己编造名称！
2. 每次回复最多1-2个表情，且要符合情绪（高兴时用"${stickerExamples}"等）
3. 格式必须是：{"type": "face", "content": "完全一致的表情名"}
**发送格式：**
在JSON数组中插入 {"type": "face", "content": "表情名称"}。`;
    } else {
        stickerPrompt = `\n# 表情使用建议：\n你没有自定义表情包，但可以在回复中适当使用emoji表情符号（如😊❤️👍等）。`;
    }

    // D. 检查心声开关 (Inner Voice)
    const innerVoiceEnabled = await getWxData('innerVoice_' + charId);
    const innerVoicePrompt = innerVoiceEnabled ? `
【⚠️ 强制指令：心声模式已激活 ⚠️】
系统检测到"心声开关"已打开。你**必须**在本次回复中输出角色的真实内心活动！
1. **强制输出**：本次回复的JSON数组中，**必须**包含至少 1 条 {"type": "inner_voice", ...} 的消息。
2. **内容反差**：心声是角色的潜台词、吐槽、阴暗面或真实情感。` : '';

    // E. ★★★ 时间感知能力 (Time Perception) ★★★
    // 无论微信是否勾选（因为我们无法读取微信内部的临时勾选状态），
    // 只要是主动发消息，AI必须知道现在是几点，否则无法判断是说"早安"还是"晚安"。
    const nowTime = new Date();
    const timeString = nowTime.toLocaleString('zh-CN', { 
        year: 'numeric', month: 'long', day: 'numeric', 
        weekday: 'long', hour: '2-digit', minute: '2-digit' 
    });
    const timePrompt = `\n# 当前现实时间：\n现在是 ${timeString}。\n请根据这个时间判断你的问候语（早安/晚安）和行为逻辑（比如深夜不应该约出门）。`;

    // F. 最终 Prompt 组装 (与微信完全一致)
    const systemPrompt = `你现在扮演一个名为"${character.nickname}"的角色。
# 你的角色设定：
${character.persona || '无特殊设定'}
${worldBookPrompt}
# 正在和你聊天的人（用户）资料：
- 名字：${uName || '用户'}
- 性别：${uGender || '未知'}
- 地区：${uRegion || '未知'}
- 手机号：${uPhone || '未知'}
- 微信号：${uWxId || '未知'}
- 个性签名：${uSign || '无'}
- 用户人设/备注：${uPersona || '无'}
(请在回复中根据上述用户资料进行互动)
${timePrompt}
# 【重要】当前场景说明：
你现在处于 **线上聊天模式（微信对话）**。
**核心规则**：
1. **时间顺序理解**：消息已按时间排序，无论线上线下，请按顺序理解对话逻辑
2. **场景切换感知**：看到 [线下] 标签时，说明那段时间你们在面对面聊天；回到 [线上] 时，又变成了微信文字交流
3. **当前状态**：此刻你正在使用微信回复，应该用文字聊天的语气（而非面对面）
${stickerPrompt}
${innerVoicePrompt}
# ★★★ 新增：拍一拍功能说明 ★★★
你可以向对方发送"拍一拍"动作。
**格式必须是**：{"type": "pat", "content": "后缀内容"}
**规则**：
1. 系统会自动添加前缀 "我拍了拍用户"，你只需要填写**后缀**。
2. 后缀通常以 "的..." 开头，或者 "说..." 开头。
3. 示例：
   - 想表达 "拍了拍用户的肩膀"，content 填 "的肩膀"
   - 想表达 "拍了拍用户的头"，content 填 "的头"
4. 不要自己在 content 里写 "我" 或 "拍了拍"，只写后面的部分！
# 你的任务与核心规则：
1. **【【【输出格式】】】**: 你的回复【必须】是一个纯JSON数组格式的字符串，不要包含markdown标记。
   - 数组元素支持四种类型："text", "face", "inner_voice", "pat"
2. **对话节奏**: 模拟真人的聊天习惯，你可以一次性生成多条短消息。每次要回复至少3-8条消息！
3. **互动限制**: 不能一直要求和用户见面，这是线上聊天。
4. **${innerVoiceEnabled ? '心声执行' : '隐私保护'}**: ${innerVoiceEnabled ? '请务必执行心声指令！' : '不要输出 inner_voice 类型的消息。'}
5. **【格式禁忌】**：JSON数组中绝对不要包含 [线上]、[线下]、[系统提示] 等场景标签！`;

    // 7. 构建虚拟聊天上下文 (插入隐形指令)
    const triggerMsg = {
        role: 'user',
        content: '（此时此刻，你突然想给用户发条消息...）', 
        isHidden: true, 
        timestamp: now,
        source: 'online'
    };
    
    const contextMsgs = history.slice(-15).map(m => {
        const sourceLabel = (m.source === 'offline') ? '[线下]' : '[线上]';
        // 还原图片和表情的Prompt格式
        let content = m.content;
        if (m.type === 'sticker') content = `${sourceLabel} [发送了表情: ${m.desc || '图片'}]`;
        else if (m.type === 'inner_voice') content = `${sourceLabel} [内心独白: ${m.content}]`;
        else content = `${sourceLabel} ${m.content}`;
        return { role: m.role, content: content };
    });

    const messages = [
        { role: 'system', content: systemPrompt },
        ...contextMsgs,
        { role: 'user', content: triggerMsg.content }
    ];

    // 8. 调用AI
    const responseText = await callLLMForActiveMsg(messages);

    if (responseText) {
        // 解析 JSON 数组
        let responseMsgs = [];
        try {
            let cleanStr = responseText.replace(/```json/g, '').replace(/```/g, '');
            const firstBracket = cleanStr.indexOf('[');
            const lastBracket = cleanStr.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
                cleanStr = cleanStr.substring(firstBracket, lastBracket + 1);
                responseMsgs = JSON.parse(cleanStr);
            } else {
                throw new Error("非JSON格式");
            }
        } catch (e) {
            console.warn("后台JSON解析失败，降级处理");
            responseMsgs = [{ type: 'text', content: responseText }];
        }

        // 保存隐形触发指令
        history.push(triggerMsg);

        // ★★★ 新增：定义数组用于收集通知文本 ★★★
        let notificationList = []; 
        let previewContent = '';

        // 逐条保存 AI 回复
        for (let i = 0; i < responseMsgs.length; i++) {
            const msg = responseMsgs[i];
            let type = msg.type || 'text';
            let content = msg.content;

            // 处理表情包映射
            if (type === 'face') {
                const sticker = availableStickers.find(s => s.name === content);
                if (sticker) {
                    type = 'sticker';
                    content = sticker.url; // 换成URL
                } else {
                    type = 'text';
                    content = `[${content}]`; // 没找到就转文字
                }
            }
            
            // 处理拍一拍
            if (type === 'pat') {
                let suffix = content.replace(/^拍了拍/, '').trim();
                content = `"${character.nickname}" 拍了拍我${suffix}`;
            }

            const aiMsg = {
                role: 'assistant',
                type: type,
                content: content,
                desc: (type === 'sticker') ? msg.content : '', // 存表情原名
                timestamp: Date.now() + i * 100,
                source: 'online' // ★ 标记为线上消息
            };
            history.push(aiMsg);

            // ★ 修改：收集所有消息用于通知展示
            let notifText = '';
            if (type === 'sticker') notifText = '[表情]';
            else if (type === 'pat') notifText = '[拍一拍]';
            else notifText = content;
            
            // 将处理好的文本加入数组
            notificationList.push(notifText);
            
            // 更新最后一条作为列表预览
            previewContent = notifText;
        }
        
        await saveWxData(historyKey, history);

        // 9. 更新会话列表
        let sessions = await getWxData('chat_sessions') || [];
        sessions = sessions.filter(s => s.id !== charId);
        sessions.unshift({
            id: charId,
            name: character.realName || character.nickname,
            avatar: character.avatar,
            content: previewContent,
            time: Date.now()
        });
        await saveWxData('chat_sessions', sessions);

        // 10. 更新最后运行时间并弹窗
        await localforage.setItem('last_active_msg_time', now);
        
        // ★ 修改：传入消息数组 notificationList
        showHeadsUpNotification(
            charId, 
            character.realName || character.nickname, 
            notificationList, 
            character.avatar
        );
        
        // 通知微信刷新
        const bridge = document.getElementById('wechat-data-bridge');
        if (bridge && bridge.contentWindow) {
            bridge.contentWindow.postMessage({ action: 'refresh-chat-list' }, '*');
        }
    }
}

// [Function] resetHeadsUpNotificationStyles
function resetHeadsUpNotificationStyles() {
    const notif = document.getElementById('heads-up-notification');
    if (!notif) return;
    notif.style.display = '';
    notif.style.transform = '';
    notif.style.opacity = '';
    notif.style.transition = '';
}

// [Function] closeCurrentNotificationUI
function closeCurrentNotificationUI(withAnimation = true, direction = 'up') {
    return new Promise((resolve) => {
        const notif = document.getElementById('heads-up-notification');
        if (!notif) { resolve(); return; }

        if (notifTimer) clearTimeout(notifTimer);

        const finishClose = () => {
            // 先锁住，防止 .show 移除触发默认动画
            notif.style.transition = 'none';
            notif.style.opacity = '0';
            notif.style.display = 'none';
            void notif.offsetHeight; // 强制重绘
            notif.classList.remove('show');
            // 恢复，为下一条做准备
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
            setTimeout(() => { finishClose(); }, 220);
        } else {
            finishClose();
        }
    });
}

// [Function] resetHeadsUpNotificationPosition
function resetHeadsUpNotificationPosition() {
    const notif = document.getElementById('heads-up-notification');
    if (!notif) return;
    notif.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
    notif.style.transform = 'translate(0, 0)';
    notif.style.opacity = '1';
    setTimeout(() => { notif.style.transition = ''; }, 200);
}

// [Function] playNextNotificationInQueue
async function playNextNotificationInQueue() {
    const notif = document.getElementById('heads-up-notification');
    const nameEl = document.getElementById('notif-sender-name');
    const msgEl = document.getElementById('notif-message-text');
    const avatarEl = document.getElementById('notif-avatar-img');
    if (!notif) return;

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
    avatarEl.src = notif.dataset.senderAvatar || 'logo.png';

    notifHasSwipedToClose = false;
    notifIsDragging = false;
    notifSwipeDirectionLock = '';
    notif.style.display = '';
    resetHeadsUpNotificationStyles();

    await new Promise(r => setTimeout(r, 50));
    notif.classList.add('show');
    if (navigator.vibrate) navigator.vibrate(30);

    await new Promise((resolve) => {
        notifCurrentDismissResolver = resolve;
        notifTimer = setTimeout(async () => {
    await closeCurrentNotificationUI(true, 'up');
    resolve();
}, notifCurrentIndex < notifMessageQueue.length - 1 ? 2500 : 5000);
    });

    notifCurrentDismissResolver = null;
    notifCurrentIndex++;

    if (notifCurrentIndex < notifMessageQueue.length) {
        await new Promise(r => { notifQueueTimer = setTimeout(r, 350); });
        await playNextNotificationInQueue();
    } else {
        notifIsSequencePlaying = false;
        notifMessageQueue = [];
        notifCurrentIndex = 0;
    }
}

// [Function] showHeadsUpNotification
async function showHeadsUpNotification(charId, name, messagesArray, avatar) {
    const notif = document.getElementById('heads-up-notification');
    if (!notif) return;

    currentNotifChatId = charId;
    notif.dataset.senderName = name || '';
    notif.dataset.senderAvatar = avatar || 'logo.png';

    const msgs = Array.isArray(messagesArray) ? messagesArray : [messagesArray];

    if (notifTimer) clearTimeout(notifTimer);
    if (notifQueueTimer) clearTimeout(notifQueueTimer);

    notifMessageQueue = msgs;
    notifCurrentIndex = 0;

    // 如果当前有旧弹窗，先直接重置为隐藏状态，为新队列做准备
notif.classList.remove('show');
resetHeadsUpNotificationStyles();
notif.style.display = '';
notifSwipeDirectionLock = '';
notifHasSwipedToClose = false;
notifIsDragging = false;

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

// [Function] handleNotificationClick
async function handleNotificationClick() {
    if (notifHasSwipedToClose || notifIsDragging) return;

    if (notifTimer) clearTimeout(notifTimer);
    if (notifQueueTimer) clearTimeout(notifQueueTimer);

    await closeCurrentNotificationUI(true, 'up');

    notifIsSequencePlaying = false;
    notifMessageQueue = [];
    notifCurrentIndex = 0;
    if (notifCurrentDismissResolver) {
        notifCurrentDismissResolver();
        notifCurrentDismissResolver = null;
    }

    const apps = await getApps();
    const wechatApp = apps.find(app => app.name === '微信' || (app.url && app.url.includes('微信.html')));

    if (wechatApp) {
        await openApp(wechatApp.id);
        const iframe = document.getElementById('app-iframe-main');
        const sendJumpSignal = () => {
            if (iframe && iframe.contentWindow && currentNotifChatId) {
                iframe.contentWindow.postMessage({ action: 'jump-to-chat', chatId: currentNotifChatId }, '*');
            }
        };
        setTimeout(sendJumpSignal, 500);
        setTimeout(sendJumpSignal, 1200);
    } else {
        showToast('未找到微信应用，请检查应用名称是否为"微信"');
    }
}

// [Expression] addEventListener
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
        notifSwipeDirectionLock = '';
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

        // 方向锁定
        if (!notifSwipeDirectionLock) {
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);
            if (absX < 8 && absY < 8) return;
            if (deltaX > 0 && absX > absY) {
                notifSwipeDirectionLock = 'right';
            } else if (deltaY < 0 && absY > absX) {
                notifSwipeDirectionLock = 'up';
            } else {
                return;
            }
        }

        // 只走单轴
        if (notifSwipeDirectionLock === 'right') {
            const moveX = Math.max(deltaX, 0);
            notif.style.transform = `translateX(${moveX}px)`;
            notif.style.opacity = 1 - Math.min(moveX / 180, 0.7);
        }
        if (notifSwipeDirectionLock === 'up') {
            const moveY = Math.min(deltaY, 0);
            notif.style.transform = `translateY(${moveY}px)`;
            notif.style.opacity = 1 - Math.min(Math.abs(moveY) / 180, 0.7);
        }
    }, { passive: true });

    notif.addEventListener('touchend', async () => {
        if (!notifIsDragging || !notif.classList.contains('show')) return;
        notifIsDragging = false;

        const deltaX = notifTouchCurrentX - notifTouchStartX;
        const deltaY = notifTouchCurrentY - notifTouchStartY;

        const shouldCloseByRight = notifSwipeDirectionLock === 'right' && deltaX > 80;
        const shouldCloseByUp    = notifSwipeDirectionLock === 'up'    && deltaY < -60;

        if (shouldCloseByRight || shouldCloseByUp) {
            notifHasSwipedToClose = true;
            await closeCurrentNotificationUI(true, shouldCloseByRight ? 'right' : 'up');
            // 只结束当前这一条，队列继续
            if (notifCurrentDismissResolver) {
                notifCurrentDismissResolver();
                notifCurrentDismissResolver = null;
            }
        } else {
            notifSwipeDirectionLock = '';
            resetHeadsUpNotificationPosition();
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

// [Expression] AnonymousBlock
startActiveMsgSystem();

