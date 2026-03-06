
import React, { useState, useEffect } from 'react';
import { LogoutIcon } from '../components/icons/LogoutIcon';
import InputField from '../components/InputField';

interface AdminUser {
    firstName: string;
    lastName: string;
    email: string;
}

const AdminProfilePage: React.FC = () => {
    const [admin, setAdmin] = useState<AdminUser | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setAdmin(JSON.parse(storedUser));
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

    if (!admin) {
        return <div className="text-center py-20">Loading profile...</div>;
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-8 mb-12">
                     <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center mb-4 sm:mb-0 border-4 border-pistachio-light shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg>
                    </div>
                    <div className="text-center sm:text-left flex-grow">
                        <h1 className="text-4xl font-bold text-slate-900">{admin.firstName} {admin.lastName}</h1>
                        <p className="text-slate-600 mt-1">Admin Profile</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Account Info</h2>
                    <div className="space-y-4">
                        <InputField id="name" label="Full Name" type="text" value={`${admin.firstName} ${admin.lastName}`} onChange={() => {}} disabled />
                        <InputField id="email" label="Email" type="email" value={admin.email} onChange={() => {}} disabled />
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

export default AdminProfilePage;
