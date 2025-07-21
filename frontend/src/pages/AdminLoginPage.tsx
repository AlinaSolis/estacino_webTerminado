@@ .. @@
 } from 'react-icons/md';
 import './CSS/AdminLoginPage.css';
 import { useAuth } from '../context/AuthContext';
 import { useNavigate } from 'react-router-dom';
+import Swal from 'sweetalert2';

 type InputFieldProps = {
   icon: React.ReactNode;
@@ .. @@
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
-        alert('Inicio de sesión exitoso');
+        await Swal.fire({
+          title: '¡Bienvenido!',
+          text: 'Inicio de sesión exitoso',
+          icon: 'success',
+          timer: 2000,
+          showConfirmButton: false
+        });
         navigate('/admin-dashboard');
       } else {
         const errorData = await res.json();
-        alert(`Error: ${errorData.message || 'Credenciales incorrectas'}`);
+        await Swal.fire({
+          title: 'Error de autenticación',
+          text: errorData.message || 'Credenciales incorrectas',
+          icon: 'error',
+          confirmButtonColor: '#0A7764'
+        });
       }
     } catch (error) {
-      alert('Error al conectar con el servidor');
+      await Swal.fire({
+        title: 'Error de conexión',
+        text: 'No se pudo conectar con el servidor',
+        icon: 'error',
+        confirmButtonColor: '#0A7764'
+      });
       console.error(error);
     }
   };

-  const handleLogout = () => {
-    logout();
-    setUsername('');
-    setPassword('');
-    setRememberMe(false);
-    alert('Has cerrado sesión correctamente');
+  const handleLogout = async () => {
+    const result = await Swal.fire({
+      title: '¿Cerrar sesión?',
+      text: '¿Estás seguro de que deseas cerrar sesión?',
+      icon: 'question',
+      showCancelButton: true,
+      confirmButtonColor: '#B00020',
+      cancelButtonColor: '#6c757d',
+      confirmButtonText: 'Sí, cerrar sesión',
+      cancelButtonText: 'Cancelar',
+      reverseButtons: true
+    });
+
+    if (result.isConfirmed) {
+      logout();
+      setUsername('');
+      setPassword('');
+      setRememberMe(false);
+      await Swal.fire({
+        title: 'Sesión cerrada',
+        text: 'Has cerrado sesión correctamente',
+        icon: 'success',
+        timer: 2000,
+        showConfirmButton: false
+      });
+    }
   };