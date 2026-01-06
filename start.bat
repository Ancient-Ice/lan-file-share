@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js 未安装或未加入 PATH
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm 未安装或未加入 PATH
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo [INFO] 未检测到依赖，正在执行 npm install ...
  npm install
  if errorlevel 1 (
    echo [ERROR] 依赖安装失败，请检查 npm 输出
    pause
    exit /b 1
  )
)
npm run start
pause
