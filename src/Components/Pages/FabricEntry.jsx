import React, { useState, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import FabricEntryFormModal from './TransactionForms/FabricEntryFormModal';
import CuttingEntry from './TransactionForms/CuttingEntry';
import WorkEntry from './TransactionForms/WorkEntry';

function FabricEntry() {
const [activeSection, setActiveSection] = useState('Master');
  const [showMasterDropdown, setShowMasterDropdown] = useState(false);
  const [showTransactionDropdown, setShowTransactionDropdown] = useState(false);
  // Multi-tab state for Transaction forms
  const [openTransactionForms, setOpenTransactionForms] = useState([]); // array of values
  const [activeTransactionForm, setActiveTransactionForm] = useState(null);
  const [awaitingTransactionShortcut, setAwaitingTransactionShortcut] = useState(false);

  // Dynamic options for Master dropdown
  const masterOptions = [
    { label: 'M Option 1', value: 'MasterOption1' },
    { label: 'M Option 2', value: 'MasterOption2' },
    { label: 'M Option 3', value: 'MasterOption3' },
  ];

  // Dynamic options for Transaction dropdown
  const transactionOptions = [
    { label: 'Fabric Entry', value: 'FabricEntry' },
    { label: 'Cutting Entry', value: 'cuttingEntry' },
    { label: 'Work Entry', value: 'WorkEntry' },
  ];
  

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt+T pressed: wait for next key
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        setActiveSection('Transaction');
        setAwaitingTransactionShortcut(true);
        return;
      }

      if (awaitingTransactionShortcut) {
        if (e.key === 'f' || e.key === 'F') {
          setOpenTransactionForms((prev) =>
            prev.includes('FabricEntry') ? prev : [...prev, 'FabricEntry']
          );
          setActiveTransactionForm('FabricEntry');
        } else if (e.key === 'c' || e.key === 'C') {
          setOpenTransactionForms((prev) =>
            prev.includes('cuttingEntry') ? prev : [...prev, 'cuttingEntry']
          );
          setActiveTransactionForm('cuttingEntry');
        } else if (e.key === 'w' || e.key === 'W') {
          setOpenTransactionForms((prev) =>
            prev.includes('WorkEntry') ? prev : [...prev, 'WorkEntry']
          );
          setActiveTransactionForm('WorkEntry');
        }
        setAwaitingTransactionShortcut(false);
        return;
      }

      // Existing shortcut for Master
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        setActiveSection('Master');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [awaitingTransactionShortcut]);

  // // Modal component for popup forms
  // const Modal = ({ children, onClose }) => (
  //   <div className="fixed inset-0 top-35 flex items-center justify-center z-50 pointer-events-none">
  //     <div className="bg-white p-6 rounded shadow-lg min-w-[00px] relative pointer-events-auto">
  //       <button
  //         className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
  //         onClick={onClose}
  //       >
  //         ×
  //       </button>
  //       {children}
  //     </div>
  //   </div>
  // );

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
              setShowTransactionDropdown((prev) => !prev);
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
                  onClick={() => {
                    setActiveSection('Transaction');
                    setOpenTransactionForms(prev => prev.includes(option.value) ? prev : [...prev, option.value]);
                    setActiveTransactionForm(option.value);
                    setShowTransactionDropdown(false);
                  }}
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
          {openTransactionForms.map(value => {
            const option = transactionOptions.find(opt => opt.value === value);
            return (
              <button
                key={value}
                className={`mr-2 px-3 py-1 rounded focus:outline-none text-base ${activeTransactionForm === value ? 'bg-gray-400 text-white font-bold' : 'text-gray-700 hover:bg-gray-400'}`}
                onClick={() => setActiveTransactionForm(value)}
              >
                {option ? option.label.trim() : value}
                <span
                  className="ml-2 text-white hover:text-red-500 cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    setOpenTransactionForms(prev => prev.filter(f => f !== value));
                    if (activeTransactionForm === value) {
                      // Switch to the last tab if any remain
                      setTimeout(() => {
                        setActiveTransactionForm(prev => {
                          const remaining = openTransactionForms.filter(f => f !== value);
                          return remaining.length > 0 ? remaining[remaining.length - 1] : null;
                        });
                      }, 0);
                    }
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
        {activeSection === 'Transaction' && activeTransactionForm === 'FabricEntry' && (
          <FabricEntryFormModal onClose={() => {
            setOpenTransactionForms(prev => prev.filter(f => f !== 'FabricEntry'));
            setActiveTransactionForm(prev => {
              const remaining = openTransactionForms.filter(f => f !== 'FabricEntry');
              return remaining.length > 0 ? remaining[remaining.length - 1] : null;
            });
          }} />
        )}
        {activeSection === 'Transaction' && activeTransactionForm === 'cuttingEntry' && (
          <CuttingEntry onClose={() => {
            setOpenTransactionForms(prev => prev.filter(f => f !== 'cuttingEntry'));
            setActiveTransactionForm(prev => {
              const remaining = openTransactionForms.filter(f => f !== 'cuttingEntry');
              return remaining.length > 0 ? remaining[remaining.length - 1] : null;
            });
          }} />
        )}
        {activeSection === 'Transaction' && activeTransactionForm === 'WorkEntry' && (
          <WorkEntry onClose={() => {
            setOpenTransactionForms(prev => prev.filter(f => f !== 'WorkEntry'));
            setActiveTransactionForm(prev => {
              const remaining = openTransactionForms.filter(f => f !== 'WorkEntry');
              return remaining.length > 0 ? remaining[remaining.length - 1] : null;
            });
          }} />
        )}
      </div>
    </div>
  )
}


export default FabricEntry
