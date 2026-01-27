import { getAllTags, getItemsByTag } from '../../lib/content';

export async function getStaticPaths() {
  const tags = getAllTags();
  const paths = tags.map((tag) => ({ params: { tag } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const tag = params.tag;
  const items = getItemsByTag(tag);
  return { props: { tag, items } };
}

export default function TagPage({ tag, items }) {
  return (
    <div>
      <h1>标签：{tag}</h1>
      {items.map((item) => (
        <div key={item.slug} className="card">
          <h3>
            <a href={`/items/${item.slug}`}>{item.title}</a>
            {item.evidence && <span className={`badge ${item.evidence}`}>{item.evidence}</span>}
          </h3>
          <p>得分：{item.score}</p>
          <div>
            {(item.tags || []).map((t) => (
              <a key={t} href={`/tags/${encodeURIComponent(t)}`} className="tag-chip">
                {t}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}