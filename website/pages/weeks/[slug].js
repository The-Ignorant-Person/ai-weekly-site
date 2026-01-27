import { getAllWeekReports, getWeekBySlug } from '../../lib/content';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import Link from 'next/link';
const toSerializable = (obj) => JSON.parse(JSON.stringify(obj));


export async function getStaticPaths() {
  const weeks = getAllWeekReports();
  const paths = weeks.map((week) => ({ params: { slug: week.slug } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { frontMatter, content } = getWeekBySlug(params.slug);
  const mdxSource = await serialize(content);
  return { props: toSerializable({ frontMatter, mdxSource }) };

}

export default function WeekPage({ frontMatter, mdxSource }) {
  // Map MDX <a> tags to Next.js Link for internal routes and add trailing slash.
  const mdxComponents = {
    a: ({ href = '', children, ...props }) => {
      if (href.startsWith('/')) {
        const nextHref = href.endsWith('/') ? href : `${href}/`;
        return (
          <Link href={nextHref} {...props}>
            {children}
          </Link>
        );
      }
      return (
        <a href={href} {...props} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  };
  return (
    <div>
      <h1>{frontMatter.title}</h1>
      <MDXRemote {...mdxSource} components={mdxComponents} />
    </div>
  );
}