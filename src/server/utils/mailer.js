import nodemailer from 'nodemailer'

export function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !port || !user || !pass) {
    throw new Error('SMTP env vars missing (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)')
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  })
}

export async function sendOwnerSignupNotification({ requesterEmail }) {
  const to = process.env.OWNER_EMAIL
  if (!to) throw new Error('OWNER_EMAIL env var missing')
  const transporter = getTransporter()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const link = siteUrl ? `${siteUrl}/admin/access` : '/admin/access'
  const subject = `Admin access request: ${requesterEmail}`
  const text = `A new admin access request is pending approval.\n\nRequester: ${requesterEmail}\nApprove here: ${link}`
  const html = `<p>A new admin access request is pending approval.</p><p><strong>Requester:</strong> ${requesterEmail}</p><p><a href="${link}">Open approvals dashboard</a></p>`
  await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text, html })
}

