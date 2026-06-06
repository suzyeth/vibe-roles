# Vibe Dice — 产品设计文档（DESIGN.md）

> VibeHack London 2026 · 赛道 2「Vibe with Zymix」参赛项目设计源文件
> 基于原「Vibe Roles」文档重构（v3 pivot）
> 最后更新：2026-06-06

## 0. 一句话定位
**Zymix 原生 AI 骰子故事 Mini Game：当群聊冷掉时，用户一键开启一场 3 分钟微型冒险。AI 当主持人，骰子推动剧情，好友可以通过 WhatsApp / 通讯录链接添加角色、诅咒、道具和世界规则来干预故事。**

区隔话术（demo 第一句，务必先讲）：
> "我们不是又一个常驻陪聊 AI，也不是完整 DND。我们把冷掉的群聊变成一局 3 分钟的 AI 骰子冒险，并且让没有下载 Zymix 的朋友也能通过 WhatsApp 干预故事。"

产品短名：**Vibe Dice**
备选名：**RollQuest / Chaos Quest / Zymix Side Quest**

> 注意：产品对外尽量不要直接叫 DND。Dungeons & Dragons 是明确品牌，而且会让评委以为系统很重。我们应使用「AI dice story game」「micro roleplay quest」「chat-based adventure」这类说法。

## 0.1 与现有代码的关系（迁移说明）
当前仓库已有一份**可运行的「Vibe Roles」参考实现**（群聊微剧场 + 名场面卡），技术骨架可大量复用。本文件是 **v3 pivot**，玩法核心由「分角色演短剧」升级为「骰子驱动 + 外部好友 Fate Card 干预」。**代码尚未对齐本设计**——需改造的模块见 §16 迁移清单。复用与改造原则：保留 Next.js + GLM + 兜底三件套 + 离线开关的架构，替换玩法循环、加骰子系统与外部干预页。

## 0.2 与评分维度的对齐（为什么这版更能拿分）
| 评分项(权重) | Vibe Dice 如何命中 |
|---|---|
| 相关性 (25%) | 正面解决 Zymix「下载量低/群冷清」——单人即可开局，且把外部朋友带回 App |
| 原创性 (20%) | 「骰子命运 + 外部非用户用 Fate Card 干预」的组合无成熟产品端到端做过 |
| UX (20%) | 用户只需投骰子/一键，零打字门槛；3 分钟一局节奏紧凑 |
| AI 有效性 (20%) | AI 做实时叙事整合、Fate Card 结构化、内容治理、节奏控制（不只是生成器） |
| Demo 完成度 (15%) | 固定 3 回合 + 预生成兜底 + 离线录屏，闭环可控 |

---

## 1. 背景与机会

### 1.1 比赛
- VibeHack London 2026，24 小时黑客松，3 分钟现场桌边 demo。
- 主赛道：Vibe with Zymix（为 Gen Z 社交 App「Zymix」做 AI 原生功能）。
- 提交：Devpost（主）；截止 2026-06-07 周日 12:00。
- 评分权重：**相关性 25% / 原创 20% / UX 20% / AI 有效性 20% / demo 完成度 15%**。

### 1.2 Zymix 真实现状（按原文档保留）
- 英国 Gen Z 一体化社交 SuperApp（"Social. Pay. Explore."）。
- 功能：加密通讯、Social Scene（附近的人/匿名投票/排行榜/限时活动/校园&夜生活/群组空间）、Wallet（积分/打赏/投票/分账）、Mini Apps（短剧/直播/轻量小游戏/本地服务）、AI 助手。
- 体量极早期：近 30 天约 61 次下载；App Store 4.6（仅 9 个评分）。
- 用户反馈：👍"小游戏新鲜好玩"；👎 注册后垃圾推送、转盘抽奖促销太重、活跃度低。

### 1.3 机会点（重新定义）
原文档把问题定义为「死群没人想当第一个发言的人」。这个判断仍然成立，但还不够。真正的冷启动问题是：

1. **Zymix 下载量低，很多真实朋友可能根本不在 App 里。**
2. **如果群聊本身不活跃，只做群内功能会很危险。**
3. **早期社交 App 需要一个人也能开始，并能把外部朋友带进来。**

