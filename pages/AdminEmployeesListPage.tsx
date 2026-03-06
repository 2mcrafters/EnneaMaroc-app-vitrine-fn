import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';

interface Employee {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
}

const AdminEmployeesListPage: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const allEmployees: Employee[] = JSON.parse(localStorage.getItem('employees') || '[]');
        setEmployees(allEmployees);
    }, []);

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        window.location.hash = path;
    };
    
    const handleDelete = (employeeId: string) => {
        if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
            const updatedEmployees = employees.filter(p => p.id !== employeeId);
            localStorage.setItem('employees', JSON.stringify(updatedEmployees));
            setEmployees(updatedEmployees);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Employees</h2>
                    <a 
                        href="#/admin/employees/new" 
                        onClick={(e) => handleNav(e, '#/admin/employees/new')} 
                        className="px-4 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900"
                    >
                        + Add Employee
                    </a>
                </div>

                 <div className="mb-6">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                            <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search employees by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pistachio-dark focus:border-transparent transition-shadow"
                            aria-label="Search employees"
                        />
                    </div>
                </div>

                {filteredEmployees.length > 0 ? (
                    <>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Name</th>
                                        <th scope="col" className="px-6 py-3">Email</th>
                                        <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map(emp => (
                                        <tr key={emp.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                <div className="flex items-center gap-3">
                                                    <img src={emp.imageUrl} alt={emp.name} className="w-8 h-8 rounded-full object-cover" />
                                                    <span>{emp.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{emp.email}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex gap-4 justify-end">
                                                    <a 
                                                        href={`#/admin/employees/edit/${emp.id}`}
                                                        onClick={(e) => handleNav(e, `#/admin/employees/edit/${emp.id}`)}
                                                        className="font-medium text-blue-600 hover:underline"
                                                    >
                                                        Edit
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(emp.id)}
                                                        className="font-medium text-red-600 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4">
                            {filteredEmployees.map(emp => (
                                <div key={emp.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex items-center gap-4 mb-4">
                                        <img src={emp.imageUrl} alt={emp.name} className="w-12 h-12 rounded-full object-cover" />
                                        <div>
                                            <h3 className="font-bold text-slate-800">{emp.name}</h3>
                                            <p className="text-sm text-slate-500">{emp.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                                        <a href={`#/admin/employees/edit/${emp.id}`} onClick={(e) => handleNav(e, `#/admin/employees/edit/${emp.id}`)} className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">Edit</a>
                                        <button onClick={() => handleDelete(emp.id)} className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-slate-500">
                           {searchQuery ? `No employees found for "${searchQuery}".` : 'No employees found.'}
                        </p>
                        {!searchQuery && (
                            <a 
                                href="#/admin/employees/new" 
                                onClick={(e) => handleNav(e, '#/admin/employees/new')} 
                                className="mt-4 inline-block px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900"
                            >
                                Add Your First Employee
                            </a>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminEmployeesListPage;
