import type { AcademyMode } from '../types'

export const brandName = 'PUBG Mastery'

export const benefits = [
  'Master recoil and spray patterns',
  'Learn rotations and zone play',
  'Drop spots and loot routes',
  'Squad comms and callouts',
]

export const faqs = [
  {
    question: 'Are these courses beginner-friendly?',
    answer:
      'Yes. The lessons start with the fundamentals and build up step by step, whether you are new to PUBG or already pushing high ranks.',
  },
  {
    question: 'Do I get lifetime access?',
    answer:
      'Each course is built for long-term learning, and access is managed through your account after purchase and approval.',
  },
  {
    question: 'How do payments work?',
    answer:
      'You place an order, follow the EFT instructions, upload proof of payment, and then the admin reviews it before access is granted.',
  },
  {
    question: 'Which platform is this for?',
    answer:
      'The fundamentals apply to PC, mobile, and console. Recoil, positioning, and rotations transfer across every version of the game.',
  },
]

export const heroImage =
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=80'

export const trainingImages = [
  'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&w=1200&q=85',
]

// Topics covered by the academy. Used for the scrolling marquee under the hero.
// These describe subject areas rather than making unverifiable claims.
export const featureTopics = [
  'Recoil control',
  'Rotations',
  'Zone timing',
  'Drop spots',
  'Loot routes',
  'Close-quarters fights',
  'Vehicle play',
  'Squad comms',
  'Late-game positioning',
]

// A small visual gallery. Every card is a training-area label, not a claim.
export const galleryImages = [
  {
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85',
    label: 'GUNPLAY LAB',
    caption: 'Recoil, sprays, and aim duels',
  },
  {
    url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=85',
    label: 'ZONE ROTATIONS',
    caption: 'Move early, arrive safe',
  },
  {
    url: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=1200&q=85',
    label: 'SQUAD PLAY',
    caption: 'Callouts, trades, and roles',
  },
  {
    url: 'https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&w=1200&q=85',
    label: 'MATCH ANALYSIS',
    caption: 'Turn every game into feedback',
  },
]

// Placeholder testimonials. Replace these with real student feedback later.
// They are intentionally worded as placeholders so nothing is invented.
export const placeholderTestimonials = [
  {
    quote: 'Placeholder review. Replace this with a real student testimonial once you start collecting feedback.',
    name: 'Placeholder student',
    tag: 'Recoil & Aim',
  },
  {
    quote: 'Placeholder review. This slot is reserved for your strongest player result or quote.',
    name: 'Placeholder student',
    tag: 'Zone Rotations',
  },
  {
    quote: 'Placeholder review. Swap in a short, specific story from a real customer here.',
    name: 'Placeholder student',
    tag: 'Match Analysis',
  },
]

export const academyModes: AcademyMode[] = [
  {
    id: 'mechanics',
    title: 'Gunplay lab',
    label: '01 / PRECISION',
    detail: 'Recoil, aim, movement',
    description: 'Learn every weapon spray pattern, control recoil at range, and win the first shot in a close fight. Short repeatable drills that keep your hands calm under pressure.',
    modules: ['Spray patterns', 'Crosshair placement', 'Movement and peeks', 'Aim duel drills'],
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'ranked',
    title: 'Zone rotations',
    label: '02 / POSITION',
    detail: 'Timing, routes, cover',
    description: 'Read the zone early, pick safe routes, and hold strong late-game positions so you are never caught running in the open.',
    modules: ['Zone reading', 'Route planning', 'Compound holds', 'Late-game circles'],
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'review',
    title: 'Match analysis',
    label: '03 / PROGRESS',
    detail: 'Replays, habits, wins',
    description: 'Turn your matches into a feedback loop. Review your deaths, spot repeating mistakes, and carry one clear adjustment into your next game.',
    modules: ['Death review', 'Mistake patterns', 'Habit tracking', 'Next-game plan'],
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85',
  },
]

export const emptyDashboardData = {
  name: '',
  email: '',
  totalOrders: 0,
  pendingOrders: 0,
  paymentStatus: 'No orders yet',
  myCourses: [],
  orders: [],
  lessons: [],
}

export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i