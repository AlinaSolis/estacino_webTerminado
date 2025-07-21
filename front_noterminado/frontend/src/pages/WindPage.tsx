import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, Search, Wind, Navigation, Gauge, TrendingUp, Download } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Popover } from '@mui/material';
import { es } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import "./CSS/WindPage.css";

interface WindDataRecord {
  id_lectura: number;
  velocidad_viento: number;       
  dir_viento: number;             
  velocidad_viento_prom: number; 
  timestamp: string;             
}

const WindPage = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [currentPicker, setCurrentPicker] = useState<'start' | 'end'>('start');
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [windData, setWindData] = useState<WindDataRecord[]>([]);

  const handleOpenPicker = (event: React.MouseEvent<HTMLButtonElement>, pickerType: 'start' | 'end') => {
    setCurrentPicker(pickerType);
    setAnchorEl(event.currentTarget);
  };

  const handleClosePicker = () => setAnchorEl(null);
  const open = Boolean(anchorEl);
  const id = open ? 'date-picker-popover' : undefined;

  const formatDate = (date: Date) =>
    date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatQueryDate = (date: Date) => date.toISOString().slice(0, 10);

  // Función para descargar los datos en Excel
  const downloadExcel = () => {
    if (windData.length === 0) {
      alert('No hay datos para descargar. Por favor, realice una consulta primero.');
      return;
    }

    // Preparar los datos para Excel
    const data = windData.map(record => ({
      'Fecha y Hora': new Date(record.timestamp).toLocaleString('es-ES'),
      'Velocidad (km/h)': record.velocidad_viento.toFixed(1),
      'Dirección': degreeToDirection(record.dir_viento),
      'Ráfaga (km/h)': record.velocidad_viento_prom.toFixed(1),
      'Descripción': getWindDescription(record.velocidad_viento)
    }));

    // Crear hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos del Viento");
    
    // Generar archivo Excel
    XLSX.writeFile(wb, `datos_viento_${formatQueryDate(startDate)}_${formatQueryDate(endDate)}.xlsx`);
  };

  //convertir grados a direccion
  const degreeToDirection = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  const getWindDescription = (speed: number) => {
    if (speed < 6) return 'Calma';
    if (speed < 12) return 'Brisa ligera';
    if (speed < 20) return 'Brisa moderada';
    if (speed < 29) return 'Brisa fuerte';
    return 'Viento fuerte';
  };

  const handleSearch = async () => {
    if (startDate > endDate) {
      alert('Error: La fecha final debe ser posterior o igual a la fecha inicial.');
      return;
    }

    setIsLoading(true);
    setShowResults(false);

    try {
      const response = await axios.get('/api/readings', {
        params: {
          start: formatQueryDate(startDate),
          end: formatQueryDate(endDate),
        },
      });

      const data = response.data.docs; 

      data.sort((a: { timestamp: string | number | Date; }, b: { timestamp: string | number | Date; }) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      setWindData(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error cargando datos del viento:', error);
      alert('No se pudieron cargar los datos. Intente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentWind = windData.length > 0 ? windData[windData.length - 1] : null;

  const chartData = windData.map((record) => {
    return {
      time: new Date(record.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      speed: Number(record.velocidad_viento.toFixed(1)),
      direction: degreeToDirection(record.dir_viento),
      gust: Number(record.velocidad_viento_prom.toFixed(1)),
    };
  });

  const getDirectionRotation = (direction: string) => {
    const directions: { [key: string]: number } = {
      'N': 0, 'NE': 45, 'E': 90, 'SE': 135,
      'S': 180, 'SW': 225, 'W': 270, 'NW': 315
    };
    return directions[direction] || 0;
  };

  const renderCurrentData = () => {
    if (!currentWind) return null;

    const directionCardinal = degreeToDirection(currentWind.dir_viento);
    const gust = currentWind.velocidad_viento_prom;

    return (
      <div className="current-data-grid fade-in">
        <div className="current-data-card">
          <Wind className="current-data-icon" size={32} />
          <div className="current-data-label">Velocidad del Viento</div>
          <div className="current-data-value">{currentWind.velocidad_viento.toFixed(1)}</div>
          <div className="current-data-unit">km/h</div>
          <div className="current-data-description">
            {getWindDescription(currentWind.velocidad_viento)}
          </div>
        </div>

        <div className="current-data-card">
          <Navigation className="current-data-icon" size={32} />
          <div className="current-data-label">Dirección</div>
          <div className="wind-compass">
            <Navigation
              className="wind-arrow"
              size={24}
              style={{ transform: `rotate(${getDirectionRotation(directionCardinal)}deg)` }}
            />
            <div className="compass-directions">
              <span className="compass-direction north">N</span>
              <span className="compass-direction south">S</span>
              <span className="compass-direction east">E</span>
              <span className="compass-direction west">O</span>
            </div>
          </div>
          <div className="current-data-value">{directionCardinal}</div>
          <div className="current-data-description">Dirección actual</div>
        </div>

        <div className="current-data-card">
          <Gauge className="current-data-icon" size={32} />
          <div className="current-data-label">Ráfaga Máxima</div>
          <div className="current-data-value">{gust.toFixed(1)}</div>
          <div className="current-data-unit">km/h</div>
          <div className="current-data-description">
            {gust > 20 ? 'Ráfaga fuerte' : 'Ráfaga moderada'}
          </div>
        </div>
      </div>
    );
  };

  const renderDataTable = () => {
    if (windData.length === 0) {
      return (
        <div className="data-table-container slide-up">
          <div className="data-table-header">
            <h3 className="data-table-title">Resumen de Datos Registrados</h3>
          </div>
          <div className="data-table-columns">
            <div className="data-table-column">Fecha y Hora</div>
            <div className="data-table-column">Vel (km/h)</div>
            <div className="data-table-column">Dirección</div>
            <div className="data-table-column">Ráfaga</div>
          </div>
          <div className="data-table-empty">
            <TrendingUp className="data-table-empty-icon" />
            <p className="data-table-empty-text">
              Los datos detallados se cargarán aquí una vez procesada la consulta
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="data-table-container slide-up">
        <div className="data-table-header">
          <h3 className="data-table-title">Resumen de Datos Registrados</h3>
        </div>
        <div className="data-table-columns">
          <div className="data-table-column">Fecha y Hora</div>
          <div className="data-table-column">Vel (km/h)</div>
          <div className="data-table-column">Dirección</div>
          <div className="data-table-column">Ráfaga</div>
        </div>
        {windData.map((record) => {
          const direction = degreeToDirection(record.dir_viento);
          return (
            <div key={record.id_lectura} className="data-table-row">
              <div className="data-table-column">{new Date(record.timestamp).toLocaleString('es-ES')}</div>
              <div className="data-table-column">{record.velocidad_viento.toFixed(1)}</div>
              <div className="data-table-column">{direction}</div>
              <div className="data-table-column">{record.velocidad_viento_prom.toFixed(1)}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderChart = () => {
    if (windData.length === 0) return null;

    return (
      <div className="chart-container slide-up">
        <h3 className="chart-title">Velocidad del Viento (km/h)</h3>
        <div className="chart-wrapper" style={{ height: 100 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                stroke="#7f8c8d"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#7f8c8d"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #d28c0c',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="speed"
                stroke="#d28c0c"
                strokeWidth={3}
                dot={{
                  fill: '#d28c0c',
                  strokeWidth: 2,
                  stroke: '#fff',
                  r: 6,
                }}
                activeDot={{
                  r: 8,
                  stroke: '#d28c0c',
                  strokeWidth: 2,
                  fill: '#fff',
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <div className="content">
        <div className="header-container">
          <h1 className="page-title">Datos del Viento</h1>
          <button 
            className="download-button"
            onClick={downloadExcel}
            disabled={windData.length === 0}
          >
            <Download size={18} />
            Descargar Excel
          </button>
        </div>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <div className="date-controls-wrapper">
            <div className="date-controls-grid">
              <div className="date-field">
                <label className="date-field-label">Fecha inicial</label>
                <div
                  className="date-input-wrapper"
                  onClick={(e) => handleOpenPicker(e as any, 'start')}
                >
                  <Calendar className="date-input-icon" size={20} />
                  <span className="date-input-text">{formatDate(startDate)}</span>
                  <span className="date-input-arrow">▼</span>
                </div>
              </div>

              <div className="date-field">
                <label className="date-field-label">Fecha final</label>
                <div
                  className="date-input-wrapper"
                  onClick={(e) => handleOpenPicker(e as any, 'end')}
                >
                  <Calendar className="date-input-icon" size={20} />
                  <span className="date-input-text">{formatDate(endDate)}</span>
                  <span className="date-input-arrow">▼</span>
                </div>
              </div>
            </div>

            <button className="search-button" onClick={handleSearch} disabled={isLoading}>
              <Search className="search-icon" size={20} />
              {isLoading ? 'Consultando...' : 'Consultar Datos'}
            </button>
          </div>

          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClosePicker}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{
              style: {
                marginTop: 8,
                borderRadius: 12,
                boxShadow: '0px 8px 32px rgba(0,0,0,0.12)',
              },
            }}
          >
            <DatePicker
              value={currentPicker === 'start' ? startDate : endDate}
              onChange={(newValue) => {
                if (newValue) {
                  if (currentPicker === 'start') {
                    setStartDate(newValue);
                    if (endDate < newValue) setEndDate(newValue);
                  } else {
                    setEndDate(newValue);
                  }
                }
                handleClosePicker();
              }}
              maxDate={new Date()}
              minDate={currentPicker === 'end' ? startDate : undefined}
              disableFuture
            />
          </Popover>
        </LocalizationProvider>

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando datos del viento...</p>
          </div>
        ) : showResults ? (
          <div className="results-container">
            {/* {renderCurrentData()} */}
            {renderChart()}
            {renderDataTable()}
          </div>
        ) : (
          <div className="empty-state">
            <Wind className="empty-state-icon" />
            <p className="empty-state-text">
              Selecciona un rango de fechas y presiona "Consultar Datos" para visualizar la información del viento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WindPage;