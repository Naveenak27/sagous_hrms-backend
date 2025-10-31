// export const sendLeaveReminderEmailToHR = async (employeeData, leaveData, hrData, dayNumber) => {
//     try {
//         const sendSmtpEmail = new Brevo.SendSmtpEmail();

//         sendSmtpEmail.subject = `🔔 Reminder ${dayNumber}/3: Pending Leave Approval - ${employeeData.name}`;
//         sendSmtpEmail.to = [{ 
//             email: hrData.email, 
//             name: hrData.name 
//         }];
//         sendSmtpEmail.sender = { 
//             email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com', 
//             name: 'HR Management System' 
//         };
        
//         const pendingDays = Math.ceil((new Date() - new Date(leaveData.applied_date)) / (1000 * 60 * 60 * 24));
        
//         sendSmtpEmail.htmlContent = `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//                     .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//                     .header { background: #ff4d4f; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
//                     .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
//                     .details { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #ff4d4f; }
//                     .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
//                     .label { font-weight: bold; color: #666; }
//                     .value { color: #333; }
//                     .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
//                     .status-badge { display: inline-block; padding: 5px 15px; background: #ff4d4f; color: white; border-radius: 3px; font-weight: bold; }
//                     .urgent-notice { background: #fff1f0; border: 2px solid #ff4d4f; padding: 15px; margin: 20px 0; border-radius: 5px; }
//                     .reminder-badge { display: inline-block; padding: 8px 16px; background: #faad14; color: white; border-radius: 20px; font-weight: bold; margin: 10px 0; }
//                 </style>
//             </head>
//             <body>
//                 <div class="container">
//                     <div class="header">
//                         <h2>🔔 REMINDER - Pending Leave Approval Required</h2>
//                         <div class="reminder-badge">Reminder ${dayNumber} of 3</div>
//                     </div>
//                     <div class="content">
//                         <p>Dear <strong>${hrData.name}</strong>,</p>
                        
//                         <div class="urgent-notice">
//                             <strong>⚠️ Action Required:</strong> This leave application has been pending for <strong>${pendingDays} days</strong> without any action.
//                             Please review and take action as soon as possible.
//                         </div>
                        
//                         <p>Status: <span class="status-badge">PENDING APPROVAL</span></p>
                        
//                         <div class="details">
//                             <h3 style="margin-top: 0;">Employee Details</h3>
//                             <div class="details-row">
//                                 <span class="label">Employee Name:</span>
//                                 <span class="value">${employeeData.name}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Employee ID:</span>
//                                 <span class="value">${employeeData.employee_id}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Department:</span>
//                                 <span class="value">${employeeData.department_name || 'N/A'}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Designation:</span>
//                                 <span class="value">${employeeData.designation || 'N/A'}</span>
//                             </div>
//                         </div>

//                         <div class="details">
//                             <h3 style="margin-top: 0;">Leave Details</h3>
//                             <div class="details-row">
//                                 <span class="label">Leave Type:</span>
//                                 <span class="value">${leaveData.leave_name}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">From Date:</span>
//                                 <span class="value">${new Date(leaveData.from_date).toLocaleDateString('en-GB')}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">To Date:</span>
//                                 <span class="value">${new Date(leaveData.to_date).toLocaleDateString('en-GB')}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Number of Days:</span>
//                                 <span class="value">${leaveData.number_of_days}</span>
//                             </div>
//                             ${leaveData.is_half_day ? '<div class="details-row"><span class="label">Half Day:</span><span class="value">Yes</span></div>' : ''}
//                             <div class="details-row">
//                                 <span class="label">Reason:</span>
//                                 <span class="value">${leaveData.reason}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Applied On:</span>
//                                 <span class="value">${new Date(leaveData.applied_date).toLocaleDateString('en-GB')} ${new Date(leaveData.applied_date).toLocaleTimeString('en-GB')}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Pending Since:</span>
//                                 <span class="value" style="color: #ff4d4f; font-weight: bold;">${pendingDays} days</span>
//                             </div>
//                         </div>
                        
//                         <p><strong>Please login to the HR Management System to approve or reject this leave application.</strong></p>
                        
//                         ${dayNumber === 3 ? '<p style="color: #ff4d4f; font-weight: bold;">⚠️ This is the final reminder for this leave application.</p>' : ''}
//                     </div>
//                     <div class="footer">
//                         <p>This is an automated reminder email. Please do not reply to this message.</p>
//                         <p>&copy; ${new Date().getFullYear()} Sagous. All rights reserved.</p>
//                     </div>
//                 </div>
//             </body>
//             </html>
//         `;

//         const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
//         console.log(`Reminder ${dayNumber} email sent to HR successfully:`, result);
//         return { success: true, messageId: result.messageId };
//     } catch (error) {
//         console.error(`Error sending reminder ${dayNumber} email to HR:`, error);
//         return { success: false, error: error.message };
//     }
// };




// export const sendLeaveApplicationEmailToHR = async (employeeData, leaveData, hrData) => {
//     try {
//         const sendSmtpEmail = new Brevo.SendSmtpEmail();

//         sendSmtpEmail.subject = `New Leave Application - ${employeeData.name} (${leaveData.leave_name})`;
//         sendSmtpEmail.to = [{ 
//             email: hrData.email, 
//             name: hrData.name 
//         }];
//         sendSmtpEmail.sender = { 
//             email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com', 
//             name: 'HR Management System' 
//         };
        
//         sendSmtpEmail.htmlContent = `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//                     .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//                     .header { background: #1890ff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
//                     .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
//                     .details { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #1890ff; }
//                     .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
//                     .label { font-weight: bold; color: #666; }
//                     .value { color: #333; }
//                     .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
//                     .status-badge { display: inline-block; padding: 5px 15px; background: #faad14; color: white; border-radius: 3px; font-weight: bold; }
//                     .action-buttons { text-align: center; margin: 20px 0; }
//                     .button { display: inline-block; padding: 12px 30px; margin: 0 10px; text-decoration: none; border-radius: 4px; font-weight: bold; }
//                     .approve-btn { background: #52c41a; color: white; }
//                     .reject-btn { background: #ff4d4f; color: white; }
//                 </style>
//             </head>
//             <body>
//                 <div class="container">
//                     <div class="header">
//                         <h2>📋 New Leave Application</h2>
//                     </div>
//                     <div class="content">
//                         <p>Dear <strong>${hrData.name}</strong>,</p>
//                         <p>A new leave application has been submitted and requires your review.</p>
//                         <p>Status: <span class="status-badge">PENDING APPROVAL</span></p>
                        
//                         <div class="details">
//                             <h3 style="margin-top: 0;">Employee Details</h3>
//                             <div class="details-row">
//                                 <span class="label">Employee Name:</span>
//                                 <span class="value">${employeeData.name}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Employee ID:</span>
//                                 <span class="value">${employeeData.employee_id}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Department:</span>
//                                 <span class="value">${employeeData.department_name || 'N/A'}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Designation:</span>
//                                 <span class="value">${employeeData.designation || 'N/A'}</span>
//                             </div>
//                         </div>

//                         <div class="details">
//                             <h3 style="margin-top: 0;">Leave Details</h3>
//                             <div class="details-row">
//                                 <span class="label">Leave Type:</span>
//                                 <span class="value">${leaveData.leave_name}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">From Date:</span>
//                                 <span class="value">${new Date(leaveData.from_date).toLocaleDateString('en-GB')}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">To Date:</span>
//                                 <span class="value">${new Date(leaveData.to_date).toLocaleDateString('en-GB')}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Number of Days:</span>
//                                 <span class="value">${leaveData.number_of_days}</span>
//                             </div>
//                             ${leaveData.is_half_day ? '<div class="details-row"><span class="label">Half Day:</span><span class="value">Yes</span></div>' : ''}
//                             ${leaveData.od_start_time && leaveData.od_end_time ? `
//                             <div class="details-row">
//                                 <span class="label">OD Time:</span>
//                                 <span class="value">${leaveData.od_start_time} - ${leaveData.od_end_time} (${leaveData.od_hours} hours)</span>
//                             </div>
//                             ` : ''}
//                             <div class="details-row">
//                                 <span class="label">Reason:</span>
//                                 <span class="value">${leaveData.reason}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Applied On:</span>
//                                 <span class="value">${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}</span>
//                             </div>
//                         </div>
                        
//                         <p>Please login to the HR Management System to approve or reject this leave application.</p>
//                     </div>
//                     <div class="footer">
//                         <p>This is an automated email. Please do not reply to this message.</p>
//                         <p>&copy; ${new Date().getFullYear()} Sagous. All rights reserved.</p>
//                     </div>
//                 </div>
//             </body>
//             </html>
//         `;

//         const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
//         console.log('Leave application email sent to HR successfully:', result);
//         return { success: true, messageId: result.messageId };
//     } catch (error) {
//         console.error('Error sending leave application email to HR:', error);
//         return { success: false, error: error.message };
//     }
// };











// // Send Leave Approval Email
// export const sendLeaveApprovalEmail = async (employeeData, leaveData, approverData) => {
//     try {
//         const sendSmtpEmail = new Brevo.SendSmtpEmail();

//         sendSmtpEmail.subject = `Leave Approved - ${leaveData.leave_name}`;
//         sendSmtpEmail.to = [{ 
//             email: employeeData.email, 
//             name: employeeData.name 
//         }];
//         sendSmtpEmail.sender = { 
//             email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com', 
//             name: 'HR Management System' 
//         };
        
//         sendSmtpEmail.htmlContent = `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//                     .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//                     .header { background: #52c41a; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
//                     .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
//                     .details { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #52c41a; }
//                     .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
//                     .label { font-weight: bold; color: #666; }
//                     .value { color: #333; }
//                     .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
//                     .status-badge { display: inline-block; padding: 5px 15px; background: #52c41a; color: white; border-radius: 3px; font-weight: bold; }
//                 </style>
//             </head>
//             <body>
//                 <div class="container">
//                     <div class="header">
//                         <h2>✅ Leave Approved</h2>
//                     </div>
//                     <div class="content">
//                         <p>Dear <strong>${employeeData.name}</strong>,</p>
//                         <p>Your leave application has been <span class="status-badge">APPROVED</span></p>
                        
//                         <div class="details">
//                             <h3 style="margin-top: 0;">Leave Details</h3>
//                             <div class="details-row">
//                                 <span class="label">Leave Type:</span>
//                                 <span class="value">${leaveData.leave_name}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">From Date:</span>
//                                 <span class="value">${new Date(leaveData.from_date).toLocaleDateString('en-GB')}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">To Date:</span>
//                                 <span class="value">${new Date(leaveData.to_date).toLocaleDateString('en-GB')}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Number of Days:</span>
//                                 <span class="value">${leaveData.number_of_days}</span>
//                             </div>
//                             ${leaveData.is_half_day ? '<div class="details-row"><span class="label">Half Day:</span><span class="value">Yes</span></div>' : ''}
//                             <div class="details-row">
//                                 <span class="label">Approved By:</span>
//                                 <span class="value">${approverData.name}</span>
//                             </div>
//                             ${leaveData.approver_comments ? `
//                             <div class="details-row">
//                                 <span class="label">Comments:</span>
//                                 <span class="value">${leaveData.approver_comments}</span>
//                             </div>
//                             ` : ''}
//                         </div>
                        
//                         <p>Your leave has been approved and the balance has been updated accordingly.</p>
//                         <p>If you have any questions, please contact HR.</p>
//                     </div>
//                     <div class="footer">
//                         <p>This is an automated email. Please do not reply to this message.</p>
//                         <p>&copy; ${new Date().getFullYear()} Sagous. All rights reserved.</p>
//                     </div>
//                 </div>
//             </body>
//             </html>
//         `;

//         const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
//         console.log('Approval email sent successfully:', result);
//         return { success: true, messageId: result.messageId };
//     } catch (error) {
//         console.error('Error sending approval email:', error);
//         return { success: false, error: error.message };
//     }
// };
// export const sendBulkAnnouncement = async ({ subject, content, recipients, priority }) => {
//     const results = {
//         successCount: 0,
//         failedCount: 0,
//         details: []
//     };

//     // Brevo allows up to 1000 emails per batch
//     const batchSize = 1000;
//     const batches = [];

//     for (let i = 0; i < recipients.length; i += batchSize) {
//         batches.push(recipients.slice(i, i + batchSize));
//     }

//     for (const batch of batches) {
//         try {
//             // Using batch send for better performance
//             const sendSmtpEmail = new Brevo.SendSmtpEmail();
            
//             sendSmtpEmail.subject = subject;
//             sendSmtpEmail.sender = {
//                 email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com',
//                 name: 'HR Management System'
//             };
            
//             // Set recipients
//             sendSmtpEmail.to = batch.map(recipient => ({
//                 email: recipient.email,
//                 name: recipient.name
//             }));

//             // Create HTML content
//             sendSmtpEmail.htmlContent = createAnnouncementTemplate(content, subject, priority);

//             const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
            
//             results.successCount += batch.length;
//             results.details.push({
//                 batch: batches.indexOf(batch) + 1,
//                 count: batch.length,
//                 status: 'success',
//                 messageId: result.messageId
//             });

//             console.log(`Batch ${batches.indexOf(batch) + 1} sent successfully`);
//         } catch (error) {
//             console.error(`Error sending batch ${batches.indexOf(batch) + 1}:`, error);
//             results.failedCount += batch.length;
//             results.details.push({
//                 batch: batches.indexOf(batch) + 1,
//                 count: batch.length,
//                 status: 'failed',
//                 error: error.message
//             });
//         }
//     }

