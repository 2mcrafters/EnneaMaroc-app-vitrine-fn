import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import InputField from '../components/InputField';
import BackArrowIcon from '../components/icons/BackArrowIcon';

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

const AdminStudentFormPage: React.FC = () => {
    const [student, setStudent] = useState<Partial<UserData & { password?: string }>>({});
    const [preview, setPreview] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('/edit/')) {
            const email = decodeURIComponent(hash.split('/edit/').pop() || '');
            if (email) {
                const allUsers: UserData[] = JSON.parse(localStorage.getItem('users') || '[]');
                const foundStudent = allUsers.find(u => u.email === email);
                if (foundStudent) {
                    setStudent(foundStudent);
                    setPreview(foundStudent.profilePicture);
                    setIsEditing(true);
                }
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStudent({ ...student, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                setStudent({ ...student, profilePicture: result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const allUsers: UserData[] = JSON.parse(localStorage.getItem('users') || '[]');
        
        const { password, ...studentDataToSave } = student;

        if (isEditing) {
            const updatedUsers = allUsers.map(u => u.email === student.email ? (studentDataToSave as UserData) : u);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
        } else {
            const newStudent: UserData = {
                ...(studentDataToSave as Omit<UserData, 'profilePicture'>),
                profilePicture: student.profilePicture || `https://i.pravatar.cc/150?u=${student.email}`,
                hasPaidRegistrationFee: student.hasPaidRegistrationFee || false, // Default to false for new students
            };
            // Check if email already exists
            if (allUsers.some(u => u.email === newStudent.email)) {
                alert('A user with this email already exists.');
                return;
            }
            allUsers.push(newStudent);
            localStorage.setItem('users', JSON.stringify(allUsers));
        }
        window.location.hash = '#/admin/students';
    };

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        window.location.hash = path;
    };

    return (
        <AdminLayout>
             <a 
                href="#/admin/students" 
                onClick={(e) => handleNav(e, '#/admin/students')} 
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4 transition-colors"
              >
                <BackArrowIcon className="w-5 h-5" />
                Back to All Students
            </a>
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    {isEditing ? 'Edit Student' : 'Add New Student'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                            {preview ? (
                                <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            )}
                        </div>
                        <label htmlFor="profilePicture" className="cursor-pointer px-4 py-2 text-sm font-semibold text-pistachio-dark border border-pistachio-dark rounded-full hover:bg-pistachio-light transition-colors">
                            Upload Photo
                        </label>
                        <input id="profilePicture" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField id="firstName" label="First Name" type="text" value={student.firstName || ''} onChange={handleChange} required />
                        <InputField id="lastName" label="Last Name" type="text" value={student.lastName || ''} onChange={handleChange} required />
                        <InputField id="dob" label="Date of Birth" type="date" value={student.dob || ''} onChange={handleChange} required />
                        <InputField id="nationalId" label="National ID Number" type="text" value={student.nationalId || ''} onChange={handleChange} required />
                        <InputField id="city" label="City" type="text" value={student.city || ''} onChange={handleChange} required />
                        <InputField id="phone" label="Phone Number" type="tel" value={student.phone || ''} onChange={handleChange} required />
                    </div>

                    <div className="space-y-6 pt-6 border-t border-slate-200">
                         <InputField id="email" label="Email Address" type="email" value={student.email || ''} onChange={handleChange} required disabled={isEditing} />
                         {!isEditing && (
                            <InputField id="password" label="Password" type="password" value={student.password || ''} onChange={handleChange} required />
                         )}
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                        <a href="#/admin/students" onClick={(e) => handleNav(e, '#/admin/students')} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200">
                             Cancel
                         </a>
                         <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900">
                            {isEditing ? 'Save Changes' : 'Create Student'}
                         </button>
                     </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default AdminStudentFormPage;