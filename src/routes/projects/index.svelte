<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  import { user, logout, loggedIn } from "../../lib/auth.js";
  import Troi from "../../lib/Troi.svelte";

  onMount(() => {
    if (!$loggedIn) {
      goto("/");
    }
  });

  function handleLogout() {
    logout();
    goto("/");
  }
</script>

<div class="rounded-sm bg-white px-8 py-6 shadow-md">
  <nav class="float-right">
    <div class=" text-sm  text-gray-600">
      Logged in as {$user.name}.
      <a
        href="/"
        class="text-gray-800 underline"
        on:click|preventDefault={handleLogout}>Log out</a
      >.
    </div>
  </nav>
  <Troi />
</div>
