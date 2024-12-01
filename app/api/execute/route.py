from http.server import BaseHTTPRequestHandler
from http import HTTPStatus
import json
import sys
import io
import contextlib
import traceback

def run_code(code):
    try:
        # Create string buffer to capture output
        output_buffer = io.StringIO()
        error_buffer = io.StringIO()
        
        # Redirect stdout to our buffer
        with contextlib.redirect_stdout(output_buffer):
            with contextlib.redirect_stderr(error_buffer):
                exec(code, {}, {})
                
        return {
            "statusCode": 200,
            "body": json.dumps({"output": output_buffer.getvalue() or "Code executed successfully"}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        }
    except Exception as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": str(e) + "\n" + error_buffer.getvalue()}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        }

def handler(request):
    try:
        body = json.loads(request.body)
        if not body or 'code' not in body:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "No code provided"}),
                "headers": {"Content-Type": "application/json"}
            }
        
        result = run_code(body['code'])
        return result
        
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": str(e),
                "traceback": traceback.format_exc()
            }),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        }

class VercelHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        request_body = self.rfile.read(content_length).decode()
        
        request = type('Request', (), {
            'method': 'POST',
            'body': request_body
        })
        
        response = handler(request)
        
        self.send_response(response['statusCode'])
        for key, value in response.get('headers', {}).items():
            self.send_header(key, value)
        self.end_headers()
        
        if 'body' in response:
            self.wfile.write(response['body'].encode())

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()