所以 Vibe Dice 的机会不是「让群里的人继续聊天」，而是：

> **让一个用户先玩起来，再通过 WhatsApp / 通讯录好友干预故事，把外部社交关系带回 Zymix。**

这比单纯的群聊破冰更适合早期 App，因为它不依赖平台内已经存在大量活跃用户。

---

## 2. 竞品与原创性

### 2.1 仍需避开的红海
「AI 进群聊」已经很拥挤。原文档中提到的竞品逻辑仍然成立：
- AI 常驻群聊当成员：容易撞 Shapes。
- AI Host 派对游戏：如果玩法预制，会像普通 party game。
- Character.AI 群聊：更偏 AI 角色陪聊，真人互动反而弱。
- AI Dungeon：长篇 RPG，过重，不解决社交 App 冷启动。

### 2.2 新空白点
Vibe Dice 的空白点不再是「AI 给真人分角色演短剧」，而是这条链路：

> **冷群 / 单人启动 → AI 生成微型冒险 → 骰子决定剧情命运 → 外部好友通过链接添加 Fate Cards → AI 把好友干预编进下一轮故事 → 生成可分享结果卡 → 引导好友回流 Zymix。**

这个组合比原 Vibe Roles 更强，因为它新增了两个关键创新：

1. **Dice-based agency**：用户不是被动看 AI 写剧本，而是通过投骰子决定成功、失败、反转和代价。
2. **External interference loop**：好友不需要已经在 Zymix 里，也可以通过 WhatsApp / 通讯录链接干预故事。

### 2.3 Demo 卖点
不要说：
> "我们做了一个 AI DND。"

要说：
> "我们做了一个 AI-native social mini game。它把冷群变成骰子故事，把外部朋友变成剧情干预者，让 Zymix 在用户量很小时也能产生可分享的社交内容。"

---

## 3. 核心玩法循环

### 3.1 主循环
1. **触发**：Zymix 群聊冷掉后，出现按钮：**Roll to revive this chat**。用户也可以在 Mini Apps 中主动点开 **Vibe Dice**。
2. **AI 开场**：AI 根据群名、成员名、最近聊天氛围或预设主题生成一个微型冒险。
3. **自动分配角色**：AI 给在场成员分配轻量角色，例如 The Ghost Rogue / The Snack Healer / The Chaos Bard / The Budget Goblin。
4. **投骰子推进故事**：用户点击骰子。骰子结果决定当前行动是失败、部分成功、成功还是荒谬大成功。
5. **分享干预链接**：用户可以点击 **Ask friends to interfere**，把故事链接发到 WhatsApp / 通讯录 / IG DM。
6. **好友添加 Fate Card**：外部好友不需要下载 App，可以在网页里添加一个角色、道具、诅咒、世界规则或祝福。
7. **AI 编入下一轮**：下一轮投骰子时，AI 抽取或读取好友提交的 Fate Card，把它自然编进剧情。
8. **结局与结果卡**：3 回合后，AI 生成反转结局和一张可分享 Quest Card。
9. **回流**：结果卡底部显示：**Start your own Vibe Dice on Zymix**。

### 3.2 推荐时长
- 每局：约 3 分钟。
- 回合数：3 回合。
- 每轮用户操作：一次投骰子 + 最多一次选择。
- 好友干预：每个好友最多提交 1 张 Fate Card，防止故事失控。

---

## 4. 骰子系统

### 4.1 骰子不是传统 D20，而是 Vibe Dice
为了更符合 Gen Z 语气，不直接使用传统数字规则。界面可以保留 1–20 数字，但结果标签用情绪化语言。

| 点数 | 结果标签 | 故事效果 |
|---|---|---|
| 1 | Total Chaos | 大失败，触发最荒谬后果 |
| 2–5 | Awkward Fail | 失败，但生成好笑转折 |
| 6–10 | Messy Progress | 部分成功，有代价 |
| 11–15 | Works Somehow | 成功，但留下隐患 |
| 16–19 | Main Character Moment | 成功，并获得优势 |
| 20 | Iconic Roll | 极大成功，进入高光场面 |

