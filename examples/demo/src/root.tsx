import type { ReactNode } from 'react';

export default function Root({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="flex items-center justify-center bg-gradient-to-l from-sky-400 to-indigo-600 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
