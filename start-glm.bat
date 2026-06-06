@echo off
REM ===== VibeHack: launch Claude Code wired to GLM (z.ai) =====
REM These inline SET commands override any leftover ANTHROPIC_* env vars
REM in your shell, so the connection ALWAYS goes to z.ai with the right key.

cd /d "C:\Users\ASUS\Desktop\VibeRoles"

set "ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic"
set "ANTHROPIC_AUTH_TOKEN=5d5a8186900f486c8f471dbbc83c0cd3.jw7Qa43Haro5XXzl"
set "API_TIMEOUT_MS=600000"

REM --- GLM compat: avoid the "thinking + tool loop" edge case that returns 1210 ---
set "DISABLE_INTERLEAVED_THINKING=1"
REM Pin GLM models explicitly (4.6 is the most compatible with the z.ai endpoint)
set "ANTHROPIC_DEFAULT_OPUS_MODEL=glm-4.6"
set "ANTHROPIC_DEFAULT_SONNET_MODEL=glm-4.6"
set "ANTHROPIC_DEFAULT_HAIKU_MODEL=glm-4.5-air"

echo.
echo Connecting Claude Code to GLM via z.ai ...
echo Base URL : %ANTHROPIC_BASE_URL%
echo.

claude
