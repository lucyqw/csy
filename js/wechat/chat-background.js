/* 模块: js/chat-background.js */

// [VariableDeclaration] Variables: chatBackgroundSettingsPage
const chatBackgroundSettingsPage = document.getElementById('chatBackgroundSettingsPage');

// [VariableDeclaration] Variables: chatBgBackBtn
const chatBgBackBtn = document.getElementById('chatBgBackBtn');

// [VariableDeclaration] Variables: selectBgImageBtn
const selectBgImageBtn = document.getElementById('selectBgImageBtn');

// [ExpressionStatement] Execution: addEventListener
setChatBgBtn.addEventListener('click', () => {
    showPage(chatBackgroundSettingsPage);
});

// [ExpressionStatement] Execution: addEventListener
chatBgBackBtn.addEventListener('click', () => {
    showPage(document.getElementById('chatInfoPage'));
});

// [ExpressionStatement] Execution: addEventListener
selectBgImageBtn.addEventListener('click', () => {
    chatBgInput.click();
});

// [VariableDeclaration] Variables: restoreDefaultBgBtn
const restoreDefaultBgBtn = document.getElementById('restoreDefaultBgBtn');

// [ExpressionStatement] Execution: addEventListener
restoreDefaultBgBtn.addEventListener('click', async () => {
    let contacts = await getData('customContacts') || [];
    const index = contacts.findIndex(c => c.id === currentChatId);
    
    if (index !== -1) {
        // 删除背景属性
        delete contacts[index].chatBackground;
        await saveData('customContacts', contacts);
        
        // 立即应用默认背景（灰色）
        applyChatBackground(null);
        
        customAlert('已恢复默认背景');
    }
});

// [ExpressionStatement] Execution: addEventListener
chatBgInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const bgUrl = event.target.result;
            
            // ★ 修复：确保保存到正确的数据结构
            let contacts = await getData('customContacts') || [];
            const index = contacts.findIndex(c => c.id === currentChatId);
            if (index !== -1) {
                contacts[index].chatBackground = bgUrl;
                await saveData('customContacts', contacts);
                console.log('背景已保存:', bgUrl.substring(0, 50)); // 调试日志
                
                applyChatBackground(bgUrl);
                customAlert('背景设置成功');
            } else {
                console.error('未找到联系人ID:', currentChatId);
            }
        };
        reader.readAsDataURL(file);
    }
});

// [FunctionDeclaration] Function: applyChatBackground
function applyChatBackground(url) {
    const container = document.querySelector('.chat-room-container');
    if (url) {
        container.style.backgroundImage = `url(${url})`;
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
    } else {
        container.style.backgroundImage = '';
        container.style.backgroundColor = '#EDEDED';
    }
}

