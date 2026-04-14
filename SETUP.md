# 🚀 ClassroomAI - Setup Guide

## What You Need
1. **Node.js** (v18+) - Download from https://nodejs.org
2. **Python** (v3.9+) - Download from https://python.org
3. **OpenAI API Key** - Get from https://platform.openai.com/api-keys
4. **Git** (optional) - Download from https://git-scm.com

---

## Installation (5 minutes)

### 1️⃣ **Download the Project**

**Using Git:**
```bash
git clone https://github.com/deepakkumawat-netizen/classroom-ai.git
cd classroom-ai
```

**Or download ZIP:**
- Click **Code** → **Download ZIP** on GitHub
- Extract the folder
- Open Command Prompt in the folder

---

### 2️⃣ **Set OpenAI API Key**

Create a `.env` file in the `backend` folder:

**Windows:**
```bash
cd backend
# Create .env file with:
OPENAI_API_KEY=your_api_key_here
```

**Mac/Linux:**
```bash
cd backend
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

---

### 3️⃣ **Start Backend**

```bash
cd backend
pip install -r requirements.txt
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8001
```

---

### 4️⃣ **Start Frontend (New Terminal/PowerShell)**

```bash
cd frontend
npm install
npm start
```

You should see:
```
VITE v... dev server running at:
  Local:     http://localhost:3004
```

---

### 5️⃣ **Open in Browser**

- Frontend: http://localhost:3004
- Backend API: http://localhost:8001

---

## 📋 Features

✅ **Worksheet Generator** - Create custom worksheets
✅ **Lesson Plan Generator** - Generate lesson plans
✅ **MC Assessment** - Create multiple-choice tests
✅ **Auto Generator** - Generate all 3 at once (faster)
✅ **Chat History** - Save and load previous generations
✅ **Usage Counter** - Track daily usage (50 per tool)

---

## 🆘 Troubleshooting

### "npm: command not found"
- Install Node.js from https://nodejs.org

### "python: command not found"
- Install Python from https://python.org
- On Windows, make sure to check "Add Python to PATH"

### "OPENAI_API_KEY not set"
- Create `.env` file in backend folder
- Add: `OPENAI_API_KEY=your_key_here`
- Get API key from https://platform.openai.com/api-keys

### "Port 8001 already in use"
- Kill the process using port 8001
- Or restart your computer

### "npm install fails"
```bash
npm cache clean --force
npm install
```

---

## 📞 Support

- Check README.md for more info
- View the code on GitHub
- Report issues on GitHub Issues

---

**Enjoy using ClassroomAI!** 🎓
