import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

export type ApiErrorOptions = {
  status?: number;
  message?: string;
  userMessage?: string;
  log?: boolean;
};

const USER_MESSAGES: Record<number, string> = {
  400: 'Invalid request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Resource not found',
  409: 'Conflict',
  429: 'Too many requests',
  500: 'An unexpected error occurred',
};

export function apiError(
  error: unknown,
  options: ApiErrorOptions = {}
): NextResponse {
  const { status = 500, message, userMessage, log = true } = options;

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation error', details: error.flatten() },
      { status: 400 }
    );
  }

  const safeUserMessage = userMessage ?? USER_MESSAGES[status] ?? 'An unexpected error occurred';

  if (log && status >= 500) {
    logger.error('API error', { error, status, message });
  }

  return NextResponse.json({ error: safeUserMessage }, { status });
}

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}