### 4.2 为什么需要骰子
骰子解决三个问题：

1. **降低表演压力**：用户不用想自己该说什么，点一下骰子就能推进。
2. **增加重复玩性**：同一个设定也会因为骰子结果不同而变成不同故事。
3. **让 AI 不像纯生成器**：AI 不是直接输出完整故事，而是根据随机命运和好友干预动态编排。

---

## 5. 好友干预机制：Fate Cards

### 5.1 朋友如何参与
用户点击 **Ask friends to interfere** 后，生成一个 share link。朋友打开链接后看到：

> Help or ruin Xiaomin's quest.

朋友可以选择一种干预类型：

1. **Add a Character**：添加角色。
2. **Add an Object**：添加道具。
3. **Add a Curse**：添加诅咒。
4. **Add a Rule**：添加世界规则。
5. **Add a Blessing**：添加祝福。

朋友只需要输入一句话，例如：
> A pigeon wearing sunglasses.

AI 会把它转化为结构化 Fate Card：

```json
{
  "type": "character",
  "title": "The Sunglasses Pigeon",
  "effect": "Appears when the player rolls below 10. It offers suspicious advice but demands chips.",
  "tone": "chaotic but harmless",
  "trigger": "roll_under_10"
}
```

### 5.2 为什么要用 Fate Card，而不是直接让朋友改故事
不能让朋友无限自由改剧情，否则故事会失控，内容安全也难控制。Fate Card 把外部输入变成可控单位：

> 好友提供混乱，AI 负责治理混乱。

这也是 AI 的有效性体现。AI 不只是写故事，而是在做实时叙事整合、内容过滤、语气统一和游戏节奏控制。

### 5.3 Fate Card 白名单
MVP 只做 5 类：

| 类型 | 示例 | 作用 |
|---|---|---|
| Character | A jealous duck | 添加 NPC |
| Object | A broken umbrella | 给玩家道具 |
| Curse | Everyone speaks in food metaphors | 增加限制 |
| Rule | Doors only open after bad advice | 改变世界规则 |
| Blessing | One free escape | 帮玩家一把 |

---

## 6. 核心用户场景

### 6.1 冷群复活场景
Zymix 群聊 20 小时没人说话。界面出现：

> This chat is getting cold. Roll to revive it?

用户点击后，AI 生成：

> The chat has fallen into silence. A creature called The Unread Beast has stolen the last topic. Roll to recover it.

成员角色：
- Xiaomin: The Overthinking Wizard
- Emma: The Ghost Rogue
- Leo: The Chaos Bard
- Jack: The Snack Healer

用户投骰子，故事推进。若群里其他人暂时不回，AI 可以自动把他们变成 Sleeping NPC。

### 6.2 单人启动场景
如果 Zymix 里没有活跃群，用户也能一个人开始：

> Start a solo quest.

AI 补位 NPC，用户可以把故事发到 WhatsApp 找朋友干预。

这个场景是 MVP 必须有的，因为它正面解决「下载量少，群聊做不起来」的问题。

### 6.3 外部好友干预场景
用户把链接发给 WhatsApp 好友。好友不需要下载 Zymix，只要点开网页：

> Add one twist to Xiaomin's quest.

好友提交：
> Everyone can only speak in food metaphors.

AI 转成 Fate Card：

> Curse Card: Food Metaphor Mode. All future dialogue must sound like dinner is a psychological condition.

下一轮故事里，AI 编入这个诅咒。

### 6.4 结果分享场景
游戏结束后生成：

> **Quest Completed**
> The Unread Beast was defeated.
> Best Interference: Food Metaphor Curse
> Final Roll: 18
> Group Mood: chaotic but alive
> Start your own quest on Zymix.

这张卡可以分享到 Zymix 内容位、WhatsApp、IG Story、小红书。

---

## 7. 降级模式（防翻车命脉，必做）

### 7.1 人数不足
- 1 人：AI 生成 Solo Quest，并补 2 个 NPC。
- 2 人：AI 加 1 个 NPC 作为故事扰动者。
- 3 人以上：正常分配角色。

