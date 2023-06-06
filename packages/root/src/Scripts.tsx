export default function Scripts(): JSX.Element {
  return (
    <>
      {import.meta.env.DEV && <script type="module" src="/@poneglyph" />}
    </>
  );
}
