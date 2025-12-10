import json
import traceback

import requests
from sqlalchemy import create_engine, text
from sqlalchemy.exc import IntegrityError

from config_info import *
def get_engine():
    """
    get engine to handle database
    :return: sqlalchemy engine
    """
    engine = create_engine('mysql://{}:{}@{}/{}'.format(USER, PASSWORD, HOST, DATABASE), echo=True)
    return engine


def check_connection():
    """
    check if engine connected to mysql server
    :return:
    """
    engine = get_engine()
    with engine.connect() as conn:
        res = conn.execute(text("show variables"))
        for row in res:
            print(row)
            break


def init_database():
    """
    create database: dbbikes
    create table: station, availability
    :return:
    """
    engine = get_engine()
    sql1 = "create database if not exists dbbikes;"
    sql2 = """
    use dbbikes;
    drop table if exists station;
    create table station(
        `number` integer not null,
        `name` varchar(128),
        address varchar(128),
        position_lat decimal(8,6),
        position_lng decimal(9,6),
        banking integer,
        bonus integer,
        bike_stands integer,
        primary key(`number`),
        unique(`name`)
    );
    """
    sql3 = """
    drop table if exists availability;
    create table availability(
        `number` integer not null,
        available_bike_stands integer,
        available_bikes integer,
        `status` varcharacter(128),
        last_update integer,
        primary key(`number`, last_update)
    );
    """
    with engine.connect() as conn:
        conn.begin()
        try:
            conn.execute(text(sql1))
            conn.execute(text(sql2))
            conn.execute(text(sql3))
            conn.commit()
        except Exception as e:
            tb = traceback.format_exc()
            print(f"An error occurred: {e}\n{tb}")


def get_data():
    """
    get data from JCDecaux API
    :return: python object of response json
    """
    r = requests.get(STATIONS_URI, params={"apiKey": JCKEY, "contract": NAME})
    # change response json to python object
    return json.loads(r.text)


def store_station():
    """
    insert static data into table 'station'
    :return:
    """
    stations = get_data()
    engine = get_engine()
    with engine.connect() as conn:
        pre_sql = text(
            "insert into station values(:number,:name,:address,:position_lat,:position_lng,:banking,:bonus,:bike_stands)")
        conn.begin()
        try:
            for station in stations:
                insert_data = {"number": station.get("number"), "name": station.get("name"),
                               "address": station.get("address"),
                               "position_lat": station.get("position").get("lat"),
                               "position_lng": station.get("position").get("lng"),
                               "banking": int(station.get("banking")), "bonus": int(station.get("bonus")),
                               "bike_stands": station.get("bike_stands")}

                conn.execute(pre_sql, insert_data)
            conn.commit()
        except Exception as e:
            tb = traceback.format_exc()
            print(f"An error occurred: {e}\n{tb}")


def store_availability(logger):
    """
    insert dynamic data into table 'availability'
    :return:
    """
    stations = get_data()
    engine = get_engine()
    update = 0
    with engine.connect() as conn:
        pre_sql = text(
            "insert into availability values(:number,:available_bike_stands,:available_bikes,:status,:last_update)")

        for station in stations:
            insert_data = {"number": station.get("number"),
                           "available_bike_stands": station.get("available_bike_stands"),
                           "available_bikes": station.get("available_bikes"), "status": station.get("status"),
                           "last_update": station.get("last_update") // 1000}
            try:
                conn.execute(pre_sql, insert_data)
                conn.commit()
                update += 1
            except IntegrityError:
                continue
            except Exception as e:
                tb = traceback.format_exc()
                logger.exception(f"An error occurred: {e}\n{tb}")

    return update
