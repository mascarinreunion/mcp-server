import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerExploreTools(server: McpServer): void {
  server.registerTool(
    "explore_listings",
    {
      title: "Explore Listings",
      description: "Explore listings from the Mascarin API",
      inputSchema: {
        limit: z
          .number()
          .optional()
          .default(10)
          .describe("Maximum number of listings to fetch"),
        type: z
          .string()
          .optional()
          .describe(
            "Filter by listing type: 'activity', 'event', 'experience', 'accommodation', or 'foodestablishment'"
          ),
        priceRange: z
          .string()
          .optional()
          .describe(
            "Filter by price range: 'free', 'budget', 'moderate', 'upscale', or 'luxury'"
          ),
        page: z
          .number()
          .optional()
          .describe("Page number for pagination (starts at 1)"),
      },
      outputSchema: {
        listings: z.any(),
      },
    },
    async ({ limit = 10, type, priceRange, page }) => {
      const baseUrl = process.env.MASCARIN_API_URL || "http://localhost:3333";
      const url = new URL(`${baseUrl}/api/explore`);
      if (type) {
        url.searchParams.set("type", type.toString());
      }
      if (priceRange) {
        url.searchParams.set("priceRange", priceRange.toString());
      }
      if (page) url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", limit.toString());

      const response = await fetch(url.toString());
      const listings = await response.json();

      return {
        content: [
          {
            type: "text",
            text: `Fetched ${
              listings?.meta?.total ?? "?"
            } listings from ${url}\n\n${JSON.stringify(listings, null, 2)}`,
          },
        ],
        structuredContent: { listings },
      };
    }
  );
}