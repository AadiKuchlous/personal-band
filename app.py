from flask import Flask, render_template
import os
from pathlib import Path

dir = os.getcwd()

app = Flask(__name__)
app.config['ENV'] = 'development'
app.config['DEBUG'] = True
app.config['TESTING'] = True

@app.route("/")
def hello():
#  paths = Path(dir) / 'static' / 'audio_files'
  return render_template("main.html")
