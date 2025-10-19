

// Send Leave Approval Email
export const sendLeaveApprovalEmail = async (employeeData, leaveData, approverData) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.subject = `Leave Approved - ${leaveData.leave_name}`;
        sendSmtpEmail.to = [{ 
            email: employeeData.email, 
            name: employeeData.name 
        }];
        sendSmtpEmail.sender = { 
            email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com', 
            name: 'HR Management System' 
        };
        
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #52c41a; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
                    .details { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #52c41a; }
                    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .label { font-weight: bold; color: #666; }
                    .value { color: #333; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .status-badge { display: inline-block; padding: 5px 15px; background: #52c41a; color: white; border-radius: 3px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>✅ Leave Approved</h2>
                    </div>
                    <div class="content">
                        <p>Dear <strong>${employeeData.name}</strong>,</p>
                        <p>Your leave application has been <span class="status-badge">APPROVED</span></p>
                        
                        <div class="details">
                            <h3 style="margin-top: 0;">Leave Details</h3>
                            <div class="details-row">
                                <span class="label">Leave Type:</span>
                                <span class="value">${leaveData.leave_name}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">From Date:</span>
                                <span class="value">${new Date(leaveData.from_date).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">To Date:</span>
                                <span class="value">${new Date(leaveData.to_date).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">Number of Days:</span>
                                <span class="value">${leaveData.number_of_days}</span>
                            </div>
                            ${leaveData.is_half_day ? '<div class="details-row"><span class="label">Half Day:</span><span class="value">Yes</span></div>' : ''}
                            <div class="details-row">
                                <span class="label">Approved By:</span>
                                <span class="value">${approverData.name}</span>
                            </div>
                            ${leaveData.approver_comments ? `
                            <div class="details-row">
                                <span class="label">Comments:</span>
                                <span class="value">${leaveData.approver_comments}</span>
                            </div>
                            ` : ''}
                        </div>
                        
                        <p>Your leave has been approved and the balance has been updated accordingly.</p>
                        <p>If you have any questions, please contact HR.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email. Please do not reply to this message.</p>
                        <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
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
export const sendBulkAnnouncement = async ({ subject, content, recipients, priority }) => {
    const results = {
        successCount: 0,
        failedCount: 0,
        details: []
    };

    // Brevo allows up to 1000 emails per batch
    const batchSize = 1000;
    const batches = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
        batches.push(recipients.slice(i, i + batchSize));
    }

    for (const batch of batches) {
        try {
            // Using batch send for better performance
            const sendSmtpEmail = new Brevo.SendSmtpEmail();
            
            sendSmtpEmail.subject = subject;
            sendSmtpEmail.sender = {
                email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com',
                name: 'HR Management System'
            };
            
            // Set recipients
            sendSmtpEmail.to = batch.map(recipient => ({
                email: recipient.email,
                name: recipient.name
            }));

            // Create HTML content
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

// Create announcement email template
const createAnnouncementTemplate = (content, subject, priority) => {
    const priorityColors = {
        high: '#ff4d4f',
        normal: '#1890ff',
        low: '#52c41a'
    };

    const priorityLabels = {
        high: '🔴 HIGH PRIORITY',
        normal: '🔵 NORMAL',
        low: '🟢 LOW PRIORITY'
    };

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background: #f5f5f5;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .header {
                    background: ${priorityColors[priority] || '#1890ff'};
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .priority-badge {
                    display: inline-block;
                    padding: 5px 15px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 20px;
                    font-size: 12px;
                    margin-top: 10px;
                    font-weight: bold;
                }
                .content {
                    padding: 40px 30px;
                    background: white;
                }
                .content p {
                    margin: 0 0 15px 0;
                    white-space: pre-wrap;
                }
                .announcement-icon {
                    font-size: 48px;
                    text-align: center;
                    margin-bottom: 20px;
                }
                .footer {
                    background: #f9f9f9;
                    padding: 20px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    border-top: 1px solid #eee;
                }
                .divider {
                    height: 1px;
                    background: #e8e8e8;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📢 Company Announcement</h1>
                    <div class="priority-badge">${priorityLabels[priority] || 'ANNOUNCEMENT'}</div>
                </div>
                <div class="content">
                    <h2 style="color: #333; margin-top: 0;">${subject}</h2>
                    <div class="divider"></div>
                    <p>${content.replace(/\n/g, '<br>')}</p>
                    <div class="divider"></div>
                    <p style="color: #666; font-size: 14px;">
                        <strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                </div>
                <div class="footer">
                    <p>This is an automated announcement from HR Management System.</p>
                    <p>Please do not reply to this email.</p>
                    <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};



// Send Leave Rejection Email
export const sendLeaveRejectionEmail = async (employeeData, leaveData, rejectorData) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.subject = `Leave Rejected - ${leaveData.leave_name}`;
        sendSmtpEmail.to = [{ 
            email: employeeData.email, 
            name: employeeData.name 
        }];
        sendSmtpEmail.sender = { 
            email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com', 
            name: 'HR Management System' 
        };
        
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #ff4d4f; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
                    .details { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #ff4d4f; }
                    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .label { font-weight: bold; color: #666; }
                    .value { color: #333; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .status-badge { display: inline-block; padding: 5px 15px; background: #ff4d4f; color: white; border-radius: 3px; font-weight: bold; }
                    .reason-box { background: #fff2f0; border: 1px solid #ffccc7; padding: 15px; margin: 15px 0; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>❌ Leave Rejected</h2>
                    </div>
                    <div class="content">
                        <p>Dear <strong>${employeeData.name}</strong>,</p>
                        <p>Your leave application has been <span class="status-badge">REJECTED</span></p>
                        
                        <div class="details">
                            <h3 style="margin-top: 0;">Leave Details</h3>
                            <div class="details-row">
                                <span class="label">Leave Type:</span>
                                <span class="value">${leaveData.leave_name}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">From Date:</span>
                                <span class="value">${new Date(leaveData.from_date).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">To Date:</span>
                                <span class="value">${new Date(leaveData.to_date).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">Number of Days:</span>
                                <span class="value">${leaveData.number_of_days}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">Rejected By:</span>
                                <span class="value">${rejectorData.name}</span>
                            </div>
                        </div>
                        
                        ${leaveData.rejection_reason ? `
                        <div class="reason-box">
                            <strong>Rejection Reason:</strong>
                            <p style="margin: 10px 0 0 0;">${leaveData.rejection_reason}</p>
                        </div>
                        ` : ''}
                        
                        <p>If you have any questions regarding this rejection, please contact ${rejectorData.name} or HR department.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email. Please do not reply to this message.</p>
                        <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
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

// Send Leave Application Notification to Approver
export const sendLeaveApplicationNotification = async (approverData, employeeData, leaveData) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.subject = `New Leave Application - ${employeeData.name}`;
        sendSmtpEmail.to = [{ 
            email: approverData.email, 
            name: approverData.name 
        }];
        sendSmtpEmail.sender = { 
            email: process.env.SENDER_EMAIL || 'noreply@yourcompany.com', 
            name: 'HR Management System' 
        };
        
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #1890ff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
                    .details { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #1890ff; }
                    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .label { font-weight: bold; color: #666; }
                    .value { color: #333; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .action-btn { display: inline-block; padding: 12px 30px; background: #1890ff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🔔 New Leave Application</h2>
                    </div>
                    <div class="content">
                        <p>Dear <strong>${approverData.name}</strong>,</p>
                        <p>A new leave application requires your approval.</p>
                        
                        <div class="details">
                            <h3 style="margin-top: 0;">Application Details</h3>
                            <div class="details-row">
                                <span class="label">Employee:</span>
                                <span class="value">${employeeData.name}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">Leave Type:</span>
                                <span class="value">${leaveData.leave_name}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">From Date:</span>
                                <span class="value">${new Date(leaveData.from_date).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">To Date:</span>
                                <span class="value">${new Date(leaveData.to_date).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">Number of Days:</span>
                                <span class="value">${leaveData.number_of_days}</span>
                            </div>
                            ${leaveData.reason ? `
                            <div class="details-row">
                                <span class="label">Reason:</span>
                                <span class="value">${leaveData.reason}</span>
                            </div>
                            ` : ''}
                        </div>
                        
                        <p style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/leave" class="action-btn">
                                Review Application
                            </a>
                        </p>
                        
                        <p>Please review and take action on this leave application.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email. Please do not reply to this message.</p>
                        <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
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
import Brevo from '@getbrevo/brevo';
import moment from 'moment';

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

export const sendIndividualAttendanceReport = async ({ 
    employeeCode, employeeName, email, department, date,
    firstLogin, lastLogout, netTime, grossTime, breakTime,
    isEdited, editReason, totalLogins, totalLogouts,
    allLoginTimes, allLogoutTimes, sessions
}) => {
    try {
        const sessionsHTML = sessions && sessions.length > 0 ? `
            <div style="margin-bottom: 25px;">
                <h4 style="color: #1565c0; margin-bottom: 15px;">⏱️ Work Sessions (Paired IN-OUT)</h4>
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #e0e0e0;">
                    <thead>
                        <tr style="background-color: #e3f2fd; color: #1565c0;">
                            <th style="padding: 10px; border: 1px solid #e0e0e0;">#</th>
                            <th style="padding: 10px; border: 1px solid #e0e0e0;">Login</th>
                            <th style="padding: 10px; border: 1px solid #e0e0e0;">Logout</th>
                            <th style="padding: 10px; border: 1px solid #e0e0e0;">Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sessions.map((s, i) => `
                            <tr>
                                <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: center;">${i + 1}</td>
                                <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: center; color: #2e7d32; font-weight: 500;">${s.in}</td>
                                <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: center; color: #c62828; font-weight: 500;">${s.out}</td>
                                <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: center; font-weight: bold;">${s.duration}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : '';

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Attendance Report</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
                <div style="max-width: 700px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <div style="border-bottom: 3px solid #1976d2; padding-bottom: 15px; margin-bottom: 25px;">
                        <h2 style="color: #1565c0; margin: 0;">📋 Your Attendance Report</h2>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 15px 0;">Hello, ${employeeName}! 👋</h3>
                        <p style="margin: 5px 0;"><strong>Code:</strong> ${employeeCode}</p>
                        <p style="margin: 5px 0;"><strong>Department:</strong> ${department}</p>
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${moment(date).format('DD MMMM YYYY, dddd')}</p>
                    </div>

                    <!-- NET TIME (Active Work) -->
                    <div style="background-color: #e8f5e9; padding: 25px; border-radius: 8px; margin-bottom: 15px; border-left: 5px solid #2e7d32; ${isEdited ? 'border: 2px solid #ff9800;' : ''}">
                        <h3 style="margin: 0 0 15px 0; color: #2e7d32;">✅ Active Working Time (Net) ${isEdited ? '(Edited)' : ''}</h3>
                        <div style="font-size: 42px; font-weight: bold; color: ${isEdited ? '#ff9800' : '#2e7d32'}; text-align: center;">
                            ${netTime}
                        </div>
                        <p style="margin: 10px 0 0 0; text-align: center; color: #555; font-size: 13px;">
                            Sum of all work sessions (excluding breaks)
                        </p>
                        ${isEdited && editReason ? `
                        <div style="margin-top: 15px; padding: 10px; background-color: #fff3cd; border-radius: 4px;">
                            <p style="margin: 0; color: #856404; font-size: 12px;"><strong>Reason:</strong> ${editReason}</p>
                        </div>
                        ` : ''}
                    </div>

                    <!-- GROSS TIME (Total Presence) -->
                    <div style="background-color: #e3f2fd; padding: 25px; border-radius: 8px; margin-bottom: 15px; border-left: 5px solid #1976d2;">
                        <h3 style="margin: 0 0 15px 0; color: #1976d2;">🕐 Total Presence Time (Gross)</h3>
                        <div style="font-size: 42px; font-weight: bold; color: #1976d2; text-align: center;">
                            ${grossTime}
                        </div>
                        <p style="margin: 10px 0 0 0; text-align: center; color: #555; font-size: 13px;">
                            First login to last logout (including breaks)
                        </p>
                    </div>

                    <!-- BREAK TIME -->
                    <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 5px solid #ff9800; text-align: center;">
                        <h4 style="margin: 0 0 10px 0; color: #f57c00;">☕ Total Break Time</h4>
                        <div style="font-size: 28px; font-weight: bold; color: #f57c00;">
                            ${breakTime}
                        </div>
                    </div>

                    <div style="display: table; width: 100%; margin-bottom: 25px;">
                        <div style="display: table-cell; width: 50%; padding: 15px; background-color: #e8f5e9; border-radius: 8px 0 0 8px;">
                            <div style="text-align: center;">
                                <div style="font-size: 14px; color: #2e7d32; margin-bottom: 5px;">🟢 First Login</div>
                                <div style="font-size: 24px; font-weight: bold; color: #1b5e20;">${firstLogin}</div>
                            </div>
                        </div>
                        <div style="display: table-cell; width: 50%; padding: 15px; background-color: #ffebee; border-radius: 0 8px 8px 0;">
                            <div style="text-align: center;">
                                <div style="font-size: 14px; color: #c62828; margin-bottom: 5px;">🔴 Last Logout</div>
                                <div style="font-size: 24px; font-weight: bold; color: #b71c1c;">${lastLogout}</div>
                            </div>
                        </div>
                    </div>

                    ${sessionsHTML}

                    <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 20px 0;">
                        <p style="margin: 0; color: #856404; font-size: 13px;">
                            <strong>📌 Understanding Your Times:</strong><br>
                            • <strong>Net Time:</strong> Actual time you were actively working (sum of all sessions)<br>
                            • <strong>Gross Time:</strong> Total time from first login to last logout (includes breaks)<br>
                            • <strong>Break Time:</strong> Difference between gross and net time
                        </p>
                    </div>

                    <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 2px solid #f0f0f0; padding-top: 20px;">
                        <p style="margin: 5px 0;">© ${moment().format('YYYY')} HR Management System</p>
                        <p style="margin: 5px 0;">Generated: ${moment().format('DD MMM YYYY, hh:mm A')}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = `Attendance Report - ${moment(date).format('DD MMM YYYY')}`;
        sendSmtpEmail.htmlContent = htmlContent;
        sendSmtpEmail.sender = { name: "HR System", email: process.env.SENDER_EMAIL };
        sendSmtpEmail.to = [{ email }];

        return await apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
        console.error(`Error sending to ${email}:`, error.message);
        throw error;
    }
};

export const sendAttendanceReport = async (reportData, recipients, reportDate) => {
    try {
        const tableRows = reportData.map(r => `
            <tr>
                <td style="padding: 12px; border: 1px solid #e0e0e0;">${r.employee_code}</td>
                <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: center;">${r.in_time}</td>
                <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: center;">${r.out_time}</td>
                <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: center; font-weight: bold; color: #2e7d32;">${r.net_time}${r.is_edited ? ' ✏️' : ''}</td>
                <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: center; color: #1976d2;">${r.gross_time}</td>
            </tr>
        `).join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><title>HR Report</title></head>
            <body style="font-family: Arial; background: #f5f5f5; padding: 20px;">
                <div style="max-width: 1100px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
                    <h2 style="color: #1565c0; border-bottom: 3px solid #1976d2; padding-bottom: 15px;">
                        📊 Attendance Report - ${moment(reportDate).format('DD MMMM YYYY')}
                    </h2>
                    <p style="color: #666; margin: 20px 0;">
                        Total: ${reportData.length} | Edited: ${reportData.filter(r => r.is_edited).length}
                    </p>
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #e0e0e0;">
                        <thead>
                            <tr style="background: #1976d2; color: white;">
                                <th style="padding: 14px; border: 1px solid #e0e0e0;">Code</th>
                                <th style="padding: 14px; border: 1px solid #e0e0e0;">First In</th>
                                <th style="padding: 14px; border: 1px solid #e0e0e0;">Last Out</th>
                                <th style="padding: 14px; border: 1px solid #e0e0e0;">Net (Active)</th>
                                <th style="padding: 14px; border: 1px solid #e0e0e0;">Gross (Total)</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                    <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 4px;">
                        <p style="margin: 0; font-size: 13px; color: #1565c0;">
                            <strong>Net:</strong> Active work time (sum of sessions) | <strong>Gross:</strong> Total presence (first→last) | ✏️ = HR edited
                        </p>
                    </div>
                </div>
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
