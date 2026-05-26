const nodemailer = require("nodemailer");

// Check if SMTP is configured
const isSmtpConfigured =
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

let transporter = null;
if (isSmtpConfigured) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log("[Email Service] SMTP transporter initialized successfully.");
  } catch (err) {
    console.error("[Email Service] Transporter initialization failed:", err);
  }
} else {
  console.log(
    "[Email Service] SMTP configuration missing. Defaulting to terminal mock-logging."
  );
}

/**
 * Mock email logger fallback
 */
function logMockEmail({ to, subject, html, text }) {
  console.log("\n==================================================");
  console.log("             MOCK EMAIL NOTIFICATION              ");
  console.log("==================================================");
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log("--------------------------------------------------");
  console.log(`Text Body:\n${text || "No text body provided"}`);
  console.log("--------------------------------------------------");
  console.log(`HTML Body Preview (First 800 chars):\n${html.slice(0, 800)}...`);
  console.log("==================================================\n");
}

/**
 * Send email helper
 */
const sendMail = async ({ to, subject, html, text }) => {
  const from = process.env.FROM_EMAIL || "no-reply@project-to-job.com";

  if (isSmtpConfigured && transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"Project-to-Job" <${from}>`,
        to,
        subject,
        text,
        html
      });
      console.log(`[Email Service] Real email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`[Email Service] Failed to send email to ${to}, falling back to console:`, error);
      logMockEmail({ to, subject, html, text });
    }
  } else {
    logMockEmail({ to, subject, html, text });
  }
};

/**
 * Common HTML wrapper with premium slate/indigo styling
 */
