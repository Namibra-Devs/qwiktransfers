import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates a professional PDF receipt for a transaction.
 * @param {Object} transaction - The transaction object from the database.
 * @param {string} systemName - The name of the system (e.g., QWIK Transfers).
 * @param {string} base64Logo - Optional base64 encoded logo image.
 */
export const generateReceiptPDF = async (transaction, systemName = 'QWIK TRANSFERS', base64Logo = null) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const primaryColor = [183, 71, 42]; // QT Primary Red/Brown
    const secondaryColor = [45, 26, 21]; // QT Deep Brown
    const lightGray = [245, 245, 245];

    // --- Header ---
    doc.setFillColor(...secondaryColor);
    doc.rect(0, 0, 210, 70, 'F'); // Increased height for both logo and name

    if (base64Logo) {
        try {
            // Center Logo: (210/2) - (40/2) = 85
            doc.addImage(base64Logo, 'PNG', 85, 5, 40, 40);
            
            // Restore System Name display
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text(systemName.toUpperCase(), 105, 52, { align: 'center' });
        } catch (e) {
            console.error("Logo failed to load:", e);
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text(systemName.toUpperCase(), 105, 35, { align: 'center' });
        }
    } else {
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(systemName.toUpperCase(), 105, 35, { align: 'center' });
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('OFFICIAL TRANSACTION RECEIPT', 105, 60, { align: 'center' });

    // Right-aligned receipt header info
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('Receipt No:', 150, 15);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${transaction.transaction_id || transaction.id}`, 150, 21);

    // --- Status Watermark (Drawn BEFORE table) ---
    const status = (transaction.status || 'PENDING').toUpperCase();
    doc.setFontSize(60);
    doc.setTextColor(220, 220, 220); 
    doc.saveGraphicsState();
    const gState = new doc.GState({ opacity: 0.25 });
    doc.setGState(gState);
    doc.text(status, 105, 170, { align: 'center', angle: 45 });
    doc.restoreGraphicsState();

    // --- Info Section ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLING TO:', 20, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(transaction.user?.full_name || 'Valued Customer', 20, 90);
    doc.text(transaction.user?.email || '', 20, 95);

    const isSent = status === 'SENT';
    doc.setFont('helvetica', 'bold');
    doc.text('INITIATED AT:', 140, 85);
    doc.setFont('helvetica', 'normal');
    const initiatedDate = transaction.createdAt;
    doc.text(new Date(initiatedDate).toLocaleDateString(), 140, 90);
    doc.text(new Date(initiatedDate).toLocaleTimeString(), 140, 95);

    // --- Transaction Breakdown Table ---
    const tableData = [
        ['Description', 'Details'],
        ['Transaction Type', `${transaction.type || 'Transfer'}`],
        ['Status', status],
        ['Amount Sent', `${transaction.amount_sent} ${transaction.type?.split('-')[0] || ''}`],
        ['Exchange Rate', `1 ${transaction.type?.split('-')[0]} = ${(transaction.amount_received / transaction.amount_sent).toFixed(4)} ${transaction.type?.split('-')[1]}`],
        ['Total Received', `${transaction.amount_received} ${transaction.type?.split('-')[1] || ''}`]
    ];

    doc.autoTable({
        startY: 110,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'plain', 
        headStyles: {
            fillColor: primaryColor,
            textColor: 255,
            fontSize: 11,
            fontStyle: 'bold'
        },
        bodyStyles: {
            fontSize: 10,
            cellPadding: 5,
            fillColor: null 
        },
        columnStyles: {
            0: { fontStyle: 'bold', width: 60 },
            1: { halign: 'right' }
        },
        margin: { left: 20, right: 20 },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1
    });

    const finalY = doc.lastAutoTable.finalY;

    // --- Recipient & Reference Details ---
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('DETAILS & REFERENCES', 20, finalY + 15);
    doc.setDrawColor(...lightGray);
    doc.line(20, finalY + 17, 190, finalY + 17);

    doc.setFont('helvetica', 'normal');
    const recipient = transaction.recipient_details || {};
    let recipientY = finalY + 25;

    const addDetail = (label, value, isHighlighted = false) => {
        if (value) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(`${label}:`, 20, recipientY);
            doc.setFont('helvetica', 'normal');
            if (isHighlighted) {
                doc.setTextColor(...primaryColor);
                doc.setFont('helvetica', 'bold');
            } else {
                doc.setTextColor(0, 0, 0);
            }
            doc.text(String(value), 70, recipientY);
            recipientY += 7;
            doc.setTextColor(0, 0, 0); // Reset
        }
    };

    addDetail('Recipient Name', recipient.name);
    addDetail('Bank/Provider', recipient.bank_name || recipient.provider || recipient.momo_provider);
    addDetail('Account/Phone', recipient.account_number || recipient.phone || recipient.account || recipient.momo_number);
    
    // Detailed Canadian fields
    if (recipient.transit_number) addDetail('Transit Number', recipient.transit_number);
    if (recipient.institution_number) addDetail('Institution Number', recipient.institution_number);
    if (recipient.interac_email) addDetail('Interac Email', recipient.interac_email);

    // References
    if (recipient.reference) addDetail('Payment Reference', recipient.reference);
    if (transaction.admin_reference || recipient.admin_reference) {
        addDetail('Admin Reference', transaction.admin_reference || recipient.admin_reference, true);
    }
    if (transaction.transaction_id) addDetail('QT Tracking ID', transaction.transaction_id);

    // Explicitly add Sent date to details if sent
    if (isSent) {
        const sentDate = transaction.sent_at || transaction.updatedAt;
        addDetail('Sent Date', new Date(sentDate).toLocaleString());
    }

    // Customer Note
    if (recipient.note) {
        recipientY += 3;
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Note:', 20, recipientY);
        recipientY += 6;
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        const splitNote = doc.splitTextToSize(`"${recipient.note}"`, 170);
        doc.text(splitNote, 20, recipientY);
    }

    // --- Footer ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, pageHeight - 30, 190, pageHeight - 30);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const bottomY = pageHeight - 20;
    doc.text('Thank you for choosing QWIK Transfers.', 105, bottomY, { align: 'center' });
    doc.text('This is a computer-generated receipt and does not require a signature.', 105, bottomY + 5, { align: 'center' });
    doc.text('Support: support@qwiktransfers.com | www.qwiktransfers.com', 105, bottomY + 10, { align: 'center' });

    // Save PDF
    doc.save(`QWIK-Receipt-${transaction.transaction_id || transaction.id}.pdf`);
};
