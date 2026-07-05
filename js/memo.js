/* 模块: js/memo.js */

// [Function] getMemos
async function getMemos() {
    return await localforage.getItem(MEMO_KEY) || [];
}

// [Function] saveMemos
async function saveMemos(memos) {
    await localforage.setItem(MEMO_KEY, memos);
}

// [Function] showMemoModal
async function showMemoModal() {
    const memos = await getMemos();
    memoList.innerHTML = '';
    
    if (memos.length === 0) {
        memoList.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#999; padding:40px;">还没有笔记<br>点击右上角 + 创建第一条笔记</p>';
    } else {
        memos.sort((a, b) => b.time - a.time).forEach(memo => {
            const date = new Date(memo.time).toLocaleDateString();
            
            let itemsHTML = '';
            if (memo.items && memo.items.length > 0) {
                itemsHTML = memo.items.map(item => `<div class="memo-item-tag" onclick="copyTagText(event, '${item.replace(/'/g, "\\'")}')">${item}</div>`).join('');
            }

            memoList.innerHTML += `
                <div class="memo-item" onclick="editMemo('${memo.id}')">
                    <div class="memo-delete-btn" onclick="event.stopPropagation(); deleteMemo('${memo.id}')">×</div>
                    ${memo.title ? `<div class="memo-title">${memo.title}</div>` : ''}
                    <div class="memo-items-display-container">${itemsHTML}</div>
                    <div class="memo-time">${date}</div>
                </div>
            `;
        });
    }
    memoModal.style.display = 'flex';
    setTimeout(() => memoModal.classList.add('active'), 10);
    closeMenu(); 
    fabContainer.style.display = 'none'; 
}

// [Function] autoGrowTextarea
function autoGrowTextarea(element) {
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight) + 'px';
}

// [Function] renderMemoEditItem
function renderMemoEditItem(text = '') {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'memo-edit-item';
    itemDiv.innerHTML = `
        <textarea rows="1" placeholder="输入内容...">${text}</textarea>
        <button type="button" class="remove-item-btn">×</button>
    `;
    
    const textarea = itemDiv.querySelector('textarea');
    
    textarea.addEventListener('input', () => autoGrowTextarea(textarea));
    
    setTimeout(() => autoGrowTextarea(textarea), 0);
    
    itemDiv.querySelector('.remove-item-btn').onclick = () => itemDiv.remove();
    memoItemsContainer.appendChild(itemDiv);
}

// [Function] showAddMemoForm
function showAddMemoForm() {
    currentEditingMemoId = null;
    document.getElementById('memo-edit-title').textContent = '新建笔记';
    document.getElementById('memo-title').value = '';
    memoItemsContainer.innerHTML = ''; 
    renderMemoEditItem(); 
    memoEditModal.style.display = 'flex';
    setTimeout(() => memoEditModal.classList.add('active'), 10);
    fabContainer.style.display = 'none'; 
}

// [Function] editMemo
async function editMemo(memoId) {
    const memos = await getMemos();
    const memo = memos.find(m => m.id === memoId);
    if (memo) {
        currentEditingMemoId = memoId;
        document.getElementById('memo-edit-title').textContent = '编辑笔记';
        document.getElementById('memo-title').value = memo.title || '';
        memoItemsContainer.innerHTML = ''; 
        if (memo.items && memo.items.length > 0) {
            memo.items.forEach(item => renderMemoEditItem(item));
        } else {
            renderMemoEditItem(); 
        }
        memoEditModal.style.display = 'flex';
        setTimeout(() => memoEditModal.classList.add('active'), 10);
        fabContainer.style.display = 'none'; 
    }
}

// [Expression] addEventListener
memoEditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('memo-title').value.trim();
    const itemInputs = memoItemsContainer.querySelectorAll('.memo-edit-item textarea'); 
    const items = Array.from(itemInputs).map(input => input.value.trim()).filter(item => item);

    if (!title && items.length === 0) {
        showToast('标题和内容至少要填写一项');
        return;
    }
    
    let memos = await getMemos();
    if (currentEditingMemoId) {
        const memo = memos.find(m => m.id === currentEditingMemoId);
        if (memo) {
            memo.title = title;
            memo.items = items;
            memo.time = Date.now();
        }
    } else {
        memos.push({
            id: 'memo_' + Date.now(),
            title: title,
            items: items,
            time: Date.now()
        });
    }
    await saveMemos(memos);
    showToast(currentEditingMemoId ? '已更新' : '已保存');
    closeMemoEditModal();
    await showMemoModal();
});

// [Function] deleteMemo
async function deleteMemo(memoId) {
    const deleteMemoConfirm = await customConfirm('确定要删除这条笔记吗？');
if (!deleteMemoConfirm) return;
    let memos = await getMemos();
    memos = memos.filter(m => m.id !== memoId);
    await saveMemos(memos);
    showToast('已删除');
    await showMemoModal();
}

// [Function] closeMemoModal
function closeMemoModal() {
    memoModal.classList.remove('active');
    setTimeout(() => {
        memoModal.style.display = 'none';
        fabContainer.style.display = 'block'; 
    }, 300);
}

// [Function] closeMemoEditModal
function closeMemoEditModal() {
    memoEditModal.classList.remove('active');
    setTimeout(() => {
        memoEditModal.style.display = 'none';
        fabContainer.style.display = 'block'; 
    }, 300);
}

// [Function] copyTagText
async function copyTagText(event, text) {
    event.stopPropagation(); 

    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            showToast('内容已复制');
            return; 
        } catch (err) {
            console.error('现代复制API失败，将使用经典方法:', err);
        }
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed'; 
    textArea.style.top = '-9999px';   
    textArea.style.left = '-9999px';
    textArea.setAttribute('readonly', ''); 

    document.body.appendChild(textArea);

    textArea.select(); 
    textArea.setSelectionRange(0, 99999); 

    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {
        console.error('经典复制命令执行出错:', err);
    }

    document.body.removeChild(textArea); 

    if (success) {
        showToast('内容已复制');
    } else {
        showToast('复制失败');
    }
}

// [Expression] addEventListener
document.getElementById('add-memo-item-btn').addEventListener('click', () => renderMemoEditItem());

// [Expression] addEventListener
document.getElementById('close-memo-modal').addEventListener('click', closeMemoModal);

// [Expression] addEventListener
document.getElementById('cancel-memo-edit').addEventListener('click', closeMemoEditModal);

