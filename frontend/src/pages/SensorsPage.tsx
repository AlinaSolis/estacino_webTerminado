@@ .. @@
 import React, { useEffect, useState } from 'react';
 import { useAuth } from '../context/AuthContext'; 
 import './CSS/SensorsPage.css';
+import Swal from 'sweetalert2';
 import {
   MdMenu,
   MdDeviceThermostat,
@@ .. @@
   const fetchSensors = async () => {
     if (!token) {
-      setError('No autorizado: Falta token de autenticación');
+      await Swal.fire({
+        title: 'Error de autenticación',
+        text: 'No autorizado: Falta token de autenticación',
+        icon: 'error',
+        confirmButtonColor: '#0A7764'
+      });
+      setError('No autorizado: Falta token de autenticación');
       return;
     }
     try {
       const res = await axios.get('http://localhost:4000/api/sensores', {
         headers: { Authorization: `Bearer ${token}` },
       });
       setSensors(res.data);
       setError(null);
     } catch (err: any) {
       console.error('Error al obtener sensores', err);
+      await Swal.fire({
+        title: 'Error al cargar sensores',
+        text: 'No se pudieron cargar los sensores',
+        icon: 'error',
+        confirmButtonColor: '#0A7764'
+      });
       setError('Error al obtener sensores');
     }
   };

   const toggleSensor = async (id: number) => {
     if (!token) {
-      setError('No autorizado: Falta token de autenticación');
+      await Swal.fire({
+        title: 'Error de autenticación',
+        text: 'No autorizado: Falta token de autenticación',
+        icon: 'error',
+        confirmButtonColor: '#0A7764'
+      });
+      setError('No autorizado: Falta token de autenticación');
       return;
     }
     try {
       await axios.put(`http://localhost:4000/api/sensores/${id}/toggle`, null, {
         headers: { Authorization: `Bearer ${token}` },
       });
       fetchSensors();
+      await Swal.fire({
+        title: 'Estado actualizado',
+        text: 'El estado del sensor se ha actualizado correctamente',
+        icon: 'success',
+        timer: 1500,
+        showConfirmButton: false
+      });
     } catch (err) {
       console.error('Error al cambiar estado del sensor', err);
+      await Swal.fire({
+        title: 'Error al actualizar',
+        text: 'No se pudo cambiar el estado del sensor',
+        icon: 'error',
+        confirmButtonColor: '#0A7764'
+      });
       setError('Error al cambiar estado del sensor');
     }
   };