import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { Instructor } from '../data/instructors';
import InputField from '../components/InputField';
import BackArrowIcon from '../components/icons/BackArrowIcon';

const AdminProfFormPage: React.FC = () => {
    // FIX: Initialize with email property.
    const [prof, setProf] = useState<Partial<Instructor & { password?: string }>>({ id: '', name: '', imageUrl: '', email: '' });
    const [preview, setPreview] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('/edit/')) {
            const id = hash.split('/edit/').pop();
            if (id) {
                const allProfs: Instructor[] = JSON.parse(localStorage.getItem('profs') || '[]');
                const foundProf = allProfs.find(p => p.id === id);
                if (foundProf) {
                    setProf(foundProf);
                    setPreview(foundProf.imageUrl);
                    setIsEditing(true);
                }
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProf({ ...prof, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                setProf({ ...prof, imageUrl: result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const allProfs: Instructor[] = JSON.parse(localStorage.getItem('profs') || '[]');
        
        const { password, ...profDataToSave } = prof;

        if (isEditing) {
            const updatedProfs = allProfs.map(p => p.id === prof.id ? (profDataToSave as Instructor) : p);
            localStorage.setItem('profs', JSON.stringify(updatedProfs));
        } else {
            // FIX: Add missing email property to the new instructor object.
            const newProf: Instructor = {
                id: prof.name!.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36),
                name: prof.name!,
                imageUrl: prof.imageUrl || `https://i.pravatar.cc/150?u=${prof.email}`,
                email: prof.email!,
            };
            allProfs.push(newProf);
            localStorage.setItem('profs', JSON.stringify(allProfs));
        }
        window.location.hash = '#/admin/profs';
    };

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        window.location.hash = path;
    };

    return (
        <AdminLayout>
             <a 
                href="#/admin/profs" 
                onClick={(e) => handleNav(e, '#/admin/profs')} 
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4 transition-colors"
              >
                <BackArrowIcon className="w-5 h-5" />
                Back to All Instructors
            </a>
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    {isEditing ? 'Edit Instructor' : 'Add New Instructor'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                    <InputField id="name" label="Full Name" type="text" value={prof.name || ''} onChange={handleChange} required />
                    {/* FIX: Add email input field to the form. */}
                    <InputField id="email" label="Email" type="email" value={prof.email || ''} onChange={handleChange} required disabled={isEditing} />
                    {!isEditing && (
                        <InputField id="password" label="Password" type="password" value={prof.password || ''} onChange={handleChange} required />
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

                    {isEditing && (
                        <InputField id="id" label="Instructor ID" type="text" value={prof.id || ''} onChange={handleChange} disabled />
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <a href="#/admin/profs" onClick={(e) => handleNav(e, '#/admin/profs')} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200">
                             Cancel
                         </a>
                         <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900">
                            {isEditing ? 'Save Changes' : 'Create Instructor'}
                         </button>
                     </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default AdminProfFormPage;