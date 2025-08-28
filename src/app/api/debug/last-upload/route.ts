import { NextResponse } from 'next/server'
import { getLastUploadResult } from '@/lib/debug-store'

export async function GET() {
  const lastUploadResult = getLastUploadResult()
  
  if (!lastUploadResult) {
    return NextResponse.json({ message: 'No upload data available yet' })
  }
  
  return NextResponse.json(lastUploadResult)
}