#!/usr/bin/env python
import requests
import json

def test_login_validation():
    base_url = "http://localhost:8000/api/auth"
    
    print("🧪 Testing Login Validation with MongoDB Check")
    print("=" * 50)
    
    # Test 1: Try to login with non-existent user
    print("\n1. Testing login with non-existent user...")
    login_data = {
        "username": "nonexistent@example.com",
        "password": "123456"
    }
    
    response = requests.post(f"{base_url}/login/", json=login_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test 2: Register a new user first
    print("\n2. Registering a new user...")
    register_data = {
        "username": "testuser@example.com",
        "email": "testuser@example.com",
        "password": "123456",
        "password_confirm": "123456",
        "first_name": "Test",
        "last_name": "User"
    }
    
    response = requests.post(f"{base_url}/register/", json=register_data)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 201:
        print("✅ User registered successfully")
    else:
        print(f"❌ Registration failed: {response.json()}")
        return
    
    # Test 3: Login with the registered user
    print("\n3. Testing login with registered user...")
    login_data = {
        "username": "testuser@example.com",
        "password": "123456"
    }
    
    response = requests.post(f"{base_url}/login/", json=login_data)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("✅ Login successful")
        print(f"User: {response.json()['user']['email']}")
    else:
        print(f"❌ Login failed: {response.json()}")
    
    # Test 4: Try to login with wrong password
    print("\n4. Testing login with wrong password...")
    login_data = {
        "username": "testuser@example.com",
        "password": "wrongpassword"
    }
    
    response = requests.post(f"{base_url}/login/", json=login_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    test_login_validation()
