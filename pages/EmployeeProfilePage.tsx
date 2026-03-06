
import React, { useState, useEffect } from 'react';
import { LogoutIcon } from '../components/icons/LogoutIcon';
import InputField from '../components/InputField';

interface Employee {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
}

const EmployeeProfilePage: React.FC = () => {
    const [employee, setEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setEmployee(JSON.parse(storedUser));
        } else {
             window.location.hash = '#/login';
        }
    }, []);
    
    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.dispatchEvent(new Event('storage_change'));
        window.location.hash = '#/login';
    };

    if (!employee) {
        return <div className="text-center py-20">Loading profile...</div>;
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-8 mb-12">
                    <img src={employee.imageUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover mb-4 sm:mb-0 border-4 border-pistachio-light shadow-md" />
                    <div className="text-center sm:text-left flex-grow">
                        <h1 className="text-4xl font-bold text-slate-900">{employee.name}</h1>
                        <p className="text-slate-600 mt-1">Employee Profile</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Personal Info</h2>
                    <div className="space-y-4">
                        <InputField id="name" label="Full Name" type="text" value={employee.name} onChange={() => {}} disabled />
                        <InputField id="email" label="Email" type="email" value={employee.email} onChange={() => {}} disabled />
                    </div>
                     <div className="mt-6 pt-6 border-t border-slate-200">
                       <button 
                           onClick={handleLogout}
                           className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                       >
                           <LogoutIcon className="w-5 h-5" />
                           <span>Log Out</span>
                       </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfilePage;
