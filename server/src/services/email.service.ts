import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = 'Onboarding <onboarding@resend.dev>'

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Email send error:', error)
    // Don't throw — email failures shouldn't break the main request
  }
}

export function taskAssignedEmail(employeeName: string, taskTitle: string, dueDate: string | null) {
  return {
    subject: `New onboarding task: ${taskTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #166534;">New task assigned</h2>
        <p>Hi ${employeeName},</p>
        <p>You've been assigned a new onboarding task:</p>
        <p style="background: #f0fdf4; border-left: 3px solid #166534; padding: 12px 16px; margin: 16px 0;">
          <strong>${taskTitle}</strong>
          ${dueDate ? `<br/><span style="color: #64748b; font-size: 14px;">Due: ${dueDate}</span>` : ''}
        </p>
        <p>Log in to your onboarding dashboard to get started.</p>
      </div>
    `,
  }
}

export function extensionResponseEmail(employeeName: string, taskTitle: string, approved: boolean) {
  return {
    subject: `Extension request ${approved ? 'approved' : 'rejected'}: ${taskTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: ${approved ? '#166534' : '#dc2626'};">
          Extension request ${approved ? 'approved' : 'rejected'}
        </h2>
        <p>Hi ${employeeName},</p>
        <p>Your request for more time on <strong>${taskTitle}</strong> has been ${approved ? 'approved' : 'rejected'} by your manager.</p>
        ${approved ? '<p>Your due date has been updated accordingly.</p>' : '<p>Please check in with your manager if you have questions.</p>'}
      </div>
    `,
  }
}

export function revisionRequestedEmail(employeeName: string, taskTitle: string, note: string) {
  return {
    subject: `Revision requested: ${taskTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #ca8a04;">Revision requested</h2>
        <p>Hi ${employeeName},</p>
        <p>Your manager has requested changes on <strong>${taskTitle}</strong>:</p>
        <p style="background: #fefce8; border-left: 3px solid #ca8a04; padding: 12px 16px; margin: 16px 0;">
          ${note}
        </p>
        <p>Log in to your dashboard to review and update the task.</p>
      </div>
    `,
  }
}