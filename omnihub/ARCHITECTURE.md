# 🏗️ OmniHub Navigation Engine - Architecture

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    OMNIHUB APPLICATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              USER INTERFACE LAYER                     │ │
│  │                                                       │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │  Header                                      │   │ │
│  │  │  • Logo                                      │   │ │
│  │  │  • Module Title (center)                     │   │ │
│  │  │  • Dropdown Selector (top-right) 📍         │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  │                                                       │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │  Navigation Bar                              │   │ │
│  │  │  [Map] [Notes] [Library] [Search] [...]     │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  │                                                       │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │  Module Container (iframe)                   │   │ │
│  │  │  • Map Module                                │   │ │
│  │  │  • Notes Module                              │   │ │
│  │  │  • Library Module                            │   │ │
│  │  │  • Search Module                             │   │ │
│  │  │  • Dashboard Module                          │   │ │
│  │  │  • Tracking Module                           │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  │                                                       │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │  Navigation Indicator (bottom center)        │   │ │
│  │  │  "← (Press Space)" / "→ Next" / "✓ Jumped"  │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────────────┘ │
│                           ↕                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              INPUT HANDLER LAYER                      │ │
│  │              (src/core/input.js)                      │ │
│  │                                                       │ │
│  │  Input Sources:                                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │ │
│  │  │ Keyboard │  │  Touch   │  │  Mouse   │          │ │
│  │  │ Arrow+Spc│  │  Swipe   │  │  Drag    │          │ │
│  │  │ Num Keys │  │          │  │          │          │ │
│  │  └─────┬────┘  └────┬─────┘  └────┬─────┘          │ │
│  │        └────────────┼─────────────┘                 │ │
│  │                     ↓                                │ │
│  │        ┌─────────────────────────┐                  │ │
│  │        │  Input Event Processing │                  │ │
│  │        │  • Detect key combos    │                  │ │
│  │        │  • Calculate swipe dir  │                  │ │
│  │        │  • Visual feedback      │                  │ │
│  │        └─────────────┬───────────┘                  │ │
│  └──────────────────────┼───────────────────────────────┘ │
│                         ↓                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         NAVIGATION CONTROLLER LAYER                   │ │
│  │         (src/core/navigation.js)                      │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────┐    │ │
│  │  │  Module Registry                            │    │ │
│  │  │  • Map (index 0)                            │    │ │
│  │  │  • Notes (index 1)                          │    │ │
│  │  │  • Library (index 2)                        │    │ │
│  │  │  • Search (index 3)                         │    │ │
│  │  │  • Dashboard (index 4)                      │    │ │
│  │  │  • Tracking (index 5)                       │    │ │
│  │  └─────────────────────────────────────────────┘    │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────┐    │ │
│  │  │  Navigation API                             │    │ │
│  │  │  • next()         → (index + 1) % 6         │    │ │
│  │  │  • previous()     → (index - 1 + 6) % 6     │    │ │
│  │  │  • jumpTo(id)     → direct jump             │    │ │
│  │  │  • getCurrent()   → current module info     │    │ │
│  │  └─────────────────────────────────────────────┘    │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────┐    │ │
│  │  │  Lifecycle Management                       │    │ │
│  │  │  • beforeNavigate event                     │    │ │
│  │  │  • onDeactivate(currentModule)              │    │ │
│  │  │  • Save module state                        │    │ │
│  │  │  • Load new module                          │    │ │
│  │  │  • onActivate(newModule)                    │    │ │
│  │  │  • Restore module state                     │    │ │
│  │  │  • afterNavigate event                      │    │ │
│  │  └─────────────────────────────────────────────┘    │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────┐    │ │
│  │  │  State Management                           │    │ │
│  │  │  • Current module                           │    │ │
│  │  │  • Current index                            │    │ │
│  │  │  • Transition status                        │    │ │
│  │  │  • Navigation history                       │    │ │
│  │  │  • Module states (Map)                      │    │ │
│  │  └─────────────────────────────────────────────┘    │ │
│  └───────────────────────┬───────────────────────────────┘ │
│                          ↓                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              RENDERER LAYER                           │ │
│  │              (src/renderer.js)                        │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────┐    │ │
│  │  │  Module Loading                             │    │ │
│  │  │  • Fetch module HTML                        │    │ │
│  │  │  • Create iframe                            │    │ │
│  │  │  • Inject HTML                              │    │ │
│  │  │  • Wait for load                            │    │ │
│  │  └─────────────────────────────────────────────┘    │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────┐    │ │
│  │  │  Transition Application                     │    │ │
│  │  │  • Remove old iframe with exit animation    │    │ │
│  │  │  • Add new iframe with enter animation      │    │ │
│  │  │  • Apply transition class:                  │    │ │
│  │  │    - transition-slide-in-right (next)       │    │ │
│  │  │    - transition-slide-in-left (prev)        │    │ │
│  │  │    - transition-fade-in (jump)              │    │ │
│  │  └─────────────────────────────────────────────┘    │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────┐    │ │
│  │  │  UI Updates                                 │    │ │
│  │  │  • Update module title                      │    │ │
│  │  │  • Highlight nav button                     │    │ │
│  │  │  • Update dropdown selector                 │    │ │
│  │  │  • Show/hide loading screen                 │    │ │
│  │  └─────────────────────────────────────────────┘    │ │
│  └───────────────────────┬───────────────────────────────┘ │
│                          ↓                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │          TRANSITION ENGINE LAYER                      │ │
│  │          (src/core/transitions.css)                   │ │
│  │                                                       │ │
│  │  Animation Types:                                    │ │
│  │  ┌──────────────────────────────────────────┐       │ │
│  │  │  Gradient Slide Animations               │       │ │
│  │  │  • gradientSlideInRight                  │       │ │
│  │  │    transform: translateX(100% → 0)       │       │ │
│  │  │    opacity: 0 → 1                        │       │ │
│  │  │    brightness: 0.7 → 1                   │       │ │
│  │  │                                           │       │ │
│  │  │  • gradientSlideInLeft                   │       │ │
│  │  │    transform: translateX(-100% → 0)      │       │ │
│  │  │    opacity: 0 → 1                        │       │ │
│  │  │    brightness: 0.7 → 1                   │       │ │
│  │  └──────────────────────────────────────────┘       │ │
│  │                                                       │ │
│  │  ┌──────────────────────────────────────────┐       │ │
│  │  │  Fade Animations                         │       │ │
│  │  │  • smoothFadeIn                          │       │ │
│  │  │    opacity: 0 → 1                        │       │ │
│  │  │    scale: 0.95 → 1                       │       │ │
│  │  │    blur: 10px → 0                        │       │ │
│  │  └──────────────────────────────────────────┘       │ │
│  │                                                       │ │
│  │  Performance Optimizations:                          │ │
│  │  • Hardware acceleration (translateZ)               │ │
│  │  • GPU hints (will-change)                          │ │
│  │  • Backface visibility hidden                       │ │
│  │  • Cubic-bezier easing                              │ │
│  │  • Reduced motion support                           │ │
│  └───────────────────────────────────────────────────────┘ │
│                           ↓                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              MODULE LAYER                             │ │
│  │                                                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │ │
│  │  │ Map Module  │  │Notes Module │  │Library Mod. │  │ │
│  │  │             │  │             │  │             │  │ │
│  │  │ Lifecycle:  │  │ Lifecycle:  │  │ Lifecycle:  │  │ │
│  │  │ • onActivate│  │ • onActivate│  │ • TBD       │  │ │
│  │  │ • onDeactiv.│  │ • onDeactiv.│  │ • TBD       │  │ │
│  │  │ • getState  │  │ • getState  │  │ • TBD       │  │ │
│  │  │ • restore   │  │ • restore   │  │ • TBD       │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │ │
│  │                                                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │ │
│  │  │Search Mod.  │  │Dashboard    │  │Tracking Mod.│  │ │
│  │  │             │  │             │  │             │  │ │
│  │  │ Lifecycle:  │  │ Lifecycle:  │  │ Lifecycle:  │  │ │
│  │  │ • TBD       │  │ • TBD       │  │ • TBD       │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Navigation Flow Sequence

