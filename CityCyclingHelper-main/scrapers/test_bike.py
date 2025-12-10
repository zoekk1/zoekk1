import unittest
from functions_bike import *
import logging


class TestBikeInfo(unittest.TestCase):

    def test_get_data(self):
        obj = get_data()

        print(obj)

    def test_check_connection(self):
        check_connection()

    def test_init_database(self):
        init_database()

    def test_store_station(self):
        store_station()

    def test_store_availability(self):
        logger = logging.getLogger("test")
        store_availability(logger)

