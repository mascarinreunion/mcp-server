import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { z } from "zod";
import dotenv from "dotenv";
import { readFileSync } from "node:fs";

dotenv.config();

const server = new McpServer({
  name: process.env.MCP_SERVER_NAME || "mascarin-mcp",
  version: "1.0.0",
});

server.registerTool(
  "get_events_agenda",
  {
    title: "Get events for the agenda",
    description: "Fetch upcoming events from the Mascarin API",
    inputSchema: {
      limit: z.number().optional().default(10),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    },
    outputSchema: {
      events: z.any(),
    },
  },
  async ({ startDate, endDate, limit = 10 }) => {
    const baseUrl = process.env.MASCARIN_API_URL || "http://localhost:3333";
    const url = new URL(`${baseUrl}/api/events/agenda`);
    if (startDate) url.searchParams.set("startDate", startDate);
    if (endDate) url.searchParams.set("endDate", endDate);
    url.searchParams.set("limit", limit.toString());

    const response = await fetch(url.toString());
    const events = await response.json();

    return {
      content: [
        {
          type: "text",
          text: `Fetched ${
            events?.meta?.total ?? "?"
          } events from ${url}\n\n${JSON.stringify(events, null, 2)}`,
        },
      ],
      structuredContent: { events },
    };
  }
);

server.registerResource(
  "event_detail",
  new ResourceTemplate("event://{id}", { list: undefined }),
  {
    title: "Event Detail",
    description: "Detailed information about a specific Mascarin event",
  },
  async (uri, { id }) => {
    const baseUrl = process.env.MASCARIN_API_URL || "http://localhost:3333";
    const response = await fetch(`${baseUrl}/api/events/${id}`);

    const event = await response.json();
    return {
      contents: [
        {
          uri: uri.href,
          text: `Event: ${event.title}\nLocation: ${
            event.location?.city
          }\n\n${JSON.stringify(event, null, 2)}`,
        },
      ],
      structuredContent: event,
    };
  }
);

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
    console.log(`Demo MCP Server running on http://localhost:${port}/`);
  })
  .on("error", (error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
