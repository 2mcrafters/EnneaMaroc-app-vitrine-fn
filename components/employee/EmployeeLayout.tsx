import React from 'react';

const EmployeeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const currentPath = window.location.hash;
    const employeeUser = JSON.parse(localStorage.getItem('user') || '{}');

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        window.location.hash = path;
    };

    const NavLink: React.FC<{ path: string; children: React.ReactNode, isPrefix?: boolean }> = ({ path, children, isPrefix = false }) => {
        const isActive = isPrefix ? currentPath.startsWith(path) : currentPath === path;
        return (
            <a 
                href={path} 
                onClick={(e) => handleNav(e, path)}
                className={`flex items-center gap-3 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    isActive
                    ? 'bg-pistachio-dark text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
                {children}
            </a>
        );
    };

    return (
        <div className="px-4 md:px-6 py-12 animate-fade-in">
             <div className="mb-8 text-center">
                 <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">Dashboard</h1>
                 <p className="text-slate-600">Welcome, {employeeUser.name}.</p>
             </div>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="hidden md:block md:w-64 flex-shrink-0">
                    <div className="bg-white p-4 rounded-xl shadow-lg h-full">
                        <nav className="space-y-2">
                            <NavLink path="#/employee/dashboard">
                                <span>Approvals</span>
                            </NavLink>
                             <NavLink path="#/admin/payments" isPrefix={true}>
                                <span>Payments</span>
                            </NavLink>
                            <NavLink path="#/schedule">
                                <span>Full Schedule</span>
                            </NavLink>
                            <div className="pt-2 mt-2 border-t border-slate-200">
                                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">People</p>
                                <NavLink path="#/admin/students" isPrefix={true}>
                                    <span>Students</span>
                                </NavLink>
                                <NavLink path="#/admin/profs" isPrefix={true}>
                                    <span>Instructors</span>
                                </NavLink>
                            </div>
                            <div className="pt-2 mt-2 border-t border-slate-200">
                                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">Content</p>
                                <NavLink path="#/admin/courses" isPrefix={true}>
                                    <span>Courses</span>
                                </NavLink>
                                <NavLink path="#/admin/revisions" isPrefix={true}>
                                    <span>Revisions</span>
                                </NavLink>
                            </div>
                        </nav>
                    </div>
                </aside>
                <main className="flex-grow min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default EmployeeLayout;