#!/usr/bin/env npx tsx

import { preprocessOCRText } from '../src/features/uploads/services/ocr-preprocessor'
import fs from 'fs'

const ocrText = fs.readFileSync('/private/tmp/last-ocr-output.txt', 'utf-8')

console.log('Testing OCR Preprocessor\n')
console.log('='.repeat(50))

const processed = preprocessOCRText(ocrText)

console.log('Preprocessed pairs:')
console.log(processed)

console.log('\n' + '='.repeat(50))
console.log('\nExpected format:')
console.log('Cowboys Eagles -6.5')
console.log('Chiefs Chargers 2.5')
console.log('Buccaneers Falcons 1.5')
console.log('...')