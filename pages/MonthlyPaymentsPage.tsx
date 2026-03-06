import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../data/courses';
import { Revision } from '../data/revisions';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { PaperclipIcon } from '../components/icons/PaperclipIcon';
import { LockIcon } from '../components/icons/LockIcon';

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
  group: any;
  status: 'Pending Payment' | 'Pending Confirmation' | 'Active' | 'Cancelled';
  enrolledDate: string;
  paymentProof: string | null;
  userId: string;
  userName: string;
  payments?: Payment[];
  durationMonths: number;
}

const MonthlyPaymentsPage: React.FC = () => {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [allRevisions, setAllRevisions] = useState<Revision[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedEnrollmentForPayment, setSelectedEnrollmentForPayment] = useState<{ id: string; month: number } | null>(null);

    const loadData = () => {
        const storedEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userEnrollments = storedEnrollments.filter(e => e.userId === user.email && e.status === 'Active');
        setEnrollments(userEnrollments);

        setAllCourses(JSON.parse(localStorage.getItem('courses') || '[]'));
        setAllRevisions(JSON.parse(localStorage.getItem('revisions') || '[]'));
    };

    useEffect(() => {
        loadData();
    }, []);
    
    const getItemDetails = (itemId: string, itemType: 'course' | 'revision'): Course | Revision | undefined => {
        if (itemType === 'course') {
            return allCourses.find(c => c.id === itemId);
        }
        return allRevisions.find(r => r.id === itemId);
    };
    
    const handleUploadClick = (enrollmentId: string, month: number) => {
        setSelectedEnrollmentForPayment({ id: enrollmentId, month });
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedEnrollmentForPayment) {
            const file = e.target.files[0];
            const { id, month } = selectedEnrollmentForPayment;
            
            const allEnrollmentsFromStorage: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
            const updatedEnrollments = allEnrollmentsFromStorage.map(en => {
                if (en.id === id) {
                    const newPayment: Payment = {
                        date: new Date().toISOString(),
                        amount: en.group.price,
                        proof: file.name,
                        status: 'Pending Confirmation',
                        month,
                    };
                    const payments = en.payments ? [...en.payments, newPayment] : [newPayment];
                    return { ...en, payments };
                }
                return en;
            });

            alert(`Proof "${file.name}" for month ${month} submitted! Your payment is now pending confirmation.`);
            
            localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));
            loadData(); // Reload data to reflect changes
            setSelectedEnrollmentForPayment(null);
        }
    };
    
    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 text-center">Manage Monthly Payments</h1>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                className="hidden" 
                accept="image/*,.pdf"
            />
            
            {enrollments.length > 0 ? (
                <div className="max-w-4xl mx-auto space-y-8">
                    {enrollments.map(enrollment => {
                        const item = getItemDetails(enrollment.itemId, enrollment.itemType);
                        if (!item) return null;
                        
                        return (
                             <div key={enrollment.id} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                                <div className="flex flex-col sm:flex-row gap-6 mb-6">
                                     <img src={item.imageUrl} alt={item.title} className="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0" />
                                     <div className="flex-grow">
                                        <h2 className="text-2xl font-bold text-slate-800">{item.title}</h2>
                                        <p className="text-sm text-slate-500 mt-1">Active since: {new Date(enrollment.payments![0].date).toLocaleDateString()}</p>
                                     </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                  {Array.from({ length: enrollment.durationMonths }, (_, i) => i + 1).map(month => {
                                      let monthStatus: 'paid' | 'pending' | 'due' | 'locked' = 'locked';
                                      const payment = enrollment.payments?.find(p => p.month === month);

                                      if (payment) {
                                          monthStatus = payment.status === 'Confirmed' ? 'paid' : 'pending';
                                      } else {
                                          const totalPaymentsMade = enrollment.payments?.length || 0;
                                          const nextDueMonth = totalPaymentsMade + 1;
                                          if (month === nextDueMonth) {
                                              monthStatus = 'due';
                                          }
                                      }

                                      return (
                                          <div key={month} className={`p-3 rounded-lg text-center border ${
                                              {'paid': 'bg-green-50 border-green-200', 'pending': 'bg-blue-50 border-blue-200', 'due': 'bg-yellow-50 border-yellow-300', 'locked': 'bg-slate-50 border-slate-200'}[monthStatus]
                                          }`}>
                                            <p className="font-bold text-sm text-slate-800">Month {month}</p>
                                            <div className="my-2 flex justify-center">
                                                {monthStatus === 'paid' && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                                                {monthStatus === 'pending' && <ClockIcon className="w-6 h-6 text-blue-500" />}
                                                {monthStatus === 'due' && <PaperclipIcon className="w-6 h-6 text-yellow-600" />}
                                                {monthStatus === 'locked' && <LockIcon className="w-6 h-6 text-slate-400" />}
                                            </div>
                                            {monthStatus === 'due' ? (
                                               <button onClick={() => handleUploadClick(enrollment.id, month)} className="w-full text-xs font-semibold text-yellow-900 bg-yellow-300 hover:bg-yellow-400 rounded-full py-1 transition-colors">Pay Now</button>
                                            ) : (
                                               <p className="text-xs text-slate-500 capitalize">{monthStatus}</p>
                                            )}
                                          </div>
                                      );
                                  })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-center text-slate-600 mt-8">You have no active enrollments with recurring payments.</p>
            )}
        </div>
    );
};

export default MonthlyPaymentsPage;