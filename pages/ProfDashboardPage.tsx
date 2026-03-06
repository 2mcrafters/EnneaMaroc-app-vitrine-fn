

import React, { useState, useEffect } from 'react';
import { Instructor } from '../data/instructors';
import { Course } from '../data/courses';
import { Revision } from '../data/revisions';
import { CalendarDaysIcon } from '../components/icons/CalendarDaysIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { ClipboardListIcon } from '../components/icons/ClipboardListIcon';

// A generic user data type
interface UserData {
    firstName: string;
    lastName: string;
    dob: string;
    nationalId: string;
    city: string;
    email: string;
    phone: string;
    profilePicture: string;
}

// A generic enrollment type
interface Enrollment {
  userId: string;
  itemId: string;
  itemType: 'course' | 'revision';
  group: { instructorId: string; [key: string]: any };
  status: string;
}

interface ScheduleItem {
    title: string;
    time: string;
    type: string;
    isCancelled: boolean;
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

// A local StatCard component for styling consistency
// FIX: Explicitly type the `icon` prop to be a ReactElement that accepts a `className`, resolving the `cloneElement` type error.
const StatCard: React.FC<{ icon: React.ReactElement<{ className?: string }>; title: string; value: string | number; colorClasses: string; }> = ({ icon, title, value, colorClasses }) => {
  return (
    <div className={`bg-gradient-to-br ${colorClasses} text-white p-6 rounded-xl shadow-lg relative overflow-hidden`}>
      <div className="absolute -right-4 -bottom-4 text-white/20">
        {React.cloneElement(icon, { className: 'w-24 h-24' })}
      </div>
      <div className="relative">
        <p className="text-4xl font-bold">{value}</p>
        <p className="text-sm font-medium uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
};


const ProfDashboardPage: React.FC = () => {
    const [prof, setProf] = useState<Instructor | null>(null);
    const [students, setStudents] = useState<UserData[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);
    const [stats, setStats] = useState({ totalSessions: 0, totalStudents: 0, sessionsToday: 0 });
    const [todaysSchedule, setTodaysSchedule] = useState<ScheduleItem[]>([]);

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
        setProf(loggedInUser);

        if (loggedInUser && loggedInUser.id) {
            const allCourses: Course[] = JSON.parse(localStorage.getItem('courses') || '[]');
            const allRevisions: Revision[] = JSON.parse(localStorage.getItem('revisions') || '[]');
            const allEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
            const allUsers: UserData[] = JSON.parse(localStorage.getItem('users') || '[]');
            const sessionCancellations = new Set(JSON.parse(localStorage.getItem('session_cancellations') || '[]'));
            
            // --- Calculate Total Sessions & Today's Schedule ---
            let totalSessionsCount = 0;
            const todaysEvents: ScheduleItem[] = [];
            const weekDays = ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'];
            const today = new Date();
            const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
            const currentDayName = weekDays[currentDayIndex];

            allCourses.forEach(course => {
                course.groups.forEach(group => {
                    if (group.instructorId === loggedInUser.id) {
                        totalSessionsCount++;
                        const days = group.day.split(/, | & /);
                        days.forEach(day => {
                            const specificDay = day.endsWith('s') ? day : `${day}s`;
                            if (specificDay === currentDayName) {
                                const groupForKey = { ...group, day: specificDay };
                                const sessionKey = generateSessionKey(course.id, 'course', groupForKey, today);
                                const isCancelled = sessionCancellations.has(sessionKey);
                                todaysEvents.push({ title: course.title, time: group.time, type: 'Course', isCancelled });
                            }
                        });
                    }
                });
            });
            allRevisions.forEach(revision => {
                revision.modalities.forEach(modality => {
                    modality.options.forEach(option => {
                        if (option.instructorId === loggedInUser.id) {
                            totalSessionsCount++;
                            const days = option.day.split(/, | & /);
                            days.forEach(day => {
                                const specificDay = day.endsWith('s') ? day : `${day}s`;
                                if (specificDay === currentDayName) {
                                    const groupForKey = { modalityType: modality.type, ...option, day: specificDay };
                                    const sessionKey = generateSessionKey(revision.id, 'revision', groupForKey, today);
                                    const isCancelled = sessionCancellations.has(sessionKey);
                                    todaysEvents.push({ title: revision.title, time: option.time, type: `${modality.type} Revision`, isCancelled });
                                }
                            });
                        }
                    });
                });
            });

            setTodaysSchedule(todaysEvents);

            // --- Find Students ---
            const activeEnrollments = allEnrollments.filter(e => e.status === 'Active');
            const profStudentIds = new Set<string>();
            activeEnrollments.forEach(en => {
                if (en.group.instructorId === loggedInUser.id) {
                    profStudentIds.add(en.userId);
                }
            });

            const profStudents = allUsers.filter(u => profStudentIds.has(u.email));
            setStudents(profStudents);

            // --- Set Final Stats ---
            setStats({
                totalSessions: totalSessionsCount,
                totalStudents: profStudents.length,
                sessionsToday: todaysEvents.length,
            });
        }

    }, []);

