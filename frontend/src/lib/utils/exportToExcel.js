/**
 * Utility to export datasets to CSV / Excel spreadsheet on the client side
 */

export function exportToCSV(data, fileName = 'export', columnMap = null) {
  if (!Array.isArray(data) || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  // 1. Determine columns and header labels
  const keys = columnMap ? Object.keys(columnMap) : Object.keys(data[0]);
  const headerLabels = columnMap ? Object.values(columnMap) : keys.map(formatHeaderLabel);

  // 2. Format row values
  const csvRows = [];
  csvRows.push(headerLabels.map(escapeCSVValue).join(','));

  data.forEach((item) => {
    const row = keys.map((key) => {
      let val = item[key];
      if (val === undefined || val === null) {
        val = '';
      } else if (val instanceof Date) {
        val = val.toLocaleString('en-IN');
      } else if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
        try {
          val = new Date(val).toLocaleString('en-IN');
        } catch {
          // keep original
        }
      } else if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      return escapeCSVValue(String(val));
    });
    csvRows.push(row.join(','));
  });

  // 3. Create blob with UTF-8 BOM so Excel opens Indian fonts and special characters correctly
  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // 4. Trigger download
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}-${formatTimestamp(new Date())}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSVValue(val) {
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return `"${val}"`;
}

function formatHeaderLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatTimestamp(date) {
  const d = date || new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export default exportToCSV;
