<script>
  import { Button } from "@rokkit/ui";

  /**
   * @typedef {Object} Props
   * @property {string} provider
   * @property {string} label
   * @property {Array<string>} scopes
   * @property {Function} onclick
   */
  /** @type {Props} */
  let { provider, label, scopes = [], onclick } = $props();

  function handle() {
    onclick?.({ provider, scopes });
  }
</script>

<Button onclick={handle} {label} leftIcon="logo-{provider}" />