//     return results;
// };

// // Create announcement email template
// const createAnnouncementTemplate = (content, subject, priority) => {
//     const priorityColors = {
//         high: '#ff4d4f',
//         normal: '#1890ff',
//         low: '#52c41a'
//     };

//     const priorityLabels = {
//         high: '🔴 HIGH PRIORITY',
//         normal: '🔵 NORMAL',
//         low: '🟢 LOW PRIORITY'
//     };

//     return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <style>
//                 body {
//                     font-family: Arial, sans-serif;
//                     line-height: 1.6;
//                     color: #333;
//                     background: #f5f5f5;
//                 }
//                 .container {
//                     max-width: 600px;
//                     margin: 20px auto;
//                     background: white;
//                     border-radius: 8px;
//                     overflow: hidden;
//                     box-shadow: 0 2px 8px rgba(0,0,0,0.1);
//                 }
//                 .header {
//                     background: ${priorityColors[priority] || '#1890ff'};
//                     color: white;
//                     padding: 30px 20px;
//                     text-align: center;
//                 }
//                 .header h1 {
//                     margin: 0;
//                     font-size: 24px;
//                 }
//                 .priority-badge {
//                     display: inline-block;
//                     padding: 5px 15px;
//                     background: rgba(255,255,255,0.2);
//                     border-radius: 20px;
//                     font-size: 12px;
//                     margin-top: 10px;
//                     font-weight: bold;
//                 }
//                 .content {
//                     padding: 40px 30px;
//                     background: white;
//                 }
//                 .content p {
//                     margin: 0 0 15px 0;
//                     white-space: pre-wrap;
//                 }
//                 .announcement-icon {
//                     font-size: 48px;
//                     text-align: center;
//                     margin-bottom: 20px;
//                 }
//                 .footer {
//                     background: #f9f9f9;
//                     padding: 20px;
//                     text-align: center;
//                     color: #666;
//                     font-size: 12px;
//                     border-top: 1px solid #eee;
//                 }
//                 .divider {
//                     height: 1px;
//                     background: #e8e8e8;
//                     margin: 20px 0;
//                 }
//             </style>
//         </head>
//         <body>
//             <div class="container">
//                 <div class="header">
//                     <h1>📢 Company Announcement</h1>
//                     <div class="priority-badge">${priorityLabels[priority] || 'ANNOUNCEMENT'}</div>
//                 </div>
//                 <div class="content">
//                     <h2 style="color: #333; margin-top: 0;">${subject}</h2>
//                     <div class="divider"></div>
//                     <p>${content.replace(/\n/g, '<br>')}</p>
//                     <div class="divider"></div>
//                     <p style="color: #666; font-size: 14px;">
//                         <strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', {
//                             day: '2-digit',
//                             month: 'long',
//                             year: 'numeric'
//                         })}
//                     </p>
//                 </div>
//                 <div class="footer">
//                     <p>This is an automated announcement from HR Management System.</p>
//                     <p>Please do not reply to this email.</p>
//                     <p>&copy; ${new Date().getFullYear()} Sagous. All rights reserved.</p>
//                 </div>
//             </div>
//         </body>
//         </html>
//     `;
// };



// // Send Leave Rejection Email
// export const sendLeaveRejectionEmail = async (employeeData, leaveData, rejectorData) => {
//     try {
//         const sendSmtpEmail = new Brevo.SendSmtpEmail();

//         sendSmtpEmail.subject = `Leave Rejected - ${leaveData.leave_name}`;
//         sendSmtpEmail.to = [{ 
//             email: employeeData.email, 
//             name: employeeData.name 
//         }];
//         sendSmtpEmail.sender = { 
//             email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com', 
//             name: 'HR Management System' 
//         };
        
//         sendSmtpEmail.htmlContent = `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//                     .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//                     .header { background: #ff4d4f; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
//                     .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
//                     .details { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #ff4d4f; }
//                     .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
//                     .label { font-weight: bold; color: #666; }
//                     .value { color: #333; }
//                     .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
//                     .status-badge { display: inline-block; padding: 5px 15px; background: #ff4d4f; color: white; border-radius: 3px; font-weight: bold; }
//                     .reason-box { background: #fff2f0; border: 1px solid #ffccc7; padding: 15px; margin: 15px 0; border-radius: 4px; }
//                 </style>
//             </head>
//             <body>
//                 <div class="container">
//                     <div class="header">
//                         <h2>❌ Leave Rejected</h2>
//                     </div>
//                     <div class="content">
//                         <p>Dear <strong>${employeeData.name}</strong>,</p>
//                         <p>Your leave application has been <span class="status-badge">REJECTED</span></p>
                        
//                         <div class="details">
//                             <h3 style="margin-top: 0;">Leave Details</h3>
//                             <div class="details-row">
//                                 <span class="label">Leave Type:</span>
//                                 <span class="value">${leaveData.leave_name}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">From Date:</span>
//                                 <span class="value">${new Date(leaveData.from_date).toLocaleDateString('en-GB')}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">To Date:</span>
//                                 <span class="value">${new Date(leaveData.to_date).toLocaleDateString('en-GB')}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Number of Days:</span>
//                                 <span class="value">${leaveData.number_of_days}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Rejected By:</span>
//                                 <span class="value">${rejectorData.name}</span>
//                             </div>
//                         </div>
                        
//                         ${leaveData.rejection_reason ? `
//                         <div class="reason-box">
//                             <strong>Rejection Reason:</strong>
//                             <p style="margin: 10px 0 0 0;">${leaveData.rejection_reason}</p>
//                         </div>
//                         ` : ''}
                        
//                         <p>If you have any questions regarding this rejection, please contact ${rejectorData.name} or HR department.</p>
//                     </div>
//                     <div class="footer">
//                         <p>This is an automated email. Please do not reply to this message.</p>
//                         <p>&copy; ${new Date().getFullYear()} Sagous. All rights reserved.</p>
//                     </div>
//                 </div>
//             </body>
//             </html>
//         `;

//         const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
//         console.log('Rejection email sent successfully:', result);
//         return { success: true, messageId: result.messageId };
//     } catch (error) {
//         console.error('Error sending rejection email:', error);
//         return { success: false, error: error.message };
//     }
// };

// // Send Leave Application Notification to Approver
// export const sendLeaveApplicationNotification = async (approverData, employeeData, leaveData) => {
//     try {
//         const sendSmtpEmail = new Brevo.SendSmtpEmail();

//         sendSmtpEmail.subject = `New Leave Application - ${employeeData.name}`;
//         sendSmtpEmail.to = [{ 
//             email: approverData.email, 
//             name: approverData.name 
//         }];
//         sendSmtpEmail.sender = { 
//             email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com', 
//             name: 'HR Management System' 
//         };
        
//         sendSmtpEmail.htmlContent = `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//                     .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//                     .header { background: #1890ff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
//                     .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
//                     .details { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #1890ff; }
//                     .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
//                     .label { font-weight: bold; color: #666; }
//                     .value { color: #333; }
//                     .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
//                     .action-btn { display: inline-block; padding: 12px 30px; background: #1890ff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 5px; }
//                 </style>
//             </head>
//             <body>
//                 <div class="container">
//                     <div class="header">
//                         <h2>🔔 New Leave Application</h2>
//                     </div>
//                     <div class="content">
//                         <p>Dear <strong>${approverData.name}</strong>,</p>
//                         <p>A new leave application requires your approval.</p>
                        
//                         <div class="details">
//                             <h3 style="margin-top: 0;">Application Details</h3>
//                             <div class="details-row">
//                                 <span class="label">Employee:</span>
//                                 <span class="value">${employeeData.name}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Leave Type:</span>
//                                 <span class="value">${leaveData.leave_name}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">From Date:</span>
//                                 <span class="value">${new Date(leaveData.from_date).toLocaleDateString('en-GB')}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">To Date:</span>
//                                 <span class="value">${new Date(leaveData.to_date).toLocaleDateString('en-GB')}</span>
//                             </div>
//                             <div class="details-row">
//                                 <span class="label">Number of Days:</span>
//                                 <span class="value">${leaveData.number_of_days}</span>
//                             </div>
//                             ${leaveData.reason ? `
//                             <div class="details-row">
//                                 <span class="label">Reason:</span>
//                                 <span class="value">${leaveData.reason}</span>
//                             </div>
//                             ` : ''}
//                         </div>
                        
//                         <p style="text-align: center;">
//                             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/leave" class="action-btn">
//                                 Review Application
//                             </a>
//                         </p>
                        
//                         <p>Please review and take action on this leave application.</p>
//                     </div>
//                     <div class="footer">
//                         <p>This is an automated email. Please do not reply to this message.</p>
//                         <p>&copy; ${new Date().getFullYear()} Sagous. All rights reserved.</p>
//                     </div>
//                 </div>
//             </body>
//             </html>
//         `;

//         const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
//         console.log('Application notification sent successfully:', result);
//         return { success: true, messageId: result.messageId };
//     } catch (error) {
//         console.error('Error sending application notification:', error);
//         return { success: false, error: error.message };
//     }
// };
// import Brevo from '@getbrevo/brevo';
// import moment from 'moment';

// const apiInstance = new Brevo.TransactionalEmailsApi();
// apiInstance.setApiKey(
//     Brevo.TransactionalEmailsApiApiKeys.apiKey,
//     process.env.BREVO_API_KEY
// );

// export const sendIndividualAttendanceReport = async ({ 
//     employeeCode, employeeName, email, department, date,
//     firstLogin, lastLogout, netTime, grossTime, breakTime,
//     isEdited, editReason, totalLogins, totalLogouts,
//     allLoginTimes, allLogoutTimes, sessions
// }) => {
//     try {
//         const sessionsHTML = sessions && sessions.length > 0 ? `
//             <div style="margin-bottom: 25px;">
//                 <h4 style="color: #1565c0; margin-bottom: 15px;">⏱️ Work Sessions (Paired IN-OUT)</h4>
//                 <table style="width: 100%; border-collapse: collapse; border: 1px solid #e0e0e0;">
//                     <thead>
//                         <tr style="background-color: #e3f2fd; color: #1565c0;">
//                             <th style="padding: 10px; border: 1px solid #e0e0e0;">#</th>
//                             <th style="padding: 10px; border: 1px solid #e0e0e0;">Login</th>
//                             <th style="padding: 10px; border: 1px solid #e0e0e0;">Logout</th>
//                             <th style="padding: 10px; border: 1px solid #e0e0e0;">Duration</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${sessions.map((s, i) => `
//                             <tr>
//                                 <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: center;">${i + 1}</td>
//                                 <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: center; color: #2e7d32; font-weight: 500;">${s.in}</td>
//                                 <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: center; color: #c62828; font-weight: 500;">${s.out}</td>
//                                 <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: center; font-weight: bold;">${s.duration}</td>
//                             </tr>
//                         `).join('')}
//                     </tbody>
//                 </table>
//             </div>
//         ` : '';

//         const htmlContent = `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <title>Attendance Report</title>
//             </head>
//             <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
//                 <div style="max-width: 700px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
//                     <div style="border-bottom: 3px solid #1976d2; padding-bottom: 15px; margin-bottom: 25px;">
//                         <h2 style="color: #1565c0; margin: 0;">📋 Your Attendance Report</h2>
//                     </div>
                    
//                     <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
//                         <h3 style="margin: 0 0 15px 0;">Hello, ${employeeName}! 👋</h3>
//                         <p style="margin: 5px 0;"><strong>Code:</strong> ${employeeCode}</p>
//                         <p style="margin: 5px 0;"><strong>Department:</strong> ${department}</p>
//                         <p style="margin: 5px 0;"><strong>Date:</strong> ${moment(date).format('DD MMMM YYYY, dddd')}</p>
//                     </div>

//                     <!-- NET TIME (Active Work) -->
//                     <div style="background-color: #e8f5e9; padding: 25px; border-radius: 8px; margin-bottom: 15px; border-left: 5px solid #2e7d32; ${isEdited ? 'border: 2px solid #ff9800;' : ''}">
//                         <h3 style="margin: 0 0 15px 0; color: #2e7d32;">✅ Active Working Time (Net) ${isEdited ? '(Edited)' : ''}</h3>
//                         <div style="font-size: 42px; font-weight: bold; color: ${isEdited ? '#ff9800' : '#2e7d32'}; text-align: center;">
//                             ${netTime}
//                         </div>
//                         <p style="margin: 10px 0 0 0; text-align: center; color: #555; font-size: 13px;">
//                             Sum of all work sessions (excluding breaks)
//                         </p>
//                         ${isEdited && editReason ? `
//                         <div style="margin-top: 15px; padding: 10px; background-color: #fff3cd; border-radius: 4px;">
//                             <p style="margin: 0; color: #856404; font-size: 12px;"><strong>Reason:</strong> ${editReason}</p>
//                         </div>
//                         ` : ''}
//                     </div>

//                     <!-- GROSS TIME (Total Presence) -->
//                     <div style="background-color: #e3f2fd; padding: 25px; border-radius: 8px; margin-bottom: 15px; border-left: 5px solid #1976d2;">
//                         <h3 style="margin: 0 0 15px 0; color: #1976d2;">🕐 Total Presence Time (Gross)</h3>
//                         <div style="font-size: 42px; font-weight: bold; color: #1976d2; text-align: center;">
//                             ${grossTime}
//                         </div>
//                         <p style="margin: 10px 0 0 0; text-align: center; color: #555; font-size: 13px;">
//                             First login to last logout (including breaks)
//                         </p>
//                     </div>

