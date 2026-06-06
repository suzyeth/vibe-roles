# 开赛 30 分钟冲刺清单（给队友）

> 目标：开赛后 30 分钟内，全队把环境跑通、参考版演一遍、分好工、并确保"用 GLM 构建 + Orbie 记录"开始计入 Z.ai×Orbit 证据。

## 先分工（30 秒拍板）
- **队长**：管 Devpost 提交 + Orbit 打包上传（每队只交一个 zip）。
- **前端/UX**：把参考版 UI 打磨得更像 Zymix 原生。
- **AI/Prompt**：调 `lib/director.ts` 的选角/旁白 prompt 质量。
- **物料/Fotor**：做名场面卡的 Fotor 集成 + 营销海报/故事帖。
> 每个人都在**自己的 Claude Code（接 GLM + 加载 Orbie）**里干活，各自结束都要 `capture my persona`，把文件夹交队长。

## 0–5 分钟 · 环境
- [ ] 打开项目：`cd C:\Users\ASUS\Desktop\VibeRoles`
- [ ] 领 GLM Key：`https://zai-hackathon.zeabur.app/`（或 GLM Discord 群）
- [ ] 填 key：`.claude/settings.json` 的 `ANTHROPIC_AUTH_TOKEN`；以及 `.env.local` 的 `GLM_API_KEY`
- [ ] `npm install`

## 5–10 分钟 · 接 GLM + 加载 Orbie（拿 Z.ai×Orbit 证据的前提）
- [ ] 在项目目录启动 `claude` → `/status` 确认实际在用 GLM（界面显示 Claude 模型名是正常的）
- [ ] 开局第一条消息加载 Orbie：
  > `Read https://orbit24.uk/ortie.md and embody Orbie for VibeHack London 2026. Acknowledge once, then stay silent until I name you or trigger capture. Log my code and cognitive layers in the background.`

## 10–15 分钟 · 跑通参考版（先离线，确保人人能跑）
- [ ] `.env.local` 设 `GLM_OFFLINE=true`
- [ ] `npm run dev` → 打开 http://localhost:3000
- [ ] 走一遍：选主题 → 角色卡 → 输入/潜水代演 → 收尾 → 名场面卡 → 保存 PNG
- [ ] 再把 `GLM_OFFLINE=false` 试一次真 GLM（确认 key 生效）

## 15–25 分钟 · 三线并行开干
- [ ] **前端**：套 Zymix 配色/字体、加群头像、把"Mini App"外壳做像
- [ ] **Prompt**：在 `lib/director.ts` 调选角/旁白，让台词更好笑、角色更贴成员；可让 GLM 多生成几个 `beats`
- [ ] **Fotor**：按 `ORBIT-GLM-GUIDE.md` 把名场面卡接 Fotor 模板/API；顺手做 1 张发布海报 + 1 条"死群复活"故事帖
- [ ] **留痕（全员）**：prompt 里口头说"为什么用 GLM"；频繁 `git commit`；截图丢 `evidence/`

## 25–30 分钟 · 对齐 demo + 保底
- [ ] 过一遍 `DEMO-RUNBOOK.md` 的 3 分钟节奏，分好谁说哪段
- [ ] 录一段**离线兜底**的完美一局录屏（Plan B）
- [ ] 确认三处提交口径：Devpost（主 + Fotor 链接 + Manus 链接）、Orbit（Ortie 包，单独传 orbit24.uk）

## ⏰ 收尾（临近 12:00 截止）
- [ ] 全员 `capture my persona` → 文件夹交队长
- [ ] 队长打包 `team-<队名>/` zip → 传 `orbit24.uk`
- [ ] Devpost 主提交 + 所有链接在无登录窗口测试可打开
- [ ] 留 buffer，别卡点
