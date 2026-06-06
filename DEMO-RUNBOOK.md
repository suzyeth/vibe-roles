# Demo 跑场手册（3 分钟）

> 这是 Claude 搭的**参考版**。开赛请在接了 GLM 的 Claude Code 里重走 PLAN.md（让 Orbie 全程记录），才算 Z.ai×Orbit 证据。

## 三档保底（按现场网络选）
- **网络好**：`.env.local` 设 `GLM_OFFLINE=false` + 填好 `GLM_API_KEY`，真 GLM 现场即兴生成（有惊艳感）。
- **网络差/风险高**：`.env.local` 设 `GLM_OFFLINE=true`，全程走兜底剧本，**零翻车**（参考版默认就是这个，开箱即跑）。
- **终极保底**：播放预录的完美一局录屏。

## 启动
```bash
cd C:\Users\ASUS\Desktop\VibeRoles
# 若无 .env.local，先建一个（参考 README）：至少含 GLM_OFFLINE=true
npm run dev   # 打开 http://localhost:3000（被占用会自动用 3001）
```

## 节奏（对齐手册评分节拍）
- **0:00–0:25 痛点**：甩死群截图（已读不回、3 天没消息）+ 一句"没人想当第一个发言的人" + 区隔话术："我们不是又一个常驻陪聊 AI，而是把破冰变成一局 30 秒的轻游戏。"
- **0:25–0:50 核心**：点一个主题 → AI 给全场选角（角色卡刷出来，**高光**）。
- **0:50–2:15 现场演**：输入框照角色冒 1–2 句（队友配合）/ 或点"😶 我潜水让 AI 替我接一句" → 旁白接龙 → 点"收尾 → 出名场面卡" → 卡片弹出 → 点"⬇️ 保存卡片去分享"。
- **2:15–2:40 AI 与工作流**：GLM 为这个群即兴现编；GLM+Claude Code 构建、Orbie 捕获；名场面卡（Fotor）；Manus 跑了调研/剧本库。
- **2:40–3:00 影响**：解决 Zymix 冷启动（引用 ~61 下载/低活跃）；原生 Mini Game + 病毒卡 = 增长飞轮；下一步。

## 开演前检查
- [ ] `.env.local` 已就绪（GLM_OFFLINE=true 保底，或填了真 key 走 false）
- [ ] 预录录屏已就绪
- [ ] `npm run dev` 已起、页面已打开、已预热过一局
- [ ] 名场面卡"保存"按钮能下载 PNG（演示分享）

## 已知留白（参考版未做，开赛可补）
- **Fotor 真集成**：当前用 `html-to-image` 把卡片 DOM 导出 PNG 保底；要拿 Fotor 营销奖，按 ORBIT-GLM-GUIDE.md 接 Fotor 模板/API 生成更精美的卡，并把生成链接/截图存到 `evidence/`。
- **多回合 beats 全自动推进**：当前是单回合手动推进（够 demo）。
