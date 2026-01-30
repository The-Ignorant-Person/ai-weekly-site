import { getAllItems, getItemBySlug } from '../../lib/content';
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

const mdxComponents = {
  a: ({ href = '', children, ...props }) => {
    // 站内链接交给 Next Link，自动包含 basePath 并补齐尾斜杠
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

export async function getStaticPaths() {
  const items = getAllItems();
  const paths = items.map((item) => ({ params: { slug: item.slug } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { frontMatter, content } = getItemBySlug(params.slug);
  const mdxSource = await serialize(content);

  return {
    props: toSerializable({
      frontMatter,
      mdxSource,
    }),
  };
}

export default function ItemPage({ frontMatter, mdxSource }) {
  return (
    <article>
      <h1>{frontMatter.title}</h1>

      <p>
        创建时间：{frontMatter.createdAt}；更新时间：{frontMatter.updatedAt}
      </p>

      <div>
        {(frontMatter.tags || []).map((tag) => (
          <Link key={tag} href={`/tags/${encodeURIComponent(tag)}/`} className="tag-chip">
            {tag}
          </Link>
        ))}

        {frontMatter.evidence && (
          <span className={`badge ${frontMatter.evidence}`}>{frontMatter.evidence}</span>
        )}
      </div>

      <MDXRemote {...mdxSource} components={mdxComponents} />
    </article>
  );
}
