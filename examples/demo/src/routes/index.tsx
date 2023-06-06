import type { LayoutProps } from 'poneglyph/router';
import { Link } from 'poneglyph/router';

export function Layout({ children }: LayoutProps<undefined>): JSX.Element {
  return (
    <div className="p-4 rounded-lg bg-indigo-900 bg-opacity-25 flex flex-col space-y-4">
      <span className="text-2xl text-white font-sans">
        {'Welcome to '}
        <span className="bg-white bg-opacity-25 font-mono p-2 rounded m-1">Vite SSR + Solid SPA</span>
        !
      </span>
      <div className="flex flex-col space-y-1">
        {children}
      </div>
    </div>
  );
}

export default function Index(): JSX.Element {
  return (
    <>
      <Link href="/a" className="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to page A</Link>
      <Link href="/b" className="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to page B</Link>
      <Link href="/parameter/c" className="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to page C</Link>
      <Link href="/parameter/d" className="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to page D</Link>
      <Link href="/wildcard/e/f/g/h" className="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to page E, F, G, H</Link>
    </>
  );
}
