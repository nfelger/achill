<script context="module">
  export const states = {
    LOGGED_OUT: "logged out",
    LOGIN_PENDING: "pending",
    LOGGED_IN: "logged in",
    LOGIN_FAILED: "failed",
  }
</script>

<script>
  import { createEventDispatcher } from "svelte";

  export let state;
  let userName;
  let password;

  const dispatch = createEventDispatcher();

  const handleSubmit = () => {
    state = states.LOGIN_PENDING;
    dispatch('loginSubmitted', {
      userName: userName,
      password: password,
    });
  };

  const handleLogout = () => {
    state = states.LOGGED_OUT;
    dispatch("logout");
  }

</script>

{#if state === states.LOGGED_OUT || state === states.LOGIN_FAILED}
  <div class="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
    <div class="px-6 py-4">
      <h2 class="text-3xl font-bold text-center text-indigo-600 dark:text-white">Enter. Time.</h2>

      {#if state === states.LOGIN_FAILED}
        <div class="w-full mt-4 text-white bg-red-500 rounded-lg">
          <div class="container flex items-center justify-between px-6 py-4 mx-auto">
            <div class="flex">
                <svg viewBox="0 0 40 40" class="w-6 h-6 fill-current">
                    <path d="M20 3.36667C10.8167 3.36667 3.3667 10.8167 3.3667 20C3.3667 29.1833 10.8167 36.6333 20 36.6333C29.1834 36.6333 36.6334 29.1833 36.6334 20C36.6334 10.8167 29.1834 3.36667 20 3.36667ZM19.1334 33.3333V22.9H13.3334L21.6667 6.66667V17.1H27.25L19.1334 33.3333Z"></path>
                </svg>

                <p class="mx-3">Login failed! Please check your username & password.</p>
            </div>
          </div>
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit}>
        <div class="w-full mt-4">
          <label for="username" class="block mb-2 text-sm text-gray-600 dark:text-gray-200">Troi username</label>
          <input
            bind:value={userName}
            type="username"
            name="username"
            id="username"
            placeholder="firstName.lastName"
            class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
          />
        </div>

        <div class="w-full mt-4">
          <label for="password" class="block mb-2 text-sm text-gray-600 dark:text-gray-200">Troi password</label>
          <input
            bind:value={password}
            type="password"
            name="password"
            id="password"
            placeholder="hunter2"
            class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
          />
        </div>

        <div class="mt-6 mb-4">
          <button
              class="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-400 focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50">
              Sign in
          </button>
      </div>
      </form>
    </div>
  </div>
{:else if state === states.LOGGED_IN}
  <nav class="bg-white">
    <div class="container py-2 mx-auto text-gray-600">
      Logged in as {userName}.
      <a
        href="/"
        class="text-gray-800 underline"
        on:click|preventDefault={handleLogout}
      >
        Log out{""
      }</a>.
    </div>
  </nav>
{/if}

