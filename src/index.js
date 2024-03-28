import { acquireData } from './acquire-data/index.js';
import fs from 'fs';

const data = fs.readFileSync('./src/data.csv', 'utf-8');

console.log(acquireData(data));
