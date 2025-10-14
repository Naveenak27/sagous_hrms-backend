import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

export const sendLeaveNotification = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            html
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const sendLeaveApprovalEmail = async (employeeEmail, leaveName, status) => {
    const subject = `Leave ${status}`;
    const html = `
        <h2>Leave Application Update</h2>
        <p>Your ${leaveName} application has been ${status}.</p>
        <p>Please check the HR system for more details.</p>
    `;
    
    await sendLeaveNotification(employeeEmail, subject, html);
};
