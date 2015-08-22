from datetime import datetime, timedelta

from textblob import TextBlob
import pytz

class Twitter(object):

	def get_date(self, tweet):
		""" Return the post time of a tweet as a datetime object """
		months = [
			'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
		]
		day,mon,date,time,zone,year = tweet['created_at'].split(" ")
		hour,minute,sec = time.split(":")
		month = [i+1 for i,m in enumerate(months) if m == mon]
		return datetime(int(year), month[0], int(date), hour=int(hour),
			minute=int(minute), second=int(sec), tzinfo=pytz.utc)

	def get_music_config(self, tweets):
		music_config = {}
		music_config['tweet_count'] = len(tweets)
		music_config['retweet_count'] = 0
		music_config['polarity'] = 0
		music_config['subjectivity'] = 0
		music_config['average_length'] = 0
		music_config['tweet_rate'] = 0
		if music_config['tweet_count'] == 0:
			return music_config
		retweet_count = 0
		polarity = 0
		subjectivity = 0
		total_length= 0
		unparsed = 0
		for t in tweets:
			retweet_count += t['retweet_count']
			total_length += len(t['text'])
			p, s = self.get_tweet_sentiment(t['text'])
			if p == 0.0 and s == 0.0:
				unparsed+=1
			polarity += p
			subjectivity += s
		music_config['retweet_count'] = retweet_count / music_config['tweet_count']
		music_config['average_length'] = total_length / music_config['tweet_count']
		music_config['tweet_rate'] = self.get_tweet_rate(len(tweets), tweets[0], tweets[-1])
		if music_config['tweet_count']-unparsed <= 0:
			return music_config
		music_config['polarity'] = polarity / (music_config['tweet_count']-unparsed)
		music_config['subjectivity'] = subjectivity / (music_config['tweet_count']-unparsed)
		return music_config

	def get_tweet_sentiment(self, text):
		""" Returns the polarity and subjectivity rating of a string. """
		blob = TextBlob(text)
		return blob.sentiment.polarity, blob.sentiment.subjectivity

	def get_tweet_rate(self, num_tweets, first_tweet, last_tweet):
		""" Gets the rate of tweets (measured as tweet per minute). This is stored
		as 'tweet_rate' in the dictionary sent to the web page.
		"""
		time_since = self.get_date(first_tweet) - self.get_date(last_tweet)
		seconds = time_since.total_seconds()
		if seconds < 1:
			seconds = 1
		return (60.0 / seconds) * num_tweets