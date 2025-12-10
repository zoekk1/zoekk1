from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from .config import *

app = Flask(__name__, static_url_path="/")
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://{}:{}@{}/{}'.format(USER, PASSWORD, HOST, DATABASE)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

from . import views  # Import views.py after creating the app instance