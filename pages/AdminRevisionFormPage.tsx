import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { Revision, RevisionModality, RevisionOption } from '../data/revisions';
import { Instructor } from '../data/instructors';
import InputField from '../components/InputField';
import BackArrowIcon from '../components/icons/BackArrowIcon';
import TrashIcon from '../components/icons/TrashIcon';

const AdminRevisionFormPage: React.FC = () => {
    const [revision, setRevision] = useState<Partial<Revision>>({
        title: '',
        shortDescription: '',
        description: '',
        imageUrl: '',
        // FIX: Object literal may only specify known properties, and 'instructors' does not exist in type 'Partial<Revision>'. The `instructors` property is derived from modalities.
        modalities: [],
        durationMonths: 1,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);

    useEffect(() => {
        setAllInstructors(JSON.parse(localStorage.getItem('profs') || '[]'));
        const hash = window.location.hash;
        if (hash.includes('/edit/')) {
            const id = hash.split('/edit/').pop();
            if (id) {
                const allRevisions: Revision[] = JSON.parse(localStorage.getItem('revisions') || '[]');
                const found = allRevisions.find(r => r.id === id);
                if (found) {
                    setRevision(found);
                    setIsEditing(true);
                }
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRevision({ ...revision, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setRevision({ ...revision, imageUrl: reader.result as string });
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleModalityChange = (modIndex: number, field: keyof RevisionModality, value: any) => {
        const newModalities = [...(revision.modalities || [])];
        (newModalities[modIndex] as any)[field] = value;
        setRevision({ ...revision, modalities: newModalities });
    };
    
    const handleOptionChange = (modIndex: number, optIndex: number, field: keyof RevisionOption, value: any) => {
        const newModalities = [...(revision.modalities || [])];
        const newOptions = [...newModalities[modIndex].options];
        (newOptions[optIndex] as any)[field] = field === 'price' ? Number(value) : value;
        newModalities[modIndex].options = newOptions;
        setRevision({ ...revision, modalities: newModalities });
    };
    
    const addModality = () => {
        setRevision({ ...revision, modalities: [...(revision.modalities || []), { type: 'Online', options: [] }] });
    };

    const removeModality = (modIndex: number) => {
        setRevision({ ...revision, modalities: (revision.modalities || []).filter((_, i) => i !== modIndex) });
    };

    const addOption = (modIndex: number) => {
        const newModalities = [...(revision.modalities || [])];
        newModalities[modIndex].options.push({ type: 'Written', day: '', time: '', price: 0, instructorId: '', meetingLink: '' });
        setRevision({ ...revision, modalities: newModalities });
    };

    const removeOption = (modIndex: number, optIndex: number) => {
        const newModalities = [...(revision.modalities || [])];
        newModalities[modIndex].options = newModalities[modIndex].options.filter((_, i) => i !== optIndex);
        setRevision({ ...revision, modalities: newModalities });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const allRevisions: Revision[] = JSON.parse(localStorage.getItem('revisions') || '[]');
        if (isEditing) {
            const updated = allRevisions.map(r => r.id === revision.id ? (revision as Revision) : r);
            localStorage.setItem('revisions', JSON.stringify(updated));
        } else {
            const newRevision: Revision = { ...revision, id: revision.title!.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36) } as Revision;
            allRevisions.push(newRevision);
            localStorage.setItem('revisions', JSON.stringify(allRevisions));
        }
        window.location.hash = '#/admin/revisions';
    };

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        window.location.hash = path;
    };

    return (
        <AdminLayout>
            <a href="#/admin/revisions" onClick={(e) => handleNav(e, '#/admin/revisions')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4 transition-colors">
                <BackArrowIcon className="w-5 h-5" /> Back to All Revisions
            </a>
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">{isEditing ? 'Edit Revision Session' : 'Add New Revision Session'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField id="title" label="Title" type="text" value={revision.title || ''} onChange={handleChange} required />
                    <InputField id="shortDescription" label="Short Description" type="text" value={revision.shortDescription || ''} onChange={handleChange} required />
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Full Description</label>
                        <textarea id="description" name="description" value={revision.description || ''} onChange={handleChange} rows={4} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm" required></textarea>
                    </div>
                    <InputField id="durationMonths" label="Duration (Months)" type="number" value={String(revision.durationMonths || '')} onChange={handleChange} required />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                        <div className="flex items-center gap-4">
                            {revision.imageUrl && <img src={revision.imageUrl} alt="preview" className="w-20 h-20 object-cover rounded-md" />}
                            <input type="file" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pistachio-light file:text-pistachio-dark hover:file:bg-lime-200" />
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-medium text-slate-800 mb-2 border-b pb-2">Modalities & Options</h3>
                        <div className="space-y-4 pt-2">
                            {(revision.modalities || []).map((mod, modIndex) => (
                                <div key={modIndex} className="p-4 bg-slate-50 rounded-lg border">
                                    <div className="flex justify-between items-center mb-4">
                                        <select value={mod.type} onChange={(e) => handleModalityChange(modIndex, 'type', e.target.value)} className="block w-full sm:w-auto px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm font-semibold">
                                            <option value="Online">Online</option>
                                            <option value="In-Person">In-Person</option>
                                        </select>
                                        <button type="button" onClick={() => removeModality(modIndex)}><TrashIcon className="w-5 h-5 text-red-500" /></button>
                                    </div>
                                    {mod.options.map((opt, optIndex) => (
                                        <div key={optIndex} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-2 border-t">
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                                <select value={opt.type} onChange={e => handleOptionChange(modIndex, optIndex, 'type', e.target.value)} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm">
                                                    <option>Written</option><option>Oral</option><option>Both</option>
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Instructor</label>
                                                <select
                                                    value={opt.instructorId || ''}
                                                    onChange={e => handleOptionChange(modIndex, optIndex, 'instructorId', e.target.value)}
                                                    className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                                                    required
                                                >
                                                    <option value="" disabled>Select...</option>
                                                    {allInstructors.map(prof => (
                                                        <option key={prof.id} value={prof.id}>{prof.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {mod.type === 'Online' && (
                                                <div className="sm:col-span-2"><InputField id={`link-${modIndex}-${optIndex}`} label="Meeting Link" type="url" value={opt.meetingLink || ''} onChange={e => handleOptionChange(modIndex, optIndex, 'meetingLink', e.target.value)} /></div>
                                            )}
                                            <div className="sm:col-span-2"><InputField id={`day-${modIndex}-${optIndex}`} label="Day(s)" type="text" value={opt.day} onChange={e => handleOptionChange(modIndex, optIndex, 'day', e.target.value)} /></div>
                                            <div className="sm:col-span-2"><InputField id={`time-${modIndex}-${optIndex}`} label="Time" type="text" placeholder="e.g., 06:00 PM - 08:00 PM" value={opt.time} onChange={e => handleOptionChange(modIndex, optIndex, 'time', e.target.value)} /></div>
                                            <div className="sm:col-span-1"><InputField id={`price-${modIndex}-${optIndex}`} label="Price" type="number" value={String(opt.price)} onChange={e => handleOptionChange(modIndex, optIndex, 'price', e.target.value)} /></div>
                                            <button type="button" onClick={() => removeOption(modIndex, optIndex)} className="p-2 text-red-500 hover:bg-red-100 rounded-full h-10 w-10 flex items-center justify-center"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addOption(modIndex)} className="mt-2 px-3 py-1 text-xs font-semibold text-pistachio-dark border border-pistachio-dark rounded-full hover:bg-pistachio-light">+ Add Option</button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addModality} className="mt-4 px-4 py-2 text-sm font-semibold text-pistachio-dark border border-pistachio-dark rounded-full hover:bg-pistachio-light">+ Add Modality</button>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <a href="#/admin/revisions" onClick={(e) => handleNav(e, '#/admin/revisions')} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200">Cancel</a>
                        <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900">{isEditing ? 'Save Changes' : 'Create Revision'}</button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default AdminRevisionFormPage;