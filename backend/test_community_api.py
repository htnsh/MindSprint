#!/usr/bin/env python
"""
Test script for community API functionality
"""
import os
import sys
import django
from datetime import datetime

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from authentication.mongodb_service import mongodb_service

def test_mongodb_connection():
    """Test MongoDB connection and create sample data"""
    print("Testing MongoDB connection...")
    
    # Test connection
    mongodb_service._ensure_connection()
    if mongodb_service._connected:
        print("✅ MongoDB connection successful!")
    else:
        print("❌ MongoDB connection failed!")
        return False
    
    # Create sample community reports
    sample_reports = [
        {
            'user_id': 'sample_user_1',
            'username': 'Sarah M.',
            'type': 'smoke',
            'severity': 'high',
            'location': 'Downtown SF',
            'description': 'Heavy smoke visible from nearby construction site. Strong burning smell affecting visibility.',
            'photo_url': '',
            'votes': {'up': 12, 'down': 1, 'voters': []},
            'verified': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'user_id': 'sample_user_2',
            'username': 'Mike R.',
            'type': 'pollen',
            'severity': 'medium',
            'location': 'Golden Gate Park',
            'description': 'Noticed increased pollen levels during morning jog. Tree pollen seems particularly high today.',
            'photo_url': '',
            'votes': {'up': 8, 'down': 0, 'voters': []},
            'verified': False,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'user_id': 'sample_user_3',
            'username': 'Lisa K.',
            'type': 'dust',
            'severity': 'low',
            'location': 'Mission District',
            'description': 'Light dust in the air, possibly from construction work on 16th Street.',
            'photo_url': '',
            'votes': {'up': 5, 'down': 2, 'voters': []},
            'verified': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'user_id': 'sample_user_4',
            'username': 'David L.',
            'type': 'odor',
            'severity': 'severe',
            'location': 'SOMA',
            'description': 'Strong chemical odor near the industrial area. Multiple people reporting respiratory irritation.',
            'photo_url': '',
            'votes': {'up': 23, 'down': 0, 'voters': []},
            'verified': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
    ]
    
    print("\nCreating sample community reports...")
    created_count = 0
    for report_data in sample_reports:
        try:
            result = mongodb_service.community_reports_collection.insert_one(report_data)
            if result.inserted_id:
                created_count += 1
                print(f"✅ Created report: {report_data['username']} - {report_data['type']}")
        except Exception as e:
            print(f"❌ Failed to create report: {e}")
    
    print(f"\n📊 Created {created_count} sample reports")
    
    # Test fetching reports
    print("\nTesting report fetching...")
    try:
        reports = mongodb_service.get_community_reports()
        print(f"✅ Successfully fetched {len(reports)} reports")
        
        for report in reports[:2]:  # Show first 2 reports
            print(f"  - {report['username']}: {report['type']} ({report['severity']}) at {report['location']}")
    except Exception as e:
        print(f"❌ Failed to fetch reports: {e}")
    
    # Test stats
    print("\nTesting stats calculation...")
    try:
        reports = mongodb_service.get_community_reports(limit=1000)
        total_reports = len(reports)
        verified_reports = len([r for r in reports if r.get('verified', False)])
        
        type_counts = {}
        for report in reports:
            report_type = report.get('type', 'unknown')
            type_counts[report_type] = type_counts.get(report_type, 0) + 1
        
        print(f"✅ Stats calculated:")
        print(f"  - Total reports: {total_reports}")
        print(f"  - Verified reports: {verified_reports}")
        print(f"  - Type distribution: {type_counts}")
    except Exception as e:
        print(f"❌ Failed to calculate stats: {e}")
    
    return True

if __name__ == "__main__":
    test_mongodb_connection()
