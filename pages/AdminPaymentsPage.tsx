import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { Course } from '../data/courses';
import { Revision } from '../data/revisions';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { XCircleIcon } from '../components/icons/XCircleIcon';
import { UndoIcon } from '../components/icons/UndoIcon';


interface UserData {
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
  group: { price: number; [key: string]: any }; // Make group flexible
  status: 'Pending Payment' | 'Pending Confirmation' | 'Active' | 'Cancelled';
  enrolledDate: string;
  paymentProof: string | null;
  userId: string;
  userName: string;
  payments?: Payment[];
  durationMonths: number;
}

type FlatPayment = Payment & {
    enrollmentId: string;
    userId: string;
    userName: string;
    itemTitle: string;
};

const AdminPaymentsPage: React.FC = () => {
    const [payments, setPayments] = useState<FlatPayment[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [revisions, setRevisions] = useState<Revision[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const REGISTRATION_FEE = 250;
    
    // Form state
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('');
    const [paymentMonth, setPaymentMonth] = useState('');

    const loadData = () => {
        const allUsers: UserData[] = JSON.parse(localStorage.getItem('users') || '[]');
        const allEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const allCourses: Course[] = JSON.parse(localStorage.getItem('courses') || '[]');
        const allRevisions: Revision[] = JSON.parse(localStorage.getItem('revisions') || '[]');

        setUsers(allUsers);
        setEnrollments(allEnrollments);
        setCourses(allCourses);
        setRevisions(allRevisions);

        const flatPayments: FlatPayment[] = [];
        allEnrollments.forEach(e => {
            const user = allUsers.find(u => u.email === e.userId);
            const item = e.itemType === 'course' ? allCourses.find(c => c.id === e.itemId) : allRevisions.find(r => r.id === e.itemId);
            if(e.payments) {
                e.payments.forEach(p => {
                    flatPayments.push({
                        ...p,
                        enrollmentId: e.id,
                        userId: e.userId,
                        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
                        itemTitle: item?.title || 'Unknown Item',
                    });
                });
            }
        });
        setPayments(flatPayments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };
    
    useEffect(() => {
        loadData();
    }, []);
    
    const updateLocalStorageAndReload = (updatedEnrollments: Enrollment[], updatedUsers?: UserData[]) => {
        localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));
        if (updatedUsers) {
            localStorage.setItem('users', JSON.stringify(updatedUsers));
        }
        loadData();
    };

    const handleConfirm = (payment: FlatPayment) => {
        const currentEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const enrollment = currentEnrollments.find(e => e.id === payment.enrollmentId);
        const isInitial = enrollment?.status === 'Pending Confirmation' && payment.month === 1;

        const updatedEnrollments = currentEnrollments.map(e => {
            if (e.id === payment.enrollmentId) {
                const updatedPayments = e.payments?.map(p => p.month === payment.month ? { ...p, status: 'Confirmed' as const, date: new Date().toISOString() } : p);
                return { ...e, status: isInitial ? 'Active' : e.status, payments: updatedPayments };
            }
            return e;
        });

        if (isInitial) {
            const allUsers: UserData[] = JSON.parse(localStorage.getItem('users') || '[]');
            const user = allUsers.find(u => u.email === payment.userId);
            if (user && !user.hasPaidRegistrationFee) {
                const updatedUsers = allUsers.map(u => u.email === payment.userId ? { ...u, hasPaidRegistrationFee: true } : u);
                updateLocalStorageAndReload(updatedEnrollments, updatedUsers);
                return;
            }
        }
        updateLocalStorageAndReload(updatedEnrollments);
    };

    const handleReject = (payment: FlatPayment) => {
        const currentEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const enrollment = currentEnrollments.find(e => e.id === payment.enrollmentId);
        const isInitial = enrollment?.status === 'Pending Confirmation' && payment.month === 1;

        const updatedEnrollments = currentEnrollments.map(e => {
            if (e.id === payment.enrollmentId) {
                const updatedPayments = e.payments?.filter(p => p.month !== payment.month);
                return { ...e, status: isInitial ? 'Pending Payment' : e.status, payments: updatedPayments };
            }
            return e;
        });
        updateLocalStorageAndReload(updatedEnrollments);
    };
    
    const handleRevert = (payment: FlatPayment) => {
        if (!window.confirm("Are you sure you want to revert this confirmed payment to pending? This action may affect the student's enrollment status and cannot be undone.")) return;
    
        // 1. Get all current data
        const currentEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
        // 2. Update the specific enrollment and payment
        const updatedEnrollments = currentEnrollments.map(enrollment => {
            if (enrollment.id === payment.enrollmentId) {
                // Revert the specific payment's status
                const updatedPayments = enrollment.payments?.map(p =>
                    p.month === payment.month && p.status === 'Confirmed'
                        ? { ...p, status: 'Pending Confirmation' as const }
                        : p
                );
    
                // Determine the new enrollment status.
                // If the first month's payment is no longer confirmed, the enrollment cannot be 'Active'.
                let newStatus = enrollment.status;
                const isMonthOneConfirmedAfterRevert = updatedPayments?.some(p => p.month === 1 && p.status === 'Confirmed');
                
                if (enrollment.status === 'Active' && !isMonthOneConfirmedAfterRevert) {
                    newStatus = 'Pending Confirmation';
                }
    
                return { ...enrollment, status: newStatus, payments: updatedPayments };
            }
            return enrollment;
        });
    
        // 3. Check if the user's one-time registration fee status needs to be reverted
        const userStillHasAnyConfirmedPayment = updatedEnrollments
            .filter(e => e.userId === payment.userId)
            .some(e => e.payments?.some(p => p.status === 'Confirmed'));
    
        let updatedUsers: UserData[] | undefined = undefined;
        if (!userStillHasAnyConfirmedPayment) {
            const allUsers: UserData[] = JSON.parse(localStorage.getItem('users') || '[]');
            // Find the user and set hasPaidRegistrationFee to false
            const userToUpdate = allUsers.find(u => u.email === payment.userId);
            if (userToUpdate && userToUpdate.hasPaidRegistrationFee) {
                updatedUsers = allUsers.map(u =>
                    u.email === payment.userId ? { ...u, hasPaidRegistrationFee: false } : u
                );
            }
        }
    
        // 4. Save the updated data and reload the component's state
        updateLocalStorageAndReload(updatedEnrollments, updatedUsers);
    };


    const handleManualPaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const allEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const enrollmentToUpdate = allEnrollments.find(en => en.id === selectedEnrollmentId);
        const user = users.find(u => u.email === selectedUserId);

        if (!enrollmentToUpdate || !user) return;
        
        const isFirstPayment = !enrollmentToUpdate.payments || enrollmentToUpdate.payments.length === 0;
        const requiresFee = isFirstPayment && !user.hasPaidRegistrationFee;
        const paymentAmount = enrollmentToUpdate.group.price + (requiresFee ? REGISTRATION_FEE : 0);

        const newPayment: Payment = {
            date: new Date().toISOString(),
            amount: paymentAmount,
            proof: 'Manually Confirmed by Admin',
            status: 'Confirmed',
            month: Number(paymentMonth),
        };
        
        const updatedEnrollments = allEnrollments.map(en => {
            if (en.id === selectedEnrollmentId) {
                const updatedPayments = en.payments ? [...en.payments, newPayment] : [newPayment];
                const newStatus = (en.status === 'Pending Payment' || en.status === 'Pending Confirmation') ? 'Active' : en.status;
                return { ...en, payments: updatedPayments, status: newStatus };
            }
            return en;
        });
        
        if (requiresFee) {
            const allUsers: UserData[] = JSON.parse(localStorage.getItem('users') || '[]');
            const updatedUsers = allUsers.map(u => u.email === selectedUserId ? { ...u, hasPaidRegistrationFee: true } : u);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
        }

        localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));
        alert('Manual payment added successfully!');
        setIsModalOpen(false);
        resetForm();
        loadData();
    };

    const resetForm = () => {
        setSelectedUserId('');
        setSelectedEnrollmentId('');
        setPaymentMonth('');
    };
    
    const filteredPayments = payments
        .filter(p => statusFilter === 'All' || p.status === statusFilter)
        .filter(p => 
            p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.itemTitle.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const userEnrollments = enrollments.filter(e => e.userId === selectedUserId);

    return (
        <AdminLayout>
            <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">All Payments</h2>
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900">+ Add Manual Payment</button>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search by student or item..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-auto flex-grow px-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-pistachio-dark"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-pistachio-dark"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending Confirmation">Pending</option>
                    </select>
                </div>

                {filteredPayments.length > 0 ? (
                    <>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3">Student</th>
                                        <th className="px-6 py-3">Item (Month)</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map((p, index) => (
                                        <tr key={`${p.enrollmentId}-${p.month}-${index}`} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{p.userName}</td>
                                            <td className="px-6 py-4">{p.itemTitle} (Month {p.month})</td>
                                            <td className="px-6 py-4">{p.amount.toLocaleString('de-DE')} MAD</td>
                                            <td className="px-6 py-4">{new Date(p.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{p.status.replace(' Confirmation', '')}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {p.status === 'Pending Confirmation' && (
                                                        <>
                                                            <button onClick={() => handleConfirm(p)} className="p-2 text-green-600 hover:bg-green-100 rounded-full" title="Confirm"><CheckCircleIcon className="w-5 h-5"/></button>
                                                            <button onClick={() => handleReject(p)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Reject"><XCircleIcon className="w-5 h-5"/></button>
                                                        </>
                                                    )}
                                                    {p.status === 'Confirmed' && (
                                                        <button onClick={() => handleRevert(p)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full" title="Revert to Pending"><UndoIcon className="w-5 h-5"/></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4">
                            {filteredPayments.map((p, index) => (
                                <div key={`${p.enrollmentId}-${p.month}-${index}`} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-800">{p.userName}</h3>
                                            <p className="text-sm text-slate-600">{p.itemTitle} (Month {p.month})</p>
                                        </div>
                                        <span className={`flex-shrink-0 ml-2 px-2 py-1 text-xs font-semibold rounded-full ${p.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{p.status.replace(' Confirmation', '')}</span>
                                    </div>
                                    <div className="text-sm space-y-1 mt-2 mb-4">
                                        <p><strong className="font-semibold text-slate-500">Amount:</strong> {p.amount.toLocaleString('de-DE')} MAD</p>
                                        <p><strong className="font-semibold text-slate-500">Date:</strong> {new Date(p.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                                        {p.status === 'Pending Confirmation' && (
                                            <>
                                                <button onClick={() => handleReject(p)} className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full">Reject</button>
                                                <button onClick={() => handleConfirm(p)} className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Confirm</button>
                                            </>
                                        )}
                                        {p.status === 'Confirmed' && (
                                            <button onClick={() => handleRevert(p)} className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-200 rounded-full"><UndoIcon className="w-3 h-3"/> Revert</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="text-center text-slate-500 py-8">No payments found for the current filter.</p>
                )}
            </div>

            {/* Manual Payment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Add Manual Payment</h3>
                        <form onSubmit={handleManualPaymentSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="student" className="block text-sm font-medium text-slate-700 mb-1">Select Student</label>
                                <select id="student" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md">
                                    <option value="" disabled>-- Select a student --</option>
                                    {users.map(u => <option key={u.email} value={u.email}>{u.firstName} {u.lastName}</option>)}
                                </select>
                            </div>
                            {selectedUserId && (
                                <div>
                                    <label htmlFor="enrollment" className="block text-sm font-medium text-slate-700 mb-1">Select Enrollment</label>
                                    <select id="enrollment" value={selectedEnrollmentId} onChange={e => setSelectedEnrollmentId(e.target.value)} required className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md">
                                        <option value="" disabled>-- Select an enrollment --</option>
                                        {userEnrollments.map(en => {
                                            const item = en.itemType === 'course' ? courses.find(c => c.id === en.itemId) : revisions.find(r => r.id === en.itemId);
                                            return <option key={en.id} value={en.id}>{item?.title}</option>;
                                        })}
                                    </select>
                                </div>
                            )}
                            {selectedEnrollmentId && (
                                 <div>
                                    <label htmlFor="month" className="block text-sm font-medium text-slate-700 mb-1">Payment for Month #</label>
                                    <input type="number" id="month" value={paymentMonth} onChange={e => setPaymentMonth(e.target.value)} required min="1" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md" />
                                 </div>
                            )}
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full">Cancel</button>
                                <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full">Add Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminPaymentsPage;