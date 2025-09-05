from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class DataScheduler:
    def __init__(self, app, data_aggregator):
        self.app = app
        self.data_aggregator = data_aggregator
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        atexit.register(lambda: self.scheduler.shutdown())
    
    def start_scheduled_tasks(self):
        """Start all scheduled tasks"""
        # Fetch fresh data every 30 minutes
        self.scheduler.add_job(
            func=self.fetch_data_job,
            trigger=IntervalTrigger(minutes=30),
            id='fetch_data_job',
            name='Fetch air quality data',
            replace_existing=True
        )
        
        # Clean old data daily
        self.scheduler.add_job(
            func=self.cleanup_old_data,
            trigger=IntervalTrigger(hours=24),
            id='cleanup_job',
            name='Clean up old data',
            replace_existing=True
        )
        
        logger.info("Scheduled tasks started")
    
    def fetch_data_job(self):
        """Background job to fetch data"""
        with self.app.app_context():
            try:
                fresh_data = self.data_aggregator.fetch_all_data()
                self.data_aggregator.store_sensor_data(fresh_data)
                logger.info(f"Background fetch completed: {len(fresh_data)} data points")
            except Exception as e:
                logger.error(f"Background fetch failed: {e}")
    
    def cleanup_old_data(self):
        """Clean up old sensor readings and user reports"""
        with self.app.app_context():
            try:
                from main import db, SensorReading, UserReport
                
                # Clean old sensor readings (> 7 days)
                cutoff_sensors = datetime.utcnow() - timedelta(days=7)
                old_sensors = SensorReading.query.filter(
                    SensorReading.timestamp < cutoff_sensors
                ).delete()
                
                # Clean old user reports (> 30 days)
                cutoff_reports = datetime.utcnow() - timedelta(days=30)
                old_reports = UserReport.query.filter(
                    UserReport.timestamp < cutoff_reports
                ).delete()
                
                db.session.commit()
                logger.info(f"Cleanup completed: {old_sensors} sensors, {old_reports} reports removed")
                
            except Exception as e:
                logger.error(f"Cleanup failed: {e}")