import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from flask import current_app, render_template


def send_template_email(to, subject, template_name, context=None):
    """Send a styled HTML email using the configured SMTP account."""
    if not to:
        return False

    context = context or {}
    app = current_app._get_current_object()
    html_body = render_template(f'emails/{template_name}.html', **context)

    sender = app.config.get('MAIL_USERNAME') or os.getenv('MAIL_USERNAME')
    password = app.config.get('MAIL_PASSWORD') or os.getenv('MAIL_PASSWORD')
    if not sender or not password:
        app.logger.warning('Mail credentials are not configured; skipping email send.')
        return False

    recipients = [to] if isinstance(to, str) else list(to)
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f'PlomApp <{sender}>'
    msg['To'] = ', '.join(recipients)

    text_body = context.get('text_body') or 'Gracias por usar PlomApp.'
    msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    try:
        mail_server = app.config.get('MAIL_SERVER') or os.getenv('MAIL_SERVER', 'smtp.gmail.com')
        mail_port = int(app.config.get('MAIL_PORT') or os.getenv('MAIL_PORT', 587))
        mail_use_ssl = os.getenv('MAIL_USE_SSL', 'False').lower() in {'1', 'true', 'yes', 'on'}
        mail_use_tls = (app.config.get('MAIL_USE_TLS', True) or os.getenv('MAIL_USE_TLS', 'True').lower()) in {'1', 'true', 'yes', 'on'}
        
        # Use SSL (port 465) or TLS (port 587)
        if mail_use_ssl:
            server = smtplib.SMTP_SSL(mail_server, mail_port)
        else:
            server = smtplib.SMTP(mail_server, mail_port)
            if mail_use_tls:
                server.starttls()
        
        server.login(sender, password)
        server.sendmail(sender, recipients, msg.as_string())
        server.quit()
        return True
    except Exception as exc:
        app.logger.exception('Error sending email: %s', exc)
        return False
