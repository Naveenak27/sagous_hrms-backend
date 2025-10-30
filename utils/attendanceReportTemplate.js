import moment from 'moment';


export const getAttendanceReportHTML = ({ 
    employeeName, employeeCode, department, date,
    firstLogin, lastLogout, netTime, grossTime, breakTime,
    isEdited, editReason, sessions
}) => {
return `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--<![endif]-->
    <title>Daily Attendance Report</title>
    <!--[if mso]>
    <style type="text/css">
        table {border-collapse: collapse; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt;}
        div, p {mso-line-height-rule: exactly;}
    </style>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 0;">
                
                <!-- Main Container -->
                <table cellpadding="0" cellspacing="0" border="0" width="680" style="background-color: #ffffff; margin: 0 auto; border-collapse: collapse;">
                    
                    <!-- Top Header Section (Black background) -->
<tr>
    <td style="background-color: #000000; padding: 30px 25px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
            <tr>
                <!-- Left: Circle Avatar + Employee Details -->
                <td width="60%" valign="middle">
                    <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                        <tr>
                            <td valign="middle" style="padding-right: 20px;">
                                <!-- White Circle Avatar -->
                                <!--[if mso]>
                                <v:oval xmlns:v="urn:schemas-microsoft-com:vml" style="width:90px;height:90px;" fillcolor="#ffffff" strokecolor="#ffffff" strokeweight="0">
                                    <v:textbox style="mso-fit-shape-to-text:true">
                                        <center style="font-size:40px; font-weight:700; color:#000000; font-family:Arial, sans-serif; padding-top:20px;">
                                            ${employeeName.charAt(0).toUpperCase()}
                                        </center>
                                    </v:textbox>
                                </v:oval>
                                <![endif]-->
                                <!--[if !mso]><!-->
                                <div align="center" style="width: 90px; height: 90px; border-radius: 50%; background-color: #ffffff; font-size: 40px; font-weight: 700; color: #000000; line-height: 90px; display: inline-block; text-align: center;">
                                    ${employeeName.charAt(0).toUpperCase()}
                                </div>
                                <!--<![endif]-->
                            </td>
                            <td valign="middle">
                                <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                                    <tr>
                                        <td style="padding-bottom: 8px;">
                                            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #0fad0f; line-height: 1; font-family: Arial, sans-serif;">${employeeName}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 4px;">
                                            <p style="margin: 0; font-size: 11px; color: #0fad0f; line-height: 1.3; font-family: Arial, sans-serif; mso-line-height-rule: exactly;"><span style="font-weight: 600;">Employee code:</span> <span style="color: #ffffff;">${employeeCode}</span></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 4px;">
                                            <p style="margin: 0; font-size: 11px; color: #0fad0f; line-height: 1.3; font-family: Arial, sans-serif; mso-line-height-rule: exactly;"><span style="font-weight: 600;">Department:</span> <span style="color: #ffffff;">${department}</span></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p style="margin: 0; font-size: 11px; color: #0fad0f; line-height: 1.3; font-family: Arial, sans-serif; mso-line-height-rule: exactly;"><span style="font-weight: 600;">Report date:</span> <span style="color: #ffffff;">${moment(date).format('DD MMM YY')}</span></p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
                
                <!-- Right: Logo -->
                <td width="40%" valign="middle" align="right">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                        <tr>
                            <td align="right" style="padding-bottom: 15px;">
                                <p style="margin: 0; font-size: 32px; font-weight: 900; color: #ffffff; letter-spacing: 1px; line-height: 1; text-decoration: underline; font-family: Arial, sans-serif;">SAGOUS</p>
                                <p style="margin: 3px 0 0 0; font-size: 7px; color: #ffffff; letter-spacing: 1px; line-height: 1; font-family: Arial, sans-serif;">WHERE SERVICE MEETS TECHNOLOGY</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="right">
                                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #ffffff; line-height: 1; font-family: Arial, sans-serif;">Daily Attendance Report</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </td>
</tr>

<!-- Green Separator Line -->
<tr>
    <td style="background-color: #000000; padding: 0 25px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
            <tr>
                <td style="border-top: 2px solid #00ff00; line-height: 0; font-size: 0;">&nbsp;</td>
            </tr>
        </table>
    </td>
</tr>
                    
                    <!-- Login and Logout Details Header -->
                    <tr>
                        <td style="background-color: #000000; padding: 12px 25px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0; font-size: 20px; font-weight: 700; color: #54e36d; line-height: 1; font-family: Arial, sans-serif;">Login and Logout Details</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- First Login and Last Logout Cards -->
                    <!-- First Login and Last Logout Cards -->
<!-- First Login and Last Logout Cards -->
<tr>
    <td style="background-color: #ffffff; padding: 20px 25px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
            <tr>
                <!-- First Login Card -->
                <td width="305" valign="top" style="padding-right: 12px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #0fad0f; border-radius: 20px; border-collapse: separate; overflow: hidden;">
                        <tr>
                            <td align="center" style="padding: 14px 15px; background-color: #0fad0f;">
                                <p style="margin: 0; font-size: 18px; font-weight: 700; color: #000000; line-height: 1; font-family: Arial, sans-serif;">First Login</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 28px 15px; background-color: #f8fcf8;">
                                <p style="margin: 0; font-size: 48px; font-weight: 700; color: #000000; line-height: 1; font-family: Arial, sans-serif;">${firstLogin}</p>
                            </td>
                        </tr>
                    </table>
                </td>
                
                <!-- Last Logout Card -->
                <td width="305" valign="top" style="padding-left: 12px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #d3302f; border-radius: 20px; border-collapse: separate; overflow: hidden;">
                        <tr>
                            <td align="center" style="padding: 14px 15px; background-color: #d3302f;">
                                <p style="margin: 0; font-size: 18px; font-weight: 700; color: #fff9f9; line-height: 1; font-family: Arial, sans-serif;">Last Logout</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 28px 15px; background-color: #ffffff;">
                                <p style="margin: 0; font-size: 48px; font-weight: 700; color: #000000; line-height: 1; font-family: Arial, sans-serif;">${lastLogout}</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </td>
</tr>

                    
<!-- Daily Work Time Overview Header -->
<tr>
    <td style="background-color: #000000; padding: 12px 25px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
            <tr>
                <td align="center">
                    <p style="margin: 0; font-size: 20px; font-weight: 700; color: #54e36d; line-height: 1; font-family: Arial, sans-serif;">Daily Work Time Overview</p>
                </td>
            </tr>
        </table>
    </td>
</tr>

<!-- Three Time Cards -->
<tr>
    <td style="background-color: #ffffff; padding: 20px 25px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
            <tr>
                <!-- Active Working Time -->
                <td width="195" valign="top" style="padding-right: 12px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #333333; border-radius: 20px; border-collapse: separate; overflow: hidden;">
                        <tr>
                            <td align="center" style="padding: 12px 8px; background-color: #000000;">
                                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #ffffff; line-height: 1.2; font-family: Arial, sans-serif;">Active Working Time</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 25px 10px 8px 10px; background-color: #ffffff;">
                                <p style="margin: 0; font-size: 42px; font-weight: 700; color: #000000; line-height: 1; font-family: Arial, sans-serif;">${netTime}</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 0 8px 12px 8px; background-color: #ffffff;">
                                <p style="margin: 0; font-size: 9px; color: #666666; line-height: 1.3; font-family: Arial, sans-serif;">Sum of all work sessions<br>(excluding breaks)</p>
                            </td>
                        </tr>
                    </table>
                </td>
                
                <!-- Total Presence Time -->
                <td width="195" valign="top" style="padding: 0 6px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #333333; border-radius: 20px; border-collapse: separate; overflow: hidden;">
                        <tr>
                            <td align="center" style="padding: 12px 8px; background-color: #000000;">
                                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #ffffff; line-height: 1.2; font-family: Arial, sans-serif;">Total Presence Time</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 25px 10px 8px 10px; background-color: #ffffff;">
                                <p style="margin: 0; font-size: 42px; font-weight: 700; color: #000000; line-height: 1; font-family: Arial, sans-serif;">${grossTime}</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 0 8px 12px 8px; background-color: #ffffff;">
                                <p style="margin: 0; font-size: 9px; color: #666666; line-height: 1.3; font-family: Arial, sans-serif;">Time from login to last logout<br>(including breaks)</p>
                            </td>
                        </tr>
                    </table>
                </td>
                
                <!-- Total Break Time -->
                <td width="195" valign="top" style="padding-left: 12px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #333333; border-radius: 20px; border-collapse: separate; overflow: hidden;">
                        <tr>
                            <td align="center" style="padding: 12px 8px; background-color: #000000;">
                                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #ffffff; line-height: 1.2; font-family: Arial, sans-serif;">Total Break Time</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 25px 10px 8px 10px; background-color: #ffffff;">
                                <p style="margin: 0; font-size: 42px; font-weight: 700; color: #000000; line-height: 1; font-family: Arial, sans-serif;">${breakTime}</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 0 8px 12px 8px; background-color: #ffffff;">
                                <p style="margin: 0; font-size: 9px; color: #666666; line-height: 1.3; font-family: Arial, sans-serif;">Sum of all work breaks<br>(including Tea breaks)</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </td>
</tr>
                    
                    ${isEdited && editReason ? `
                    <!-- Edit Notice -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 0 25px 20px 25px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fff8e6; border-left: 5px solid #ff9800; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 15px 18px;">
                                        <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #ff9800; letter-spacing: 0.5px; text-transform: uppercase; font-family: Arial, sans-serif;">⚠️ ATTENDANCE EDITED</p>
                                        <p style="margin: 0; font-size: 12px; color: #856404; line-height: 1.4; font-family: Arial, sans-serif; mso-line-height-rule: exactly;">${editReason}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    ` : ''}
                    
                    ${sessions && sessions.length > 0 ? `
                    <!-- PDF Notice -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 0 25px 20px 25px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #e8f5e9; border-left: 5px solid #00cc00; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 15px 18px;">
                                        <p style="margin: 0; font-size: 12px; color: #2e7d32; line-height: 1.4; font-family: Arial, sans-serif; mso-line-height-rule: exactly;">📎 <strong style="color: #00cc00;">Detailed work sessions</strong> (login/logout times) are attached as a PDF file.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    ` : ''}
                    
                    <!-- Note Section -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 0 25px 30px 25px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                                <tr>
                                    <td style="padding-bottom: 8px;">
                                        <p style="margin: 0; font-size: 11px; font-weight: 700; color: #000000; font-family: Arial, sans-serif;">*Note:</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 4px 0; font-size: 10px; color: #666666; line-height: 1.4; font-family: Arial, sans-serif; mso-line-height-rule: exactly;">Net Time: Actual time you were actively working (sum of all sessions)</p>
                                        <p style="margin: 0 0 4px 0; font-size: 10px; color: #666666; line-height: 1.4; font-family: Arial, sans-serif; mso-line-height-rule: exactly;">Gross Time: Total time from first login to last logout (includes breaks)</p>
                                        <p style="margin: 0; font-size: 10px; color: #666666; line-height: 1.4; font-family: Arial, sans-serif; mso-line-height-rule: exactly;">Break Time: Difference between gross and net time</p>
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
};

