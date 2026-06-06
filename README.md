# Vibe Roles

Zymix 原生群组 Mini Game：对死群点一下，AI 把在场的人写进一场 30 秒微剧场，结束甩出一张可分享「名场面卡」。

VibeHack London 2026 · 赛道 2 Vibe with Zymix。完整设计见 [DESIGN.md](./DESIGN.md)。

## 开赛快速启动

### 1. 接 GLM（已配好 `.claude/settings.json`）
- 去 `https://zai-hackathon.zeabur.app/`（或 Discord GLM 群）领 GLM API Key。
- 打开 `.claude/settings.json`，把 `在这里填你的GLM_KEY` 换成你的 key。
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

### 4. 结束时
- `capture my persona` → 按提示补齐字段 → 队长打包传 `orbit24.uk`。

## 关键链接
- Devpost 投递链接：到官方 Discord 取 → https://discord.gg/WQBSEp8ZW
- GLM Key：https://zai-hackathon.zeabur.app/
- Ortie 说明：https://orbit24.uk/ortie.md
- Manus 注册：https://manus.im/live-events/EVENT-4022
- Fotor 指南：https://docs.google.com/document/d/1FnOiqmQWjoWLAktPTt81D0cspQYlE8PdJJprY0vURo0/edit
