const supabase = require('./supabaseClient');

async function checkInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select('*');
    
  if (error) {
    console.error('Error fetching invoices:', error);
    return;
  }
  
  console.log('Invoices count:', data.length);
  data.forEach((inv, index) => {
    console.log(`[${index}] Vendor: ${inv.vendor}, Amount: ${inv.total}, Reference: ${inv.invoice_number}`);
  });
}

checkInvoices();
