// =======================
// SNACKSCOUT - SHOPPING LIST TEMPLATES
// Pre-made student-friendly shopping lists
// =======================

const SHOPPING_LIST_TEMPLATES = [
  {
    id: 'tv-night',
    name: '📺 TV Night (Cheap & Cozy)',
    emoji: '📺',
    estimatedCost: { min: 9, max: 12 },
    items: [
      { name: 'Instant Ramen', quantity: '2-pack', category: 'snack' },
      { name: 'Shredded Cheese', quantity: '200g', category: 'dairy' },
      { name: 'Sausages', quantity: '6-pack', category: 'meat' },
      { name: 'Butter', quantity: '250g', category: 'dairy' },
      { name: 'Soft Drink', quantity: '1.25L', category: 'beverage' }
    ]
  },
  {
    id: 'study-grind',
    name: '📚 Study Grind Snacks',
    emoji: '📚',
    estimatedCost: { min: 7, max: 10 },
    items: [
      { name: 'Bananas', quantity: '6-pack', category: 'fruit' },
      { name: 'Trail Mix', quantity: '250g', category: 'snack' },
      { name: 'Dark Chocolate', quantity: '100g', category: 'snack' },
      { name: 'Instant Coffee', quantity: '10 sachets', category: 'beverage' }
    ]
  },
  {
    id: 'gym-protein',
    name: '💪 Gym / High-Protein Budget',
    emoji: '💪',
    estimatedCost: { min: 12, max: 15 },
    items: [
      { name: 'Eggs', quantity: '12-pack', category: 'dairy' },
      { name: 'Milk', quantity: '2L', category: 'dairy' },
      { name: 'Peanut Butter', quantity: '375g', category: 'spread' },
      { name: 'Frozen Chicken Strips', quantity: '500g', category: 'meat' }
    ]
  },
  {
    id: 'cheap-date',
    name: '💕 Cheap Date / Hangout',
    emoji: '💕',
    estimatedCost: { min: 10, max: 14 },
    items: [
      { name: 'Frozen Pizza', quantity: '400g', category: 'meal' },
      { name: 'Ice Cream', quantity: '1L tub', category: 'dessert' },
      { name: 'Sparkling Drink', quantity: '1.25L', category: 'beverage' },
      { name: 'Popcorn', quantity: '300g', category: 'snack' }
    ]
  },
  {
    id: 'late-night',
    name: '🕐 Late-Night Emergency Food',
    emoji: '🕐',
    estimatedCost: { min: 8, max: 11 },
    items: [
      { name: 'Bread', quantity: 'Loaf', category: 'bakery' },
      { name: 'Cheese Slices', quantity: '250g', category: 'dairy' },
      { name: 'Cup Noodles', quantity: '3-pack', category: 'snack' },
      { name: 'Cookies', quantity: '200g pack', category: 'snack' }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SHOPPING_LIST_TEMPLATES;
}