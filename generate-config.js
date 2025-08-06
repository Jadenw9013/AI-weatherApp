// generate-config.js
import { writeFileSync } from 'fs';

const out = `// config.js (auto-generated)
export const OPENWEATHER_KEY = '${process.env.OPENWEATHER_KEY}';
export const OPENAI_KEY       = '${process.env.OPENAI_KEY}';
`;
writeFileSync('config.js', out);
