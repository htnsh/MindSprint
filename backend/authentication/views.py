from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User

# -------------------
# SIGNUP
# -------------------
@api_view(['POST'])
def signup(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name', '')
    last_name = data.get('last_name', '')

    if User.objects(email=email).first():
        return Response({'success': False, 'error': 'Email already exists'}, status=400)

    user = User(email=email, password=password, first_name=first_name, last_name=last_name)
    user.save()

    return Response({
        'success': True,
        'user': {
            'id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
    })

# -------------------
# LOGIN
# -------------------
@api_view(['POST'])
def login(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')

    user = User.objects(email=email, password=password).first()
    if not user:
        return Response({'success': False, 'error': 'Invalid credentials'}, status=400)

    return Response({
        'success': True,
        'user': {
            'id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
    })

# -------------------
# GET CURRENT USER
# -------------------
@api_view(['GET'])
def me(request):
    user_id = request.query_params.get('id')
    if not user_id:
        return Response({'user': None})

    user = User.objects(id=user_id).first()
    if not user:
        return Response({'user': None})

    return Response({
        'user': {
            'id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
    })

# -------------------
# LOGOUT (optional)
# -------------------
@api_view(['POST'])
def logout(request):
    # Nothing to do since no token/cookies
    return Response({'success': True})
