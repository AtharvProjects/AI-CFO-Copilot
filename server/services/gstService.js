const gstService = {
  /**
   * Determine GST rate based on category
   */
  getRateForCategory(category) {
    const cat = category.toLowerCase();
    if (['food', 'transport'].includes(cat)) return 0.05;
    if (['salaries', 'tax'].includes(cat)) return 0;
    return 0.18; // Default to 18%
  },

  /**
   * Calculate CGST, SGST, IGST
   */
  calculateGST(amount, category, isSameState, manualRate) {
    const rate = manualRate !== undefined ? parseFloat(manualRate) : this.getRateForCategory(category);
    const taxAmount = amount * rate;
    
    if (rate === 0) {
      return { totalTax: 0, cgst: 0, sgst: 0, igst: 0, rate: 0 };
    }

    if (isSameState) {
      return {
        totalTax: taxAmount,
        cgst: taxAmount / 2,
        sgst: taxAmount / 2,
        igst: 0,
        rate
      };
    } else {
      return {
        totalTax: taxAmount,
        cgst: 0,
        sgst: 0,
        igst: taxAmount,
        rate
      };
    }
  },

  /**
   * Calculate next due dates for GSTR-1 and GSTR-3B
   */
  getNextDueDates() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let gstr1Date = new Date(currentYear, currentMonth, 11);
    let gstr3bDate = new Date(currentYear, currentMonth, 20);

    // If today is past the due date, roll over to next month
    if (today > gstr1Date) {
      gstr1Date = new Date(currentYear, currentMonth + 1, 11);
    }
    if (today > gstr3bDate) {
      gstr3bDate = new Date(currentYear, currentMonth + 1, 20);
    }

    return {
      GSTR1: gstr1Date,
      GSTR3B: gstr3bDate
    };
  }
};

module.exports = gstService;
