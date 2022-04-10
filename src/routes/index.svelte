<script>
  import { authState, authStates, user, logout } from "../lib/auth.js";
  import Login from "../lib/Login.svelte";
  import Troi from "../lib/Troi.svelte";
</script>

<nav class:invisible={$authState !== authStates.LOGGED_IN}>
  <div class="container mx-auto py-2 text-gray-600">
    Logged in as {$user.name}.
    <a href="/" class="text-gray-800 underline" on:click|preventDefault={logout}
      >Log out</a
    >.
  </div>
</nav>
<div class="container mx-auto mt-8">
  {#if $authState === authStates.LOGGED_OUT || $authState === authStates.LOGIN_FAILED}
    <Login />
  {:else}
    <Troi />
  {/if}
</div>
