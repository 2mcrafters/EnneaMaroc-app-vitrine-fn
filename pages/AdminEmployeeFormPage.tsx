import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import InputField from '../components/InputField';
import BackArrowIcon from '../components/icons/BackArrowIcon';

interface Employee {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
}

const AdminEmployeeFormPage: React.FC = () => {
    const [employee, setEmployee] = useState<Partial<Employee & { password?: string }>>({ id: '', name: '', imageUrl: '', email: '' });
    const [preview, setPreview] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('/edit/')) {
            const id = hash.split('/edit/').pop();
            if (id) {
                const allEmployees: Employee[] = JSON.parse(localStorage.getItem('employees') || '[]');
                const foundEmployee = allEmployees.find(p => p.id === id);
                if (foundEmployee) {
                    setEmployee(foundEmployee);
                    setPreview(foundEmployee.imageUrl);
                    setIsEditing(true);
                }
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmployee({ ...employee, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                setEmployee({ ...employee, imageUrl: result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const allEmployees: Employee[] = JSON.parse(localStorage.getItem('employees') || '[]');
        
        const { password, ...employeeDataToSave } = employee;

        if (isEditing) {
            const updatedEmployees = allEmployees.map(p => p.id === employee.id ? (employeeDataToSave as Employee) : p);
            localStorage.setItem('employees', JSON.stringify(updatedEmployees));
        } else {
            const newEmployee: Employee = {
                id: employee.name!.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36),
                name: employee.name!,
                imageUrl: employee.imageUrl || `https://i.pravatar.cc/150?u=${employee.email}`,
                email: employee.email!,
            };
            allEmployees.push(newEmployee);
            localStorage.setItem('employees', JSON.stringify(allEmployees));
        }
        window.location.hash = '#/admin/employees';
    };

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        window.location.hash = path;
    };

    return (
        <AdminLayout>
             <a 
                href="#/admin/employees" 
                onClick={(e) => handleNav(e, '#/admin/employees')} 
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4 transition-colors"
              >
                <BackArrowIcon className="w-5 h-5" />
                Back to All Employees
            </a>
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    {isEditing ? 'Edit Employee' : 'Add New Employee'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                    <InputField id="name" label="Full Name" type="text" value={employee.name || ''} onChange={handleChange} required />
                    <InputField id="email" label="Email" type="email" value={employee.email || ''} onChange={handleChange} required disabled={isEditing} />
                    {!isEditing && (
                        <InputField id="password" label="Password" type="password" value={employee.password || ''} onChange={handleChange} required />
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Photo</label>
                        <div className="flex items-center gap-4">
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
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <a href="#/admin/employees" onClick={(e) => handleNav(e, '#/admin/employees')} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200">
                             Cancel
                         </a>
                         <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900">
                            {isEditing ? 'Save Changes' : 'Create Employee'}
                         </button>
                     </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default AdminEmployeeFormPage;