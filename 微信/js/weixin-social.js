/* --- 小鱼新增：朋友圈功能逻辑 --- */
const momentsEntryBtn = document.getElementById('momentsEntryBtn');
const momentsPage = document.getElementById('momentsPage');
const momentsBackBtn = document.getElementById('momentsBackBtn');
const momentsHeader = document.getElementById('momentsHeader');
const momentsCoverInput = document.getElementById('momentsCoverInput');
const momentsUserName = document.getElementById('momentsUserName');
const momentsUserAvatar = document.getElementById('momentsUserAvatar');
const momentsHint = document.querySelector('.moments-hint'); // 获取提示文字元素

// 1. 将朋友圈页面加入全屏管理
allFullscreenPages.push(momentsPage);

// ★ 小鱼新增：朋友圈未读消息辅助函数
async function addMomentUnreadMsg(msgData) {
    let unread = await getData('moments_unread_msgs') || [];
    unread.push(msgData);
    await saveData('moments_unread_msgs', unread);
}

// 点击提示条时，清空未读并刷新
window.clearMomentUnreadMsgs = async function() {
    await saveData('moments_unread_msgs', []);
    await renderMomentsFeed();
}

// Function to render Moments feed (Extracted for reusability)
async function renderMomentsFeed() {
    const feedContainer = document.getElementById('momentsFeedContainer');
    if (!feedContainer) return;

    // ★ 彻底清零间距，让帖子紧贴封面，头像自然悬浮，彻底消除大白边
    feedContainer.style.cssText = `
        padding-top: 5px; 
        margin-top: 0px;
        padding-bottom: 50px;
        background-color: #FFFFFF;
        min-height: calc(100vh - 350px);
    `;

    // ★ 让整个页面一起滚动
    momentsPage.style.display = 'block';
    momentsPage.style.overflowY = 'auto';
    momentsPage.style.overflowX = 'hidden';
    momentsPage.style.WebkitOverflowScrolling = 'touch';
    momentsPage.style.backgroundColor = '#FFFFFF';

    // 从数据库获取朋友圈数据
const posts = await getData('moments_posts') || [];
const currentUserName = await getData('userName') || '用户'; // Get current user's name for like check

// ★ 新增：读取未读消息，生成微信同款深灰色提示条
const unreadMsgs = await getData('moments_unread_msgs') || [];
let unreadHtml = '';
if (unreadMsgs.length > 0) {
    const latestMsg = unreadMsgs[unreadMsgs.length - 1]; // 获取最新互动的头像
    unreadHtml = `
        <div style="display: flex; justify-content: center; margin-top: 15px; margin-bottom: 25px;">
            <div onclick="clearMomentUnreadMsgs()" style="background: #4C5154; border-radius: 6px; display: flex; align-items: center; padding: 6px 16px 6px 6px; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.15); transition: opacity 0.2s;">
                <div style="width: 32px; height: 32px; border-radius: 4px; background-image: url(${latestMsg.authorAvatar}); background-size: cover; background-position: center; margin-right: 12px; background-color: #eee;"></div>
                <span style="color: #FFFFFF; font-size: 14px; font-weight: 500;">${unreadMsgs.length}条新消息</span>
            </div>
        </div>
    `;
}

if (posts.length === 0) {
    feedContainer.innerHTML = unreadHtml + '<div style="text-align:center; padding:40px; color:#999; font-size:14px;">暂无朋友圈动态</div>';
} else {
    // 渲染每一条动态 (把提示条拼在最前面)
    feedContainer.innerHTML = unreadHtml + posts.map(post => {
        const postDate = new Date(post.timestamp);
        const diffMins = Math.floor((Date.now() - post.timestamp) / 60000);
        let timeStr = '';
        if (diffMins < 1) timeStr = '刚刚';
        else if (diffMins < 60) timeStr = `${diffMins}分钟前`;
        else if (diffMins < 1440) timeStr = `${Math.floor(diffMins/60)}小时前`;
        else timeStr = postDate.toLocaleDateString();

        // Render images if available
        // 单张图片小尺寸显示，多张网格排列
const imgCount = (post.images && post.images.length) || 0;
let imagesHtml = '';
if (imgCount > 0) {
    if (imgCount === 1) {
        // 单张图片：限制最大宽度，不撑满
        imagesHtml = `
        <div style="margin-top: 8px;">
            <img src="${post.images[0]}" style="max-width: 160px; max-height: 160px; width: auto; height: auto; border-radius: 4px; object-fit: cover; display: block;">
        </div>`;
    } else {
        // 多张图片：3列网格，每格固定正方形
        const cols = Math.min(3, imgCount);
        imagesHtml = `
        <div style="display: grid; grid-template-columns: repeat(${cols}, 80px); gap: 4px; margin-top: 8px;">
            ${post.images.map(imgSrc => `
                <img src="${imgSrc}" style="width: 80px; height: 80px; border-radius: 4px; object-fit: cover; display: block;">
            `).join('')}
        </div>`;
    }
}

        // Render likes
const likes = post.likes || [];
const hasLiked = likes.includes(currentUserName);
// ★★★ 小鱼修复：只要有人点赞（不管是谁），爱心就变蓝色 ★★★
const likeIconFill = likes.length > 0 ? '#576B95' : '#B2B2B2';
// ★★★ 小鱼修复：顿号也改成蓝色，保持视觉统一 ★★★
const likeText = likes.length > 0 ? likes.map(name => `<span style="color: #576B95;">${name}</span>`).join('<span style="color: #576B95;">、</span>') : '';
const likesHtml = likes.length > 0 ? `
    <div class="moment-likes">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="${likeIconFill}" stroke="${likeIconFill}" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        ${likeText}
    </div>
` : '';

        // Render comments
        const comments = post.comments || [];
        const commentsHtml = comments.length > 0 ? `
    <div class="moment-comments">
        ${comments.map(comment => {
            const safeContent = String(comment.content || '').replace(/"/g, '&quot;');
            const replyPrefix = comment.replyToAuthorName
                ? `<span style="color:#999;"> 回复 </span><span class="moment-comment-author">${comment.replyToAuthorName}</span>`
                : '';

            return `
                <div class="moment-comment-item" 
                     data-post-id="${post.id}" 
                     data-comment-id="${comment.id}"
                     data-author-name="${comment.authorName}"
                     data-reply-to-author-name="${comment.replyToAuthorName || ''}"
                     data-comment-content="${safeContent}"
                     onclick="openReplyToMomentComment('${post.id}', '${comment.id}', '${comment.authorName}', event)">
                    <span class="moment-comment-author">${comment.authorName}</span>
                    ${replyPrefix}
                    <span class="moment-comment-content">：${comment.content}</span>
                </div>
            `;
        }).join('')}
    </div>
` : '';

        const likeCommentAreaHtml = (likes.length > 0 || comments.length > 0) ? `
            <div class="moment-like-comment-area">
                ${likesHtml}
                ${commentsHtml}
            </div>
        ` : '';

return `
<div class="moment-post-card" data-post-id="${post.id}" style="display: flex; padding: 15px; border-bottom: 1px solid #F0F0F0; user-select: none; -webkit-user-select: none;">
            <div style="width: 42px; height: 42px; border-radius: 4px; background-image: url(${post.authorAvatar}); background-size: cover; background-position: center; flex-shrink: 0; margin-right: 12px; background-color: #eee;"></div>
            <div style="flex: 1; overflow: hidden;">
                <div style="color: #576B95; font-size: 16px; font-weight: 600; margin-bottom: 4px;">${post.authorName}</div>
                <div style="color: #333333; font-size: 15px; line-height: 1.5; margin-bottom: 10px; word-wrap: break-word; white-space: pre-wrap;">${post.content}</div>
                ${imagesHtml}
<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
<div style="display: flex; align-items: center; gap: 12px;">
    <span style="color: #B2B2B2; font-size: 13px;">${timeStr}</span>
    
    <!-- 可见范围图标 (双人头) 增加 div 包裹防失效 -->
    <div onclick="openEditMomentVisibility('${post.id}', event)" style="padding: 5px; margin: -5px; cursor: pointer; display: flex; align-items: center;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="${(!post.visibilityIds || post.visibilityIds.length === 0) ? '#B2B2B2' : '#576B95'}">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
    </div>

    <!-- AI 朋友圈群聊互动图标 (纯蓝色实心气泡) 增加 div 包裹防失效 -->
    <div onclick="triggerAiGroupComments('${post.id}', event)" style="padding: 5px; margin: -5px; cursor: pointer; display: flex; align-items: center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#576B95">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
    </div>
</div>

    <div style="position: relative; display: flex; align-items: center;">
        <!-- 两个点按钮 (使用SVG完美居中) -->
        <div onclick="toggleMomentAction(${post.id}, event)" style="width: 32px; height: 20px; background: #F7F7F7; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#576B95">
                                <circle cx="6" cy="12" r="2.5"/>
                                <circle cx="18" cy="12" r="2.5"/>
                            </svg>
                        </div>
                    </div>
                </div>
                ${likeCommentAreaHtml}
            </div>
</div>`;
    }).join('');
}
    // Bind long press events after rendering
    setTimeout(() => {
    bindMomentLongPress();
    bindCommentLongPress();
}, 100);
}


// 2. 点击进入朋友圈
if (momentsEntryBtn) {
  momentsEntryBtn.addEventListener('click', async () => {
    const avatar = await getData('avatar');
    const name = await getData('userName');
    const cover = await getData('momentsCover'); 

    // 设置头像
    if (avatar) {
      momentsUserAvatar.style.backgroundImage = `url(${avatar})`;
      momentsUserAvatar.innerHTML = '';
    } else {
      momentsUserAvatar.style.backgroundImage = '';
      momentsUserAvatar.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#999;font-size:24px;background:#eee;">我</div>';
    }
    
// 设置昵称
momentsUserName.textContent = name || 'User';

// ★ 强制为封面容器赋予高度，防止高度塌陷
if (momentsHeader) {
    // ★ 不再用 JS 强行设置高度和间距，完全交由 CSS 控制
    // 只保留背景相关的动态设置
    momentsHeader.style.backgroundSize = 'cover';
    momentsHeader.style.backgroundPosition = 'center';
    momentsHeader.style.backgroundColor = '#333';
}

// 判断是否显示背景和提示文字
if (cover) {
  momentsHeader.style.backgroundImage = `url(${cover})`;
  if(momentsHint) momentsHint.style.display = 'none'; 
} else {
  momentsHeader.style.backgroundImage = ''; 
  if(momentsHint) momentsHint.style.display = 'block'; 
}

// 渲染朋友圈动态列表
let feedContainer = document.getElementById('momentsFeedContainer');
if (!feedContainer) {
    feedContainer = document.createElement('div');
    feedContainer.id = 'momentsFeedContainer';
    momentsPage.appendChild(feedContainer);
}

// Call the new rendering function
await renderMomentsFeed();
    
    // ★★★ 新增：监听滑动切换顶部导航栏状态 ★★★
    const nav = document.getElementById('momentsNav');
    
    // 每次打开朋友圈时，强制回到顶部，并重置为透明状态
    momentsPage.scrollTop = 0;
    nav.classList.remove('scrolled');
    
    // 绑定滚动事件
    momentsPage.onscroll = function() {
        // 当滑动距离超过 220px (封面快滚出屏幕) 时，切换状态
        if (this.scrollTop > 220) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    };
    
// 渲染完成后立即绑定长按事件，确保新元素也能绑定
bindMomentLongPress();
bindCommentLongPress();
    
    showPage(momentsPage);
  });
}

// 3. 返回发现页
if (momentsBackBtn) {
  momentsBackBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // ★★★ 关键修复：阻止点击事件传给封面，防止误触

    // ★★★ 小鱼新增：退出朋友圈时，自动收起评论输入框 ★★★
    const momentCommentBar = document.getElementById('momentCommentBar');
    if (momentCommentBar) {
      momentCommentBar.remove();
    }

    // ★★★ 小鱼新增：顺手关闭可能残留的朋友圈操作菜单 ★★★
    const globalMomentActionMenu = document.getElementById('globalMomentActionMenu');
    if (globalMomentActionMenu) {
      globalMomentActionMenu.remove();
    }

    const momentEditMenu = document.getElementById('momentEditMenu');
    if (momentEditMenu) {
      momentEditMenu.remove();
    }

    showPage(mainApp);
  });
}

// 4. 点击封面更换图片
if (momentsHeader) {
  momentsHeader.addEventListener('click', () => momentsCoverInput.click());
}

if (momentsCoverInput) {
  momentsCoverInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const img = ev.target.result;
        momentsHeader.style.backgroundImage = `url(${img})`;
        momentsHint.style.display = 'none'; // ★★★ 上传成功后立即隐藏文字
        await saveData('momentsCover', img);
      };
      reader.readAsDataURL(file);
    }
  });
}

// ========================================
// 小鱼新增：朋友圈关系网辅助函数
// ========================================

// 获取节点显示名称
async function getRelationNodeName(nodeId) {
    if (String(nodeId) === 'user_self') {
        return await getData('userName') || '用户';
    }
    const contacts = await getData('customContacts') || [];
    const contact = contacts.find(c => String(c.id) === String(nodeId));
    return contact ? (contact.realName || contact.nickname) : String(nodeId);
}

// 获取“查看者眼里的发帖人关系说明”
// viewerId = 正在看这条朋友圈的角色ID
// posterId = 发帖人ID（可能是 user_self，也可能是某个角色）
async function getMomentRelationPrompt(viewerId, posterId) {
    if (!viewerId || !posterId) return '';
    if (String(viewerId) === String(posterId)) return '';

    const tagGroups = await getData('tag_groups') || [];
    const allGraphs = await getData('tag_relation_graphs') || {};

    const sharedGroups = tagGroups.filter(g => {
        const ids = (g.memberIds || []).map(id => String(id));
        return ids.includes(String(viewerId)) && ids.includes(String(posterId));
    });

    if (sharedGroups.length === 0) return '';

    const posterName = await getRelationNodeName(posterId);

    let relationLabels = [];

    sharedGroups.forEach(group => {
        const graph = allGraphs[group.id];
        if (!graph || !Array.isArray(graph.edges)) return;

        graph.edges.forEach(edge => {
            const fromId = String(edge.from);
            const toId = String(edge.to);
            const label = (edge.label || '').trim();
            if (!label) return;

            // 单向：只读取“viewer 对 poster”的关系
            if (!edge.twoWay && fromId === String(viewerId) && toId === String(posterId)) {
                relationLabels.push(label);
            }

            // 双向：两边都视为成立，但不强调“双向”这个概念
            if (edge.twoWay) {
                const isMatch =
                    (fromId === String(viewerId) && toId === String(posterId)) ||
                    (fromId === String(posterId) && toId === String(viewerId));

                if (isMatch) {
                    relationLabels.push(label);
                }
            }
        });
    });

    relationLabels = [...new Set(relationLabels.map(s => s.trim()).filter(Boolean))];

    if (relationLabels.length === 0) return '';

    // ★ 核心修复：
    // 1. 不再返回 [关系提示：...] 这种中括号标签
    // 2. 改成自然语言，降低AI误判概率
    // 3. 文案尽量短，避免污染朋友圈正文
    return `你和${posterName}的关系是${relationLabels.join('、')}。`;
}

// 获取“某个发帖角色”的同标签组可见对象（排除自己）
async function getSameTagVisibleCharacters(posterId) {
    const tagGroups = await getData('tag_groups') || [];
    const contacts = await getData('customContacts') || [];

    const resultIds = new Set();

    tagGroups.forEach(group => {
        const ids = (group.memberIds || []).map(id => String(id));
        if (ids.includes(String(posterId))) {
            ids.forEach(id => {
                if (String(id) !== String(posterId) && String(id) !== 'user_self') {
                    resultIds.add(String(id));
                }
            });
        }
    });

    return contacts.filter(c => !c.isGroup && resultIds.has(String(c.id)));
}

/* --- 小鱼新增：朋友圈发表功能逻辑 --- */
let selectedMomentImages = []; // Global variable to store selected images for Moments

// Add the new page to the allFullscreenPages array
allFullscreenPages.push(document.getElementById('postMomentPage'));

// Get elements for the new page
const postMomentBtn = document.getElementById('postMomentBtn');
const postMomentPage = document.getElementById('postMomentPage');
const cancelPostMomentBtn = document.getElementById('cancelPostMomentBtn');
const publishMomentBtn = document.getElementById('publishMomentBtn');
const momentContentInput = document.getElementById('momentContentInput');
const momentImagePreviewContainer = document.getElementById('momentImagePreviewContainer');
const addMomentImageBtn = document.getElementById('addMomentImageBtn');
const momentImageInput = document.getElementById('momentImageInput');

// 1. Handle click on the camera icon on Moments page
if (postMomentBtn) {
  postMomentBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent momentsHeader click handler
    openPostMomentPage();
  });
}

// 2. Open the post Moments page
function openPostMomentPage() {
  // Reset fields
  momentContentInput.value = '';
  selectedMomentImages = [];
  renderMomentImagePreviews();
  updatePublishMomentBtnState();
  showPage(postMomentPage);
}

// 3. Cancel posting Moments
if (cancelPostMomentBtn) {
  cancelPostMomentBtn.addEventListener('click', () => {
    showPage(momentsPage); // Go back to Moments feed
  });
}

// 4. Handle image selection for Moments
if (addMomentImageBtn) {
  addMomentImageBtn.addEventListener('click', () => {
    momentImageInput.click();
  });
}

if (momentImageInput) {
  momentImageInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        // Compress image before adding
        const compressedBase64 = await compressImage(file);
        selectedMomentImages.push(compressedBase64);
        if (selectedMomentImages.length >= 9) { // Limit to 9 images
          addMomentImageBtn.style.display = 'none';
          break;
        }
      }
    }
    renderMomentImagePreviews();
    updatePublishMomentBtnState();
    momentImageInput.value = ''; // Clear input for next selection
  });
}

// 5. Render image previews for Moments
function renderMomentImagePreviews() {
  momentImagePreviewContainer.innerHTML = ''; // Clear existing previews

  selectedMomentImages.forEach((imgBase64, index) => {
    const imgDiv = document.createElement('div');
    imgDiv.style.cssText = `
      width: 100%; aspect-ratio: 1;
      background-image: url(${imgBase64});
      background-size: cover; background-position: center;
      border-radius: 4px; position: relative;
    `;
    // Add a delete button to each image
    imgDiv.innerHTML = `
      <div style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.5); border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; cursor: pointer;" onclick="removeMomentImage(${index})">×</div>
    `;
    momentImagePreviewContainer.appendChild(imgDiv);
  });

  // Add the plus button back if less than 9 images
  if (selectedMomentImages.length < 9) {
    const plusBtn = document.createElement('div');
    plusBtn.id = 'addMomentImageBtn'; // Re-use ID for event delegation if needed, or bind directly
    plusBtn.style.cssText = `
      width: 100%; aspect-ratio: 1; background: #F7F7F7; border: 1px solid #E0E0E0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #BBBBBB; cursor: pointer;
    `;
    plusBtn.textContent = '+';
    plusBtn.onclick = () => momentImageInput.click(); // Re-bind click handler
    momentImagePreviewContainer.appendChild(plusBtn);
  }
}

// 6. Remove image from Moments post
window.removeMomentImage = function(index) {
  selectedMomentImages.splice(index, 1);
  renderMomentImagePreviews();
  updatePublishMomentBtnState();
};

// 7. Update "Publish" button state
if (momentContentInput) {
  momentContentInput.addEventListener('input', updatePublishMomentBtnState);
}

function updatePublishMomentBtnState() {
  const hasContent = momentContentInput.value.trim().length > 0;
  const hasImages = selectedMomentImages.length > 0;

  if (hasContent || hasImages) {
    publishMomentBtn.classList.add('active');
    publishMomentBtn.style.opacity = '1';
    publishMomentBtn.style.pointerEvents = 'auto';
  } else {
    publishMomentBtn.classList.remove('active');
    publishMomentBtn.style.opacity = '0.5';
    publishMomentBtn.style.pointerEvents = 'none';
  }
}

// ★ 谁可以看：存储当前选中的角色ID列表（空=公开）
let momentVisibilityIds = []; // 空数组代表公开
let momentIsPublic = true;    // true=公开，false=指定角色

// 打开谁可以看弹窗 (修复版：强制字符串比对)
window.openMomentVisibilityPicker = async function() {
  const overlay = document.getElementById('momentVisibilityOverlay');
  overlay.style.display = 'flex';

  // 渲染联系人列表
  const contacts = await getData('customContacts') || [];
  const singleContacts = contacts.filter(c => !c.isGroup);
  const listDiv = document.getElementById('momentVisibilityContactList');

  if (singleContacts.length === 0) {
    listDiv.innerHTML = '<div style="padding:30px; text-align:center; color:#999; font-size:14px;">暂无角色</div>';
    return;
  }

  // ★ 核心修复：把当前数组里的所有元素强制转为字符串，方便下面比对
  const stringVisIds = momentVisibilityIds.map(String);

  listDiv.innerHTML = singleContacts.map(c => {
    // ★ 核心修复：比对时，把角色ID也强制转为字符串
    const isChecked = stringVisIds.includes(String(c.id));
    const avatarStyle = c.avatar ? `background-image:url(${c.avatar}); background-size:cover;` : 'background:#ccc;';
    return `
      <div class="moment-vis-row" data-id="${c.id}" onclick="toggleMomentVisContact('${c.id}')"
           style="display:flex; align-items:center; padding:12px 16px; border-bottom:1px solid #F5F5F5; cursor:pointer;">
        <div style="width:38px; height:38px; border-radius:4px; ${avatarStyle} flex-shrink:0; margin-right:12px; display:flex; align-items:center; justify-content:center; color:white; font-size:16px;">
          ${!c.avatar ? (c.nickname[0] || '?') : ''}
        </div>
        <span style="flex:1; font-size:15px; color:#333;">${c.nickname}</span>
        <div class="vis-check-circle" style="width:20px; height:20px; border-radius:50%; border:1.5px solid #C0C0C0; display:flex; align-items:center; justify-content:center; transition:all 0.15s; ${isChecked ? 'background:#07C160; border-color:#07C160;' : ''}">
          ${isChecked ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
        </div>
      </div>
    `;
  }).join('');

  // 同步公开按钮状态
  updateMomentPublicRow();
};

