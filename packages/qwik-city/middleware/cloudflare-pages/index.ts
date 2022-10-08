import type { QwikCityRequestOptions, QwikCityRequestContext } from '../request-handler/types';
import { notFoundHandler, requestHandler } from '../request-handler';
import type { Render } from '@builder.io/qwik/server';

// @builder.io/qwik-city/middleware/cloudflare-pages

/**
 * @alpha
 */
export function qwikCity(render: Render, opts?: QwikCityCloudflarePagesOptions) {
  async function onRequest({ request, next, env, waitUntil }: EventPluginContext) {
    try {
      const url = new URL(request.url);

      // https://developers.cloudflare.com/workers/runtime-apis/cache/
      const useCache =
        url.hostname !== '127.0.0.1' &&
        url.hostname !== 'localhost' &&
        url.port === '' &&
        request.method === 'GET';
      const cacheKey = new Request(url.href, request);
      const cache = useCache ? await caches.open('custom:qwikcity') : null;
      if (cache) {
        const cachedResponse = await cache.match(cacheKey);
        if (cachedResponse) {
          return cachedResponse;
        }
      }

      const requestCtx: QwikCityRequestContext<Response> = {
        url,
        request,
        response: (status, headers, body) => {
          return new Promise<Response>((resolve) => {
            let flushedHeaders = false;
            const { readable, writable } = new TransformStream();
            const writer = writable.getWriter();
            const response = new Response(readable, { status, headers });

            body({
              write: (chunk) => {
                if (!flushedHeaders) {
                  flushedHeaders = true;
                  resolve(response);
                }
                if (typeof chunk === 'string') {
                  const encoder = new TextEncoder();
                  writer.write(encoder.encode(chunk));
                } else {
                  writer.write(chunk);
                }
              },
            }).finally(() => {
              if (!flushedHeaders) {
                flushedHeaders = true;
                resolve(response);
              }
              writer.close();
            });

            if (response.ok && cache && response.headers.has('Cache-Control')) {
              // Store the fetched response as cacheKey
              // Use waitUntil so you can return the response without blocking on
              // writing to cache
              waitUntil(cache.put(cacheKey, response.clone()));
            }
          });
        },
      };

      // check if the next middleware is able to handle this request
      // useful if the request is for a static asset but app uses a catchall route
      const nextResponse = await next();
      if (nextResponse.ok) {
        // next response is able to handle this request
        return nextResponse;
      }

      // next middleware unable to handle request
      // send request to qwik city request handler
      const handledResponse = await requestHandler<Response>(requestCtx, render, env, opts);
      if (handledResponse) {
        return handledResponse;
      }

      // qwik city did not have a route for this request
      // respond with qwik city's 404 handler
      const notFoundResponse = await notFoundHandler<Response>(requestCtx);
      return notFoundResponse;
    } catch (e: any) {
      return new Response(String(e || 'Error'), {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  }

  return onRequest;
}

/**
 * @alpha
 */
export interface QwikCityCloudflarePagesOptions extends QwikCityRequestOptions {}

/**
 * @alpha
 */
export interface EventPluginContext {
  request: Request;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Record<string, any>;
}
