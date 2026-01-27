import { getAllWeekReports, getWeekBySlug } from '../../lib/content';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import Link from 'next/link';

const mdxComponents = {
  a: ({ href = '', children, ...props }) => {
    // 站内链接：/xxx 这种，交给 Next Link（会自动加 basePath）
    if (href.startsWith('/')) {
      return (
        <Link href={href} className={props.className}>
          {children}
        </Link>
      );
    }

    // 站外链接：保持 <a>
    return (
      <a href={href} className={props.className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
};

export async function getStaticPaths() {
  const weeks = getAllWeekReports();
  const paths = weeks.map((week) => ({ params: { slug: week.slug } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { frontMatter, content } = getWeekBySlug(params.slug);
  const mdxSource = await serialize(content);
  return { props: { frontMatter, mdxSource } };
}

export default function WeekPage({ frontMatter, mdxSource }) {
  return (
    <div>
      <h1>{frontMatter.title}</h1>
      <MDXRemote {...mdxSource} components={mdxComponents} />

    </div>
  );
}