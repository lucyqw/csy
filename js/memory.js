/* 模块: js/memory.js */

// [FunctionDeclaration] Function: summarizeMemory
async function summarizeMemory(isSilent = false) {
    if (isSilent) {
        // 自动总结：直接执行后台逻辑
        await executeSummary([], true);
    } else {
        // 兼容旧代码调用，其实现在手动多选直接走 enterMultiSelectMode() 了
        enterMultiSelectMode();
    }
}

// [FunctionDeclaration] Function: summarizeContextMemory
async function summarizeContextMemory() {
    closeActionSheet(); // 先收起+号面板
    if (!currentChatId) return;

    // 1. 获取当前设置的上下文长度
    const savedLimit = await getData('contextLimit_' + currentChatId) || 20;
    
    // 2. 获取所有消息
    const key = 'chat_messages_' + currentChatId;
    const allMessages = await getData(key) || [];
    
    // 3. 截取最近的 N 条消息 (与AI读取的上下文长度一致)
    // 过滤掉隐藏指令，只总结真实对话
    const visibleMessages = allMessages.filter(m => !m.isHidden && m.type !== 'system_separator');
    const targetMessages = visibleMessages.slice(-savedLimit);

    if (targetMessages.length === 0) {
        customAlert('当前没有可总结的聊天记录');
        return;
    }

    if (await customConfirm(`系统将自动提取最近 ${targetMessages.length} 条对话生成记忆，是否继续？`)) {
        // 直接调用执行总结函数
        await executeSummary(targetMessages, false);
    }
}

// [FunctionDeclaration] Function: submitSelectedSummary
async function submitSelectedSummary() {
    if (selectedTimestamps.size === 0) {
        customAlert('请至少选择一条消息');
        return;
    }

    // 1. 获取所有消息
    const key = 'chat_messages_' + currentChatId;
    const allMessages = await getData(key) || [];
    
    // ★★★ 核心修复：按照消息在聊天记录中的原始顺序进行总结 ★★★
    // 2. 筛选出选中的消息，并保持原始顺序
    const targetMessages = allMessages.filter(m => selectedTimestamps.has(m.timestamp));
    
    // 3. 按时间戳严格排序（从早到晚）
    targetMessages.sort((a, b) => a.timestamp - b.timestamp);
    
    console.log(`✅ 准备总结 ${targetMessages.length} 条消息，时间范围: ${new Date(targetMessages[0].timestamp).toLocaleString()} ~ ${new Date(targetMessages[targetMessages.length - 1].timestamp).toLocaleString()}`);
    
    // 4. 退出多选模式
    exitMultiSelectMode();
    
    // 5. 执行总结
    await executeSummary(targetMessages, false);
}

// [FunctionDeclaration] Function: executeSummary
async function executeSummary(manualMessages = [], isSilent = false) {
    if (!currentChatId) return;
    const key = 'chat_messages_' + currentChatId;
    let messages = await getData(key) || [];
    let targetMessages = [];

    // 1. 筛选消息
    if (isSilent) {
        let lastSummaryIndex = -1;
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].summarized === true) {
                lastSummaryIndex = i;
                break;
            }
        }
        const unsummarized = lastSummaryIndex === -1 ? messages : messages.slice(lastSummaryIndex + 1);
        targetMessages = unsummarized.filter(m => !m.isHidden && m.type !== 'system_separator' && (m.type === 'text' || m.type === 'voice' || m.type === 'inner_voice'));
        
        // ★★★ 核心修改：提高门槛到10条 ★★★
        if (targetMessages.length < 10) {
            console.log(`未总结消息仅 ${targetMessages.length} 条，未达到10条门槛，跳过总结`);
            return;
        }
    } else {
        targetMessages = manualMessages;
    }

    if (targetMessages.length === 0) {
        if (!isSilent) customAlert('没有有效的内容可总结');
        return;
    }

    // 2. 准备数据
const contact = await getContactDetails(currentChatId);
const isGroup = contact.isGroup;
const userName = await getData('userName') || '用户';

// ★★★ 群聊不再需要分发名单，统一存储 ★★★

    // ★★★ 核心修复：构建对话文本（严格按时间顺序 + 清洗图片/语音）★★★
