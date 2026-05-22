import { NextRequest, NextResponse } from 'next/server'
import { searchMovie } from '@/lib/tmdb'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')
  if (!q) {
    return NextResponse.json([])
  }
  try {
    const results = await searchMovie(q)
    return NextResponse.json(results)
  } catch (error) {
    console.error('搜索电影失败:', error)
    return NextResponse.json(
      { error: '搜索失败，请检查 TMDB API 配置' },
      { status: 500 }
    )
  }
}
