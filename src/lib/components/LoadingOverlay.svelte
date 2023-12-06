<script>
  export let message;
</script>

<div
  class="fixed bottom-0 left-0 right-0 top-0 z-10 flex flex-col items-center justify-center bg-slate-400 bg-opacity-50"
>
  <div
    class="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"
    data-testid="loadingOverlay"
  />
  <div class="mt-8">{message}</div>
</div>
