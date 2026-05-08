// Node.js script to fetch Pokémon data from PokéAPI
// Usage: node scripts/fetch-pokemon.mjs
import fs from 'fs';
import path from 'path';

const SMALL_TO_LARGE = {
  'ァ': 'ア', 'ィ': 'イ', 'ゥ': 'ウ', 'ェ': 'エ', 'ォ': 'オ',
  'ャ': 'ヤ', 'ュ': 'ユ', 'ョ': 'ヨ', 'ッ': 'ツ',
};

function getLastMora(name) {
  const chars = [...name];
  let last = chars[chars.length - 1];
  if (last === 'ー') last = chars[chars.length - 2] ?? last;
  return SMALL_TO_LARGE[last] ?? last;
}

function getFirstMora(name) {
  const chars = [...name];
  const first = chars[0];
  return SMALL_TO_LARGE[first] ?? first;
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function fetchBatch(ids, genMap) {
  return Promise.all(ids.map(async (id) => {
    try {
      const data = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
      const jaName =
        data.names.find(n => n.language.name === 'ja-Hrkt')?.name ||
        data.names.find(n => n.language.name === 'ja')?.name;
      if (!jaName) return null;
      const genNum = parseInt(data.generation.url.match(/\/(\d+)\//)?.[1] ?? '9');
      return {
        id,
        nameJa: jaName,
        generation: genNum,
        firstMora: getFirstMora(jaName),
        lastMora: getLastMora(jaName),
      };
    } catch (e) {
      console.error(`Failed id=${id}: ${e.message}`);
      return null;
    }
  }));
}

async function main() {
  console.log('Fetching Pokémon list...');
  const listData = await fetchWithRetry('https://pokeapi.co/api/v2/pokemon-species?limit=1025');
  const total = listData.results.length;
  console.log(`Total species: ${total}`);

  const all = [];
  const BATCH = 20;
  for (let i = 0; i < total; i += BATCH) {
    const ids = Array.from({ length: Math.min(BATCH, total - i) }, (_, k) => i + k + 1);
    process.stdout.write(`\rFetching ${i + 1}-${Math.min(i + BATCH, total)} / ${total}...`);
    const batch = await fetchBatch(ids, {});
    all.push(...batch.filter(Boolean));
    await new Promise(r => setTimeout(r, 200));
  }
  console.log('\nDone! Writing JSON...');

  const outPath = path.join(process.cwd(), 'src/data/pokemon.json');
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2));
  console.log(`Wrote ${all.length} Pokémon to ${outPath}`);

  const gen12 = all.filter(p => p.generation <= 2);
  console.log(`Gen 1-2: ${gen12.length} Pokémon`);

  // Check ン-ending Pokémon (trap for player)
  const nEnding = gen12.filter(p => p.lastMora === 'ン');
  console.log(`Gen 1-2 ending in ン (danger!): ${nEnding.map(p => p.nameJa).join(', ')}`);
}

main().catch(console.error);
