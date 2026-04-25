import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

const GST_RATES = [5, 12, 18, 28];

const GstCalculator = () => {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(18);
  const [type, setType] = useState('intra'); // intra = CGST+SGST, inter = IGST
  const [isInclusive, setIsInclusive] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;

  let baseAmount = parsedAmount;
  let gstAmount = 0;
  let totalAmount = 0;

  if (isInclusive) {
    baseAmount = parsedAmount / (1 + rate / 100);
    gstAmount = parsedAmount - baseAmount;
    totalAmount = parsedAmount;
  } else {
    baseAmount = parsedAmount;
    gstAmount = parsedAmount * (rate / 100);
    totalAmount = parsedAmount + gstAmount;
  }

  const cgst = type === 'intra' ? gstAmount / 2 : 0;
  const sgst = type === 'intra' ? gstAmount / 2 : 0;
  const igst = type === 'inter' ? gstAmount : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calculator className="text-blue-500" /> GST Quick Calculator
        </h1>
        <p className="text-sm text-gray-500 mt-1">Calculate GST amounts instantly.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8">
        
        {/* Input Section */}
        <div className="flex-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate</label>
            <div className="flex gap-2">
              {GST_RATES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRate(r)}
                  className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors border ${
                    rate === r ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Calculation Type</label>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setIsInclusive(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isInclusive ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Exclusive (Add GST)
              </button>
              <button
                onClick={() => setIsInclusive(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isInclusive ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Inclusive (Remove GST)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Place of Supply</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={type === 'intra'} onChange={() => setType('intra')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Intra-State (CGST + SGST)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={type === 'inter'} onChange={() => setType('inter')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Inter-State (IGST)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex-1 flex flex-col justify-center">
            <h3 className="text-gray-500 font-medium text-sm mb-4 uppercase tracking-wider text-center">Tax Breakdown</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Base Amount</span>
                <span className="font-semibold text-gray-800">₹{baseAmount.toFixed(2)}</span>
              </div>
              
              <div className="h-px bg-gray-200 w-full my-2"></div>
              
              {type === 'intra' ? (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">CGST ({(rate/2).toFixed(1)}%)</span>
                    <span className="font-semibold text-gray-800">₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">SGST ({(rate/2).toFixed(1)}%)</span>
                    <span className="font-semibold text-gray-800">₹{sgst.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">IGST ({rate}%)</span>
                  <span className="font-semibold text-gray-800">₹{igst.toFixed(2)}</span>
                </div>
              )}
              
              <div className="h-px bg-gray-200 w-full my-2"></div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-800 font-bold">Total Amount</span>
                <span className="text-xl font-bold text-blue-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GstCalculator;
