const fs = require('fs');
const readline = require('readline');
const path = require('path');

const CARDS_FILE = path.join(__dirname, 'training_data_temp', 'clash_royale_cards.csv');
const BATTLES_FILE = path.join(__dirname, 'training_data_temp', 'clash-royale-season-18-dec-0320-datasetBattlesStaging_01012021_p1_p2_tagged_frac1.csv');
const OUTPUT_FILE = path.join(__dirname, 'data', 'generatedDecks.ts');

async function run() {
    console.log('Step 1: Loading Card Map...');
    const idToName = new Map();
    const fileStream1 = fs.createReadStream(CARDS_FILE);
    const rl1 = readline.createInterface({ input: fileStream1, crlfDelay: Infinity });

    for await (const line of rl1) {
        if (line.startsWith('Card,')) continue; // Skip header
        const parts = line.split(',');
        // Format: Name,id,...
        const name = parts[0].trim();
        const id = parts[1].trim();
        if (id && name) {
            idToName.set(id, name);
        }
    }
    console.log(`Loaded ${idToName.size} cards.`);

    console.log('Step 2: Processing Battles...');
    const deckCounts = new Map();
    const fileStream2 = fs.createReadStream(BATTLES_FILE);
    const rl2 = readline.createInterface({ input: fileStream2, crlfDelay: Infinity });

    let lineCount = 0;
    let headerIndices = {};

    for await (const line of rl2) {
        lineCount++;
        if (lineCount === 1) {
            // Parse Header
            const cols = line.split(',');
            cols.forEach((col, idx) => {
                headerIndices[col.trim()] = idx;
            });
            continue;
        }

        if (lineCount % 50000 === 0) console.log(`Processed ${lineCount} battles...`);

        const cols = line.split(',');
        
        // Helper to extract deck
        const processPlayer = (prefix) => {
            const deck = [];
            for (let i = 1; i <= 8; i++) {
                const colName = `${prefix}.card${i}.id`;
                const idx = headerIndices[colName];
                if (idx !== undefined) {
                    const id = cols[idx];
                    const name = idToName.get(id);
                    if (name) deck.push(name);
                }
            }
            if (deck.length === 8) {
                // Normalize deck (sort names)
                deck.sort();
                const signature = deck.join('|');
                deckCounts.set(signature, (deckCounts.get(signature) || 0) + 1);
            }
        };

        processPlayer('player1');
        processPlayer('player2');
    }

    console.log(`Step 3: Aggregating Results. Found ${deckCounts.size} unique decks.`);

    // Convert to array and sort
    const sortedDecks = [...deckCounts.entries()]
        .sort((a, b) => b[1] - a[1]) // Descending count
        .slice(0, 1000); // Top 1000 decks

    console.log('Step 4: Writing Output...');
    
    // Normalize names to match existing data/cards.ts if possible
    // The CSV names might slightly differ (e.g. "P.E.K.K.A" vs "P.E.K.K.A").
    // I should check mapping later, but for now assuming CSV is canonical enough.
    
    const outputContent = `// Auto-generated from training data
export const GENERATED_DECKS = [
${sortedDecks.map(([sig, count], idx) => {
    const cards = sig.split('|').map(s => `'${s}'`).join(', ');
    return `  { id: 'gen_${idx}', name: 'Meta Deck #${idx + 1} (n=${count})', cards: [${cards}] }`;
}).join(',\n')}
];
`;

    fs.writeFileSync(OUTPUT_FILE, outputContent);
    console.log(`Done! Written to ${OUTPUT_FILE}`);
}

run().catch(console.error);
