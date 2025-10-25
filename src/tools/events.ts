import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerEventsTools(server: McpServer): void {
  server.registerTool(
    "get_events_agenda",
    {
      title: "Get events for the agenda",
      description: "Fetch upcoming events from the Mascarin API",
      inputSchema: {
        limit: z
          .number()
          .optional()
          .default(10)
          .describe("Maximum number of events to fetch"),
        startDate: z
          .string()
          .optional()
          .describe("Start date filter in ISO 8601 format (YYYY-MM-DD)"),
        endDate: z
          .string()
          .optional()
          .describe("End date filter in ISO 8601 format (YYYY-MM-DD)"),
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
}