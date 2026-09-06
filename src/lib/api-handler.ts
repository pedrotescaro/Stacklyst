import { NextResponse } from 'next/server';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AppError } from './errors';
import { logger } from './logger';
import { getAuthUser } from './auth';
import { ZodError } from 'zod';

export interface RateLimitStore {
  limit?: number;
  remaining?: number;
  reset?: number;
}

export const rateLimitStorage = new AsyncLocalStorage<RateLimitStore>();

export interface ApiContext {
  session: any; // The authenticated database User or null
  params: Promise<any>;
}

export function apiHandler(handler: (req: Request, ctx: ApiContext) => Promise<Response>) {
  return async (req: Request, segmentData: { params: Promise<any> }) => {
    const requestId = crypto.randomUUID();
    const store: RateLimitStore = {};

    return rateLimitStorage.run(store, async () => {
      try {
        const session = await getAuthUser();

        // Execute the actual route logic
        const response = await handler(req, {
          session,
          params: segmentData.params,
        });

        // Attach Rate Limit headers if set during execution
        if (store.limit !== undefined) {
          response.headers.set('X-RateLimit-Limit', String(store.limit));
        }
        if (store.remaining !== undefined) {
          response.headers.set('X-RateLimit-Remaining', String(store.remaining));
        }
        if (store.reset !== undefined) {
          response.headers.set('X-RateLimit-Reset', String(Math.ceil(store.reset / 1000)));
        }

        response.headers.set('X-Request-Id', requestId);
        return response;
      } catch (e: any) {
        let statusCode = 500;
        let responsePayload: { error: string; message: string; details?: any } = {
          error: 'INTERNAL_ERROR',
          message: 'Internal server error',
        };

        if (e instanceof ZodError) {
          statusCode = 400;
          responsePayload = {
            error: 'VALIDATION_ERROR',
            message: 'Confira os dados enviados e tente novamente.',
          };
        } else if (e instanceof AppError) {
          statusCode = e.statusCode;
          responsePayload = {
            error: e.code,
            message: e.message,
            details: e.details,
          };
          logger.warn('API application error', {
            code: e.code,
            message: e.message,
            statusCode: e.statusCode,
            details: e.details,
            requestId,
          });
        } else {
          logger.error('Unhandled server error', {
            error: e?.message || String(e),
            stack: e?.stack,
            requestId,
          });
        }

        const response = NextResponse.json(responsePayload, { status: statusCode });
        response.headers.set('X-Request-Id', requestId);

        // Attach rate limit headers to error responses too (like 429)
        if (store.limit !== undefined) {
          response.headers.set('X-RateLimit-Limit', String(store.limit));
        }
        if (store.remaining !== undefined) {
          response.headers.set('X-RateLimit-Remaining', String(store.remaining));
        }
        if (store.reset !== undefined) {
          response.headers.set('X-RateLimit-Reset', String(Math.ceil(store.reset / 1000)));
        }

        return response;
      }
    });
  };
}
