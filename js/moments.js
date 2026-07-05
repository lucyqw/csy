/* 模块: js/moments.js */

// [VariableDeclaration] Variables: momentsEntryBtn
const momentsEntryBtn = document.getElementById('momentsEntryBtn');

// [VariableDeclaration] Variables: momentsPage
const momentsPage = document.getElementById('momentsPage');

// [VariableDeclaration] Variables: momentsBackBtn
const momentsBackBtn = document.getElementById('momentsBackBtn');

// [VariableDeclaration] Variables: momentsHeader
const momentsHeader = document.getElementById('momentsHeader');

// [VariableDeclaration] Variables: momentsCoverInput
const momentsCoverInput = document.getElementById('momentsCoverInput');

// [VariableDeclaration] Variables: momentsUserName
const momentsUserName = document.getElementById('momentsUserName');

// [VariableDeclaration] Variables: momentsUserAvatar
const momentsUserAvatar = document.getElementById('momentsUserAvatar');

// [VariableDeclaration] Variables: momentsHint
const momentsHint = document.querySelector('.moments-hint');

// [ExpressionStatement] Execution: push
allFullscreenPages.push(momentsPage);

// [FunctionDeclaration] Function: addMomentUnreadMsg
async function addMomentUnreadMsg(msgData) {
    let unread = await getData('moments_unread_msgs') || [];
    unread.push(msgData);
    await saveData('moments_unread_msgs', unread);
}

// [ExpressionStatement] Execution: Expression
window.clearMomentUnreadMsgs = async function() {
    await saveData('moments_unread_msgs', []);
    await renderMomentsFeed();
}

// [FunctionDeclaration] Function: renderMomentsFeed
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

// [IfStatement] AnonymousBlock
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

// [IfStatement] AnonymousBlock
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

// [IfStatement] AnonymousBlock
if (momentsHeader) {
  momentsHeader.addEventListener('click', () => momentsCoverInput.click());
}

// [IfStatement] AnonymousBlock
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

// [FunctionDeclaration] Function: getRelationNodeName
async function getRelationNodeName(nodeId) {
    if (String(nodeId) === 'user_self') {
        return await getData('userName') || '用户';
    }
    const contacts = await getData('customContacts') || [];
    const contact = contacts.find(c => String(c.id) === String(nodeId));
    return contact ? (contact.realName || contact.nickname) : String(nodeId);
}

// [FunctionDeclaration] Function: getMomentRelationPrompt
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

// [FunctionDeclaration] Function: getSameTagVisibleCharacters
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

// [VariableDeclaration] Variables: selectedMomentImages
let selectedMomentImages = [];

// [ExpressionStatement] Execution: push
allFullscreenPages.push(document.getElementById('postMomentPage'));

// [VariableDeclaration] Variables: postMomentBtn
const postMomentBtn = document.getElementById('postMomentBtn');

// [VariableDeclaration] Variables: postMomentPage
const postMomentPage = document.getElementById('postMomentPage');

// [VariableDeclaration] Variables: cancelPostMomentBtn
const cancelPostMomentBtn = document.getElementById('cancelPostMomentBtn');

// [VariableDeclaration] Variables: publishMomentBtn
const publishMomentBtn = document.getElementById('publishMomentBtn');

// [VariableDeclaration] Variables: momentContentInput
const momentContentInput = document.getElementById('momentContentInput');

// [VariableDeclaration] Variables: momentImagePreviewContainer
const momentImagePreviewContainer = document.getElementById('momentImagePreviewContainer');

// [VariableDeclaration] Variables: addMomentImageBtn
const addMomentImageBtn = document.getElementById('addMomentImageBtn');

// [VariableDeclaration] Variables: momentImageInput
const momentImageInput = document.getElementById('momentImageInput');

// [IfStatement] AnonymousBlock
if (postMomentBtn) {
  postMomentBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent momentsHeader click handler
    openPostMomentPage();
  });
}

// [FunctionDeclaration] Function: openPostMomentPage
function openPostMomentPage() {
  // Reset fields
  momentContentInput.value = '';
  selectedMomentImages = [];
  renderMomentImagePreviews();
  updatePublishMomentBtnState();
  showPage(postMomentPage);
}

// [IfStatement] AnonymousBlock
if (cancelPostMomentBtn) {
  cancelPostMomentBtn.addEventListener('click', () => {
    showPage(momentsPage); // Go back to Moments feed
  });
}

// [IfStatement] AnonymousBlock
if (addMomentImageBtn) {
  addMomentImageBtn.addEventListener('click', () => {
    momentImageInput.click();
  });
}

// [IfStatement] AnonymousBlock
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

// [FunctionDeclaration] Function: renderMomentImagePreviews
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

// [ExpressionStatement] Execution: Expression
window.removeMomentImage = function(index) {
  selectedMomentImages.splice(index, 1);
  renderMomentImagePreviews();
  updatePublishMomentBtnState();
};

// [IfStatement] AnonymousBlock
if (momentContentInput) {
  momentContentInput.addEventListener('input', updatePublishMomentBtnState);
}

// [FunctionDeclaration] Function: updatePublishMomentBtnState
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

// [VariableDeclaration] Variables: momentVisibilityIds
let momentVisibilityIds = [];

// [VariableDeclaration] Variables: momentIsPublic
let momentIsPublic = true;

// [ExpressionStatement] Execution: Expression
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

// [ExpressionStatement] Execution: Expression
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

// [ExpressionStatement] Execution: Expression
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

// [FunctionDeclaration] Function: updateMomentPublicRow
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

// [ExpressionStatement] Execution: Expression
window.closeMomentVisibilityPicker = function() {
  document.getElementById('momentVisibilityOverlay').style.display = 'none';
};

// [ExpressionStatement] Execution: Expression
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

// [IfStatement] AnonymousBlock
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

// [FunctionDeclaration] Function: bindMomentLongPress
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

// [FunctionDeclaration] Function: showMomentEditMenu
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

// [FunctionDeclaration] Function: deleteMomentPost
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

// [FunctionDeclaration] Function: editMomentPost
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

// [FunctionDeclaration] Function: momentEditPrompt
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

// [FunctionDeclaration] Function: bindCommentLongPress
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

// [FunctionDeclaration] Function: deleteMomentComment
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

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('click', function(e) {
    const menu = document.getElementById('momentEditMenu');
    if (menu && !menu.contains(e.target)) menu.remove();
});

// [ExpressionStatement] Execution: Expression
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

// [FunctionDeclaration] Function: toggleMomentLike
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

// [VariableDeclaration] Variables: currentMomentReplyTarget
let currentMomentReplyTarget = null;

// [ExpressionStatement] Execution: Expression
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

// [FunctionDeclaration] Function: openMomentCommentBar
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

// [FunctionDeclaration] Function: triggerAiReplyToMomentComment
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

// [ExpressionStatement] Execution: addEventListener
document.addEventListener('click', function(e) {
    const menu = document.getElementById('globalMomentActionMenu');
    if (menu && !menu.contains(e.target)) {
        menu.remove();
    }
});

// [VariableDeclaration] Variables: editingMomentPostId
let editingMomentPostId = null;

// [VariableDeclaration] Variables: currentVisibilityMode
let currentVisibilityMode = 'post';

// [ExpressionStatement] Execution: Expression
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

// [ExpressionStatement] Execution: Expression
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

// [VariableDeclaration] Variables: tagsHtml
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

// [ExpressionStatement] Execution: insertAdjacentHTML
document.body.insertAdjacentHTML('beforeend', tagsHtml);

// [VariableDeclaration] Variables: relationEditorHtml
const relationEditorHtml = `
<div id="relationActionSheet" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:10020; align-items:flex-end;">
  <div style="width:100%; background:#F7F7F7; border-radius:14px 14px 0 0; padding:10px 12px 20px; box-sizing:border-box;">
    <div id="editRelationBtn" style="background:#fff; height:52px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; color:#333; margin-bottom:8px; cursor:pointer;">编辑关系</div>
    <div id="deleteRelationBtn" style="background:#fff; height:52px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; color:#FA5151; margin-bottom:10px; cursor:pointer;">删除关系</div>
    <div id="cancelRelationActionBtn" style="background:#fff; height:52px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; color:#333; cursor:pointer;">取消</div>
  </div>
</div>
`;

// [ExpressionStatement] Execution: insertAdjacentHTML
document.body.insertAdjacentHTML('beforeend', relationEditorHtml);

// [VariableDeclaration] Variables: relationCreateModalHtml
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

// [ExpressionStatement] Execution: insertAdjacentHTML
document.body.insertAdjacentHTML('beforeend', relationCreateModalHtml);

// [IfStatement] AnonymousBlock
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

// [ExpressionStatement] Execution: push
allFullscreenPages.push(
  document.getElementById('tagsManagePage'),
  document.getElementById('tagRelationPage')
);

// [ExpressionStatement] Execution: addEventListener
document.getElementById('tagsGroupBtn').addEventListener('click', async () => {
    await renderTagGroups();
    showPage(document.getElementById('tagsManagePage'));
});

// [FunctionDeclaration] Function: renderTagGroups
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

// [ExpressionStatement] Execution: Expression
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

// [ExpressionStatement] Execution: Expression
window.deleteTagGroup = async function(id, event) {
    event.stopPropagation(); // 阻止触发编辑
    if (await customConfirm('确定要删除这个标签分组吗？\n(仅删除分组，不会删除角色)')) {
        let groups = await getData('tag_groups') || [];
        groups = groups.filter(g => g.id !== id);
        await saveData('tag_groups', groups);
        await renderTagGroups();
    }
};

// [VariableDeclaration] Variables: currentEditingTagId
let currentEditingTagId = null;

// [VariableDeclaration] Variables: tempSelectedTagMembers
let tempSelectedTagMembers = new Set();

// [ExpressionStatement] Execution: Expression
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

// [ExpressionStatement] Execution: Expression
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

// [ExpressionStatement] Execution: addEventListener
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

