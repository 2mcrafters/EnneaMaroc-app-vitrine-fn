import React, { useState, useEffect } from 'react';
import InputField from '../components/InputField';

interface FormData {
    firstName: string;
    lastName: string;
    dob: string;
    nationalId: string;
    city: string;
    email: string;
    phone: string;
    password: string;
}

const SignUpPage: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        firstName: '', lastName: '', dob: '', nationalId: '', city: '', email: '', phone: '', password: ''
    });
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isEnrollmentFlow, setIsEnrollmentFlow] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('enrollmentFlow') === 'true') {
            setIsEnrollmentFlow(true);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePicture(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const userData = { ...formData, profilePicture: preview || `https://i.pravatar.cc/150?u=${formData.email}` };
        
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('storage_change'));

        if (isEnrollmentFlow) {
            sessionStorage.removeItem('enrollmentFlow');
            window.location.hash = '#/confirmation';
        } else {
            window.location.hash = '#/profile';
        }
    };

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
      e.preventDefault();
      window.location.hash = path;
    };

    return (
        <div className="container mx-auto px-6 py-12 flex justify-center">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-lg">
                {isEnrollmentFlow && (
                     <div className="text-center p-4 bg-slate-100 rounded-lg">
                        <h3 className="font-semibold text-slate-800">Complete your profile to enroll</h3>
                        <p className="text-sm text-slate-600">
                           Already have an account? <a href="#/login" onClick={(e) => handleNav(e, '#/login')} className="font-medium text-pistachio-dark hover:text-lime-800">Log in</a>
                        </p>
                    </div>
                )}
                <h2 className="text-3xl font-bold text-center text-slate-900">Create Your Account</h2>
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
                        <InputField id="firstName" label="First Name" type="text" value={formData.firstName} onChange={handleChange} required />
                        <InputField id="lastName" label="Last Name" type="text" value={formData.lastName} onChange={handleChange} required />
                        <InputField id="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} required />
                        <InputField id="nationalId" label="National ID Number" type="text" value={formData.nationalId} onChange={handleChange} required />
                        <InputField id="city" label="City" type="text" value={formData.city} onChange={handleChange} required />
                        <InputField id="phone" label="Phone Number" type="tel" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div className="space-y-6">
                         <InputField id="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} required />
                         <InputField id="password" label="Password" type="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div>
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-pistachio-dark hover:bg-lime-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pistachio-dark transition-colors">
                           Create Account
                        </button>
                    </div>
                </form>
                {!isEnrollmentFlow && (
                    <p className="text-sm text-center text-slate-600">
                        Already have an account? <a href="#/login" onClick={(e) => handleNav(e, '#/login')} className="font-medium text-pistachio-dark hover:text-lime-800">Log in</a>
                    </p>
                )}
            </div>
        </div>
    );
};

export default SignUpPage;