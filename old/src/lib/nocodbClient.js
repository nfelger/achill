import { Api } from "nocodb-sdk";

const api = new Api({
  baseURL: "https://metrics.ds4g.dev:38081",
  headers: {
    "xc-auth":
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZpY3Rvci5kZWxjYW1wb0BkaWdpdGFsc2VydmljZS5idW5kLmRlIiwiaWQiOiJ1c19kMTVwNGVrZzJucm9rdyIsInJvbGVzIjp7Im9yZy1sZXZlbC1jcmVhdG9yIjp0cnVlfSwidG9rZW5fdmVyc2lvbiI6ImNmNDE2ZTNjZjEwNWZmZWNjNWU3OWI2NjlkNjc0YzIxY2NiNjBjMjQ2NWQzMDljYTMyYmRlMzZjNzhjN2FiMGI2ZTJhMjc1MmNlYjU1MDQyIiwiaWF0IjoxNzAyNDUzNTM2LCJleHAiOjE3MzQwMTExMzZ9.V2srnNdZHj_m0tZyTZCQXT_o23SviCIuTBPmzQDslVI",
  },
});

export default api;
