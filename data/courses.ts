export interface CourseGroup {
  day: string;
  time: string;
  price: number;
  instructorId: string;
  meetingLink?: string;
}

export interface Course {
  id: string;
  type: 'in-person' | 'online';
  title: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  groups: CourseGroup[];
  durationMonths: number;
  sessionsPerMonth: number;
}

export const courses: Course[] = [
  {
    id: 'web-development-bootcamp',
    type: 'in-person',
    title: 'Web Development Bootcamp',
    shortDescription: 'A comprehensive bootcamp covering front-end and back-end technologies.',
    description: 'This course is a comprehensive introduction to web development, covering everything from the basics of HTML, CSS, and JavaScript to advanced topics like React, Node.js, and databases. You will learn to build dynamic, responsive, and interactive web applications from scratch.',
    imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop',
    groups: [
      { day: 'Mondays & Wednesdays', time: '10:00 AM - 12:00 PM', price: 2500, instructorId: 'evelyn-reed' },
      { day: 'Tuesdays & Thursdays', time: '02:00 PM - 04:00 PM', price: 2500, instructorId: 'samuel-chen' },
      { day: 'Saturdays', time: '09:00 AM - 01:00 PM', price: 2600, instructorId: 'aisha-khan' },
    ],
    durationMonths: 6,
    sessionsPerMonth: 8,
  },
  {
    id: 'data-science-immersive',
    type: 'in-person',
    title: 'Data Science Immersive',
    shortDescription: 'Dive deep into data analysis, machine learning, and Python programming.',
    description: 'Our Data Science Immersive program is designed to transform you into a job-ready data scientist. Through a project-based curriculum, you will master Python, SQL, machine learning algorithms, and data visualization techniques.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
    groups: [
      { day: 'Full-Time Mon-Fri', time: '09:00 AM - 05:00 PM', price: 5000, instructorId: 'aisha-khan' },
      { day: 'Tuesdays & Thursdays', time: '06:00 PM - 09:00 PM', price: 4800, instructorId: 'evelyn-reed' },
    ],
    durationMonths: 4,
    sessionsPerMonth: 40,
  },
  {
    id: 'ux-design-fundamentals',
    type: 'online',
    title: 'UX Design Fundamentals',
    shortDescription: 'Learn the principles of user experience design from anywhere in the world.',
    description: 'This online course provides a solid foundation in UX design. You will learn about user research, wireframing, prototyping, and usability testing. By the end, you will have a portfolio-ready project to showcase your skills.',
    imageUrl: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?q=80&w=2071&auto=format&fit=crop',
    groups: [
      { day: 'Self-paced', time: 'Flexible', price: 800, instructorId: 'leo-martinez', meetingLink: 'https://meet.google.com/ux-self-paced' },
      { day: 'Tuesdays', time: '06:00 PM - 08:00 PM', price: 950, instructorId: 'sophia-nguyen', meetingLink: 'https://meet.google.com/ux-tuesdays' },
      { day: 'Wednesdays', time: '10:00 AM - 12:00 PM', price: 950, instructorId: 'leo-martinez', meetingLink: 'https://meet.google.com/ux-wednesdays' },
      { day: 'Thursdays', time: '03:00 PM - 05:00 PM', price: 950, instructorId: 'sophia-nguyen', meetingLink: 'https://meet.google.com/live-test' },
    ],
    durationMonths: 3,
    sessionsPerMonth: 4,
  },
  {
    id: 'digital-marketing-masterclass',
    type: 'online',
    title: 'Digital Marketing Masterclass',
    shortDescription: 'Master SEO, content marketing, and social media strategy to grow businesses.',
    description: 'Our Digital Marketing Masterclass covers all essential channels, from SEO and PPC to social media and email marketing. Learn from industry experts and gain practical skills through real-world case studies and hands-on projects.',
    imageUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=2071&auto=format&fit=crop',
    groups: [
        { day: 'Saturdays', time: '11:00 AM - 03:00 PM', price: 1200, instructorId: 'david-carter', meetingLink: 'https://meet.google.com/dmm-saturdays' },
        { day: 'Fridays', time: '09:00 AM - 01:00 PM', price: 1250, instructorId: 'samuel-chen', meetingLink: 'https://meet.google.com/dmm-fridays' },
    ],
    durationMonths: 3,
    sessionsPerMonth: 4,
  }
];