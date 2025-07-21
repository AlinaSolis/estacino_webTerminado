@@ .. @@
 import React, { useEffect, useState } from 'react';
 import { useAuth } from '../context/AuthContext';
 import './CSS/AdminDashboard.css';
+import Swal from 'sweetalert2';

 interface User {
   id: number;
@@ .. @@
   const handleCreateUser = async () => {
-    if (!newUsername || !newPassword) return alert('Completa todos los campos');
-    if (!token) return alert('No hay token de autenticación');
+    if (!newUsername || !newPassword) {
+      await Swal.fire({
+        title: 'Campos incompletos',
+        text: 'Por favor completa todos los campos',
+        icon: 'warning',
+        confirmButtonColor: '#0A7764'
+      });
+      return;
+    }
+    
+    if (!token) {
+      await Swal.fire({
+        title: 'Error de autenticación',
+        text: 'No hay token de autenticación',
+        icon: 'error',
+        confirmButtonColor: '#0A7764'
+      });
+      return;
+    }

     try {
       const res = await fetch('http://localhost:4000/api/users', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({ username: newUsername, password: newPassword }),
       });
       if (!res.ok) {
         const err = await res.json();
-        return alert(err.message || 'Error al crear usuario');
+        await Swal.fire({
+          title: 'Error al crear usuario',
+          text: err.message || 'Error al crear usuario',
+          icon: 'error',
+          confirmButtonColor: '#0A7764'
+        });
+        return;
       }
       setNewUsername('');
       setNewPassword('');
       fetchUsers();
-      alert('Usuario creado');
+      await Swal.fire({
+        title: '¡Usuario creado!',
+        text: 'El usuario se ha creado exitosamente',
+        icon: 'success',
+        timer: 2000,
+        showConfirmButton: false
+      });
     } catch {
-      alert('Error en la conexión');
+      await Swal.fire({
+        title: 'Error de conexión',
+        text: 'No se pudo conectar con el servidor',
+        icon: 'error',
+        confirmButtonColor: '#0A7764'
+      });
     }
   };
@@ .. @@
   const saveEdit = async () => {
-    if (!editUsername) return alert('Nombre requerido');
-    if (!token) return alert('No hay token de autenticación');
+    if (!editUsername) {
+      await Swal.fire({
+        title: 'Campo requerido',
+        text: 'El nombre de usuario es requerido',
+        icon: 'warning',
+        confirmButtonColor: '#0A7764'
+      });
+      return;
+    }
+    
+    if (!token) {
+      await Swal.fire({
+        title: 'Error de autenticación',
+        text: 'No hay token de autenticación',
+        icon: 'error',
+        confirmButtonColor: '#0A7764'
+      });
+      return;
+    }

     try {
       const res = await fetch(`http://localhost:4000/api/users/${editId}`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({
           username: editUsername,
           password: editPassword || undefined,
         }),
       });
       if (!res.ok) {
         const err = await res.json();
-        return alert(err.message || 'Error al actualizar');
+        await Swal.fire({
+          title: 'Error al actualizar',
+          text: err.message || 'Error al actualizar usuario',
+          icon: 'error',
+          confirmButtonColor: '#0A7764'
+        });
+        return;
       }
       cancelEdit();
       fetchUsers();
-      alert('Usuario actualizado');
+      await Swal.fire({
+        title: '¡Usuario actualizado!',
+        text: 'El usuario se ha actualizado exitosamente',
+        icon: 'success',
+        timer: 2000,
+        showConfirmButton: false
+      });
     } catch {
-      alert('Error en la conexión');
+      await Swal.fire({
+        title: 'Error de conexión',
+        text: 'No se pudo conectar con el servidor',
+        icon: 'error',
+        confirmButtonColor: '#0A7764'
+      });
     }
   };

   const deleteUser = async (id: number) => {
-    if (!window.confirm('¿Seguro que quieres eliminar este usuario?')) return;
-    if (!token) return alert('No hay token de autenticación');
+    const result = await Swal.fire({
+      title: '¿Eliminar usuario?',
+      text: '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
+      icon: 'warning',
+      showCancelButton: true,
+      confirmButtonColor: '#F44336',
+      cancelButtonColor: '#6c757d',
+      confirmButtonText: 'Sí, eliminar',
+      cancelButtonText: 'Cancelar',
+      reverseButtons: true
+    });
+
+    if (!result.isConfirmed) return;
+    
+    if (!token) {
+      await Swal.fire({
+        title: 'Error de autenticación',
+        text: 'No hay token de autenticación',
+        icon: 'error',
+        confirmButtonColor: '#0A7764'
+      });
+      return;
+    }

     try {
       const res = await fetch(`http://localhost:4000/api/users/${id}`, {
         method: 'DELETE',
         headers: { Authorization: `Bearer ${token}` },
       });
       if (!res.ok) {
         const err = await res.json();
-        return alert(err.message || 'Error al eliminar');
+        await Swal.fire({
+          title: 'Error al eliminar',
+          text: err.message || 'Error al eliminar usuario',
+          icon: 'error',
+          confirmButtonColor: '#0A7764'
+        });
+        return;
       }
       fetchUsers();
-      alert('Usuario eliminado');
+      await Swal.fire({
+        title: '¡Usuario eliminado!',
+        text: 'El usuario se ha eliminado exitosamente',
+        icon: 'success',
+        timer: 2000,
+        showConfirmButton: false
+      });
     } catch {
-      alert('Error en la conexión');
+      await Swal.fire({
+        title: 'Error de conexión',
+        text: 'No se pudo conectar con el servidor',
+        icon: 'error',
+        confirmButtonColor: '#0A7764'
+      });
     }
   };