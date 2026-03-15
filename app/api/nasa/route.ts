import { NextResponse } from 'next/server';

export const runtime = 'edge';

const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'apod';
  
  try {
    let url = '';
    
    switch (endpoint) {
      case 'apod':
        url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
        break;
      case 'neo':
        const today = new Date().toISOString().split('T')[0];
        url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&api_key=${NASA_API_KEY}`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`NASA API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('NASA API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NASA data' },
      { status: 500 }
    );
  }
}
