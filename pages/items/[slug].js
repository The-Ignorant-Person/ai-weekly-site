import { getAllItems, getItemBySlug } from '../../lib/content';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
const toSerializable = (obj) => JSON.parse(JSON.stringify(obj));

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
    // ...
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
          <a key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="tag-chip">
            {tag}
          </a>
        ))}
        {frontMatter.evidence && (
          <span className={`badge ${frontMatter.evidence}`}>{frontMatter.evidence}</span>
        )}
      </div>
      <MDXRemote {...mdxSource} />
    </article>
  );
}