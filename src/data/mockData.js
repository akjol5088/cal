// Kyrgyzstan Main Regions
export const REGIONS = {
  Osh:         [40.5133, 72.8161],
  Bishkek:     [42.8746, 74.5698],
  ZhalalAbad:  [40.9333, 72.9833],
  Karakol:     [42.4782, 78.3956],
  Naryn:       [41.4287, 75.9911],
  Talas:       [42.5228, 72.2427],
  Batken:      [40.0625, 70.8194],
  CholponAta:  [42.6475, 77.0811],
  Uzgen:       [40.7667, 73.3000],
  Tokmok:      [42.8419, 75.3015]
};

export const CITY_CENTER = REGIONS.Osh;

export const initialFleet = [
  {
    id: 'eco-1', model: 'Hyundai Sonata', number: '045 OSH',
    tariff: 'economy', status: 'idle',
    pos: [40.514, 72.815], driver: 'Акжол М.', rating: 4.9, fuel: 85
  },
  {
    id: 'eco-2', model: 'Toyota Prius', number: '777 AGH',
    tariff: 'economy', status: 'idle',
    pos: [42.874, 74.569], driver: 'Ислам С.', rating: 4.7, fuel: 42
  },
  {
    id: 'comf-1', model: 'Toyota Camry', number: '101 OSH',
    tariff: 'comfort', status: 'idle',
    pos: [40.933, 72.983], driver: 'Бахтияр Н.', rating: 5.0, fuel: 95
  },
  {
    id: 'biz-1', model: 'Mercedes E-Class', number: '001 VIP',
    tariff: 'business', status: 'idle',
    pos: [42.478, 78.395], driver: 'Тимур Р.', rating: 5.0, fuel: 60
  },
  {
    id: 'eco-3', model: 'Chevrolet Cobalt', number: '112 OSH',
    tariff: 'economy', status: 'idle',
    pos: [41.428, 75.991], driver: 'Жаныбек Т.', rating: 4.6, fuel: 70
  },
  {
    id: 'comf-2', model: 'Kia Optima', number: '555 OSH',
    tariff: 'comfort', status: 'idle',
    pos: [40.062, 70.819], driver: 'Азиз Р.', rating: 4.8, fuel: 50
  },
  {
    id: 'biz-2', model: 'BWM 5 Series', number: '777 VIP',
    tariff: 'business', status: 'idle',
    pos: [42.522, 72.242], driver: 'Руслан Т.', rating: 5.0, fuel: 90
  }
];

export const TARIFFS = {
  economy: { base: 80, perKm: 18, color: '#22c55e' },
  comfort: { base: 200, perKm: 38, color: '#f59e0b' },
  business: { base: 500, perKm: 100, color: '#3b82f6' }
};
