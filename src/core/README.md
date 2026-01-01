# 🌐 OmniHub Core Navigation System

This directory contains the centralized navigation engine that powers OmniHub's cyclical module management.

---

## 📁 Files

### **navigation.js**
The heart of the navigation system. Manages module lifecycle, state, and transitions.

**Key Features:**
- Circular module arrangement (Map → Notes → Library → Search → Dashboard → Tracking → Map)
- Module lifecycle management (`onActivate`, `onDeactivate`)
- State preservation across navigation
- Navigation history tracking
- Event system for navigation events

**API:**
```javascript
navigationController.next()           // Navigate to next module
navigationController.previous()       // Navigate to previous module
navigationController.jumpTo(id)       // Jump directly to a module
navigationController.getCurrent()     // Get current module info
navigationController.getAllModules()  // Get all modules
```

---

### **input.js**
Handles all user input for navigation.

**Supported Inputs:**
1. **Arrow + Space** (Sequential)
   - Press Arrow Left or Right
   - Then press Space within 500ms
   - Navigates in the arrow direction

2. **Swipe Gestures**
   - Touch: Swipe left/right on touchscreen
   - Mouse: Click and drag left/right

3. **Dropdown Selector**
   - Top-right dropdown menu
   - Instant jump to any module

4. **Number Keys**
   - Press 1-6 for direct module access
   - 1=Map, 2=Notes, 3=Library, 4=Search, 5=Dashboard, 6=Tracking

**Visual Feedback:**
- Arrow key indicator shows "→ (Press Space)" or "← (Press Space)"
- Success feedback shows direction after navigation
- All animations are smooth and GPU-accelerated

---

### **transitions.css**
Advanced CSS animations for module transitions.

**Animation Types:**

1. **Gradient Slide** (for swipe navigation)
   - `gradientSlideInRight` - Slide in from right (next)
   - `gradientSlideInLeft` - Slide in from left (previous)
   - Includes opacity and brightness transitions for depth effect

2. **Smooth Fade** (for selector jumps)
   - `smoothFadeIn` - Fade in with scale and blur
   - `smoothFadeOut` - Fade out with scale and blur

**Performance:**
- Hardware-accelerated with `transform: translateZ(0)`
- GPU-optimized with `will-change` hints
- Respects `prefers-reduced-motion` for accessibility
- Smooth 60fps animations

---

## 🎯 How It Works

### **1. Initialization**
```javascript
// renderer.js
navigationController = new NavigationController(MODULES);
inputHandler = new InputHandler(navigationController);
inputHandler.init(moduleContainer);
```

### **2. Navigation Flow**
```
User Input (Arrow+Space/Swipe/Selector)
    ↓
InputHandler captures input
    ↓
NavigationController.navigateTo(index, direction)
    ↓
Emit 'beforeNavigate' event
    ↓
Deactivate current module (call onDeactivate hook)
    ↓
Load new module HTML
    ↓
Apply transition animation (gradient slide or fade)
    ↓
Activate new module (call onActivate hook)
    ↓
Emit 'afterNavigate' event
    ↓
Update UI (title, nav buttons, selector)
```

### **3. Module Lifecycle**
Each module can define lifecycle hooks:

```javascript
// In module file (e.g., map.js)
window.mapModule = {
  onActivate: () => {
    // Called when module becomes active
    console.log('Map activated');
    map.updateSize(); // Refresh map
  },
  
  onDeactivate: () => {
    // Called when leaving module
    console.log('Map deactivated');
    savePinsToStorage(); // Save state
  },
  
  getState: () => {
    // Return state to preserve
    return {
      center: map.getView().getCenter(),
      zoom: map.getView().getZoom()
    };
  },
  
  restoreState: (state) => {
    // Restore saved state
    map.getView().setCenter(state.center);
    map.getView().setZoom(state.zoom);
  }
};
```

---

## 🔧 Customization

### **Change Animation Speed**
Edit `transitions.css`:
```css
.transition-slide-in-right {
  animation-duration: 0.5s; /* Change this */
}
```

### **Change Key Combo Timeout**
Edit `input.js`:
```javascript
this.keyComboWindow = 500; // Change this (milliseconds)
```

### **Change Swipe Threshold**
Edit `input.js`:
```javascript
this.swipeThreshold = 100; // Change this (pixels)
```

### **Add Custom Animations**
Add to `transitions.css`:
```css
@keyframes myCustomAnimation {
  0% { /* start state */ }
  100% { /* end state */ }
}

.transition-my-custom {
  animation: myCustomAnimation 0.5s ease forwards;
}
```

Then use in `renderer.js`:
```javascript
element.classList.add('transition-my-custom');
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────┐
│           User Input Layer              │
│  (Keyboard, Mouse, Touch, Dropdown)     │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│         InputHandler (input.js)         │
│  - Captures all input events            │
│  - Translates to navigation commands    │
│  - Provides visual feedback             │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   NavigationController (navigation.js)  │
│  - Manages module lifecycle             │
│  - Tracks state and history             │
│  - Emits navigation events              │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│       Renderer (renderer.js)            │
│  - Loads module HTML                    │
│  - Applies transitions                  │
│  - Updates UI elements                  │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│    Transition Engine (transitions.css)  │
│  - Gradient slide animations            │
│  - Smooth fade transitions              │
│  - Hardware acceleration                │
└─────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### **Navigation not working?**
1. Check browser console for errors
2. Verify core files are loaded: `navigation.js`, `input.js`, `transitions.css`
3. Check that modules have correct lifecycle hooks

### **Animations stuttering?**
1. Ensure hardware acceleration is enabled
2. Check CPU/GPU usage
3. Reduce animation duration for slower devices

### **Arrow + Space not working?**
1. Check console for "Arrow → Space" initialization message
2. Verify 500ms timeout window
3. Try increasing `keyComboWindow` value

### **Module state not preserved?**
1. Implement `getState()` and `restoreState()` in module lifecycle hooks
2. Check that navigation controller is calling these methods
3. Verify state is being saved to Map

---

## 🚀 Future Enhancements

Potential improvements to the navigation system:

- [ ] Add touch gesture customization (pinch, rotate)
- [ ] Implement navigation undo/redo
- [ ] Add keyboard shortcut customization UI
- [ ] Support for dynamic module loading
- [ ] Animation presets (bouncy, smooth, instant)
- [ ] Navigation history visualization
- [ ] Module-specific transition overrides
- [ ] Gesture recording and playback
- [ ] Voice navigation support
- [ ] Accessibility improvements (screen reader support)

---

**Built with ❤️ for seamless navigation**
