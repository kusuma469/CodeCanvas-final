from typing import Union, Dict, Any
from http import HTTPStatus
import json
import sys
import io
import contextlib
import traceback

def create_response(body: Dict[str, Any], status_code: int = 200, headers: Dict[str, str] = None) -> Dict[str, Any]:
    default_headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    
    if headers:
        default_headers.update(headers)
    
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
        "headers": default_headers
    }

def run_code(code: str) -> dict[str, Any]:
    try:
        output_buffer = io.StringIO()
        error_buffer = io.StringIO()
        
        with contextlib.redirect_stdout(output_buffer):
            with contextlib.redirect_stderr(error_buffer):
                exec(code, {}, {})
                
        return {
            "output": output_buffer.getvalue() or "Code executed successfully"
        }
    except Exception as e:
        error_msg = f"{str(e)}\n{error_buffer.getvalue()}"
        return {"error": error_msg}

def OPTIONS() -> Dict[str, Any]:
    return create_response({}, HTTPStatus.NO_CONTENT)

async def POST(request) -> Dict[str, Any]:
    try:
        body = await request.json()
        if not body or 'code' not in body:
            return create_response(
                {"error": "No code provided"},
                status_code=400
            )

        result = run_code(body['code'])
        return create_response(
            result,
            status_code=200 if "output" in result else 400
        )
    except Exception as e:
        return create_response(
            {
                "error": str(e),
                "traceback": traceback.format_exc()
            },
            status_code=500
        )