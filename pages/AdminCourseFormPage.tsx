import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { Course, CourseGroup } from '../data/courses';
import { Instructor } from '../data/instructors';
import InputField from '../components/InputField';
import BackArrowIcon from '../components/icons/BackArrowIcon';
import TrashIcon from '../components/icons/TrashIcon';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AdminCourseFormPage: React.FC = () => {
    const [course, setCourse] = useState<Partial<Course>>({ 
        title: '', 
        type: 'in-person', 
        shortDescription: '', 
        description: '', 
        imageUrl: '',
        // FIX: Object literal may only specify known properties, and 'instructors' does not exist in type 'Partial<Course>'. The `instructors` property is derived from groups.
        groups: [{ day: '', time: '', price: 0, instructorId: '', meetingLink: '' }],
        durationMonths: 0,
        sessionsPerMonth: 0,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
    const [openDayPicker, setOpenDayPicker] = useState<number | null>(null);
    
    useEffect(() => {
        const instructorsFromStorage = JSON.parse(localStorage.getItem('profs') || '[]');
        setAllInstructors(instructorsFromStorage);

        const hash = window.location.hash;
        if (hash.includes('/edit/')) {
            const id = hash.split('/edit/').pop();
            if (id) {
                const allCourses: Course[] = JSON.parse(localStorage.getItem('courses') || '[]');
                const foundCourse = allCourses.find(c => c.id === id);
                if (foundCourse) {
                    setCourse(foundCourse);
                    setIsEditing(true);
                }
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setCourse({ ...course, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setCourse({ ...course, imageUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGroupChange = (index: number, field: keyof CourseGroup, value: string) => {
        const newGroups = [...(course.groups || [])];
        const groupToUpdate = { ...newGroups[index] };

        if (field === 'price') {
             groupToUpdate[field] = Number(value);
        } else {
             (groupToUpdate as any)[field] = value;
        }
       
        newGroups[index] = groupToUpdate;
        setCourse({ ...course, groups: newGroups });
    };
    
    const handleDaySelection = (groupIndex: number, day: string) => {
        const newGroups = [...(course.groups || [])];
        const currentDays = newGroups[groupIndex].day ? newGroups[groupIndex].day.split(', ') : [];
        const dayIndexInSelection = currentDays.indexOf(day);
        
        if (dayIndexInSelection > -1) {
            currentDays.splice(dayIndexInSelection, 1);
        } else {
            currentDays.push(day);
        }

        newGroups[groupIndex].day = daysOfWeek
            .filter(d => currentDays.includes(d))
            .join(', ');
            
        setCourse({ ...course, groups: newGroups });
    };


    const addGroup = () => {
        const newGroups = [...(course.groups || []), { day: '', time: '', price: 0, instructorId: '', meetingLink: '' }];
        setCourse({ ...course, groups: newGroups });
    };

    const removeGroup = (index: number) => {
        const newGroups = (course.groups || []).filter((_, i) => i !== index);
        setCourse({ ...course, groups: newGroups });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const allCourses: Course[] = JSON.parse(localStorage.getItem('courses') || '[]');
        
        if (isEditing) {
            const updatedCourses = allCourses.map(c => c.id === course.id ? (course as Course) : c);
            localStorage.setItem('courses', JSON.stringify(updatedCourses));
        } else {
            const newCourse: Course = {
                ...course,
                id: course.title!.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36),
            } as Course;
            allCourses.push(newCourse);
            localStorage.setItem('courses', JSON.stringify(allCourses));
        }
        window.location.hash = '#/admin/courses';
    };

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        window.location.hash = path;
    };

    return (
        <AdminLayout>
             <a 
                href="#/admin/courses" 
                onClick={(e) => handleNav(e, '#/admin/courses')} 
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4 transition-colors"
              >
                <BackArrowIcon className="w-5 h-5" />
                Back to All Courses
            </a>
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    {isEditing ? 'Edit Course' : 'Add New Course'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField id="title" label="Course Title" type="text" value={course.title || ''} onChange={handleChange} required />
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Course Type</label>
                            <select id="type" name="type" value={course.type} onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm">
                                <option value="in-person">In-Person</option>
                                <option value="online">Online</option>
                            </select>
                        </div>
                    </div>
                     <InputField id="shortDescription" label="Short Description" type="text" value={course.shortDescription || ''} onChange={handleChange} required />
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Full Description</label>
                        <textarea id="description" name="description" value={course.description || ''} onChange={handleChange} rows={4} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm" required></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField id="durationMonths" label="Duration (Months)" type="number" value={String(course.durationMonths || '')} onChange={handleChange} required />
                        <InputField id="sessionsPerMonth" label="Sessions per Month" type="number" value={String(course.sessionsPerMonth || '')} onChange={handleChange} required />
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Course Image</label>
                         <div className="flex items-center gap-4">
                            {course.imageUrl && <img src={course.imageUrl} alt="preview" className="w-20 h-20 object-cover rounded-md" />}
                             <input type="file" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pistachio-light file:text-pistachio-dark hover:file:bg-lime-200" />
                        </div>
                    </div>

                     <div>
                        <h3 className="text-lg font-medium text-slate-800 mb-2 border-b pb-2">Class Groups</h3>
                        <div className="space-y-4 pt-2">
                            {(course.groups || []).map((group, index) => (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-3 bg-slate-50 rounded-lg">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Day(s)</label>
                                        <div className="relative">
                                            <button type="button" onClick={() => setOpenDayPicker(openDayPicker === index ? null : index)} className="block text-left w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm">
                                                {group.day || <span className="text-slate-400">Select days...</span>}
                                            </button>
                                            {openDayPicker === index && (
                                                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-300 rounded-md shadow-lg p-2 grid grid-cols-2 gap-2">
                                                    {daysOfWeek.map(day => (
                                                        <button
                                                            key={day}
                                                            type="button"
                                                            onClick={() => handleDaySelection(index, day)}
                                                            className={`px-2 py-1 text-sm rounded-md transition-colors ${group.day.includes(day) ? 'bg-pistachio-dark text-white' : 'hover:bg-slate-100'}`}
                                                        >
                                                            {day}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2"><InputField id={`time-${index}`} label="Time" type="text" placeholder="e.g., 10:00 AM - 12:00 PM" value={group.time} onChange={(e) => handleGroupChange(index, 'time', e.target.value)} /></div>
                                    {course.type === 'online' && (
                                        <div className="sm:col-span-3"><InputField id={`link-${index}`} label="Meeting Link" type="url" value={group.meetingLink || ''} onChange={(e) => handleGroupChange(index, 'meetingLink', e.target.value)} /></div>
                                    )}
                                    <div className={course.type === 'online' ? 'sm:col-span-3' : 'sm:col-span-6'}>
                                        <label htmlFor={`instructor-${index}`} className="block text-sm font-medium text-slate-700 mb-1">Instructor</label>
                                        <select
                                            id={`instructor-${index}`}
                                            name="instructorId"
                                            value={group.instructorId || ''}
                                            onChange={(e) => handleGroupChange(index, 'instructorId', e.target.value)}
                                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                                            required
                                        >
                                            <option value="" disabled>Select...</option>
                                            {allInstructors.map(prof => (
                                                <option key={prof.id} value={prof.id}>{prof.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-1"><InputField id={`price-${index}`} label="Price" type="number" value={String(group.price)} onChange={(e) => handleGroupChange(index, 'price', e.target.value)} /></div>
                                    <button type="button" onClick={() => removeGroup(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full h-10 w-10 flex items-center justify-center"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addGroup} className="mt-4 px-4 py-2 text-sm font-semibold text-pistachio-dark border border-pistachio-dark rounded-full hover:bg-pistachio-light">
                            + Add Group
                        </button>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <a href="#/admin/courses" onClick={(e) => handleNav(e, '#/admin/courses')} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200">
                             Cancel
                         </a>
                         <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900">
                            {isEditing ? 'Save Changes' : 'Create Course'}
                         </button>
                     </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default AdminCourseFormPage;