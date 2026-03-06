import React, { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import { Course } from '../data/courses';
import BackArrowIcon from '../components/icons/BackArrowIcon';

const CoursesListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  
  useEffect(() => {
    const coursesFromStorage = JSON.parse(localStorage.getItem('courses') || '[]');
    setAllCourses(coursesFromStorage);
  }, []);

  const hash = window.location.hash;
  const courseType = hash.includes('in-person') ? 'in-person' : 'online';

  const filteredCourses = allCourses.filter(course => course.type === courseType);
  const title = courseType === 'in-person' ? 'In-Person Courses' : 'Online Courses';
  
  const displayedCourses = filteredCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  return (
    <div className="container mx-auto px-6 py-12 animate-fade-in">
      <div className="relative mb-8 flex justify-center items-center">
         <a 
            href="#/" 
            onClick={(e) => handleNav(e, '#/')} 
            className="absolute left-0 text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-100"
            aria-label="Back to home"
          >
            <BackArrowIcon className="w-6 h-6" />
        </a>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 text-center">{title}</h1>
      </div>

      <div className="mb-10 max-w-lg mx-auto">
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </span>
            <input
                type="text"
                placeholder={`Search ${title}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pistachio-dark focus:border-transparent transition-shadow"
                aria-label="Search courses"
            />
        </div>
      </div>

      {displayedCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-600">
            {searchQuery ? `No courses found for "${searchQuery}".` : 'No courses available in this category at the moment.'}
        </p>
      )}
    </div>
  );
};

export default CoursesListPage;