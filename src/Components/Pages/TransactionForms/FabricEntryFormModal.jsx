import React, { useState, useEffect } from 'react';

// Helper to get current date in dd/mm/yyyy hh:mm:ss AM/PM format
function getCurrentDateTimeString() {
  const now = new Date();
  const pad = n => n < 10 ? '0' + n : n;
  const day = pad(now.getDate());
  const month = pad(now.getMonth() + 1);
  const year = now.getFullYear();
  let hours = now.getHours();
  const minutes = pad(now.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const strTime = `${pad(hours)}:${minutes} ${ampm}`;
  return `${day}/${month}/${year} ${strTime}`;
}

// Helper to calculate fabric details
function calculateFabricDetails(row, changedField, changedValue) {
  const updatedRow = { ...row, [changedField]: changedValue };

  // Only calculate for non-SKU fields
  if (changedField === 'SKU') return updatedRow;

  // Calculate Amount
  const meter = parseFloat(changedField === "meter" ? changedValue : row.meter) || 0;
  const rate = parseFloat(changedField === "rate" ? changedValue : row.rate) || 0;
  const amount = meter && rate ? meter * rate : 0;
  updatedRow.amount = amount ? amount.toFixed(2) : "";

  // Calculate Discount
  const disPercent = parseFloat(changedField === "disPercent" ? changedValue : row.disPercent) || 0;
  const discountAmt = amount && disPercent ? (amount * disPercent / 100) : 0;
  updatedRow.disAmt = discountAmt ? discountAmt.toFixed(2) : "";

  // Calculate DisAmount (after discount)
  const disAmount = amount - discountAmt;
  updatedRow.disAmount = amount ? disAmount.toFixed(2) : "";

  // Calculate CGST value
  const cgstPercent = parseFloat(changedField === "cgstPercent" ? changedValue : row.cgstPercent) || 0;
  const cgstValue = disAmount && cgstPercent ? (disAmount * cgstPercent / 100) : 0;
  updatedRow.cgstValue = cgstValue ? cgstValue.toFixed(2) : "";

  // Calculate SGST value
  const sgstPercent = parseFloat(changedField === "sgstPercent" ? changedValue : row.sgstPercent) || 0;
  const sgstValue = disAmount && sgstPercent ? (disAmount * sgstPercent / 100) : 0;
  updatedRow.sgstValue = sgstValue ? sgstValue.toFixed(2) : "";

  // Final Amount = DisAmount + CGST value + SGST value
  const finalAmount = disAmount + cgstValue + sgstValue;
  updatedRow.finalAmount = amount ? finalAmount.toFixed(2) : "";

  return updatedRow;
}

// Helper to validate if a row is complete
function isRowComplete(row) {
  return row.SKU &&
    row.fabricFor &&
    row.meter &&
    row.rate &&
    row.disPercent &&
    row.cgstPercent &&
    row.sgstPercent;
}

export default function FabricEntryFormModal({ onClose, asModal = true }) {
  // State for all form fields
  const [form, setForm] = useState({
    trnNo: '',
    invoiceNo: '',
    invoiceDate: getCurrentDateTimeString(),
    party: '',
    trnDate: getCurrentDateTimeString()
  });

  const [fabricDetails, setFabricDetails] = useState([
    {
      id: 1,
      SKU: '',
      fabricFor: '',
      meter: '',
      rate: '',
      amount: '',
      disPercent: '',
      disAmt: '',
      cgstPercent: '',
      cgstValue: '',
      sgstPercent: '',
      sgstValue: '',
      disAmount: '',
      finalAmount: ''
    }
  ]);

  // Separate state for table rows (completed entries)
  const [tableRows, setTableRows] = useState([]);

  // Dynamic table state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterColumn, setFilterColumn] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Fixed at 5 items per page

  const [focusedInput, setFocusedInput] = useState({ name: '', idx: null });
  const [nextId, setNextId] = useState(2);

  // Helper for dynamic input/select background
  function getInputBg(name, idx = null) {
    return focusedInput.name === name && focusedInput.idx === idx ? 'bg-green-200' : 'bg-white';
  }

  // Add current row to table if complete
  const handleAddToTable = () => {
    const currentRow = fabricDetails[0]; // Always work with the first row

    if (isRowComplete(currentRow)) {
      // Add to table with a new ID
      const tableRow = {
        ...currentRow,
        id: Date.now(), // Use timestamp for unique ID
        sr: tableRows.length + 1
      };

      setTableRows(prev => [...prev, tableRow]);

      // Calculate which page the new entry will be on
      const newTotalRows = tableRows.length + 1;
      const newPage = Math.ceil(newTotalRows / itemsPerPage);

      // Navigate to the page where the new entry will be visible
      setCurrentPage(newPage);

      // Clear the form for next entry
      const emptyRow = {
        id: nextId,
        SKU: '',
        fabricFor: '',
        meter: '',
        rate: '',
        amount: '',
        disPercent: '',
        disAmt: '',
        cgstPercent: '',
        cgstValue: '',
        sgstPercent: '',
        sgstValue: '',
        disAmount: '',
        finalAmount: ''
      };

      setFabricDetails([emptyRow]);
      setNextId(prev => prev + 1);
    }
  };

  // Remove row from table
  const handleRemoveTableRow = (id) => {
    setTableRows(prev => prev.filter(row => row.id !== id));
    // Update serial numbers
    setTableRows(prev => prev.map((row, idx) => ({ ...row, sr: idx + 1 })));
  };

  // Handle fabric detail changes with improved calculations
  const handleFabricDetailChange = (id, e) => {
    const { name, value } = e.target;
    setFabricDetails(prev =>
      prev.map(row => {
        if (row.id !== id) return row;
        return calculateFabricDetails(row, name, value);
      })
    );
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Dynamic table functions
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Filter and sort data
  const getFilteredAndSortedData = () => {
    let filteredData = tableRows;

    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter(row => {
        if (filterColumn === 'all') {
          return Object.values(row).some(value =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        return row[filterColumn]?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Apply sorting - only sort by Sr (serial number)
    if (sortConfig.key === 'sr') {
      filteredData = [...filteredData].sort((a, b) => {
        const aVal = parseInt(a.sr) || 0;
        const bVal = parseInt(b.sr) || 0;

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filteredData;
  };

  // Get filtered and sorted data
  const filteredData = getFilteredAndSortedData();

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterColumn]);

  // Calculate totals from filtered data
  const totals = filteredData.reduce((acc, row) => {
    acc.meter += parseFloat(row.meter) || 0;
    acc.amount += parseFloat(row.amount) || 0;
    acc.disAmt += parseFloat(row.disAmt) || 0;
    acc.cgstValue += parseFloat(row.cgstValue) || 0;
    acc.sgstValue += parseFloat(row.sgstValue) || 0;
    acc.finalAmount += parseFloat(row.finalAmount) || 0;
    return acc;
  }, { meter: 0, amount: 0, disAmt: 0, cgstValue: 0, sgstValue: 0, finalAmount: 0 });

  const content = (
    <div className="relative w-full bg-white rounded overflow-hidden p-6 flex flex-col gap-4 shadow-lg">
      <button
        className="absolute top-0 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold z-10"
        onClick={onClose}
      >
        ×
      </button>
      {/* Form Section */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Party and Bill Detail */}
        <fieldset className="border rounded mb-3">
          <legend className="text-sm text-blue-900 px-2">Party and Bill Detail</legend>
          <div className="space-beteween justify-center item-center gap-4 py-2 flex">
            <label className="font-bold text-blue-900 px-1">Trn No</label>
            <input
              name="trnNo"
              value={form.trnNo}
              onChange={handleChange}
              onFocus={() => setFocusedInput({ name: 'trnNo', idx: null })}
              onBlur={() => setFocusedInput({ name: '', idx: null })}
              className={`border w-25 px-2 py-1 rounded ${getInputBg('trnNo')}`}
            />
            <label className="font-bold text-blue-900 px-1">Invoice No</label>
            <input
              name="invoiceNo"
              value={form.invoiceNo}
              onChange={handleChange}
              onFocus={() => setFocusedInput({ name: 'invoiceNo', idx: null })}
              onBlur={() => setFocusedInput({ name: '', idx: null })}
              className={`w-25 border rounded px-2 py-1 ${getInputBg('invoiceNo')}`}
            />
            <label className="font-bold text-blue-900 px-1">Party</label>
            <select
              name="party"
              value={form.party}
              onChange={handleChange}
              onFocus={() => setFocusedInput({ name: 'party', idx: null })}
              onBlur={() => setFocusedInput({ name: '', idx: null })}
              className={`w-35 border rounded px-2 py-1 ${getInputBg('party')}`}
            >
              <option value="">Select Party</option>
              <option value="Party1">Party 1</option>
              <option value="Party2">Party 2</option>
            </select>
            <label className="font-bold text-blue-900 px-1">Invoice Date</label>
            <input
              name="invoiceDate"
              value={form.invoiceDate}
              onChange={handleChange}
              className={`w-42 border rounded px-2 py-1 ${getInputBg('invoiceDate')}`}
              placeholder="19-07-2025 11:29:23 PM"
            />
            <label className="font-bold text-blue-900 px-1">Trn Date</label>
            <input
              name="trnDate"
              value={form.trnDate}
              onChange={handleChange}
              className={`w-42 border rounded px-2 py-1 ${getInputBg('trnDate')}`}
              placeholder="19-07-2025 11:29:23 PM"
            />
          </div>
        </fieldset>

        {/* Fabric Detail */}
        <fieldset className="border rounded">
          <legend className="text-sm text-blue-900 px-2">Fabric Detail</legend>
          {fabricDetails.map((detail, idx) => (
            <div key={detail.id} className="mb-2 border-b pb-2 last:border-b-0 last:pb-0">
              <div className="space-beteween justify-center item-center mb-3 gap-4 px-3 py-2 flex">
                <label className="font-bold text-blue-900 px-2">Fabric For</label>
                <select
                  name="fabricFor"
                  value={detail.fabricFor}
                  onChange={e => handleFabricDetailChange(detail.id, e)}
                  onFocus={() => setFocusedInput({ name: 'fabricFor', idx })}
                  onBlur={() => setFocusedInput({ name: '', idx: null })}
                  className={`w-28 border rounded px-2 py-1 ${getInputBg('fabricFor', idx)}`}
                >
                  <option value="">Select</option>
                  <option value="Fabric1">Fabric 1</option>
                  <option value="Fabric2">Fabric 2</option>
                </select>
                <label className="font-bold text-blue-900">SKU</label>
                <input
                  name="SKU"
                  value={detail.SKU}
                  onChange={e => handleFabricDetailChange(detail.id, e)}
                  onFocus={() => setFocusedInput({ name: 'SKU', idx })}
                  onBlur={() => setFocusedInput({ name: '', idx: null })}
                  className={`w-28 border rounded px-2 py-1 ${getInputBg('SKU', idx)}`}
                />
                <label className="font-bold text-blue-900">Meter</label>
                <input
                  name="meter"
                  type="number"
                  step="0.01"
                  value={detail.meter}
                  onChange={e => handleFabricDetailChange(detail.id, e)}
                  onFocus={() => setFocusedInput({ name: 'meter', idx })}
                  onBlur={() => setFocusedInput({ name: '', idx: null })}
                  className={`w-28 border rounded px-2 py-1 ${getInputBg('meter', idx)}`}
                />
                <label className="font-bold text-blue-900">Rate</label>
                <input
                  name="rate"
                  type="number"
                  step="0.01"
                  value={detail.rate}
                  onChange={e => handleFabricDetailChange(detail.id, e)}
                  onFocus={() => setFocusedInput({ name: 'rate', idx })}
                  onBlur={() => setFocusedInput({ name: '', idx: null })}
                  className={`w-28 border rounded px-2 py-1 ${getInputBg('rate', idx)}`}
                />
                <label className="col-span-1 font-bold text-blue-900">Amount</label>
                <input
                  name="amount"
                  value={detail.amount}
                  readOnly
                  className={`w-30 border rounded px-2 py-1 bg-gray-100`}
                />
                <label className="font-bold text-blue-900">Dis%</label>
                <input
                  name="disPercent"
                  type="number"
                  step="0.01"
                  value={detail.disPercent}
                  onChange={e => handleFabricDetailChange(detail.id, e)}
                  onFocus={() => setFocusedInput({ name: 'disPercent', idx })}
                  onBlur={() => setFocusedInput({ name: '', idx: null })}
                  className={`w-28 border rounded px-2 py-1 ${getInputBg('disPercent', idx)}`}
                />
                <label className=" font-bold text-blue-900">Amt</label>
                <input
                  name="disAmt"
                  value={detail.disAmt}
                  readOnly
                  className={`w-18 border rounded px-2 py-1 bg-gray-100`}
                />
              </div>
              <div className="flex justify-center mb-2">
                <label className=" font-bold text-center text-blue-900 px-2">CGST%</label>
                <input
                  name="cgstPercent"
                  type="number"
                  step="0.01"
                  value={detail.cgstPercent}
                  onChange={e => handleFabricDetailChange(detail.id, e)}
                  onFocus={() => setFocusedInput({ name: 'cgstPercent', idx })}
                  onBlur={() => setFocusedInput({ name: '', idx: null })}
                  className={`w-28 h-9 border rounded px-2 py-1 ${getInputBg('cgstPercent', idx)}`}
                />
                <label className=" font-bold text-blue-900 px-3">Value</label>
                <input
                  name="cgstValue"
                  value={detail.cgstValue}
                  readOnly
                  className={`w-18 h-9 border rounded px-2 py-1 bg-gray-100`}
                />
                <label className=" font-bold text-blue-900 px-3">SGST%</label>
                <input
                  name="sgstPercent"
                  type="number"
                  step="0.01"
                  value={detail.sgstPercent}
                  onChange={e => handleFabricDetailChange(detail.id, e)}
                  onFocus={() => setFocusedInput({ name: 'sgstPercent', idx })}
                  onBlur={() => setFocusedInput({ name: '', idx: null })}
                  className={`w-28 h-9 border rounded px-2 py-1 ${getInputBg('sgstPercent', idx)}`}
                />
                <label className=" font-bold text-blue-900 px-3">Value</label>
                <input
                  name="sgstValue"
                  value={detail.sgstValue}
                  readOnly
                  className={`w-18 h-9 border rounded px-2 py-1 bg-gray-100`}
                />
                <label className=" font-bold text-blue-900 px-3">DisAmount</label>
                <input
                  name="disAmount"
                  value={detail.disAmount}
                  readOnly
                  className={`w-30 h-9 border rounded px-2 py-1 bg-gray-100`}
                />
                <label className=" font-bold text-blue-900 px-3">Final Amount</label>
                <input
                  name="finalAmount"
                  value={detail.finalAmount}
                  readOnly
                  className={`w-30 h-9 border rounded px-2 py-1 bg-gray-100`}
                />

                {/* Add Button */}
                <div className="flex items-center ml-4">
                  <button
                    type="button"
                    onClick={handleAddToTable}
                    className="px-6 py-1  border-2 bg-green-200 text-blue-900 font-bold rounded hover:bg-blue-100"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}

        </fieldset>
      </div>

      {/* Bottom: Dynamic Table */}
      <div className="bg-[#f1f2f4] p-2 mt-6 rounded">
        {/* Table Controls */}
        <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
          {/* Search and Filter */}
          {/* <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            />
            <select
              value={filterColumn}
              onChange={(e) => setFilterColumn(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">All Columns</option>
              <option value="SKU">SKU</option>
              <option value="fabricFor">Fabric For</option>
              <option value="meter">Meter</option>
              <option value="rate">Rate</option>
              <option value="amount">Amount</option>
            </select>
          </div> */}
        </div>

        {/* Results info
        <div className="mb-2 text-sm text-gray-600">
          Showing {filteredData.length} entries
          {searchTerm && ` (filtered from ${tableRows.length} total entries)`}
        </div> */}

        {/* Table Container with Fixed Height */}
        <div className="border rounded" style={{ height: '280px', display: 'grid', gridTemplateRows: 'auto 1fr auto' }}>
          {/* Header */}
          <div className="bg-white border-b">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr>
                  <th className="border px-2 py-1 text-center">Sr</th>
                  <th className="border px-2 py-1  text-center">SKU</th>
                  <th className="border px-2 py-1 text-center">Mtr</th>
                  <th className="border px-2 py-1  text-center">Rate</th>
                  <th className="border px-2 py-1  text-center">Amount</th>
                  <th className="border px-2 py-1  text-center">Discount</th>
                  <th className="border px-2 py-1  text-center">CGST</th>
                  <th className="border px-2 py-1  text-center">SGST</th>
                  <th className="border px-2 py-1 text-center">Final Amount</th>
                  <th className="border px-2 py-1  text-center">Action</th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Fixed Body - No Scroll */}
          <div style={{ height: '180px' }}>
            <table className="w-full text-sm table-fixed">
              <tbody className="bg-white">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4">
                      {searchTerm ? 'No entries match your search' : 'No entries added yet'}
                    </td>
                  </tr>
                ) : (
                  <>
                    {currentData.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="border px-2 py-1 text-center">{row.sr}</td>
                        <td className="border px-2 py-1 text-center">{row.SKU}</td>
                        <td className="border px-2 py-1 text-center">{row.meter}</td>
                        <td className="border px-2 py-1 text-center">{row.rate}</td>
                        <td className="border px-2 py-1 text-center">{row.amount}</td>
                        <td className="border px-2 py-1 text-center">{row.disAmt}</td>
                        <td className="border px-2 py-1 text-center">{row.cgstValue}</td>
                        <td className="border px-2 py-1 text-center">{row.sgstValue}</td>
                        <td className="border px-2 py-1 text-center">{row.finalAmount}</td>
                        <td className="border px-2 py-1 text-center">
                          <button
                            onClick={() => handleRemoveTableRow(row.id)}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Totals Row */}
                    <tr className="bg-gray-100 font-bold">
                      <td className="border px-2 py-1 text-center">Total</td>
                      <td className="border px-2 py-1 text-center">-</td>
                      <td className="border px-2 py-1 text-center">{totals.meter.toFixed(2)}</td>
                      <td className="border px-2 py-1 text-center">-</td>
                      <td className="border px-2 py-1 text-center">{totals.amount.toFixed(2)}</td>
                      <td className="border px-2 py-1 text-center">{totals.disAmt.toFixed(2)}</td>
                      <td className="border px-2 py-1 text-center">{totals.cgstValue.toFixed(2)}</td>
                      <td className="border px-2 py-1 text-center">{totals.sgstValue.toFixed(2)}</td>
                      <td className="border px-2 py-1 text-center">{totals.finalAmount.toFixed(2)}</td>
                      <td className="border px-2 py-1 text-center">-</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with Pagination */}
          <div className="bg-gray-50 border-t px-4 py-2" style={{ height: '50px' }}>
            <div className="flex justify-between items-center h-full">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                {searchTerm && ` (filtered from ${tableRows.length} total entries)`}
              </div>
              {totalPages > 1 && (
                <div className="flex gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 border rounded text-sm ${currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Close</button>
        </div>
      </div>
    </div>
  );
  if (asModal) {
    return (
      <div className="fixed inset-0 flex items-center top-25 justify-center z-50 bg-opacity-30">
        {content}
      </div>
    );
  }
  return content;
} 