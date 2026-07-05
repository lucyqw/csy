/* 模块: js/profile.js */

// [FunctionDeclaration] Function: refreshProfilePageDisplay
async function refreshProfilePageDisplay() {
    const contact = await getContactDetails(currentChatId);
    if (!contact) return;
    
    const cpAvatar = document.getElementById('cpAvatar');
    const cpNickname = document.getElementById('cpNickname');
    
    if (contact.avatar) {
        cpAvatar.style.backgroundImage = `url(${contact.avatar})`;
        cpAvatar.innerHTML = '';
    } else {
        cpAvatar.style.backgroundImage = '';
        cpAvatar.innerHTML = contact.nickname[0];
    }
    cpNickname.textContent = contact.nickname;
}

// [FunctionDeclaration] Function: loadUserData
async function loadUserData() {
    try {
      await initDB();
      // 小鱼修改：增加了 userPersona (我的人设) 的读取
const [avatar, userName, gender, region, phone, wechatId, pat, signature, ringtone, history, userPersona] = await Promise.all([
  getData('avatar'), getData('userName'), getData('gender'), getData('region'),
  getData('phone'), getData('wechatId'), getData('pat'), getData('signature'), 
  getData('ringtone'), getData('ringtoneHistory'), getData('userPersona')
]);

// 小鱼新增：显示人设
if(userPersonaValueSpan) userPersonaValueSpan.textContent = userPersona || '未设置';

      if (avatar) {
        profileAvatar.style.backgroundImage = `url(${avatar})`;
        profileAvatar.style.backgroundSize = 'cover';
        profileAvatar.textContent = '';
        infoAvatar.style.backgroundImage = `url(${avatar})`;
        infoAvatar.style.backgroundSize = 'cover';
      }
      
      // ★★★ 小鱼修改：生成用户默认微信号 user_拼音 ★★★
let defaultUserWxId = 'user_unknown';
if (userName && userName.trim()) {
  try {
    const py = window.pinyinPro.pinyin(userName, { toneType: 'none', type: 'array' }).join('');
    defaultUserWxId = 'user_' + py.toLowerCase();
  } catch (e) {
    defaultUserWxId = 'user_' + userName.toLowerCase().replace(/\s+/g, '');
  }
}

profileName.textContent = userName || 'user';
nameValueSpan.textContent = userName || '未设置';
genderValueSpan.textContent = gender || '未设置';
regionValueSpan.textContent = region || '未设置';
phoneValueSpan.textContent = phone || '未设置';
wechatIdValueSpan.textContent = wechatId || defaultUserWxId;
profileIdSpan.textContent = `微信号: ${wechatId || defaultUserWxId}`;
      patValueSpan.textContent = pat || '未设置';
      signatureValueSpan.textContent = signature || '未填写';
      
      ringtoneHistory = history || [];
      
      if (ringtone) {
        currentRingtone = ringtone;
        ringtonePlayer.src = ringtone.src;
        ringtoneName.textContent = ringtone.name;
        ringtoneValueSpan.textContent = ringtone.name;
      } else {
        currentRingtone = { src: '', name: '微信' };
        ringtoneName.textContent = '微信';
        ringtoneValueSpan.textContent = '默认';
      }
      
      renderRingtoneHistory();
    } catch (error) {
      console.error('数据加载失败:', error);
    }
  }

// [VariableDeclaration] Variables: originalLoadUserData
const originalLoadUserData = loadUserData;

// [ExpressionStatement] Execution: Expression
loadUserData = async function() {
  await originalLoadUserData();
  try {
    const contacts = await getData('customContacts') || [];
    renderCustomContacts(contacts);
  } catch (e) {
    console.log('暂无自定义联系人');
  }
};

