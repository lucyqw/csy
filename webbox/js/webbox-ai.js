// webbox-ai.js 顶部
const API_SETTINGS_KEY = 'ephone_api_settings';
const API_PRESETS_KEY = 'ephone_api_presets';
const SECONDARY_API_SETTINGS_KEY = 'ephone_secondary_api_settings';
const API_USAGE_CONFIG_KEY = 'ephone_api_usage_config';
const API_ACTIVE_MSG_CONFIG_KEY = 'ephone_active_msg_config';

// 小鱼新增：直接读取微信数据库获取联系人
function getWeChatContactsDirectly() {
    return new Promise((resolve) => {
        // 尝试打开微信的数据库 (WeChatDB)
        const request = indexedDB.open('WeChatDB', 1);
        request.onerror = () => { console.log('无法打开微信数据库'); resolve([]); };
        request.onsuccess = (event) => {
            const db = event.target.result;
            // 检查是否存在 userProfile 表
            if (!db.objectStoreNames.contains('userProfile')) {
                db.close(); resolve([]); return;
            }
            const transaction = db.transaction(['userProfile'], 'readonly');
            const objectStore = transaction.objectStore('userProfile');
            // 获取 customContacts (自定义角色列表)
            const getRequest = objectStore.get('customContacts');
            getRequest.onsuccess = () => {
                const result = getRequest.result;
                // 微信存的数据结构是 {id: 'customContacts', value: [...]}
                if (result && result.value && Array.isArray(result.value)) {
                    resolve(result.value);
                } else {
                    resolve([]);
                }
                db.close();
            };
            getRequest.onerror = () => { db.close(); resolve([]); };
        };
    });
}

async function getApiPresets() {
    return await localforage.getItem(API_PRESETS_KEY) || [];
}

async function saveApiPresets(presets) {
    await localforage.setItem(API_PRESETS_KEY, presets);
}

async function renderPresetList() {
    const presets = await getApiPresets();
    const presetList = document.getElementById('preset-list');
    
    presetList.innerHTML = '';
    
    if (presets.length === 0) {
        presetList.innerHTML = '<p style="text-align: center; color: #999; font-size: 13px; padding: 10px;">暂无预设，可保存常用配置</p>';
        return;
    }
    
    presets.forEach((preset, index) => {
        const presetItem = document.createElement('div');
        presetItem.className = 'preset-item';
        
        const presetName = document.createElement('span');
        presetName.className = 'preset-item-name';
        presetName.textContent = preset.name;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'preset-item-delete';
        deleteBtn.textContent = '删除';
        
        deleteBtn.onclick = async (e) => {
            e.stopPropagation(); 
            e.preventDefault();
            await deletePreset(index);
        };
        
        presetItem.onclick = () => {
            loadPreset(index);
        };
        
        presetItem.appendChild(presetName);
        presetItem.appendChild(deleteBtn);
        presetList.appendChild(presetItem);
    });
}

function showSavePresetDialog() {
    document.getElementById('preset-name-input').value = '';
    document.getElementById('save-preset-dialog').classList.remove('hidden');
}

function hideSavePresetDialog() {
    document.getElementById('save-preset-dialog').classList.add('hidden');
}

async function confirmSavePreset() {
    const name = document.getElementById('preset-name-input').value.trim();
    
    if (!name) {
        showToast('请输入预设名称');
        return;
    }

    // 小鱼修改：创建一个包含所有API配置的 "全家桶" 对象
    const preset = {
        name: name,
        // 1. 保存主API配置
        primary: {
            type: document.getElementById('api-type-select').value,
            baseUrl: document.getElementById('api-base-url').value.trim(),
            apiKey: document.getElementById('api-key-input').value.trim(),
            model: document.getElementById('api-model-input').value.trim()
        },
        // 2. 保存副API配置
        secondary: {
            type: document.getElementById('secondary-api-type-select').value,
            baseUrl: document.getElementById('secondary-api-base-url').value.trim(),
            apiKey: document.getElementById('secondary-api-key-input').value.trim(),
            model: document.getElementById('secondary-api-model-input').value.trim()
        },
// 3. 保存功能分配的勾选状态
allocation: {
    wechat: document.getElementById('use-secondary-for-wechat').checked,
    offlineChat: document.getElementById('use-secondary-for-offline-chat').checked,
    userReply: document.getElementById('use-secondary-for-user-reply').checked,
    stickerSort: document.getElementById('use-secondary-for-sticker-sort').checked,
    imageRecognition: document.getElementById('use-secondary-for-image-recognition').checked,
    memorySummary: document.getElementById('use-secondary-for-memory-summary').checked // ★★★ 新增
}
};
    
    if (!preset.primary.apiKey) {
        showToast('请先填写主API的密钥');
        return;
    }
    
    const presets = await getApiPresets();
    presets.push(preset); // 保存全新的 "全家桶" 对象
    await saveApiPresets(presets);
    
    showToast(`预设"${name}"已保存`);
    hideSavePresetDialog();
    await renderPresetList();
}