// 小鱼优化：在总结前，先建立一个 [昵称 -> 真名] 的查找表
let nicknameToRealNameMap = {};
if (isGroup) {
    const allContactsForMap = await getData('customContacts') || [];
    const groupMemberIds = contact.memberIds || [];
    const groupMembers = allContactsForMap.filter(c => groupMemberIds.includes(c.id));
    groupMembers.forEach(m => {
        // 建立映射：昵称 -> 真名 (如果没有真名就用昵称)
        nicknameToRealNameMap[m.nickname] = m.realName || m.nickname;
    });
}

const conversationText = targetMessages.map((m, index) => {
    let speaker = m.role === 'user' ? userName : (contact.realName || contact.nickname);
    
    // 如果是群聊，尝试把“发送者昵称”翻译回“真名”
    if (isGroup && m.senderName) {
        speaker = nicknameToRealNameMap[m.senderName] || m.senderName;
    }
    
    let content = m.content;

        // 清洗特殊消息
        if (m.type === 'sticker') {
            if (m.ai_description) {
                content = `[图片内容: ${m.ai_description}]`;
            } else if (m.desc) {
                content = `[表情/图片: ${m.desc}]`;
            } else {
                content = `[发送了一张图片]`;
            }
        } else if (typeof content === 'string' && content.startsWith('[VOICE:')) {
            const match = content.match(/^\[VOICE:\d+:(.+)\]$/);
            content = match ? `(语音) ${match[1]}` : content;
        } else if (m.type === 'inner_voice') {
            content = `(内心独白: ${content})`;
        } else if (m.type === 'pat') {
            content = `(动作) ${content}`;
        }

        return `[${index + 1}] ${speaker}: ${content}`;
    }).join('\n');

    // ★★★ 核心新增：计算建议总结条数（10条对话→1条记忆）★★★
    const msgCount = targetMessages.length;
    const maxSummaryCount = Math.max(1, Math.floor(msgCount / 10));

    // UI 反馈
    let originalTitle = '';
    if (!isSilent) {
        originalTitle = document.getElementById('chatTitle').textContent;
        document.getElementById('chatTitle').textContent = '正在提取记忆...';
        document.getElementById('chatTitle').classList.add('typing-blink-effect');
    }

    try {
        let apiConfig = await getApiConfigForWechat('memorySummary');
        if (!apiConfig || !apiConfig.apiKey) apiConfig = await getApiConfigForWechat('wechat');

        // 3. 构建 Prompt（群聊和单聊分别处理）
        let prompt = "";
        
        if (isGroup) {
            // === 群聊模式（第三人称客观记录版）===
            const groupName = contact.nickname || '群聊';
            prompt = `你是一个群聊观察者。请以**第三人称客观视角**，总结下面这段"${groupName}"中发生的重要事件。

【对话记录】（已按时间顺序排列）
${conversationText}

【核心规则】
1. **客观记录**：用第三人称（他/她/他们）描述群里发生的事，不要代入任何角色的主观感受。
2. **内容结构**：【谁做了什么】+【其他人的反应/结果】。
3. **抓大放小**：忽略水群和寒暄，只记录引发讨论、关系变化或重要决定的核心事件。
4. **高度浓缩**：本次共 ${msgCount} 条对话，请浓缩为 **约${maxSummaryCount}条** 核心记忆。
5. **长度限制**：每条记忆控制在50字以内。

【输出格式】
- 直接输出纯文本列表，每行一条记忆。
- 不要加序号，不要用Markdown。
- 必须以第三人称开头（如：张三、李四、${userName}等）。

示例：
${userName}在群里提议周末聚餐，张三和李四都表示赞同，最终决定去吃火锅。
王五在群里炫耀新买的手机，李四表面附和但语气有些酸溜溜的。

现在开始总结（建议 ${maxSummaryCount} 条左右）：`;
        } else {
            // === 单聊模式（第一人称情感版）===
            prompt = `你是一个专业的对话记忆提取助手。请从下面的聊天记录中，提取出**最核心、最有价值**的关键信息。

【对话记录】（已按时间顺序排列）
${conversationText}

【核心规则】
1. **高度浓缩**：本次共 ${msgCount} 条对话，你需要将它们浓缩为 **约${maxSummaryCount}条** 核心记忆
2. **合并同类事件**：不要逐句记录，将连续相关的多句话合并成一个完整事件
3. **优先级排序**：只记录对角色发展、关系变化、重要决定有影响的内容，忽略寒暄和闲聊
4. **固定句式**："谁+做了什么+结果/影响"
5. **长度限制**：每条记忆30字以内

【输出格式】
- 直接输出纯文本列表
- 不要加序号、不要用Markdown
- 每行一条记忆
- 如果对话内容过于琐碎无价值，允许少于 ${maxSummaryCount} 条

现在开始提取（建议 ${maxSummaryCount} 条左右）：`;
        }

        const response = await callAIAPI([{ role: 'user', content: prompt }], apiConfig);
        
        if (response && response.trim()) {
            const lines = response.trim().split('\n').filter(l => l.trim().length > 1);
            let savedCount = 0;

for (const line of lines) {
    const cleanLine = line.trim();
    
    // ★★★ 核心修改：群聊和单聊统一处理，都存到对应的ID下 ★★★
    const content = cleanLine.replace(/^[0-9]+[\.\、]\s*/, '').replace(/^-\s*/, '').trim();
    
    if (content.length > 0) {
        // 统一调用保存函数，群聊存到群聊ID，单聊存到单聊ID
        saveToGroupMemory(currentChatId, contact.nickname, content);
        savedCount++;
    }
    
    await new Promise(r => setTimeout(r, 50)); 
}

            if (savedCount > 0) {
                // 标记已总结
                const timestampsToMark = new Set(targetMessages.map(m => m.timestamp));
                let latestMessages = await getData(key) || [];
                latestMessages.forEach(m => { if (timestampsToMark.has(m.timestamp)) m.summarized = true; });
                await saveData(key, latestMessages);
                
                if (!isSilent) customAlert(`✅ 总结完成，已保存 ${savedCount} 条记忆`);
                else console.log(`✅ 自动总结完成，保存 ${savedCount} 条`);
            } else {
                if (!isSilent) customAlert('AI认为没有值得提取的有效信息');
            }
        }
    } catch (error) {
        console.error('总结失败', error);
        if (!isSilent) customAlert('总结失败: ' + error.message);
    } finally {
        if (!isSilent) {
            document.getElementById('chatTitle').textContent = originalTitle;
            document.getElementById('chatTitle').classList.remove('typing-blink-effect');
        }
    }
}

