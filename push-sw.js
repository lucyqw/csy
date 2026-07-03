/**
 * Push Service Worker — Csy-OS
 * 
 * Handles:
 *   1. Web Push events → Show system notifications (message bombing style)
 *   2. Notification click → postMessage to React page OR open new window
 */

const SW_VERSION = '2026-07-01-cache-repair-1';
const APP_NOTIFICATION_NAME = 'Csy-OS';
const DEFAULT_NOTIFICATION_BODY = '发来了一条新消息';
const MAX_NOTIFICATION_BODY_LENGTH = 120;
const MAX_NOTIFICATION_TITLE_LENGTH = 24;
const BILINGUAL_MARKER_RE = /%%\s*BILINGUAL\s*%%/gi;
const URL_RE = /\bhttps?:\/\/[^\s"'<>，。；！？、)）\]]+/gi;
const BARE_DOMAIN_RE = /\b(?:[a-z0-9-]+\.)+(?:com|net|org|dev|app|io|cn|xyz|site|top|me|cc|vip|pages)(?:\/[^\s"'<>，。；！？、)）\]]*)?/gi;
const TECHNICAL_DETAIL_LINE_RE = /^\s*(?:URL|Request URL|Final Request URL|finalRequestURL|Final Base URL|finalBaseURL|Base URL|Endpoint|Response|Trace|Stack)\s*[:：].*$/gim;

self.addEventListener('install', function(event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
    event.waitUntil((async function() {
        if (self.caches && caches.keys) {
            const keys = await caches.keys();
            await Promise.all(keys.map(function(key) { return caches.delete(key); }));
        }
        if (self.clients && clients.claim) {
            await clients.claim();
        }
    })());
});

self.addEventListener('message', function(event) {
    if (!event.data || event.data.type !== 'CSY_OS_CLEAR_RUNTIME_CACHES') return;

    event.waitUntil((async function() {
        if (self.caches && caches.keys) {
            const keys = await caches.keys();
            await Promise.all(keys.map(function(key) { return caches.delete(key); }));
        }
    })());
});

function truncateNotificationText(value, maxLength) {
    if (value.length <= maxLength) return value;
    return value.slice(0, Math.max(0, maxLength - 1)).trimEnd() + '…';
}

function formatNotificationTitle(title) {
    const normalized = String(title || '')
        .replace(URL_RE, '')
        .replace(BARE_DOMAIN_RE, '')
        .replace(/<[^>\n]{1,80}>/g, '')
        .replace(/[·•|｜]+$/g, '')
        .trim();

    if (!normalized || /^CSY-Sully\s*OS$/i.test(normalized) || /^CSY-SullyOS$/i.test(normalized)) {
        return APP_NOTIFICATION_NAME;
    }

    if (normalized === APP_NOTIFICATION_NAME || /来消息了|发来消息|发来了一条消息/.test(normalized)) {
        return truncateNotificationText(normalized, MAX_NOTIFICATION_TITLE_LENGTH);
    }

    return truncateNotificationText(normalized + ' 来消息了', MAX_NOTIFICATION_TITLE_LENGTH);
}

function normalizeVoicePreview(value) {
    const durationMatch = value.match(/[【\[]语音(?:消息)?[：:]\s*\d+\s*(?:秒|s|sec)?[】\]]\s*["“”「『]?([\s\S]*?)["“”」』]?\s*$/);
    if (durationMatch && durationMatch[1] && durationMatch[1].trim()) {
        return '语音消息：' + durationMatch[1].trim();
    }

    const wrappedMatch = value.match(/^[\s\S]*?[【\[]语音(?:消息)?[：:]\s*([\s\S]+?)\s*[】\]][\s\S]*$/);
    if (wrappedMatch && wrappedMatch[1] && wrappedMatch[1].trim()) {
        return '语音消息：' + wrappedMatch[1].trim();
    }

    const xmlMatch = value.match(/<语音>([\s\S]+?)<\/语音>/i);
    if (xmlMatch && xmlMatch[1] && xmlMatch[1].trim()) {
        return '语音消息：' + xmlMatch[1].trim();
    }

    return value;
}

function normalizeEmojiPreview(value) {
    const sendEmojiMatch = value.match(/\[\[SEND_EMOJI:\s*([^\]]+?)\s*\]\]/i);
    if (sendEmojiMatch && sendEmojiMatch[1] && sendEmojiMatch[1].trim()) {
        return '发来一个表情：' + sendEmojiMatch[1].trim();
    }
    return value;
}

function formatNotificationBody(content) {
    let normalized = String(content || '')
        .replace(BILINGUAL_MARKER_RE, '\n')
        .replace(/\r\n?/g, '\n')
        .trim();

    normalized = normalizeEmojiPreview(normalized);
    normalized = normalizeVoicePreview(normalized);

    normalized = normalized
        .replace(TECHNICAL_DETAIL_LINE_RE, '\n')
        .replace(URL_RE, '')
        .replace(BARE_DOMAIN_RE, '')
        .replace(/<\/?(?:翻译|原文|译文|语音|think|thinking|reasoning)[^>]*>/gi, '\n')
        .replace(/<[^>\n]{1,80}>/g, '\n')
        .replace(/[`*_~#>]+/g, '')
        .split('\n')
        .map(function(line) { return line.trim(); })
        .filter(Boolean)
        .join(' ')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\s+([，。；！？、,.!?;:])/g, '$1')
        .trim();

    return truncateNotificationText(normalized || DEFAULT_NOTIFICATION_BODY, MAX_NOTIFICATION_BODY_LENGTH);
}

self.addEventListener('push', function(event) {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const payloadData = data.data && typeof data.data === 'object' ? data.data : {};
        const charId = payloadData.charId || '';
        const bubbleIndex = payloadData.bubbleIndex || 0;

        const options = {
            body: formatNotificationBody(data.body),
            icon: data.icon || '/icons/icon-192.webp',
            badge: data.badge || '/icons/icon-96.webp',
            // 每个气泡用唯一 tag，保证消息轰炸效果（不会被折叠）
            tag: `msg-${charId}-${Date.now()}-${bubbleIndex}`,
            data: Object.assign({}, payloadData, { charId }),
            vibrate: [200, 100, 200],
            // requireInteraction: false → 自动消失（避免堆积太多）
            requireInteraction: false,
            // 即使 tag 相同也重新展示通知（轰炸效果核心）
            renotify: true,
        };

        event.waitUntil(
            self.registration.showNotification(formatNotificationTitle(data.title), options)
        );
    } catch (err) {
        // Fallback: payload 不是 JSON
        event.waitUntil(
            self.registration.showNotification(APP_NOTIFICATION_NAME, {
                body: formatNotificationBody(event.data.text()),
                icon: '/icons/icon-192.webp',
            })
        );
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const charId = event.notification.data?.charId || '';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clients) {
            // 找到已打开的页面，通过 postMessage 让 React 直接导航（无需刷新）
            if (clients.length > 0) {
                var target = null;
                // 优先找已聚焦的窗口
                for (var i = 0; i < clients.length; i++) {
                    if (clients[i].focused) {
                        target = clients[i];
                        break;
                    }
                }
                // 没有聚焦的就用第一个
                if (!target) target = clients[0];

                target.postMessage({
                    type: 'NOTIFICATION_CLICK',
                    charId: charId,
                });
                return target.focus();
            }

            // 没有任何已打开的页面 → 打开新窗口，URL 参数告知 React 要导航到哪个角色
            if (self.clients.openWindow) {
                return self.clients.openWindow(
                    self.location.origin + '/?notif_charId=' + encodeURIComponent(charId)
                );
            }
        })
    );
});
