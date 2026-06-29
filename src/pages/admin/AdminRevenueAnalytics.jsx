import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { FaTrophy, FaLightbulb, FaCrown, FaFire, FaBolt, FaChartLine } from 'react-icons/fa';
import './AdminRevenueAnalytics.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const fmt = (num) => '₦' + (num || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtCompact = (num) => {
  const n = num || 0;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
};

const getYTicks = (maxValue) => {
  if (maxValue <= 0) return [0, 1, 2, 3, 4];
  const rough = maxValue / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const step = Math.ceil(rough / magnitude) * magnitude;
  const top = step * 4;
  return [0, step, step * 2, step * 3, top];
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const str = String(dateStr);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return str;
  return d.toISOString().slice(0, 10);
};

const buildDailyFallback = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().slice(0, 10), sales: 0 });
  }
  return days;
};

const RevenueLineChart = ({ title, subtitle, data, valueKey = 'sales', labelKey = 'date', formatLabel }) => {
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="ra-chart-card">
        <div className="ra-chart-header">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <p className="ra-empty-text">No sales data yet.</p>
      </div>
    );
  }

  const values = data.map((d) => parseFloat(d[valueKey]) || 0);
  const maxValue = Math.max(...values);
  const yTicks = getYTicks(maxValue);
  const yMax = yTicks[yTicks.length - 1] || 1;

  const padding = { top: 24, right: 24, bottom: 48, left: 72 };
  const width = 800;
  const height = 320;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const val = parseFloat(d[valueKey]) || 0;
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padding.top + chartH - (val / yMax) * chartH;
    const label = formatLabel ? formatLabel(d[labelKey], d) : d[labelKey];
    return { x, y, val, label };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <div className="ra-chart-card">
      <div className="ra-chart-header">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      <div className="ra-chart-wrap">
        <svg viewBox={`0 0 ${width} ${height}`} className="ra-chart-svg" role="img" aria-label={title}>
          {yTicks.map((tick) => {
            const y = padding.top + chartH - (tick / yMax) * chartH;
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  className="ra-grid-line"
                />
                <text x={padding.left - 12} y={y + 4} className="ra-axis-label ra-y-label">
                  {fmtCompact(tick)}
                </text>
              </g>
            );
          })}

          <line
            x1={padding.left}
            y1={padding.top + chartH}
            x2={width - padding.right}
            y2={padding.top + chartH}
            className="ra-axis-line"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartH}
            className="ra-axis-line"
          />

          <path d={areaPath} className="ra-area-fill" />
          <path d={linePath} className="ra-line" />

          {points.map((p, i) => (
            <g
              key={i}
              className="ra-dot-group"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <circle cx={p.x} cy={p.y} r={hovered === i ? 7 : 5} className="ra-dot" />
              <text x={p.x} y={height - 16} className="ra-axis-label ra-x-label">
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        {hovered !== null && (
          <div
            className="ra-tooltip"
            style={{
              left: `${(points[hovered].x / width) * 100}%`,
              top: `${(points[hovered].y / height) * 100}%`,
            }}
          >
            <span className="ra-tooltip-date">{points[hovered].label}</span>
            <span className="ra-tooltip-value">{fmt(points[hovered].val)}</span>
          </div>
        )}
      </div>

      <div className="ra-chart-legend">
        <span className="ra-legend-dot" />
        Revenue (₦)
      </div>
    </div>
  );
};

const AdminRevenueAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('hairboss_token');
        const res = await fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
        if (mounted) {
          setStats(data);
          setError('');
        }
      } catch (err) {
        if (err.name !== 'AbortError' && mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void fetchData();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="ra-loading">Loading revenue analytics...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="ra-error">
          <h2>Analytics Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="ra-retry-btn">Retry</button>
        </div>
      </AdminLayout>
    );
  }

  const dailyData = (stats.dailyRevenue?.length ? stats.dailyRevenue : buildDailyFallback()).map((d) => ({
    date: d.date,
    sales: parseFloat(d.sales) || 0,
  }));

  const monthlyData = (stats.monthlySales || []).map((d) => ({
    month: d.month,
    sales: parseFloat(d.sales) || 0,
  }));

  return (
    <AdminLayout>
      <div className="ra-page">
        <div className="ra-header">
          <p className="ra-tag">Admin</p>
          <h1 className="ra-headline">
            Revenue &amp; Sales Analytics
          </h1>
          <p className="ra-subheadline">Track how your store is performing over time</p>
        </div>

        <div className="ra-summary-grid">
          <div className="ra-summary-card">
            <span className="ra-summary-label">This Week</span>
            <span className="ra-summary-value">{fmt(stats.weeklyRevenue)}</span>
          </div>
          <div className="ra-summary-card">
            <span className="ra-summary-label">This Month</span>
            <span className="ra-summary-value">{fmt(stats.monthlyRevenue)}</span>
          </div>
          <div className="ra-summary-card">
            <span className="ra-summary-label">This Year</span>
            <span className="ra-summary-value">{fmt(stats.yearlyRevenue)}</span>
          </div>
          <div className="ra-summary-card ra-summary-card--highlight">
            <span className="ra-summary-label">All-Time Revenue</span>
            <span className="ra-summary-value">{fmt(stats.revenue)}</span>
          </div>
        </div>

        <div className="ra-charts-stack">
          <RevenueLineChart
            title="Revenue Over Time"
            subtitle="Daily revenue for the past 7 days"
            data={dailyData}
            labelKey="date"
            formatLabel={(val) => formatDateLabel(val)}
          />
          <RevenueLineChart
            title="Monthly Revenue Trend"
            subtitle="Total revenue per month (last 6 months)"
            data={monthlyData}
            labelKey="month"
            formatLabel={(val) => val}
          />
        </div>

        <div className="ra-details-grid">
          <div className="ra-details-box">
            <h3><FaTrophy /> Best Selling Wigs</h3>
            <div className="table-wrap">
              <table className="ra-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Wig Name</th>
                    <th>Qty</th>
                    <th>Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.bestSellers?.slice(0, 5).map((w, idx) => (
                    <tr key={idx}>
                      <td className="ra-muted">{w.period?.trim()}</td>
                      <td className="ra-strong">{w.product_name}</td>
                      <td>{w.quantity_sold} units</td>
                      <td>{fmt(w.sales_value)}</td>
                    </tr>
                  ))}
                  {(!stats.bestSellers || stats.bestSellers.length === 0) && (
                    <tr>
                      <td colSpan="4" className="ra-empty-text">No sales recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ra-details-box">
            <h3><FaLightbulb /> Sales Insights</h3>
            <div className="ra-insights-list">
              {stats.insights?.map((insight, idx) => {
                const icons = [
                  <FaCrown key="crown" style={{ color: '#f39c12' }} />,
                  <FaFire key="fire" style={{ color: '#e74c3c' }} />,
                  <FaBolt key="bolt" style={{ color: '#f1c40f' }} />,
                  <FaChartLine key="chart" style={{ color: '#2ecc71' }} />,
                ];
                return (
                  <div key={idx} className="ra-insight-item">
                    <span className="ra-insight-icon">{icons[idx] || icons[3]}</span>
                    <span>{insight}</span>
                  </div>
                );
              })}
              {(!stats.insights || stats.insights.length === 0) && (
                <p className="ra-empty-text">Generating insights...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRevenueAnalytics;