### 7.2 群友不在线
- 未回应成员自动变成 **Sleeping NPC**。
- 他们回来后可以点击 **Re-enter the quest**。
- AI 给补位剧情，例如：
  > The Sleeping Oracle has awakened and brings one suspicious prophecy.

### 7.3 好友不下载 App
- 好友打开 Web share page 即可添加 Fate Card。
- 不强制下载。
- 只有在提交后才出现轻 CTA：
  > Want to start your own quest? Open Zymix.

### 7.4 API / 网络失败
- 预生成一个完整兜底剧本。
- Fate Card 输入失败时，用本地 mock card 替代。
- Demo 必须准备离线录屏。

---

## 8. 与 Zymix 原生整合

| Zymix 现有功能 | Vibe Dice 怎么用 |
|---|---|
| Mini Apps（一键即用） | Vibe Dice 游戏入口 |
| 群组空间 | 冷群触发场地 |
| Social Scene / 附近活动 | 可以把 Quest 设定为「活动现场支线任务」 |
| 通讯录 / 外部分享 | 把 WhatsApp 好友带进故事干预页 |
| 短剧 / 内容位 | Quest Card 分享出口 |
| Wallet / 积分 | 可选：给 Best Interference / Best Roll 打赏 |
| 排行榜 | 可选：今日最混乱 Fate Card / Best Quest Card |

重点：
> Vibe Dice 不是只在 Zymix 内部消耗内容，而是让 Zymix 用户把外部朋友带进一个轻量互动入口。这比单纯做群聊功能更适合早期下载量低的状态。

---

## 9. 技术方案（24h）

### 9.1 形态（架构决策）
- ✅ **单屏模拟 Web 原型**：像素级模仿 Zymix 群聊 / Mini App UI。
- ✅ **Share Link 干预页**：一个独立网页，模拟 WhatsApp 好友打开后的 Fate Card 输入流程。
- ✅ **本地状态即可**：用 local state / Supabase mock 存 quest、roll、fate cards。
- ❌ 不做真·多端实时同步。
- ❌ 不做真正通讯录权限。
- ❌ 不做完整 DND 规则系统。

### 9.2 技术栈
- 前端：Next.js / React 单页。
- UI 快速搭建：Bolt / Lovable / Cursor。
- AI 层：GLM / Z.ai 主力。
  - 调用①：生成 quest opening + 角色卡 + 第一轮目标。
  - 调用②：根据骰子结果 + 当前 Fate Cards 生成下一段剧情。
  - 调用③：把外部好友输入转化为 Fate Card JSON。
  - 调用④：生成 Quest Card 文案。
- 卡片生成：Fotor 模板 / 或前端 canvas 先生成可下载卡片，Fotor 作为营销物料与 polished output。

### 9.3 稳定性三件套
- JSON schema 约束。
- 失败重试。
- 预生成兜底剧本 + mock Fate Cards。

### 9.4 数据 schema（草案）
```json
{
  "quest_id": "q_001",
  "source": "zymix_group_chat",
  "status": "round_2",
  "scene": {
    "theme": "The Unread Beast",
    "setup": "The chat has fallen into silence...",
    "tone": "chaotic, playful, safe"
  },
  "players": [
    { "name": "Xiaomin", "role": "The Overthinking Wizard", "ability": "Detect hidden awkwardness", "status": "active" },
    { "name": "Emma", "role": "The Ghost Rogue", "ability": "Return from unread messages", "status": "sleeping_npc" }
  ],
  "rounds": [
    { "round": 1, "roll": 7, "roll_label": "Messy Progress", "narration": "You found the lost topic, but it is cursed." }
  ],
  "fate_cards": [
    { "source_friend": "Maya", "type": "curse", "title": "Food Metaphor Mode", "effect": "All future dialogue must sound like dinner is a psychological condition.", "trigger": "next_round" }
  ],
  "ending": "The Unread Beast was defeated by slow-cooked friendship.",
  "share_card": {
    "title": "Quest Completed",
    "caption": "Chaotic but alive",
    "best_interference": "Food Metaphor Mode",
    "cta": "Start your own quest on Zymix"
  }
}
```

---

## 10. 24h 时间分配（更新版）

