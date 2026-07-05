/* 模块: js/status-widget.js */

// [Function] updateTimeWidget
function updateTimeWidget() { 
  const now = new Date(); 
  const hours = now.getHours(); 
  const minutes = now.getMinutes().toString().padStart(2, '0'); 
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); 
  const date = now.getDate().toString().padStart(2, '0'); 
  const day = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()]; 
  let greeting = 'Hi, '; 
  if (hours < 12) greeting += 'good morning'; 
  else if (hours < 18) greeting += 'good afternoon'; 
  else greeting += 'good evening'; 
  const timeString = `${hours}:${minutes}`; 
  statusTimeEl.textContent = `՞ฅ ${timeString} ฅ՞`; /* 状态栏显示带符号 */
  widgetTimeEl.textContent = timeString; /* 时间插件不带符号 */
  widgetGreetingEl.textContent = greeting; 
  widgetDateEl.textContent = `${month}月${date}日 ${day}`; 
}

// [Function] updateBatteryStatus
function updateBatteryStatus() { if ('getBattery' in navigator) { navigator.getBattery().then(function(battery) { const batteryLevelEl = document.getElementById('battery-level'); const batteryPercentEl = document.getElementById('status-battery-percent'); function updateUI() { const level = Math.floor(battery.level * 100); batteryPercentEl.textContent = `${level}%`; batteryLevelEl.style.width = `${level}%`; batteryLevelEl.classList.remove('battery-high', 'battery-medium', 'battery-low'); if (level > 50) { batteryLevelEl.classList.add('battery-high'); } else if (level > 20) { batteryLevelEl.classList.add('battery-medium'); } else { batteryLevelEl.classList.add('battery-low'); } } updateUI(); battery.addEventListener('levelchange', updateUI); battery.addEventListener('chargingchange', updateUI); }); } }

// [Function] goHome
async function goHome() {
    closeMemoModal();           
    closeMemoEditModal();       
    hideThemeModal();           

    clearInterval(progressSaveInterval);
    currentOpenAppId = null;

    await renderUI();

    document.body.classList.remove('app-open'); 
    launcherScreen.style.opacity = '1'; 
    launcherScreen.style.pointerEvents = 'auto'; 
    setTimeout(() => { 
        appViewer.classList.remove('active'); 
        appViewer.style.display = 'none'; 
        
        // 小鱼优化：隐藏微信原生容器
        const wechatDiv = document.getElementById('wechat-native-app');
        if (wechatDiv) {
            wechatDiv.style.display = 'none';
        }
    }, 300); 
    closeMenu(); 
}

// [Function] showToast
function showToast(text) {
    const toastIcon = document.getElementById('toast-icon');
    const toastText = document.getElementById('toast-text');
    
    toastText.textContent = text;
    
    toastIcon.src = 'illustration.png';
    
    toastMsg.classList.add('show');
    
    setTimeout(() => {
        toastMsg.classList.remove('show');
    }, 3000);
}

