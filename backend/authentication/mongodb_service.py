import pymongo
from django.conf import settings
from datetime import datetime
import hashlib
from bson import ObjectId


class MongoDBService:
    def __init__(self):
        self.client = None
        self.db = None
        self.users_collection = None
        self.community_reports_collection = None
        self._connected = False
    
    def _ensure_connection(self):
        """Ensure MongoDB connection is established"""
        if not self._connected:
            try:
                # Add SSL and connection parameters to handle connection issues
                self.client = pymongo.MongoClient(
                    settings.MONGODB_URI, 
                    serverSelectionTimeoutMS=10000,
                    connectTimeoutMS=10000,
                    socketTimeoutMS=10000,
                    retryWrites=True,
                    tlsAllowInvalidCertificates=True,
                    tlsAllowInvalidHostnames=True
                )
                self.db = self.client[settings.MONGODB_DATABASE]
                self.users_collection = self.db.users
                self.community_reports_collection = self.db.community_reports
                # Test the connection
                self.client.admin.command('ping')
                self._connected = True
                print("MongoDB connection established successfully")
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
    
    # Community Reports Methods
    def create_community_report(self, report_data):
        """Create a new community report in MongoDB"""
        self._ensure_connection()
        if not self._connected:
            return None
            
        report_doc = {
            'user_id': report_data['user_id'],
            'username': report_data['username'],
            'type': report_data['type'],
            'severity': report_data['severity'],
            'location': report_data['location'],
            'description': report_data['description'],
            'photo_url': report_data.get('photo_url', ''),
            'votes': {
                'up': 0,
                'down': 0,
                'voters': []
            },
            'verified': False,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = self.community_reports_collection.insert_one(report_doc)
        return str(result.inserted_id)
    
    def get_community_reports(self, filter_type='all', sort_by='recent', limit=50):
        """Get community reports with filtering and sorting"""
        self._ensure_connection()
        if not self._connected:
            return []
        
        # Build filter query
        filter_query = {}
        if filter_type != 'all':
            filter_query['type'] = filter_type
        
        # Build sort query
        sort_query = []
        if sort_by == 'recent':
            sort_query = [('created_at', -1)]
        elif sort_by == 'votes':
            sort_query = [('votes.up', -1), ('created_at', -1)]
        elif sort_by == 'severity':
            severity_order = {'severe': 4, 'high': 3, 'medium': 2, 'low': 1}
            # We'll sort by created_at for now, severity sorting would need aggregation
            sort_query = [('created_at', -1)]
        
        cursor = self.community_reports_collection.find(filter_query).sort(sort_query).limit(limit)
        reports = []
        
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            reports.append(doc)
        
        return reports
    
    def get_community_report_by_id(self, report_id):
        """Get a specific community report by ID"""
        self._ensure_connection()
        if not self._connected:
            return None
        
        try:
            doc = self.community_reports_collection.find_one({'_id': ObjectId(report_id)})
            if doc:
                doc['_id'] = str(doc['_id'])
            return doc
        except Exception as e:
            print(f"Error getting report by ID: {e}")
            return None
    
    def vote_on_report(self, report_id, user_id, vote_type):
        """Vote on a community report (up or down)"""
        self._ensure_connection()
        if not self._connected:
            return False
        
        try:
            report = self.community_reports_collection.find_one({'_id': ObjectId(report_id)})
            if not report:
                return False
            
            voters = report.get('votes', {}).get('voters', [])
            
            # Check if user already voted
            existing_vote = None
            for voter in voters:
                if voter['user_id'] == user_id:
                    existing_vote = voter['vote_type']
                    break
            
            # Remove existing vote if any
            if existing_vote:
                self.community_reports_collection.update_one(
                    {'_id': ObjectId(report_id)},
                    {
                        '$pull': {'votes.voters': {'user_id': user_id}},
                        '$inc': {f'votes.{existing_vote}': -1}
                    }
                )
            
            # Add new vote if different from existing
            if not existing_vote or existing_vote != vote_type:
                self.community_reports_collection.update_one(
                    {'_id': ObjectId(report_id)},
                    {
                        '$push': {'votes.voters': {'user_id': user_id, 'vote_type': vote_type}},
                        '$inc': {f'votes.{vote_type}': 1}
                    }
                )
            
            return True
        except Exception as e:
            print(f"Error voting on report: {e}")
            return False
    
    def update_report_verification(self, report_id, verified):
        """Update report verification status"""
        self._ensure_connection()
        if not self._connected:
            return False
        
        try:
            self.community_reports_collection.update_one(
                {'_id': ObjectId(report_id)},
                {
                    '$set': {
                        'verified': verified,
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            return True
        except Exception as e:
            print(f"Error updating report verification: {e}")
            return False
    
    def delete_community_report(self, report_id, user_id):
        """Delete a community report (only by the author)"""
        self._ensure_connection()
        if not self._connected:
            return False
        
        try:
            result = self.community_reports_collection.delete_one({
                '_id': ObjectId(report_id),
                'user_id': user_id
            })
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting report: {e}")
            return False


# Global instance
mongodb_service = MongoDBService()