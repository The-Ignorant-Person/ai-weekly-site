import Head from 'next/head';
import Link from 'next/link';

export default function Layout({ children, title = 'AI 周报站点' }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
      </Head>
      <header className="header">
        <nav>
          <Link href="/">
            <strong>AI 周报站点</strong>
          </Link>
<<<<<<< HEAD
=======
          {/* Use trailing slashes for GitHub Pages static export */}
>>>>>>> bb5b7e0216f1aff1178a412667cd43513fec2cda
          <Link href="/weeks/">周报归档</Link>
          <Link href="/tags/">标签</Link>
          <Link href="/search/">搜索</Link>
        </nav>
      </header>
      <main className="container">{children}</main>
    </>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> bb5b7e0216f1aff1178a412667cd43513fec2cda
