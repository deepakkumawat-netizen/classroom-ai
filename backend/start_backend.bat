@echo off
echo.
echo ClassroomAI Backend Server
echo ===========================
echo.
echo Starting server on http://localhost:8001
echo.
echo Press CTRL+C to stop the server
echo.
timeout /t 2 /nobreak
python main.py
pause
