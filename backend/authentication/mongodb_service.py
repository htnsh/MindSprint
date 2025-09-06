from pymongo import MongoClient
import bcrypt
import uuid
from django.conf import settings

client = MongoClient(settings.MONGO_URI)
db = client["BreatheBetter"]
users_collection = db["users"]

def create_user(email, password, name):
    # Check if user exists
    if users_collection.find_one({"email": email}):
        return None  

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user = {
        "_id": str(uuid.uuid4()),
        "email": email,
        "password": hashed_pw,
        "name": name,
    }
    users_collection.insert_one(user)
    return user

def get_user_by_email(email):
    return users_collection.find_one({"email": email})

def validate_user(email, password):
    user = get_user_by_email(email)
    if user and bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        return user
    return None
