import GameTopSections from "@/components/GameTopSections";
import PublicLayout from "@/components/PublicLayout";
import { getGamesWithTodayResults, getYearChartRows } from "@/lib/data";
import { getExtraGamesWithTodayResults } from "@/lib/extraGames";
import { formatTime } from "@/lib/utils";
import { siteUrl } from "@/lib/site";

export const revalidate = 30;

function ResultText({ value }) {
  const result = value || "-";
  const pending = String(result).toUpperCase() === "XX";
  return <span className={pending ? "result-pending" : undefined}>{result}</span>;
}

function gameKey(name = "") {
  const key = String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (["desawar", "disawer", "disawar"].includes(key)) return "desawer";
  if (key === "ghaziabad") return "gaziabad";
  return key;
}

function resultClass(value) {
  return String(value).toUpperCase() === "XX" ? "result-pending" : undefined;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slugYear = decodeURIComponent(resolvedParams.slugYear || "");
  const match = slugYear.match(/^(.+)-result-chart-(\d{4})$/);
  const slug = match?.[1] || "desawer";
  const year = match?.[2] || new Date().getFullYear();
  const gameName = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${gameName} Result Chart ${year} | Yearly Satta King Records`,
    description: `Complete ${gameName} Yearly Result Chart ${year}. View month-wise daily results for all 12 months. Old chart records, jodi history and full year data for ${gameName} Satta King.`,
    alternates: {
      canonical: `${siteUrl}/year-chart/${resolvedParams.slugYear}`
    },
    openGraph: {
      title: `${gameName} Result Chart ${year} | Yearly Satta King Records`,
      description: `${gameName} yearly result chart for ${year} with complete month-by-month daily records.`,
      url: `${siteUrl}/year-chart/${resolvedParams.slugYear}`,
      type: "website"
    }
  };
}

export default async function YearChartPage({ params }) {
  const resolvedParams = await params;
  const match = decodeURIComponent(resolvedParams.slugYear).match(/^(.+)-result-chart-(\d{4})$/);
  const slug = match?.[1] || "desawer";
  const year = Number(match?.[2] || new Date().getFullYear());
  const [{ rows, game }, games, extraGames] = await Promise.all([
    getYearChartRows(slug, year),
    getGamesWithTodayResults(),
    getExtraGamesWithTodayResults().catch(() => [])
  ]);
  const todayGame = [...games, ...extraGames].find((item) => gameKey(item.name) === gameKey(slug));
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  return (
    <PublicLayout>
      {todayGame ? (
        <section className="a7-feature-strip year-today-box">
          <p className="a7-feature-name">{todayGame.name} - Today Result</p>
          <p>{formatTime(todayGame.resultTime)}</p>
          <strong>
            <span className={resultClass(todayGame.first)}>{todayGame.first}</span>
            <span className="a7-arrow">➜</span>
            <span className={resultClass(todayGame.second)}>{todayGame.second}</span>
          </strong>
        </section>
      ) : null}
      <GameTopSections games={games} />
      <div className="max-w-lg mx-auto px-4 py-5 text-center flex flex-wrap justify-center gap-3 mt-5 -mb-5 lg:-mb-8">
        <h1 className="text-2xl md:text-1xl font-bold">Select Year</h1>
        <form action={`/year-chart/${slug}-result-chart-${year}`} className="flex gap-3" id="yearForm">
          <select name="year" className="year-chart-select border px-4 py-2 rounded-md text-sm" defaultValue={year} onChange={null}>
            {Array.from({ length: year - 2004 }, (_, i) => year - i).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </form>
      </div>
      <div className="fluid-panel my-8">
        <h2 className="chart-title font-bold text-lg md:text-2xl text-center py-3 uppercase">
          {slug.toUpperCase()} YEARLY CHART {year}
        </h2>
        <div className="overflow-x-auto mt-6">
          <table className="chart-table w-full border ">
            <thead >
              <tr className="chart-header-row text-sm md:text-base">
                <th className="chart-cell px-3 py-2 border">DATE</th>
                {months.map((month) => <th className="chart-cell px-3 py-2 border whitespace-nowrap" key={month}>{month}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="chart-row-alt text-center" key={row.Date}>
                  <td className="chart-cell px-3 py-2 border font-semibold text-sm md:text-base text-center">{row.Date}</td>
                  {months.map((month) => <td className="chart-cell px-3 py-2 border text-sm md:text-base" key={month}><ResultText value={row[month]} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
          {!game?._id && <p className="error-text text-center font-bold py-4">Game not found.</p>}
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `document.addEventListener('change',function(e){if(e.target.name==='year'){location.href='/year-chart/${slug}-result-chart-'+e.target.value;}})` }} />
    </PublicLayout>
  );
}