//                     <!-- BREAK TIME -->
//                     <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 5px solid #ff9800; text-align: center;">
//                         <h4 style="margin: 0 0 10px 0; color: #f57c00;">☕ Total Break Time</h4>
//                         <div style="font-size: 28px; font-weight: bold; color: #f57c00;">
//                             ${breakTime}
//                         </div>
//                     </div>

//                     <div style="display: table; width: 100%; margin-bottom: 25px;">
//                         <div style="display: table-cell; width: 50%; padding: 15px; background-color: #e8f5e9; border-radius: 8px 0 0 8px;">
//                             <div style="text-align: center;">
//                                 <div style="font-size: 14px; color: #2e7d32; margin-bottom: 5px;">🟢 First Login</div>
//                                 <div style="font-size: 24px; font-weight: bold; color: #1b5e20;">${firstLogin}</div>
//                             </div>
//                         </div>
//                         <div style="display: table-cell; width: 50%; padding: 15px; background-color: #ffebee; border-radius: 0 8px 8px 0;">
//                             <div style="text-align: center;">
//                                 <div style="font-size: 14px; color: #c62828; margin-bottom: 5px;">🔴 Last Logout</div>
//                                 <div style="font-size: 24px; font-weight: bold; color: #b71c1c;">${lastLogout}</div>
//                             </div>
//                         </div>
//                     </div>

//                     ${sessionsHTML}

//                     <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 20px 0;">
//                         <p style="margin: 0; color: #856404; font-size: 13px;">
//                             <strong>📌 Understanding Your Times:</strong><br>
//                             • <strong>Net Time:</strong> Actual time you were actively working (sum of all sessions)<br>
//                             • <strong>Gross Time:</strong> Total time from first login to last logout (includes breaks)<br>
//                             • <strong>Break Time:</strong> Difference between gross and net time
//                         </p>
//                     </div>

//                     <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 2px solid #f0f0f0; padding-top: 20px;">
//                         <p style="margin: 5px 0;">© ${moment().format('YYYY')} HR Management System</p>
//                         <p style="margin: 5px 0;">Generated: ${moment().format('DD MMM YYYY, hh:mm A')}</p>
//                     </div>
//                 </div>
//             </body>
//             </html>
//         `;
        
//         const sendSmtpEmail = new Brevo.SendSmtpEmail();
//         sendSmtpEmail.subject = `Attendance Report - ${moment(date).format('DD MMM YYYY')}`;
//         sendSmtpEmail.htmlContent = htmlContent;
//         sendSmtpEmail.sender = { name: "HR System", email: process.env.SENDER_EMAIL };
//         sendSmtpEmail.to = [{ email }];

//         return await apiInstance.sendTransacEmail(sendSmtpEmail);
//     } catch (error) {
//         console.error(`Error sending to ${email}:`, error.message);
//         throw error;
//     }
// };

// export const sendAttendanceReport = async (reportData, recipients, reportDate) => {
//     try {
//         const tableRows = reportData.map(r => `
//             <tr>
//                 <td style="padding: 12px; border: 1px solid #e0e0e0;">${r.employee_code}</td>
//                 <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: center;">${r.in_time}</td>
//                 <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: center;">${r.out_time}</td>
//                 <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: center; font-weight: bold; color: #2e7d32;">${r.net_time}${r.is_edited ? ' ✏️' : ''}</td>
//                 <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: center; color: #1976d2;">${r.gross_time}</td>
//             </tr>
//         `).join('');

//         const htmlContent = `
//             <!DOCTYPE html>
//             <html>
//             <head><meta charset="UTF-8"><title>HR Report</title></head>
//             <body style="font-family: Arial; background: #f5f5f5; padding: 20px;">
//                 <div style="max-width: 1100px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
//                     <h2 style="color: #1565c0; border-bottom: 3px solid #1976d2; padding-bottom: 15px;">
//                         📊 Attendance Report - ${moment(reportDate).format('DD MMMM YYYY')}
//                     </h2>
//                     <p style="color: #666; margin: 20px 0;">
//                         Total: ${reportData.length} | Edited: ${reportData.filter(r => r.is_edited).length}
//                     </p>
//                     <table style="width: 100%; border-collapse: collapse; border: 1px solid #e0e0e0;">
//                         <thead>
//                             <tr style="background: #1976d2; color: white;">
//                                 <th style="padding: 14px; border: 1px solid #e0e0e0;">Code</th>
//                                 <th style="padding: 14px; border: 1px solid #e0e0e0;">First In</th>
//                                 <th style="padding: 14px; border: 1px solid #e0e0e0;">Last Out</th>
//                                 <th style="padding: 14px; border: 1px solid #e0e0e0;">Net (Active)</th>
//                                 <th style="padding: 14px; border: 1px solid #e0e0e0;">Gross (Total)</th>
//                             </tr>
//                         </thead>
//                         <tbody>${tableRows}</tbody>
//                     </table>
//                     <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 4px;">
//                         <p style="margin: 0; font-size: 13px; color: #1565c0;">
//                             <strong>Net:</strong> Active work time (sum of sessions) | <strong>Gross:</strong> Total presence (first→last) | ✏️ = HR edited
//                         </p>
//                     </div>
//                 </div>
//             </body>
//             </html>
//         `;
        
//         const sendSmtpEmail = new Brevo.SendSmtpEmail();
//         sendSmtpEmail.subject = `Attendance Report - ${moment(reportDate).format('DD MMM YYYY')}`;
//         sendSmtpEmail.htmlContent = htmlContent;
//         sendSmtpEmail.sender = { name: "HR System", email: process.env.SENDER_EMAIL };
//         sendSmtpEmail.to = recipients.map(e => ({ email: e }));

//         return await apiInstance.sendTransacEmail(sendSmtpEmail);
//     } catch (error) {
//         console.error('Error:', error.message);
//         throw error;
//     }
// };


import Brevo from '@getbrevo/brevo';
import moment from 'moment';



const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

// 1. LEAVE REMINDER EMAIL TO HR
export const sendLeaveReminderEmailToHR = async (employeeData, leaveData, hrData, dayNumber) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        const pendingDays = Math.ceil((new Date() - new Date(leaveData.applied_date)) / (1000 * 60 * 60 * 24));

        sendSmtpEmail.subject = `🔔 Reminder ${dayNumber}/3: Pending Leave Approval - ${employeeData.name}`;
        sendSmtpEmail.to = [{ email: hrData.email, name: hrData.name }];
        sendSmtpEmail.sender = { 
            email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com', 
            name: 'HR Management System' 
        };
        
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <!--[if gte mso 9]>
                <xml>
                    <o:OfficeDocumentSettings>
                        <o:AllowPNG/>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
            </head>
            <body style="margin: 0; padding: 0;">
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #ffffff;">
                    
                    <!-- Modern Header with Blue Gradient -->
                    <div style="background: #1a237e; padding: 60px 40px; text-align: center; position: relative;">
                        <!--[if gte mso 9]>
                        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px; height:220px;">
                            <v:fill type="gradient" color="#0a0a0a" color2="#0d47a1" angle="135" />
                            <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                            <div style="padding: 60px 40px; text-align: center;">
                        <![endif]-->
                        
                        <div style="width: 100px; height: 4px; background: #00d4ff; margin: 0 auto 30px;"></div>
                        <h1 style="color: #ffffff; margin: 0 0 12px; font-size: 42px; font-weight: 800; letter-spacing: -1px; line-height: 1.2;">LEAVE REMINDER</h1>
                        <p style="color: #00d4ff; margin: 0; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; font-weight: 600;">Reminder ${dayNumber} of 3</p>
                        
                        <!--[if gte mso 9]>
                            </div>
                            </v:textbox>
                        </v:rect>
                        <![endif]-->
                    </div>

                    <!-- Main Content Area -->
                    <div style="padding: 50px 45px; background: #ffffff;">
                        
                        <p style="color: #1a1a1a; margin: 0 0 28px; line-height: 1.7; font-size: 16px;">Dear <strong>${hrData.name}</strong>,</p>
                        
                        <!-- Urgent Notice Box -->
                        <div style="margin: 40px 0; padding: 36px; background: #1a237e; position: relative;">
                            <!--[if gte mso 9]>
                            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:590px;">
                                <v:fill type="gradient" color="#0a0a0a" color2="#0d47a1" angle="135" />
                                <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                                <div style="padding: 36px;">
                            <![endif]-->
                            
                            <div style="width: 100px; height: 4px; background: #00d4ff; margin: 0 0 24px 0;"></div>
                            <h3 style="color: #ffffff; margin: 0 0 24px; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">⚠️ ACTION REQUIRED</h3>
                            <p style="color: #00d4ff; margin: 0; font-size: 16px; line-height: 1.6;">
                                This leave application has been pending for <strong>${pendingDays} days</strong> without any action. Please review and take action as soon as possible.
                            </p>
                            
                            <!--[if gte mso 9]>
                                </div>
                                </v:textbox>
                            </v:rect>
                            <![endif]-->
                        </div>

                        <!-- Employee Details -->
                        <div style="margin: 40px 0;">
                            <h3 style="color: #0a0a0a; margin: 0 0 24px; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">Employee Details</h3>
                            
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                                <tr>
                                    <td style="padding: 20px; background: #f8f8f8; border-left: 4px solid #0090ff; vertical-align: top;">
                                        <p style="color: #0a0a0a; margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Employee Name</p>
                                        <p style="color: #4a4a4a; margin: 0; font-size: 14px; line-height: 1.6;">${employeeData.name}</p>
                                    </td>
                                </tr>
                            </table>

                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                                <tr>
                                    <td style="padding: 20px; background: #f8f8f8; border-left: 4px solid #00d4ff; vertical-align: top;">
                                        <p style="color: #0a0a0a; margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Employee ID</p>
                                        <p style="color: #4a4a4a; margin: 0; font-size: 14px; line-height: 1.6;">${employeeData.employee_id}</p>
                                    </td>
                                </tr>
                            </table>

                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                                <tr>
                                    <td style="padding: 20px; background: #f8f8f8; border-left: 4px solid #0051ff; vertical-align: top;">
                                        <p style="color: #0a0a0a; margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Department</p>
                                        <p style="color: #4a4a4a; margin: 0; font-size: 14px; line-height: 1.6;">${employeeData.department_name || 'N/A'}</p>
                                    </td>
                                </tr>
                            </table>

                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                                <tr>
                                    <td style="padding: 20px; background: #f8f8f8; border-left: 4px solid #0090ff; vertical-align: top;">
                                        <p style="color: #0a0a0a; margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Designation</p>
                                        <p style="color: #4a4a4a; margin: 0; font-size: 14px; line-height: 1.6;">${employeeData.designation || 'N/A'}</p>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- Leave Details -->
                        <div style="margin: 50px 0;">
                            <h3 style="color: #0a0a0a; margin: 0 0 30px; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">Leave Details</h3>
                            
                            <div style="margin-bottom: 24px; border: 2px solid #0a0a0a; padding: 32px; position: relative;">
                                <div style="width: 80px; height: 4px; background: #00d4ff; margin: 0 0 20px 0;"></div>
                                
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>Leave Type:</strong> ${leaveData.leave_name}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>From Date:</strong> ${new Date(leaveData.from_date).toLocaleDateString('en-GB')}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>To Date:</strong> ${new Date(leaveData.to_date).toLocaleDateString('en-GB')}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>Number of Days:</strong> ${leaveData.number_of_days}
                                </p>
                                ${leaveData.is_half_day ? '<p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;"><strong>Half Day:</strong> Yes</p>' : ''}
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>Reason:</strong> ${leaveData.reason}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>Applied On:</strong> ${new Date(leaveData.applied_date).toLocaleDateString('en-GB')} ${new Date(leaveData.applied_date).toLocaleTimeString('en-GB')}
                                </p>
                                <p style="color: #ff4d4f; margin: 0; font-size: 14px; line-height: 1.7; font-weight: bold;">
                                    <strong>Pending Since:</strong> ${pendingDays} days
                                </p>
                            </div>
                        </div>
                        
                        <p style="color: #1a1a1a; margin: 40px 0 32px; line-height: 1.7; font-size: 16px;">
                            <strong>Please login to the HR Management System to approve or reject this leave application.</strong>
                        </p>
                        
                        ${dayNumber === 3 ? '<p style="color: #ff4d4f; font-weight: bold; font-size: 16px; margin: 20px 0;">⚠️ This is the final reminder for this leave application.</p>' : ''}

                    </div>

                    <!-- Modern Footer with Blue Gradient -->
                    <div style="background: #1a237e; padding: 28px 40px; text-align: center;">
                        <!--[if gte mso 9]>
                        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px; height:100px;">
                            <v:fill type="gradient" color="#0a0a0a" color2="#0d47a1" angle="135" />
                            <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                            <div style="padding: 28px 40px; text-align: center;">
                        <![endif]-->
                        
                        <div style="width: 60px; height: 2px; background: #00d4ff; margin: 0 auto 16px;"></div>
                        <p style="color: #e0e0e0; font-size: 11px; margin: 0 0 8px; letter-spacing: 1px;">This is an automated reminder email. Please do not reply to this message.</p>
                        <p style="color: #999999; font-size: 11px; margin: 0; letter-spacing: 0.5px;">
                            &copy; ${new Date().getFullYear()} Sagous. All rights reserved.
                        </p>
                        
                        <!--[if gte mso 9]>
                            </div>
                            </v:textbox>
                        </v:rect>
                        <![endif]-->
                    </div>

                </div>
            </body>
            </html>
        `;

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Reminder ${dayNumber} email sent to HR successfully:`, result);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error(`Error sending reminder ${dayNumber} email to HR:`, error);
        return { success: false, error: error.message };
    }
};

