import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Content files are stored in the parent "content" directory at the project root.
const contentRoot = path.join(process.cwd(), '..', 'content');
const itemsDirectory = path.join(contentRoot, 'items');
const weeksDirectory = path.join(contentRoot, 'weeks');

/**
 * gray-matter uses js-yaml under the hood, which may auto-convert YAML timestamps
 * (e.g. 2026-01-26) into Date objects.
 *
 * Next.js (pages router) requires data returned from getStaticProps/getServerSideProps
 * to be JSON-serializable, so we normalize Date values to `YYYY-MM-DD` strings.
 */
function toSerializable(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (Array.isArray(value)) {
    return value.map(toSerializable);
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = toSerializable(v);
    }
    return out;
  }
  return value;
}

/**
 * Read all item files and return their front matter and slug.
 */
export function getAllItems() {
  const filenames = fs.readdirSync(itemsDirectory).filter((f) => f.endsWith('.mdx'));
  const items = filenames.map((filename) => {
    const filePath = path.join(itemsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data: rawData } = matter(fileContents);
    const data = toSerializable(rawData);
    const slug = data.slug || filename.replace(/\.mdx$/, '');
    return { ...data, slug };
  });
  // Sort by score descending
  return items.sort((a, b) => (b.score || 0) - (a.score || 0));
}

export function getItemBySlug(slug) {
  const realSlug = slug.replace(/\.mdx$/, '');
  const filePath = path.join(itemsDirectory, `${realSlug}.mdx`);
  const source = fs.readFileSync(filePath, 'utf8');
  const { data: rawData, content } = matter(source);
  const data = toSerializable(rawData);
  return { frontMatter: { ...data, slug: realSlug }, content };
}

export function getAllWeekReports() {
  const filenames = fs.readdirSync(weeksDirectory).filter((f) => f.endsWith('.mdx'));
  const weeks = filenames.map((filename) => {
    const filePath = path.join(weeksDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data: rawData } = matter(fileContents);
    const data = toSerializable(rawData);
    const slug = data.slug || filename.replace(/\.mdx$/, '');
    return { ...data, slug };
  });
  // Sort by weekEnd descending
  return weeks.sort((a, b) => new Date(b.weekEnd) - new Date(a.weekEnd));
}

export function getWeekBySlug(slug) {
  const realSlug = slug.replace(/\.mdx$/, '');
  const filePath = path.join(weeksDirectory, `${realSlug}.mdx`);
  const source = fs.readFileSync(filePath, 'utf8');
  const { data: rawData, content } = matter(source);
  const data = toSerializable(rawData);
  return { frontMatter: { ...data, slug: realSlug }, content };
}

export function getAllTags() {
  const items = getAllItems();
  const tagSet = new Set();
  items.forEach((item) => {
    if (Array.isArray(item.tags)) {
      item.tags.forEach((tag) => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort();
}

export function getItemsByTag(tag) {
  return getAllItems().filter((item) => (item.tags || []).includes(tag));
}
