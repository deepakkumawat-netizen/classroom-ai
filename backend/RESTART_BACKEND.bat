@echo off
setlocal enabledelayedexpansion

echo ====================================
echo  ClassroomAI Backend Restart
echo ====================================
echo.

REM Kill any existing Python processes
echo Stopping old backend processes...
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak

REM Activate venv
echo.
echo Activating Python 3.12 virtual environment...
call venv\Scripts\activate.bat

REM Verify Python version
echo.
echo Verifying Python version...
python --version

REM Verify packages
echo.
echo Verifying packages...
pip list | findstr fastapi

REM Start backend
echo.
echo ====================================
echo  Starting Backend on Port 8001
echo ====================================
echo.
python main.py

pause
