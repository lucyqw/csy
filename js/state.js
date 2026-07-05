/* 模块: js/state.js */

// [Variable] fabContainer
const fabContainer = document.getElementById('fab-container');

// [Variable] fabMain
const fabMain = document.getElementById('fab-main');

// [Variable] fabActionsContainer
const fabActionsContainer = document.getElementById('fab-actions-container');

// [Variable] launcherScreen
const launcherScreen = document.getElementById('phone-screen');

// [Variable] appViewer
const appViewer = document.getElementById('app-viewer');

// [Variable] appIframe
const appIframe = document.getElementById('app-iframe-main');

// [Variable] appGrid
const appGrid = document.getElementById('app-grid');

// [Variable] toastMsg
const toastMsg = document.getElementById('toast-msg');

// [Variable] currentOpenAppId
let currentOpenAppId = null;

// [Variable] progressSaveInterval
let progressSaveInterval = null;

// [Variable] addAppModal
const addAppModal = document.getElementById('add-app-modal');

// [Variable] addAppForm
const addAppForm = document.getElementById('add-app-form');

// [Variable] cancelAddAppBtn
const cancelAddAppBtn = document.getElementById('cancel-add-app');

// [Variable] settingsModal
const settingsModal = document.getElementById('settings-modal');

// [Variable] settingsAppList
const settingsAppList = document.getElementById('settings-app-list');

// [Variable] closeSettingsModalBtn
const closeSettingsModalBtn = document.getElementById('close-settings-modal');

// [Variable] statusTimeEl
const statusTimeEl = document.getElementById('status-time');

// [Variable] widgetGreetingEl
const widgetGreetingEl = document.getElementById('widget-greeting');

// [Variable] widgetDateEl
const widgetDateEl = document.getElementById('widget-date');

// [Variable] widgetTimeEl
const widgetTimeEl = document.getElementById('widget-time');

// [Variable] STORAGE_KEY
const STORAGE_KEY = 'ephone_custom_apps_desktop';

// [Variable] RECYCLE_BIN_KEY
const RECYCLE_BIN_KEY = 'ephone_recycle_bin';

// [Variable] LARGE_ICONS_KEY
const LARGE_ICONS_KEY = 'ephone_large_icons';

// [Variable] RECYCLE_BIN_SETTINGS_KEY
const RECYCLE_BIN_SETTINGS_KEY = 'ephone_recycle_bin_settings';

// [Variable] LAYOUT_KEY
const LAYOUT_KEY = 'ephone_layout_settings';

// [Variable] FAB_ICON_KEY
const FAB_ICON_KEY = 'ephone_fab_icon';

// [Variable] FAB_SHAPE_KEY
const FAB_SHAPE_KEY = 'ephone_fab_shape';

// [Variable] FAB_EXPANDED_ICON_KEY
const FAB_EXPANDED_ICON_KEY = 'ephone_fab_expanded_icon';

// [Variable] FAB_DRAG_ICON_KEY
const FAB_DRAG_ICON_KEY = 'ephone_fab_drag_icon';

// [Variable] FONT_SETTINGS_KEY
const FONT_SETTINGS_KEY = 'ephone_font_settings';

// [Variable] DOCK_APPS_KEY
const DOCK_APPS_KEY = 'ephone_dock_apps';

// [Variable] ICON_SHAPE_KEY
const ICON_SHAPE_KEY = 'ephone_icon_shape';

// [Variable] FAB_SIZE_KEY
const FAB_SIZE_KEY = 'ephone_fab_size';

// [Variable] TIME_WIDGET_STYLE_KEY
const TIME_WIDGET_STYLE_KEY = 'ephone_time_widget_style';

// [Variable] FAB_WAKE_METHOD_KEY
const FAB_WAKE_METHOD_KEY = 'ephone_fab_wake_method';

// [Variable] API_SETTINGS_KEY
const API_SETTINGS_KEY = 'ephone_api_settings';

// [Variable] API_PRESETS_KEY
const API_PRESETS_KEY = 'ephone_api_presets';

