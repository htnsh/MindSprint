from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from .mongodb_service import mongodb_service


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        # Create user in Django (SQLite)
        user = serializer.save()
        
        # Also store in MongoDB
        try:
            mongo_user_id = mongodb_service.create_user({
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'password_hash': user.password,  # Django already hashes this
                'django_user_id': user.id
            })
            if not mongo_user_id:
                print("MongoDB user creation failed - no ID returned")
        except Exception as e:
            print(f"MongoDB storage failed: {e}")
            # Continue even if MongoDB fails
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    # Return user-friendly error messages
    return Response({
        'error': 'Registration failed',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Check if user exists in MongoDB
        try:
            # First check by email (more reliable)
            mongo_user = mongodb_service.get_user_by_email(user.email)
            if not mongo_user:
                # If not found by email, try by Django ID
                mongo_user = mongodb_service.get_user_by_django_id(user.id)
                if not mongo_user:
                    return Response({
                        'error': 'User not found in database. Please register first.'
                    }, status=status.HTTP_404_NOT_FOUND)
            
            # Update MongoDB with login time
            mongodb_service.update_user_login(mongo_user['_id'])
        except Exception as e:
            print(f"MongoDB check failed: {e}")
            return Response({
                'error': 'Database connection error. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    try:
        # For now, just return success - the frontend will clear the tokens
        # In production, you might want to implement token blacklisting
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Logout failed'}, status=status.HTTP_400_BAD_REQUEST)