from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from django.db.models import Count, Avg
import google.generativeai as genai
from .models import Fort, FortImage, StructuralAnalysis
from .serializers import FortSerializer, FortImageSerializer, StructuralAnalysisSerializer
from .structural_detector import StructuralChangeDetector
from .report_generator import generate_pdf_report
from datetime import datetime
import logging
import threading

logger = logging.getLogger(__name__) 

def send_ai_report_email(analysis, user_notes, user_email):
    if not user_email:
        return
        
    try:
        api_key = getattr(settings, 'GEMINI_API_KEY', 'dummy_key')
        if api_key and api_key != 'dummy_key':
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            fort_name = analysis.fort.name
            risk = analysis.risk_level
            changes = analysis.changes_detected
            notes = user_notes if user_notes else "None"
            
            prompt = f"""
            You are an expert Structural AI Analyst for 'DurgSetu AI', a system dedicated to preserving historical forts.
            
            An admin has just scanned or verified the latest visuals for {fort_name}.
            
            Data points:
            - Fort Name: {fort_name}
            - Number of Structural Changes Detected: {changes}
            - Overall Risk Level: {risk}
            - Admin Notes: {notes}
            
            Please write a short, professional email report addressed to the Admin team.
            Summarize the findings, state the risk level clearly, and suggest what prompt action they might need to take based on the risk level. Keep it under 150 words. Do not use markdown format in the email body.
            """
            
            response = model.generate_content(prompt)
            ai_email_body = response.text
        else:
            fort_name = analysis.fort.name
            ai_email_body = f"DurgSetu AI Automated Report\nFort: {fort_name}\nRisk Level: {analysis.risk_level}\nChanges Detected: {analysis.changes_detected}\nNotes: {user_notes}\n\n(Note: Gemini AI is not configured. Add GEMINI_API_KEY to Django settings to enable AI generated reports.)"
        
        email_msg = EmailMessage(
            subject=f'[DurgSetu AI Agent] Structural Report - {analysis.fort.name}',
            body=ai_email_body,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'agent@durgsetu.ai'),
            to=[user_email],
        )
        
        # Attach the PDF Report
        try:
            pdf_bytes = generate_pdf_report(analysis, ai_email_body)
            safe_fort_name = analysis.fort.name.replace(" ", "_")
            email_msg.attach(f'Structural_Analysis_{safe_fort_name}.pdf', pdf_bytes, 'application/pdf')
        except Exception as e:
            logger.error(f"Failed to generate PDF attachment: {e}")
            
        email_msg.send(fail_silently=False)
        logger.info(f"AI Email sent with PDF to {user_email} for fort {analysis.fort.name}")
            
    except Exception as e:
        logger.error(f"Failed to generate or send AI email: {e}")

logger = logging.getLogger(__name__)

# --- Authentication Views ---

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        
        if not username or not password:
            return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.create_user(username=username, email=email, password=password)
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.pk,
                'email': user.email
            })
        else:
            return Response({"error": "Wrong Credentials"}, status=status.HTTP_400_BAD_REQUEST)


class FortViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Fort.objects.all()
    serializer_class = FortSerializer
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get overall statistics for all forts"""
        forts = Fort.objects.all()
        mine = request.query_params.get('mine', None)
        total_forts = forts.count()
        
        # Get latest analyses for each fort
        analyses = StructuralAnalysis.objects.all()
        if mine == 'true' and request.user.is_authenticated:
            analyses = analyses.filter(verified_by=request.user.username)
        
        risk_counts = {
            'SAFE': 0,
            'LOW': 0,
            'MEDIUM': 0,
            'HIGH': 0,
            'CRITICAL': 0
        }
        
        for analysis in analyses:
            risk_level = analysis.risk_level
            if risk_level in risk_counts:
                risk_counts[risk_level] += 1
        
        total_analyses = analyses.count()
        total_images = FortImage.objects.count()
        
        # Calculate average scores
        avg_metrics = analyses.aggregate(
            avg_ssim=Avg('ssim_score'),
            avg_risk=Avg('risk_score')
        )
        
        return Response({
            'total_forts': total_forts,
            'total_analyses': total_analyses,
            'total_images': total_images,
            'risk_distribution': risk_counts,
            'average_ssim': avg_metrics.get('avg_ssim', 0) or 0,
            'average_risk_score': avg_metrics.get('avg_risk', 0) or 0,
            'forts_at_risk': risk_counts['HIGH'] + risk_counts['CRITICAL']
        })

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """
        Get detailed analytics for the dashboard:
        1. Trend Data (Last 6 months)
        2. Leaderboard (Best/Worst Forts)
        3. Recent Critical Activity
        """
        from django.db.models.functions import TruncMonth
        from django.utils import timezone
        import datetime

        # 1. Trend Data (Historical Risk Scores)
        # Get data for the last 6 months
        six_months_ago = timezone.now() - datetime.timedelta(days=180)
        mine = request.query_params.get('mine', None)
        
        trend_queryset = StructuralAnalysis.objects.filter(
            analysis_date__gte=six_months_ago
        )
        if mine == 'true' and request.user.is_authenticated:
            trend_queryset = trend_queryset.filter(verified_by=request.user.username)
            
        trend_queryset = trend_queryset.annotate(
            month=TruncMonth('analysis_date')
        ).values('month').annotate(
            avg_risk=Avg('risk_score'),
            avg_health=Avg('ssim_score'),
            count=Count('id')
        ).order_by('month')

        trend_data = []
        if trend_queryset.exists():
            for entry in trend_queryset:
                trend_data.append({
                    'name': entry['month'].strftime('%b'),
                    'risk': round(entry['avg_risk'], 1),
                    'health': round(entry['avg_health'] * 100, 1)
                })
        else:
            # Fallback for empty DB: show empty chart or current month placeholder
            trend_data = [{'name': timezone.now().strftime('%b'), 'risk': 0, 'health': 100}]

        # 2. Leaderboard
        forts = Fort.objects.all()
        leaderboard = []
        for fort in forts:
            latest = StructuralAnalysis.objects.filter(fort=fort)
            if mine == 'true' and request.user.is_authenticated:
                latest = latest.filter(verified_by=request.user.username)
            latest = latest.order_by('-analysis_date').first()
            
            if latest:
                leaderboard.append({
                    'id': fort.id,
                    'name': fort.name,
                    'location': fort.location,
                    'health': round(latest.ssim_score * 100),
                    'risk_score': latest.risk_score,
                    'changes': latest.changes_detected,
                    'status': latest.risk_level
                })
            else:
                # Include forts with no analysis yet
                 leaderboard.append({
                    'id': fort.id,
                    'name': fort.name,
                    'location': fort.location,
                    'health': 100, # Assume healthy if no data
                    'risk_score': 0,
                    'changes': 0,
                    'status': 'SAFE'
                })
        
        # Sort by Health (Descending)
        leaderboard.sort(key=lambda x: x['health'], reverse=True)
        
        # 3. Recent Activity (Critical/High only)
        recent_critical = StructuralAnalysis.objects.filter(
            risk_level__in=['HIGH', 'CRITICAL']
        )
        if mine == 'true' and request.user.is_authenticated:
            recent_critical = recent_critical.filter(verified_by=request.user.username)
            
        recent_critical = recent_critical.order_by('-analysis_date')[:5]
        
        critical_alerts = []
        for analysis in recent_critical:
            critical_alerts.append({
                'id': analysis.id,
                'fort_name': analysis.fort.name,
                'risk_level': analysis.risk_level,
                'date': analysis.analysis_date,
                'message': f"Detected {analysis.changes_detected} structural changes."
            })

        return Response({
            'trend_data': trend_data,
            'leaderboard': leaderboard,
            'critical_alerts': critical_alerts
        })


class FortImageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = FortImage.objects.all()
    serializer_class = FortImageSerializer
    
    def get_queryset(self):
        queryset = FortImage.objects.all()
        fort_id = self.request.query_params.get('fort', None)
        if fort_id:
            queryset = queryset.filter(fort=fort_id)
        return queryset


class StructuralAnalysisViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = StructuralAnalysis.objects.all()
    serializer_class = StructuralAnalysisSerializer
    
    def get_queryset(self):
        queryset = StructuralAnalysis.objects.all()
        fort_id = self.request.query_params.get('fort', None)
        mine = self.request.query_params.get('mine', None)
        
        if fort_id:
            queryset = queryset.filter(fort=fort_id)
            
        if mine == 'true' and self.request.user.is_authenticated:
            queryset = queryset.filter(verified_by=self.request.user.username)
            
        return queryset
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """
        Verify an analysis result.
        POST data: is_verified (bool), is_false_positive (bool), user_notes (marketing)
        """
        analysis = self.get_object()
        is_verified = request.data.get('is_verified', True)
        is_false_positive = request.data.get('is_false_positive', False)
        user_notes = request.data.get('user_notes', '')
        
        analysis.is_verified = is_verified
        analysis.is_false_positive = is_false_positive
        analysis.user_notes = user_notes
        analysis.verified_at = datetime.now()
        analysis.verified_by = request.user.username if request.user.is_authenticated else 'Anonymous'
        analysis.save()
        
        # --- AI Agent Email Notification Logic ---
        if is_verified:
            # Run in a separate thread so it doesn't block the API response
            threading.Thread(
                target=send_ai_report_email, 
                args=(analysis, user_notes, request.user.email)
            ).start()

        return Response({
            'status': 'verified',
            'is_verified': analysis.is_verified,
            'is_false_positive': analysis.is_false_positive,
            'email_sent': bool(is_verified and request.user.email)
        })

    @action(detail=False, methods=['post'])
    def analyze(self, request):
        """
        Analyze structural changes by uploading an image
        POST data: fort_id, image (file)
        """
        try:
            fort_id = request.data.get('fort_id')
            uploaded_image = request.FILES.get('image')
            
            if not fort_id or not uploaded_image:
                return Response(
                    {'error': 'fort_id and image are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get fort
            try:
                fort = Fort.objects.get(id=fort_id)
            except Fort.DoesNotExist:
                return Response(
                    {'error': 'Fort not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Save new image
            current_image = FortImage.objects.create(
                fort=fort,
                image=uploaded_image,
                description=f"Uploaded on {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            )
            
            # Get previous image (latest before current)
            previous_image = FortImage.objects.filter(
                fort=fort
            ).exclude(
                id=current_image.id
            ).order_by('-uploaded_at').first()
            
            # If no previous image, this is the first upload
            if not previous_image:
                return Response({
                    'message': 'First image uploaded successfully',
                    'is_first_upload': True,
                    'fort_id': fort.id,
                    'fort_name': fort.name,
                    'image_id': current_image.id,
                    'image_url': request.build_absolute_uri(current_image.image.url)
                }, status=status.HTTP_201_CREATED)
            
            # Perform analysis
            logger.info(f"Starting structural analysis for fort {fort.name}")
            detector = StructuralChangeDetector()
            
            # --- Auto-Training / ML Feedback Loop ---
            # Calculate historical false positive rate for this fort to dynamically tune model sensitivity
            if request.user.is_authenticated:
                history_qs = StructuralAnalysis.objects.filter(fort=fort, is_verified=True, verified_by=request.user.username)
            else:
                history_qs = StructuralAnalysis.objects.filter(fort=fort, is_verified=True)
                
            total_verifications = history_qs.count()
            false_positives = history_qs.filter(is_false_positive=True).count()
            
            fp_rate = 0.0
            if total_verifications > 0:
                fp_rate = false_positives / total_verifications
                
            detector.update_thresholds_from_history(fp_rate)
            # ----------------------------------------
            
            # Load images
            past_img = detector.load_image_from_file(previous_image.image)
            current_img = detector.load_image_from_file(current_image.image)
            
            # Extract environmental data from request
            temp = request.data.get('temperature')
            humidity = request.data.get('humidity')
            wind_speed = request.data.get('wind_speed')
            
            # Detect changes & evaluate Climate Stress Index (CSI)
            results = detector.detect_structural_changes(past_img, current_img, temp, humidity, wind_speed)
            
            # Create annotated image
            annotated_img = detector.visualize_results(current_img, results)
            annotated_file = detector.save_annotated_image(annotated_img)
            
            # Calculate total area
            total_area = sum(d['area'] for d in results['detections']) if results['detections'] else 0
            
            # Save analysis with Phase 3 Environmental tracking
            analysis = StructuralAnalysis.objects.create(
                fort=fort,
                previous_image=previous_image,
                current_image=current_image,
                cnn_distance=results['cnn_distance'],
                ssim_score=results['ssim_score'],
                risk_level=results['risk_assessment']['level'],
                risk_score=results['risk_assessment']['score'],
                changes_detected=results['total_changes'],
                total_area_affected=total_area,
                analysis_results=results,
                temperature=temp,
                humidity=humidity,
                wind_speed=wind_speed,
                climate_stress_index=results.get('environmental_data', {}).get('climate_stress_index', 0.0),
                final_heritage_risk_score=results.get('environmental_data', {}).get('final_heritage_risk_score', 0.0)
            )
            
            # Save annotated image
            analysis.annotated_image.save(
                f'analysis_{fort.id}_{analysis.id}.png',
                annotated_file,
                save=True
            )
            
            logger.info(f"Analysis complete: {results['risk_assessment']['level']} risk detected")
            
            # --- Auto-send Email upon scan generation ---
            threading.Thread(
                target=send_ai_report_email, 
                args=(analysis, "Automated scan completed on new image upload.", request.user.email if hasattr(request.user, 'email') else None)
            ).start()
            
            # Return full analysis
            serializer = self.get_serializer(analysis, context={'request': request})
            return Response({
                'message': 'Analysis completed successfully',
                'is_first_upload': False,
                'fort_id': fort.id,
                'fort_name': fort.name,
                'analysis': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error in structural analysis: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Analysis failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )