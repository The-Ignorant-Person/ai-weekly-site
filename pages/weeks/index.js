import { getAllWeekReports } from '../../lib/content';
import Link from 'next/link';
<<<<<<< HEAD

const toSerializable = (obj) => JSON.parse(JSON.stringify(obj));

export async function getStaticProps() {
  const weeks = getAllWeekReports();
  return { props: toSerializable({ weeks }) };
=======
const toSerializable = (obj) => JSON.parse(JSON.stringify(obj));


export async function getStaticProps() {
  const weeks = getAllWeekReports();
  return { props: toSerializable({ weeks }) };

>>>>>>> bb5b7e0216f1aff1178a412667cd43513fec2cda
}

export default function WeekArchive({ weeks }) {
  return (
    <div>
      <h1>周报归档</h1>
      <ul>
        {weeks.map((week) => (
          <li key={week.slug}>
<<<<<<< HEAD
            <Link href={`/weeks/${week.slug}/`}>{week.title}</Link>
            （{week.weekStart} — {week.weekEnd}）
=======
            {/* Use Next.js Link to ensure basePath is respected and trailing slash added */}
            <Link href={`/weeks/${week.slug}/`}>{week.title}</Link>{' '}
            （{week.weekStart} – {week.weekEnd}）
>>>>>>> bb5b7e0216f1aff1178a412667cd43513fec2cda
          </li>
        ))}
      </ul>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> bb5b7e0216f1aff1178a412667cd43513fec2cda
