import json
import sys
import io
import contextlib
from http import HTTPStatus


def run_code(code: str):
    output_buffer = io.StringIO()
    error_buffer = io.StringIO()
    
    try:
        # Redirect stdout and stderr to capture execution output
        with contextlib.redirect_stdout(output_buffer), contextlib.redirect_stderr(error_buffer):
            exec(code, {'__builtins__': __builtins__}, {})
        
        # Successful execution
        return {
            "output": output_buffer.getvalue() or "Code executed successfully",
        }
    except Exception as e:
        # Capture errors during execution
        return {
            "error": f"{str(e)}\n{error_buffer.getvalue()}",
        }


def handler(event, context):
    try:
        # Parse the incoming JSON request body
        body = json.loads(event["body"])
        
        # Check if 'code' key is present
        if "code" not in body:
            return {
                "statusCode": HTTPStatus.BAD_REQUEST,
                "body": json.dumps({"error": "No code provided"}),
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }
        
        # Run the provided Python code
        result = run_code(body["code"])
        status = HTTPStatus.OK if "output" in result else HTTPStatus.BAD_REQUEST
        
        # Return the result
        return {
            "statusCode": status,
            "body": json.dumps(result),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        }
    
    except json.JSONDecodeError:
        # Handle invalid JSON
        return {
            "statusCode": HTTPStatus.BAD_REQUEST,
            "body": json.dumps({"error": "Invalid JSON format"}),
            "headers": {"Content-Type": "application/json"},
        }
    except Exception as e:
        # Handle unexpected errors
        return {
            "statusCode": HTTPStatus.INTERNAL_SERVER_ERROR,
            "body": json.dumps({"error": str(e)}),
            "headers": {"Content-Type": "application/json"},
        }
