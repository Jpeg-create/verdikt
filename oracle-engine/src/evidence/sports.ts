import { config } from "../config.js";
import type { EvidenceItem, MarketQuestion } from "../types.js";
import { mockSportsEvidence } from "../mock/fixtures.js";

/**
 * Gathers evidence for a sports outcome question ("Did Team A win Match X?")
 * from TWO independent, keyless-or-keyed public sources:
 *   - TheSportsDB  (free tier, real final scores)
 *   - football-data.org (TIER_ONE free tier, real final scores)
 *
 * The market question is a plain-English sentence like "Did Team A win
 * Match X on Date Y?" so the first step is extracting the two team names
 * from the question text. We then look the fixture up on both providers and
 * emit whatever final score / result evidence we find. `Promise.allSettled`
 * means one source failing doesn't kill the whole evidence bundle — same
 * resilience pattern as gatherCryptoEvidence.
 *
 * The AI resolution pass (resolve.ts) does the actual "did Team A win"
 * reasoning; this module's job is just to produce real, citable evidence.
 */
export async function gatherSportsEvidence(question: MarketQuestion): Promise<EvidenceItem[]> {
  if (config.mockMode) {
    return mockSportsEvidence(question);
  }

  // Extract candidate team names from the question text. Real markets are
  // phrased "Did <Home> win/lose/draw against <Away> on <date>?" — we pull
  // the two named sides so both providers can look the fixture up.
  const { homeTeam, awayTeam } = extractTeams(question.questionText);

  const fetchedAt = Date.now();
  const [sportsDb, footballData] = await Promise.allSettled([
    fetchTheSportsDbFixture(homeTeam, awayTeam, fetchedAt),
    fetchFootballDataFixture(homeTeam, awayTeam, fetchedAt),
  ]);

  const items: EvidenceItem[] = [];
  if (sportsDb.status === "fulfilled") items.push(...sportsDb.value);
  if (footballData.status === "fulfilled") items.push(...footballData.value);

  if (items.length === 0) {
    const errors = [sportsDb, footballData]
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => String(r.reason))
      .join("; ");
    throw new Error(`Both sports evidence sources failed: ${errors}`);
  }

  return items;
}

// Pulls the two team names from a question. Handles the common phrasings:
//   "Did Team A beat Team B on 2026-08-20?"   -> ["Team A", "Team B"]
//   "Did Team A win against Team B on Date?"  -> ["Team A", "Team B"]
//   "Did Team A defeat Team B?"               -> ["Team A", "Team B"]
//   "Who won Arsenal vs Chelsea on ...?"      -> ["Arsenal", "Chelsea"]
//   "Did Team A win Match X on Date?"         -> ["Team A", null]
// Falls back to [null, null] when the question isn't parseable — the
// providers then return empty and we degrade to whatever matched.
function extractTeams(questionText: string): { homeTeam: string | null; awayTeam: string | null } {
  // "X vs Y" / "X v Y" / "X - Y" pattern covers "vs" phrasings.
  const vs = questionText.match(/([A-Za-z0-9.\s]+?)\s+(?:vs\.?|v\.?|-)\s+([A-Za-z0-9.\s]+?)(?:\s+(?:on|at|,|\?)|$)/i);
  if (vs) {
    return { homeTeam: cleanTeam(vs[1]), awayTeam: cleanTeam(vs[2]) };
  }

  // "Did X beat/defeat/won-against Y ..." — the common outcome-market phrasing.
  // Captures the two named sides around a head-to-head verb.
  const beat = questionText.match(
    /did\s+([A-Za-z0-9.\s]+?)\s+(?:beat|defeated|win\s+against|won\s+against|over)\s+([A-Za-z0-9.\s]+?)(?:\s+(?:on|at|in|,|\?)|$)/i
  );
  if (beat) {
    return { homeTeam: cleanTeam(beat[1]), awayTeam: cleanTeam(beat[2]) };
  }

  // "Did X win Match Y ..." — only one named side, the other unknown.
  const single = questionText.match(
    /did\s+([A-Za-z0-9.\s]+?)\s+(?:win|win\s+match|lose|draw)(?:\s+(?:against|with|on|at|in|,|\?)|$)/i
  );
  if (single) {
    return { homeTeam: cleanTeam(single[1]), awayTeam: null };
  }

  return { homeTeam: null, awayTeam: null };
}

function cleanTeam(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

// Generic club-word tokens that carry no identity ("FC", "EC", "CR", ...).
// Dropped before comparing two team names so "Cruzeiro EC" matches "Cruzeiro"
// and "CR Flamengo" matches "Flamengo" regardless of name order/format.
// DELIBERATELY EXCLUDES distinguishing words like "city", "united", "real" —
// those are identity-bearing ("Manchester City" vs "Manchester United",
// "Real Madrid" vs "Atlético Madrid") and dropping them would cross-match
// different clubs.
const GENERIC_TOKENS = new Set([
  "fc", "cf", "ec", "sc", "ac", "cr", "cd", "ca", "afc", "cfc",
  "club", "the", "de", "da", "do",
]);

function nameTokens(name: string): string[] {
  return cleanTeam(name)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !GENERIC_TOKENS.has(t));
}

// True when every identifying token of `want` appears among the tokens of
// `have` (e.g. want="cr flamengo" -> ["flamengo"], have="flamengo" -> match;
// want="cruzeiro ec" -> ["cruzeiro"], have="cruzeiro" -> match).
function namesMatch(want: string, have: string): boolean {
  const w = nameTokens(want);
  if (w.length === 0) return false;
  const h = new Set(nameTokens(have));
  return w.every((tok) => {
    if (h.has(tok)) return true;
    // tolerate singular/plural and prefix truncation ("inter" ~ "internacional")
    for (const cand of h) {
      if (cand.startsWith(tok) || tok.startsWith(cand)) return true;
    }
    return false;
  });
}

async function fetchTheSportsDbFixture(
  homeTeam: string | null,
  awayTeam: string | null,
  fetchedAt: number
): Promise<EvidenceItem[]> {
  const base = "https://www.thesportsdb.com/api/v1/json/123"; // free tier default key

  // Resolve team ID(s) by name, then pull their last finished events.
  // TheSportsDB has no free "search by both teams + get result" call that
  // reliably returns settled scores for a named pair, so we look up each
  // side's recent finished matches and cross-match.
  const homeId = await resolveTeamId(base, homeTeam);
  const awayId = await resolveTeamId(base, awayTeam);

  const [homeEvents, awayEvents] = await Promise.allSettled([
    homeId ? fetchRecentFinished(base, homeId) : Promise.resolve([]),
    awayId ? fetchRecentFinished(base, awayId) : Promise.resolve([]),
  ]);

  const allEvents = [
    ...(homeEvents.status === "fulfilled" ? homeEvents.value : []),
    ...(awayEvents.status === "fulfilled" ? awayEvents.value : []),
  ];

  // Find an event involving BOTH named sides with a real score.
  // ORDER-INDEPENDENT: the question may phrase either side first ("Did A beat
  // B?" vs "Did B lose to A?"), so each wanted name may sit in either the
  // event's home or away slot. Requiring positional matches here would miss
  // every reversed phrasing.
  const wantHome = homeTeam ?? "";
  const wantAway = awayTeam ?? "";
  const match = allEvents.find((e) => {
    const h = String(e.strHomeTeam ?? "");
    const a = String(e.strAwayTeam ?? "");
    const homeInvolved = !!wantHome && (namesMatch(wantHome, h) || namesMatch(wantHome, a));
    const awayInvolved = !!wantAway && (namesMatch(wantAway, h) || namesMatch(wantAway, a));
    const involved =
      wantHome && wantAway
        ? homeInvolved && awayInvolved
        : homeInvolved || awayInvolved;
    const hasScore = e.intHomeScore !== null && e.intAwayScore !== null;
    return hasScore && involved;
  });

  if (!match) {
    return [
      {
        source: "thesportsdb:search",
        fetchedAt,
        content: `TheSportsDB looked up "${homeTeam ?? "?"}" (id ${homeId ?? "n/a"}) and "${awayTeam ?? "?"}" (id ${awayId ?? "n/a"}) but found no settled head-to-head result in recent events. Question: "${homeTeam ?? "?"} vs ${awayTeam ?? "?"}"`,
      },
    ];
  }

  const home = String(match.strHomeTeam ?? homeTeam ?? "?");
  const away = String(match.strAwayTeam ?? awayTeam ?? "?");
  const score = `${match.intHomeScore}-${match.intAwayScore}`;
  const date = String(match.dateEvent ?? "");
  return [
    {
      source: "thesportsdb:event-result",
      fetchedAt,
      content: `${home} ${score} ${away} (${date}). Official result via TheSportsDB. Question: "${homeTeam ?? "?"} vs ${awayTeam ?? "?"}"`,
    },
  ];
}