// [FunctionDeclaration] Function: saveToGroupMemory
function saveToGroupMemory(id, name, content) {
    if (window.parent !== window) {
        window.parent.postMessage({
            action: 'add-memory',
            data: {
                characterId: id,
                characterName: name,
                content: content
            }
        }, '*');
    }
}

// [FunctionDeclaration] Function: openMemTargetModal
async function openMemTargetModal() {
    if (!currentChatId) return;
    const contacts = await getData('customContacts') || [];
    const group = contacts.find(c => c.id === currentChatId);
    if (!group || !group.isGroup) {
        customAlert("仅群聊支持此设置");
        return;
    }

    // 获取已保存的勾选名单
    const savedTargets = (await getData('groupMemoryTargets_' + currentChatId)) || [];
    
    // 获取群成员
    const memberIds = group.memberIds || [];
    const members = contacts.filter(c => memberIds.includes(c.id) && c.id !== 'user_self'); // 排除自己

    const listDiv = document.getElementById('memTargetList');
    listDiv.innerHTML = members.map(m => {
        const isChecked = savedTargets.includes(m.id) ? 'checked' : '';
        return `
            <label style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer;">
                <input type="checkbox" class="mem-target-checkbox" value="${m.id}" ${isChecked} style="margin-right: 12px; width: 18px; height: 18px; accent-color: #07C160;">
                <div style="flex: 1; font-size: 16px;">${m.nickname}</div>
            </label>
        `;
    }).join('');

    document.getElementById('memTargetModal').style.display = 'flex';
}

// [FunctionDeclaration] Function: saveMemTargets
async function saveMemTargets() {
    const checkboxes = document.querySelectorAll('.mem-target-checkbox:checked');
    const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value)); // ID通常是数字
    await saveData('groupMemoryTargets_' + currentChatId, selectedIds);
    document.getElementById('memTargetModal').style.display = 'none';
    customAlert(`已设置 ${selectedIds.length} 个记忆分发对象`);
}

// [ExpressionStatement] Execution: push
allFullscreenPages.push(document.getElementById('transferPage'));

