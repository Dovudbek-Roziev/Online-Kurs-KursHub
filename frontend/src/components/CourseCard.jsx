import { Link } from "react-router-dom";
import { FaStar, FaEye, FaPlay } from 'react-icons/fa';

export default function CourseCard({ course }) {
  return (
    <article className="group relative bg-slate-800 border border-slate-700 rounded-[2rem] overflow-hidden transition-all duration-300 hover:border-slate-500 hover:-translate-y-1 hover:shadow-xl">
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-[16/9] m-3 rounded-[1.5rem] bg-slate-900">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800">
            <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center">
              <FaPlay className="w-5 h-5 text-slate-400 ml-1" />
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md text-xs font-semibold text-slate-200 border border-slate-700/50 rounded-lg">
            {course.category}
          </span>
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${
            course.price > 0 
              ? 'bg-slate-900/80 backdrop-blur-md text-white border border-slate-700/50' 
              : 'bg-indigo-500 text-white'
          }`}>
            {course.price > 0 ? `$${course.price}` : 'BEPUL'}
          </span>
        </div>
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-300">
            <FaPlay className="w-5 h-5 text-white ml-1 shadow-sm" />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 pt-4">
        {/* Stats */}
        <div className="flex items-center gap-4 mb-3 text-sm text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <FaStar className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">{course.rating?.toFixed(1) || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FaEye className="w-4 h-4" />
            <span>{course.views?.toLocaleString() || 0}</span>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 leading-tight line-clamp-2">
          {course.title}
        </h3>
        
        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-6">
          {course.description}
        </p>
        
        {/* CTA Button */}
        <Link 
          to={`/courses/${course._id}`}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors duration-300 w-full"
        >
          Kursni Ko'rish
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
