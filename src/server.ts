#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import dotenv from "dotenv";
import { registerAllTools } from "./tools/index.js";
import { registerAllResources } from "./resources/index.js";

dotenv.config();

const server = new McpServer({
  name: process.env.MCP_SERVER_NAME || "mascarin-mcp",
  version: "1.0.0",
});

registerAllTools(server);
registerAllResources(server);

// Set up Express and HTTP transport
const app = express();
app.use(express.json());

app.post("/", async (req, res) => {
  // Create a new transport for each request to prevent request ID collisions
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => {
    transport.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const port = parseInt(process.env.MCP_PORT || process.env.PORT || "3001");
app
  .listen(port, () => {
    console.log(`Mascarin MCP Server running on http://localhost:${port}/`);
  })
  .on("error", (error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
