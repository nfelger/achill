<script>
  import { authState, authStates, user, logout } from "../lib/auth.js";
  import Login from "../lib/Login.svelte";
  import Troi from "../lib/Troi.svelte";
</script>

<div
  class="container mx-auto mt-8 w-full max-w-screen-lg text-sm text-gray-800 "
>
  {#if $authState === authStates.LOGGED_OUT || $authState === authStates.LOGIN_FAILED}
    <Login />
  {:else}
    <div class="rounded-sm bg-white px-8 py-6 shadow-md">
      <nav
        class:invisible={$authState === authStates.LOGIN_PENDING}
        class="float-right"
      >
        <div class=" text-gray-600  text-sm">
          Logged in as {$user.name}.
          <a
            href="/"
            class="text-gray-800 underline"
            on:click|preventDefault={logout}>Log out</a
          >.
        </div>
      </nav>
      <Troi />
    </div>
  {/if}
</div>
