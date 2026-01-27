import '../styles/globals.css';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  // If the page component defines a custom title, pass it to Layout
  const title = pageProps?.frontMatter?.title || 'AI 周报站点';
  return (
    <Layout title={title}>
      <Component {...pageProps} />
    </Layout>
  );
}