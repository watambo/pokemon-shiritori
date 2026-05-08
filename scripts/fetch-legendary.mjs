// Add is_legendary / is_mythical flags to pokemon.json
import fs from 'fs';

const pokemon = JSON.parse(fs.readFileSync('./src/data/pokemon.json', 'utf-8'));

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

async function main() {
  const flagMap = {};
  const BATCH = 30;
  const total = pokemon.length;

  for (let i = 0; i < total; i += BATCH) {
    const batch = pokemon.slice(i, i + BATCH);
    process.stdout.write(`\r${i + 1}-${Math.min(i + BATCH, total)} / ${total}...`);
    await Promise.all(batch.map(async p => {
      try {
        const data = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon-species/${p.id}/`);
        flagMap[p.id] = { isLegendary: data.is_legendary, isMythical: data.is_mythical };
      } catch { flagMap[p.id] = { isLegendary: false, isMythical: false }; }
    }));
    await new Promise(r => setTimeout(r, 150));
  }
  console.log('\nMerging...');

  const merged = pokemon.map(p => ({
    ...p,
    isLegendary: flagMap[p.id]?.isLegendary ?? false,
    isMythical: flagMap[p.id]?.isMythical ?? false,
  }));
  fs.writeFileSync('./src/data/pokemon.json', JSON.stringify(merged, null, 2));

  const legendCount = merged.filter(p => p.isLegendary || p.isMythical).length;
  console.log(`Done! Legendary/Mythical: ${legendCount}`);
}

main().catch(console.error);
