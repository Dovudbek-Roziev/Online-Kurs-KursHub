import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import AddCourse from './pages/AddCourse';
import Categories from './pages/Categories';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import Comments from './pages/Comments';
import Settings from './pages/Settings';
import CourseManage from './pages/CourseManage';
import ManageQuiz from './pages/ManageQuiz';
import Quizzes from './pages/Quizzes';
import Chat from './pages/Chat';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:courseId" element={<CourseManage />} />
        <Route path="quiz/:chapterId" element={<ManageQuiz />} />
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="add-course" element={<AddCourse />} />
        <Route path="categories" element={<Categories />} />
        <Route path="users" element={<Users />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="comments" element={<Comments />} />
        <Route path="chat" element={<Chat />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