// 2. LEAVE APPLICATION EMAIL TO HR
export const sendLeaveApplicationEmailToHR = async (employeeData, leaveData, hrData) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.subject = `New Leave Application - ${employeeData.name} (${leaveData.leave_name})`;
        sendSmtpEmail.to = [{ email: hrData.email, name: hrData.name }];
        sendSmtpEmail.sender = { 
            email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com', 
            name: 'HR Management System' 
        };
        
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <!--[if gte mso 9]>
                <xml>
                    <o:OfficeDocumentSettings>
                        <o:AllowPNG/>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
            </head>
            <body style="margin: 0; padding: 0;">
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #ffffff;">
                    
                    <!-- Modern Header with Blue Gradient -->
                    <div style="background: #1a237e; padding: 60px 40px; text-align: center; position: relative;">
                        <!--[if gte mso 9]>
                        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px; height:220px;">
                            <v:fill type="gradient" color="#0a0a0a" color2="#0d47a1" angle="135" />
                            <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                            <div style="padding: 60px 40px; text-align: center;">
                        <![endif]-->
                        
                        <div style="width: 100px; height: 4px; background: #00d4ff; margin: 0 auto 30px;"></div>
                        <h1 style="color: #ffffff; margin: 0 0 12px; font-size: 42px; font-weight: 800; letter-spacing: -1px; line-height: 1.2;">NEW APPLICATION</h1>
                        <p style="color: #00d4ff; margin: 0; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; font-weight: 600;">Leave Approval Required</p>
                        
                        <!--[if gte mso 9]>
                            </div>
                            </v:textbox>
                        </v:rect>
                        <![endif]-->
                    </div>

                    <!-- Main Content Area -->
                    <div style="padding: 50px 45px; background: #ffffff;">
                        
                        <p style="color: #1a1a1a; margin: 0 0 28px; line-height: 1.7; font-size: 16px;">Dear <strong>${hrData.name}</strong>,</p>
                        
                        <p style="color: #1a1a1a; margin: 0 0 28px; line-height: 1.7; font-size: 16px;">
                            A new leave application has been submitted and requires your review.
                        </p>

                        <!-- Employee Details -->
                        <div style="margin: 40px 0;">
                            <h3 style="color: #0a0a0a; margin: 0 0 24px; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">Employee Details</h3>
                            
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                                <tr>
                                    <td style="padding: 20px; background: #f8f8f8; border-left: 4px solid #0090ff; vertical-align: top;">
                                        <p style="color: #0a0a0a; margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Employee Name</p>
                                        <p style="color: #4a4a4a; margin: 0; font-size: 14px; line-height: 1.6;">${employeeData.name}</p>
                                    </td>
                                </tr>
                            </table>

                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                                <tr>
                                    <td style="padding: 20px; background: #f8f8f8; border-left: 4px solid #00d4ff; vertical-align: top;">
                                        <p style="color: #0a0a0a; margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Employee ID</p>
                                        <p style="color: #4a4a4a; margin: 0; font-size: 14px; line-height: 1.6;">${employeeData.employee_id}</p>
                                    </td>
                                </tr>
                            </table>

                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                                <tr>
                                    <td style="padding: 20px; background: #f8f8f8; border-left: 4px solid #0051ff; vertical-align: top;">
                                        <p style="color: #0a0a0a; margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Department</p>
                                        <p style="color: #4a4a4a; margin: 0; font-size: 14px; line-height: 1.6;">${employeeData.department_name || 'N/A'}</p>
                                    </td>
                                </tr>
                            </table>

                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                                <tr>
                                    <td style="padding: 20px; background: #f8f8f8; border-left: 4px solid #0090ff; vertical-align: top;">
                                        <p style="color: #0a0a0a; margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Designation</p>
                                        <p style="color: #4a4a4a; margin: 0; font-size: 14px; line-height: 1.6;">${employeeData.designation || 'N/A'}</p>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- Leave Details -->
                        <div style="margin: 50px 0;">
                            <h3 style="color: #0a0a0a; margin: 0 0 30px; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">Leave Details</h3>
                            
                            <div style="margin-bottom: 24px; border: 2px solid #0a0a0a; padding: 32px; position: relative;">
                                <div style="width: 80px; height: 4px; background: #00d4ff; margin: 0 0 20px 0;"></div>
                                
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>Leave Type:</strong> ${leaveData.leave_name}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>From Date:</strong> ${new Date(leaveData.from_date).toLocaleDateString('en-GB')}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>To Date:</strong> ${new Date(leaveData.to_date).toLocaleDateString('en-GB')}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>Number of Days:</strong> ${leaveData.number_of_days}
                                </p>
                                ${leaveData.is_half_day ? '<p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;"><strong>Half Day:</strong> Yes</p>' : ''}
                                ${leaveData.od_start_time && leaveData.od_end_time ? `
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>OD Time:</strong> ${leaveData.od_start_time} - ${leaveData.od_end_time} (${leaveData.od_hours} hours)
                                </p>
                                ` : ''}
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>Reason:</strong> ${leaveData.reason}
                                </p>
                                <p style="color: #1a1a1a; margin: 0; font-size: 14px; line-height: 1.7;">
                                    <strong>Applied On:</strong> ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}
                                </p>
                            </div>
                        </div>
                        
                        <p style="color: #1a1a1a; margin: 40px 0 32px; line-height: 1.7; font-size: 16px;">
                            Please login to the HR Management System to approve or reject this leave application.
                        </p>

                    </div>

                    <!-- Modern Footer with Blue Gradient -->
                    <div style="background: #1a237e; padding: 28px 40px; text-align: center;">
                        <!--[if gte mso 9]>
                        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px; height:100px;">
                            <v:fill type="gradient" color="#0a0a0a" color2="#0d47a1" angle="135" />
                            <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                            <div style="padding: 28px 40px; text-align: center;">
                        <![endif]-->
                        
                        <div style="width: 60px; height: 2px; background: #00d4ff; margin: 0 auto 16px;"></div>
                        <p style="color: #e0e0e0; font-size: 11px; margin: 0 0 8px; letter-spacing: 1px;">This is an automated email. Please do not reply to this message.</p>
                        <p style="color: #999999; font-size: 11px; margin: 0; letter-spacing: 0.5px;">
                            &copy; ${new Date().getFullYear()} Sagous. All rights reserved.
                        </p>
                        
                        <!--[if gte mso 9]>
                            </div>
                            </v:textbox>
                        </v:rect>
                        <![endif]-->
                    </div>

                </div>
            </body>
            </html>
        `;

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Leave application email sent to HR successfully:', result);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending leave application email to HR:', error);
        return { success: false, error: error.message };
    }
};

// 3. LEAVE APPROVAL EMAIL
export const sendLeaveApprovalEmail = async (employeeData, leaveData, approverData) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.subject = `Leave Approved - ${leaveData.leave_name}`;
        sendSmtpEmail.to = [{ email: employeeData.email, name: employeeData.name }];
        sendSmtpEmail.sender = { 
            email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com', 
            name: 'HR Management System' 
        };
        
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <!--[if gte mso 9]>
                <xml>
                    <o:OfficeDocumentSettings>
                        <o:AllowPNG/>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
            </head>
            <body style="margin: 0; padding: 0;">
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #ffffff;">
                    
                    <!-- Modern Header with Blue Gradient -->
                    <div style="background: #1a237e; padding: 60px 40px; text-align: center; position: relative;">
                        <!--[if gte mso 9]>
                        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px; height:220px;">
                            <v:fill type="gradient" color="#0a0a0a" color2="#0d47a1" angle="135" />
                            <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                            <div style="padding: 60px 40px; text-align: center;">
                        <![endif]-->
                        
                        <div style="width: 100px; height: 4px; background: #00d4ff; margin: 0 auto 30px;"></div>
                        <h1 style="color: #ffffff; margin: 0 0 12px; font-size: 42px; font-weight: 800; letter-spacing: -1px; line-height: 1.2;">✅ APPROVED</h1>
                        <p style="color: #00d4ff; margin: 0; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; font-weight: 600;">Your Leave Has Been Approved</p>
                        
                        <!--[if gte mso 9]>
                            </div>
                            </v:textbox>
                        </v:rect>
                        <![endif]-->
                    </div>

                    <!-- Main Content Area -->
                    <div style="padding: 50px 45px; background: #ffffff;">
                        
                        <p style="color: #1a1a1a; margin: 0 0 28px; line-height: 1.7; font-size: 16px;">Dear <strong>${employeeData.name}</strong>,</p>
                        
                        <p style="color: #1a1a1a; margin: 0 0 28px; line-height: 1.7; font-size: 16px;">
                            Good news! Your leave application has been <strong style="color: #52c41a;">APPROVED</strong>.
                        </p>

                        <!-- Leave Details -->
                        <div style="margin: 50px 0;">
                            <h3 style="color: #0a0a0a; margin: 0 0 30px; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">Leave Details</h3>
                            
                            <div style="margin-bottom: 24px; border: 2px solid #52c41a; padding: 32px; position: relative; background: #f6ffed;">
                                <div style="width: 80px; height: 4px; background: #52c41a; margin: 0 0 20px 0;"></div>
                                
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>Leave Type:</strong> ${leaveData.leave_name}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>From Date:</strong> ${new Date(leaveData.from_date).toLocaleDateString('en-GB')}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>To Date:</strong> ${new Date(leaveData.to_date).toLocaleDateString('en-GB')}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>Number of Days:</strong> ${leaveData.number_of_days}
                                </p>
                                ${leaveData.is_half_day ? '<p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;"><strong>Half Day:</strong> Yes</p>' : ''}
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>Approved By:</strong> ${approverData.name}
                                </p>
                                ${leaveData.approver_comments ? `
                                <p style="color: #1a1a1a; margin: 0; font-size: 14px; line-height: 1.7;">
                                    <strong>Comments:</strong> ${leaveData.approver_comments}
                                </p>
                                ` : ''}
                            </div>
                        </div>
                        
                        <p style="color: #1a1a1a; margin: 40px 0 32px; line-height: 1.7; font-size: 16px;">
                            Your leave has been approved and the balance has been updated accordingly. If you have any questions, please contact HR.
                        </p>

                    </div>

                    <!-- Modern Footer with Blue Gradient -->
                    <div style="background: #1a237e; padding: 28px 40px; text-align: center;">
                        <!--[if gte mso 9]>
                        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px; height:100px;">
                            <v:fill type="gradient" color="#0a0a0a" color2="#0d47a1" angle="135" />
                            <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                            <div style="padding: 28px 40px; text-align: center;">
                        <![endif]-->
                        
                        <div style="width: 60px; height: 2px; background: #00d4ff; margin: 0 auto 16px;"></div>
                        <p style="color: #e0e0e0; font-size: 11px; margin: 0 0 8px; letter-spacing: 1px;">This is an automated email. Please do not reply to this message.</p>
                        <p style="color: #999999; font-size: 11px; margin: 0; letter-spacing: 0.5px;">
                            &copy; ${new Date().getFullYear()} Sagous. All rights reserved.
                        </p>
                        
                        <!--[if gte mso 9]>
                            </div>
                            </v:textbox>
                        </v:rect>
                        <![endif]-->
                    </div>

                </div>
            </body>
            </html>
        `;

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Approval email sent successfully:', result);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending approval email:', error);
        return { success: false, error: error.message };
    }
};

