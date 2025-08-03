// Currency formatting utility for Taka (BDT)
export const formatTaka = (amount) => {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  
  // Format with BDT symbol and 2 decimal places
  return `BDT ${amount.toFixed(2)}`;
};

// Format large amounts with comma separators
export const formatTakaWithCommas = (amount) => {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  
  // Add comma separators for thousands
  const parts = amount.toFixed(2).toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return `BDT ${parts.join('.')}`;
};

// Format currency for display in tables
export const formatTakaCompact = (amount) => {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  
  return `BDT ${amount.toFixed(2)}`;
};

// Validate if amount is a valid Taka amount
export const isValidTakaAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0;
};

// Convert string amount to number
export const parseTakaAmount = (amount) => {
  if (typeof amount === 'number') return amount;
  
  // Remove BDT symbol and commas, then parse
  const cleanAmount = amount.toString().replace(/[BDT,\s]/g, '');
  const parsed = parseFloat(cleanAmount);
  
  return isNaN(parsed) ? 0 : parsed;
}; 