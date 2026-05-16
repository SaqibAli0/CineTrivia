export async function GET() {
  return new Response('google-site-verification: google4aa23fb23409d366.html', {
    headers: { 'Content-Type': 'text/html' },
  });
}
