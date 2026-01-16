#!/usr/bin/env bun

/**
 * Скрипт проверки актуальности URL функций
 * Находит все вызовы functions.poehali.dev и проверяет их наличие в func2url.json
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Читаем func2url.json
const func2urlPath = join(process.cwd(), 'backend', 'func2url.json');
let validUUIDs: Set<string>;

try {
  const func2urlContent = readFileSync(func2urlPath, 'utf-8');
  const func2url = JSON.parse(func2urlContent);
  validUUIDs = new Set(
    Object.values(func2url).map((url: any) => {
      const match = url.match(/[a-f0-9-]{36}/);
      return match ? match[0] : null;
    }).filter(Boolean)
  );
  console.log(`✓ Загружено ${validUUIDs.size} валидных функций из func2url.json`);
} catch (error) {
  console.error('❌ Не удалось прочитать backend/func2url.json:', error);
  process.exit(1);
}

// Регулярка для поиска URL функций
const functionUrlPattern = /functions\.poehali\.dev\/([a-f0-9-]{36})/g;

// Рекурсивный обход директории
function* walkDir(dir: string): Generator<string> {
  const files = readdirSync(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        yield* walkDir(filePath);
      }
    } else if (/\.(tsx?|jsx?)$/.test(file)) {
      yield filePath;
    }
  }
}

interface Issue {
  uuid: string;
  file: string;
  line: number;
}

const issues: Issue[] = [];
const srcPath = join(process.cwd(), 'src');

// Проверяем все файлы
console.log('\n🔍 Сканирование файлов...\n');

let filesChecked = 0;
for (const filePath of walkDir(srcPath)) {
  filesChecked++;
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    let match;
    while ((match = functionUrlPattern.exec(line)) !== null) {
      const uuid = match[1];
      if (!validUUIDs.has(uuid)) {
        issues.push({
          uuid,
          file: filePath.replace(process.cwd() + '/', ''),
          line: index + 1
        });
      }
    }
    // Сброс lastIndex для корректной работы регулярки
    functionUrlPattern.lastIndex = 0;
  });
}

console.log(`✓ Проверено файлов: ${filesChecked}`);

// Выводим результаты
if (issues.length === 0) {
  console.log('\n✅ Все функции актуальны! Устаревших URL не найдено.\n');
  process.exit(0);
} else {
  console.error(`\n❌ Найдено ${issues.length} устаревших URL функций:\n`);
  
  issues.forEach(issue => {
    console.error(`UUID: ${issue.uuid}`);
    console.error(`Файл: ${issue.file}:${issue.line}`);
    console.error('');
  });
  
  console.error('💡 Проверьте backend/func2url.json и обновите URL в коде.\n');
  process.exit(1);
}
