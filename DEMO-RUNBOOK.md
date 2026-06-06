# Demo 跑场手册（3 分钟）· Vibe Dice

> 开赛请在接了 GLM 的 Claude Code 里实现/演示（让 Orbie 全程记录），才算 Z.ai×Orbit 证据。

## 三档保底（按现场网络选）
- **网络好**：`.env.local` 设 `GLM_OFFLINE=false` + 填好 `GLM_API_KEY`，真 GLM 现场生成 quest + Fate Card（有惊艳感）。
- **网络差/风险高**：`.env.local` 设 `GLM_OFFLINE=true`，全程走兜底 quest + mock Fate Card，**零翻车**。
- **终极保底**：播放预录的完美一局录屏。

## 节奏（对齐设计 §12）
- **0:00–0:25 痛点**：甩冷群（"20 hours, no messages"）+ 区隔话术："不是又一个 chatbot，我们把沉默变成 3 分钟 AI 骰子冒险，连不在 Zymix 的朋友都能通过 WhatsApp 干预。"
- **0:25–0:55 一键开启**：点 **Roll to revive this chat** → AI 生成开场（The Unread Beast 偷走话题）+ 给成员分配角色（Overthinking Wizard / Ghost Rogue / Chaos Bard / Snack Healer）。
- **0:55–1:25 第一轮投骰**：点骰子 → roll=7 Messy Progress → "找到话题但被诅咒，需要外部混乱" → 冒出 **Ask friends to interfere** 按钮。
- **1:25–1:55 WhatsApp 好友干预**：切到 share link 页 → 好友输入"Everyone can only speak in food metaphors" → AI 生成 **Curse Card: Food Metaphor Mode**。
- **1:55–2:30 第二轮投骰 + 编入干预**：回 Zymix，roll=18 Main Character Moment → AI 把诅咒编进剧情，野兽化成一碗面。
- **2:30–2:45 结果卡**：弹 **Quest Card**（Best Interference: Food Metaphor Mode / Mood: chaotic but alive / CTA: Start your own quest on Zymix）→ 保存分享。
- **2:45–3:00 影响**：单人即可开局；故事经 WhatsApp 扩散；外部朋友无需下载即可参与；Quest Card 把人带回 Zymix。

## 开演前检查
- [ ] `.env.local` 已就绪（GLM_OFFLINE=true 保底，或填了真 key 走 false）
- [ ] 预录录屏已就绪（含 share link 干预页那一段）
- [ ] dev server 已起、主页面 + Fate Card 干预页都已打开预热
- [ ] Quest Card "保存/分享"可用
- [ ] 演示设备和"好友手机"两块屏准备好（演 WhatsApp 干预切换）

## 防卡死要点
- 固定 3 回合、每轮最多 2 句旁白。
- Fate Card 输入失败 → 本地 mock card 替代。
- 全链路预生成数据兜底，API 挂了无缝切录屏。
