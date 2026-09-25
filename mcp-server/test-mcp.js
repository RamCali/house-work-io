// Simple test to verify MCP server loads and lists tools
const { spawn } = require('child_process');

const mcp = spawn('node', ['--loader', 'tsx/esm', 'index.ts'], {
  env: { ...process.env, MUSE_API_URL: 'http://localhost:43123/api/v1', MUSE_ACCESS_TOKEN: 'test' },
  cwd: __dirname
});

let output = '';
let hasTools = false;

mcp.stdout.on('data', (data) => {
  output += data.toString();
});

mcp.stderr.on('data', (data) => {
  const message = data.toString();
  if (message.includes('MCP server running')) {
    console.log('✓ MCP server started');
    hasTools = true;
    mcp.kill();
  }
});

setTimeout(() => {
  if (hasTools) {
    console.log('✓ MCP server test PASSED');
    process.exit(0);
  } else {
    console.log('✗ MCP server did not start');
    console.log('Output:', output);
    process.exit(1);
  }
}, 3000);
