import '../styles/globals.css';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
<<<<<<< HEAD
=======
  // If the page component defines a custom title, pass it to Layout
>>>>>>> bb5b7e0216f1aff1178a412667cd43513fec2cda
  const title = pageProps?.frontMatter?.title || 'AI 周报站点';
  return (
    <Layout title={title}>
      <Component {...pageProps} />
    </Layout>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> bb5b7e0216f1aff1178a412667cd43513fec2cda
