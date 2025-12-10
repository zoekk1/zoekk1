from functions_bike import store_availability
import logging
from datetime import datetime
from config_info import PRE_PATH
# Create a logger object
logger = logging.getLogger('scraper_bike_logger')
logger.setLevel(logging.DEBUG)

# Create a file handler object
today = datetime.today().strftime('%Y_%m_%d')

fh = logging.FileHandler(f'{PRE_PATH}scraper_bike_{today}.log')

# Set the log level for the file handler
fh.setLevel(logging.DEBUG)

# Create a formatter object and set it for the file handler
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
fh.setFormatter(formatter)

# Add the file handler to the logger
logger.addHandler(fh)

update = store_availability(logger)
logger.info(f"Scraper update {update} rows.")
