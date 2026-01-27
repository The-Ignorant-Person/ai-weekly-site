import { getAllItems } from '../lib/content';
import { useState } from 'react';

export async function getStaticProps() {
  const items = getAllItems();
  return { props: { items } };
}

export default function SearchPage({ items }) {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (!normalized) return false;
    const title = item.title.toLowerCase();
    const tags = (item.tags || []).join(' ').toLowerCase();
    return title.includes(normalized) || tags.includes(normalized);
  });
  return (
    <div>
      <h1>搜索</h1>
      <input
        type="text"
        placeholder="搜索标题或标签..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: '0.5rem', width: '100%', borderRadius: '0.25rem', border: '1px solid var(--border)', marginBottom: '1rem' }}
      />
      {normalized && (
        <p>共找到 {filtered.length} 条结果</p>
      )}
      {filtered.map((item) => (
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