// 切换公开
window.toggleMomentPublic = function() {
  momentIsPublic = true;
  momentVisibilityIds = [];
  // 取消所有角色勾选
  document.querySelectorAll('.moment-vis-row').forEach(row => {
    const circle = row.querySelector('.vis-check-circle');
    circle.style.background = '';
    circle.style.borderColor = '#C0C0C0';
    circle.innerHTML = '';
  });
  updateMomentPublicRow();
};

// 切换角色勾选 (修复版：强制字符串比对)
window.toggleMomentVisContact = function(id) {
  const strId = String(id); // ★ 核心修复：传入的ID强制转字符串
  const row = document.querySelector(`.moment-vis-row[data-id="${strId}"]`);
  const circle = row.querySelector('.vis-check-circle');
  
  // ★ 核心修复：把数组里所有的元素都当成字符串来找索引
  const stringVisIds = momentVisibilityIds.map(String);
  const idx = stringVisIds.indexOf(strId);

  if (idx !== -1) {
    // 找到了，说明要取消勾选
    momentVisibilityIds.splice(idx, 1);
    circle.style.background = '';
    circle.style.borderColor = '#C0C0C0';
    circle.innerHTML = '';
  } else {
    // 没找到，说明要勾选，存入字符串格式的ID
    momentVisibilityIds.push(strId);
    circle.style.background = '#07C160';
    circle.style.borderColor = '#07C160';
    circle.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  }

  // 有角色被选中时，取消"公开"
  if (momentVisibilityIds.length > 0) {
    momentIsPublic = false;
  } else {
    momentIsPublic = true;
  }
  updateMomentPublicRow();
};

// 更新公开行勾选状态
function updateMomentPublicRow() {
  const checkEl = document.getElementById('momentPublicCheck');
  const label = document.getElementById('momentVisibilityLabel');
  if (momentIsPublic || momentVisibilityIds.length === 0) {
    checkEl.style.display = 'flex';
    label.textContent = '公开';
  } else {
    checkEl.style.display = 'none';
    label.textContent = `${momentVisibilityIds.length}人可见`;
  }
}

// 关闭弹窗
window.closeMomentVisibilityPicker = function() {
  document.getElementById('momentVisibilityOverlay').style.display = 'none';
};

// 确认选择 (智能分流版：支持发帖与修改历史)
window.confirmMomentVisibility = async function() {
  // 如果当前是修改历史帖子模式
  if (typeof currentVisibilityMode !== 'undefined' && currentVisibilityMode === 'edit' && typeof editingMomentPostId !== 'undefined' && editingMomentPostId) {
      let posts = await getData('moments_posts') || [];
      const postIndex = posts.findIndex(p => String(p.id) === String(editingMomentPostId));
      
      if (postIndex !== -1) {
          // 保存新的可见名单
          posts[postIndex].visibilityIds = momentIsPublic ? [] : [...momentVisibilityIds];
          await saveData('moments_posts', posts);
          
          // 刷新朋友圈界面，双人头颜色会同步更新
          if (document.getElementById('momentsPage').style.display !== 'none') {
              await renderMomentsFeed();
          }
      }
      // 恢复为默认发帖模式，防止影响后续发动态
      editingMomentPostId = null;
      currentVisibilityMode = 'post';
  }
  
  // 无论哪种模式，最后都关闭弹窗
  closeMomentVisibilityPicker();
};

// 8. Publish Moments
if (publishMomentBtn) {
  publishMomentBtn.addEventListener('click', async () => {
    const content = momentContentInput.value.trim();
    if (!content && selectedMomentImages.length === 0) {
      customAlert('内容或图片至少需要一项');
      return;
    }

    const userName = await getData('userName') || 'User';
    const userAvatar = await getData('avatar') || 'https://iili.io/fkc3RwJ.jpg';

    const newMoment = {
      id: Date.now(),
      authorName: userName,
      authorAvatar: userAvatar,
      content: content,
      images: selectedMomentImages,
      visibilityIds: momentIsPublic ? [] : [...momentVisibilityIds], // 空=公开
      timestamp: Date.now()
    };

    let moments = await getData('moments_posts') || [];
    moments.unshift(newMoment);
    await saveData('moments_posts', moments);

// ★ 核心：将朋友圈作为隐藏消息插入对应角色的聊天记录（带关系网提示）
const contacts = await getData('customContacts') || [];
const singleContacts = contacts.filter(c => !c.isGroup);

// 决定哪些角色能看到
const targetContacts = (momentIsPublic || momentVisibilityIds.length === 0)
  ? singleContacts
  : singleContacts.filter(c => momentVisibilityIds.map(id => String(id)).includes(String(c.id)));

// 逐个写入目标角色的聊天记录（每个角色都生成自己专属的关系提示）
for (const contact of targetContacts) {
  const relationPrompt = await getMomentRelationPrompt(contact.id, 'user_self');

  // 构建朋友圈文字部分的提示词
  let momentTextDesc = `[系统提示：${userName} 刚发了一条朋友圈（帖子ID: ${newMoment.id}）`;
  if (content) {
    momentTextDesc += `，内容是："${content}"`;
  }
  if (newMoment.images && newMoment.images.length > 0) {
    momentTextDesc += `，并附带了 ${newMoment.images.length} 张图片（图片内容见下方）`;
  }
  momentTextDesc += `。你已经在朋友圈看到了这条动态。`;

  const likes = newMoment.likes || [];
  const comments = newMoment.comments || [];
  if (likes.length > 0) {
    momentTextDesc += ` 当前点赞：${likes.join('、')}。`;
  }
  if (comments.length > 0) {
    const commentList = comments.map(c => `${c.authorName}: ${c.content}`).join('；');
    momentTextDesc += ` 当前评论：${commentList}。`;
  }

  // ★ 核心新增：拼接“查看者眼中的发帖人关系”
if (relationPrompt) {
    momentTextDesc += ` 补充背景：${relationPrompt}`;
}

  momentTextDesc += ` 你可以选择点赞或评论这条朋友圈。正确的行为示例：如果对方在聊天中继续说话，你可以在回复中顺带提一句；如果对方没有主动提起，你也可以主动关心，但语气要自然，就像朋友看到朋友圈后发消息问候一样。切勿把这条背景信息当作用户发给你的直接消息来回复。]`;

  // 构建多模态消息体：文字+图片合并为一条消息
  let momentMsgContent;
  if (newMoment.images && newMoment.images.length > 0) {
    const contentParts = [
      { type: 'text', text: momentTextDesc }
    ];
    newMoment.images.forEach(imgBase64 => {
      contentParts.push({
        type: 'image_url',
        image_url: { url: imgBase64 }
      });
    });
    momentMsgContent = contentParts;
  } else {
    momentMsgContent = momentTextDesc;
  }

  const chatKey = 'chat_messages_' + contact.id;
  let chatMsgs = await getData(chatKey) || [];

  chatMsgs.push({
    role: 'user',
    type: 'moment_hidden',
    content: momentMsgContent,
    momentId: newMoment.id,
    timestamp: newMoment.id,
    isHidden: true,
    source: 'online'
  });

  await saveData(chatKey, chatMsgs);
}

    // 重置谁可以看状态为公开
    momentVisibilityIds = [];
    momentIsPublic = true;
    const label = document.getElementById('momentVisibilityLabel');
    if (label) label.textContent = '公开';

    customAlert('朋友圈发布成功！');
    showPage(momentsPage);
    await renderMomentsFeed();
  });
}

// --- 微信记忆总结功能 (入口) ---
// isSilent: true 表示自动总结(直接运行); false 表示手动点击(进入多选)
async function summarizeMemory(isSilent = false) {
    if (isSilent) {
        // 自动总结：直接执行后台逻辑
        await executeSummary([], true);
    } else {
        // 兼容旧代码调用，其实现在手动多选直接走 enterMultiSelectMode() 了
        enterMultiSelectMode();
    }
}

// ★★★ 小鱼新增：工具栏一键总结上下文功能 ★★★
async function summarizeContextMemory() {
    closeActionSheet(); // 先收起+号面板
    if (!currentChatId) return;

    // 1. 获取当前设置的上下文长度
    const savedLimit = await getData('contextLimit_' + currentChatId) || 20;
    
    // 2. 获取所有消息
    const key = 'chat_messages_' + currentChatId;
    const allMessages = await getData(key) || [];
    
    // 3. 截取最近的 N 条消息 (与AI读取的上下文长度一致)
    // 过滤掉隐藏指令，只总结真实对话
    const visibleMessages = allMessages.filter(m => !m.isHidden && m.type !== 'system_separator');
    const targetMessages = visibleMessages.slice(-savedLimit);

    if (targetMessages.length === 0) {
        customAlert('当前没有可总结的聊天记录');
        return;
    }

    if (await customConfirm(`系统将自动提取最近 ${targetMessages.length} 条对话生成记忆，是否继续？`)) {
        // 直接调用执行总结函数
        await executeSummary(targetMessages, false);
    }
}

// --- 提交选中的消息进行总结 ---
async function submitSelectedSummary() {
    if (selectedTimestamps.size === 0) {
        customAlert('请至少选择一条消息');
        return;
    }

    // 1. 获取所有消息
    const key = 'chat_messages_' + currentChatId;
    const allMessages = await getData(key) || [];
    
    // ★★★ 核心修复：按照消息在聊天记录中的原始顺序进行总结 ★★★
    // 2. 筛选出选中的消息，并保持原始顺序
    const targetMessages = allMessages.filter(m => selectedTimestamps.has(m.timestamp));
    
    // 3. 按时间戳严格排序（从早到晚）
    targetMessages.sort((a, b) => a.timestamp - b.timestamp);
    
    console.log(`✅ 准备总结 ${targetMessages.length} 条消息，时间范围: ${new Date(targetMessages[0].timestamp).toLocaleString()} ~ ${new Date(targetMessages[targetMessages.length - 1].timestamp).toLocaleString()}`);
    
    // 4. 退出多选模式
    exitMultiSelectMode();
    
    // 5. 执行总结
    await executeSummary(targetMessages, false);
}

// --- 执行总结核心逻辑 (高浓缩版) ---
async function executeSummary(manualMessages = [], isSilent = false) {
    if (!currentChatId) return;
    const key = 'chat_messages_' + currentChatId;
    let messages = await getData(key) || [];
    let targetMessages = [];

    // 1. 筛选消息
    if (isSilent) {
        let lastSummaryIndex = -1;
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].summarized === true) {
                lastSummaryIndex = i;
                break;
            }
        }
        const unsummarized = lastSummaryIndex === -1 ? messages : messages.slice(lastSummaryIndex + 1);
        targetMessages = unsummarized.filter(m => !m.isHidden && m.type !== 'system_separator' && (m.type === 'text' || m.type === 'voice' || m.type === 'inner_voice'));
        
        // ★★★ 核心修改：提高门槛到10条 ★★★
        if (targetMessages.length < 10) {
            console.log(`未总结消息仅 ${targetMessages.length} 条，未达到10条门槛，跳过总结`);
            return;
        }
    } else {
        targetMessages = manualMessages;
    }

    if (targetMessages.length === 0) {
        if (!isSilent) customAlert('没有有效的内容可总结');
        return;
    }

    // 2. 准备数据
const contact = await getContactDetails(currentChatId);
const isGroup = contact.isGroup;
const userName = await getData('userName') || '用户';

// ★★★ 群聊不再需要分发名单，统一存储 ★★★

    // ★★★ 核心修复：构建对话文本（严格按时间顺序 + 清洗图片/语音）★★★
// 小鱼优化：在总结前，先建立一个 [昵称 -> 真名] 的查找表
let nicknameToRealNameMap = {};
if (isGroup) {
    const allContactsForMap = await getData('customContacts') || [];
    const groupMemberIds = contact.memberIds || [];
    const groupMembers = allContactsForMap.filter(c => groupMemberIds.includes(c.id));
    groupMembers.forEach(m => {
        // 建立映射：昵称 -> 真名 (如果没有真名就用昵称)
        nicknameToRealNameMap[m.nickname] = m.realName || m.nickname;
    });
}

const conversationText = targetMessages.map((m, index) => {
    let speaker = m.role === 'user' ? userName : (contact.realName || contact.nickname);
    
    // 如果是群聊，尝试把“发送者昵称”翻译回“真名”
    if (isGroup && m.senderName) {
        speaker = nicknameToRealNameMap[m.senderName] || m.senderName;
    }
    
    let content = m.content;

        // 清洗特殊消息
        if (m.type === 'sticker') {
            if (m.ai_description) {
                content = `[图片内容: ${m.ai_description}]`;
            } else if (m.desc) {
                content = `[表情/图片: ${m.desc}]`;
            } else {
                content = `[发送了一张图片]`;
            }
        } else if (typeof content === 'string' && content.startsWith('[VOICE:')) {
            const match = content.match(/^\[VOICE:\d+:(.+)\]$/);
            content = match ? `(语音) ${match[1]}` : content;
        } else if (m.type === 'inner_voice') {
            content = `(内心独白: ${content})`;
        } else if (m.type === 'pat') {
            content = `(动作) ${content}`;
        }

        return `[${index + 1}] ${speaker}: ${content}`;
    }).join('\n');

    // ★★★ 核心新增：计算建议总结条数（10条对话→1条记忆）★★★
    const msgCount = targetMessages.length;
    const maxSummaryCount = Math.max(1, Math.floor(msgCount / 10));

    // UI 反馈
    let originalTitle = '';
    if (!isSilent) {
        originalTitle = document.getElementById('chatTitle').textContent;
        document.getElementById('chatTitle').textContent = '正在提取记忆...';
        document.getElementById('chatTitle').classList.add('typing-blink-effect');
    }

    try {
        let apiConfig = await getApiConfigForWechat('memorySummary');
        if (!apiConfig || !apiConfig.apiKey) apiConfig = await getApiConfigForWechat('wechat');

        // 3. 构建 Prompt（群聊和单聊分别处理）
        let prompt = "";
        
        if (isGroup) {
            // === 群聊模式（第三人称客观记录版）===
            const groupName = contact.nickname || '群聊';
            prompt = `你是一个群聊观察者。请以**第三人称客观视角**，总结下面这段"${groupName}"中发生的重要事件。

【对话记录】（已按时间顺序排列）
${conversationText}

【核心规则】
1. **客观记录**：用第三人称（他/她/他们）描述群里发生的事，不要代入任何角色的主观感受。
2. **内容结构**：【谁做了什么】+【其他人的反应/结果】。
3. **抓大放小**：忽略水群和寒暄，只记录引发讨论、关系变化或重要决定的核心事件。
4. **高度浓缩**：本次共 ${msgCount} 条对话，请浓缩为 **约${maxSummaryCount}条** 核心记忆。
5. **长度限制**：每条记忆控制在50字以内。

【输出格式】
- 直接输出纯文本列表，每行一条记忆。
- 不要加序号，不要用Markdown。
- 必须以第三人称开头（如：张三、李四、${userName}等）。

示例：
${userName}在群里提议周末聚餐，张三和李四都表示赞同，最终决定去吃火锅。
王五在群里炫耀新买的手机，李四表面附和但语气有些酸溜溜的。

现在开始总结（建议 ${maxSummaryCount} 条左右）：`;
        } else {
            // === 单聊模式（第一人称情感版）===
            prompt = `你是一个专业的对话记忆提取助手。请从下面的聊天记录中，提取出**最核心、最有价值**的关键信息。

【对话记录】（已按时间顺序排列）
${conversationText}

【核心规则】
1. **高度浓缩**：本次共 ${msgCount} 条对话，你需要将它们浓缩为 **约${maxSummaryCount}条** 核心记忆
2. **合并同类事件**：不要逐句记录，将连续相关的多句话合并成一个完整事件
3. **优先级排序**：只记录对角色发展、关系变化、重要决定有影响的内容，忽略寒暄和闲聊
4. **固定句式**："谁+做了什么+结果/影响"
5. **长度限制**：每条记忆30字以内

【输出格式】
- 直接输出纯文本列表
- 不要加序号、不要用Markdown
- 每行一条记忆
- 如果对话内容过于琐碎无价值，允许少于 ${maxSummaryCount} 条

现在开始提取（建议 ${maxSummaryCount} 条左右）：`;
        }

        const response = await callAIAPI([{ role: 'user', content: prompt }], apiConfig);
        
        if (response && response.trim()) {
            const lines = response.trim().split('\n').filter(l => l.trim().length > 1);
            let savedCount = 0;

for (const line of lines) {
    const cleanLine = line.trim();
    
    // ★★★ 核心修改：群聊和单聊统一处理，都存到对应的ID下 ★★★
    const content = cleanLine.replace(/^[0-9]+[\.\、]\s*/, '').replace(/^-\s*/, '').trim();
    
    if (content.length > 0) {
        // 统一调用保存函数，群聊存到群聊ID，单聊存到单聊ID
        saveToGroupMemory(currentChatId, contact.nickname, content);
        savedCount++;
    }
    
    await new Promise(r => setTimeout(r, 50)); 
}

            if (savedCount > 0) {
                // 标记已总结
                const timestampsToMark = new Set(targetMessages.map(m => m.timestamp));
                let latestMessages = await getData(key) || [];
                latestMessages.forEach(m => { if (timestampsToMark.has(m.timestamp)) m.summarized = true; });
                await saveData(key, latestMessages);
                
                if (!isSilent) customAlert(`✅ 总结完成，已保存 ${savedCount} 条记忆`);
                else console.log(`✅ 自动总结完成，保存 ${savedCount} 条`);
            } else {
                if (!isSilent) customAlert('AI认为没有值得提取的有效信息');
            }
        }
    } catch (error) {
        console.error('总结失败', error);
        if (!isSilent) customAlert('总结失败: ' + error.message);
    } finally {
        if (!isSilent) {
            document.getElementById('chatTitle').textContent = originalTitle;
            document.getElementById('chatTitle').classList.remove('typing-blink-effect');
        }
    }
}

// 小鱼优化：直接调用写入函数，拆除桥梁
function saveToGroupMemory(id, name, content) {
    // addMemory 是 webbox-ai.js 中原有的函数
    addMemory([id], [name], content);
}

// --- 群聊记忆分发管理逻辑 ---
async function openMemTargetModal() {
    if (!currentChatId) return;
    const contacts = await getData('customContacts') || [];
    const group = contacts.find(c => c.id === currentChatId);
    if (!group || !group.isGroup) {
        customAlert("仅群聊支持此设置");
        return;
    }

    // 获取已保存的勾选名单
    const savedTargets = (await getData('groupMemoryTargets_' + currentChatId)) || [];
    
    // 获取群成员
    const memberIds = group.memberIds || [];
    const members = contacts.filter(c => memberIds.includes(c.id) && c.id !== 'user_self'); // 排除自己

    const listDiv = document.getElementById('memTargetList');
    listDiv.innerHTML = members.map(m => {
        const isChecked = savedTargets.includes(m.id) ? 'checked' : '';
        return `
            <label style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer;">
                <input type="checkbox" class="mem-target-checkbox" value="${m.id}" ${isChecked} style="margin-right: 12px; width: 18px; height: 18px; accent-color: #07C160;">
                <div style="flex: 1; font-size: 16px;">${m.nickname}</div>
            </label>
        `;
    }).join('');

    document.getElementById('memTargetModal').style.display = 'flex';
}

async function saveMemTargets() {
    const checkboxes = document.querySelectorAll('.mem-target-checkbox:checked');
    const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value)); // ID通常是数字
    await saveData('groupMemoryTargets_' + currentChatId, selectedIds);
    document.getElementById('memTargetModal').style.display = 'none';
    customAlert(`已设置 ${selectedIds.length} 个记忆分发对象`);
}

/* ========================================
   小鱼新增：转账功能核心逻辑
   ======================================== */
   
// 1. 将转账页加入全屏管理
allFullscreenPages.push(document.getElementById('transferPage'));

let currentTransferMoney = '';
let currentTransferNote = ''; // ★ 新增：存储转账说明
let currentTransferTargetId = null; // ★ 新增：记录实际收款人ID

// ★ 新增：编辑转账说明函数
window.editTransferNote = async function() {
    const note = await customPrompt('请输入转账说明（最多60个字）：', currentTransferNote);
    if (note !== null) {
        currentTransferNote = note.trim().substring(0, 60); 
        const btn = document.getElementById('transferNoteBtn');
        if (currentTransferNote) {
            btn.innerHTML = `${currentTransferNote} <span style="color: #576B95; margin-left: 6px;">修改</span>`;
            btn.style.color = '#333'; 
        } else {
            btn.innerHTML = '添加转账说明';
            btn.style.color = '#576B95'; 
        }
    }
};

// 2. 打开转账页面 (智能分流：单聊直接进，群聊先进选人页)
window.openTransferPage = async function() {
  if (!currentChatId) return;
  closeActionSheet(); // 关闭底部菜单

  const contact = await getContactDetails(currentChatId);
  if (!contact) return;

  if (contact.isGroup) {
      // 群聊：打开选择收款方页面
      await renderGroupTransferSelect(contact);
      showPage(document.getElementById('groupTransferSelectPage'));
  } else {
      // 单聊：直接进入转账页
      currentTransferTargetId = currentChatId;
      await renderTransferPageUI(contact);
  }
};

