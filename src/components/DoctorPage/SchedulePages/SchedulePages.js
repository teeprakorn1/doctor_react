import React, { useState, useEffect } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import { useNavigate } from "react-router-dom";
import { decryptValue } from "../../../utils/crypto";
import styles from './SchedulePages.module.css';

function SchedulePages() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
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

        if (userType === "doctor") {
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
            </main>
        </div>
    );
}

export default SchedulePages;