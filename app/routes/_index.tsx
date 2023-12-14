import {
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { login } from "~/cookies.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Application Template" },
    { name: "description", content: "Hello DigitalService!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await login.parse(cookieHeader)) || {};

  if (cookie.username == undefined && cookie.password == undefined) {
    return redirect("/login");
  }

  return redirect("/projects");
}
