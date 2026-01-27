import { getAllTags, getItemsByTag } from '../../lib/content';
import Link from 'next/link';

export async function getStaticProps() {
  const tags = getAllTags();
  const counts = {};
  tags.forEach((tag) => {
    counts[tag] = getItemsByTag(tag).length;
  });
  return { props: { tags, counts } };
}

export default function TagsPage({ tags, counts }) {
  return (
    <div>
      <h1>标签</h1>
      <ul>
        {tags.map((tag) => (
          <li key={tag}>
            <Link href={`/tags/${encodeURIComponent(tag)}/`}>{tag}</Link>
            （{counts[tag]}）
          </li>
        ))}
      </ul>
    </div>
  );
}