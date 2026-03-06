
import React, { useState, useEffect, useRef } from 'react';
import { Course, CourseGroup } from '../data/courses';
import { Revision, RevisionOption } from '../data/revisions';
import { PaperclipIcon } from '../components/icons/PaperclipIcon';

type GenericGroup = CourseGroup | (RevisionOption & { modalityType: string });

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
  group: GenericGroup;
  status: 'Pending Payment' | 'Pending Confirmation' | 'Active' | 'Cancelled';
  enrolledDate: string;
  paymentProof: string | null;
  userId: string;
  userName: string;
  payments?: Payment[];
  durationMonths: number;
}

interface User {
    email: string;
    hasPaidRegistrationFee?: boolean;
}

type ActiveTab = 'in-person' | 'online' | 'revisions';

const StatusBadge: React.FC<{ status: Enrollment['status'] }> = ({ status }) => {
  const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0";
  const statusClasses = {
    'Pending Payment': "bg-yellow-100 text-yellow-800",
    'Pending Confirmation': "bg-blue-100 text-blue-800",
    'Active': "bg-green-100 text-green-800",
    'Cancelled': "bg-red-100 text-red-800",
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};


const MyCoursesPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('in-person');
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allRevisions, setAllRevisions] = useState<Revision[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);

  useEffect(() => {
    const storedEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    const userEnrollments = storedEnrollments.filter((e: Enrollment) => e.userId === user.email);
    setEnrollments(userEnrollments);
    
    setAllCourses(JSON.parse(localStorage.getItem('courses') || '[]'));
    setAllRevisions(JSON.parse(localStorage.getItem('revisions') || '[]'));
  }, []);
  
  const getItemDetails = (itemId: string, itemType: 'course' | 'revision'): Course | Revision | undefined => {
    if (itemType === 'course') {
      return allCourses.find(c => c.id === itemId);
    }
    return allRevisions.find(r => r.id === itemId);
  };

  const handleCancelEnrollment = (enrollmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this enrollment? This action cannot be undone.')) {
        const allEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const updatedEnrollments = allEnrollments.map((e: Enrollment) => 
            e.id === enrollmentId ? { ...e, status: 'Cancelled' as const } : e
        );
        localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));
        
        // Update local state
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userEnrollments = updatedEnrollments.filter((e: Enrollment) => e.userId === user.email);
        setEnrollments(userEnrollments);
    }
  };

  const handleUploadClick = (enrollmentId: string) => {
    setSelectedEnrollmentId(enrollmentId);
    fileInputRef.current?.click();
  };
  
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedEnrollmentId) {
      const file = e.target.files[0];
      const id = selectedEnrollmentId;
      
      const allEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
      const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const userRecord = allUsers.find(u => u.email === currentUser?.email);

      const updatedEnrollments = allEnrollments.map((en: Enrollment) => {
        if (en.id === id && en.status === 'Pending Payment') {
            const requiresFee = !userRecord?.hasPaidRegistrationFee;
            const REGISTRATION_FEE = 250;
            const amount = en.group.price + (requiresFee ? REGISTRATION_FEE : 0);

            const firstPayment: Payment = {
                date: new Date().toISOString(),
                amount: amount,
                proof: file.name,
                status: 'Pending Confirmation',
                month: 1,
            };

            const payments = en.payments ? [...en.payments, firstPayment] : [firstPayment];

            return { 
                ...en, 
                paymentProof: file.name, // Keep for compatibility but don't rely on it
                status: 'Pending Confirmation' as const, 
                payments: payments
            };
        }
        return en;
      });

      alert(`Proof "${file.name}" for the first month submitted! Your payment is now pending confirmation.`);

      localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));
      
      const userEnrollments = updatedEnrollments.filter((e: Enrollment) => e.userId === currentUser?.email);
      setEnrollments(userEnrollments);

      setSelectedEnrollmentId(null);
    }
  };


  const getEnrollmentsForType = (type: ActiveTab) => {
    return enrollments.filter(enrollment => {
        const item = getItemDetails(enrollment.itemId, enrollment.itemType);
        if (!item) return false;
        switch (type) {
          case 'revisions': return enrollment.itemType === 'revision';
          case 'in-person': return enrollment.itemType === 'course' && (item as Course).type === 'in-person';
          case 'online': return enrollment.itemType === 'course' && (item as Course).type === 'online';
          default: return false;
        }
    });
  }

  const inPersonEnrollments = getEnrollmentsForType('in-person');
  const onlineEnrollments = getEnrollmentsForType('online');
  const revisionEnrollments = getEnrollmentsForType('revisions');

  const EnrollmentList: React.FC<{enrollments: Enrollment[]}> = ({enrollments}) => {
    if (enrollments.length === 0) {
        return <p className="text-center text-slate-600 mt-8">You have no enrollments in this category.</p>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
          {enrollments.map(enrollment => {
            const item = getItemDetails(enrollment.itemId, enrollment.itemType);
            if (!item) return null;
            
            const confirmedPaymentsCount = enrollment.payments?.filter(p => p.status === 'Confirmed').length || 0;
            const totalMonths = enrollment.durationMonths;
            const progressPercentage = totalMonths > 0 ? (confirmedPaymentsCount / totalMonths) * 100 : 0;
            const showFeeNotice = enrollment.status === 'Pending Payment' && !currentUser?.hasPaidRegistrationFee;

            return (
              <div key={enrollment.id} className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col transition-shadow hover:shadow-xl">
                 <a href={`#/${enrollment.itemType}/${enrollment.itemId}`} onClick={(e) => handleNav(e, `#/${enrollment.itemType}/${enrollment.itemId}`)} className="block p-4 flex-grow hover:bg-slate-50/50 transition-colors rounded-t-xl">
                   <div className="flex flex-row gap-4 items-start">
                     <img src={item.imageUrl} alt={item.title} className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg flex-shrink-0" />
                     <div className="flex-grow min-w-0">
                       <div className="flex justify-between items-start gap-2">
                         <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{item.title}</h2>
                         <StatusBadge status={enrollment.status} />
                       </div>
                        <p className="text-sm text-slate-500 mt-1">Enrolled: {new Date(enrollment.enrolledDate).toLocaleDateString()}</p>

                       {(enrollment.status === 'Active' || (enrollment.status === 'Cancelled' && confirmedPaymentsCount > 0)) && totalMonths > 0 && (
                         <div className="mt-4">
                           <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-slate-600 mb-1">
                             <span>Progress</span>
                             <span>{confirmedPaymentsCount}/{totalMonths} Paid</span>
                           </div>
                           <div className="w-full bg-slate-200 rounded-full h-2.5">
                             <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                           </div>
                         </div>
                       )}

                       {enrollment.status === 'Pending Confirmation' && (
                           <p className="mt-4 text-sm text-blue-600">Initial payment is pending confirmation.</p>
                       )}
                       {enrollment.status === 'Pending Payment' && (
                           <p className="mt-4 text-sm text-yellow-600">Enrollment is pending first month's payment.
                           {showFeeNotice && <><br/><span className="text-xs italic">(Includes 250 DH registration fee)</span></>}
                           </p>
                       )}
                     </div>
                   </div>
                 </a>
                
                {(enrollment.status !== 'Cancelled') && (
                  <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3 rounded-b-xl">
                    {enrollment.status === 'Pending Payment' && (
                      <>
                        <button 
                          onClick={() => handleUploadClick(enrollment.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 transition-colors"
                        >
                          <PaperclipIcon className="w-4 h-4" />
                          Upload Proof (Month 1)
                        </button>
                      </>
                    )}
                    
                     {enrollment.status === 'Active' && (
                        <a 
                            href="#/monthly-payments"
                            onClick={(e) => handleNav(e, '#/monthly-payments')}
                            className="px-4 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 transition-colors"
                        >
                            Manage Monthly Payments
                        </a>
                    )}
                    
                    {enrollment.status !== 'Pending Payment' && (
                         <button 
                          onClick={() => handleCancelEnrollment(enrollment.id)}
                          className="px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                         >
                          Cancel Enrollment
                         </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
    )
  };
  
  const TabButton: React.FC<{ tab: ActiveTab; label: string; }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 sm:px-6 py-3 text-sm font-semibold transition-colors duration-300 focus:outline-none ${
        activeTab === tab
          ? 'border-b-2 border-pistachio-dark text-pistachio-dark'
          : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
      }`}
      role="tab"
      aria-selected={activeTab === tab}
    >
      {label}
    </button>
  );

  return (
    <div className="container mx-auto px-6 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 text-center">My Enrollments</h1>

      {/* Desktop Tabs */}
       <div className="mb-10 hidden md:flex justify-center border-b border-slate-200" role="tablist">
        <TabButton tab="in-person" label="In-Person Courses" />
        <TabButton tab="online" label="Online Courses" />
        <TabButton tab="revisions" label="Revision Sessions" />
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        className="hidden" 
        accept="image/*,.pdf"
      />
        
      {/* Mobile Stacked Layout */}
      <div className="md:hidden space-y-12">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center border-b pb-4">In-Person Courses</h2>
            <EnrollmentList enrollments={inPersonEnrollments} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center border-b pb-4">Online Courses</h2>
            <EnrollmentList enrollments={onlineEnrollments} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center border-b pb-4">Revision Sessions</h2>
            <EnrollmentList enrollments={revisionEnrollments} />
        </div>
      </div>

      {/* Desktop Tab Content */}
      <div className="hidden md:block">
        {activeTab === 'in-person' && <EnrollmentList enrollments={inPersonEnrollments} />}
        {activeTab === 'online' && <EnrollmentList enrollments={onlineEnrollments} />}
        {activeTab === 'revisions' && <EnrollmentList enrollments={revisionEnrollments} />}
      </div>
    </div>
  );
};

export default MyCoursesPage;
