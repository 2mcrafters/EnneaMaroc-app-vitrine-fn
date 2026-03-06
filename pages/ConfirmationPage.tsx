import React, { useState, useEffect } from 'react';
import { Course, CourseGroup } from '../data/courses';
import { Revision, RevisionOption } from '../data/revisions';
import { BankIcon } from '../components/icons/BankIcon';

type GenericItem = (Course | Revision) & { durationMonths: number };
type GenericGroup = CourseGroup | (RevisionOption & { modalityType: string });

interface User {
    firstName: string;
    lastName: string;
    email: string;
    hasPaidRegistrationFee?: boolean;
}

const ConfirmationPage: React.FC = () => {
  const [item, setItem] = useState<GenericItem | null>(null);
  const [group, setGroup] = useState<GenericGroup | null>(null);
  const [itemType, setItemType] = useState<'course' | 'revision' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const REGISTRATION_FEE = 250;

  useEffect(() => {
    const type = sessionStorage.getItem('enrollmentType') as 'course' | 'revision' | null;
    const itemId = sessionStorage.getItem('enrollmentItemId');
    const groupJSON = sessionStorage.getItem('enrollmentGroup');
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
    
    if (type && itemId && groupJSON) {
      setItemType(type);
      if (type === 'course') {
        const allCourses: Course[] = JSON.parse(localStorage.getItem('courses') || '[]');
        setItem(allCourses.find(c => c.id === itemId) as GenericItem || null);
      } else {
        const allRevisions: Revision[] = JSON.parse(localStorage.getItem('revisions') || '[]');
        setItem(allRevisions.find(r => r.id === itemId) as GenericItem || null);
      }
      setGroup(JSON.parse(groupJSON));
    } else {
      // If no data, maybe redirect home
      window.location.hash = '#/';
    }
  }, []);

  const handleConfirmEnrollment = () => {
    if (!item || !group || !itemType || !user) return;

    // Retrieve existing enrollments or initialize a new array
    const existingEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    // Create new enrollment object
    const newEnrollment = {
      id: `${item.id}-${new Date().getTime()}`, // Simple unique ID
      itemId: item.id,
      itemType: itemType,
      group,
      status: 'Pending Payment',
      enrolledDate: new Date().toISOString(),
      paymentProof: null,
      payments: [],
      userId: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      durationMonths: item.durationMonths,
    };

    // Add new enrollment and save to localStorage
    existingEnrollments.push(newEnrollment);
    localStorage.setItem('enrollments', JSON.stringify(existingEnrollments));

    // If the fee was charged, update the user's permanent record
    if (!user.hasPaidRegistrationFee) {
        const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = allUsers.map(u => 
            u.email === user.email ? { ...u, hasPaidRegistrationFee: true } : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Also update the currently logged-in user's data
        const updatedCurrentUser = { ...user, hasPaidRegistrationFee: true };
        localStorage.setItem('user', JSON.stringify(updatedCurrentUser));
    }

    // Clean up session storage
    sessionStorage.removeItem('enrollmentType');
    sessionStorage.removeItem('enrollmentItemId');
    sessionStorage.removeItem('enrollmentGroup');
    sessionStorage.removeItem('enrollmentFlow');

    // Redirect to My Courses page
    window.location.hash = '#/my-courses';
  };

  if (!item || !group || !user) {
    return <div className="text-center py-20">Loading confirmation...</div>;
  }
  
  const isRevision = 'modalityType' in group;
  const requiresRegistrationFee = !user.hasPaidRegistrationFee;
  const totalDue = group.price + (requiresRegistrationFee ? REGISTRATION_FEE : 0);

  return (
    <div className="container mx-auto px-6 py-12 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 text-center">Confirm Your Enrollment</h1>
        
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Details</h2>
            <img src={item.imageUrl} alt={item.title} className="rounded-lg mb-4 aspect-video object-cover" />
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-slate-600 mt-2">
              You are enrolling in: <strong>
                {isRevision 
                    ? `${(group as any).modalityType} - ${(group as any).type} (${(group as any).day} at ${(group as any).time})` 
                    : `${(group as any).day} at ${(group as any).time}`
                }
              </strong>.
            </p>
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-2 text-lg">
              <div className="flex justify-between items-center text-slate-600">
                <span>First Month's Payment</span>
                <span>{group.price.toLocaleString('de-DE')} MAD</span>
              </div>
              {requiresRegistrationFee && (
                <div className="flex justify-between items-center text-slate-600">
                    <span>Registration Fee (one-time)</span>
                    <span>{REGISTRATION_FEE.toLocaleString('de-DE')} MAD</span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold text-slate-900 pt-2 border-t">
                <span>Total Due</span>
                <span className="text-2xl text-pistachio-dark">{totalDue.toLocaleString('de-DE')} MAD</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Payment Information</h2>
            <p className="text-slate-600 mb-6">To complete your enrollment, please make the payment using one of the methods below. Your spot will be reserved upon confirmation of payment.</p>
            
            <div className="space-y-4 text-slate-700">
               <div className="flex items-start">
                  <BankIcon className="w-8 h-8 text-pistachio-dark mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Bank Transfer</h4>
                    <p className="text-sm">Please use your full name and item title as the payment reference.</p>
                  </div>
               </div>
               <ul className="text-sm space-y-2 pl-12">
                  <li><strong>Bank:</strong> International Bank of Code</li>
                  <li><strong>Account Number:</strong> MA64 0000 1234 5678 9101 1121</li>
                  <li><strong>Beneficiary:</strong> Course Enrollment Center</li>
                   <li><strong>Reference:</strong> {`${user.firstName} ${user.lastName} - ${item.title}`}</li>
               </ul>
               <div className="flex items-start pt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-pistachio-dark mr-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.158-.103.346-.195.574-.277a6.213 6.213 0 014.22.613A4.21 4.21 0 0115 11.231V12.5a.5.5 0 01-1 0v-1.269a3.21 3.21 0 00-3-3.21H8.5a.5.5 0 01-.067-.982z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v5.562l-2.5 2.5a1 1 0 001.414 1.414l3-3A1 1 0 0011 10.562V5z" clipRule="evenodd" /></svg>
                   <div>
                    <h4 className="font-semibold">In-Person Payment</h4>
                    <p className="text-sm">You can also pay directly at our center's reception desk.</p>
                  </div>
               </div>
            </div>
            
            <button 
              onClick={handleConfirmEnrollment}
              className="mt-8 w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-pistachio-dark hover:bg-lime-900 transition-colors"
            >
              Confirm Enrollment Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;