/* 模块: js/stickers.js */

// [VariableDeclaration] Variables: stickerEntryBtn
const stickerEntryBtn = document.getElementById('stickerEntryBtn');

// [VariableDeclaration] Variables: stickerLibraryPage
const stickerLibraryPage = document.getElementById('stickerLibraryPage');

// [VariableDeclaration] Variables: stickerDetailPage
const stickerDetailPage = document.getElementById('stickerDetailPage');

// [VariableDeclaration] Variables: stickerLibContainer
const stickerLibContainer = document.getElementById('stickerLibContainer');

// [VariableDeclaration] Variables: addLibraryBtn
const addLibraryBtn = document.getElementById('addLibraryBtn');

// [VariableDeclaration] Variables: backToLibList
const backToLibList = document.getElementById('backToLibList');

// [VariableDeclaration] Variables: stickerGrid
const stickerGrid = document.getElementById('stickerGrid');

// [VariableDeclaration] Variables: currentLibTitle
const currentLibTitle = document.getElementById('currentLibTitle');

// [VariableDeclaration] Variables: openImportModalBtn
const openImportModalBtn = document.getElementById('openImportModalBtn');

// [VariableDeclaration] Variables: importStickerOverlay
const importStickerOverlay = document.getElementById('importStickerOverlay');

// [VariableDeclaration] Variables: importTabs
const importTabs = document.querySelectorAll('.import-tab');

// [VariableDeclaration] Variables: importLocalPanel
const importLocalPanel = document.getElementById('importLocalPanel');

// [VariableDeclaration] Variables: importUrlPanel
const importUrlPanel = document.getElementById('importUrlPanel');

// [VariableDeclaration] Variables: stickerFileInput
const stickerFileInput = document.getElementById('stickerFileInput');

// [VariableDeclaration] Variables: importUrlInput
const importUrlInput = document.getElementById('importUrlInput');

// [VariableDeclaration] Variables: cancelImportBtn
const cancelImportBtn = document.getElementById('cancelImportBtn');

// [VariableDeclaration] Variables: confirmImportBtn
const confirmImportBtn = document.getElementById('confirmImportBtn');

// [ExpressionStatement] Execution: push
allFullscreenPages.push(stickerLibraryPage, stickerDetailPage);

// [VariableDeclaration] Variables: currentLibId
let currentLibId = null;

// [VariableDeclaration] Variables: importMode
let importMode = 'local';

// [ExpressionStatement] Execution: addEventListener
stickerEntryBtn.addEventListener('click', async () => {
  await renderStickerLibraries();
  showPage(stickerLibraryPage);
});

// [ExpressionStatement] Execution: addEventListener
document.querySelector('.back-from-sticker').addEventListener('click', () => showPage(mainApp));

// [ExpressionStatement] Execution: addEventListener
backToLibList.addEventListener('click', () => showPage(stickerLibraryPage));

// [FunctionDeclaration] Function: renderStickerLibraries
async function renderStickerLibraries() {
  let libs = await getData('stickerLibs') || [];
  if (libs.length === 0) {
    libs = [{ id: Date.now(), name: '默认表情', stickers: [] }];
    await saveData('stickerLibs', libs);
  }

  // 先生成HTML结构，但去掉 onclick 属性，改用 JS 绑定
  stickerLibContainer.innerHTML = libs.map(lib => {
    const count = lib.stickers ? lib.stickers.length : 0;
    const cover = count > 0 ? lib.stickers[0].url : '';
    const coverStyle = cover ? `background-image: url(${cover})` : '';
    const coverContent = cover ? '' : '无封面';
    
// 小鱼修改：如果名称为空，显示"未命名"
const displayName = (lib.name && lib.name.trim() !== '') ? lib.name : '未命名';

return `
  <div class="sticker-lib-item" data-id="${lib.id}" data-name="${displayName}">
    <div class="sticker-lib-cover" style="${coverStyle}">${coverContent}</div>
    <div style="flex: 1;">
      <div style="font-size: 16px; font-weight: 500;">${displayName}</div>
      <div style="font-size: 13px; color: #999;">${count}个表情</div>
    </div>
    <span class="contact-arrow">›</span>
  </div>
`;
  }).join('');

  // 为每个列表项绑定触摸事件
  document.querySelectorAll('.sticker-lib-item').forEach(item => {
    let pressTimer = null;
    let isLongPress = false;
    const libId = parseInt(item.dataset.id);
    const libName = item.dataset.name;

// 触摸开始
item.addEventListener('touchstart', (e) => {
  isLongPress = false;
  pressTimer = setTimeout(async () => {  // ← 关键修改：添加 async
    isLongPress = true;
    // 长按触发删除确认
    navigator.vibrate && navigator.vibrate(50); // 震动反馈
    if (await customConfirm(`确定要删除表情包库 "${libName}" 吗？\n(库内表情将一并删除)`)) {
      deleteStickerLibrary(libId);
    }
  }, 600); // 600毫秒视为长按
});

    // 触摸移动 (如果手指滑动了，就取消长按判定)
    item.addEventListener('touchmove', () => {
      clearTimeout(pressTimer);
    });

    // 触摸结束
    item.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
    });

    // 点击事件 (如果是长按触发了，就不执行点击跳转)
    item.addEventListener('click', () => {
      if (!isLongPress) {
        openStickerLib(libId, libName);
      }
    });
  });
}

// [FunctionDeclaration] Function: deleteStickerLibrary
async function deleteStickerLibrary(id) {
  let libs = await getData('stickerLibs') || [];
  const newLibs = libs.filter(l => l.id !== id);
  await saveData('stickerLibs', newLibs);
  renderStickerLibraries();
}

// [ExpressionStatement] Execution: addEventListener
addLibraryBtn.addEventListener('click', async () => {
  const name = await customPrompt('请输入表情包专辑名称：');
  if (name) {
    let libs = await getData('stickerLibs') || [];
    libs.push({ id: Date.now(), name: name, stickers: [] });
    await saveData('stickerLibs', libs);
    renderStickerLibraries();
  }
});

// [ExpressionStatement] Execution: addEventListener
currentLibTitle.addEventListener('click', async () => {
  if (!currentLibId) return;
  
  const oldName = currentLibTitle.textContent;
  const newName = await customPrompt('重命名表情专辑', oldName);
  
  if (newName && newName.trim() !== '' && newName !== oldName) {
    let libs = await getData('stickerLibs') || [];
    const lib = libs.find(l => l.id === currentLibId);
    if (lib) {
      lib.name = newName.trim();
      await saveData('stickerLibs', libs);
      currentLibTitle.textContent = lib.name;
      // 后台刷新列表，这样返回时名字也是新的
      renderStickerLibraries();
    }
  }
});

// [ExpressionStatement] Execution: Expression
window.openStickerLib = async function(id, name) {
  currentLibId = id;
  currentLibTitle.textContent = name;
  await renderStickerGrid();
  showPage(stickerDetailPage);
};

// [VariableDeclaration] Variables: currentStickerIndex
let currentStickerIndex = null;

// [FunctionDeclaration] Function: renderStickerGrid
async function renderStickerGrid() {
  let libs = await getData('stickerLibs') || [];
  const lib = libs.find(l => l.id === currentLibId);
  if (!lib) return;

  stickerGrid.innerHTML = (lib.stickers || []).map((s, index) => `
    <div class="sticker-img-box" style="background-image: url(${s.url})" data-index="${index}">
      ${s.desc ? `<div class="sticker-desc">${s.desc}</div>` : ''}
    </div>
  `).join('');

  // 为每个表情绑定点击事件
  document.querySelectorAll('.sticker-img-box').forEach(box => {
    box.addEventListener('click', () => {
      currentStickerIndex = parseInt(box.dataset.index);
      showStickerActionSheet();
    });
  });
}

// [FunctionDeclaration] Function: showStickerActionSheet
function showStickerActionSheet() {
  document.getElementById('stickerActionOverlay').style.display = 'flex';
}

// [VariableDeclaration] Variables: stickerActionOverlay
const stickerActionOverlay = document.getElementById('stickerActionOverlay');

// [VariableDeclaration] Variables: renameStickerBtn
const renameStickerBtn = document.getElementById('renameStickerBtn');

// [VariableDeclaration] Variables: deleteStickerBtn
const deleteStickerBtn = document.getElementById('deleteStickerBtn');

// [VariableDeclaration] Variables: cancelStickerActionBtn
const cancelStickerActionBtn = document.getElementById('cancelStickerActionBtn');

// [ExpressionStatement] Execution: addEventListener
cancelStickerActionBtn.addEventListener('click', () => {
  stickerActionOverlay.style.display = 'none';
});

// [ExpressionStatement] Execution: addEventListener
stickerActionOverlay.addEventListener('click', (e) => {
  if (e.target === stickerActionOverlay) {
    stickerActionOverlay.style.display = 'none';
  }
});

// [ExpressionStatement] Execution: addEventListener
renameStickerBtn.addEventListener('click', async () => {
  if (currentStickerIndex === null) return;
  
  let libs = await getData('stickerLibs') || [];
  const lib = libs.find(l => l.id === currentLibId);
  if (!lib) return;

  const oldDesc = lib.stickers[currentStickerIndex].desc || '';
  const newDesc = await customPrompt('为这个表情命名', oldDesc);
  
  if (newDesc !== null) {
    lib.stickers[currentStickerIndex].desc = newDesc.trim();
    await saveData('stickerLibs', libs);
    renderStickerGrid();
  }
  
  stickerActionOverlay.style.display = 'none';
});

// [ExpressionStatement] Execution: addEventListener
deleteStickerBtn.addEventListener('click', async () => {
  if (currentStickerIndex === null) return;
  
  if (await customConfirm('确定删除这张表情吗？')) {
    let libs = await getData('stickerLibs') || [];
    const lib = libs.find(l => l.id === currentLibId);
    if (lib) {
      lib.stickers.splice(currentStickerIndex, 1);
      await saveData('stickerLibs', libs);
      renderStickerGrid();
    }
  }
  
  stickerActionOverlay.style.display = 'none';
});

// [ExpressionStatement] Execution: addEventListener
openImportModalBtn.addEventListener('click', () => {
  importStickerOverlay.style.display = 'flex';
  importUrlInput.value = '';
  stickerFileInput.value = '';
  // 小鱼新增：每次打开时清空前缀输入框，防止误用旧前缀
  document.getElementById('urlPrefixInput').value = '';
});

// [ExpressionStatement] Execution: addEventListener
cancelImportBtn.addEventListener('click', () => {
  importStickerOverlay.style.display = 'none';
});

// [ExpressionStatement] Execution: forEach
importTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    importTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    importMode = tab.dataset.type;
    
    if (importMode === 'local') {
      importLocalPanel.style.display = 'flex';
      importUrlPanel.style.display = 'none';
    } else {
      importLocalPanel.style.display = 'none';
      importUrlPanel.style.display = 'flex';
    }
  });
});

// [VariableDeclaration] Variables: localImagePreviewGrid
const localImagePreviewGrid = document.getElementById('localImagePreviewGrid');

// [ExpressionStatement] Execution: addEventListener
stickerFileInput.addEventListener('change', () => {
  localImagePreviewGrid.innerHTML = ''; // 清空旧预览
  
  if (stickerFileInput.files.length === 0) return;
  
  Array.from(stickerFileInput.files).forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.style.cssText = 'aspect-ratio: 1; background-size: cover; background-position: center; border-radius: 6px; position: relative;';
      div.style.backgroundImage = `url(${e.target.result})`;
      
      // 添加序号角标
      div.innerHTML = `<div style="position: absolute; top: 2px; left: 2px; background: rgba(0,0,0,0.5); color: white; font-size: 10px; padding: 2px 5px; border-radius: 3px;">${index + 1}</div>`;
      
      localImagePreviewGrid.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('aiSortStickersBtn').addEventListener('click', async () => {
    const inputArea = document.getElementById('importUrlInput');
    const rawText = inputArea.value.trim();
    const btn = document.getElementById('aiSortStickersBtn');
    
    if (!rawText) {
        customAlert('请先粘贴包含图片链接的杂乱文本到输入框中');
        return;
    }

    // 1. 锁定界面状态
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = '正在分析...';
    btn.style.opacity = '0.6';
    btn.disabled = true;

try {
    // 2. 获取 API 配置 (★ 修改：明确告诉主程序这是 stickerSort 请求)
    const apiConfig = await getApiConfigForWechat('stickerSort');

            // 3. 构建 Prompt (★ 小鱼修改：强制要求生成名称)
        const systemPrompt = `你是一个专业的数据清洗助手。
任务：从用户提供的文本中提取图片链接（URL），并确保每一条都有对应的中文描述（表情名）。

严格输出格式：
表情名: URL

重要规则：
1. 如果原文本包含描述（如 "开心: http..."），直接使用。
2. 如果原文本只有URL（如 "http.../img001.jpg"），你必须根据文件名或上下文自动生成一个简短的中文名字（如 "表情"、"img001"、"未命名"）。
3. ★★★ 绝对不要只输出 URL，每一行必须包含冒号 ":"。 ★★★
4. 去除重复链接。
5. 不要输出 Markdown 代码块，只输出纯文本。`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `请整理以下文本：\n\n${rawText}` }
        ];

        // 4. 调用 AI
        const result = await callAIAPI(messages, apiConfig);

        // 5. 清洗结果 (防止AI还是输出了markdown)
        let cleanResult = result.replace(/```\w*\n?/g, '').replace(/```/g, '').trim();
        
        // 6. 回填到输入框
        inputArea.value = cleanResult;
        
        // 7. 提示成功
        // 创建一个临时的成功提示
        const toast = document.createElement('div');
        toast.textContent = '✅ 格式化完成';
        toast.style.cssText = 'position:absolute; bottom: 80px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.7); color:white; padding:8px 16px; border-radius:4px; font-size:12px; animation: fadeInOut 2s forwards;';
        document.getElementById('importUrlPanel').appendChild(toast);
        setTimeout(() => toast.remove(), 2000);

    } catch (error) {
        console.error('AI 分拣失败:', error);
        customAlert('AI 分拣失败: ' + error.message);
    } finally {
        // 8. 恢复按钮状态
        btn.innerHTML = originalBtnText;
        btn.style.opacity = '1';
        btn.disabled = false;
    }
});

