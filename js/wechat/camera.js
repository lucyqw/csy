/* 模块: js/camera.js */

// [VariableDeclaration] Variables: cameraStream
let cameraStream = null;

// [VariableDeclaration] Variables: currentFacingMode
let currentFacingMode = 'environment';

// [VariableDeclaration] Variables: capturedBlob
let capturedBlob = null;

// [FunctionDeclaration] Function: openCamera
async function openCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      await startCameraStream();
      document.getElementById('internalCameraModal').style.display = 'flex';
      resetCameraUI(); // 每次打开都重置界面状态
    } catch (err) {
      console.error("相机启动失败:", err);
      document.getElementById('cameraInput').click();
    }
  } else {
    document.getElementById('cameraInput').click();
  }
}

// [FunctionDeclaration] Function: startCameraStream
async function startCameraStream() {
  if (cameraStream) stopCameraStream();

  const constraints = {
    audio: false,
    video: {
      facingMode: currentFacingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  };

  cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
  const videoEl = document.getElementById('cameraVideo');
  videoEl.srcObject = cameraStream;
  videoEl.play();
}

// [FunctionDeclaration] Function: stopCameraStream
function stopCameraStream() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
}

// [FunctionDeclaration] Function: closeInternalCamera
function closeInternalCamera() {
  stopCameraStream();
  document.getElementById('internalCameraModal').style.display = 'none';
}

// [FunctionDeclaration] Function: switchCamera
async function switchCamera() {
  currentFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment';
  await startCameraStream();
}

// [FunctionDeclaration] Function: takePhoto
function takePhoto() {
  const videoEl = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvas');
  const context = canvas.getContext('2d');

  // 设置画布尺寸与视频一致
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;

  // 绘制当前帧 (定格)
  context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

  // 切换显示：隐藏视频，显示画布(定格画面)
  videoEl.style.display = 'none';
  canvas.style.display = 'block';

  // 切换按钮状态
  updateUIForReview();
}

// [FunctionDeclaration] Function: retakePhoto
function retakePhoto() {
  const videoEl = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvas');

  // 切换显示：隐藏画布，显示视频(继续预览)
  canvas.style.display = 'none';
  videoEl.style.display = 'block';

  // 恢复按钮状态
  resetCameraUI();
}

// [FunctionDeclaration] Function: confirmSendPhoto
function confirmSendPhoto() {
  const canvas = document.getElementById('cameraCanvas');
  // 转换为图片数据
  const imgUrl = canvas.toDataURL('image/jpeg', 0.8);
  
  // 发送
  sendCapturedImage(imgUrl);
  
  // 关闭
  closeInternalCamera();
}

// [FunctionDeclaration] Function: resetCameraUI
function resetCameraUI() {
  const leftBtn = document.getElementById('cameraLeftBtn');
  const rightBtn = document.getElementById('cameraRightBtn');
  const shutterBtn = document.getElementById('cameraShutterBtn');
  const videoEl = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvas');

  // 显示视频，隐藏画布
  videoEl.style.display = 'block';
  canvas.style.display = 'none';

  // 中间快门显示
  shutterBtn.style.display = 'block';

  // 左侧：关闭图标
  leftBtn.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  leftBtn.onclick = closeInternalCamera; // 绑定关闭事件

  // 右侧：切换图标
  rightBtn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>';
  rightBtn.onclick = switchCamera; // 绑定切换事件
}