// ★ 新增：渲染群聊收款方选择列表
async function renderGroupTransferSelect(groupContact) {
    const listContainer = document.getElementById('groupTransferMemberList');
    listContainer.innerHTML = '';
    
    const allContacts = await getData('customContacts') || [];
    const memberIds = groupContact.memberIds || [];
    
    // 过滤出群成员，排除自己
    const members = allContacts.filter(c => memberIds.includes(c.id) && c.id !== 'user_self');
    
    if (members.length === 0) {
        listContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">群内没有其他成员</div>';
        return;
    }

    members.forEach(m => {
        const row = document.createElement('div');
        row.className = 'contact-item';
        row.style.borderBottom = '1px solid #F0F0F0';
        
        const displayAvatar = m.avatar || 'https://iili.io/fkc3RwJ.jpg';
        
        row.innerHTML = `
            <div class="contact-icon" style="background-image: url(${displayAvatar}); background-size: cover; background-color: #ccc; width: 40px; height: 40px; margin-right: 12px; border-radius: 4px;"></div>
            <span class="contact-name">${m.nickname}</span>
        `;
        
        // 点击某人后，记录目标ID，并跳转到输入金额页面
        row.onclick = async () => {
            currentTransferTargetId = m.id;
            await renderTransferPageUI(m);
        };
        
        listContainer.appendChild(row);
    });
}

// ★ 新增：关闭选择收款方页面
window.closeGroupTransferSelect = function() {
    showPage(document.getElementById('chatRoomPage'));
};

// ★ 提取：渲染实际输入金额的页面
async function renderTransferPageUI(targetContact) {
  let displayName = targetContact.nickname;
  if (targetContact.realName) {
    const lastChar = targetContact.realName.slice(-1);
    displayName = `${targetContact.nickname} (**${lastChar})`;
  } else {
    const lastChar = targetContact.nickname.slice(-1);
    displayName = `${targetContact.nickname} (**${lastChar})`;
  }

  let wxId = targetContact.wechatId || '未设置';
  
  document.getElementById('transferTargetName').textContent = `转账给 ${displayName}`;
  document.getElementById('transferTargetId').textContent = `微信号：${wxId}`;
  
  const avatarEl = document.getElementById('transferTargetAvatar');
  if (targetContact.avatar) {
    avatarEl.style.backgroundImage = `url(${targetContact.avatar})`;
    avatarEl.innerHTML = '';
  } else {
    avatarEl.style.backgroundImage = '';
    avatarEl.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>';
  }

  currentTransferMoney = '';
  currentTransferNote = ''; 
  document.getElementById('transferNoteBtn').innerHTML = '添加转账说明'; 
  document.getElementById('transferNoteBtn').style.color = '#576B95';
  
  updateMoneyDisplay();
  showPage(document.getElementById('transferPage'));
}

// 3. 关闭转账页 (返回聊天或选人页)
window.closeTransferPage = async function() {
  const contact = await getContactDetails(currentChatId);
  if (contact && contact.isGroup) {
      showPage(document.getElementById('groupTransferSelectPage')); // 群聊退回选人
  } else {
      showPage(document.getElementById('chatRoomPage')); // 单聊退回聊天
  }
};

// 4. 键盘输入逻辑
window.inputMoney = function(key) {
  if (key === 'del') {
    currentTransferMoney = currentTransferMoney.slice(0, -1);
    updateMoneyDisplay();
    return;
  }
  if (key === '.') {
    if (currentTransferMoney === '') return;
    if (currentTransferMoney.includes('.')) return;
  }
  if (currentTransferMoney.includes('.')) {
    const parts = currentTransferMoney.split('.');
    if (parts[1].length >= 2) return;
  }
  if (parseFloat(currentTransferMoney + key) > 200000) return;

  currentTransferMoney += key;
  updateMoneyDisplay();
};

function updateMoneyDisplay() {
  const display = document.getElementById('transferAmountDisplay');
  const btn = document.getElementById('btnSendTransfer');
  
  if (currentTransferMoney === '') {
    display.innerHTML = '<span class="cursor-blink"></span>';
    btn.classList.add('disabled');
  } else {
    display.innerHTML = currentTransferMoney + '<span class="cursor-blink"></span>';
    btn.classList.remove('disabled');
  }
}

// 5. 确认转账
window.confirmTransfer = async function() {
  const amount = parseFloat(currentTransferMoney);
  if (!amount || amount <= 0) return;

  showPage(document.getElementById('chatRoomPage')); // 确认后直接回聊天界面

  // 获取实际收款人信息
  const allContacts = await getData('customContacts') || [];
  const targetContact = allContacts.find(c => c.id === currentTransferTargetId);
  const targetName = targetContact ? targetContact.nickname : '对方';

  // 构造发给AI看的内容 (群聊中明确指出转给谁)
  const contact = await getContactDetails(currentChatId);
  let aiContent = contact.isGroup ? `[转账给 ${targetName}] ¥${amount.toFixed(2)}` : `[转账] ¥${amount.toFixed(2)}`;
  if (currentTransferNote) {
      aiContent += ` (说明: ${currentTransferNote})`;
  }

  const msg = {
    role: 'user',
    type: 'transfer', 
    amount: amount.toFixed(2),
    transferNote: currentTransferNote, 
    content: aiContent, 
    targetId: currentTransferTargetId, // ★ 记录给谁的
    targetName: targetName,            // ★ 记录名字
    timestamp: Date.now()
  };

  wxDrafts = [];
  await saveData('chat_drafts_' + currentChatId, null);
  
  await saveMessage(currentChatId, msg);
  appendMessageToUI(msg, null, contact.isGroup); 
  scrollToBottom();
  await updateChatList(currentChatId, `[转账] ¥${amount.toFixed(2)}`, Date.now());

  if (typeof aiReplyMode !== 'undefined' && aiReplyMode === 'immediate') {
      setTimeout(() => getAIResponse(currentChatId), 500);
  }
};

// ★★★ 小鱼新增：处理收款逻辑 (双模式终极版) ★★★
let currentReceivingMsgTimestamp = null; 

// 1. 打开收款页面 (自动判断状态：待收款/已收款/已退还)
window.openReceiveMoneyPage = function(msg) {
    currentReceivingMsgTimestamp = msg.timestamp;
    const status = msg.transferStatus; // pending, accepted, returned
    
    // --- 填充基础数据 ---
    document.getElementById('receiveAmount').textContent = parseFloat(msg.amount).toFixed(2);
    
    // 格式化转账时间
    const transDate = new Date(msg.timestamp);
    const transTimeStr = transDate.toLocaleString('zh-CN', {year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'});
    document.getElementById('receiveTime').textContent = transTimeStr;

    // --- 获取UI元素 ---
const iconDiv = document.getElementById('receiveIcon');
const statusDiv = document.getElementById('receiveStatus');
const balanceLink = document.getElementById('receiveBalanceLink');
const collectRow = document.getElementById('collectTimeRow');
const actionArea = document.getElementById('receiveActionArea');

// ★ 新增：处理转账说明显示
const noteRow = document.getElementById('receiveNoteRow');
const noteContent = document.getElementById('receiveNoteContent');

if (msg.transferNote && msg.transferNote.trim() !== '') {
    noteRow.style.display = 'flex';
    noteContent.textContent = msg.transferNote;
} else {
    noteRow.style.display = 'none';
}

// --- 根据状态切换界面 ---
    if (status === 'accepted') {
        // === 模式A：已收款 (绿色对勾) ===
        iconDiv.innerHTML = `
            <svg viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="30" fill="#07C160"/>
                <polyline points="17 31 25 39 43 21" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
        
        statusDiv.textContent = "你已收款，资金已存入零钱";
        balanceLink.style.display = 'block';
        
        collectRow.style.display = 'flex';
        collectRow.querySelector('span:first-child').textContent = "收款时间";
        const collectDate = msg.collectTimestamp ? new Date(msg.collectTimestamp) : new Date();
        const collectTimeStr = collectDate.toLocaleString('zh-CN', {year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'});
        document.getElementById('collectTime').textContent = collectTimeStr;
        
        actionArea.style.display = 'none'; // 隐藏按钮
        
    } else if (status === 'returned') {
        // === 模式B：已退还 (黄色箭头) ===
iconDiv.innerHTML = `
    <svg viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="30" fill="#F6C446"/>
        <path d="M34 40 A 7 7 0 0 0 34 26 L 20 26" stroke="white" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M25 20 L 20 26 L 25 32" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
            
        statusDiv.textContent = "你已退还";
        balanceLink.style.display = 'none';
        
        collectRow.style.display = 'flex';
        collectRow.querySelector('span:first-child').textContent = "退款时间"; // 修改标签为退款时间
        const returnDate = msg.returnTimestamp ? new Date(msg.returnTimestamp) : new Date();
        const returnTimeStr = returnDate.toLocaleString('zh-CN', {year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'});
        document.getElementById('collectTime').textContent = returnTimeStr;
        
        actionArea.style.display = 'none'; // 隐藏按钮

    } else {
        // === 模式C：待收款 (蓝绿时钟) ===
        iconDiv.innerHTML = `
            <svg viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="30" fill="#3eb575" fill-opacity="0.1"/>
                <circle cx="30" cy="30" r="28" stroke="#2ea168" stroke-width="2" fill="none"/>
                <polyline points="30 16 30 30 40 40" stroke="#2ea168" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
            
        statusDiv.textContent = "待你收款";
        balanceLink.style.display = 'none';
        collectRow.style.display = 'none';
        actionArea.style.display = 'flex'; // 显示按钮
    }
    
    document.getElementById('receiveMoneyPage').style.display = 'flex';
};

// 2. 确认收款按钮逻辑
document.getElementById('confirmReceiveBtn').addEventListener('click', async () => {
    if (!currentReceivingMsgTimestamp || !currentChatId) return;
    
    const key = 'chat_messages_' + currentChatId;
    let messages = await getData(key) || [];
    
    const msgIndex = messages.findIndex(m => m.timestamp == currentReceivingMsgTimestamp);
    if (msgIndex !== -1) {
        messages[msgIndex].transferStatus = 'accepted';
        messages[msgIndex].collectTimestamp = Date.now();
        await saveData(key, messages);
        
        // 更新聊天界面气泡
        updateChatBubbleAfterAction(currentReceivingMsgTimestamp, 'accepted');
        
        // 刷新当前页面
        openReceiveMoneyPage(messages[msgIndex]);

        // 发送"已收款"回执
        sendTransferReceipt(messages[msgIndex].amount, 'accepted');
    }
});

// 3. ★★★ 新增：点击"退还"逻辑 ★★★
document.getElementById('returnTransferLink').addEventListener('click', async () => {
    if (!currentReceivingMsgTimestamp || !currentChatId) return;
    
    if (!await customConfirm('确认退还这笔转账给对方吗？')) return;

    const key = 'chat_messages_' + currentChatId;
    let messages = await getData(key) || [];
    
    const msgIndex = messages.findIndex(m => m.timestamp == currentReceivingMsgTimestamp);
    if (msgIndex !== -1) {
        // 更新状态为 returned
        messages[msgIndex].transferStatus = 'returned';
        messages[msgIndex].returnTimestamp = Date.now(); // 记录退还时间
        await saveData(key, messages);
        
        // 更新聊天界面气泡
        updateChatBubbleAfterAction(currentReceivingMsgTimestamp, 'returned');
        
        // 刷新当前页面 (显示黄色图标)
        openReceiveMoneyPage(messages[msgIndex]);

        // 发送"已退还"回执
        sendTransferReceipt(messages[msgIndex].amount, 'returned');
    }
});

// 辅助：更新聊天气泡状态
function updateChatBubbleAfterAction(timestamp, status) {
    const bubble = document.querySelector(`[data-timestamp="${timestamp}"]`);
    if (bubble) {
        const iconContainer = bubble.querySelector('.transfer-icon-circle');
        if (iconContainer) {
            // 根据状态切换图标
            if (status === 'accepted') {
                iconContainer.innerHTML = `<svg width="42" height="42" viewBox="0 0 42 42" fill="none"><circle cx="21" cy="21" r="19" stroke="white" stroke-width="2.5"/><polyline points="12 21 18 27 30 15" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            } else {
                // 退还图标
                iconContainer.innerHTML = `<svg width="42" height="42" viewBox="0 0 42 42" fill="none"><circle cx="21" cy="21" r="19" stroke="white" stroke-width="2.5"/><path d="M24 28 A 5 5 0 0 0 24 18 L 13 18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 14 L 13 18 L 17 22" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            }
        }
        
        const descEl = bubble.querySelector('.transfer-desc');
        if (descEl) {
            // ★★★ 核心：AI发来的转账，我退还了 -> 显示"已被退还" ★★★
            descEl.textContent = status === 'accepted' ? '已被接收' : '已被退还';
        }
        
        const contentDiv = bubble.querySelector('.msg-content');
        if (contentDiv) contentDiv.classList.add('transfer-processed');
    }
}

// 辅助：发送回执消息
async function sendTransferReceipt(amount, status) {
    const contentText = status === 'accepted' ? '[已收款]' : '[已退还]';
    
    // ★★★ 核心：回执卡片，如果是退还，不需要区分谁发的，都显示"已退还" ★★★
    // 只有橙色气泡才需要区分 "已被退还" vs "已退还"
    
    const receiptMsg = {
        role: 'user',
        type: 'transfer',
        transferStatus: status, // accepted 或 returned
        amount: amount,
        content: contentText, 
        isReceipt: true, 
        timestamp: Date.now()
    };

    await saveMessage(currentChatId, receiptMsg);
    appendMessageToUI(receiptMsg, userAvatarUrl, false); 
    scrollToBottom();
    await updateChatList(currentChatId, contentText, Date.now());
}
// ★★★ 绑定入口按钮 ★★★
// 找到原来那个 "转账" 的按钮，把它的 onclick 改为 openTransferPage()
// 为了保险，我们在页面加载完成后强制绑定一次
document.addEventListener('DOMContentLoaded', () => {
    // 找到 action-sheet 里的第6个按钮（转账）
    // 原代码结构中，转账是第2页的第2个，或者第1页的第6个，根据你的代码：
    // <!-- 6. 转账 --> ... <span class="action-text">转账</span>
    
    const actionItems = document.querySelectorAll('.action-item');
    actionItems.forEach(item => {
        if (item.querySelector('.action-text').textContent.trim() === '转账') {
            item.onclick = openTransferPage;
        }
    });
});

// ========================================
// 小鱼新增：群聊记忆挂载多选弹窗逻辑
// ========================================
window.openMountGroupModal = async function() {
    if (!currentChatId) return;
    
    // 1. 动态创建弹窗DOM（如果不存在）
    if (!document.getElementById('mountGroupModal')) {
        const modalHtml = `
        <div id="mountGroupModal" class="custom-modal-overlay" style="z-index: 10005; align-items: flex-end; display: none;">
            <div style="width: 100%; background: #fff; border-radius: 12px 12px 0 0; padding: 20px; box-sizing: border-box; max-height: 70vh; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <span style="font-size: 16px; font-weight: 500;">选择挂载的群聊</span>
                    <span id="closeMountGroupModal" style="color: #999; font-size: 24px; cursor: pointer; padding: 0 10px;">×</span>
                </div>
                <div id="mountGroupList" style="flex: 1; overflow-y: auto; margin-bottom: 15px;"></div>
                <button id="saveMountGroupBtn" style="width: 100%; padding: 12px; background: #07C160; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">保存</button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 绑定关闭事件
        document.getElementById('closeMountGroupModal').onclick = () => {
            document.getElementById('mountGroupModal').style.display = 'none';
        };
        document.getElementById('mountGroupModal').onclick = (e) => {
            if (e.target.id === 'mountGroupModal') e.target.style.display = 'none';
        };
    }

    // 2. 获取数据
    const contacts = await getData('customContacts') || [];
    const groups = contacts.filter(c => c.isGroup);
    const mountedGroups = (await getData('mountedGroupIds_' + currentChatId)) || [];

    // 3. 渲染列表
    const listDiv = document.getElementById('mountGroupList');
    if (groups.length === 0) {
        listDiv.innerHTML = '<div style="text-align:center; color:#999; padding:20px;">暂无群聊</div>';
    } else {
        listDiv.innerHTML = groups.map(g => {
            const isChecked = mountedGroups.includes(g.id) ? 'checked' : '';
            return `
            <label style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer;">
                <input type="checkbox" class="mount-group-cb" value="${g.id}" ${isChecked} style="margin-right: 12px; width: 18px; height: 18px; accent-color: #07C160;">
                <div style="flex: 1; font-size: 16px;">${g.nickname}</div>
            </label>`;
        }).join('');
    }

    // 4. 显示弹窗并绑定保存事件
    document.getElementById('mountGroupModal').style.display = 'flex';
    
    document.getElementById('saveMountGroupBtn').onclick = async () => {
        const cbs = document.querySelectorAll('.mount-group-cb:checked');
        const selectedIds = Array.from(cbs).map(cb => cb.value); // 保持字符串
        
        await saveData('mountedGroupIds_' + currentChatId, selectedIds);
        
        const countSpan = document.getElementById('mountedGroupCount');
        if (countSpan) countSpan.textContent = selectedIds.length + '个';
        
        document.getElementById('mountGroupModal').style.display = 'none';
        customAlert(`已挂载 ${selectedIds.length} 个群聊`);
    };
};

// ★★★ 小鱼新增：朋友圈帖子长按菜单逻辑 ★★★

// 绑定长按事件（在渲染完帖子后调用）
function bindMomentLongPress() {
    document.querySelectorAll('.moment-post-card').forEach(card => {
        let pressTimer = null;
        let moved = false;

        card.addEventListener('touchstart', (e) => {
            // ★★★ 核心修复：如果手指按在评论区或点赞区，直接忽略，不触发帖子的长按菜单
            if (e.target.closest('.moment-like-comment-area')) return;

            moved = false;
            pressTimer = setTimeout(() => {
                if (!moved) {
                    if (navigator.vibrate) navigator.vibrate(50);
                    const postId = card.dataset.postId;
                    showMomentEditMenu(postId, e.touches[0].clientX, e.touches[0].clientY);
                }
            }, 600);
        }, { passive: true });

        card.addEventListener('touchmove', () => {
            moved = true;
            clearTimeout(pressTimer);
        }, { passive: true });

        card.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        }, { passive: true });
    });
}

// 显示删除/编辑菜单
function showMomentEditMenu(postId, touchX, touchY) {
    // 移除已有菜单
    const existing = document.getElementById('momentEditMenu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.id = 'momentEditMenu';
    menu.style.cssText = `
        position: fixed;
        background: #4C5154;
        border-radius: 6px;
        color: white;
        font-size: 15px;
        overflow: hidden;
        z-index: 99999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        min-width: 120px;
    `;

    menu.innerHTML = `
        <div id="momentEditBtn" style="padding: 13px 22px; display: flex; align-items: center; cursor: pointer; border-bottom: 1px solid #3B3F42;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="margin-right: 8px; flex-shrink:0;">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            编辑
        </div>
        <div id="momentDeleteBtn" style="padding: 13px 22px; display: flex; align-items: center; cursor: pointer; color: #FF6B6B;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" stroke-width="2" style="margin-right: 8px; flex-shrink:0;">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            删除
        </div>
    `;

    document.body.appendChild(menu);

    // 计算位置，防止超出屏幕
    const menuW = menu.offsetWidth;
    const menuH = menu.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = touchX - menuW / 2;
    let top = touchY - menuH - 10;

    if (left < 8) left = 8;
    if (left + menuW > vw - 8) left = vw - menuW - 8;
    if (top < 8) top = touchY + 10;

    menu.style.left = left + 'px';
    menu.style.top = top + 'px';

    // 编辑按钮
    document.getElementById('momentEditBtn').onclick = async (e) => {
        e.stopPropagation();
        menu.remove();
        await editMomentPost(postId);
    };

    // 删除按钮
    document.getElementById('momentDeleteBtn').onclick = async (e) => {
        e.stopPropagation();
        menu.remove();
        await deleteMomentPost(postId);
    };
}

// 删除帖子
async function deleteMomentPost(postId) {
    if (!await customConfirm('确定要删除这条朋友圈吗？')) return;

    // 1. 先找到要删除的帖子
    let posts = await getData('moments_posts') || [];
    const targetPost = posts.find(p => String(p.id) === String(postId));
    
    // 2. 从朋友圈列表中删除
    posts = posts.filter(p => String(p.id) !== String(postId));
    await saveData('moments_posts', posts);

    // 3. ★★★ 核心修复：遍历所有角色（含群聊），清除任何匹配该帖子的隐藏消息
    if (targetPost) {
        const contacts = await getData('customContacts') || [];
        // ★ 不再只过滤单人，群聊记录里也可能有残留，全部扫一遍
        for (const contact of contacts) {
            const chatKey = 'chat_messages_' + contact.id;
            let chatMsgs = await getData(chatKey) || [];
            const beforeCount = chatMsgs.length;
            
            chatMsgs = chatMsgs.filter(m => {
                // ★ 同时用 momentId 和 timestamp 两种方式匹配，确保无论哪种格式写入的都能清除
                if (!m.isHidden) return true; // 非隐藏消息一律保留
                
                // 方式1：通过 momentId 字段精准匹配（新格式，同组分发时写入）
                if (m.momentId && String(m.momentId) === String(targetPost.id)) {
                    return false;
                }
                // 方式2：通过 timestamp 匹配（旧格式，用户发帖时写入的时间戳 === 帖子id）
                if (m.type === 'moment_hidden' && String(m.timestamp) === String(targetPost.id)) {
                    return false;
                }
                // 方式3：timestamp 错开了1ms以上的同组分发消息（timestamp = momentId + offset）
                if (m.type === 'moment_hidden' && m.timestamp >= targetPost.id && m.timestamp <= targetPost.id + 100) {
                    return false;
                }
                
                return true;
            });
            
            if (chatMsgs.length !== beforeCount) {
                await saveData(chatKey, chatMsgs);
                console.log(`🗑️ 已清除角色 ${contact.nickname} 聊天记录中关于帖子 ${targetPost.id} 的隐藏消息`);
            }
        }
    }

    // 4. 直接移除DOM，无需整页刷新
    const card = document.querySelector(`[data-post-id="${postId}"]`);
    if (card) {
        card.style.transition = 'opacity 0.2s';
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 200);
    }
}

// 编辑帖子（专属大文本框弹窗）
async function editMomentPost(postId) {
    let posts = await getData('moments_posts') || [];
    const post = posts.find(p => String(p.id) === String(postId));
    if (!post) return;

    const newContent = await momentEditPrompt(post.content);
    if (newContent === null) return;
    if (newContent.trim() === '') {
        customAlert('内容不能为空');
        return;
    }

    post.content = newContent.trim();
    await saveData('moments_posts', posts);

    const card = document.querySelector(`[data-post-id="${postId}"]`);
    if (card) {
        const contentEl = card.querySelectorAll('div[style*="color: #333333"]')[0];
        if (contentEl) contentEl.textContent = newContent.trim();
    }
}

// 朋友圈专属编辑弹窗
function momentEditPrompt(defaultValue = '') {
    return new Promise((resolve) => {
        // 移除旧弹窗（防止重复）
        const old = document.getElementById('momentEditPromptOverlay');
        if (old) old.remove();

        const overlay = document.createElement('div');
        overlay.id = 'momentEditPromptOverlay';
        overlay.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
        `;

        overlay.innerHTML = `
            <div style="
                background: #fff;
                border-radius: 12px;
                width: 100%;
                max-width: 420px;
                overflow: hidden;
                box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            ">
                <!-- 标题栏 -->
                <div style="
                    padding: 14px 16px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #333;
                    border-bottom: 1px solid #F0F0F0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                ">
                    <span>编辑朋友圈</span>
                    <span id="momentEditCharCount" style="font-size: 12px; color: #999; font-weight: 400;">0 字</span>
                </div>

                <!-- 文本输入区 -->
                <div style="padding: 12px 16px;">
                    <textarea id="momentEditTextarea" style="
                        width: 100%;
                        height: 180px;
                        border: 1px solid #E8E8E8;
                        border-radius: 8px;
                        padding: 12px;
                        font-size: 15px;
                        line-height: 1.6;
                        color: #333;
                        resize: none;
                        box-sizing: border-box;
                        outline: none;
                        font-family: inherit;
                        background: #FAFAFA;
                    ">${defaultValue}</textarea>
                </div>

                <!-- 底部按钮 -->
                <div style="
                    display: flex;
                    border-top: 1px solid #F0F0F0;
                ">
                    <div id="momentEditCancelBtn" style="
                        flex: 1;
                        padding: 14px;
                        text-align: center;
                        font-size: 16px;
                        color: #999;
                        cursor: pointer;
                        border-right: 1px solid #F0F0F0;
                    ">取消</div>
                    <div id="momentEditSaveBtn" style="
                        flex: 1;
                        padding: 14px;
                        text-align: center;
                        font-size: 16px;
                        color: #07C160;
                        font-weight: 600;
                        cursor: pointer;
                    ">保存</div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const textarea = document.getElementById('momentEditTextarea');
        const charCount = document.getElementById('momentEditCharCount');

        // 初始化字数
        charCount.textContent = textarea.value.length + ' 字';

        // 实时更新字数
        textarea.addEventListener('input', () => {
            charCount.textContent = textarea.value.length + ' 字';
        });

        // 自动聚焦并将光标移到末尾
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }, 100);

        // 取消
        document.getElementById('momentEditCancelBtn').onclick = () => {
            overlay.remove();
            resolve(null);
        };

        // 保存
        document.getElementById('momentEditSaveBtn').onclick = () => {
            const val = textarea.value;
            overlay.remove();
            resolve(val);
        };

        // 点击遮罩关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(null);
            }
        });
    });
}

