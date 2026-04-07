import React from 'react';
import { ArrowRightLeft, Banknote } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="dashboard-controls">
        <div className="vpa-id-selector">
          <span className="vpa-label">VPA ID :</span>
          <select className="vpa-select" defaultValue="pabitra">
            <option value="pabitra">Pabitrajhota@pnb</option>
            <option value="office">office.acc@pnb</option>
          </select>
        </div>
        <select className="filter-dropdown" defaultValue="Today">
          <option value="Today">Today</option>
          <option value="Yesterday">Yesterday</option>
          <option value="ThisWeek">This Week</option>
          <option value="ThisMonth">This Month</option>
        </select>
      </div>

      <div className="cards-container">
        {/* Transactions Card */}
        <div className="metric-card">
          <div className="card-left">
            <div className="card-icon transactions">
              <ArrowRightLeft size={24} />
            </div>
            <span className="card-label">Total No Of Transaction</span>
          </div>
          <div className="card-value">20.7K</div>
        </div>

        {/* Amount Card */}
        <div className="metric-card">
          <div className="card-left">
            <div className="card-icon amount">
              <Banknote size={24} />
            </div>
            <span className="card-label">Total Amount</span>
          </div>
          <div className="card-value">76,000 cr</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
