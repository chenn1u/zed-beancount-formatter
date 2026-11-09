#!/usr/bin/env node
// stdin -> stdout 的格式化命令行，供 Zed 的 external formatter 调用。
import { FormatOptions, format } from './format';

/**
 * 解析命令行参数，支持与 bean-format 同名的短选项。
 * @param argv 不含 node 与脚本路径的参数列表
 */
export function parseArgs(argv: string[]): FormatOptions {
  const opts: FormatOptions = {};
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
      const output = format(input, opts);
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
