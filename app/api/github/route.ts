import { NextResponse } from 'next/server';

export const runtime = 'edge';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'iMaxwe11';
  const endpoint = searchParams.get('endpoint') || 'repos';
  
  try {
    let url = '';
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }
    
    switch (endpoint) {
      case 'user':
        url = `https://api.github.com/users/${username}`;
        break;
      case 'repos':
        url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`;
        break;
      case 'events':
        url = `https://api.github.com/users/${username}/events/public?per_page=10`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data' },
      { status: 500 }
    );
  }
}
