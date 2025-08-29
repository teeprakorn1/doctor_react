import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../../NavigationBar/NavigationBar';
import { useLocation } from 'react-router-dom';
import styles from './SelectDoctorPage.module.css';
import { useNavigate } from 'react-router-dom'
import { decryptValue } from "../../../../utils/crypto";
import { Calendar } from 'lucide-react';
import axios from 'axios';

const getApiUrl = (endpoint) => {
    return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

function SelectDoctorPage() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [Doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [appointmentTime, setAppointmentTime] = useState("");
    const [availability, setAvailability] = useState([]);
    const location = useLocation();
    const rowsPerPage = 10;
    const [specialty, setSpecialty] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(null);
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
        const params = new URLSearchParams(location.search);
        const specialtyParam = params.get("specialty") || "";
        const doctorNameParam = params.get("doctorName") || "";
        setSpecialty(specialtyParam);
        setDoctorName(doctorNameParam);
    }, [location.search]);

    useEffect(() => {
        if (!selectedDoctor) return;

        const fetchAvailability = async () => {
            try {
                const res = await axios.get(
                    getApiUrl(`${process.env.REACT_APP_API_DOCTOR}${selectedDoctor.Doctor_ID}${process.env.REACT_APP_API_AVAILABILITY}`),
                    { withCredentials: true }
                );

                if (res.data.status) {
                    setAvailability(res.data.data);
                } else {
                    setAvailability([]);
                }
            } catch (err) {
                console.error(err);
                setAvailability([]);
            }
        };

        fetchAvailability();
    }, [selectedDoctor]);

    const handleConfirmAppointment = async () => {
        if (!appointmentTime) {
            alert("กรุณาเลือกเวลานัด");
            return;
        }

        try {
            const res = await axios.post(
                getApiUrl(process.env.REACT_APP_API_APPOINTMENT_CREATE),
                {
                    doctorId: selectedDoctor.Doctor_ID,
                    availabilityId: appointmentTime
                },
                { withCredentials: true }
            );

            if (res.data.status) {
                alert("นัดแพทย์เรียบร้อยแล้ว");
                setModalOpen(false);

                navigate('/patient/appointment');
            } else {
                alert("เกิดข้อผิดพลาด: " + res.data.message);
            }
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาดในการนัดแพทย์");
        }
    };

    const fetchDoctors = useCallback(async () => {
        setLoading(true);

        try {
            let res;

            if (doctorName) {
                res = await axios.get(
                    getApiUrl(`${process.env.REACT_APP_API_GET_DOCTOR_NAME_WEBSITE}${encodeURIComponent(doctorName)}`),
                    { withCredentials: true }
                );
            } else if (specialty) {
                res = await axios.get(
                    getApiUrl(`${process.env.REACT_APP_API_GET_DOCTOR_SPECIALTY_WEBSITE}${encodeURIComponent(specialty)}`),
                    { withCredentials: true }
                );
            } else {
                setDoctors([]);
                setLoading(false);
                return;
            }

            if (res.data.status) {
                setDoctors(res.data.data);
            } else {
                setDoctors([]);
            }
        } catch (err) {
            console.error(err);
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }, [specialty, doctorName]);


    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    // Responsive
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            setSidebarOpen(!mobile);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Pagination
    const totalPages = Math.ceil(Doctors.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = Doctors.slice(indexOfFirstRow, indexOfLastRow);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    if (loading) return <div>Loading...</div>;


    if (isAuthorized === null) {
        return <div>กำลังตรวจสอบสิทธิ์...</div>;
    }

    return (
        <div className={styles.container}>
            <Navbar isMobile={isMobile} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ""} ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}>
                <div className={styles.headerBar}>
                    <h1 className={styles.heading}>เลือกแพทย์</h1>
                </div>

                <div className={styles.DoctorSection}>
                    <div className={styles.DoctorTableWrapper}>
                        <table className={styles.DoctorTable}>
                            <thead>
                                <tr>
                                    <th>รหัส</th>
                                    <th>ชื่อจริง</th>
                                    <th>นามสกุล</th>
                                    <th>เบอร์โทร</th>
                                    <th>สาขา</th>
                                    <th>ดูรายละเอียด</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRows.length > 0 ? currentRows.map(doc => (
                                    <tr key={doc.Doctor_ID}>
                                        <td>{doc.Doctor_ID}</td>
                                        <td>{doc.Doctor_FirstName}</td>
                                        <td>{doc.Doctor_LastName}</td>
                                        <td>{doc.Doctor_Phone}</td>
                                        <td>{doc.Specialty_Name}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.viewBtn}
                                                    onClick={() => { setSelectedDoctor(doc); setModalOpen(true); }}
                                                >
                                                    <Calendar className={styles.iconSmall} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center" }}>ไม่พบข้อมูล</td>
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

                {modalOpen && selectedDoctor && (
                    <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <button className={styles.modalClose} onClick={() => setModalOpen(false)}>✕</button>
                            <h2>Doctor: {selectedDoctor.Doctor_FirstName} {selectedDoctor.Doctor_LastName}</h2>
                            <p>เบอร์โทร: {selectedDoctor.Doctor_Phone}</p>
                            <p>สาขา: {selectedDoctor.Specialty_Name}</p>

                            <div style={{ marginTop: "20px" }}>
                                <label htmlFor="appointmentSlot">เลือกเวลาว่าง:</label>
                                <select
                                    id="appointmentSlot"
                                    value={appointmentTime}
                                    onChange={(e) => setAppointmentTime(e.target.value)}
                                    className={styles.modalSelect}
                                >
                                    <option value="">-- เลือกเวลาว่าง --</option>
                                    {availability.length > 0 ? availability.map(slot => {
                                        const formattedDate = new Date(slot.Availability_Date).toLocaleDateString('th-TH', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        });

                                        return (
                                            <option key={slot.Availability_ID} value={slot.Availability_ID}>
                                                {formattedDate} {slot.Availability_StartTime} - {slot.Availability_EndTime}
                                            </option>
                                        );
                                    }) : (
                                        <option value="" disabled>ไม่มีเวลาว่าง</option>
                                    )}

                                </select>

                                <button
                                    onClick={handleConfirmAppointment}
                                    disabled={!appointmentTime}
                                    className={styles.modalButton}
                                >
                                    ยืนยันการนัด
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default SelectDoctorPage;