async function loadPreset(index) {
    const presets = await getApiPresets();
    const preset = presets[index];
    
    if (!preset) return;

    // 小鱼修改：判断是新版预设还是旧版预设
    if (preset.primary && preset.secondary && preset.allocation) {
        // --- 处理新版 "全家桶" 预设 ---
        
        // 1. 加载主API
        document.getElementById('api-type-select').value = preset.primary.type;
        document.getElementById('api-base-url').value = preset.primary.baseUrl || '';
        document.getElementById('api-key-input').value = preset.primary.apiKey || '';
        document.getElementById('api-model-input').value = preset.primary.model || '';
        
        // 2. 加载副API
        document.getElementById('secondary-api-type-select').value = preset.secondary.type;
        document.getElementById('secondary-api-base-url').value = preset.secondary.baseUrl || '';
        document.getElementById('secondary-api-key-input').value = preset.secondary.apiKey || '';
        document.getElementById('secondary-api-model-input').value = preset.secondary.model || '';
        
        // 保存功能分配配置
const usageConfig = {
    wechat: document.getElementById('use-secondary-for-wechat').checked,
    offlineChat: document.getElementById('use-secondary-for-offline-chat').checked,
    userReply: document.getElementById('use-secondary-for-user-reply').checked,
    stickerSort: document.getElementById('use-secondary-for-sticker-sort').checked,
    imageRecognition: document.getElementById('use-secondary-for-image-recognition').checked,
    autoReply: document.getElementById('use-secondary-for-auto-reply').checked,
    memorySummary: document.getElementById('use-secondary-for-memory-summary').checked // ★★★ 新增
};
await localforage.setItem(API_USAGE_CONFIG_KEY, usageConfig);
} else {
    // --- 兼容处理旧版预设 ---
    
    // 只加载主API
        document.getElementById('api-type-select').value = preset.type;
        document.getElementById('api-base-url').value = preset.baseUrl || '';
        document.getElementById('api-key-input').value = preset.apiKey || '';
        document.getElementById('api-model-input').value = preset.model || '';
        
        // 清空副API和功能分配，避免混淆
        document.getElementById('secondary-api-base-url').value = '';
        document.getElementById('secondary-api-key-input').value = '';
        document.getElementById('secondary-api-model-input').value = '';
        document.getElementById('use-secondary-for-wechat').checked = false;
        document.getElementById('use-secondary-for-offline-chat').checked = false;
        document.getElementById('use-secondary-for-user-reply').checked = false;
    }
    
    showToast(`已加载预设"${preset.name}"`);
}

async function deletePreset(index) {
    const presets = await getApiPresets();
    if (!presets[index]) return; 
    
    const presetName = presets[index].name;
    
    const confirmDelete = await customConfirm(`确定要删除预设"${presetName}"吗？`);
    
    if (confirmDelete) {
        presets.splice(index, 1);
        await saveApiPresets(presets);
        showToast(`预设"${presetName}"已删除`);
        await renderPresetList();
    }
}

async function showApiSettingsModal() {
    // 1. 加载主API配置
    const settings = await localforage.getItem(API_SETTINGS_KEY) || {
        type: 'openai', baseUrl: '', apiKey: '', model: ''
    };
    document.getElementById('api-type-select').value = settings.type;
    document.getElementById('api-base-url').value = settings.baseUrl || '';
    document.getElementById('api-key-input').value = settings.apiKey || '';
    document.getElementById('api-model-input').value = settings.model || '';
    document.getElementById('api-test-result').textContent = '';
    
    // 2. 加载副API配置
    const secondarySettings = await localforage.getItem(SECONDARY_API_SETTINGS_KEY) || {
        type: 'openai', baseUrl: '', apiKey: '', model: ''
    };
    document.getElementById('secondary-api-type-select').value = secondarySettings.type;
    document.getElementById('secondary-api-base-url').value = secondarySettings.baseUrl || '';
    document.getElementById('secondary-api-key-input').value = secondarySettings.apiKey || '';
    document.getElementById('secondary-api-model-input').value = secondarySettings.model || '';
    document.getElementById('secondary-api-test-result').textContent = '';
    
// 3. 加载功能分配配置
const usageConfig = await localforage.getItem(API_USAGE_CONFIG_KEY) || {
    wechat: false, offlineChat: false, userReply: false, stickerSort: false, 
    imageRecognition: false, autoReply: false, memorySummary: false
};
document.getElementById('use-secondary-for-wechat').checked = usageConfig.wechat;
document.getElementById('use-secondary-for-offline-chat').checked = usageConfig.offlineChat;
document.getElementById('use-secondary-for-user-reply').checked = usageConfig.userReply;
document.getElementById('use-secondary-for-sticker-sort').checked = usageConfig.stickerSort || false;
document.getElementById('use-secondary-for-image-recognition').checked = usageConfig.imageRecognition || false;
document.getElementById('use-secondary-for-auto-reply').checked = usageConfig.autoReply || false;
// ★★★ 新增：读取总结记忆分配状态 ★★★
document.getElementById('use-secondary-for-memory-summary').checked = usageConfig.memorySummary || false;

// 4. 加载主动发消息配置 (新增)
    const activeMsgConfig = await localforage.getItem(API_ACTIVE_MSG_CONFIG_KEY) || {
        enabled: false, interval: 30, selectedChars: []
    };
    document.getElementById('active-msg-enable').checked = activeMsgConfig.enabled;
    document.getElementById('active-msg-interval').value = activeMsgConfig.interval || 30;
    document.getElementById('active-msg-options').style.display = activeMsgConfig.enabled ? 'block' : 'none';

    // 渲染微信角色列表
    const charListDiv = document.getElementById('active-msg-char-list');
    charListDiv.innerHTML = '<p style="color:#999; text-align:center; font-size:12px;">正在读取微信通讯录...</p>';
    
    try {
        const contacts = await getWeChatContactsDirectly();
        if (contacts.length === 0) {
            charListDiv.innerHTML = '<p style="color:#999; text-align:center; font-size:12px;">未找到角色，请先在微信中添加</p>';
        } else {
            charListDiv.innerHTML = '';
            contacts.forEach(contact => {
                const isChecked = activeMsgConfig.selectedChars.includes(contact.id) ? 'checked' : '';
                const item = document.createElement('div');
                item.style.padding = '5px 0';
                item.innerHTML = `
                    <label style="display:flex; align-items:center; cursor:pointer;">
                        <input type="checkbox" class="active-msg-char-checkbox" value="${contact.id}" ${isChecked} style="width:16px; height:16px; margin-right:8px;">
                        <span style="font-size:14px; color:#5D4037;">${contact.nickname}</span>
                    </label>
                `;
                charListDiv.appendChild(item);
            });
        }
    } catch (e) {
        console.error(e);
        charListDiv.innerHTML = '<p style="color:red; text-align:center; font-size:12px;">读取失败</p>';
    }

    await renderPresetList(); 
    
    document.getElementById('api-settings-modal').classList.remove('hidden');
    closeMenu();
    fabContainer.style.display = 'none';
}

