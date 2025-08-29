import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';

import Login from './components/LoginPage/LoginPage';
import Register from './components/RegisterPage/RegisterPage';

import MainPages from './components/MainPages/MainPages';
import PatientPage from './components/PatientPage/PatientPage';
import DoctorPage from './components/DoctorPage/DoctorPage';

import SearchPages from './components/PatientPage/SearchPages/SearchPages';
import SelectDoctorPage from './components/PatientPage/SearchPages/SelectDoctorPage/SelectDoctorPage';
import AppointmentPages from './components/PatientPage/AppointmentPages/AppointmentPages';
import ProfilePages from './components/PatientPage/ProfilePages/ProfilePages';
import EditProfilePages from './components/PatientPage/ProfilePages/EditProfilePages/EditProfilePages';

import RequestAttentionPages from './components/DoctorPage/RequestAttentionPages/RequestAttentionPages';
import SchedulePages from './components/DoctorPage/SchedulePages/SchedulePages';

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
        <Route path='/register' element={<Register />} />

        {/* Protected Routes */}
        <Route path='/' element={<ProtectedRoute><MainPages /></ProtectedRoute>} />
        <Route path='/main' element={<ProtectedRoute><MainPages /></ProtectedRoute>} />
        <Route path='/patient' element={<ProtectedRoute><PatientPage /></ProtectedRoute>} />
        <Route path='/doctor' element={<ProtectedRoute><DoctorPage /></ProtectedRoute>} />

        {/* Patient Routes */}
        <Route path='/patient/search' element={<ProtectedRoute><SearchPages /></ProtectedRoute>} />
        <Route path='/patient/search/select-doctor' element={<ProtectedRoute><SelectDoctorPage /></ProtectedRoute>} />
        <Route path='/patient/appointment' element={<ProtectedRoute><AppointmentPages /></ProtectedRoute>} />
        <Route path='/patient/profile' element={<ProtectedRoute><ProfilePages /></ProtectedRoute>} />
        <Route path='/patient/profile/edit-profile' element={<ProtectedRoute><EditProfilePages /></ProtectedRoute>} />

        {/* Doctor Routes */}
        <Route path='/doctor/request-attention' element={<ProtectedRoute><RequestAttentionPages /></ProtectedRoute>} />
        <Route path='/doctor/schedule' element={<ProtectedRoute><SchedulePages /></ProtectedRoute>} />

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;