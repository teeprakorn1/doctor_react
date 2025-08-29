import React, { useState, useEffect } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './AppointmentPages.module.css';
import { decryptValue } from '../../../utils/crypto';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const getApiUrl = (endpoint) => {
    return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

function AppointmentPages() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const navigate = useNavigate();

    useEffect(() => {
        const sessionUsersTypeRaw = sessionStorage.getItem("UsersType");
        let userType = "";

        if (sessionUsersTypeRaw) {
            try {
                userType = decryptValue(sessionUsersTypeRaw)?.trim().toLowerCase();
            } catch (err) {
                console.error("Failed to decrypt UsersType:", err);
            }
        }

        if (userType === "patient") {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
            navigate("/main");
        }
    }, [navigate]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            setSidebarOpen(!mobile);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await axios.get(getApiUrl(process.env.REACT_APP_API_APPOINTMENT_PATIENT), { withCredentials: true });
                if (res.data.status) {
                    setAppointments(res.data.data);
                } else {
                    setAppointments([]);
                }
            } catch (err) {
                console.error(err);
                setAppointments([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    // Pagination
    const totalPages = Math.ceil(appointments.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = appointments.slice(indexOfFirstRow, indexOfLastRow);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    if (loading) return <div>Loading...</div>;
    if (isAuthorized === null) return <div>กำลังตรวจสอบสิทธิ์...</div>;

    return (
        <div className={styles.container}>
            <Navbar
                isMobile={isMobile}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
            <main
                className={`${styles.mainContent} 
                    ${isMobile ? styles.mobileContent : ""} 
                    ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}
            >
                <div className={styles.headerBar}>
                    <h1 className={styles.heading}>สถานะการนัดของฉัน</h1>
                </div>
                <div className={styles.DoctorSection}>
                    <div className={styles.DoctorTableWrapper}>
                        <table className={styles.DoctorTable}>
                            <thead>
                                <tr>
                                    <th>รหัสนัด</th>
                                    <th>แพทย์</th>
                                    <th>สาขา</th>
                                    <th>วัน / เวลา</th>
                                    <th>สถานะ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRows.length > 0 ? currentRows.map(app => {
                                    const formattedDate = new Date(app.Availability_Date).toLocaleDateString('th-TH', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                    });
                                    return (
                                        <tr key={app.Appointment_ID}>
                                            <td>{app.Appointment_ID}</td>
                                            <td>{app.Doctor_FirstName} {app.Doctor_LastName}</td>
                                            <td>{app.Specialty_Name}</td>
                                            <td>{formattedDate} {app.Availability_StartTime} - {app.Availability_EndTime}</td>
                                            <td>
                                                {app.AppointmentStatus_Name}
                                                {app.AppointmentStatus_Description && (
                                                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280' }}>
                                                        {app.AppointmentStatus_Description}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center" }}>ไม่พบข้อมูลการนัดหมาย</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
                            {pageNumbers.map(number => (
                                <button key={number} className={currentPage === number ? styles.activePage : ""} onClick={() => setCurrentPage(number)}>{number}</button>
                            ))}
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AppointmentPages;