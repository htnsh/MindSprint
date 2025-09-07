#!/usr/bin/env python
"""
Test script for map API endpoint
"""
import requests
import json

def test_map_api():
    print("Testing Map API Endpoint...")
    
    try:
        # Test the map data endpoint
        response = requests.get("http://localhost:8000/api/community/map-data/")
        print(f"GET /map-data/ - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"  Success: {data.get('success', False)}")
            if data.get('success'):
                map_data = data.get('data', {})
                print(f"  Community reports: {len(map_data.get('community_reports', []))}")
                print(f"  AQI stations: {len(map_data.get('aqi_stations', []))}")
                print(f"  Layer: {map_data.get('layer', 'unknown')}")
                print(f"  Last updated: {map_data.get('last_updated', 'unknown')}")
                
                # Show sample data
                if map_data.get('community_reports'):
                    sample_report = map_data['community_reports'][0]
                    print(f"  Sample report: {sample_report.get('type')} - {sample_report.get('severity')} at {sample_report.get('location_name')}")
                
                if map_data.get('aqi_stations'):
                    sample_station = map_data['aqi_stations'][0]
                    print(f"  Sample station: {sample_station.get('name')} - AQI {sample_station.get('aqi')}")
            else:
                print(f"  Error: {data.get('error', 'Unknown error')}")
        else:
            print(f"  Error: {response.text}")
            
    except Exception as e:
        print(f"  Connection error: {e}")
    
    print("\n✅ Map API testing completed!")

if __name__ == "__main__":
    test_map_api()
