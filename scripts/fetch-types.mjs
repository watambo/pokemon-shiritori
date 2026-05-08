// Add types to existing pokemon.json (Gen1-2 only, others get [])
import fs from 'fs';

const pokemon = JSON.parse(fs.readFileSync('./src/data/pokemon.json', 'utf-8'));
const gen12 = pokemon.filter(p => p.generation <= 2);

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
  const typeMap = {};
  const BATCH = 20;

  for (let i = 0; i < gen12.length; i += BATCH) {
    const batch = gen12.slice(i, i + BATCH);
    process.stdout.write(`\rFetching types ${i + 1}-${Math.min(i + BATCH, gen12.length)} / ${gen12.length}...`);
    await Promise.all(batch.map(async p => {
      try {
        const data = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${p.id}/`);
        typeMap[p.id] = data.types.map(t => t.type.name);
      } catch { typeMap[p.id] = []; }
    }));
    await new Promise(r => setTimeout(r, 200));
  }
  console.log('\nMerging...');

  const merged = pokemon.map(p => ({ ...p, types: typeMap[p.id] ?? [] }));
  fs.writeFileSync('./src/data/pokemon.json', JSON.stringify(merged, null, 2));
  console.log(`Done! Gen1-2 types added.`);
}

main().catch(console.error);
