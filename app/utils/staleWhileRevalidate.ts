import { Session } from "@remix-run/node";
import { AuthenticationFailed } from "troi-library";
import type { SessionData } from "~/sessions.server";
import { destroySession } from "~/sessions.server";

/**
 * Return data from the session cache and revalidate cached data in the background.
 *
 * see also:  https://web.dev/articles/stale-while-revalidate
 *
 * @param session
 * @param fetcher - Fetch the data
 * @param sessionKey
 * @returns
 */
export async function staleWhileRevalidate<Key extends keyof SessionData>(
  session: Session,
  fetcher: (session: Session) => Promise<SessionData[Key]>,
  sessionKey: Key,
  shouldRevalidate = true,
): Promise<SessionData[Key]> {
  const fetchAndUpdateCache = async () => {
    const session = await getSession(cookieHeader);
    session.set(sessionKey, response);
    await commitSession(session);
    console.debug(`Key:`, sessionKey);
    // console.log(Object.keys(session.data));
    // await commitSession(session);
    return response;
  };

  // disable cache as it potentilly leads to corrupted sessions
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
