import React, { useEffect, useState } from 'react';
import styles from './RegisterPage.module.css';
import InputField from './InputField';
import axios from "axios";
import CustomModal from '../../services/CustomModal/CustomModal';
import Logo from '../../assets/logo/logo.svg';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

function RegisterPage() {
  const [Admin_Username, setUsername] = useState("");
  const [Admin_Password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const openLoginModal = (message) => {
    setModalMessage(message);
    setIsLoginModalOpen(true);
  };
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setModalMessage("");
  };

  const loginUser = async (username, password, remember) => {
    if (!username || !password) {
      openLoginModal("กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน.");
      return false;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        getApiUrl(process.env.REACT_APP_API_LOGIN_WEBSITE),
        { Users_Email: username, Users_Password: password },
        { withCredentials: true }
      );

      const result = response.data;

      if (result.status === true) {
        if (remember) {
          localStorage.setItem("savedUsername", username);
        } else {
          localStorage.removeItem("savedUsername");
        }
        return true;
      } else {
        openLoginModal(result.message || "รหัสผ่านหรือชื่อผู้ใช้ไม่ถูกต้อง.");
        return false;
      }
    } catch (error) {
      if (error.response) {
        openLoginModal("รหัสผ่านหรือชื่อผู้ใช้ไม่ถูกต้อง.");
      } else if (error.request) {
        openLoginModal("ไม่สามารถเชื่อมต่อ server ได้ โปรดลองอีกครั้ง.");
      } else {
        openLoginModal("มีบางอย่างผิดพลาด โปรดลองอีกครั้ง.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const success = await loginUser(Admin_Username, Admin_Password, rememberMe);
    if (success) {
      sessionStorage.setItem("userSession", true);
      window.location.href = '/';
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <img
          loading="lazy"
          src={Logo}
          className={styles.loginLogo}
          alt="Company Logo"
        />
        <h1 className={styles.loginTitle}>Login System</h1>

        <form className={styles.loginForm} onSubmit={handleSubmit} autoComplete="on">
          <InputField
            id="username"
            type="text"
            placeholder="Email / Username"
            value={Admin_Username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
          />
          <InputField
            id="password"
            type="password"
            placeholder="Password"
            value={Admin_Password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <div className={styles.rememberMe}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>

          <button
            className={styles.loginButton}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "LOGIN"}
          </button>
        </form>
      </div>

      <CustomModal
        isOpen={isLoginModalOpen}
        message={modalMessage}
        onClose={closeLoginModal}
      />
    </div>
  );
}

export default RegisterPage;