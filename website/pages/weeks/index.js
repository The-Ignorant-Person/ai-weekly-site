import { getAllWeekReports } from '../../lib/content';
import Link from 'next/link';
const toSerializable = (obj) => JSON.parse(JSON.stringify(obj));


export async function getStaticProps() {
  const weeks = getAllWeekReports();
  return { props: toSerializable({ weeks }) };

}

export default function WeekArchive({ weeks }) {
  return (
    <div>
      <h1>周报归档</h1>
      <ul>
        {weeks.map((week) => (
          <li key={week.slug}>
            {/* Use Next.js Link to ensure basePath is respected and trailing slash added */}
            <Link href={`/weeks/${week.slug}/`}>{week.title}</Link>{' '}
            （{week.weekStart} – {week.weekEnd}）
          </li>
        ))}
      </ul>
    </div>
  );
}