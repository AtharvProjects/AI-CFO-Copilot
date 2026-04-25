import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateCFOReport = (data) => {
  const { profile, kpis, topExpenses, gstCollected, aiSummary, period } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Clean the AI Summary (Remove AI "fluff" and fix Rupee symbol rendering)
  const cleanSummary = aiSummary
    .replace(/^(Here's|Here is|Below is) (a |the ).*?:\s*/i, '')
    .replace(/₹/g, 'INR ')
    .trim();

  // 2. Header & Branding (Symmetric & Balanced)
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANCIAL AUDIT REPORT', 20, 22); // Aligned with Date
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text(`${profile.business_name || 'SHARMA ELECTRONICS'}`, 20, 34); // Aligned with Period
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - 20, 22, { align: 'right' });
  doc.text(`PERIOD: ${period.month}/${period.year}`, pageWidth - 20, 34, { align: 'right' });

  // 3. AI Executive Insights Section
  let currentY = 60;
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AI EXECUTIVE INSIGHTS', 20, currentY);
  
  // Dynamic box for AI summary
  const splitSummary = doc.splitTextToSize(cleanSummary, pageWidth - 40);
  const summaryHeight = (splitSummary.length * 7) + 10;
  
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(20, currentY + 5, pageWidth - 40, summaryHeight, 2, 2, 'FD');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85); // Slate-600
  doc.text(splitSummary, 25, currentY + 15);
  
  currentY += summaryHeight + 25;

  // 4. Financial Performance (KPIs)
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CORE PERFORMANCE METRICS', 20, currentY);

  const kpiData = [
    ['Metric Description', 'Value (INR)'],
    ['Total Verified Income', `INR ${(kpis.income / 100).toLocaleString()}`],
    ['Total Operational Expense', `INR ${(kpis.expense / 100).toLocaleString()}`],
    ['Net Profitability', `INR ${(kpis.netProfit / 100).toLocaleString()}`],
    ['Total GST Liability', `INR ${(gstCollected / 100).toLocaleString()}`],
  ];

  autoTable(doc, {
    startY: currentY + 5,
    head: [kpiData[0]],
    body: kpiData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229], fontSize: 11, fontStyle: 'bold' },
    bodyStyles: { fontSize: 10, textColor: [51, 65, 85] },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    margin: { left: 20, right: 20 },
  });

  currentY = doc.lastAutoTable.finalY + 20;

  // 5. Top 5 Expenses
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOP EXPENDITURE CHANNELS', 20, currentY);

  const expenseData = topExpenses.map(item => [
    item.category.toUpperCase(),
    `INR ${(item.total / 100).toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Category', 'Total Allocation']],
    body: expenseData,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], fontSize: 11 },
    bodyStyles: { fontSize: 10 },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    margin: { left: 20, right: 20 },
  });

  // 6. Professional Footer
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('CONFIDENTIAL FINANCIAL REPORT', 20, pageHeight - 15);
  doc.text(`Page 1 of 1`, pageWidth - 20, pageHeight - 15, { align: 'right' });
  doc.text('Powered by AI CFO Copilot — Real-time Intelligence Engine', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save the PDF
  doc.save(`CFO_AUDIT_${period.month}_${period.year}.pdf`);
};
