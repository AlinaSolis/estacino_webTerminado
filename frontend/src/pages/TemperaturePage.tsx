import type { Reading } from '../services/readingService';
import * as XLSX from 'xlsx';
import './CSS/TemperaturePage.css';
import Swal from 'sweetalert2';

const TemperaturePage = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleSearch = async () => {
    if (startDate > endDate) {
      await Swal.fire({
        title: 'Error en las fechas',
        text: 'La fecha final debe ser posterior o igual a la fecha inicial',
        icon: 'warning',
        confirmButtonColor: '#D78909'
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await readingService.getReadings(formatDateForAPI(startDate), formatDateForAPI(endDate));
      setReadings(data.docs);
      setShowResults(true);
    } catch (error) {
      await Swal.fire({
        title: 'Error al cargar datos',
        text: 'Error al obtener datos de temperatura: ' + (error as Error).message,
        icon: 'error',
        confirmButtonColor: '#D78909'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadExcel = () => {
    if (readings.length === 0) {
      Swal.fire({
        title: 'Sin datos',
        text: 'No hay datos para descargar. Por favor, realice una consulta primero.',
        icon: 'info',
        confirmButtonColor: '#D78909'
      });
      return;
    }

    // Preparar los datos para Excel
    
    // Generar archivo Excel
    XLSX.writeFile(wb, `datos_temperatura_${formatDateForAPI(startDate)}_${formatDateForAPI(endDate)}.xlsx`);
    
    Swal.fire({
      title: '¡Descarga exitosa!',
      text: 'El archivo Excel se ha descargado correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };
};