// [Variable] SECONDARY_API_SETTINGS_KEY
const SECONDARY_API_SETTINGS_KEY = 'ephone_secondary_api_settings';

// [Variable] API_USAGE_CONFIG_KEY
const API_USAGE_CONFIG_KEY = 'ephone_api_usage_config';

// [Variable] API_ACTIVE_MSG_CONFIG_KEY
const API_ACTIVE_MSG_CONFIG_KEY = 'ephone_active_msg_config';

// [Variable] defaultDockAppIcons
const defaultDockAppIcons = {};

// [Variable] pageIndicators
const pageIndicators = document.getElementById('page-indicators');

// [Variable] menuIconSvg
const menuIconSvg = '<svg viewBox="0 0 24 24"><path d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1z"/></svg>';

// [Variable] closeIconSvg
const closeIconSvg = '<svg viewBox="0 0 24 24"><path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7a.996.996 0 1 0-1.41 1.41L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/></svg>';

// [Variable] paginationTouchHandlers
let paginationTouchHandlers = null;

// [Variable] recycleBinModal
const recycleBinModal = document.getElementById('recycle-bin-modal');

// [Variable] recycleBinList
const recycleBinList = document.getElementById('recycle-bin-list');

// [Variable] closeRecycleBinModalBtn
const closeRecycleBinModalBtn = document.getElementById('close-recycle-bin-modal');

// [Variable] MEMO_KEY
const MEMO_KEY = 'ephone_memos';

// [Variable] memoModal
const memoModal = document.getElementById('memo-modal');

// [Variable] memoEditModal
const memoEditModal = document.getElementById('memo-edit-modal');

// [Variable] memoList
const memoList = document.getElementById('memo-list');

// [Variable] memoEditForm
const memoEditForm = document.getElementById('memo-edit-form');

// [Variable] memoItemsContainer
const memoItemsContainer = document.getElementById('memo-items-container');

// [Variable] currentEditingMemoId
let currentEditingMemoId = null;

// [Variable] recycleBinSettingsModal
const recycleBinSettingsModal = document.getElementById('recycle-bin-settings-modal');

// [Variable] recycleBinSettingsForm
const recycleBinSettingsForm = document.getElementById('recycle-bin-settings-form');

// [Variable] cancelRecycleBinSettingsBtn
const cancelRecycleBinSettingsBtn = document.getElementById('cancel-recycle-bin-settings');

// [Variable] importExportModal
const importExportModal = document.getElementById('import-export-modal');

// [Variable] closeImportExportModalBtn
const closeImportExportModalBtn = document.getElementById('close-import-export-modal-btn');

// [Variable] themeModal
const themeModal = document.getElementById('theme-modal');

// [Variable] themeForm
const themeForm = document.getElementById('theme-form');

// [Variable] closeThemeModalBtn
const closeThemeModalBtn = document.getElementById('close-theme-modal');

// [Variable] wallpaperDiv
const wallpaperDiv = document.getElementById('wallpaper');

// [Variable] WALLPAPER_KEY
const WALLPAPER_KEY = 'ephone_wallpaper_url';

// [Variable] pendingThemeRestores
let pendingThemeRestores = { wallpaper: false, fabIcon: false, font: false, global: false };

// [Variable] currentLargeIconSlot
let currentLargeIconSlot = null;

// [Variable] changeIconModal
const changeIconModal = document.getElementById('change-icon-modal');

// [Variable] changeIconForm
const changeIconForm = document.getElementById('change-icon-form');

// [Variable] cancelChangeIconBtn
const cancelChangeIconBtn = document.getElementById('cancel-change-icon');

// [Variable] currentEditingAppInfo
let currentEditingAppInfo = null;

// [Variable] enterFullscreenSvg
const enterFullscreenSvg = '<svg viewBox="0 0 24 24" fill="#555"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';

// [Variable] exitFullscreenSvg
const exitFullscreenSvg = '<svg viewBox="0 0 24 24" fill="#555"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>';

