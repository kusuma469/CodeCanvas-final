from http.server import BaseHTTPRequestHandler
import json
import sys
import io
import contextlib

def run_code(code):
    # Create string buffer to capture output
    output_buffer = io.StringIO()
    
    try:
        # Redirect stdout to our buffer
        with contextlib.redirect_stdout(output_buffer):
            # Execute the code in a safe environment
            exec(code)
            output = output_buffer.getvalue()
            return {
                "statusCode": 200,
                "body": json.dumps({"output": output}),
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
            "body": json.dumps({"error": str(e)}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        }

def handler(request):
    if request.method == "OPTIONS":
        return {
            "statusCode": 204,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        }
    
    if request.method != "POST":
        return {
            "statusCode": 405,
            "body": json.dumps({"error": "Method not allowed"}),
            "headers": {"Content-Type": "application/json"}
        }
    
    try:
        # Parse request body
        body = json.loads(request.body) if request.body else {}
        
        if not body or 'code' not in body:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "No code provided"}),
                "headers": {"Content-Type": "application/json"}
            }
        
        return run_code(body['code'])
        
    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid JSON in request body"}),
            "headers": {"Content-Type": "application/json"}
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": str(e)
            }),
            "headers": {"Content-Type": "application/json"}
        }