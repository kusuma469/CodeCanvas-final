import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

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

    // Create a temporary Python file
    const timestamp = new Date().getTime();
    const tempFile = path.join('/tmp', `code_${timestamp}.py`);
    fs.writeFileSync(tempFile, code);

    try {
      // Execute the Python code
      const { stdout, stderr } = await execAsync(`python ${tempFile}`);
      
      // Clean up
      fs.unlinkSync(tempFile);

      if (stderr) {
        return NextResponse.json({ error: stderr }, { status: 400 });
      }

      return NextResponse.json({ output: stdout }, { status: 200 });

    } catch (error: any) {
      // Clean up on error
      fs.unlinkSync(tempFile);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}