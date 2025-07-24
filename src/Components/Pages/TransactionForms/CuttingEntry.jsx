import React from 'react';

export default function CuttingEntry({ onClose }) {
  return (
    <form className="space-y-4">
      <div>
        <label className="block mb-1">TOption2 Field:</label>
        <input type="text" name="toption2" className="border p-1 w-full" />
      </div>
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">Close</button>
        <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded">Submit</button>
      </div>
    </form>
  );
} 