### **Example: User navigates from Map to Notes using Arrow + Space**

```
TIME   COMPONENT           ACTION
════   ═════════════════   ══════════════════════════════════

t=0    User                Presses Right Arrow key
       ↓
t=10   InputHandler        Detects Arrow key
                           Sets lastKeyPressed = 'ArrowRight'
                           Shows indicator: "→ (Press Space)"
                           Starts 500ms timeout
       ↓
t=200  User                Presses Space key
       ↓
t=210  InputHandler        Detects Space key
                           Checks: lastKeyPressed === 'ArrowRight' ✓
                           Calls: navigationController.next()
                           Shows indicator: "→ Next"
       ↓
t=220  NavController       Emits: beforeNavigate event
                           Calculates: nextIndex = (0 + 1) % 6 = 1
                           Calls: mapModule.onDeactivate()
       ↓
t=230  Map Module          Saves pins to localStorage
                           Returns state: { center, zoom, layer }
       ↓
t=240  NavController       Saves state to Map
                           Sets: isTransitioning = true
                           Updates: currentIndex = 1
                           Updates: currentModule = 'notes'
       ↓
t=250  Renderer            Fetches: modules/notes/notes.html
                           Creates: new iframe element
                           Removes: old Map iframe
       ↓
t=260  Renderer            Applies: 'transition-slide-in-right' class
                           Shows: loading screen
       ↓
t=270  TransitionEngine    Starts: gradientSlideInRight animation
                           Duration: 500ms
                           Effects: translateX, opacity, brightness
       ↓
       │
       │  ┌─────────────────────────────────────┐
       │  │  Animation Timeline (500ms)         │
       │  │                                     │
       │  │  t=270: translateX(100%), opacity=0 │
       │  │  t=520: translateX(50%), opacity=0.5│
       │  │  t=770: translateX(0), opacity=1    │
       │  └─────────────────────────────────────┘
       │
       ↓
t=770  Renderer            Animation complete
                           Calls: navigationController.completeTransition()
       ↓
t=780  NavController       Sets: isTransitioning = false
                           Calls: notesModule.onActivate()
       ↓
t=790  Notes Module        Refreshes UI
                           Loads saved note state
       ↓
t=800  NavController       Emits: afterNavigate event
       ↓
t=810  Renderer            Updates: module title → "📝 Notes"
                           Highlights: Notes nav button
                           Updates: dropdown selector → "📝 Notes"
                           Hides: loading screen
       ↓
t=820  InputHandler        Hides: navigation indicator
       ↓
t=1000 Complete            Total navigation time: 780ms
                           (220ms processing + 500ms animation + 60ms UI)
```

