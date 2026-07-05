/* 模块: js/wechat/db.js (小鱼重构版) */

const DB_NAME = 'WeChatApp_FinalDB'; // 换一个全新的名字，强制重新初始化
const DB_VERSION = 1;
const STORE_NAME = 'userProfile'; // 强制写死表名，防止外部变量丢失
let db = null;
let dbInitPromise = null; // 增加初始化锁，防止并发冲突

// [FunctionDeclaration] Function: initDB
function initDB() {
  if (dbInitPromise) return dbInitPromise; // 如果正在初始化，就排队等候
  
  dbInitPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('微信数据库打开失败:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('微信专属数据库打开成功');
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        console.log('微信对象仓库 (userProfile) 创建成功');
      }
    };
  });
  
  return dbInitPromise;
}

// [FunctionDeclaration] Function: saveData
async function saveData(key, value) {
  await initDB(); // 强制等待数据库准备完毕
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => reject(event.target.error);
    const objectStore = transaction.objectStore(STORE_NAME);
    objectStore.put({ id: key, value: value });
  });
}

// [FunctionDeclaration] Function: getData
async function getData(key) {
  await initDB(); // 强制等待数据库准备完毕
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(key);
    
    request.onsuccess = () => {
      resolve(request.result ? request.result.value : null);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}