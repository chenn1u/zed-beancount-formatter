#!/usr/bin/env node
// 格式化命令行：不给文件时 stdin -> stdout（供 Zed 外部格式化器调用），
// 给文件时可直接输出或原地改写。
import * as fs from 'fs';
import * as path from 'path';
import { alignSeparatorColumn } from './align';
import { FormatOptions, format } from './format';
import { tidyBlankLines } from './tidy';

/** separatorColumn 属于另一种对齐语义，由 align.ts 处理，不进 format() */
export interface CliOptions extends FormatOptions {
  separatorColumn?: number;
  inPlace?: boolean;
  help?: boolean;
  files?: string[];
}

const USAGE = `用法: beancount-format [选项] [文件...]

不给文件时从 stdin 读、写 stdout（供编辑器调）；给文件时输出到 stdout，
加 -i 则原地改写。

选项:
  -w, --prefix-width <n>      固定账户名宽度（bean-format 语义）
  -W, --num-width <n>         固定金额宽度
  -c, --currency-column <n>   把货币对齐到第 n 列
  -s, --separator-column <n>  换成小数点对齐到第 n 列（与 -c 互斥）
  -i, --in-place              原地改写给定文件
      --fixed-cjk-width       按双宽计算 CJK 字符
  -h, --help                  显示本帮助
`;

/**
 * 解析命令行参数，短选项与 bean-format 同名，另加 --separator-column 与 --in-place。
 * 非选项参数视为待格式化的文件。
 * @param argv 不含 node 与脚本路径的参数列表
 */
export function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {};
  const files: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const num = (): number => {
      const value = parseInt(argv[++i], 10);
      if (isNaN(value)) {
        throw new Error(`missing or invalid value for ${arg}`);
      }
      return value;
    };
    switch (arg) {
      case '-w':
      case '--prefix-width':
        opts.prefixWidth = num();
        break;
      case '-W':
      case '--num-width':
        opts.numWidth = num();
        break;
      case '-c':
      case '--currency-column':
        opts.currencyColumn = num();
        break;
      case '-s':
      case '--separator-column':
        opts.separatorColumn = num();
        break;
      case '-i':
      case '--in-place':
        opts.inPlace = true;
        break;
      case '-h':
      case '--help':
        opts.help = true;
        break;
      case '--fixed-cjk-width':
        opts.fixedCJKWidth = true;
        break;
      default:
        if (arg.startsWith('-')) {
          throw new Error(`unknown argument: ${arg}`);
        }
        files.push(arg);
    }
  }
  if (opts.inPlace && files.length === 0) {
    throw new Error('--in-place requires at least one file');
  }
  if (files.length > 0) {
    opts.files = files;
  }
  return opts;
}

/** 按选项选择对齐算法，然后收紧空行 */
export function formatText(input: string, opts: CliOptions): string {
  const normalized = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const aligned = opts.separatorColumn
    ? alignSeparatorColumn(normalized, opts.separatorColumn, opts.fixedCJKWidth)
    : format(normalized, opts);
  return tidyBlankLines(aligned);
}

/**
 * 行尾换行归一：只保留一个结尾换行，并且只在输入本来就有结尾换行时才保留。
 * format() 会把输入末尾的换行原样带进输出，再补一个就会每次多出一行空行。
 * @param output formatText 的结果
 * @param inputEndedWithNewline 输入是否以换行结尾（0 个就不补，1 个就保留 1 个）
 */
export function normalizeOutput(output: string, inputEndedWithNewline: boolean): string {
  const trimmed = output.replace(/\n+$/, '');
  return trimmed === '' ? '' : trimmed + (inputEndedWithNewline ? '\n' : '');
}

/** 原地改写：先写临时文件再 rename，避免中途出错把原文件清空 */
function formatFileInPlace(file: string, opts: CliOptions): void {
  const input = fs.readFileSync(file, 'utf8');
  const output = normalizeOutput(formatText(input, opts), input.endsWith('\n'));
  const tmp = path.join(path.dirname(file), `.${path.basename(file)}.tmp`);
  fs.writeFileSync(tmp, output);
  fs.renameSync(tmp, file);
}

function run(opts: CliOptions): void {
  if (opts.help) {
    process.stdout.write(USAGE);
    return;
  }
  if (opts.inPlace) {
    for (const file of opts.files ?? []) {
      formatFileInPlace(file, opts);
    }
    return;
  }
  const input = opts.files?.[0] ? fs.readFileSync(opts.files[0], 'utf8') : readStdin();
  process.stdout.write(normalizeOutput(formatText(input, opts), input.endsWith('\n')));
}

function readStdin(): string {
  return fs.readFileSync(0, 'utf8');
}

function main(): void {
  try {
    run(parseArgs(process.argv.slice(2)));
  } catch (e) {
    process.stderr.write(`beancount-format: ${(e as Error).message}\n`);
    process.stderr.write('用 --help 查看用法\n');
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
