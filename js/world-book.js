/* 模块: js/world-book.js */

// [Function] getWorldEntries
async function getWorldEntries() {
    return await localforage.getItem(WORLD_BOOK_KEY) || [];
}

// [Function] showWorldBookModal
async function showWorldBookModal() {
    await renderWorldBookList();
    document.getElementById('world-book-modal').style.display = 'flex';
    setTimeout(() => document.getElementById('world-book-modal').classList.add('active'), 10);
    closeMenu();
    fabContainer.style.display = 'none';
}

// [Function] closeWorldBookModal
function closeWorldBookModal() {
    document.getElementById('world-book-modal').classList.remove('active');
    setTimeout(() => {
        document.getElementById('world-book-modal').style.display = 'none';
        fabContainer.style.display = 'block';
    }, 300);
}

// [Function] renderWorldBookList
async function renderWorldBookList() {
    const listEl = document.getElementById('world-book-list');
    const entries = await getWorldEntries();
    listEl.innerHTML = '';

    // 每次渲染列表时，刷新自定义菜单数据
    await updateCategoryMenu(entries);

    if (entries.length === 0) {
        listEl.innerHTML = '<p style="text-align:center; color:#999; margin-top:50px;">暂无设定<br>点击右上角 + 添加<br>或导入备份文件</p>';
        return;
    }

    const categories = [...new Set(entries.map(e => e.category || '未分类'))].sort();
    
    categories.forEach(cat => {
        const catHeader = document.createElement('div');
        catHeader.style.cssText = 'font-size: 14px; font-weight: bold; color: #8B5A2B; margin: 15px 0 8px 5px; padding-left: 8px; border-left: 4px solid #FFB6C1;';
        catHeader.textContent = cat;
        listEl.appendChild(catHeader);

        const catEntries = entries.filter(e => (e.category || '未分类') === cat);
        
        catEntries.forEach(entry => {
            const div = document.createElement('div');
            div.style.cssText = 'background: #FFFBEB; border: 2px solid #FFC0CB; border-radius: 12px; padding: 15px; margin-bottom: 10px; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: all 0.2s;';
            
            div.innerHTML = `
                <div style="font-weight: bold; color: #5D4037; font-size: 16px; margin-bottom: 5px;">${entry.title}</div>
                <div onclick="toggleWorldContent(this)" title="点击展开/收起" style="font-size: 13px; color: #8B5A2B; white-space: pre-wrap; line-height: 1.5; max-height: 80px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; cursor: pointer; border-radius: 4px; padding: 2px;">${entry.content}</div>
                <div style="position: absolute; top: 10px; right: 10px;">
                    <button onclick="editWorldEntry('${entry.id}')" style="background:none; border:none; color:#007aff; font-weight:bold; cursor:pointer; margin-right:10px; font-size:12px;">编辑</button>
                    <button onclick="deleteWorldEntry('${entry.id}')" style="background:none; border:none; color:#ff3b30; font-weight:bold; cursor:pointer; font-size:12px;">删除</button>
                </div>
            `;
            listEl.appendChild(div);
        });
    });
    
    localStorage.setItem(SHARED_WORLD_BOOK_KEY, JSON.stringify(entries));
}

