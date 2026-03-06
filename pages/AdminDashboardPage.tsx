

import React, { useState, useEffect } from 'react';
import { Course } from '../data/courses';
import { Revision } from '../data/revisions';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { XCircleIcon } from '../components/icons/XCircleIcon';
import { PaperclipIcon } from '../components/icons/PaperclipIcon';
import AdminLayout from '../components/admin/AdminLayout';
import StatCard from '../components/admin/StatCard';
import { UsersIcon } from '../components/icons/UsersIcon';
import { AcademicCapIcon } from '../components/icons/AcademicCapIcon';
import { ClipboardListIcon } from '../components/icons/ClipboardListIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import BarChart from '../components/admin/BarChart';
import { ChartBarIcon } from '../components/icons/ChartBarIcon';

// Interfaces
interface User {
    firstName: string;
    lastName: string;
    email: string;
    hasPaidRegistrationFee?: boolean;
}
interface Instructor {
  id: string;
  name: string;
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
  group: { price: number; [key: string]: any };
  status: 'Pending Payment' | 'Pending Confirmation' | 'Active' | 'Cancelled';
  enrolledDate: string;
  paymentProof: string | null;
  userId: string;
  userName:string;
  payments?: Payment[];
  durationMonths: number;
}
interface ApprovalItem {
    enrollmentId: string;
    userId: string;
    userName: string;
    itemTitle: string;
    proof: string;
    month: number;
    isInitial: boolean;
    amount: number;
    enrolledDate: string;
}
interface TodayScheduleItem {
    title: string;
    time: string;
    instructorName: string;
    startTimeMinutes: number;
    isOnline: boolean;
    itemId: string;
    itemType: 'course' | 'revision';
    group: any;
    linkOverride?: string;
}
interface ChartData {
  labels: string[];
  values: number[];
}

// Time parsing helpers
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
        return { startTimeMinutes: startTime, durationMinutes: 60 };
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
    groupIdentifier = `${group.day}-${group.time}`;
  } else { // revision
    groupIdentifier = `${group.modalityType}-${group.type}-${group.day}-${group.time}`;
  }
  const sanitizedIdentifier = groupIdentifier.replace(/[\s,:&]/g, '');
  return `${itemId}_${sanitizedIdentifier}_${dateString}`;
};


const AdminDashboardPage: React.FC = () => {
    const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
    const [stats, setStats] = useState({ students: 0, instructors: 0, activeEnrollments: 0 });
    const [todaysSchedule, setTodaysSchedule] = useState<TodayScheduleItem[]>([]);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [selectedSessionForLink, setSelectedSessionForLink] = useState<TodayScheduleItem | null>(null);
    const [currentLink, setCurrentLink] = useState('');
    const [monthlyRevenue, setMonthlyRevenue] = useState<ChartData>({ labels: [], values: [] });
    const [coursePopularity, setCoursePopularity] = useState<ChartData>({ labels: [], values: [] });


    const loadData = () => {
        const allCourses: Course[] = JSON.parse(localStorage.getItem('courses') || '[]');
        const allRevisions: Revision[] = JSON.parse(localStorage.getItem('revisions') || '[]');
        const allEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const allInstructors: Instructor[] = JSON.parse(localStorage.getItem('profs') || '[]');
        const sessionLinkOverrides = JSON.parse(localStorage.getItem('session_link_overrides') || '{}');
        
        // --- Calculate Stats ---
        setStats({
            students: allUsers.length,
            instructors: allInstructors.length,
            activeEnrollments: allEnrollments.filter(e => e.status === 'Active').length
        });
        
        // --- Get Pending Approvals ---
        const getTitle = (itemId: string, itemType: 'course' | 'revision') => {
            const source = itemType === 'course' ? allCourses : allRevisions;
            return source.find((item: any) => item.id === itemId)?.title || 'Unknown Item';
        };
        const pendingApprovals: ApprovalItem[] = [];
        allEnrollments.forEach(e => {
            if (e.payments) {
                const pendingPayment = e.payments.find(p => p.status === 'Pending Confirmation');
                if (pendingPayment && pendingPayment.proof) {
                    const isInitial = e.status === 'Pending Confirmation' && pendingPayment.month === 1;
                    pendingApprovals.push({
                        enrollmentId: e.id,
                        userId: e.userId,
                        userName: e.userName,
                        itemTitle: getTitle(e.itemId, e.itemType),
                        proof: pendingPayment.proof,
                        month: pendingPayment.month,
                        isInitial: isInitial,
                        amount: pendingPayment.amount,
                        enrolledDate: e.enrolledDate,
                    });
                }
            }
        });
        setApprovals(pendingApprovals.sort((a,b) => new Date(b.enrolledDate).getTime() - new Date(a.enrolledDate).getTime()));

        // --- Get Today's Schedule ---
        const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        const currentDayName = weekDays[today.getDay()];
        let todaysEvents: TodayScheduleItem[] = [];

        allCourses.forEach(course => {
            course.groups.forEach(group => {
                if (group.day.includes(currentDayName)) {
                    const { startTimeMinutes } = parseTimeRange(group.time);
                    const instructor = allInstructors.find(i => i.id === group.instructorId);
                    const sessionKey = generateSessionKey(course.id, 'course', group, today);
                    todaysEvents.push({
                        title: course.title,
                        time: group.time,
                        startTimeMinutes,
                        instructorName: instructor?.name || 'N/A',
                        isOnline: course.type === 'online',
                        itemId: course.id,
                        itemType: 'course',
                        group: group,
                        linkOverride: sessionLinkOverrides[sessionKey],
                    });
                }
            });
        });
        
        allRevisions.forEach(revision => {
            revision.modalities.forEach(modality => {
                modality.options.forEach(option => {
                    if (option.day.includes(currentDayName)) {
                        const { startTimeMinutes } = parseTimeRange(option.time);
                        const instructor = allInstructors.find(i => i.id === option.instructorId);
                        const groupForSession = { modalityType: modality.type, ...option };
                        const sessionKey = generateSessionKey(revision.id, 'revision', groupForSession, today);
                        todaysEvents.push({
                            title: revision.title,
                            time: option.time,
                            startTimeMinutes,
                            instructorName: instructor?.name || 'N/A',
                            isOnline: modality.type === 'Online',
                            itemId: revision.id,
                            itemType: 'revision',
                            group: groupForSession,
                            linkOverride: sessionLinkOverrides[sessionKey],
                        });
                    }
                });
            });
        });

        setTodaysSchedule(todaysEvents.sort((a,b) => a.startTimeMinutes - b.startTimeMinutes));

        // --- Calculate Analytics ---
        // Monthly Revenue (last 6 months)
        const revenueData: { [key: string]: number } = {};
        const monthLabels: string[] = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = d.toLocaleString('default', { month: 'short' });
            monthLabels.push(monthKey);
            revenueData[monthKey] = 0;
        }

        allEnrollments.forEach(e => {
            e.payments?.forEach(p => {
                if (p.status === 'Confirmed') {
                    const paymentDate = new Date(p.date);
                    const monthDiff = (now.getFullYear() - paymentDate.getFullYear()) * 12 + (now.getMonth() - paymentDate.getMonth());
                    if (monthDiff >= 0 && monthDiff < 6) {
                        const monthKey = paymentDate.toLocaleString('default', { month: 'short' });
                        if(revenueData[monthKey] !== undefined) {
                            revenueData[monthKey] += p.amount;
                        }
                    }
                }
            });
        });

        setMonthlyRevenue({
            labels: monthLabels,
            values: monthLabels.map(key => revenueData[key])
        });

        // Course Popularity
        const popularity: { [key: string]: number } = {};
        allCourses.forEach(c => { popularity[c.id] = 0; });
        
        allEnrollments.forEach(e => {
            if (e.status === 'Active' && e.itemType === 'course' && popularity[e.itemId] !== undefined) {
                popularity[e.itemId]++;
            }
        });

        const sortedPopularity = Object.entries(popularity)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5); // Show top 5 for clarity

        setCoursePopularity({
            labels: sortedPopularity.map(([id]) => allCourses.find(c => c.id === id)?.title || 'Unknown'),
            values: sortedPopularity.map(([, count]) => count)
        });
    }

    useEffect(() => {
       loadData();
    }, []);

    const updateLocalStorageAndState = (updatedEnrollments: Enrollment[]) => {
        localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));
        loadData();
    };

    const handleUpdateStatus = (approvalItem: ApprovalItem, action: 'confirm' | 'reject') => {
        const currentEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
        
        const updatedEnrollments = currentEnrollments.map((e: Enrollment) => {
            if (e.id === approvalItem.enrollmentId) {
                if (action === 'confirm') {
                    const updatedPayments = e.payments?.map(p => 
                        p.month === approvalItem.month ? { ...p, status: 'Confirmed' as const, date: new Date().toISOString() } : p
                    );
                    const newStatus = approvalItem.isInitial ? 'Active' : e.status;
                    return { ...e, status: newStatus, payments: updatedPayments };
                } else { // reject
                    const updatedPayments = e.payments?.filter(p => p.month !== approvalItem.month);
                    const newStatus = approvalItem.isInitial ? 'Pending Payment' : e.status;
                    const newPaymentProof = approvalItem.isInitial ? null : e.paymentProof;
                    return { ...e, status: newStatus, payments: updatedPayments, paymentProof: newPaymentProof };
                }
            }
            return e;
        });

        if (action === 'confirm' && approvalItem.isInitial) {
            const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
            const userToUpdate = allUsers.find(u => u.email === approvalItem.userId);
            if(userToUpdate && !userToUpdate.hasPaidRegistrationFee) {
                const updatedUsers = allUsers.map(u => 
                    u.email === approvalItem.userId ? { ...u, hasPaidRegistrationFee: true } : u
                );
                localStorage.setItem('users', JSON.stringify(updatedUsers));
            }
        }
        
        updateLocalStorageAndState(updatedEnrollments);
    };
    
    const openLinkModal = (session: TodayScheduleItem) => {
        setSelectedSessionForLink(session);
        const effectiveLink = session.linkOverride || session.group.meetingLink || '';
        setCurrentLink(effectiveLink);
        setIsLinkModalOpen(true);
    };
    
    const handleSaveLink = () => {
        if (!selectedSessionForLink) return;
        
        const sessionKey = generateSessionKey(selectedSessionForLink.itemId, selectedSessionForLink.itemType, selectedSessionForLink.group, new Date());
        const overrides = JSON.parse(localStorage.getItem('session_link_overrides') || '{}');
        
        if (currentLink) {
            overrides[sessionKey] = currentLink;
        } else {
            delete overrides[sessionKey]; // Remove the override if the link is cleared
        }
        
        localStorage.setItem('session_link_overrides', JSON.stringify(overrides));
        setIsLinkModalOpen(false);
        setSelectedSessionForLink(null);
        setCurrentLink('');
        loadData(); // Reload to show updated link status
    };

    return (
        <AdminLayout>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={<UsersIcon />} title="Total Students" value={stats.students} colorClasses="from-sky-500 to-sky-400" />
                <StatCard icon={<AcademicCapIcon />} title="Total Instructors" value={stats.instructors} colorClasses="from-violet-500 to-violet-400" />
                <StatCard icon={<ClipboardListIcon />} title="Active Enrollments" value={stats.activeEnrollments} colorClasses="from-lime-500 to-lime-400" />
                <StatCard icon={<ClockIcon />} title="Pending Approvals" value={approvals.length} colorClasses="from-amber-500 to-amber-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                 <div className="lg:col-span-2 bg-white p-4 md:p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Pending Approvals</h2>
                    {approvals.length > 0 ? (
                        <>
                            <div className="overflow-x-auto hidden md:block">
                                <table className="w-full text-sm text-left text-slate-600">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">User</th>
                                            <th scope="col" className="px-6 py-3">Item (Payment for Month)</th>
                                            <th scope="col" className="px-6 py-3">Amount</th>
                                            <th scope="col" className="px-6 py-3">Proof</th>
                                            <th scope="col" className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {approvals.map(a => (
                                            <tr key={`${a.enrollmentId}-${a.month}`} className="bg-white border-b hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-900">{a.userName}</td>
                                                <td className="px-6 py-4">{a.itemTitle} (Month {a.month})</td>
                                                <td className="px-6 py-4 font-semibold">{a.amount.toLocaleString('de-DE')} MAD</td>
                                                <td className="px-6 py-4"><a href="#" title={a.proof} className="flex items-center gap-1 text-blue-600 hover:underline"><PaperclipIcon className="w-4 h-4"/>View</a></td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleUpdateStatus(a, 'confirm')} className="p-2 text-green-600 hover:bg-green-100 rounded-full" title="Confirm"><CheckCircleIcon className="w-5 h-5"/></button>
                                                        <button onClick={() => handleUpdateStatus(a, 'reject')} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Reject"><XCircleIcon className="w-5 h-5"/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="md:hidden space-y-4">
                                {approvals.map(a => (
                                    <div key={`${a.enrollmentId}-${a.month}`} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-slate-800">{a.userName}</h3>
                                                <p className="text-sm text-slate-600">{a.itemTitle} (Month {a.month})</p>
                                                <p className="text-sm font-semibold text-pistachio-dark mt-1">{a.amount.toLocaleString('de-DE')} MAD</p>
                                            </div>
                                            <a href="#" title={a.proof} className="flex-shrink-0 flex items-center gap-1 text-blue-600 hover:underline text-sm">
                                                <PaperclipIcon className="w-4 h-4"/>
                                                Proof
                                            </a>
                                        </div>
                                        <div className="flex gap-2 justify-end pt-3 mt-3 border-t border-slate-200">
                                            <button onClick={() => handleUpdateStatus(a, 'reject')} className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full">Reject</button>
                                            <button onClick={() => handleUpdateStatus(a, 'confirm')} className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Confirm</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-slate-500 py-4">No pending approvals.</p>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg h-full">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Today's Schedule</h2>
                        {todaysSchedule.length > 0 ? (
                            <div className="space-y-3">
                                {todaysSchedule.map((item, index) => (
                                    <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <p className="font-semibold text-slate-800">{item.title}</p>
                                        <p className="text-sm text-slate-500">{item.time}</p>
                                        <p className="text-xs text-slate-500 mt-1">w/ {item.instructorName}</p>
                                        {item.isOnline && (
                                            <div className="mt-2 pt-2 border-t border-slate-200">
                                                <button 
                                                    onClick={() => openLinkModal(item)}
                                                    className="w-full text-xs font-semibold text-pistachio-dark bg-pistachio-light hover:bg-lime-200 rounded-full py-1 transition-colors"
                                                >
                                                    {item.linkOverride || item.group.meetingLink ? 'Edit Link' : 'Add Link'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-center text-slate-500 py-8">No classes scheduled for today.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <ChartBarIcon className="w-6 h-6 text-slate-500" />
                    <h2 className="text-2xl font-bold text-slate-800">Analytics</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <BarChart
                        title="Monthly Revenue (Last 6 Months)"
                        data={monthlyRevenue}
                        color="bg-sky-400"
                        unit=" MAD"
                    />
                    <BarChart
                        title="Top 5 Course Popularity (Active Enrollments)"
                        data={coursePopularity}
                        color="bg-lime-400"
                    />
                </div>
            </div>
            
             {isLinkModalOpen && selectedSessionForLink && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Session Link</h3>
                        <p className="text-sm text-slate-600 mb-6">For {selectedSessionForLink.title} at {selectedSessionForLink.time}</p>
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
        </AdminLayout>
    );
};

export default AdminDashboardPage;