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
        # Ensure user is authenticated
        user_id = event.get("headers", {}).get("x-user-id")
        if not user_id:
            return {
                "statusCode": HTTPStatus.UNAUTHORIZED,
                "body": json.dumps({"error": "Unauthorized"}),
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }

        # Parse the incoming JSON request body
        body = json.loads(event["body"])
        if "code" not in body:
            return {
                "statusCode": HTTPStatus.BAD_REQUEST,
                "body": json.dumps({"error": "No code provided"}),
                "headers": {"Content-Type": "application/json"},
            }

        # Run the provided Python code
        result = run_code(body["code"])
        status = HTTPStatus.OK if "output" in result else HTTPStatus.BAD_REQUEST

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
        return {
            "statusCode": HTTPStatus.BAD_REQUEST,
            "body": json.dumps({"error": "Invalid JSON format"}),
            "headers": {"Content-Type": "application/json"},
        }
    except Exception as e:
        return {
            "statusCode": HTTPStatus.INTERNAL_SERVER_ERROR,
            "body": json.dumps({"error": str(e)}),
            "headers": {"Content-Type": "application/json"},
        }