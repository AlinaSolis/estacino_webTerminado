@@ .. @@
 import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
 import * as XLSX from 'xlsx';
 import "./CSS/WindPage.css";
+import Swal from 'sweetalert2';

 interface WindDataRecord {
   id_lectura: number;
@@ .. @@
   const downloadExcel = () => {
     if (windData.length === 0) {
-      alert('No hay datos para descargar. Por favor, realice una consulta primero.');
+      Swal.fire({
+        title: 'Sin datos',
+        text: 'No hay datos para descargar. Por favor, realice una consulta primero.',
+        icon: 'info',
+        confirmButtonColor: '#27ae60'
+      });
       return;
     }

     // Preparar los datos para Excel
@@ .. @@
     
     // Generar archivo Excel
     XLSX.writeFile(wb, `datos_viento_${formatQueryDate(startDate)}_${formatQueryDate(endDate)}.xlsx`);
+    
+    Swal.fire({
+      title: '¡Descarga exitosa!',
+      text: 'El archivo Excel se ha descargado correctamente',
+      icon: 'success',
+      timer: 2000,
+      showConfirmButton: false
+    });
   };
@@ .. @@
   const handleSearch = async () => {
     if (startDate > endDate) {
-      alert('Error: La fecha final debe ser posterior o igual a la fecha inicial.');
+      await Swal.fire({
+        title: 'Error en las fechas',
+        text: 'La fecha final debe ser posterior o igual a la fecha inicial',
+        icon: 'warning',
+        confirmButtonColor: '#27ae60'
+      });
       return;
     }

     setIsLoading(true);
@@ .. @@
       setShowResults(true);
     } catch (error) {
       console.error('Error cargando datos del viento:', error);
-      alert('No se pudieron cargar los datos. Intente más tarde.');
+      await Swal.fire({
+        title: 'Error al cargar datos',
+        text: 'No se pudieron cargar los datos del viento. Intente más tarde.',
+        icon: 'error',
+        confirmButtonColor: '#27ae60'
+      });
     } finally {
       setIsLoading(false);
     }
   };