async function resolveTeamId(base: string, teamName: string | null): Promise<string | null> {
  if (!teamName) return null;
  const res = await fetch(`${base}/searchteams.php?t=${encodeURIComponent(teamName)}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { teams?: { idTeam: string; strTeam: string }[] };
  const teams = data.teams ?? [];
  if (teams.length === 0) return null;
  // Prefer a token-based name match over the API's first fuzzy hit.
  const matched = teams.find((t) => namesMatch(teamName, t.strTeam));
  return matched?.idTeam ?? teams[0].idTeam;
}

async function fetchRecentFinished(base: string, teamId: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${base}/eventslast.php?id=${teamId}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: Record<string, unknown>[] };
  return data.results ?? [];
}

async function fetchFootballDataFixture(
  homeTeam: string | null,
  awayTeam: string | null,
  fetchedAt: number
): Promise<EvidenceItem[]> {
  const key = config.evidence.footballDataApiKey;
  if (!key) throw new Error("FOOTBALL_DATA_API_KEY not set");

  // football-data.org requires a date window (no free-text team search).
  // We use a recent date range so the match (already played by resolution
  // time) is in range. 7-day window keeps it simple and covers the common
  // "match happened this week" case.
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 86400000);
  const dateFrom = start.toISOString().slice(0, 10);
  const dateTo = end.toISOString().slice(0, 10);

  const url = `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  const res = await fetch(url, { headers: { "X-Auth-Token": key } });
  if (!res.ok) throw new Error(`football-data.org request failed: ${res.status}`);

  const data = (await res.json()) as {
    matches?: {
      homeTeam: { name: string };
      awayTeam: { name: string };
      score: { fullTime: { home: number | null; away: number | null } };
      status: string;
      utcDate: string;
    }[];
  };
  const matches = data.matches ?? [];

  // Match by team name (token-based, order-independent — the question may
  // name either side first, and either may sit in either fixture slot).
  const wantHome = homeTeam ?? "";
  const wantAway = awayTeam ?? "";
  const found = matches.find((m) => {
    const h = m.homeTeam.name;
    const a = m.awayTeam.name;
    const homeInvolved = !!wantHome && (namesMatch(wantHome, h) || namesMatch(wantHome, a));
    const awayInvolved = !!wantAway && (namesMatch(wantAway, h) || namesMatch(wantAway, a));
    const involved =
      wantHome && wantAway
        ? homeInvolved && awayInvolved
        : homeInvolved || awayInvolved;
    return involved;
  });

  if (!found) {
    return [
      {
        source: "football-data.org:matches",
        fetchedAt,
        content: `football-data.org returned ${matches.length} matches in the last 7 days but none matched "${homeTeam ?? "?"} vs ${awayTeam ?? "?"}".`,
      },
    ];
  }

  const ft = found.score.fullTime;
  const score = ft.home !== null && ft.away !== null ? `${ft.home}-${ft.away}` : "no score yet";
  return [
    {
      source: "football-data.org:match-result",
      fetchedAt,
      content: `${found.homeTeam.name} ${score} ${found.awayTeam.name} (${found.status}, ${found.utcDate.slice(0, 10)}). Official result via football-data.org.`,
    },
  ];
}
