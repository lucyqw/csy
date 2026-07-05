/* 模块: js/dom.js */

// [VariableDeclaration] Variables: mainApp
const mainApp = document.getElementById('mainApp');

// [VariableDeclaration] Variables: personalInfoPage
const personalInfoPage = document.getElementById('personalInfoPage');

// [VariableDeclaration] Variables: ringtoneHistoryPage
const ringtoneHistoryPage = document.getElementById('ringtoneHistoryPage');

// [VariableDeclaration] Variables: allFullscreenPages
const allFullscreenPages = [
  mainApp, personalInfoPage,
  document.getElementById('nameEditPage'), document.getElementById('genderEditPage'),
  document.getElementById('regionEditPage'), document.getElementById('patEditPage'),
  document.getElementById('signatureEditPage'), document.getElementById('phoneEditPage'),
  document.getElementById('wechatIdEditPage'), document.getElementById('ringtonePage'),
  ringtoneHistoryPage,
  document.getElementById('createCharacterPage'),
  document.getElementById('chatRoomPage'),
  document.getElementById('chatInfoPage'),
  document.getElementById('contactProfilePage'),
  document.getElementById('chatBackgroundSettingsPage'),
  document.getElementById('dataSettingsPage'),
  document.getElementById('myChatProfilePage'),
  document.getElementById('userPersonaEditPage'),
  document.getElementById('stickerLibraryPage'), 
  document.getElementById('stickerDetailPage'),
  document.getElementById('topicArchivePage'),
  // ★★★ 新增这一行 ★★★
  document.getElementById('groupSelectPage'),
  document.getElementById('groupTransferSelectPage') // ★ 新增：群聊转账选人页面
];

// [VariableDeclaration] Variables: tabItems
const tabItems = document.querySelectorAll('.tab-item');

// [VariableDeclaration] Variables: pages
const pages = document.querySelectorAll('.page');

// [VariableDeclaration] Variables: navBar
const navBar = document.querySelector('#mainApp .nav-bar');

// [VariableDeclaration] Variables: navTitle
const navTitle = document.getElementById('navTitle');

// [VariableDeclaration] Variables: profileHeader
const profileHeader = document.querySelector('.profile-header');

// [VariableDeclaration] Variables: backButton
const backButton = document.getElementById('backButton');

// [VariableDeclaration] Variables: profileAvatar
const profileAvatar = document.querySelector('.profile-avatar');

// [VariableDeclaration] Variables: profileName
const profileName = document.querySelector('.profile-name');

// [VariableDeclaration] Variables: profileIdSpan
const profileIdSpan = document.querySelector('.profile-id');

// [VariableDeclaration] Variables: avatarInput
const avatarInput = document.getElementById('avatarInput');

// [VariableDeclaration] Variables: infoAvatar
const infoAvatar = document.querySelector('.info-avatar');

// [VariableDeclaration] Variables: avatarItem
const avatarItem = document.querySelector('#personalInfoPage .discover-item:first-child');

// [VariableDeclaration] Variables: nameItem
const nameItem = document.querySelector('#personalInfoPage .discover-section:first-child .discover-item:nth-child(2)');

// [VariableDeclaration] Variables: genderItem
const genderItem = document.querySelector('#personalInfoPage .discover-section:first-child .discover-item:nth-child(3)');

// [VariableDeclaration] Variables: regionItem
const regionItem = document.querySelector('#personalInfoPage .discover-section:first-child .discover-item:nth-child(4)');

// [VariableDeclaration] Variables: phoneItem
const phoneItem = document.querySelector('#personalInfoPage .discover-section:first-child .discover-item:nth-child(5)');

// [VariableDeclaration] Variables: wechatIdItem
const wechatIdItem = document.querySelector('#personalInfoPage .discover-section:first-child .discover-item:nth-child(6)');

// [VariableDeclaration] Variables: patItem
const patItem = document.querySelector('#personalInfoPage .discover-section:first-child .discover-item:nth-child(8)');

