import React, { useState, useEffect } from 'react';
import './TransactionReports.css';
import { Download } from 'lucide-react';

const TransactionReports = () => {
  const [filterType, setFilterType] = useState('Custom Range');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [monthlyFilter, setMonthlyFilter] = useState('1');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getNextDayString = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatDisplayDate = (apiDateStr) => {
    if (!apiDateStr) return '';
    return apiDateStr;
  };

  const fetchReports = async (start, end) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const vpaId = '6291777315m@pnbupi';

      const payload = {
        startDate: formatDateForAPI(start),
        endDate: formatDateForAPI(end),
        vpa_id: vpaId,
        mode: 'both'
      };

      const headers = {
        'Content-Type': 'application/json'
      };
      const token = sessionStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = token;
      }

      const response = await fetch('https://api-dev-stage.iserveu.online/pnb/sb/reports/querysubmit_user', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction reports');
      }

      const data = await response.json();

      let reports = [];
      if (data.data && Array.isArray(data.data)) {
        reports = data.data;
      } else if (data.ResponseData && Array.isArray(data.ResponseData)) {
        reports = data.ResponseData;
      } else if (Array.isArray(data)) {
        reports = data;
      }

      setTransactions(reports);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while fetching reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (filterType === 'Custom Range') {
      if (!startDate || !endDate) {
        setErrorMsg('Please select both start and end dates.');
        return;
      }
      fetchReports(startDate, endDate);
    } else if (filterType === 'Monthly') {
      const selectedMonthsBack = parseInt(monthlyFilter);
      const d = new Date();
      d.setMonth(d.getMonth() - selectedMonthsBack);
      const start = d.toISOString().split('T')[0];
      const end = getTodayString();
      fetchReports(start, end);
    }
  };

  useEffect(() => {
    if (filterType === 'Today') {
      const today = getTodayString();
      fetchReports(today, today);
    }
  }, [filterType]);

  const today = getTodayString();

  // Pagination
  const totalPages = Math.ceil(transactions.length / rowsPerPage);
  const currentData = transactions.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const renderPagination = () => {
    return (
      <div className="pagination-container">
        <div className="rows-per-page">
          Row per page
          <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="go-to">Go to <input type="number" value={currentPage} onChange={(e) => {
            let val = parseInt(e.target.value);
            if (val > 0 && val <= totalPages) setCurrentPage(val);
          }} className="go-to-input" /></span>
        </div>
        <div className="pagination-controls">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>&lt;</button>
          <button className="active">{currentPage}</button>
          {totalPages > currentPage && <button disabled>...</button>}
          {totalPages > 1 && currentPage !== totalPages && <button onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>}
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>&gt;</button>
        </div>
      </div>
    );
  };

  return (
    <div className="reports-page">
      <div className="reports-header-section">
        <h1 className="page-title">Transaction Reports</h1>
      </div>

      <div className="reports-card">
        <div className="filter-section">
          <div className="filter-label">Select a Report Filter</div>
          <div className="radio-group">
            <label className="radio-option">
              <input type="radio" value="Today" checked={filterType === 'Today'} onChange={() => setFilterType('Today')} />
              <span>Today</span>
            </label>
            <label className="radio-option">
              <input type="radio" value="Monthly" checked={filterType === 'Monthly'} onChange={() => setFilterType('Monthly')} />
              <span>Monthly</span>
            </label>
            <label className="radio-option selected">
              <input type="radio" value="Custom Range" checked={filterType === 'Custom Range'} onChange={() => setFilterType('Custom Range')} />
              <span>Custom Range</span>
            </label>
          </div>

          {filterType === 'Monthly' && (
            <form className="date-picker-section" onSubmit={handleSubmit}>
              <div className="date-input-group">
                <label>Monthly</label>
                <select
                  value={monthlyFilter}
                  onChange={(e) => setMonthlyFilter(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    minWidth: '200px'
                  }}
                >
                  <option value="1">Last Month's Report</option>
                  <option value="3">Last 3 month's Report</option>
                  <option value="6">Last 6 month's Report</option>
                  <option value="12">Last 12 month's Report</option>
                </select>
              </div>
              <button type="submit" className="submit-btn" disabled={loading} style={{ alignSelf: 'flex-end', marginBottom: '2px' }}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          )}

          {filterType === 'Custom Range' && (
            <form className="date-picker-section" onSubmit={handleSubmit}>
              <div className="date-input-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  max={today}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && e.target.value > endDate) {
                      setEndDate('');
                    }
                  }}
                />
              </div>
              <div className="date-input-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={today}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading} style={{ alignSelf: 'flex-end', marginBottom: '2px' }}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          )}
          {errorMsg && <div className="error-message">{errorMsg}</div>}
        </div>

        <div className="table-controls-section">
          <div className="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search here..." />
          </div>
          <button className="download-btn">
            <Download size={16} /> Download
          </button>
        </div>

        <div className="table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Transaction ID</th>
                <th>RRN Number</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((tx, index) => (
                  <tr key={tx.Transaction_Id || tx.id || index}>
                    <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td>{tx.Transaction_Id || tx.transaction_id || tx.transactionId || 'N/A'}</td>
                    <td>{tx.RRN || tx.rrn || tx.rrn_number || 'N/A'}</td>
                    <td>{tx.Transaction_Amount || tx.amount || 'N/A'}</td>
                    <td>{formatDisplayDate(tx['Date_&_Time'] || tx.date || tx.created_at)}</td>
                    <td><span className={`status-badge ${tx.status?.toLowerCase() || 'received'}`}>{tx.status || 'Received'}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">{loading ? 'Loading...' : 'No transactions found. Please select a date range.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {transactions.length > 0 && renderPagination()}
      </div>
    </div>
  );
};

export default TransactionReports;
