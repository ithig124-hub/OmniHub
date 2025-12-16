# 📦 OmniHub - Installation & Deployment Guide

## ✅ **YES! You can run OmniHub from ANYWHERE**

OmniHub is a standalone Electron app - it doesn't need to be in `/app/` folder!

---

## 🚀 **Option 1: Run From Current Location**

```bash
cd /app/omnihub
npm start
```

That's it! Works perfectly from `/app/omnihub`

---

## 📁 **Option 2: Move to Any Location**

### **Move to your Home directory:**
```bash
# Copy the entire omnihub folder
cp -r /app/omnihub ~/omnihub

# Navigate and run
cd ~/omnihub
npm start
```

### **Move to Desktop:**
```bash
cp -r /app/omnihub ~/Desktop/omnihub
cd ~/Desktop/omnihub
npm start
```

### **Move to Documents:**
```bash
cp -r /app/omnihub ~/Documents/omnihub
cd ~/Documents/omnihub
npm start
```

### **Move to custom location:**
```bash
# Example: /home/user/my-projects/
cp -r /app/omnihub /home/user/my-projects/omnihub
cd /home/user/my-projects/omnihub
npm start
```

---

## 💻 **Option 3: Download & Use on Any Computer**

### **Step 1: Package the project**
```bash
cd /app/omnihub
tar -czf omnihub.tar.gz .
```

### **Step 2: Transfer to another computer**
- Copy `omnihub.tar.gz` to your target computer
- Or push to GitHub and clone it

### **Step 3: Extract and run**
```bash
# On the new computer
tar -xzf omnihub.tar.gz -C ~/omnihub
cd ~/omnihub
npm install  # Install dependencies
npm start    # Launch!
```

---

## 🌐 **Option 4: Build Standalone Executables**

Build native apps for Windows/Mac/Linux that run **without Node.js**:

### **Windows (.exe)**
```bash
cd /app/omnihub
npm run build:win
# Creates: dist/OmniHub Setup.exe
```

### **macOS (.dmg)**
```bash
npm run build:mac
# Creates: dist/OmniHub.dmg
```

### **Linux (.AppImage)**
```bash
npm run build:linux
# Creates: dist/OmniHub.AppImage
```

Then you can:
- Double-click to run (no npm needed!)
- Share with others
- Install like any normal app

---

## 📦 **What Gets Copied?**

When you move OmniHub, you need these files:

```
omnihub/
├── main.js              ✅ Required
├── preload.js           ✅ Required
├── package.json         ✅ Required
├── node_modules/        ✅ Required (or run npm install)
├── yarn.lock            ⚠️ Optional (but recommended)
└── src/                 ✅ Required (entire folder)
    ├── index.html
    ├── renderer.js
    ├── modules/
    └── styles/
```

---

## 🔧 **After Moving:**

1. **If you copied `node_modules`**: Just run!
   ```bash
   npm start
   ```

2. **If you didn't copy `node_modules`**: Install first
   ```bash
   npm install  # or yarn install
   npm start
   ```

---

## 🎯 **Recommended Setup:**

### **For Development:**
Keep it in `/app/omnihub` while building features

### **For Personal Use:**
```bash
# Move to home directory
mv /app/omnihub ~/omnihub
cd ~/omnihub
npm start
```

### **For Distribution:**
```bash
# Build standalone apps
npm run build:all
# Share the executables in dist/ folder
```

---

## 💡 **Pro Tips:**

✅ **No special permissions needed** - runs like any Electron app  
✅ **Works offline** - Map needs internet, but app launches offline  
✅ **Portable** - Entire folder can be zipped and moved  
✅ **Cross-platform** - Same code works on Windows/Mac/Linux  

---

## 🚫 **What You DON'T Need:**

❌ Web server (like Apache/Nginx)  
❌ Backend API (FastAPI/Express)  
❌ Database connection  
❌ Special container environment  
❌ Docker or Kubernetes  

---

## 🆘 **Common Issues:**

### **"electron command not found"**
```bash
npm install  # Reinstall dependencies
```

### **"Module not found"**
```bash
# Make sure you're in the omnihub folder
cd /path/to/omnihub
npm install
```

### **"Permission denied"**
```bash
# Fix permissions
chmod +x main.js
npm start
```

---

## 📝 **Summary:**

**YES** - OmniHub can run from anywhere!  
**NO** - It doesn't need /app folder  
**YES** - It's a normal desktop app  
**YES** - You can move it anywhere  
**YES** - You can build standalone executables  

**Just make sure you have Node.js and npm installed on your system!**

🌐 **OmniHub - Your portable digital workspace!**
