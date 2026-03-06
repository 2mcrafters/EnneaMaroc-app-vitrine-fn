import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { Course } from '../data/courses';
import { TrashIcon } from '../components/icons/TrashIcon';
import { Instructor } from '../data/instructors';

const AdminCoursesListPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = () => {
        const allCourses: Course[] = JSON.parse(localStorage.getItem('courses') || '[]');
        const allInstructors: Instructor[] = JSON.parse(localStorage.getItem('profs') || '[]');
        setCourses(allCourses);
        setInstructors(allInstructors);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        window.location.hash = path;
    };
    
    const handleDelete = (courseId: string) => {
        if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            const updatedCourses = courses.filter(c => c.id !== courseId);
            localStorage.setItem('courses', JSON.stringify(updatedCourses));
            setCourses(updatedCourses);
        }
    };
    
    const getInstructorNames = (instructorIds: string[]) => {
        return instructorIds.map(id => instructors.find(i => i.id === id)?.name || 'Unknown').join(', ');
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Courses</h2>
                    <a 
                        href="#/admin/courses/new" 
                        onClick={(e) => handleNav(e, '#/admin/courses/new')} 
                        className="px-4 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900"
                    >
                        + Add Course
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
                            placeholder="Search courses by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pistachio-dark focus:border-transparent transition-shadow"
                            aria-label="Search courses"
                        />
                    </div>
                </div>

                {filteredCourses.length > 0 ? (
                    <>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Title</th>
                                        <th scope="col" className="px-6 py-3">Type</th>
                                        <th scope="col" className="px-6 py-3">Instructors</th>
                                        <th scope="col" className="px-6 py-3">Duration</th>
                                        <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCourses.map(course => (
                                        <tr key={course.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{course.title}</td>
                                            <td className="px-6 py-4 capitalize">{course.type}</td>
                                            {/* FIX: Property 'instructors' does not exist on type 'Course'. Get instructors from groups instead. */}
                                            <td className="px-6 py-4 text-xs">{getInstructorNames([...new Set(course.groups.map(g => g.instructorId))])}</td>
                                            <td className="px-6 py-4">{course.durationMonths} Months</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex gap-4 justify-end">
                                                    <a 
                                                        href={`#/admin/courses/edit/${course.id}`}
                                                        onClick={(e) => handleNav(e, `#/admin/courses/edit/${course.id}`)}
                                                        className="font-medium text-blue-600 hover:underline"
                                                    >
                                                        Edit
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(course.id)}
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
                            {filteredCourses.map(course => (
                                <div key={course.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <h3 className="font-bold text-slate-800">{course.title}</h3>
                                    <div className="text-sm space-y-1 mt-2 mb-4">
                                        <p><strong className="font-semibold text-slate-500">Type:</strong> <span className="capitalize">{course.type}</span></p>
                                        <p><strong className="font-semibold text-slate-500">Duration:</strong> {course.durationMonths} Months</p>
                                        <p><strong className="font-semibold text-slate-500">Instructors:</strong> <span className="text-xs">{getInstructorNames([...new Set(course.groups.map(g => g.instructorId))])}</span></p>
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                                        <a href={`#/admin/courses/edit/${course.id}`} onClick={(e) => handleNav(e, `#/admin/courses/edit/${course.id}`)} className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">Edit</a>
                                        <button onClick={() => handleDelete(course.id)} className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-slate-500">
                           {searchQuery ? `No courses found for "${searchQuery}".` : 'No courses found.'}
                        </p>
                        {!searchQuery && (
                            <a 
                                href="#/admin/courses/new" 
                                onClick={(e) => handleNav(e, '#/admin/courses/new')} 
                                className="mt-4 inline-block px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900"
                            >
                                Add Your First Course
                            </a>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminCoursesListPage;