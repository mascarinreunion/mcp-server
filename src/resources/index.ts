import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerEventsResources } from "./events.js";

export function registerAllResources(server: McpServer): void {
  registerEventsResources(server);
}