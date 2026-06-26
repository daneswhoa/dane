import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Home,
  Minus,
  AlertCircle,
  FileText,
  ArrowRight,
  Droplet,
  CreditCard,
  FileSignature,
  CheckSquare
} from 'lucide-react';

export default function OverviewTab() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
      {/* Metrics Grid */}
      <div className="metrics-row">
        {/* Metric Card 1 */}
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Total Revenue</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="metric-card-value-container">
            <span className="metric-card-value">$248,500</span>
            <span className="metric-trend-badge positive">
              <TrendingUp className="w-2.5 h-2.5" style={{ marginRight: '2px' }} /> 4.2%
            </span>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Occupancy Rate</span>
            <Home className="w-4 h-4" />
          </div>
          <div className="metric-card-value-container">
            <span className="metric-card-value">94.8%</span>
            <span className="metric-trend-badge neutral">
              <Minus className="w-2.5 h-2.5" style={{ marginRight: '2px' }} /> 0.0%
            </span>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Open Tickets</span>
            <AlertCircle className="w-4 h-4 text-coral" />
          </div>
          <div className="metric-card-value-container">
            <span className="metric-card-value">24</span>
            <span className="metric-trend-badge alert">
              8 Critical
            </span>
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Lease Renewals</span>
            <FileText className="w-4 h-4" />
          </div>
          <div className="metric-card-value-container">
            <span className="metric-card-value">12</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Next 30 days</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Table & Sidebar Activity */}
      <div className="main-grid">
        {/* Properties Data Table */}
        <div className="panel-card col-span-2">
          <div className="panel-header">
            <h2 className="panel-title">Property Status Grid</h2>
            <a href="#" className="panel-header-link">
              View All <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Property / Unit</th>
                  <th>Tenant</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Rent</th>
                  <th style={{ textAlign: 'right' }}>Due</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="property-unit-name">Grandview Apts</div>
                    <div className="property-unit-desc">Unit 4B</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>Sarah Jenkins</td>
                  <td>
                    <span className="status-pill active">
                      <span className="status-pill-dot"></span> Active
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>$1,850</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>1st of Month</td>
                </tr>
                <tr>
                  <td>
                    <div className="property-unit-name">Westside Lofts</div>
                    <div className="property-unit-desc">Unit 212</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>Michael Chen</td>
                  <td>
                    <span className="status-pill late">
                      <span className="status-pill-dot"></span> Late (3 Days)
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>$2,100</td>
                  <td style={{ textAlign: 'right', color: 'var(--coral-text)', fontWeight: 500 }}>Overdue</td>
                </tr>
                <tr>
                  <td>
                    <div className="property-unit-name">The Beacon</div>
                    <div className="property-unit-desc">Unit 1A</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Vacant</td>
                  <td>
                    <span className="status-pill vacant">
                      <span className="status-pill-dot"></span> Make Ready
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>$1,950</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>-</td>
                </tr>
                <tr>
                  <td>
                    <div className="property-unit-name">Grandview Apts</div>
                    <div className="property-unit-desc">Unit 5C</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>Emma & Tom Reed</td>
                  <td>
                    <span className="status-pill notice">
                      <span className="status-pill-dot"></span> Notice Given
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>$1,900</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>Exp. Oct 31</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="panel-header">
            <h2 className="panel-title">Priority Alerts</h2>
            <div className="alert-badge">3 New</div>
          </div>

          <div className="alerts-list">
            {/* Alert Item 1 */}
            <div className="alert-item">
              <div style={{ marginTop: '2px' }}>
                <Droplet className="w-3.5 h-3.5 text-blue" />
              </div>
              <div>
                <h3 className="alert-item-title">Water Leak Reported</h3>
                <p className="alert-item-text">Westside Lofts, Unit 304. Tenant reports water under sink.</p>
                <span className="alert-item-time">10 mins ago</span>
              </div>
            </div>

            {/* Alert Item 2 */}
            <div className="alert-item">
              <div style={{ marginTop: '2px' }}>
                <CreditCard className="w-3.5 h-3.5 text-coral" />
              </div>
              <div>
                <h3 className="alert-item-title">Payment Failed</h3>
                <p className="alert-item-text">Auto-pay failed for Unit 212. Overdue status triggered.</p>
                <span className="alert-item-time">2 hours ago</span>
              </div>
            </div>

            {/* Alert Item 3 */}
            <div className="alert-item">
              <div style={{ marginTop: '2px' }}>
                <FileSignature className="w-3.5 h-3.5 text-muted" />
              </div>
              <div>
                <h3 className="alert-item-title">Lease Uploaded</h3>
                <p className="alert-item-text">Countersignature required for The Beacon, Unit 1A.</p>
                <span className="alert-item-time">4 hours ago</span>
              </div>
            </div>
          </div>

          <div className="panel-footer">
            <button className="panel-footer-btn">View Action Center</button>
          </div>
        </div>
      </div>

      {/* Secondary Data Row */}
      <div className="secondary-grid">
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Revenue vs. Expenses</span>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-color-box" style={{ backgroundColor: 'var(--green)' }}></span> Revenue
              </span>
              <span className="legend-item">
                <span className="legend-color-box" style={{ backgroundColor: 'var(--coral)' }}></span> Expenses
              </span>
            </div>
          </div>

          {/* Mock Bar Chart */}
          <div className="mock-bars-container">
            <div className="mock-bar-group" style={{ height: '100%' }}>
              <div className="bar-expense" style={{ height: '40%' }}></div>
              <div className="bar-revenue" style={{ height: '70%' }}></div>
            </div>
            <div className="mock-bar-group" style={{ height: '100%' }}>
              <div className="bar-expense" style={{ height: '45%' }}></div>
              <div className="bar-revenue" style={{ height: '80%' }}></div>
            </div>
            <div className="mock-bar-group" style={{ height: '100%' }}>
              <div className="bar-expense" style={{ height: '30%' }}></div>
              <div className="bar-revenue" style={{ height: '75%' }}></div>
            </div>
            <div className="mock-bar-group" style={{ height: '100%' }}>
              <div className="bar-expense" style={{ height: '50%' }}></div>
              <div className="bar-revenue" style={{ height: '85%' }}></div>
            </div>
            <div className="mock-bar-group" style={{ height: '100%' }}>
              <div className="bar-expense" style={{ height: '60%' }}></div>
              <div className="bar-revenue" style={{ height: '60%' }}></div>
            </div>
            <div className="mock-bar-group" style={{ height: '100%' }}>
              <div className="bar-expense" style={{ height: '35%' }}></div>
              <div className="bar-revenue" style={{ height: '90%' }}></div>
            </div>
          </div>
          <div className="chart-labels-row">
            <span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Task Completion</span>
            <CheckSquare className="w-4 h-4 text-muted" />
          </div>

          <div className="progress-list">
            <div>
              <div className="progress-item-label-row">
                <span>Maintenance Work Orders</span>
                <span className="progress-item-val">82%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill blue" style={{ width: '82%' }}></div>
              </div>
            </div>
            <div>
              <div className="progress-item-label-row">
                <span>Lease Renewals (30d)</span>
                <span className="progress-item-val">45%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill muted" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="progress-item-label-row">
                <span>Unit Inspections</span>
                <span className="progress-item-val">100%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill emerald" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
