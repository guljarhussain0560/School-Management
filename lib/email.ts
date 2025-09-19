import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export interface EmailTemplate {
  to: string
  subject: string
  html: string
}

export const sendEmail = async ({ to, subject, html }: EmailTemplate) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

export const generateCredentialsEmail = (
  name: string,
  email: string,
  password: string,
  role: 'TEACHER' | 'TRANSPORT'
) => {
  const roleName = role === 'TEACHER' ? 'Teacher' : 'Transport Manager'
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`
  
  return {
    to: email,
    subject: `Welcome to Tayog School Suite - ${roleName} Credentials`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to Tayog School Suite</h2>
        <p>Hello ${name},</p>
        <p>Your ${roleName} account has been created successfully. Here are your login credentials:</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Role:</strong> ${roleName}</p>
        </div>
        
        <p>Please log in using these credentials and change your password after your first login.</p>
        
        <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Login to Dashboard
        </a>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If you have any questions, please contact your school administrator.
        </p>
      </div>
    `
  }
}

export const generatePasswordResetEmail = (name: string, email: string, resetToken: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
  
  return {
    to: email,
    subject: 'Password Reset - Tayog School Suite',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>You have requested to reset your password. Click the button below to reset it:</p>
        
        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Reset Password
        </a>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    `
  }
}
