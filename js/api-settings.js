/* 模块: js/api-settings.js */

// [Function] getApiPresets
async function getApiPresets() {
    return await localforage.getItem(API_PRESETS_KEY) || [];
}

// [Function] saveApiPresets
async function saveApiPresets(presets) {
    await localforage.setItem(API_PRESETS_KEY, presets);
}

// [Function] renderPresetList
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

// [Function] showSavePresetDialog
function showSavePresetDialog() {
    document.getElementById('preset-name-input').value = '';
    document.getElementById('save-preset-dialog').classList.remove('hidden');
}

// [Function] hideSavePresetDialog
function hideSavePresetDialog() {
    document.getElementById('save-preset-dialog').classList.add('hidden');
}

// [Function] confirmSavePreset
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

// [Function] loadPreset
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

// [Function] deletePreset
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

// [Function] showApiSettingsModal
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

// [Function] hideApiSettingsModal
function hideApiSettingsModal() {
    document.getElementById('api-settings-modal').classList.add('hidden');
    fabContainer.style.display = 'block';
}

// [Expression] addEventListener
document.getElementById('cancel-api-settings').addEventListener('click', hideApiSettingsModal);

// [Expression] addEventListener
document.getElementById('api-type-select').addEventListener('change', () => {
    document.getElementById('model-list-container').style.display = 'none';
});

// [Expression] addEventListener
document.getElementById('secondary-api-type-select').addEventListener('change', () => {
    document.getElementById('secondary-model-list-container').style.display = 'none';
});

// [Expression] addEventListener
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

// [Function] testApiConnection
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

// [Function] autoCompleteChatUrl
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

// [Function] fetchModelList
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

// [Function] selectModel
function selectModel(modelId, apiType = 'primary') {
    const isPrimary = (apiType === 'primary');
    document.getElementById(isPrimary ? 'api-model-input' : 'secondary-api-model-input').value = modelId;
    document.getElementById(isPrimary ? 'model-list-container' : 'secondary-model-list-container').style.display = 'none';
    showToast(`已选择模型: ${modelId}`);
}

// [Function] getApiConfigForFeature
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

// [Function] clearAllData
async function clearAllData() {
const clearConfirm = await customConfirm('【高危操作】\n\n您确定要清空所有数据吗？\n\n此操作将删除所有应用、设置、备忘录和自定义主题，且无法恢复！');
if (!clearConfirm) return;

    try {
        showToast('正在清空数据，应用即将重置...');

        await localforage.clear();

        setTimeout(() => {
            location.reload();
        }, 2000);

    } catch (error) {
        console.error('清空数据失败:', error);
        await customAlert('清空数据时发生错误，请重试。');
    }
}

// [Function] callLLMForActiveMsg
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

