import {
  ActionFunctionArgs,
  json,
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import TroiApiService, { AuthenticationFailed } from "troi-library";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { login } from "~/cookies.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Application Template" },
    { name: "description", content: "Hello DigitalService!" },
  ];
};

const troiBaseUrl = "https://digitalservice.troi.software/api/v2/rest";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await login.parse(cookieHeader)) || {};
  return json({ username: cookie.username });
}

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await login.parse(cookieHeader)) || {};
  const bodyParams = await request.formData();

  cookie.username = bodyParams.get("username");
  cookie.password = bodyParams.get("password");

  try {
    const troiApi = new TroiApiService({
      baseUrl: troiBaseUrl,
      clientName: "DigitalService GmbH des Bundes",
      username: cookie.username,
      password: cookie.password,
    });
    await troiApi.initialize();
  } catch (error) {
    if (error instanceof AuthenticationFailed) {
      return json({
        message: "Login failed! Please check your username & password.",
      });
    } else {
      throw error;
    }
  }

  return redirect("/projects", {
    headers: {
      "Set-Cookie": await login.serialize(cookie),
    },
  });
}

export default function Index() {
  const { username } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  return (
    <main>
      <div className="mx-auto mt-8 w-full max-w-sm overflow-hidden rounded-sm bg-white px-8 py-6 shadow-md">
        {isSubmitting && (
          <LoadingOverlay message="Please wait..."></LoadingOverlay>
        )}

        <h2 className="mb-8 mt-4 text-center text-3xl font-bold text-blue-600">
          Enter. Time.
        </h2>

        {actionData?.message && (
          <div className="mt-4 w-full rounded-sm bg-red-500 text-white">
            <div className="container mx-auto flex items-center justify-between px-6 py-4">
              <div className="flex">
                <svg viewBox="0 0 40 40" className="h-6 w-6 fill-current">
                  <path d="M20 3.36667C10.8167 3.36667 3.3667 10.8167 3.3667 20C3.3667 29.1833 10.8167 36.6333 20 36.6333C29.1834 36.6333 36.6334 29.1833 36.6334 20C36.6334 10.8167 29.1834 3.36667 20 3.36667ZM19.1334 33.3333V22.9H13.3334L21.6667 6.66667V17.1H27.25L19.1334 33.3333Z" />
                </svg>

                <p className="mx-3">{actionData.message}</p>
              </div>
            </div>
          </div>
        )}

        <Form method="post">
          <div className="mt-4 w-full">
            <label
              htmlFor="username"
              className="mb-2 block text-sm text-gray-600"
            >
              Troi username
            </label>
            <input
              type="text"
              defaultValue={username}
              name="username"
              placeholder="firstName.lastName"
              className="mt-2 block w-full px-4 py-2"
            />
          </div>

          <div className="mt-4 w-full">
            <label
              title="Troi → security center → API v2 / Troi App → Token"
              htmlFor="password"
              className="mb-2 block text-sm text-gray-600"
            >
              Troi password or Troi v2 token ⓘ
            </label>
            <input
              type="password"
              name="password"
              placeholder="hunter2"
              className="mt-2 block w-full px-4 py-2"
            />
          </div>

          <div className="mb-4 mt-8">
            <button
              type="submit"
              className="w-full transform rounded-sm bg-blue-600 px-4 py-2 tracking-wide text-white transition-colors duration-200 hover:bg-blue-400 focus:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
            >
              Sign in
            </button>
            <p className="mt-2 px-2 text-xs text-gray-600">
              <s>
                Your password isn't stored anywhere and is deleted when you
                close this tab.
              </s>
            </p>
          </div>
        </Form>
      </div>
    </main>
  );
}