// [Variable] isDragging, hasMoved, startX, startY, initialLeft, initialTop
let isDragging = false, hasMoved = false, startX, startY, initialLeft, initialTop;

// [Variable] dragThreshold
const dragThreshold = 5;

// [Variable] userWantsFullscreen
let userWantsFullscreen = false;

// [Variable] fileDialogOpen
let fileDialogOpen = false;

// [Variable] fullscreenRetryCount
let fullscreenRetryCount = 0;

// [Variable] MAX_RETRY
const MAX_RETRY = 5;

// [Variable] lastFullscreenAttempt
let lastFullscreenAttempt = 0;

// [Variable] originalTimeWidgetStyle
let originalTimeWidgetStyle = null;

// [Variable] originalTimeWidgetCSS
const originalTimeWidgetCSS = `/* 
  小鱼AI提示：这是时间插件最原始的CSS代码！
  您可以把它当作一个模板，在此基础上修改。
*/

/* 整体容器样式 */
#time-widget {
  /* (关键!) 声明“我是定位的基准”，这样里面的小元素才能相对于我来移动。 */
  position: relative; 
  
  /* (关键!) 隐藏超出圆角边框的内容，比如花纹。 */
  overflow: hidden; 
  
  /* 边框样式: 粗细 样式 颜色 */
  border: 4px solid #FFC0CB; 
  
  /* 文字颜色 (问候语/日期) */
  color: #8B5A2B;
  
  /* 鼠标放上去时，变成小手的形状 */
  cursor: pointer;
  
  /* 阴影效果: x偏移 y偏移 模糊度 颜色 */
  box-shadow: 0 4px 12px rgba(212, 175, 155, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  
  /* 所有变化的过渡动画效果，持续0.3秒 */
  transition: all 0.3s ease;
}

/* 鼠标悬停时的效果 */
#time-widget:hover {
  /* 向上移动2像素 */
  transform: translateY(-2px);
  
  /* 阴影变得更明显 */
  box-shadow: 0 6px 16px rgba(212, 175, 155, 0.4);
}

/* (高级技巧) 这是插件的"背景层"，专门用来放背景色、背景图和花纹，
   好处是它的透明度不会影响到上面的文字。*/
#time-widget::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  
  /* 背景颜色 */
  background-color: #FFFBEB;
  
  /* 背景图片设置 */
  background-size: cover;        /* 让图片覆盖整个区域，保持比例 */
  background-position: center;   /* 让图片居中显示 */
  background-repeat: no-repeat;  /* 不重复平铺图片 */
  
  /* 背景透明度 (0=完全透明, 1=完全不透明) */
  opacity: 1;
  
  /* 圆角，与外层容器保持一致 */
  border-radius: 20px;
  
  /* (关键!) 把它放到所有文字内容的下面，免得挡住文字。 */
  z-index: -1; 
}

/* 问候语/日期 样式 */
#widget-greeting, #widget-date {
  /* 文字大小 */
  font-size: 16px;
}

/* 时间数字 样式 */
#widget-time {
  /* 时间颜色 */
  color: #5D4037;
  
  /* 时间大小 */
  font-size: 64px;
}

/* --- 以下是各种花纹的样式，您可以修改颜色、大小、间距 --- */

/* 彩色波点花纹 */
#time-widget.pattern-dots::before {
  background-image: radial-gradient(circle at 15% 20%, rgba(255, 182, 193, 0.5) 8px, transparent 8px), radial-gradient(circle at 85% 15%, rgba(173, 216, 230, 0.5) 6px, transparent 6px), radial-gradient(circle at 25% 75%, rgba(255, 218, 185, 0.5) 7px, transparent 7px), radial-gradient(circle at 70% 80%, rgba(221, 160, 221, 0.5) 5px, transparent 5px), radial-gradient(circle at 45% 40%, rgba(255, 245, 157, 0.5) 6px, transparent 6px), radial-gradient(circle at 90% 60%, rgba(152, 251, 152, 0.5) 8px, transparent 8px), radial-gradient(circle at 10% 50%, rgba(255, 192, 203, 0.5) 5px, transparent 5px), radial-gradient(circle at 60% 25%, rgba(176, 224, 230, 0.5) 7px, transparent 7px);
}

/* 斜纹波浪花纹 */
#time-widget.pattern-waves::before {
  background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 192, 203, 0.15) 10px, rgba(255, 192, 203, 0.15) 20px);
}

/* 网格纹理花纹 */
#time-widget.pattern-grid::before {
  background-image: linear-gradient(rgba(255, 192, 203, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 192, 203, 0.2) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 星星点点花纹 */
#time-widget.pattern-stars::before {
  background-image: radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.6) 3px, transparent 3px), radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.5) 4px, transparent 4px), radial-gradient(circle at 30% 80%, rgba(255, 215, 0, 0.4) 2px, transparent 2px), radial-gradient(circle at 70% 70%, rgba(255, 215, 0, 0.5) 3px, transparent 3px), radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.6) 2px, transparent 2px), radial-gradient(circle at 90% 85%, rgba(255, 215, 0, 0.4) 3px, transparent 3px), radial-gradient(circle at 15% 60%, rgba(255, 215, 0, 0.5) 2px, transparent 2px);
}

/* 泡泡气球花纹 */
#time-widget.pattern-bubbles::before {
  background-image: radial-gradient(circle at 25% 25%, rgba(173, 216, 230, 0.3) 15px, transparent 15px), radial-gradient(circle at 75% 30%, rgba(255, 182, 193, 0.25) 20px, transparent 20px), radial-gradient(circle at 50% 70%, rgba(221, 160, 221, 0.3) 18px, transparent 18px), radial-gradient(circle at 15% 75%, rgba(255, 218, 185, 0.25) 12px, transparent 12px), radial-gradient(circle at 85% 75%, rgba(152, 251, 152, 0.3) 16px, transparent 16px);
}
`;

