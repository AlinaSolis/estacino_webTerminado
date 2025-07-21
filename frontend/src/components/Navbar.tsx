@@ .. @@
 import { Link, useLocation } from 'react-router-dom';
 import { useState, useRef, useEffect } from 'react';
 import AppRoutes from '../routes/AppRoutes';
 import { useAuth } from '../context/AuthContext';
+import Swal from 'sweetalert2';
 import './css/Navbar.css';
 
 import logoUTD from '../assets/Logoutd.webp';
@@ .. @@
   const location = useLocation();
   const drawerRef = useRef(null);
 
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
+      await Swal.fire({
+        title: 'Sesión cerrada',
+        text: 'Has cerrado sesión correctamente',
+        icon: 'success',
+        timer: 2000,
+        showConfirmButton: false
+      });
+    }
+  };
+
   useDrawerAutoClose(drawerOpen, () => setDrawerOpen(false), drawerRef);
 
   const handleDrawerToggle = () => {
@@ .. @@
               <Divider sx={{ margin: '8px 24px' }} />
               <ListItem
                 button
-                onClick={logout}
+                onClick={handleLogout}
                 sx={{
                   padding: drawerOpen ? '12px 24px' : '12px 8px',
                   margin: '4px 12px',