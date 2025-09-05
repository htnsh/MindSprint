#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from authentication.mongodb_service import mongodb_service

def test_mongodb_connection():
    try:
        # Test connection
        mongodb_service._ensure_connection()
        if not mongodb_service._connected:
            print(f"❌ MongoDB connection failed: Could not establish connection")
            return False
            
        client = mongodb_service.client
        # Get database info
        db_info = client.server_info()
        print(f"✅ MongoDB connection successful!")
        print(f"📊 MongoDB version: {db_info['version']}")
        
        # Test database access
        db = mongodb_service.db
        collections = db.list_collection_names()
        print(f"📁 Available collections: {collections}")
        
        # Test user collection
        users_collection = mongodb_service.users_collection
        user_count = users_collection.count_documents({})
        print(f"👥 Total users in MongoDB: {user_count}")
        
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

if __name__ == "__main__":
    test_mongodb_connection()
