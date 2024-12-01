from http.server import BaseHTTPRequestHandler
import json
import sys
import io
import contextlib

def run_code(code: str):
    # Create string buffer to capture output
    output_buffer = io.StringIO()
    error_buffer = io.StringIO()
    
    try:
        # Redirect stdout and stderr
        with contextlib.redirect_stdout(output_buffer):
            with contextlib.redirect_stderr(error_buffer):
                # Execute the code in a restricted environment
                exec(code, {'__builtins__': __builtins__}, {})
                
        return {
            "output": output_buffer.getvalue() or "Code executed successfully"
        }
    except Exception as e:
        return {
            "error": str(e) + "\n" + error_buffer.getvalue()
        }

def handle_cors():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

def handler(request):
    if request.method == "OPTIONS":
        return {
            "statusCode": 204,
            "headers": handle_cors()
        }
    
    if request.method != "POST":
        return {
            "statusCode": 405,
            "body": json.dumps({"error": "Method not allowed"}),
            "headers": {"Content-Type": "application/json"}
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
                **handle_cors()
            }
        }
        
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
            "headers": {"Content-Type": "application/json"}
        }