    if (!prof) {
        return <div className="text-center py-20">Loading dashboard...</div>;
    }

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">Professor Dashboard</h1>
                    <p className="text-slate-600">Welcome back, {prof.name}.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard icon={<ClipboardListIcon />} title="Total Sessions" value={stats.totalSessions} colorClasses="from-sky-500 to-sky-400" />
                    <StatCard icon={<UsersIcon />} title="Total Students" value={stats.totalStudents} colorClasses="from-violet-500 to-violet-400" />
                    <StatCard icon={<CalendarDaysIcon />} title="Sessions Today" value={stats.sessionsToday} colorClasses="from-lime-500 to-lime-400" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Students Column */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg">
                         <div className="flex items-center gap-3 mb-6">
                            <UsersIcon className="w-6 h-6 text-slate-500" />
                            <h2 className="text-2xl font-bold text-slate-800">My Students</h2>
                        </div>
                        {students.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {students.map(student => (
                                    <button key={student.email} onClick={() => setSelectedStudent(student)} className="text-center group focus:outline-none focus:ring-2 focus:ring-pistachio-dark rounded-lg">
                                        <img src={student.profilePicture} alt={`${student.firstName} ${student.lastName}`} className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-slate-100 group-hover:border-pistachio-DEFAULT transition-colors" />
                                        <p className="mt-2 font-semibold text-slate-800 truncate">{student.firstName} {student.lastName}</p>
                                        <p className="text-xs text-slate-500 truncate">{student.email}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                             <p className="text-center text-slate-500 py-4">You have no students enrolled in your classes yet.</p>
                        )}
                    </div>

                    {/* Today's Schedule Column */}
                    <div className="lg:col-span-1 bg-white p-8 rounded-xl shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <CalendarDaysIcon className="w-6 h-6 text-slate-500" />
                            <h2 className="text-2xl font-bold text-slate-800">Today's Schedule</h2>
                        </div>
                        {todaysSchedule.length > 0 ? (
                            <div className="space-y-4">
                                {todaysSchedule.map((item, index) => (
                                    <div key={index} className={`p-4 rounded-lg border ${item.isCancelled ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                                        <p className={`font-bold text-slate-800 ${item.isCancelled ? 'line-through' : ''}`}>{item.title}</p>
                                        <p className={`text-sm text-slate-600 ${item.isCancelled ? 'line-through' : ''}`}>{item.time}</p>
                                        <p className={`text-xs text-pistachio-dark font-semibold mt-1 ${item.isCancelled ? 'line-through' : ''}`}>{item.type}</p>
                                        {item.isCancelled && <p className="text-xs font-bold text-red-600 mt-1">CANCELLED</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 py-4">No classes scheduled for today.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in" onClick={() => setSelectedStudent(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-8 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center">
                            <img src={selectedStudent.profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-slate-100" />
                            <h3 className="text-2xl font-bold text-slate-900">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                            <p className="text-slate-500">{selectedStudent.email}</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-200 text-sm space-y-3">
                            <div className="flex justify-between"><strong className="font-semibold text-slate-500">Phone:</strong> <span className="text-slate-700">{selectedStudent.phone}</span></div>
                            <div className="flex justify-between"><strong className="font-semibold text-slate-500">City:</strong> <span className="text-slate-700">{selectedStudent.city}</span></div>
                            <div className="flex justify-between"><strong className="font-semibold text-slate-500">Date of Birth:</strong> <span className="text-slate-700">{selectedStudent.dob}</span></div>
                            <div className="flex justify-between"><strong className="font-semibold text-slate-500">National ID:</strong> <span className="text-slate-700">{selectedStudent.nationalId}</span></div>
                        </div>
                        <div className="mt-6 text-right">
                           <button onClick={() => setSelectedStudent(null)} className="px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200">
                                Close
                           </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfDashboardPage;