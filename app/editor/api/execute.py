from http.server import BaseHTTPRequestHandler
import json
import io
import contextlib
import traceback

def run_code(code):
    output_buffer = io.StringIO()
    try:
        with contextlib.redirect_stdout(output_buffer):
            # Create a restricted globals dict for safer execution
            exec_globals = {
                '__builtins__': {
                    name: __builtins__[name]
                    for name in ['print', 'range', 'len', 'str', 'int', 'float', 'list', 'dict']
                }
            }
            exec(code, exec_globals, {})
            return {
                "statusCode": 200,
                "body": json.dumps({"output": output_buffer.getvalue()}),
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
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
                "Access-Control-Allow-Headers": "Content-Type"
            }
        }

def handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return {
            "statusCode": 204,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        if not body or 'code' not in body:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "No code provided"}),
                "headers": {"Content-Type": "application/json"}
            }
        
        return run_code(body['code'])
        
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
            "headers": {"Content-Type": "application/json"}
        }