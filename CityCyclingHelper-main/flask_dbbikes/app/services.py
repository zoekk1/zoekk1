import json
import pickle
from typing import List, Optional

import requests
from sqlalchemy import func, text

from .models import Station, Availability
from datetime import datetime, timedelta
from .config import weatherForecastAPI, weatherCurrentAPI, GoogleMap_API_KEY
import pandas as pd
import numpy as np
import math
class DatbaseService:
    def __init__(self, db):
        self.db = db

    def get_occupancy_by_number_24h(self, number: int):
        current_time = datetime.now()
        timestamp_24_hours_ago = datetime.timestamp(current_time - timedelta(hours=24))
        data = self.db.session.query(
                func.date_format(func.from_unixtime(Availability.last_update), "%m-%d %H:00").label('hour'),
                func.avg(Availability.available_bikes).label('avg_number_of_bikes'),
                func.avg(Availability.available_bike_stands).label('avg_number_of_bike_stands')
            ) \
            .filter(Availability.number == number) \
            .filter(Availability.last_update >= timestamp_24_hours_ago)\
            .group_by('hour') \
            .order_by('hour').all()
        processed_data = [[row[0], round(row[1]), round(row[2])] for row in data]
        return processed_data

    def get_lastest_stations(self):
        query = text("""
            SELECT s.`number`, s.`name`, s.address, s.position_lat, s.position_lng, s.banking, s.bonus, s.bike_stands, a.available_bike_stands, a.available_bikes, a.`status`, a.last_update
            FROM station s
            JOIN availability a ON s.`number` = a.`number`
            WHERE a.last_update = (
                SELECT MAX(last_update)
                FROM availability
                WHERE `number` = s.`number`
            )
            ORDER BY s.`number`;
        """)

        results = self.db.session.execute(query).fetchall()
        processed_results = []
        for row in results:
            temp_dict = dict()
            temp_dict["number"] = row[0]
            temp_dict["name"] = row[1]
            temp_dict["address"] = row[2]
            temp_dict["position_lat"] = float(row[3])
            temp_dict["position_lng"] = float(row[4])
            temp_dict["banking"] = row[5]
            temp_dict["bonus"] = row[6]
            temp_dict["bike_stands"] = row[7]
            temp_dict["available_bike_stands"] = row[8]
            temp_dict["available_bikes"] = row[9]
            temp_dict["status"] = row[10]
            temp_dict["last_update"] = row[11]
            processed_results.append(temp_dict)
        return processed_results
    def get_latest_station(self, number):
        query = text("""
            SELECT s.`number`, s.`name`, s.address, s.position_lat, s.position_lng, s.banking, s.bonus, s.bike_stands, a.available_bike_stands, a.available_bikes, a.`status`, a.last_update
            FROM station s
            JOIN availability a ON s.`number` = a.`number`
            WHERE a.last_update = (
                SELECT MAX(last_update)
                FROM availability
                WHERE `number` = s.`number`
            )
            AND s.`number` = :p_number
            ORDER BY s.`number`;
        """)

        results = self.db.session.execute(query, {"p_number": number}).fetchall()
        if len(results) == 0:
            return None
        else:
            temp_dict = dict()
            for row in results:
                temp_dict = dict()
                temp_dict["number"] = row[0]
                temp_dict["name"] = row[1]
                temp_dict["address"] = row[2]
                temp_dict["position_lat"] = float(row[3])
                temp_dict["position_lng"] = float(row[4])
                temp_dict["banking"] = row[5]
                temp_dict["bonus"] = row[6]
                temp_dict["bike_stands"] = row[7]
                temp_dict["available_bike_stands"] = row[8]
                temp_dict["available_bikes"] = row[9]
                temp_dict["status"] = row[10]
                temp_dict["last_update"] = datetime.fromtimestamp(row[11]).strftime("%b %d %H:%M:%S")

        return temp_dict
    def get_station_static(self, number):
        query = text("""
            SELECT s.*
            FROM station s
            WHERE s.`number` = :p_number;
        """)

        results = self.db.session.execute(query, {"p_number": number}).fetchall()
        if len(results) == 0:
            return None
        else:
            temp_dict = dict()
            for row in results:
                temp_dict = dict()
                temp_dict["number"] = row[0]
                temp_dict["name"] = row[1]
                temp_dict["address"] = row[2]
                temp_dict["position_lat"] = float(row[3])
                temp_dict["position_lng"] = float(row[4])
                temp_dict["banking"] = row[5]
                temp_dict["bonus"] = row[6]
                temp_dict["bike_stands"] = row[7]

        return temp_dict
    @classmethod
    def get_stations_static(cls):
        data = Station.query.all()
        processed_data = [item.to_dict() for item in data]
        return processed_data

