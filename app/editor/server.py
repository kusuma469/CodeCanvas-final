from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
import tempfile
import json
import sys
from datetime import datetime
import traceback
import stat

app = Flask(__name__)
CORS(app)

# Add root route handler
@app.route('/')
def index():
    return jsonify({
        "status": "online",
        "message": "CodeCanvas Editor API Server",
        "endpoints": {
            "/execute": "POST - Execute Python code",
        }
    })

# Rest of your existing code remains exactly the same
def ensure_temp_directory():
    """Create and ensure proper permissions for temp directory"""
    temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp')
    try:
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)
        os.chmod(temp_dir, stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO)
        return temp_dir
    except Exception as e:
        print(f"Error creating temp directory: {str(e)}", file=sys.stderr)
        return tempfile.gettempdir()

TEMP_DIR = ensure_temp_directory()

def generate_temp_filename():
    """Generate a unique filename with timestamp"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    return os.path.join(TEMP_DIR, f'python_script_{timestamp}.py')

def cleanup_file(filepath):
    """Clean up a specific temporary file"""
    try:
        if os.path.exists(filepath):
            os.chmod(filepath, stat.S_IRUSR | stat.S_IWUSR)
            os.remove(filepath)
    except Exception as e:
        print(f"Error cleaning up {filepath}: {str(e)}", file=sys.stderr)

@app.route('/execute', methods=['POST'])
def execute_code():
    try:
        data = request.get_json()
        if not data or 'code' not in data:
            return jsonify({'error': 'No code provided'}), 400

        code = data['code']
        filename = generate_temp_filename()
        
        try:
            # Write file with proper permissions
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(code)
            
            # Set file permissions
            os.chmod(filename, stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO)

            # Execute Python code
            result = subprocess.run(
                ['python', filename],
                capture_output=True,
                text=True,
                timeout=30,
                cwd=TEMP_DIR
            )

            return jsonify({
                'output': result.stdout if result.returncode == 0 else result.stderr
            })

        finally:
            # Clean up temp file
            cleanup_file(filename)

    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Execution timed out (30 seconds limit)'}), 408
    except Exception as e:
        error_details = {
            'error': str(e),
            'traceback': traceback.format_exc()
        }
        return jsonify(error_details), 500

if __name__ == '__main__':
    print(f"Server starting on http://localhost:5000")
    print(f"Working directory: {TEMP_DIR}")
    print(f"Temp directory exists: {os.path.exists(TEMP_DIR)}")
    print(f"Temp directory is writable: {os.access(TEMP_DIR, os.W_OK)}")
    app.run(host='0.0.0.0', port=5000, debug=True)