// [VariableDeclaration] Variables: signatureItem
const signatureItem = document.querySelectorAll('#personalInfoPage .discover-section')[1].querySelector('.discover-item');

// [VariableDeclaration] Variables: userPersonaItem
const userPersonaItem = document.getElementById('userPersonaItem');

// [VariableDeclaration] Variables: userPersonaEditPage
const userPersonaEditPage = document.getElementById('userPersonaEditPage');

// [VariableDeclaration] Variables: userPersonaInput
const userPersonaInput = document.getElementById('userPersonaInput');

// [VariableDeclaration] Variables: userPersonaSaveBtn
const userPersonaSaveBtn = document.getElementById('userPersonaSaveBtn');

// [VariableDeclaration] Variables: userPersonaValueSpan
const userPersonaValueSpan = userPersonaItem.querySelector('.item-value');

// [ExpressionStatement] Execution: push
allFullscreenPages.push(userPersonaEditPage);

// [VariableDeclaration] Variables: nameValueSpan
const nameValueSpan = nameItem.querySelector('.item-value');

// [VariableDeclaration] Variables: ringtoneItem
const ringtoneItem = document.querySelectorAll('#personalInfoPage .discover-section')[2].querySelector('.discover-item');

// [VariableDeclaration] Variables: genderValueSpan
const genderValueSpan = document.createElement('span');

// [ExpressionStatement] Execution: Expression
genderValueSpan.className = 'item-value';

// [ExpressionStatement] Execution: insertBefore
genderItem.insertBefore(genderValueSpan, genderItem.querySelector('.contact-arrow'));

// [VariableDeclaration] Variables: regionValueSpan
const regionValueSpan = document.createElement('span');

// [ExpressionStatement] Execution: Expression
regionValueSpan.className = 'item-value';

// [ExpressionStatement] Execution: insertBefore
regionItem.insertBefore(regionValueSpan, regionItem.querySelector('.contact-arrow'));

// [VariableDeclaration] Variables: phoneValueSpan
const phoneValueSpan = document.createElement('span');

// [ExpressionStatement] Execution: Expression
phoneValueSpan.className = 'item-value';

// [ExpressionStatement] Execution: insertBefore
phoneItem.insertBefore(phoneValueSpan, phoneItem.querySelector('.contact-arrow'));

// [VariableDeclaration] Variables: wechatIdValueSpan
const wechatIdValueSpan = wechatIdItem.querySelector('.item-value');

// [VariableDeclaration] Variables: patValueSpan
const patValueSpan = document.createElement('span');

// [ExpressionStatement] Execution: Expression
patValueSpan.className = 'item-value';

// [ExpressionStatement] Execution: insertBefore
patItem.insertBefore(patValueSpan, patItem.querySelector('.contact-arrow'));

// [VariableDeclaration] Variables: signatureValueSpan
const signatureValueSpan = signatureItem.querySelector('.item-value');

// [VariableDeclaration] Variables: ringtoneValueSpan
const ringtoneValueSpan = document.createElement('span');

// [ExpressionStatement] Execution: Expression
ringtoneValueSpan.className = 'item-value';

// [ExpressionStatement] Execution: insertBefore
ringtoneItem.insertBefore(ringtoneValueSpan, ringtoneItem.querySelector('.contact-arrow'));

// [VariableDeclaration] Variables: nameEditPage, newNameInput, nameSaveBtn
const nameEditPage = document.getElementById('nameEditPage'), newNameInput = document.getElementById('newNameInput'), nameSaveBtn = document.getElementById('nameSaveBtn');

// [VariableDeclaration] Variables: genderEditPage, genderOptions, genderDoneBtn
const genderEditPage = document.getElementById('genderEditPage'), genderOptions = document.querySelectorAll('.gender-option'), genderDoneBtn = document.getElementById('genderDoneBtn');

// [VariableDeclaration] Variables: regionEditPage, regionInput, regionSaveBtn
const regionEditPage = document.getElementById('regionEditPage'), regionInput = document.getElementById('regionInput'), regionSaveBtn = document.getElementById('regionSaveBtn');

