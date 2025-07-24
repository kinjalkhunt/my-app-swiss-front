import React, { useState } from 'react';

export default function FabricEntryFormModal({ onClose }) {
  // State for all form fields
  const [form, setForm] = useState({
    trnNo: '', invoiceNo: '', invoiceDate: '', party: '', trnDate: '',
    fabricFor: '', meter: '', rate: '', amount: '',
    disPercent: '', disAmt: '', cgstPercent: '', cgstValue: '',
    sgstPercent: '', sgstValue: '', disAmount: '', finalAmount: ''
  });

  const [fabricDetails, setFabricDetails] = useState([
    {
      SKU: '', // Add SKU field
      fabricFor: '', meter: '', rate: '', amount: '',
      disPercent: '', disAmt: '', cgstPercent: '', cgstValue: '',
      sgstPercent: '', sgstValue: '', disAmount: '', finalAmount: ''
    }
  ]);

  const [focusedInput, setFocusedInput] = useState({ name: '', idx: null });

  // Helper for dynamic input/select background
  function getInputBg(name, idx = null) {
    return focusedInput.name === name && focusedInput.idx === idx ? 'bg-green-200' : 'bg-white';
  }

  // ...existing code...
  const handleFabricDetailChange = (idx, e) => {
    const { name, value } = e.target;
    setFabricDetails(prev =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const updatedRow = { ...row, [name]: value };
        // Only calculate for non-SKU fields
        if (name !== 'SKU') {
          // Calculate Amount
          const meter = parseFloat(name === "meter" ? value : row.meter) || 0;
          const rate = parseFloat(name === "rate" ? value : row.rate) || 0;
          const amount = meter && rate ? meter * rate : 0;
          updatedRow.amount = amount ? amount.toFixed(2) : "";

          // Calculate Discount
          const disPercent = parseFloat(name === "disPercent" ? value : row.disPercent) || 0;
          const discountAmt = amount && disPercent ? (amount * disPercent / 100) : 0;
          updatedRow.disAmt = discountAmt ? discountAmt.toFixed(2) : "";

          // Calculate DisAmount (after discount)
          const disAmount = amount - discountAmt;
          updatedRow.disAmount = amount ? disAmount.toFixed(2) : "";

          // Calculate CGST value
          const cgstPercent = parseFloat(name === "cgstPercent" ? value : row.cgstPercent) || 0;
          const cgstValue = disAmount && cgstPercent ? (disAmount * cgstPercent / 100) : 0;
          updatedRow.cgstValue = cgstValue ? cgstValue.toFixed(2) : "";

          // Calculate SGST value
          const sgstPercent = parseFloat(name === "sgstPercent" ? value : row.sgstPercent) || 0;
          const sgstValue = disAmount && sgstPercent ? (disAmount * sgstPercent / 100) : 0;
          updatedRow.sgstValue = sgstValue ? sgstValue.toFixed(2) : "";

          // Final Amount = DisAmount + CGST value + SGST value
          const finalAmount = disAmount + cgstValue + sgstValue;
          updatedRow.finalAmount = amount ? finalAmount.toFixed(2) : "";
        }
        return updatedRow;
      })
    );
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

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
          <fieldset className="border rounded p-4 mb-3">
            <legend className="text-sm text-blue-900 px-2">Party and Bill Detail</legend>
            <div className="space-beteween justify-center item-center gap-4 px-3 py-2 flex flex-wrap">
              <label className="font-bold text-blue-900 px-2">Trn No</label>
              <input
                name="trnNo"
                value={form.trnNo}
                onChange={handleChange}
                onFocus={() => setFocusedInput({ name: 'trnNo', idx: null })}
                onBlur={() => setFocusedInput({ name: '', idx: null })}
                className={`border w-35 px-2 py-1 rounded ${getInputBg('trnNo')}`}
              />
              <label className="font-bold text-blue-900 px-2">Invoice No</label>
              <input
                name="invoiceNo"
                value={form.invoiceNo}
                onChange={handleChange}
                onFocus={() => setFocusedInput({ name: 'invoiceNo', idx: null })}
                onBlur={() => setFocusedInput({ name: '', idx: null })}
                className={`w-35 border rounded px-2 py-1 ${getInputBg('invoiceNo')}`}
              />
              <label className="font-bold text-blue-900 px-2">Party</label>
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
              <label className="font-bold text-blue-900 px-2">Invoice Date</label>
              <input name="invoiceDate" value={form.invoiceDate} onChange={handleChange} className={`w-35 border rounded px-2 py-1 ${getInputBg('invoiceDate')}`} placeholder="19-07-2025 11:29:23 PM" />
              <label className="font-bold text-blue-900 px-2">Trn Date</label>
              <input name="trnDate" value={form.trnDate} onChange={handleChange} className={`w-35 border rounded px-2 py-1 ${getInputBg('trnDate')}`} placeholder="19-07-2025 11:29:23 PM" />
            </div>
          </fieldset>
          {/* Fabric Detail */}
          <fieldset className="border rounded p-4">
            <legend className="text-sm text-blue-900 px-2">Fabric Detail</legend>
            {fabricDetails.map((detail, idx) => (
              <div key={idx} className="mb-2 border-b pb-2 last:border-b-0 last:pb-0">
                <div className="space-beteween justify-center item-center mb-3 gap-4 px-3 py-2 flex flex-wrap">
                  <label className="font-bold text-blue-900 px-2">Fabric For</label>
                  <select
                    name="fabricFor"
                    value={detail.fabricFor}
                    onChange={e => handleFabricDetailChange(idx, e)}
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
                    onChange={e => handleFabricDetailChange(idx, e)}
                    onFocus={() => setFocusedInput({ name: 'SKU', idx })}
                    onBlur={() => setFocusedInput({ name: '', idx: null })}
                    className={`w-28 border rounded px-2 py-1 ${getInputBg('SKU', idx)}`}
                  />
                  <label className="font-bold text-blue-900">Meter</label>
                  <input
                    name="meter"
                    value={detail.meter}
                    onChange={e => handleFabricDetailChange(idx, e)}
                    onFocus={() => setFocusedInput({ name: 'meter', idx })}
                    onBlur={() => setFocusedInput({ name: '', idx: null })}
                    className={`w-28 border rounded px-2 py-1 ${getInputBg('meter', idx)}`}
                  />
                  <label className="font-bold text-blue-900">Rate</label>
                  <input name="rate" value={detail.rate} onChange={e => handleFabricDetailChange(idx, e)} onFocus={() => setFocusedInput({ name: 'rate', idx })}
                    onBlur={() => setFocusedInput({ name: '', idx: null })}
                    className={`w-28 border rounded px-2 py-1 ${getInputBg('rate', idx)}`}/>
                  <label className="col-span-1 font-bold text-blue-900">Amount</label>
                  <input name="amount" value={detail.amount} readOnly onChange={e => handleFabricDetailChange(idx, e)} className={`w-30 border rounded px-2 py-1 ${getInputBg('amount', idx)}`} />
                  <label className="font-bold text-blue-900">Dis%</label>
                  <input name="disPercent" value={detail.disPercent} onChange={e => handleFabricDetailChange(idx, e)} onFocus={() => setFocusedInput({ name: 'disPercent', idx })}
                    onBlur={() => setFocusedInput({ name: '', idx: null })}
                    className={`w-28 border rounded px-2 py-1 ${getInputBg('disPercent', idx)}`} />
                  <label className=" font-bold text-blue-900">Amt</label>
                  <input name="disAmt" value={detail.disAmt} readOnly onChange={e => handleFabricDetailChange(idx, e)} className={`w-18 border rounded px-2 py-1 ${getInputBg('disAmt', idx)}`} />
                  {/* <button type="button" onClick={() => handleRemoveFabricRow(idx)} className="col-span-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 ml-2">Remove</button> */}
                </div>
                <div className="space-beteween justify-center item-center mb-3 gap-4 px-3 py-2 flex flex-wrap">

                  <label className=" font-bold text-blue-900">CGST%"</label>
                  <input name="cgstPercent" value={detail.cgstPercent} onChange={e => handleFabricDetailChange(idx, e)} onFocus={() => setFocusedInput({ name: 'cgstPercent', idx })}
                    onBlur={() => setFocusedInput({ name: '', idx: null })}
                    className={`w-28 border rounded px-2 py-1 ${getInputBg('cgstPercent', idx)}`} />
                  <label className=" font-bold text-blue-900">Value</label>
                  <input name="cgstValue" value={detail.cgstValue} onChange={e => handleFabricDetailChange(idx, e)} onFocus={() => setFocusedInput({ name: 'cgstValue', idx })}
                    onBlur={() => setFocusedInput({ name: '', idx: null })}
                    className={`w-18 border rounded px-2 py-1 ${getInputBg('cgstValue', idx)}`} />
                  <label className=" font-bold text-blue-900">SGST%"</label>
                  <input name="sgstPercent" value={detail.sgstPercent} onChange={e => handleFabricDetailChange(idx, e)} onFocus={() => setFocusedInput({ name: 'sgstPercent', idx })}
                    onBlur={() => setFocusedInput({ name: '', idx: null })}
                    className={`w-28 border rounded px-2 py-1 ${getInputBg('sgstPercent', idx)}`} />
                  <label className=" font-bold text-blue-900">Value</label>
                  <input name="sgstValue" value={detail.sgstValue} onChange={e => handleFabricDetailChange(idx, e)} onFocus={() => setFocusedInput({ name: 'sgstValue', idx })}
                    onBlur={() => setFocusedInput({ name: '', idx: null })}
                    className={`w-18 border rounded px-2 py-1 ${getInputBg('sgstValue', idx)}`} />

                  <label className=" font-bold text-blue-900">DisAmount</label>
                  <input name="disAmount" value={detail.disAmount} readOnly onChange={e => handleFabricDetailChange(idx, e)} onFocus={() => setFocusedInput({ name: 'disAmount', idx })}
                    onBlur={() => setFocusedInput({ name: '', idx: null })}
                    className={`w-30 border rounded px-2 py-1 ${getInputBg('disAmount', idx)}`} />
                  <label className=" font-bold text-blue-900">Final Amount</label>
                  <input name="finalAmount" value={detail.finalAmount} onChange={e => handleFabricDetailChange(idx, e)} onFocus={() => setFocusedInput({ name: 'finalAmount', idx })}
                    onBlur={() => setFocusedInput({ name: '', idx: null })}
                    className={`w-30 border rounded px-2 py-1 ${getInputBg('finalAmount', idx)}`} />

                  <button className="px-6 py-2 bg-white border-2 border-green-400 text-blue-900 font-bold rounded hover:bg-blue-50">Add</button>

                </div>

              </div>
            ))}

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

              </tr>
            </thead>
            <tbody>
              {fabricDetails.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-4">*</td></tr>
              ) : (
                fabricDetails.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{row.sr}</td>

                    <td className="border px-2 py-1">{row.SKU}</td>
                    <td className="border px-2 py-1">{row.meter}</td>
                    <td className="border px-2 py-1">{row.rate}</td>
                    <td className="border px-2 py-1">{row.amount}</td>
                    <td className="border px-2 py-1">{row.disAmt}</td>
                    <td className="border px-2 py-1">{row.cgstValue}</td>
                    <td className="border px-2 py-1">{row.sgstValue}</td>
                    <td className="border px-2 py-1">{row.finalAmount}</td>
                  </tr>
                ))
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