// [Function] renderCharacterList
async function renderCharacterList() {
    const listEl = document.getElementById('memory-list');
    document.getElementById('memory-title').textContent = '记忆管理';
    document.getElementById('memory-back-btn').onclick = closeMemoryModal;
    
    // 第一层必定没有右上角的垃圾桶和底栏
    document.getElementById('memory-trash-btn').style.display = 'none';
    document.getElementById('memory-cancel-del-btn').style.display = 'none';
    document.getElementById('memory-batch-bar').style.display = 'none';
    currentMemoryMode = 'normal';
    currentActiveCharId = null;

    const memories = await getMemories();
    listEl.innerHTML = '';

    if (memories.length === 0) {
        listEl.innerHTML = '<p style="text-align:center; color:#999; margin-top:50px;">暂无记忆</p>';
        return;
    }

    let latestContacts = [];
    try { latestContacts = await getWeChatContactsDirectly(); } catch(e) {}

    const characterMap = new Map();
    memories.forEach(mem => {
        if (!characterMap.has(mem.characterId)) {
            const matchContact = latestContacts.find(c => String(c.id) === String(mem.characterId));
            
            let displayMainName = mem.characterName || '未知角色';
            let displaySubName = '';

            if (matchContact) {
                // 关键修正：如果是群聊，情况反转
                if (matchContact.isGroup === true) {
                    displayMainName = matchContact.nickname || '未命名群聊';
                    if (matchContact.realName && matchContact.realName !== displayMainName) {
                        displaySubName = matchContact.realName;
                    }
                } else {
                    displayMainName = matchContact.realName || matchContact.nickname || '未知角色';
                    if (matchContact.nickname && matchContact.nickname !== displayMainName) {
                        displaySubName = matchContact.nickname;
                    }
                }
            }

            characterMap.set(mem.characterId, {
                id: mem.characterId,
                mainName: displayMainName,
                subName: displaySubName,
                count: 0
            });
        }
        characterMap.get(mem.characterId).count++;
    });

    const characters = Array.from(characterMap.values());
    characters.forEach(char => {
        const item = document.createElement('div');
        item.style.cssText = 'background: #FFFBEB; border: 2px solid #FFC0CB; border-radius: 12px; padding: 15px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: transform 0.1s;';
        
        let nameHtml = `<span style="font-size: 16px; color: #5D4037; font-weight: 600;">${char.mainName}</span>`;
        if (char.subName) {
            nameHtml += `<span style="font-size: 12px; color: #999; margin-left: 6px;">(${char.subName})</span>`;
        }

        item.innerHTML = `
            <div style="display: flex; align-items: baseline; word-break: break-all;">${nameHtml}</div>
            <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                <span style="font-size: 13px; color: #8B5A2B; background: #FFE4E1; padding: 2px 8px; border-radius: 10px;">${char.count} 条记忆</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#8B5A2B"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
            </div>
        `;
        item.onclick = () => renderCharacterMemories(char.id, char.mainName);
        item.onmousedown = () => item.style.transform = 'scale(0.98)';
        item.onmouseup = () => item.style.transform = 'scale(1)';
        listEl.appendChild(item);
    });
}

