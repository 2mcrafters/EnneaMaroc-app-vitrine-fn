import React from 'react';
import { Revision } from '../data/revisions';
import { Instructor } from '../data/instructors';

interface RevisionCardProps {
  revision: Revision;
}

const RevisionCard: React.FC<RevisionCardProps> = ({ revision }) => {
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };
  
  const allInstructors: Instructor[] = JSON.parse(localStorage.getItem('profs') || '[]');
  const instructorIds = [...new Set(revision.modalities.flatMap(m => m.options.map(o => o.instructorId)))];
  const instructorNames = instructorIds
    .map(profId => allInstructors.find(p => p.id === profId)?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <a 
      href={`#/revision/${revision.id}`} 
      onClick={(e) => handleNav(e, `#/revision/${revision.id}`)}
      className="block bg-white rounded-2xl shadow-sm hover:shadow-xl border border-transparent hover:border-pistachio-DEFAULT/50 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
    >
      <div className="aspect-video overflow-hidden">
        <img src={revision.imageUrl} alt={revision.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">{revision.title}</h3>
        <p className="text-slate-600 leading-relaxed mb-4 text-sm h-10 overflow-hidden">{revision.shortDescription}</p>
        <div className="flex items-center text-sm text-slate-500 pt-4 border-t border-slate-100">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          <span className="truncate">{instructorNames}</span>
        </div>
      </div>
    </a>
  );
};

export default RevisionCard;