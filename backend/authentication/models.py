import mongoengine as me

class User(me.Document):
    email = me.StringField(required=True, unique=True)
    password = me.StringField(required=True)
    first_name = me.StringField()
    last_name = me.StringField()
    