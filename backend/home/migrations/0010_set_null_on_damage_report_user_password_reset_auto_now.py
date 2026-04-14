"""
- Change FortDamageReport.user on_delete from CASCADE to SET_NULL so that
  deleting a user account preserves their public damage reports.
- Change PasswordResetToken.created_at from auto_now_add to auto_now so the
  timestamp is refreshed each time update_or_create writes a new OTP, which
  resets the 10-minute expiry window correctly.
"""

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0009_passwordresettoken_otp_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='fortdamagereport',
            name='user',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name='passwordresettoken',
            name='created_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
