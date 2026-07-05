/* 模块: js/chat-settings.js */

// [VariableDeclaration] Variables: dataSettingsPage
const dataSettingsPage = document.getElementById('dataSettingsPage');

// [VariableDeclaration] Variables: cpMoreBtn
const cpMoreBtn = document.getElementById('cpMoreBtn');

// [VariableDeclaration] Variables: dsBackBtn
const dsBackBtn = document.getElementById('dsBackBtn');

// [VariableDeclaration] Variables: dsDeleteBtn
const dsDeleteBtn = document.getElementById('dsDeleteBtn');

// [VariableDeclaration] Variables: dsEditRemarkRow
const dsEditRemarkRow = document.getElementById('dsEditRemarkRow');

// [IfStatement] AnonymousBlock
if (cpMoreBtn) {
  cpMoreBtn.addEventListener('click', () => {
    showPage(dataSettingsPage);
  });
}

// [IfStatement] AnonymousBlock
if (dsBackBtn) {
  dsBackBtn.addEventListener('click', () => {
    showPage(document.getElementById('contactProfilePage'));
  });
}

// [IfStatement] AnonymousBlock
if (dsEditRemarkRow) {
  dsEditRemarkRow.addEventListener('click', async () => {
    if (!currentChatId) return;
    
    // ★ 小鱼新增：编辑前，先获取当前的旧昵称记录下来
    const beforeContacts = await getData('customContacts') || [];
    const oldContact = beforeContacts.find(c => c.id === currentChatId);
    const oldNickname = oldContact ? oldContact.nickname : null;

    // 清除覆盖数据并进入编辑
    const overrides = await getData('contactOverrides') || {};
    delete overrides[currentChatId];
    await saveData('contactOverrides', overrides);
    
    // 呼出原生编辑界面，等待用户编辑完成
    await editCharacter(currentChatId);
    pageTitle.textContent = "设置备注和标签";

    // ★ 小鱼新增：编辑完成后，获取新昵称并扫描全库替换旧昵称
    if (oldNickname) {
        const afterContacts = await getData('customContacts') || [];
        const newContact = afterContacts.find(c => c.id === currentChatId);
        const newNickname = newContact ? newContact.nickname : null;

        // 如果名字真的发生了改变，执行全面清理和数据同步
        if (newNickname && oldNickname !== newNickname) {
            console.log(`检测到改名：【${oldNickname}】 -> 【${newNickname}】，开始同步数据...`);
            
            // 同步一：群聊历史消息中的发送者名称
            const groups = afterContacts.filter(c => c.isGroup);
            for (const group of groups) {
                const chatKey = 'chat_messages_' + group.id;
                let chatMsgs = await getData(chatKey) || [];
                let changed = false;
                chatMsgs.forEach(msg => {
                    if (msg.senderName === oldNickname) {
                        msg.senderName = newNickname;
                        changed = true;
                    }
                });
                if (changed) await saveData(chatKey, chatMsgs);
            }

            // 同步二：朋友圈的作者名、点赞列表、评论列表
            let moments = await getData('moments_posts') || [];
            let momentsChanged = false;
            moments.forEach(post => {
                if (post.authorName === oldNickname) {
                    post.authorName = newNickname;
                    momentsChanged = true;
                }
                if (post.likes && post.likes.includes(oldNickname)) {
                    post.likes = post.likes.map(name => name === oldNickname ? newNickname : name);
                    momentsChanged = true;
                }
                if (post.comments) {
                    post.comments.forEach(comment => {
                        if (comment.authorName === oldNickname) {
                            comment.authorName = newNickname;
                            momentsChanged = true;
                        }
                        if (comment.replyToAuthorName === oldNickname) {
                            comment.replyToAuthorName = newNickname;
                            momentsChanged = true;
                        }
                    });
                }
            });
            if (momentsChanged) await saveData('moments_posts', moments);

            // 提示用户同步已完成
            if(typeof customAlert === 'function') {
                customAlert(`检测到角色已改名为“${newNickname}”\n对应的历史群聊记录及朋友圈相关数据已全部同步更新完成！`);
            }
        }
    }
  });
}

// [IfStatement] AnonymousBlock
if (dsDeleteBtn) {
  dsDeleteBtn.addEventListener('click', async () => {
    if (await customConfirm('将联系人删除，同时删除与该联系人的聊天记录？')) {
      let contacts = await getData('customContacts') || [];

      // ★★★ 小鱼新增：遍历所有群聊，将该角色从成员列表中移除 ★★★
      contacts.forEach(c => {
        if (c.isGroup && Array.isArray(c.memberIds)) {
          // 过滤掉当前要删除的ID
          c.memberIds = c.memberIds.filter(mid => mid !== currentChatId);
        }
      });

      // 1. 删除通讯录数据 (过滤掉被删除的人)
      contacts = contacts.filter(c => c.id !== currentChatId);
      await saveData('customContacts', contacts);
      
      // 2. 删除聊天记录
      await saveData('chat_messages_' + currentChatId, []);
      
      // 3. 删除会话列表
      let sessions = await getData('chat_sessions') || [];
      sessions = sessions.filter(s => s.id !== currentChatId);
      await saveData('chat_sessions', sessions);
      
      // 4. 删除覆盖数据
      const overrides = await getData('contactOverrides') || {};
      delete overrides[currentChatId];
      
      await saveData('contactOverrides', overrides);

      // 5. 刷新界面并返回首页
      renderCustomContacts(contacts);
      await renderChatList();
      showPage(mainApp);
    }
  });
}

