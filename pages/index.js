import { getAllWeekReports, getWeekBySlug, getAllItems } from '../lib/content';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';

const toSerializable = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Extract specific sections from a weekly report content.
 * @param {string} content MDX content
 */
function extractSections(content) {
  const lines = content.split(/\r?\n/);
  const sections = { tldr: [], list: [], actions: [] };
  let current = null;
  for (const line of lines) {
    if (line.trim().toLowerCase().startsWith('## tl;dr')) {
      current = 'tldr';
      continue;
    }
    if (line.trim().startsWith('## 本周入选条目')) {
      current = 'list';
      continue;
    }
    if (line.trim().startsWith('## 对我最关键的')) {
      current = 'actions';
      continue;
    }
    if (line.trim().startsWith('## ') && current) {
      current = null;
    }
    if (current) {
      sections[current].push(line);
    }
  }
  return {
    tldr: sections.tldr.join('\n'),
    list: sections.list.join('\n'),
    actions: sections.actions.join('\n'),
  };
}

export async function getStaticProps() {
  const weeks = getAllWeekReports();
  const latestWeek = weeks[0];
  const { content } = getWeekBySlug(latestWeek.slug);

  const { tldr, list, actions } = extractSections(content);
  const tldrMdx = await serialize(tldr);
  const listMdx = await serialize(list);
  const actionsMdx = await serialize(actions);

  const items = getAllItems();

  return {
    props: toSerializable({
      week: latestWeek,
      tldrMdx,
      listMdx,
      actionsMdx,
      items,
    }),
  };
}

export default function Home({ week, tldrMdx, listMdx, actionsMdx, items }) {
  return (
    <div>
      <h1>{week.title}</h1>

      <h2>本周 TL;DR</h2>
      <MDXRemote {...tldrMdx} />

      <h2>本周卡片列表</h2>
      <div>
        {items.map((item) => (
          <div key={item.slug} className="card">
            <h3>
              <a href={`/items/${item.slug}`}>{item.title}</a>
              {item.evidence && (
                <span className={`badge ${item.evidence}`}>{item.evidence}</span>
              )}
            </h3>
            <p>得分：{item.score}</p>
            <div>
              {(item.tags || []).map((tag) => (
                <a key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="tag-chip">
                  {tag}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2>对我最关键的 3 个行动</h2>
      <MDXRemote {...actionsMdx} />
    </div>
  );
}
