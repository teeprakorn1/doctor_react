import React, { useState, useEffect } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import styles from './SchedulePages.module.css';
import CustomModal from '../../../services/CustomModal/CustomModal';
import { decryptValue } from "../../../utils/crypto";
const getApiUrl = (endpoint) => {
    return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

function SchedulePages() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [availabilityList, setAvailabilityList] = useState([]);
    const [newSlot, setNewSlot] = useState({ date: '', startTime: '', endTime: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modal, setModal] = useState({ isOpen: false, message: '', type: 'info' });
    const [currentPage, setCurrentPage] = useState(1);
    const [isAuthorized, setIsAuthorized] = useState(null);
    const navigate = useNavigate();
    const rowsPerPage = 10;

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

        if (userType === "doctor") {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
            navigate("/main");
        }
    }, [navigate]);

    const fetchAvailability = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(getApiUrl(process.env.REACT_APP_API_DOCTOR_AVAILABILITY_WEBSITE), { withCredentials: true });
            if (res.data) setAvailabilityList(res.data);
        } catch (err) {
            console.error('Fetch availability error:', err);
            setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAvailability(); }, []);

    const handleAddAvailability = async () => {
        const { date, startTime, endTime } = newSlot;

        if (!date || !startTime || !endTime) {
            setModal({ isOpen: true, message: 'กรุณากรอกทุกช่อง', type: 'error' });
            return;
        }

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setModal({ isOpen: true, message: 'วันที่ต้องไม่เป็นวันในอดีต', type: 'error' });
            return;
        }

        if (startTime >= endTime) {
            setModal({ isOpen: true, message: 'เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด', type: 'error' });
            return;
        }

        try {
            const res = await axios.post(getApiUrl(process.env.REACT_APP_API_DOCTOR_AVAILABILITY_WEBSITE), newSlot, { withCredentials: true });
            if (res.data.status) {
                setModal({ isOpen: true, message: 'เพิ่มเวลาว่างสำเร็จ', type: 'success' });
                setNewSlot({ date: '', startTime: '', endTime: '' });
                fetchAvailability();
            }
        } catch (err) {
            console.error('Add availability error:', err);
            setModal({ isOpen: true, message: 'เกิดข้อผิดพลาดในการเพิ่มเวลาว่าง', type: 'error' });
        }
    };


    // Pagination
    const totalPages = Math.ceil(availabilityList.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = availabilityList.slice(indexOfFirstRow, indexOfLastRow);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            setSidebarOpen(!mobile);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (isAuthorized === null) {
        return <div>กำลังตรวจสอบสิทธิ์...</div>;
    }

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
                    <h1 className={styles.heading}>จัดการตารางเวลา</h1>
                </div>

                {/* Add new slot */}
                <div className={styles.addForm}>
                    <input type="date" value={newSlot.date} onChange={e => setNewSlot({ ...newSlot, date: e.target.value })} />
                    <input type="time" value={newSlot.startTime} onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })} />
                    <input type="time" value={newSlot.endTime} onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })} />
                    <button onClick={handleAddAvailability}>เพิ่มเวลาว่าง</button>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    <div className={styles.DoctorSection}>
                        <div className={styles.DoctorTableWrapper}>
                            <table className={styles.DoctorTable}>
                                <thead>
                                    <tr>
                                        <th>รหัส</th>
                                        <th>วันที่</th>
                                        <th>เวลาเริ่ม</th>
                                        <th>เวลาสิ้นสุด</th>
                                        <th>สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRows.length > 0 ? currentRows.map(slot => (
                                        <tr key={slot.Availability_ID}>
                                            <td>{slot.Availability_ID}</td>
                                            <td>
                                                {new Date(slot.Availability_Date).toLocaleDateString('th-TH', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td>{slot.Availability_StartTime}</td>
                                            <td>{slot.Availability_EndTime}</td>
                                            <td>{slot.Availability_IsBooked ? 'ถูกจองแล้ว' : 'ว่าง'}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: "center" }}>ไม่พบข้อมูล</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
                                {pageNumbers.map(number => (
                                    <button
                                        key={number}
                                        className={currentPage === number ? styles.activePage : ""}
                                        onClick={() => setCurrentPage(number)}
                                    >
                                        {number}
                                    </button>
                                ))}
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Custom Modal */}
                <CustomModal
                    isOpen={modal.isOpen}
                    message={modal.message}
                    onClose={() => setModal({ ...modal, isOpen: false })}
                />
            </main>
        </div>
    );
}

export default SchedulePages;
