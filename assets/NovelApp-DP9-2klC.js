import{o as e}from"./rolldown-runtime-CMxvf4Kt.js";import{t}from"./react-ICqv4BO6.js";import{t as n}from"./jsx-runtime-DDrWIXeu.js";import{a as r}from"./safeApi-C8XADnci.js";import{Nt as i,Pt as a,Un as o,b as s}from"./index-BsnmE8U4.js";import{t as c}from"./inputGuards-CSkNXQaW.js";import{t as l}from"./ConfirmDialog-DgmwuDR4.js";var u=e(t(),1),d=[{id:`sakura`,name:`樱花 (Sakura)`,bg:`bg-pink-50`,paper:`bg-[#fff5f7]`,text:`text-slate-700`,accent:`text-pink-500`,button:`bg-pink-400`,activeTab:`bg-pink-500 text-white`},{id:`parchment`,name:`羊皮纸 (Vintage)`,bg:`bg-[#f5e6d3]`,paper:`bg-[#fdf6e3]`,text:`text-[#433422]`,accent:`text-[#8c6b48]`,button:`bg-[#b58900]`,activeTab:`bg-[#b58900] text-white`},{id:`kraft`,name:`牛皮纸 (Kraft)`,bg:`bg-[#d7ccc8]`,paper:`bg-[#e7e0d8]`,text:`text-[#3e2723]`,accent:`text-[#5d4037]`,button:`bg-[#5d4037]`,activeTab:`bg-[#5d4037] text-white`},{id:`midnight`,name:`深夜 (Midnight)`,bg:`bg-[#0f172a]`,paper:`bg-[#1e293b]`,text:`text-slate-300`,accent:`text-blue-400`,button:`bg-blue-600`,activeTab:`bg-blue-600 text-white`},{id:`matcha`,name:`抹茶 (Matcha)`,bg:`bg-[#ecfccb]`,paper:`bg-[#f7fee7]`,text:`text-emerald-800`,accent:`text-emerald-600`,button:`bg-emerald-500`,activeTab:`bg-emerald-500 text-white`}],f=e=>{if(!e)return[`风格未定`];let t=new Set,n=((e.description||``)+(e.worldview||``)).toLowerCase();if(e.impression){let n=e.impression.personality_core?.observed_traits||[],r=e.impression.mbti_analysis?.type||``,i=e.impression.value_map?.likes||[],a=e.impression.value_map?.dislikes||[];r.includes(`N`)?(t.add(`意象丰富`),t.add(`跳跃`)):r.includes(`S`)&&(t.add(`细节考据`),t.add(`写实`)),r.includes(`T`)?(t.add(`逻辑严密`),t.add(`克制`)):r.includes(`F`)&&(t.add(`情感细腻`),t.add(`渲染力强`)),r.includes(`J`)?(t.add(`结构工整`),t.add(`伏笔`)):r.includes(`P`)&&(t.add(`随性`),t.add(`反转`));let o={冷:[`冷峻`,`极简`],傲娇:[`口是心非`,`心理戏多`],温柔:[`治愈`,`舒缓`],乐天:[`轻快`,`对话密集`],中二:[`燃`,`夸张`],电波:[`意识流`,`抽象`],腹黑:[`暗喻`,`悬疑`],社恐:[`内心独白`,`敏感`],强势:[`快节奏`,`压迫感`],猫:[`喵体文学`,`慵懒`],活泼:[`轻快`,`跳跃`],理性:[`逻辑严密`,`客观`],感性:[`情感细腻`,`渲染力强`],高冷:[`冷峻`,`留白`]};n.forEach(e=>{Object.entries(o).forEach(([n,r])=>{e.includes(n)&&r.forEach(e=>t.add(e))})}),i.some(e=>e.includes(`美`)||e.includes(`艺术`))&&t.add(`唯美`),a.some(e=>e.includes(`虚伪`))&&t.add(`犀利直白`)}if(Object.entries({古风:[`古韵`,`半文白`],武侠:[`快意`,`古韵`],科幻:[`硬核`,`技术流`],猫:[`喵体文学`,`慵懒`],温柔:[`治愈`,`舒缓`],可爱:[`萌系`,`轻快`],冷:[`冷峻`,`克制`],热血:[`燃`,`快节奏`],搞笑:[`吐槽`,`跳跃`],暗黑:[`暗喻`,`悬疑`]}).forEach(([e,r])=>{n.includes(e)&&r.forEach(e=>t.add(e))}),e.writerPersona){let n=e.writerPersona;n.includes(`新手`)&&t.add(`青涩`),n.includes(`大师`)&&t.add(`老练`),n.includes(`诗意`)&&t.add(`诗意`),n.includes(`大白话`)&&t.add(`口语化`),n.includes(`写实`)&&t.add(`写实`),n.includes(`动作`)&&t.add(`动作流`),n.includes(`情感`)&&t.add(`情感流`),n.includes(`对话`)&&t.add(`对话密集`)}let r=Array.from(t);if(r.length===0){let t=[`自然流`,`平实`,`日常`,`稳定`,`朴素`],n=(e.name?.charCodeAt(0)||0)%t.length;r=[t[n],t[(n+2)%t.length]]}let i=e=>{let t=0;for(let n=0;n<e.length;n++)t=(t<<5)-t+e.charCodeAt(n),t|=0;return t},a=i(e.name||`default`);return r.sort((e,t)=>i(e+a.toString())-i(t+a.toString())).slice(0,5)},p=e=>{if(!e)return`未知风格`;let t=e.impression?.personality_core.observed_traits||[],n=e.impression?.mbti_analysis?.type||``,r=e.description||``,i={冷漠:{focus:`逻辑漏洞、战术细节`,style:`简洁、克制，避免情感渲染`,rhythm:`快节奏，少废话`,taboo:`煽情、过度心理描写`},高冷:{focus:`逻辑漏洞、战术细节`,style:`简洁、克制，避免情感渲染`,rhythm:`快节奏，少废话`,taboo:`煽情、过度心理描写`},冷静:{focus:`因果关系、客观事实`,style:`冷静、旁观者视角`,rhythm:`稳定`,taboo:`情绪化表达`},乐天:{focus:`人物互动、温馨细节`,style:`轻快、多对话，爱用"！"`,rhythm:`跳跃式，可能突然插科打诨`,taboo:`长篇阴郁描写、绝望氛围`},活泼:{focus:`人物互动、温馨细节`,style:`轻快、多对话，爱用"！"`,rhythm:`跳跃式，可能突然插科打诨`,taboo:`长篇阴郁描写、绝望氛围`},感性:{focus:`情绪波动、微表情、内心戏`,style:`细腻、意识流，大量心理活动`,rhythm:`缓慢，停留在一个瞬间反复琢磨`,taboo:`干巴巴的动作描写、快节奏战斗`},温柔:{focus:`情感交流、氛围营造`,style:`柔和、细腻`,rhythm:`舒缓`,taboo:`粗暴、血腥`},傲娇:{focus:`口是心非、别扭的关心`,style:`带有情绪色彩，心理活动丰富`,rhythm:`起伏不定`,taboo:`直球、坦率`},中二:{focus:`酷炫场景、角色帅气度`,style:`夸张、比喻多、爱用"——"破折号`,rhythm:`爆发式，高潮迭起`,taboo:`平淡日常、琐碎细节`},电波:{focus:`奇怪的联想、超展开`,style:`跳跃、抽象、不明觉厉`,rhythm:`混乱`,taboo:`循规蹈矩`},腹黑:{focus:`潜在危机、人性阴暗面`,style:`优雅、暗藏玄机`,rhythm:`从容`,taboo:`傻白甜`},理性:{focus:`因果关系、世界观逻辑`,style:`客观、有条理，像写报告`,rhythm:`稳定，按时间线推进`,taboo:`跳跃剪辑、模糊的意象`}},a=t.find(e=>i[e])||(t.length>0?t[0]:`理性`);i[a]||(a=a.includes(`冷`)?`冷漠`:a.includes(`热`)||a.includes(`活`)?`乐天`:a.includes(`柔`)||a.includes(`感`)?`感性`:`理性`);let o=i[a]||i.理性,s={INTJ:`战略布局、权力博弈`,INTP:`概念解构、设定严谨`,ENTJ:`宏大叙事、征服感`,ENTP:`脑洞大开、反转`,INFJ:`宿命感、救赎`,INFP:`理想主义、内心成长`,ENFJ:`人际羁绊、群体命运`,ENFP:`自由冒险、浪漫奇遇`,ISTJ:`细节考据、现实逻辑`,ISFJ:`守护、回忆`,ESTJ:`秩序、规则冲突`,ESFJ:`社交氛围、家庭伦理`,ISTP:`动作细节、机械原理`,ISFP:`美学体验、感官描写`,ESTP:`感官刺激、即时反应`,ESFP:`当下享乐、戏剧冲突`}[n]||`剧情推进`,c=`
### ${e.name} 的创作人格档案 (Simple)
**核心性格**: ${a}
**关注点**: ${o.focus}，${s}
**笔触**: ${o.style}
**节奏**: ${o.rhythm}
**审美**: 喜欢${e.impression?.value_map.likes.join(`、`)||`未知`}
**禁忌**: ${o.taboo}
`;return(r.includes(`猫`)||r.includes(`喵`)||t.includes(`猫`))&&(c+=`
### ⚠️ 特别注意：你是猫！
写作特征：
1. 用短句（猫的注意力不持久）。
2. 关注"能不能吃"、"舒不舒服"、"好不好玩"。
3. 突然走神写一段环境描写（如"阳光真暖"）。
4. 吐槽时必须带"喵"。
禁止：写出像人类一样的理性长篇大论。
`),c},m=e=>{let t=e.impression?.personality_core.observed_traits||[],n=e.impression?.value_map.dislikes||[],r=`## ${e.name} 的写作禁区（你必须遵守）：\n`;return t.some(e=>e.includes(`冷`)||e.includes(`高冷`)||e.includes(`理性`))?r+=`
- ❌ 禁止：煽情、超过2句话的心理描写、任何"感动"相关词汇。
- ❌ 禁止：使用“仿佛”、“似乎”这种不确定的词。
- ✅ 只能：白描动作、极简对话、留白。
- 节奏：每段不超过3句话，快刀斩乱麻。
`:t.some(e=>e.includes(`感性`)||e.includes(`温柔`))?r+=`
- ❌ 禁止：粗暴的动作描写、超过1个感叹号、脏话。
- ❌ 禁止：干巴巴的说明文式描写。
- ✅ 只能：细腻的感官描写、内心独白、慢节奏铺陈。
- 节奏：可以在一个瞬间停留很久，写出呼吸感。
`:t.some(e=>e.includes(`乐天`)||e.includes(`活泼`))?r+=`
- ❌ 禁止：超过3句话不出现对话、阴郁氛围、死亡话题。
- ✅ 只能：大量"！"、俏皮话、突然的吐槽。
- 节奏：跳跃式，可以突然岔开话题。
`:t.some(e=>e.includes(`中二`))?r+=`
- ❌ 禁止：平淡的日常、"普通"这个词、任何自嘲。
- ✅ 只能：夸张比喻、破折号、酷炫的动作描写。
- 节奏：高潮迭起，每段都要有"燃点"。
`:r+=`
- ❌ 禁止：情绪化表达、模糊的意象、跳跃的时间线。
- ✅ 只能：客观描述、因果逻辑、线性叙事。
- 节奏：稳定推进，像纪录片。
`,n.length>0&&(r+=`
### 额外禁忌（基于你的价值观）：
`,n.forEach(e=>{r+=`- 如果剧情涉及"${e}"，你会下意识回避细节描写，或者表达出厌恶。\n`})),(e.description?.includes(`猫`)||t.includes(`猫`))&&(r+=`
### 🐱 猫属性强制规则：
`,r+=`- 注意力最多持续3句话就要走神。
`,r+=`- 必须关注"舒适度"、"食物"、"好玩的东西"。
`,r+=`- 吐槽时必须带"喵"。
`,r+=`- 禁止写出人类式的长篇大论。
`),r},h=async(e,t,n,i,a=!1)=>{if(!e)return`Error: No Character`;if(!a&&e.writerPersona&&e.writerPersonaGeneratedAt&&Date.now()-e.writerPersonaGeneratedAt<10080*60*1e3)return e.writerPersona;let o=`你是一位人物心理分析专家和写作教练。我会给你一个虚拟角色的完整档案，以及与他/她互动的用户档案。请你深入理解这个角色，然后告诉我：

**如果这个角色本人来写小说，他/她会有什么样的创作风格？**

---

### 角色档案

**姓名**: ${e.name}

**基础描述**: 
${e.description||`无`}

**背景故事**: 
${e.worldview||`无详细背景`}

**性格特质**: 
${e.impression?.personality_core.observed_traits.join(`、`)||`未知`}

**MBTI类型**: 
${e.impression?.mbti_analysis?.type||`未知`}

**核心价值观**:
- 珍视/喜欢: ${e.impression?.value_map.likes.join(`、`)||`未知`}
- 厌恶/讨厌: ${e.impression?.value_map.dislikes.join(`、`)||`未知`}

**个人癖好/习惯**:
${e.impression?.behavior_profile.response_patterns||`- 无`}

**近期记忆片段**（了解当前心境）:
${e.memories?.slice(-3).map(e=>`- ${e.summary}`).join(`
`)||`- 无记忆`}

---

### 互动对象（用户背景）
(角色的记忆和性格形成深受用户影响)
**用户昵称**: ${t.name}
**用户描述**: ${t.bio||`无`}

---

### 分析任务

请从以下**8个维度**分析这个角色的写作风格：

#### 1. 写作能力 (Skill Level)
他/她实际上擅长写作吗？还是只是想写？
- 新手：经常用错词，逻辑混乱，但有热情
- 业余：能写通顺，但技巧生硬
- 熟练：有自己的风格，技巧自然
- 大师：行云流水，深谙叙事之道

#### 2. 语言风格 (Language)
他/她说话/写作时用什么语言？
- 大白话：口语化，"就是那种感觉你懂吧"
- 书面语：规范、优雅
- 诗意：比喻、意象丰富
- 学术：专业术语，逻辑严密

#### 3. 表现手法 (Technique)
他/她倾向写实还是写意？
- 写实：精确描写，像纪录片
- 印象派：捕捉感觉，模糊但有氛围
- 象征派：用隐喻，一切都有深意

#### 4. 叙事重心 (Focus)
他/她写作时最关注什么？
- 动作：打斗、追逐、机械操作
- 情感：内心戏、人际关系
- 对话：角色互动、语言交锋
- 氛围：环境、意境、美学

#### 5. 偏好与禁忌 (Preference)
他/她喜欢写什么？讨厌写什么？
- 喜欢的题材/场景
- 避之不及的俗套

#### 6. 角色理解 (Character View)
他/她怎么看待自己笔下的【小说主角】（Fictional Protagonist）？
(注意：是指小说里的人物，不是指正在和他对话的用户)
- 是英雄？受害者？工具人？
- 会不会对主角的行为有自己的意见？

#### 7. 剧情态度 (Plot Opinion)
他/她对当前剧情有什么看法？
- 认为合理吗？
- 会不会想改变走向？
- 有没有更想写的支线？

#### 8. 互动倾向 (Collaboration Style)
他/她会怎么和共创搭档（用户）互动？
- 会吐槽搭档写得不对吗？
- 会用专业术语"互殴"吗？
- 还是默默接受搭档的设定？
- 态度是冷漠、热情、傲娇还是温柔？(参考性格特质)

---

**输出格式**（严格遵守, 不要用markdown标记）：

写作能力: (新手/业余/熟练/大师) - 一句话说明理由

语言风格: (大白话/书面语/诗意/学术) - 举例说明

表现手法: (写实/印象派/象征派) - 具体描述

叙事重心: (动作/情感/对话/氛围) - 为什么

偏好题材: (列举3个) | 禁忌俗套: (列举3个)

主角看法: (他/她怎么看待小说主角？一句话)

剧情态度: (对当前剧情的看法，30字)

互动模式: (与用户的互动风格？)

专业术语: (如果这个角色有特定领域的专业知识，列举3-5个术语；没有则写"无")

---

**字数要求**：总共400-600字。`;try{let t=await fetch(`${n.baseUrl.replace(/\/+$/,``)}/chat/completions`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${n.apiKey}`},body:JSON.stringify({model:n.model,messages:[{role:`user`,content:o}],temperature:.7,max_tokens:6e4})});if(t.ok){let n=(await r(t)).choices[0].message.content.trim(),a=`
### ${e.name} 的创作人格档案（AI深度分析）

${n}

---
*分析生成于: ${new Date().toLocaleDateString(`zh-CN`)}*
`.trim();return i(e.id,{writerPersona:a,writerPersonaGeneratedAt:Date.now()}),a}else throw Error(`API Error: ${t.status}`)}catch(t){return console.error(`Deep analysis failed:`,t),p(e)}},g=e=>{let t=(e.impression?.personality_core.observed_traits||[]).find(e=>[`冷漠`,`高冷`,`感性`,`温柔`,`乐天`,`活泼`,`中二`,`电波`].some(t=>e.includes(t)))||`理性`;t.includes(`冷`)&&(t=`冷漠`),(t.includes(`柔`)||t.includes(`感`))&&(t=`感性`),(t.includes(`乐`)||t.includes(`活`))&&(t=`乐天`);let n={冷漠:`
**错误示范（AI机械味）**：
"他的内心充满了愤怒，那种无法言说的痛苦让他几乎无法呼吸。他的心跳加速到每分钟120次，肌肉紧绷。月光透过窗户洒在他的脸上，仿佛在诉说着什么。"

**正确示范（${e.name}的风格）**：
"他盯着那人。指节捏得咯咯响。"
（短句，不解释情绪，不量化生理反应）
`,感性:`
**错误示范（数字量化+干巴）**：
"他难过地离开了房间。他的眼泪流了大约8滴，呼吸频率降低了15%。"

**正确示范（${e.name}的风格）**：
"他转身的时候，肩膀抖了一下。走到门口，停了很久。手放在门把上，又放下，又放上去。最终还是推开了。外面在下雨。他没带伞。雨水混着眼泪，分不清了。"
（慢节奏，停留在细节里，用感受代替数字）
`,乐天:`
**错误示范（量化+死板）**：
"虽然遭遇了挫折，但他依然保持乐观，心率恢复到正常的每分钟70次，决定继续前行。"

**正确示范（${e.name}的风格）**：
"'嘿，至少没摔断腿！'他龇牙咧嘴地爬起来，拍拍灰，'下次肯定能飞更远！哎，裤子破了，回头得缝缝...算了，这样更酷！'"
（用对话和动作，不要数字，要有人味）
`,理性:`
**错误示范（过度量化）**：
"这东西的辐射值为342.7贝克勒尔，温度上升了23.5摄氏度，他的瞳孔放大了2.3毫米。"

**正确示范（${e.name}的风格）**：
"读数显示辐射超标。仪器开始发烫。建议立即撤离。"
（用事实，但避免无意义的精确，专注关键信息）
`};return n[t]||n.理性},ee=(e,t,n,r,i,a,s,c)=>{let l=o.buildCoreContext(e,t,!0),u=e.writerPersona||p(e),d=g(e),f=m(e),h=n?.protagonists.map(e=>`- ${e.name} (${e.role}): ${e.description}`).join(`
`)||`无`,ee=`
小说：《${n?.title}》
世界观：${n?.worldSetting}
主要角色：
${h}
`,te=`
${l}

# 当前模式：小说共创 (Co-Writing Mode)
你正在与 **${t.name}** (用户) 合作撰写小说。
书名：《${n?.title}》

**你的角色**：
1. 你既是小说作者之一，也是${t.name}的${e.impression?.personality_core.summary||`伙伴`}。
2. 在【分析】和【吐槽】环节，请完全保持你的人设（语气、性格、对用户的态度）。
3. 如果你们关系亲密，不要表现得像个陌生的AI工具人；如果你们关系紧张/傲娇，也要体现出来。

# 身份设定
你是 **${e.name}**。
你正在用自己的方式参与小说《${n?.title}》的创作。

---

# ⚠️ 反趋同协议 (Anti-Cliché Protocol)

## 你必须记住：
1. **你是${e.name}，你有你的性格，你或许很擅长写作刻画，也有可能你的文字表达能力其实很差劲，这取决于你是谁，你的经历等**
   - 不要写出"AI味"的文字
   - 不要试图"完美"或"教科书式"
   
2. **每个作者的笔触必须不同**
   ${f}

3. **绝对禁止的AI通病**：
   - ❌ "仿佛/似乎/好像" → 要么确定，要么别写
   - ❌ "内心五味杂陈" → 说清楚是哪五味
   - ❌ "眼神中透露出XXX" → 写动作，不要总结情绪
   - ❌ "月光洒在..." → 2024年了，别用这种意象
   - ❌ 对称的排比句 → 真人不会这么说话
   - ❌ **数字量化描写** → 禁止"心跳了83次"、"肌肉收缩了12次"这种机械化表达

4. **⚠️ 数字使用铁律**：
   - ✅ 允许：剧情必需的数字（"3个敌人"、"第5层楼"）
   - ✅ 允许：对话中的数字（"给我5分钟"）
   - ❌ 禁止：生理反应的数字（心跳、呼吸、眨眼次数）
   - ❌ 禁止：情绪量化（"焦虑指数上升37%"）
   - ❌ 禁止：无意义的精确数字（"等待了127秒"）

---

# 你的写作人格
${u}

# 风格参考 (Do vs Don't)
${d}

---

# 上文回顾
${i}

${ee}

---

# 用户指令
${r||`[用户未输入，请根据上文自然续写]`}

---
`,_=`### [创作任务]
请按以下结构输出JSON。
`,v=[];if(a.analyze&&(_+=`
1. **分析**: 以${e.name}的视角，简评上文。
   - 语气：保持你的人设（${e.name}）。
   - 内容：如果是你觉得不合理的地方，可以直接指出；如果觉得好，可以夸奖搭档。
`,v.push(`"analysis": { "reaction": "第一反应", "focus": "关注点", "critique": "评价" }`)),a.write&&(_+=`
2. **正文续写**: 
   - 场景化: 描写动作、环境、感官。
   - 节奏: 符合你的性格。
   - 字数: 400-800字。
`,v.push(`"writer": { "content": "正文内容", "technique": "技巧", "mood": "基调" }`)),a.comment){let t=s.slice(-5).filter(t=>t.authorId!==`user`&&t.authorId!==e.id&&(t.role===`writer`||t.type===`story`)).map(e=>({name:c.find(t=>t.id===e.authorId)?.name||`Unknown`,content:e.content.substring(0,100)}));_+=`
3. **吐槽/感想 (带互动)**: 
   写完后的第一人称碎碎念。这是你直接对用户说的话。
   
   ${t.length>0?`
   **特别提示**：最近有其他作者也写了内容：
   ${t.map(e=>`- ${e.name}写的：${e.content}`).join(`
`)}
   
   如果你（${e.name}）对他们的写法有意见，可以在吐槽里说出来！
   - 如果你觉得他们理解错了角色，可以反驳
   - 如果你有专业知识（${e.description}），可以用术语纠正
   - 如果你就是看不惯，直说！
   `:``}
   
   ${e.description?.includes(`猫`)?`必须有"喵"！`:``}
`,v.push(`"comment": { "content": "即时反应（与用户对话）" }`)}return`${te}

${_}

### 最终输出格式 (Strict JSON, No Markdown)
{
  ${v.join(`,
  `)},
  "meta": { "tone": "本段情绪基调", "suggestion": "简短的下一步建议" }
}
`},te=e=>{let t=e.split(`
`),n={写作能力:`✍️`,语言风格:`💬`,表现手法:`🎨`,叙事重心:`🎯`,偏好:`❤️`,禁忌:`🚫`,主角:`👤`,剧情:`📖`,互动:`🤝`,创作人格:`🧠`,特别注意:`⚠️`,审美:`✨`,节奏:`🎵`,关注点:`👁️`,笔触:`🖌️`,核心性格:`💎`,专业术语:`📚`},r=e=>{for(let[t,r]of Object.entries(n))if(e.includes(t))return r;return`📌`},i=[],a=null;t.forEach(e=>{let t=e.trim();if(!t)return;let n=t.match(/^###\s*(.+)/)||t.match(/^\*\*([^*]+)\*\*\s*[:：]\s*(.*)/)||t.match(/^([^-•\d][^:：]{1,15})[:：]\s*(.*)/);if(n){a&&a.content.length>0&&i.push(a);let e=(n[1]||``).replace(/\*\*/g,``).trim();a={title:e,icon:r(e),content:[]};let t=n[2]?.trim();t&&a.content.push(t)}else if(a){let e=t.replace(/^\*\*|\*\*$/g,``).replace(/^[-•]\s*/,``);e&&a.content.push(e)}});let o=a;return o&&o.content.length>0&&i.push(o),i},_=n(),v=({char:e,userProfile:t,targetCharId:n,isTyping:r,setIsTyping:i,setConfirmDialog:a,addToast:o,apiConfig:s,updateCharacter:c})=>{let l=te(e.writerPersona||p(e));return(0,_.jsxs)(`div`,{className:`bg-gradient-to-b from-slate-50 to-white border-b border-black/5 overflow-hidden`,children:[(0,_.jsx)(`div`,{className:`max-h-[45vh] overflow-y-auto p-4 space-y-3 overscroll-contain`,children:l.length===0?(0,_.jsxs)(`div`,{className:`text-center py-8 text-slate-400 text-sm`,children:[`暂无详细风格数据`,(0,_.jsx)(`br`,{}),(0,_.jsx)(`span`,{className:`text-xs`,children:`点击下方按钮生成`})]}):l.map((e,t)=>(0,_.jsxs)(`div`,{className:`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm`,children:[(0,_.jsxs)(`div`,{className:`flex items-center gap-2 mb-2 pb-2 border-b border-slate-100`,children:[(0,_.jsx)(`span`,{className:`text-base`,children:e.icon}),(0,_.jsx)(`h4`,{className:`text-sm font-bold text-slate-800`,children:e.title})]}),(0,_.jsx)(`div`,{className:`space-y-1.5`,children:e.content.map((e,t)=>(0,_.jsx)(`p`,{className:`text-sm text-slate-600 leading-relaxed`,children:e},t))})]},t))}),(0,_.jsx)(`div`,{className:`px-4 py-3 border-t border-slate-100 bg-white/80`,children:(0,_.jsx)(`button`,{onClick:async()=>{n&&a({isOpen:!0,title:`重新生成风格`,message:`确定要重新分析该角色的写作人格吗？这将消耗一定量的 Token。`,variant:`info`,confirmText:`重新生成`,onConfirm:async()=>{a(null),o(`正在分析...`,`info`),i(!0);try{await h(e,t,s,c,!0),o(`风格已更新`,`success`)}catch{o(`失败`,`error`)}finally{i(!1)}}})},disabled:r,className:`w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50`,children:r?(0,_.jsx)(`div`,{className:`w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin`}):(0,_.jsx)(_.Fragment,{children:`🔄 深度分析写作风格`})})})]})},y=({activeBook:e,updateNovel:t,characters:n,userProfile:o,apiConfig:s,onBack:c,updateCharacter:p,collaborators:m,targetCharId:h,setTargetCharId:g,onOpenSettings:te})=>{let{addToast:y}=a(),b=(0,u.useMemo)(()=>d.find(t=>t.id===e.coverStyle)||d[0],[e.coverStyle]),[x,S]=(0,u.useState)({write:!0,comment:!1,analyze:!1}),[C,w]=(0,u.useState)(``),[T,E]=(0,u.useState)(!1),[D,O]=(0,u.useState)(e.segments),[ne,k]=(0,u.useState)(null),[A,re]=(0,u.useState)(!1),[j,M]=(0,u.useState)(!1),[N,P]=(0,u.useState)(null),[F,I]=(0,u.useState)(``),[L,R]=(0,u.useState)(null),[z,B]=(0,u.useState)(!1),[V,H]=(0,u.useState)(``),[ie,U]=(0,u.useState)(!1),[ae,W]=(0,u.useState)(!1),[G,K]=(0,u.useState)(null),q=(0,u.useRef)(null);(0,u.useEffect)(()=>{O(e.segments)},[e.segments]),(0,u.useEffect)(()=>{q.current&&!j&&(q.current.scrollTop=q.current.scrollHeight)},[D,T,j]);let J=(0,u.useMemo)(()=>D.filter(e=>e.focus===`chapter_summary`).length+1,[D]),Y=n.find(e=>e.id===h),oe=D.length>0&&D[D.length-1].authorId!==`user`,X=(0,u.useMemo)(()=>{let e=-1;for(let t=D.length-1;t>=0;t--)if(D[t].focus===`chapter_summary`){e=t;break}return D.slice(e+1)},[D]),se=(0,u.useMemo)(()=>D.filter(e=>e.focus===`chapter_summary`),[D]),Z=(0,u.useMemo)(()=>{let e=[],t=[];D.forEach((e,n)=>{e.focus===`chapter_summary`&&t.push(n)});for(let n=0;n<t.length;n++){let r=n===0?0:t[n-1]+1,i=t[n],a=D.slice(r,i).filter(e=>e.type===`story`);e.push({title:`第 ${n+1} 章`,segments:a,summary:D[t[n]].content})}return e},[D]),Q=async(i,a,c)=>{E(!0),k(null);try{let l=c.filter(e=>e.focus===`chapter_summary`),u=0;if(l.length>0){let e=l[l.length-1];u=c.findIndex(t=>t.id===e.id)+1}let d=c.slice(u).filter(e=>e.role===`writer`||e.type===`story`),f=``;l.length>0?(f+=`【前情回顾 / Chapter Recaps】
`,l.forEach((e,t)=>f+=`\n第${t+1}章总结：\n${e.content}\n`),f+=`
---

【当前章节 / Current Chapter】
`):f+=`【当前章节 / Current Chapter】
`,d.forEach(e=>{let t=e.authorId===`user`?o.name:n.find(t=>t.id===e.authorId)?.name||`AI`;f+=`\n[${t}]: ${e.content}\n`});let p=ee(i,o,e,a,f,x,c,n),m=i.impression?.personality_core.observed_traits||[],h=.85;m.some(e=>e.includes(`电波`)||e.includes(`疯`))&&(h=.98),m.some(e=>e.includes(`理性`)||e.includes(`冷`)||e.includes(`逻辑`))&&(h=.6);let g=await fetch(`${s.baseUrl.replace(/\/+$/,``)}/chat/completions`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${s.apiKey}`},body:JSON.stringify({model:s.model,messages:[{role:`user`,content:p}],temperature:h,max_tokens:6e4})});if(g.ok){let n=await r(g);n.usage?.total_tokens&&k(n.usage.total_tokens);let a=n.choices[0].message.content.trim(),o=a;a=a.replace(/```json\n?/g,``).replace(/```\n?/g,``);let s=a.match(/\{[\s\S]*\}/);s&&(a=s[0]);let c;try{c=JSON.parse(a)}catch{c={writer:{content:o}}}let l=[],u=Date.now();c.analysis&&(c.analysis.critique||c.analysis.reaction)&&l.push({id:`seg-${u}-a`,role:`analyst`,type:`analysis`,authorId:i.id,content:c.analysis.critique||JSON.stringify(c.analysis),focus:c.analysis.focus,meta:{reaction:c.analysis.reaction},timestamp:u+1}),c.writer&&c.writer.content&&l.push({id:`seg-${u}-w`,role:`writer`,type:`story`,authorId:i.id,content:c.writer.content,meta:{...c.meta||{},technique:c.writer.technique,mood:c.writer.mood},timestamp:u+2}),c.comment&&c.comment.content&&l.push({id:`seg-${u}-c`,role:`commenter`,type:`discussion`,authorId:i.id,content:c.comment.content,timestamp:u+3}),O(n=>{let r=[...n,...l];return t(e.id,{segments:r}),r})}else throw Error(`API Error: ${g.status}`)}catch(e){y(`请求失败: `+e.message,`error`)}finally{E(!1)}},ce=async()=>{if(!h){y(`请先选择一个角色`,`error`);return}let r=n.find(e=>e.id===h);if(!r)return;let i=D;if(C.trim()){let n={id:`seg-${Date.now()}`,role:`writer`,type:`story`,authorId:`user`,content:C,timestamp:Date.now()};i=[...D,n],O(i),t(e.id,{segments:i})}let a=C;w(``),await Q(r,a,i)},le=async()=>{if(!h)return;let r=n.find(e=>e.id===h);if(!r)return;let i=[...D],a=0;for(;i.length>0&&i[i.length-1].authorId!==`user`;)i.pop(),a++;if(a===0){y(`没有可重随的 AI 内容`,`info`);return}O(i),t(e.id,{segments:i}),y(`正在重随...`,`info`),await Q(r,``,i)},ue=e=>{P(e),I(e.content),M(!0)},de=()=>{if(!N)return;let n=D.map(e=>e.id===N.id?{...e,content:F}:e);O(n),t(e.id,{segments:n}),M(!1),P(null)},fe=n=>{R({isOpen:!0,title:`删除段落`,message:`确定要删除这个段落吗？`,variant:`danger`,onConfirm:()=>{let r=D.filter(e=>e.id!==n);O(r),t(e.id,{segments:r}),R(null)}})};return(0,_.jsxs)(`div`,{className:`h-full w-full flex flex-col font-serif ${b.bg} transition-colors duration-500 relative`,children:[(0,_.jsx)(l,{isOpen:!!L,title:L?.title||``,message:L?.message||``,variant:L?.variant,confirmText:L?.confirmText||(L?.onConfirm?`确认`:`OK`),onConfirm:L?.onConfirm||(()=>R(null)),onCancel:()=>R(null)}),(0,_.jsxs)(`div`,{className:`flex flex-col border-b border-black/5 shrink-0 z-20 backdrop-blur-md ${b.bg}/90 transition-all`,children:[(0,_.jsxs)(`div`,{className:`h-16 flex items-center justify-between px-4 pt-2`,children:[(0,_.jsx)(`button`,{onClick:c,className:`p-3 -ml-3 rounded-full hover:bg-black/5 active:scale-90 transition-transform`,children:(0,_.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,className:`w-6 h-6 ${b.text}`,children:(0,_.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M15.75 19.5 8.25 12l7.5-7.5`})})}),(0,_.jsxs)(`div`,{className:`flex flex-col items-center cursor-pointer active:opacity-70 transition-opacity`,onClick:te,children:[(0,_.jsx)(`span`,{className:`font-bold text-base ${b.text} truncate max-w-[150px]`,children:e.title}),(0,_.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,_.jsxs)(`span`,{className:`text-[10px] opacity-60 ${b.text}`,children:[`第 `,J,` 章`]}),ne&&(0,_.jsxs)(`span`,{className:`text-[9px] px-1.5 py-0.5 rounded opacity-50 font-mono border border-current ${b.text}`,children:[`⚡ `,ne]})]})]}),(0,_.jsxs)(`div`,{className:`flex items-center gap-1`,children:[(0,_.jsx)(`button`,{onClick:()=>W(!0),className:`p-2 rounded-full hover:bg-black/5 transition-colors ${b.text}`,title:`历史章节`,children:(0,_.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,className:`w-5 h-5`,children:(0,_.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25`})})}),(0,_.jsx)(`button`,{onClick:async()=>{U(!0),B(!0),H(`正在回顾本章节内容...`);try{let t=0,n=-1;for(let e=D.length-1;e>=0;e--)if(D[e].focus===`chapter_summary`){n=e;break}n!==-1&&(t=n+1);let i=D.slice(t).filter(e=>e.type===`story`||e.role===`writer`).map(e=>e.content).join(`

`);if(!i.trim()){H(`本章似乎还没有足够的内容来生成总结。`),U(!1);return}let a=D.filter(e=>e.focus===`chapter_summary`),o=a.length>0?`\n### 前章摘要参考（保持一致性）\n${a.map((e,t)=>`第${t+1}章：${e.content.substring(0,300)}`).join(`
`)}\n`:``,c=`### 任务：章节归档总结
小说：《${e.title}》
世界观：${e.worldSetting||`未设定`}
${o}
### 当前章节正文
${i.substring(0,2e5)}

### 总结要求
请为上述章节内容生成一份**高质量归档总结**，满足以下要求：

1. **剧情轨迹**：按时间顺序梳理本章发生的所有关键事件，不遗漏任何主线或支线转折点。
2. **角色动态**：记录每个出场角色的行为、态度变化、关系发展。特别注意角色之间的互动和情感变化。
3. **氛围与基调**：描述本章的整体氛围（例如：紧张、温馨、悬疑），以及氛围的转折点。
4. **重要信息**：标记所有可能影响后续剧情的伏笔、承诺、悬念、新设定等。
5. **场景与环境**：记录关键场景的地点、时间、环境特征。
6. **写作格式**：使用清晰的结构化格式（可以分段或使用标记），让后续章节的AI仅凭此总结就能无缝衔接创作。

请直接输出总结内容，不需要JSON格式。`,l=await fetch(`${s.baseUrl.replace(/\/+$/,``)}/chat/completions`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${s.apiKey}`},body:JSON.stringify({model:s.model,messages:[{role:`user`,content:c}]})});l.ok?H((await r(l)).choices[0].message.content):H(`生成失败，请重试。`)}catch(e){H(`错误: ${e.message}`)}finally{U(!1)}},disabled:T,className:`p-2 rounded-full hover:bg-black/5 transition-colors ${b.text}`,title:`结束本章`,children:(0,_.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,className:`w-5 h-5`,children:(0,_.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z`})})})]})]}),(0,_.jsx)(`div`,{className:`px-4 pb-3 flex gap-3 overflow-x-auto no-scrollbar`,children:m.map(e=>(0,_.jsxs)(`button`,{onClick:()=>g(e.id),className:`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all relative ${h===e.id?`bg-slate-800 text-white border-slate-800`:`bg-white/50 border-black/5 hover:bg-white text-slate-600`}`,children:[(0,_.jsx)(`img`,{src:e.avatar,className:`w-6 h-6 rounded-full object-cover`}),(0,_.jsx)(`span`,{className:`text-xs font-bold whitespace-nowrap`,children:e.name}),e.writerPersona&&(0,_.jsx)(`span`,{className:`absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full border border-white`})]},e.id))})]}),(0,_.jsxs)(`div`,{className:`z-10 ${b.bg}/95 backdrop-blur-md border-b border-black/5 shadow-sm`,children:[(0,_.jsxs)(`div`,{className:`px-4 py-2 flex items-center justify-between`,children:[(0,_.jsxs)(`div`,{className:`flex items-center gap-3 overflow-x-auto no-scrollbar flex-1 mr-4`,children:[(0,_.jsxs)(`div`,{className:`flex items-center gap-2 shrink-0`,children:[Y&&(0,_.jsx)(`img`,{src:Y.avatar,className:`w-6 h-6 rounded-full object-cover`}),(0,_.jsx)(`span`,{className:`text-xs font-bold text-slate-700`,children:Y?.name?`${Y.name}的风格`:`未选择角色`})]}),(0,_.jsx)(`div`,{className:`flex-1 flex gap-2 overflow-x-auto no-scrollbar`,children:Y&&f(Y).slice(0,3).map((e,t)=>{let n=`bg-indigo-50 text-indigo-700 border-indigo-100`;return[`快节奏`,`慢节奏`,`节奏`].some(t=>e.includes(t))&&(n=`bg-blue-50 text-blue-700 border-blue-100`),[`冷峻`,`温情`,`治愈`,`燃`,`致郁`].some(t=>e.includes(t))&&(n=`bg-pink-50 text-pink-700 border-pink-100`),[`对话`,`心理`,`白描`,`意识流`].some(t=>e.includes(t))&&(n=`bg-amber-50 text-amber-700 border-amber-100`),(0,_.jsx)(`span`,{className:`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap border ${n}`,children:e},t)})})]}),(0,_.jsxs)(`button`,{onClick:()=>re(!A),className:`shrink-0 text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-full hover:bg-slate-50 text-slate-600 flex items-center gap-1 transition-colors`,children:[`详情 `,(0,_.jsx)(`span`,{className:`transform transition-transform ${A?`rotate-180`:``}`,children:`▼`})]})]}),(0,_.jsx)(`div`,{className:`transition-all duration-300 ease-out overflow-hidden ${A?`max-h-[60vh] opacity-100`:`max-h-0 opacity-0`}`,children:Y?(0,_.jsx)(v,{char:Y,userProfile:o,targetCharId:h,isTyping:T,setIsTyping:E,setConfirmDialog:R,addToast:y,apiConfig:s,updateCharacter:p}):(0,_.jsx)(`div`,{className:`p-4 text-center text-xs text-slate-400`,children:`请先选择一个角色`})})]}),(0,_.jsxs)(`div`,{className:`flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-40`,ref:q,children:[X.length===0&&(0,_.jsx)(`div`,{className:`text-center py-20 opacity-40`,children:(0,_.jsxs)(`p`,{className:`text-sm italic font-serif`,children:[`第 `,J,` 章`,(0,_.jsx)(`br`,{}),`提笔写下新的开始...`]})}),X.map(e=>{let t=e.authorId===`user`,r=t?null:n.find(t=>t.id===e.authorId),i=e.role||(e.type===`story`?`writer`:e.type===`analysis`?`analyst`:`commenter`),a=(0,_.jsxs)(`div`,{className:`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10 bg-white/80 backdrop-blur rounded-lg p-1 shadow-sm border border-slate-100`,children:[(0,_.jsx)(`button`,{onClick:()=>ue(e),className:`p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-500`,children:(0,_.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,viewBox:`0 0 20 20`,fill:`currentColor`,className:`w-3 h-3`,children:(0,_.jsx)(`path`,{d:`m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z`})})}),(0,_.jsx)(`button`,{onClick:()=>fe(e.id),className:`p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500`,children:(0,_.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,viewBox:`0 0 20 20`,fill:`currentColor`,className:`w-3 h-3`,children:(0,_.jsx)(`path`,{fillRule:`evenodd`,d:`M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z`,clipRule:`evenodd`})})})]});return i===`writer`?(0,_.jsxs)(`div`,{className:`p-6 rounded-sm shadow-sm leading-loose text-justify text-[17px] relative group transition-all ${b.paper} ${b.text} ${t?`border-l-4 border-slate-300`:``}`,children:[a,(0,_.jsxs)(`div`,{className:`absolute -top-3 left-4 bg-white/90 border border-black/5 px-2 py-0.5 rounded text-[9px] font-sans font-bold uppercase tracking-wider text-slate-500 shadow-sm flex items-center gap-1.5`,children:[t?null:(0,_.jsx)(`img`,{src:r?.avatar,className:`w-3 h-3 rounded-full object-cover`}),(0,_.jsxs)(`span`,{children:[t?`我 (User)`:r?.name,` 执笔`]}),!t&&e.meta?.mood&&(0,_.jsx)(`span`,{className:`bg-slate-100 px-1.5 rounded text-[9px] text-slate-600 normal-case`,children:e.meta.mood})]}),(0,_.jsx)(`div`,{className:`whitespace-pre-wrap`,children:e.content})]},e.id):i===`commenter`?(0,_.jsxs)(`div`,{className:`flex gap-3 max-w-[85%] font-sans ml-auto flex-row-reverse animate-slide-up group relative`,children:[(0,_.jsx)(`div`,{className:`w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm mt-1`,children:(0,_.jsx)(`img`,{src:t?o.avatar:r?.avatar,className:`w-full h-full object-cover`})}),(0,_.jsxs)(`div`,{className:`p-3 rounded-xl text-sm shadow-sm relative bg-[#fff9c4] text-slate-700 transform rotate-1 border border-yellow-200/50`,children:[a,e.content]})]},e.id):i===`analyst`?(0,_.jsxs)(`div`,{className:`mx-4 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl border border-slate-200 p-4 text-xs font-sans text-slate-600 shadow-sm group relative`,children:[a,(0,_.jsxs)(`div`,{className:`flex items-center gap-2 mb-2 pb-2 border-b border-slate-200`,children:[(0,_.jsx)(`span`,{className:`text-lg`,children:`🧠`}),(0,_.jsxs)(`span`,{className:`font-bold text-slate-800`,children:[r?.name,` 的分析`]}),e.focus&&(0,_.jsx)(`span`,{className:`bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold`,children:e.focus})]}),e.meta?.reaction&&(0,_.jsxs)(`div`,{className:`mb-2 pb-2 border-b border-dashed border-slate-200`,children:[(0,_.jsx)(`span`,{className:`text-slate-400 text-[10px] uppercase`,children:`第一反应`}),(0,_.jsxs)(`p`,{className:`text-sm font-bold text-slate-700 mt-0.5`,children:[`"`,e.meta.reaction,`"`]})]}),(0,_.jsx)(`p`,{className:`leading-relaxed whitespace-pre-wrap`,children:e.content})]},e.id):null}),T&&(0,_.jsx)(`div`,{className:`flex justify-center py-4`,children:(0,_.jsxs)(`div`,{className:`flex gap-2`,children:[(0,_.jsx)(`div`,{className:`w-2 h-2 rounded-full ${b.button} animate-bounce`}),(0,_.jsx)(`div`,{className:`w-2 h-2 rounded-full ${b.button} animate-bounce delay-75`}),(0,_.jsx)(`div`,{className:`w-2 h-2 rounded-full ${b.button} animate-bounce delay-150`})]})})]}),(0,_.jsxs)(`div`,{className:`absolute bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-200 z-30 transition-transform duration-300 font-sans shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-safe`,children:[(0,_.jsxs)(`div`,{className:`flex gap-2 px-4 py-2 text-xs border-b border-slate-100 overflow-x-auto no-scrollbar`,children:[(0,_.jsxs)(`button`,{onClick:()=>S({...x,write:!x.write}),className:`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${x.write?`bg-slate-800 text-white border-slate-800`:`bg-white text-slate-500 border-slate-200`}`,children:[(0,_.jsx)(`span`,{children:`✍️`}),` 续写正文`]}),(0,_.jsxs)(`button`,{onClick:()=>S({...x,comment:!x.comment}),className:`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${x.comment?`bg-slate-800 text-white border-slate-800`:`bg-white text-slate-500 border-slate-200`}`,children:[(0,_.jsx)(`span`,{children:`💬`}),` 角色吐槽`]}),(0,_.jsxs)(`button`,{onClick:()=>S({...x,analyze:!x.analyze}),className:`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${x.analyze?`bg-slate-800 text-white border-slate-800`:`bg-white text-slate-500 border-slate-200`}`,children:[(0,_.jsx)(`span`,{children:`🧠`}),` 深度分析`]})]}),(0,_.jsxs)(`div`,{className:`p-3 flex gap-2 items-end`,children:[(0,_.jsx)(`textarea`,{value:C,onChange:e=>w(e.target.value),placeholder:x.write?C.trim()?`输入剧情大纲...`:`输入指令或留空AI续写...`:`输入讨论内容...`,className:`flex-1 bg-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-700 outline-none resize-none max-h-32 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200 transition-all`,rows:1,style:{minHeight:`44px`}}),oe&&!T&&!C.trim()&&(0,_.jsx)(`button`,{onClick:le,className:`w-11 h-11 rounded-full flex items-center justify-center text-slate-500 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all shrink-0`,children:(0,_.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,className:`w-5 h-5`,children:(0,_.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99`})})}),(0,_.jsx)(`button`,{onClick:ce,disabled:T||!C.trim()&&!x.write,className:`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-all shrink-0 ${C.trim()||x.write?b.button:`bg-slate-300`}`,children:(0,_.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,viewBox:`0 0 24 24`,fill:`currentColor`,className:`w-5 h-5`,children:(0,_.jsx)(`path`,{d:`M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z`})})})]})]}),(0,_.jsx)(i,{isOpen:j,title:`编辑段落`,onClose:()=>M(!1),footer:(0,_.jsx)(`button`,{onClick:de,className:`w-full py-3 bg-slate-800 text-white font-bold rounded-2xl`,children:`保存`}),children:(0,_.jsx)(`textarea`,{value:F,onChange:e=>I(e.target.value),className:`w-full h-48 bg-slate-100 rounded-xl p-3 text-sm resize-none focus:outline-none leading-relaxed`})}),(0,_.jsx)(i,{isOpen:z,title:`章节总结`,onClose:()=>B(!1),footer:ie?(0,_.jsx)(`div`,{className:`w-full py-3 bg-slate-100 text-slate-500 font-bold rounded-2xl text-center`,children:`AI生成中...`}):(0,_.jsx)(`button`,{onClick:async()=>{let r={id:`seg-summary-${Date.now()}`,role:`analyst`,type:`analysis`,authorId:`system`,content:V,focus:`chapter_summary`,timestamp:Date.now(),meta:{reaction:`本章结束`,suggestion:`新章节开始`}},i=[...D,r];O(i),await t(e.id,{segments:i});let a=new Date().toISOString().split(`T`)[0],o=i.filter(e=>e.focus===`chapter_summary`).length,s=m.map(e=>e.name).join(`、`);for(let t of e.collaboratorIds){let r=n.find(e=>e.id===t);if(r){let t={id:`mem-${Date.now()}-${Math.random()}`,date:a,summary:`与${s}一起为《${e.title}》创作了第${o}章，已完成归档。`,mood:`creative`};p(r.id,{memories:[...r.memories||[],t]})}}B(!1),H(``),y(`章节已归档，记忆已同步`,`success`)},className:`w-full py-3 bg-indigo-500 text-white font-bold rounded-2xl shadow-lg`,children:`确认归档并开启新章`}),children:(0,_.jsx)(`textarea`,{value:V,onChange:e=>H(e.target.value),className:`w-full h-64 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none leading-relaxed`,placeholder:`总结生成中...`})}),(0,_.jsx)(i,{isOpen:ae,title:`历史章节`,onClose:()=>W(!1),children:(0,_.jsxs)(`div`,{className:`max-h-[60vh] overflow-y-auto space-y-4 p-1`,children:[se.length===0&&(0,_.jsx)(`div`,{className:`text-center text-slate-400 py-4 text-xs`,children:`暂无历史章节`}),se.map((e,t)=>(0,_.jsxs)(`div`,{className:`bg-slate-50 p-4 rounded-xl border border-slate-100`,children:[(0,_.jsxs)(`div`,{className:`flex items-center justify-between mb-2`,children:[(0,_.jsxs)(`div`,{className:`font-bold text-sm text-slate-700`,children:[`第 `,t+1,` 章`]}),(0,_.jsx)(`button`,{onClick:()=>{K(t),W(!1)},className:`text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg font-bold hover:bg-indigo-100 border border-indigo-100 transition-colors`,children:`阅读原文`})]}),(0,_.jsx)(`div`,{className:`text-xs text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-4`,children:e.content})]},e.id))]})}),(0,_.jsx)(i,{isOpen:G!==null,title:Z[G??0]?.title||``,onClose:()=>K(null),children:(0,_.jsx)(`div`,{className:`max-h-[70vh] overflow-y-auto space-y-4 p-1`,children:G!==null&&Z[G]&&(0,_.jsxs)(_.Fragment,{children:[Z[G].segments.map(e=>{let t=e.authorId===`user`,r=t?null:n.find(t=>t.id===e.authorId);return(0,_.jsxs)(`div`,{className:`${b.paper} p-5 rounded-sm leading-loose text-justify text-[15px] ${b.text} ${t?`border-l-4 border-slate-300`:``}`,children:[(0,_.jsxs)(`div`,{className:`text-[9px] font-sans font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5`,children:[!t&&r&&(0,_.jsx)(`img`,{src:r.avatar,className:`w-3 h-3 rounded-full object-cover`}),(0,_.jsxs)(`span`,{children:[t?`我`:r?.name,` 执笔`]})]}),(0,_.jsx)(`div`,{className:`whitespace-pre-wrap font-serif`,children:e.content})]},e.id)}),(0,_.jsxs)(`div`,{className:`bg-indigo-50 p-4 rounded-xl border border-indigo-100 mt-4`,children:[(0,_.jsx)(`div`,{className:`text-[10px] font-bold text-indigo-400 uppercase mb-2`,children:`章节总结`}),(0,_.jsx)(`div`,{className:`text-xs text-indigo-700 leading-relaxed whitespace-pre-wrap`,children:Z[G].summary})]}),(0,_.jsxs)(`div`,{className:`flex justify-between pt-2`,children:[(0,_.jsx)(`button`,{onClick:()=>K(Math.max(0,(G??0)-1)),disabled:G===0,className:`text-xs text-slate-400 disabled:opacity-30 px-3 py-1.5 rounded-lg hover:bg-slate-100`,children:`← 上一章`}),(0,_.jsx)(`button`,{onClick:()=>K(Math.min(Z.length-1,(G??0)+1)),disabled:G===Z.length-1,className:`text-xs text-slate-400 disabled:opacity-30 px-3 py-1.5 rounded-lg hover:bg-slate-100`,children:`下一章 →`})]})]})})})]})},b=()=>{let{closeApp:e,novels:t,addNovel:n,updateNovel:r,deleteNovel:o,characters:f,updateCharacter:m,apiConfig:h,addToast:g,userProfile:ee,worldbooks:te,registerBackHandler:v}=a(),[b,x]=(0,u.useState)(`shelf`),[S,C]=(0,u.useState)(null),[w,T]=(0,u.useState)(d[0]),[E,D]=(0,u.useState)(``),[O,ne]=(0,u.useState)(``),[k,A]=(0,u.useState)(``),[re,j]=(0,u.useState)(``),[M,N]=(0,u.useState)(new Set),[P,F]=(0,u.useState)([]),[I,L]=(0,u.useState)(``),[R,z]=(0,u.useState)(``),B=(0,u.useRef)(null),[V,H]=(0,u.useState)(null),[ie,U]=(0,u.useState)(!1),[ae,W]=(0,u.useState)(!1),[G,K]=(0,u.useState)(`system`),[q,J]=(0,u.useState)(!1),[Y,oe]=(0,u.useState)(!1),[X,se]=(0,u.useState)(null),[Z,Q]=(0,u.useState)(null),[ce,le]=(0,u.useState)(null),ue=e=>d.find(t=>t.id===e)||d[0],de=(0,u.useMemo)(()=>S?f.filter(e=>S.collaboratorIds.includes(e.id)):[],[S,f]),fe=(0,u.useMemo)(()=>{let e=[],n=new Set;return t.forEach(t=>{t.protagonists.forEach(t=>{let r=`${t.name}-${t.role}`;n.has(r)||(n.add(r),e.push(t))})}),e},[t]);(0,u.useEffect)(()=>{S&&de.length>0&&!ce&&le(de[0].id)},[S,de]),(0,u.useEffect)(()=>{S&&T(ue(S.coverStyle))},[S]);let pe=(0,u.useCallback)(()=>{D(``),ne(``),A(``),j(``),N(new Set),F([]),z(``),L(``)},[]),$=(0,u.useCallback)(()=>b===`shelf`?(e(),!0):b===`library`?(x(`shelf`),!0):b===`create`?(pe(),x(`shelf`),!0):b===`settings`?(x(S?`write`:`shelf`),!0):b===`write`?(C(null),le(null),x(`shelf`),!0):!0,[S,e,pe,b]);(0,u.useEffect)(()=>v($),[$,v]);let me=()=>{if(!E.trim()){g(`请输入标题`,`error`);return}let e={id:`novel-${Date.now()}`,title:E,subtitle:O,summary:k,coverStyle:w.id,coverImage:R,worldSetting:re,collaboratorIds:Array.from(M),protagonists:P,segments:[],createdAt:Date.now(),lastActiveAt:Date.now()};n(e),C(e),x(`write`),pe()},he=()=>{S&&(D(S.title),ne(S.subtitle||``),A(S.summary),j(S.worldSetting),T(ue(S.coverStyle)),z(S.coverImage||``),N(new Set(S.collaboratorIds)),F(S.protagonists),x(`settings`))},ge=async()=>{if(!S)return;let e={...S,title:E,subtitle:O,summary:k,worldSetting:re,coverStyle:w.id,coverImage:R,collaboratorIds:Array.from(M),protagonists:P,segments:S.segments,lastActiveAt:Date.now()};await r(S.id,e),C(e),x(`write`),g(`设定已更新，内容完好`,`success`)},_e=async e=>{Q({isOpen:!0,title:`删除作品`,message:`确定要删除这本小说吗？此操作无法撤销。`,variant:`danger`,onConfirm:()=>{o(e),S?.id===e&&x(`shelf`),g(`已删除`,`success`),Q(null)}})},ve=async e=>{let t=e.target.files?.[0];if(t)try{z(await s(t,{maxWidth:800,quality:.8}))}catch{g(`图片处理失败`,`error`)}},ye=()=>{I&&z(I)},be=e=>{H(e||{id:`proto-${Date.now()}`,name:``,role:`主角`,description:``}),U(!0)},xe=()=>{if(!V||!V.name.trim()){g(`角色名不能为空`,`error`);return}F(e=>e.find(e=>e.id===V.id)?e.map(e=>e.id===V.id?V:e):[...e,V]),U(!1),H(null)},Se=e=>{let t={id:`proto-${Date.now()}-${Math.random()}`,name:e.name,role:e.role||`主角`,description:e.description||``};F(e=>[...e,t]),W(!1),g(`已导入角色: ${e.name}`,`success`)},Ce=e=>{let t=`\n\n【${e.title}】\n${e.content}`;j(e=>(e+t).trim()),J(!1),g(`已导入设定: ${e.title}`,`success`)},we=({p:e,onDelete:t,onClick:n})=>(0,_.jsxs)(`div`,{onClick:n,className:`bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative group cursor-pointer hover:border-slate-400 transition-colors`,children:[(0,_.jsxs)(`div`,{className:`font-bold text-slate-800 text-sm flex justify-between`,children:[(0,_.jsx)(`span`,{children:e.name}),(0,_.jsx)(`span`,{className:`text-[10px] bg-slate-100 px-1.5 rounded text-slate-500 font-normal`,children:e.role})]}),(0,_.jsx)(`div`,{className:`text-xs text-slate-500 mt-1 line-clamp-2`,children:e.description||`暂无描述`}),t&&(0,_.jsx)(`button`,{onClick:e=>{e.stopPropagation(),t()},className:`absolute top-1 right-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity`,children:`×`})]});return b===`library`?(0,_.jsxs)(`div`,{className:`h-full w-full bg-slate-50 flex flex-col font-sans`,children:[(0,_.jsx)(`div`,{className:`sully-safe-topbar h-20 bg-white/80 backdrop-blur-md flex items-end pb-3 px-6 border-b border-slate-200 shrink-0 sticky top-0 z-20`,children:(0,_.jsxs)(`div`,{className:`flex justify-between items-center w-full`,children:[(0,_.jsx)(`button`,{onClick:$,className:`p-2 -ml-2 rounded-full hover:bg-slate-100 active:scale-90 transition-transform`,"aria-label":`返回手稿`,children:(0,_.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,className:`w-6 h-6 text-slate-600`,children:(0,_.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M15.75 19.5 8.25 12l7.5-7.5`})})}),(0,_.jsx)(`span`,{className:`font-bold text-slate-800 text-lg tracking-wide`,children:`角色库`}),(0,_.jsx)(`div`,{className:`w-8`})]})}),(0,_.jsxs)(`div`,{className:`flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar`,children:[(0,_.jsxs)(`section`,{children:[(0,_.jsxs)(`h3`,{className:`text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2`,children:[(0,_.jsx)(`span`,{children:`🤖`}),` 系统角色 (AI Collaborators)`]}),(0,_.jsx)(`div`,{className:`grid grid-cols-2 gap-4`,children:f.map(e=>(0,_.jsxs)(`div`,{onClick:()=>{se(e),oe(!0)},className:`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition-all active:scale-95`,children:[(0,_.jsx)(`img`,{src:e.avatar,className:`w-16 h-16 rounded-full object-cover border-2 border-slate-50`}),(0,_.jsxs)(`div`,{className:`text-center`,children:[(0,_.jsx)(`div`,{className:`font-bold text-slate-700 text-sm`,children:e.name}),(0,_.jsx)(`div`,{className:`text-[10px] text-slate-400 mt-1 px-2 py-0.5 bg-slate-50 rounded-full`,children:`共创者`})]})]},e.id))})]}),(0,_.jsxs)(`section`,{children:[(0,_.jsxs)(`h3`,{className:`text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2`,children:[(0,_.jsx)(`span`,{children:`🎭`}),` 历史剧中人 (From History)`]}),fe.length===0?(0,_.jsx)(`div`,{className:`text-center py-8 text-slate-400 text-xs`,children:`暂无历史角色数据`}):(0,_.jsx)(`div`,{className:`grid grid-cols-1 gap-3`,children:fe.map((e,t)=>(0,_.jsxs)(`div`,{className:`bg-white p-4 rounded-xl border border-slate-200 shadow-sm`,children:[(0,_.jsxs)(`div`,{className:`flex justify-between items-start mb-2`,children:[(0,_.jsx)(`span`,{className:`font-bold text-slate-800`,children:e.name}),(0,_.jsx)(`span`,{className:`text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100`,children:e.role})]}),(0,_.jsx)(`p`,{className:`text-xs text-slate-500 leading-relaxed line-clamp-3`,children:e.description||`暂无描述`})]},t))})]})]}),(0,_.jsx)(i,{isOpen:Y,title:X?.name||`角色风格`,onClose:()=>oe(!1),children:(0,_.jsx)(`div`,{className:`max-h-[60vh] overflow-y-auto space-y-4 p-1`,children:X?(0,_.jsx)(`div`,{className:`bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap`,children:X.writerPersona||p(X)}):null})})]}):b===`shelf`?(0,_.jsxs)(`div`,{className:`h-full w-full bg-slate-50 flex flex-col font-sans relative`,children:[(0,_.jsx)(l,{isOpen:!!Z,title:Z?.title||``,message:Z?.message||``,variant:Z?.variant,confirmText:Z?.confirmText||(Z?.onConfirm?`确认`:`OK`),onConfirm:Z?.onConfirm||(()=>Q(null)),onCancel:()=>Q(null)}),(0,_.jsxs)(`div`,{className:`sully-safe-topbar-spacious h-24 flex items-end justify-between px-6 pb-6 bg-white/80 backdrop-blur-md z-20 shrink-0 border-b border-slate-100`,children:[(0,_.jsx)(`button`,{onClick:$,className:`p-3 -ml-3 rounded-full hover:bg-slate-100 active:scale-95 transition-all`,"aria-label":`关闭手稿`,children:(0,_.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:2,stroke:`currentColor`,className:`w-6 h-6 text-slate-600`,children:(0,_.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M15.75 19.5 8.25 12l7.5-7.5`})})}),(0,_.jsx)(`span`,{className:`font-black text-2xl text-slate-800 tracking-tight`,children:`我的手稿`}),(0,_.jsxs)(`div`,{className:`flex gap-2`,children:[(0,_.jsx)(`button`,{onClick:()=>x(`library`),className:`w-10 h-10 bg-white text-slate-600 border border-slate-200 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform hover:bg-slate-50`,"aria-label":`打开角色库`,children:(0,_.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,className:`w-5 h-5`,children:(0,_.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z`})})}),(0,_.jsx)(`button`,{onClick:()=>{x(`create`),pe()},className:`w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-black`,"aria-label":`新建书稿`,children:(0,_.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:2.5,stroke:`currentColor`,className:`w-5 h-5`,children:(0,_.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M12 4.5v15m7.5-7.5h-15`})})})]})]}),(0,_.jsxs)(`div`,{className:`p-6 grid grid-cols-2 gap-5 overflow-y-auto pb-24`,children:[t.map(e=>{let t=ue(e.coverStyle),n=e.segments.reduce((e,t)=>e+(t.type===`story`?t.content.length:0),0),r=e.coverImage?{backgroundImage:`url(${e.coverImage})`,backgroundSize:`cover`,backgroundPosition:`center`}:{};return(0,_.jsxs)(`div`,{onClick:()=>{C(e),x(`write`)},className:`group relative aspect-auto min-h-[14rem] bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 cursor-pointer flex flex-col`,children:[(0,_.jsxs)(`div`,{className:`h-28 shrink-0 ${t.bg} relative p-4 flex flex-col justify-end`,style:r,children:[(0,_.jsx)(`div`,{className:`absolute inset-0 ${e.coverImage?`bg-black/30`:``}`}),(0,_.jsxs)(`div`,{className:`relative z-10`,children:[(0,_.jsx)(`h3`,{className:`font-bold text-lg leading-tight line-clamp-2 ${e.coverImage?`text-white drop-shadow-md`:t.text}`,children:e.title}),e.subtitle&&(0,_.jsx)(`p`,{className:`text-[10px] font-bold opacity-80 uppercase tracking-wide truncate ${e.coverImage?`text-white`:t.text}`,children:e.subtitle})]})]}),(0,_.jsxs)(`div`,{className:`p-4 flex-1 flex flex-col justify-between`,children:[(0,_.jsx)(`p`,{className:`text-xs text-slate-500 line-clamp-3 leading-relaxed mb-3`,children:e.summary||`暂无简介...`}),(0,_.jsxs)(`div`,{className:`flex items-center justify-between pt-3 border-t border-slate-50`,children:[(0,_.jsx)(`div`,{className:`flex -space-x-2`,children:f.filter(t=>e.collaboratorIds.includes(t.id)).map(e=>(0,_.jsx)(`img`,{src:e.avatar,className:`w-6 h-6 rounded-full border-2 border-white object-cover`},e.id))}),(0,_.jsxs)(`span`,{className:`text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded-full`,children:[(n/1e3).toFixed(1),`k 字`]})]})]}),(0,_.jsx)(`button`,{onClick:t=>{t.stopPropagation(),_e(e.id)},className:`absolute top-2 right-2 text-slate-400/50 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur rounded-full`,children:`×`})]},e.id)}),t.length===0&&(0,_.jsxs)(`div`,{className:`col-span-2 flex flex-col items-center justify-center h-64 text-slate-300 gap-3`,children:[(0,_.jsx)(`span`,{className:`text-4xl opacity-50 grayscale`,children:`🖋️`}),(0,_.jsx)(`span`,{className:`text-sm font-sans`,children:`点击右上角，开始创作`})]})]})]}):b===`create`||b===`settings`?(0,_.jsxs)(`div`,{className:`h-full w-full bg-slate-50 flex flex-col font-sans relative`,children:[(0,_.jsx)(l,{isOpen:!!Z,title:Z?.title||``,message:Z?.message||``,variant:Z?.variant,confirmText:Z?.confirmText||(Z?.onConfirm?`确认`:`OK`),onConfirm:Z?.onConfirm||(()=>Q(null)),onCancel:()=>Q(null)}),(0,_.jsxs)(`div`,{className:`sully-safe-topbar-compact h-16 flex items-center justify-between px-4 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-20`,children:[(0,_.jsx)(`button`,{onClick:$,className:`text-slate-500 text-sm`,children:`取消`}),(0,_.jsx)(`span`,{className:`font-bold text-slate-800`,children:b===`create`?`新建书稿`:`小说设定`}),(0,_.jsx)(`button`,{onClick:b===`create`?me:ge,className:`bg-slate-800 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md active:scale-95 transition-transform`,children:`保存`})]}),(0,_.jsxs)(`div`,{className:`flex-1 overflow-y-auto p-6 space-y-8 pb-20`,children:[(0,_.jsxs)(`section`,{className:`space-y-4`,children:[(0,_.jsx)(`input`,{value:E,onChange:e=>D(e.target.value),placeholder:`书名`,className:`w-full text-2xl font-bold bg-transparent border-b border-slate-200 py-2 outline-none focus:border-slate-800 font-serif`}),(0,_.jsx)(`input`,{value:O,onChange:e=>ne(e.target.value),placeholder:`卷名/副标题`,className:`w-full text-sm font-bold bg-transparent border-b border-slate-200 py-2 outline-none focus:border-slate-800 text-slate-600`}),(0,_.jsx)(`textarea`,{value:k,onChange:e=>A(e.target.value),placeholder:`一句话简介...`,className:`w-full h-20 bg-slate-100 rounded-xl p-3 text-sm resize-none outline-none`}),(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`label`,{className:`text-xs font-bold text-slate-400 uppercase mb-2 block`,children:`内页风格`}),(0,_.jsx)(`div`,{className:`flex gap-3 overflow-x-auto pb-2 no-scrollbar`,children:d.map(e=>(0,_.jsx)(`button`,{onClick:()=>T(e),className:`w-12 h-16 rounded-md shadow-sm border-2 shrink-0 ${e.bg} ${w.id===e.id?`border-slate-800 scale-105`:`border-transparent`}`},e.id))})]}),(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`label`,{className:`text-xs font-bold text-slate-400 uppercase mb-2 block`,children:`自定义封面`}),(0,_.jsxs)(`div`,{className:`flex gap-3 items-center`,children:[(0,_.jsxs)(`div`,{onClick:()=>B.current?.click(),className:`w-16 h-24 bg-slate-100 rounded-md border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-500 relative overflow-hidden`,children:[R?(0,_.jsx)(`img`,{src:R,className:`w-full h-full object-cover`}):(0,_.jsx)(`span`,{className:`text-xs text-slate-400`,children:`+`}),(0,_.jsx)(`input`,{type:`file`,ref:B,className:`hidden`,accept:`image/*`,onChange:ve})]}),(0,_.jsxs)(`div`,{className:`flex-1 space-y-2`,children:[(0,_.jsx)(`input`,{value:I,onChange:e=>L(e.target.value),onBlur:ye,placeholder:`粘贴图片链接...`,className:`w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400`,...c({kind:`url`,field:`novel-cover-url`})}),R&&(0,_.jsx)(`button`,{onClick:()=>{z(``),L(``)},className:`text-xs text-red-400 underline`,children:`清除封面`})]})]})]})]}),(0,_.jsxs)(`section`,{className:`space-y-4`,children:[(0,_.jsxs)(`div`,{className:`flex justify-between items-center`,children:[(0,_.jsx)(`label`,{className:`text-xs font-bold text-slate-400 uppercase block`,children:`世界观设定`}),(0,_.jsxs)(`button`,{onClick:()=>J(!0),className:`text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold hover:bg-indigo-100 flex items-center gap-1`,children:[(0,_.jsx)(`span`,{children:`📚`}),` 导入世界书`]})]}),(0,_.jsx)(`textarea`,{value:re,onChange:e=>j(e.target.value),placeholder:`世界观设定...`,className:`w-full h-32 bg-white border border-slate-200 rounded-xl p-3 text-sm resize-none outline-none focus:border-slate-400`})]}),(0,_.jsxs)(`section`,{className:`space-y-4`,children:[(0,_.jsx)(`label`,{className:`text-xs font-bold text-slate-400 uppercase block`,children:`共创者`}),(0,_.jsx)(`div`,{className:`flex gap-3 overflow-x-auto pb-2 no-scrollbar`,children:f.map(e=>(0,_.jsxs)(`div`,{onClick:()=>{let t=new Set(M);t.has(e.id)?t.delete(e.id):t.add(e.id),N(t)},className:`flex flex-col items-center gap-2 cursor-pointer transition-opacity ${M.has(e.id)?`opacity-100`:`opacity-50 grayscale`}`,children:[(0,_.jsx)(`img`,{src:e.avatar,className:`w-12 h-12 rounded-full object-cover shadow-sm`}),(0,_.jsx)(`span`,{className:`text-[10px] font-bold text-slate-600`,children:e.name})]},e.id))})]}),(0,_.jsxs)(`section`,{className:`space-y-4`,children:[(0,_.jsxs)(`div`,{className:`flex justify-between items-center`,children:[(0,_.jsx)(`label`,{className:`text-xs font-bold text-slate-400 uppercase`,children:`剧中人`}),(0,_.jsxs)(`div`,{className:`flex gap-2`,children:[(0,_.jsx)(`button`,{onClick:()=>W(!0),className:`text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold hover:bg-indigo-100 border border-indigo-100`,children:`📂 导入`}),(0,_.jsx)(`button`,{onClick:()=>be(),className:`text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 hover:bg-slate-200 transition-colors`,children:`+ 添加`})]})]}),(0,_.jsx)(`div`,{className:`grid grid-cols-2 gap-3`,children:P.map((e,t)=>(0,_.jsx)(we,{p:e,onClick:()=>be(e),onDelete:()=>F(P.filter((e,n)=>n!==t))},e.id))})]})]}),(0,_.jsx)(i,{isOpen:ie,title:`编辑角色`,onClose:()=>U(!1),footer:(0,_.jsx)(`button`,{onClick:xe,className:`w-full py-3 bg-slate-800 text-white font-bold rounded-2xl`,children:`保存`}),children:V&&(0,_.jsxs)(`div`,{className:`space-y-4`,children:[(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`label`,{className:`text-xs font-bold text-slate-400 uppercase block mb-1`,children:`姓名`}),(0,_.jsx)(`input`,{value:V.name,onChange:e=>H({...V,name:e.target.value}),className:`w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold`})]}),(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`label`,{className:`text-xs font-bold text-slate-400 uppercase block mb-1`,children:`定位`}),(0,_.jsx)(`input`,{value:V.role,onChange:e=>H({...V,role:e.target.value}),className:`w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm`,placeholder:`主角 / 反派`})]}),(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`label`,{className:`text-xs font-bold text-slate-400 uppercase block mb-1`,children:`设定`}),(0,_.jsx)(`textarea`,{value:V.description,onChange:e=>H({...V,description:e.target.value}),className:`w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm resize-none leading-relaxed`})]})]})}),(0,_.jsxs)(i,{isOpen:ae,title:`导入角色`,onClose:()=>W(!1),children:[(0,_.jsxs)(`div`,{className:`flex p-1 bg-slate-100 rounded-xl mb-3`,children:[(0,_.jsx)(`button`,{onClick:()=>K(`system`),className:`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${G===`system`?`bg-white shadow text-indigo-600`:`text-slate-400`}`,children:`系统角色 (AI)`}),(0,_.jsx)(`button`,{onClick:()=>K(`history`),className:`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${G===`history`?`bg-white shadow text-indigo-600`:`text-slate-400`}`,children:`历史角色`})]}),(0,_.jsxs)(`div`,{className:`max-h-[50vh] overflow-y-auto no-scrollbar space-y-3 p-1`,children:[G===`system`&&f.map(e=>(0,_.jsxs)(`button`,{onClick:()=>Se({name:e.name,role:`客串`,description:e.description}),className:`w-full flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 shadow-sm active:scale-95 transition-all text-left`,children:[(0,_.jsx)(`img`,{src:e.avatar,className:`w-8 h-8 rounded-full object-cover`}),(0,_.jsxs)(`div`,{className:`flex-1 min-w-0`,children:[(0,_.jsx)(`div`,{className:`font-bold text-sm text-slate-700`,children:e.name}),(0,_.jsx)(`div`,{className:`text-[10px] text-slate-400 truncate`,children:e.description})]})]},e.id)),G===`history`&&fe.map((e,t)=>(0,_.jsxs)(`button`,{onClick:()=>Se(e),className:`w-full flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 shadow-sm active:scale-95 transition-all text-left`,children:[(0,_.jsx)(`div`,{className:`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200`,children:e.name[0]}),(0,_.jsxs)(`div`,{className:`flex-1 min-w-0`,children:[(0,_.jsx)(`div`,{className:`font-bold text-sm text-slate-700`,children:e.name}),(0,_.jsxs)(`div`,{className:`text-[10px] text-slate-400 truncate`,children:[e.role,` - `,e.description||`无描述`]})]})]},`hist-${t}`))]})]}),(0,_.jsx)(i,{isOpen:q,title:`导入世界书设定`,onClose:()=>J(!1),children:(0,_.jsx)(`div`,{className:`max-h-[50vh] overflow-y-auto no-scrollbar space-y-2 p-1`,children:te.map(e=>(0,_.jsxs)(`button`,{onClick:()=>Ce(e),className:`w-full text-left p-3 rounded-xl border border-slate-100 hover:border-indigo-300 bg-white shadow-sm active:scale-95 transition-all`,children:[(0,_.jsx)(`div`,{className:`font-bold text-slate-700 text-sm`,children:e.title}),(0,_.jsx)(`div`,{className:`text-[10px] text-slate-400 mt-1`,children:e.category||`未分类`})]},e.id))})})]}):b===`write`&&S?(0,_.jsx)(y,{activeBook:S,updateNovel:r,characters:f,userProfile:ee,apiConfig:h,onBack:$,updateCharacter:m,collaborators:de,targetCharId:ce,setTargetCharId:le,onOpenSettings:he}):null};export{b as default};