| 时段 | 任务 |
|---|---|
| H0–2 | 环境：Claude Code 接 GLM、建仓、Zymix 风格 UI 壳、确定 demo 主题 |
| H2–6 | 核心循环：Start Quest → AI 开场 → 角色卡 → Roll 按钮 → 第一轮结果 |
| H6–10 | Fate Card 干预页：分享链接页 + 好友输入 + AI 转 Fate Card JSON |
| H10–14 | 第二/三轮剧情：骰子结果 + Fate Card 插入 + 结局生成 |
| H14–17 | Quest Card：结果卡 UI / Fotor 模板 / 分享按钮 |
| H17–19 | 单人模式 + Sleeping NPC + API 失败兜底 |
| H19–21 | Demo 脚本 + 录屏 Plan B + 预生成完美数据 |
| H21–23 | Manus / Fotor / Orbit 专项奖材料整理 |
| H23–24 | Devpost 提交 + 链接测试 + buffer |

优先级：
1. Roll + AI story loop
2. WhatsApp interference page
3. Quest Card
4. Zymix UI polish
5. 专项奖材料

---

## 11. 专项奖嵌入点

### 11.1 Fotor 营销奖
- 产品内：Quest Card 用 Fotor 风格模板生成。
- 营销物料：做一张 poster：
  > "Your group chat is dead. Roll to revive it."
- 另做一张故事帖：展示「WhatsApp 好友添加诅咒 → AI 编进故事 → 结果卡」的传播链路。

### 11.2 Manus 真实用例奖
用 Manus 跑：
- 竞品调研：AI Dungeon / Party games / AI chatbots / group chat games。
- Fate Card 类型库生成。
- Gen Z 语气库生成。
- Demo 脚本和 Devpost 文案。

保留任务链接和产出截图。

### 11.3 Z.ai × Orbit 奖
- GLM 作为故事生成、Fate Card 结构化、结果卡文案的主力模型。
- Orbie 全程观察编码过程。
- 频繁 commit。
- 结束执行 `capture my persona`，上传 orbit24.uk。

---

## 12. 3 分钟 Demo 脚本（更新版）

### 0:00–0:25 痛点
展示一个冷掉的 Zymix 群聊：
> 20 hours, no messages. Nobody wants to be the first person to speak.

然后说区隔话术：
> "We are not adding another chatbot to the group. We turn silence into a 3-minute AI dice quest, and even friends outside Zymix can interfere through WhatsApp."

### 0:25–0:55 一键开启
点击：**Roll to revive this chat**。

AI 生成：
> The chat has fallen into silence. The Unread Beast has stolen the last topic.

AI 分配角色：
- Xiaomin: The Overthinking Wizard
- Emma: The Ghost Rogue
- Leo: The Chaos Bard
- Jack: The Snack Healer

### 0:55–1:25 第一轮投骰
用户点击骰子，roll = 7。

AI 输出：
> Messy Progress. You found the lost topic, but it is cursed. It needs outside chaos to survive.

按钮出现：
> Ask friends to interfere

### 1:25–1:55 WhatsApp 好友干预
切到 share link 页面。

好友输入：
> Everyone can only speak in food metaphors.

AI 生成 Fate Card：
> Curse Card: Food Metaphor Mode.

### 1:55–2:30 第二轮投骰 + AI 编入干预
回到 Zymix。用户继续 roll = 18。

AI 输出：
> Main Character Moment. The Unread Beast attacks, but you answer: "This group chat is not dead. It is just slow-cooked." The beast dissolves into a suspicious bowl of noodles.

### 2:30–2:45 结果卡
生成 Quest Card：
> Quest Completed
> Best Interference: Food Metaphor Mode
> Final Mood: chaotic but alive
> CTA: Start your own quest on Zymix

### 2:45–3:00 影响总结
> Vibe Dice solves Zymix's cold-start problem by making one user enough to start. The story can spread through WhatsApp, external friends can interfere without downloading, and the final Quest Card brings them back to Zymix.

### Plan B
- 全链路预生成。
- API 挂了就播放完美录屏。
- Fate Card 页面保留 mock input。

---

## 13. 风险对冲表

