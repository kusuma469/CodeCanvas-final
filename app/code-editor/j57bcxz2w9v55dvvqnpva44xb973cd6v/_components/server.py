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
    language = data.get('language')  # Get the language from the request data

    if language == 'python':
        # Save the Python code to a temporary file
        filename = 'temp_script.py'
        with open(filename, 'w') as f:
            f.write(code)

        # Execute the Python code
        try:
            result = subprocess.run(['python', filename], capture_output=True, text=True)
            output = result.stdout if result.returncode == 0 else result.stderr
            return jsonify({'output': output})
        except Exception as e:
            return jsonify({'error': str(e)})

    elif language == 'java':
        # Save the Java code to a temporary file
        filename = 'Main.java'
        with open(filename, 'w') as f:
            f.write(code)

        try:
            # Compile the Java code
            compile_process = subprocess.run(['javac', filename], capture_output=True, text=True)
            if compile_process.returncode != 0:
                return jsonify({'error': compile_process.stderr}), 400  # Return compilation errors

            # Run the compiled Java program
            run_process = subprocess.run(['java', 'Main'], capture_output=True, text=True)
            output = run_process.stdout if run_process.returncode == 0 else run_process.stderr
            return jsonify({'output': output})
        except Exception as e:
            return jsonify({'error': str(e)})

    return jsonify({'error': 'Unsupported language'}), 400  # Handle unsupported languages

if __name__ == '__main__':
    app.run(debug=True)
