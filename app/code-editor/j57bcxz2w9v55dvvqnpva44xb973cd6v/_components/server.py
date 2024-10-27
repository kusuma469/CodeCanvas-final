from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/execute', methods=['POST'])
def execute_code():
    data = request.get_json()
    code = data.get('code')
    # Save the code to a temporary file
    with open('temp_script.py', 'w') as f:
        f.write(code)
    
    # Execute the Python code
    try:
        result = subprocess.run(['python', 'temp_script.py'], capture_output=True, text=True)
        output = result.stdout if result.returncode == 0 else result.stderr
        return jsonify({'output': output})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
