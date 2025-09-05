import pymongo
from django.conf import settings
from datetime import datetime
import hashlib


class MongoDBService:
    def __init__(self):
        self.client = None
        self.db = None
        self.users_collection = None
        self._connected = False
    
    def _ensure_connection(self):
        """Ensure MongoDB connection is established"""
        if not self._connected:
            try:
                self.client = pymongo.MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
                self.db = self.client[settings.MONGODB_DATABASE]
                self.users_collection = self.db.users
                self._connected = True
            except Exception as e:
                print(f"MongoDB connection failed: {e}")
                self._connected = False
    
    def create_user(self, user_data):
        """Create a new user in MongoDB"""
        self._ensure_connection()
        if not self._connected:
            return None
            
        user_doc = {
            'username': user_data['username'],
            'email': user_data['email'],
            'first_name': user_data.get('first_name', ''),
            'last_name': user_data.get('last_name', ''),
            'password_hash': user_data['password_hash'],
            'is_active': True,
            'is_staff': False,
            'is_superuser': False,
            'date_joined': datetime.utcnow(),
            'last_login': None,
            'django_user_id': user_data.get('django_user_id')
        }
        
        result = self.users_collection.insert_one(user_doc)
        return str(result.inserted_id)
    
    def get_user_by_email(self, email):
        """Get user by email from MongoDB"""
        self._ensure_connection()
        if not self._connected:
            return None
        return self.users_collection.find_one({'email': email})
    
    def get_user_by_username(self, username):
        """Get user by username from MongoDB"""
        self._ensure_connection()
        if not self._connected:
            return None
        return self.users_collection.find_one({'username': username})
    
    def update_user_login(self, user_id, login_time=None):
        """Update user's last login time"""
        self._ensure_connection()
        if not self._connected:
            return
            
        if login_time is None:
            login_time = datetime.utcnow()
        
        self.users_collection.update_one(
            {'_id': user_id},
            {'$set': {'last_login': login_time}}
        )
    
    def get_user_by_django_id(self, django_user_id):
        """Get user by Django user ID"""
        self._ensure_connection()
        if not self._connected:
            return None
        return self.users_collection.find_one({'django_user_id': django_user_id})
    
    def update_user_profile(self, user_id, update_data):
        """Update user profile data"""
        self._ensure_connection()
        if not self._connected:
            return
            
        self.users_collection.update_one(
            {'_id': user_id},
            {'$set': update_data}
        )
    
    def delete_user(self, user_id):
        """Delete user from MongoDB"""
        self._ensure_connection()
        if not self._connected:
            return
            
        self.users_collection.delete_one({'_id': user_id})


# Global instance
mongodb_service = MongoDBService()
