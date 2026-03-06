import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../data/courses';
import { Revision } from '../data/revisions';
import { Instructor } from '../data/instructors';
import { SearchIcon } from './icons/SearchIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { RevisionIcon } from './icons/RevisionIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';

interface User {
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string;
}

interface SearchResults {
    courses: Course[];
    revisions: Revision[];
    instructors: Instructor[];
    students: User[];
}

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults>({ courses: [], revisions: [], instructors: [], students: [] });
    const inputRef = useRef<HTMLInputElement>(null);
    const userRole = localStorage.getItem('userRole');
    const canSearchStudents = userRole === 'admin' || userRole === 'employee';

    useEffect(() => {
        if (isOpen) {
            // Auto-focus input when modal opens
            inputRef.current?.focus();
        } else {
            // Reset state when modal closes
            setQuery('');
            setResults({ courses: [], revisions: [], instructors: [], students: [] });
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults({ courses: [], revisions: [], instructors: [], students: [] });
            return;
        }

        const searchTimer = setTimeout(() => {
            const lowerCaseQuery = query.toLowerCase();
            
            const allCourses: Course[] = JSON.parse(localStorage.getItem('courses') || '[]');
            const allRevisions: Revision[] = JSON.parse(localStorage.getItem('revisions') || '[]');
            const allInstructors: Instructor[] = JSON.parse(localStorage.getItem('profs') || '[]');
            const allStudents: User[] = JSON.parse(localStorage.getItem('users') || '[]');

            const filteredCourses = allCourses.filter(c => 
                c.title.toLowerCase().includes(lowerCaseQuery) ||
                c.shortDescription.toLowerCase().includes(lowerCaseQuery)
            );
            
            const filteredRevisions = allRevisions.filter(r => 
                r.title.toLowerCase().includes(lowerCaseQuery) ||
                r.shortDescription.toLowerCase().includes(lowerCaseQuery)
            );

            const filteredInstructors = allInstructors.filter(i => 
                i.name.toLowerCase().includes(lowerCaseQuery)
            );
            
            const filteredStudents = canSearchStudents 
                ? allStudents.filter(s => 
                    `${s.firstName} ${s.lastName}`.toLowerCase().includes(lowerCaseQuery) ||
                    s.email.toLowerCase().includes(lowerCaseQuery)
                  )
                : [];

            setResults({
                courses: filteredCourses,
                revisions: filteredRevisions,
                instructors: filteredInstructors,
                students: filteredStudents,
            });

        }, 250); // Debounce time

        return () => clearTimeout(searchTimer);
    }, [query, canSearchStudents]);

    const handleNav = (path: string) => {
        window.location.hash = path;
        onClose();
    };

    if (!isOpen) {
        return null;
    }
    
    const hasResults = results.courses.length > 0 || results.revisions.length > 0 || results.instructors.length > 0 || results.students.length > 0;

    const ResultSection: React.FC<{title: string; children: React.ReactNode; count: number}> = ({ title, children, count }) => {
        if (count === 0) return null;
        return (
            <div>
                <h3 className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-t border-slate-100">{title}</h3>
                <ul className="divide-y divide-slate-100">
                    {children}
                </ul>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in" style={{ animationDuration: '0.2s' }} onClick={onClose}>
            <div 
                className="bg-white w-full max-w-2xl rounded-xl shadow-2xl mx-auto mt-[10vh] animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search courses, instructors..."
                        className="w-full h-16 pl-12 pr-4 py-2 text-lg bg-transparent border-b border-slate-200 focus:outline-none focus:ring-0"
                    />
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    {query.trim().length >= 2 ? (
                        hasResults ? (
                            <div>
                                <ResultSection title="Courses" count={results.courses.length}>
                                    {results.courses.map(course => (
                                        <li key={course.id}>
                                            <a href={`#/course/${course.id}`} onClick={(e) => { e.preventDefault(); handleNav(`#/course/${course.id}`); }} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                                                <BookOpenIcon className="w-6 h-6 text-slate-400 flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold text-slate-800">{course.title}</p>
                                                    <p className="text-sm text-slate-500">{course.shortDescription}</p>
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                </ResultSection>
                                <ResultSection title="Revisions" count={results.revisions.length}>
                                    {results.revisions.map(revision => (
                                        <li key={revision.id}>
                                            <a href={`#/revision/${revision.id}`} onClick={(e) => { e.preventDefault(); handleNav(`#/revision/${revision.id}`); }} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                                                <RevisionIcon className="w-6 h-6 text-slate-400 flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold text-slate-800">{revision.title}</p>
                                                    <p className="text-sm text-slate-500">{revision.shortDescription}</p>
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                </ResultSection>
                                 <ResultSection title="Instructors" count={results.instructors.length}>
                                    {results.instructors.map(prof => (
                                        <li key={prof.id}>
                                            <a href={`#/admin/profs`} onClick={(e) => { e.preventDefault(); handleNav('#/admin/profs'); }} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                                                <img src={prof.imageUrl} alt={prof.name} className="w-10 h-10 rounded-full object-cover" />
                                                <div>
                                                    <p className="font-semibold text-slate-800">{prof.name}</p>
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                </ResultSection>
                                {canSearchStudents && (
                                    <ResultSection title="Students" count={results.students.length}>
                                        {results.students.map(student => (
                                            <li key={student.email}>
                                                <a href={`#/admin/student/${student.email}`} onClick={(e) => { e.preventDefault(); handleNav(`#/admin/student/${student.email}`); }} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                                                    <img src={student.profilePicture} alt={`${student.firstName} ${student.lastName}`} className="w-10 h-10 rounded-full object-cover" />
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{student.firstName} {student.lastName}</p>
                                                        <p className="text-sm text-slate-500">{student.email}</p>
                                                    </div>
                                                </a>
                                            </li>
                                        ))}
                                    </ResultSection>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <p>No results found for "{query}"</p>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            <p>Start typing to search...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