// [ExpressionStatement] Execution: Expression
window.openMyChatProfile = async function() {
  if (!currentChatId) return;
  
  // 关闭底部面板
  closeActionSheet();
  
  // 1. 获取专属资料
  const chatProfiles = await getData('my_chat_profiles') || {};
  const localProfile = chatProfiles[currentChatId]; // 可能为 undefined
  
  // 2. 获取全局资料
  const [gName, gGender, gRegion, gAvatar, gPersona] = await Promise.all([
      getData('userName'), 
      getData('gender'), 
      getData('region'), 
      getData('avatar'), 
      getData('userPersona')
  ]);

  // 3. 决定显示什么 (如果设定了专属资料就用专属的，否则预填全局资料)
  // 注意：如果 localProfile 存在，即使属性为空字符串，也应该显示为空（代表用户特意清空了）
  // 但如果 localProfile 根本不存在，则显示全局资料
  
  const nickname = localProfile ? (localProfile.nickname || '') : (gName || '');
  const gender = localProfile ? (localProfile.gender || '') : (gGender || '');
  const region = localProfile ? (localProfile.region || '') : (gRegion || '');
  const persona = localProfile ? (localProfile.persona || '') : (gPersona || '');
  
  // 头像逻辑
  let displayAvatar = '';
  if (localProfile && localProfile.avatar !== undefined) {
      displayAvatar = localProfile.avatar; // 可能是 null
  } else {
      displayAvatar = gAvatar; // 预填全局头像
  }

  // ★★★ 关键：初始化临时头像变量，确保不修改直接保存时也能保存全局头像
  tempMcpAvatar = displayAvatar || '';

  // 4. 回填到界面
  document.getElementById('mcpNickname').value = nickname;
  document.getElementById('mcpGender').value = gender;
  document.getElementById('mcpRegion').value = region;
  document.getElementById('mcpPersona').value = persona;
  
  const avatarPreview = document.getElementById('mcpAvatarPreview');
  if (displayAvatar) {
    avatarPreview.style.backgroundImage = `url(${displayAvatar})`;
    avatarPreview.textContent = '';
  } else {
    avatarPreview.style.backgroundImage = '';
    avatarPreview.textContent = '点击更换';
  }
  
  showPage(document.getElementById('myChatProfilePage'));
};

// [VariableDeclaration] Variables: tempMcpAvatar
let tempMcpAvatar = '';

// [ExpressionStatement] Execution: addEventListener
document.getElementById('mcpAvatarPreview').addEventListener('click', () => {
  document.getElementById('mcpAvatarInput').click();
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('mcpAvatarInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (event) => {
      tempMcpAvatar = event.target.result;
      const preview = document.getElementById('mcpAvatarPreview');
      preview.style.backgroundImage = `url(${tempMcpAvatar})`;
      preview.textContent = '';
    };
    reader.readAsDataURL(file);
  }
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('mcpSaveBtn').addEventListener('click', async () => {
  if (!currentChatId) return;
  
  // 收集表单数据
  const newProfile = {
    nickname: document.getElementById('mcpNickname').value.trim(),
    gender: document.getElementById('mcpGender').value,
    region: document.getElementById('mcpRegion').value.trim(),
    persona: document.getElementById('mcpPersona').value.trim(),
    avatar: tempMcpAvatar || null
  };
  
  // 保存到数据库
  const chatProfiles = await getData('my_chat_profiles') || {};
  chatProfiles[currentChatId] = newProfile;
  await saveData('my_chat_profiles', chatProfiles);
  
  // 更新聊天窗口的头像显示
  updateChatUserAvatar();
  
  customAlert('保存成功');
  showPage(document.getElementById('chatRoomPage'));
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('mcpBackBtn').addEventListener('click', () => {
  showPage(document.getElementById('chatRoomPage'));
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('mcpRestoreBtn').addEventListener('click', async () => {
  if (!currentChatId) return;
  
  if (await customConfirm('确定要将当前聊天的资料恢复为全局设置吗？')) {
    // 1. 读取全局资料
    const [gName, gGender, gRegion, gAvatar, gPersona] = await Promise.all([
        getData('userName'), 
        getData('gender'), 
        getData('region'), 
        getData('avatar'), 
        getData('userPersona')
    ]);
    
    // 2. 填充到表单
    document.getElementById('mcpNickname').value = gName || '';
    document.getElementById('mcpGender').value = gGender || '';
    document.getElementById('mcpRegion').value = gRegion || '';
    document.getElementById('mcpPersona').value = gPersona || '';
    
    const avatarPreview = document.getElementById('mcpAvatarPreview');
    if (gAvatar) {
      avatarPreview.style.backgroundImage = `url(${gAvatar})`;
      avatarPreview.textContent = '';
      tempMcpAvatar = gAvatar;
    } else {
      avatarPreview.style.backgroundImage = '';
      avatarPreview.textContent = '点击更换';
      tempMcpAvatar = '';
    }
    
    customAlert('已恢复为全局资料，请点击右上角"保存"按钮');
  }
});

// [FunctionDeclaration] Function: updateChatUserAvatar
async function updateChatUserAvatar() {
  const chatProfiles = await getData('my_chat_profiles') || {};
  const profile = chatProfiles[currentChatId];
  
  if (profile && profile.avatar) {
    userAvatarUrl = profile.avatar; // 更新全局变量
  } else {
    userAvatarUrl = await getData('avatar') || ''; // 使用全局头像
  }
  
  // 刷新已显示的消息头像
  document.querySelectorAll('.message-bubble.self .msg-avatar').forEach(avatar => {
    if (userAvatarUrl) {
      avatar.style.backgroundImage = `url(${userAvatarUrl})`;
      avatar.textContent = '';
    } else {
      avatar.style.backgroundImage = '';
      avatar.textContent = '我';
    }
  });
}

