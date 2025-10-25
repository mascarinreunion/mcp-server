import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerEventsTools } from "./events.js";
import { registerExploreTools } from "./explore.js";

export function registerAllTools(server: McpServer): void {
  registerEventsTools(server);
  registerExploreTools(server);
}