# 🌍 GLOBE MODULE TROUBLESHOOTING GUIDE

## 🚨 Problem: Globe Module Not Loading

### Common Symptoms
- ✗ Blank screen when accessing Globe module
- ✗ Infinite loading spinner
- ✗ Canvas never appears
- ✗ No errors shown (or errors in console)

---

## 🔍 DIAGNOSTIC STEPS

### Step 1: Test in Isolation

Open the standalone test file to verify Globe works independently:

```bash
# Option 1: Open directly in browser
open /app/omnihub/src/modules/globe/test-globe.html

# Option 2: Use a simple HTTP server
cd /app/omnihub/src/modules/globe
python3 -m http.server 8888
# Then visit: http://localhost:8888/test-globe.html
```

**Expected Result:** Globe should render with status messages

**If test fails:** Issue is with Globe libraries or WebGL
**If test succeeds:** Issue is with OmniHub integration

---

### Step 2: Check Browser Console

1. Start OmniHub:
   ```bash
   cd /app/omnihub
   npm start
   ```

2. Navigate to Globe module (press `2` or click dropdown → Globe)

3. Open DevTools:
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

4. Check Console tab for errors:

**Look for these specific errors:**

```
❌ Missing dependencies: ['THREE', 'Globe', 'd3']
→ FIX: CDN scripts failed to load (see Step 3)

❌ Globe container not found
→ FIX: HTML structure issue (see Step 4)

❌ Container has zero dimensions
→ FIX: CSS sizing issue (see Step 5)

❌ WebGL not supported
→ FIX: Browser/GPU issue (see Step 6)
```

---

### Step 3: Fix CDN Loading Issues

**Problem:** Scripts from unpkg.com failing to load

**Solution A - Check Internet Connection:**
```bash
# Test CDN connectivity
curl -I https://unpkg.com/three@0.182.0/build/three.min.js
curl -I https://unpkg.com/globe.gl@2.45.0/dist/globe.gl.min.js
```

**Solution B - Use Local Copies:**

Download libraries locally:
```bash
cd /app/omnihub/src/modules/globe

# Create libs directory
mkdir -p libs

# Download Three.js
curl -o libs/three.min.js https://unpkg.com/three@0.182.0/build/three.min.js

# Download globe.gl
curl -o libs/globe.gl.min.js https://unpkg.com/globe.gl@2.45.0/dist/globe.gl.min.js

# Download D3
curl -o libs/d3.min.js https://unpkg.com/d3@7.9.0/dist/d3.min.js
```

Then update `globe.html`:
```html
<!-- Change from -->
<script src="https://unpkg.com/three@0.182.0/build/three.min.js"></script>

<!-- To -->
<script src="libs/three.min.js"></script>
```

---

### Step 4: Fix Container Issues

**Problem:** Globe container not rendering

**Check HTML structure:**
```bash
cat /app/omnihub/src/modules/globe/globe.html | grep "globe-container"
```

**Should see:**
```html
<div id="globe-container">
  <!-- Globe renders here -->
</div>
```

**Fix:** Ensure container exists and has ID `globe-container`

---

### Step 5: Fix CSS Sizing Issues

**Problem:** Container has zero width/height

**Check current CSS:**
```bash
cat /app/omnihub/src/modules/globe/globe.css | grep -A 10 "globe-container"
```

**Required CSS:**
```css
#globe-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  overflow: hidden;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
```

**Apply fix:**
Already applied in latest version of globe.css

---

### Step 6: Check WebGL Support

**Problem:** Browser doesn't support WebGL

**Test WebGL:**
```bash
# Visit in browser:
chrome://gpu
# or
about:gpu
```

**Look for:**
- WebGL: Hardware accelerated
- WebGL2: Hardware accelerated

**If disabled:**

1. **Update GPU drivers**
2. **Enable hardware acceleration:**
   - Chrome: `chrome://settings` → Advanced → System → "Use hardware acceleration"
   - Firefox: `about:preferences` → Performance → "Use hardware acceleration"

3. **Force enable WebGL:**
   - Chrome: `chrome://flags/#ignore-gpu-blocklist` → Enabled

---

## 🛠️ QUICK FIXES

### Fix 1: Force Reload Module

```javascript
// In DevTools Console
window.location.reload()
```

### Fix 2: Clear LocalStorage

```javascript
// In DevTools Console
localStorage.clear()
window.location.reload()
```

### Fix 3: Reset Globe State

```javascript
// In DevTools Console
localStorage.removeItem('omnihub_globe_state')
window.location.reload()
```

### Fix 4: Restart OmniHub

```bash
# Kill any running instances
pkill -f electron

# Start fresh
cd /app/omnihub
npm start
```

---

## 🔧 ADVANCED DEBUGGING

