import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    
    if (!response.ok) {
      throw new Error(`ISS API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    console.error('ISS API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ISS location' },
      { status: 500 }
    );
  }
}
