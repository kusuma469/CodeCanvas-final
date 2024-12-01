import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface PythonOutput {
  stdout: string;
  stderr: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "No code provided" },
        { status: 400 }
      );
    }

    // Create base64 encoded Python code to pass as argument
    const encodedCode = Buffer.from(code).toString('base64');
    
    try {
      // Execute Python with encoded code
      const { stdout, stderr }: PythonOutput = await execAsync(
        `python -c "import base64; exec(base64.b64decode('${encodedCode}').decode())"`
      );

      if (stderr) {
        return NextResponse.json({ error: stderr }, { status: 400 });
      }

      return NextResponse.json({ output: stdout }, { status: 200 });

    } catch (execError: unknown) {
      const error = execError as Error;
      return NextResponse.json(
        { error: error.message || "Code execution failed" },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}