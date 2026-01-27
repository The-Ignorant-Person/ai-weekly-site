import { getAllTags, getItemsByTag } from '../../lib/content';
import Link from 'next/link';
const toSerializable = (obj) => JSON.parse(JSON.stringify(obj));

export async function getStaticPaths() {
  const tags = getAllTags();
  const paths = tags.map((tag) => ({ params: { tag } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const tag = params.tag;
  const items = getItemsByTag(tag);
  return { props: toSerializable({ tag, items }) };

}

export default function TagPage({ tag, items }) {
  return (
    <div>
      <h1>标签：{tag}</h1>
      {items.map((item) => (
        <div key={item.slug} className="card">
          <h3>
            <Link href={`/items/${item.slug}/`}>{item.title}</Link>
            {item.evidence && (
              <span className={`badge ${item.evidence}`}>{item.evidence}</span>
            )}
          </h3>
          <p>得分：{item.score}</p>
          <div>
            {(item.tags || []).map((t) => (
              <Link
                key={t}
                href={`/tags/${encodeURIComponent(t)}/`}
                className="tag-chip"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}