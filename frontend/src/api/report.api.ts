import apiClient from './client';

export const reportApi = {
  studentReport: (studentId: string) =>
    apiClient.get(`/reports/student/${studentId}`, { responseType: 'blob' }),

  financialReport: (studentId: string) =>
    apiClient.get(`/reports/finance/${studentId}`, { responseType: 'blob' }),

  adminSummary: () =>
    apiClient.get('/reports/admin/summary', { responseType: 'blob' }),
};

export function downloadPdf(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
