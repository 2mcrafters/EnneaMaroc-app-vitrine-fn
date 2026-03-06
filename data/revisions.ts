export interface RevisionOption {
  type: 'Written' | 'Oral' | 'Both';
  day: string;
  time: string;
  price: number;
  instructorId: string;
  meetingLink?: string;
}

export interface RevisionModality {
  type: 'Online' | 'In-Person';
  options: RevisionOption[];
}

export interface Revision {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  modalities: RevisionModality[];
  durationMonths: number;
}

export const revisions: Revision[] = [
  {
    id: 'math-final-prep',
    title: 'Math Final Prep',
    shortDescription: 'Intensive review for your final math exams, covering calculus and algebra.',
    description: 'Get ready to ace your final math exams with our intensive prep course. We cover key topics from calculus and algebra, with a focus on problem-solving strategies and exam techniques. Led by experienced math tutors.',
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2070&auto=format&fit=crop',
    modalities: [
      {
        type: 'Online',
        options: [
          { type: 'Written', day: 'Mondays', time: '06:00 PM - 08:00 PM', price: 500, instructorId: 'alan-turing', meetingLink: 'https://meet.google.com/math-mon' },
          { type: 'Oral', day: 'Tuesdays', time: '07:00 PM - 08:00 PM', price: 400, instructorId: 'alan-turing', meetingLink: 'https://meet.google.com/math-tue' },
          { type: 'Written', day: 'Wednesdays', time: '06:00 PM - 08:00 PM', price: 500, instructorId: 'isaac-newton', meetingLink: 'https://meet.google.com/math-wed' },
        ],
      },
      {
        type: 'In-Person',
        options: [
          { type: 'Both', day: 'Saturdays', time: '10:00 AM - 01:00 PM', price: 750, instructorId: 'alan-turing' },
        ],
      },
    ],
    durationMonths: 2,
  },
    {
    id: 'physics-olympiad-training',
    title: 'Physics Olympiad Training',
    shortDescription: 'Advanced training for national and international physics competitions.',
    description: 'This elite training program is for students aiming to compete in physics olympiads. We will delve into advanced topics in mechanics, electromagnetism, and thermodynamics, with a heavy emphasis on complex problem-solving.',
    imageUrl: 'https://images.unsplash.com/photo-1532187643623-dbf263539a99?q=80&w=2070&auto=format&fit=crop',
    modalities: [
      {
        type: 'In-Person',
        options: [
          { type: 'Both', day: 'Sundays', time: '09:00 AM - 02:00 PM', price: 1200, instructorId: 'marie-curie' },
        ],
      },
      {
        type: 'Online',
        options: [
          { type: 'Both', day: 'Fridays', time: '05:00 PM - 08:00 PM', price: 1100, instructorId: 'isaac-newton', meetingLink: 'https://meet.google.com/physics-fri' },
        ],
      },
    ],
    durationMonths: 3,
  },
];