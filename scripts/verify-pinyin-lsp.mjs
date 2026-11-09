#!/usr/bin/env node
// 用真实 LSP 会话验证拼音首字母补全：输入 cg 应出现 cg(餐馆) 候选，插入内容仍是 餐馆"。
// 用法：node scripts/verify-pinyin-lsp.mjs [二进制路径]
import { spawn } from 'node:child_process';

const bin = process.argv[2] ?? 'bin/beancount-language-server';
const uri = 'file:///tmp/pinyin-check.bean';
const content = `2025-01-01 * "餐馆" "午餐"
  Expenses:Food  10.00 CNY
  Assets:Cash  -10.00 CNY

2025-01-02 * "cg
`;
// 光标在 "cg 之后
const line = 4;
const character = '2025-01-02 * "cg'.length;

const child = spawn(bin, [], { stdio: ['pipe', 'pipe', 'inherit'] });
let buf = Buffer.alloc(0);
let nextId = 0;
const pending = new Map();

child.stdout.on('data', (chunk) => {
  buf = Buffer.concat([buf, chunk]);
  for (;;) {
    const sep = buf.indexOf('\r\n\r\n');
    if (sep < 0) return;
    const header = buf.subarray(0, sep).toString();
    const match = /content-length: (\d+)/i.exec(header);
    if (!match) return;
    const len = Number(match[1]);
    if (buf.length < sep + 4 + len) return;
    const body = JSON.parse(buf.subarray(sep + 4, sep + 4 + len).toString());
    buf = buf.subarray(sep + 4 + len);
    if (body.id !== undefined && pending.has(body.id)) {
      pending.get(body.id)(body);
      pending.delete(body.id);
    }
  }
});

function send(message) {
  const body = JSON.stringify({ jsonrpc: '2.0', ...message });
  child.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
}

function request(method, params) {
  const id = ++nextId;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    send({ id, method, params });
  });
}

const result = await (async () => {
  await request('initialize', {
    processId: process.pid,
    rootUri: 'file:///tmp',
    capabilities: { textDocument: { completion: { completionItem: { labelDetailsSupport: true } } } },
  });
  send({ method: 'initialized', params: {} });
  send({ method: 'textDocument/didOpen', params: { textDocument: { uri, languageId: 'beancount', version: 1, text: content } } });

  const response = await request('textDocument/completion', {
    textDocument: { uri },
    position: { line, character },
    context: { triggerKind: 1 },
  });
  return response.result;
})();

child.kill();

const items = Array.isArray(result) ? result : (result?.items ?? []);
const hit = items.find((item) => item.label === 'cg(餐馆)');
console.log(`候选数：${items.length}`);
console.log(`前 5 个候选：${items.slice(0, 5).map((i) => i.label).join(' | ') || '(空)'}`);

if (!hit) {
  console.error('失败：没有找到 cg(餐馆) 候选');
  process.exit(1);
}
const newText = hit.textEdit?.newText;
if (newText !== '餐馆"') {
  console.error(`失败：插入内容应为 餐馆" ，实际是 ${JSON.stringify(newText)}`);
  process.exit(1);
}
console.log(`通过：label=${hit.label} newText=${JSON.stringify(newText)} filterText=${JSON.stringify(hit.filterText)}`);
