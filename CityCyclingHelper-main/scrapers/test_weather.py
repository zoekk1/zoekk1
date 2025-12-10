import unittest
import logging
from datetime import datetime

from functions_weather import *


class TestWeatherInfo(unittest.TestCase):

    def test_get_data(self):
        obj = get_data()
        print(obj)

    def test_init_database(self):
        init_database()

    def test_store_weather_data(self):
        logger = logging.getLogger("test")
        store_weather_data(logger)
    def test_demo(self):
        a = datetime.now().timestamp()
        # a = datetime.timestamp(a) - 86400
        print(a)