---

## 📦 File Structure

```
omnihub/
├── main.js                    # Electron main process
├── preload.js                 # Electron preload script
├── package.json               # Dependencies
│
├── src/
│   ├── index.html            # Main UI container ✨ UPDATED
│   ├── renderer.js           # Renderer (refactored) ✨ UPDATED
│   │
│   ├── core/                 # 🆕 NEW DIRECTORY
│   │   ├── navigation.js     # Navigation controller (247 lines)
│   │   ├── input.js          # Input handler (267 lines)
│   │   ├── transitions.css   # Animation styles (242 lines)
│   │   └── README.md         # Documentation
│   │
│   ├── modules/
│   │   ├── map/
│   │   │   ├── map.html
│   │   │   ├── map.js        # ✨ UPDATED (lifecycle hooks added)
│   │   │   ├── map.css
│   │   │   └── config.js
│   │   │
│   │   ├── notes/
│   │   │   ├── notes.html
│   │   │   ├── notes.js      # ✨ UPDATED (lifecycle hooks added)
│   │   │   └── notes.css
│   │   │
│   │   ├── library/
│   │   ├── search/
│   │   ├── dashboard/
│   │   └── tracking/
│   │
│   └── styles/
│       └── global.css
│
├── NAVIGATION_ENGINE.md       # 🆕 Implementation guide
└── ARCHITECTURE.md            # 🆕 This file
```

**Stats:**
- **Total new code:** ~1,143 lines
  - navigation.js: 247 lines
  - input.js: 267 lines
  - transitions.css: 242 lines
  - renderer.js (refactored): 387 lines

---

## 🎯 Design Principles

### **1. Separation of Concerns**
- **Navigation logic** → `navigation.js`
- **Input handling** → `input.js`
- **Animations** → `transitions.css`
- **Module loading** → `renderer.js`
- **Module logic** → Individual module files

