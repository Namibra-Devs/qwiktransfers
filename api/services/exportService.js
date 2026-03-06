const ExcelJS = require('exceljs');

const exportToExcel = async (data, columns, worksheetName = 'Report') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(worksheetName);

    worksheet.columns = columns;

    data.forEach(item => {
        worksheet.addRow(item);
    });

    // Formatting
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};

module.exports = { exportToExcel };
