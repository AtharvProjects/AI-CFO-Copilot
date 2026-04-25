import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Send, FileDown, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const OutgoingInvoiceGenerator = () => {
  const [invoiceData, setInvoiceData] = useState({
    clientName: '',
    clientEmail: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: 'Thank you for your business!',
  });

  const [items, setItems] = useState([{ id: 1, description: '', quantity: 1, price: 0 }]);

  const addItem = () => setItems([...items, { id: Date.now(), description: '', quantity: 1, price: 0 }]);
  const removeItem = (id) => setItems(items.filter(item => item.id !== id));
  
  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateTotal = () => items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

  const generatePDF = (action = 'download') => {
    if (!invoiceData.clientName) return toast.error('Client name is required');
    if (items.some(i => !i.description)) return toast.error('All items must have a description');

    const doc = new jsPDF();
    const total = calculateTotal();
    
    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', 14, 22);
    doc.setFontSize(10);
    doc.text(`Date: ${invoiceData.date}`, 14, 30);
    if (invoiceData.dueDate) doc.text(`Due Date: ${invoiceData.dueDate}`, 14, 35);
    
    // Billed To
    doc.setFontSize(12);
    doc.text('Billed To:', 14, 50);
    doc.setFontSize(10);
    doc.text(invoiceData.clientName, 14, 56);
    if (invoiceData.clientEmail) doc.text(invoiceData.clientEmail, 14, 61);

    // Table
    const tableColumn = ["Description", "Qty", "Price", "Amount"];
    const tableRows = items.map(item => [
      item.description,
      item.quantity,
      `Rs. ${item.price.toFixed(2)}`,
      `Rs. ${(item.quantity * item.price).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Total
    const finalY = doc.lastAutoTable.finalY || 70;
    doc.setFontSize(12);
    doc.text(`Total Due: Rs. ${total.toFixed(2)}`, 14, finalY + 15);
    
    // Notes
    doc.setFontSize(10);
    doc.text('Notes:', 14, finalY + 30);
    doc.text(invoiceData.notes, 14, finalY + 36);

    // Payment Link (Simulated Stripe link)
    doc.setTextColor(59, 130, 246);
    doc.text('Click here to pay securely via Stripe', 14, finalY + 50);

    if (action === 'download') {
      doc.save(`Invoice_${invoiceData.clientName.replace(/\s+/g, '_')}.pdf`);
      toast.success('Invoice downloaded successfully!');
    } else {
      // Simulate Email Sending
      toast.promise(
        new Promise(resolve => setTimeout(resolve, 1500)),
        {
          loading: `Sending invoice to ${invoiceData.clientEmail}...`,
          success: 'Invoice emailed to client!',
          error: 'Failed to send'
        }
      );
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={invoiceData.clientName}
              onChange={e => setInvoiceData({...invoiceData, clientName: e.target.value})}
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={invoiceData.clientEmail}
              onChange={e => setInvoiceData({...invoiceData, clientEmail: e.target.value})}
              placeholder="billing@acme.com"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={invoiceData.date}
              onChange={e => setInvoiceData({...invoiceData, date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={invoiceData.dueDate}
              onChange={e => setInvoiceData({...invoiceData, dueDate: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Line Items</h3>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
              <div className="flex-1 w-full">
                <input 
                  type="text" 
                  placeholder="Description (e.g. Web Design Services)" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={item.description}
                  onChange={e => updateItem(item.id, 'description', e.target.value)}
                />
              </div>
              <div className="w-full sm:w-24">
                <input 
                  type="number" 
                  min="1"
                  placeholder="Qty" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={item.quantity}
                  onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                />
              </div>
              <div className="w-full sm:w-32">
                <input 
                  type="number" 
                  min="0"
                  placeholder="Price" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={item.price}
                  onChange={e => updateItem(item.id, 'price', Number(e.target.value))}
                />
              </div>
              <div className="w-full sm:w-24 px-2 py-2 text-right font-medium text-gray-700">
                ₹{(item.quantity * item.price).toFixed(2)}
              </div>
              {items.length > 1 && (
                <button onClick={() => removeItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button 
          onClick={addItem}
          className="mt-4 flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea 
            className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
            rows="2"
            value={invoiceData.notes}
            onChange={e => setInvoiceData({...invoiceData, notes: e.target.value})}
          />
        </div>
        <div className="w-full md:w-auto text-right">
          <div className="text-gray-500 mb-1">Total Amount</div>
          <div className="text-3xl font-bold text-gray-800 mb-4">₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div className="flex gap-3 justify-end">
            <button 
              onClick={() => generatePDF('download')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <FileDown size={18} /> Download PDF
            </button>
            <button 
              onClick={() => generatePDF('email')}
              disabled={!invoiceData.clientEmail}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Send size={18} /> Send to Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutgoingInvoiceGenerator;
