@echo off
echo.
echo  ======================================
echo    ClassroomAI - Starting Backend
echo  ======================================
echo.

cd /d "%~dp0backend"

if not exist "venv" (
    echo  First time setup - creating Python 3.12 virtual environment...
    py -3.12 -m venv venv
    echo  Installing packages...
    call venv\Scripts\activate
    pip install -r requirements.txt
    echo.
    echo  Done! Starting server...
) else (
    call venv\Scripts\activate
)

echo.
echo  Backend running at: http://localhost:8000
echo  Now run START_FRONTEND.bat in a NEW terminal window!
echo.
echo  Press CTRL+C to stop.
echo.

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
