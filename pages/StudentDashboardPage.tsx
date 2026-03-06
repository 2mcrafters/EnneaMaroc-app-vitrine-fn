

import React, { useState, useEffect } from 'react';
import { Course } from '../data/courses';
import { Revision } from '../data/revisions';
import { ClockIcon } from '../components/icons/ClockIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { CalendarDaysIcon } from '../components/icons/CalendarDaysIcon';

// Interfaces
interface User {
    firstName: string;
    lastName: string;
    email: string;
    hasPaidRegistrationFee?: boolean;
}

interface Payment {
  date: string;
  amount: number;
  proof: string | null;
  status: 'Confirmed' | 'Pending Confirmation';
  month: number;
}

interface Enrollment {
  id: string;
  itemId: string;
  itemType: 'course' | 'revision';
  group: any; // Generic group
  status: 'Pending Payment' | 'Pending Confirmation' | 'Active' | 'Cancelled';
  enrolledDate: string;
  userId: string;
  payments?: Payment[];
  durationMonths: number;
}

interface UpcomingSessionInfo {
    title: string;
    day: string;
    time: string;
    type: string;
    status: 'current' | 'next';
    meetingLink?: string;
    isCancelled?: boolean;
}

interface TodayScheduleItem extends UpcomingSessionInfo {
    startTimeMinutes: number;
}

const generateSessionKey = (itemId: string, itemType: 'course' | 'revision', group: any, date: Date): string => {
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
  let groupIdentifier: string;
  if (itemType === 'course') {
    groupIdentifier = `${group.day}-${group.time}`;
  } else { // revision
    groupIdentifier = `${group.modalityType}-${group.type}-${group.day}-${group.time}`;
  }
  const sanitizedIdentifier = groupIdentifier.replace(/[\s,:&]/g, '');
  return `${itemId}_${sanitizedIdentifier}_${dateString}`;
};