### Enable Verbose Logging

Add to `globe.js` at the top:

```javascript
window.DEBUG_GLOBE = true;
console.log('🐛 Globe Debug Mode Enabled');
```

### Check All Dependencies

Run in DevTools Console:

```javascript
console.table({
  'THREE': typeof THREE !== 'undefined',
  'Globe': typeof Globe !== 'undefined',
  'd3': typeof d3 !== 'undefined',
  'globeState': typeof window.globeState !== 'undefined',
  'GlobeData': typeof window.GlobeData !== 'undefined',
  'FlightLayer': typeof window.FlightLayer !== 'undefined',
  'ShippingLayer': typeof window.ShippingLayer !== 'undefined',
  'OceanLayer': typeof window.OceanLayer !== 'undefined'
});
```

### Monitor Network Requests

1. Open DevTools → Network tab
2. Reload Globe module
3. Check for failed requests (red status)
4. Look for:
   - `three.min.js` - Should be 200
   - `globe.gl.min.js` - Should be 200
   - `d3.min.js` - Should be 200
   - Earth texture images - Should be 200

---

## 📊 KNOWN ISSUES & SOLUTIONS

### Issue 1: Globe Loads But Is Invisible

**Cause:** Z-index conflict with OmniHub panels

**Fix:**
```css
/* In globe.css */
#globe-container {
  z-index: 1 !important;
}

.glass-panel {
  z-index: 10 !important;
}
```

### Issue 2: Globe Stops Rendering After Module Switch

**Cause:** Animation loop not properly paused/resumed

**Fix:** Already implemented in lifecycle hooks:
```javascript
window.globeModule = {
  onActivate: () => {
    // Resume rendering
    globeInstance.width(window.innerWidth);
    globeInstance.height(window.innerHeight);
  },
  onDeactivate: () => {
    // Pause rendering
    // Globe.gl automatically pauses when not visible
  }
};
```

### Issue 3: Slow Performance / Low FPS

**Causes:**
- Too many data points
- GPU not being used
- Other heavy processes running

**Fixes:**

1. **Reduce layer complexity:**
```javascript
// In layers/*.js files
// Reduce number of routes/points
```

2. **Enable GPU acceleration** (see Step 6)

3. **Close other applications**

4. **Reduce globe quality:**
```javascript
// In globe.js
globeInstance
  .pointOfView({ altitude: 2.5 }) // Higher = better performance
```

### Issue 4: Module Not Appearing in Dropdown

**Cause:** Not registered in renderer.js

**Check:**
```bash
grep -A 10 "const MODULES" /app/omnihub/src/renderer.js | grep globe
```

**Should see:**
```javascript
{ id: 'globe', name: 'Globe', icon: '🌍', path: './modules/globe/globe.html' }
```

**If missing:** Already fixed in latest version

---

## 🎯 VALIDATION CHECKLIST

After fixes, verify:

- [ ] Test file (`test-globe.html`) works standalone
- [ ] No errors in browser console
- [ ] Globe renders within 2 seconds
- [ ] Can rotate and zoom globe
- [ ] Panels are visible and clickable
- [ ] Search box works
- [ ] Pins can be placed and saved
- [ ] Layer toggles work
- [ ] Module switch preserves state

---

## 🆘 STILL NOT WORKING?

### Collect Debug Info:

Run in DevTools Console:

```javascript
console.log({
  'Browser': navigator.userAgent,
  'Window Size': { width: window.innerWidth, height: window.innerHeight },
  'Container Size': {
    width: document.getElementById('globe-container')?.offsetWidth,
    height: document.getElementById('globe-container')?.offsetHeight
  },
  'WebGL': !!document.createElement('canvas').getContext('webgl'),
  'Dependencies': {
    THREE: typeof THREE,
    Globe: typeof Globe,
    d3: typeof d3
  },
  'Globe State': window.globeState?.get(),
  'Globe Instance': !!globeInstance
});
```

Copy output and include in bug report.

---

## 📞 SUPPORT RESOURCES

- **OmniHub Documentation:** `/app/omnihub/README.md`
- **Globe Module README:** `/app/omnihub/src/modules/globe/README.md`
- **Navigation Engine:** `/app/omnihub/NAVIGATION_ENGINE.md`

- **globe.gl Issues:** https://github.com/vasturiano/globe.gl/issues
- **Three.js Docs:** https://threejs.org/docs/
- **WebGL Troubleshooting:** https://get.webgl.org/

---

## 🎉 SUCCESS!

If Globe is now working:

1. **Test all features** (see README.md)
2. **Save your work** (pins are saved automatically)
3. **Explore the world!** 🌍

---

**Last Updated:** 2025
**Module Version:** V1.0
**Status:** Production Ready (with fixes applied)
