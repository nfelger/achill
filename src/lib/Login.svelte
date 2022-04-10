<script>
  import { authState, authStates, login_initiate } from "../lib/auth.js";

  import Input from "./Input.svelte";

  let userName;
  let password;
</script>

<div
  class="mx-auto w-full max-w-sm overflow-hidden rounded-sm bg-white shadow-md "
>
  <div class="px-8 py-6">
    <h2 class="mt-4 mb-8 text-center text-3xl font-bold text-fuchsia-600">
      Enter. Time.
    </h2>

    {#if $authState === authStates.LOGIN_FAILED}
      <div class="mt-4 w-full rounded-sm bg-red-500 text-white">
        <div
          class="container mx-auto flex items-center justify-between px-6 py-4"
        >
          <div class="flex">
            <svg viewBox="0 0 40 40" class="h-6 w-6 fill-current">
              <path
                d="M20 3.36667C10.8167 3.36667 3.3667 10.8167 3.3667 20C3.3667 29.1833 10.8167 36.6333 20 36.6333C29.1834 36.6333 36.6334 29.1833 36.6334 20C36.6334 10.8167 29.1834 3.36667 20 3.36667ZM19.1334 33.3333V22.9H13.3334L21.6667 6.66667V17.1H27.25L19.1334 33.3333Z"
              />
            </svg>

            <p class="mx-3">
              Login failed! Please check your username & password.
            </p>
          </div>
        </div>
      </div>
    {/if}

    <form on:submit|preventDefault={() => login_initiate(userName, password)}>
      <div class="mt-4 w-full">
        <label for="username" class="mb-2 block text-sm text-gray-600"
          >Troi username</label
        >
        <Input
          bind:value={userName}
          name="username"
          placeholder="firstName.lastName"
          extraClasses="mt-2 block w-full px-4 py-2"
        />
      </div>

      <div class="mt-4 w-full">
        <label for="password" class="mb-2 block text-sm text-gray-600"
          >Troi password</label
        >
        <Input
          bind:value={password}
          type="password"
          name="password"
          placeholder="hunter2"
          extraClasses="mt-2 block w-full px-4 py-2"
        />
      </div>

      <div class="mt-8 mb-4">
        <button
          class="w-full transform rounded-sm bg-fuchsia-600 px-4 py-2 tracking-wide text-white transition-colors duration-200 hover:bg-fuchsia-400 focus:bg-fuchsia-400 focus:outline-none focus:ring focus:ring-fuchsia-300 focus:ring-opacity-50"
        >
          Sign in
        </button>
      </div>
    </form>
  </div>
</div>
