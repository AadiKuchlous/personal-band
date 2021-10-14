import os
import sys
from pathlib import Path
import subprocess

dir = os.getcwd()

paths = Path(dir).glob('*.wav')
for file in paths:
	split_path = str(file).split('/')
	split_path[-1] = 'n'+split_path[-1]
	new_path = Path('/'.join(split_path))
	subprocess.run(['sox', file, new_path, 'gain', '-n', '-3'])
	subprocess.run(['mv', new_path, file])
print(dir)
