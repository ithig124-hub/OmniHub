# 🚀 OmniHub Quick Start Guide

## ⚡ Get Started in 3 Steps

### **Step 1: Navigate to OmniHub**
```bash
cd /app/omnihub
```

### **Step 2: Install Dependencies** (Already done! ✅)
```bash
npm install  # or yarn install
```

### **Step 3: Launch OmniHub**
```bash
npm start
```

That's it! OmniHub will open in a new window.

---

## 🎮 **How to Use**

### **Navigation Methods:**

1. **Click Navigation Buttons** - Top bar with module icons
2. **Swipe Gestures** - Swipe left/right (touch or mouse drag)
3. **Keyboard Shortcuts**:
   - `←` Previous module
   - `→` Next module  
   - `1` Map
   - `2` Notes
   - `3` Library
   - `4` Search
   - `5` Dashboard
   - `6` Tracking

---

## 🗺️ **Map Module Quick Guide**

The Map module is fully functional! Try these:

1. **View Toggle**
   - Click "Street" or "Satellite" buttons

2. **Add a Pin**
   - Click "Add Pin" button
   - Enter name and description
   - Click Save

3. **View Saved Pins**
   - Click "Pins" button
   - Click "Go To" to navigate to a pin
   - Click "Delete" to remove

4. **Create a Route**
   - Click "Route" button
   - Click two points on the map
   - See distance & duration

5. **Weather Overlay** (needs API key)
   - Get free key from openweathermap.org
   - Edit src/modules/map/config.js
   - Add your API key
   - Click "Weather" button

---

## 🔧 **Troubleshooting**

### **App won't start?**
```bash
# Check if Electron is installed
cd /app/omnihub
npm list electron

# Reinstall if needed
npm install
```

### **Map not showing?**
- Open DevTools: `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
- Check console for errors
- Verify internet connection (needed for map tiles)

### **Module switching not working?**
- Make sure you're using arrow keys or swipe gestures
- Check if all module HTML files exist in src/modules/

---

## 📝 **Next Steps**

1. **Explore the Map Module** - Fully functional!
2. **Wait for Other Modules** - Notes, Library, etc. (coming soon)
3. **Customize** - Edit config files in each module
4. **Build for Production** - Run `npm run build:win` (or mac/linux)

---

## 💡 **Tips**

- Use keyboard shortcuts for fastest navigation
- All data is saved locally (pins, settings, etc.)
- Press F12 to open DevTools in development mode
- Map tiles load from internet - first load may be slow

---

## 🆘 **Need Help?**

Check the full README.md for detailed documentation!

**Happy exploring! 🌐**
