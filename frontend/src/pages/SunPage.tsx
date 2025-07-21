import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import "./CSS/SunPage.css";
import Swal from 'sweetalert2';

interface Reading {
  id_lectura: number;
  fecha: string;
  hora: string;
  voltaje: number;
  corriente: number;
  potencia: number;
  temperatura: number;
  humedad: number;
  presion: number;
  velocidad_viento: number;
  direccion_viento: number;
  precipitacion: number;
  radiacion_solar: number;
}

const SunPage = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [solarData, setSolarData] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const fallbackSolarData: Reading[] = [
    {
      id_lectura: 1,
      fecha: '2024-01-01',
      hora: '08:00:00',
      voltaje: 12.5,
      corriente: 2.3,
      potencia: 28.75,
      temperatura: 25.2,
      humedad: 65.0,
      presion: 1013.25,
      velocidad_viento: 5.2,
      direccion_viento: 180,
      precipitacion: 0.0,
      radiacion_solar: 850.5
    }
  ];

  const handleSearch = async () => {
    if (startDate > endDate) {
      await Swal.fire({
        title: 'Error en las fechas',
        text: 'La fecha final debe ser posterior o igual a la fecha inicial',
        icon: 'warning',
        confirmButtonColor: '#d28c0c'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/solar-data?start=${startDate}&end=${endDate}`);
      const data = await response.json();
      setSolarData(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error cargando datos solares:', error);
      await Swal.fire({
        title: 'Error al cargar datos',
        text: 'No se pudieron cargar los datos solares. Intente más tarde.',
        icon: 'error',
        confirmButtonColor: '#d28c0c'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatQueryDate = (dateString: string) => {
    return dateString.replace(/-/g, '_');
  };

  const downloadExcel = () => {
    const dataToDownload = solarData.length > 0 ? solarData : fallbackSolarData;
    
    if (dataToDownload.length === 0) {
      Swal.fire({
        title: 'Sin datos',
        text: 'No hay datos para descargar. Por favor, realice una consulta primero.',
        icon: 'info',
        confirmButtonColor: '#d28c0c'
      });
      return;
    }

    // Preparar los datos para Excel
    const excelData = dataToDownload.map(reading => ({
      'ID Lectura': reading.id_lectura,
      'Fecha': reading.fecha,
      'Hora': reading.hora,
      'Voltaje (V)': reading.voltaje,
      'Corriente (A)': reading.corriente,
      'Potencia (W)': reading.potencia,
      'Temperatura (°C)': reading.temperatura,
      'Humedad (%)': reading.humedad,
      'Presión (hPa)': reading.presion,
      'Velocidad Viento (m/s)': reading.velocidad_viento,
      'Dirección Viento (°)': reading.direccion_viento,
      'Precipitación (mm)': reading.precipitacion,
      'Radiación Solar (W/m²)': reading.radiacion_solar
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos Solares');
    
    // Generar archivo Excel
    XLSX.writeFile(wb, `datos_solares_${formatQueryDate(startDate)}_${formatQueryDate(endDate)}.xlsx`);
    
    Swal.fire({
      title: '¡Descarga exitosa!',
      text: 'El archivo Excel se ha descargado correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };

  return (
    <div className="sun-page">
      <h1>Datos Solares</h1>
      
      <div className="search-controls">
        <div className="date-inputs">
          <label>
            Fecha inicial:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            Fecha final:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>
        
        <div className="action-buttons">
          <button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Buscar'}
          </button>
          <button onClick={downloadExcel} className="download-btn">
            Descargar Excel
          </button>
        </div>
      </div>

      {showResults && (
        <div className="results-section">
          <h2>Resultados de la consulta</h2>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={solarData.length > 0 ? solarData : fallbackSolarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="radiacion_solar" stroke="#ff7300" name="Radiación Solar (W/m²)" />
                <Line type="monotone" dataKey="potencia" stroke="#8884d8" name="Potencia (W)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Voltaje (V)</th>
                  <th>Corriente (A)</th>
                  <th>Potencia (W)</th>
                  <th>Temperatura (°C)</th>
                  <th>Radiación Solar (W/m²)</th>
                </tr>
              </thead>
              <tbody>
                {(solarData.length > 0 ? solarData : fallbackSolarData).map((reading) => (
                  <tr key={reading.id_lectura}>
                    <td>{reading.fecha}</td>
                    <td>{reading.hora}</td>
                    <td>{reading.voltaje}</td>
                    <td>{reading.corriente}</td>
                    <td>{reading.potencia}</td>
                    <td>{reading.temperatura}</td>
                    <td>{reading.radiacion_solar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SunPage;