function hideApiSettingsModal() {
    document.getElementById('api-settings-modal').classList.add('hidden');
    fabContainer.style.display = 'block';
}

document.getElementById('cancel-api-settings').addEventListener('click', hideApiSettingsModal);

document.getElementById('api-type-select').addEventListener('change', () => {
    document.getElementById('model-list-container').style.display = 'none';
});

document.getElementById('secondary-api-type-select').addEventListener('change', () => {
    document.getElementById('secondary-model-list-container').style.display = 'none';
});

document.getElementById('save-api-settings').addEventListener('click', async () => {
    // 保存主API配置
    const settings = {
        type: document.getElementById('api-type-select').value,
        baseUrl: document.getElementById('api-base-url').value.trim(),
        apiKey: document.getElementById('api-key-input').value.trim(),
        model: document.getElementById('api-model-input').value.trim()
    };
    
    if (!settings.apiKey) {
        showToast('请输入主API密钥');
        return;
    }
    
    await localforage.setItem(API_SETTINGS_KEY, settings);
    
    // 保存副API配置
    const secondarySettings = {
        type: document.getElementById('secondary-api-type-select').value,
        baseUrl: document.getElementById('secondary-api-base-url').value.trim(),
        apiKey: document.getElementById('secondary-api-key-input').value.trim(),
        model: document.getElementById('secondary-api-model-input').value.trim()
    };
    
    await localforage.setItem(SECONDARY_API_SETTINGS_KEY, secondarySettings);
    
// 保存功能分配配置
const usageConfig = {
    wechat: document.getElementById('use-secondary-for-wechat').checked,
    offlineChat: document.getElementById('use-secondary-for-offline-chat').checked,
    userReply: document.getElementById('use-secondary-for-user-reply').checked,
    stickerSort: document.getElementById('use-secondary-for-sticker-sort').checked,
    imageRecognition: document.getElementById('use-secondary-for-image-recognition').checked,
    autoReply: document.getElementById('use-secondary-for-auto-reply').checked,
    memorySummary: document.getElementById('use-secondary-for-memory-summary').checked // ★★★ 新增
};
await localforage.setItem(API_USAGE_CONFIG_KEY, usageConfig);

    // 保存主动发消息配置 (新增)
    const selectedCharCheckboxes = document.querySelectorAll('.active-msg-char-checkbox:checked');
    const selectedChars = Array.from(selectedCharCheckboxes).map(cb => parseInt(cb.value));
    
    const activeMsgConfig = {
        enabled: document.getElementById('active-msg-enable').checked,
        interval: parseInt(document.getElementById('active-msg-interval').value) || 30,
        selectedChars: selectedChars
    };
    await localforage.setItem(API_ACTIVE_MSG_CONFIG_KEY, activeMsgConfig);
    
    showToast('API及主动消息设置已保存');
    hideApiSettingsModal();
});

async function testApiConnection(apiType = 'primary') {
    const isPrimary = (apiType === 'primary');
    const resultEl = document.getElementById(isPrimary ? 'api-test-result' : 'secondary-api-test-result');
    resultEl.textContent = '测试中...';
    resultEl.style.color = '#666';
    
    const settings = {
        type: document.getElementById(isPrimary ? 'api-type-select' : 'secondary-api-type-select').value,
        baseUrl: document.getElementById(isPrimary ? 'api-base-url' : 'secondary-api-base-url').value.trim(),
        apiKey: document.getElementById(isPrimary ? 'api-key-input' : 'secondary-api-key-input').value.trim(),
        model: document.getElementById(isPrimary ? 'api-model-input' : 'secondary-api-model-input').value.trim()
    };
    
    if (!settings.apiKey) {
        resultEl.textContent = '请先输入API密钥';
        resultEl.style.color = '#ff3b30';
        return;
    }
    
    const defaultUrls = {
        'openai': 'https://api.openai.com/v1/chat/completions',
        'deepseek': 'https://api.deepseek.com/v1/chat/completions'
    };
    
    let url;
if (settings.type === 'custom' || settings.baseUrl) {
    // 小鱼修改：直接使用用户填写的完整URL，不再自动补全
    url = settings.baseUrl.replace(/\/+$/, ''); // 仅移除末尾多余斜杠
    
    // 如果用户忘记补全，给出友好提示
    if (!url.endsWith('/chat/completions')) {
        resultEl.textContent = '⚠️ URL可能不完整，请点击"一键补全"按钮';
        resultEl.style.color = '#ff9500';
        return;
    }
} else {
    url = defaultUrls[settings.type];
}

if (settings.type === 'custom' && !settings.baseUrl) {
    resultEl.textContent = '自定义类型需要填写API地址';
    resultEl.style.color = '#ff3b30';
    return;
}
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.apiKey}`
            },
            body: JSON.stringify({
                model: settings.model || 'gpt-3.5-turbo',
                messages: [{role: 'user', content: 'hi'}],
                max_tokens: 5
            })
        });
        
        if (response.ok) {
            resultEl.textContent = '✅ 连接成功！';
            resultEl.style.color = '#34c759';
        } else {
            const error = await response.json();
            const errorMsg = error.error?.message || error.message || response.statusText;
            resultEl.textContent = `❌ 连接失败: ${errorMsg}`;
            resultEl.style.color = '#ff3b30';
        }
    } catch (error) {
        resultEl.textContent = `❌ 网络错误: ${error.message}`;
        resultEl.style.color = '#ff3b30';
    }
}

// 小鱼新增：一键补全聊天API路径
function autoCompleteChatUrl(inputId) {
    const input = document.getElementById(inputId);
    let url = input.value.trim();
    
    if (!url) {
        showToast('请先填写API地址');
        return;
    }
    
    // 移除末尾的斜杠
    url = url.replace(/\/+$/, '');
    
    // 判断是否已经包含 /chat/completions
    if (url.endsWith('/chat/completions')) {
        showToast('已经是完整路径了');
        return;
    }
    
    // 自动补全
    input.value = url + '/chat/completions';
    showToast('✅ 已补全为完整路径');
}

async function fetchModelList(apiType = 'primary') {
    const isPrimary = (apiType === 'primary');
    const modelListContainer = document.getElementById(isPrimary ? 'model-list-container' : 'secondary-model-list-container');
    const modelListItems = document.getElementById(isPrimary ? 'model-list-items' : 'secondary-model-list-items');
    
    modelListItems.innerHTML = '<p style="text-align: center; color: #666;">正在连接中转站...</p>';
    modelListContainer.style.display = 'block';
    
    const settings = {
        type: document.getElementById(isPrimary ? 'api-type-select' : 'secondary-api-type-select').value,
        baseUrl: document.getElementById(isPrimary ? 'api-base-url' : 'secondary-api-base-url').value.trim(),
        apiKey: document.getElementById(isPrimary ? 'api-key-input' : 'secondary-api-key-input').value.trim()
    };
    
    if (!settings.apiKey) {
        modelListItems.innerHTML = '<p style="text-align: center; color: #ff3b30;">请先输入API密钥</p>';
        return;
    }
    
    let baseUrl;
    if (settings.type === 'custom' || settings.baseUrl) {
        baseUrl = settings.baseUrl;
        baseUrl = baseUrl.replace(/\/chat\/completions\/?$/, '');
        baseUrl = baseUrl.replace(/\/+$/, '');
    } else {
        const defaultUrls = {
            'openai': 'https://api.openai.com/v1',
            'deepseek': 'https://api.deepseek.com/v1'
        };
        baseUrl = defaultUrls[settings.type];
    }

    const modelsUrl = baseUrl + '/models';
    
    try {
        const response = await fetch(modelsUrl, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${settings.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`状态码 ${response.status}`);
        }
        
        const data = await response.json();
        const list = data.data || data;
        
        if (!Array.isArray(list) || list.length === 0) {
            modelListItems.innerHTML = '<p style="text-align: center; color: #999;">未找到可用模型，请手动输入</p>';
            return;
        }
        
        const sortedModels = list.sort((a, b) => {
            const idA = a.id.toLowerCase();
            const idB = b.id.toLowerCase();
            if (idA.includes('gpt-4') && !idB.includes('gpt-4')) return -1;
            if (idA.includes('deepseek') && !idB.includes('deepseek')) return -1;
            return 0;
        });

        modelListItems.innerHTML = sortedModels
    .slice(0, 30)
    .map(model => `
        <div style="padding: 10px; background: #FFFBEB; border: 1px solid #FFD6D6; border-radius: 6px; cursor: pointer; transition: background 0.2s;" 
             onclick="selectModel('${model.id}', '${apiType}')">
            <div style="font-weight: 500; font-size: 14px; color: #5D4037;">${model.id}</div>
        </div>
    `).join('');
        
    } catch (error) {
        console.error(error);
        modelListItems.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <p style="color: #ff3b30; margin-bottom: 5px;">获取失败 (${error.message})</p>
                <p style="color: #999; font-size: 12px;">中转站可能不支持列表查询<br>请直接在上方输入框手动填写模型名<br>(如: gpt-3.5-turbo)</p>
            </div>`;
    }
}

