// CSV Export Utility Functions

/**
 * Escapes a CSV field value to handle commas, quotes, and newlines
 */
export function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return '';
  }
  
  const stringField = String(field);
  
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  
  return stringField;
}

/**
 * Converts array of data to properly formatted CSV string
 */
export function arrayToCSV(headers: string[], data: any[][]): string {
  const escapedHeaders = headers.map(escapeCSVField);
  const escapedData = data.map(row => row.map(escapeCSVField));
  
  return [escapedHeaders, ...escapedData]
    .map(row => row.join(','))
    .join('\n');
}

/**
 * Downloads CSV file
 */
export function downloadCSV(filename: string, csvContent: string): void {
  // Add BOM for proper Excel encoding (UTF-8)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Exports data to CSV file
 */
export function exportToCSV(filename: string, headers: string[], data: any[][]): void {
  const csv = arrayToCSV(headers, data);
  downloadCSV(filename, csv);
}

/**
 * Format date for CSV
 */
export function formatDateForCSV(date: string | Date | undefined | null): string {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '';
  }
}

/**
 * Format datetime for CSV
 */
export function formatDateTimeForCSV(date: string | Date | undefined | null): string {
  if (!date) return '';
  try {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}
