import { NextRequest, NextResponse } from 'next/server'

//Keep track of requests for each IP in the past five seconds to only allow one GPT request every five seconds
const ipToRequestCountFiveSeconds = new Map<string, number>()
const fiveSecondsRateLimiter = {
  windowStart: Date.now(),
  windowSize: 5 * 1000,
  maxRequests: 1,
}

//Keep track of requests for each IP in the past ten minutes to only allow twenty GPT requests every ten minutes
const ipToRequestCountTenMinutes = new Map<string, number>()
const tenMinutesRateLimiter = {
  windowStart: Date.now(),
  windowSize: 10 * 60 * 1000,
  maxRequests: 20,
}

//Keep track of requests for each IP in the past minute to only allow ten website requests every minute
const ipToRequestCountOneMinute = new Map<string, number>()
const oneMinuteRateLimiter = {
  windowStart: Date.now(),
  windowSize: 60 * 1000,
  maxRequests: 10,
}

const limitWebsite = (ip: string) => {
  // Check and update current window
  const now = Date.now();
  const isNewWindow = now - oneMinuteRateLimiter.windowStart > oneMinuteRateLimiter.windowSize
  if (isNewWindow) {
    oneMinuteRateLimiter.windowStart = now
    ipToRequestCountOneMinute.set(ip, 0)
  }

  // Check and update current request limits
  const currentRequestCount = ipToRequestCountOneMinute.get(ip) ?? 0
  if (currentRequestCount >= oneMinuteRateLimiter.maxRequests) {
    return true
  }
  ipToRequestCountOneMinute.set(ip, currentRequestCount + 1)

  return false
}

const limitGPT = (ip: string) => {
  // Check and update current window
  const now = Date.now();
  const isNewFiveSecondWindow = now - fiveSecondsRateLimiter.windowStart > fiveSecondsRateLimiter.windowSize
  if (isNewFiveSecondWindow) {
    fiveSecondsRateLimiter.windowStart = now
    ipToRequestCountFiveSeconds.set(ip, 0)
  }
  const isNewTenMinuteWindow = now - tenMinutesRateLimiter.windowStart > tenMinutesRateLimiter.windowSize
  if (isNewTenMinuteWindow) {
    tenMinutesRateLimiter.windowStart = now
    ipToRequestCountTenMinutes.set(ip, 0)
  }

  // Check and update current request limits
  const currentRequestCountFiveSeconds = ipToRequestCountFiveSeconds.get(ip) ?? 0
  if (currentRequestCountFiveSeconds >= fiveSecondsRateLimiter.maxRequests) {
    return true
  }
  ipToRequestCountFiveSeconds.set(ip, currentRequestCountFiveSeconds + 1)
  const currentRequestCountTenMinutes = ipToRequestCountTenMinutes.get(ip) ?? 0
  if (currentRequestCountTenMinutes >= tenMinutesRateLimiter.maxRequests) {
    return true
  }

  return false
}

export async function middleware(request: NextRequest) {
    const ip = request.ip ?? request.headers.get('X-Forwarded-For') ?? 'unknown'
    const path = request.nextUrl.clone().pathname
    if (path === "/api/modal") {
      if (limitWebsite(ip)) {
        console.log("Rate limited website")
        return NextResponse.json({data: "Rate limited" }, { status: 429 })
      }
    }
    if (path === "/api/gpt") {
      if (limitGPT(ip)) {
        console.log("Rate limited GPT")
        return NextResponse.json({data: "Rate limited" }, { status: 429 })
      }
    }
    return NextResponse.next()
}
 
export const config = {
  matcher: [
    '/api/:path*',
  ],
}