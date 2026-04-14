@echo off
echo.
echo  ======================================
echo    ClassroomAI - Starting Frontend
echo  ======================================
echo.

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo  First time setup - installing Node packages...
    npm install
    echo.
    echo  Done! Starting frontend...
) else (
    echo  Starting frontend dev server...
)

echo.
echo  Frontend running at: http://localhost:3000
echo  Open this URL in your browser!
echo.
echo  Press CTRL+C to stop.
echo.

npm run dev
pause
