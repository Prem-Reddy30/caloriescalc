import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  return NextResponse.json(
    { message: 'YOUR BROWSER IS CACHING THE OLD WEBSITE. You must clear your browser cache (Clear Browsing Data -> Cached images and files) to log in!' },
    { status: 400 }
  );
}
