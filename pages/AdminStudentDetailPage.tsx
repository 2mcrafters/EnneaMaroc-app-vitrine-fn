import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { Course } from '../data/courses';
import { Revision } from '../data/revisions';
import BackArrowIcon from '../components/icons/BackArrowIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { LockIcon } from '../components/icons/LockIcon';
import { PaperclipIcon } from '../components/icons/PaperclipIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';


interface UserData {
    firstName: string;
    lastName: string;
    dob: string;
    nationalId: string;
    city: string;
    email: string;
    phone: string;
    profilePicture: string;
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
  group: { price: number; };
  status: 'Pending Payment' | 'Pending Confirmation' | 'Active' | 'Cancelled';
  enrolledDate: string;
  userId: string;
  payments?: Payment[];
  durationMonths: number;
}

type ActiveTab = 'info' | 'courses' | 'revisions' | 'payments';

const TabButton: React.FC<{ tab: ActiveTab; activeTab: ActiveTab; setTab: (tab: ActiveTab) => void; children: React.ReactNode }> = ({ tab, activeTab, setTab, children }) => (
    <button
      onClick={() => setTab(tab)}
      className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors focus:outline-none ${
        activeTab === tab
          ? 'bg-white border-slate-200 border-t border-l border-r text-pistachio-dark'
          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
      }`}
    >
        {children}
    </button>
);

const EnrollmentCard: React.FC<{ 
    enrollment: Enrollment; 
    item: Course | Revision | undefined; 
    isExpanded: boolean; 
    onToggle: () => void;
    onMarkPaid: (enrollmentId: string, month: number) => void;
}> = ({ enrollment, item, isExpanded, onToggle, onMarkPaid }) => {
    if (!item) return null;

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row gap-4">
                <img src={item.imageUrl} alt={item.title} className="w-full sm:w-24 h-24 object-cover rounded-md flex-shrink-0" />
                <div className="flex-grow">
                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                    <p className="text-sm text-slate-500">Enrolled: {new Date(enrollment.enrolledDate).toLocaleDateString()}</p>
                    <span className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full ${enrollment.status === 'Active' ? 'bg-green-100 text-green-800' : enrollment.status === 'Cancelled' ? 'bg-red-100 text-red-800' : enrollment.status === 'Pending Confirmation' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{enrollment.status}</span>
                </div>
                <div className="flex-shrink-0 flex items-center">
                    <button onClick={onToggle} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                        <span>View Payment Status</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                     <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {Array.from({ length: enrollment.durationMonths }, (_, i) => i + 1).map(month => {
                            let monthStatus: 'paid' | 'pending' | 'due' | 'locked' = 'locked';
                            const payment = enrollment.payments?.find(p => p.month === month);

                             if (enrollment.status === 'Pending Payment' && month === 1) {
                                monthStatus = 'due';
                            } else if (enrollment.status === 'Pending Confirmation' && month === 1) {
                                monthStatus = 'pending';
                            } else if (payment) {
                                monthStatus = payment.status === 'Confirmed' ? 'paid' : 'pending';
                            } else if (enrollment.status === 'Active') {
                                const totalPaymentsMade = enrollment.payments?.length || 0;
                                const nextDueMonth = totalPaymentsMade + 1;
                                if (month === nextDueMonth) {
                                    monthStatus = 'due';
                                }
                            }
                            
                            const canMarkPaid = !payment || payment.status !== 'Confirmed';

                            return (
                                <div key={month} className={`p-3 rounded-lg text-center border flex flex-col justify-between ${
                                    {'paid': 'bg-green-50 border-green-200', 'pending': 'bg-blue-50 border-blue-200', 'due': 'bg-yellow-50 border-yellow-300', 'locked': 'bg-slate-100 border-slate-200'}[monthStatus]
                                }`}>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">Month {month}</p>
                                        <div className="my-2 flex justify-center">
                                            {monthStatus === 'paid' && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                                            {monthStatus === 'pending' && <ClockIcon className="w-6 h-6 text-blue-500" />}
                                            {monthStatus === 'due' && <PaperclipIcon className="w-6 h-6 text-yellow-600" />}
                                            {monthStatus === 'locked' && <LockIcon className="w-6 h-6 text-slate-400" />}
                                        </div>
                                        <p className="text-xs text-slate-500 capitalize">{monthStatus}</p>
                                    </div>
                                    {canMarkPaid && (
                                        <button onClick={() => onMarkPaid(enrollment.id, month)} className="mt-2 w-full text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-full py-1 transition-colors">Mark Paid</button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};


const AdminStudentDetailPage: React.FC = () => {
    const userId = decodeURIComponent(window.location.hash.split('/').pop() || '');
    const [student, setStudent] = useState<UserData | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [revisions, setRevisions] = useState<Revision[]>([]);
    const [activeTab, setActiveTab] = useState<ActiveTab>('info');
    const [expandedEnrollmentId, setExpandedEnrollmentId] = useState<string | null>(null);
    const REGISTRATION_FEE = 250;

    const loadData = () => {
        if (!userId) return;

        const allUsers: UserData[] = JSON.parse(localStorage.getItem('users') || '[]');
        const foundStudent = allUsers.find(u => u.email === userId);
        setStudent(foundStudent || null);
        
        const allEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const studentEnrollments = allEnrollments.filter(e => e.userId === userId);
        setEnrollments(studentEnrollments);

        setCourses(JSON.parse(localStorage.getItem('courses') || '[]'));
        setRevisions(JSON.parse(localStorage.getItem('revisions') || '[]'));
    };

    useEffect(() => {
        loadData();
    }, [userId]);

    const getItemDetails = (itemId: string, itemType: 'course' | 'revision') => {
        if (itemType === 'course') {
            return courses.find(c => c.id === itemId);
        }
        return revisions.find(r => r.id === itemId);
    };

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        window.location.hash = path;
    };
    
    const handleToggleExpand = (enrollmentId: string) => {
        setExpandedEnrollmentId(prevId => (prevId === enrollmentId ? null : enrollmentId));
    };
    
    const handleMarkPaid = (enrollmentId: string, month: number) => {
        if (!window.confirm(`Are you sure you want to manually mark month ${month} as paid for this enrollment?`)) {
            return;
        }

        const allEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const allUsers: UserData[] = JSON.parse(localStorage.getItem('users') || '[]');
        
        const enrollmentToUpdate = allEnrollments.find(e => e.id === enrollmentId);
        const studentForEnrollment = allUsers.find(u => u.email === enrollmentToUpdate?.userId);

        if (!enrollmentToUpdate || !studentForEnrollment) {
            alert("Error: Could not find enrollment or student data.");
            return;
        }

        const existingPayment = enrollmentToUpdate.payments?.find(p => p.month === month);
        if (existingPayment && existingPayment.status === 'Confirmed') {
            alert(`Month ${month} is already marked as confirmed.`);
            return;
        }

        const requiresFee = !studentForEnrollment.hasPaidRegistrationFee && month === 1;
        const paymentAmount = enrollmentToUpdate.group.price + (requiresFee ? REGISTRATION_FEE : 0);

        let updatedPayments: Payment[];

        if (existingPayment) { // Update existing 'Pending Confirmation' payment
            updatedPayments = (enrollmentToUpdate.payments || []).map(p => 
                p.month === month 
                    ? { 
                        ...p, 
                        status: 'Confirmed' as const, 
                        amount: paymentAmount, 
                        date: new Date().toISOString(), 
                        proof: p.proof || 'Manually Confirmed by Admin' 
                      } 
                    : p
            );
        } else { // Create a brand new payment
            const newPayment: Payment = {
                date: new Date().toISOString(),
                amount: paymentAmount,
                proof: 'Manually Confirmed by Admin',
                status: 'Confirmed',
                month,
            };
            updatedPayments = [...(enrollmentToUpdate.payments || []), newPayment].sort((a, b) => a.month - b.month);
        }
        
        let newStatus = enrollmentToUpdate.status;
        if ((newStatus === 'Pending Payment' || newStatus === 'Pending Confirmation') && month === 1) {
            newStatus = 'Active';
        }

        const updatedEnrollments = allEnrollments.map(en => 
            en.id === enrollmentId 
                ? { ...en, payments: updatedPayments, status: newStatus } 
                : en
        );
        
        if (requiresFee) {
            const updatedUsers = allUsers.map(u => 
                u.email === studentForEnrollment.email 
                    ? { ...u, hasPaidRegistrationFee: true } 
                    : u
            );
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            setStudent(prevStudent => prevStudent ? { ...prevStudent, hasPaidRegistrationFee: true } : null);
        }
        
        localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));
        loadData();
    };

    if (!student) {
        return (
            <AdminLayout>
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <p className="text-slate-600">Student not found.</p>
                     <a 
                        href="#/admin/students" 
                        onClick={(e) => handleNav(e, '#/admin/students')} 
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-pistachio-dark"
                      >
                        <BackArrowIcon className="w-5 h-5" />
                        Back to Students List
                    </a>
                </div>
            </AdminLayout>
        );
    }
    
    const courseEnrollments = enrollments.filter(e => e.itemType === 'course');
    const revisionEnrollments = enrollments.filter(e => e.itemType === 'revision');
    const allPayments = enrollments.flatMap(e => e.payments?.map(p => ({ ...p, enrollment: e })) || []);

    const InfoSection = () => (
        <div className="bg-white p-8 rounded-xl shadow-lg md:shadow-none md:p-0">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Personal Information</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-slate-700">
                <div><strong className="font-semibold text-slate-500 block">City:</strong> {student.city}</div>
                <div><strong className="font-semibold text-slate-500 block">Phone:</strong> {student.phone}</div>
                <div><strong className="font-semibold text-slate-500 block">Date of Birth:</strong> {student.dob}</div>
                <div><strong className="font-semibold text-slate-500 block">National ID:</strong> {student.nationalId}</div>
            </div>
        </div>
    );

    const CoursesSection = () => (
        <div className="bg-white p-8 rounded-xl shadow-lg md:shadow-none md:p-0">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Course Enrollments</h3>
            {courseEnrollments.length > 0 ? (
                <div className="space-y-4">
                    {courseEnrollments.map(e => (
                        <EnrollmentCard 
                            key={e.id} 
                            enrollment={e} 
                            item={getItemDetails(e.itemId, 'course')} 
                            isExpanded={expandedEnrollmentId === e.id}
                            onToggle={() => handleToggleExpand(e.id)}
                            onMarkPaid={handleMarkPaid}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-500 py-4">This student has no course enrollments.</p>
            )}
        </div>
    );

    const RevisionsSection = () => (
        <div className="bg-white p-8 rounded-xl shadow-lg md:shadow-none md:p-0">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Revision Enrollments</h3>
            {revisionEnrollments.length > 0 ? (
                <div className="space-y-4">
                    {revisionEnrollments.map(e => (
                         <EnrollmentCard 
                            key={e.id} 
                            enrollment={e} 
                            item={getItemDetails(e.itemId, 'revision')} 
                            isExpanded={expandedEnrollmentId === e.id}
                            onToggle={() => handleToggleExpand(e.id)}
                            onMarkPaid={handleMarkPaid}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-500 py-4">This student has no revision enrollments.</p>
            )}
        </div>
    );

    const PaymentsSection = () => (
        <div className="bg-white p-8 rounded-xl shadow-lg md:shadow-none md:p-0">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Consolidated Payment History</h3>
            {allPayments.length > 0 ? (
                <div className="space-y-4">
                    {allPayments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment, index) => {
                        const item = getItemDetails(payment.enrollment.itemId, payment.enrollment.itemType);
                        return (
                            <div key={`${payment.enrollment.id}-${payment.month}-${index}`} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-slate-800">{item?.title} (Month {payment.month})</p>
                                    <p className="text-sm text-slate-500">Date: {new Date(payment.date).toLocaleDateString()} - Status: {payment.status}</p>
                                    {payment.proof === 'Manually Confirmed by Admin' && <p className="text-xs text-slate-400 italic">Manually Confirmed by Admin</p>}
                                </div>
                                <p className={`font-bold ${payment.status === 'Confirmed' ? 'text-green-600' : 'text-blue-600'}`}>{payment.amount.toLocaleString('de-DE')} MAD</p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center text-slate-500 py-4">No payment history found.</p>
            )}
       </div>
    );


    return (
        <AdminLayout>
            <div className="space-y-8">
                 <a 
                    href="#/admin/students" 
                    onClick={(e) => handleNav(e, '#/admin/students')} 
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                  >
                    <BackArrowIcon className="w-5 h-5" />
                    Back to All Students
                </a>

                {/* Student Info Header */}
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-8">
                        <img src={student.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-4 sm:mb-0 border-4 border-slate-100" />
                        <div className="text-center sm:text-left flex-grow">
                            <h2 className="text-3xl font-bold text-slate-900">{student.firstName} {student.lastName}</h2>
                            <p className="text-slate-500">{student.email}</p>
                            <div className="mt-2">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${student.hasPaidRegistrationFee ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    Registration Fee: {student.hasPaidRegistrationFee ? 'Paid' : 'Unpaid'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Stacked Layout */}
                <div className="md:hidden space-y-8">
                    <InfoSection />
                    <CoursesSection />
                    <RevisionsSection />
                    <PaymentsSection />
                </div>

                {/* Desktop Tabs */}
                <div className="hidden md:block">
                    <div className="border-b border-slate-200">
                        <div className="flex space-x-2">
                            <TabButton tab="info" activeTab={activeTab} setTab={setActiveTab}>Personal Info</TabButton>
                            <TabButton tab="courses" activeTab={activeTab} setTab={setActiveTab}>Courses</TabButton>
                            <TabButton tab="revisions" activeTab={activeTab} setTab={setActiveTab}>Revisions</TabButton>
                            <TabButton tab="payments" activeTab={activeTab} setTab={setActiveTab}>Payment History</TabButton>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg -mt-px border-t-0 border rounded-b-xl">
                        {activeTab === 'info' && <InfoSection />}
                        {activeTab === 'courses' && <CoursesSection />}
                        {activeTab === 'revisions' && <RevisionsSection />}
                        {activeTab === 'payments' && <PaymentsSection />}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminStudentDetailPage;