import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiPhone, FiFileText, } from 'react-icons/fi';
import EyeOpenIcon from '../../assets/icons/eye_open_icon.svg';
import EyeClosedIcon from '../../assets/icons/eye_close_icon.svg';
import styles from './RegisterPage.module.css';

const getLeftIcon = (id) => {
  switch(id) {
    case 'email': return <FiMail className={styles.inputIcon} />;
    case 'username': return <FiUser className={styles.inputIcon} />;
    case 'password': return <FiLock className={styles.inputIcon} />;
    case 'phone': return <FiPhone className={styles.inputIcon} />;
    case 'firstName':
    case 'lastName':
      return <FiFileText className={styles.inputIcon} />;
    default: return null;
  }
};

const InputField = ({ id, type, placeholder, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);
  const isPassword = type === 'password';
  const isTextarea = id === 'medicalHistory';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={styles.inputWrapper} style={isTextarea ? { padding: 0 } : {}}>
      {getLeftIcon(id)}
      {isTextarea ? (
        <textarea
          id={id}
          placeholder={placeholder}
          className={styles.textareaField}
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          type={inputType}
          id={id}
          placeholder={placeholder}
          className={styles.inputField}
          value={value}
          onChange={onChange}
        />
      )}
      {isPassword && (
        <button
          type="button"
          className={styles.passwordToggle}
          onClick={togglePassword}
          tabIndex={-1}
        >
          <img
            src={showPassword ? EyeOpenIcon : EyeClosedIcon}
            alt={showPassword ? "Hide password" : "Show password"}
            className={styles.eyeIcon}
          />
        </button>
      )}
    </div>
  );
};

export default InputField;
