import json
import io
import contextlib
import traceback
from typing import Dict, Any

def create_response(body: Dict[str, Any], status_code: int = 200) -> Dict[str, Any]:
    return {
        "body": json.dumps(body),
        "status": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    }

def run_code(code: str) -> Dict[str, Any]:
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

def OPTIONS(request):
    return create_response({}, 204)

async def POST(request):
    try:
        body = await request.json()
        if not body or 'code' not in body:
            return create_response({"error": "No code provided"}, 400)

        result = run_code(body['code'])
        return create_response(
            result,
            200 if "output" in result else 400
        )
    except Exception as e:
        return create_response({
            "error": str(e),
            "traceback": traceback.format_exc()
        }, 500)