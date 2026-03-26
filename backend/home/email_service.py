# backend/home/email_service.py
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

SEV_COLOUR = {
    "critical": "#A01008",
    "high":     "#C04010",
    "medium":   "#8A6010",
    "low":      "#2A7A3E",
}

SEV_LABEL = {
    "critical": "🚨 CRITICAL",
    "high":     "🔴 HIGH",
    "medium":   "🟠 MEDIUM",
    "low":      "🟡 LOW",
}

STATUS_LABEL = {
    "submitted":    "Submitted",
    "under_review": "Under Review",
    "in_progress":  "Repair In Progress",
    "resolved":     "Resolved",
    "dismissed":    "No Action Required",
}

STATUS_MESSAGE = {
    "submitted":    ("Your report has been received.", "Our team will begin reviewing it shortly."),
    "under_review": ("Your report is under review.", "Heritage experts are assessing the damage at your reported location."),
    "in_progress":  ("Action is being taken!", "Repair or conservation work has been initiated at the reported section."),
    "resolved":     ("The issue has been resolved.", "The reported damage has been addressed. Thank you for your vigilance in protecting our heritage."),
    "dismissed":    ("Your report has been recorded.", "After assessment, no structural intervention is required at this stage. The site will be monitored."),
}


def _base_html_wrap(content_html, title_line):
    return f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<style>
  body{{margin:0;padding:0;background:#f2ead8;font-family:Georgia,'Times New Roman',serif;}}
  a{{color:#D4580A;}}
</style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2ead8;padding:36px 20px;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0"
       style="background:#fffcf5;border:1px solid #c9a820;border-radius:3px;overflow:hidden;
              box-shadow:0 4px 24px rgba(0,0,0,.14);">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#420C0C,#7A1A1A);padding:26px 32px;text-align:center;">
    <p style="margin:0;font-size:1.7rem;font-weight:700;color:#f5e090;letter-spacing:1px;">🏰 DurgSetu</p>
    <p style="margin:5px 0 0;font-size:.62rem;letter-spacing:3px;text-transform:uppercase;
              color:rgba(245,224,144,.65);">Heritage Guardian System · महाराष्ट्र</p>
    <div style="margin:10px auto 0;height:2px;width:100px;
                background:linear-gradient(90deg,transparent,#ddb840,transparent);"></div>
    <p style="margin:10px 0 0;font-size:.72rem;letter-spacing:2px;text-transform:uppercase;
              color:rgba(245,224,144,.75);">{title_line}</p>
  </td></tr>

  <!-- Body -->
  {content_html}

  <!-- Footer -->
  <tr><td style="background:#f2ead8;border-top:1px solid rgba(191,144,32,.2);
                 padding:14px 32px;text-align:center;">
    <p style="margin:0;font-size:.75rem;color:#7a6040;font-style:italic;">
      DurgSetu Heritage Guardian System &nbsp;·&nbsp; जय महाराष्ट्र<br/>
      <span style="font-size:.68rem;">This is an automated notification. Please do not reply directly to this email.</span>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>"""


def send_authority_notification(report, suggestions):
    sev_col   = SEV_COLOUR.get(report.severity, "#7A1A1A")
    sev_label = SEV_LABEL.get(report.severity, report.severity.upper())

    top_actions = suggestions[:3]
    actions_html = "".join([
        f"""<tr><td style="padding:8px 0;border-bottom:1px solid rgba(191,144,32,.15);">
          <table cellpadding="0" cellspacing="0" width="100%"><tr>
            <td style="font-size:1.3rem;width:36px;vertical-align:top;padding-top:2px;">{a['icon']}</td>
            <td>
              <p style="margin:0 0 2px;font-weight:700;font-size:.88rem;color:#2e1e0e;">{a['title']}</p>
              <p style="margin:0 0 3px;font-size:.85rem;color:#4a3218;line-height:1.55;">{a['description']}</p>
              <span style="font-size:.68rem;color:#7a6040;background:rgba(191,144,32,.1);
                           border:1px solid rgba(191,144,32,.22);border-radius:10px;padding:1px 8px;">
                ⏱ {a['timeline']}</span>
            </td>
          </tr></table>
        </td></tr>"""
        for a in top_actions
    ])

    content = f"""
  <tr><td style="background:{sev_col};padding:12px 32px;text-align:center;">
    <p style="margin:0;color:#fff;font-weight:700;font-size:.85rem;letter-spacing:2px;text-transform:uppercase;">
      NEW REPORT — {sev_label}
    </p>
  </td></tr>
  <tr><td style="padding:24px 32px 0;">
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#faf2e0;border:1px solid rgba(191,144,32,.28);border-radius:3px;padding:0;
                  margin-bottom:20px;overflow:hidden;">
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid rgba(191,144,32,.15);width:35%;">
          <p style="margin:0;font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:#7a6040;">Reference</p>
          <p style="margin:3px 0 0;font-size:.95rem;font-weight:700;color:#1c1208;">{report.reference_number}</p>
        </td>
        <td style="padding:10px 16px;border-bottom:1px solid rgba(191,144,32,.15);width:35%;">
          <p style="margin:0;font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:#7a6040;">Submitted</p>
          <p style="margin:3px 0 0;font-size:.9rem;color:#2e1e0e;">{report.submitted_at.strftime('%d %b %Y, %I:%M %p')}</p>
        </td>
        <td style="padding:10px 16px;border-bottom:1px solid rgba(191,144,32,.15);">
          <p style="margin:0;font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:#7a6040;">Severity</p>
          <p style="margin:3px 0 0;font-size:.9rem;font-weight:700;color:{sev_col};">{sev_label}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid rgba(191,144,32,.15);" colspan="2">
          <p style="margin:0;font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:#7a6040;">Fort</p>
          <p style="margin:3px 0 0;font-size:.95rem;color:#1c1208;">{report.fort_name}</p>
        </td>
        <td style="padding:10px 16px;border-bottom:1px solid rgba(191,144,32,.15);">
          <p style="margin:0;font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:#7a6040;">Section</p>
          <p style="margin:3px 0 0;font-size:.95rem;color:#1c1208;">{report.fort_section}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 16px;" colspan="3">
          <p style="margin:0;font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:#7a6040;">Reported by</p>
          <p style="margin:3px 0 0;font-size:.92rem;color:#2e1e0e;">
            {report.sevak_name}
            &nbsp;·&nbsp; <a href="mailto:{report.sevak_email}">{report.sevak_email}</a>
            {'&nbsp;·&nbsp; ' + report.sevak_phone if report.sevak_phone else ''}
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:0 32px 16px;">
    <p style="margin:0 0 6px;font-size:.65rem;letter-spacing:2px;text-transform:uppercase;color:#7a6040;">Damage Description</p>
    <p style="margin:0;font-size:.95rem;color:#2e1e0e;line-height:1.7;">{report.description}</p>
  </td></tr>
  {'<tr><td style="padding:0 32px 16px;"><p style="margin:0 0 6px;font-size:.65rem;letter-spacing:2px;text-transform:uppercase;color:#7a6040;">DurgSevak Suggestions</p><p style="margin:0;font-size:.95rem;color:#2e1e0e;line-height:1.7;">' + report.suggestions + '</p></td></tr>' if report.suggestions else ''}
  <tr><td style="padding:0 32px 24px;">
    <p style="margin:0 0 10px;font-size:.65rem;letter-spacing:2px;text-transform:uppercase;color:#7a6040;">⚡ Top Recommended Actions</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf2e0;border:1px solid rgba(191,144,32,.25);border-radius:3px;padding:8px 14px;">
      {actions_html}
    </table>
  </td></tr>
  <tr><td style="padding:0 32px 28px;text-align:center;">
    <a href="{getattr(settings,'ADMIN_DASHBOARD_URL','http://localhost:5173/')}"
       style="display:inline-block;padding:11px 28px;background:linear-gradient(135deg,#F07030,#D4580A);
              color:#fff;text-decoration:none;border-radius:3px;font-size:.78rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
      Open Command Centre &rarr;
    </a>
  </td></tr>
"""
    subject = f"[DurgSetu] New Report — {report.fort_name} · {sev_label} · {report.reference_number}"
    plain = f"DurgSetu New Report\nReference: {report.reference_number}\nFort: {report.fort_name}\nSeverity: {sev_label}\n"
    html = _base_html_wrap(content, "New Report Received")

    msg = EmailMultiAlternatives(
        subject=subject,
        body=plain,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[getattr(settings, 'AUTHORITY_EMAIL', settings.EMAIL_HOST_USER)],
    )
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)


def send_sevak_status_update(report):
    headline, detail = STATUS_MESSAGE.get(report.status, ("Status Updated", "Your report has been updated."))
    status_display = STATUS_LABEL.get(report.status, report.status.replace("_", " ").title())

    content = f"""
  <tr><td style="padding:28px 32px;">
    <p style="margin:0 0 18px;font-size:1rem;color:#2e1e0e;line-height:1.7;">Dear <strong>{report.sevak_name}</strong>,</p>
    <p style="margin:0 0 22px;font-size:1rem;color:#3e2a12;line-height:1.7;"><strong>{headline}</strong> {detail}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf2e0;border:1px solid rgba(191,144,32,.28);border-radius:3px;margin-bottom:22px;overflow:hidden;">
      <tr>
        <td style="padding:9px 14px;border-bottom:1px solid rgba(191,144,32,.14);width:38%;">
          <p style="margin:0;font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:#7a6040;">Reference</p>
          <p style="margin:3px 0 0;font-size:.95rem;font-weight:700;color:#1c1208;">{report.reference_number}</p>
        </td>
        <td style="padding:9px 14px;border-bottom:1px solid rgba(191,144,32,.14);">
          <p style="margin:0;font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:#7a6040;">New Status</p>
          <p style="margin:3px 0 0;font-size:.95rem;font-weight:700;color:#D4580A;">{status_display}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:9px 14px;border-bottom:1px solid rgba(191,144,32,.14);" colspan="2">
          <p style="margin:0;font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:#7a6040;">Fort</p>
          <p style="margin:3px 0 0;font-size:.92rem;color:#2e1e0e;">{report.fort_name} · {report.fort_section}</p>
        </td>
      </tr>
      {'<tr><td style="padding:9px 14px;" colspan="2"><p style="margin:0;font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:#7a6040;">Message from Authorities</p><p style="margin:3px 0 0;font-size:.92rem;color:#2e1e0e;line-height:1.65;">' + report.admin_notes + '</p></td></tr>' if report.admin_notes else ''}
    </table>
    <p style="margin:0;font-size:.9rem;color:#6a5030;font-style:italic;line-height:1.65;">
      Thank you for your service as a guardian of Maharashtra's heritage.<br/>
      Your vigilance helps preserve these forts for generations to come.
    </p>
  </td></tr>
"""
    subject = f"[DurgSetu] Update on {report.reference_number} — {report.fort_name} — {status_display}"
    plain = f"DurgSetu Report Update\nReference: {report.reference_number}\nNew Status: {status_display}\n"
    html = _base_html_wrap(content, f"Report Status Update — {status_display}")

    msg = EmailMultiAlternatives(
        subject=subject,
        body=plain,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[report.sevak_email],
    )
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)
