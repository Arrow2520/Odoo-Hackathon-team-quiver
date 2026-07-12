export const exportToCSV = (data, columns, filename = 'export.csv') => {
  if (!data || data.length === 0) return;

  const csvRows = [];
  
  // Headers
  csvRows.push(columns.join(','));

  // Rows
  for (const row of data) {
    const values = columns.map(col => {
      const val = row[col] !== undefined && row[col] !== null ? row[col] : '';
      // Escape quotes and wrap in quotes if contains comma
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
