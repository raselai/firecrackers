
export const categories = [
  // Ground Effects (replacing Indoor Lights)
  {
    name: 'Sparklers',
    image: '/images/categories/sparklers.jpg',
    href: '/categories/sparklers',
    type: 'ground'
  },
  {
    name: 'Fountains',
    image: '/images/categories/fountains.jpg',
    href: '/categories/fountains',
    type: 'ground'
  },
  {
    name: 'Ground Spinners',
    image: '/images/categories/ground-spinners.jpg',
    href: '/categories/ground-spinners',
    type: 'ground'
  },
  {
    name: 'Wheels',
    image: '/images/categories/wheels.jpg',
    href: '/categories/wheels',
    type: 'ground'
  },
  // Aerial Effects (replacing Outdoor Lights)
  {
    name: 'Rockets',
    image: '/images/categories/rockets.jpg',
    href: '/categories/rockets',
    type: 'aerial'
  },
  {
    name: 'Roman Candles',
    image: '/images/categories/roman-candles.jpg',
    href: '/categories/roman-candles.jpg',
    type: 'aerial'
  },
  {
    name: 'Aerial Shells',
    image: '/images/categories/aerial-shells.jpg',
    href: '/categories/aerial-shells',
    type: 'aerial'
  },
  {
    name: 'Multi-Shot Cakes',
    image: '/images/categories/multi-shot-cakes.jpg',
    href: '/categories/multi-shot-cakes',
    type: 'aerial'
  },
];

export const groundCategories = categories.filter(cat => cat.type === 'ground');
export const aerialCategories = categories.filter(cat => cat.type === 'aerial');
