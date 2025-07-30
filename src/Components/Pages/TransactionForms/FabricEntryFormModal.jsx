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

export default function FabricEntryFormModal({ onClose }) {
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
    } else {
      alert('Please fill all required fields before adding to table');
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

  // Calculate totals from table rows
  const totals = tableRows.reduce((acc, row) => {
    acc.meter += parseFloat(row.meter) || 0;
    acc.amount += parseFloat(row.amount) || 0;
    acc.disAmt += parseFloat(row.disAmt) || 0;
    acc.cgstValue += parseFloat(row.cgstValue) || 0;
    acc.sgstValue += parseFloat(row.sgstValue) || 0;
    acc.finalAmount += parseFloat(row.finalAmount) || 0;
    return acc;
  }, { meter: 0, amount: 0, disAmt: 0, cgstValue: 0, sgstValue: 0, finalAmount: 0 });

  return (
    <div className="fixed inset-0 flex items-center top-25 justify-center z-50 bg-opacity-30">
      <div className="relative w-[1400px] bg-white rounded overflow-hidden p-6 flex flex-col gap-4 shadow-lg">
        <button
          className="absolute top-0 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold z-10"
          onClick={onClose}
        >
          ×
        </button>
        {/* Form Section */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Party and Bill Detail */}
          <fieldset className="border rounded p-3 mb-3">
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
          <fieldset className="border rounded p-4">
            <legend className="text-sm text-blue-900 px-2">Fabric Detail</legend>
            {fabricDetails.map((detail, idx) => (
              <div key={detail.id} className="mb-2 border-b pb-2 last:border-b-0 last:pb-0">
                <div className="space-beteween justify-center item-center mb-3 gap-4 px-3 py-2 flex flex-wrap">
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
                <div className="space-beteween mb-2 gap-4 px-4">
                  <label className=" font-bold text-center text-blue-900 px-2">CGST%</label>
                  <input 
                    name="cgstPercent" 
                    type="number"
                    step="0.01"
                    value={detail.cgstPercent}
                    onChange={e => handleFabricDetailChange(detail.id, e)}
                    onFocus={() => setFocusedInput({ name: 'cgstPercent', idx })}
                    onBlur={() => setFocusedInput({ name: '', idx: null })}
                    className={`w-28 border rounded px-2 py-1 ${getInputBg('cgstPercent', idx)}`} 
                  />
                  <label className=" font-bold text-blue-900 px-3">Value</label>
                  <input 
                    name="cgstValue" 
                    value={detail.cgstValue} 
                    readOnly 
                    className={`w-18 border rounded px-2 py-1 bg-gray-100`} 
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
                    className={`w-28 border rounded px-2 py-1 ${getInputBg('sgstPercent', idx)}`} 
                  />
                  <label className=" font-bold text-blue-900 px-3">Value</label>
                  <input 
                    name="sgstValue" 
                    value={detail.sgstValue} 
                    readOnly 
                    className={`w-18 border rounded px-2 py-1 bg-gray-100`} 
                  />
                  <label className=" font-bold text-blue-900 px-3">DisAmount</label>
                  <input 
                    name="disAmount" 
                    value={detail.disAmount} 
                    readOnly 
                    className={`w-30 border rounded px-2 py-1 bg-gray-100`} 
                  />
                  <label className=" font-bold text-blue-900 px-3">Final Amount</label>
                  <input 
                    name="finalAmount" 
                    value={detail.finalAmount} 
                    readOnly 
                    className={`w-30 border rounded px-2 py-1 bg-gray-100`} 
                  />
                </div>
              </div>
            ))}
            
            {/* Add Button */}
            <div className="flex justify-center mt-4">
              <button 
                type="button" 
                onClick={handleAddToTable}
                className="px-6 py-2 bg-white border-2 border-green-400 text-blue-900 font-bold rounded hover:bg-blue-50"
              >
                Add
              </button>
            </div>
          </fieldset>
        </div>
        
        {/* Bottom: Table */}
        <div className="bg-[#f1f2f4] p-2 mt-6 rounded">
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-white">
                <th className="border px-2 py-1">Sr</th>
                <th className="border px-2 py-1">SKU</th>
                <th className="border px-2 py-1">Mtr</th>
                <th className="border px-2 py-1">Rate</th>
                <th className="border px-2 py-1">Amount</th>
                <th className="border px-2 py-1">Discount</th>
                <th className="border px-2 py-1">CGST</th>
                <th className="border px-2 py-1">SGST</th>
                <th className="border px-2 py-1">Final Amount</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-4">No entries added yet</td></tr>
              ) : (
                <>
                  {tableRows.map((row) => (
                    <tr key={row.id}>
                      <td className="border px-2 py-1">{row.sr}</td>
                      <td className="border px-2 py-1">{row.SKU}</td>
                      <td className="border px-2 py-1">{row.meter}</td>
                      <td className="border px-2 py-1">{row.rate}</td>
                      <td className="border px-2 py-1">{row.amount}</td>
                      <td className="border px-2 py-1">{row.disAmt}</td>
                      <td className="border px-2 py-1">{row.cgstValue}</td>
                      <td className="border px-2 py-1">{row.sgstValue}</td>
                      <td className="border px-2 py-1">{row.finalAmount}</td>
                      <td className="border px-2 py-1">
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
                    <td className="border px-2 py-1">Total</td>
                    <td className="border px-2 py-1">-</td>
                    <td className="border px-2 py-1">{totals.meter.toFixed(2)}</td>
                    <td className="border px-2 py-1">-</td>
                    <td className="border px-2 py-1">{totals.amount.toFixed(2)}</td>
                    <td className="border px-2 py-1">{totals.disAmt.toFixed(2)}</td>
                    <td className="border px-2 py-1">{totals.cgstValue.toFixed(2)}</td>
                    <td className="border px-2 py-1">{totals.sgstValue.toFixed(2)}</td>
                    <td className="border px-2 py-1">{totals.finalAmount.toFixed(2)}</td>
                    <td className="border px-2 py-1">-</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
          <div className="flex justify-end mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
} 