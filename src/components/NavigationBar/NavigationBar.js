import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./NavigationBar.module.css";
import Logo from "../../assets/logo/logo.svg";
import { encryptValue, decryptValue } from "../../utils/crypto";
import { ReactComponent as MainIcon } from "../../assets/icons/main_icon.svg";
import { ReactComponent as DoctorIcon } from "../../assets/icons/name_register_icon.svg";
import { ReactComponent as PatientIcon } from "../../assets/icons/staff_management_icon.svg";
import { ReactComponent as LogoutIcon } from "../../assets/icons/logout_icon.svg";
import { ReactComponent as MenuIcon } from "../../assets/icons/menu_icon.svg";
import CustomModal from "../../services/CustomModal/CustomModal";
import axios from "axios";

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activePath, setActivePath] = useState(location.pathname);
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [Data_UsersType, setUsersType] = useState("");
  const [isLoadingUserType, setIsLoadingUserType] = useState(true);
  const [Admin, setAdmin] = useState({ firstName: "", lastName: "", typeName: "" });

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsCollapsed(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeNavbarOnMobile = () => {
    if (isMobile) setIsCollapsed(true);
  };

  const fetchAdminData = useCallback(async () => {
    const sessionAdminRaw = sessionStorage.getItem("admin");
    let sessionAdmin = null;

    if (sessionAdminRaw) {
      try {
        sessionAdmin = JSON.parse(decryptValue(sessionAdminRaw));
      } catch (err) {
        console.error("Failed to decrypt session admin:", err);
        sessionAdmin = null;
        sessionStorage.removeItem("admin");
      }
    }

    if (sessionAdmin) {
      setAdmin(sessionAdmin);

      const sessionUsersTypeRaw = sessionStorage.getItem("UsersType");
      if (sessionUsersTypeRaw) {
        try {
          const usersType = decryptValue(sessionUsersTypeRaw);
          setUsersType(usersType);
        } catch (err) {
          console.error("Failed to decrypt UsersType:", err);
          sessionStorage.removeItem("UsersType");
        }
      }

      setIsLoadingUserType(false);
      return;
    }

    try {
      const verifyResponse = await axios.post(
        getApiUrl(process.env.REACT_APP_API_VERIFY),
        {},
        { withCredentials: true }
      );

      if (!verifyResponse.data.status) throw new Error("Invalid token");

      const { Users_Type } = verifyResponse.data;
      setUsersType(Users_Type);
      sessionStorage.setItem("UsersType", encryptValue(Users_Type));

      const profileResponse = await axios.get(
        getApiUrl(process.env.REACT_APP_API_GET_PROFILE_WEBSITE),
        { withCredentials: true }
      );

      if (profileResponse.data.status) {
        const profile = profileResponse.data;
        let firstName = "";
        let lastName = "";
        let typeName = "";

        if (profile.Users_Type_Table === "doctor") {
          firstName = profile.Doctor_FirstName || "";
          lastName = profile.Doctor_LastName || "";
          typeName = "Doctor";
        } else if (profile.Users_Type_Table === "patient") {
          firstName = profile.Patient_FirstName || "";
          lastName = profile.Patient_LastName || "";
          typeName = "Patient";
        } else {
          firstName = profile.Doctor_FirstName || profile.Doctor_FirstName || "Unknown";
          lastName = profile.Doctor_LastName || profile.Patient_LastName || "Unknown";
          typeName = profile.Users_Type_Table || "Unknown";
        }

        const adminData = { firstName, lastName, typeName };
        setAdmin(adminData);

        sessionStorage.setItem("admin", encryptValue(JSON.stringify(adminData)));
      } else {
        setAdmin({ firstName: "Unknown", lastName: "Unknown", typeName: "Unknown" });
      }
    } catch (err) {
      console.error(err);
      navigate("/login");
    } finally {
      setIsLoadingUserType(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const handleNavigation = (path) => {
    if (isLoadingUserType) {
      setAlertMessage("กำลังโหลดข้อมูลผู้ใช้ โปรดลองอีกครั้งในภายหลัง.");
      setIsAlertModalOpen(true);
      return closeNavbarOnMobile();
    }

    const userType = Data_UsersType?.trim().toLowerCase() || "";
    const accessMap = {
      patient: ["/main", "/patient"],
      doctor: ["/main", "/doctor"],
    };

    const defaultAllowed = ["/main"];
    const allowedPaths = accessMap[userType] || defaultAllowed;

    if (!allowedPaths.includes(path)) {
      setAlertMessage("คุณไม่มีสิทธิ์เข้าถึงหน้านี้.");
      setIsAlertModalOpen(true);
      return closeNavbarOnMobile();
    }

    setActivePath(path);
    navigate(path);
    closeNavbarOnMobile();
  };

  const handleLogout = async () => {
    try {
      await axios.post(getApiUrl(process.env.REACT_APP_API_LOGOUT_WEBSITE), {}, { withCredentials: true });

    } catch (err) {
      console.error(err);
    }

    setIsLogoutModalOpen(false);
    sessionStorage.removeItem("admin");
    sessionStorage.removeItem("UsersType");
    sessionStorage.removeItem("userSession");
    navigate("/login");
    closeNavbarOnMobile();
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
    closeNavbarOnMobile();
  };

  return (
    <>
      {isMobile && (
        <div className={styles.hamburger} onClick={() => setIsCollapsed(!isCollapsed)}>
          <MenuIcon width="24" height="24" />
        </div>
      )}

      <div className={`${styles.navbar} ${isCollapsed ? styles.collapsed : styles.expanded}`}>
        <div className={styles.logoContainer} onClick={() => handleNavigation("/main")}>
          <img src={Logo} alt="Doctor Logo" className={styles.logo} />
        </div>

        <div className={styles.RuleLabel}>{Admin.typeName}</div>
        <div className={styles.adminName}>{Admin.firstName} {Admin.lastName}</div>
        <div className={styles.linearBlank}></div>

        <ul className={styles.navbarList}>
          <li className={`${styles.navbarItem} ${activePath === "/main" ? styles.active : ""}`} onClick={() => handleNavigation("/main")}>
            <span className={styles.navbarLink}><MainIcon width="20" height="20" /> หน้าหลัก</span>
          </li>
          <li className={`${styles.navbarItem} ${activePath === "/patient" ? styles.active : ""}`} onClick={() => handleNavigation("/patient")}>
            <span className={styles.navbarLink}><DoctorIcon width="20" height="20" /> เฉพาะผู้ป่วย</span>
          </li>
          <li className={`${styles.navbarItem} ${activePath === "/doctor" ? styles.active : ""}`} onClick={() => handleNavigation("/doctor")}>
            <span className={styles.navbarLink}><PatientIcon width="20" height="20" /> เฉพาะแพทย์</span>
          </li>
        </ul>

        <div className={styles.logoutButton} onClick={handleLogoutClick}>
          <LogoutIcon width="20" height="20" />
          <span>Logout</span>
        </div>
      </div>

      <CustomModal
        isOpen={isLogoutModalOpen}
        message="คุณแน่ใจว่าต้องการออกจากระบบใช่ไหม?"
        buttons={[
          { label: "ไม่", onClick: () => setIsLogoutModalOpen(false), className: styles.cancelButton },
          { label: "ยืนยัน", onClick: handleLogout, className: styles.confirmButton }
        ]}
      />

      <CustomModal
        isOpen={isAlertModalOpen}
        message={alertMessage}
        onClose={() => setIsAlertModalOpen(false)}
      />
    </>
  );
};

export default NavigationBar;