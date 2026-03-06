import React from 'react';
import CourseTypeCard from '../components/CourseTypeCard';
import { InPersonCourseIcon } from '../components/icons/InPersonCourseIcon';
import { OnlineCourseIcon } from '../components/icons/OnlineCourseIcon';
import { RevisionIcon } from '../components/icons/RevisionIcon';

const LandingPage: React.FC = () => {
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mt-12 text-center">
        <h1 
          className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4 animate-slide-up" 
          style={{ animationDelay: '0.4s' }}
        >
          Develop Your Skills
        </h1>
        <p 
          className="max-w-2xl mx-auto text-lg text-slate-600 mb-8 animate-slide-up"
          style={{ animationDelay: '0.6s' }}
        >
          Choose your learning method and start your journey today.
        </p>

        <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <a 
                href="#/courses/in-person" 
                onClick={(e) => handleNav(e, '#/courses/in-person')}
                className="inline-block px-8 py-4 text-lg font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
                Get Started
            </a>
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-slide-up"
          style={{ animationDelay: '0.8s' }}
        >
          <a href="#/courses/in-person" onClick={(e) => handleNav(e, '#/courses/in-person')} className="block">
            <CourseTypeCard
              icon={<InPersonCourseIcon className="h-12 w-12 mb-4 text-pistachio-dark" />}
              title="In-Person Courses"
              description="Participate in interactive classes in our modern facilities with expert instructors."
            />
          </a>
          <a href="#/courses/online" onClick={(e) => handleNav(e, '#/courses/online')} className="block">
            <CourseTypeCard
              icon={<OnlineCourseIcon className="h-12 w-12 mb-4 text-pistachio-dark" />}
              title="Online Courses"
              description="Learn at your own pace, wherever you are, with 24/7 access to our comprehensive resources."
            />
          </a>
          <a href="#/revisions" onClick={(e) => handleNav(e, '#/revisions')} className="block">
            <CourseTypeCard
              icon={<RevisionIcon className="h-12 w-12 mb-4 text-pistachio-dark" />}
              title="Revision Sessions"
              description="Prepare for your exams with targeted review sessions led by subject matter experts."
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;