/* 模块: js/wechat/db.js (小鱼终极稳定版) */

// 小鱼修改：直接借用 WebBox 已经加载好的 localforage 插件
// 它会自动处理建库、建表，绝对不会再报 NotFoundError！
const wxStore = localforage.createInstance({
  name: "WeChatApp_V3"
});

// 假装初始化（为了兼容微信原来的代码）
async function initDB() {
  return true; 
}

// 保存数据
async function saveData(key, value) {
  try {
    await wxStore.setItem(key, value);
    console.log(`[微信数据] ${key} 保存成功`);
  } catch (err) {
    console.error(`[微信数据] 保存失败:`, err);
  }
}

// 读取数据
async function getData(key) {
  try {
    const value = await wxStore.getItem(key);
    return value;
  } catch (err) {
    console.error(`[微信数据] 读取失败:`, err);
    return null;
  }
}