// [ExpressionStatement] Execution: addEventListener
confirmImportBtn.addEventListener('click', async () => {
  let newStickers = [];

  if (importMode === 'local') {
    // 本地文件处理
    if (stickerFileInput.files.length === 0) return customAlert('请选择图片');
    
    // 简单的Promise封装用于读取文件
    const readFile = (file) => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ url: e.target.result, desc: '' }); // 本地图片暂无描述
      reader.readAsDataURL(file);
    });

    const promises = Array.from(stickerFileInput.files).map(file => readFile(file));
    newStickers = await Promise.all(promises);

} else {
  // URL 批量解析处理 (支持前缀补全)
  const text = importUrlInput.value.trim();
  const prefix = document.getElementById('urlPrefixInput').value.trim(); // 获取前缀
  
  if (!text) return customAlert('请输入内容');

  const lines = text.split(/\n/);
  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    let url = '';
    let desc = '';
    
    // 1. 尝试寻找完整的 http 链接
    const httpIndex = line.search(/https?:\/\//i);
    
    if (httpIndex !== -1) {
      // 情况A：行内包含完整URL，忽略前缀设置
      url = line.substring(httpIndex).trim();
      desc = line.substring(0, httpIndex).trim();
    } else {
      // 情况B：行内没有完整URL，尝试使用前缀拼接
      // 先尝试分离描述 (格式如 "开心：img.jpg" 或 "img.jpg")
      const colonMatch = line.match(/[:：]/);
      
      if (colonMatch) {
        desc = line.substring(0, colonMatch.index).trim();
        url = line.substring(colonMatch.index + 1).trim();
      } else {
        // 没有冒号，整行都是文件名
        desc = '';
        url = line;
      }
      
      // 如果有前缀，进行拼接
      if (prefix && url) {
         // 智能处理斜杠，防止出现 // (http://除外)
         if (prefix.endsWith('/') && url.startsWith('/')) {
           url = prefix + url.substring(1);
         } else if (!prefix.endsWith('/') && !url.startsWith('/')) {
           url = prefix + '/' + url;
         } else {
           url = prefix + url;
         }
      }
    }

    // 清理描述末尾的冒号
    desc = desc.replace(/[:：]$/, '').trim();

    // 最终校验：必须是合法的URL才添加
    if (url && url.match(/^https?:\/\//i)) {
      newStickers.push({ url: url, desc: desc });
    }
  });
}

  if (newStickers.length > 0) {
    let libs = await getData('stickerLibs') || [];
    const libIndex = libs.findIndex(l => l.id === currentLibId);
    if (libIndex !== -1) {
      libs[libIndex].stickers.push(...newStickers);
      await saveData('stickerLibs', libs);
      renderStickerGrid();
      importStickerOverlay.style.display = 'none';
      customAlert(`成功添加 ${newStickers.length} 个表情`);
    }
  } else {
    customAlert('未能识别有效图片');
  }
});

