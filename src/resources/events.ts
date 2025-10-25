import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerEventsResources(server: McpServer): void {
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
}