/* 模块: js/api.js */

// [FunctionDeclaration] Function: copyContextToClipboard
async function copyContextToClipboard() {
    if (!currentChatId) return;
    const { apiMessages } = await buildApiMessages(currentChatId);
    const content = JSON.stringify(apiMessages, null, 2);
    
    const tempInput = document.createElement('textarea');
    tempInput.value = content;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    customAlert('完整 JSON 已复制到剪贴板');
}

// [FunctionDeclaration] Function: getApiConfigForWechat
async function getApiConfigForWechat(featureType = 'wechat') {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error('获取API配置超时'));
        }, 10000);
        
        const handler = async (event) => {
            if (!event.data || event.data.action !== 'api-settings-response') {
                return;
            }
            
            cleanup();
            
            // 直接使用父窗口返回的配置（父窗口已经根据 featureType 选好了是主还是副）
            const config = event.data.payload;
            console.log(`微信收到API配置 (${featureType}):`, config ? '成功' : '空');
            resolve(config);
        };
        
        function cleanup() {
            clearTimeout(timeoutId);
            window.removeEventListener('message', handler);
        }
        
        window.addEventListener('message', handler);
        // ★★★ 关键修改：告诉父窗口具体的功能类型，让父窗口决定给哪个API ★★★
        window.parent.postMessage({ 
            action: 'get-api-settings',
            featureType: featureType // ★ 使用传入的类型，默认为 'wechat'
        }, '*');
    });
}

// [FunctionDeclaration] Function: requestMemoriesFromWebBox
function requestMemoriesFromWebBox(characterId, count) {
    return new Promise((resolve, reject) => {
        if (window.parent === window) {
            resolve([]); // 不在 WebBox 中
            return;
        }

        const requestId = 'mem_req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const timeout = setTimeout(() => {
            window.removeEventListener('message', handleResponse);
            console.warn('获取记忆超时');
            resolve([]); 
        }, 3000);

        const handleResponse = (event) => {
            if (event.data && event.data.action === 'memory-response' && event.data.requestId === requestId) {
                clearTimeout(timeout);
                window.removeEventListener('message', handleResponse);
                resolve(event.data.memories || []);
            }
        };

        window.addEventListener('message', handleResponse);

                        window.parent.postMessage({
            action: 'request-memories',
            requestId: requestId,
            data: {
                characterId: String(characterId), // ★★★ 核心修复：强制转为字符串，解决IndexedDB严格类型匹配查不到数据的问题 ★★★
                count: parseInt(count) || 5
            }
        }, '*');
    });
}

// [FunctionDeclaration] Function: callAIAPI
async function callAIAPI(messages, customSettings = null) {
    // ★★★ 核心修改：如果传入了自定义配置，直接使用；否则请求主界面配置 ★★★
    if (customSettings) {
        return await executeApiCall(messages, customSettings);
    }
    
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error('获取API配置超时，请检查主界面是否已打开'));
        }, 10000);
        
        const handler = async (event) => {
            if (!event.data || event.data.action !== 'api-settings-response') {
                return;
            }
            
            cleanup();
            
            const settings = event.data.payload;
            console.log('收到API配置:', settings);
            
                        // ★★★ 核心修改：调用提取出来的执行函数 ★★★
            try {
                const result = await executeApiCall(messages, settings);
                resolve(result);
            } catch (error) {
                console.error('API调用异常:', error);
                reject(error);
            }
        };
        
        function cleanup() {
            clearTimeout(timeoutId);
            window.removeEventListener('message', handler);
        }
        
        window.addEventListener('message', handler);
        console.log('向父窗口请求API配置...');
        window.parent.postMessage({ 
            action: 'get-api-settings',
            featureType: 'wechat' 
        }, '*');
    });
}

// [FunctionDeclaration] Function: executeApiCall
async function executeApiCall(messages, settings) {
    if (!settings || !settings.apiKey) {
        throw new Error('请先在主界面设置API密钥');
    }
    
    const defaultUrls = {
        'openai': 'https://api.openai.com/v1/chat/completions',
        'deepseek': 'https://api.deepseek.com/v1/chat/completions',
        'custom': settings.baseUrl
    };
    
    const apiUrl = settings.baseUrl || defaultUrls[settings.type];
    if (!apiUrl) {
        throw new Error('API地址未配置');
    }
    
    const model = settings.model || (settings.type === 'deepseek' ? 'deepseek-chat' : 'gpt-3.5-turbo');
    
    console.log('准备调用API:', apiUrl, '模型:', model);
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7,
        })
    });
    
    console.log('API响应状态:', response.status);
    
    if (!response.ok) {
        let errorMsg = response.statusText;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error?.message || errorMsg;
        } catch (e) {
            // 忽略解析错误
        }
        throw new Error(`API调用失败: ${errorMsg}`);
    }
    
    const data = await response.json();
    console.log('API返回数据:', data);
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
    } else {
        throw new Error('API返回格式错误');
    }
}

