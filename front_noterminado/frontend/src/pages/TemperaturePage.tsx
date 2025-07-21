import React, { useState } from 'react';
import { Calendar, Search, Thermometer, Droplets, Sun, TrendingUp, Download } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Popover } from '@mui/material';
import { es } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { getReadings } from '../services/readingService';
import type { Reading } from '../services/readingService';
import * as XLSX from 'xlsx';
import './CSS/TemperaturePage.css';

const TemperaturePage = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [currentPicker, setCurrentPicker] = useState<'start' | 'end'>('start');
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [readings, setReadings] = useState<Reading[]>([]);

  const handleOpenPicker = (event: React.MouseEvent<HTMLButtonElement>, pickerType: 'start' | 'end') => {
    setCurrentPicker(pickerType);
    setAnchorEl(event.currentTarget);
  };

  const handleClosePicker = () => setAnchorEl(null);
  const open = Boolean(anchorEl);
  const id = open ? 'date-picker-popover' : undefined;

  const formatDate = (date: Date) =>
    date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const handleSearch = async () => {
    if (startDate > endDate) {
      alert('Error: La fecha final debe ser posterior o igual a la fecha inicial.');
      return;
    }

    setIsLoading(true);
    setShowResults(false);

    try {
      const data = await getReadings(
        1,
        100,
        formatDateForAPI(startDate),
        formatDateForAPI(endDate)
      );
      setReadings(data.docs);
      setShowResults(true);
    } catch (error) {
      alert('Error al obtener datos de temperatura: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadExcel = () => {
    if (readings.length === 0) {
      alert('No hay datos para descargar. Por favor, realice una consulta primero.');
      return;
    }

    // Preparar los datos para Excel
    const data = readings.map(r => ({
      'Fecha y Hora': new Date(r.timestamp).toLocaleString('es-ES'),
      'Temperatura (°C)': r.temp_prom,
      'Humedad (%)': '--',
      'Luz (lx)': '--'
    }));

    // Crear hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos de Temperatura");
    
    // Generar archivo Excel
    XLSX.writeFile(wb, `datos_temperatura_${formatDateForAPI(startDate)}_${formatDateForAPI(endDate)}.xlsx`);
  };

  const generateTemperatureData = () => {
    return readings.map(r => ({
      time: new Date(r.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      temp: r.temp_prom,
      humidity: 0,
      light: 0
    }));
  };

  const tempData = generateTemperatureData();
  const renderChart = () => (
    <div className="weather-chart-container slide-up">
      <h3 className="weather-chart-title">Temperatura (°C)</h3>
      <div className="weather-chart-wrapper">
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={tempData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <Line type="monotone" dataKey="temp" stroke="#d28c0c" strokeWidth={2} />
            <XAxis dataKey="time" tick={{ fill: '#7f8c8d' }} />
            <YAxis tick={{ fill: '#7f8c8d' }} />
            <Tooltip
              contentStyle={{
                background: '#2c3e50',
                borderColor: '#d28c0c',
                borderRadius: '8px',
                color: '#ffffff'  
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderDataTable = () => (
    <div className="weather-table-container slide-up">
      <div className="weather-table-header">
        <h3 className="weather-table-title">Resumen de Datos Registrados</h3>
      </div>
      <div className="weather-table-columns">
        <div className="weather-table-column">Fecha y Hora</div>
        <div className="weather-table-column">Temp (°C)</div>
        
      </div>
      {readings.length === 0 ? (
        <div className="weather-table-empty">
          <TrendingUp className="weather-table-empty-icon" />
          <p className="weather-table-empty-text">
            Los datos detallados se cargarán aquí una vez procesada la consulta
          </p>
        </div>
      ) : (
        readings.map((r) => (
          <div key={r.id_lectura} className="weather-table-row">
            <div className="weather-table-cell">{new Date(r.timestamp).toLocaleString('es-ES')}</div>
            <div className="weather-table-cell">{r.temp_prom}</div>
            <div className="weather-table-cell">--</div>
            <div className="weather-table-cell">--</div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="weather-container">
      <div className="weather-content">
        <div className="weather-header-container">
          <h1 className="weather-page-title">Datos de Temperatura</h1>
          <button 
            className="download-button"
            onClick={downloadExcel}
            disabled={readings.length === 0}
          >
            <Download size={18} />
            Descargar Excel
          </button>
        </div>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <div className="weather-controls-wrapper">
            <div className="weather-controls-grid">
              <div className="weather-date-field">
                <label className="weather-date-label">Fecha inicial</label>
                <div
                  className="weather-date-input"
                  onClick={(e) => handleOpenPicker(e as any, 'start')}
                >
                  <Calendar className="weather-date-icon" size={20} />
                  <span className="weather-date-text">{formatDate(startDate)}</span>
                  <span className="weather-date-arrow">▼</span>
                </div>
              </div>

              <div className="weather-date-field">
                <label className="weather-date-label">Fecha final</label>
                <div
                  className="weather-date-input"
                  onClick={(e) => handleOpenPicker(e as any, 'end')}
                >
                  <Calendar className="weather-date-icon" size={20} />
                  <span className="weather-date-text">{formatDate(endDate)}</span>
                  <span className="weather-date-arrow">▼</span>
                </div>
              </div>
            </div>

            <button className="weather-search-button" onClick={handleSearch} disabled={isLoading}>
              <Search className="weather-search-icon" size={20} />
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
                boxShadow: '0px 8px 32px rgba(0,0,0,0.12)'
              }
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
          <div className="weather-loading-state">
            <div className="weather-loading-spinner"></div>
            <p className="weather-loading-text">Cargando datos de temperatura...</p>
          </div>
        ) : showResults ? (
          <div className="weather-results-container">
            {renderChart()}
            {renderDataTable()}
          </div>
        ) : (
          <div className="weather-empty-state">
            <Thermometer className="weather-empty-icon" />
            <p className="weather-empty-text">
              Selecciona un rango de fechas y presiona "Consultar Datos" para visualizar la información de temperatura.
            </p>
          </div>
        )}
      </div>  
    </div>
  );
};

export default TemperaturePage;