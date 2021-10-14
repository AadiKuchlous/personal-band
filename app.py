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
  paths = Path(dir) / 'static' / 'audio_files'
  insts = []
  for inst_path in paths.iterdir():
    if inst_path.is_dir():
      insts.append(str(inst_path).split('/')[-1])

  return render_template("main.html", insts = insts)

if __name__ == "__main__":
  app.run()
