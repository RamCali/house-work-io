# Muse Connector MCP Server

Model Context Protocol server that exposes Muse Connector API operations as tools.

## Installation

```bash
cd mcp-server
npm install
```

## Configuration

Set environment variables:

```bash
export MUSE_API_URL="http://localhost:43123/api/v1"
export MUSE_ACCESS_TOKEN="your-access-token-here"
```

## Running

```bash
npm run dev
```

## Available Tools

- `list_rfqs` - List all service requests
- `create_rfq` - Create a new service request
- `get_rfq` - Get RFQ details with quotes
- `preview_rfq_sharing` - Preview data before sharing
- `submit_rfq` - Submit RFQ with consent ⚠️
- `accept_quote` - Accept a contractor quote ⚠️
- `decline_quote` - Decline a quote
- `get_consent_history` - View audit trail
- `revoke_access` - Revoke OAuth access

⚠️ = Requires explicit user approval

## Integration

Add to your MCP client config (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "muse-connector": {
      "command": "node",
      "args": ["--loader", "tsx/esm", "/path/to/muse-connector/mcp-server/index.ts"],
      "env": {
        "MUSE_API_URL": "http://localhost:43123/api/v1",
        "MUSE_ACCESS_TOKEN": "your-token"
      }
    }
  }
}
```
