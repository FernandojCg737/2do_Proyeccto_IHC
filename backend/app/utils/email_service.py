import smtplib
import random
import string
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

def _get_mail_credentials():
    """Lee las credenciales del .env en cada llamada (no cacheado) y valida ASCII."""
    username = os.getenv("MAIL_USERNAME", "")
    password = os.getenv("MAIL_PASSWORD", "")
    try:
        # SMTP PLAIN auth requiere ASCII puro — falla con ñ, tildes, etc.
        username.encode("ascii")
        password.encode("ascii")
    except UnicodeEncodeError as e:
        raise ValueError(
            f"MAIL_USERNAME o MAIL_PASSWORD contiene caracteres no ASCII: {e}. "
            "Asegúrate de usar una Contraseña de Aplicación de Google (solo letras y dígitos)."
        )
    return username, password


def generate_reset_code(length: int = 6) -> str:
    """Genera un código numérico aleatorio de 6 dígitos."""
    return ''.join(random.choices(string.digits, k=length))


def send_reset_code_email(to_email: str, code: str, user_name: str = "") -> None:
    """
    Envía el código de verificación al correo del usuario usando Gmail SMTP.
    Requiere MAIL_USERNAME y MAIL_PASSWORD en .env (Contraseña de aplicación de Google).
    """
    subject = "StudyMatch – Código de verificación para restablecer contraseña"

    greeting = f"Hola{', ' + user_name if user_name else ''},"

    html_body = f"""
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Código de verificación – StudyMatch</title>
</head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);
                      border-radius:20px;border:1px solid rgba(99,102,241,0.3);
                      box-shadow:0 20px 60px rgba(0,0,0,0.5);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                🎓 StudyMatch
              </h1>
              <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">
                Plataforma de Grupos de Estudio
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="color:#e2e8f0;font-size:16px;margin:0 0 12px;">{greeting}</p>
              <p style="color:#94a3b8;font-size:15px;margin:0 0 28px;line-height:1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                Usa el siguiente código de verificación:
              </p>

              <!-- Code box -->
              <div style="background:rgba(99,102,241,0.12);border:2px solid rgba(99,102,241,0.5);
                          border-radius:16px;padding:28px;text-align:center;margin:0 0 28px;">
                <p style="color:#94a3b8;font-size:12px;margin:0 0 12px;text-transform:uppercase;letter-spacing:2px;">
                  Código de verificación
                </p>
                <span style="color:#a5b4fc;font-size:48px;font-weight:800;letter-spacing:12px;font-family:monospace;">
                  {code}
                </span>
                <p style="color:#f97316;font-size:12px;margin:16px 0 0;">
                  ⏱ Válido por <strong>10 minutos</strong>
                </p>
              </div>

              <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">
                Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
                Tu contraseña actual permanecerá sin cambios.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:rgba(0,0,0,0.3);padding:20px 40px;text-align:center;
                       border-top:1px solid rgba(255,255,255,0.06);">
              <p style="color:#475569;font-size:12px;margin:0;">
                © 2026 StudyMatch · Ingeniería Informática y Sistemas
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    plain_body = (
        f"{greeting}\n\n"
        f"Tu código de verificación para restablecer la contraseña en StudyMatch es:\n\n"
        f"  {code}\n\n"
        f"Este código es válido por 10 minutos.\n\n"
        f"Si no solicitaste este cambio, ignora este correo.\n\n"
        f"-- StudyMatch"
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject

    mail_user, mail_pass = _get_mail_credentials()
    msg["From"] = f"StudyMatch <{mail_user}>"
    msg["To"] = to_email

    msg.attach(MIMEText(plain_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(mail_user, mail_pass)
        server.sendmail(mail_user, to_email, msg.as_string())


