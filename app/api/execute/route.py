from http.server import BaseHTTPRequestHandler
import json
import sys
import io
import contextlib
import traceback
from typing import Dict, Any

def run_code(code: str) -> Dict[str, Any]:
    try:
        # Create string buffer to capture output
        output_buffer = io.StringIO()
        
        # Redirect stdout to our buffer
        with contextlib.redirect_stdout(output_buffer):
            try:
                # Execute the code and capture its output
                exec(code, {}, {})
                output = output_buffer.getvalue()
                return {
                    "status": 200,
                    "body": json.dumps({"output": output}),
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "POST, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type",
                    }
                }
            except Exception as e:
                error_output = f"Error: {str(e)}\n{traceback.format_exc()}"
                return {
                    "status": 400,
                    "body": json.dumps({"error": error_output}),
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "POST, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type",
                    }
                }
    except Exception as e:
        return {
            "status": 500,
            "body": json.dumps({
                "error": str(e),
                "traceback": traceback.format_exc()
            }),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        }

def GET():
    return {
        "status": 200,
        "body": json.dumps({
            "status": "online",
            "message": "CodeCanvas Editor API Server"
        }),
        "headers": {
            "Content-Type": "application/json"
        }
    }

def POST(request):
    try:
        body = json.loads(request.body)
        if not body or 'code' not in body:
            return {
                "status": 400,
                "body": json.dumps({"error": "No code provided"}),
                "headers": {"Content-Type": "application/json"}
            }
        
        return run_code(body['code'])
        
    except Exception as e:
        return {
            "status": 500,
            "body": json.dumps({
                "error": str(e),
                "traceback": traceback.format_exc()
            }),
            "headers": {"Content-Type": "application/json"}
        }

def OPTIONS():
    return {
        "status": 204,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    }