// [FunctionDeclaration] Function: updateUIForReview
function updateUIForReview() {
  const leftBtn = document.getElementById('cameraLeftBtn');
  const rightBtn = document.getElementById('cameraRightBtn');
  const shutterBtn = document.getElementById('cameraShutterBtn');

  // 中间快门隐藏
  shutterBtn.style.display = 'none';

  // 左侧：变为"重拍" (刷新循环箭头图标)
  leftBtn.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="1 4 1 10 7 10"></polyline>
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
    </svg>
  `;
  leftBtn.onclick = retakePhoto; // 绑定重拍事件

  // 右侧：变为"发送" (绿色圆圈+白色对勾)
  rightBtn.innerHTML = `
    <div style="width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
  `;
  rightBtn.onclick = confirmSendPhoto; // 绑定发送事件
}

// [FunctionDeclaration] Function: compressImage
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                let width = img.width;
                let height = img.height;
                const maxSize = 1024; // Max width/height for moments images

                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = (height / width) * maxSize;
                        width = maxSize;
                    } else {
                        width = (width / height) * maxSize;
                        height = maxSize;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
                resolve(compressedBase64);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// [FunctionDeclaration] Function: sendCapturedImage
async function sendCapturedImage(imgUrl) {
  if (!currentChatId) return;

  if (typeof aiReplyMode !== 'undefined' && aiReplyMode === 'immediate') {
      splitMsgQueue.push(imgUrl);
      renderSplitQueue();
      checkSendBtnVisibility();
      return;
  }

  if (typeof wxDrafts !== 'undefined') wxDrafts = [];
  await saveData('chat_drafts_' + currentChatId, null);
  const existingToolbar = document.querySelector('.wx-draft-toolbar');
  if (existingToolbar) existingToolbar.remove();

  const msg = {
      role: 'user',
      type: 'sticker',
      content: imgUrl,
      desc: '拍摄照片',
      timestamp: Date.now()
  };

  await saveMessage(currentChatId, msg);
  appendMessageToUI(msg);
  scrollToBottom();
  await updateChatList(currentChatId, '[图片]', Date.now());
}

// [FunctionDeclaration] Function: openAlbumChoiceMenu
function openAlbumChoiceMenu() {
  closeActionSheet(); // 关闭底部的功能面板
  document.getElementById('albumChoiceOverlay').style.display = 'flex';
}

// [FunctionDeclaration] Function: triggerLocalUpload
function triggerLocalUpload() {
  document.getElementById('albumChoiceOverlay').style.display = 'none';
  document.getElementById('chatImageInput').click();
}

// [FunctionDeclaration] Function: openTextImageModal
function openTextImageModal() {
  document.getElementById('albumChoiceOverlay').style.display = 'none';
  document.getElementById('textImageModal').style.display = 'flex';
  document.getElementById('textImageDescInput').value = ''; // 清空输入
  document.getElementById('textImageDescInput').focus();
}

// [FunctionDeclaration] Function: sendVirtualTextImage
async function sendVirtualTextImage() {
  const desc = document.getElementById('textImageDescInput').value.trim();
  if (!desc) {
    customAlert('请填写图片描述');
    return;
  }
  
  document.getElementById('textImageModal').style.display = 'none';

  // ★ 调用通用工具生成图片
  const base64Img = getVirtualImageBase64();

  // 如果是分句模式
  if (typeof aiReplyMode !== 'undefined' && aiReplyMode === 'immediate') {
      splitMsgQueue.push(base64Img); 
      renderSplitQueue();
      checkSendBtnVisibility();
      return;
  }

  // 清空草稿箱
  if (typeof wxDrafts !== 'undefined') wxDrafts = [];
  if (currentChatId) await saveData('chat_drafts_' + currentChatId, null);
  const existingToolbar = document.querySelector('.wx-draft-toolbar');
  if (existingToolbar) existingToolbar.remove();

  const msg = {
      role: 'user',
      type: 'sticker',
      content: base64Img,
      ai_description: desc, // 用户输入的描述
      desc: '虚拟图片',
      timestamp: Date.now()
  };

  if (currentChatId) {
      await saveMessage(currentChatId, msg);
      appendMessageToUI(msg);
      scrollToBottom();
      await updateChatList(currentChatId, '[图片]', Date.now());
  }
}

// [ExpressionStatement] Execution: addEventListener
document.getElementById('albumChoiceOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'albumChoiceOverlay') e.target.style.display = 'none';
});

// [FunctionDeclaration] Function: getVirtualImageBase64
function getVirtualImageBase64() {
  const svgString = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500" style="background-color: #F2F2F2;">
    <!-- 1. 白色卡片背景 -->
    <rect x="20" y="20" width="360" height="460" rx="12" ry="12" fill="white" stroke="#E0E0E0" stroke-width="2"/>
    <!-- 2. 中间的风景画图标 -->
    <g transform="translate(100, 140)">
      <rect x="0" y="0" width="200" height="150" rx="8" fill="#F7F7F7" stroke="#DDDDDD" stroke-width="2"/>
      <circle cx="150" cy="50" r="18" fill="#DDDDDD"/>
      <path d="M0 150 L80 60 L160 150 Z" fill="#CCCCCC"/>
      <path d="M100 150 L150 90 L200 150 Z" fill="#E0E0E0"/>
    </g>
    <!-- 3. 底部文字提示 -->
    <text x="50%" y="80%" text-anchor="middle" fill="#333333" font-size="22" font-weight="bold" font-family="sans-serif">虚拟图片</text>
    <text x="50%" y="86%" text-anchor="middle" fill="#CCCCCC" font-size="12" font-family="sans-serif">左滑翻转查看详情</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
}

