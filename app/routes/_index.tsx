import {
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { getSessionAndThrowIfInvalid } from "~/sessions.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Track your time" },
    { name: "description", content: "Hello DigitalService!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await getSessionAndThrowIfInvalid(request);
  return redirect("/projects");
}
