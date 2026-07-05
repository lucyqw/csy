/* 模块: js/tag-relations.js */

// [ExpressionStatement] Execution: addEventListener
document.getElementById('confirmCreateRelationBtn').addEventListener('click', async () => {
    if (!currentRelationTagId) return;

    const allGraphs = await getData('tag_relation_graphs') || {};
    const graphData = allGraphs[currentRelationTagId];
    if (!graphData) return;

    const fromId = document.getElementById('relationFromSelect').value;
    const toId = document.getElementById('relationToSelect').value;
    const arrowType = document.getElementById('relationArrowSelect').value;
    const label = document.getElementById('relationLabelInput').value.trim();

    if (!fromId || !toId) {
        customAlert('请选择起点和终点');
        return;
    }

    if (String(fromId) === String(toId)) {
        customAlert('起点和终点不能相同');
        return;
    }

    graphData.edges = graphData.edges || [];
    graphData.edges.push({
        from: fromId,
        to: toId,
        label: label || '关系',
        twoWay: arrowType === 'double'
    });

    allGraphs[currentRelationTagId] = graphData;
    await saveData('tag_relation_graphs', allGraphs);

    closeCreateRelationDialog();

    const groups = await getData('tag_groups') || [];
    const group = groups.find(g => g.id === currentRelationTagId);
    if (group) await renderTagRelationGraph(graphData, group);
});

// [FunctionDeclaration] Function: autoSyncCharacterNames
async function autoSyncCharacterNames() {
    try {
        const contacts = await getData('customContacts');
        if (!contacts || !Array.isArray(contacts)) return;

        const savedMapStr = localStorage.getItem('wechat_name_map');
        let nameMap = savedMapStr ? JSON.parse(savedMapStr) : {};
        let needsSave = false;

        for (const contact of contacts) {
            if (contact.isGroup) continue; // 只处理单人角色
            const id = contact.id;
            const currentName = contact.nickname;
            const oldName = nameMap[id];

            // 发现名字发生了改变！
            if (oldName && oldName !== currentName) {
                console.log(`[同步雷达] 检测到角色改名: "${oldName}" -> "${currentName}"，正在修复历史数据...`);
                
                // 1. 修复群聊历史
                const groups = contacts.filter(c => c.isGroup);
                for (const group of groups) {
                    const key = 'chat_messages_' + group.id;
                    let msgs = await getData(key) || [];
                    let changed = false;
                    msgs.forEach(m => {
                        if (m.senderName === oldName) { m.senderName = currentName; changed = true; }
                    });
                    if (changed) await saveData(key, msgs);
                }

                // 2. 修复朋友圈 (作者、点赞、评论)
                let moments = await getData('moments_posts') || [];
                let mChanged = false;
                moments.forEach(post => {
                    if (post.authorName === oldName) { post.authorName = currentName; mChanged = true; }
                    if (post.likes && post.likes.includes(oldName)) {
                        post.likes = post.likes.map(n => n === oldName ? currentName : n);
                        mChanged = true;
                    }
                    if (post.comments) {
                        post.comments.forEach(c => {
                            if (c.authorName === oldName) { c.authorName = currentName; mChanged = true; }
                            if (c.replyToAuthorName === oldName) { c.replyToAuthorName = currentName; mChanged = true; }
                        });
                    }
                });
                if (mChanged) {
                    await saveData('moments_posts', moments);
                    // 如果正停留在朋友圈页面，自动刷新一下画面
                    const momentsPage = document.getElementById('momentsPage');
                    if (momentsPage && momentsPage.style.display !== 'none' && typeof renderMomentsFeed === 'function') {
                        await renderMomentsFeed();
                    }
                }

                // 3. 修复关系网
                let graphs = await getData('tag_relation_graphs') || {};
                let gChanged = false;
                Object.keys(graphs).forEach(tagId => {
                    let g = graphs[tagId];
                    if (g && g.nodes) {
                        g.nodes.forEach(n => {
                            if (n.name === oldName) { n.name = currentName; gChanged = true; }
                        });
                    }
                });
                if (gChanged) await saveData('tag_relation_graphs', graphs);

                // 4. 刷新当前聊天界面 (如果正在和该角色或包含该角色的群聊天)
                if (typeof currentChatId !== 'undefined' && currentChatId) {
                    const currContact = contacts.find(c => c.id === currentChatId);
                    if (currContact && (currContact.id === id || (currContact.isGroup && currContact.memberIds.includes(id)))) {
                        if (typeof renderMessages === 'function') {
                            await renderMessages(currentChatId);
                        }
                    }
                }

                // 更新记录本
                nameMap[id] = currentName;
                needsSave = true;
            } else if (!oldName && currentName) {
                // 第一次记录该角色
                nameMap[id] = currentName;
                needsSave = true;
            }
        }

        if (needsSave) {
            localStorage.setItem('wechat_name_map', JSON.stringify(nameMap));
        }
    } catch (e) {
        console.error("后台同步昵称出错:", e);
    }
}

// [ExpressionStatement] Execution: Expression
setInterval(autoSyncCharacterNames, 2000);

// [ExpressionStatement] Execution: Expression
setTimeout(autoSyncCharacterNames, 1000);

