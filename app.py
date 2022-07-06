from flask import Flask, render_template, send_from_directory
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

@app.route("/spongebob")
def sb():
#  paths = Path(dir) / 'static' / 'audio_files'
  return send_from_directory(".", "spongebob/index.html")
