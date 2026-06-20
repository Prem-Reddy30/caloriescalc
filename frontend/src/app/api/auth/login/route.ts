import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://caloriescalc-backend.onrender.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Server is starting up. Please try again in a few seconds.' },
      { status: 503 }
    );
  }
}