function selectModel(modelId, apiType = 'primary') {
    const isPrimary = (apiType === 'primary');
    document.getElementById(isPrimary ? 'api-model-input' : 'secondary-api-model-input').value = modelId;
    document.getElementById(isPrimary ? 'model-list-container' : 'secondary-model-list-container').style.display = 'none';
    showToast(`已选择模型: ${modelId}`);
}

// 新增：根据功能类型获取应该使用的API配置
async function getApiConfigForFeature(featureType) {
    // featureType 可以是: 'wechat', 'offlineChat', 'userReply'
    
    // 获取功能分配配置
    const usageConfig = await localforage.getItem(API_USAGE_CONFIG_KEY) || {
        wechat: false,
        offlineChat: false,
        userReply: false
    };
    
    // 判断该功能是否使用副API
    const useSecondary = usageConfig[featureType] || false;
    
    if (useSecondary) {
        // 使用副API
        const secondarySettings = await localforage.getItem(SECONDARY_API_SETTINGS_KEY);
        if (secondarySettings && secondarySettings.apiKey) {
            return secondarySettings;
        }
        // 如果副API未配置，降级使用主API
        console.warn(`副API未配置，${featureType}功能降级使用主API`);
    }
    
    // 使用主API
    return await localforage.getItem(API_SETTINGS_KEY);
}

function getWeChatDataViaBridge() {
    return new Promise((resolve, reject) => {
        const bridge = document.getElementById('wechat-data-bridge');
        if (!bridge || !bridge.contentWindow) {
            return reject(new Error('未找到微信通信桥梁!'));
        }
        const listener = (event) => {
            if (event.source === bridge.contentWindow && event.data.action === 'wechat-data-response') {
                window.removeEventListener('message', listener);
                resolve(event.data.payload);
            }
        };
        window.addEventListener('message', listener);
        setTimeout(() => {
            window.removeEventListener('message', listener);
            reject(new Error('获取微信数据超时!'));
        }, 5000);
        bridge.contentWindow.postMessage({ action: 'export-wechat-data' }, '*');
    });
}

/* --- 世界书 (World Book) 逻辑 --- */
const WORLD_BOOK_KEY = 'ephone_world_book';
const SHARED_WORLD_BOOK_KEY = 'wechat_world_book_shared'; 
let currentEditingEntryId = null;

async function getWorldEntries() {
    return await localforage.getItem(WORLD_BOOK_KEY) || [];
}

async function showWorldBookModal() {
    await renderWorldBookList();
    document.getElementById('world-book-modal').style.display = 'flex';
    setTimeout(() => document.getElementById('world-book-modal').classList.add('active'), 10);
    closeMenu();
    fabContainer.style.display = 'none';
}

function closeWorldBookModal() {
    document.getElementById('world-book-modal').classList.remove('active');
    setTimeout(() => {
        document.getElementById('world-book-modal').style.display = 'none';
        fabContainer.style.display = 'block';
    }, 300);
}

// 核心修改：支持分类显示 + 点击展开预览
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

/* --- 记忆管理 (Memory) 逻辑 --- */
const MEMORY_KEY = 'ephone_ai_memories';

async function getMemories() {
    return await localforage.getItem(MEMORY_KEY) || [];
}

async function saveMemories(memories) {
    await localforage.setItem(MEMORY_KEY, memories);
}

async function showMemoryModal() {
    await renderCharacterList();
    document.getElementById('memory-modal').style.display = 'flex';
    setTimeout(() => document.getElementById('memory-modal').classList.add('active'), 10);
    closeMenu();
    fabContainer.style.display = 'none';
}

function closeMemoryModal() {
    document.getElementById('memory-modal').classList.remove('active');
    setTimeout(() => {
        document.getElementById('memory-modal').style.display = 'none';
        fabContainer.style.display = 'block';
    }, 300);
}

let currentMemoryMode = 'normal'; // 'normal' | 'delete'
let currentActiveCharId = null;
let currentActiveCharName = null;

// 渲染第一层：角色列表
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

// 渲染第二层：特定角色的记忆列表
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

