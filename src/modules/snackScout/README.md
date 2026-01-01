# 🍿 SnackScout Module

**Smart snacks, cheap eats, zero stress**

## Overview
SnackScout is a student-focused food & snack discovery module for OmniHub. It helps users quickly find snacks, meals, and budget food options, compare prices, locate nearby stores, and build shopping lists.

## Features

### ✅ Implemented
- 🔍 **Smart Food Search** - Search by name, category, meal type, and diet
- 🖼️ **Image-First UI** - Every item has a visual thumbnail from Unsplash
- 💰 **Price Comparison** - Compare prices across Woolworths, Coles, IGA, Aldi, 7-Eleven, Foodland
- 📍 **Store Locator** - Find nearest stores by suburb/street with map integration
- 🛒 **Shopping Cart** - Add items, adjust quantities, track budget
- 📋 **Pre-Made Lists** - 5 student templates (TV Night, Study Grind, Gym, Date Night, Late-Night)
- 📤 **Export Lists** - Export as text or CSV
- 💾 **Offline Storage** - Cart persists via localStorage
- 🎯 **Budget Tracking** - See total cost, servings, and cost per serving

### 📊 Food Database
- **35+ food items** with realistic Australian prices
- Categories: Snacks, Dairy, Meat, Fruits, Beverages, Meals, Bakery
- Diet filters: Vegetarian, Vegan, High-Protein, Halal
- Tags: Cheap, Study, Gym, Quick, Healthy, Party, Late-Night

### 🏪 Store Database
- **16 store locations** across Sydney & Adelaide
- Real suburbs and streets
- Distance calculation and walking time estimates
- Map integration ready

## File Structure

```
snackScout/
├── snackScout.html        # Main UI
├── snackScout.css         # Glassmorphism styling
├── snackScout.js          # Core controller
├── foodSearch.js          # Food database & search engine
├── pricingEngine.js       # Price comparison logic
├── cartState.js           # Shopping cart with localStorage
├── listTemplates.js       # Pre-made shopping lists
├── imageLoader.js         # Unsplash image loader
├── locationFinder.js      # Store location finder
└── README.md              # This file
```

## Usage

### Basic Search
1. Use the search bar to find food items
2. Apply filters: Type, Diet, Tags, Budget
3. View prices across different stores
4. Click "Add to Cart" to add items

### Shopping Lists
1. Click "📋 Lists" to view templates
2. Select a template to auto-load items
3. Templates include: TV Night, Study Grind, Gym, Date Night, Late-Night

### Store Finder
1. Click "📍 Stores" to find nearby stores
2. Search by suburb, street, or store name
3. Click a store to open in Map module

### Cart Management
- Adjust quantities with +/- buttons
- Remove items with ✕ button
- View total cost and servings
- Export as text or CSV

### Meal Mode
- Click "🍽️ Meal Mode" to group items by meal type
- Helps plan daily meals

## Integration with OmniHub

### Map Integration
Clicking a store in the Store Finder will:
1. Store location data in `OmniHub.setModuleData('snackScout_mapTarget', {...})`
2. Navigate to Map module
3. Map module can read the data and show the store location

### Future Integration (Notes Module)
- Export shopping lists directly to Notes
- Save favorite lists
- Share lists with friends

## Data Sources

### Images
- **Unsplash Direct URLs** - No API key needed
- Format: `https://source.unsplash.com/800x600/?food,{searchTerm}`
- Fallback images for each category

### Prices
- Realistic Australian supermarket prices (2025)
- Based on typical student shopping baskets
- Updated for inflation

### Stores
- Real suburbs and streets in Sydney & Adelaide
- GPS coordinates included
- Can be extended to other cities

## Customization

### Add New Food Items
Edit `foodSearch.js` and add to `foodDatabase`:
```javascript
{
  id: 'unique-id',
  name: 'Food Name',
  quantity: '500g',
  category: 'snack',
  type: 'snack',
  servings: 4,
  calories: 200,
  tags: ['cheap', 'quick'],
  dietType: ['vegetarian']
}
```

### Add Prices
Edit `pricingEngine.js` and add to `storePricing`:
```javascript
'unique-id': {
  'Woolworths': 5.00,
  'Coles': 4.90,
  'Aldi': 4.50
}
```

### Add Stores
Edit `locationFinder.js` and add to `stores` array:
```javascript
{
  id: 'store-id',
  name: 'Store Name',
  suburb: 'Suburb',
  street: 'Street Name',
  coords: [lat, lon]
}
```

## Technical Details

### Offline-First
- All food data stored in JavaScript
- Cart persists via localStorage
- Images cached by browser
- Works without internet (using cached data)

### Performance
- Lazy image loading
- Efficient search algorithms
- Minimal DOM manipulation
- Smooth animations (60fps)

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript
- CSS Grid & Flexbox

## Student-Focused Design

### Budget Presets
- Under $10 filter
- Under $20 filter
- Cost per serving calculator

### Meal Planning
- Sample lists for different occasions
- Calorie information
- Serving size estimates

### Price Awareness
- Cheapest store highlighted in green
- Price comparison visible upfront
- Best time to buy hints

## Future Enhancements

### Phase 2
- [ ] Barcode scanning (mobile)
- [ ] Weekly sales detection
- [ ] AI snack suggestions
- [ ] Recipe integration
- [ ] Meal prep calculator

### Phase 3
- [ ] Real-time price updates (API)
- [ ] Store inventory checking
- [ ] Delivery integration
- [ ] Social sharing
- [ ] Group shopping lists

## Testing

### Manual Testing Checklist
- [ ] Search functionality
- [ ] Filter combinations
- [ ] Add to cart
- [ ] Quantity adjustment
- [ ] Remove from cart
- [ ] Clear cart
- [ ] Load templates
- [ ] Store search
- [ ] Map integration
- [ ] Export cart
- [ ] LocalStorage persistence

### Browser Console
Check for errors: `F12 → Console`

### Test in OmniHub
1. Open OmniHub Electron app
2. Navigate to SnackScout from dropdown
3. Test all features

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all files are loaded
3. Check localStorage quota
4. Test in different browsers

## Credits

- **Food Images**: Unsplash
- **Store Data**: Australian supermarkets
- **Design**: OmniHub glassmorphism theme

---

**Built with ❤️ for students on a budget** 🎓💰
