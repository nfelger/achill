import {
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { isSessionValid } from "~/sessions";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Application Template" },
    { name: "description", content: "Hello DigitalService!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  if (!(await isSessionValid(request))) {
    return redirect("/login");
  }

  return redirect("/projects");
}
