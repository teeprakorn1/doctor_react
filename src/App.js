import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';

import Login from './components/LoginPage/LoginPage';
import MainPages from './components/MainPages/MainPages';
import SearchPages from './components/SearchPages/SearchPages';
import ProfilePages from './components/ProfilePages/ProfilePages';
import AppointmentPages from './components/AppointmentPages/AppointmentPages';

import EditProfilePages from './components/ProfilePages/EditProfilePages/EditProfilePages';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = sessionStorage.getItem("userSession");
  return isLoggedIn ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path='/login' element={<Login />} />

        {/* Protected Routes */}
        <Route path='/' element={<ProtectedRoute><MainPages /></ProtectedRoute>} />
        <Route path='/main' element={<ProtectedRoute><MainPages /></ProtectedRoute>} />
        <Route path='/search' element={<ProtectedRoute><SearchPages /></ProtectedRoute>} />
        <Route path='/profile' element={<ProtectedRoute><ProfilePages /></ProtectedRoute>} />
        <Route path='/appointment' element={<ProtectedRoute><AppointmentPages /></ProtectedRoute>} />


        {/* Profile Redirects */}
        <Route path='/profile/edit-profile' element={<ProtectedRoute><EditProfilePages /></ProtectedRoute>} />

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