// 4. LEAVE REJECTION EMAIL
export const sendLeaveRejectionEmail = async (employeeData, leaveData, rejectorData) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.subject = `Leave Rejected - ${leaveData.leave_name}`;
        sendSmtpEmail.to = [{ email: employeeData.email, name: employeeData.name }];
        sendSmtpEmail.sender = { 
            email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com', 
            name: 'HR Management System' 
        };
        
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <!--[if gte mso 9]>
                <xml>
                    <o:OfficeDocumentSettings>
                        <o:AllowPNG/>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
            </head>
            <body style="margin: 0; padding: 0;">
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #ffffff;">
                    
                    <!-- Modern Header with Blue Gradient -->
                    <div style="background: #1a237e; padding: 60px 40px; text-align: center; position: relative;">
                        <!--[if gte mso 9]>
                        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px; height:220px;">
                            <v:fill type="gradient" color="#0a0a0a" color2="#0d47a1" angle="135" />
                            <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                            <div style="padding: 60px 40px; text-align: center;">
                        <![endif]-->
                        
                        <div style="width: 100px; height: 4px; background: #00d4ff; margin: 0 auto 30px;"></div>
                        <h1 style="color: #ffffff; margin: 0 0 12px; font-size: 42px; font-weight: 800; letter-spacing: -1px; line-height: 1.2;">❌ REJECTED</h1>
                        <p style="color: #00d4ff; margin: 0; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; font-weight: 600;">Leave Application Status</p>
                        
                        <!--[if gte mso 9]>
                            </div>
                            </v:textbox>
                        </v:rect>
                        <![endif]-->
                    </div>

                    <!-- Main Content Area -->
                    <div style="padding: 50px 45px; background: #ffffff;">
                        
                        <p style="color: #1a1a1a; margin: 0 0 28px; line-height: 1.7; font-size: 16px;">Dear <strong>${employeeData.name}</strong>,</p>
                        
                        <p style="color: #1a1a1a; margin: 0 0 28px; line-height: 1.7; font-size: 16px;">
                            We regret to inform you that your leave application has been <strong style="color: #ff4d4f;">REJECTED</strong>.
                        </p>

                        <!-- Leave Details -->
                        <div style="margin: 50px 0;">
                            <h3 style="color: #0a0a0a; margin: 0 0 30px; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">Leave Details</h3>
                            
                            <div style="margin-bottom: 24px; border: 2px solid #ff4d4f; padding: 32px; position: relative; background: #fff1f0;">
                                <div style="width: 80px; height: 4px; background: #ff4d4f; margin: 0 0 20px 0;"></div>
                                
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>Leave Type:</strong> ${leaveData.leave_name}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>From Date:</strong> ${new Date(leaveData.from_date).toLocaleDateString('en-GB')}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>To Date:</strong> ${new Date(leaveData.to_date).toLocaleDateString('en-GB')}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>Number of Days:</strong> ${leaveData.number_of_days}
                                </p>
                                <p style="color: #1a1a1a; margin: 0; font-size: 14px; line-height: 1.7;">
                                    <strong>Rejected By:</strong> ${rejectorData.name}
                                </p>
                            </div>
                        </div>
                        
                        ${leaveData.rejection_reason ? `
                        <div style="margin: 50px 0; padding: 36px; background: #1a237e; position: relative;">
                            <!--[if gte mso 9]>
                            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:590px;">
                                <v:fill type="gradient" color="#0a0a0a" color2="#0d47a1" angle="135" />
                                <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                                <div style="padding: 36px;">
                            <![endif]-->
                            
                            <div style="width: 100px; height: 4px; background: #00d4ff; margin: 0 0 24px 0;"></div>
                            <h3 style="color: #ffffff; margin: 0 0 24px; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">Rejection Reason</h3>
                            <p style="color: #00d4ff; margin: 0; font-size: 14px; line-height: 1.6;">${leaveData.rejection_reason}</p>
                            
                            <!--[if gte mso 9]>
                                </div>
                                </v:textbox>
                            </v:rect>
                            <![endif]-->
                        </div>
                        ` : ''}
                        
                        <p style="color: #1a1a1a; margin: 40px 0 32px; line-height: 1.7; font-size: 16px;">
                            If you have any questions regarding this rejection, please contact ${rejectorData.name} or the HR department.
                        </p>

                    </div>

                    <!-- Modern Footer with Blue Gradient -->
                    <div style="background: #1a237e; padding: 28px 40px; text-align: center;">
                        <!--[if gte mso 9]>
                        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px; height:100px;">
                            <v:fill type="gradient" color="#0a0a0a" color2="#0d47a1" angle="135" />
                            <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                            <div style="padding: 28px 40px; text-align: center;">
                        <![endif]-->
                        
                        <div style="width: 60px; height: 2px; background: #00d4ff; margin: 0 auto 16px;"></div>
                        <p style="color: #e0e0e0; font-size: 11px; margin: 0 0 8px; letter-spacing: 1px;">This is an automated email. Please do not reply to this message.</p>
                        <p style="color: #999999; font-size: 11px; margin: 0; letter-spacing: 0.5px;">
                            &copy; ${new Date().getFullYear()} Sagous. All rights reserved.
                        </p>
                        
                        <!--[if gte mso 9]>
                            </div>
                            </v:textbox>
                        </v:rect>
                        <![endif]-->
                    </div>

                </div>
            </body>
            </html>
        `;

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Rejection email sent successfully:', result);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending rejection email:', error);
        return { success: false, error: error.message };
    }
};

// 5. LEAVE APPLICATION NOTIFICATION TO APPROVER
export const sendLeaveApplicationNotification = async (approverData, employeeData, leaveData) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.subject = `New Leave Application - ${employeeData.name}`;
        sendSmtpEmail.to = [{ email: approverData.email, name: approverData.name }];
        sendSmtpEmail.sender = { 
            email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com', 
            name: 'HR Management System' 
        };
        
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <!--[if gte mso 9]>
                <xml>
                    <o:OfficeDocumentSettings>
                        <o:AllowPNG/>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
            </head>
            <body style="margin: 0; padding: 0;">
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #ffffff;">
                    
                    <!-- Modern Header with Blue Gradient -->
                    <div style="background: #1a237e; padding: 60px 40px; text-align: center; position: relative;">
                        <!--[if gte mso 9]>
                        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px; height:220px;">
                            <v:fill type="gradient" color="#0a0a0a" color2="#0d47a1" angle="135" />
                            <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                            <div style="padding: 60px 40px; text-align: center;">
                        <![endif]-->
                        
                        <div style="width: 100px; height: 4px; background: #00d4ff; margin: 0 auto 30px;"></div>
                        <h1 style="color: #ffffff; margin: 0 0 12px; font-size: 42px; font-weight: 800; letter-spacing: -1px; line-height: 1.2;">🔔 NEW REQUEST</h1>
                        <p style="color: #00d4ff; margin: 0; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; font-weight: 600;">Leave Application Review</p>
                        
                        <!--[if gte mso 9]>
                            </div>
                            </v:textbox>
                        </v:rect>
                        <![endif]-->
                    </div>

                    <!-- Main Content Area -->
                    <div style="padding: 50px 45px; background: #ffffff;">
                        
                        <p style="color: #1a1a1a; margin: 0 0 28px; line-height: 1.7; font-size: 16px;">Dear <strong>${approverData.name}</strong>,</p>
                        
                        <p style="color: #1a1a1a; margin: 0 0 28px; line-height: 1.7; font-size: 16px;">
                            A new leave application requires your approval.
                        </p>

                        <!-- Application Details -->
                        <div style="margin: 50px 0;">
                            <h3 style="color: #0a0a0a; margin: 0 0 30px; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">Application Details</h3>
                            
                            <div style="margin-bottom: 24px; border: 2px solid #0a0a0a; padding: 32px; position: relative;">
                                <div style="width: 80px; height: 4px; background: #00d4ff; margin: 0 0 20px 0;"></div>
                                
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>Employee:</strong> ${employeeData.name}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>Leave Type:</strong> ${leaveData.leave_name}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>From Date:</strong> ${new Date(leaveData.from_date).toLocaleDateString('en-GB')}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>To Date:</strong> ${new Date(leaveData.to_date).toLocaleDateString('en-GB')}
                                </p>
                                <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px; line-height: 1.7;">
                                    <strong>Number of Days:</strong> ${leaveData.number_of_days}
                                </p>
                                ${leaveData.reason ? `
                                <p style="color: #1a1a1a; margin: 0; font-size: 14px; line-height: 1.7;">
                                    <strong>Reason:</strong> ${leaveData.reason}
                                </p>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <table cellpadding="0" cellspacing="0" border="0" align="center">
                                <tr>
                                    <td style="background: #0090ff; padding: 16px 48px; text-align: center; border-radius: 4px;">
                                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/leave" style="color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; display: block;">
                                            Review Application
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        
                        <p style="color: #1a1a1a; margin: 40px 0 32px; line-height: 1.7; font-size: 16px;">
                            Please review and take action on this leave application.
                        </p>

                    </div>

                    <!-- Modern Footer with Blue Gradient -->
                    <div style="background: #1a237e; padding: 28px 40px; text-align: center;">
                        <!--[if gte mso 9]>
                        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px; height:100px;">
                            <v:fill type="gradient" color="#0a0a0a" color2="#0d47a1" angle="135" />
                            <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                            <div style="padding: 28px 40px; text-align: center;">
                        <![endif]-->
                        
                        <div style="width: 60px; height: 2px; background: #00d4ff; margin: 0 auto 16px;"></div>
                        <p style="color: #e0e0e0; font-size: 11px; margin: 0 0 8px; letter-spacing: 1px;">This is an automated email. Please do not reply to this message.</p>
                        <p style="color: #999999; font-size: 11px; margin: 0; letter-spacing: 0.5px;">
                            &copy; ${new Date().getFullYear()} Sagous. All rights reserved.
                        </p>
                        
                        <!--[if gte mso 9]>
                            </div>
                            </v:textbox>
                        </v:rect>
                        <![endif]-->
                    </div>

                </div>
            </body>
            </html>
        `;

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Application notification sent successfully:', result);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending application notification:', error);
        return { success: false, error: error.message };
    }
};

// 6. BULK ANNOUNCEMENT EMAIL
export const sendBulkAnnouncement = async ({ subject, content, recipients, priority }) => {
    const results = {
        successCount: 0,
        failedCount: 0,
        details: []
    };

    const batchSize = 1000;
    const batches = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
        batches.push(recipients.slice(i, i + batchSize));
    }

    for (const batch of batches) {
        try {
            const sendSmtpEmail = new Brevo.SendSmtpEmail();
            
            sendSmtpEmail.subject = subject;
            sendSmtpEmail.sender = {
                email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com',
                name: 'HR Management System'
            };
            
            sendSmtpEmail.to = batch.map(recipient => ({
                email: recipient.email,
                name: recipient.name
            }));

            sendSmtpEmail.htmlContent = createAnnouncementTemplate(content, subject, priority);

            const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
            
            results.successCount += batch.length;
            results.details.push({
                batch: batches.indexOf(batch) + 1,
                count: batch.length,
                status: 'success',
                messageId: result.messageId
            });

            console.log(`Batch ${batches.indexOf(batch) + 1} sent successfully`);
        } catch (error) {
            console.error(`Error sending batch ${batches.indexOf(batch) + 1}:`, error);
            results.failedCount += batch.length;
            results.details.push({
                batch: batches.indexOf(batch) + 1,
                count: batch.length,
                status: 'failed',
                error: error.message
            });
        }
    }

    return results;
};

// const createAnnouncementTemplate = (content, subject, priority) => {
//     const priorityLabels = {
//         high: '🔴 HIGH PRIORITY',
//         normal: '🔵 NORMAL',
//         low: '🟢 LOW PRIORITY'
//     };

//     return `
//         <!DOCTYPE html>
//         <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
//         <head>
//             <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <!--[if gte mso 9]>
//             <xml>
//                 <o:OfficeDocumentSettings>
//                     <o:AllowPNG/>
//                     <o:PixelsPerInch>96</o:PixelsPerInch>
//                 </o:OfficeDocumentSettings>
//             </xml>
//             <![endif]-->
//         </head>
//         <body style="margin: 0; padding: 0;">
//             <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #ffffff;">
                
//                 <!-- Modern Header with Blue Gradient -->
//                 <div style="background: #1a237e; padding: 60px 40px; text-align: center; position: relative;">
//                     <!--[if gte mso 9]>
//                     <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px; height:220px;">
//                         <v:fill type="gradient" color="#0a0a0a" color2="#0d47a1" angle="135" />
//                         <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
//                         <div style="padding: 60px 40px; text-align: center;">
//                     <![endif]-->
                    
//                     <div style="width: 100px; height: 4px; background: #00d4ff; margin: 0 auto 30px;"></div>
//                     <h1 style="color: #ffffff; margin: 0 0 12px; font-size: 42px; font-weight: 800; letter-spacing: -1px; line-height: 1.2;">📢 ANNOUNCEMENT</h1>
//                     <p style="color: #00d4ff; margin: 0; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; font-weight: 600;">${priorityLabels[priority] || 'COMPANY ANNOUNCEMENT'}</p>
                    
//                     <!--[if gte mso 9]>
//                         </div>
//                         </v:textbox>
//                     </v:rect>
//                     <![endif]-->
//                 </div>

//                 <!-- Main Content Area -->
//                 <div style="padding: 50px 45px; background: #ffffff;">
                    
//                     <h2 style="color: #0a0a0a; margin: 0 0 30px; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${subject}</h2>
                    
//                     <div style="height: 2px; background: #00d4ff; margin: 30px 0;"></div>
                    
//                     <div style="color: #1a1a1a; margin: 30px 0; line-height: 1.8; font-size: 15px; white-space: pre-wrap;">
//                         ${content.replace(/\n/g, '<br>')}
//                     </div>
                    
//                     <div style="height: 2px; background: #00d4ff; margin: 30px 0;"></div>
                    
//                     <!-- Date Box -->
//                     <div style="margin: 40px 0;">
//                         <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                             <tr>
//                                 <td style="padding: 24px; background: #f8f8f8; border-left: 4px solid #0090ff;">
//                                     <p style="color: #0a0a0a; margin: 0; font-size: 13px; font-weight: 600;">
//                                         <strong>📅 Date:</strong> ${new Date().toLocaleDateString('en-GB', {
//                                             day: '2-digit',
//                                             month: 'long',
//                                             year: 'numeric'
//                                         })}
//                                     </p>
//                                 </td>
//                             </tr>
//                         </table>
//                     </div>

//                 </div>

//                 <!-- Modern Footer with Blue Gradient -->
//                 <div style="background: #1a237e; padding: 28px 40px; text-align: center;">
//                     <!--[if gte mso 9]>
//                     <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px; height:100px;">
//                         <v:fill type="gradient" color="#0a0a0a" color2="#0d47a1" angle="135" />
//                         <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
//                         <div style="padding: 28px 40px; text-align: center;">
//                     <![endif]-->
                    
