import AdBlock from "@/components/AdBlock";
import Clock from "@/components/Clock";
import GameCards from "@/components/GameCards";
import { getGamesWithTodayResults } from "@/lib/data";
import { formatTime } from "@/lib/utils";

// Top-of-page block shown on the home page (live results, featured market,
// khaiwal ad and the main results table). Reused on the yearly chart pages.
function resultClass(value) {
  return String(value).toUpperCase() === "XX" ? " result-pending" : "";
}

const featuredGameList = [
  { key: "desawer", name: "DESAWER", resultTime: "05:30:00" },
  { key: "desawar", name: "DESAWER", resultTime: "05:30:00" },
  { key: "sadar bazar", name: "Sadar bazar", resultTime: "13:45:00" },
  { key: "gwalior", name: "Gwalior", resultTime: "14:45:00" },
  { key: "delhi bazar", name: "Delhi Bazar", resultTime: "15:20:00" },
  { key: "delhi matka", name: "Delhi Matka", resultTime: "15:50:00" },
  { key: "shri ganesh", name: "Shri Ganesh", resultTime: "16:50:00" },
  { key: "agra", name: "Agra", resultTime: "17:40:00" },
  { key: "faridabad", name: "Faridabad", resultTime: "18:25:00" },
  { key: "alwar", name: "Alwar", resultTime: "19:50:00" },
  { key: "ghaziabad", name: "Gaziabad", resultTime: "22:15:00" },
  { key: "dwarka", name: "Dwarka", resultTime: "22:55:00" },
  { key: "gali", name: "Gali", resultTime: "23:58:00" }
];


function normalizeGameName(name = "") {
  return String(name).toLowerCase().trim();
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

  // A game is upcoming only while today's result is still pending. Results can
  // be declared before the scheduled time, so the result status takes priority.
  const pendingGames = byTime.filter((game) => isPending(game.second));
  const upcoming = pendingGames.find((game) => timeToMinutes(game.resultTime) > now) || pendingGames[0];

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

export default async function GameTopSections({ games: providedGames }) {
  const games = providedGames || (await getGamesWithTodayResults());
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
  const featuredMarket = featuredGames.find((game) => normalizeGameName(game.name) === "desawer") || featuredGames[0];
  const heroGames = getHeroGames(featuredGames);

  return (
    <>
      <LiveResultSection games={heroGames} showClock />
      <FeaturedMarketStrip game={featuredMarket} />
      <AdBlock />
      <GameCards games={featuredGames} />
    </>
  );
}