// 绑定评论长按删除事件
// 绑定评论长按删除事件
function bindCommentLongPress() {
    // 先克隆替换所有评论元素，彻底清除旧的事件监听器
    document.querySelectorAll('.moment-comment-item').forEach(function(item) {
        const clone = item.cloneNode(true);
        item.parentNode.replaceChild(clone, item);
    });

    // 给所有评论绑定长按事件（你是朋友圈主人，可以删任何人的评论）
    document.querySelectorAll('.moment-comment-item').forEach(function(item) {
        let pressTimer = null;
        let moved = false;

        item.addEventListener('touchstart', function(e) {
            // ★ 核心修复：阻止事件冒泡给帖子卡片
            e.stopPropagation(); 
            
            moved = false;
            pressTimer = setTimeout(function() {
                if (!moved) {
                    if (navigator.vibrate) navigator.vibrate(50);
                    const postId = item.dataset.postId;
                    const commentId = item.dataset.commentId;
                    const content = item.dataset.commentContent || '';
                    const preview = content.length > 15 ? content.substring(0, 15) + '…' : content;
                    
                    customConfirm('确认要删除"' + preview + '"吗？').then(function(confirmed) {
                        if (confirmed) deleteMomentComment(postId, commentId);
                    });
                }
            }, 600);
        }, { passive: false }); // ★ 核心修复：把 passive 改为 false，确保 stopPropagation 生效

        item.addEventListener('touchmove', function() {
            moved = true;
            clearTimeout(pressTimer);
        }, { passive: true });

        item.addEventListener('touchend', function() {
            clearTimeout(pressTimer);
        }, { passive: true });
        
        item.addEventListener('touchcancel', function() {
            clearTimeout(pressTimer);
        }, { passive: true });
    });
}

// 删除评论
function deleteMomentComment(postId, commentId) {
    getData('moments_posts').then(function(postsData) {
        const posts = postsData || [];
        const postIndex = posts.findIndex(function(p) {
            return String(p.id) === String(postId);
        });
        if (postIndex === -1) return;

        const post = posts[postIndex];
        post.comments = (post.comments || []).filter(function(c) {
            return String(c.id) !== String(commentId);
        });

        saveData('moments_posts', posts).then(function() {
            renderMomentsFeed().then(function() {
                requestAnimationFrame(function() {
                    requestAnimationFrame(function() {
                        bindCommentLongPress();
                    });
                });
            });
        });
    });
}

// 全局点击监听：点击其他区域关闭长按菜单
document.addEventListener('click', function(e) {
    const menu = document.getElementById('momentEditMenu');
    if (menu && !menu.contains(e.target)) menu.remove();
});

// ★★★ 小鱼新增：朋友圈点赞/评论弹窗逻辑（挂载body版，彻底解决遮挡）★★★
// ★ 核心修复：改回普通函数，内部用 .then() 处理异步，解决onclick无反应问题
window.toggleMomentAction = function(postId, event) {
    event.stopPropagation();

    // 先移除已有的全局弹窗
    const existing = document.getElementById('globalMomentActionMenu');
    if (existing) {
        if (existing.dataset.postId === String(postId)) {
            existing.remove();
            return;
        }
        existing.remove();
    }

    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();

    // 先同步创建菜单（不等待异步），再异步更新点赞状态
    const menu = document.createElement('div');
    menu.id = 'globalMomentActionMenu';
    menu.dataset.postId = String(postId);
    menu.style.cssText = `
        position: fixed;
        background: #4C5154;
        border-radius: 4px;
        color: white;
        font-size: 14px;
        overflow: hidden;
        white-space: nowrap;
        z-index: 99999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
    `;

    // 先用默认状态渲染（未点赞）
    menu.innerHTML = `
        <div id="momentLikeBtnInner" style="padding: 10px 18px; display: flex; align-items: center; cursor: pointer; border-right: 1px solid #5a5e61;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="margin-right: 6px; flex-shrink:0;">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span id="momentLikeBtnText">赞</span>
        </div>
        <div id="momentCommentBtnInner" style="padding: 10px 18px; display: flex; align-items: center; cursor: pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="margin-right: 6px; flex-shrink:0;">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            评论
        </div>
    `;

    document.body.appendChild(menu);

    // 定位菜单
    const menuW = menu.offsetWidth;
    const menuH = menu.offsetHeight;
    const vw = window.innerWidth;

    let left = rect.right - menuW;
    let top = rect.top - menuH - 6;

    if (left < 8) left = 8;
    if (left + menuW > vw - 8) left = vw - menuW - 8;
    if (top < 8) top = rect.bottom + 6;

    menu.style.left = left + 'px';
    menu.style.top = top + 'px';

    // 异步检查点赞状态，更新按钮文字
    Promise.all([getData('userName'), getData('moments_posts')]).then(([userName, posts]) => {
        const currentUserName = userName || '用户';
        const post = (posts || []).find(p => String(p.id) === String(postId));
        const hasLiked = post && post.likes && post.likes.includes(currentUserName);
        const likeTextEl = document.getElementById('momentLikeBtnText');
        if (likeTextEl) {
            likeTextEl.textContent = hasLiked ? '取消赞' : '赞';
        }
    });

    // 绑定点赞按钮
    document.getElementById('momentLikeBtnInner').onclick = function(e) {
        e.stopPropagation();
        menu.remove();
        toggleMomentLike(postId);
    };

    // 绑定评论按钮
    document.getElementById('momentCommentBtnInner').onclick = function(e) {
        e.stopPropagation();
        menu.remove();
        openMomentCommentBar(postId);
    };
};

// ★★★ 点赞/取消点赞功能 ★★★
function toggleMomentLike(postId) {
    getData('userName').then(function(userName) {
        const currentUserName = userName || '用户';
        getData('moments_posts').then(function(postsData) {
            const posts = postsData || [];
            const postIndex = posts.findIndex(p => String(p.id) === String(postId));
            if (postIndex === -1) return;

            const post = posts[postIndex];
            post.likes = post.likes || [];

            const userLikedIndex = post.likes.indexOf(currentUserName);
            if (userLikedIndex !== -1) {
                post.likes.splice(userLikedIndex, 1); // 取消点赞
            } else {
                post.likes.push(currentUserName); // 点赞
            }

            saveData('moments_posts', posts).then(function() {
                // ★★★ 小鱼核心修复：刷新后立即重新绑定评论长按事件 ★★★
                renderMomentsFeed().then(function() {
                    // 用双重 requestAnimationFrame 确保 DOM 完全渲染完成后再绑定
                    requestAnimationFrame(function() {
                        requestAnimationFrame(function() {
                            bindCommentLongPress();
                        });
                    });
                });
            });
        });
    });
}

// ★★★ 底部评论输入栏（仿微信样式）★★★
// ★★★ 朋友圈评论回复状态 ★★★
let currentMomentReplyTarget = null;

// 点击某条评论 -> 进入“回复某人”模式
window.openReplyToMomentComment = async function(postId, commentId, authorName, event) {
    if (event) event.stopPropagation();

    const currentUserName = await getData('userName') || '用户';

    // 自己的评论不进入回复模式
    if (authorName === currentUserName) return;

    openMomentCommentBar(postId, {
        commentId: commentId,
        authorName: authorName
    });
};

// ★★★ 底部评论输入栏（支持普通评论 / 回复评论）★★★
function openMomentCommentBar(postId, replyTarget = null) {
    currentMomentReplyTarget = replyTarget;

    const old = document.getElementById('momentCommentBar');
    if (old) old.remove();

    const bar = document.createElement('div');
    bar.id = 'momentCommentBar';
    bar.style.cssText = `
        position: fixed;
        bottom: 0; left: 0; width: 100%;
        background: #F7F7F7;
        border-top: 1px solid #E0E0E0;
        display: flex;
        align-items: center;
        padding: 8px 12px;
        box-sizing: border-box;
        z-index: 99999;
        gap: 10px;
    `;

    const placeholderText = replyTarget ? `回复 ${replyTarget.authorName}` : '评论';

    bar.innerHTML = `
        <input id="momentCommentInput" type="text" placeholder="${placeholderText}"
            style="flex: 1; background: #FFFFFF; border: none; border-radius: 4px;
                   padding: 8px 12px; font-size: 15px; outline: none; color: #333;">
        <div id="momentCommentEmojiBtn" style="width: 28px; height: 28px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#333">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
        </div>
        <div id="momentCommentSendBtn" style="
            background: #07C160; color: white; font-size: 14px; font-weight: 600;
            padding: 7px 16px; border-radius: 4px; cursor: pointer; flex-shrink: 0;
            opacity: 0.5; pointer-events: none;">
            发送
        </div>
    `;

    document.body.appendChild(bar);

    const input = document.getElementById('momentCommentInput');
    const sendBtn = document.getElementById('momentCommentSendBtn');

    input.addEventListener('input', function() {
        if (input.value.trim().length > 0) {
            sendBtn.style.opacity = '1';
            sendBtn.style.pointerEvents = 'auto';
        } else {
            sendBtn.style.opacity = '0.5';
            sendBtn.style.pointerEvents = 'none';
        }
    });

    setTimeout(function() { input.focus(); }, 100);

    sendBtn.onclick = async function() {
        const content = input.value.trim();
        if (!content) return;

        const currentUserName = await getData('userName') || '用户';
        const currentUserAvatar = await getData('avatar') || 'https://iili.io/fkc3RwJ.jpg';

        let posts = await getData('moments_posts') || [];
        const postIndex = posts.findIndex(function(p) {
            return String(p.id) === String(postId);
        });
        if (postIndex === -1) return;

        const post = posts[postIndex];
        post.comments = post.comments || [];

        const newComment = {
            id: Date.now(),
            authorName: currentUserName,
            authorAvatar: currentUserAvatar,
            content: content,
            timestamp: Date.now()
        };

        // 如果当前是“回复某人”状态，就记录被回复对象
        if (replyTarget && replyTarget.authorName) {
            newComment.replyToAuthorName = replyTarget.authorName;
        }

        post.comments.push(newComment);
        await saveData('moments_posts', posts);

        // 先关输入栏
        bar.remove();
        document.removeEventListener('click', closeBarHandler);

        // 先刷新评论区，立即看到“我 回复 某人：xxx”
        await renderMomentsFeed();

        // 如果回复对象是角色，那么继续触发该角色AI回复
        if (replyTarget && replyTarget.authorName && replyTarget.authorName !== currentUserName) {
            await triggerAiReplyToMomentComment(postId, replyTarget.authorName, content);
        }
    };

    function closeBarHandler(e) {
        if (!bar.contains(e.target)) {
            bar.remove();
            document.removeEventListener('click', closeBarHandler);
        }
    }

    setTimeout(function() {
        document.addEventListener('click', closeBarHandler);
    }, 300);
}

