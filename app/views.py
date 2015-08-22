from __future__ import unicode_literals
from datetime import datetime, timedelta

from flask import render_template, jsonify, redirect, url_for, session, make_response, request
from TwitterSearch import *
import pytz
from authomatic.adapters import WerkzeugAdapter
from authomatic import Authomatic

from config import TIME_RANGE, CONFIG, SECRET_KEY
from app import app, twitter
from forms import SearchForm, AuthForm

authomatic = Authomatic(CONFIG, SECRET_KEY, report_errors=False)

@app.route('/', methods=('GET', 'POST'))
@app.route('/index', methods=('GET', 'POST'))
def index():
	logged_in = False
	if 'consumer_key' in session:
		logged_in = True
	form = SearchForm(csrf_enabled=False)
	if form.validate_on_submit():
		return redirect('/q/' + form.search.data)
	return render_template('index.html', form=form, logged_in = logged_in)

@app.route('/test')
def test():
	return render_template("test.html")

@app.route('/login', methods=['GET', 'POST'])
def login():
	response = make_response()
	result = authomatic.login(WerkzeugAdapter(request, response), 'twitter')
	if result:
		if result.user:
			result.user.update()
			session['consumer_key'] = result.user.credentials.consumer_key
			session['consumer_secret'] = result.user.credentials.consumer_secret
			session['token'] = result.user.credentials.token
			session['token_secret'] = result.user.credentials.token_secret
		return redirect(url_for('index'))
	return response

@app.route('/q/<search>')
def search(search):
	twitter_utils = twitter.Twitter()
	credentials = session.get('credentials')
	search = [search]
	try:
		tso = TwitterSearchOrder()
		tso.set_language('en')
		tso.set_keywords(search)
		tso.set_include_entities(False) #Remove later if u want to use images
		query = TwitterSearch(
			consumer_key = session['consumer_key'],
			consumer_secret = session['consumer_secret'],
			access_token = session['token'],
			access_token_secret = session['token_secret']
		)
		response = query.search_tweets(tso)
		t_range = datetime.now(pytz.utc)-timedelta(minutes=TIME_RANGE)
		tweets = [
			t for t in response['content']['statuses'] if twitter_utils.get_date(t) >= t_range
		]
		print "Current rate-limiting status: " + str(query.get_metadata()['x-rate-limit-reset'])
		return render_template("page.html", search = search,
		 tweets = tweets, music_config = twitter_utils.get_music_config(tweets))
	except TwitterSearchException as e:
		return str(e)