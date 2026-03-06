

import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../data/courses';
import { Revision } from '../data/revisions';
import { Instructor } from '../data/instructors';
import { UsersIcon } from '../components/icons/UsersIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';

interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string;
}

interface ScheduleEvent {
  id: string;
  title: string;
  day: string;
  time: string;
  startTimeMinutes: number;
  durationMinutes: number;
  instructorName: string;
  students: UserData[];
  itemType: 'course' | 'revision';
  itemId: string;
  type: string;
  group: any;
  meetingLink?: string;
  isCancelled: boolean;
  filterTypeKey: {
    category: 'course' | 'revision';
    modality: 'online' | 'in-person';
    type: 'written' | 'oral' | 'both' | 'n/a';
  };
}

const colorPalette = [
    { bg: 'bg-sky-50', border: 'border-sky-500', darkText: 'text-sky-600' },
    { bg: 'bg-violet-50', border: 'border-violet-500', darkText: 'text-violet-600' },
    { bg: 'bg-lime-50', border: 'border-lime-500', darkText: 'text-lime-600' },
    { bg: 'bg-amber-50', border: 'border-amber-500', darkText: 'text-amber-600' },
    { bg: 'bg-rose-50', border: 'border-rose-500', darkText: 'text-rose-600' },
    { bg: 'bg-teal-50', border: 'border-teal-500', darkText: 'text-teal-600' },
];

interface PositionedEvent extends ScheduleEvent {
    top: number;
    height: number;
    left: string;
    width: string;
    colorSet: typeof colorPalette[0];
}

interface User {
    firstName: string;
    lastName: string;
    email: string;
    id?: string;
}

interface Enrollment {
  userId: string;
  userName: string;
  itemId: string;
  itemType: 'course' | 'revision';
  status: string;
  group: any;
}

const parseTime = (timeStr: string): number => {
    const sanitizedTime = timeStr.trim().toUpperCase();
    const [time, modifier] = sanitizedTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    minutes = minutes || 0;
    
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0; // Midnight case
    
    return hours * 60 + minutes;
};

const parseTimeRange = (timeStr: string): { startTimeMinutes: number; durationMinutes: number } => {
    const timeParts = timeStr.split(' - ');
    if (timeParts.length < 2) { 
        const startTime = parseTime(timeParts[0]);
        return { startTimeMinutes: startTime, durationMinutes: 60 }; // Default to 1 hour if no end time
    }

    const startTime = parseTime(timeParts[0]);
    const endTime = parseTime(timeParts[1]);
    
    const duration = endTime > startTime ? endTime - startTime : (24 * 60 - startTime) + endTime;
    
    return { startTimeMinutes: startTime, durationMinutes: duration };
};

const generateSessionKey = (itemId: string, itemType: 'course' | 'revision', group: any, date: Date): string => {
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
  let groupIdentifier: string;
  if (itemType === 'course') {
    // IMPORTANT: group.day must be the specific day (e.g., "Mondays") not a composite ("Mondays & Wednesdays")
    groupIdentifier = `${group.day}-${group.time}`;
  } else { // revision
    groupIdentifier = `${group.modalityType}-${group.type}-${group.day}-${group.time}`;
  }
  const sanitizedIdentifier = groupIdentifier.replace(/[\s,:&]/g, '');
  return `${itemId}_${sanitizedIdentifier}_${dateString}`;
};


