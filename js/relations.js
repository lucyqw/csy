/* 模块: js/relations.js */

// [VariableDeclaration] Variables: currentRelationTagId
let currentRelationTagId = null;

// [VariableDeclaration] Variables: currentRelationFocusNodeId
let currentRelationFocusNodeId = null;

// [VariableDeclaration] Variables: currentEditingRelationIndex
let currentEditingRelationIndex = null;

// [VariableDeclaration] Variables: relationLongPressTimer
let relationLongPressTimer = null;

// [ExpressionStatement] Execution: Expression
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

// [ExpressionStatement] Execution: Expression
window.closeTagRelationPage = function() {
    currentRelationFocusNodeId = null;
    showPage(document.getElementById('tagsManagePage'));
};

// [ExpressionStatement] Execution: Expression
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

// [FunctionDeclaration] Function: renderTagRelationGraph
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

// [FunctionDeclaration] Function: bindRelationTextLongPress
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

// [FunctionDeclaration] Function: showRelationActionSheet
function showRelationActionSheet() {
    document.getElementById('relationActionSheet').style.display = 'flex';
}

// [FunctionDeclaration] Function: closeRelationActionSheet
function closeRelationActionSheet(clearIndex = false) {
    document.getElementById('relationActionSheet').style.display = 'none';
    if (clearIndex) {
        currentEditingRelationIndex = null;
    }
}

// [ExpressionStatement] Execution: addEventListener
document.getElementById('cancelRelationActionBtn').addEventListener('click', () => closeRelationActionSheet(true));

// [ExpressionStatement] Execution: addEventListener
document.getElementById('relationActionSheet').addEventListener('click', (e) => {
    if (e.target.id === 'relationActionSheet') closeRelationActionSheet(true);
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('editRelationBtn').addEventListener('click', async () => {
    const savedIndex = currentEditingRelationIndex; // 先缓存
    closeRelationActionSheet(false); // 关闭菜单，但不清空索引
    currentEditingRelationIndex = savedIndex;
    await editCurrentRelation();
});

// [ExpressionStatement] Execution: addEventListener
document.getElementById('deleteRelationBtn').addEventListener('click', async () => {
    const savedIndex = currentEditingRelationIndex; // 先缓存
    closeRelationActionSheet(false); // 关闭菜单，但不清空索引
    currentEditingRelationIndex = savedIndex;
    await deleteCurrentRelation();
});

// [ExpressionStatement] Execution: Expression
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

// [ExpressionStatement] Execution: Expression
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

// [ExpressionStatement] Execution: Expression
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

// [ExpressionStatement] Execution: Expression
window.closeCreateRelationDialog = function() {
    document.getElementById('relationCreateModal').style.display = 'none';
};

// [ExpressionStatement] Execution: addEventListener
document.getElementById('cancelCreateRelationBtn').addEventListener('click', closeCreateRelationDialog);

// [ExpressionStatement] Execution: addEventListener
document.getElementById('relationCreateModal').addEventListener('click', (e) => {
    if (e.target.id === 'relationCreateModal') {
        closeCreateRelationDialog();
    }
});

