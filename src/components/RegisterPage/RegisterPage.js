import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css';
import InputField from './InputField';
import axios from "axios";
import CustomModal from '../../services/CustomModal/CustomModal';
import Logo from '../../assets/logo/logo.svg';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
const isValidUsername = (username) => /^[a-zA-Z0-9]{3,20}$/.test(username);
const isStrongPassword = (password) =>
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  password.length >= 8;
const isValidName = (name) => /^[A-Za-zก-ฮะ-๛\s]+$/.test(name);
const isValidPhone = (phone) => /^0[689]\d{8}$/.test(phone);

function RegisterPage() {
  const navigate = useNavigate();
  const [Users_Email, setEmail] = useState("");
  const [Users_Username, setUsername] = useState("");
  const [Users_Password, setPassword] = useState("");
  const [Patient_FirstName, setFirstName] = useState("");
  const [Patient_LastName, setLastName] = useState("");
  const [Patient_Phone, setPhone] = useState("");
  const [Patient_Gender, setGender] = useState("Male");
  const [Patient_MedicalHistory, setMedicalHistory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const openModal = (message) => { setModalMessage(message); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setModalMessage(""); };

  const registerUser = async () => {
    if (!Users_Email || !Users_Username || !Users_Password || !Patient_FirstName || !Patient_LastName || !Patient_Gender) {
      openModal("กรุณากรอกข้อมูลให้ครบถ้วน");
      return false;
    }
    if (!isValidEmail(Users_Email)) { openModal("อีเมลไม่ถูกต้อง"); return false; }
    if (!isValidUsername(Users_Username)) { openModal("ชื่อผู้ใช้งานต้อง 3-20 ตัวอักษรและตัวเลขเท่านั้น"); return false; }
    if (!isStrongPassword(Users_Password)) { openModal("รหัสผ่านต้องมีความยาว ≥8 ตัวอักษร, มีตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก และตัวเลข"); return false; }
    if (!isValidName(Patient_FirstName)) { openModal("ชื่อจริงต้องเป็นตัวอักษรไทยหรืออังกฤษเท่านั้น"); return false; }
    if (!isValidName(Patient_LastName)) { openModal("นามสกุลต้องเป็นตัวอักษรไทยหรืออังกฤษเท่านั้น"); return false; }
    if (Patient_Phone && !isValidPhone(Patient_Phone)) { openModal("เบอร์โทรศัพท์ไม่ถูกต้อง"); return false; }
    if (!['Male', 'Female'].includes(Patient_Gender)) { openModal("เพศต้องเป็น ชาย หรือ หญิง"); return false; }

    setIsLoading(true);
    try {
      const response = await axios.post(
        getApiUrl(process.env.REACT_APP_API_REGISTER_PATIENT),
        {
          Users_Email, Users_Username, Users_Password,
          Patient_FirstName, Patient_LastName,
          Patient_Phone, Patient_Gender,
          Patient_MedicalHistory
        },
        { withCredentials: true }
      );

      const result = response.data;
      if (result.status === true) {
        openModal("สมัครสมาชิกสำเร็จ!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        openModal(result.message || "สมัครสมาชิกไม่สำเร็จ");
      }

    } catch (error) {
      openModal("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ โปรดลองอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    await registerUser();
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerContainer}>
        <img src={Logo} className={styles.registerLogo} alt="โลโก้บริษัท" />
        <h1 className={styles.registerTitle}>สมัครสมาชิก</h1>

        <form className={styles.registerForm} onSubmit={handleSubmit} autoComplete="on">

          <div className={styles.inputFieldGroup}>
            <label htmlFor="email">อีเมล</label>
            <InputField
              id="email"
              type="text"
              placeholder="กรอกอีเมล"
              value={Users_Email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputFieldGroup}>
            <label htmlFor="username">ชื่อผู้ใช้งาน</label>
            <InputField
              id="username"
              type="text"
              placeholder="กรอกชื่อผู้ใช้งาน"
              value={Users_Username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className={styles.inputFieldGroup}>
            <label htmlFor="password">รหัสผ่าน</label>
            <InputField
              id="password"
              type="password"
              placeholder="กรอกรหัสผ่าน"
              value={Users_Password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.inputFieldGroup}>
            <label htmlFor="firstName">ชื่อจริง</label>
            <InputField
              id="firstName"
              type="text"
              placeholder="กรอกชื่อจริง"
              value={Patient_FirstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className={styles.inputFieldGroup}>
            <label htmlFor="lastName">นามสกุล</label>
            <InputField
              id="lastName"
              type="text"
              placeholder="กรอกนามสกุล"
              value={Patient_LastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className={styles.inputFieldGroup}>
            <label htmlFor="phone">เบอร์โทรศัพท์ (ไม่บังคับ)</label>
            <InputField
              id="phone"
              type="text"
              placeholder="กรอกเบอร์โทรศัพท์"
              value={Patient_Phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className={styles.inputFieldGroup}>
            <label htmlFor="gender">เพศ</label>
            <select
              id="gender"
              className={styles.genderSelect}
              value={Patient_Gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="Male">ชาย</option>
              <option value="Female">หญิง</option>
            </select>
          </div>

          <div className={styles.inputFieldGroup}>
            <label htmlFor="medicalHistory">ประวัติสุขภาพ (ไม่บังคับ)</label>
            <InputField
              id="medicalHistory"
              type="text"
              placeholder="กรอกประวัติสุขภาพ"
              value={Patient_MedicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button className={styles.registerButton} type="submit" disabled={isLoading}>
              {isLoading ? "กำลังโหลด..." : "สมัครสมาชิก"}
            </button>
            <button type="button" className={styles.backButton} onClick={() => navigate("/login")}>
              กลับไปหน้าเข้าสู่ระบบ
            </button>
          </div>
        </form>
      </div>

      <CustomModal isOpen={isModalOpen} message={modalMessage} onClose={closeModal} />
    </div>
  );
}

export default RegisterPage;