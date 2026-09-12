import mongoose from "mongoose";
import { addDays, formatResult, istDate } from "@/lib/utils";

const cache = global.extraGamesMongoConnection || { conn: null, promise: null };
global.extraGamesMongoConnection = cache;

function extraGamesUri() {
  // Keep the misspelled variant as a temporary fallback for existing local setups.
  return process.env.EXTRA_GAMES_MONGO_URI || process.env.EXTRA_GAMES_MONGO_URO;
}

async function connectExtraGamesDB() {
  const uri = extraGamesUri();
  if (!uri) return null;
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .createConnection(uri, {
        bufferCommands: false,
        connectTimeoutMS: 8000,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 20000
      })
      .asPromise();
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
}

function normalizeKey(value = "") {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function currentBoardDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  return hour < 3 ? addDays(istDate(), -1) : istDate();
}

function gameName(doc) {
  return String(doc.name || doc.gameName || doc.game_name || doc.title || doc.game || "").trim();
}

function gameTime(doc) {
  return String(doc.resultTime || doc.result_time || doc.time || doc.closeTime || doc.close_time || "00:00:00").trim();
}

function rowValue(row) {
  return formatResult(row?.resultNumber ?? row?.result ?? row?.number ?? row?.value ?? "XX");
}

export async function getExtraGamesWithTodayResults() {
  const connection = await connectExtraGamesDB();
  if (!connection) return [];

  const collections = await connection.db.listCollections({}, { nameOnly: true }).toArray();
  const names = new Set(collections.map((item) => item.name));
  const gamesCollection = ["games", "game", "markets"].find((name) => names.has(name));
  if (!gamesCollection) return [];

  // Deliberately do not apply an active-only filter: this list must include every game.
  const docs = await connection.db.collection(gamesCollection).find({}).toArray();
  const games = docs.filter((doc) => gameName(doc));
  if (!games.length) return [];

  const today = currentBoardDate();
  const yesterday = addDays(today, -1);
  // `gameresults` is the active source for this database. Keep the legacy
  // collection names as fallbacks, but do not let a stale `results` collection
  // hide the current rows.
  const resultsCollection = ["gameresults", "gameResults", "game_results", "results"].find((name) => names.has(name));
  let rows = [];
  if (resultsCollection) {
    rows = await connection.db.collection(resultsCollection).find({
      $or: [
        { date: { $in: [today, yesterday] } },
        { resultDate: { $in: [today, yesterday] } },
        { result_date: { $in: [today, yesterday] } }
      ]
    }).toArray();
  }

  const resultMap = new Map();
  for (const row of rows) {
    const date = String(row.date || row.resultDate || row.result_date || "");
    const game = String(row.game?._id || row.game || row.gameId || row.game_id || row.gameName || row.game_name || "");
    resultMap.set(`${game}:${date}`, row);
    resultMap.set(`${normalizeKey(game)}:${date}`, row);
  }

  return games.map((doc, index) => {
    const name = gameName(doc);
    const id = String(doc._id);
    const key = normalizeKey(name);
    const previous = resultMap.get(`${id}:${yesterday}`) || resultMap.get(`${key}:${yesterday}`);
    const current = resultMap.get(`${id}:${today}`) || resultMap.get(`${key}:${today}`);

    return {
      _id: `extra-${id}`,
      name,
      resultTime: gameTime(doc),
      showIndex: Number(doc.showIndex ?? doc.show_index ?? doc.sortOrder ?? index),
      first: rowValue(previous) !== "XX" ? rowValue(previous) : formatResult(doc.first || doc.yesterday || "XX"),
      second: rowValue(current) !== "XX" ? rowValue(current) : formatResult(doc.second || doc.today || doc.result || "XX")
    };
  }).sort((a, b) => a.showIndex - b.showIndex || a.resultTime.localeCompare(b.resultTime));
}
