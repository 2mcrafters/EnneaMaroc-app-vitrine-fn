import React, { useState, useEffect, useRef } from 'react';
import { Revision, RevisionModality, RevisionOption } from '../data/revisions';
import BackArrowIcon from '../components/icons/BackArrowIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { PaperclipIcon } from '../components/icons/PaperclipIcon';
import { LockIcon } from '../components/icons/LockIcon';
import { Instructor } from '../data/instructors';

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


const Accordion: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 bg-white hover:bg-slate-50 transition-colors"
                aria-expanded={isOpen}
            >
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-6 h-6 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-6 bg-slate-50/50 border-t border-slate-200">
                    {children}
                </div>
            )}
        </div>
    );
};

const RevisionDetailPage: React.FC = () => {
  const [revisionData, setRevisionData] = useState<Revision | null>(null);
  const [currentEnrollment, setCurrentEnrollment] = useState<Enrollment | null>(null);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);

  useEffect(() => {
    const revisionId = window.location.hash.split('/').pop();
    if (!revisionId) return;

    const allRevisions: Revision[] = JSON.parse(localStorage.getItem('revisions') || '[]');
    const revision = allRevisions.find(r => r.id === revisionId);
    setRevisionData(revision || null);

    const instructors: Instructor[] = JSON.parse(localStorage.getItem('profs') || '[]');
    setAllInstructors(instructors);

    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const enrollmentsFromStorage: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const enrollmentForThisRevision = enrollmentsFromStorage.find(
            (e) => e.itemId === revisionId && e.userId === storedUser.email
        );
        setCurrentEnrollment(enrollmentForThisRevision || null);
    }
  }, [window.location.hash]);


  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  const handleEnroll = (modality: RevisionModality, option: RevisionOption) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    sessionStorage.setItem('enrollmentType', 'revision');
    sessionStorage.setItem('enrollmentItemId', revisionData!.id);
    sessionStorage.setItem('enrollmentGroup', JSON.stringify({ modalityType: modality.type, ...option }));

    if (isAuthenticated) {
      window.location.hash = '#/confirmation';
    } else {
      sessionStorage.setItem('enrollmentFlow', 'true');
      window.location.hash = '#/signup';
    }
  };

  const renderPaymentStatus = () => {
    if (!currentEnrollment) return null;

    const totalPaymentsMade = currentEnrollment.payments?.length || 0;
    const nextDueMonth = totalPaymentsMade + 1;

    let actionButton = null;
    if (currentEnrollment.status === 'Pending Payment') {
        actionButton = (
            <a href="#/my-courses" onClick={(e) => handleNav(e, '#/my-courses')} className="w-full sm:w-auto text-center px-5 py-3 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 transition-colors">
                Upload First Payment Proof
            </a>
        );
    } else if (currentEnrollment.status === 'Active' && nextDueMonth <= currentEnrollment.durationMonths) {
        actionButton = (
            <a href="#/monthly-payments" onClick={(e) => handleNav(e, '#/monthly-payments')} className="w-full sm:w-auto text-center px-5 py-3 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 transition-colors">
                Manage Monthly Payments
            </a>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <p className="text-sm text-slate-500 mb-4">You are enrolled in the <strong>{currentEnrollment.group.modalityType} - {currentEnrollment.group.type}</strong> session. Status: <strong>{currentEnrollment.status}</strong></p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: currentEnrollment.durationMonths }, (_, i) => i + 1).map(month => {
                  let monthStatus: 'paid' | 'pending' | 'due' | 'locked' = 'locked';
                  const payment = currentEnrollment.payments?.find(p => p.month === month);

                  if (currentEnrollment.status === 'Pending Payment' && month === 1) {
                      monthStatus = 'due';
                  } else if (currentEnrollment.status === 'Pending Confirmation' && month === 1) {
                      monthStatus = 'pending';
                  } else if (payment) {
                      monthStatus = payment.status === 'Confirmed' ? 'paid' : 'pending';
                  } else if (currentEnrollment.status === 'Active') {
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
                        <p className="text-xs text-slate-500 capitalize">{monthStatus}</p>
                      </div>
                  );
              })}
            </div>
            {actionButton && (
                <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                    {actionButton}
                </div>
            )}
        </div>
    );
  };


  if (!revisionData) {
    return (
      <div className="container mx-auto px-6 py-20 text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-900">Revision Not Found</h1>
        <p className="text-slate-600 mt-4">Sorry, we couldn't find the revision session you were looking for.</p>
        <a 
          href="#/" 
          onClick={(e) => handleNav(e, '#/')} 
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900"
        >
          <BackArrowIcon className="w-5 h-5" />
          <span>Back to Home</span>
        </a>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="h-64 md:h-96 w-full overflow-hidden">
        <img src={revisionData.imageUrl} alt={revisionData.title} className="w-full h-full object-cover" />
      </div>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <a 
            href={`#/revisions`} 
            onClick={(e) => handleNav(e, `#/revisions`)} 
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-8 transition-colors"
          >
            <BackArrowIcon className="w-5 h-5" />
            Back to All Revisions
          </a>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">{revisionData.title}</h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">{revisionData.description}</p>
          
          <div className="my-8 p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <p className="text-3xl font-bold text-pistachio-dark">{revisionData.durationMonths}</p>
              <p className="text-sm text-slate-600">Months Duration</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">{currentEnrollment ? 'Your Payment Status' : 'Schedule & Enrollment'}</h2>
            
            {currentEnrollment ? (
              renderPaymentStatus()
            ) : (
              <div className="space-y-4">
                {revisionData.modalities.map((modality) => (
                  <Accordion key={modality.type} title={modality.type}>
                    <div className="space-y-4">
                      {modality.options.map((option, index) => {
                        const instructor = allInstructors.find(p => p.id === option.instructorId);
                        return (
                          <div key={index} className="flex flex-col sm:flex-row items-start justify-between p-4 bg-white rounded-lg gap-4">
                              <div className="flex-grow">
                                <p className="font-bold text-slate-800">{option.type}</p>
                                <p className="text-sm text-slate-600">{option.day}, {option.time}</p>
                                {instructor && (
                                    <div className="flex items-center gap-2 text-xs mt-1 text-slate-500">
                                        <img src={instructor.imageUrl} alt={instructor.name} className="w-5 h-5 rounded-full" />
                                        <span>{instructor.name}</span>
                                    </div>
                                )}
                              </div>
                              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="text-xl font-bold text-slate-800">
                                  {option.price.toLocaleString('de-DE')} MAD / month
                                </div>
                                <button 
                                  onClick={() => handleEnroll(modality, option)}
                                  className="px-6 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                  Enroll
                                </button>
                              </div>
                          </div>
                        )
                      })}
                    </div>
                  </Accordion>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionDetailPage;