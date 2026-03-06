
import React, { useState, useEffect } from 'react';
import Logo from './components/Logo';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import CourseDetailPage from './pages/CourseDetailPage';
import CoursesListPage from './pages/CoursesListPage';
import ConfirmationPage from './pages/ConfirmationPage';
import MyCoursesPage from './pages/MyCoursesPage';
import RevisionsListPage from './pages/RevisionsListPage';
import RevisionDetailPage from './pages/RevisionDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminStudentsListPage from './pages/AdminStudentsListPage';
import AdminStudentDetailPage from './pages/AdminStudentDetailPage';
import AdminProfFormPage from './pages/AdminProfFormPage';
import AdminCoursesListPage from './pages/AdminCoursesListPage';
import AdminCourseFormPage from './pages/AdminCourseFormPage';
import AdminRevisionsListPage from './pages/AdminRevisionsListPage';
import AdminRevisionFormPage from './pages/AdminRevisionFormPage';
import MonthlyPaymentsPage from './pages/MonthlyPaymentsPage';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import BottomNav from './components/BottomNav';
import { courses as initialCourses } from './data/courses';
import { revisions as initialRevisions } from './data/revisions';
import { instructors as initialInstructors } from './data/instructors';
import AdminStudentFormPage from './pages/AdminStudentFormPage';
// FIX: Import AdminProfsListPage to resolve 'Cannot find name' error.
import AdminProfsListPage from './pages/AdminProfsListPage';
import ProfDashboardPage from './pages/ProfDashboardPage';
import ProfProfilePage from './pages/ProfProfilePage';
import SchedulePage from './pages/SchedulePage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';
import AdminEmployeesListPage from './pages/AdminEmployeesListPage';
import AdminEmployeeFormPage from './pages/AdminEmployeeFormPage';
import AdminProfilePage from './pages/AdminProfilePage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';