// ★★★ 用户回复角色评论后，触发该角色AI继续评论 ★★★
async function triggerAiReplyToMomentComment(postId, targetAuthorName, userReplyContent) {
    try {
        let posts = await getData('moments_posts') || [];
        const postIndex = posts.findIndex(p => String(p.id) === String(postId));
        if (postIndex === -1) return;

        const post = posts[postIndex];
        const contacts = await getData('customContacts') || [];

        // 按“评论显示名”找回对应角色
        const role = contacts.find(c =>
            !c.isGroup &&
            (c.nickname === targetAuthorName || c.realName === targetAuthorName)
        );

        if (!role) {
            console.warn('未找到要回复评论的角色:', targetAuthorName);
            return;
        }

        const roleDetail = await getContactDetails(role.id) || role;
        const currentUserName = await getData('userName') || '用户';

        const imageInfo = (post.images && post.images.length > 0)
            ? `这条朋友圈附带了 ${post.images.length} 张图片。`
            : '这条朋友圈没有图片。';

        const commentsText = (post.comments || []).map(c => {
            const replyPart = c.replyToAuthorName ? ` 回复 ${c.replyToAuthorName}` : '';
            return `${c.authorName}${replyPart}: ${c.content}`;
        }).join('\n') || '暂无评论';

        const prompt = `
你现在正在扮演微信角色「${roleDetail.realName || roleDetail.nickname}」。

【角色人设】
${roleDetail.persona || '无特殊设定'}

【当前场景】
你正在微信朋友圈的评论区里，与用户互动。
你之前已经在这条朋友圈下面评论过，现在用户专门回复了你，你需要继续以该角色身份进行评论回复。

【朋友圈发布者】
${post.authorName}

【朋友圈正文】
${post.content || '（无文字内容）'}

【图片信息】
${imageInfo}

【当前评论区全部内容】
${commentsText}

【用户刚刚回复你的内容】
${currentUserName} 回复 ${targetAuthorName}: ${userReplyContent}

【回复要求】
1. 你必须继续以「${roleDetail.realName || roleDetail.nickname}」的人设说话。
2. 回复要像真实朋友圈评论，自然、简短、生活化。
3. 根据情绪和内容，你可以回复 1 到 3 条评论（比如第一条先感叹，第二条再补充）。
4. 必须严格输出一个 JSON 数组，数组里包含你的评论字符串。
5. 绝对不要输出 Markdown 代码块，只输出纯 JSON 数组。

示例格式：
["哈哈哈哈确实", "下次带我一个！"]
或
["太棒了吧！"]
`;

        // ★ 小鱼新增：将图片转化为多模态格式传给 AI
        let userContent = [];
        userContent.push({ type: 'text', text: prompt });
        
        if (post.images && post.images.length > 0) {
            // 限制最多传前 4 张图片，防止请求体过大导致超时
            const imgsToPass = post.images.slice(0, 4);
            imgsToPass.forEach(imgBase64 => {
                userContent.push({
                    type: 'image_url',
                    image_url: { url: imgBase64 }
                });
            });
        }

        const apiConfig = await getApiConfigForWechat('wechat');
        let aiText = await callAIAPI([
            { role: 'system', content: '你是一个朋友圈评论回复助手，只输出JSON数组。' },
            { role: 'user', content: userContent }
        ], apiConfig);

        aiText = String(aiText || '').replace(/```json/g, '').replace(/```/g, '').trim();
        if (!aiText) return;

        let replies = [];
        try {
            replies = JSON.parse(aiText);
            if (!Array.isArray(replies)) {
                replies = [String(replies)];
            }
        } catch (e) {
            // 解析失败的降级处理：尝试按换行符分割，并去除残余的引号和括号
            replies = aiText.split('\n')
                .map(l => l.trim().replace(/^["'\[\]]+|["'\[\]]+$/g, '').replace(/,$/, ''))
                .filter(l => l.length > 0);
        }

        if (replies.length === 0) return;

        // 重新读取最新数据，防止并发覆盖
        posts = await getData('moments_posts') || [];
        const latestPostIndex = posts.findIndex(p => String(p.id) === String(postId));
        if (latestPostIndex === -1) return;

        posts[latestPostIndex].comments = posts[latestPostIndex].comments || [];
        
        // ★ 核心修改：利用循环，把 AI 生成的多条评论一条条插入数据库
        for (let i = 0; i < replies.length; i++) {
            const replyText = replies[i];
            if (!replyText) continue;

            const newComment = {
                id: Date.now() + i, // 确保多条评论ID不同
                authorName: roleDetail.nickname || roleDetail.realName || targetAuthorName,
                authorAvatar: roleDetail.avatar || 'https://iili.io/fkc3RwJ.jpg',
                replyToAuthorName: currentUserName,
                content: replyText,
                timestamp: Date.now() + i
            };

            posts[latestPostIndex].comments.push(newComment);

            // AI在评论区回复你时，多条评论也分别写入未读消息池
            await addMomentUnreadMsg({
                type: 'comment',
                postId: postId,
                authorName: newComment.authorName,
                authorAvatar: newComment.authorAvatar,
                content: newComment.content,
                timestamp: newComment.timestamp
            });
        }

        await saveData('moments_posts', posts);

        // 如果当前正在朋友圈页，立即刷新显示
        if (document.getElementById('momentsPage').style.display !== 'none') {
            await renderMomentsFeed();
        }

    } catch (error) {
        console.error('朋友圈评论AI回复失败:', error);
    }
}

// 全局点击监听：点击其他区域自动关闭菜单
document.addEventListener('click', function(e) {
    const menu = document.getElementById('globalMomentActionMenu');
    if (menu && !menu.contains(e.target)) {
        menu.remove();
    }
});

/* ========================================
   小鱼新增：朋友圈动态可见性修改 & AI群聊式互动
   ======================================== */

let editingMomentPostId = null;
let currentVisibilityMode = 'post'; // 标记当前是发帖(post)还是修改(edit)

// 1. 打开修改可见范围弹窗 (直接复用原生函数，绝对不报错)
window.openEditMomentVisibility = async function(postId, event) {
    event.stopPropagation();
    editingMomentPostId = postId;
    currentVisibilityMode = 'edit'; // 切换为修改模式

    let posts = await getData('moments_posts') || [];
    const post = posts.find(p => String(p.id) === String(postId));
    if (!post) return;

    // ★★★ 核心修复：读取历史数据时，强制把所有ID映射为字符串 ★★★
    momentVisibilityIds = post.visibilityIds ? post.visibilityIds.map(String) : [];
    momentIsPublic = momentVisibilityIds.length === 0;

    // ★★★ 核心修复：把弹窗移动到最外层 body，防止它被隐藏的父页面(发帖页)遮蔽 ★★★
    const overlay = document.getElementById('momentVisibilityOverlay');
    if (overlay && overlay.parentNode !== document.body) {
        document.body.appendChild(overlay); // 强制搬家到最外层
    }
    if (overlay) {
        overlay.style.zIndex = '100000'; // 确保显示在最顶层
    }

    // 直接调用原生的打开函数，它会根据全局变量完美渲染勾选状态和半屏弹窗
    await window.openMomentVisibilityPicker();
};

// 2. 触发 AI 朋友圈群聊式互动 (修复版：触发顶部提示条)
window.triggerAiGroupComments = async function(postId, event) {
    event.stopPropagation();
    const btn = event.currentTarget;

    // 视觉反馈：半透明并禁用点击，防止重复触发
    btn.style.opacity = '0.3';
    btn.style.pointerEvents = 'none';

    try {
        let posts = await getData('moments_posts') || [];
        const post = posts.find(p => String(p.id) === String(postId));
        if (!post) throw new Error("找不到该帖子");

        // 1. 获取能看到这条帖子的角色池
        const contacts = await getData('customContacts') || [];
        const singleContacts = contacts.filter(c => !c.isGroup);
        
        let visibleContacts = [];
        if (!post.visibilityIds || post.visibilityIds.length === 0) {
            visibleContacts = singleContacts; // 公开，所有人可见
        } else {
            visibleContacts = singleContacts.filter(c => post.visibilityIds.map(String).includes(String(c.id)));
        }

        if (visibleContacts.length === 0) {
            customAlert('该帖子没有可见的角色，无法生成互动');
            return;
        }

        // 2. 随机抽取 1 到 3 个角色参与本次互动
        const pickCount = Math.min(visibleContacts.length, Math.floor(Math.random() * 3) + 1);
        const shuffled = visibleContacts.sort(() => 0.5 - Math.random());
        const selectedChars = shuffled.slice(0, pickCount);

        // 构建角色人设描述
        const charDescriptions = selectedChars.map(c => 
            `- ${c.nickname} (真名: ${c.realName || c.nickname}): ${c.persona || '无特殊设定'}`
        ).join('\n');

        // 3. 构建当前帖子和评论区上下文
        const imageInfo = (post.images && post.images.length > 0) ? `附带了 ${post.images.length} 张图片。` : '无图片。';
        const commentsText = (post.comments || []).map(c => 
            `${c.authorName}${c.replyToAuthorName ? ' 回复 '+c.replyToAuthorName : ''}: ${c.content}`
        ).join('\n') || '暂无评论';
        const likesText = (post.likes || []).join('、') || '暂无点赞';

        // 4. 组装 Prompt
        const prompt = `
你现在是微信朋友圈的后台AI，负责模拟角色的自然互动。
当前有一条朋友圈：
发布者：${post.authorName}
内容：${post.content || '（无文字内容）'}
图片：${imageInfo}
当前点赞：${likesText}
当前评论：\n${commentsText}

你可以操控以下 ${pickCount} 个角色进行互动：
${charDescriptions}

任务：
请根据这些人设和当前朋友圈的氛围，随机生成 2 到 4 个互动动作（点赞或评论）。
角色之间可以互相回复，也可以单独回复发布者。

输出格式必须是严格的 JSON 数组：
[
  {"action": "like", "authorName": "角色名"},
  {"action": "comment", "authorName": "角色名", "content": "评论内容", "replyTo": "被回复人名字(可选，不回复特定人则留空)"}
]
注意：
1. authorName 必须是上面提供的角色昵称或真名。
2. 评论要符合朋友圈的简短、生活化风格。
3. 绝对不要输出 Markdown 代码块，只输出纯 JSON 数组。
`;

        // ★ 小鱼新增：将图片转化为多模态格式传给 AI
let userContent = [];
userContent.push({ type: 'text', text: prompt });

if (post.images && post.images.length > 0) {
    // 限制最多传前 4 张图片，防止请求体过大导致超时
    const imgsToPass = post.images.slice(0, 4);
    imgsToPass.forEach(imgBase64 => {
        userContent.push({
            type: 'image_url',
            image_url: { url: imgBase64 }
        });
    });
}

const apiConfig = await getApiConfigForWechat('wechat');
let aiText = await callAIAPI([
    { role: 'system', content: '你是一个朋友圈评论回复助手，只能输出一条简短自然的中文评论。' },
    { role: 'user', content: userContent }
], apiConfig);

        // 5. 解析并应用动作
        aiText = String(aiText || '').replace(/```json/g, '').replace(/```/g, '').trim();
        const actions = JSON.parse(aiText);

        let updated = false;
        post.comments = post.comments || [];
        post.likes = post.likes || [];

        for (const act of actions) {
            const char = selectedChars.find(c => c.nickname === act.authorName || c.realName === act.authorName);
            if (!char) continue;

            if (act.action === 'like') {
                if (!post.likes.includes(char.nickname)) {
                    post.likes.push(char.nickname);
                    updated = true;
                    
                    // ★★★ 核心修复：把点赞写入未读消息池 ★★★
                    if (typeof addMomentUnreadMsg === 'function') {
                        await addMomentUnreadMsg({
                            type: 'like',
                            postId: postId,
                            authorName: char.nickname,
                            authorAvatar: char.avatar || 'https://iili.io/fkc3RwJ.jpg',
                            timestamp: Date.now()
                        });
                    }
                }
            } else if (act.action === 'comment' && act.content) {
                post.comments.push({
                    id: Date.now() + Math.random(),
                    authorName: char.nickname,
                    authorAvatar: char.avatar || 'https://iili.io/fkc3RwJ.jpg',
                    content: act.content,
                    replyToAuthorName: act.replyTo || null,
                    timestamp: Date.now()
                });
                updated = true;
                
                // ★★★ 核心修复：把评论写入未读消息池 ★★★
                if (typeof addMomentUnreadMsg === 'function') {
                    await addMomentUnreadMsg({
                        type: 'comment',
                        postId: postId,
                        authorName: char.nickname,
                        authorAvatar: char.avatar || 'https://iili.io/fkc3RwJ.jpg',
                        content: act.content,
                        timestamp: Date.now()
                    });
                }
            }
        }

        // 6. 保存并刷新
        if (updated) {
            await saveData('moments_posts', posts);
            await renderMomentsFeed();
        } else {
            customAlert('AI 觉得没什么好说的，没有生成新互动');
        }

    } catch (error) {
        console.error('AI批量评论失败:', error);
        customAlert('生成失败，请检查网络或API配置');
    } finally {
        // 恢复按钮状态
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
    }
};

/* ========================================
   小鱼新增：标签分组管理系统 (UI + 逻辑)
   ======================================== */

// 1. 动态注入标签管理页面的 HTML 结构
const tagsHtml = `
<!-- 标签分组列表页 -->
<div class="fullscreen-page" id="tagsManagePage" style="background: #EDEDED; z-index: 400;">
  <div class="nav-bar" style="background: #EDEDED; border-bottom: 1px solid rgba(0,0,0,0.1); justify-content: space-between;">
    <svg class="nav-icon" onclick="showPage(mainApp)" style="cursor: pointer;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
    <h1 style="font-size: 17px; font-weight: 600;">所有标签</h1>
    <div style="color: #07C160; font-weight: 500; font-size: 16px; cursor: pointer;" onclick="createNewTagGroup()">新建</div>
  </div>
  <div class="content" style="background: #FFFFFF;" id="tagsListContainer">
    <!-- 动态生成标签列表 -->
  </div>
</div>

<!-- 标签成员选择页 -->
<div class="fullscreen-page" id="tagMemberSelectPage" style="background: #EDEDED; z-index: 401;">
  <div class="nav-bar" style="background: #EDEDED; border-bottom: 1px solid rgba(0,0,0,0.1); justify-content: space-between;">
    <span style="font-size: 16px; color: #333; cursor: pointer;" onclick="document.getElementById('tagMemberSelectPage').style.display='none'">取消</span>
    <h1 style="font-size: 17px; font-weight: 600;">选择联系人</h1>
    <div id="saveTagMembersBtn" class="save-button active">完成</div>
  </div>
  <div class="content" style="background: #FFFFFF;" id="tagMemberContactList"></div>
</div>

<!-- 标签关系网页 -->
<div class="fullscreen-page" id="tagRelationPage" style="background:#F6F6F6; z-index:402;">
  <div class="nav-bar" style="background:#F6F6F6; border-bottom:1px solid rgba(0,0,0,0.08); justify-content:space-between;">
    <svg class="nav-icon" onclick="closeTagRelationPage()" style="cursor:pointer;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
<h1 id="tagRelationTitle" style="font-size:17px; font-weight:600;">关系网</h1>
<div style="display:flex; align-items:center; gap:12px;">
  <div id="tagRelationRefreshBtn" onclick="generateTagRelationGraphByAI()" style="width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#07C160;">
    <svg viewBox="0 0 24 24" style="width:24px; height:24px; fill:none; stroke:currentColor; stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round;">
      <path d="M21 2v6h-6"></path>
      <path d="M3 12a9 9 0 0 1 15.55-6.36L21 8"></path>
      <path d="M3 22v-6h6"></path>
      <path d="M21 12a9 9 0 0 1-15.55 6.36L3 16"></path>
    </svg>
  </div>
</div>
  </div>

  <div class="content" style="padding:12px; box-sizing:border-box; overflow-y:auto;">
    <div style="background:#FFFFFF; border-radius:12px; padding:12px; margin-bottom:12px;">
      <div style="font-size:15px; font-weight:600; margin-bottom:8px;">关系图</div>

      <!-- 外层滚动容器：支持横向 + 纵向滑动 -->
      <div id="tagRelationScrollWrap" style="
        width:100%;
        height:520px;
        overflow:auto;
        -webkit-overflow-scrolling:touch;
        background:#FAFAFA;
        border-radius:10px;
        border:1px solid #F0F0F0;
      ">
        <!-- 真正的大画布：会被JS动态改宽高 -->
        <div id="tagRelationCanvasWrap" style="
          position:relative;
          width:900px;
          height:900px;
          background:#FAFAFA;
        ">
          <svg id="tagRelationSvg" width="900" height="900" style="position:absolute; left:0; top:0;"></svg>
          <div id="tagRelationNodesLayer" style="position:absolute; left:0; top:0; width:900px; height:900px;"></div>
        </div>
      </div>

      <div style="display:flex; gap:14px; margin-top:10px; font-size:12px; color:#666; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:6px;"><span style="width:18px; height:2px; background:#576B95; display:inline-block;"></span>单向关系</div>
        <div style="display:flex; align-items:center; gap:6px;"><span style="width:18px; height:2px; background:#07C160; display:inline-block;"></span>双向关系</div>
        <div style="color:#999;">可上下左右滑动查看完整关系图</div>
      </div>
    </div>

<div style="background:#FFFFFF; border-radius:12px; padding:12px;">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
    <div style="font-size:15px; font-weight:600;">关系说明</div>
    <div onclick="openCreateRelationDialog()" style="padding:6px 12px; background:#07C160; color:#fff; border-radius:999px; font-size:13px; cursor:pointer;">
      新建关系
    </div>
  </div>
  <div id="tagRelationTextList" style="font-size:14px; color:#333; line-height:1.7;">
    暂无关系数据，请点击右上角“AI生成”
  </div>
</div>
  </div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', tagsHtml);

// 小鱼新增：关系编辑操作菜单
const relationEditorHtml = `
<div id="relationActionSheet" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:10020; align-items:flex-end;">
  <div style="width:100%; background:#F7F7F7; border-radius:14px 14px 0 0; padding:10px 12px 20px; box-sizing:border-box;">
    <div id="editRelationBtn" style="background:#fff; height:52px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; color:#333; margin-bottom:8px; cursor:pointer;">编辑关系</div>
    <div id="deleteRelationBtn" style="background:#fff; height:52px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; color:#FA5151; margin-bottom:10px; cursor:pointer;">删除关系</div>
    <div id="cancelRelationActionBtn" style="background:#fff; height:52px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; color:#333; cursor:pointer;">取消</div>
  </div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', relationEditorHtml);

// 小鱼新增：关系方向选择弹窗
const relationCreateModalHtml = `
<div id="relationCreateModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:10021; align-items:center; justify-content:center; padding:20px; box-sizing:border-box;">
  <div style="width:100%; max-width:420px; background:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.18);">
    <div style="padding:16px 18px; border-bottom:1px solid #F2F2F2; font-size:17px; font-weight:600; color:#333;">
      新建关系
    </div>

    <div style="padding:16px 18px;">
      <div style="margin-bottom:14px;">
        <div style="font-size:14px; color:#666; margin-bottom:6px;">起点</div>
        <select id="relationFromSelect" style="width:100%; height:42px; border:1px solid #E5E5E5; border-radius:10px; padding:0 12px; font-size:15px; background:#FAFAFA; outline:none;">
        </select>
      </div>

      <div style="margin-bottom:14px;">
        <div style="font-size:14px; color:#666; margin-bottom:6px;">终点</div>
        <select id="relationToSelect" style="width:100%; height:42px; border:1px solid #E5E5E5; border-radius:10px; padding:0 12px; font-size:15px; background:#FAFAFA; outline:none;">
        </select>
      </div>

      <div style="margin-bottom:14px;">
        <div style="font-size:14px; color:#666; margin-bottom:6px;">箭头</div>
        <select id="relationArrowSelect" style="width:100%; height:42px; border:1px solid #E5E5E5; border-radius:10px; padding:0 12px; font-size:15px; background:#FAFAFA; outline:none;">
          <option value="single">单向（A → B）</option>
          <option value="double">双向（A ↔ B）</option>
        </select>
      </div>

      <div style="margin-bottom:4px;">
        <div style="font-size:14px; color:#666; margin-bottom:6px;">关系</div>
        <input id="relationLabelInput" type="text" placeholder="请输入关系，例如：朋友 / 依赖 / 暗恋"
          style="width:100%; height:42px; border:1px solid #E5E5E5; border-radius:10px; padding:0 12px; box-sizing:border-box; font-size:15px; background:#FAFAFA; outline:none;">
      </div>
    </div>

    <div style="display:flex; border-top:1px solid #F2F2F2;">
      <div id="cancelCreateRelationBtn" style="flex:1; height:50px; display:flex; align-items:center; justify-content:center; font-size:16px; color:#666; border-right:1px solid #F2F2F2; cursor:pointer;">
        取消
      </div>
      <div id="confirmCreateRelationBtn" style="flex:1; height:50px; display:flex; align-items:center; justify-content:center; font-size:16px; color:#07C160; font-weight:600; cursor:pointer;">
        确定
      </div>
    </div>
  </div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', relationCreateModalHtml);

// 小鱼新增：弹出关系方向选择器
// 这里整段删除，不需要替换

/* ========================================
   小鱼新增：关系网刷新按钮旋转动画
   ======================================== */
if (!document.getElementById('tagRelationSpinStyle')) {
    const style = document.createElement('style');
    style.id = 'tagRelationSpinStyle';
    style.textContent = `
      @keyframes tagRelationSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      #tagRelationRefreshBtn.spinning svg {
        animation: tagRelationSpin 0.9s linear infinite;
      }
    `;
    document.head.appendChild(style);
}

// 2. 将新页面加入全局管理数组，防止返回键失效
allFullscreenPages.push(
  document.getElementById('tagsManagePage'),
  document.getElementById('tagRelationPage')
);

// 3. 绑定通讯录“标签”按钮点击事件
document.getElementById('tagsGroupBtn').addEventListener('click', async () => {
    await renderTagGroups();
    showPage(document.getElementById('tagsManagePage'));
});

// 4. 渲染标签列表
async function renderTagGroups() {
    const container = document.getElementById('tagsListContainer');
    const groups = await getData('tag_groups') || [];
    
    if (groups.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">暂无标签分组<br><br>将角色加入同一标签后，<br>可生成该组的AI关系网</div>';
        return;
    }

    container.innerHTML = groups.map(g => {
        const count = g.memberIds ? g.memberIds.length : 0;
        return `
        <div style="padding:16px; border-bottom:1px solid #F0F0F0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <div>
                    <div style="font-size:16px; color:#333; margin-bottom:4px;">${g.name}</div>
                    <div style="font-size:13px; color:#999;">${count} 个成员</div>
                </div>
                <span style="color:#FA5151; font-size:14px; cursor:pointer;" onclick="deleteTagGroup('${g.id}', event)">删除</span>
            </div>

            <div style="display:flex; gap:10px;">
                <div onclick="editTagGroup('${g.id}')" style="flex:1; height:36px; border-radius:8px; background:#F5F5F5; display:flex; align-items:center; justify-content:center; font-size:14px; color:#333; cursor:pointer;">
                    编辑成员
                </div>
                <div onclick="openTagRelationPage('${g.id}')" style="flex:1; height:36px; border-radius:8px; background:#E8F7EE; display:flex; align-items:center; justify-content:center; font-size:14px; color:#07C160; cursor:pointer;">
                    关系网
                </div>
            </div>
        </div>`;
    }).join('');
}

// 5. 新建标签分组
window.createNewTagGroup = async function() {
    const name = await customPrompt('请输入新标签的名称：');
    if (name && name.trim()) {
        let groups = await getData('tag_groups') || [];
        groups.push({
            id: 'tag_' + Date.now(),
            name: name.trim(),
            memberIds: []
        });
        await saveData('tag_groups', groups);
        await renderTagGroups();
    }
};

// 6. 删除标签分组
window.deleteTagGroup = async function(id, event) {
    event.stopPropagation(); // 阻止触发编辑
    if (await customConfirm('确定要删除这个标签分组吗？\n(仅删除分组，不会删除角色)')) {
        let groups = await getData('tag_groups') || [];
        groups = groups.filter(g => g.id !== id);
        await saveData('tag_groups', groups);
        await renderTagGroups();
    }
};

// 7. 编辑标签分组成员
let currentEditingTagId = null;
let tempSelectedTagMembers = new Set();

window.editTagGroup = async function(id) {
    currentEditingTagId = id;
    tempSelectedTagMembers.clear();
    
    const groups = await getData('tag_groups') || [];
    const group = groups.find(g => g.id === id);
    if (!group) return;
    
    // ★ 核心修复：统一转为字符串再存入 Set，避免数字/字符串类型不匹配
    (group.memberIds || []).forEach(mid => tempSelectedTagMembers.add(String(mid)));
    
    // 获取所有单人角色（排除群聊）
    const allContacts = await getData('customContacts') || [];
    const singleContacts = allContacts.filter(c => !c.isGroup);
    
    const listContainer = document.getElementById('tagMemberContactList');
    listContainer.innerHTML = singleContacts.map(c => {
        // ★ 核心修复：比较时也统一转为字符串
        const isChecked = tempSelectedTagMembers.has(String(c.id));
        const avatarStyle = c.avatar ? `background-image: url(${c.avatar})` : 'background-color: #ccc';
        return `
        <div class="group-contact-row ${isChecked ? 'selected' : ''}" onclick="toggleTagMember(this, '${String(c.id)}')">
            <div class="group-checkbox"></div>
            <div class="contact-icon" style="${avatarStyle}; background-size: cover; width: 40px; height: 40px; margin-right: 12px; border-radius: 4px;"></div>
            <span class="contact-name">${c.nickname}</span>
        </div>`;
    }).join('');
    
    document.getElementById('tagMemberSelectPage').style.display = 'block';
};

// 8. 切换成员选中状态
window.toggleTagMember = function(element, charId) {
    // ★ 核心修复：操作 Set 时始终用字符串
    const strId = String(charId);
    element.classList.toggle('selected');
    if (tempSelectedTagMembers.has(strId)) {
        tempSelectedTagMembers.delete(strId);
    } else {
        tempSelectedTagMembers.add(strId);
    }
};

// 9. 保存成员修改
document.getElementById('saveTagMembersBtn').addEventListener('click', async () => {
    if (!currentEditingTagId) return;
    
    let groups = await getData('tag_groups') || [];
    const groupIndex = groups.findIndex(g => g.id === currentEditingTagId);
    
    if (groupIndex !== -1) {
        groups[groupIndex].memberIds = Array.from(tempSelectedTagMembers);
        await saveData('tag_groups', groups);
        
        document.getElementById('tagMemberSelectPage').style.display = 'none';
        await renderTagGroups();
        customAlert('成员保存成功！\n同组角色发朋友圈时将互相可见。');
    }
});

/* ========================================
   小鱼新增：标签分组关系网系统
   ======================================== */

let currentRelationTagId = null;
let currentRelationFocusNodeId = null;
let currentEditingRelationIndex = null; // 当前长按操作的关系索引
let relationLongPressTimer = null;

// 1. 打开关系网页
window.openTagRelationPage = async function(tagId) {
    currentRelationTagId = tagId;
    currentRelationFocusNodeId = null; // 每次打开时默认看完整关系网

    const groups = await getData('tag_groups') || [];
    const group = groups.find(g => g.id === tagId);
    if (!group) return;

    document.getElementById('tagRelationTitle').textContent = `${group.name} 的关系网`;

    // ★★★ 核心修复：先显示页面，再渲染 ★★★
    showPage(document.getElementById('tagRelationPage'));

    const allGraphs = await getData('tag_relation_graphs') || {};
    const graphData = allGraphs[tagId];

    if (graphData) {
        // ★★★ 再等一帧，确保DOM真的显示出来，SVG才能正确计算文字尺寸 ★★★
        requestAnimationFrame(async () => {
            await renderTagRelationGraph(graphData, group);
        });
    } else {
        const svg = document.getElementById('tagRelationSvg');
        const nodeLayer = document.getElementById('tagRelationNodesLayer');
        const canvasWrap = document.getElementById('tagRelationCanvasWrap');

        canvasWrap.style.width = '900px';
        canvasWrap.style.height = '900px';
        svg.setAttribute('width', '900');
        svg.setAttribute('height', '900');
        nodeLayer.style.width = '900px';
        nodeLayer.style.height = '900px';

        svg.innerHTML = '';
        nodeLayer.innerHTML = '';
        document.getElementById('tagRelationTextList').innerHTML = '暂无关系数据，请点击右上角“AI生成”';
    }
};

// 2. 关闭关系网页
window.closeTagRelationPage = function() {
    currentRelationFocusNodeId = null;
    showPage(document.getElementById('tagsManagePage'));
};

// 3. AI生成关系网
window.generateTagRelationGraphByAI = async function() {
    if (!currentRelationTagId) return;

    const groups = await getData('tag_groups') || [];
    const group = groups.find(g => g.id === currentRelationTagId);
    if (!group) return;

    const contacts = await getData('customContacts') || [];
    const userName = await getData('userName') || '用户';
    const userPersona = await getData('userPersona') || '未设置';
    const memberIds = group.memberIds || [];

    const members = contacts.filter(c => memberIds.map(String).includes(String(c.id)));
    if (members.length === 0) {
        customAlert('该标签组没有角色，无法生成关系网');
        return;
    }

    const titleEl = document.getElementById('tagRelationTitle');
    const oldTitle = titleEl.textContent;
    const refreshBtn = document.getElementById('tagRelationRefreshBtn');

    titleEl.textContent = 'AI正在生成关系网...';
    if (refreshBtn) refreshBtn.classList.add('spinning');

    try {
        const memberText = members.map(m => {
            return `角色ID:${m.id}
角色名:${m.realName || m.nickname}
显示名:${m.nickname}
人设:${m.persona || '无'}
`;
        }).join('\n-----------------\n');

        const prompt = `
你是一个“角色关系网生成器”。
请根据下面这个标签分组中的所有角色人设，生成一个关系网。

【用户信息】
用户ID:user_self
用户名:${userName}
用户人设:${userPersona}

【标签组名】
${group.name}

【组内角色列表】
${memberText}

【任务要求】
1. 你要同时分析：
   - 角色 与 角色 之间的关系
   - 角色 与 用户 之间的关系
2. 关系可以是：
   - 单向关系：A单方面认为与B是什么关系
   - 双向关系：A和B彼此都认可这个关系
3. 关系标签要简短明确，例如：
   - 朋友
   - 暗恋
   - 敌对
   - 依赖
   - 欣赏
   - 保护
   - 利用
   - 主仆
   - 家人
   - 同伴
   - 竞争对手
   - 师徒
4. 不要胡编得太离谱，要尽量根据人设合理推断。
5. 最多输出 12 条关系，优先保留最重要、最有戏剧性的关系。
6. 必须严格输出 JSON，不要加解释，不要加 markdown 代码块。

【JSON输出格式】
{
  "nodes": [
    {"id":"user_self","name":"${userName}","type":"user"},
    {"id":"角色ID","name":"角色名","type":"character"}
  ],
  "edges": [
    {"from":"A_ID","to":"B_ID","label":"关系名","twoWay":false},
    {"from":"A_ID","to":"B_ID","label":"关系名","twoWay":true}
  ],
  "summary": [
    "一句话总结1",
    "一句话总结2"
  ]
}
`;

        const apiConfig = await getApiConfigForWechat('wechat');
        let response = await callAIAPI([{ role: 'user', content: prompt }], apiConfig);

        let cleanStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = cleanStr.indexOf('{');
        const lastBrace = cleanStr.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanStr = cleanStr.substring(firstBrace, lastBrace + 1);
        }

        const graphData = JSON.parse(cleanStr);

        if (!Array.isArray(graphData.nodes)) graphData.nodes = [];
        if (!Array.isArray(graphData.edges)) graphData.edges = [];
        if (!Array.isArray(graphData.summary)) graphData.summary = [];

        if (!graphData.nodes.find(n => String(n.id) === 'user_self')) {
            graphData.nodes.unshift({
                id: 'user_self',
                name: userName,
                type: 'user'
            });
        }

        const validIds = new Set(['user_self', ...memberIds.map(id => String(id))]);
        graphData.nodes = graphData.nodes.filter(n => validIds.has(String(n.id)));
        graphData.edges = graphData.edges.filter(e => validIds.has(String(e.from)) && validIds.has(String(e.to)));

        const allGraphs = await getData('tag_relation_graphs') || {};
        allGraphs[currentRelationTagId] = graphData;
        await saveData('tag_relation_graphs', allGraphs);

        requestAnimationFrame(async () => {
            await renderTagRelationGraph(graphData, group);
            customAlert('关系网生成成功');
        });

    } catch (error) {
        console.error('关系网生成失败:', error);
        customAlert('关系网生成失败：' + error.message);
    } finally {
        titleEl.textContent = oldTitle;
        if (refreshBtn) refreshBtn.classList.remove('spinning');
    }
};

// 4. 渲染关系图
async function renderTagRelationGraph(graphData, group) {
    const svg = document.getElementById('tagRelationSvg');
    const nodeLayer = document.getElementById('tagRelationNodesLayer');
    const textList = document.getElementById('tagRelationTextList');
    const canvasWrap = document.getElementById('tagRelationCanvasWrap');
    const scrollWrap = document.getElementById('tagRelationScrollWrap');

    svg.innerHTML = '';
    nodeLayer.innerHTML = '';

    const contacts = await getData('customContacts') || [];
    const userAvatar = await getData('avatar') || '';
    const userName = await getData('userName') || '用户';

    let nodes = graphData.nodes || [];
    let edges = graphData.edges || [];

    // =========================
    // 小鱼新增：焦点模式过滤逻辑
    // =========================
    let focusNodeId = currentRelationFocusNodeId;

    if (focusNodeId) {
        // 只保留和当前焦点角色有关的关系
        edges = edges.filter(e => String(e.from) === String(focusNodeId) || String(e.to) === String(focusNodeId));

        const usedNodeIds = new Set([String(focusNodeId)]);
        edges.forEach(e => {
            usedNodeIds.add(String(e.from));
            usedNodeIds.add(String(e.to));
        });

        nodes = nodes.filter(n => usedNodeIds.has(String(n.id)));
    }

    // 节点数量越多，画布越大
    const nodeCount = Math.max(nodes.length, 1);
    const canvasSize = Math.max(900, 260 + nodeCount * 120);
    const width = canvasSize;
    const height = canvasSize;
    const centerX = width / 2;
    const centerY = height / 2;

    canvasWrap.style.width = width + 'px';
    canvasWrap.style.height = height + 'px';
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    nodeLayer.style.width = width + 'px';
    nodeLayer.style.height = height + 'px';

    function getAvatarByNode(node) {
        if (String(node.id) === 'user_self') {
            return userAvatar || '';
        }
        const contact = contacts.find(c => String(c.id) === String(node.id));
        return contact && contact.avatar ? contact.avatar : '';
    }

    const userNode = nodes.find(n => String(n.id) === 'user_self') || {
        id: 'user_self',
        name: userName,
        type: 'user'
    };

    const charNodes = nodes.filter(n => String(n.id) !== 'user_self');

    const positionedNodes = [];

    // =========================
    // 小鱼新增：如果有焦点角色，则该角色放中心
    // =========================
    let centerNode = null;
    if (focusNodeId) {
        centerNode = nodes.find(n => String(n.id) === String(focusNodeId));
    }
    if (!centerNode) {
        centerNode = userNode;
    }

    positionedNodes.push({
        ...centerNode,
        x: centerX,
        y: centerY,
        avatar: getAvatarByNode(centerNode)
    });

    // 其他节点围绕中心节点分布
    const otherNodes = nodes.filter(n => String(n.id) !== String(centerNode.id));

    const rings = [
        { radius: 180, max: 6 },
        { radius: 300, max: 10 },
        { radius: 420, max: 16 }
    ];

    let cursor = 0;
    rings.forEach(ring => {
        const remain = otherNodes.length - cursor;
        if (remain <= 0) return;

        const takeCount = Math.min(remain, ring.max);
        for (let i = 0; i < takeCount; i++) {
            const node = otherNodes[cursor + i];
            const angle = (Math.PI * 2 / takeCount) * i - Math.PI / 2;
            positionedNodes.push({
                ...node,
                x: centerX + ring.radius * Math.cos(angle),
                y: centerY + ring.radius * Math.sin(angle),
                avatar: getAvatarByNode(node)
            });
        }
        cursor += takeCount;
    });

    while (cursor < otherNodes.length) {
        const remain = otherNodes.length - cursor;
        const takeCount = Math.min(remain, 20);
        const dynamicRadius = 540 + (cursor * 8);
        for (let i = 0; i < takeCount; i++) {
            const node = otherNodes[cursor + i];
            const angle = (Math.PI * 2 / takeCount) * i - Math.PI / 2;
            positionedNodes.push({
                ...node,
                x: centerX + dynamicRadius * Math.cos(angle),
                y: centerY + dynamicRadius * Math.sin(angle),
                avatar: getAvatarByNode(node)
            });
        }
        cursor += takeCount;
    }

svg.innerHTML = `
  <defs>
    <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5.2" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L6,3 L0,6 z" fill="#576B95"></path>
    </marker>
    <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="5.2" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L6,3 L0,6 z" fill="#07C160"></path>
    </marker>
  </defs>
`;

    function getNodeById(id) {
        return positionedNodes.find(n => String(n.id) === String(id));
    }

    function getEdgeOffset(edge, index) {
        const key = [String(edge.from), String(edge.to)].sort().join('_');
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash += key.charCodeAt(i);
        }
        const base = ((hash + index * 17) % 5) - 2;
        return base * 28;
    }

    function buildCurvePath(fromNode, toNode, bendAmount) {
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        const nodeRadius = 34;
        const startX = fromNode.x + (dx / len) * nodeRadius;
        const startY = fromNode.y + (dy / len) * nodeRadius;
        const endX = toNode.x - (dx / len) * nodeRadius;
        const endY = toNode.y - (dy / len) * nodeRadius;

        const nx = -dy / len;
        const ny = dx / len;

        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        const controlX = midX + nx * bendAmount;
        const controlY = midY + ny * bendAmount;

        return {
            d: `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`,
            labelX: (startX + 2 * controlX + endX) / 4,
            labelY: (startY + 2 * controlY + endY) / 4
        };
    }

// 单独建立标签层，保证关系文字气泡永远压在线条上面
const labelLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
labelLayer.setAttribute('id', 'tagRelationLabelLayer');
// 小鱼修复：这里先不要 append 到 svg，等所有线条画完后再挂上去

// 画关系曲线
edges.forEach((edge, index) => {
        const fromNode = getNodeById(edge.from);
        const toNode = getNodeById(edge.to);
        if (!fromNode || !toNode) return;

        const color = edge.twoWay ? '#07C160' : '#576B95';
        const markerId = edge.twoWay ? 'arrowGreen' : 'arrowBlue';

        let bend = getEdgeOffset(edge, index);
        if (String(edge.from) === String(centerNode.id) || String(edge.to) === String(centerNode.id)) {
            bend = bend === 0 ? 40 : bend * 1.4;
        }
        if (edge.twoWay && bend === 0) bend = 36;

        const pathInfo = buildCurvePath(fromNode, toNode, bend);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathInfo.d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', edge.twoWay ? '2.1' : '1.7');
        path.setAttribute('stroke-dasharray', edge.twoWay ? '0' : '6 5');
        path.setAttribute('marker-end', `url(#${markerId})`);
        path.setAttribute('opacity', '0.95');
        svg.appendChild(path);

        if (edge.twoWay) {
            const reversePathInfo = buildCurvePath(toNode, fromNode, -bend);
            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttribute('d', reversePathInfo.d);
            path2.setAttribute('fill', 'none');
            path2.setAttribute('stroke', color);
            path2.setAttribute('stroke-width', '2.1');
            path2.setAttribute('marker-end', `url(#${markerId})`);
            path2.setAttribute('opacity', '0.9');
            svg.appendChild(path2);
        }

// 关系标签半透明底板（小鱼修复版：首次渲染也稳定显示）
const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
text.setAttribute('x', pathInfo.labelX);
text.setAttribute('y', pathInfo.labelY);
text.setAttribute('fill', color);
text.setAttribute('font-size', '12');
text.setAttribute('text-anchor', 'middle');
text.setAttribute('font-weight', '600');
text.setAttribute('dominant-baseline', 'middle');
text.setAttribute('paint-order', 'stroke');
text.textContent = edge.label || '关系';

labelGroup.appendChild(text);
labelLayer.appendChild(labelGroup);

let bbox;
try {
    bbox = text.getBBox();
} catch (e) {
    bbox = { x: pathInfo.labelX - 18, y: pathInfo.labelY - 8, width: 36, height: 16 };
}

if (!bbox.width || !bbox.height) {
    const approxWidth = Math.max(28, (String(edge.label || '关系').length * 12));
    bbox = {
        x: pathInfo.labelX - approxWidth / 2,
        y: pathInfo.labelY - 10,
        width: approxWidth,
        height: 20
    };
}

const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
rect.setAttribute('x', bbox.x - 10);
rect.setAttribute('y', bbox.y - 6);
rect.setAttribute('width', bbox.width + 20);
rect.setAttribute('height', bbox.height + 12);
rect.setAttribute('rx', '11');
rect.setAttribute('ry', '11');
rect.setAttribute('fill', '#FFFDF8');
rect.setAttribute('fill-opacity', '0.88');
rect.setAttribute('stroke', '#E9DEC9');
rect.setAttribute('stroke-opacity', '0.9');
rect.setAttribute('stroke-width', '0.8');
rect.setAttribute('filter', '');

labelGroup.insertBefore(rect, text);
    });
    
    // 小鱼修复：所有线条和箭头都画完之后，最后再把标签层压到最上面
svg.appendChild(labelLayer);

    // 画节点（头像 + 文字半透明气泡）
    positionedNodes.forEach(node => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
          position:absolute;
          left:${node.x - 42}px;
          top:${node.y - 42}px;
          width:84px;
          text-align:center;
          transform:translateZ(0);
          cursor:pointer;
        `;

        const isUser = String(node.id) === 'user_self';
        const isFocused = String(node.id) === String(centerNode.id) && !!focusNodeId;

        const borderColor = isUser ? '#07C160' : '#8CCBB3';
        const bgColor = isUser ? '#07C160' : '#A7D8C7';
        const displayAvatar = node.avatar || '';

        wrapper.innerHTML = `
          <div style="
            width:58px;
            height:58px;
            margin:0 auto 6px auto;
            border-radius:50%;
            overflow:hidden;
            border:${isFocused ? '4px solid #FFB020' : '3px solid ' + borderColor};
            background:${bgColor};
            box-shadow:${isFocused ? '0 0 0 4px rgba(255,176,32,0.18), 0 6px 14px rgba(0,0,0,0.16)' : '0 4px 10px rgba(0,0,0,0.12)'};
            display:flex;
            align-items:center;
            justify-content:center;
            background-image:${displayAvatar ? `url(${displayAvatar})` : 'none'};
            background-size:cover;
            background-position:center;
          ">
            ${!displayAvatar ? `
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6"></path>
              </svg>
            ` : ''}
          </div>

          <div style="
            display:inline-block;
            max-width:84px;
            padding:3px 8px;
            border-radius:999px;
            background:rgba(255,255,255,0.72);
            backdrop-filter:blur(2px);
            -webkit-backdrop-filter:blur(2px);
            font-size:13px;
            color:#333;
            font-weight:600;
            line-height:1.35;
            word-break:break-all;
            box-shadow:0 2px 6px rgba(0,0,0,0.08);
          ">${node.name || '未命名'}</div>
        `;

        wrapper.addEventListener('click', async (e) => {
            e.stopPropagation();

            // 再点一次当前焦点，恢复全图
            if (currentRelationFocusNodeId && String(currentRelationFocusNodeId) === String(node.id)) {
                currentRelationFocusNodeId = null;
            } else {
                currentRelationFocusNodeId = node.id;
            }

            const groups = await getData('tag_groups') || [];
            const group = groups.find(g => g.id === currentRelationTagId);
            const allGraphs = await getData('tag_relation_graphs') || {};
            const graphData = allGraphs[currentRelationTagId];
            if (group && graphData) {
                await renderTagRelationGraph(graphData, group);
            }
        });

        nodeLayer.appendChild(wrapper);
    });

    // 点击空白恢复完整视图
    canvasWrap.onclick = async function(e) {
        if (e.target === canvasWrap || e.target === svg || e.target === nodeLayer) {
            if (currentRelationFocusNodeId) {
                currentRelationFocusNodeId = null;
                const groups = await getData('tag_groups') || [];
                const group = groups.find(g => g.id === currentRelationTagId);
                const allGraphs = await getData('tag_relation_graphs') || {};
                const graphData = allGraphs[currentRelationTagId];
                if (group && graphData) {
                    await renderTagRelationGraph(graphData, group);
                }
            }
        }
    };

    setTimeout(() => {
        if (scrollWrap) {
            scrollWrap.scrollLeft = Math.max(0, centerX - scrollWrap.clientWidth / 2);
            scrollWrap.scrollTop = Math.max(0, centerY - scrollWrap.clientHeight / 2);
        }
    }, 30);

    // 文字说明
    const summaryList = graphData.summary || [];
    const edgeTextList = edges.map((e, index) => {
    const fromNode = getNodeById(e.from);
    const toNode = getNodeById(e.to);
    if (!fromNode || !toNode) return '';

    return `
      <div class="relation-text-item"
           data-relation-index="${index}"
           style="padding:10px 0; border-bottom:1px solid #F5F5F5; user-select:none; -webkit-user-select:none;">
        ${fromNode.name}
        <span style="color:${e.twoWay ? '#07C160' : '#576B95'}; font-weight:600; margin:0 4px;">
          ${e.twoWay ? '↔' : '→'}
        </span>
        ${toNode.name}
        ：${e.label}
      </div>
    `;
}).filter(Boolean).join('');

let modeText = '';
if (focusNodeId) {
    const focusNode = positionedNodes.find(n => String(n.id) === String(focusNodeId));
    if (focusNode) {
        modeText = `<div style="margin-bottom:10px; padding:8px 10px; background:#FFF7E8; color:#A26A00; border-radius:8px; font-size:13px;">当前为「${focusNode.name} 视角」：仅显示该角色认知中的相关关系。再次点击该头像或点击空白处可恢复完整关系网。</div>`;
    }
}

textList.innerHTML = `
  ${modeText}
  ${summaryList.length > 0 && !focusNodeId ? `
    <div style="margin-bottom:10px;">
      ${summaryList.map(item => `<div style="padding:4px 0; color:#666;">• ${item}</div>`).join('')}
    </div>
  ` : ''}
  ${edgeTextList || '当前视角下暂无关系说明'}
`;

// 小鱼新增：给底部文字关系绑定长按事件
bindRelationTextLongPress(edges);
}

/* ========================================
   小鱼新增：底部文字版关系网 - 长按编辑/删除/新建
   ======================================== */

// 1. 绑定长按
function bindRelationTextLongPress(currentEdges) {
    document.querySelectorAll('.relation-text-item').forEach(item => {
        let moved = false;

        item.addEventListener('touchstart', (e) => {
            moved = false;
            relationLongPressTimer = setTimeout(() => {
                if (!moved) {
                    const idx = parseInt(item.dataset.relationIndex);
                    currentEditingRelationIndex = idx;
                    showRelationActionSheet();
                    if (navigator.vibrate) navigator.vibrate(50);
                }
            }, 550);
        }, { passive: true });

        item.addEventListener('touchmove', () => {
            moved = true;
            clearTimeout(relationLongPressTimer);
        }, { passive: true });

        item.addEventListener('touchend', () => {
            clearTimeout(relationLongPressTimer);
        }, { passive: true });

        // 兼容PC右键
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const idx = parseInt(item.dataset.relationIndex);
            currentEditingRelationIndex = idx;
            showRelationActionSheet();
        });
    });
}

// 2. 打开操作菜单
function showRelationActionSheet() {
    document.getElementById('relationActionSheet').style.display = 'flex';
}

// 3. 关闭操作菜单
function closeRelationActionSheet(clearIndex = false) {
    document.getElementById('relationActionSheet').style.display = 'none';
    if (clearIndex) {
        currentEditingRelationIndex = null;
    }
}

// 4. 绑定关闭事件
document.getElementById('cancelRelationActionBtn').addEventListener('click', () => closeRelationActionSheet(true));
document.getElementById('relationActionSheet').addEventListener('click', (e) => {
    if (e.target.id === 'relationActionSheet') closeRelationActionSheet(true);
});

// 5. 编辑关系
document.getElementById('editRelationBtn').addEventListener('click', async () => {
    const savedIndex = currentEditingRelationIndex; // 先缓存
    closeRelationActionSheet(false); // 关闭菜单，但不清空索引
    currentEditingRelationIndex = savedIndex;
    await editCurrentRelation();
});

document.getElementById('deleteRelationBtn').addEventListener('click', async () => {
    const savedIndex = currentEditingRelationIndex; // 先缓存
    closeRelationActionSheet(false); // 关闭菜单，但不清空索引
    currentEditingRelationIndex = savedIndex;
    await deleteCurrentRelation();
});

// 7. 编辑当前关系
window.editCurrentRelation = async function() {
    if (currentEditingRelationIndex === null || !currentRelationTagId) return;

    const allGraphs = await getData('tag_relation_graphs') || {};
    const graphData = allGraphs[currentRelationTagId];
    if (!graphData || !graphData.edges || !graphData.edges[currentEditingRelationIndex]) return;

    const edge = graphData.edges[currentEditingRelationIndex];
    const nodes = graphData.nodes || [];

    const fromNode = nodes.find(n => String(n.id) === String(edge.from));
    const toNode = nodes.find(n => String(n.id) === String(edge.to));
    if (!fromNode || !toNode) return;

    const newLabel = await customPrompt(
        `编辑关系名称\n\n${fromNode.name} ${edge.twoWay ? '↔' : '→'} ${toNode.name}`,
        edge.label || ''
    );

    if (newLabel === null) return;

    edge.label = newLabel.trim() || '关系';

    allGraphs[currentRelationTagId] = graphData;
    await saveData('tag_relation_graphs', allGraphs);

    const groups = await getData('tag_groups') || [];
    const group = groups.find(g => g.id === currentRelationTagId);
    if (group) await renderTagRelationGraph(graphData, group);

    currentEditingRelationIndex = null;
};

// 8. 删除当前关系
window.deleteCurrentRelation = async function() {
    if (currentEditingRelationIndex === null || !currentRelationTagId) return;

    const allGraphs = await getData('tag_relation_graphs') || {};
    const graphData = allGraphs[currentRelationTagId];
    if (!graphData || !graphData.edges || !graphData.edges[currentEditingRelationIndex]) return;

    const edge = graphData.edges[currentEditingRelationIndex];
    const nodes = graphData.nodes || [];

    const fromNode = nodes.find(n => String(n.id) === String(edge.from));
    const toNode = nodes.find(n => String(n.id) === String(edge.to));

    if (!await customConfirm(`确定删除这条关系吗？\n\n${fromNode ? fromNode.name : edge.from} ${edge.twoWay ? '↔' : '→'} ${toNode ? toNode.name : edge.to}：${edge.label}`)) {
        return;
    }

    graphData.edges.splice(currentEditingRelationIndex, 1);

    allGraphs[currentRelationTagId] = graphData;
    await saveData('tag_relation_graphs', allGraphs);

    const groups = await getData('tag_groups') || [];
    const group = groups.find(g => g.id === currentRelationTagId);
    if (group) await renderTagRelationGraph(graphData, group);

    currentEditingRelationIndex = null;
};

// 小鱼新增：打开“新建关系”统一弹窗
window.openCreateRelationDialog = async function() {
    if (!currentRelationTagId) return;

    const allGraphs = await getData('tag_relation_graphs') || {};
    const graphData = allGraphs[currentRelationTagId];
    if (!graphData) {
        customAlert('请先点击右上角“AI生成”初始化关系网');
        return;
    }

    const nodes = graphData.nodes || [];
    if (nodes.length < 2) {
        customAlert('节点数量不足，无法新建关系');
        return;
    }

    const fromSelect = document.getElementById('relationFromSelect');
    const toSelect = document.getElementById('relationToSelect');
    const arrowSelect = document.getElementById('relationArrowSelect');
    const labelInput = document.getElementById('relationLabelInput');
    const modal = document.getElementById('relationCreateModal');

    // 渲染下拉选项
    const optionsHtml = nodes.map(node => {
        return `<option value="${node.id}">${node.name}</option>`;
    }).join('');

    fromSelect.innerHTML = optionsHtml;
    toSelect.innerHTML = optionsHtml;

    // 默认值
    fromSelect.selectedIndex = 0;
    toSelect.selectedIndex = nodes.length > 1 ? 1 : 0;
    arrowSelect.value = 'single';
    labelInput.value = '';

    modal.style.display = 'flex';
};

// 小鱼新增：关闭新建关系弹窗
window.closeCreateRelationDialog = function() {
    document.getElementById('relationCreateModal').style.display = 'none';
};

// 取消按钮
document.getElementById('cancelCreateRelationBtn').addEventListener('click', closeCreateRelationDialog);

// 点击遮罩关闭
document.getElementById('relationCreateModal').addEventListener('click', (e) => {
    if (e.target.id === 'relationCreateModal') {
        closeCreateRelationDialog();
    }
});

// 确认新建
document.getElementById('confirmCreateRelationBtn').addEventListener('click', async () => {
    if (!currentRelationTagId) return;

    const allGraphs = await getData('tag_relation_graphs') || {};
    const graphData = allGraphs[currentRelationTagId];
    if (!graphData) return;

    const fromId = document.getElementById('relationFromSelect').value;
    const toId = document.getElementById('relationToSelect').value;
    const arrowType = document.getElementById('relationArrowSelect').value;
    const label = document.getElementById('relationLabelInput').value.trim();

    if (!fromId || !toId) {
        customAlert('请选择起点和终点');
        return;
    }

    if (String(fromId) === String(toId)) {
        customAlert('起点和终点不能相同');
        return;
    }

    graphData.edges = graphData.edges || [];
    graphData.edges.push({
        from: fromId,
        to: toId,
        label: label || '关系',
        twoWay: arrowType === 'double'
    });

    allGraphs[currentRelationTagId] = graphData;
    await saveData('tag_relation_graphs', allGraphs);

    closeCreateRelationDialog();

    const groups = await getData('tag_groups') || [];
    const group = groups.find(g => g.id === currentRelationTagId);
    if (group) await renderTagRelationGraph(graphData, group);
});

// 9. 新建关系
// 这里整段删除，不需要替换

// ★★★ 小鱼终极修复：后台静默同步昵称变更雷达 ★★★
// 自动检测角色是否改名，一旦改名立即同步所有历史数据
async function autoSyncCharacterNames() {
    try {
        const contacts = await getData('customContacts');
        if (!contacts || !Array.isArray(contacts)) return;

        const savedMapStr = localStorage.getItem('wechat_name_map');
        let nameMap = savedMapStr ? JSON.parse(savedMapStr) : {};
        let needsSave = false;

        for (const contact of contacts) {
            if (contact.isGroup) continue; // 只处理单人角色
            const id = contact.id;
            const currentName = contact.nickname;
            const oldName = nameMap[id];

            // 发现名字发生了改变！
            if (oldName && oldName !== currentName) {
                console.log(`[同步雷达] 检测到角色改名: "${oldName}" -> "${currentName}"，正在修复历史数据...`);
                
                // 1. 修复群聊历史
                const groups = contacts.filter(c => c.isGroup);
                for (const group of groups) {
                    const key = 'chat_messages_' + group.id;
                    let msgs = await getData(key) || [];
                    let changed = false;
                    msgs.forEach(m => {
                        if (m.senderName === oldName) { m.senderName = currentName; changed = true; }
                    });
                    if (changed) await saveData(key, msgs);
                }

                // 2. 修复朋友圈 (作者、点赞、评论)
                let moments = await getData('moments_posts') || [];
                let mChanged = false;
                moments.forEach(post => {
                    if (post.authorName === oldName) { post.authorName = currentName; mChanged = true; }
                    if (post.likes && post.likes.includes(oldName)) {
                        post.likes = post.likes.map(n => n === oldName ? currentName : n);
                        mChanged = true;
                    }
                    if (post.comments) {
                        post.comments.forEach(c => {
                            if (c.authorName === oldName) { c.authorName = currentName; mChanged = true; }
                            if (c.replyToAuthorName === oldName) { c.replyToAuthorName = currentName; mChanged = true; }
                        });
                    }
                });
                if (mChanged) {
                    await saveData('moments_posts', moments);
                    // 如果正停留在朋友圈页面，自动刷新一下画面
                    const momentsPage = document.getElementById('momentsPage');
                    if (momentsPage && momentsPage.style.display !== 'none' && typeof renderMomentsFeed === 'function') {
                        await renderMomentsFeed();
                    }
                }

                // 3. 修复关系网
                let graphs = await getData('tag_relation_graphs') || {};
                let gChanged = false;
                Object.keys(graphs).forEach(tagId => {
                    let g = graphs[tagId];
                    if (g && g.nodes) {
                        g.nodes.forEach(n => {
                            if (n.name === oldName) { n.name = currentName; gChanged = true; }
                        });
                    }
                });
                if (gChanged) await saveData('tag_relation_graphs', graphs);

                // 4. 刷新当前聊天界面 (如果正在和该角色或包含该角色的群聊天)
                if (typeof currentChatId !== 'undefined' && currentChatId) {
                    const currContact = contacts.find(c => c.id === currentChatId);
                    if (currContact && (currContact.id === id || (currContact.isGroup && currContact.memberIds.includes(id)))) {
                        if (typeof renderMessages === 'function') {
                            await renderMessages(currentChatId);
                        }
                    }
                }

                // 更新记录本
                nameMap[id] = currentName;
                needsSave = true;
            } else if (!oldName && currentName) {
                // 第一次记录该角色
                nameMap[id] = currentName;
                needsSave = true;
            }
        }

        if (needsSave) {
            localStorage.setItem('wechat_name_map', JSON.stringify(nameMap));
        }
    } catch (e) {
        console.error("后台同步昵称出错:", e);
    }
}

// 启动雷达：每隔 2 秒在后台静默检查一次
setInterval(autoSyncCharacterNames, 2000);
// 页面刚加载时也立即执行一次
setTimeout(autoSyncCharacterNames, 1000);

/* ========================================
   小鱼新增：视频/语音通话系统 (全屏沉浸式 + 通话记录 + 悬浮小窗)
   ======================================== */
// 1. 动态注入通话相关的 HTML 界面
const callSystemHtml = `
<style>
@keyframes callPulse {
    0% { box-shadow: 0 0 0 0 rgba(7, 193, 96, 0.7); }
    70% { box-shadow: 0 0 0 15px rgba(7, 193, 96, 0); }
    100% { box-shadow: 0 0 0 0 rgba(7, 193, 96, 0); }
}
</style>

<!-- 底部选择弹窗 -->
<div id="callSelectActionSheet" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:100000; align-items:flex-end;">
    <div style="width:100%; background:#F7F7F7; border-radius:16px 16px 0 0; overflow:hidden;">
        <div style="background:#fff; height:60px; display:flex; align-items:center; justify-content:center; font-size:17px; color:#333; border-bottom:1px solid #F0F0F0; cursor:pointer;" onclick="customAlert('暂未开放视频通话，请选择语音通话')">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:10px;"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            视频通话
        </div>
        <div id="startVoiceCallBtn" style="background:#fff; height:60px; display:flex; align-items:center; justify-content:center; font-size:17px; color:#333; cursor:pointer;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:10px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            语音通话
        </div>
        <div style="height:8px; background:#F7F7F7;"></div>
        <div onclick="document.getElementById('callSelectActionSheet').style.display='none'" style="background:#fff; height:60px; display:flex; align-items:center; justify-content:center; font-size:17px; color:#333; cursor:pointer;">取消</div>
    </div>
</div>

<!-- ★ 新增：AI主动来电界面 -->
<div id="incomingCallOverlay" style="display:none; position:fixed; inset:0; background:linear-gradient(180deg, #2A2D31 0%, #111214 100%); z-index:100001; flex-direction:column; align-items:center; padding-top:max(env(safe-area-inset-top), 40px); color:white; font-family:system-ui, sans-serif;">
    <div id="incomingMinimizeBtn" style="position:absolute; top:max(env(safe-area-inset-top), 20px); left:20px; padding:10px; cursor:pointer; z-index:100002;">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="4" width="12" height="12" rx="2" ry="2"></rect>
            <rect x="10" y="10" width="10" height="10" rx="2" ry="2"></rect>
        </svg>
    </div>
    
    <div id="incomingCallAvatar" style="width:110px; height:110px; border-radius:16px; background-size:cover; background-position:center; margin-top:10vh; margin-bottom:20px; box-shadow:0 10px 30px rgba(0,0,0,0.3);"></div>
    <div id="incomingCallName" style="font-size:28px; font-weight:500; margin-bottom:12px; letter-spacing:1px;"></div>
    
    <div style="margin-top:auto; margin-bottom:12vh; font-size:16px; color:#aaa; letter-spacing:1px;">邀请你语音通话...</div>
    
    <div style="display:flex; justify-content:space-around; width:100%; max-width:320px; padding:0 30px; margin-bottom:8vh; box-sizing:border-box;">
        <div id="incomingRejectBtn" style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <div style="width:72px; height:72px; border-radius:50%; background:#FA5151; display:flex; align-items:center; justify-content:center; margin-bottom:12px; box-shadow:0 4px 15px rgba(250,81,81,0.4);">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="white"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
            </div>
            <span style="font-size:14px; color:#aaa;">拒绝</span>
        </div>
        <div id="incomingAcceptBtn" style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <div style="width:72px; height:72px; border-radius:50%; background:#07C160; display:flex; align-items:center; justify-content:center; margin-bottom:12px; animation: callPulse 2s infinite;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <span style="font-size:14px; color:#aaa;">接听</span>
        </div>
    </div>
</div>

<!-- 全屏语音通话界面 -->
<div id="voiceCallOverlay" style="display:none; position:fixed; inset:0; background:linear-gradient(180deg, #2A2D31 0%, #111214 100%); z-index:100001; flex-direction:column; align-items:center; padding-top:max(env(safe-area-inset-top), 40px); color:white; font-family:system-ui, sans-serif;">
    
    <!-- 左上角小窗模式按钮 -->
    <div id="minimizeCallBtn" style="position:absolute; top:max(env(safe-area-inset-top), 30px); left:10px; padding:10px; cursor:pointer; z-index:100002;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="4" width="12" height="12" rx="2" ry="2"></rect>
            <rect x="10" y="10" width="10" height="10" rx="2" ry="2"></rect>
        </svg>
    </div>

    <!-- 右上角钟表按钮 -->
    <div id="openCallHistoryBtn" style="position:absolute; top:max(env(safe-area-inset-top), 30px); right:10px; padding:10px; cursor:pointer; z-index:100002;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
    </div>

    <div id="callAvatar" style="width:110px; height:110px; border-radius:16px; background-size:cover; background-position:center; margin-top:6vh; margin-bottom:20px; box-shadow:0 10px 30px rgba(0,0,0,0.3);"></div>
    <div id="callName" style="font-size:28px; font-weight:500; margin-bottom:12px; letter-spacing:1px;"></div>
    <div id="callStatus" style="font-size:15px; color:#888; margin-bottom:40px; letter-spacing:1px;">等待对方接受邀请...</div>
    
    <div id="callSubtitle" style="display:none; font-size:20px; color:white; text-align:center; padding:0 30px; margin-top:auto; margin-bottom:40px; min-height:60px; line-height:1.5; text-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
    
    <div style="display:flex; flex-direction:column-reverse; width:100%; margin-top:auto; margin-bottom:max(env(safe-area-inset-bottom), 20px);">
        <!-- 底部按钮区 -->
        <div style="display:flex; justify-content:space-between; width:100%; max-width:320px; padding:0 30px; margin:0 auto; box-sizing:border-box;">
            <div style="display:flex; flex-direction:column; align-items:center;">
                <div style="width:68px; height:68px; border-radius:50%; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; margin-bottom:12px;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                </div>
                <span style="font-size:13px; color:#aaa;">麦克风已开</span>
            </div>
            <div id="callHangupBtn" style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
                <div style="width:68px; height:68px; border-radius:50%; background:#FA5151; display:flex; align-items:center; justify-content:center; margin-bottom:12px; box-shadow:0 4px 15px rgba(250,81,81,0.4);">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="white"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
                </div>
                <span style="font-size:13px; color:#aaa;">取消</span>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center;">
                <div style="width:68px; height:68px; border-radius:50%; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; margin-bottom:12px;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                </div>
                <span style="font-size:13px; color:#aaa;">扬声器已关</span>
            </div>
        </div>
        
        <div id="callInputArea" style="display:none; width:100%; padding:15px 20px 20px 20px; box-sizing:border-box; background:transparent;">
            <div style="display:flex; gap:12px; align-items:center;">
                <input id="callInput" type="text" placeholder="回复对方..." style="flex:1; height:44px; border-radius:22px; border:none; padding:0 20px; outline:none; font-size:15px; background:rgba(255,255,255,0.18); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); color:white; box-shadow:inset 0 1px 3px rgba(0,0,0,0.2);">
                <button id="callSendBtn" style="width:64px; height:44px; border-radius:22px; background:rgba(7,193,96,0.85); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); color:white; border:none; font-size:15px; font-weight:600; cursor:pointer; box-shadow:0 2px 8px rgba(7,193,96,0.3);">发送</button>
            </div>
        </div>
    </div>
</div>

<!-- 通话记录半透明面板 -->
<div id="callHistoryPanel" style="display:none; position:fixed; inset:0; background:rgba(20,20,20,0.85); z-index:100003; flex-direction:column; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);">
    <div style="padding-top:max(env(safe-area-inset-top), 20px); background:rgba(20,20,20,0.5); flex-shrink:0;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:15px 24px; border-bottom:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:22px; font-weight:bold; color:white; letter-spacing:1px;">通话记录</div>
            <div id="closeCallHistoryBtn" style="cursor:pointer; padding:5px;">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
        </div>
    </div>
    <div id="callHistoryList" style="flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; padding:24px; box-sizing:border-box; overscroll-behavior-y:contain;"></div>
</div>

<!-- 全局悬浮小窗 -->
<div id="floatingCallWindow" style="display:none; position:fixed; top:max(env(safe-area-inset-top, 80px), 80px); left:auto; right:15px; width:72px; height:72px; background:white; border-radius:18px; box-shadow:0 6px 20px rgba(0,0,0,0.15); z-index:999999; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; transition:transform 0.2s ease;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#07C160" style="margin-bottom:4px;">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
    <span id="floatingCallTime" style="color:#07C160; font-size:15px; font-weight:600; font-variant-numeric:tabular-nums; letter-spacing:0.5px;">等待</span>
</div>
`;
document.body.insertAdjacentHTML('beforeend', callSystemHtml);

// 2. 全局状态变量
let isCallActive = false;
let windowIsIncomingCall = false; // ★ 新增：标记是否为来电状态
let callStartTime = 0;
let callTimerInterval = null;
let callVibrateInterval = null;

let currentCallHistory = [];
let currentCallUserName = '闻念'; 

// ★★★ 核心新增：拦截 AI 的主动来电指令 ★★★
let callInitiator = 'user'; // 记录通话发起方：'user' 或 'ai'

// ★ 新增：来电铃声与柔和振动控制
async function startCallRing() {
    const ringtoneData = await getData('ringtone');
    const player = document.getElementById('ringtonePlayer');
    
    // 如果有设置铃声，优先播放铃声
    if (ringtoneData && ringtoneData.src && player) {
        player.src = ringtoneData.src;
        player.loop = true; // 循环播放
        player.play().catch(e => {
            console.warn("铃声自动播放受限，降级为振动", e);
            fallbackVibrate();
        });
    } else {
        // 没有铃声则直接振动
        fallbackVibrate();
    }
}

function fallbackVibrate() {
    if (navigator.vibrate) {
        // ★ 修复：更柔和的振动节奏（振动300ms，停顿1500ms）
        navigator.vibrate([300, 1500, 300, 1500]);
        if (callVibrateInterval) clearInterval(callVibrateInterval);
        callVibrateInterval = setInterval(() => navigator.vibrate([300, 1500]), 1800);
    }
}

function stopCallRing() {
    const player = document.getElementById('ringtonePlayer');
    if (player) {
        player.pause();
        player.currentTime = 0;
    }
    if (callVibrateInterval) clearInterval(callVibrateInterval);
    if (navigator.vibrate) navigator.vibrate(0); // 强制停止振动
}

const originalAppendMessageToUI = appendMessageToUI;
window.appendMessageToUI = function(msg, otherAvatar, isGroupChat = false) {
    // 1. 拦截新发出的来电指令
    if (msg.type === 'call_invite') {
        // 立即修改数据库中的类型，防止刷新页面时重复弹窗
        getData('chat_messages_' + currentChatId).then(msgs => {
            if (msgs) {
                const idx = msgs.findIndex(m => m.timestamp === msg.timestamp);
                if (idx !== -1) {
                    msgs[idx].type = 'call_invite_processed';
                    msgs[idx].content = '发起了语音通话 ᯅ';
                    msgs[idx].isHidden = true; // ★ 增加隐藏属性，防止首页列表预览显示
                    saveData('chat_messages_' + currentChatId, msgs);
                }
            }
        });

        const incomingOverlay = document.getElementById('incomingCallOverlay');
        if (incomingOverlay) {
            const avatarUrl = otherAvatar || 'https://iili.io/fkc3RwJ.jpg';
            document.getElementById('incomingCallAvatar').style.backgroundImage = `url(${avatarUrl})`;
            
            // 准确获取角色名称
            getData('customContacts').then(contacts => {
                const c = (contacts || []).find(x => x.id === currentChatId);
                const dName = msg.senderName || (c ? c.nickname : '对方');
                document.getElementById('incomingCallName').textContent = dName;
            });
            
            incomingOverlay.style.display = 'flex';
            windowIsIncomingCall = true;
            callInitiator = 'ai'; // ★ 标记为 AI 发起
            
            startCallRing(); // ★ 触发铃声或振动
        }
        return; // 拦截，不在聊天界面渲染
    }
    
    // 2. 处理历史记录中的来电指令（已处理过的）
    if (msg.type === 'call_invite_processed') {
        return; // ★ 彻底拦截，绝对不在聊天界面显示
    }
    
    originalAppendMessageToUI(msg, otherAvatar, isGroupChat);
};

// ★ 处理 AI 来电的拒绝逻辑
document.getElementById('incomingRejectBtn').addEventListener('click', async () => {
    document.getElementById('incomingCallOverlay').style.display = 'none';
    stopCallRing(); // ★ 停止铃声/振动
    windowIsIncomingCall = false;
    
    // ★ 以角色身份在聊天界面显示“已取消”
    const contact = await getContactDetails(currentChatId);
    const recordMsg = {
        role: 'assistant',
        type: 'text',
        content: '已拒绝 ᯅ',
        senderName: contact.nickname,
        timestamp: Date.now()
    };
    await saveMessage(currentChatId, recordMsg);
    originalAppendMessageToUI(recordMsg, contact.avatar, contact.isGroup);
    scrollToBottom();
    await updateChatList(currentChatId, '已拒绝 ᯅ', Date.now());
    
    // 告诉 AI 用户拒绝了
    const { apiMessages } = await buildApiMessages(currentChatId);
    apiMessages.push({
        role: 'user',
        content: `[系统提示] 用户拒绝了你的语音通话邀请。请用一两句话回复缓解尴尬或表达遗憾。`
    });
    try {
        const wechatApiConfig = await getApiConfigForWechat('wechat');
        let response = await callAIAPI(apiMessages, wechatApiConfig);
        await handleAIResponsePayload(response, contact, [], currentChatId, activeChatSessionToken);
    } catch(e) {}
});

// ★ 处理 AI 来电的接听逻辑
document.getElementById('incomingAcceptBtn').addEventListener('click', async () => {
    document.getElementById('incomingCallOverlay').style.display = 'none';
    stopCallRing(); // ★ 停止铃声/振动
    windowIsIncomingCall = false;
    
    document.getElementById('voiceCallOverlay').style.display = 'flex';
    document.getElementById('callAvatar').style.backgroundImage = document.getElementById('incomingCallAvatar').style.backgroundImage;
    document.getElementById('callName').textContent = document.getElementById('incomingCallName').textContent;
    document.getElementById('callStatus').textContent = '00:00';
    
    const subEl = document.getElementById('callSubtitle');
    subEl.style.display = 'block';
    subEl.textContent = '...';
    
    document.getElementById('callInputArea').style.display = 'none';
    document.querySelector('#callHangupBtn span').textContent = '挂断';
    
    isCallActive = true;
    callStartTime = Date.now();
    if (callTimerInterval) clearInterval(callTimerInterval);
    callTimerInterval = setInterval(() => {
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        const m = String(Math.floor(duration / 60)).padStart(2, '0');
        const s = String(duration % 60).padStart(2, '0');
        document.getElementById('callStatus').textContent = `${m}:${s}`;
        const floatingTimeEl = document.getElementById('floatingCallTime');
        if (floatingTimeEl) floatingTimeEl.textContent = `${m}:${s}`;
    }, 1000);
    
    currentCallHistory = [];
    currentCallUserName = await getData('userName') || '闻念';
    if (typeof renderCallHistory === 'function') renderCallHistory();
    
    const { apiMessages } = await buildApiMessages(currentChatId);
    apiMessages.push({
        role: 'user',
        content: `[系统提示] 用户已接听了你的语音通话。请直接说出 3~5 句开场白（严格使用 [{"type": "call_accept", "content": "第一句话"}, ...] 格式）`
    });
    
    await fetchAndPlayCallResponse(apiMessages);
});

// 来电界面的小窗模式
document.getElementById('incomingMinimizeBtn').addEventListener('click', () => {
    document.getElementById('incomingCallOverlay').style.display = 'none';
    const floatingWindow = document.getElementById('floatingCallWindow');
    floatingWindow.style.display = 'flex';
    document.getElementById('floatingCallTime').textContent = '来电中';
});

// 渲染通话记录函数
window.renderCallHistory = function() {
    const listEl = document.getElementById('callHistoryList');
    if (!listEl) return;
    
    if (currentCallHistory.length === 0) {
        listEl.innerHTML = '<div style="text-align:center; color:rgba(255,255,255,0.4); margin-top:40px; font-size:14px;">暂无通话记录</div>';
        return;
    }
    
    listEl.innerHTML = currentCallHistory.map(item => {
        const isAI = item.role === 'ai';
        const nameColor = isAI ? '#E6D3A8' : '#C4A47C'; 
        
        const starIcon = isAI ? `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:4px; margin-top:-2px;">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>` : '';
            
        const voiceIcon = isAI ? `
            <div style="display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; border-radius:50%; background:rgba(255,255,255,0.15); margin-left:8px;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </div>` : '';
            
        const paddingLeft = isAI ? '20px' : '0px';
        
        return `
        <div style="display:flex; flex-direction:column; margin-bottom:24px; animation: fadeIn 0.3s ease;">
            <div style="display:flex; align-items:center; color:${nameColor}; font-size:15px; margin-bottom:8px;">
                ${starIcon}
                <span style="font-weight:500; letter-spacing:1px;">${item.name}</span>
                ${voiceIcon}
            </div>
            <div style="color:#F5F5F5; font-size:16px; line-height:1.6; padding-left:${paddingLeft}; letter-spacing:0.5px;">
                ${item.content}
            </div>
        </div>
        `;
    }).join('');
    
    listEl.scrollTop = listEl.scrollHeight;
};

document.getElementById('openCallHistoryBtn').addEventListener('click', () => {
    document.getElementById('callHistoryPanel').style.display = 'flex';
    renderCallHistory(); 
    setTimeout(() => {
        const listEl = document.getElementById('callHistoryList');
        if (listEl) listEl.scrollTop = listEl.scrollHeight;
    }, 50);
});

document.getElementById('closeCallHistoryBtn').addEventListener('click', () => {
    document.getElementById('callHistoryPanel').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', () => {
    const historyList = document.getElementById('callHistoryList');
    if (historyList) {
        historyList.addEventListener('touchmove', (e) => {
            e.stopPropagation(); 
        }, { passive: false });
    }
});

// 小窗模式自由拖拽与贴边逻辑
let isDraggingCallWindow = false;
let callWindowStartX, callWindowStartY;
let callWindowInitialLeft, callWindowInitialTop;
const floatingWindow = document.getElementById('floatingCallWindow');

floatingWindow.addEventListener('touchstart', (e) => {
    isDraggingCallWindow = false;
    const touch = e.touches[0];
    callWindowStartX = touch.clientX;
    callWindowStartY = touch.clientY;
    
    const rect = floatingWindow.getBoundingClientRect();
    callWindowInitialLeft = rect.left;
    callWindowInitialTop = rect.top;
    
    floatingWindow.style.transition = 'none'; 
}, { passive: true });

floatingWindow.addEventListener('touchmove', (e) => {
    if (!isCallActive && !windowIsIncomingCall) return;
    const touch = e.touches[0];
    const dx = touch.clientX - callWindowStartX;
    const dy = touch.clientY - callWindowStartY;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isDraggingCallWindow = true;
    }
    
    if (isDraggingCallWindow) {
        e.preventDefault(); 
        let newLeft = callWindowInitialLeft + dx;
        let newTop = callWindowInitialTop + dy;
        
        const maxX = window.innerWidth - floatingWindow.offsetWidth;
        const maxY = window.innerHeight - floatingWindow.offsetHeight;
        
        newLeft = Math.max(0, Math.min(newLeft, maxX));
        newTop = Math.max(0, Math.min(newTop, maxY));
        
        floatingWindow.style.left = newLeft + 'px';
        floatingWindow.style.top = newTop + 'px';
        floatingWindow.style.right = 'auto'; 
    }
}, { passive: false });

floatingWindow.addEventListener('touchend', (e) => {
    if (!isCallActive && !windowIsIncomingCall) return;
    floatingWindow.style.transition = 'all 0.3s ease'; 
    if (isDraggingCallWindow) {
        const rect = floatingWindow.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        if (centerX < window.innerWidth / 2) {
            floatingWindow.style.left = '15px';
        } else {
            floatingWindow.style.left = (window.innerWidth - rect.width - 15) + 'px';
        }
    }
});

