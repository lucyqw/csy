/* 模块: js/db.js */

// [FunctionDeclaration] Function: initDB
function initDB() {
    return new Promise((resolve, reject) => {
      // 小鱼修改：强制硬编码一个全新的数据库名字，彻底避开与父项目的冲突！
      const request = indexedDB.open('WeChatAppDB_V2', 1);
      request.onerror = (event) => reject(`数据库打开失败: ${event.target.error}`);
      request.onsuccess = (event) => {
        db = event.target.result;
        console.log('微信专属数据库打开成功');
        resolve(db);
      };
      request.onupgradeneeded = (event) => {
        db = event.target.result;
        // 小鱼修改：如果没拿到 STORE_NAME，默认创建一个 'userProfile' 仓库
        const storeName = typeof STORE_NAME !== 'undefined' ? STORE_NAME : 'userProfile';
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
          console.log('微信对象仓库创建成功');
        }
      };
    });
  }

// [FunctionDeclaration] Function: saveData
function saveData(key, value) {
    return new Promise((resolve, reject) => {
      if (!db) return reject('数据库未初始化，无法保存数据');
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      transaction.oncomplete = () => {
        console.log(`数据事务完成: ${key} 已保存`);
        resolve();
      };
      transaction.onerror = (event) => {
        console.error(`数据事务错误: ${event.target.error}`);
        reject(event.target.error);
      };
      const objectStore = transaction.objectStore(STORE_NAME);
      objectStore.put({ id: key, value: value });
    });
  }

// [FunctionDeclaration] Function: getData
function getData(key) {
    return new Promise((resolve, reject) => {
      if (!db) return reject('数据库未初始化，无法读取数据');
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.get(key);
      
      request.onsuccess = () => {
        resolve(request.result ? request.result.value : null);
      };
      request.onerror = (event) => {
        console.error(`读取数据请求错误: ${event.target.error}`);
        reject(event.target.error);
      };
    });
  }

