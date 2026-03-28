from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from django.db.models import Count, Avg
from .models import Fort, FortImage, StructuralAnalysis, FortDamageReport, ReportImage
from .serializers import FortSerializer, FortImageSerializer, StructuralAnalysisSerializer, FortDamageReportSerializer, ReportImageSerializer
from .structural_detector import StructuralChangeDetector
from .report_generator import generate_pdf_report
from datetime import datetime
import logging
import threading

logger = logging.getLogger(__name__) 

def send_ai_report_email(analysis, user_notes, user_email):
    print(f"EMAIL DEBUG: Starting send_ai_report_email for email={user_email}")
    if not user_email:
        print("EMAIL DEBUG: No user_email provided, aborting.")
        return
        
    try:
        api_key = getattr(settings, 'NVIDIA_API_KEY', None)
        print(f"EMAIL DEBUG: NVIDIA API Key present: {bool(api_key)}")
        if api_key:
            import requests
            
            header = {
                "Authorization": f"Bearer {api_key}",
                "Accept": "application/json",
            }
            
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
            
            payload = {
                "model": "meta/llama-3.1-8b-instruct",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
                "max_tokens": 500,
            }
            
            url = "https://integrate.api.nvidia.com/v1/chat/completions"
            response = requests.post(url, headers=header, json=payload)
            response.raise_for_status()
            result = response.json()
            ai_email_body = result['choices'][0]['message']['content']
        else:
            fort_name = analysis.fort.name
            ai_email_body = f"DurgSetu AI Automated Report\nFort: {fort_name}\nRisk Level: {analysis.risk_level}\nChanges Detected: {analysis.changes_detected}\nNotes: {user_notes}\n\n(Note: NVIDIA AI is not configured. Add NVIDIA_API_KEY to Django settings to enable AI generated reports.)"
        
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
            print(f"EMAIL DEBUG: PDF gracefully attached for {safe_fort_name}")
        except Exception as e:
            print(f"EMAIL DEBUG: Failed to generate PDF attachment: {e}")
            logger.error(f"Failed to generate PDF attachment: {e}")
            
        print(f"EMAIL DEBUG: Sending email via SMTP...")
        email_msg.send(fail_silently=False)
        print(f"EMAIL DEBUG: AI Email successfully dispatched to {user_email}")
        logger.info(f"AI Email sent with PDF to {user_email} for fort {analysis.fort.name}")
            
    except Exception as e:
        print(f"EMAIL DEBUG: Failed to generate or send AI email: {e}")
        logger.error(f"Failed to generate or send AI email: {e}")

logger = logging.getLogger(__name__)

# --- Authentication Views ---

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    
    def post(self, request, *args, **kwargs):
        # We intercept the raw username strictly for prefixing logic
        raw_username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        role = request.data.get('role', 'user') # Defaults to user
        
        if not raw_username or not password:
            return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Determine internal DB username mapped completely to role namespace
        system_username = f"{role}_{raw_username}"
        
        if User.objects.filter(username=system_username).exists():
            return Response({'error': f'Username already exists in {role} role.'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.create_user(username=system_username, email=email, password=password)
        
        # Profile Routing
        if role == 'admin':
            from django.conf import settings
            admin_secret = request.data.get('admin_secret')
            if admin_secret != getattr(settings, 'ADMIN_REGISTRATION_SECRET', 'durgsetu_admin_2026'):
                # Delete user since auth failed the security protocol
                user.delete()
                return Response({'error': 'Unauthorized! Invalid Admin Registration Secret.'}, status=status.HTTP_403_FORBIDDEN)
                
            user.is_staff = True
            user.save()
            from .models import AdminUser
            AdminUser.objects.create(user=user)
        else:
            user.is_staff = False
            user.save()
            from .models import UserProfile
            UserProfile.objects.create(user=user)

        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': raw_username, # Return the visual name to the frontend seamlessly
            'system_username': user.username,
            'email': user.email,
            'role': role,
            'is_staff': user.is_staff
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        raw_username = request.data.get('username')
        password = request.data.get('password')
        role = request.data.get('role', 'user') # Extract the intended portal login
        
        # Automatically append the role prefix to query the unique DB record perfectly
        system_username = f"{role}_{raw_username}"
        user = authenticate(username=system_username, password=password)
        
        # Fallback check incase they registered prior to prefix system without a prefix
        if not user:
            user = authenticate(username=raw_username, password=password)

        if user:
            token, created = Token.objects.get_or_create(user=user)
            
            # Fetch profile details
            profile_data = {}
            user_role = 'user'
            if user.is_staff:
                user_role = 'admin'
                if hasattr(user, 'admin_user'):
                    from .serializers import AdminUserSerializer
                    profile_data = AdminUserSerializer(user.admin_user).data
            else:
                if hasattr(user, 'user_profile'):
                    from .serializers import UserProfileSerializer
                    profile_data = UserProfileSerializer(user.user_profile).data

            return Response({
                'token': token.key,
                'user_id': user.pk,
                'username': raw_username, # Strip prefix visibly
                'email': user.email,
                'is_staff': user.is_staff,
                'role': user_role,
                'profile': profile_data
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

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
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
        trend_data_qs = StructuralAnalysis.objects.filter(
            analysis_date__gte=six_months_ago
        ).annotate(month=TruncMonth('analysis_date')).values('month').annotate(
            avg_risk=Avg('risk_score'),
            count=Count('id')
        ).order_by('month')

        trend_data = [
            {
                'month': item['month'].strftime('%b %Y'),
                'avg_risk_score': round(item['avg_risk'] or 0, 1),
                'analysis_count': item['count']
            }
            for item in trend_data_qs
        ]

        # 2. Fort Leaderboard (sorted by latest risk score)
        forts = Fort.objects.prefetch_related('analyses').all()
        leaderboard = []
        for fort in forts:
            latest = fort.analyses.order_by('-analysis_date').first()
            if latest:
                leaderboard.append({
                    'fort_id': fort.id,
                    'fort_name': fort.name,
                    'latest_risk_level': latest.risk_level,
                    'latest_risk_score': latest.risk_score,
                    'latest_analysis_date': latest.analysis_date.strftime('%Y-%m-%d'),
                    'total_analyses': fort.analyses.count(),
                })

        leaderboard.sort(key=lambda x: x['latest_risk_score'], reverse=True)

        # 3. Recent Critical/High Activity
        recent_critical = StructuralAnalysis.objects.filter(
            risk_level__in=['HIGH', 'CRITICAL']
        ).order_by('-analysis_date')[:5]

        critical_activity = [
            {
                'fort_name': a.fort.name,
                'risk_level': a.risk_level,
                'risk_score': a.risk_score,
                'changes_detected': a.changes_detected,
                'date': a.analysis_date.strftime('%Y-%m-%d %H:%M'),
            }
            for a in recent_critical
        ]

        return Response({
            'trend_data': trend_data,
            'leaderboard': leaderboard,
            'recent_critical_activity': critical_activity,
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
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
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


# ─────────────────────────────────────────────
# Role-Based Damage Reports
# ─────────────────────────────────────────────

class UserDamageReportViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = FortDamageReportSerializer

    def get_queryset(self):
        return FortDamageReport.objects.filter(user=self.request.user).order_by('-submitted_at')

    def create(self, request, *args, **kwargs):
        try:
            # The serializer will handle everything except many images
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            report = serializer.save(user=request.user)

            # Look for multiple images in the request
            # Could be under 'images' array or just request.FILES
            images = request.FILES.getlist('images')
            if not images:
                # Fallback to older style where images act like single key-value
                images = [file for key, file in request.FILES.items() if key != 'repair_image']
            
            for image in images:
                ReportImage.objects.create(report=report, image=image)
            
            return Response({
                'message': 'Report submitted successfully',
                'report': self.get_serializer(report).data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error saving user report: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminDamageReportViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = FortDamageReportSerializer
    queryset = FortDamageReport.objects.all().order_by('-submitted_at')

    def partial_update(self, request, *args, **kwargs):
        report = self.get_object()
        
        # Admin can update status, admin_notes, and repair_image
        if 'status' in request.data:
            report.status = request.data['status']
        if 'admin_notes' in request.data:
            report.admin_notes = request.data['admin_notes']
        if 'repair_image' in request.FILES:
            report.repair_image = request.FILES['repair_image']
            
        report.reviewed_by = request.user.username
        report.reviewed_at = datetime.now()
        report.save()

        return Response(self.get_serializer(report).data)
