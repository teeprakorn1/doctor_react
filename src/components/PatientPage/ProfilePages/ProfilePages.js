import React, { useState, useEffect } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import { useNavigate } from "react-router-dom";
import { decryptValue } from "../../../utils/crypto";
import axios from "axios";
import styles from './ProfilePages.module.css';
import CustomModal from "./../../../services/CustomModal/CustomModal";

const getApiUrl = (endpoint) => {
    return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

function ProfilePages() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtons, setModalButtons] = useState([]);

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
        if (!isAuthorized) return;

        const fetchProfile = async () => {
            try {
                const res = await axios.get(
                    getApiUrl(process.env.REACT_APP_API_GET_PROFILE_WEBSITE),
                    { withCredentials: true }
                );

                if (res.data.status) {
                    setProfileData(res.data);
                    setFormData({
                        Patient_FirstName: res.data.Patient_FirstName || "",
                        Patient_LastName: res.data.Patient_LastName || "",
                        Patient_Phone: res.data.Patient_Phone || "",
                        Patient_Gender: res.data.Patient_Gender
                            ? res.data.Patient_Gender.toLowerCase() === "male" || res.data.Patient_Gender.toLowerCase() === "ชาย"
                                ? "male"
                                : "female"
                            : "",
                        Patient_MedicalHistory: res.data.Patient_MedicalHistory || "",
                    });

                } else {
                    console.warn("ไม่พบข้อมูลโปรไฟล์");
                }
            } catch (err) {
                console.error("API error (profile):", err);
                if (err.response?.status === 401) {
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthorized, navigate]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            setSidebarOpen(!mobile);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const updateData = {};
        if (formData.Patient_FirstName?.trim()) {
            if (formData.Patient_FirstName.length > 100) {
                setModalMessage("ชื่อ ต้องไม่เกิน 100 ตัวอักษร");
                setModalButtons([{ label: "ตกลง", onClick: () => setModalOpen(false) }]);
                setModalOpen(true);
                return;
            }
            updateData.Patient_FirstName = formData.Patient_FirstName.trim();
        }

        if (formData.Patient_LastName?.trim()) {
            if (formData.Patient_LastName.length > 100) {
                setModalMessage("นามสกุล ต้องไม่เกิน 100 ตัวอักษร");
                setModalButtons([{ label: "ตกลง", onClick: () => setModalOpen(false) }]);
                setModalOpen(true);
                return;
            }
            updateData.Patient_LastName = formData.Patient_LastName.trim();
        }

        if (formData.Patient_Phone?.trim()) {
            const phone = formData.Patient_Phone.trim();
            if (!/^\d{8,20}$/.test(phone)) {
                setModalMessage("เบอร์โทร ต้องเป็นตัวเลข 8-20 หลัก");
                setModalButtons([{ label: "ตกลง", onClick: () => setModalOpen(false) }]);
                setModalOpen(true);
                return;
            }
            updateData.Patient_Phone = phone;
        }

        if (formData.Patient_Gender?.trim()) {
            const gender = formData.Patient_Gender.trim().toLowerCase();
            if (!["male", "female"].includes(gender)) {
                setModalMessage("ค่าเพศไม่ถูกต้อง");
                setModalButtons([{ label: "ตกลง", onClick: () => setModalOpen(false) }]);
                setModalOpen(true);
                return;
            }
            updateData.Patient_Gender = gender;
        }

        if (formData.Patient_MedicalHistory?.trim()) {
            if (formData.Patient_MedicalHistory.length > 1023) {
                setModalMessage("ประวัติการรักษายาวเกิน 1023 ตัวอักษร");
                setModalButtons([{ label: "ตกลง", onClick: () => setModalOpen(false) }]);
                setModalOpen(true);
                return;
            }
            updateData.Patient_MedicalHistory = formData.Patient_MedicalHistory.trim();
        }

        if (Object.keys(updateData).length === 0) {
            setModalMessage("กรุณากรอกข้อมูลที่ต้องการแก้ไขก่อนบันทึก");
            setModalButtons([{ label: "ตกลง", onClick: () => setModalOpen(false) }]);
            setModalOpen(true);
            return;
        }

        try {
            const res = await axios.put(
                getApiUrl("/api/profile/patient/update"),
                updateData,
                { withCredentials: true }
            );

            if (res.data.status) {
                setProfileData(prev => ({ ...prev, ...updateData }));
                setIsEditing(false);
                setModalMessage("บันทึกข้อมูลสำเร็จ");
                setModalButtons([{ label: "ตกลง", onClick: () => setModalOpen(false) }]);
                setModalOpen(true);
            } else {
                setModalMessage(res.data.message || "ไม่สามารถบันทึกข้อมูลได้");
                setModalButtons([{ label: "ตกลง", onClick: () => setModalOpen(false) }]);
                setModalOpen(true);
            }
        } catch (err) {
            console.error("API error (update profile):", err);
            setModalMessage(err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            setModalButtons([{ label: "ปิด", onClick: () => setModalOpen(false) }]);
            setModalOpen(true);
        }
    };


    if (isAuthorized === null || loading) {
        return <div>กำลังตรวจสอบสิทธิ์และโหลดข้อมูล...</div>;
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
                    <h1 className={styles.heading}>โปรไฟล์ของคุณ</h1>
                </div>

                {profileData ? (
                    <div className={styles.profileCard}>
                        {isEditing ? (
                            <>
                                <p>
                                    <b>ชื่อ :</b>
                                    <input
                                        type="text"
                                        name="Patient_FirstName"
                                        value={formData.Patient_FirstName}
                                        onChange={handleChange}
                                    />
                                    <input
                                        type="text"
                                        name="Patient_LastName"
                                        value={formData.Patient_LastName}
                                        onChange={handleChange}
                                    />
                                </p>
                                <p>
                                    <b>เบอร์โทร :</b>
                                    <input
                                        type="text"
                                        name="Patient_Phone"
                                        value={formData.Patient_Phone}
                                        onChange={handleChange}
                                    />
                                </p>
                                <p>
                                    <b>เพศ :</b>
                                    <select
                                        name="Patient_Gender"
                                        value={formData.Patient_Gender}
                                        onChange={handleChange}
                                    >
                                        <option value="">-</option>
                                        <option value="male">ชาย</option>
                                        <option value="female">หญิง</option>
                                    </select>
                                </p>
                                <p>
                                    <b>ประวัติการรักษา :</b>
                                    <textarea
                                        name="Patient_MedicalHistory"
                                        value={formData.Patient_MedicalHistory}
                                        onChange={handleChange}
                                        rows="4"
                                    />
                                </p>
                                <button onClick={handleSave} className={styles.saveBtn}>บันทึก</button>
                                <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>ยกเลิก</button>
                            </>
                        ) : (
                            <>
                                <p><b>ชื่อ :</b> {profileData.Patient_FirstName} {profileData.Patient_LastName}</p>
                                <p><b>อีเมล :</b> {profileData.Users_Email}</p>
                                <p><b>เบอร์โทร :</b> {profileData.Patient_Phone || "-"}</p>
                                <p><b>เพศ :</b> {profileData.Patient_Gender || "-"}</p>
                                <p><b>ประวัติการรักษา :</b> {profileData.Patient_MedicalHistory || "-"}</p>
                                <button onClick={() => setIsEditing(true)} className={styles.editBtn}>แก้ไขข้อมูล</button>
                            </>
                        )}
                    </div>
                ) : (
                    <p>ไม่พบข้อมูลโปรไฟล์</p>
                )}
            </main>

            <CustomModal
                isOpen={modalOpen}
                message={modalMessage}
                onClose={() => setModalOpen(false)}
                buttons={modalButtons}
            />
        </div>
    );
}

export default ProfilePages;