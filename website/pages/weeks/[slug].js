import { getAllWeekReports, getWeekBySlug } from '../../lib/content';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import Link from 'next/link';

const toSerializable = (obj) => JSON.parse(JSON.stringify(obj));

const normalizeInternalHref = (href) => {
  if (!href.startsWith('/')) return href;
  let nextHref = href;
  if (nextHref.endsWith('.html')) {
    nextHref = nextHref.slice(0, -5);
  }
  if (!nextHref.endsWith('/')) {
    nextHref += '/';
  }
  return nextHref;
};

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
  const mdxComponents = {
    a: ({ href = '', children, ...props }) => {
      if (href.startsWith('/')) {
        const nextHref = normalizeInternalHref(href);
        return (
          <Link href={nextHref} className={props.className}>
            {children}
          </Link>
        );
      }
      return (
        <a href={href} className={props.className} target="_blank" rel="noopener noreferrer">
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
