import { AuthenticationFailed } from "troi-library";
import type { SessionData } from "~/sessions.server";
import { commitSession, destroySession, getSession } from "~/sessions.server";

/**
 * Return data from the session cache and revalidate cached data in the background.
 *
 * see also:  https://web.dev/articles/stale-while-revalidate
 *
 * @param request
 * @param fetcher - Fetch the data
 * @param sessionKey
 * @returns
 */
export async function staleWhileRevalidate<Key extends keyof SessionData>(
  request: Request,
  fetcher: (request: Request) => Promise<SessionData[Key]>,
  sessionKey: Key,
  shouldRevalidate = true,
): Promise<SessionData[Key]> {
  const cookieHeader = request.headers.get("Cookie");

  const fetchAndUpdateCache = async () => {
    const response = await fetcher(request);
    // get session again to prevent race conditions
    const session = await getSession(cookieHeader);
    session.set(sessionKey, response);
    await commitSession(session);
    return response;
  };

  const session = await getSession(cookieHeader);
  const cacheData: SessionData[Key] | undefined = session.get(sessionKey);
  if (cacheData !== undefined) {
    console.debug(`Cache hit:`, sessionKey);
    if (shouldRevalidate) {
      // fetch in background
      void fetchAndUpdateCache().catch((e) => {
        if (e instanceof AuthenticationFailed) {
          destroySession(session);
        } else {
          throw e;
        }
      });
    }
    return cacheData;
  }
  console.debug(`Cache miss:`, sessionKey);

  return await fetchAndUpdateCache();
}
