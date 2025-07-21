import React, { useState } from 'react';
import {
  MdAdminPanelSettings, MdPerson, MdLock, MdVisibility, MdVisibilityOff, MdLogin,
  MdMenu, MdVerifiedUser, MdPeople, MdSettings, MdInsertChart, MdNotifications,
  MdCloudDownload, MdSecurity, MdStorage, MdCheckCircle, MdWarning,
  MdPersonAdd, MdBackup, MdLogout
} from 'react-icons/md';
import './CSS/AdminLoginPage.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type InputFieldProps = {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  rightIcon?: React.ReactNode;
};


const InputField: React.FC<InputFieldProps> = ({
  icon, placeholder, value, onChange, type = 'text', rightIcon
}) => (
  <div className="input-container">
    {icon}
    <input
      className="input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      type={type}
    />
    {rightIcon}
  </div>
);

type LoginFormProps = {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  rememberMe: boolean;
  setRememberMe: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogin: () => void;
};

const LoginForm: React.FC<LoginFormProps> = ({
  username, setUsername, password, setPassword,
  showPassword, setShowPassword, rememberMe, setRememberMe, handleLogin
}) => (
  <div className="login-outer">
    <div className="login-container">
      <div className="login-header">
        <MdAdminPanelSettings size={60} color="#0A7764" />
        <h2>Iniciar Sesión</h2>
        <p>Accede al panel de administración</p>
      </div>

      <div className="form-container">
        <InputField
          icon={<MdPerson size={24} color="#0A7764" />}
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <InputField
          icon={<MdLock size={24} color="#0A7764" />}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? 'text' : 'password'}
          rightIcon={
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="icon-button"
              type="button"
            >
              {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
            </button>
          }
        />

        <div className="remember-me">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            Recordar sesión
          </label>
        </div>

        <button className="login-button" onClick={handleLogin}>
          <MdLogin /> Iniciar Sesión
        </button>

        <button className="forgot-password" type="button">¿Olvidaste tu contraseña?</button>
      </div>
    </div>
  </div>
);

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, logout, isLoggedIn } = useAuth();

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data.token, rememberMe); 
        alert('Inicio de sesión exitoso');
        navigate('/admin-dashboard');
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || 'Credenciales incorrectas'}`);
      }
    } catch (error) {
      alert('Error al conectar con el servidor');
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    setUsername('');
    setPassword('');
    setRememberMe(false);
    alert('Has cerrado sesión correctamente');
  };

  const adminOptions = [
    { icon: <MdPeople />, title: 'Gestionar Usuarios', description: 'Administrar cuentas de usuario', count: '245' },
    { icon: <MdSettings />, title: 'Configuración del Sistema', description: 'Ajustes generales de la aplicación', count: '12' },
    { icon: <MdInsertChart />, title: 'Reportes Estadísticos', description: 'Análisis y métricas del sistema', count: '1234' },
    { icon: <MdNotifications />, title: 'Alertas y Notificaciones', description: 'Gestión de notificaciones', count: '56' },
    { icon: <MdCloudDownload />, title: 'Respaldo de Datos', description: 'Backup y restauración', count: '3' },
    { icon: <MdSecurity />, title: 'Seguridad', description: 'Logs y monitoreo de seguridad', count: '8' },
  ];

  const systemStats = [
    { label: 'Usuarios Activos', value: '2,453', icon: <MdPeople />, color: '#0A7764' },
    { label: 'Datos Procesados', value: '156.8 GB', icon: <MdStorage />, color: '#D78909' },
    { label: 'Uptime Sistema', value: '99.97%', icon: <MdCheckCircle />, color: '#4CAF50' },
    { label: 'Alertas Activas', value: '12', icon: <MdWarning />, color: '#FF9800' },
  ];

  return (
    <div className="admin-page">
      <header className="header">
        <button className="menu-button">
          <MdMenu size={24} color="white" />
        </button>
        <h1>Panel de Administrador</h1>
        <div className="placeholder" />
      </header>

      {!isLoggedIn ? (
        <LoginForm
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
          handleLogin={handleLogin}
        />
      ) : (
        <div className="admin-panel">
          <div className="welcome">
            <div className="welcome-header">
              <MdVerifiedUser size={50} color="#0A7764" />
              <div>
                <h2>Bienvenido, Administrador</h2>
                <p>Panel de control del sistema</p>
              </div>
            </div>
            <div className="online-status">
              <span className="dot" /> Sistema Online
            </div>
          </div>

          <div className="stats">
            <h3>Estadísticas del Sistema</h3>
            <div className="stats-grid">
              {systemStats.map((stat, i) => (
                <div key={i} className="stat">
                  {stat.icon}
                  <p className="value">{stat.value}</p>
                  <p className="label">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-tools">
            <h3>Herramientas de Administración</h3>
            <div className="tools-grid">
              {adminOptions.map((option, i) => (
                <div key={i} className="tool">
                  <div className="icon-badge">
                    {option.icon}
                    <span className="badge">{option.count}</span>
                  </div>
                  <h4>{option.title}</h4>
                  <p>{option.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="activity">
            <h3>Actividad Reciente</h3>
            <div className="activity-item">
              <MdPersonAdd color="#4CAF50" />
              <div>
                <p>Nuevo usuario registrado</p>
                <span>Hace 2 minutos</span>
              </div>
            </div>
            <div className="activity-item">
              <MdBackup color="#0A7764" />
              <div>
                <p>Respaldo automático completado</p>
                <span>Hace 1 hora</span>
              </div>
            </div>
            <div className="activity-item">
              <MdWarning color="#FF9800" />
              <div>
                <p>Alerta de sensor desconectado</p>
                <span>Hace 3 horas</span>
              </div>
            </div>
          </div>

          <button className="logout" onClick={handleLogout}>
            <MdLogout /> Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminLoginPage;