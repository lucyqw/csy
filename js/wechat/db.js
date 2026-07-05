/* 模块: js/db.js */

// [FunctionDeclaration] Function: initDB
function initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = (event) => reject(`数据库打开失败: ${event.target.error}`);
      request.onsuccess = (event) => {
        db = event.target.result;
        console.log('数据库打开成功');
        resolve(db);
      };
      request.onupgradeneeded = (event) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          console.log('对象仓库创建成功');
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

