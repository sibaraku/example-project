import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

const LOCATION_OPTIONS = [
  { label: 'Eesti', value: 'EE' },
  { label: 'Läti', value: 'LV' },
  { label: 'Soome', value: 'FI' },
];

const COLORS = ['#2563eb', '#16a34a', '#be185d'];

const formatDateInput = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (value) => String(value).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const getDateKey = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const average = (values) => {
  const valid = Array.isArray(values) ? values.filter((v) => Number.isFinite(v)) : [];
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
};

const buildLinePath = (points, width, height, margin) => {
  if (!points.length) return '';
  const contentWidth = width - margin * 2;
  const contentHeight = height - margin * 2;
  const yValues = points.map((p) => p.value).filter(Number.isFinite);
  if (!yValues.length) return '';
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const rangeY = maxY - minY || 1;
  const stepX = contentWidth / Math.max(points.length - 1, 1);

  let path = '';
  points.forEach((point, index) => {
    if (!Number.isFinite(point.value)) return;
    const x = margin + index * stepX;
    const y = margin + contentHeight - ((point.value - minY) / rangeY) * contentHeight;
    path += path ? ` L ${x} ${y}` : `M ${x} ${y}`;
  });
  return path;
};

const getSvgPoints = (points, width, height, margin) => {
  if (!points.length) return [];
  const contentWidth = width - margin * 2;
  const contentHeight = height - margin * 2;
  const yValues = points.map((p) => p.value).filter(Number.isFinite);
  if (!yValues.length) return [];
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const rangeY = maxY - minY || 1;
  const stepX = contentWidth / Math.max(points.length - 1, 1);

  return points.map((point, index) => {
    if (!Number.isFinite(point.value)) return null;
    const x = margin + index * stepX;
    const y = margin + contentHeight - ((point.value - minY) / rangeY) * contentHeight;
    return { x, y, value: point.value, date: point.label };
  }).filter(Boolean);
};