//                     <div style="width: 60px; height: 2px; background: #00d4ff; margin: 0 auto 16px;"></div>
//                     <p style="color: #e0e0e0; font-size: 11px; margin: 0 0 8px; letter-spacing: 1px;">This is an automated announcement from HR Management System.</p>
//                     <p style="color: #e0e0e0; font-size: 11px; margin: 0 0 8px; letter-spacing: 1px;">Please do not reply to this email.</p>
//                     <p style="color: #999999; font-size: 11px; margin: 0; letter-spacing: 0.5px;">
//                         &copy; ${new Date().getFullYear()} Sagous. All rights reserved.
//                     </p>
                    
//                     <!--[if gte mso 9]>
//                         </div>
//                         </v:textbox>
//                     </v:rect>
//                     <![endif]-->
//                 </div>

//             </div>
//         </body>
//         </html>
//     `;
// };




export const createAnnouncementTemplate = (content, subject, priority) => {
    const priorityColors = {
        high: '#d32f2f',
        normal: '#1976d2',
        low: '#388e3c'
    };

    const priorityText = {
        high: 'HIGH PRIORITY',
        normal: 'NORMAL PRIORITY',
        low: 'LOW PRIORITY'
    };

    return `
        <!DOCTYPE html>
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <!--[if gte mso 9]>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:AllowPNG/>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            <style type="text/css">
                body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
                <tr>
                    <td align="center" style="padding: 30px 15px;">
                        
                        <!-- Main Container -->
                        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; max-width: 600px;">
                            
                            <!-- Header Section -->
                            <tr>
                                <td align="center" bgcolor="#1a237e" style="background-color: #1a237e; padding: 45px 30px;">
                                    <!--[if gte mso 9]>
                                    <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px; height:140px;">
                                        <v:fill type="gradient" color="#1a237e" color2="#0d47a1" angle="135" />
                                        <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                                        <div style="padding: 45px 30px;">
                                    <![endif]-->
                                    
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td align="center">
                                                <h1 style="color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 32px; font-weight: bold; margin: 0; padding: 0; line-height: 40px; letter-spacing: 1px;">COMPANY ANNOUNCEMENT</h1>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" style="padding-top: 12px;">
                                                <table border="0" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td bgcolor="${priorityColors[priority]}" style="background-color: ${priorityColors[priority]}; padding: 6px 18px; border-radius: 3px;">
                                                            <p style="color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 11px; font-weight: bold; margin: 0; padding: 0; letter-spacing: 1px;">${priorityText[priority]}</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!--[if gte mso 9]>
                                        </div>
                                        </v:textbox>
                                    </v:rect>
                                    <![endif]-->
                                </td>
                            </tr>

                            <!-- Content Section -->
                            <tr>
                                <td style="padding: 40px 40px 35px 40px;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        
                                        <!-- Subject -->
                                        <tr>
                                            <td>
                                                <h2 style="color: #1a1a1a; font-family: Arial, Helvetica, sans-serif; font-size: 20px; font-weight: bold; margin: 0 0 25px 0; padding: 0; line-height: 28px;">${subject}</h2>
                                            </td>
                                        </tr>
                                        
                                        <!-- Top Divider -->
                                        <tr>
                                            <td style="padding-bottom: 25px;">
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td bgcolor="#e0e0e0" style="background-color: #e0e0e0; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td>
                                                <p style="color: #4a4a4a; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 24px; margin: 0; padding: 0; white-space: pre-wrap;">${content.replace(/\n/g, '<br>')}</p>
                                            </td>
                                        </tr>
                                        
                                        <!-- Bottom Divider -->
                                        <tr>
                                            <td style="padding-top: 30px; padding-bottom: 25px;">
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td bgcolor="#e0e0e0" style="background-color: #e0e0e0; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        
                                        <!-- Date Box -->
                                        <tr>
                                            <td>
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f9f9f9" style="background-color: #f9f9f9; border-left: 3px solid #1976d2;">
                                                    <tr>
                                                        <td style="padding: 18px 20px;">
                                                            <p style="color: #333333; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: bold; margin: 0; padding: 0; line-height: 20px;">
                                                                Date: ${new Date().toLocaleDateString('en-GB', {
                                                                    day: '2-digit',
                                                                    month: 'long',
                                                                    year: 'numeric'
                                                                })}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        
                                    </table>
                                </td>
                            </tr>

                            <!-- Footer Section -->
                            <tr>
                                <td align="center" bgcolor="#1a237e" style="background-color: #1a237e; padding: 30px 30px;">
                                    <!--[if gte mso 9]>
                                    <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px; height:110px;">
                                        <v:fill type="gradient" color="#1a237e" color2="#0d47a1" angle="135" />
                                        <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                                        <div style="padding: 30px 30px;">
                                    <![endif]-->
                                    
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td align="center">
                                                <p style="color: #b0bec5; font-family: Arial, Helvetica, sans-serif; font-size: 12px; margin: 0 0 8px 0; padding: 0; line-height: 18px;">This is an automated announcement from HR Management System</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center">
                                                <p style="color: #b0bec5; font-family: Arial, Helvetica, sans-serif; font-size: 12px; margin: 0 0 15px 0; padding: 0; line-height: 18px;">Please do not reply to this email</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" style="padding-top: 15px; border-top: 1px solid #37474f;">
                                                <p style="color: #90a4ae; font-family: Arial, Helvetica, sans-serif; font-size: 11px; margin: 0; padding: 0; line-height: 16px;">
                                                    &copy; ${new Date().getFullYear()} Sagous. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!--[if gte mso 9]>
                                        </div>
                                        </v:textbox>
                                    </v:rect>
                                    <![endif]-->
                                </td>
                            </tr>

                        </table>
                        
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};



// // 7. INDIVIDUAL ATTENDANCE REPORT (OUTLOOK-FRIENDLY)
// export const sendIndividualAttendanceReport = async ({ 
//     employeeCode, employeeName, email, department, date,
//     firstLogin, lastLogout, netTime, grossTime, breakTime,
//     isEdited, editReason, totalLogins, totalLogouts,
//     allLoginTimes, allLogoutTimes, sessions
// }) => {
//     try {
//         const sessionsHTML = sessions && sessions.length > 0 ? `
//             <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 30px;">
//                 <tr>
//                     <td style="padding-bottom: 15px;">
//                         <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                             <tr>
//                                 <td style="padding: 3px 0; border-bottom: 3px solid #1a237e;">
//                                     <p style="color: #1a237e; margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">⏱️ Work Sessions (Paired IN-OUT)</p>
//                                 </td>
//                             </tr>
//                         </table>
//                     </td>
//                 </tr>
//                 <tr>
//                     <td>
//                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #cccccc;">
//                             <tr style="background-color: #1a237e;">
//                                 <th width="10%" style="padding: 12px 8px; border: 1px solid #e0e0e0; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-align: center;">#</th>
//                                 <th width="30%" style="padding: 12px 8px; border: 1px solid #e0e0e0; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-align: center;">LOGIN</th>
//                                 <th width="30%" style="padding: 12px 8px; border: 1px solid #e0e0e0; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-align: center;">LOGOUT</th>
//                                 <th width="30%" style="padding: 12px 8px; border: 1px solid #e0e0e0; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-align: center;">DURATION</th>
//                             </tr>
//                             ${sessions.map((s, i) => `
//                             <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f5f5f5'};">
//                                 <td style="padding: 10px 8px; border: 1px solid #e0e0e0; text-align: center; font-size: 13px; font-weight: 600; color: #333333;">${i + 1}</td>
//                                 <td style="padding: 10px 8px; border: 1px solid #e0e0e0; text-align: center; font-size: 13px; font-weight: 600; color: #52c41a;">${s.in}</td>
//                                 <td style="padding: 10px 8px; border: 1px solid #e0e0e0; text-align: center; font-size: 13px; font-weight: 600; color: #ff4d4f;">${s.out}</td>
//                                 <td style="padding: 10px 8px; border: 1px solid #e0e0e0; text-align: center; font-size: 13px; font-weight: 700; color: #1a237e;">${s.duration}</td>
//                             </tr>
//                             `).join('')}
//                         </table>
//                     </td>
//                 </tr>
//             </table>
//         ` : '';

//         const htmlContent = `
//             <!DOCTYPE html>
//             <html xmlns="http://www.w3.org/1999/xhtml">
//             <head>
//                 <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <title>Attendance Report</title>
//             </head>
//             <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
//                 <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
//                     <tr>
//                         <td align="center" style="padding: 20px 0;">
                            
//                             <!-- Main Container -->
//                             <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; margin: 0 auto;">
                                
//                                 <!-- Header -->
//                                 <tr>
//                                     <td style="background-color: #1a237e; padding: 40px 30px; text-align: center;">
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                             <tr>
//                                                 <td align="center" style="padding-bottom: 15px;">
//                                                     <div style="width: 80px; height: 3px; background-color: #ffffff; margin: 0 auto;"></div>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td align="center">
//                                                     <h1 style="color: #ffffff; margin: 0 0 10px; font-size: 32px; font-weight: 700; font-family: Arial, sans-serif; line-height: 1.2;">${employeeName}</h1>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td align="center">
//                                                     <p style="color: #ffffff; margin: 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; font-family: Arial, sans-serif;">Attendance Report</p>
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
                                
//                                 <!-- Main Content -->
//                                 <tr>
//                                     <td style="padding: 35px 30px;">
                                        
//                                         <!-- Greeting -->
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                             <tr>
//                                                 <td>
//                                                     <p style="color: #333333; margin: 0 0 25px; font-size: 15px; line-height: 1.6; font-family: Arial, sans-serif;">Hello <strong>${employeeName}</strong>! 👋</p>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                         <!-- Employee Info -->
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
//                                             <tr>
//                                                 <td style="padding: 15px; background-color: #f8f8f8; border-left: 4px solid #1a237e;">
//                                                     <p style="color: #1a237e; margin: 0 0 5px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif;">Employee Code</p>
//                                                     <p style="color: #555555; margin: 0; font-size: 14px; font-family: Arial, sans-serif;">${employeeCode}</p>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
//                                             <tr>
//                                                 <td style="padding: 15px; background-color: #f8f8f8; border-left: 4px solid #1a237e;">
//                                                     <p style="color: #1a237e; margin: 0 0 5px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif;">Department</p>
//                                                     <p style="color: #555555; margin: 0; font-size: 14px; font-family: Arial, sans-serif;">${department}</p>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
//                                             <tr>
//                                                 <td style="padding: 15px; background-color: #f8f8f8; border-left: 4px solid #1a237e;">
//                                                     <p style="color: #1a237e; margin: 0 0 5px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif;">Date</p>
//                                                     <p style="color: #555555; margin: 0; font-size: 14px; font-family: Arial, sans-serif;">${moment(date).format('DD MMMM YYYY, dddd')}</p>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                         <!-- NET TIME Section -->
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
//                                             <tr>
//                                                 <td style="padding-bottom: 15px;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td style="padding: 3px 0; border-bottom: 3px solid #1a237e;">
//                                                                 <p style="color: #1a237e; margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; font-family: Arial, sans-serif;">✅ Active Working Time (Net) ${isEdited ? '(Edited)' : ''}</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="padding: 25px 20px; background-color: ${isEdited ? '#fff7e6' : '#f6ffed'}; border: 2px solid ${isEdited ? '#ff9800' : '#52c41a'}; text-align: center;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td align="center" style="padding-bottom: 10px;">
//                                                                 <div style="width: 60px; height: 3px; background-color: ${isEdited ? '#ff9800' : '#52c41a'}; margin: 0 auto;"></div>
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td align="center">
//                                                                 <p style="font-size: 40px; font-weight: 700; color: ${isEdited ? '#ff9800' : '#52c41a'}; margin: 0 0 8px; font-family: Arial, sans-serif;">${netTime}</p>
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td align="center">
//                                                                 <p style="margin: 0; color: #666666; font-size: 12px; font-family: Arial, sans-serif;">Sum of all work sessions (excluding breaks)</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                             ${isEdited && editReason ? `
//                                             <tr>
//                                                 <td style="padding-top: 15px;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #ff9800;">
//                                                                 <p style="color: #1a237e; margin: 0 0 5px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif;">Edit Reason</p>
//                                                                 <p style="color: #856404; margin: 0; font-size: 13px; line-height: 1.6; font-family: Arial, sans-serif;">${editReason}</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                             ` : ''}
//                                         </table>
                                        
//                                         <!-- GROSS TIME Section -->
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
//                                             <tr>
//                                                 <td style="padding-bottom: 15px;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td style="padding: 3px 0; border-bottom: 3px solid #1a237e;">
//                                                                 <p style="color: #1a237e; margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; font-family: Arial, sans-serif;">🕐 Total Presence Time (Gross)</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="padding: 25px 20px; background-color: #e3f2fd; border: 2px solid #1976d2; text-align: center;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td align="center" style="padding-bottom: 10px;">
//                                                                 <div style="width: 60px; height: 3px; background-color: #1976d2; margin: 0 auto;"></div>
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td align="center">
//                                                                 <p style="font-size: 40px; font-weight: 700; color: #1976d2; margin: 0 0 8px; font-family: Arial, sans-serif;">${grossTime}</p>
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td align="center">
//                                                                 <p style="margin: 0; color: #666666; font-size: 12px; font-family: Arial, sans-serif;">First login to last logout (including breaks)</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                         <!-- BREAK TIME Section -->
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
//                                             <tr>
//                                                 <td style="padding-bottom: 15px;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td style="padding: 3px 0; border-bottom: 3px solid #1a237e;">
//                                                                 <p style="color: #1a237e; margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; font-family: Arial, sans-serif;">☕ Total Break Time</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="padding: 25px 20px; background-color: #fff3e0; border: 2px solid #ff9800; text-align: center;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td align="center" style="padding-bottom: 10px;">
//                                                                 <div style="width: 60px; height: 3px; background-color: #ff9800; margin: 0 auto;"></div>
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td align="center">
//                                                                 <p style="font-size: 40px; font-weight: 700; color: #f57c00; margin: 0; font-family: Arial, sans-serif;">${breakTime}</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                         <!-- First/Last Times -->
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
//                                             <tr>
//                                                 <td width="50%" style="padding-right: 8px;" valign="top">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td style="padding: 20px 15px; background-color: #e8f5e9; border-left: 4px solid #52c41a; text-align: center;">
//                                                                 <p style="margin: 0 0 8px; font-size: 11px; color: #2e7d32; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif;">🟢 First Login</p>
//                                                                 <p style="margin: 0; font-size: 22px; font-weight: 700; color: #1b5e20; font-family: Arial, sans-serif;">${firstLogin}</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                                 <td width="50%" style="padding-left: 8px;" valign="top">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td style="padding: 20px 15px; background-color: #ffebee; border-left: 4px solid #ff4d4f; text-align: center;">
//                                                                 <p style="margin: 0 0 8px; font-size: 11px; color: #c62828; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif;">🔴 Last Logout</p>
//                                                                 <p style="margin: 0; font-size: 22px; font-weight: 700; color: #b71c1c; font-family: Arial, sans-serif;">${lastLogout}</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                         ${sessionsHTML}
                                        
//                                         <!-- Info Box -->
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 30px;">
//                                             <tr>
//                                                 <td style="padding: 25px 20px; background-color: #1a237e;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td style="padding-bottom: 15px;">
//                                                                 <div style="width: 80px; height: 3px; background-color: #ffffff; margin: 0;"></div>
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td>
//                                                                 <p style="color: #ffffff; margin: 0 0 15px; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; font-family: Arial, sans-serif;">📌 Understanding Your Times</p>
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td>
//                                                                 <p style="color: #ffffff; margin: 0 0 10px; font-size: 13px; line-height: 1.7; font-family: Arial, sans-serif;">• <strong>Net Time:</strong> Actual time you were actively working (sum of all sessions)</p>
//                                                                 <p style="color: #ffffff; margin: 0 0 10px; font-size: 13px; line-height: 1.7; font-family: Arial, sans-serif;">• <strong>Gross Time:</strong> Total time from first login to last logout (includes breaks)</p>
//                                                                 <p style="color: #ffffff; margin: 0; font-size: 13px; line-height: 1.7; font-family: Arial, sans-serif;">• <strong>Break Time:</strong> Difference between gross and net time</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                     </td>
//                                 </tr>
                                
//                                 <!-- Footer -->
//                                 <tr>
//                                     <td style="background-color: #1a237e; padding: 25px 30px; text-align: center;">
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                             <tr>
//                                                 <td align="center" style="padding-bottom: 10px;">
//                                                     <div style="width: 50px; height: 2px; background-color: #ffffff; margin: 0 auto;"></div>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td align="center">
//                                                     <p style="color: #cccccc; font-size: 11px; margin: 0 0 5px; letter-spacing: 0.5px; font-family: Arial, sans-serif;">© ${moment().format('YYYY')} HR Management System</p>
//                                                     <p style="color: #999999; font-size: 10px; margin: 0; letter-spacing: 0.5px; font-family: Arial, sans-serif;">Generated: ${moment().format('DD MMM YYYY, hh:mm A')}</p>
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
                                
//                             </table>
                            
//                         </td>
//                     </tr>
//                 </table>
//             </body>
//             </html>
//         `;
        
//         const sendSmtpEmail = new Brevo.SendSmtpEmail();
//         sendSmtpEmail.subject = `Attendance Report - ${moment(date).format('DD MMM YYYY')}`;
//         sendSmtpEmail.htmlContent = htmlContent;
//         sendSmtpEmail.sender = { name: "HR System", email: process.env.SENDER_EMAIL };
//         sendSmtpEmail.to = [{ email }];

//         return await apiInstance.sendTransacEmail(sendSmtpEmail);
//     } catch (error) {
//         console.error(`Error sending to ${email}:`, error.message);
//         throw error;
//     }
// };


// Modified sendIndividualAttendanceReport function
// Requires: npm install pdfkit

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// export const sendIndividualAttendanceReport = async ({ 
//     employeeCode, employeeName, email, department, date,
//     firstLogin, lastLogout, netTime, grossTime, breakTime,
//     isEdited, editReason, totalLogins, totalLogouts,
//     allLoginTimes, allLogoutTimes, sessions
// }) => {
//     try {
//         // Generate PDF with login/logout details
//         let pdfPath = null;
//         let pdfBuffer = null;
        
//         if (sessions && sessions.length > 0) {
//             const doc = new PDFDocument({ margin: 50 });
//             const chunks = [];
            
//             doc.on('data', chunk => chunks.push(chunk));
//             doc.on('end', () => {
//                 pdfBuffer = Buffer.concat(chunks);
//             });
            
//             // PDF Header
//             doc.fontSize(20).fillColor('#1a237e').text('WORK SESSIONS REPORT', { align: 'center' });
//             doc.moveDown(0.5);
//             doc.fontSize(12).fillColor('#666666').text(`${employeeName} (${employeeCode})`, { align: 'center' });
//             doc.fontSize(10).text(moment(date).format('DD MMMM YYYY, dddd'), { align: 'center' });
//             doc.moveDown(2);
            
//             // Table Header
//             const tableTop = doc.y;
//             const colWidths = { num: 50, login: 150, logout: 150, duration: 150 };
//             const startX = 50;
            
//             doc.fontSize(11).fillColor('#ffffff');
//             doc.rect(startX, tableTop, colWidths.num + colWidths.login + colWidths.logout + colWidths.duration, 25)
//                .fill('#1a237e');
            
//             doc.fillColor('#ffffff')
//                .text('#', startX + 10, tableTop + 8, { width: colWidths.num - 20, align: 'center' })
//                .text('LOGIN', startX + colWidths.num + 10, tableTop + 8, { width: colWidths.login - 20, align: 'center' })
//                .text('LOGOUT', startX + colWidths.num + colWidths.login + 10, tableTop + 8, { width: colWidths.logout - 20, align: 'center' })
//                .text('DURATION', startX + colWidths.num + colWidths.login + colWidths.logout + 10, tableTop + 8, { width: colWidths.duration - 20, align: 'center' });
            
//             // Table Rows
//             let currentY = tableTop + 25;
//             sessions.forEach((session, index) => {
//                 const bgColor = index % 2 === 0 ? '#ffffff' : '#f5f5f5';
                
//                 doc.rect(startX, currentY, colWidths.num + colWidths.login + colWidths.logout + colWidths.duration, 30)
//                    .fill(bgColor);
                
//                 doc.fontSize(10)
//                    .fillColor('#333333')
//                    .text(index + 1, startX + 10, currentY + 10, { width: colWidths.num - 20, align: 'center' });
                
//                 doc.fillColor('#52c41a')
//                    .text(session.in, startX + colWidths.num + 10, currentY + 10, { width: colWidths.login - 20, align: 'center' });
                
//                 doc.fillColor('#ff4d4f')
//                    .text(session.out, startX + colWidths.num + colWidths.login + 10, currentY + 10, { width: colWidths.logout - 20, align: 'center' });
                
//                 doc.fillColor('#1a237e')
//                    .text(session.duration, startX + colWidths.num + colWidths.login + colWidths.logout + 10, currentY + 10, { width: colWidths.duration - 20, align: 'center' });
                
//                 currentY += 30;
                
//                 // Add new page if needed
//                 if (currentY > 700 && index < sessions.length - 1) {
//                     doc.addPage();
//                     currentY = 50;
//                 }
//             });
            
//             // Footer
//             doc.moveDown(2);
//             doc.fontSize(8).fillColor('#999999')
//                .text(`Generated: ${moment().format('DD MMM YYYY, hh:mm A')}`, { align: 'center' });
            
//             doc.end();
            
//             // Wait for PDF to finish
//             await new Promise((resolve) => {
//                 doc.on('end', resolve);
//             });
//         }
        
//         // Email HTML (WITHOUT sessions table)
//         const htmlContent = `
//             <!DOCTYPE html>
//             <html xmlns="http://www.w3.org/1999/xhtml">
//             <head>
//                 <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <title>Attendance Report</title>
//             </head>
//             <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
//                 <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
//                     <tr>
//                         <td align="center" style="padding: 20px 0;">
                            
//                             <!-- Main Container -->
//                             <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; margin: 0 auto;">
                                
//                                 <!-- Header -->
//                                 <tr>
//                                     <td style="background-color: #1a237e; padding: 40px 30px; text-align: center;">
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                             <tr>
//                                                 <td align="center" style="padding-bottom: 15px;">
//                                                     <div style="width: 80px; height: 3px; background-color: #ffffff; margin: 0 auto;"></div>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td align="center">
//                                                     <h1 style="color: #ffffff; margin: 0 0 10px; font-size: 32px; font-weight: 700; font-family: Arial, sans-serif; line-height: 1.2;">${employeeName}</h1>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td align="center">
//                                                     <p style="color: #ffffff; margin: 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; font-family: Arial, sans-serif;">Attendance Report</p>
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
                                
//                                 <!-- Main Content -->
//                                 <tr>
//                                     <td style="padding: 35px 30px;">
                                        
//                                         <!-- Greeting -->
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                             <tr>
//                                                 <td>
//                                                     <p style="color: #333333; margin: 0 0 25px; font-size: 15px; line-height: 1.6; font-family: Arial, sans-serif;">Hello <strong>${employeeName}</strong>! 👋</p>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                         <!-- Employee Info -->
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
//                                             <tr>
//                                                 <td style="padding: 15px; background-color: #f8f8f8; border-left: 4px solid #1a237e;">
//                                                     <p style="color: #1a237e; margin: 0 0 5px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif;">Employee Code</p>
//                                                     <p style="color: #555555; margin: 0; font-size: 14px; font-family: Arial, sans-serif;">${employeeCode}</p>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
//                                             <tr>
//                                                 <td style="padding: 15px; background-color: #f8f8f8; border-left: 4px solid #1a237e;">
//                                                     <p style="color: #1a237e; margin: 0 0 5px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif;">Department</p>
//                                                     <p style="color: #555555; margin: 0; font-size: 14px; font-family: Arial, sans-serif;">${department}</p>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
//                                             <tr>
//                                                 <td style="padding: 15px; background-color: #f8f8f8; border-left: 4px solid #1a237e;">
//                                                     <p style="color: #1a237e; margin: 0 0 5px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif;">Date</p>
//                                                     <p style="color: #555555; margin: 0; font-size: 14px; font-family: Arial, sans-serif;">${moment(date).format('DD MMMM YYYY, dddd')}</p>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                         <!-- NET TIME Section -->
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
//                                             <tr>
//                                                 <td style="padding-bottom: 15px;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td style="padding: 3px 0; border-bottom: 3px solid #1a237e;">
//                                                                 <p style="color: #1a237e; margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; font-family: Arial, sans-serif;">✅ Active Working Time (Net) ${isEdited ? '(Edited)' : ''}</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="padding: 25px 20px; background-color: ${isEdited ? '#fff7e6' : '#f6ffed'}; border: 2px solid ${isEdited ? '#ff9800' : '#52c41a'}; text-align: center;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td align="center" style="padding-bottom: 10px;">
//                                                                 <div style="width: 60px; height: 3px; background-color: ${isEdited ? '#ff9800' : '#52c41a'}; margin: 0 auto;"></div>
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td align="center">
//                                                                 <p style="font-size: 40px; font-weight: 700; color: ${isEdited ? '#ff9800' : '#52c41a'}; margin: 0 0 8px; font-family: Arial, sans-serif;">${netTime}</p>
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td align="center">
//                                                                 <p style="margin: 0; color: #666666; font-size: 12px; font-family: Arial, sans-serif;">Sum of all work sessions (excluding breaks)</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                             ${isEdited && editReason ? `
//                                             <tr>
//                                                 <td style="padding-top: 15px;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #ff9800;">
//                                                                 <p style="color: #1a237e; margin: 0 0 5px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif;">Edit Reason</p>
//                                                                 <p style="color: #856404; margin: 0; font-size: 13px; line-height: 1.6; font-family: Arial, sans-serif;">${editReason}</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                             ` : ''}
//                                         </table>
                                        
//                                         <!-- GROSS TIME Section -->
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
//                                             <tr>
//                                                 <td style="padding-bottom: 15px;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td style="padding: 3px 0; border-bottom: 3px solid #1a237e;">
//                                                                 <p style="color: #1a237e; margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; font-family: Arial, sans-serif;">🕐 Total Presence Time (Gross)</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="padding: 25px 20px; background-color: #e3f2fd; border: 2px solid #1976d2; text-align: center;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td align="center" style="padding-bottom: 10px;">
//                                                                 <div style="width: 60px; height: 3px; background-color: #1976d2; margin: 0 auto;"></div>
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td align="center">
//                                                                 <p style="font-size: 40px; font-weight: 700; color: #1976d2; margin: 0 0 8px; font-family: Arial, sans-serif;">${grossTime}</p>
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td align="center">
//                                                                 <p style="margin: 0; color: #666666; font-size: 12px; font-family: Arial, sans-serif;">First login to last logout (including breaks)</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                         <!-- BREAK TIME Section -->
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
//                                             <tr>
//                                                 <td style="padding-bottom: 15px;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td style="padding: 3px 0; border-bottom: 3px solid #1a237e;">
//                                                                 <p style="color: #1a237e; margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; font-family: Arial, sans-serif;">☕ Total Break Time</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="padding: 25px 20px; background-color: #fff3e0; border: 2px solid #ff9800; text-align: center;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td align="center" style="padding-bottom: 10px;">
//                                                                 <div style="width: 60px; height: 3px; background-color: #ff9800; margin: 0 auto;"></div>
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td align="center">
//                                                                 <p style="font-size: 40px; font-weight: 700; color: #f57c00; margin: 0; font-family: Arial, sans-serif;">${breakTime}</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                         <!-- First/Last Times -->
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
//                                             <tr>
//                                                 <td width="50%" style="padding-right: 8px;" valign="top">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td style="padding: 20px 15px; background-color: #e8f5e9; border-left: 4px solid #52c41a; text-align: center;">
//                                                                 <p style="margin: 0 0 8px; font-size: 11px; color: #2e7d32; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif;">🟢 First Login</p>
//                                                                 <p style="margin: 0; font-size: 22px; font-weight: 700; color: #1b5e20; font-family: Arial, sans-serif;">${firstLogin}</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                                 <td width="50%" style="padding-left: 8px;" valign="top">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td style="padding: 20px 15px; background-color: #ffebee; border-left: 4px solid #ff4d4f; text-align: center;">
//                                                                 <p style="margin: 0 0 8px; font-size: 11px; color: #c62828; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif;">🔴 Last Logout</p>
//                                                                 <p style="margin: 0; font-size: 22px; font-weight: 700; color: #b71c1c; font-family: Arial, sans-serif;">${lastLogout}</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                         <!-- PDF Attachment Notice -->
//                                         ${sessions && sessions.length > 0 ? `
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
//                                             <tr>
//                                                 <td style="padding: 20px; background-color: #e8f5e9; border-left: 4px solid #52c41a;">
//                                                     <p style="color: #2e7d32; margin: 0; font-size: 14px; line-height: 1.6; font-family: Arial, sans-serif;">
//                                                         📎 <strong>Detailed work sessions</strong> (login/logout times) are attached as a PDF file.
//                                                     </p>
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                         ` : ''}
                                        
//                                         <!-- Info Box -->
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                             <tr>
//                                                 <td style="padding: 25px 20px; background-color: #1a237e;">
//                                                     <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                                         <tr>
//                                                             <td style="padding-bottom: 15px;">
//                                                                 <div style="width: 80px; height: 3px; background-color: #ffffff; margin: 0;"></div>
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td>
//                                                                 <p style="color: #ffffff; margin: 0 0 15px; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; font-family: Arial, sans-serif;">📌 Understanding Your Times</p>
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td>
//                                                                 <p style="color: #ffffff; margin: 0 0 10px; font-size: 13px; line-height: 1.7; font-family: Arial, sans-serif;">• <strong>Net Time:</strong> Actual time you were actively working (sum of all sessions)</p>
//                                                                 <p style="color: #ffffff; margin: 0 0 10px; font-size: 13px; line-height: 1.7; font-family: Arial, sans-serif;">• <strong>Gross Time:</strong> Total time from first login to last logout (includes breaks)</p>
//                                                                 <p style="color: #ffffff; margin: 0; font-size: 13px; line-height: 1.7; font-family: Arial, sans-serif;">• <strong>Break Time:</strong> Difference between gross and net time</p>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                         </table>
                                        
//                                     </td>
//                                 </tr>
                                
//                                 <!-- Footer -->
//                                 <tr>
//                                     <td style="background-color: #1a237e; padding: 25px 30px; text-align: center;">
//                                         <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                                             <tr>
//                                                 <td align="center" style="padding-bottom: 10px;">
//                                                     <div style="width: 50px; height: 2px; background-color: #ffffff; margin: 0 auto;"></div>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td align="center">
//                                                     <p style="color: #cccccc; font-size: 11px; margin: 0 0 5px; letter-spacing: 0.5px; font-family: Arial, sans-serif;">© ${moment().format('YYYY')} HR Management System</p>
//                                                     <p style="color: #999999; font-size: 10px; margin: 0; letter-spacing: 0.5px; font-family: Arial, sans-serif;">Generated: ${moment().format('DD MMM YYYY, hh:mm A')}</p>
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
                                
//                             </table>
                            
//                         </td>
//                     </tr>
//                 </table>
//             </body>
//             </html>
//         `;
        
//         // Send email with PDF attachment
//         const sendSmtpEmail = new Brevo.SendSmtpEmail();
//         sendSmtpEmail.subject = `Attendance Report - ${moment(date).format('DD MMM YYYY')}`;
//         sendSmtpEmail.htmlContent = htmlContent;
//         sendSmtpEmail.sender = { name: "HR System", email: process.env.SENDER_EMAIL };
//         sendSmtpEmail.to = [{ email }];
        
//         // Attach PDF if sessions exist
//         if (pdfBuffer) {
//             sendSmtpEmail.attachment = [{
//                 content: pdfBuffer.toString('base64'),
//                 name: `WorkSessions_${employeeCode}_${moment(date).format('YYYY-MM-DD')}.pdf`
//             }];
//         }

//         return await apiInstance.sendTransacEmail(sendSmtpEmail);
//     } catch (error) {
//         console.error(`Error sending to ${email}:`, error.message);
//         throw error;
//     }
// };



import { getAttendanceReportHTML } from './attendanceReportTemplate.js';
import { generateSessionsPDF } from './pdfGenerator.js';













export const sendIndividualAttendanceReport = async ({ 
    employeeCode, employeeName, email, department, date,
    firstLogin, lastLogout, netTime, grossTime, breakTime,
    isEdited, editReason, totalLogins, totalLogouts,
    allLoginTimes, allLogoutTimes, sessions
}) => {
    try {
        // Generate PDF with login/logout details
        let pdfBuffer = null;
        
        if (sessions && sessions.length > 0) {
            pdfBuffer = await generateSessionsPDF({ 
                employeeName, 
                employeeCode, 
                date, 
                sessions 
            });
        }
        
        // Generate HTML content
        const htmlContent = getAttendanceReportHTML({
            employeeName, employeeCode, department, date,
            firstLogin, lastLogout, netTime, grossTime, breakTime,
            isEdited, editReason, sessions
        });
        
        // Send email with PDF attachment
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = `Attendance Report - ${moment(date).format('DD MMM YYYY')}`;
        sendSmtpEmail.htmlContent = htmlContent;
        sendSmtpEmail.sender = { name: "HR System", email: process.env.SENDER_EMAIL };
        sendSmtpEmail.to = [{ email }];
        
        // Attach PDF if sessions exist
        if (pdfBuffer) {
            sendSmtpEmail.attachment = [{
                content: pdfBuffer.toString('base64'),
                name: `WorkSessions_${employeeCode}_${moment(date).format('YYYY-MM-DD')}.pdf`
            }];
        }

        return await apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
        console.error(`Error sending to ${email}:`, error.message);
        throw error;
    }
};



// 8. ATTENDANCE REPORT TO HR (OUTLOOK-FRIENDLY)
export const sendAttendanceReport = async (reportData, recipients, reportDate) => {
    try {
        const tableRows = reportData.map((r, index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f5f5f5'};">
                <td style="padding: 10px 8px; border: 1px solid #e0e0e0; font-weight: 600; font-size: 13px; color: #333333; font-family: Arial, sans-serif;">${r.employee_code}</td>
                <td style="padding: 10px 8px; border: 1px solid #e0e0e0; text-align: center; color: #52c41a; font-weight: 600; font-size: 13px; font-family: Arial, sans-serif;">${r.in_time}</td>
                <td style="padding: 10px 8px; border: 1px solid #e0e0e0; text-align: center; color: #ff4d4f; font-weight: 600; font-size: 13px; font-family: Arial, sans-serif;">${r.out_time}</td>
                <td style="padding: 10px 8px; border: 1px solid #e0e0e0; text-align: center; font-weight: 700; color: #2e7d32; font-size: 13px; font-family: Arial, sans-serif;">${r.net_time}${r.is_edited ? ' ✏️' : ''}</td>
                <td style="padding: 10px 8px; border: 1px solid #e0e0e0; text-align: center; font-weight: 600; color: #1976d2; font-size: 13px; font-family: Arial, sans-serif;">${r.gross_time}</td>
            </tr>
        `).join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Attendance Report</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
                    <tr>
                        <td align="center" style="padding: 20px 0;">
                            
                            <!-- Main Container -->
                            <table cellpadding="0" cellspacing="0" border="0" width="800" style="background-color: #ffffff; margin: 0 auto;">
                                
                                <!-- Header -->
                                <tr>
                                    <td style="background-color: #1a237e; padding: 40px 30px; text-align: center;">
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td align="center" style="padding-bottom: 15px;">
                                                    <div style="width: 80px; height: 3px; background-color: #ffffff; margin: 0 auto;"></div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center">
                                                    <h1 style="color: #ffffff; margin: 0 0 10px; font-size: 36px; font-weight: 700; font-family: Arial, sans-serif; line-height: 1.2;">ATTENDANCE REPORT</h1>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center">
                                                    <p style="color: #ffffff; margin: 0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; font-family: Arial, sans-serif;">${moment(reportDate).format('DD MMMM YYYY')}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Main Content -->
                                <tr>
                                    <td style="padding: 35px 30px;">
                                        
                                        <!-- Summary Stats -->
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
                                            <tr>
                                                <td width="50%" style="padding-right: 8px;" valign="top">
                                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="padding: 20px 15px; background-color: #f8f8f8; border-left: 4px solid #1a237e; text-align: center;">
                                                                <p style="margin: 0 0 8px; font-size: 11px; color: #1a237e; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif;">Total Employees</p>
                                                                <p style="margin: 0; font-size: 32px; font-weight: 700; color: #1a237e; font-family: Arial, sans-serif;">${reportData.length}</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                                <td width="50%" style="padding-left: 8px;" valign="top">
                                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="padding: 20px 15px; background-color: #f8f8f8; border-left: 4px solid #ff9800; text-align: center;">
                                                                <p style="margin: 0 0 8px; font-size: 11px; color: #ff9800; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif;">Edited Records</p>
                                                                <p style="margin: 0; font-size: 32px; font-weight: 700; color: #ff9800; font-family: Arial, sans-serif;">${reportData.filter(r => r.is_edited).length}</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Data Table -->
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="padding: 3px 0; border-bottom: 3px solid #1a237e;">
                                                                <p style="color: #1a237e; margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; font-family: Arial, sans-serif;">Attendance Details</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #cccccc;">
                                                        <tr style="background-color: #1a237e;">
                                                            <th style="padding: 12px 8px; border: 1px solid #e0e0e0; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-align: left; font-family: Arial, sans-serif;">CODE</th>
                                                            <th style="padding: 12px 8px; border: 1px solid #e0e0e0; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-align: center; font-family: Arial, sans-serif;">FIRST IN</th>
                                                            <th style="padding: 12px 8px; border: 1px solid #e0e0e0; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-align: center; font-family: Arial, sans-serif;">LAST OUT</th>
                                                            <th style="padding: 12px 8px; border: 1px solid #e0e0e0; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-align: center; font-family: Arial, sans-serif;">NET (ACTIVE)</th>
                                                            <th style="padding: 12px 8px; border: 1px solid #e0e0e0; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-align: center; font-family: Arial, sans-serif;">GROSS (TOTAL)</th>
                                                        </tr>
                                                        ${tableRows}
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Legend -->
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 20px; background-color: #e3f2fd; border-left: 4px solid #1976d2;">
                                                    <p style="color: #333333; margin: 0; font-size: 13px; line-height: 1.7; font-family: Arial, sans-serif;">
                                                        <strong>Net:</strong> Active work time (sum of sessions) | <strong>Gross:</strong> Total presence (first→last) | <strong>✏️</strong> = HR edited
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #1a237e; padding: 25px 30px; text-align: center;">
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td align="center" style="padding-bottom: 10px;">
                                                    <div style="width: 50px; height: 2px; background-color: #ffffff; margin: 0 auto;"></div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center">
                                                    <p style="color: #cccccc; font-size: 11px; margin: 0 0 5px; letter-spacing: 0.5px; font-family: Arial, sans-serif;">© ${moment().format('YYYY')} HR Management System</p>
                                                    <p style="color: #999999; font-size: 10px; margin: 0; letter-spacing: 0.5px; font-family: Arial, sans-serif;">Generated: ${moment().format('DD MMM YYYY, hh:mm A')}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                            </table>
                            
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;
        
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = `Attendance Report - ${moment(reportDate).format('DD MMM YYYY')}`;
        sendSmtpEmail.htmlContent = htmlContent;
        sendSmtpEmail.sender = { name: "HR System", email: process.env.SENDER_EMAIL };
        sendSmtpEmail.to = recipients.map(e => ({ email: e }));

        return await apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
};




