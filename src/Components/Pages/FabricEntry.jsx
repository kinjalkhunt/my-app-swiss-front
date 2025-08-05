import React, { useState, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import FabricEntryFormModal from './TransactionForms/FabricEntryFormModal';
import CuttingEntry from './TransactionForms/CuttingEntry';
import WorkEntry from './TransactionForms/WorkEntry';

function FabricEntry() {
  const [activeSection, setActiveSection] = useState('Master');
  const [showMasterDropdown, setShowMasterDropdown] = useState(false);
  const [showTransactionDropdown, setShowTransactionDropdown] = useState(false);
  const [openTransactionForms, setOpenTransactionForms] = useState([]);
  const [activeTransactionForm, setActiveTransactionForm] = useState(null);
  const [awaitingTransactionShortcut, setAwaitingTransactionShortcut] = useState(false);

  const masterOptions = [
    { label: 'M Option 1', value: 'MasterOption1' },
    { label: 'M Option 2', value: 'MasterOption2' },
    { label: 'M Option 3', value: 'MasterOption3' },
  ];

  const transactionOptions = [
    { label: 'Fabric Entry', value: 'FabricEntry' },
    { label: 'Cutting Entry', value: 'cuttingEntry' },
    { label: 'Work Entry', value: 'WorkEntry' },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        setActiveSection('Transaction');
        setAwaitingTransactionShortcut(true);
        return;
      }

      if (awaitingTransactionShortcut) {
        if (e.key === 'f' || e.key === 'F') {
          handleOpenTransactionForm('FabricEntry');
        } else if (e.key === 'c' || e.key === 'C') {
          handleOpenTransactionForm('cuttingEntry');
        } else if (e.key === 'w' || e.key === 'W') {
          handleOpenTransactionForm('WorkEntry');
        }
        setAwaitingTransactionShortcut(false);
        return;
      }

      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        setActiveSection('Master');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [awaitingTransactionShortcut]);

  const handleOpenTransactionForm = (formName) => {
    setOpenTransactionForms(prev =>
      prev.includes(formName) ? prev : [...prev, formName]
    );
    setActiveTransactionForm(formName);
    setShowTransactionDropdown(false);
  };

  const handleCloseTransactionForm = (formName) => {
    setOpenTransactionForms(prev => {
      const updated = prev.filter(f => f !== formName);
      setActiveTransactionForm(current => {
        if (current === formName) {
          return updated.length > 0 ? updated[updated.length - 1] : null;
        }
        return current;
      });
      return updated;
    });
  };

  return (
    <div className="bg-[#f1f2f4]">
      {/* Title Bar */}
      <div className="w-full bg-blue-300 text-[#234] font-bold text-lg px-4 h-16 flex items-center shadow-sm select-none">
        Swissfort Mfg.
      </div>
      
      {/* Menu Bar */}
      <div className="w-full bg-white flex items-center px-4 h-12 border-b border-gray-200 shadow-sm relative">
        {/* Master Dropdown */}
        <div
          className="relative mr-6"
          onMouseEnter={() => setShowMasterDropdown(true)}
          onMouseLeave={() => setShowMasterDropdown(false)}
        >
          <button
            className={`text-black font-normal text-base focus:outline-none hover:underline ${activeSection === 'Master' ? 'underline font-bold' : ''}`}
            onClick={() => setActiveSection('Master')}
            type="button"
          >
            Master
            <FiChevronDown className="inline ml-1" />
          </button>
          {showMasterDropdown && (
            <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 shadow-lg rounded z-10">
              {masterOptions.map(option => (
                <button
                  key={option.value}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
                  onClick={() => { setActiveSection('Master'); setShowMasterDropdown(false); }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Transaction Dropdown */}
        <div className="relative">
          <button
            className={`text-black font-normal text-base focus:outline-none hover:underline ${activeSection === 'Transaction' ? 'underline font-bold' : ''}`}
            onClick={() => {
              setActiveSection('Transaction');
              setShowTransactionDropdown(prev => !prev);
            }}
            type="button"
          >
            Transaction
            <FiChevronDown className="inline ml-1" />
          </button>
          {showTransactionDropdown && (
            <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 shadow-lg rounded z-10">
              {transactionOptions.map(option => (
                <button
                  key={option.value}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
                  onClick={() => handleOpenTransactionForm(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Transaction Sub-tabs Row */}
      {activeSection === 'Transaction' && openTransactionForms.length > 0 && (
        <div className="w-full bg-gray-100 flex items-center px-4 h-10 border-b border-gray-200">
          {openTransactionForms.map(formName => {
            const option = transactionOptions.find(opt => opt.value === formName);
            return (
              <button
                key={formName}
                className={`mr-2 px-3 py-1 rounded focus:outline-none text-base ${
                  activeTransactionForm === formName 
                    ? 'bg-gray-400 text-white font-bold' 
                    : 'text-gray-700 hover:bg-gray-400'
                }`}
                onClick={() => setActiveTransactionForm(formName)}
              >
                {option ? option.label.trim() : formName}
                <span
                  className="ml-2 text-white hover:text-red-500 cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    handleCloseTransactionForm(formName);
                  }}
                >
                  ×
                </span>
              </button>
            );
          })}
        </div>
      )}
      
      {/* Content Area */}
      <div className="w-full h-[calc(100vh-64px)] bg-[#f1f2f4] p-4">
        {activeSection === 'Transaction' && openTransactionForms.map(formName => (
          <div 
            key={formName} 
            className={`${activeTransactionForm === formName ? 'block' : 'hidden'}`}
          >
            {formName === 'FabricEntry' && (
              <FabricEntryFormModal 
                onClose={() => handleCloseTransactionForm('FabricEntry')}
                asModal={false}
              />
            )}
            {formName === 'cuttingEntry' && (
              <CuttingEntry 
                onClose={() => handleCloseTransactionForm('cuttingEntry')} 
              />
            )}
            {formName === 'WorkEntry' && (
              <WorkEntry 
                onClose={() => handleCloseTransactionForm('WorkEntry')} 
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FabricEntry;