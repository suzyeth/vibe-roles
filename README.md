# Vibe Dice

Zymix 原生 AI 骰子故事 Mini Game：群聊冷掉时，一键开启一场 3 分钟微型冒险。AI 当主持人，骰子推动剧情，**没下载 Zymix 的朋友也能通过 WhatsApp 链接用 Fate Card 干预故事**，结束生成可分享 Quest Card 把人带回 Zymix。

VibeHack London 2026 · 赛道 2 Vibe with Zymix。完整设计见 [DESIGN.md](./DESIGN.md)。

> 注：仓库当前代码是上一版「Vibe Roles」的可运行参考实现，架构可复用。按 Vibe Dice 改造的迁移清单见 DESIGN.md §16。

## 开赛快速启动

### 1. 接 GLM（已配好 `.claude/settings.json`）
- 去 `https://zai-hackathon.zeabur.app/`（或 Discord GLM 群）领 GLM API Key。
- 打开 `.claude/settings.json`，把占位符换成你的 key。
- 想用 GLM-5.1，在 `env` 里加三行：
  ```json
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5v-turbo",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.1"
  ```
  （GLM-5.1 是高级模型，14:00–18:00 UTC+8 高峰按更高倍率扣额度）

### 2. 在本目录启动 Claude Code
```powershell
cd C:\Users\ASUS\Desktop\VibeRoles
claude
```
进去后 `/status` 确认在用 GLM（界面仍显示 Claude 模型名是正常的）。

### 3. 加载 Orbie（开局第一条消息）
```text
Read https://orbit24.uk/ortie.md and embody Orbie for VibeHack London 2026.
Acknowledge once, then stay silent until I name you ("Orbie, ...") or trigger capture. Log my code and cognitive layers in the background.
```

### 4. 跑参考版（离线兜底，开箱即跑）
```powershell
npm install
npm run dev   # http://localhost:3000（被占用会自动换端口）
```
`.env.local` 默认 `GLM_OFFLINE=true`，无 key 也能演整条流程。

### 5. 结束时
- `capture my persona` → 按提示补齐字段 → 队长打包传 `orbit24.uk`。

## 关键链接
- Devpost 投递链接：到官方 Discord 取 → https://discord.gg/WQBSEp8ZW
- GLM Key：https://zai-hackathon.zeabur.app/
- Ortie 说明：https://orbit24.uk/ortie.md
- Manus 注册：https://manus.im/live-events/EVENT-4022
- Fotor 指南：https://docs.google.com/document/d/1FnOiqmQWjoWLAktPTt81D0cspQYlE8PdJJprY0vURo0/edit

## 文档地图
- [DESIGN.md](./DESIGN.md) — Vibe Dice 产品设计（含 §16 迁移清单）
- [PLAN.md](./PLAN.md) — 实现计划（当前为 Vibe Roles 版，待按 §16 重写）
- [ORBIT-GLM-GUIDE.md](./ORBIT-GLM-GUIDE.md) — Z.ai×Orbit + GLM 接入 + 调用示例
- [DEMO-RUNBOOK.md](./DEMO-RUNBOOK.md) — 3 分钟 demo 跑场手册
- [SPRINT-30MIN.md](./SPRINT-30MIN.md) — 开赛 30 分钟冲刺清单
