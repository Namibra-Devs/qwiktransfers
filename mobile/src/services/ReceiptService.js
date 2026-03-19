import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import api from './api';

const PRIMARY_COLOR = '#B7472A';
const SECONDARY_COLOR = '#1E1B18';

export const generateReceiptPDF = async (transaction, systemName = 'QWIK TRANSFERS', logoBase64 = null) => {
    try {
        const recipient = transaction.recipient_details || {};
        const isSent = transaction.status === 'sent';
        const [fromCur, toCur] = (transaction.type || 'GHS-CAD').split('-');

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                <style>
                    body { font-family: 'Helvetica', sans-serif; color: ${SECONDARY_COLOR}; padding: 20px; }
                    .header { background-color: ${SECONDARY_COLOR}; color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .logo { height: 60px; margin-bottom: 10px; }
                    .system-name { font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 2px; }
                    
                    .content { padding: 40px 20px; position: relative; }
                    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 100px; color: rgba(0,0,0,0.05); font-weight: bold; z-index: -1; text-transform: uppercase; width: 100%; text-align: center; }
                    
                    .section { margin-bottom: 30px; }
                    .section-title { font-size: 14px; font-weight: bold; color: ${PRIMARY_COLOR}; text-transform: uppercase; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                    
                    .grid { display: flex; flex-wrap: wrap; margin-bottom: 20px; }
                    .grid-item { width: 50%; margin-bottom: 15px; }
                    .label { font-size: 12px; color: #666; margin-bottom: 4px; }
                    .value { font-size: 14px; font-weight: bold; color: ${SECONDARY_COLOR}; }
                    
                    .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    .table th { background-color: rgba(238, 238, 238, 0.5); text-align: left; padding: 12px; font-size: 12px; color: #444; }
                    .table td { padding: 12px; border-bottom: 1px solid #f5f5f5; font-size: 14px; }
                    .total-row { background-color: rgba(183, 71, 42, 0.05); }
                    
                    .footer { text-align: center; border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; font-size: 10px; color: #888; }
                </style>
            </head>
            <body>
                <div class="header">
                    ${logoBase64 ? `<img src="${logoBase64}" class="logo" />` : ''}
                    <h1 class="system-name">${systemName}</h1>
                </div>

                <div class="content">
                    <div class="watermark">${transaction.status}</div>

                    <div class="section">
                        <h2 class="section-title">Billing Information</h2>
                        <div class="grid">
                            <div class="grid-item">
                                <div class="label">TRANSACTION ID</div>
                                <div class="value">${transaction.transaction_id || `#${transaction.id}`}</div>
                            </div>
                            <div class="grid-item">
                                <div class="label">INITIATED AT</div>
                                <div class="value">${new Date(transaction.createdAt).toLocaleString()}</div>
                            </div>
                            <div class="grid-item">
                                <div class="label">SENDER</div>
                                <div class="value">${transaction.user?.full_name || 'Customer'}</div>
                            </div>
                            <div class="grid-item">
                                <div class="label">STATUS</div>
                                <div style="color: ${PRIMARY_COLOR}" class="value">${transaction.status.toUpperCase()}</div>
                            </div>
                        </div>

                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Transfer Amount (${fromCur})</td>
                                    <td>${parseFloat(transaction.amount_sent).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Exchange Rate</td>
                                    <td>1 ${fromCur} = ${(transaction.amount_received / transaction.amount_sent).toFixed(4)} ${toCur}</td>
                                </tr>
                                <tr class="total-row">
                                    <td style="font-weight: bold; color: ${PRIMARY_COLOR}">Recipient Receives (${toCur})</td>
                                    <td style="font-weight: bold; color: ${PRIMARY_COLOR}">${parseFloat(transaction.amount_received).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="section">
                        <h2 class="section-title">Recipient Details & References</h2>
                        <div class="grid">
                            <div class="grid-item">
                                <div class="label">RECIPIENT NAME</div>
                                <div class="value">${recipient.name || 'N/A'}</div>
                            </div>
                            <div class="grid-item">
                                <div class="label">BANK/PROVIDER</div>
                                <div class="value">${recipient.bank_name || recipient.provider || recipient.momo_provider || 'N/A'}</div>
                            </div>
                            <div class="grid-item">
                                <div class="label">ACCOUNT/PHONE</div>
                                <div class="value">${recipient.account || recipient.phone || recipient.momo_number || 'N/A'}</div>
                            </div>
                            ${recipient.transit_number ? `
                            <div class="grid-item">
                                <div class="label">TRANSIT NUMBER</div>
                                <div class="value">${recipient.transit_number}</div>
                            </div>` : ''}
                            ${recipient.institution_number ? `
                            <div class="grid-item">
                                <div class="label">INSTITUTION NUMBER</div>
                                <div class="value">${recipient.institution_number}</div>
                            </div>` : ''}
                            ${recipient.interac_email ? `
                            <div class="grid-item">
                                <div class="label">INTERAC EMAIL</div>
                                <div class="value">${recipient.interac_email}</div>
                            </div>` : ''}
                            <div class="grid-item">
                                <div class="label">PAYMENT REFERENCE</div>
                                <div class="value">${recipient.reference || 'N/A'}</div>
                            </div>
                            <div class="grid-item">
                                <div class="label" style="color: ${PRIMARY_COLOR}">ADMIN REFERENCE</div>
                                <div class="value" style="color: ${PRIMARY_COLOR}">${transaction.admin_reference || recipient.admin_reference || 'N/A'}</div>
                            </div>
                            ${isSent ? `
                            <div class="grid-item">
                                <div class="label">SENT DATE</div>
                                <div class="value">${new Date(transaction.sent_at || transaction.updatedAt).toLocaleString()}</div>
                            </div>` : ''}
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>Thank you for choosing ${systemName}.</p>
                    <p>This is a computer-generated receipt and does not require a signature.</p>
                </div>
            </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        
    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
    }
};