// 记忆内联编辑逻辑
function startMemoryEdit(memId) {
    document.getElementById(`mem-content-${memId}`).style.display = 'none';
    document.getElementById(`mem-edit-area-${memId}`).style.display = 'block';
    const container = document.getElementById(`mem-content-${memId}`).closest('.memory-item-container');
    if(container){
        const editBtn = container.querySelector('.mem-edit-trigger-btn');
        if(editBtn) editBtn.style.display = 'none';
    }
}

function cancelMemoryEdit(memId) {
    document.getElementById(`mem-content-${memId}`).style.display = 'block';
    document.getElementById(`mem-edit-area-${memId}`).style.display = 'none';
    const container = document.getElementById(`mem-content-${memId}`).closest('.memory-item-container');
    if(container){
        const editBtn = container.querySelector('.mem-edit-trigger-btn');
        if(editBtn) editBtn.style.display = 'flex';
    }
}

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

// 批量删除切换与执行逻辑
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

function updateMemorySelectCount() {
    const cbs = document.querySelectorAll('.memory-batch-cb:checked');
    document.getElementById('memory-sel-count').textContent = cbs.length;
}

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

// 小鱼优化：使用 window 全局变量作为锁，防止变量作用域问题导致锁失效
window.ephoneMemoryLock = window.ephoneMemoryLock || Promise.resolve();

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

// 核心修改：生成自定义 DIV 菜单项
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

// 新增：切换显示/隐藏自定义菜单
function toggleCategoryDropdown(event) {
    event.stopPropagation(); // 防止冒泡触发全局点击关闭
    const list = document.getElementById('custom-category-list');
    list.classList.toggle('show');
}

// 新增：选中分类
function selectCategory(value) {
    document.getElementById('world-entry-category').value = value;
    document.getElementById('custom-category-list').classList.remove('show');
}

// 新增：全局点击监听，点击外部关闭菜单
document.addEventListener('click', function(event) {
    const list = document.getElementById('custom-category-list');
    const trigger = document.getElementById('category-trigger-btn');
    // 如果列表存在，且点击的不是列表本身，也不是触发按钮，则关闭
    if (list && list.classList.contains('show') && !list.contains(event.target) && event.target !== trigger) {
        list.classList.remove('show');
    }
});

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

function hideWorldBookEditModal() {
    document.getElementById('world-book-edit-modal').classList.add('hidden');
    document.getElementById('custom-category-list').classList.remove('show');
}

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

async function deleteWorldEntry(id) {
    if(!await customConfirm('确定删除此条目吗？')) return;
    let entries = await getWorldEntries();
    entries = entries.filter(e => e.id !== id);
    await localforage.setItem(WORLD_BOOK_KEY, entries);
    renderWorldBookList();
    showToast('已删除');
}

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

