import Link from "next/link";
import AdBlock from "@/components/AdBlock";
import Clock from "@/components/Clock";
import GameCards from "@/components/GameCards";
import MonthlyChartTable from "@/components/MonthlyChartTable";
import PublicLayout from "@/components/PublicLayout";
import { WebsiteJsonLd } from "@/components/JsonLd";
import { getGamesWithTodayResults, getMonthlyRows, getTopGames } from "@/lib/data";
import { formatTime, istDate, monthName, slugify } from "@/lib/utils";
import SeoContent from "@/components/SeoContent";
import { homeDescription, homeTitle, siteUrl } from "@/lib/site";

export const revalidate = 30;

export const metadata = {
  title: homeTitle,
  description: homeDescription,
  alternates: {
    canonical: `${siteUrl}/`
  }
};

function resultClass(value) {
  return String(value).toUpperCase() === "XX" ? " result-pending" : "";
}

const featuredGameList = [
  { key: "desawer", name: "DESAWER" },
  { key: "desawar", name: "DESAWER" },
  { key: "sadar bazar", name: "Sadar bazar", resultTime: "13:40:00" },
  { key: "gwalior", name: "Gwalior", resultTime: "14:40:00" },
  { key: "delhi bazar", name: "Delhi Bazar", resultTime: "15:15:00" },
  { key: "delhi matka", name: "Delhi Matka", resultTime: "15:40:00" },
  { key: "shri ganesh", name: "Shri Ganesh", resultTime: "16:40:00" },
  { key: "agra", name: "Agra", resultTime: "17:30:00" },
  { key: "faridabad", name: "Faridabad", resultTime: "18:10:00" },
  { key: "alwar", name: "Alwar", resultTime: "19:35:00" },
  { key: "ghaziabad", name: "Gaziabad", resultTime: "21:50:00" },
  { key: "dwarka", name: "Dwarka", resultTime: "22:35:00" },
  { key: "gali", name: "Gali", resultTime: "23:50:00" }
];

const featuredGameKeys = new Set(featuredGameList.map((game) => game.key));

const lowerGameList = [
  { keys: ["shiv dham"], name: "Shiv Dham" },
  { keys: ["pushkar bazar"], name: "Pushkar Bazar" },
  { keys: ["delhi metro"], name: "Delhi Metro" },
  { keys: ["shri shyam", "shri sayam"], name: "Shri Shyam" },
  { keys: ["kolambia", "kolmbia"], name: "Kolambia" },
  { keys: ["makka-madina"], name: "Makka-Madina" },
  { keys: ["kalka night"], name: "Kalka Night" }
];

function lowerGameDetails(name = "") {
  const normalized = normalizeGameName(name);
  return lowerGameList.find((item) => item.keys.includes(normalized));
}

function normalizeGameName(name = "") {
  return String(name).toLowerCase().trim();
}

function featuredGameOrder(name = "") {
  return featuredGameList.findIndex((game) => game.key === normalizeGameName(name));
}

function isPending(value) {
  return String(value).toUpperCase() === "XX";
}

function timeToMinutes(time = "") {
  const [hours, minutes] = String(time).split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
}

function currentIstMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Number(map.hour) * 60 + Number(map.minute);
}

function resultScore(game) {
  return (isPending(game.first) ? 0 : 2) + (isPending(game.second) ? 0 : 1);
}

function pickBestGame(candidates, displayName) {
  return [...candidates].sort((a, b) => {
    const score = resultScore(b) - resultScore(a);
    if (score) return score;
    return Number(normalizeGameName(b.name) === normalizeGameName(displayName)) - Number(normalizeGameName(a.name) === normalizeGameName(displayName));
  })[0];
}

function resultUpdatedTime(game) {
  const date = game.secondUpdatedAt ? new Date(game.secondUpdatedAt) : null;
  return date && !Number.isNaN(date.valueOf()) ? date.valueOf() : 0;
}

function getHeroGames(games) {
  const now = currentIstMinutes();
  const byTime = games
    .filter((game) => !["desawer", "desawar"].includes(normalizeGameName(game.name)))
    .sort((a, b) => timeToMinutes(a.resultTime) - timeToMinutes(b.resultTime));

  // Gali is the final featured result of the daily cycle. Once it has been
  // declared, keep the hero focused on Gali until its result resets to XX.
  const gali = byTime.find((game) => normalizeGameName(game.name) === "gali");
  if (gali && !isPending(gali.second)) return [gali];

  // Game 1: next upcoming (result time hasn't passed yet)
  const upcoming = byTime.find((game) => timeToMinutes(game.resultTime) > now) || byTime[0];

  const selected = upcoming ? [upcoming] : [];
  const selectedIds = new Set(selected.map((game) => String(game._id)));

  // Game 2 & 3: last 2 games with declared (non-pending) results, most recent first
  const recentlyDeclared = [...byTime]
    .filter((game) => !selectedIds.has(String(game._id)) && !isPending(game.second))
    .sort((a, b) => resultUpdatedTime(b) - resultUpdatedTime(a));

  for (const game of recentlyDeclared) {
    if (selected.length >= 2) break;
    selected.push(game);
    selectedIds.add(String(game._id));
  }

  // fallback: fill with any remaining games
  for (const game of games) {
    if (selected.length >= 2) break;
    if (["desawer", "desawar"].includes(normalizeGameName(game.name))) continue;
    if (!selectedIds.has(String(game._id))) selected.push(game);
  }

  return selected;
}

function LiveResultSection({ games, showClock = false }) {
  if (!games.length) return null;

  return (
    <section className={showClock ? "a7-hero-results" : "a7-compact-results"}>
      {showClock ? <Clock /> : null}
      {showClock ? <p className="hintext">हा भाई यही आती हे सबसे पहले खबर रूको और देखो</p> : null}
      <div className="live-result-list">
        {games.map((item) => (
          <div className="live-result-item text-center" key={item._id}>
            <p className="live-result-game">{item.name}</p>
            <p className={`live-result-value${resultClass(item.second)}`}>{item.second}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedMarketStrip({ game }) {
  if (!game) return null;

  return (
    <section className="a7-feature-strip">
      <p className="a7-feature-name">{game.name}</p>
      <p>{formatTime(game.resultTime)}</p>
      <strong>
        <span className={resultClass(game.first)}>{game.first}</span>
        <span className="a7-arrow">➜</span>
        <span className={resultClass(game.second)}>{game.second}</span>
      </strong>
    </section>
  );
}

function yearlyChartOrder(name = "") {
  const normalized = String(name).toLowerCase().trim();
  const index = featuredGameList.findIndex((game) => game.key === normalized);
  return index === -1 ? undefined : index;
}

export default async function HomePage() {
  const games = await getGamesWithTodayResults();
  const monthly = await getMonthlyRows({ untilToday: true, games });
  const gamesByName = games.reduce((map, game) => {
    const key = normalizeGameName(game.name);
    const existing = map.get(key) || [];
    existing.push(game);
    map.set(key, existing);
    return map;
  }, new Map());
  const featuredGames = featuredGameList
    .map((item) => {
      const candidates = gamesByName.get(item.key) || [];
      const game = pickBestGame(candidates, item.name);
      return game ? { ...game, name: item.name, resultTime: item.resultTime || game.resultTime } : null;
    })
    .filter(Boolean)
    .filter((game, index, list) => list.findIndex((item) => normalizeGameName(item.name) === normalizeGameName(game.name)) === index);
  const featuredTopGames = await getTopGames(featuredGames);
  const remainingGames = games
    .filter((game) => !featuredGameKeys.has(normalizeGameName(game.name)))
    .map((game) => {
      const details = lowerGameDetails(game.name);
      return details ? { ...game, name: details.name } : game;
    })
    .sort((a, b) => {
      const aIndex = lowerGameList.findIndex((item) => item.name === a.name);
      const bIndex = lowerGameList.findIndex((item) => item.name === b.name);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return timeToMinutes(a.resultTime) - timeToMinutes(b.resultTime);
    });
  const remainingTopGames = await getTopGames(remainingGames);
  const yearlyGames = [...games].sort((a, b) => {
    const aOrder = yearlyChartOrder(a.name);
    const bOrder = yearlyChartOrder(b.name);
    if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
    if (aOrder !== undefined) return -1;
    if (bOrder !== undefined) return 1;
    return String(a.resultTime).localeCompare(String(b.resultTime)) || normalizeGameName(a.name).localeCompare(normalizeGameName(b.name));
  });
  const today = istDate();
  const year = new Date().getFullYear();
  const title = `Satta Result Chart ${monthName(today)}`;
  const featuredMarket = featuredGames.find((game) => normalizeGameName(game.name) === "desawer") || featuredGames[0];
  const heroGames = getHeroGames(featuredGames);

  return (
    <PublicLayout>
      <WebsiteJsonLd />
      <LiveResultSection games={heroGames.length ? heroGames : featuredTopGames} showClock />
      <FeaturedMarketStrip game={featuredMarket} />
      <AdBlock />
      <GameCards games={featuredGames} />
      <LiveResultSection games={remainingTopGames} />
      <GameCards games={remainingGames} />
      <MonthlyChartTable title={title} rows={monthly.rows} columns={monthly.gameColumns} dateKey={today} />
      <section className="a7-year-links">
        <h2>SATTA RECORD CHART {year}</h2>
        <div className="a7-year-link-list">
          {yearlyGames.map((game) => (
            <Link href={`/year-chart/${slugify(game.name)}-result-chart-${year}`} key={game._id}>
              {game.name} {year}
            </Link>
          ))}
        </div>
      </section>
      <SeoContent />
    </PublicLayout>
  );
}