class ModelService:
    def __init__(self):
        # with open(r'C:\Users\y\OneDrive\UCD\2023 Spring\Software Engineering (Conv) (COMP30830)\assignments\ass 2 bike project\Train Data\20230403\random_forest_model.pkl', 'rb') as file:
        # with open(r'C:\Users\85217\OneDrive\UCD\2023 Spring\Software Engineering (Conv) (COMP30830)\assignments\ass 2 bike project\Train Data\20230403\random_forest_model.pkl', 'rb') as file:
        with open('/home/ubuntu/codes/model/random_forest_model.pkl', 'rb') as file:
        # with open('/Users/winnieimafidon/Documents/software-engineering/bike_rental_project/duplicateYun/COM30830-SE/flask_dbbikes/app/data/random_forest_model.pkl', 'rb') as file:
            data_model = pickle.load(file)
        self.model = data_model

    def predict(self, station, future_time):
        time_list = []
        time_list.append(future_time)
        result = self.predict_helper(station, time_list)
        return result


    def predict_5d(self, station):
        current_time = datetime.now()
        time_list = []
        for x in range(1, 24 * 5):
            time_list.append(current_time + timedelta(hours=1*x))
        result = self.predict_helper(station, time_list)
        return result

    def predict_24h(self, station):
        current_time = datetime.now()
        time_list = []
        for x in range(1, 24 * 1):
            time_list.append(current_time + timedelta(hours=1*x))
        result = self.predict_helper(station, time_list)
        return result


    def predict_helper(self, station, time_list):
        data_list = []
        for t in time_list:
            data_list.append({"time": t})

        weathers_from_API = requests.get(weatherForecastAPI)
        weathers = json.loads(weathers_from_API.text)

        for input_data in data_list:
            input_data.update(station)
            for weather in weathers["list"]:
                weather["gap"] = abs(weather["dt"] - int(input_data["time"].timestamp()))
            weathersList_sorted = sorted(weathers["list"], key=lambda x: x["gap"])
            weather = weathersList_sorted[0]

            input_data["last_update"] = input_data["time"] # datetime
            input_data["temp"] = weather["main"]["temp"]
            input_data["humidity"] = weather["main"]["humidity"]
            input_data["visibility"] = weather["visibility"]
            input_data["windSpeed"] = weather["wind"]["speed"]
            input_data["windDeg"] = weather["wind"]["deg"]
            weatherMain = weather["weather"][0]["main"]
            # Set initial values to 0
            input_data['weatherMain_Clouds'] = 0
            input_data['weatherMain_Drizzle'] = 0
            input_data['weatherMain_Fog'] = 0
            input_data['weatherMain_Mist'] = 0
            input_data['weatherMain_Rain'] = 0
            input_data['weatherMain_Snow'] = 0
            # Check if weatherMain equals a specific description and set the corresponding variable to 1
            if weatherMain == "Clouds":
                input_data['weatherMain_Clouds'] = 1
            elif weatherMain == "Drizzle":
                input_data['weatherMain_Drizzle'] = 1
            elif weatherMain == "Fog":
                input_data['weatherMain_Fog'] = 1
            elif weatherMain == "Mist":
                input_data['weatherMain_Mist'] = 1
            elif weatherMain == "Rain":
                input_data['weatherMain_Rain'] = 1
            elif weatherMain == "Snow":
                input_data['weatherMain_Snow'] = 1

        data = pd.DataFrame(data_list)
        data["hour"] = data["last_update"].dt.hour
        data["day_of_week"] = data["last_update"].dt.dayofweek
        data["is_weekend"] = data["day_of_week"].isin([5, 6]).astype(int)
        data["month"] = data["last_update"].dt.month


        data['last_update'] = pd.to_datetime(data['last_update'])
        data['last_update'] = data['last_update'].view('int64') // 10**9

        features = ['position_lat', 'position_lng', 'bike_stands',
                    'temp', 'humidity', 'visibility', 'windSpeed', 'windDeg', 'hour',
                    'day_of_week', 'is_weekend', 'month', 'weatherMain_Clouds',
                    'weatherMain_Drizzle', 'weatherMain_Fog', 'weatherMain_Mist',
                    'weatherMain_Rain', 'weatherMain_Snow']

        X_data = data[features]

        predicted_bikes = self.model.predict(X_data)
        # change to python list
        predicted_bikes = predicted_bikes.tolist()
        # combine the result
        result = data[['last_update']].copy()
        # Convert the 'last_update' column from timestamp integers to datetime objects
        result.loc[:, 'time'] = pd.to_datetime(result['last_update'], unit='s')

        # Format the datetime objects to the desired format
        result['time'] = result['time'].dt.strftime('%m-%d %H:00')
        result["bikes"] = predicted_bikes
        result["bike_stands"] = data["bike_stands"]
        # restrict bikes in the range of [0, bike_stands] and get round value
        result["bikes"] = np.round(np.clip(result["bikes"], 0, result["bike_stands"])).astype(int)
        result["stands"] = result["bike_stands"] - result["bikes"].astype(int)
        result = result.drop('bike_stands', axis=1)
        result = result.drop('last_update', axis=1)
        # Convert the combined DataFrame to a JSON-style list
        json_style_list = result.to_dict(orient='records')

        return json_style_list

