@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo AKI DEV - LOCAL AGENT
if not exist "agent\.env" (
 echo Missing agent\.env. Copy agent\.env.example to agent\.env and fill in the values.
 pause
 exit /b 1
)
if not exist "node_modules" (
 call npm install
 if errorlevel 1 pause ^& exit /b 1
)
call npm run agent
pause