const EventCard: React.FC<{ event: ScheduleEvent; userRole: string | null; colorSet: typeof colorPalette[0]; onClick: () => void; isCancelled: boolean; }> = ({ event, userRole, colorSet, onClick, isCancelled }) => {
    
    if (isCancelled) {
        return (
            <button onClick={onClick} className="relative bg-red-100 border-l-4 border-red-500 text-red-900 p-2 rounded-md h-full overflow-hidden flex flex-col text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 ring-red-500 cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex-grow relative">
                    <p className="font-bold leading-tight line-through">{event.title}</p>
                    <p className="font-semibold text-red-700 mt-1 text-xs line-through">{event.type}</p>
                    <span className="mt-2 inline-block px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">CANCELLED</span>
                </div>
                
                <div className="mt-1 pt-1 border-t border-red-900/10 text-red-800/90 space-y-1 text-xs flex-shrink-0 relative line-through">
                    <p className="flex items-center gap-1"><ClockIcon className="w-3 h-3"/>{event.time}</p>
                    {(userRole === 'admin' || userRole === 'prof') && (
                        <>
                            <p><strong>Instr:</strong> {event.instructorName}</p>
                            <div className="flex items-start gap-1">
                                <UsersIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <div className="overflow-hidden">
                                    <strong>({event.students.length}):</strong> 
                                    <span className="italic"> {event.students.map(s => `${s.firstName[0]}. ${s.lastName}`).join(', ')}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </button>
        );
    }

    return (
        <button onClick={onClick} className={`relative ${colorSet.bg} border-l-4 ${colorSet.border} text-slate-800 p-2 rounded-md h-full overflow-hidden flex flex-col text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorSet.border}`}>
            <div className="flex-grow relative">
                <p className="font-bold text-slate-900 leading-tight">{event.title}</p>
                <p className={`font-semibold ${colorSet.darkText} mt-1 text-xs`}>{event.type}</p>
            </div>
            
            <div className="mt-1 pt-1 border-t border-slate-900/10 text-slate-600 space-y-1 text-xs flex-shrink-0 relative">
                <p className="flex items-center gap-1"><ClockIcon className="w-3 h-3"/>{event.time}</p>
                {(userRole === 'admin' || userRole === 'prof') && (
                    <>
                        <p><strong>Instr:</strong> {event.instructorName}</p>
                        <div className="flex items-start gap-1">
                            <UsersIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <div className="overflow-hidden">
                                <strong>({event.students.length}):</strong> 
                                <span className="italic"> {event.students.map(s => `${s.firstName[0]}. ${s.lastName}`).join(', ')}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </button>
    );
};

const calculateLayout = (events: ScheduleEvent[], startHour: number, hourHeight: number): PositionedEvent[] => {
    if (!events.length) return [];

    const sortedEvents = [...events].map(e => ({
        ...e,
        end: e.startTimeMinutes + e.durationMinutes,
    })).sort((a, b) => a.startTimeMinutes - b.startTimeMinutes || b.end - a.end);

    const laidOutEvents: PositionedEvent[] = [];

    let collisionGroups: (typeof sortedEvents)[] = [];
    if (sortedEvents.length > 0) {
        let currentGroup = [sortedEvents[0]];
        let maxEnd = sortedEvents[0].end;
        for (let i = 1; i < sortedEvents.length; i++) {
            const event = sortedEvents[i];
            if (event.startTimeMinutes < maxEnd) {
                currentGroup.push(event);
                maxEnd = Math.max(maxEnd, event.end);
            } else {
                collisionGroups.push(currentGroup);
                currentGroup = [event];
                maxEnd = event.end;
            }
        }
        collisionGroups.push(currentGroup);
    }
    
    for (const group of collisionGroups) {
        const columns: (typeof group)[] = [];
        for (const event of group) {
            let placed = false;
            for (const col of columns) {
                if (event.startTimeMinutes >= col[col.length - 1].end) {
                    col.push(event);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                columns.push([event]);
            }
        }

        const numCols = columns.length;
        for (let i = 0; i < numCols; i++) {
            for (const event of columns[i]) {
                laidOutEvents.push({
                    ...event,
                    top: ((event.startTimeMinutes - (startHour * 60)) / 60) * hourHeight,
                    height: (event.durationMinutes / 60) * hourHeight - 2,
                    left: `${(100 / numCols) * i}%`,
                    width: `${100 / numCols}%`,
                    colorSet: colorPalette[i % colorPalette.length]
                });
            }
        }
    }
    return laidOutEvents;
};


const SchedulePage: React.FC = () => {
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [title, setTitle] = useState('Schedule');
    const [positionedMobileEvents, setPositionedMobileEvents] = useState<PositionedEvent[]>([]);
    const [positionedDesktopEvents, setPositionedDesktopEvents] = useState<{[key: string]: PositionedEvent[]}>({});
    const [modalEventDetails, setModalEventDetails] = useState<(ScheduleEvent & { date: Date }) | null>(null);
    const [currentMobileDayIndex, setCurrentMobileDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
    const [cancellations, setCancellations] = useState<Set<string>>(new Set());
    
    // Filter State
    const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
    const [showCurrentOnly, setShowCurrentOnly] = useState(false);
    const [instructorFilter, setInstructorFilter] = useState('');
    const [typeFilters, setTypeFilters] = useState<string[]>([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
    const typeFilterRef = useRef<HTMLDivElement>(null);

    // Link Modal State
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [selectedEventForLink, setSelectedEventForLink] = useState<(ScheduleEvent & { date: Date }) | null>(null);
    const [currentLink, setCurrentLink] = useState('');


    const weekDays = ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'];
    const START_HOUR = 8;
    const END_HOUR = 20;
    const HOUR_HEIGHT_MOBILE = 80;
    const HOUR_HEIGHT_DESKTOP = 60;

    const loadData = () => {
        const role = localStorage.getItem('userRole');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(role);
        setCurrentUser(user);

        if (role === 'admin') setTitle('Full Company Schedule');
        else if (role === 'prof') setTitle('My Teaching Schedule');
        else setTitle('My Class Schedule');

        const cancelledSessions = JSON.parse(localStorage.getItem('session_cancellations') || '[]');
        setCancellations(new Set(cancelledSessions));

        const allCourses: Course[] = JSON.parse(localStorage.getItem('courses') || '[]');
        const allRevisions: Revision[] = JSON.parse(localStorage.getItem('revisions') || '[]');
        const allInstructors: Instructor[] = JSON.parse(localStorage.getItem('profs') || '[]');
        const allEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const allUsers: UserData[] = JSON.parse(localStorage.getItem('users') || '[]');

        setAllInstructors(allInstructors);

        let processedEvents: Omit<ScheduleEvent, 'isCancelled'>[] = [];
        
        allCourses.forEach(course => {
            course.groups.forEach(group => {
                if (group.day.toLowerCase() === 'self-paced') return;
                
                const instructor = allInstructors.find(i => i.id === group.instructorId);
                const enrollmentUserIds = allEnrollments
                    .filter(e => e.itemId === course.id && e.itemType === 'course' && e.status === 'Active' && e.group.day === group.day && e.group.time === group.time)
                    .map(e => e.userId);
                const enrolledStudentUsers = allUsers.filter(u => enrollmentUserIds.includes(u.email));
                
                const days = group.day.split(/, | & /);
                const { startTimeMinutes, durationMinutes } = parseTimeRange(group.time);

                days.forEach(day => {
                    const specificDay = day.endsWith('s') ? day : `${day}s`;
                    processedEvents.push({
                        id: `${course.id}-${day}-${group.time}`,
                        title: course.title,
                        day: specificDay,
                        time: group.time,
                        startTimeMinutes,
                        durationMinutes,
                        instructorName: instructor?.name || 'N/A',
                        students: enrolledStudentUsers,
                        itemType: 'course',
                        itemId: course.id,
                        group: { ...group, day: specificDay }, // BUG FIX: Use specific day for group key generation
                        type: `${course.type === 'in-person' ? 'In-Person' : 'Online'} Course`,
                        meetingLink: group.meetingLink,
                        filterTypeKey: {
                            category: 'course',
                            modality: course.type,
                            type: 'n/a',
                        },
                    });
                });
            });
        });

        allRevisions.forEach(revision => {
            revision.modalities.forEach(modality => {
                modality.options.forEach(option => {
                    const instructor = allInstructors.find(i => i.id === option.instructorId);
                    const enrollmentUserIds = allEnrollments
                        .filter(e => e.itemId === revision.id && e.itemType === 'revision' && e.status === 'Active' && e.group.day === option.day && e.group.time === option.time)
                        .map(e => e.userId);
                    const enrolledStudentUsers = allUsers.filter(u => enrollmentUserIds.includes(u.email));
                    
                     const days = option.day.split(/, | & /);
                     const { startTimeMinutes, durationMinutes } = parseTimeRange(option.time);

                     days.forEach(day => {
                        const specificDay = day.endsWith('s') ? day : `${day}s`;
                        processedEvents.push({
                            id: `${revision.id}-${day}-${option.time}`,
                            title: revision.title,
                            day: specificDay,
                            time: option.time,
                            startTimeMinutes,
                            durationMinutes,
                            instructorName: instructor?.name || 'N/A',
                            students: enrolledStudentUsers,
                            itemType: 'revision',
                            itemId: revision.id,
                            group: { modalityType: modality.type, ...option, day: specificDay }, // BUG FIX: Use specific day for group key generation
                            type: `${modality.type} Revision (${option.type})`,
                            meetingLink: option.meetingLink,
                            filterTypeKey: {
                                category: 'revision',
                                modality: modality.type.toLowerCase() as 'online' | 'in-person',
                                type: option.type.toLowerCase() as 'written' | 'oral' | 'both',
                            },
                        });
                    });
                });
            });
        });

        let finalEvents: Omit<ScheduleEvent, 'isCancelled'>[] = [];
        if (role === 'admin') {
            finalEvents = processedEvents;
        } else if (role === 'prof') {
            finalEvents = processedEvents.filter(event => {
                 const instructor = allInstructors.find(i => i.name === event.instructorName);
                 return instructor?.id === user.id;
            });
        } else if (role === 'student') {
            finalEvents = processedEvents.filter(event => event.students.some(s => s.email === user.email));
        }

        setEvents(finalEvents.map(e => ({...e, isCancelled: false}))); // isCancelled is checked dynamically
    }

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (typeFilterRef.current && !typeFilterRef.current.contains(event.target as Node)) {
                setIsTypeFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [typeFilterRef]);

    const getFilteredEvents = () => {
        let filtered = [...events];
        
        if (showCurrentOnly) {
            const now = new Date();
            const currentDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
            const currentDayName = weekDays[currentDayIndex];
            const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
            
            filtered = filtered.filter(event => 
                event.day === currentDayName &&
                currentTimeMinutes >= event.startTimeMinutes &&
                currentTimeMinutes < (event.startTimeMinutes + event.durationMinutes)
            );
        }
        
        if (instructorFilter) {
            filtered = filtered.filter(event => event.instructorName === instructorFilter);
        }

        if (typeFilters.length > 0) {
             filtered = filtered.filter(event => {
                return typeFilters.some(filter => {
                    const { category, modality, type } = event.filterTypeKey;
                    switch (filter) {
                        case 'course-online':
                            return category === 'course' && modality === 'online';
                        case 'course-in-person':
                            return category === 'course' && modality === 'in-person';
                        case 'revision-online':
                            return category === 'revision' && modality === 'online';
                        case 'revision-in-person':
                            return category === 'revision' && modality === 'in-person';
                        case 'revision-both':
                            return category === 'revision' && type === 'both';
                        default:
                            return false;
                    }
                });
            });
        }

        if (studentSearch) {
            const searchLower = studentSearch.toLowerCase();
            filtered = filtered.filter(event => 
                event.students.some(student => 
                    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchLower)
                )
            );
        }

        return filtered;
    };
    
    const displayedEvents = getFilteredEvents();

    useEffect(() => {
        const mobileDay = weekDays[currentMobileDayIndex];
        const eventsForDay = displayedEvents.filter(e => e.day === mobileDay);
        const positioned = calculateLayout(eventsForDay, START_HOUR, HOUR_HEIGHT_MOBILE);
        setPositionedMobileEvents(positioned);
    }, [displayedEvents, currentMobileDayIndex]);

    useEffect(() => {
        const layoutByDay: {[key: string]: PositionedEvent[]} = {};
        for (const day of weekDays) {
            const eventsForDay = displayedEvents.filter(e => e.day === day);
            layoutByDay[day] = calculateLayout(eventsForDay, START_HOUR, HOUR_HEIGHT_DESKTOP);
        }
        setPositionedDesktopEvents(layoutByDay);
    }, [displayedEvents]);

    const handleEventClick = (event: ScheduleEvent, day: string) => {
        const today = new Date();
        const dayIndex = today.getDay(); // 0=Sun
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayIndex === 0 ? 6 : dayIndex - 1));
        
        const eventDate = new Date(monday);
        eventDate.setDate(monday.getDate() + weekDays.indexOf(day));

        const sessionKey = generateSessionKey(event.itemId, event.itemType, event.group, eventDate);
        const overrides = JSON.parse(localStorage.getItem('session_link_overrides') || '{}');
        const finalLink = overrides[sessionKey] || event.meetingLink;
        
        setModalEventDetails({ 
            ...event, 
            meetingLink: finalLink, 
            date: eventDate,
            isCancelled: cancellations.has(sessionKey)
        });
    };

    const handleSessionCancelToggle = () => {
        if (!modalEventDetails?.date) return;
        const key = generateSessionKey(modalEventDetails.itemId, modalEventDetails.itemType, modalEventDetails.group, modalEventDetails.date);
    
        const isCurrentlyCancelled = cancellations.has(key);
        const message = isCurrentlyCancelled
            ? 'Are you sure you want to reinstate this session?'
            : 'Are you sure you want to cancel this session for this date?';
    
        if (window.confirm(message)) {
            const newCancellations = new Set(cancellations);
            if (isCurrentlyCancelled) {
                newCancellations.delete(key);
            } else {
                newCancellations.add(key);
            }
            localStorage.setItem('session_cancellations', JSON.stringify(Array.from(newCancellations)));
            setCancellations(newCancellations);
            
            // Instead of closing the modal, update its state to reflect the change.
            setModalEventDetails(prevDetails => {
                if (!prevDetails) return null;
                return {
                    ...prevDetails,
                    isCancelled: !isCurrentlyCancelled,
                };
            });
        }
    };


    const openLinkEditor = () => {
        if (!modalEventDetails || !modalEventDetails.date) return;
        setSelectedEventForLink({ ...modalEventDetails, date: modalEventDetails.date });
        setCurrentLink(modalEventDetails.meetingLink || '');
        setIsLinkModalOpen(true);
    };

    const handleSaveLink = () => {
        if (!selectedEventForLink) return;
        
        const sessionKey = generateSessionKey(selectedEventForLink.itemId, selectedEventForLink.itemType, selectedEventForLink.group, selectedEventForLink.date);
        const overrides = JSON.parse(localStorage.getItem('session_link_overrides') || '{}');
        
        if (currentLink.trim()) {
            overrides[sessionKey] = currentLink.trim();
        } else {
            delete overrides[sessionKey]; // Remove override if link is cleared
        }
        
        localStorage.setItem('session_link_overrides', JSON.stringify(overrides));
        
        // Close modals and reload data to reflect the change everywhere
        setIsLinkModalOpen(false);
        setModalEventDetails(null);
        setSelectedEventForLink(null);
        setCurrentLink('');
        loadData(); 
    };

    const timeLabels = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => {
        const hour = START_HOUR + i;
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        const ampm = hour >= 12 && hour < 24 ? 'PM' : 'AM';
        return { time: `${displayHour}:00 ${ampm}`, hour24: hour };
    });

    const handleResetFilters = () => {
        setInstructorFilter('');
        setTypeFilters([]);
        setStudentSearch('');
        setShowCurrentOnly(false);
    };

    const handleTypeFilterChange = (filterKey: string) => {
        setTypeFilters(prev => 
            prev.includes(filterKey) 
                ? prev.filter(f => f !== filterKey) 
                : [...prev, filterKey]
        );
    };

    const filterGroups = {
        'Course': {
            'course-online': 'Online',
            'course-in-person': 'In-Person',
        },
        'Revision': {
            'revision-online': 'Online',
            'revision-in-person': 'In-Person',
            'revision-both': 'Both (Written & Oral)',
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 text-center">{title}</h1>
            
            {(userRole === 'admin' || userRole === 'prof') ? (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Student Name</label>
                            <input
                                type="text"
                                placeholder="e.g., John Doe"
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Instructor</label>
                            <select
                                value={instructorFilter}
                                onChange={(e) => setInstructorFilter(e.target.value)}
                                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                            >
                                <option value="">All Instructors</option>
                                {allInstructors.map(prof => (
                                    <option key={prof.id} value={prof.name}>{prof.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative" ref={typeFilterRef}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Session Type</label>
                            <button
                                type="button"
                                onClick={() => setIsTypeFilterOpen(!isTypeFilterOpen)}
                                className="flex items-center justify-between w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                            >
                                <span className="truncate">
                                    {typeFilters.length === 0 ? 'All Types' : `${typeFilters.length} selected`}
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            {isTypeFilterOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-300 rounded-md shadow-lg p-2" style={{ zIndex: 100 }}>
                                    {Object.entries(filterGroups).map(([groupName, options]) => (
                                        <div key={groupName}>
                                            <h4 className="px-2 pt-2 pb-1 text-xs font-bold text-slate-500 uppercase">{groupName}</h4>
                                            {Object.entries(options).map(([key, label]) => (
                                                 <label key={key} className="flex items-center space-x-3 p-2 hover:bg-slate-50 cursor-pointer rounded-md">
                                                    <input
                                                        type="checkbox"
                                                        checked={typeFilters.includes(key)}
                                                        onChange={() => handleTypeFilterChange(key)}
                                                        className="h-4 w-4 rounded border-gray-300 text-pistachio-dark focus:ring-pistachio-dark"
                                                    />
                                                    <span className="text-sm font-medium text-slate-700">{label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={showCurrentOnly} onChange={() => setShowCurrentOnly(!showCurrentOnly)} className="h-4 w-4 rounded border-gray-300 text-pistachio-dark focus:ring-pistachio-dark" />
                            <span className="text-slate-600 font-medium text-sm">Show current events only</span>
                        </label>
                        <button onClick={handleResetFilters} className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-200 rounded-full hover:bg-slate-300">
                            Reset Filters
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex justify-center items-center mb-8">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={showCurrentOnly} onChange={() => setShowCurrentOnly(!showCurrentOnly)} className="h-4 w-4 rounded border-gray-300 text-pistachio-dark focus:ring-pistachio-dark" />
                        <span className="text-slate-600 font-medium">Show current events only</span>
                    </label>
                </div>
            )}

            {/* Desktop View */}
            <div className="hidden md:block bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="flex" style={{ minWidth: '800px' }}>
                        <div className="w-20 flex-shrink-0">
                            <div className="h-16 border-b border-slate-200"></div>
                            {timeLabels.map(({time}) => (
                                <div key={time} style={{ height: `${HOUR_HEIGHT_DESKTOP}px` }} className="relative -top-3.5 flex justify-end">
                                    <span className="text-xs text-slate-500 pr-2">{time}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex-grow grid grid-cols-7">
                            {weekDays.map((day, dayIndex) => {
                                const today = new Date();
                                const currentDayOfWeek = today.getDay();
                                const monday = new Date(today);
                                monday.setDate(today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));
                                const columnDate = new Date(monday);
                                columnDate.setDate(monday.getDate() + dayIndex);

                                return (
                                <div key={day} className="relative border-l border-slate-200">
                                    <div className="h-16 border-b border-slate-200 text-center font-bold text-slate-800 flex items-center justify-center sticky top-0 bg-white z-10">{day.slice(0,-1)}</div>
                                    <div className="h-full">
                                        {timeLabels.map((_, index) => (
                                            <div key={index} style={{ height: `${HOUR_HEIGHT_DESKTOP}px` }} className="border-b border-slate-200"></div>
                                        ))}
                                        {(positionedDesktopEvents[day] || []).map(event => {
                                            const sessionKey = generateSessionKey(event.itemId, event.itemType, event.group, columnDate);
                                            const isCancelled = cancellations.has(sessionKey);
                                            return (
                                            <div key={event.id} className="absolute" style={{ 
                                                top: `${event.top + 64}px`, 
                                                height: `${event.height}px`, 
                                                left: event.left, 
                                                width: event.width, 
                                                padding: '0 4px'
                                            }}>
                                               <EventCard event={event} userRole={userRole} colorSet={event.colorSet} onClick={() => handleEventClick(event, day)} isCancelled={isCancelled} />
                                            </div>
                                        )})}
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile View (Single Day Timeline) */}
            <div className="md:hidden">
                <div className="flex justify-between items-center mb-4 px-2">
                    <button onClick={() => setCurrentMobileDayIndex((prev) => (prev - 1 + 7) % 7)} className="p-2 rounded-full hover:bg-slate-100"><ChevronLeftIcon className="w-6 h-6 text-slate-600" /></button>
                    <h2 className="text-xl font-bold text-slate-800">{weekDays[currentMobileDayIndex]}</h2>
                    <button onClick={() => setCurrentMobileDayIndex((prev) => (prev + 1) % 7)} className="p-2 rounded-full hover:bg-slate-100"><ChevronRightIcon className="w-6 h-6 text-slate-600" /></button>
                </div>

                <div className="relative bg-white p-4 rounded-xl shadow-lg border border-slate-200" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT_MOBILE + 40}px` }}>
                    {/* Hour markers and grid lines */}
                    {timeLabels.map(({ time, hour24 }) => (
                        <div key={time} className="absolute w-full" style={{ top: `${(hour24 - START_HOUR) * HOUR_HEIGHT_MOBILE + 40}px` }}>
                            <div className="absolute -left-2 transform -translate-y-1/2">
                                <span className="text-xs text-slate-400">{time}</span>
                            </div>
                            <div className="border-t border-slate-200" style={{ marginLeft: '50px' }}></div>
                        </div>
                    ))}
                    
                    {/* Events container */}
                    <div className="absolute" style={{ top: '40px', bottom: '0', left: '70px', right: '0' }}>
                        {positionedMobileEvents.map(event => {
                            const today = new Date();
                            const currentDayOfWeek = today.getDay();
                            const monday = new Date(today);
                            monday.setDate(today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));
                            const eventDate = new Date(monday);
                            eventDate.setDate(monday.getDate() + currentMobileDayIndex);
                            const sessionKey = generateSessionKey(event.itemId, event.itemType, event.group, eventDate);
                            const isCancelled = cancellations.has(sessionKey);

                            return (
                            <div 
                                key={event.id}
                                className="absolute pr-1"
                                style={{
                                    top: `${event.top}px`,
                                    height: `${event.height}px`,
                                    left: event.left,
                                    width: event.width
                                }}
                            >
                               <EventCard event={event} userRole={userRole} colorSet={event.colorSet} onClick={() => handleEventClick(event, weekDays[currentMobileDayIndex])} isCancelled={isCancelled} />
                            </div>
                        )})}
                    </div>

                     {positionedMobileEvents.length === 0 && <p className="text-center text-slate-500 pt-16">No events scheduled for {weekDays[currentMobileDayIndex]}.</p>}
                </div>
            </div>

            {/* Event Detail Modal */}
            {modalEventDetails && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in" 
                    style={{ animationDuration: '0.3s' }}
                    onClick={() => setModalEventDetails(null)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 p-6 animate-slide-up" 
                        style={{ animationDuration: '0.4s' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="pb-4 border-b border-slate-200">
                             {modalEventDetails.isCancelled && <p className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full inline-block mb-3">THIS SESSION IS CANCELLED</p>}
                            <h3 className="text-2xl font-bold text-slate-900">{modalEventDetails.title}</h3>
                            <p className="text-pistachio-dark font-semibold mt-1">{modalEventDetails.type}</p>
                        </div>

                        <div className="my-4 text-slate-700 space-y-2">
                            <p><strong>Date:</strong> {modalEventDetails.date.toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {modalEventDetails.time}</p>
                            <p><strong>Instructor:</strong> {modalEventDetails.instructorName}</p>
                        </div>

                        {modalEventDetails.meetingLink && !modalEventDetails.isCancelled && (
                            <div className="my-4">
                                <a
                                    href={modalEventDetails.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center px-6 py-3 font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 transition-colors"
                                >
                                    Join Session
                                </a>
                            </div>
                        )}
                        
                        {(userRole === 'admin') && modalEventDetails.filterTypeKey.modality === 'online' && (
                             <div className="my-4">
                                <button
                                    onClick={openLinkEditor}
                                    className="block w-full text-center px-6 py-3 font-semibold text-pistachio-dark bg-pistachio-light rounded-full hover:bg-lime-200 transition-colors"
                                >
                                    Add/Edit Session Link
                                </button>
                            </div>
                        )}
                         {userRole === 'admin' && modalEventDetails.date && (
                            <div className="my-4">
                                <button
                                    onClick={handleSessionCancelToggle}
                                    className={`w-full px-6 py-3 font-semibold text-white rounded-full transition-colors ${modalEventDetails.isCancelled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    {modalEventDetails.isCancelled ? 'Reinstate Session' : 'Cancel Session'}
                                </button>
                            </div>
                        )}

                        <div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">Enrolled Students ({modalEventDetails.students.length})</h4>
                            {modalEventDetails.students.length > 0 ? (
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                    {modalEventDetails.students.map(student => (
                                        <div key={student.email} className="flex items-center gap-3 p-2 bg-slate-50 rounded-md">
                                            <img src={student.profilePicture} alt={`${student.firstName} ${student.lastName}`} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <p className="font-semibold text-slate-800">{student.firstName} {student.lastName}</p>
                                                <p className="text-xs text-slate-500">{student.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">No students are enrolled in this session.</p>
                            )}
                        </div>

                        <div className="mt-6 text-right">
                           <button 
                                onClick={() => setModalEventDetails(null)} 
                                className="px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
                            >
                                Close
                           </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Link Editor Modal */}
            {isLinkModalOpen && selectedEventForLink && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] animate-fade-in" 
                    style={{ animationDuration: '0.2s' }}
                    onClick={() => setIsLinkModalOpen(false)}
                >
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Session Link</h3>
                        <p className="text-sm text-slate-600 mb-6">For {selectedEventForLink.title} on {selectedEventForLink.date.toLocaleDateString()}</p>
                        <div>
                            <label htmlFor="meetingLink" className="block text-sm font-medium text-slate-700 mb-1">Meeting URL</label>
                            <input
                                type="url"
                                id="meetingLink"
                                value={currentLink}
                                onChange={(e) => setCurrentLink(e.target.value)}
                                placeholder="https://meet.google.com/..."
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-pistachio-dark"
                            />
                            <p className="text-xs text-slate-500 mt-1">Leave blank to remove the daily override.</p>
                        </div>
                        <div className="flex justify-end gap-4 pt-6">
                            <button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full">Cancel</button>
                            <button type="button" onClick={handleSaveLink} className="px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full">Save Link</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SchedulePage;