// [VariableDeclaration] Variables: patEditPage, patInput, patSaveBtn, patPreview
const patEditPage = document.getElementById('patEditPage'), patInput = document.getElementById('patInput'), patSaveBtn = document.getElementById('patSaveBtn'), patPreview = document.getElementById('patPreview');

// [VariableDeclaration] Variables: signatureEditPage, signatureInput, signatureSaveBtn, signatureCounter
const signatureEditPage = document.getElementById('signatureEditPage'), signatureInput = document.getElementById('signatureInput'), signatureSaveBtn = document.getElementById('signatureSaveBtn'), signatureCounter = document.getElementById('signatureCounter');

// [VariableDeclaration] Variables: phoneEditPage, phoneInput, phoneSaveBtn
const phoneEditPage = document.getElementById('phoneEditPage'), phoneInput = document.getElementById('phoneInput'), phoneSaveBtn = document.getElementById('phoneSaveBtn');

// [VariableDeclaration] Variables: wechatIdEditPage, wechatIdInput, wechatIdSaveBtn
const wechatIdEditPage = document.getElementById('wechatIdEditPage'), wechatIdInput = document.getElementById('wechatIdInput'), wechatIdSaveBtn = document.getElementById('wechatIdSaveBtn');

// [VariableDeclaration] Variables: ringtonePage, ringtonePreviewBtn, ringtoneName, showRingtoneModalBtn, ringtoneChangeModal, ringtoneUrlInput, ringtoneFileInput, fileNameSpan, ringtoneNameInput, cancelRingtoneChange, saveRingtoneChange, ringtonePlayer
const ringtonePage = document.getElementById('ringtonePage'), ringtonePreviewBtn = document.getElementById('ringtonePreviewBtn'), ringtoneName = document.getElementById('ringtoneName'), showRingtoneModalBtn = document.getElementById('showRingtoneModalBtn'), ringtoneChangeModal = document.getElementById('ringtoneChangeModal'), ringtoneUrlInput = document.getElementById('ringtoneUrlInput'), ringtoneFileInput = document.getElementById('ringtoneFileInput'), fileNameSpan = document.getElementById('fileName'), ringtoneNameInput = document.getElementById('ringtoneNameInput'), cancelRingtoneChange = document.getElementById('cancelRingtoneChange'), saveRingtoneChange = document.getElementById('saveRingtoneChange'), ringtonePlayer = document.getElementById('ringtonePlayer');

// [VariableDeclaration] Variables: ringtoneHistoryList
const ringtoneHistoryList = document.getElementById('ringtoneHistoryList');

// [VariableDeclaration] Variables: historyLinkBtn
const historyLinkBtn = document.querySelector('#ringtonePage .nav-bar > span');

// [VariableDeclaration] Variables: historyMenuBtn
const historyMenuBtn = document.getElementById('historyMenuBtn');

// [VariableDeclaration] Variables: historyActionSheetOverlay
const historyActionSheetOverlay = document.getElementById('historyActionSheetOverlay');

// [VariableDeclaration] Variables: multiSelectDeleteBtn
const multiSelectDeleteBtn = document.getElementById('multiSelectDeleteBtn');

// [VariableDeclaration] Variables: clearHistoryBtn
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// [VariableDeclaration] Variables: cancelActionBtn
const cancelActionBtn = document.getElementById('cancelActionBtn');

// [VariableDeclaration] Variables: multiDeleteBar
const multiDeleteBar = document.getElementById('multiDeleteBar');

// [VariableDeclaration] Variables: deleteSelectedBtn
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');

// [VariableDeclaration] Variables: cancelMultiDeleteBtn
const cancelMultiDeleteBtn = document.getElementById('cancelMultiDeleteBtn');

// [VariableDeclaration] Variables: originalValues
let originalValues = { name: '', gender: '', region: '', pat: '', signature: '', phone: '', wechatId: '', ringtone: null };

// [VariableDeclaration] Variables: currentRingtone
let currentRingtone = null;

// [VariableDeclaration] Variables: ringtoneHistory
let ringtoneHistory = [];

