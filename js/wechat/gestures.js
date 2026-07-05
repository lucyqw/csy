/* 模块: js/gestures.js */

// [VariableDeclaration] Variables: touchStartX
let touchStartX = 0;

// [VariableDeclaration] Variables: touchStartY
let touchStartY = 0;

// [VariableDeclaration] Variables: touchEndX
let touchEndX = 0;

// [VariableDeclaration] Variables: touchEndY
let touchEndY = 0;

// [VariableDeclaration] Variables: swipeThreshold
const swipeThreshold = 60;

// [VariableDeclaration] Variables: verticalThreshold
const verticalThreshold = 40;

// [ExpressionStatement] Execution: addEventListener
mainApp.addEventListener('touchstart', (e) => {
  // 只在主应用界面生效，不影响其他全屏页面
  if (mainApp.style.display !== 'none') {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }
}, { passive: true });

// [ExpressionStatement] Execution: addEventListener
mainApp.addEventListener('touchend', (e) => {
  if (mainApp.style.display !== 'none') {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }
}, { passive: true });

// [FunctionDeclaration] Function: handleSwipe
function handleSwipe() {
  const deltaX = touchEndX - touchStartX;
  const deltaY = Math.abs(touchEndY - touchStartY);

  // 如果垂直滑动距离太大，认为是上下滚动，不触发页面切换
  if (deltaY > verticalThreshold) {
    return;
  }

  // 检查水平滑动距离是否超过阈值
  if (Math.abs(deltaX) < swipeThreshold) {
    return;
  }

  // 找到当前激活的标签索引
  const currentIndex = Array.from(tabItems).findIndex(tab => tab.classList.contains('active'));
  let targetIndex = -1;

  if (deltaX > 0 && currentIndex > 0) {
    // 向右滑动（切换到上一个标签）
    targetIndex = currentIndex - 1;
    animatePageTransition(currentIndex, targetIndex, 'right');
  } else if (deltaX < 0 && currentIndex < tabItems.length - 1) {
    // 向左滑动（切换到下一个标签）
    targetIndex = currentIndex + 1;
    animatePageTransition(currentIndex, targetIndex, 'left');
  }
}

// [FunctionDeclaration] Function: animatePageTransition
function animatePageTransition(fromIndex, toIndex, direction) {
  const fromPage = pages[fromIndex];
  const toPage = pages[toIndex];

  // 清除所有动画类
  pages.forEach(page => {
    page.classList.remove('slide-from-left', 'slide-to-right', 'slide-to-left');
  });

  if (direction === 'left') {
    // 向左滑动
    toPage.style.display = 'block';
    toPage.style.position = 'absolute';
    toPage.style.transform = 'translateX(100%)';
    toPage.style.opacity = '0';
    
    setTimeout(() => {
      toPage.style.transform = 'translateX(0)';
      toPage.style.opacity = '1';
      fromPage.style.transform = 'translateX(-100%)';
      fromPage.style.opacity = '0';
      
      setTimeout(() => {
        fromPage.classList.remove('active');
        fromPage.style.display = 'none';
        fromPage.style.transform = '';
        fromPage.style.opacity = '';
        fromPage.style.position = '';
        
        toPage.classList.add('active');
        toPage.style.position = '';
        toPage.style.transform = '';
        toPage.style.opacity = '';
      }, 300);
    }, 10);
  } else {
    // 向右滑动
    toPage.style.display = 'block';
    toPage.style.position = 'absolute';
    toPage.style.transform = 'translateX(-100%)';
    toPage.style.opacity = '0';
    
    setTimeout(() => {
      toPage.style.transform = 'translateX(0)';
      toPage.style.opacity = '1';
      fromPage.style.transform = 'translateX(100%)';
      fromPage.style.opacity = '0';
      
      setTimeout(() => {
        fromPage.classList.remove('active');
        fromPage.style.display = 'none';
        fromPage.style.transform = '';
        fromPage.style.opacity = '';
        fromPage.style.position = '';
        
        toPage.classList.add('active');
        toPage.style.position = '';
        toPage.style.transform = '';
        toPage.style.opacity = '';
      }, 300);
    }, 10);
  }

  // 更新底部标签栏和标题
  tabItems.forEach(tab => tab.classList.remove('active'));
  tabItems[toIndex].classList.add('active');
  
  const targetTab = tabItems[toIndex].getAttribute('data-tab');
  navTitle.textContent = titleMap[targetTab];
  navBar.classList.toggle('nav-bar-hidden', targetTab === 'profile');
}

// [ExpressionStatement] Execution: addEventListener
document.body.addEventListener('touchmove', (e) => {
  if (!e.target.closest('.content, .ringtone-content, .chat-messages, textarea, input, .modal-content, #chatStickerOverlay, #momentsFeedContainer, #momentsPage')) e.preventDefault();
}, { passive: false });

