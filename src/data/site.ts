import type { AcademyMode } from '../types'

export const benefits = [
  'Structured coaching paths',
  'Practical in-game drills',
  'Clear improvement roadmap',
  'Built for competitive players',
]

export const faqs = [
  {
    question: 'Are these courses beginner-friendly?',
    answer:
      'Yes. The lessons are designed to help players improve step by step, whether they are new to competitive gaming or already ranked.',
  },
  {
    question: 'Do I get lifetime access?',
    answer:
      'Each course is designed for long-term learning, and access is managed through your account after purchase and approval.',
  },
  {
    question: 'How do payments work?',
    answer:
      'You place an order, follow the EFT instructions, upload proof of payment, and then the admin reviews it before access is granted.',
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
  'Aim systems',
  'Game sense',
  'Ranked psychology',
  'Review frameworks',
  'Movement tech',
  'Utility play',
  'Clutch routines',
  'Team comms',
]

// A small visual gallery. Every card is a training-area label, not a claim.
export const galleryImages = [
  {
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85',
    label: 'AIM LAB',
    caption: 'Precision and reaction drills',
  },
  {
    url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=85',
    label: 'RANKED ROOM',
    caption: 'Decision making under pressure',
  },
  {
    url: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=1200&q=85',
    label: 'REVIEW SUITE',
    caption: 'Turn matches into feedback',
  },
  {
    url: 'https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&w=1200&q=85',
    label: 'PERFORMANCE',
    caption: 'Build habits that hold up',
  },
]

// Placeholder testimonials. Replace these with real student feedback later.
// They are intentionally worded as placeholders so nothing is invented.
export const placeholderTestimonials = [
  {
    quote: 'Placeholder review. Replace this with a real student testimonial once you start collecting feedback.',
    name: 'Placeholder student',
    tag: 'Aim Masterclass',
  },
  {
    quote: 'Placeholder review. This slot is reserved for your strongest player result or quote.',
    name: 'Placeholder student',
    tag: 'Ranked Room',
  },
  {
    quote: 'Placeholder review. Swap in a short, specific story from a real customer here.',
    name: 'Placeholder student',
    tag: 'Review Suite',
  },
]

export const academyModes: AcademyMode[] = [
  {
    id: 'mechanics',
    title: 'Mechanics lab',
    label: '01 / PRECISION',
    detail: 'Aim, movement, timing',
    description: 'Build reliable mechanics through short, repeatable drills that sharpen your first move and keep your hands calm under pressure.',
    modules: ['Warm-up calibration', 'Target acquisition', 'Movement and counter-strafing', 'Reaction review'],
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'ranked',
    title: 'Ranked room',
    label: '02 / DECISION',
    detail: 'Pressure, reads, rhythm',
    description: 'Learn how to slow the game down, read the round, and make higher-quality decisions when every choice affects the result.',
    modules: ['Round reading', 'Risk and reward', 'Pressure routines', 'Communication habits'],
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'review',
    title: 'Review suite',
    label: '03 / PROGRESS',
    detail: 'Breakdowns, habits, wins',
    description: 'Turn your matches into a feedback loop with practical review systems that show what to repeat, remove, and improve next.',
    modules: ['Match breakdowns', 'Habit tracking', 'Mistake patterns', 'Next-session planning'],
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