// [Function] renderCharacterMemories
async function renderCharacterMemories(charId, charName) {
    const listEl = document.getElementById('memory-list');
    document.getElementById('memory-title').textContent = charName;
    document.getElementById('memory-back-btn').onclick = renderCharacterList;
    
    currentActiveCharId = charId;
    currentActiveCharName = charName;
    
    if (currentMemoryMode === 'normal') {
        document.getElementById('memory-trash-btn').style.display = 'flex';
        document.getElementById('memory-cancel-del-btn').style.display = 'none';
        document.getElementById('memory-batch-bar').style.display = 'none';
    }
    
    let memories = await getMemories();
    memories = memories.filter(m => String(m.characterId) === String(charId));
    listEl.innerHTML = '';

    if (memories.length === 0) {
        listEl.innerHTML = '<p style="text-align:center; color:#999; margin-top:50px;">该角色暂无记忆</p>';
        document.getElementById('memory-trash-btn').style.display = 'none';
        return;
    }

    memories.forEach(mem => {
        const div = document.createElement('div');
        div.style.cssText = 'background: #FFFDF5; border: 2px solid #FFE4E1; border-radius: 12px; padding: 15px; margin-bottom: 10px; position: relative; box-shadow: 0 2px 5px rgba(0,0,0,0.02); display: flex; transition: background 0.2s;';
        div.className = 'memory-item-container';
        div.dataset.memid = mem.id;
        
        const date = new Date(mem.timestamp).toLocaleDateString('zh-CN');
        const isDelMode = currentMemoryMode === 'delete';

        // 复选框和内部分解布局
        div.innerHTML = `
            <div class="mem-check-wrapper" style="display: ${isDelMode ? 'flex' : 'none'}; align-items: center; justify-content: center; padding-right: 15px;">
                <input type="checkbox" class="memory-batch-cb" value="${mem.id}" style="width: 18px; height: 18px; accent-color: #F08080;" onchange="updateMemorySelectCount()">
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 12px; color: #999; margin-bottom: 8px;">${date}</div>
                <div id="mem-content-${mem.id}" style="font-size: 14px; color: #5D4037; line-height: 1.6; white-space: pre-wrap;">${mem.content}</div>
                
                <div id="mem-edit-area-${mem.id}" style="display:none; margin-top: 5px;">
                    <textarea id="mem-edit-val-${mem.id}" style="width: 100%; box-sizing: border-box; border: 2px solid #FFC0CB; border-radius: 8px; padding: 8px; font-size: 14px; color: #5D4037; background: #FFF9E6; resize: vertical; min-height: 70px;">${mem.content}</textarea>
                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px;">
                        <button onclick="cancelMemoryEdit('${mem.id}')" style="padding: 4px 14px; background: #FFFBEB; border: 1px solid #FFC0CB; border-radius: 6px; color: #5D4037; font-size: 12px; cursor: pointer;">取消</button>
                        <button onclick="saveMemoryEdit('${mem.id}')" style="padding: 4px 14px; background: #FFB6C1; border: 1px solid #FFC0CB; border-radius: 6px; color: #5D4037; font-size: 12px; font-weight: bold; cursor: pointer;">保存</button>
                    </div>
                </div>
            </div>
            
            <button class="mem-edit-trigger-btn" onclick="startMemoryEdit('${mem.id}')" style="display: ${isDelMode ? 'none' : 'flex'}; position: absolute; top: 10px; right: 10px; background: none; border: none; padding: 6px; cursor: pointer; align-items: center; justify-content: center;" title="编辑内容">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#8B5A2B">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
            </button>
        `;
        
        // 删除模式下，点击整行等于选中复选框
        div.onclick = (e) => {
            if (currentMemoryMode === 'delete' && e.target.tagName !== 'INPUT') {
                const cb = div.querySelector('.memory-batch-cb');
                if (cb) { cb.checked = !cb.checked; updateMemorySelectCount(); }
            }
        };

        listEl.appendChild(div);
    });
}

// [Function] startMemoryEdit
function startMemoryEdit(memId) {
    document.getElementById(`mem-content-${memId}`).style.display = 'none';
    document.getElementById(`mem-edit-area-${memId}`).style.display = 'block';
    const container = document.getElementById(`mem-content-${memId}`).closest('.memory-item-container');
    if(container){
        const editBtn = container.querySelector('.mem-edit-trigger-btn');
        if(editBtn) editBtn.style.display = 'none';
    }
}

// [Function] cancelMemoryEdit
function cancelMemoryEdit(memId) {
    document.getElementById(`mem-content-${memId}`).style.display = 'block';
    document.getElementById(`mem-edit-area-${memId}`).style.display = 'none';
    const container = document.getElementById(`mem-content-${memId}`).closest('.memory-item-container');
    if(container){
        const editBtn = container.querySelector('.mem-edit-trigger-btn');
        if(editBtn) editBtn.style.display = 'flex';
    }
}

// [Function] saveMemoryEdit
async function saveMemoryEdit(memId) {
    const newVal = document.getElementById(`mem-edit-val-${memId}`).value.trim();
    let memories = await getMemories();
    const i = memories.findIndex(m => m.id === memId);
    if (i !== -1 && newVal) {
        memories[i].content = newVal;
        await saveMemories(memories);
        renderCharacterMemories(currentActiveCharId, currentActiveCharName);
        showToast('内容已保存');
    }
}

