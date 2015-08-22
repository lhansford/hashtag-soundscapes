import os

import authomatic
from authomatic.providers import oauth1

basedir = os.path.abspath(os.path.dirname(__file__))

# Twitter settings
TIME_RANGE = 60 #In mins, i.e. 10 would be all tweets from last 10 mins

REQUEST_TOKEN_URL = "https://api.twitter.com/oauth/request_token"
AUTHORIZE_URL = "https://api.twitter.com/oauth/authorize?oauth_token="
ACCESS_TOKEN_URL = "https://api.twitter.com/oauth/access_token"
SECRET_KEY='A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'

CONFIG = {

    'twitter': { # Your internal provider name

        # Provider class
        'class_': oauth1.Twitter,

        # Twitter is an AuthorizationProvider so we need to set several other properties too:
        'consumer_key': 'TGlHSYkzgaBerpKTFAsaMQ',
        'consumer_secret': 'HDscfokp2oLWCLIjZqWSBmJk6S68nhqbDzRVwu0YLk',
    }
 }