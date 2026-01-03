const fs = require('fs');
const readline = require('readline');
const path = require('path');

const CARDS_FILE = path.join(__dirname, 'training_data_temp', 'clash_royale_cards.csv');
const BATTLES_FILE = path.join(__dirname, 'training_data_temp', 'clash-royale-season-18-dec-0320-datasetBattlesStaging_01012021_p1_p2_tagged_frac1.csv');
const OUTPUT_FILE = path.join(__dirname, 'data', 'cardElixirStats.ts');

async function run() {
    console.log('Step 1: Loading Card Map...');
    const idToName = new Map();
    const fileStream1 = fs.createReadStream(CARDS_FILE);
    const rl1 = readline.createInterface({ input: fileStream1, crlfDelay: Infinity });

    for await (const line of rl1) {
        if (line.startsWith('Card,')) continue;
        const parts = line.split(',');
        const name = parts[0].trim();
        const id = parts[1].trim();
        if (id && name) idToName.set(id, name);
    }

    console.log('Step 2: Analyzing Battles for Elixir Context...');
    // Store: { cardName: { sumDeckAvg: 0, count: 0 } }
    const cardStats = new Map();

    const fileStream2 = fs.createReadStream(BATTLES_FILE);
    const rl2 = readline.createInterface({ input: fileStream2, crlfDelay: Infinity });

    let lineCount = 0;
    let headerIndices = {};

    for await (const line of rl2) {
        lineCount++;
        if (lineCount === 1) {
            const cols = line.split(',');
            cols.forEach((col, idx) => headerIndices[col.trim()] = idx);
            continue;
        }
        if (lineCount % 100000 === 0) console.log(`Processed ${lineCount} battles...`);

        const cols = line.split(',');

        const processPlayer = (prefix) => {
            const avgElixirIdx = headerIndices[`${prefix}.elixir.average`];
            if (avgElixirIdx === undefined) return;
            
            const avgElixir = parseFloat(cols[avgElixirIdx]);
            if (isNaN(avgElixir)) return;

            for (let i = 1; i <= 8; i++) {
                const colName = `${prefix}.card${i}.id`;
                const idx = headerIndices[colName];
                if (idx !== undefined) {
                    const id = cols[idx];
                    const name = idToName.get(id);
                    if (name) {
                        if (!cardStats.has(name)) {
                            cardStats.set(name, { sumDeckAvg: 0, count: 0 });
                        }
                        const stat = cardStats.get(name);
                        stat.sumDeckAvg += avgElixir;
                        stat.count += 1;
                    }
                }
            }
        };

        processPlayer('player1');
        processPlayer('player2');
    }

    console.log('Step 3: Calculating Averages and Writing Output...');
    
    const outputData = {};
    for (const [name, stat] of cardStats.entries()) {
        outputData[name] = {
            avgDeckCost: parseFloat((stat.sumDeckAvg / stat.count).toFixed(2)),
            usageCount: stat.count
        };
    }

    const outputContent = `// Auto-generated from training data
// Maps card name to the average elixir cost of decks it appears in.
// High avgDeckCost => Card is typically played in heavier/beatdown decks.
// Low avgDeckCost => Card is typically played in cycle decks.

export interface CardElixirStat {
    avgDeckCost: number;
    usageCount: number;
}

export const CARD_ELIXIR_STATS: Record<string, CardElixirStat> = ${JSON.stringify(outputData, null, 2)};
`;

    fs.writeFileSync(OUTPUT_FILE, outputContent);
    console.log(`Done! Written to ${OUTPUT_FILE}`);
}

run().catch(console.error);
