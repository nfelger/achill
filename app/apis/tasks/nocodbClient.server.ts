import { Api } from "nocodb-sdk";

const api = new Api({
  baseURL: process.env.NOCODB_BASE_URL,
  headers: {
    "xc-auth": process.env.NOCODB_AUTH_TOKEN,
  },
});

export default api;