// [Variable] focusTimer
let focusTimer;

// [Variable] blurTime
let blurTime = 0;

// [Variable] lastCheckTime
let lastCheckTime = Date.now();

// [Variable] WORLD_BOOK_KEY
const WORLD_BOOK_KEY = 'ephone_world_book';

// [Variable] SHARED_WORLD_BOOK_KEY
const SHARED_WORLD_BOOK_KEY = 'wechat_world_book_shared';

// [Variable] currentEditingEntryId
let currentEditingEntryId = null;

// [Variable] MEMORY_KEY
const MEMORY_KEY = 'ephone_ai_memories';

// [Variable] currentMemoryMode
let currentMemoryMode = 'normal';

// [Variable] currentActiveCharId
let currentActiveCharId = null;

// [Variable] currentActiveCharName
let currentActiveCharName = null;

// [Variable] WX_DB_NAME
const WX_DB_NAME = 'WeChatDB';

// [Variable] WX_STORE
const WX_STORE = 'userProfile';

// [Variable] activeMsgTimer
let activeMsgTimer = null;

// [Variable] notifTimer
let notifTimer = null;

// [Variable] notifQueueTimer
let notifQueueTimer = null;

// [Variable] currentNotifChatId
let currentNotifChatId = null;

// [Variable] notifMessageQueue
let notifMessageQueue = [];

// [Variable] notifCurrentIndex
let notifCurrentIndex = 0;

// [Variable] notifIsSequencePlaying
let notifIsSequencePlaying = false;

// [Variable] notifCurrentDismissResolver
let notifCurrentDismissResolver = null;

// [Variable] notifTouchStartX
let notifTouchStartX = 0;

// [Variable] notifTouchStartY
let notifTouchStartY = 0;

// [Variable] notifTouchCurrentX
let notifTouchCurrentX = 0;

// [Variable] notifTouchCurrentY
let notifTouchCurrentY = 0;

// [Variable] notifIsDragging
let notifIsDragging = false;

// [Variable] notifHasSwipedToClose
let notifHasSwipedToClose = false;

// [Variable] notifSwipeDirectionLock
let notifSwipeDirectionLock = '';

