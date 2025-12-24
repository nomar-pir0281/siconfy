import * as XLSX from 'xlsx';

export const downloadBlob = (blob: Blob, filename: string) => {
    // Create URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;

    // Append to body - CRITICAL for some browsers (Firefox, some Chrome versions)
    // to respect the download attribute
    document.body.appendChild(a);

    // Trigger click using MouseEvent to bypass some AdBlockers/Pop-up blockers
    const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
    });
    a.dispatchEvent(clickEvent);

    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 2000); // 2 seconds timeout to ensure browser acknowledges the download
};

export const downloadExcel = (workbook: XLSX.WorkBook, filename: string) => {
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    // Correct MIME type for .xlsx to prevent 'safe browsing' renaming
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadBlob(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
};
