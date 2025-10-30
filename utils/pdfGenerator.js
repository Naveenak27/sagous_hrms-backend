import PDFDocument from 'pdfkit';
import moment from 'moment';
 export const generateSessionsPDF = async ({ employeeName, employeeCode, date, sessions }) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];
            
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);
            
            // PDF Header
            doc.fontSize(20).fillColor('#1a237e').text('WORK SESSIONS REPORT', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('#666666').text(`${employeeName} (${employeeCode})`, { align: 'center' });
            doc.fontSize(10).text(moment(date).format('DD MMMM YYYY, dddd'), { align: 'center' });
            doc.moveDown(2);
            
            // Table Header
            const tableTop = doc.y;
            const colWidths = { num: 50, login: 150, logout: 150, duration: 150 };
            const startX = 50;
            
            doc.fontSize(11).fillColor('#ffffff');
            doc.rect(startX, tableTop, colWidths.num + colWidths.login + colWidths.logout + colWidths.duration, 25)
               .fill('#1a237e');
            
            doc.fillColor('#ffffff')
               .text('#', startX + 10, tableTop + 8, { width: colWidths.num - 20, align: 'center' })
               .text('LOGIN', startX + colWidths.num + 10, tableTop + 8, { width: colWidths.login - 20, align: 'center' })
               .text('LOGOUT', startX + colWidths.num + colWidths.login + 10, tableTop + 8, { width: colWidths.logout - 20, align: 'center' })
               .text('DURATION', startX + colWidths.num + colWidths.login + colWidths.logout + 10, tableTop + 8, { width: colWidths.duration - 20, align: 'center' });
            
            // Table Rows
            let currentY = tableTop + 25;
            sessions.forEach((session, index) => {
                const bgColor = index % 2 === 0 ? '#ffffff' : '#f5f5f5';
                
                doc.rect(startX, currentY, colWidths.num + colWidths.login + colWidths.logout + colWidths.duration, 30)
                   .fill(bgColor);
                
                doc.fontSize(10)
                   .fillColor('#333333')
                   .text(index + 1, startX + 10, currentY + 10, { width: colWidths.num - 20, align: 'center' });
                
                doc.fillColor('#52c41a')
                   .text(session.in, startX + colWidths.num + 10, currentY + 10, { width: colWidths.login - 20, align: 'center' });
                
                doc.fillColor('#ff4d4f')
                   .text(session.out, startX + colWidths.num + colWidths.login + 10, currentY + 10, { width: colWidths.logout - 20, align: 'center' });
                
                doc.fillColor('#1a237e')
                   .text(session.duration, startX + colWidths.num + colWidths.login + colWidths.logout + 10, currentY + 10, { width: colWidths.duration - 20, align: 'center' });
                
                currentY += 30;
                
                // Add new page if needed
                if (currentY > 700 && index < sessions.length - 1) {
                    doc.addPage();
                    currentY = 50;
                }
            });
            
            // Footer
            doc.moveDown(2);
            doc.fontSize(8).fillColor('#999999')
               .text(`Generated: ${moment().format('DD MMM YYYY, hh:mm A')}`, { align: 'center' });
            
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

