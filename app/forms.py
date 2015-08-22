from flask_wtf import Form
from wtforms import TextField
from wtforms.validators import DataRequired

class SearchForm(Form):
    search = TextField('Search', validators=[DataRequired()])

class AuthForm(Form):
	auth_code = TextField('Authcode', validators=[DataRequired()])