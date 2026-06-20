export default function AuthTestPage() {
  return (
    <main>
      <h1>OAuth success! Tokens saved to /tmp/gbp-tokens.json</h1>
      <a href="/api/test-reviews">Go to /api/test-reviews to fetch your reviews</a>
    </main>
  );
}
