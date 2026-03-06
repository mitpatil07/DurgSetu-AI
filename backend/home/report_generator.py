import io
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.units import inch

def generate_pdf_report(analysis, ai_notes):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=40, bottomMargin=30)
    
    styles = getSampleStyleSheet()
    # Define custom styles matching UI theme (Tailwind orange/gray)
    theme_orange = colors.HexColor('#F97316') # Tailwind orange-500
    theme_dark = colors.HexColor('#111827')   # Tailwind gray-900
    theme_gray = colors.HexColor('#4B5563')   # Tailwind gray-600
    bg_light = colors.HexColor('#FFF7ED')     # Tailwind orange-50
    
    styles.add(ParagraphStyle(name='CustomTitle', fontName='Helvetica-Bold', fontSize=24, textColor=theme_orange, spaceAfter=8))
    styles.add(ParagraphStyle(name='SectionHeader', fontName='Helvetica-Bold', fontSize=16, textColor=theme_dark, spaceAfter=10, spaceBefore=20, borderPadding=6, backColor=bg_light))
    styles.add(ParagraphStyle(name='CustomBody', fontName='Helvetica', fontSize=11, textColor=theme_gray, leading=16, spaceAfter=10))
    styles.add(ParagraphStyle(name='AIBody', fontName='Helvetica-Oblique', fontSize=11, textColor=colors.black, leading=16, spaceAfter=10, leftIndent=10, rightIndent=10))

    elements = []
    
    # 1. Header
    elements.append(Paragraph("DurgSetu AI", styles['CustomTitle']))
    elements.append(Paragraph("<b>Comprehensive Structural Analysis Report</b>", ParagraphStyle(name='Sub', fontName='Helvetica', fontSize=14, textColor=theme_dark, spaceAfter=20)))
    
    # Risk Level Color mapping
    risk_color = colors.HexColor('#10B981') # green-500
    bg_risk = colors.HexColor('#D1FAE5') # green-100
    if analysis.risk_level == 'MEDIUM':
        risk_color = colors.HexColor('#F59E0B') # yellow-500
        bg_risk = colors.HexColor('#FEF3C7')
    elif analysis.risk_level in ['HIGH', 'CRITICAL']:
        risk_color = colors.HexColor('#EF4444') # red-500
        bg_risk = colors.HexColor('#FEE2E2')
        
    # 2. Key Metrics Table
    elements.append(Paragraph("Executive Overview", styles['SectionHeader']))
    
    data = [
        ['Fort Name:', analysis.fort.name, 'Risk Score:', f"{analysis.risk_score}/10"],
        ['Analysis Date:', analysis.analysis_date.strftime("%Y-%m-%d %H:%M"), 'Risk Level:', analysis.risk_level],
        ['Changes Detected:', str(analysis.changes_detected), 'SSIM Health:', f"{analysis.ssim_score*100:.1f}%"],
        ['Total Affected Area:', f"{analysis.total_area_affected} px", '', '']
    ]
    
    t = Table(data, colWidths=[120, 145, 120, 145])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('TEXTCOLOR', (0,0), (-1,-1), theme_dark),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTNAME', (1,0), (1,-1), 'Helvetica'),
        ('FONTNAME', (3,0), (3,-1), 'Helvetica'),
        ('TEXTCOLOR', (3,1), (3,1), risk_color), # Specific risk color
        ('BACKGROUND', (3,1), (3,1), bg_risk),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#E5E7EB')),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    elements.append(t)
    
    # 3. AI Insights
    elements.append(Paragraph("AI Structural Insight", styles['SectionHeader']))
    ai_text = ai_notes.replace('\n', '<br/>')
    
    # Enclose AI output in a shaded box
    ai_data = [[Paragraph(ai_text, styles['AIBody'])]]
    ai_table = Table(ai_data, colWidths=[530])
    ai_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F3F4F6')), 
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor('#D1D5DB')), 
        ('PADDING', (0,0), (-1,-1), 15),
    ]))
    elements.append(ai_table)
    
    # PAGE BREAK
    elements.append(PageBreak())
    
    # 4. Visual Evidence
    elements.append(Paragraph("Visual Evidence Tracker", styles['SectionHeader']))
    
    # Helper to insert image without crashing
    def get_safe_image(img_path, width, height):
        if img_path and os.path.exists(img_path):
            try:
                return Image(img_path, width=width, height=height, kind='proportional')
            except:
                pass
        return Paragraph("<i>Image Source Unavailable</i>", styles['CustomBody'])

    prev_img_path = analysis.previous_image.image.path if analysis.previous_image else None
    curr_img_path = analysis.current_image.image.path if analysis.current_image else None
    
    img_width = 250
    img_height = 180
    
    prev_img = get_safe_image(prev_img_path, img_width, img_height)
    curr_img = get_safe_image(curr_img_path, img_width, img_height)
    
    img_data = [
        [Paragraph("<b>Previous Scan</b>", styles['CustomBody']), Paragraph("<b>Current Scan</b>", styles['CustomBody'])],
        [prev_img, curr_img]
    ]
    
    img_table = Table(img_data, colWidths=[265, 265])
    img_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(img_table)
    elements.append(Spacer(1, 15))
    
    # Annotated Image underneath
    if analysis.annotated_image:
        ann_img_path = analysis.annotated_image.path
        if os.path.exists(ann_img_path):
            elements.append(Paragraph("<b>Damage Detection Analysis (Annotated Results)</b>", styles['CustomBody']))
            elements.append(Spacer(1, 5))
            ann_img = get_safe_image(ann_img_path, 450, 300)
            
            # Center the large annotated image
            ann_table = Table([[ann_img]], colWidths=[530])
            ann_table.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER')]))
            elements.append(ann_table)
    
    # 5. Detailed Detections Table
    if analysis.analysis_results and 'detections' in analysis.analysis_results and analysis.analysis_results['detections']:
        elements.append(PageBreak())
        elements.append(Paragraph("Detailed Change Log Diagnostics", styles['SectionHeader']))
        
        det_data = [['ID', 'Severity', 'AI Confidence', 'Area (px)', 'Bounding Box (x, y, w, h)']]
        for i, det in enumerate(analysis.analysis_results['detections']):
            severity = det.get('severity', 'Moderate')
            conf = f"{det.get('confidence', 0)*100:.1f}%"
            area = str(int(det.get('area', 0)))
            bbox = str(det.get('bbox', []))
            det_data.append([f"#{i+1}", severity, conf, area, bbox])
            
        det_table = Table(det_data, colWidths=[40, 100, 100, 100, 190])
        det_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), theme_orange),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
            ('PADDING', (0,0), (-1,-1), 8),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]), # Alternating stripes
        ]))
        elements.append(det_table)
            
    # Build
    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
