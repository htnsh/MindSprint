#!/usr/bin/env python
"""
Simple test script to verify the community API endpoints
"""
import requests
import json

# Test the community API endpoints
BASE_URL = "http://localhost:8000/api/community"

def test_endpoints():
    print("Testing Community API Endpoints...")
    
    # Test 1: Get reports (this should work with mock data)
    try:
        response = requests.get(f"{BASE_URL}/reports/")
        print(f"GET /reports/ - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Success: {data.get('success', False)}")
            print(f"  Reports count: {len(data.get('reports', []))}")
        else:
            print(f"  Error: {response.text}")
    except Exception as e:
        print(f"  Connection error: {e}")
    
    # Test 2: Get stats
    try:
        response = requests.get(f"{BASE_URL}/stats/")
        print(f"GET /stats/ - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Success: {data.get('success', False)}")
            if data.get('success'):
                stats = data.get('stats', {})
                print(f"  Total reports: {stats.get('total_reports', 0)}")
                print(f"  Verified reports: {stats.get('verified_reports', 0)}")
        else:
            print(f"  Error: {response.text}")
    except Exception as e:
        print(f"  Connection error: {e}")
    
    print("\n✅ API testing completed!")

if __name__ == "__main__":
    test_endpoints()

