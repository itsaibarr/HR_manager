import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = await request.json()

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'Provider and API key are required' },
        { status: 400 }
      )
    }

    // Test connection based on provider
    switch (provider) {
      case 'gemini': {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
        await model.generateContent('test')
        break
      }

      case 'openai': {
        const openai = new OpenAI({ apiKey })
        await openai.models.list()
        break
      }

      case 'claude': {
        const anthropic = new Anthropic({ apiKey })
        await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        })
        break
      }

      default:
        return NextResponse.json(
          { error: 'Invalid provider' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Connection test failed:', error)
    return NextResponse.json(
      { error: error.message || 'Connection test failed' },
      { status: 500 }
    )
  }
}
