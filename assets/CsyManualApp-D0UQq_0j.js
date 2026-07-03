import{o as e}from"./rolldown-runtime-CMxvf4Kt.js";import{t}from"./react-ICqv4BO6.js";import{t as n}from"./jsx-runtime-DDrWIXeu.js";import{Pt as r}from"./index-BsnmE8U4.js";var i=e(t(),1),a=[`入门`,`核心`,`关系`,`记忆`,`创作`,`外部`,`工具`,`设置`,`排查`],o=[{id:`character`,emoji:`⚡`,title:`神经链接`,category:`核心`,entry:`桌面 → 神经链接。也可以从聊天、见面、语音等角色选择处回到角色详情。`,summary:`角色管理中心。创建 char、编辑设定、挂载世界书、管理记忆和印象都从这里开始。`,color:`bg-sky-50`,textColor:`text-sky-700`,keywords:[`角色`,`char`,`人设`,`记忆`,`世界书`,`微信绑定`],items:[{label:`主要功能`,detail:`• 新建、导入、编辑、删除角色
• 配置 System Prompt、世界观、地理位置、声线 ID
• 挂载世界书分组，调整插入位置
• 查看传统记忆、向量记忆、印象、生活侧写
• 绑定真实微信账号并查看连接状态`},{label:`基础操作`,detail:`1. 进神经链接，点底部 + 新建角色，或点右上角上传导入角色卡。
2. 点进角色详情，在设定 Tab 填人设、世界观和声线。
3. 需要世界书时，先在世界书 App 创建条目，再回到角色设定里挂载。
4. 想开始聊天，点角色详情右上角的发消息入口。`},{label:`记忆与印象`,detail:`记忆 Tab 里可以看传统记忆日历，也可以开启向量记忆。

向量记忆需要副 API + Embedding API。开启后会按聊天积累自动提取，也可以手动批量提取历史消息。

印象 Tab 用来生成或编辑角色对你的长期看法。`},{label:`注意事项`,detail:`角色卡导出通常不包含完整聊天记录和记忆库，适合分享人设，不适合完整搬家。

世界书写好了但聊天没效果，先检查是否挂载到当前角色，以及插入位置是否正确。`}]},{id:`chat`,emoji:`💬`,title:`Message / 聊天`,category:`核心`,entry:`桌面 → Message，或神经链接 → 角色详情 → 发消息。`,summary:`日常对话主界面。文字、图片、语音、表情、转账、主题、心声和记忆归档都在这里使用。`,color:`bg-indigo-50`,textColor:`text-indigo-700`,keywords:[`聊天`,`Message`,`心声`,`主题`,`语音消息`,`记忆归档`],items:[{label:`主要功能`,detail:`• 发送文字、图片、语音、表情、转账、戳一戳
• 长按消息进行回复、复制、编辑、删除、回溯
• 调整聊天背景、上下文条数、主题、翻译
• 开启心声模式、歌曲分享、语音回复、小红书
• 手动归档近期聊天为角色记忆`},{label:`基础操作`,detail:`1. 底部输入文字后发送。
2. 角色不会自动秒回时，点顶部右侧的闪电按钮触发回复。
3. 点输入区旁边的 + 打开更多消息类型。
4. 长按任意消息打开消息操作。
5. 右上角菜单进入聊天设置、主题和记忆归档。`},{label:`心声与主题`,detail:`心声模式控制每轮回复后是否生成状态卡片。常用模式包括经典心声、创意卡片、自定义模板、查手机、番外篇。

聊天主题可以使用默认、微信或自定义气泡。自定义主题从气泡工坊制作后在聊天设置里启用。`},{label:`高级消息功能`,detail:`聊天里的 + 面板和长按菜单会随着当前主题、角色配置和可用能力显示不同功能。

常见高级操作：
• 手动生图：打开手动照片面板，写画面描述后生成并保存
• 手动日程：把今天的行程写入角色可读的生活上下文
• 转账 / 戳一戳 / 多选：适合微信主题下的拟真互动
• 朗读消息：把角色文字消息原地转成语音气泡
• 下载语音：保存已经生成的语音消息音频
• 回到这里：从某条角色回复回溯，让后续对话重新生成`},{label:`小红书与朋友圈`,detail:`小红书能力需要两步都完成：
1. 设置 → 实时感知 → 小红书里连接本地服务并确认登录
2. Message → 当前角色聊天设置里打开小红书开关

开启后，角色可以搜索笔记、刷推荐、分享笔记、发帖、点赞收藏和评论。

朋友圈/动态类内容会从角色、图库、聊天材料和社交关系里取材。想让动态更贴角色，先补角色设定、相册素材和小红书图库。`},{label:`番外篇与聊天回声`,detail:`番外篇是心声模式之一，会在回复后生成额外的同人本式片段，也可以通过星星入口手动加梗。

聊天回声是聊天内的快速写歌流程：先写歌词，再补曲风，生成后会出现在 Emo Cloud，也会留在回声唱片里。

这两类依赖副 API 或外部音乐服务，适合关键剧情、纪念日或重要情绪点使用。`},{label:`注意事项`,detail:`上下文条数越大，消耗越高，也更容易触发模型上下文上限。聊天太长或图片太多时报错，先把上下文条数调低。

清空历史不可撤销，重要内容先做记忆归档或备份。`}]},{id:`group-chat`,emoji:`👥`,title:`群聊`,category:`核心`,entry:`桌面 Dock → 群聊。`,summary:`让多个角色在同一个房间里对话，适合多人关系、群像剧情和角色互相评价。`,color:`bg-violet-50`,textColor:`text-violet-700`,keywords:[`群聊`,`多人`,`群像`,`角色互动`],items:[{label:`主要功能`,detail:`• 选择多个角色组成群聊
• 发送群消息，让不同角色按人设回应
• 观察角色之间的互相接话和关系张力
• 保存群聊记录，作为后续互动背景`},{label:`基础操作`,detail:`1. 进入群聊后创建或选择一个群。
2. 添加参与角色。
3. 输入你想说的话，必要时点触发按钮让角色轮流回应。
4. 聊完后回到群列表继续其他群。`},{label:`适合场景`,detail:`适合家庭、队伍、宿舍、公司、修罗场、跑团队友等多人关系。

如果只想和单个角色深入聊天，优先使用 Message。`},{label:`注意事项`,detail:`群聊上下文更大，消耗通常高于单聊。角色越多，越需要控制发言轮次和上下文长度。`}]},{id:`user`,emoji:`🪪`,title:`档案`,category:`核心`,entry:`桌面 → 档案。`,summary:`管理你的用户资料，让角色知道该如何称呼你、理解你的身份和外观设定。`,color:`bg-blue-50`,textColor:`text-blue-700`,keywords:[`用户`,`档案`,`昵称`,`头像`,`身份`],items:[{label:`主要功能`,detail:`• 设置你的昵称、头像、简介
• 维护角色会读取的用户身份信息
• 配置图片生成时你的外观提示词
• 管理和角色互动相关的个人资料`},{label:`基础操作`,detail:`1. 进入档案。
2. 上传头像，填写昵称和简介。
3. 如果会用生图，补充你的外观描述。
4. 保存后回到聊天，角色会在后续上下文里参考这些资料。`},{label:`和其他 App 的关系`,detail:`聊天、见面、语音、清醒梦、半糖主义等功能都会读取部分用户资料。

如果角色总是叫错名字或误解你的身份，先检查档案。`},{label:`注意事项`,detail:`档案不是聊天记忆。想让角色记住某段共同经历，应使用聊天归档、神经链接记忆或认知网络。`}]},{id:`settings`,emoji:`⚙️`,title:`设置`,category:`设置`,entry:`桌面 Dock → 设置。`,summary:`全局配置中心。API、语音、实时感知、自律代理、备份恢复和运行偏好都在这里。`,color:`bg-slate-100`,textColor:`text-slate-700`,keywords:[`设置`,`API`,`TTS`,`STT`,`备份`,`自律代理`,`推送`],items:[{label:`主要功能`,detail:`• 配置主 API、副 API、API 池和模型
• 配置 TTS、STT、Embedding、生图服务
• 管理实时感知、推送通知和自律代理
• 导出、导入、云端备份和恢复数据
• 设置沉浸全屏、触觉反馈等系统偏好`},{label:`API 配置`,detail:`主 API 用于聊天主回复，是最关键配置。

副 API 推荐填写，用于心声、记忆提取、总结、部分创作功能。

Embedding API 主要用于向量记忆和认知网络检索。

模型列表拉取失败时，优先检查 Base URL 是否带 /v1、Key 是否多空格、模型名是否可用。`},{label:`副 API 池`,detail:`副 API 池用于把后台任务分摊给多组轻量模型，适合心声、状态栏、记忆提取、歌词辅助、封面提示词等任务。

使用建议：
• 每组配置填 Base URL、Key、模型名
• 优先放便宜、速度快、稳定的模型
• 某组 429 或超时时，会临时冷却并切到其他可用项
• 只配主 API 也能聊天，但很多后台增强功能会缺席或变慢`},{label:`语音配置`,detail:`TTS 负责把角色文本变成语音，STT 负责把你的语音转成文字。语音通话需要两者都可用。

角色自己的声线 ID 在神经链接 → 角色详情里配置。`},{label:`TTS / STT 高级项`,detail:`TTS 支持不同朗读引擎和通话引擎。语音通话里可以选择 MiniMax、ElevenLabs 或 Fish Audio 等供应商，具体字段以设置页显示为准。

回声音色可以先生成 3 个试听，再把选中的 ElevenLabs 预览保存成可复用 Voice ID。生成预览和保存音色会调用对应外部服务。

STT 支持 Groq、硅基流动等供应商。长语音或停顿较多时，可以开启“识别后手动发送”，先检查草稿再发给模型。`},{label:`实时感知`,detail:`实时感知把外部世界材料注入角色上下文，主要包括天气、新闻、微博热搜、Notion/飞书日记和小红书。

使用顺序：
1. 在设置 → 实时感知里打开需要的模块
2. 填对应服务的 Key、数据库 ID 或本地服务地址
3. 小红书需要扫码登录并测试连接
4. 回到聊天，让角色自然接住这些外部材料

不是每轮都会主动提，角色会按人设和语境选择是否使用。`},{label:`自律代理与推送`,detail:`自律代理让角色在你不主动说话时也能检查状态，决定是否主动发消息或来电。

核心参数：
• 最短/最长检查间隔：控制检查频率
• 冷却时间和每日上限：防止过度打扰
• 连续未回复容忍：你一直不回时自动克制
• 系统通知：通过 Web Push 把消息推到设备通知栏

调试模式会缩短检查间隔，只适合测试，日常建议关闭。`},{label:`备份恢复`,detail:`重要修改前先备份。整合导出适合完整搬家，纯文字备份适合保留设定和文本，媒体备份适合保存图片音频素材。

导入备份会覆盖当前数据，操作前确认文件来源和版本。`},{label:`备份类型怎么选`,detail:`• 整合导出：最完整，包含文字和媒体，适合换设备前使用
• 纯文字备份：体积小，包含聊天记录、角色设定、剧情数据，不带图片
• 媒体备份：只保图片、音频、美化素材，适合分步迁移
• APK/PWA ZIP 导入：可在浏览器、PWA、APK 之间恢复

认知网络漫游记忆建议配合同一个通行印记使用。导入中断后，系统会提示重新导入同一个备份。`}]},{id:`worldbook`,emoji:`📚`,title:`世界书`,category:`创作`,entry:`桌面 → 世界书。`,summary:`管理长期背景资料、设定条目和触发关键词。写好后需要挂载到角色才会生效。`,color:`bg-indigo-50`,textColor:`text-indigo-700`,keywords:[`世界书`,`设定`,`关键词`,`挂载`],items:[{label:`主要功能`,detail:`• 创建世界书分组和条目
• 写入世界观、势力、地点、术语、关系设定
• 配置关键词触发和常驻注入
• 供角色聊天、见面、剧情创作时读取`},{label:`基础操作`,detail:`1. 进入世界书，新建分组。
2. 在分组里新增条目，填写标题、关键词和正文。
3. 回到神经链接 → 角色详情 → 设定 Tab。
4. 将世界书分组挂载到该角色，并选择插入位置。`},{label:`插入位置`,detail:`破限类、行为约束类更适合放在人设之前。

世界观、地点、势力设定适合放在世界观之后。

阶段关系、热梗、近期事件适合放在印象或记忆之后。`},{label:`注意事项`,detail:`世界书不是越多越好。条目太长会挤占聊天上下文，关键词太宽会误触发。建议一个条目只写一类信息。`}]},{id:`date`,emoji:`💗`,title:`见面`,category:`关系`,entry:`桌面 → 见面。`,summary:`更偏线下相处的沉浸场景，适合一段具体见面、约谈、陪伴或剧情互动。`,color:`bg-pink-50`,textColor:`text-pink-700`,keywords:[`见面`,`约会`,`场景`,`总结`,`照片`],items:[{label:`主要功能`,detail:`• 选择角色进入一段见面场景
• 用台词和动作推进互动
• 手动总结本次见面为记忆
• 生成或保存场景照片
• 将重要片段同步回主聊天时间线`},{label:`基础操作`,detail:`1. 进入见面，选择角色和场景。
2. 用输入框写你说的话，或写动作描述。
3. 根据角色回应继续推进。
4. 结束前使用总结/记忆功能，保留这次见面的重点。`},{label:`和聊天的区别`,detail:`聊天更像线上联系，见面更像正在发生的现场。

想写动作、环境、距离、沉默和细节时，用见面更合适。`},{label:`注意事项`,detail:`重要见面建议结束前手动总结，否则角色后续不一定能完整记住现场细节。`}]},{id:`theater`,emoji:`✨`,title:`约会`,category:`关系`,entry:`桌面 → 约会。`,summary:`乙游式约会剧场。选择世界线、地点票根和场景图，把关系推进到具体地点里。`,color:`bg-rose-50`,textColor:`text-rose-700`,keywords:[`约会`,`剧场`,`地点`,`票根`,`立绘`,`世界线`],items:[{label:`主要功能`,detail:`• 创建或继续约会世界线
• 选择地点票根进入场景
• 通过台词和动作推进剧情
• 调整立绘、头像、位置、音乐
• 离开时整理记忆或保存原始过程`},{label:`基础操作`,detail:`1. 进入约会，选择角色。
2. 在 WORLDLINES 开启新世界线或继续旧世界线。
3. 在地图里选择地点票根。
4. 进入场景后点击对话框推进，看到回复入口时写台词或动作。
5. 离开时选择仪式感收尾、整理记忆或暂时离开。`},{label:`小光球`,detail:`小光球是约会里的快捷控制器。

• 场景：换地点或接受角色提议
• 立绘：调整角色和用户显示
• 音乐：开关氛围 BGM
• 记忆：整理或查看约会记忆`},{label:`注意事项`,detail:`约会适合写一段完整现场。如果只是日常联系，用 Message 更轻。

很重要的约会建议用仪式感或整理记忆收尾。`}]},{id:`journal`,emoji:`📖`,title:`交换日记`,category:`关系`,entry:`桌面 → 交换日记。`,summary:`以日记形式保存你和角色的心情、片段和回信，适合慢节奏记录关系。`,color:`bg-amber-50`,textColor:`text-amber-700`,keywords:[`日记`,`交换`,`回信`,`记录`],items:[{label:`主要功能`,detail:`• 写一篇给角色看的日记
• 让角色以回信或日记形式回应
• 浏览过去的记录
• 将重要内容作为关系材料沉淀`},{label:`基础操作`,detail:`1. 进入交换日记。
2. 选择角色，写下今天想留下的内容。
3. 保存或发送给角色回应。
4. 回到列表查看历史日记。`},{label:`适合场景`,detail:`适合不急着对话、想留下一天心情、想让角色用更完整文字回应的时候。`},{label:`注意事项`,detail:`日记偏记录，不等同于自动记忆。特别重要的信息仍建议通过神经链接记忆或认知网络沉淀。`}]},{id:`check-phone`,emoji:`📱`,title:`查手机`,category:`关系`,entry:`桌面 → 查手机，或聊天心声模式选择查手机后从角色头像旁入口进入。`,summary:`查看角色手机里的片段内容，像翻到他的应用、通知、备忘和生活侧影。`,color:`bg-slate-100`,textColor:`text-slate-700`,keywords:[`查手机`,`小手机`,`角色手机`,`心声`],items:[{label:`主要功能`,detail:`• 以角色视角查看手机内容
• 触发随机 App 片段、通知或生活细节
• 配合心声模式观察角色没说出口的状态
• 为聊天提供更强的生活感`},{label:`基础操作`,detail:`1. 从桌面直接打开查手机，或在聊天设置里启用查手机心声模式。
2. 选择角色或从聊天中的入口进入。
3. 点开可查看的手机内容。
4. 回到聊天继续接这段信息。`},{label:`适合场景`,detail:`适合想知道角色私下在做什么、在意什么、手机里留下了什么痕迹的时候。`},{label:`注意事项`,detail:`查手机内容依赖角色设定、聊天材料和当前状态。材料越丰富，生成越贴近角色。`}]},{id:`trajectory`,emoji:`🧭`,title:`轨迹`,category:`记忆`,entry:`桌面 → 轨迹。`,summary:`角色人生时间线。整理相遇前与相遇后的节点，听见不同阶段的角色独白。`,color:`bg-indigo-50`,textColor:`text-indigo-700`,keywords:[`轨迹`,`人生`,`时间线`,`节点`,`对影`],items:[{label:`主要功能`,detail:`• 为角色生成相遇前人生节点
• 从聊天和记忆中整理相遇后节点
• 阅读每个阶段的第一人称独白
• 手动留下重要关系节点
• 从轨迹进入跨时空对话`},{label:`基础操作`,detail:`1. 进入轨迹，选择角色。
2. 首次使用先生成相遇前节点。
3. 点开时间轴节点阅读独白。
4. 需要补充时点继续追溯或留下一段记忆。
5. 想让不同阶段的他对话时，从轨迹里的对影入口进入。`},{label:`节点操作`,detail:`节点内可使用 whisper、rewrite、delete 等操作。

whisper 适合对过去的他说一句轻的话；rewrite 用于重写当前独白；delete 删除不合适节点。`},{label:`注意事项`,detail:`刚创建的角色材料少，轨迹会比较空。先补人设、世界书、长期记忆和聊天材料，再生成效果更稳。`}]},{id:`collection-hall`,emoji:`🏛️`,title:`典藏馆`,category:`记忆`,entry:`桌面 → 典藏馆。`,summary:`收藏和陈列重要素材、回忆、图片与作品，适合把关系里的高光内容集中保管。`,color:`bg-amber-50`,textColor:`text-amber-700`,keywords:[`典藏馆`,`收藏`,`作品`,`相册`,`回忆`],items:[{label:`主要功能`,detail:`• 建立收藏册或展示墙
• 收纳图片、文本、生成作品和重要片段
• 按角色或主题整理内容
• 回看关系中的高光记录`},{label:`基础操作`,detail:`1. 进入典藏馆。
2. 新建收藏册或选择已有收藏。
3. 添加图片、文本或来自其他 App 的素材。
4. 需要整理时调整分组、封面和顺序。`},{label:`适合场景`,detail:`适合保存角色照片、歌单封面、重要截图、纪念日记录、特别对话片段。`},{label:`注意事项`,detail:`典藏馆偏展示和收纳，不自动替代备份。换设备前仍要使用设置里的备份导出。`}]},{id:`cognitive-network`,emoji:`🧠`,title:`认知网络`,category:`记忆`,entry:`桌面 → 认知网络。`,summary:`高级记忆浏览器。查看回忆、关系关联、时间线、提取状态和云端漫游备份。`,color:`bg-violet-50`,textColor:`text-violet-700`,keywords:[`认知网络`,`记忆`,`回忆`,`图谱`,`蒸馏`,`漫游备份`],items:[{label:`主要功能`,detail:`• 认知全览：查看记忆数量、关联和系统状态
• 回忆唱片匣：翻阅具体回忆片段
• 时光编织：把回忆接回时间线
• 心意提取：提炼关系理解和情绪线索
• 回忆结晶：整理高价值记忆
• 漫游备份：把记忆同步到云端或从云端签收`},{label:`基础操作`,detail:`1. 进入认知网络，先在顶部选择全部角色或单个角色。
2. 在首页查看回忆片段、心意相通、时间丝线和系统状态。
3. 进入回忆唱片匣查看具体回忆。
4. 需要整理时使用时光编织、心意提取或回忆结晶。`},{label:`认知图谱`,detail:`认知图谱会把回忆、心意连接和凝结认知放在同一张关系视图里。

你可以从首页看整体状态，也可以点进具体回忆，查看它和哪些情绪、关系线索、时间节点有关。

如果图谱为空，通常说明还没有完成足够的向量记忆提取、心意提取或回忆结晶。`},{label:`回忆处理流程`,detail:`建议顺序：
1. 先在聊天或神经链接里积累/提取向量记忆
2. 进入认知网络查看未被发现的回声
3. 用时光编织把散落回忆接回时间线
4. 用心意提取整理关系里的暗线
5. 用回忆结晶把多段材料沉淀成更稳定的认知

处理后的内容会更适合后续聊天、轨迹、清醒梦和创作类 App 调用。`},{label:`漫游备份`,detail:`通行印记只在登录入口登记。认知网络 → 漫游备份可以查看当前登录绑定的印记码，但不能在这里重新生成或改绑。

• 签收回忆：从云端拉回记忆
• 盖章入云：把本地回忆推到云端

换设备时先在登录入口填旧通行印记，再来这里签收。`},{label:`状态怎么看`,detail:`首页的回忆片段、心意相通、时间丝线、系统状态是快速体检。

• 回忆片段多但心意少：说明有材料，还没提炼关系连接
• 未被发现的回声多：说明还有记忆没被串回时间线
• 系统状态异常：先检查后端连接、登录状态、Embedding 和网络
• 单个角色为空：切到“全部”确认是不是只缺这个角色的材料`},{label:`注意事项`,detail:`如果显示暂缺或连接失败，通常是后端、Embedding、登录印记或网络暂时不可用。先检查设置和登录状态。`}]},{id:`echo-record`,emoji:`💿`,title:`回声唱片`,category:`创作`,entry:`桌面 → 回声唱片，或从认知网络/聊天中的音乐相关入口进入。`,summary:`把关系片段写成歌词、打磨定稿、选择曲风并生成歌曲。`,color:`bg-amber-50`,textColor:`text-amber-700`,keywords:[`回声唱片`,`词曲`,`歌词`,`生歌`,`音乐`],items:[{label:`主要功能`,detail:`• 从记忆、聊天或手写灵感生成歌词草稿
• 查看可唱性评分并优化歌词
• 选择曲风、情绪、演唱气质
• 调用音乐服务生成歌曲
• 管理已生成唱片和封面`},{label:`基础操作`,detail:`1. 进入回声唱片，选择落针方式。
2. 生成歌词草稿后手动修改。
3. 点可唱性评分或优化歌词继续打磨。
4. 确认歌词定稿。
5. 选择曲风后开始生歌，等待结果返回。`},{label:`落针方式`,detail:`落针方式决定歌曲从哪里开始取材。

常见用法：
• 从角色和关系氛围出发：适合第一张印象曲
• 从聊天片段或记忆出发：适合纪念某段具体经历
• 从手写方向出发：适合你已经有明确主题、歌词口吻或曲风要求

开始前先选角色，否则唱片不知道属于谁。`},{label:`歌词打磨`,detail:`可唱性评分会从韵脚、断句、节奏和呼吸感评估。80 分以上通常结构较稳，60 分以下建议优化。

可以写修改意见，或指定想靠近的词作风格。`},{label:`曲风制作`,detail:`歌词定稿后才会进入曲风制作。这里要把“想要什么歌”翻译成音乐引擎能理解的方案。

可以写：
• 曲风类型：city pop、民谣、摇滚、电子、古风等
• 情绪：克制、暧昧、明亮、潮湿、宿命感
• 声线偏好：女声、低沉男声、少年感、气声
• 制作人笔记：不要什么、哪些乐器突出、节奏快慢

曲风越具体，生成结果越可控。`},{label:`唱片管理`,detail:`生成后的唱片可以播放、分享，也可以回到歌词或曲风重新修改再压制。

删除唱片会移除歌词、独白和音频等本机记录。想长期保存，建议同时保留在 Emo Cloud，并做完整备份。`},{label:`注意事项`,detail:`生歌依赖外部音乐服务。歌曲音频文件较大，换设备前用完整备份保存。`}]},{id:`music`,emoji:`🎵`,title:`Emo Cloud`,category:`创作`,entry:`桌面 → Emo Cloud。`,summary:`音乐播放器。播放歌曲、看歌词、管理歌单，并让聊天自然沾上正在听的氛围。`,color:`bg-red-50`,textColor:`text-red-700`,keywords:[`音乐`,`Emo Cloud`,`歌词`,`播放`,`歌单`],items:[{label:`主要功能`,detail:`• 播放本地或生成歌曲
• 查看歌词和播放进度
• 管理歌曲、封面、歌单
• 显示系统级迷你播放器和悬浮歌词
• 给聊天注入一起听歌的氛围`},{label:`基础操作`,detail:`1. 进入 Emo Cloud。
2. 选择歌曲播放。
3. 在播放页查看歌词、切歌或暂停。
4. 需要聊天联动时，在聊天设置里开启一起听歌氛围。`},{label:`和聊天联动`,detail:`一起听歌氛围只让角色自然感知旋律、歌词和情绪，不会强制自动分享歌曲。

想让角色主动发歌卡，单独开启歌曲分享。`},{label:`注意事项`,detail:`音乐文件可能较大。云端备份不一定保存完整音频，迁移前优先做本地完整备份。`}]},{id:`gallery`,emoji:`🖼️`,title:`相册`,category:`创作`,entry:`桌面 → 相册。`,summary:`统一查看和管理生成图、上传图和聊天图片素材。`,color:`bg-orange-50`,textColor:`text-orange-700`,keywords:[`相册`,`图片`,`照片`,`生成图`],items:[{label:`主要功能`,detail:`• 浏览图片资产
• 查看聊天、见面、生图相关照片
• 管理或复用图片素材
• 为其他 App 提供图片来源`},{label:`基础操作`,detail:`1. 进入相册。
2. 按时间或来源查看图片。
3. 点开图片查看大图。
4. 需要时保存、删除或回到对应来源继续使用。`},{label:`适合场景`,detail:`适合集中找角色图、聊天图片、约会照片、生图结果和封面素材。`},{label:`注意事项`,detail:`删除图片可能影响聊天卡片、唱片封面或收藏展示。删除前确认没有被其他内容引用。`}]},{id:`xhs-free-roam`,emoji:`🧭`,title:`自由活动`,category:`外部`,entry:`桌面 → 自由活动。`,summary:`小红书自由活动入口，让角色浏览、搜索、互动或发布内容。`,color:`bg-rose-50`,textColor:`text-rose-700`,keywords:[`小红书`,`XHS`,`自由活动`,`发帖`,`评论`],items:[{label:`主要功能`,detail:`• 搜索小红书笔记
• 浏览推荐流
• 点赞、收藏、评论
• 让角色按设定发帖或分享笔记
• 把外部内容带回聊天`},{label:`基础操作`,detail:`1. 先启动本地 XHS 服务并完成扫码登录。
2. 在设置 → 实时感知引擎 → 小红书里填写服务地址。
3. 进入自由活动选择角色和操作。
4. 需要聊天中使用时，还要在该角色聊天设置里打开小红书开关。`},{label:`接入模式`,detail:`Bridge 模式使用本地 Python 服务。MCP 模式使用本地 Go 服务，推荐优先用 MCP。

服务关闭或登录失效时，自由活动不可用。`},{label:`注意事项`,detail:`这是外部账号操作入口。发布、评论、点赞都可能真实发生，请确认内容后再执行。`}]},{id:`xhs-stock`,emoji:`📕`,title:`小红书图库`,category:`外部`,entry:`桌面 → 小红书图库。`,summary:`管理小红书发布用图片素材，给角色发帖、配图和分享提供资源。`,color:`bg-red-50`,textColor:`text-red-700`,keywords:[`小红书图库`,`配图`,`素材`,`XHS`],items:[{label:`主要功能`,detail:`• 上传或选择发帖图片
• 管理图片来源和标签
• 给小红书发帖流程提供配图
• 复用聊天、生图或相册素材`},{label:`基础操作`,detail:`1. 进入小红书图库。
2. 添加需要发布或备用的图片。
3. 整理图片说明和分类。
4. 在自由活动或聊天小红书能力里选择这些素材。`},{label:`适合场景`,detail:`适合提前准备生活照、探店图、封面图、角色视角图片和发帖素材。`},{label:`注意事项`,detail:`发到外部平台前检查图片版权、隐私和内容是否合适。`}]},{id:`hot-search`,emoji:`🔥`,title:`外部热点`,category:`外部`,entry:`桌面 → 外部热点。`,summary:`查看外部热点和热搜，让角色或用户了解正在发生的话题。`,color:`bg-orange-50`,textColor:`text-orange-700`,keywords:[`热点`,`热搜`,`新闻`,`微博`],items:[{label:`主要功能`,detail:`• 浏览实时热点列表
• 查看微博、新闻等外部话题
• 为聊天提供当下世界背景
• 配合实时感知引擎让角色自然提到热点`},{label:`基础操作`,detail:`1. 进入外部热点。
2. 查看当前榜单或分类。
3. 点开感兴趣的话题查看摘要。
4. 回到聊天后可以直接和角色聊这个话题。`},{label:`和实时感知的关系`,detail:`外部热点 App 是你主动浏览；实时感知引擎是把天气、新闻、热搜等内容注入角色上下文。`},{label:`注意事项`,detail:`热点内容来自外部数据源，可能受网络、接口和地区影响。`}]},{id:`social`,emoji:`⚡`,title:`Spark`,category:`外部`,entry:`桌面 → Spark。`,summary:`社交流式内容入口，适合浏览、生成或承接角色的社交动态。`,color:`bg-red-50`,textColor:`text-red-700`,keywords:[`Spark`,`社交`,`动态`,`内容流`],items:[{label:`主要功能`,detail:`• 浏览社交动态流
• 查看角色相关内容
• 承接聊天中的分享、外部内容或动态片段
• 作为社交模拟和内容发现入口`},{label:`基础操作`,detail:`1. 进入 Spark。
2. 浏览动态或选择角色相关内容。
3. 点开详情查看。
4. 需要互动时按页面按钮继续操作。`},{label:`适合场景`,detail:`适合角色社交生活、外部内容流、朋友圈式动态和关系侧写。`},{label:`注意事项`,detail:`若内容为空，先检查是否有角色、是否已配置相关外部能力，或是否已有足够生成材料。`}]},{id:`theme-maker`,emoji:`🎨`,title:`气泡工坊`,category:`创作`,entry:`桌面 → 气泡工坊，或聊天设置 → 主题相关入口。`,summary:`制作聊天气泡和主题样式，让 Message 拥有自定义视觉风格。`,color:`bg-purple-50`,textColor:`text-purple-700`,keywords:[`气泡`,`主题`,`聊天样式`,`工坊`],items:[{label:`主要功能`,detail:`• 创建自定义聊天气泡主题
• 调整字体、颜色、边框、背景和布局
• 导入社区主题
• 预览角色和用户消息效果
• 保存后在聊天中启用`},{label:`基础操作`,detail:`1. 进入气泡工坊，新建主题。
2. 调整用户气泡、角色气泡、背景和文字样式。
3. 在预览区确认效果。
4. 保存主题。
5. 回到 Message → 聊天设置 → 主题切换中启用。`},{label:`导入主题`,detail:`社区主题通常放在 community-bubble-themes。导入后先预览，再应用到聊天。`},{label:`注意事项`,detail:`深色背景要检查文字对比度。长消息、图片消息、语音消息都要预览，避免气泡挤压或文字不可读。`}]},{id:`appearance`,emoji:`🧩`,title:`外观`,category:`设置`,entry:`桌面 → 外观。`,summary:`系统桌面外观设置。壁纸、字体、图标、桌面装饰和输入特效都在这里。`,color:`bg-slate-100`,textColor:`text-slate-700`,keywords:[`外观`,`壁纸`,`字体`,`图标`,`桌面`],items:[{label:`主要功能`,detail:`• 更换系统壁纸和内容色
• 调整字体、字号和桌面视觉
• 管理自定义图标和图标框
• 添加桌面装饰
• 配置输入特效`},{label:`基础操作`,detail:`1. 进入外观。
2. 选择壁纸、颜色、字体或图标设置。
3. 上传素材或选择预设。
4. 保存后回到桌面查看效果。`},{label:`适合场景`,detail:`适合换主题、做整机风格、配合角色世界观定制桌面。`},{label:`注意事项`,detail:`过大的壁纸、动态图或复杂输入特效可能影响低性能设备流畅度。卡顿时先关闭重型视觉效果。`}]},{id:`status-workshop`,emoji:`🛠️`,title:`状态栏工坊`,category:`创作`,entry:`桌面 → 状态栏工坊，或聊天设置 → 心声模式 → 自定义模板 → 编辑工坊。`,summary:`制作自定义心声/状态卡。用字段、正则、HTML、CSS 和 JS 控制聊天里的状态卡片。`,color:`bg-slate-100`,textColor:`text-slate-700`,keywords:[`状态栏`,`心声`,`模板`,`HTML`,`CSS`,`正则`],items:[{label:`主要功能`,detail:`• 创建和管理状态卡模板
• 定义字段、System Prompt 和提取正则
• 编辑 HTML 骨架、CSS 美化和 JS 互动
• 实时预览最终卡片
• 保存后在聊天心声模式中启用`},{label:`五步生成`,detail:`1. 写状态栏想法。
2. 定义字段列表。
3. 生成 System Prompt。
4. 生成 HTML 骨架。
5. 优化 CSS 审美并预览保存。`},{label:`字段与正则`,detail:`字段列表决定 $1、$2、$3 等占位内容。提取正则的捕获组顺序必须和字段顺序一致。

角色回复末尾需要输出 <status>...</status> 结构，正则才能抓到。`},{label:`模板结构`,detail:`一个状态栏方案通常由四部分组成：
• 想法 / 字段：定义要表现什么状态，以及每个字段的含义
• System Prompt：要求角色在回复末尾输出结构化状态
• HTML 骨架：决定卡片内容层级和占位符位置
• CSS / JS：决定视觉和轻互动

模板保存后，需要回到 Message → 聊天设置 → 心声模式，选择自定义模板并启用。`},{label:`生成模式`,detail:`工坊支持不同骨架方向，例如单卡、分区、仪表、分页等。字段多时优先用分页或分区，字段少时用单卡更清晰。

AI 生成不满意时，不必从头重做：可以只重新优化 CSS、只改 HTML，或手动改字段和正则。`},{label:`导入导出与旧模板`,detail:`方案可以导出为 JSON，方便备份或分享；导入时会识别状态栏方案。

如果检测到旧版完整 HTML，工坊会提示一键拆成 HTML / CSS / JS。旧内容会继续保留为兼容备份，但后续维护建议使用拆分后的结构。`},{label:`预览与排错`,detail:`预览区只证明模板能渲染，不代表聊天里一定能提取到字段。

聊天里不显示时按顺序检查：
1. 当前角色聊天设置是否选中了这个模板
2. 心声模式是否为自定义模板
3. 角色回复里有没有 <status>...</status>
4. 正则捕获组数量是否和字段数量一致
5. CSS 是否把文字隐藏或盖住了`},{label:`注意事项`,detail:`建议从 3 个简单字段开始。卡片不出现时，先检查聊天是否选择了该模板、角色是否输出 status 块、正则是否匹配。`}]},{id:`voice-call`,emoji:`📞`,title:`语音通话`,category:`核心`,entry:`桌面 Dock → 语音通话，或 Message 顶部电话图标。`,summary:`和角色实时语音对话。麦克风输入经 STT 转文字，角色回复经 TTS 播放。`,color:`bg-slate-100`,textColor:`text-slate-700`,keywords:[`语音`,`通话`,`TTS`,`STT`,`麦克风`],items:[{label:`主要功能`,detail:`• 发起或接听角色语音通话
• 麦克风自动识别你的语音
• 角色用配置声线朗读回复
• 支持手动发送、VAD 自动判断、通话记忆沉淀
• 可与聊天主动来电联动`},{label:`基础操作`,detail:`1. 先在设置里配置主 API、TTS 和 STT。
2. 在神经链接里给角色填写声线 ID。
3. 打开语音通话或从聊天顶部拨号。
4. 授权浏览器麦克风。
5. 按页面模式说话并等待角色回应。`},{label:`配置位置`,detail:`TTS/STT 全局配置在设置里。角色声线在神经链接 → 角色详情。

主动来电在聊天设置或自律代理相关开关里控制。`},{label:`注意事项`,detail:`语音没反应时，按顺序检查浏览器麦克风权限、STT 配置、TTS 配置、角色声线 ID 和网络。`}]},{id:`room`,emoji:`🏠`,title:`小小窝`,category:`关系`,entry:`桌面 → 小小窝。`,summary:`角色的房间和生活空间。摆放家具、换立绘、布置小屋并观察角色生活感。`,color:`bg-rose-50`,textColor:`text-rose-700`,keywords:[`小屋`,`房间`,`立绘`,`装修`],items:[{label:`主要功能`,detail:`• 查看角色小屋
• 装修房间和摆放元素
• 更换小屋专属 Q 版/Chibi 立绘
• 营造角色生活空间`},{label:`基础操作`,detail:`1. 进入小小窝。
2. 点顶部装修进入编辑模式。
3. 点击房间中的元素调整。
4. 想换角色小人，直接点击画面中央角色立绘并上传透明背景图片。`},{label:`和头像的区别`,detail:`小屋里更换的是房间专属立绘，不是聊天头像。

聊天头像仍在神经链接 → 角色详情里修改。`},{label:`注意事项`,detail:`透明 PNG 效果最好。图片太大可能影响加载和拖拽流畅度。`}]},{id:`schedule`,emoji:`✅`,title:`时光契约`,category:`工具`,entry:`桌面 → 时光契约。`,summary:`日程、约定和提醒类工具，用来记录你和角色之间的重要时间安排。`,color:`bg-cyan-50`,textColor:`text-cyan-700`,keywords:[`日程`,`契约`,`提醒`,`约定`],items:[{label:`主要功能`,detail:`• 创建约定、计划或待办
• 查看未来安排
• 记录角色相关事件
• 在聊天中承接手动写入的今日行程`},{label:`基础操作`,detail:`1. 进入时光契约。
2. 新增一条约定，填写时间、标题和说明。
3. 保存后在列表或详情中查看。
4. 需要让角色知道时，在聊天中结合日程上下文使用。`},{label:`适合场景`,detail:`生日、纪念日、见面计划、每天固定陪伴、角色承诺、重要剧情节点。`},{label:`注意事项`,detail:`这是前端日程记录，不等同于系统级闹钟。真正需要系统提醒时，还要确认浏览器/设备通知能力。`}]},{id:`game`,emoji:`🎲`,title:`TRPG`,category:`创作`,entry:`桌面 → TRPG。`,summary:`桌面角色扮演入口。适合跑团、投骰、冒险和规则化叙事。`,color:`bg-orange-50`,textColor:`text-orange-700`,keywords:[`TRPG`,`跑团`,`骰子`,`冒险`,`规则`],items:[{label:`主要功能`,detail:`• 创建或进入 TRPG 剧情
• 让角色参与冒险叙事
• 按规则进行判定或推进
• 保存团内记录和剧情状态`},{label:`基础操作`,detail:`1. 进入 TRPG。
2. 选择或创建一局游戏。
3. 设定参与角色、世界和目标。
4. 按页面提示推进剧情、判定和行动。`},{label:`适合场景`,detail:`适合奇幻、悬疑、末日、校园、修仙等需要规则和任务目标的长线剧情。`},{label:`注意事项`,detail:`规则越复杂，越需要在开局设定里写清楚。模型不一定严格执行所有细则，关键数值建议手动确认。`}]},{id:`study`,emoji:`🎓`,title:`自习室`,category:`工具`,entry:`桌面 → 自习室。`,summary:`学习陪伴和专注空间，让角色陪你学习、计时或做轻量监督。`,color:`bg-emerald-50`,textColor:`text-emerald-700`,keywords:[`自习`,`学习`,`专注`,`陪伴`],items:[{label:`主要功能`,detail:`• 创建学习/专注任务
• 让角色陪伴或监督
• 记录学习时长和状态
• 适合番茄钟式陪伴`},{label:`基础操作`,detail:`1. 进入自习室。
2. 选择角色和本次学习目标。
3. 开始专注。
4. 中途需要鼓励或复盘时按页面入口互动。
5. 结束后记录结果。`},{label:`适合场景`,detail:`背书、写作业、阅读、工作冲刺、健身记录、轻量习惯养成。`},{label:`注意事项`,detail:`自习室适合陪伴，不适合作为严肃任务管理系统。重要任务仍建议同步到你常用的待办工具。`}]},{id:`novel`,emoji:`✒️`,title:`笔友会`,category:`创作`,entry:`桌面 → 笔友会。`,summary:`写作和书信类创作空间，适合长文、互通信件、小说片段和角色文风实验。`,color:`bg-amber-50`,textColor:`text-amber-700`,keywords:[`笔友会`,`写作`,`书信`,`小说`],items:[{label:`主要功能`,detail:`• 写信或长文
• 让角色以笔友方式回应
• 生成小说片段或文风内容
• 保存和回看文本作品`},{label:`基础操作`,detail:`1. 进入笔友会。
2. 选择写作对象或主题。
3. 输入内容要求。
4. 生成后继续修改、保存或复制。`},{label:`适合场景`,detail:`适合慢节奏书信、角色独白、世界观片段、番外、诗性文本。`},{label:`注意事项`,detail:`长文会消耗较多 Token。想要稳定风格时，把要求写具体，并使用副 API 或合适模型。`}]},{id:`bank`,emoji:`🐷`,title:`存钱罐`,category:`工具`,entry:`桌面 → 存钱罐。`,summary:`轻量财务/目标记录工具，用来记录存钱目标、积累和阶段进度。`,color:`bg-lime-50`,textColor:`text-lime-700`,keywords:[`存钱罐`,`存钱`,`目标`,`记录`],items:[{label:`主要功能`,detail:`• 创建存钱目标
• 记录收入、投入或阶段进度
• 查看完成度
• 让角色参与鼓励或纪念`},{label:`基础操作`,detail:`1. 进入存钱罐。
2. 创建目标并填写金额。
3. 每次存入后记录一次。
4. 达成目标后可以保留纪念记录。`},{label:`适合场景`,detail:`买礼物、旅行基金、纪念日准备、攒钱计划、角色相关目标。`},{label:`注意事项`,detail:`存钱罐只做本地记录，不连接真实银行账户，也不提供财务建议。`}]},{id:`nian-nian`,emoji:`📜`,title:`水月观`,category:`关系`,entry:`桌面 → 水月观。`,summary:`偏命运感、观照和关系文本的特殊空间，用来生成更仪式化的关系内容。`,color:`bg-amber-50`,textColor:`text-amber-700`,keywords:[`水月观`,`命运`,`关系`,`观照`],items:[{label:`主要功能`,detail:`• 生成带仪式感的关系文本
• 回看角色和你的关系状态
• 承接特殊主题、命题或心境
• 作为慢节奏关系整理入口`},{label:`基础操作`,detail:`1. 进入水月观。
2. 选择角色或主题。
3. 根据页面提示生成内容。
4. 需要保留时保存或复制。`},{label:`适合场景`,detail:`适合纪念日、关系复盘、命运感文本、特殊氛围内容。`},{label:`注意事项`,detail:`效果依赖角色设定和你们已有材料。材料不足时，先聊天或补记忆。`}]},{id:`zhaixinglou`,emoji:`⭐`,title:`摘星楼`,category:`创作`,entry:`桌面 → 摘星楼。`,summary:`占星与命运感内容空间，包含星镜、星轨、星历、阿卡西之影等模块。`,color:`bg-red-50`,textColor:`text-red-700`,keywords:[`摘星楼`,`占星`,`星镜`,`星轨`,`星历`],items:[{label:`主要功能`,detail:`• 星镜：生成角色相关映照
• 星轨：查看轨迹或命运图式
• 星历：生成日期相关解读
• 阿卡西之影：生成更神秘的关系/命题内容`},{label:`基础操作`,detail:`1. 进入摘星楼。
2. 首次使用先点右上角设置配置专属 AI。
3. 选择星镜、星轨、星历或阿卡西之影。
4. 按页面提示选择角色和主题后生成。`},{label:`适合场景`,detail:`适合想要神秘学、命运感、关系隐喻和仪式感文本的时候。`},{label:`注意事项`,detail:`摘星楼需要独立配置可用模型。生成失败时先检查右上角配置、模型可用性和服务状态。`}]},{id:`special-moments`,emoji:`💫`,title:`特别时光`,category:`关系`,entry:`桌面 → 特别时光。部分节日也可能由系统弹窗进入。`,summary:`季节、节日和限定事件入口，用来体验特殊日期相关内容。`,color:`bg-pink-50`,textColor:`text-pink-700`,keywords:[`特别时光`,`节日`,`限定`,`活动`],items:[{label:`主要功能`,detail:`• 查看当前可用的特殊事件
• 进入节日限定互动
• 保存纪念性内容
• 承接系统弹出的活动提醒`},{label:`基础操作`,detail:`1. 进入特别时光。
2. 选择当前开放的活动。
3. 按活动页面提示完成互动。
4. 需要留念时保存结果。`},{label:`适合场景`,detail:`情人节、生日、纪念日、节日限定内容。`},{label:`注意事项`,detail:`部分活动有时间条件。看不到活动时，可能是当前日期不在开放范围内。`}]},{id:`half-sugar`,emoji:`💓`,title:`半糖主义`,category:`工具`,entry:`桌面 → 半糖主义。`,summary:`健康和生活记录 App。记录身体数据、周期、饮食、趋势和日常状态。`,color:`bg-teal-50`,textColor:`text-teal-700`,keywords:[`半糖主义`,`健康`,`饮食`,`周期`,`趋势`],items:[{label:`主要功能`,detail:`• 记录身高、体重、活动水平等基础信息
• 管理饮食、健康和周期记录
• 查看趋势页面
• 让角色在你允许时参考生活状态`},{label:`基础操作`,detail:`1. 进入半糖主义。
2. 首次使用完成基础资料设置。
3. 按页面记录饮食、身体或周期状态。
4. 定期查看趋势变化。`},{label:`隐私与共享`,detail:`半糖主义记录偏私人。是否让角色参考身体信息，由页面内相关共享开关控制。`},{label:`注意事项`,detail:`这里只做生活记录和陪伴，不提供医疗诊断。身体不适请以专业医生意见为准。`}]},{id:`lucid-dream`,emoji:`🌙`,title:`清醒梦`,category:`记忆`,entry:`桌面 → 清醒梦。`,summary:`生成角色睡梦残影。梦不是总结，而是角色潜意识对经历的变形回声。`,color:`bg-cyan-50`,textColor:`text-cyan-700`,keywords:[`清醒梦`,`梦`,`梦境`,`轨迹梦核`],items:[{label:`主要功能`,detail:`• 选择角色生成梦境
• 基于聊天、记忆或轨迹节点生成潜意识残影
• 使用不同梦境壁纸和氛围
• 将梦境作为关系侧写或创作材料`},{label:`基础操作`,detail:`1. 进入清醒梦。
2. 选择角色。
3. 选择普通梦核或轨迹节点相关梦核。
4. 点击生成，等待梦境文本和视觉氛围完成。`},{label:`适合场景`,detail:`适合想看角色独自睡着后，某段经历在潜意识里如何变形。`},{label:`注意事项`,detail:`梦境依赖角色真实材料。没有聊天、记忆或轨迹时，梦会更空泛。`}]},{id:`hidden-entry-map`,emoji:`🧭`,title:`不在桌面的入口`,category:`工具`,entry:`桌面上找不到时，先来这里查入口路径。`,summary:`有些功能不是独立桌面图标，而是藏在聊天、轨迹、认知网络或特殊活动里。`,color:`bg-slate-100`,textColor:`text-slate-700`,keywords:[`入口`,`对影`,`个人主页`,`查手机`,`心动放送`,`Sully Browser`,`记忆浏览器`],items:[{label:`对影`,detail:`入口：桌面 → 轨迹 → 对影。

对影不是桌面图标。它会让同一个角色的“现在”、相遇前节点、相遇后世界线节点在同一个空间里说话。

找不到时先去轨迹，先为角色生成时间线节点，再进入对影。`},{label:`个人主页`,detail:`入口：Message 里点角色/用户相关头像或动态入口。

个人主页里有这些标签：动态、朋友圈、资料、相册、关系。

角色主页可以刷新主页关系网；你的主页可以写第一条动态、发动态。这里的关系网会影响后续朋友圈动态、评论和点赞。`},{label:`查手机`,detail:`桌面上的查手机是独立入口。聊天里的查手机通常来自 Message → 聊天设置 → 心声模式 → 查手机。

开启后，角色头像旁会出现手机入口。点进去会看到角色手机里随机亮起的一页内容，看完后可以回到聊天继续接这个现场。`},{label:`记忆浏览器`,detail:`入口：桌面 → 认知网络 → 菜单 → 记忆浏览器。

它不是桌面图标。适合按传统记忆、核心记忆、向量记忆筛选和排序，也能查看某条记忆关联了多少回声唱片。`},{label:`Sully Browser`,detail:`Sully Browser 不是当前桌面上的普通浏览器图标。它通常由搜索、外部网页、小红书/B站等能力间接打开。

它会用 AI 把搜索结果重新排版成仿真页面，不等同于真实浏览器完整打开原网页。`},{label:`心动放送`,detail:`心动放送目前不作为普通桌面入口展示。看到相关入口时，界面上会写“心动放送中”“节目组后台”“开播前选角”“心动广场”等。

它是恋综式特殊玩法：先确认嘉宾，再进入节目现场、镜头之外、小手机和心动广场。`}]},{id:`chat-entry-map`,emoji:`🔎`,title:`聊天里的入口速查`,category:`核心`,entry:`桌面 → Message。重点看顶部、输入框左侧 +、右上角菜单、长按消息。`,summary:`很多高频功能都在聊天页里，不是桌面图标。`,color:`bg-indigo-50`,textColor:`text-indigo-700`,keywords:[`聊天入口`,`回神`,`手动生图`,`手动日程`,`记忆归档`,`长按消息`,`朋友圈`],items:[{label:`回神`,detail:`入口：Message 输入区旁边的“回神”按钮，或相关回神卡片里的“重新回神”。

回神用于让角色在偏离人设、回复断裂、状态不对时做一次自我修正。它不是普通重发消息，适合明显 OOC 或需要修复语气的时候。`},{label:`+ 面板`,detail:`入口：Message 输入框左侧 +。

这里会集中放图片、转账、戳一戳、多选、记忆归档、手动生图、手动日程等功能。不同主题和角色配置下，能看到的按钮会不完全一样。`},{label:`长按消息`,detail:`入口：在 Message 里长按一条消息。

常见操作包括回复、复制、编辑、删除、回到这里、朗读消息、下载语音。想让角色从某一条重新接话，用“回到这里”。`},{label:`聊天设置`,detail:`入口：Message 右上角菜单 → 聊天设置。

这里能调背景、上下文条数、隐藏系统日志、消息时间戳、消息翻译、语音回复、主动来电、歌曲分享、一起听歌氛围、小红书、心声模式。`},{label:`记忆归档`,detail:`入口：Message 右上角菜单 → 记忆归档设置，或 + 面板里的相关入口。

它会把近期聊天整理成记忆，保存到神经链接里的角色记忆。聊完重要剧情、见面前后、关系节点变化后都建议归档一次。`},{label:`朋友圈卡片`,detail:`入口：Message 里的朋友圈动态卡片，或个人主页里的动态/朋友圈。

朋友圈卡片可以展示角色动态、配图、点赞和评论。想管理主页资料、关系网或发动态，进入个人主页更完整。`}]},{id:`external-risk-map`,emoji:`⚠️`,title:`外部服务与风险操作`,category:`设置`,entry:`主要在设置、神经链接、认知网络和导入恢复弹窗里。`,summary:`这些入口会影响外部账号、备份恢复或真实通知，使用前最好知道它们会做什么。`,color:`bg-amber-50`,textColor:`text-amber-700`,keywords:[`微信绑定`,`小红书 Bridge`,`语音通话手动发送`,`回声`,`备份`,`重新导入`,`格式化系统`],items:[{label:`微信绑定`,detail:`入口：神经链接 → 角色详情 → 设定 Tab → 微信绑定。

这里会显示未绑定、已连接、已断开、待重登、已停用等状态。扫码成功后，微信消息会同步到这台小手机。

如果看到“这条微信绑定已属于另一台设备，重新扫码可切换到当前设备”，说明需要重新扫码确认当前设备。`},{label:`小红书 Bridge`,detail:`入口：设置 → 实时感知 → 小红书 Bridge。

这里需要填写小红书服务地址，并用小红书 App 扫码登录。连接成功后，自由活动和聊天里的小红书能力才有可用账号。

发布、评论、点赞、收藏都可能是真实外部操作，确认内容后再执行。`},{label:`语音通话手动发送`,detail:`入口：设置 → 语音识别 → 语音通话手动发送。

开启后，STT 识别会先显示草稿，点发送才调用模型。适合长语音、停顿多、环境噪音大，或者你想先检查识别结果的通话。`},{label:`回声`,detail:`入口：设置 → TTS → 回声。

这里可以生成 3 个回声预览，试听后点“保存选中回声为 Voice ID”。生成预览会消耗 ElevenLabs credits，保存音色会占用 voice slot。`},{label:`上次导入失败了 / 上次导入被中断了`,detail:`入口：导入备份异常后，系统会自动弹出提示。

看到“上次导入失败了”或“上次导入被中断了”时，优先点“去重新导入”，并选择同一个备份文件。这样能避免数据只恢复了一部分。`},{label:`格式化系统`,detail:`入口：设置 → 备份与恢复 → 格式化系统。

这是清空本地数据的高风险操作，不可撤销。执行前先做整合导出，确认备份文件能保存到设备上。`}]},{id:`first-use-flow`,emoji:`🪜`,title:`第一次使用怎么配`,category:`入门`,entry:`第一次打开系统时，从设置、神经链接、Message 三个入口开始。`,summary:`新用户不要一上来把所有功能都配满。先让角色能正常聊天，再逐步打开语音、记忆和外部能力。`,color:`bg-emerald-50`,textColor:`text-emerald-700`,keywords:[`第一次使用`,`新手`,`主 API`,`副 API`,`建角色`,`第一条消息`],items:[{label:`最小可用路线`,detail:`1. 进入设置 → API 设置，先填主 API。
2. 进入神经链接，新建或导入一个角色。
3. 在角色详情里确认名称、头像、System Prompt。
4. 点发消息进入 Message。
5. 发第一条消息后，点顶部右侧的闪电按钮让角色回复。

这条路线只要求主 API 可用，适合先确认系统能跑起来。`},{label:`推荐补齐路线`,detail:`基础聊天可用后，再按需求补：
• 副 API：心声、总结、记忆提取、状态栏、歌词等更稳
• Embedding：向量记忆、认知网络检索需要
• TTS：角色朗读、语音回复、语音通话需要
• STT：语音输入、语音通话识别需要
• 生图：手动生图、朋友圈配图、约会照片等需要`},{label:`第一天建议先做什么`,detail:`先完成这几件事就够：
• 建一个角色
• 正常聊几轮
• 调整上下文条数到自己能接受的范围
• 试一次记忆归档
• 做一次整合导出或纯文字备份

等你确定角色和 API 都稳定，再开语音、认知网络、小红书、回声唱片这些增强功能。`},{label:`常见卡点`,detail:`模型列表拉不到：检查 Base URL 是否带 /v1、Key 有没有空格、模型名是否可用。

角色不回复：先点 Message 顶部右侧闪电按钮，再检查主 API。

心声/记忆不动：检查副 API 和 Embedding，不是只填主 API 就能全部生效。`}]},{id:`config-prerequisites`,emoji:`🧩`,title:`哪些功能需要先配置`,category:`入门`,entry:`设置里先配好对应能力，再回到各 App 使用。`,summary:`很多功能入口能看到，但没配置前不会正常工作。这里按功能告诉你要先准备什么。`,color:`bg-sky-50`,textColor:`text-sky-700`,keywords:[`配置`,`需要先配置`,`副 API`,`Embedding`,`TTS`,`STT`,`小红书 Bridge`],items:[{label:`只需要主 API`,detail:`这些功能优先依赖主 API：
• Message 基础聊天
• 群聊基础回复
• 见面 / 约会里的主要对话
• TRPG 基础推进
• 笔友会长文生成

如果主 API 不通，这些功能会最先受影响。`},{label:`需要副 API`,detail:`这些功能建议先配副 API 或副 API 池：
• 心声模式
• 记忆归档和总结
• 向量记忆提取
• 状态栏工坊生成
• 回声唱片歌词辅助
• 摘星楼部分生成
• 朋友圈资料/关系网补全

副 API 不配时，有些入口会提示不可用，有些会退回主 API。`},{label:`需要 Embedding`,detail:`这些功能需要 Embedding：
• 向量记忆
• 认知网络检索和图谱材料
• 更稳定的长期记忆召回

只想普通聊天可以先不配；想让角色长期记得细节，建议补上。`},{label:`需要 TTS / STT`,detail:`TTS 用来让角色说话，STT 用来听懂你的语音。

需要 TTS 的功能：语音回复、朗读消息、语音通话里的角色声音。

需要 STT 的功能：按住说话转文字、语音通话识别你的话。

完整语音通话通常需要主 API + TTS + STT。`},{label:`需要外部服务`,detail:`这些功能还要额外服务：
• 小红书：设置 → 实时感知 → 小红书 Bridge，并扫码登录
• Web Push：设置 → 自律代理 → 系统通知，并允许浏览器通知
• 云端备份/认知漫游：需要登录通行印记和后端连接正常
• 生图：需要在设置里配置可用的图片生成供应商`}]},{id:`where-data-lives`,emoji:`🗂️`,title:`内容会保存到哪里`,category:`入门`,entry:`不知道内容去哪了时，按类型找对应 App。`,summary:`聊天、记忆、图片、歌曲、动态和备份分别放在不同位置。找不到时先按内容类型排查。`,color:`bg-amber-50`,textColor:`text-amber-700`,keywords:[`保存在哪里`,`聊天记录`,`记忆`,`相册`,`Emo Cloud`,`回声唱片`,`个人主页`,`备份`],items:[{label:`聊天和角色`,detail:`聊天记录在 Message 里查看。角色设定、头像、声线、世界书挂载在神经链接里。

角色资料改了但聊天没体现时，回到神经链接确认是否保存，再重新进入 Message。`},{label:`记忆和认知`,detail:`传统记忆在神经链接 → 角色详情 → 记忆 Tab。

向量记忆和认知图谱在认知网络里查看。更细的条目可以进认知网络 → 记忆浏览器。

轨迹和清醒梦会读取这些材料，但不是记忆的唯一保存位置。`},{label:`图片和照片`,detail:`聊天图片、手动生图、约会照片、朋友圈配图等，通常可以从相册或对应来源入口找到。

小红书发帖素材在小红书图库里整理。典藏馆更像展示和收藏，不等于完整备份。`},{label:`歌曲和唱片`,detail:`聊天回声生成的歌曲会出现在 Emo Cloud，也会留在回声唱片里。

Emo Cloud 负责播放和听歌体验；回声唱片负责歌词、曲风、制作流程和唱片记录。`},{label:`朋友圈和主页`,detail:`朋友圈动态、评论、点赞、关系网在个人主页里。个人主页有动态、朋友圈、资料、相册、关系几个标签。

朋友圈卡片出现在 Message 里时，只是其中一种展示方式；要管理资料和关系网，进个人主页。`},{label:`备份文件`,detail:`备份文件由设置 → 备份与恢复导出到你的设备。

整合导出最完整；纯文字备份体积小；媒体备份适合单独保存图片和音频。换设备前不要只依赖某一个 App 里的展示内容。`}]},{id:`migration-flow`,emoji:`📦`,title:`换设备怎么搬家`,category:`入门`,entry:`旧设备先导出，新设备再导入；认知网络漫游要确认通行印记。`,summary:`搬家时最怕只搬了文字、漏了媒体或认知记忆。按这条流程走更稳。`,color:`bg-cyan-50`,textColor:`text-cyan-700`,keywords:[`换设备`,`搬家`,`备份`,`导入`,`通行印记`,`认知网络`],items:[{label:`旧设备怎么做`,detail:`1. 进入设置 → 备份与恢复。
2. 优先做一次整合导出。
3. 如果设备性能一般，再额外做纯文字备份和媒体备份。
4. 进入认知网络 → 漫游备份，复制当前通行印记留存。
5. 确认备份文件已经保存到设备或云盘。`},{label:`新设备怎么做`,detail:`1. 打开新设备上的系统。
2. 如果使用通行印记登录，先填旧设备留存的通行印记。
3. 进入设置 → 备份与恢复，导入旧设备导出的 ZIP。
4. 导入完成后，检查神经链接、Message、相册、Emo Cloud 是否都有内容。
5. 再进认知网络 → 漫游备份，按需要签收回忆。`},{label:`导入中断怎么办`,detail:`如果看到“上次导入失败了”或“上次导入被中断了”，点“去重新导入”，选择同一个备份文件。

不要马上格式化，也不要换另一个备份乱试。先让同一个备份把流程走完，避免数据处在半恢复状态。`},{label:`搬家后要检查`,detail:`检查顺序：
• 神经链接：角色和设定还在不在
• Message：聊天记录是否完整
• 相册：图片是否能打开
• Emo Cloud：歌曲是否能播放
• 认知网络：记忆和图谱是否能读取
• 设置：API、TTS、STT、小红书 Bridge 是否需要重新填`}]},{id:`repair-character-flow`,emoji:`🩹`,title:`角色不对劲怎么修`,category:`排查`,entry:`先在 Message 里修现场，再去神经链接修设定和记忆。`,summary:`角色跑偏、忘事、语气不对、剧情接错时，不同工具适合修不同问题。`,color:`bg-rose-50`,textColor:`text-rose-700`,keywords:[`角色不对劲`,`回神`,`回到这里`,`编辑消息`,`隐藏历史`,`记忆归档`,`世界书`],items:[{label:`轻微跑偏：用回神`,detail:`入口：Message → 回神。

适合角色语气突然不对、轻微 OOC、状态接歪，但你还想保留当前剧情的时候。

回神会让角色做一次自我修正，不等于删除聊天记录。`},{label:`某条回复错了：用回到这里`,detail:`入口：长按角色消息 → 回到这里。

适合从某一条开始重来。它会撤回这条之后的记录，让角色从该位置重新接话。

如果只是错一个词，可以优先编辑消息，不一定要整段回溯。`},{label:`旧上下文拖累：隐藏历史`,detail:`入口：Message → 聊天设置 → 管理上下文 / 隐藏历史。

适合聊太久以后，角色总被旧剧情牵着走。隐藏后，旧记录不再显示，也不再参与后续上下文计算。`},{label:`设定本身不稳：改神经链接`,detail:`入口：神经链接 → 角色详情 → 设定 Tab。

如果角色长期不像自己，优先检查 System Prompt、世界观、世界书挂载和地理设定。

世界书不生效时，重点看有没有挂载到当前角色。`},{label:`记忆错了：修记忆`,detail:`入口：神经链接 → 角色详情 → 记忆 Tab，或认知网络。

如果角色记错长期事实，检查传统记忆、向量记忆和认知网络。过时或错误记忆要删除、停用或重新整理。`}]},{id:`relationship-route`,emoji:`💞`,title:`关系推进路线`,category:`关系`,entry:`不知道下一步玩什么时，按关系阶段选入口。`,summary:`不同 App 适合不同关系阶段。聊天负责日常，见面/约会负责现场，记忆和梦负责沉淀。`,color:`bg-pink-50`,textColor:`text-pink-700`,keywords:[`关系推进`,`聊天`,`见面`,`约会`,`轨迹`,`对影`,`清醒梦`,`认知网络`],items:[{label:`刚开始：Message + 神经链接`,detail:`先用 Message 聊几轮，确认角色声音对不对。

不对就回神经链接补人设、世界观、世界书和声线。刚开始不要急着开所有复杂玩法。`},{label:`有日常了：见面 / 约会`,detail:`想写具体现场，用见面或约会。

见面适合一段线下相处、谈话、陪伴。约会适合更完整的地点、票根、立绘和收尾仪式。`},{label:`有共同经历了：记忆归档 / 认知网络`,detail:`重要剧情结束后，先做记忆归档。

想让关系更长期稳定，再进认知网络看回忆、心意连接、时光编织和回忆结晶。`},{label:`想理解过去：轨迹 / 对影`,detail:`轨迹适合看角色相遇前和相遇后的重要人生节点。

对影适合让“现在的他”和“过去某个阶段的他”坐在一起说话。`},{label:`想看潜意识：清醒梦`,detail:`清醒梦适合在关系已有材料后使用。它不是剧情总结，而是角色睡着后，经历在潜意识里的变形回声。`},{label:`想留下纪念：回声唱片 / 典藏馆`,detail:`想把关系写成歌，用回声唱片。

想把照片、文本、作品、重要片段收起来，用典藏馆。换设备前仍然要做备份。`}]},{id:`external-account-safety`,emoji:`🔐`,title:`外部账号安全`,category:`设置`,entry:`涉及微信、小红书、系统通知、云端备份时先看这一章。`,summary:`有些能力会连接真实外部服务或浏览器权限，使用前要知道哪些是真操作。`,color:`bg-slate-100`,textColor:`text-slate-700`,keywords:[`外部账号`,`微信绑定`,`小红书 Bridge`,`系统通知`,`云端备份`,`通行印记`],items:[{label:`微信绑定`,detail:`微信绑定是真实账号接入。扫码、断线、重登、停用都要看神经链接里的微信绑定状态。

如果只是想模拟聊天，不需要绑定真实微信。`},{label:`小红书 Bridge`,detail:`小红书 Bridge 会连接本地小红书服务，并通过扫码登录真实账号。

自由活动和聊天里的小红书能力可能执行真实搜索、发帖、评论、点赞、收藏。发布前检查内容和配图。`},{label:`系统通知`,detail:`系统通知用于自律代理消息推送。浏览器会请求通知权限。

iOS 通常需要把应用添加到主屏幕，才能更稳定地收通知。`},{label:`云端备份与通行印记`,detail:`通行印记相当于这台小手机的云端身份线索。认知网络漫游备份会按这个印记签收或上传回忆。

换设备时先保存旧通行印记。不要随手把通行印记发到公开地方。`},{label:`格式化系统前`,detail:`格式化系统会清空本地数据。先做整合导出，并确认备份文件真的保存好了。

如果正在导入后出现“上次导入失败了 / 上次导入被中断了”，先重新导入同一个备份，不要直接格式化。`}]},{id:`csy-manual`,emoji:`📓`,title:`csy手册`,category:`工具`,entry:`桌面 → csy手册。`,summary:`当前这本手册。合并了旧使用帮助和二改手册，按 App 入口、功能、操作和注意事项整理。`,color:`bg-rose-50`,textColor:`text-rose-700`,keywords:[`手册`,`帮助`,`FAQ`,`二改手册`,`使用帮助`],items:[{label:`主要功能`,detail:`• 按 App 查使用方法
• 搜索入口、功能名或问题关键词
• 查看常见问题和配置排查
• 帮新用户快速找到从哪里开始`},{label:`基础操作`,detail:`1. 顶部搜索关键词，例如 API、语音、世界书、白屏。
2. 用分类筛选核心、关系、记忆、创作等内容。
3. 点开 App 章节，再展开具体卡片。
4. 返回键会先收起当前章节，再退出手册。`},{label:`旧入口兼容`,detail:`旧的使用帮助入口不再出现在桌面，但如果系统旧状态打开 FAQ，会显示同一套 csy手册内容。`},{label:`注意事项`,detail:`手册是操作说明，不会自动检查你的实际配置。遇到配置问题时，对照设置页和排查章节逐项确认。`}]},{id:`faq`,emoji:`🧯`,title:`常见问题`,category:`排查`,entry:`在 csy手册顶部搜索问题关键词，或展开本章节。`,summary:`合并旧使用帮助内容，集中处理白屏、API 报错、角色不回复、导入失败等高频问题。`,color:`bg-amber-50`,textColor:`text-amber-700`,keywords:[`常见问题`,`白屏`,`报错`,`API`,`模型列表`,`表情包`,`bug`],items:[{label:`网页白屏或点了没反应`,detail:`先判断是网络、缓存还是资源加载问题。

• 刷新页面一次
• 检查是否能正常访问需要的外部服务
• 如果是新版本刚更新后出现，尝试强制刷新
• 仍然不行时，截图并复制错误信息反馈`},{label:`角色不回复`,detail:`部分模式不会自动秒回。发完消息后看聊天顶部右侧是否有闪电按钮，点一下触发角色思考。

如果点了仍不回复，检查主 API 是否配置、模型是否可用、上下文是否过长。`},{label:`API 报错或模型列表拉不到`,detail:`优先检查：

• Base URL 是否漏了 /v1
• API Key 是否多了空格
• 模型名是否属于当前服务商
• 是否欠费、限流或服务波动
• 中转站 400 可尝试关闭助手预填充`},{label:`聊天记录与记忆`,detail:`想总结近期聊天：Message → 右上角菜单 → 记忆归档。

想批量整理历史：神经链接 → 角色 → 记忆 Tab → 批量总结或向量批量提取。

不想删除旧记录但想减少旧内容干扰，可以在聊天设置里隐藏历史或降低上下文条数。`},{label:`表情包导入不显示`,detail:`格式必须是一行一个：名字--URL，中间是两个减号。

图片链接尽量使用直接图片地址，并确认能在浏览器里打开。`},{label:`严肃报修怎么发`,detail:`请提供截图、发生步骤、错误信息，以及必要时从设置 → 备份与恢复导出的数据文件。

只有能复现的问题才容易修好。`}]}],s=n(),c=`全部`,l=()=>{let{closeApp:e,registerBackHandler:t}=r(),[n,l]=(0,i.useState)(null),[d,f]=(0,i.useState)(``),[p,m]=(0,i.useState)(c),h=(0,i.useMemo)(()=>{let e=d.trim().toLowerCase();return o.filter(t=>p===c||t.category===p?e?[t.title,t.category,t.entry,t.summary,...t.keywords,...t.items.flatMap(e=>[e.label,e.detail])].join(`
`).toLowerCase().includes(e):!0:!1)},[p,d]),g=(0,i.useCallback)(e=>{l(t=>t===e?null:e)},[]),_=(0,i.useCallback)(()=>n?(l(null),!0):(e(),!0),[e,n]);return(0,i.useEffect)(()=>t(_),[_,t]),(0,i.useEffect)(()=>{n&&!h.some(e=>e.id===n)&&l(null)},[n,h]),(0,s.jsxs)(`div`,{className:`h-full w-full bg-slate-50 flex flex-col font-light`,children:[(0,s.jsx)(`div`,{className:`sully-safe-topbar h-20 bg-white/80 backdrop-blur-md flex items-end pb-3 px-4 border-b border-white/60 shrink-0 sticky top-0 z-10`,children:(0,s.jsxs)(`div`,{className:`flex items-center gap-2 w-full`,children:[(0,s.jsx)(`button`,{type:`button`,"aria-label":n?`Close current section`:`Back to desktop`,onClick:_,className:`p-2 -ml-2 rounded-full hover:bg-black/5 active:scale-90 transition-transform`,children:(0,s.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,className:`w-6 h-6 text-slate-600`,children:(0,s.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M15.75 19.5 8.25 12l7.5-7.5`})})}),(0,s.jsx)(`h1`,{className:`text-xl font-medium text-slate-700 tracking-wide`,children:`csy手册`})]})}),(0,s.jsxs)(`div`,{className:`flex-1 overflow-y-auto p-5 pb-20 no-scrollbar`,children:[(0,s.jsxs)(`div`,{className:`p-5 rounded-[2rem] mb-5 shadow-sm border border-white/70 bg-white`,children:[(0,s.jsxs)(`div`,{className:`flex items-start gap-3`,children:[(0,s.jsx)(`div`,{className:`w-11 h-11 rounded-2xl bg-rose-100 text-2xl flex items-center justify-center shrink-0`,children:`📓`}),(0,s.jsxs)(`div`,{className:`min-w-0`,children:[(0,s.jsx)(`h2`,{className:`text-lg font-bold text-slate-800`,children:`csy手册`}),(0,s.jsx)(`p`,{className:`text-xs text-slate-500 leading-relaxed mt-1`,children:`旧「使用帮助」和「二改手册」已经合并。现在按每个桌面 App 写入口、功能、基础操作和注意事项。`})]})]}),(0,s.jsxs)(`label`,{className:`mt-4 block`,children:[(0,s.jsx)(`span`,{className:`sr-only`,children:`搜索手册`}),(0,s.jsx)(`input`,{value:d,onChange:e=>f(e.target.value),placeholder:`搜索 App、功能或问题`,className:`w-full h-11 rounded-2xl bg-slate-100 px-4 text-sm text-slate-700 outline-none border border-transparent focus:border-rose-200 focus:bg-white transition-colors`})]}),(0,s.jsx)(`div`,{className:`mt-3 flex gap-2 overflow-x-auto no-scrollbar`,children:[c,...a].map(e=>{let t=p===e;return(0,s.jsx)(`button`,{type:`button`,"aria-pressed":t,onClick:()=>m(e),className:`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${t?`bg-slate-800 text-white`:`bg-slate-100 text-slate-500 hover:bg-slate-200`}`,children:e},e)})})]}),(0,s.jsxs)(`div`,{className:`mb-3 flex items-center justify-between px-1 text-[11px] text-slate-400`,children:[(0,s.jsxs)(`span`,{children:[h.length,` 个章节`]}),(d||p!==c)&&(0,s.jsx)(`button`,{type:`button`,onClick:()=>{f(``),m(c)},className:`font-bold text-slate-500`,children:`清除筛选`})]}),(0,s.jsx)(`div`,{className:`space-y-4`,children:h.map(e=>(0,s.jsx)(u,{section:e,expanded:n===e.id,onToggle:()=>g(e.id)},e.id))}),h.length===0&&(0,s.jsx)(`div`,{className:`mt-16 text-center text-sm text-slate-400`,children:`没找到相关内容`}),(0,s.jsx)(`div`,{className:`mt-8 text-center text-[10px] text-slate-400`,children:`csy手册 • 2026-06`})]})]})},u=({section:e,expanded:t,onToggle:n})=>(0,s.jsxs)(`div`,{className:`${e.color} rounded-[1.75rem] overflow-hidden border border-white/70 shadow-sm`,children:[(0,s.jsxs)(`button`,{type:`button`,"aria-expanded":t,"aria-controls":`manual-section-${e.id}`,onClick:n,className:`w-full px-5 py-4 flex items-center justify-between gap-4 text-left active:scale-[0.99] transition-transform`,children:[(0,s.jsxs)(`div`,{className:`flex items-center gap-3 min-w-0`,children:[(0,s.jsx)(`span`,{className:`text-2xl shrink-0`,children:e.emoji}),(0,s.jsxs)(`div`,{className:`min-w-0`,children:[(0,s.jsx)(`div`,{className:`text-base font-bold ${e.textColor} truncate`,children:e.title}),(0,s.jsx)(`div`,{className:`text-[11px] text-slate-400 mt-0.5`,children:e.category})]})]}),(0,s.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:2,stroke:`currentColor`,className:`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${t?`rotate-180`:``}`,children:(0,s.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`m19.5 8.25-7.5 7.5-7.5-7.5`})})]}),t&&(0,s.jsxs)(`div`,{id:`manual-section-${e.id}`,className:`px-5 pb-5 space-y-3 animate-fade-in`,children:[(0,s.jsxs)(`div`,{className:`bg-white/80 rounded-2xl border border-white/70 p-4`,children:[(0,s.jsx)(`div`,{className:`text-[11px] font-bold text-slate-400 mb-1`,children:`入口`}),(0,s.jsx)(`p`,{className:`text-xs text-slate-600 leading-relaxed whitespace-pre-wrap`,children:e.entry}),(0,s.jsx)(`div`,{className:`text-[11px] font-bold text-slate-400 mt-3 mb-1`,children:`功能`}),(0,s.jsx)(`p`,{className:`text-xs text-slate-600 leading-relaxed whitespace-pre-wrap`,children:e.summary})]}),e.items.map(e=>(0,s.jsx)(d,{item:e},e.label))]})]}),d=({item:e})=>{let[t,n]=(0,i.useState)(!1);return(0,s.jsxs)(`div`,{className:`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden`,children:[(0,s.jsxs)(`button`,{type:`button`,onClick:()=>n(e=>!e),className:`w-full px-4 py-3 flex items-center justify-between gap-3 text-left active:bg-slate-50 transition-colors`,children:[(0,s.jsx)(`span`,{className:`text-sm font-bold text-slate-700`,children:e.label}),(0,s.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,viewBox:`0 0 20 20`,fill:`currentColor`,className:`w-4 h-4 text-slate-300 shrink-0 transition-transform duration-200 ${t?`rotate-90`:``}`,children:(0,s.jsx)(`path`,{fillRule:`evenodd`,d:`M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z`,clipRule:`evenodd`})})]}),t&&(0,s.jsx)(`div`,{className:`px-4 pb-4 animate-fade-in`,children:(0,s.jsx)(`p`,{className:`text-xs text-slate-600 leading-relaxed whitespace-pre-wrap`,children:e.detail})})]})};export{l as default};