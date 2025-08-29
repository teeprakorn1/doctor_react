import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './SearchPages.module.css';
import { FiSearch, FiInfo, FiArrowRight } from 'react-icons/fi';
import { decryptValue } from "../../../utils/crypto";
import CustomModal from '../../../services/CustomModal/CustomModal';

function SearchPages() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [isAuthorized, setIsAuthorized] = useState(null);

    const [searchSpecialty, setSearchSpecialty] = useState("");
    const [searchDoctorName, setSearchDoctorName] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

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

    const handleSearch = () => {
        const specialty = searchSpecialty.trim();
        const doctorName = searchDoctorName.trim();

        if (!specialty && !doctorName) {
            setModalMessage("กรุณากรอกสาขาแพทย์หรือชื่อแพทย์ก่อนค้นหา");
            setModalOpen(true);
            return;
        }

        const params = new URLSearchParams();
        if (specialty) params.append("specialty", specialty);
        if (doctorName) params.append("doctorName", doctorName);

        navigate({
            pathname: "/patient/search/select-doctor",
            search: params.toString()
        });
    };

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
                {/* Header */}
                <div className={styles.headerBar}>
                    <h1 className={styles.heading}>ค้นหาแพทย์</h1>
                </div>

                {/* Center Card */}
                <div className={styles.centerCard}>
                    {/* Tip Box */}
                    <div className={styles.tipBox}>
                        <FiInfo size={20} className={styles.tipIcon} />
                        <div className={styles.tipContent}>
                            <div className={styles.tipItem}>
                                <FiArrowRight size={16} /> พิมพ์สาขาแพทย์หรือชื่อแพทย์ที่ต้องการค้นหา
                            </div>
                            <div className={styles.tipItem}>
                                <FiArrowRight size={16} /> กด <strong>Enter</strong> หรือปุ่ม <strong>ค้นหา</strong>
                            </div>
                        </div>
                    </div>

                    {/* Search Boxes */}
                    <div className={styles.searchCard}>
                        <label className={styles.searchLabel}>ค้นหาด้วยสาขาแพทย์ (Specialty Name)</label>
                        <div className={styles.searchInner}>
                            <FiSearch size={20} color="#6b7280" />
                            <input
                                type="text"
                                placeholder="กรอกสาขาแพทย์..."
                                className={styles.searchInput}
                                value={searchSpecialty}
                                onChange={(e) => setSearchSpecialty(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <button
                                className={styles.searchButton}
                                onClick={handleSearch}
                            >
                                ค้นหา
                            </button>
                        </div>
                    </div>

                    <div className={styles.searchCard}>
                        <label className={styles.searchLabel}>ค้นหาด้วยรายชื่อแพทย์ (Doctor Name)</label>
                        <div className={styles.searchInner}>
                            <FiSearch size={20} color="#6b7280" />
                            <input
                                type="text"
                                placeholder="กรอกรายชื่อแพทย์..."
                                className={styles.searchInput}
                                value={searchDoctorName}
                                onChange={(e) => setSearchDoctorName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <button
                                className={styles.searchButton}
                                onClick={handleSearch}
                            >
                                ค้นหา
                            </button>
                        </div>
                    </div>
                </div>

                {/* Custom Modal */}
                <CustomModal
                    isOpen={modalOpen}
                    message={modalMessage}
                    onClose={() => setModalOpen(false)}
                />
            </main>
        </div>
    );
}

export default SearchPages;