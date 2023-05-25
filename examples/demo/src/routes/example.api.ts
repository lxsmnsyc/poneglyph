export default function example(): Response {
  return new Response('Hello World', {
    headers: {
      'Content-Type': 'text/plain',
    },
    status: 200,
  });
}