const getHtmlTemplate = (title, previewText, contentHtml) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .logo {
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
      text-decoration: none;
      display: inline-block;
    }
    .logo span {
      color: #818cf8;
    }
    .content {
      padding: 32px 24px;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .details-box {
      background-color: #f1f5f9;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
    }
    .details-row {
      margin-bottom: 12px;
      display: table;
      width: 100%;
    }
    .details-row:last-child {
      margin-bottom: 0;
    }
    .details-label {
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      display: table-cell;
      width: 120px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .details-value {
      font-size: 14px;
      color: #1e293b;
      font-weight: 500;
      display: table-cell;
    }
    .quote-box {
      border-left: 4px solid #4f46e5;
      background-color: #eef2ff;
      padding: 16px;
      border-radius: 0 12px 12px 0;
      margin-bottom: 24px;
      font-style: italic;
      color: #3730a3;
    }
    .button-container {
      text-align: center;
      margin: 32px 0 16px 0;
    }
    .btn {
      display: inline-block;
      padding: 12px 28px;
      background-color: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.25);
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
    .footer a {
      color: #4f46e5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">Project<span>2</span>Job</div>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <p style="margin: 0; font-size: 12px; color: #64748b;">
          This is an automated email from <a href="http://localhost:5173">Project2Job</a>.
        </p>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} Project2Job. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Send shortlisting notification email to student
 */
exports.sendShortlistedEmail = async (student, company, project) => {
  const companyName = company.companyName || company.name;
  const subject = `🎉 Congratulations! You've been shortlisted by ${companyName}`;
  const previewText = `You have been shortlisted for your project: ${project.title}.`;

  const contentHtml = `
    <h1>You've Been Shortlisted!</h1>
    <p>Hi ${student.name},</p>
    <p>Great news! <strong>${companyName}</strong> has shortlisted you after reviewing your project portfolio. They were impressed by your work and code proof score.</p>
    
    <div class="details-box">
      <div class="details-row">
        <div class="details-label">Project:</div>
        <div class="details-value">${project.title}</div>
      </div>
      <div class="details-row">
        <div class="details-label">Company:</div>
        <div class="details-value">${companyName}</div>
      </div>
      <div class="details-row">
        <div class="details-label">Proof Score:</div>
        <div class="details-value">${project.proofScore || 0}/100</div>
      </div>
    </div>

    <p>Please keep an eye on your dashboard for upcoming interview requests or direct communications from the hiring team.</p>

    <div class="button-container">
      <a href="http://localhost:5173/student/dashboard" class="btn">View Student Dashboard</a>
    </div>
  `;

  await sendMail({
    to: student.email,
    subject,
    text: `Hi ${student.name}, you have been shortlisted by ${companyName} for your project "${project.title}". Check your dashboard for more details.`,
    html: getHtmlTemplate(subject, previewText, contentHtml)
  });
};

/**
 * Send interview invitation to student
 */
exports.sendInterviewRequestEmail = async (student, company, project, message) => {
  const companyName = company.companyName || company.name;
  const subject = `✉️ Interview Invitation from ${companyName}`;
  const previewText = `You have a new interview invitation for your project: ${project.title}.`;

  const contentHtml = `
    <h1>New Interview Request</h1>
    <p>Hi ${student.name},</p>
    <p><strong>${companyName}</strong> would like to schedule an interview with you regarding your project: <strong>${project.title}</strong>.</p>
    
    <div class="details-box">
      <div class="details-row">
        <div class="details-label">Project:</div>
        <div class="details-value">${project.title}</div>
      </div>
      <div class="details-row">
        <div class="details-label">Company:</div>
        <div class="details-value">${companyName}</div>
      </div>
    </div>

    <p><strong>Message from recruiter:</strong></p>
    <div class="quote-box">
      "${message || "We are interested in your project and would like to discuss it further."}"
    </div>

    <p>Please log in to your dashboard to accept or decline this interview request.</p>

    <div class="button-container">
      <a href="http://localhost:5173/student/dashboard" class="btn">Respond to Request</a>
    </div>
  `;

  await sendMail({
    to: student.email,
    subject,
    text: `Hi ${student.name}, ${companyName} has invited you to an interview for "${project.title}". Message: "${message}". Please respond in your dashboard.`,
    html: getHtmlTemplate(subject, previewText, contentHtml)
  });
};

/**
 * Send interview acceptance/rejection response to company recruiter
 */
exports.sendInterviewResponseEmail = async (company, student, status, studentNotes) => {
  const studentName = student.name;
  const subject = `Response: ${studentName} has ${status} your interview invitation`;
  const previewText = `${studentName} has ${status} the interview request.`;

  const contentHtml = `
    <h1>Interview Invitation Response</h1>
    <p>Hi ${company.name},</p>
    <p>Candidate <strong>${studentName}</strong> has <strong>${status}</strong> your interview invitation.</p>
    
    <div class="details-box">
      <div class="details-row">
        <div class="details-label">Candidate:</div>
        <div class="details-value">${studentName}</div>
      </div>
      <div class="details-row">
        <div class="details-label">Response:</div>
        <div class="details-value" style="font-weight: bold; color: ${status === "accepted" ? "#16a34a" : "#dc2626"};">
          ${status.toUpperCase()}
        </div>
      </div>
    </div>

    ${studentNotes ? `
    <p><strong>Candidate Notes:</strong></p>
    <div class="quote-box">
      "${studentNotes}"
    </div>
    ` : ""}

    ${status === "accepted" ? `
    <p>Since the candidate accepted, you can now schedule the date, time, and set up a meeting link (Google Meet, Zoom, etc.) in your recruiter dashboard.</p>
    <div class="button-container">
      <a href="http://localhost:5173/company/dashboard" class="btn">Schedule Interview Now</a>
    </div>
    ` : `
    <p>You can browse other high-quality verified candidates on the platform.</p>
    <div class="button-container">
      <a href="http://localhost:5173/company/dashboard" class="btn">Browse Candidates</a>
    </div>
    `}
  `;

  await sendMail({
    to: company.email,
    subject,
    text: `Hi ${company.name}, candidate ${studentName} has ${status} your interview invitation.${studentNotes ? ` Notes: "${studentNotes}"` : ""}`,
    html: getHtmlTemplate(subject, previewText, contentHtml)
  });
};

/**
 * Send final meeting schedule confirmation to BOTH student and company
 */
exports.sendInterviewScheduledEmail = async (student, company, project, scheduledAt, meetingLink, companyNotes) => {
  const companyName = company.companyName || company.name;
  const isValidDate = scheduledAt && !isNaN(new Date(scheduledAt).getTime());
  const formattedDate = isValidDate
    ? new Date(scheduledAt).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short"
      })
    : "To be decided / To be scheduled";

  const subject = `📅 Confirmed: Interview Scheduled with ${companyName}`;
  const previewText = `Your interview with ${companyName} is scheduled for ${formattedDate}.`;

  const getBodyHtml = (recipientName, isStudent) => `
    <h1>Interview Confirmed & Scheduled</h1>
    <p>Hi ${recipientName},</p>
    <p>The interview between <strong>${student.name}</strong> and <strong>${companyName}</strong> regarding the project "<strong>${project.title}</strong>" is officially scheduled.</p>
    
    <div class="details-box">
      <div class="details-row">
        <div class="details-label">Date & Time:</div>
        <div class="details-value" style="font-weight: 700; color: #4f46e5;">${formattedDate}</div>
      </div>
      <div class="details-row">
        <div class="details-label">Project:</div>
        <div class="details-value">${project.title}</div>
      </div>
      <div class="details-row">
        <div class="details-label">Meeting Link:</div>
        <div class="details-value"><a href="${meetingLink}" target="_blank" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">Join Meeting</a></div>
      </div>
    </div>

    ${companyNotes ? `
    <p><strong>Recruiter Notes / Instructions:</strong></p>
    <div class="quote-box">
      "${companyNotes}"
    </div>
    ` : ""}

    <p>${isStudent ? "Please log in to your dashboard to review details or join the meeting when scheduled." : "You can manage or reschedule this interview in your dashboard."}</p>

    <div class="button-container">
      <a href="${meetingLink}" class="btn" style="background-color: #10b981;">Join Call</a>
    </div>
  `;

  // Send to Student
  await sendMail({
    to: student.email,
    subject,
    text: `Hi ${student.name}, your interview with ${companyName} is scheduled for ${formattedDate}. Link: ${meetingLink}. ${companyNotes ? `Notes: "${companyNotes}"` : ""}`,
    html: getHtmlTemplate(subject, previewText, getBodyHtml(student.name, true))
  });

  // Send to Recruiter (company user)
  await sendMail({
    to: company.email,
    subject,
    text: `Hi ${company.name}, your interview with ${student.name} is scheduled for ${formattedDate}. Link: ${meetingLink}. ${companyNotes ? `Notes: "${companyNotes}"` : ""}`,
    html: getHtmlTemplate(subject, previewText, getBodyHtml(company.name, false))
  });
};
