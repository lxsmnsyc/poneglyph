import type { LayoutProps } from 'poneglyph/router';
import { Link } from 'poneglyph/router';

export function Layout({ children }: LayoutProps<undefined>): JSX.Element {
  return (
    <div className="p-4 rounded-lg bg-indigo-900 bg-opacity-25 flex flex-col space-y-4">
      <span className="text-2xl text-white font-sans">
        {'Welcome to '}
        <span className="bg-white bg-opacity-25 font-mono p-2 rounded m-1">Page A</span>
        !
      </span>
      <div className="flex flex-col space-y-1">
        {children}
      </div>
    </div>
  );
}

export default function A(): JSX.Element {
  return (
    <>
      <Link href="/" className="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to home</Link>
      <Link href="/b" className="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to page B</Link>
    </>
  );
}
