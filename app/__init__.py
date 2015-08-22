from flask import Flask
from app.config import basedir

app = Flask(__name__)
app.config.from_object('app.config')

app.config.update(
	SECRET_KEY='A0Zr98j/3yX R~XHH!jmN]LWX/,?RT',
    DEBUG=True
)

from app import views
