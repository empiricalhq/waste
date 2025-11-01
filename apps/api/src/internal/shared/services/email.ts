import { Resend } from 'resend';
import type { EmailConfig } from '@/internal/shared/config/config';

export class EmailService {
  private resend: Resend;
  private fromEmail: string;
  private fromName: string;

  constructor(config: EmailConfig) {
    this.resend = new Resend(config.resendApiKey);
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName;
  }

  async sendPasswordResetEmail(to: string, resetUrl: string, userName?: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [to],
        subject: 'Restablecer tu contraseña - Lima Limpia',
        html: this.generatePasswordResetHtml(resetUrl, userName),
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  private generatePasswordResetHtml(resetUrl: string, userName?: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h1 style="color: #22c55e; margin: 0 0 20px 0; font-size: 24px;">Lima Limpia</h1>
    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Restablecer tu contraseña</h2>
    
    ${userName ? `<p style="margin: 0 0 15px 0;">Hola ${userName},</p>` : ''}
    
    <p style="margin: 0 0 15px 0;">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en Lima Limpia.
    </p>
    
    <p style="margin: 0 0 25px 0;">
      Haz clic en el siguiente botón para establecer una nueva contraseña:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" 
         style="background-color: #22c55e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
        Restablecer Contraseña
      </a>
    </div>
    
    <p style="margin: 20px 0 15px 0; font-size: 14px; color: #666;">
      O copia y pega este enlace en tu navegador:
    </p>
    <p style="margin: 0 0 15px 0; font-size: 14px; word-break: break-all; color: #666;">
      ${resetUrl}
    </p>
    
    <p style="margin: 25px 0 15px 0; font-size: 14px; color: #666;">
      Este enlace expirará en 1 hora por razones de seguridad.
    </p>
    
    <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
      Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.
    </p>
  </div>
  
  <div style="text-align: center; color: #999; font-size: 12px; padding: 20px 0;">
    <p style="margin: 0 0 5px 0;">© ${new Date().getFullYear()} Lima Limpia. Todos los derechos reservados.</p>
    <p style="margin: 0;">Sistema de Gestión de Residuos Urbanos</p>
  </div>
</body>
</html>
    `.trim();
  }
}
