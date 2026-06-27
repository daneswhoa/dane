import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  const headersList = await headers();
  const headersObj: Record<string, string> = {};
  headersList.forEach((value, key) => {
    headersObj[key] = value;
  });
  
  return NextResponse.json({
    headers: headersObj,
  });
}
