import { getAllWeekReports, getWeekBySlug } from '../../lib/content';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';

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
      <MDXRemote {...mdxSource} />
    </div>
  );
}