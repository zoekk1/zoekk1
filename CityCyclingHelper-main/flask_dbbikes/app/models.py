from typing import Iterable

from . import db
# from app import db
from datetime import datetime

class Station(db.Model):
    __tablename__ = 'station'
    number = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String(128), unique=True)
    address = db.Column(db.String(128))
    position_lat = db.Column(db.Numeric(8, 6))
    position_lng = db.Column(db.Numeric(8, 6))
    banking = db.Column(db.Integer)
    bonus = db.Column(db.Integer)
    bike_stands = db.Column(db.Integer)

    def __repr__(self):
        return f"<Station number={self.number}, name='{self.name}', " \
               f"address='{self.address}', position=({self.position_lat}, " \
               f"{self.position_lng}), banking={self.banking}, bonus={self.bonus}, bike_stands={self.bike_stands}>"

    def to_dict(self):
        return {
            'number': self.number,
            'name': self.name,
            'address': self.address,
            'position_lat': float(self.position_lat),
            'position_lng': float(self.position_lng),
            'banking': self.banking,
            'bonus': self.bonus,
            'bike_stands': self.bike_stands
        }

class Availability(db.Model):
    __tablename__ = "availability"
    # id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.Integer, primary_key=True)
    available_bike_stands = db.Column(db.Integer)
    available_bikes = db.Column(db.Integer)
    status = db.Column(db.String(128))
    last_update = db.Column(db.Integer, primary_key=True)
    db.PrimaryKeyConstraint('number', 'last_update')
    # station = db.relationship('Station', backref='availability')
    def to_dir(self):
        return {
            'number': self.number,
            'available_bike_stands': int(self.available_bike_stands),
            'available_bikes': int(self.available_bikes),
            'status': self.status,
            # change to datetime
            # 'last_update': datetime.fromtimestamp(self.last_update),
            'last_update': int(self.last_update),
        }