// A simple hash-based router
const useHashNavigation = () => {
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');
  
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return currentPath;
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const currentPath = useHashNavigation();
  const REGISTRATION_FEE = 250;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);

    // --- Fake Data Seeding ---
    const isSeeded = localStorage.getItem('enrollments_seeded');
    if (!isSeeded) {
       const fakeUsers = [
        {
            firstName: 'John',
            lastName: 'Doe',
            email: 'test@example.com',
            dob: '1990-01-01',
            nationalId: '123456789',
            city: 'New York',
            phone: '123-456-7890',
            profilePicture: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
            hasPaidRegistrationFee: true, // John has paid his one-time fee
        },
        {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            dob: '1992-05-15',
            nationalId: '987654321',
            city: 'London',
            phone: '098-765-4321',
            profilePicture: 'https://i.pravatar.cc/150?u=jane',
            hasPaidRegistrationFee: true, // Jane has also paid her fee
        }
      ];
      localStorage.setItem('users', JSON.stringify(fakeUsers));

      const webDevCourse = initialCourses.find(c => c.id === 'web-development-bootcamp')!;
      const dataScienceCourse = initialCourses.find(c => c.id === 'data-science-immersive')!;
      const uxDesignCourse = initialCourses.find(c => c.id === 'ux-design-fundamentals')!;
      const marketingCourse = initialCourses.find(c => c.id === 'digital-marketing-masterclass')!;
      const mathRevision = initialRevisions.find(r => r.id === 'math-final-prep')!;
      const physicsRevision = initialRevisions.find(r => r.id === 'physics-olympiad-training')!;
      
      const fakeEnrollments = [
          // Enrollments for John Doe
          { // Active course, 1 month paid, 1 pending. This was his FIRST enrollment, so fee was paid.
            id: 'web-dev-1',
            itemId: webDevCourse.id,
            itemType: 'course',
            group: webDevCourse.groups[0],
            status: 'Active',
            enrolledDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
            paymentProof: null,
            userId: 'test@example.com',
            userName: 'John Doe',
            durationMonths: webDevCourse.durationMonths,
            payments: [
              {
                date: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000).toISOString(),
                amount: webDevCourse.groups[0].price + REGISTRATION_FEE,
                proof: 'receipt_web_dev_m1.pdf',
                status: 'Confirmed',
                month: 1,
              },
              {
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                amount: webDevCourse.groups[0].price,
                proof: 'receipt_web_dev_m2.pdf',
                status: 'Pending Confirmation',
                month: 2,
              }
            ],
          },
          { // Pending initial payment confirmation. Fee NOT required as he's an existing student.
            id: 'data-science-1',
            itemId: dataScienceCourse.id,
            itemType: 'course',
            group: dataScienceCourse.groups[0],
            status: 'Pending Confirmation',
            enrolledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            paymentProof: 'payment_ds.png',
            userId: 'test@example.com',
            userName: 'John Doe',
            durationMonths: dataScienceCourse.durationMonths,
            payments: [],
          },
          { // Pending initial payment. Fee NOT required.
            id: 'math-prep-1',
            itemId: mathRevision.id,
            itemType: 'revision',
            group: { modalityType: 'Online', ...mathRevision.modalities[0].options[0] },
            status: 'Pending Payment',
            enrolledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            paymentProof: null,
            userId: 'test@example.com',
            userName: 'John Doe',
            durationMonths: mathRevision.durationMonths,
            payments: [],
          },
          { // Cancelled
              id: 'ux-design-1',
              itemId: uxDesignCourse.id,
              itemType: 'course',
              group: uxDesignCourse.groups[1],
              status: 'Cancelled',
              enrolledDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
              paymentProof: null,
              userId: 'test@example.com',
              userName: 'John Doe',
              durationMonths: uxDesignCourse.durationMonths,
              payments: [],
          },
          // Enrollments for Jane Smith
          { // Pending initial confirmation. Fee NOT required.
              id: 'ux-design-jane-1',
              itemId: uxDesignCourse.id,
              itemType: 'course',
              group: uxDesignCourse.groups[0],
              status: 'Pending Confirmation',
              enrolledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              paymentProof: 'jane_ux_payment.jpg',
              userId: 'jane@example.com',
              userName: 'Jane Smith',
              durationMonths: uxDesignCourse.durationMonths,
              payments: [],
          },
          { // Active, 2 months paid. This was her FIRST enrollment, so fee was paid.
              id: 'physics-jane-1',
              itemId: physicsRevision.id,
              itemType: 'revision',
              group: { modalityType: 'In-Person', ...physicsRevision.modalities[0].options[0] },
              status: 'Active',
              enrolledDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
              paymentProof: null,
              userId: 'jane@example.com',
              userName: 'Jane Smith',
              durationMonths: physicsRevision.durationMonths,
              payments: [
                {
                  date: new Date(Date.now() - 69 * 24 * 60 * 60 * 1000).toISOString(),
                  amount: physicsRevision.modalities[0].options[0].price + REGISTRATION_FEE,
                  proof: 'physics_receipt_m1.pdf',
                  status: 'Confirmed',
                  month: 1,
                },
                {
                  date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
                  amount: physicsRevision.modalities[0].options[0].price,
                  proof: 'physics_receipt_m2.pdf',
                  status: 'Confirmed',
                  month: 2,
                }
              ]
          },
          { // Pending initial payment. Fee NOT required.
              id: 'digital-marketing-jane-1',
              itemId: marketingCourse.id,
              itemType: 'course',
              group: marketingCourse.groups[0],
              status: 'Pending Payment',
              enrolledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              paymentProof: null,
              userId: 'jane@example.com',
              userName: 'Jane Smith',
              durationMonths: marketingCourse.durationMonths,
              payments: [],
          },
      ];
        localStorage.setItem('enrollments', JSON.stringify(fakeEnrollments));
        localStorage.setItem('enrollments_seeded', 'true');
    }
    
    const isProfsSeeded = localStorage.getItem('profs_seeded');
    if (!isProfsSeeded) {
        localStorage.setItem('profs', JSON.stringify(initialInstructors));
        localStorage.setItem('profs_seeded', 'true');
    }
    
    const isEmployeesSeeded = localStorage.getItem('employees_seeded');
    if (!isEmployeesSeeded) {
      const fakeEmployees = [
        {
          id: 'emily-employee-123',
          name: 'Emily Employee',
          email: 'emily@example.com',
          imageUrl: 'https://i.pravatar.cc/150?u=emily'
        }
      ];
      localStorage.setItem('employees', JSON.stringify(fakeEmployees));
      localStorage.setItem('employees_seeded', 'true');
    }

    const areCoursesSeeded = localStorage.getItem('courses_seeded');
    if (!areCoursesSeeded) {
        localStorage.setItem('courses', JSON.stringify(initialCourses));
        localStorage.setItem('courses_seeded', 'true');
    }
    const areRevisionsSeeded = localStorage.getItem('revisions_seeded');
    if (!areRevisionsSeeded) {
        localStorage.setItem('revisions', JSON.stringify(initialRevisions));
        localStorage.setItem('revisions_seeded', 'true');
    }

    // Add pre-cancelled sessions for demo purposes
    const isCancelledSeeded = localStorage.getItem('cancellations_seeded');
    if (!isCancelledSeeded) {
        const getNextDateForDayOfWeek = (targetDayIndex: number) => { // 0=Sun, 1=Mon, ..., 6=Sat
            const today = new Date();
            const dayOfWeek = today.getDay();
            let dayDiff = targetDayIndex - dayOfWeek;
            if (dayDiff < 0) {
                dayDiff += 7;
            }
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + dayDiff);
            return nextDate.toISOString().split('T')[0];
        };

        const cancellations = [];

        // Cancellation 1: Web Dev Bootcamp on upcoming Wednesday
        const wednesdayDate = getNextDateForDayOfWeek(3); // Wednesday
        const wednesdayIdentifier = "Wednesdays-10:00AM-12:00PM".replace(/[\s,:&]/g, '');
        cancellations.push(`web-development-bootcamp_${wednesdayIdentifier}_${wednesdayDate}`);
        
        // Cancellation 2: UX Design on upcoming Thursday
        const thursdayDate = getNextDateForDayOfWeek(4); // Thursday
        const thursdayIdentifier = "Thursdays-03:00PM-05:00PM".replace(/[\s,:&]/g, '');
        cancellations.push(`ux-design-fundamentals_${thursdayIdentifier}_${thursdayDate}`);

        // Cancellation 3: Physics Olympiad on upcoming Friday
        const fridayDate = getNextDateForDayOfWeek(5); // Friday
        const fridayIdentifier = "Online-Both-Fridays-05:00PM-08:00PM".replace(/[\s,:&]/g, '');
        cancellations.push(`physics-olympiad-training_${fridayIdentifier}_${fridayDate}`);

        localStorage.setItem('session_cancellations', JSON.stringify(cancellations));
        localStorage.setItem('cancellations_seeded', 'true');
    }

    // --- End Fake Data Seeding ---

    return () => clearTimeout(timer);
  }, []);

  const renderPage = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    const canManageContent = isAuthenticated && (userRole === 'admin' || userRole === 'employee');
    const canManagePeople = isAuthenticated && (userRole === 'admin' || userRole === 'employee');

    if (currentPath.startsWith('#/courses/')) {
        return <CoursesListPage />;
    }
    if (currentPath.startsWith('#/course/')) {
      return <CourseDetailPage key={currentPath} />; // Use path as key to force re-render
    }
    if (currentPath.startsWith('#/revisions')) {
        return <RevisionsListPage />;
    }
    if (currentPath.startsWith('#/revision/')) {
      return <RevisionDetailPage key={currentPath} />;
    }
    if (currentPath.startsWith('#/admin/student/')) {
        return canManagePeople ? <AdminStudentDetailPage /> : <LoginPage />;
    }
    if (currentPath.startsWith('#/admin/students/edit/')) {
        return canManagePeople ? <AdminStudentFormPage key={currentPath} /> : <LoginPage />;
    }
    if (currentPath.startsWith('#/admin/profs/edit/')) {
      return canManagePeople ? <AdminProfFormPage key={currentPath} /> : <LoginPage />;
    }
    if (currentPath.startsWith('#/admin/employees/edit/')) {
      return isAuthenticated && userRole === 'admin' ? <AdminEmployeeFormPage key={currentPath} /> : <LoginPage />;
    }
    if (currentPath.startsWith('#/admin/courses/edit/')) {
      return canManageContent ? <AdminCourseFormPage key={currentPath} /> : <LoginPage />;
    }
    if (currentPath.startsWith('#/admin/revisions/edit/')) {
      return canManageContent ? <AdminRevisionFormPage key={currentPath} /> : <LoginPage />;
    }

    switch (currentPath) {
      case '#/login':
        return <LoginPage />;
      case '#/signup':
        return <SignUpPage />;
      case '#/dashboard':
        return isAuthenticated && userRole === 'student' ? <StudentDashboardPage /> : <LoginPage />;
      case '#/profile':
        return isAuthenticated && userRole === 'student' ? <ProfilePage /> : <LoginPage />;
      case '#/my-courses':
        return isAuthenticated && userRole === 'student' ? <MyCoursesPage /> : <LoginPage />;
      case '#/monthly-payments':
        return isAuthenticated && userRole === 'student' ? <MonthlyPaymentsPage /> : <LoginPage />;
      case '#/confirmation':
        return isAuthenticated ? <ConfirmationPage /> : <LoginPage />;
      case '#/schedule':
        return isAuthenticated ? <SchedulePage /> : <LoginPage />;
      case '#/prof/dashboard':
        return isAuthenticated && userRole === 'prof' ? <ProfDashboardPage /> : <LoginPage />;
      case '#/prof/profile':
        return isAuthenticated && userRole === 'prof' ? <ProfProfilePage /> : <LoginPage />;
      case '#/employee/dashboard':
        return isAuthenticated && userRole === 'employee' ? <EmployeeDashboardPage /> : <LoginPage />;
      case '#/employee/profile':
        return isAuthenticated && userRole === 'employee' ? <EmployeeProfilePage /> : <LoginPage />;
      case '#/admin/dashboard':
        return isAuthenticated && userRole === 'admin' ? <AdminDashboardPage /> : <LoginPage />;
      case '#/admin/profile':
        return isAuthenticated && userRole === 'admin' ? <AdminProfilePage /> : <LoginPage />;
      case '#/admin/students':
        return canManagePeople ? <AdminStudentsListPage /> : <LoginPage />;
      case '#/admin/students/new':
        return canManagePeople ? <AdminStudentFormPage /> : <LoginPage />;
      case '#/admin/profs':
        return canManagePeople ? <AdminProfsListPage /> : <LoginPage />;
      case '#/admin/profs/new':
        return canManagePeople ? <AdminProfFormPage /> : <LoginPage />;
      case '#/admin/employees':
        return isAuthenticated && userRole === 'admin' ? <AdminEmployeesListPage /> : <LoginPage />;
      case '#/admin/employees/new':
        return isAuthenticated && userRole === 'admin' ? <AdminEmployeeFormPage /> : <LoginPage />;
       case '#/admin/courses':
        return canManageContent ? <AdminCoursesListPage /> : <LoginPage />;
      case '#/admin/courses/new':
        return canManageContent ? <AdminCourseFormPage /> : <LoginPage />;
      case '#/admin/revisions':
        return canManageContent ? <AdminRevisionsListPage /> : <LoginPage />;
      case '#/admin/revisions/new':
        return canManageContent ? <AdminRevisionFormPage /> : <LoginPage />;
      case '#/admin/payments':
        return canManageContent ? <AdminPaymentsPage /> : <LoginPage />;
      case '#/':
      default:
        return <LandingPage />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pistachio-light animate-fade-out">
        <div className="animate-fade-in">
          <Logo className="h-24 w-24 text-pistachio-dark" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans animate-fade-in">
      <Header />
      <main className="pb-24 md:pb-0">
        {renderPage()}
      </main>
      <BottomNav />
    </div>
  );
};

export default App;
