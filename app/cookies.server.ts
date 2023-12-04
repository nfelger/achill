import { createCookie } from "@remix-run/node";

export const login = createCookie("login", {
  maxAge: 604_800, // one week
  sameSite: "strict",
  httpOnly: true,
  secure: true,
});
