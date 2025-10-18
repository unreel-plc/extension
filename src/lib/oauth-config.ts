export const getOauthUrl = () => {
  const manifest = chrome.runtime.getManifest();
  const clientId = encodeURIComponent(manifest?.oauth2?.client_id ?? "");
  const scopes = encodeURIComponent(manifest?.oauth2?.scopes?.join(" ") ?? "");
  const redirectUri = chrome.identity.getRedirectURL("google");

  // Generate a cryptographically secure nonce for OpenID Connect
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const url =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    "?client_id=" +
    clientId +
    "&response_type=id_token" +
    "&redirect_uri=" +
    redirectUri +
    "&scope=" +
    scopes +
    "&nonce=" +
    nonce;

  return url;
};

export const extractIdToken = (url: string) => {
  const urlObj = new URL(url);
  const hash = urlObj.hash.substring(1); // Remove the leading #
  const params = new URLSearchParams(hash);
  const idToken = params.get("id_token");
  return idToken;
};
