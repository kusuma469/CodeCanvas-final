from http.server import BaseHTTPRequestHandler
from http import HTTPStatus
import json
import sys
import io
import contextlib

def run_code(code: str):
    output_buffer = io.StringIO()
    error_buffer = io.StringIO()
    
    try:
        with contextlib.redirect_stdout(output_buffer):
            with contextlib.redirect_stderr(error_buffer):
                exec(code, {'__builtins__': __builtins__}, {})
                
        return {
            "body": json.dumps({"output": output_buffer.getvalue() or "Code executed successfully"}),
            "status": HTTPStatus.OK,
        }
    except Exception as e:
        return {
            "body": json.dumps({"error": str(e) + "\n" + error_buffer.getvalue()}),
            "status": HTTPStatus.BAD_REQUEST,
        }

def handler(request):
    if request.method == "OPTIONS":
        return {
            "status": HTTPStatus.NO_CONTENT,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        }
    
    if request.method != "POST":
        return {
            "status": HTTPStatus.METHOD_NOT_ALLOWED,
            "body": json.dumps({"error": "Method not allowed"}),
            "headers": {"Content-Type": "application/json"}
        }
    
    try:
        body = json.loads(request.body)
        if not body or 'code' not in body:
            return {
                "status": HTTPStatus.BAD_REQUEST,
                "body": json.dumps({"error": "No code provided"}),
                "headers": {"Content-Type": "application/json"}
            }
        
        result = run_code(body['code'])
        return {
            "status": result["status"],
            "body": result["body"],
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        }
    except Exception as e:
        return {
            "status": HTTPStatus.INTERNAL_SERVER_ERROR,
            "body": json.dumps({"error": str(e)}),
            "headers": {"Content-Type": "application/json"}
        }