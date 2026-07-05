/* 模块: js/wechat-bridge.js */

// [Function] openWxDB
function openWxDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(WX_DB_NAME);
        req.onsuccess = e => resolve(e.target.result);
        req.onerror = e => reject(e);
    });
}

// [Function] getWxData
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

// [Function] saveWxData
async function saveWxData(key, value) {
    const db = await openWxDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(WX_STORE, 'readwrite');
        const req = tx.objectStore(WX_STORE).put({ id: key, value: value });
        tx.oncomplete = () => resolve();
        tx.onerror = e => reject(e);
    });
}