const StudentDashboardPage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [upcomingSession, setUpcomingSession] = useState<UpcomingSessionInfo | null>(null);
    const [todaysSchedule, setTodaysSchedule] = useState<TodayScheduleItem[]>([]);
    const [stats, setStats] = useState({ active: 0, pending: 0 });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);

        const allEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const userEnrollments = allEnrollments.filter(e => e.userId === storedUser.email);
        setEnrollments(userEnrollments);

        const activeEnrollments = userEnrollments.filter(e => e.status === 'Active');
        const pendingPayments = userEnrollments.reduce((acc, en) => {
            if (en.status === 'Pending Payment') return acc + 1;
            const hasPendingMonthly = en.payments?.some(p => p.status === 'Pending Confirmation') ?? false;
            if (en.status === 'Active' && hasPendingMonthly) return acc + 1;
            if (en.status === 'Pending Confirmation') return acc + 1;
            return acc;
        }, 0);

        setStats({ active: activeEnrollments.length, pending: pendingPayments });
        
        const courses = JSON.parse(localStorage.getItem('courses') || '[]');
        const revisions = JSON.parse(localStorage.getItem('revisions') || '[]');
        const sessionLinkOverrides = JSON.parse(localStorage.getItem('session_link_overrides') || '{}');
        // FIX: Explicitly type the Set as Set<string> to match the function signature.
        const sessionCancellations = new Set<string>(JSON.parse(localStorage.getItem('session_cancellations') || '[]'));

        findUpcomingSession(activeEnrollments, courses, revisions, sessionLinkOverrides, sessionCancellations);

    }, []);

    const findUpcomingSession = (
        activeEnrollments: Enrollment[], 
        courses: Course[], 
        revisions: Revision[], 
        linkOverrides: Record<string, string>,
        cancellations: Set<string>
    ) => {
      const weekDays = ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'];
      const now = new Date();
      const currentDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

      const parseTime = (timeStr: string): number => {
          const sanitizedTime = timeStr.trim().toUpperCase();
          const [time, modifier] = sanitizedTime.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          minutes = minutes || 0;
          if (modifier === 'PM' && hours < 12) hours += 12;
          if (modifier === 'AM' && hours === 12) hours = 0;
          return hours * 60 + minutes;
      };
      
      let allUserSessions: (UpcomingSessionInfo & { startTimeMinutes: number; dayIndex: number; date: Date, itemId: string, itemType: 'course' | 'revision', group: any })[] = [];

      activeEnrollments.forEach(en => {
          const item = en.itemType === 'course' ? courses.find(c => c.id === en.itemId) : revisions.find(r => r.id === en.itemId);
          if (!item) return;

          const processGroup = (group: any, title: string, type: string, itemType: 'course' | 'revision', itemId: string) => {
              if (group.day.toLowerCase() === 'self-paced') return;
              const days = group.day.split(/, | & /);
              const [startTimeStr] = group.time.split(' - ');
              const startTimeMinutes = parseTime(startTimeStr);
              
              days.forEach(day => {
                  const dayStr = day.endsWith('s') ? day : `${day}s`;
                  const dayIndex = weekDays.indexOf(dayStr);
                  if (dayIndex > -1) {
                      const sessionDate = new Date(now);
                      const dayDiff = dayIndex - currentDayIndex;
                      sessionDate.setDate(now.getDate() + dayDiff);
                      if (dayDiff < 0 || (dayDiff === 0 && startTimeMinutes < currentTimeMinutes)) {
                          sessionDate.setDate(sessionDate.getDate() + 7);
                      }
                      
                      const groupForKey = { ...group, day: dayStr };
                      const sessionKey = generateSessionKey(itemId, itemType, groupForKey, sessionDate);
                      const isCancelled = cancellations.has(sessionKey);

                      allUserSessions.push({
                          title, type, day: dayStr, time: group.time,
                          status: 'next',
                          meetingLink: group.meetingLink,
                          startTimeMinutes,
                          dayIndex,
                          date: sessionDate,
                          itemId,
                          itemType,
                          group: groupForKey,
                          isCancelled
                      });
                  }
              });
          };
          
          if (en.itemType === 'course') {
              const itemDetails = item as Course;
              processGroup(en.group, itemDetails.title, itemDetails.type === 'online' ? 'Online Course' : 'In-Person Course', 'course', itemDetails.id);
          } else {
              const itemDetails = item as Revision;
              processGroup(en.group, itemDetails.title, `${en.group.modalityType} Revision`, 'revision', itemDetails.id);
          }
      });
      
      const todaysSessions = allUserSessions
            .filter(s => s.dayIndex === currentDayIndex)
            .sort((a,b) => a.startTimeMinutes - b.startTimeMinutes);

        setTodaysSchedule(todaysSessions.map(s => {
            const sessionKey = generateSessionKey(s.itemId, s.itemType, s.group, s.date);
            const finalLink = linkOverrides[sessionKey] || s.meetingLink;
            return { ...s, meetingLink: finalLink };
        }));

      let currentSession: UpcomingSessionInfo | null = null;
      let nextSession: (UpcomingSessionInfo & { sortKey: number }) | null = null;
      
      for (const session of allUserSessions) {
          if (session.isCancelled) continue; // Skip cancelled sessions for main display

          const [startTimeStr, endTimeStr] = session.time.split(' - ');
          const startTimeMinutes = parseTime(startTimeStr);
          const endTimeMinutes = endTimeStr ? parseTime(endTimeStr) : startTimeMinutes + 60;

          const sessionKey = generateSessionKey(session.itemId, session.itemType, session.group, session.date);
          const finalLink = linkOverrides[sessionKey] || session.meetingLink;
          
          if (session.dayIndex === currentDayIndex && currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes) {
              currentSession = { ...session, status: 'current', meetingLink: finalLink };
              break; 
          }

          let sortKey = session.date.getTime() + session.startTimeMinutes;
          
          if (!nextSession || sortKey < nextSession.sortKey) {
              nextSession = { ...session, status: 'next', sortKey, meetingLink: finalLink };
          }
      }
      
      setUpcomingSession(currentSession || nextSession);
    };

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        window.location.hash = path;
    };
    
    const getItemDetails = (itemId: string, itemType: 'course' | 'revision'): Course | Revision | undefined => {
        const items = itemType === 'course' 
            ? JSON.parse(localStorage.getItem('courses') || '[]') 
            : JSON.parse(localStorage.getItem('revisions') || '[]');
        return items.find((i: any) => i.id === itemId);
    };

    if (!user) {
        return <div className="text-center py-20">Loading dashboard...</div>;
    }

    const activeEnrollments = enrollments.filter(e => e.status === 'Active');

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">Welcome, {user.firstName}!</h1>
                    <p className="text-lg text-slate-600">Here's a summary of your activities.</p>
                </div>

                {upcomingSession ? (
                     <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border-2 border-pistachio-DEFAULT">
                        <div className="flex items-center gap-3 mb-2">
                            {upcomingSession.status === 'current' && <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
                            <h2 className="text-xl font-bold text-slate-800">{upcomingSession.status === 'current' ? "In Progress:" : "Up Next:"} {upcomingSession.title}</h2>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="text-slate-600">{upcomingSession.type}</p>
                                <p className="font-semibold text-slate-800 flex items-center gap-2 mt-1">
                                    <ClockIcon className="w-5 h-5 text-slate-400"/>
                                    {upcomingSession.day}, {upcomingSession.time}
                                </p>
                            </div>
                            {upcomingSession.meetingLink && (
                                <a 
                                    href={upcomingSession.meetingLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto text-center px-6 py-3 font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    Join Session
                                </a>
                            )}
                        </div>
                    </div>
                ) : (
                    !todaysSchedule.some(s => !s.isCancelled) && (
                         <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
                           <h2 className="text-xl font-bold text-slate-800">No upcoming sessions</h2>
                           <p className="text-slate-600 mt-1">Check back later or view your full schedule.</p>
                         </div>
                    )
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                     <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <CalendarDaysIcon className="w-6 h-6 text-slate-500" />
                            <h2 className="text-2xl font-bold text-slate-800">Today's Schedule</h2>
                        </div>
                        {todaysSchedule.length > 0 ? (
                           <div className="space-y-3">
                                {todaysSchedule.map((item, index) => (
                                    <div key={index} className={`p-3 rounded-lg ${item.isCancelled ? 'bg-red-50' : 'bg-slate-50'}`}>
                                        <p className={`font-semibold text-slate-800 ${item.isCancelled ? 'line-through' : ''}`}>{item.title}</p>
                                        <p className={`text-sm text-slate-500 ${item.isCancelled ? 'line-through' : ''}`}>{item.time}</p>
                                        {item.isCancelled && <p className="text-xs font-bold text-red-600 mt-1">CANCELLED</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 py-4">No sessions scheduled for today.</p>
                        )}
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
                            <CheckCircleIcon className="w-10 h-10 text-green-500"/>
                            <div>
                                <p className="text-3xl font-bold">{stats.active}</p>
                                <p className="text-sm text-slate-600">Active Enrollments</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
                            <ClockIcon className="w-10 h-10 text-yellow-500"/>
                            <div>
                                <p className="text-3xl font-bold">{stats.pending}</p>
                                <p className="text-sm text-slate-600">Pending Payments</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Active Enrollments</h2>
                        <a href="#/my-courses" onClick={(e) => handleNav(e, '#/my-courses')} className="text-sm font-semibold text-pistachio-dark hover:text-lime-800">
                            View All &rarr;
                        </a>
                    </div>
                    
                    {activeEnrollments.length > 0 ? (
                        <div className="space-y-4">
                            {activeEnrollments.map(enrollment => {
                                const item = getItemDetails(enrollment.itemId, enrollment.itemType);
                                if (!item) return null;

                                const confirmedPaymentsCount = enrollment.payments?.filter(p => p.status === 'Confirmed').length || 0;
                                const progressPercentage = enrollment.durationMonths > 0 ? (confirmedPaymentsCount / enrollment.durationMonths) * 100 : 0;

                                return (
                                    <div key={enrollment.id} className="p-4 bg-slate-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-slate-800">{item.title}</h3>
                                            <span className="text-xs font-semibold text-slate-600">{confirmedPaymentsCount}/{enrollment.durationMonths} Months Paid</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 py-4">You have no active enrollments.</p>
                    )}
                    
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <a href="#/monthly-payments" onClick={(e) => handleNav(e, '#/monthly-payments')} className="w-full block text-center px-5 py-3 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 transition-colors">
                            Manage All Payments
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboardPage;