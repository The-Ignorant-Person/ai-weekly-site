import { getAllWeekReports, getWeekBySlug, getAllItems } from '../lib/content';
import Link from 'next/link';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';

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
      <MDXRemote {...tldrMdx} components={mdxComponents} />
      <h2>本周卡片列表</h2>
      <div>
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
              {(item.tags || []).map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}/`}
                  className="tag-chip"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <h2>对我最关键的 3 个行动</h2>
      <MDXRemote {...actionsMdx} components={mdxComponents} />
    </div>
  );
}