const LineChart = ({ series, labels, title, width = 680, height = 260 }) => {
  const margin = 40;
  const validSeries = series.filter((dataset) => dataset.values.some(Number.isFinite));
  const chartSeries = validSeries.length ? validSeries : [];
  const yValues = chartSeries.flatMap((dataset) => dataset.values.filter(Number.isFinite));
  const maxY = yValues.length ? Math.max(...yValues) : 0;
  const minY = yValues.length ? Math.min(...yValues) : 0;
  const yRange = maxY - minY || 1;

  return (
    <div className="chart-card">
      <div className="chart-header">{title}</div>
      {chartSeries.length ? (
        <svg viewBox={`0 0 ${width} ${height}`} className="line-chart-svg">
          <g className="grid-lines">
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1={margin}
                x2={width - margin}
                y1={margin + (height - margin * 2) * (i / 4)}
                y2={margin + (height - margin * 2) * (i / 4)}
                className="chart-grid-line"
              />
            ))}
          </g>

          <line
            x1={margin}
            y1={margin}
            x2={margin}
            y2={height - margin}
            className="chart-axis"
          />
          <line
            x1={margin}
            y1={height - margin}
            x2={width - margin}
            y2={height - margin}
            className="chart-axis"
          />

          {chartSeries.map((dataset) => {
            const points = labels.map((label, index) => ({
              label,
              value: dataset.values[index],
            }));
            const path = buildLinePath(points, width, height, margin);
            return (
              <g key={dataset.name}>
                <path d={path} fill="none" stroke={dataset.color} strokeWidth="2.4" />
                {getSvgPoints(points, width, height, margin).map((point, idx) => (
                  <circle key={idx} cx={point.x} cy={point.y} r="3.5" fill={dataset.color} />
                ))}
              </g>
            );
          })}

          {labels.map((label, index) => {
            const x = margin + (width - margin * 2) * (index / Math.max(labels.length - 1, 1));
            return (
              <text key={label} x={x} y={height - margin + 18} textAnchor="middle" className="chart-label">
                {label}
              </text>
            );
          })}

          {[0, 1, 2, 3, 4].map((i) => {
            const value = minY + ((4 - i) / 4) * yRange;
            return (
              <text key={i} x={margin - 10} y={margin + (height - margin * 2) * (i / 4) + 4} textAnchor="end" className="chart-label">
                {value.toFixed(0)}
              </text>
            );
          })}
        </svg>
      ) : (
        <div className="chart-empty">Puuduvad sobivad andmepunktid visualiseerimiseks.</div>
      )}
      <div className="chart-legend">
        {chartSeries.map((dataset) => (
          <div key={dataset.name} className="legend-item">
            <span className="legend-swatch" style={{ backgroundColor: dataset.color }} />
            <span>{dataset.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ bars, title }) => {
  const maxValue = Math.max(...bars.map((bar) => (Number.isFinite(bar.value) ? bar.value : 0)), 0) || 1;

  return (
    <div className="chart-card">
      <div className="chart-header">{title}</div>
      <div className="bar-chart-grid">
        {bars.map((bar) => {
          const heightPercent = Number.isFinite(bar.value) ? Math.round((bar.value / maxValue) * 100) : 0;
          return (
            <div key={bar.label} className="bar-column">
              <div className="bar-value">{Number.isFinite(bar.value) ? bar.value.toFixed(1) : '—'}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ height: `${heightPercent}%`, backgroundColor: bar.color }} />
              </div>
              <div className="bar-label">{bar.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [start, setStart] = useState(formatDateInput(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
  const [end, setEnd] = useState(formatDateInput(new Date()));
  const [availableLocations, setAvailableLocations] = useState(LOCATION_OPTIONS.map((option) => option.value));
  const [locations, setLocations] = useState(LOCATION_OPTIONS.map((option) => option.value));
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rangeLoaded, setRangeLoaded] = useState(false);
  const [error, setError] = useState('');

  const selectedLocationLabels = useMemo(
    () => LOCATION_OPTIONS.filter((item) => locations.includes(item.value)).map((item) => item.label),
    [locations]
  );

  const activeLocationOptions = useMemo(
    () => LOCATION_OPTIONS.filter((option) => availableLocations.includes(option.value)),
    [availableLocations]
  );

  const dates = useMemo(() => {
    const output = [];
    const current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      output.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
    return output;
  }, [start, end]);

  const groupedByLocation = useMemo(() => {
    const buckets = {};
    readings.forEach((item) => {
      const location = item.location || 'UNKNOWN';
      const value = Number(item.price_eur_mwh);
      if (!Number.isFinite(value)) return;
      if (!buckets[location]) buckets[location] = [];
      buckets[location].push({ timestamp: item.timestamp, value });
    });
    return buckets;
  }, [readings]);

  const dailyAverage = useMemo(() => {
    const buckets = {};
    readings.forEach((item) => {
      const dateKey = getDateKey(item.timestamp);
      if (!dateKey) return;
      const value = Number(item.price_eur_mwh);
      if (!Number.isFinite(value)) return;
      buckets[dateKey] = buckets[dateKey] || [];
      buckets[dateKey].push(value);
    });
    return dates.map((date) => ({
      date,
      value: average(buckets[date]),
    }));
  }, [readings, dates]);

  const averageByLocation = useMemo(() => {
    return activeLocationOptions.map((option, index) => {
      const values = (groupedByLocation[option.value] || []).map((item) => item.value);
      return {
        label: option.label,
        value: average(values),
        color: COLORS[index % COLORS.length],
      };
    });
  }, [groupedByLocation, activeLocationOptions]);

  const compareSeries = useMemo(() => {
    return activeLocationOptions.filter((option) => locations.includes(option.value)).map((option, index) => {
      const byDate = {};
      (groupedByLocation[option.value] || []).forEach((item) => {
        const key = getDateKey(item.timestamp);
        if (!key) return;
        byDate[key] = byDate[key] || [];
        byDate[key].push(item.value);
      });
      const values = dates.map((date) => average(byDate[date] || []));
      return {
        name: option.label,
        values,
        color: COLORS[index % COLORS.length],
      };
    });
  }, [groupedByLocation, dates, locations, activeLocationOptions]);

  const timeKeys = useMemo(() => {
    const keys = readings
      .map((item) => {
        const date = new Date(item.timestamp);
        if (Number.isNaN(date.getTime())) return null;
        return date.toISOString().slice(0, 16);
      })
      .filter(Boolean);
    return [...new Set(keys)].sort();
  }, [readings]);

  const priceOverTimeSeries = useMemo(() => {
    return activeLocationOptions
      .filter((option) => locations.includes(option.value))
      .map((option, index) => {
        const mapping = {};
        (groupedByLocation[option.value] || []).forEach((item) => {
          const key = new Date(item.timestamp);
          if (Number.isNaN(key.getTime())) return;
          mapping[key.toISOString().slice(0, 16)] = item.value;
        });
        return {
          name: option.label,
          values: timeKeys.map((key) => Number.isFinite(mapping[key]) ? mapping[key] : null),
          color: COLORS[index % COLORS.length],
        };
      });
  }, [groupedByLocation, locations, activeLocationOptions, timeKeys]);

  const timeLabels = useMemo(() => timeKeys.map((key) => key.replace('T', ' ')), [timeKeys]);

  const loadData = async () => {
    if (!start || !end) {
      setError('Palun vali algus- ja lõppkuupäev.');
      return;
    }
    if (new Date(start) > new Date(end)) {
      setError('Alguskuupäev peab olema enne lõppkuupäeva.');
      return;
    }
    if (!locations.length) {
      setError('Palun vali vähemalt üks piirkond.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('start', new Date(start).toISOString());
      params.append('end', new Date(end).toISOString());
      locations.forEach((location) => params.append('location', location));

      const response = await axios.get('http://localhost:3001/api/readings', { params });
      setReadings(response.data);
    } catch (err) {
      setError('Andmete laadimine ebaõnnestus. Palun proovi uuesti.');
      setReadings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadRange = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/readings/summary');
        const { start: summaryStart, end: summaryEnd, locations: summaryLocations } = response.data;
        if (Array.isArray(summaryLocations) && summaryLocations.length) {
          setAvailableLocations(summaryLocations);
          setLocations(summaryLocations);
        }
        if (summaryStart && summaryEnd) {
          setStart(formatDateInput(summaryStart));
          setEnd(formatDateInput(summaryEnd));
        }
      } catch (_) {
        // Keep the existing default range if summary is unavailable.
      } finally {
        setRangeLoaded(true);
      }
    };
    loadRange();
  }, []);

  useEffect(() => {
    if (!rangeLoaded) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeLoaded]);

  const noData = rangeLoaded && !loading && readings.length === 0;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Interaktiivne andmedashboard</h2>
          <p>Vaata andmebaasis salvestatud elektrihindu valitud kuupäevavahemikus ja piirkondade lõikes.</p>
        </div>
        <button className="refresh-button" onClick={loadData} disabled={loading}>
          {loading ? 'Laadimine...' : 'Uuenda dashboard'}
        </button>
      </div>

      <div className="dashboard-filters">
        <div className="filter-field">
          <label>Algus</label>
          <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="filter-field">
          <label>Lõpp</label>
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div className="filter-field locations">
          <label>Piirkond</label>
          <div className="location-options">
            {activeLocationOptions.map((option) => (
              <label key={option.value} className="location-option">
                <input
                  type="checkbox"
                  checked={locations.includes(option.value)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...locations, option.value]
                      : locations.filter((value) => value !== option.value);
                    setLocations(next);
                  }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}
      {noData && <div className="dashboard-empty">Valitud kuupäevavahemikus andmeid ei leitud.</div>}

      <div className="chart-grid">
        <LineChart
          title="Price over time"
          series={priceOverTimeSeries}
          labels={timeLabels}
        />
        <BarChart
          title="Daily average price in selected date range"
          bars={dailyAverage.map((item) => ({
            label: item.date,
            value: item.value,
            color: '#2563eb',
          }))}
        />
        <BarChart title="Average price per selected location" bars={averageByLocation} />
        <LineChart title="Compare prices per location on selected period" series={compareSeries} labels={dates} />
      </div>

      <div className="dashboard-summary">
        <div>Valitud piirkonnad: {selectedLocationLabels.join(', ') || 'Puudub'}</div>
        <div>Andmete read: {readings.length}</div>
      </div>
    </div>
  );
}
