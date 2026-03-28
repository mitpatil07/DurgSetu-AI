import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Load .env explicitly
load_dotenv('e:/DurgSetu_AI/backend/.env')

def test_smtp_connection():
    email_user = os.getenv("EMAIL_HOST_USER")
    email_pass = os.getenv("EMAIL_HOST_PASSWORD")
    
    print(f"Testing SMTP with User: {email_user}")
    
    msg = MIMEText("This is a test from DurgSetu AI.")
    msg['Subject'] = 'SMTP Test'
    msg['From'] = email_user
    msg['To'] = email_user # Send to self
    
    try:
        # Connect to Gmail SMTP
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(email_user, email_pass)
        server.send_message(msg)
        server.quit()
        print("Success! SMTP credentials are valid.")
        return True
    except Exception as e:
        print(f"Failure! SMTP connection failed: {e}")
        return False

if __name__ == "__main__":
    test_smtp_connection()
