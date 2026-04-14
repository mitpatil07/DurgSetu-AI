import os
import django
from django.contrib.auth import get_user_model

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def create_admin():
    User = get_user_model()
    username = 'admin@durgsetu'
    password = 'durgsetuai'
    email = 'admin@durgsetu.ai'

    if not User.objects.filter(username=username).exists():
        print(f"Creating superuser: {username}...")
        User.objects.create_superuser(
            username=username, 
            email=email, 
            password=password
        )
        print("Superuser created successfully.")
    else:
        print(f"Superuser '{username}' already exists. Skipping creation.")

if __name__ == "__main__":
    create_admin()
