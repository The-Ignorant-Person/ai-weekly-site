import { getAllWeekReports } from '../../lib/content';

export async function getStaticProps() {
  const weeks = getAllWeekReports();
  return {
    props: { weeks },
  };
}

export default function WeekArchive({ weeks }) {
  return (
    <div>
      <h1>周报归档</h1>
      <ul>
        {weeks.map((week) => (
          <li key={week.slug}>
            <a href={`/weeks/${week.slug}`}>{week.title}</a> （{week.weekStart} – {week.weekEnd}）
          </li>
        ))}
      </ul>
    </div>
  );
}