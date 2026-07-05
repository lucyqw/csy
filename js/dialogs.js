/* 模块: js/dialogs.js */

// [Function] customConfirm
function customConfirm(message) {
    return new Promise((resolve) => {
        const dialog = document.getElementById('custom-confirm-dialog');
        const messageEl = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok-btn');
        const cancelBtn = document.getElementById('confirm-cancel-btn');
        
        messageEl.textContent = message;
        dialog.classList.remove('hidden');
        
        const handleOk = () => {
            dialog.classList.add('hidden');
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            resolve(true);
        };
        
        const handleCancel = () => {
            dialog.classList.add('hidden');
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            resolve(false);
        };
        
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
    });
}

// [Function] customAlert
function customAlert(message) {
    return new Promise((resolve) => {
        const dialog = document.getElementById('custom-alert-dialog');
        const messageEl = document.getElementById('alert-message');
        const okBtn = document.getElementById('alert-ok-btn');
        
        messageEl.textContent = message;
        dialog.classList.remove('hidden');
        
        const handleOk = () => {
            dialog.classList.add('hidden');
            okBtn.removeEventListener('click', handleOk);
            resolve();
        };
        
        okBtn.addEventListener('click', handleOk);
    });
}

// [If] AnonymousBlock
if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => {
            // 在没有 sw.js 文件或本地环境时忽略错误
            console.log('PWA Service Worker 未启用 (本地模式)');
        });
    });
}