document.getElementById('minimizeCallBtn').addEventListener('click', () => {
    document.getElementById('voiceCallOverlay').style.display = 'none';
    document.getElementById('callHistoryPanel').style.display = 'none'; 
    document.getElementById('floatingCallWindow').style.display = 'flex';
});

floatingWindow.addEventListener('click', (e) => {
    if (isDraggingCallWindow) {
        e.stopPropagation();
        return; 
    }
    document.getElementById('floatingCallWindow').style.display = 'none';
    
    if (windowIsIncomingCall) {
        document.getElementById('incomingCallOverlay').style.display = 'flex';
    } else {
        document.getElementById('voiceCallOverlay').style.display = 'flex';
        const listEl = document.getElementById('callHistoryList');
        if(listEl) listEl.scrollTop = listEl.scrollHeight;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const actionItems = document.querySelectorAll('.action-item');
    let foundCallBtn = false;
    actionItems.forEach(item => {
        const textEl = item.querySelector('.action-text');
        if (textEl && textEl.textContent.trim() === '视频通话') {
            item.onclick = () => {
                closeActionSheet();
                document.getElementById('callSelectActionSheet').style.display = 'flex';
            };
            foundCallBtn = true;
        }
    });
    
    if (!foundCallBtn) {
        const track = document.getElementById('actionSheetTrack');
        if (track) {
            const firstPage = track.querySelector('.action-page');
            if (firstPage) {
                const callBtnHtml = `
                <div class="action-item" onclick="closeActionSheet(); document.getElementById('callSelectActionSheet').style.display = 'flex';">
                    <div class="action-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                    </div>
                    <span class="action-text">视频通话</span>
                </div>`;
                firstPage.insertAdjacentHTML('beforeend', callBtnHtml);
            }
        }
    }
});

let callAutoReplyTimer = null;

function resetCallAutoReplyTimer() {
    if (callAutoReplyTimer) clearTimeout(callAutoReplyTimer);
    if (!isCallActive) return;
    
    callAutoReplyTimer = setTimeout(async () => {
        if (!isCallActive) return;
        const inputVal = document.getElementById('callInput').value.trim();
        if (inputVal !== '') {
            resetCallAutoReplyTimer();
            return;
        }
        
        document.getElementById('callSubtitle').textContent = '...';
        document.getElementById('callSubtitle').style.color = '#aaa';
        
        const { apiMessages } = await buildApiMessages(currentChatId);
        apiMessages.push({
            role: 'user',
            content: `[语音通话中] (用户长时间未说话) 请根据当前情境主动找话题、继续刚才的话题或询问用户在干嘛，必须根据人设生成 3~5 句连贯的回复（严格使用 [{"type": "call_accept", "content": "第一句话"}...] 格式）`
        });
        
        await fetchAndPlayCallResponse(apiMessages);
    }, 60000); 
}

// ★ 新增：将当前通话状态持久化到数据库
async function saveCallState() {
    if (!currentChatId) return;
    const state = isCallActive ? {
        chatId: currentChatId,
        startTime: callStartTime,
        history: currentCallHistory,
        userName: currentCallUserName,
        initiator: callInitiator,
        avatarUrl: document.getElementById('callAvatar') ? document.getElementById('callAvatar').style.backgroundImage : '',
        callerName: document.getElementById('callName') ? document.getElementById('callName').textContent : ''
    } : null;
    await saveData('active_call_state', state);
}

// ★ 新增：从数据库恢复通话状态（页面加载时调用）
async function restoreCallState() {
    const state = await getData('active_call_state');
    if (!state || !state.chatId) return; // 没有残留通话，直接返回

    // 恢复全局变量
    currentChatId = state.chatId;
    currentCallHistory = state.history || [];
    currentCallUserName = state.userName || '闻念';
    callInitiator = state.initiator || 'user';
    callStartTime = state.startTime || 0;
    isCallActive = true;

    // 恢复悬浮小窗
    const floatingWindow = document.getElementById('floatingCallWindow');
    const floatingTimeEl = document.getElementById('floatingCallTime');

    if (floatingWindow) {
        floatingWindow.style.display = 'flex';
        floatingWindow.style.top = 'max(env(safe-area-inset-top, 80px), 80px)';
        floatingWindow.style.left = 'auto';
        floatingWindow.style.right = '15px';
    }

    // 恢复计时器（从真实开始时间推算，而非从0开始）
    if (callStartTime > 0 && floatingTimeEl) {
        const updateTime = () => {
            const duration = Math.floor((Date.now() - callStartTime) / 1000);
            const m = String(Math.floor(duration / 60)).padStart(2, '0');
            const s = String(duration % 60).padStart(2, '0');
            if (floatingTimeEl) floatingTimeEl.textContent = `${m}:${s}`;
            const statusEl = document.getElementById('callStatus');
            if (statusEl) statusEl.textContent = `${m}:${s}`;
        };
        updateTime(); // 立即更新一次，防止第一秒显示空白
        callTimerInterval = setInterval(updateTime, 1000);
    } else if (floatingTimeEl) {
        floatingTimeEl.textContent = '等待';
    }

    // 恢复全屏界面的头像和名字（供点击小窗后展示）
    const callAvatarEl = document.getElementById('callAvatar');
    const callNameEl = document.getElementById('callName');
    if (callAvatarEl && state.avatarUrl) callAvatarEl.style.backgroundImage = state.avatarUrl;
    if (callNameEl && state.callerName) callNameEl.textContent = state.callerName;

    // 同步刷新通话记录面板（数据已恢复，随时可以打开查看）
    if (typeof renderCallHistory === 'function') renderCallHistory();

    // ★ 核心修复：恢复全屏界面的字幕内容
    // 从历史记录中取出最后一条，回显到字幕框，让用户重新进入时不会看到空白
    const subEl = document.getElementById('callSubtitle');
    if (subEl && currentCallHistory.length > 0) {
        const lastRecord = currentCallHistory[currentCallHistory.length - 1];
        subEl.style.display = 'block';
        subEl.textContent = lastRecord.content;
        // 根据发言方决定字幕颜色：AI说的白色，用户说的绿色
        subEl.style.color = lastRecord.role === 'user' ? '#95EC69' : 'white';
    } else if (subEl && callStartTime > 0) {
        // 如果通话已接通但暂无记录（刚接通就退出了），显示省略号占位
        subEl.style.display = 'block';
        subEl.textContent = '...';
        subEl.style.color = '#aaa';
    }

    // ★ 同步恢复挂断按钮的文字（已接通显示"挂断"，等待中显示"取消"）
    const hangupSpan = document.querySelector('#callHangupBtn span');
    if (hangupSpan) {
        hangupSpan.textContent = callStartTime > 0 ? '挂断' : '取消';
    }

    console.log(`✅ 通话状态已恢复，聊天ID: ${currentChatId}，历史记录: ${currentCallHistory.length}条`);
}

async function fetchAndPlayCallResponse(apiMessages) {
    if (callAutoReplyTimer) clearTimeout(callAutoReplyTimer); 
    try {
        const wechatApiConfig = await getApiConfigForWechat('wechat');
        let response = await callAIAPI(apiMessages, wechatApiConfig);
        
        let replyMsgs = [];
        try {
            let cleanStr = response.replace(/```json/g, '').replace(/```/g, '');
            const firstBracket = cleanStr.indexOf('[');
            const lastBracket = cleanStr.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
                const msgs = JSON.parse(cleanStr.substring(firstBracket, lastBracket + 1));
                replyMsgs = msgs.filter(m => m.type === 'call_accept' || m.type === 'text');
            } else {
                throw new Error("API未返回标准JSON数组");
            }
        } catch (parseError) {
            console.warn("通话解析降级：", parseError);
            const rawText = response.replace(/```.*/g, '').replace(/\[\{.*\}\]/g, '').trim();
            const sentences = rawText.split(/(?<=[。！？!?])/).filter(s => s.trim());
            replyMsgs = sentences.map(s => ({ content: s.trim() }));
        }
        
        const contact = await getContactDetails(currentChatId);
        
        for (const replyMsg of replyMsgs) {
            if (!isCallActive) break; 
            
            const subEl = document.getElementById('callSubtitle');
            subEl.style.display = 'block';
            subEl.textContent = replyMsg.content;
            subEl.style.color = 'white';
            
            currentCallHistory.push({
                role: 'ai',
                name: contact.realName || contact.nickname,
                content: replyMsg.content
            });
            if (typeof renderCallHistory === 'function') renderCallHistory();
            
            await saveCallState(); // ★ 每条新记录写入后立即持久化
            await new Promise(r => setTimeout(r, 2500));
        }
        resetCallAutoReplyTimer();
    } catch (e) {
        console.error(e);
        if (isCallActive) {
            document.getElementById('callSubtitle').textContent = `信号异常：${e.message || '网络连接失败'}`;
            document.getElementById('callSubtitle').style.color = '#FA5151';
            resetCallAutoReplyTimer(); 
        }
    }
}

document.getElementById('callSendBtn').addEventListener('click', async () => {
    const input = document.getElementById('callInput');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    
    document.getElementById('callInputArea').style.display = 'none';
    
    document.getElementById('callSubtitle').textContent = text;
    document.getElementById('callSubtitle').style.color = '#95EC69'; 
    
    currentCallHistory.push({
        role: 'user',
        name: currentCallUserName,
        content: text
    });
    if (typeof renderCallHistory === 'function') renderCallHistory();
    
    const { apiMessages } = await buildApiMessages(currentChatId);
    apiMessages.push({
        role: 'user',
        content: `[语音通话中] 用户对你说："${text}"。请直接回复你接下来要说的话，必须根据人设生成 3~5 句连贯的回复（严格使用 [{"type": "call_accept", "content": "第一句话"}, {"type": "call_accept", "content": "第二句话"}...] 格式）`
    });
    
    await fetchAndPlayCallResponse(apiMessages);
});

document.getElementById('callInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('callSendBtn').click();
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const buttonArea = document.querySelector('#voiceCallOverlay > div:last-child > div:first-child');
        if (buttonArea) {
            const micColumn = buttonArea.querySelector('div:first-child');
            if (micColumn) {
                micColumn.style.cursor = 'pointer';
                micColumn.onclick = () => {
                    const inputArea = document.getElementById('callInputArea');
                    if (inputArea.style.display === 'none' || !inputArea.style.display) {
                        inputArea.style.display = 'block';
                        setTimeout(() => document.getElementById('callInput').focus(), 100);
                    } else {
                        inputArea.style.display = 'none';
                    }
                };
            }
        }
    }, 300); 
});

// 发起语音通话逻辑
const oldStartBtn = document.getElementById('startVoiceCallBtn');
const newStartBtn = oldStartBtn.cloneNode(true);
oldStartBtn.parentNode.replaceChild(newStartBtn, oldStartBtn);

newStartBtn.addEventListener('click', async () => {
    if (!currentChatId) return;
    
    document.getElementById('callSelectActionSheet').style.display = 'none';
    document.getElementById('voiceCallOverlay').style.display = 'flex';
    document.getElementById('floatingCallWindow').style.display = 'none'; 
    
    document.getElementById('floatingCallWindow').style.top = 'max(env(safe-area-inset-top, 80px), 80px)';
    document.getElementById('floatingCallWindow').style.left = 'auto';
    document.getElementById('floatingCallWindow').style.right = '15px';
    
    const contact = await getContactDetails(currentChatId);
    document.getElementById('callAvatar').style.backgroundImage = `url(${contact.avatar || 'https://iili.io/fkc3RwJ.jpg'})`;
    document.getElementById('callName').textContent = contact.nickname;
    document.getElementById('callStatus').textContent = '等待对方接受邀请...';
    document.getElementById('floatingCallTime').textContent = '等待'; 
    document.getElementById('callSubtitle').style.display = 'none';
    document.getElementById('callInputArea').style.display = 'none';
    document.querySelector('#callHangupBtn span').textContent = '取消';
    
    currentCallHistory = [];
    currentCallUserName = await getData('userName') || '闻念';
    if (typeof renderCallHistory === 'function') renderCallHistory();
    
isCallActive = true;
windowIsIncomingCall = false;
callInitiator = 'user';
callStartTime = 0; 
if (callAutoReplyTimer) clearTimeout(callAutoReplyTimer);

await saveCallState(); // ★ 通话开始时立即持久化
startCallRing();

    const { apiMessages, availableStickers } = await buildApiMessages(currentChatId);
    
    apiMessages.push({
        role: 'user',
        content: `[系统级别绝对指令] 用户向你发起了语音通话。请根据当前情境和人设决定是否接听。
如果你想拒绝，必须严格回复 3~5 句话解释原因：[{"type": "call_reject", "content": "拒绝的理由1"}, {"type": "call_reject", "content": "理由2"}...]
如果你想接听，必须严格回复 3~5 句话作为开场白：[{"type": "call_accept", "content": "接通后的开场白1"}, {"type": "call_accept", "content": "开场白2"}...]
注意：只能选择其中一种状态，必须是JSON数组格式！`
    });

    try {
        const wechatApiConfig = await getApiConfigForWechat('wechat');
        let response = await callAIAPI(apiMessages, wechatApiConfig);
        await handleAIResponsePayload(response, contact, availableStickers, currentChatId, activeChatSessionToken);
        
        if (isCallActive) {
            resetCallAutoReplyTimer();
        }
    } catch (e) {
        console.error("通话请求失败", e);
        stopCallRing(); // ★ 报错时停止铃声
        clearInterval(callVibrateInterval);
        clearInterval(callTimerInterval);
        if (callAutoReplyTimer) clearTimeout(callAutoReplyTimer);
        document.getElementById('voiceCallOverlay').style.display = 'none';
        document.getElementById('floatingCallWindow').style.display = 'none';
        isCallActive = false;
        callStartTime = 0;
        
        const recordMsg = {
            role: 'user',
            type: 'text',
            content: '对方无响应 ᯅ',
            timestamp: Date.now()
        };
        await saveMessage(currentChatId, recordMsg);
        originalAppendMessageToUI(recordMsg, null, false);
        scrollToBottom();
        await updateChatList(currentChatId, '对方无响应 ᯅ', Date.now());
    }
});

// 挂断/取消通话逻辑
const oldHangupBtn = document.getElementById('callHangupBtn');
const newHangupBtn = oldHangupBtn.cloneNode(true);
oldHangupBtn.parentNode.replaceChild(newHangupBtn, oldHangupBtn);

newHangupBtn.addEventListener('click', async () => {
    if (!isCallActive) return;
    stopCallRing(); // ★ 主动挂断时停止铃声
    clearInterval(callVibrateInterval);
    clearInterval(callTimerInterval);
    if (callAutoReplyTimer) clearTimeout(callAutoReplyTimer); 
    document.getElementById('voiceCallOverlay').style.display = 'none';
    document.getElementById('callHistoryPanel').style.display = 'none'; 
    document.getElementById('floatingCallWindow').style.display = 'none'; 
    isCallActive = false;
    
    let recordText = '已取消 ᯅ';
    let isRealCall = false; 
    if (callStartTime > 0) {
        isRealCall = true;
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        const m = String(Math.floor(duration / 60)).padStart(2, '0');
        const s = String(duration % 60).padStart(2, '0');
        recordText = `通话时长 ${m}:${s} ᯅ`;
    }
    
    const contact = await getContactDetails(currentChatId);
    const recordRole = callInitiator === 'ai' ? 'assistant' : 'user';
    const recordMsg = {
        role: recordRole,
        type: 'text',
        content: recordText,
        senderName: recordRole === 'assistant' ? contact.nickname : undefined,
        timestamp: Date.now()
    };
    await saveMessage(currentChatId, recordMsg);
    originalAppendMessageToUI(recordMsg, recordRole === 'assistant' ? contact.avatar : null, contact.isGroup);
    scrollToBottom();
    await updateChatList(currentChatId, recordText, Date.now());
    
    callStartTime = 0;
await saveData('active_call_state', null); // ★ 通话结束后彻底清除持久化记录

if (isRealCall) {
        setTimeout(async () => {
            const { apiMessages, availableStickers } = await buildApiMessages(currentChatId);
            apiMessages.push({
                role: 'user',
                content: `[系统提示] 语音通话刚刚结束。请根据刚才的通话内容和人设，在微信聊天里主动发 3~5 条文字消息作为通话后的跟进（例如：叮嘱、道别、回味等）。严格使用 [{"type": "text", "content": "第一句话"}, {"type": "text", "content": "第二句话"}...] 格式。`
            });
            
            try {
                document.getElementById('chatTitle').textContent = '对方正在输入...';
                document.getElementById('chatTitle').classList.add('typing-blink-effect');
                
                const wechatApiConfig = await getApiConfigForWechat('wechat');
                let response = await callAIAPI(apiMessages, wechatApiConfig);
                await handleAIResponsePayload(response, contact, availableStickers, currentChatId, activeChatSessionToken);
            } catch (e) {
                console.error("通话后追击回复失败", e);
            }
        }, 800);
    }
});