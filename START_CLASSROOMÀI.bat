@echo off
title ClassroomAI Startup
echo Starting ClassroomAI...
echo.
echo Starting Backend on port 8000...
start "ClassroomAI Backend" cmd /k "cd /d %~dp0backend && python main.py"
timeout /t 3
echo.
echo Starting Frontend on port 3001...
start "ClassroomAI Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 5
echo.
echo Opening http://localhost:3001 in browser...
start http://localhost:3001
echo Done! Servers should be running now.
pause