class RecommendService:
    def __init__(self, modelService):
        self.modelService = modelService
    # def __int__(self):
    #     self.stations = DatbaseService.get_stations_static()

    def recommend(self, location, time, type):
        """
        :param location: (lat,lng)
        :param time: datetime in the format %Y-%m-%d %H:%M
        :return: station info: {}
        """
        stations_info = DatbaseService.get_stations_static()
        candidates = []

        for s in stations_info:
            lat = s["position_lat"]
            lng = s["position_lng"]
            distance = self.get_distance(lat, lng, location[0], location[1])
            if distance <= 3000:
                s["distance"] = distance
                candidates.append(s)
        sorted_candidates = sorted(candidates, key=lambda x: x["distance"])
        result = dict()
        for s in sorted_candidates:
            # check if it has bikes/stands
            predict_res = self.modelService.predict(s, time)
            if type == "orig":
                if predict_res[0]["bikes"] > 0:
                    result = s
                    result["bikes"] = predict_res[0]["bikes"]
                    break
            else:
                if predict_res[0]["stands"] > 0:
                    result = s
                    result["stands"] = predict_res[0]["stands"]
                    break
        if not result:
            return result

        # get more information of this station from Google Distance Matrix API

        data = self.get_distance_from_API(location, (result["position_lat"], result["position_lng"]))
        distance_text = data["rows"][0]["elements"][0]["distance"]["text"]
        # distance_meters = data["rows"][0]["elements"][0]["distance"]["value"]
        duration_text = data["rows"][0]["elements"][0]["duration"]["text"]
        # duration_seconds = data["rows"][0]["elements"][0]["duration"]["value"]
        result["distance_text"] = distance_text
        result["duration_text"] = duration_text

        return result


    def get_distance_from_API(self, start, destination):
        origin_lat = start[0]
        origin_lng = start[1]
        des_lat = destination[0]
        des_lng = destination[1]
        base_url = "https://maps.googleapis.com/maps/api/distancematrix/json"
        params = {
            "origins": f"{origin_lat},{origin_lng}",
            "destinations": f"{des_lat},{des_lng}",
            "key": GoogleMap_API_KEY,
            "mode": "walking"
        }

        response = requests.get(base_url, params=params)
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            raise Exception(f"Error {response.status_code}: {response.text}")


    def get_distance(self, lat1, lon1, lat2, lon2):
        # Convert latitude and longitude from degrees to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        c = 2 * math.asin(math.sqrt(a))

        # Radius of Earth in kilometers. Use 3956 for miles
        radius_of_earth = 6371

        # Calculate the resulting distance in kilometers
        distance_km = c * radius_of_earth

        # Convert the distance to meters
        distance_m = distance_km * 1000

        return distance_m


