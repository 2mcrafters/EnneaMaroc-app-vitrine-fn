import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { Revision } from '../data/revisions';
import { TrashIcon } from '../components/icons/TrashIcon';
import { Instructor } from '../data/instructors';

const AdminRevisionsListPage: React.FC = () => {
    const [revisions, setRevisions] = useState<Revision[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = () => {
        const allRevisions: Revision[] = JSON.parse(localStorage.getItem('revisions') || '[]');
        const allInstructors: Instructor[] = JSON.parse(localStorage.getItem('profs') || '[]');
        setRevisions(allRevisions);
        setInstructors(allInstructors);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        window.location.hash = path;
    };
    
    const handleDelete = (revisionId: string) => {
        if (window.confirm('Are you sure you want to delete this revision session? This action cannot be undone.')) {
            const updatedRevisions = revisions.filter(r => r.id !== revisionId);
            localStorage.setItem('revisions', JSON.stringify(updatedRevisions));
            setRevisions(updatedRevisions);
        }
    };
    
    const getInstructorNames = (instructorIds: string[]) => {
        return instructorIds.map(id => instructors.find(i => i.id === id)?.name || 'Unknown').join(', ');
    };

    const filteredRevisions = revisions.filter(revision =>
        revision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        revision.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Revision Sessions</h2>
                    <a 
                        href="#/admin/revisions/new" 
                        onClick={(e) => handleNav(e, '#/admin/revisions/new')} 
                        className="px-4 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900"
                    >
                        + Add Revision
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
                            placeholder="Search revisions by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pistachio-dark focus:border-transparent transition-shadow"
                            aria-label="Search revisions"
                        />
                    </div>
                </div>

                {filteredRevisions.length > 0 ? (
                    <>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Title</th>
                                        <th scope="col" className="px-6 py-3">Instructors</th>
                                        <th scope="col" className="px-6 py-3">Duration</th>
                                        <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRevisions.map(revision => (
                                        <tr key={revision.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{revision.title}</td>
                                            {/* FIX: Property 'instructors' does not exist on type 'Revision'. Get instructors from modalities instead. */}
                                            <td className="px-6 py-4 text-xs">{getInstructorNames([...new Set(revision.modalities.flatMap(m => m.options.map(o => o.instructorId)))])}</td>
                                            <td className="px-6 py-4">{revision.durationMonths} Months</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex gap-4 justify-end">
                                                    <a 
                                                        href={`#/admin/revisions/edit/${revision.id}`}
                                                        onClick={(e) => handleNav(e, `#/admin/revisions/edit/${revision.id}`)}
                                                        className="font-medium text-blue-600 hover:underline"
                                                    >
                                                        Edit
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(revision.id)}
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
                            {filteredRevisions.map(revision => (
                                <div key={revision.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <h3 className="font-bold text-slate-800">{revision.title}</h3>
                                    <div className="text-sm space-y-1 mt-2 mb-4">
                                        <p><strong className="font-semibold text-slate-500">Duration:</strong> {revision.durationMonths} Months</p>
                                        <p><strong className="font-semibold text-slate-500">Instructors:</strong> <span className="text-xs">{getInstructorNames([...new Set(revision.modalities.flatMap(m => m.options.map(o => o.instructorId)))])}</span></p>
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                                        <a href={`#/admin/revisions/edit/${revision.id}`} onClick={(e) => handleNav(e, `#/admin/revisions/edit/${revision.id}`)} className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">Edit</a>
                                        <button onClick={() => handleDelete(revision.id)} className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-slate-500">
                            {searchQuery ? `No revisions found for "${searchQuery}".` : 'No revision sessions found.'}
                        </p>
                        {!searchQuery && (
                            <a 
                                href="#/admin/revisions/new" 
                                onClick={(e) => handleNav(e, '#/admin/revisions/new')} 
                                className="mt-4 inline-block px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900"
                            >
                                Add Your First Revision
                            </a>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminRevisionsListPage;