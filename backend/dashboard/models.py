from django.db import models

# Create your models here.
class AQIRecord(models.Model):
    city = models.CharField(max_length=100)
    aqi = models.IntegerField()
    pm25 = models.FloatField(null=True, blank=True)
    pm10 = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.city} - {self.aqi} at {self.timestamp}"
