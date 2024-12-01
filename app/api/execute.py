from http.server import BaseHTTPRequestHandler
import json
import io
import contextlib
import traceback

def run_code(code):
    output_buffer = io.StringIO()
    error_buffer = io.StringIO()
    
    try:
        with contextlib.redirect_stdout(output_buffer):
            with contextlib.redirect_stderr(error_buffer):
                exec(code, {}, {})
        return {"output": output_buffer.getvalue() or "Code executed successfully"}
    except Exception as e:
        return {"error": f"{str(e)}\n{error_buffer.getvalue()}"}

def handler(request):
    if request.method == "OPTIONS":
        return {
            "statusCode": 204,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        }
    
    try:
        body = json.loads(request.body)
        if not body or 'code' not in body:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "No code provided"}),
                "headers": {"Content-Type": "application/json"}
            }
        
        result = run_code(body['code'])
        return {
            "statusCode": 200 if "output" in result else 400,
            "body": json.dumps(result),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
            "headers": {"Content-Type": "application/json"}
        }

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        request_body = self.rfile.read(content_length).decode()
        
        request = type('Request', (), {
            'body': request_body,
            'method': 'POST'
        })
        
        response = handler(request)
        
        self.send_response(response['statusCode'])
        for key, value in response['headers'].items():
            self.send_header(key, value)
        self.end_headers()
        
        if 'body' in response:
            self.wfile.write(response['body'].encode())

    def do_OPTIONS(self):
        response = handler(type('Request', (), {'method': 'OPTIONS'}))
        self.send_response(response['statusCode'])
        for key, value in response['headers'].items():
            self.send_header(key, value)
        self.end_headers()