| 风险 | 对冲 |
|---|---|
| 被误解成 DND 复制 | 不叫 DND，主打 AI dice micro quest |
| 故事太长 | 固定 3 回合，每轮最多 2 句旁白 |
| 好友输入失控 | Fate Card 类型白名单 + 内容过滤 |
| 用户不想表演 | 用户只需投骰子，不需要写长台词 |
| 群友不在线 | Sleeping NPC + 单人模式 |
| Zymix 用户少 | 外部 WhatsApp 干预页，不强制下载 |
| LLM 格式乱 | JSON schema + fallback |
| API 超时 | 预生成 demo 剧本 + 离线录屏 |
| 内容安全 | 主题白名单、禁成人/暴力/仇恨/敏感身份攻击 |

---

## 14. 提交清单

- [ ] Devpost 主提交：队名/成员/主赛道(Vibe with Zymix)/项目名/产品说明/为何对 Zymix 用户重要/用了哪些 AI 工具
- [ ] Live demo 链接
- [ ] 录屏 Plan B 链接
- [ ] Fotor 结果卡 / 营销海报链接
- [ ] Manus 工作流链接 + 说明
- [ ] Orbit package 上传 orbit24.uk
- [ ] 所有链接在无登录浏览器窗口测试可打开
- [ ] 12:00 前提交，留 buffer

---

## 15. Devpost 简短产品说明草案

**Vibe Dice is an AI-native dice storytelling mini game for Zymix. When a group chat goes cold, one user can start a 3-minute quest. AI assigns playful roles, dice rolls decide the story's fate, and friends outside Zymix can interfere through WhatsApp by adding characters, curses, objects, or rules. AI turns those interventions into Fate Cards and weaves them into the next round of the story. At the end, the game generates a shareable Quest Card that brings the moment back to Zymix.**

**Why it matters:** early social apps often feel empty because users do not know what to say first. Vibe Dice makes one user enough to start a social moment, while external sharing turns non-users into playful participants before asking them to download anything.

---

## 16. 实现迁移清单（现有 Vibe Roles 代码 → Vibe Dice）

> 现有代码是可运行的 Vibe Roles 参考实现。下面是改造为 Vibe Dice 的最小映射。架构（Next.js + GLM 客户端 + Zod schema + 兜底 + GLM_OFFLINE 开关）保留。

| 现有 (Vibe Roles) | Vibe Dice 改造 |
|---|---|
| `lib/schema.ts` SceneSchema/RoundSchema | 改为 QuestSchema：scene + players(含 status) + rounds(含 roll/roll_label) + fate_cards + share_card；新增 `FateCardSchema`（type 白名单 5 类） |
| `lib/director.ts` buildScenePrompt/buildRoundPrompt | 改为 buildQuestPrompt（开场+角色+目标）、buildRollPrompt（按 roll_label + 当前 fate_cards 生成下一段）、buildFateCardPrompt（自由输入→结构化 JSON）、buildQuestCardPrompt |
| `lib/fallback.ts` 4 套剧本 | 改为 Quest 兜底 + mock Fate Cards + 每个 roll_label 的兜底旁白 |
| `app/api/scene|narrate|round|highlight` | 改为 `/api/quest`(开局)、`/api/roll`(投骰子推进)、`/api/fate`(好友输入→Fate Card)、`/api/questcard`(结果卡) |
| `components`（聊天气泡/角色卡/名场面卡） | 新增 `DiceRoller`、`RollResultBanner`、`FateCardList`、`QuestCard`；复用气泡/角色卡 |
| `app/page.tsx` 自动播放状态机 | 改为 quest 状态机：cold→quest 开场→roll 循环(3 回合)→结局→QuestCard；骰子驱动而非自动播放 |
| 新增 | **`app/q/[id]/page.tsx` 外部好友干预页**（Share Link 页：选 5 类 + 一句输入 → 调 /api/fate） |
| `data/themes.ts` | 改为 Quest 主题（含 The Unread Beast 等） + Fate Card 示例库 |
| 名场面卡导出 `lib/cardExport.ts` | 复用：改成导出 Quest Card |

骰子点数→标签映射（实现时放 `lib/dice.ts` 纯函数，便于 TDD）：见 §4.1 表。