// [Function] toggleMemoryDeleteMode
function toggleMemoryDeleteMode() {
    currentMemoryMode = (currentMemoryMode === 'normal') ? 'delete' : 'normal';
    renderCharacterMemories(currentActiveCharId, currentActiveCharName); // 重新渲染刷新视图
    
    if (currentMemoryMode === 'delete') {
        document.getElementById('memory-trash-btn').style.display = 'none';
        document.getElementById('memory-cancel-del-btn').style.display = 'block';
        document.getElementById('memory-batch-bar').style.display = 'flex';
        updateMemorySelectCount();
    } else {
        document.getElementById('memory-trash-btn').style.display = 'flex';
        document.getElementById('memory-cancel-del-btn').style.display = 'none';
        document.getElementById('memory-batch-bar').style.display = 'none';
    }
}

// [Function] updateMemorySelectCount
function updateMemorySelectCount() {
    const cbs = document.querySelectorAll('.memory-batch-cb:checked');
    document.getElementById('memory-sel-count').textContent = cbs.length;
}

// [Function] confirmBatchDeleteMemory
async function confirmBatchDeleteMemory() {
    const selectedIds = Array.from(document.querySelectorAll('.memory-batch-cb:checked')).map(cb => cb.value);
    if (selectedIds.length === 0) {
        showToast('请先选择要删除的记忆');
        return;
    }
    if (!confirm(`即将永久删除选中的 ${selectedIds.length} 条记忆，确定继续吗？`)) return;
    
    let memories = await getMemories();
    memories = memories.filter(m => !selectedIds.includes(m.id));
    await saveMemories(memories);
    
    toggleMemoryDeleteMode(); // 自动关闭编辑模式并触发重绘
    showToast(`成功清理了 ${selectedIds.length} 条记忆`);
}

// [Expression] AnonymousBlock
window.ephoneMemoryLock = window.ephoneMemoryLock || Promise.resolve();

// [Function] addMemory
async function addMemory(characterIds, characterNames, content) {
    // 强制所有保存操作排队执行
    window.ephoneMemoryLock = window.ephoneMemoryLock.then(async () => {
        // 1. 在锁内部重新读取最新数据（关键！）
        let memories = await getMemories(); 
        const timestamp = Date.now();
        
        const ids = Array.isArray(characterIds) ? characterIds : [characterIds];
        const names = Array.isArray(characterNames) ? characterNames : [characterNames];
        
        let hasNewData = false;

        ids.forEach((charId, index) => {
            const safeId = String(charId);
            
            // 2. 在锁内部进行去重检查
            const isDuplicate = memories.some(m => 
                String(m.characterId) === safeId && 
                m.content === content && 
                (timestamp - m.timestamp) < 2000
            );

            if (!isDuplicate) {
                memories.push({
                    id: 'mem_' + timestamp + '_' + safeId + '_' + Math.random().toString(36).substr(2, 5), 
                    characterId: safeId, 
                    characterName: names[index] || names[0],
                    content: content,
                    timestamp: timestamp
                });
                hasNewData = true;
            }
        });
        
        // 3. 只有真的有新数据时才写入
        if (hasNewData) {
            await saveMemories(memories);
        }
    }).catch(err => {
        console.error("记忆保存队列出错:", err);
    });

    return window.ephoneMemoryLock;
}

// [Function] toggleWorldContent
function toggleWorldContent(element) {
    if (element.style.webkitLineClamp) {
        element.style.webkitLineClamp = '';
        element.style.maxHeight = 'none';
        element.style.background = 'rgba(255,255,255,0.5)';
    } else {
        element.style.webkitLineClamp = '4';
        element.style.maxHeight = '80px';
        element.style.background = 'transparent';
    }
}

// [Function] updateCategoryMenu
async function updateCategoryMenu(entries = null) {
    if (!entries) {
        entries = await getWorldEntries();
    }
    const listContainer = document.getElementById('custom-category-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    // 提取所有不为空的分类
    const categories = [...new Set(entries.map(e => e.category))].filter(c => c && c.trim() !== '' && c !== '未分类').sort();
    
    if (categories.length === 0) {
        listContainer.innerHTML = '<div class="custom-dropdown-item" style="color:#999; cursor:default;">暂无历史分类</div>';
    } else {
        categories.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'custom-dropdown-item';
            item.textContent = cat;
            item.onclick = () => selectCategory(cat);
            listContainer.appendChild(item);
        });
    }
}