async function exportWorldBook() {
    const entries = await getWorldEntries();
    if (entries.length === 0) {
        showToast('没有数据可导出');
        return;
    }
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `世界书备份_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('导出成功');
}

async function importWorldBook(input) {
    const file = input.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        let parsedData;
        
        try {
            parsedData = JSON.parse(text);
        } catch (e) {
            throw new Error('不是有效的JSON文件');
        }

        let rawEntries = [];

        if (Array.isArray(parsedData)) {
            rawEntries = parsedData;
        } else if (parsedData.ephone_world_book && Array.isArray(parsedData.ephone_world_book)) {
            rawEntries = parsedData.ephone_world_book;
            showToast('检测到全能备份，已提取世界书数据');
        } else if (typeof parsedData === 'object') {
            const possibleArray = Object.values(parsedData).find(val => Array.isArray(val));
            if (possibleArray) {
                rawEntries = possibleArray;
            }
        }

        if (rawEntries.length === 0) {
            throw new Error('文件中未找到有效的世界书数据');
        }

        const processedEntries = rawEntries.map(e => {
            let title = e.title || e.name || e.key || e.command || e.id || '未命名条目';
            let content = e.content || e.text || e.prompt || e.value || e.description || '';
            let category = e.category || e.tag || e.group || '未分类';

            if (!content && typeof e === 'string') {
                content = e; 
                title = content.substring(0, 10) + '...';
            }

            return {
                id: e.id || ('import_' + Date.now() + Math.random()),
                title: String(title),
                content: String(content),
                category: String(category)
            };
        }).filter(e => e.content);

        if (processedEntries.length === 0) {
            throw new Error('解析后没有有效数据');
        }

        const confirmImport = await customConfirm(`解析出 ${processedEntries.length} 条数据。\n点击【确定】追加到现有数据\n点击【取消】覆盖现有数据`);
        
        let currentEntries = [];
        if (confirmImport) {
            currentEntries = await getWorldEntries();
        } 

        const mergedMap = new Map();
        currentEntries.forEach(e => mergedMap.set(e.id, e));
        processedEntries.forEach(e => {
            if (mergedMap.has(e.id) && confirmImport) {
                e.id = 'import_' + Date.now() + Math.random();
            }
            mergedMap.set(e.id, e);
        });

        const finalEntries = Array.from(mergedMap.values());
        await localforage.setItem(WORLD_BOOK_KEY, finalEntries);
        
        renderWorldBookList();
        showToast(`成功导入 ${processedEntries.length} 条数据`);
    } catch (e) {
        console.error(e);
        await customAlert('导入失败：' + e.message);
    }
    input.value = ''; 
}



// ★★★ 小鱼修复：统一消息监听器，避免重复定义 ★★★
window.addEventListener('message', async (event) => {
    // 安全检查：确保消息来源有效
    if (!event.data || !event.data.action) return;
    
    const action = event.data.action;
    console.log('📨 WebBox收到消息:', action, event.data);
    
    // 🆕 新增：处理角色名称更新请求
    if (action === 'update-character-name') {
        try {
            const { characterId, newName } = event.data.data;
            if (!characterId || !newName) return;
            
            // 读取所有记忆
            let memories = await getMemories();
            let updateCount = 0;
            
            // 遍历并更新匹配的记忆
            memories.forEach(mem => {
                if (String(mem.characterId) === String(characterId)) {
                    mem.characterName = newName;
                    updateCount++;
                }
            });
            
            // 如果有更新，保存回数据库
            if (updateCount > 0) {
                await saveMemories(memories);
                console.log(`✅ 已同步更新 ${updateCount} 条记忆中的角色名称为: ${newName}`);
                
                // 如果记忆管理面板正开着，立即刷新显示
                const memoryModal = document.getElementById('memory-modal');
                if (memoryModal && memoryModal.style.display === 'flex') {
                    await renderMemoryList();
                }
                
                showToast(`已同步更新 ${updateCount} 条记忆`);
            }
        } catch (error) {
            console.error('❌ 同步角色名称失败:', error);
        }
        return; // 处理完毕，直接返回
    }
    
    // 1. 处理API设置请求
    if (action === 'get-api-settings') {
        try {
            const featureType = event.data.featureType || 'wechat';
            const usageConfig = await localforage.getItem(API_USAGE_CONFIG_KEY) || {
                wechat: false,
                offlineChat: false,
                userReply: false
            };
            
            const useSecondary = usageConfig[featureType] || false;
            let apiSettings;
            
            if (useSecondary) {
                apiSettings = await localforage.getItem(SECONDARY_API_SETTINGS_KEY);
                if (!apiSettings || !apiSettings.apiKey) {
                    console.warn(`副API未配置，${featureType}功能降级使用主API`);
                    apiSettings = await localforage.getItem(API_SETTINGS_KEY);
                }
            } else {
                apiSettings = await localforage.getItem(API_SETTINGS_KEY);
            }
            
            event.source.postMessage({
                action: 'api-settings-response',
                payload: apiSettings
            }, '*');
            
        } catch (error) {
            console.error('❌ 获取API设置失败:', error);
            event.source.postMessage({ 
                action: 'api-settings-response', 
                payload: null 
            }, '*');
        }
    }
    
// 2. ★★★ 修复：接收线下聊天/微信群聊发来的记忆 ★★★
else if (action === 'add-memory') {
    try {
        const { characterId, characterName, content } = event.data.data;
        
        // 小鱼优化：直接调用 addMemory，将去重逻辑全部移交给函数内部的“排队锁”处理
        // 这样可以避免在锁外读取数据导致的覆盖问题
        await addMemory(characterId, characterName, content);
        
        const names = Array.isArray(characterName) ? characterName.join('、') : characterName;
        showToast(`✅ 已提取记忆至: ${names}`);
        
        // 保存成功后，立即刷新记忆列表
const memoryModal = document.getElementById('memory-modal');
if (memoryModal && memoryModal.style.display === 'flex') {
    await renderCharacterList();
}
        
    } catch (error) {
        console.error('❌ 保存记忆失败:', error);
        showToast('❌ 记忆保存失败');
    }
}
    
    // 3. 处理线下聊天请求记忆
    else if (action === 'request-memories') {
        try {
            const { characterId, count } = event.data.data;
            const requestId = event.data.requestId;
            
            const allMemories = await getMemories();
            let characterMemories = allMemories.filter(m => m.characterId === characterId);
            characterMemories.sort((a, b) => b.timestamp - a.timestamp);
            const selectedMemories = characterMemories.slice(0, count);
            
            event.source.postMessage({
                action: 'memory-response',
                requestId: requestId,
                success: true,
                memories: selectedMemories
            }, '*');
            
            console.log(`✅ 已返回${selectedMemories.length}条记忆给线下聊天`);
            
        } catch (error) {
            console.error('❌ 处理记忆请求失败:', error);
            event.source.postMessage({
                action: 'memory-response',
                requestId: event.data.requestId,
                success: false,
                error: error.message
            }, '*');
        }
    }
    // 4. ★★★ 新增：处理清空角色记忆请求 ★★★
    else if (action === 'clear-memories') {
        try {
            const { characterId } = event.data.data;
            if (!characterId) return;
            
            let memories = await getMemories();
            const initialLength = memories.length;
            
            // 过滤掉该角色的所有记忆 (强制转为字符串进行严谨匹配)
            memories = memories.filter(m => String(m.characterId) !== String(characterId));
            
            if (memories.length < initialLength) {
                await saveMemories(memories);
                console.log(`✅ 已清空角色 ${characterId} 的 ${initialLength - memories.length} 条记忆`);
                
                // 如果记忆管理面板正开着，立即刷新列表
                const memoryModal = document.getElementById('memory-modal');
                if (memoryModal && memoryModal.style.display === 'flex') {
                    await renderMemoryList();
                }
            }
        } catch (error) {
            console.error('❌ 清空角色记忆失败:', error);
        }
    }
});

// ==========================================
// ★★★ 小鱼新增：微信主动发消息核心逻辑 (后台大脑) ★★★
// ==========================================

// 1. 数据库工具 (用于读写微信数据)
const WX_DB_NAME = 'WeChatDB';
const WX_STORE = 'userProfile';

function openWxDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(WX_DB_NAME);
        req.onsuccess = e => resolve(e.target.result);
        req.onerror = e => reject(e);
    });
}

async function getWxData(key) {
    const db = await openWxDB();
    return new Promise(resolve => {
        if (!db.objectStoreNames.contains(WX_STORE)) return resolve(null);
        const tx = db.transaction(WX_STORE, 'readonly');
        const req = tx.objectStore(WX_STORE).get(key);
        req.onsuccess = () => resolve(req.result ? req.result.value : null);
        req.onerror = () => resolve(null);
    });
}

async function saveWxData(key, value) {
    const db = await openWxDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(WX_STORE, 'readwrite');
        const req = tx.objectStore(WX_STORE).put({ id: key, value: value });
        tx.oncomplete = () => resolve();
        tx.onerror = e => reject(e);
    });
}

// 2. 简易版 LLM 调用 (后台专用)
async function callLLMForActiveMsg(messages) {
    // 小鱼修改：检查功能分配，决定使用主API还是副API
    const usageConfig = await localforage.getItem(API_USAGE_CONFIG_KEY) || {};
    let settings;

    if (usageConfig.autoReply) {
        // 如果勾选了使用副API
        settings = await localforage.getItem(SECONDARY_API_SETTINGS_KEY);
        // 如果副API没配置，降级回主API
        if (!settings || !settings.apiKey) {
            console.warn("主动回复：副API未配置，降级使用主API");
            settings = await localforage.getItem(API_SETTINGS_KEY);
        } else {
            console.log("主动回复：正在使用副API");
        }
    } else {
        // 使用主API
        settings = await localforage.getItem(API_SETTINGS_KEY);
    }

    if (!settings || !settings.apiKey) return null;

    let url = settings.baseUrl || (settings.type === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://api.deepseek.com/v1/chat/completions');
    if (!url.endsWith('/chat/completions') && !url.endsWith('/v1')) { if(!url.includes('/chat')) url += '/chat/completions'; }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.apiKey}` },
            body: JSON.stringify({
                model: settings.model || 'gpt-3.5-turbo',
                messages: messages,
                temperature: 0.9 // 稍微调高创造性
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (e) {
        console.error("主动消息API调用失败:", e);
        return null;
    }
}

// 3. 核心循环逻辑
let activeMsgTimer = null;

async function startActiveMsgSystem() {
    if (activeMsgTimer) clearInterval(activeMsgTimer);
    
    // 每分钟检查一次
    activeMsgTimer = setInterval(async () => {
        await checkAndSendActiveMsg();
    }, 60 * 1000); 
    
    console.log("✅ 微信主动发消息系统已启动 (后台运行中)");
}

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

// --- 小鱼新增：顶部弹窗控制逻辑 (支持上滑/右滑分方向关闭，修复双重动画) ---
let notifTimer = null;
let notifQueueTimer = null;
let currentNotifChatId = null;

// 消息队列
let notifMessageQueue = [];
let notifCurrentIndex = 0;
let notifIsSequencePlaying = false;
let notifCurrentDismissResolver = null;

// 手势状态
let notifTouchStartX = 0;
let notifTouchStartY = 0;
let notifTouchCurrentX = 0;
let notifTouchCurrentY = 0;
let notifIsDragging = false;
let notifHasSwipedToClose = false;
let notifSwipeDirectionLock = ''; // '' / 'right' / 'up'

// 重置样式
function resetHeadsUpNotificationStyles() {
    const notif = document.getElementById('heads-up-notification');
    if (!notif) return;
    notif.style.display = '';
    notif.style.transform = '';
    notif.style.opacity = '';
    notif.style.transition = '';
}

// 关闭当前单条弹窗UI（不影响队列）
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

// 回弹函数
function resetHeadsUpNotificationPosition() {
    const notif = document.getElementById('heads-up-notification');
    if (!notif) return;
    notif.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
    notif.style.transform = 'translate(0, 0)';
    notif.style.opacity = '1';
    setTimeout(() => { notif.style.transition = ''; }, 200);
}

// 播放队列中的下一条
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

// 主入口
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

// 点击弹窗跳转逻辑
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

// 手势绑定（在 DOMContentLoaded 后执行）
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

// 启动系统
startActiveMsgSystem();
