

import React, { useState, useEffect } from 'react';
import InputField from '../components/InputField';
import { InfoIcon } from '../components/icons/InfoIcon';
import { Instructor } from '../data/instructors';

interface Employee {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
}

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('password');
    const [role, setRole] = useState<'student-john' | 'student-jane' | 'admin' | 'prof' | 'employee'>('student-john');
    const [error, setError] = useState('');
    const [isEnrollmentFlow, setIsEnrollmentFlow] = useState(false);
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        if (sessionStorage.getItem('enrollmentFlow') === 'true') {
            setIsEnrollmentFlow(true);
        }
        // Set initial state based on default role
        handleRoleChange('student-john');
    }, []);

    const handleRoleChange = (selectedRole: 'student-john' | 'student-jane' | 'admin' | 'prof' | 'employee') => {
        setRole(selectedRole);
        if (selectedRole === 'admin') {
            setEmail('admin@admin.com');
            setPassword('admin');
        } else if (selectedRole === 'student-jane') {
            setEmail('jane@example.com');
            setPassword('password');
        } else if (selectedRole === 'prof') {
            setEmail('evelyn.reed@example.com');
            setPassword('password');
        } else if (selectedRole === 'employee') {
            setEmail('emily@example.com');
            setPassword('password');
        } else { // student-john
            setEmail('test@example.com');
            setPassword('password');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (role === 'admin') {
            if (email === 'admin@admin.com' && password === 'admin') {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userRole', 'admin');
                const adminUser = {
                    firstName: 'Admin',
                    lastName: 'User',
                    email: 'admin@admin.com',
                };
                localStorage.setItem('user', JSON.stringify(adminUser));
                window.dispatchEvent(new Event('storage_change'));
                window.location.hash = '#/admin/dashboard';
            } else {
                setError('Invalid admin credentials.');
            }
        } else if (role === 'prof') {
            const allProfs: Instructor[] = JSON.parse(localStorage.getItem('profs') || '[]');
            const profToLogin = allProfs.find(p => p.email === email);

            if (profToLogin && password === 'password') { // Simulated password check
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userRole', 'prof');
                localStorage.setItem('user', JSON.stringify(profToLogin));
                window.dispatchEvent(new Event('storage_change'));
                window.location.hash = '#/prof/dashboard';
            } else {
                setError('Invalid professor credentials.');
            }
        } else if (role === 'employee') {
            const allEmployees: Employee[] = JSON.parse(localStorage.getItem('employees') || '[]');
            const employeeToLogin = allEmployees.find(emp => emp.email === email);
            if (employeeToLogin && password === 'password') { // Simulated password check
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userRole', 'employee');
                localStorage.setItem('user', JSON.stringify(employeeToLogin));
                window.dispatchEvent(new Event('storage_change'));
                window.location.hash = '#/employee/dashboard';
            } else {
                 setError('Invalid employee credentials.');
            }
        } else { // Student login
            let userToLogin = null;
            if (email === 'test@example.com' && password === 'password') {
                userToLogin = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    dob: '1990-01-01',
                    nationalId: '123456789',
                    city: 'New York',
                    phone: '123-456-7890',
                    profilePicture: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
                };
            } else if (email === 'jane@example.com' && password === 'password') {
                userToLogin = {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane@example.com',
                    dob: '1992-05-15',
                    nationalId: '987654321',
                    city: 'London',
                    phone: '098-765-4321',
                    profilePicture: 'https://i.pravatar.cc/150?u=jane'
                };
            }

            if (userToLogin) {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userRole', 'student');
                localStorage.setItem('user', JSON.stringify(userToLogin));
                window.dispatchEvent(new Event('storage_change'));

                if (isEnrollmentFlow) {
                    sessionStorage.removeItem('enrollmentFlow');
                    window.location.hash = '#/confirmation';
                } else {
                    window.location.hash = '#/dashboard';
                }
            } else {
                setError('Invalid email or password.');
            }
        }
    };
    
    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
      e.preventDefault();
      window.location.hash = path;
    };
    
    const handlePasswordResetRequest = (e: React.FormEvent) => {
        e.preventDefault();
        setModalMessage(`If an account exists for ${resetEmail}, you will receive an email with reset instructions.`);
        setTimeout(() => {
            setIsForgotPasswordModalOpen(false);
            setModalMessage('');
            setResetEmail('');
        }, 3000);
    };

    const RoleButton: React.FC<{
        selectedRole: 'student-john' | 'student-jane' | 'admin' | 'prof' | 'employee',
        currentRole: 'student-john' | 'student-jane' | 'admin' | 'prof' | 'employee',
        onClick: (role: 'student-john' | 'student-jane' | 'admin' | 'prof' | 'employee') => void,
        children: React.ReactNode
    }> = ({ selectedRole, currentRole, onClick, children }) => (
        <button 
            type="button" 
            onClick={() => onClick(selectedRole)} 
            className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${currentRole === selectedRole ? 'bg-pistachio-dark text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="container mx-auto px-6 py-12 flex justify-center">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-slate-900">Log In</h2>
                {isEnrollmentFlow && (
                    <div className="bg-pistachio-light border-l-4 border-pistachio-dark text-pistachio-dark p-4" role="alert">
                        <div className="flex">
                            <InfoIcon className="h-6 w-6 mr-2" />
                            <p className="font-bold">Log in to continue your enrollment.</p>
                        </div>
                    </div>
                )}
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select a test account:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 rounded-lg border border-slate-300 p-1">
                           <RoleButton selectedRole="student-john" currentRole={role} onClick={handleRoleChange}>Student (John)</RoleButton>
                           <RoleButton selectedRole="student-jane" currentRole={role} onClick={handleRoleChange}>Student (Jane)</RoleButton>
                           <RoleButton selectedRole="prof" currentRole={role} onClick={handleRoleChange}>Professor</RoleButton>
                           <RoleButton selectedRole="employee" currentRole={role} onClick={handleRoleChange}>Employee</RoleButton>
                           <RoleButton selectedRole="admin" currentRole={role} onClick={handleRoleChange}>Admin</RoleButton>
                        </div>
                    </div>

                    <InputField id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                            <button 
                                type="button" 
                                onClick={() => setIsForgotPasswordModalOpen(true)}
                                className="text-sm font-medium text-pistachio-dark hover:text-lime-800"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                        />
                    </div>
                    <div>
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-pistachio-dark hover:bg-lime-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pistachio-dark transition-colors">
                            Log In
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-slate-600">
                    Don't have an account? <a href="#/signup" onClick={(e) => handleNav(e, '#/signup')} className="font-medium text-pistachio-dark hover:text-lime-800">Sign up</a>
                </p>
            </div>
            
            {isForgotPasswordModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in" style={{ animationDuration: '0.3s' }}>
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md m-4">
                        <h3 className="text-2xl font-bold text-slate-800 mb-4">Reset Password</h3>
                        {modalMessage ? (
                            <p className="text-center text-slate-600">{modalMessage}</p>
                        ) : (
                            <form onSubmit={handlePasswordResetRequest}>
                                <p className="text-slate-600 mb-6">Enter your email address and we'll send you instructions to reset your password.</p>
                                <InputField id="reset-email" label="Email" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required placeholder="you@example.com" />
                                <div className="flex justify-end gap-4 pt-6">
                                    <button type="button" onClick={() => setIsForgotPasswordModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900">
                                        Send Instructions
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;