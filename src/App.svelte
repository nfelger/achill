<script>
  import './lib/Tailwind.css';
  import Auth, { states } from './lib/Auth.svelte';
  import Troi from './lib/Troi.svelte';

  let userName;
  let password;
  let loginState = states.LOGGED_OUT;

  const loginSubmittedHandler = (event) => {
    userName = event.detail.userName;
    password = event.detail.password;
    loginState = states.LOGIN_PENDING;
  };

  const logoutHandler = () => {
    userName = undefined;
    password = undefined;
    loginState = states.LOGGED_OUT;
  }
</script>

<div class="container mx-auto mt-8">
  <Auth
    state={loginState}
    on:loginSubmitted={loginSubmittedHandler}
    on:logout={logoutHandler}
  />

  {#if loginState === states.LOGGED_IN || loginState === states.LOGIN_PENDING}
    <Troi
      userName={userName}
      password={password}
      on:finishedLoading={() => { loginState = states.LOGGED_IN }}
      on:authenticationFailed={() => { loginState = states.LOGIN_FAILED }}
    />
  {/if}
</div>