### **2. Event-Driven Architecture**
```javascript
// Navigation controller emits events
navigationController.on('beforeNavigate', callback);
navigationController.on('afterNavigate', callback);
navigationController.on('moduleActivate', callback);
navigationController.on('moduleDeactivate', callback);
```

### **3. Lifecycle Management**
Every module can define:
- `onActivate()` - Called when module becomes visible
- `onDeactivate()` - Called when leaving module
- `getState()` - Return state to preserve
- `restoreState(state)` - Restore previous state

### **4. Circular Navigation**
```javascript
// Next: (currentIndex + 1) % totalModules
0 (Map) → 1 (Notes) → 2 (Library) → 3 (Search) → 4 (Dashboard) → 5 (Tracking) → 0 (Map)

// Previous: (currentIndex - 1 + totalModules) % totalModules
5 (Tracking) ← 4 (Dashboard) ← 3 (Search) ← 2 (Library) ← 1 (Notes) ← 0 (Map) ← 5 (Tracking)
```

### **5. State Preservation**
```javascript
// On deactivate
const state = module.getState();
navigationController.moduleStates.set(moduleId, state);

// On activate
const state = navigationController.moduleStates.get(moduleId);
if (state) module.restoreState(state);
```

---

## 🚀 Performance Optimizations

### **1. Hardware Acceleration**
```css
.hw-accelerated {
  transform: translateZ(0);        /* Force GPU layer */
  backface-visibility: hidden;     /* Prevent flickering */
  perspective: 1000px;             /* Enable 3D transforms */
  will-change: transform, opacity; /* Hint browser */
}
```

### **2. Animation Performance**
- Use `transform` instead of `left/right` (GPU-accelerated)
- Use `opacity` instead of `visibility` (composited)
- Avoid animating `width`, `height`, `position`
- Use `cubic-bezier` for smooth easing

### **3. Module Loading**
- Fetch module HTML asynchronously
- Use iframes for isolation (prevents style conflicts)
- Load modules on-demand (not all at once)
- Cache module HTML in browser

### **4. State Management**
- Use Map for O(1) state lookups
- Limit history to 50 entries
- Save state only when changed
- Use localStorage for persistence

---

## 🧪 Testing Strategy

### **Unit Tests** (Future)
```javascript
// Test navigation controller
test('next() should increment index', () => {
  const nav = new NavigationController(MODULES);
  nav.next();
  expect(nav.getCurrentIndex()).toBe(1);
});

test('circular navigation works', () => {
  const nav = new NavigationController(MODULES);
  nav.currentIndex = 5;
  nav.next();
  expect(nav.getCurrentIndex()).toBe(0);
});
```

### **Integration Tests** (Future)
```javascript
// Test input handler with navigation controller
test('Arrow + Space triggers navigation', async () => {
  const nav = new NavigationController(MODULES);
  const input = new InputHandler(nav);
  
  input.handleKeyDown({ key: 'ArrowRight' });
  await sleep(100);
  input.handleKeyDown({ key: ' ' });
  
  expect(nav.getCurrentIndex()).toBe(1);
});
```

### **E2E Tests** (Manual)
- Navigate through all modules in sequence
- Test all input methods (keyboard, swipe, dropdown, number keys)
- Verify animations are smooth
- Check state preservation
- Test on different screen sizes

---

## 📈 Metrics

### **Code Complexity**
- **Navigation Controller:** Medium complexity
  - Manages state, lifecycle, events
  - ~250 lines, well-commented
  
- **Input Handler:** Low-medium complexity
  - Event handling, debouncing, feedback
  - ~270 lines, clear logic
  
- **Renderer:** Medium complexity
  - DOM manipulation, async loading, animations
  - ~390 lines, refactored from 370

### **Performance Targets**
- ✅ Navigation time: < 1 second
- ✅ Animation: 60fps (smooth)
- ✅ First load: < 2 seconds
- ✅ Memory: < 200MB

### **Maintainability**
- ✅ Modular architecture
- ✅ Clear separation of concerns
- ✅ Comprehensive documentation
- ✅ Consistent coding style
- ✅ Meaningful variable names

---

**Built with precision and care for seamless navigation** ✨