// [Function] toggleCategoryDropdown
function toggleCategoryDropdown(event) {
    event.stopPropagation(); // 防止冒泡触发全局点击关闭
    const list = document.getElementById('custom-category-list');
    list.classList.toggle('show');
}

// [Function] selectCategory
function selectCategory(value) {
    document.getElementById('world-entry-category').value = value;
    document.getElementById('custom-category-list').classList.remove('show');
}

// [Expression] addEventListener
document.addEventListener('click', function(event) {
    const list = document.getElementById('custom-category-list');
    const trigger = document.getElementById('category-trigger-btn');
    // 如果列表存在，且点击的不是列表本身，也不是触发按钮，则关闭
    if (list && list.classList.contains('show') && !list.contains(event.target) && event.target !== trigger) {
        list.classList.remove('show');
    }
});

// [Function] showAddWorldEntryForm
async function showAddWorldEntryForm() {
    currentEditingEntryId = null;
    await updateCategoryMenu(); 
    document.getElementById('world-entry-category').value = ''; 
    document.getElementById('world-entry-title').value = '';
    document.getElementById('world-entry-content').value = '';
    document.getElementById('world-book-edit-modal').classList.remove('hidden');
    // 确保菜单默认是关闭的
    document.getElementById('custom-category-list').classList.remove('show');
}

// [Function] editWorldEntry
async function editWorldEntry(id) {
    const entries = await getWorldEntries();
    const entry = entries.find(e => e.id === id);
    if (entry) {
        currentEditingEntryId = id;
        await updateCategoryMenu(entries); 
        document.getElementById('world-entry-category').value = entry.category || ''; 
        document.getElementById('world-entry-title').value = entry.title;
        document.getElementById('world-entry-content').value = entry.content;
        document.getElementById('world-book-edit-modal').classList.remove('hidden');
        document.getElementById('custom-category-list').classList.remove('show');
    }
}

// [Function] hideWorldBookEditModal
function hideWorldBookEditModal() {
    document.getElementById('world-book-edit-modal').classList.add('hidden');
    document.getElementById('custom-category-list').classList.remove('show');
}

// [Function] saveWorldEntry
async function saveWorldEntry() {
    const categoryInput = document.getElementById('world-entry-category').value.trim();
    const category = categoryInput === '' ? '未分类' : categoryInput; 
    
    const title = document.getElementById('world-entry-title').value.trim();
    const content = document.getElementById('world-entry-content').value.trim();
    
    if (!title || !content) {
        showToast('标题和内容不能为空');
        return;
    }

    let entries = await getWorldEntries();
    
    if (currentEditingEntryId) {
        const index = entries.findIndex(e => e.id === currentEditingEntryId);
        if (index !== -1) {
            entries[index] = { id: currentEditingEntryId, title, content, category };
        }
    } else {
        entries.push({ id: Date.now().toString(), title, content, category });
    }

    await localforage.setItem(WORLD_BOOK_KEY, entries);
    hideWorldBookEditModal();
    renderWorldBookList();
    showToast('保存成功');
}

// [Function] deleteWorldEntry
async function deleteWorldEntry(id) {
    if(!await customConfirm('确定删除此条目吗？')) return;
    let entries = await getWorldEntries();
    entries = entries.filter(e => e.id !== id);
    await localforage.setItem(WORLD_BOOK_KEY, entries);
    renderWorldBookList();
    showToast('已删除');
}

// [Function] clearWorldBook
async function clearWorldBook() {
    const entries = await getWorldEntries();
    if (entries.length === 0) {
        showToast('已经是空的了');
        return;
    }
    
    if(!await customConfirm('【警告】确定要清空所有世界书条目吗？\n此操作无法撤销！')) return;
    
    await localforage.removeItem(WORLD_BOOK_KEY);
    renderWorldBookList();
    showToast('已清空所有条目');
}

