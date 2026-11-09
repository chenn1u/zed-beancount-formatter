#!/usr/bin/env node
// stdin -> stdout 的格式化命令行，供 Zed 的 external formatter 调用。
import { alignSeparatorColumn } from './align';
import { FormatOptions, format } from './format';

/** separatorColumn 属于另一种对齐语义，由 align.ts 处理，不进 format() */
export interface CliOptions extends FormatOptions {
  separatorColumn?: number;
}

/**
 * 解析命令行参数，短选项与 bean-format 同名，另加 --separator-column。
 * @param argv 不含 node 与脚本路径的参数列表
 */
export function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {};
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
      case '--fixed-cjk-width':
        opts.fixedCJKWidth = true;
        break;
      default:
        throw new Error(`unknown argument: ${arg}`);
    }
  }
  return opts;
}

function main(): void {
  const chunks: string[] = [];
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk: string) => chunks.push(chunk));
  process.stdin.on('end', () => {
    try {
      const opts = parseArgs(process.argv.slice(2));
      const input = chunks.join('').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const output = opts.separatorColumn
        ? alignSeparatorColumn(input, opts.separatorColumn, opts.fixedCJKWidth)
        : format(input, opts);
      process.stdout.write(output === '' ? '' : output + '\n');
    } catch (e) {
      process.stderr.write(`beancount-formatter: ${(e as Error).message}\n`);
      process.exitCode = 1;
    }
  });
}

if (require.main === module) {
  main();
}
