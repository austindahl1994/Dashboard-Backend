// ROUTES FOR CARD API
import cabbageMiddleware from "@/middleware/cabbageMiddleware.ts";
import express from "express";
import * as cc from "./cardController.ts";

const router = express.Router();

// route for getting data for player for inventory, packs quantity for player, and pack cost
router.get("/inventory", cabbageMiddleware, cc.getCardInventoryData);

// route for getting the entire collection for that player
router.get("/collection", cabbageMiddleware, cc.getPlayerCollection);

// route for buying packs
router.post("/buy", cabbageMiddleware, cc.buyPacks);

// route for opening packs
router.post("/open", cabbageMiddleware, cc.openPacks);

// route for generating packs for testing
// Disabled per request: generate flow was test-only.
// router.post("/generate", cabbageMiddleware, cc.generatePack);

export default router;

/*
Frontend Integration Notes

Auth
- Every route below requires an authenticated cabbage session cookie/token via cabbageMiddleware.
- Do not send cabbageId in request bodies; backend resolves player from session.
- Non-2xx responses include both message and error fields for frontend UX handlers.

Route: GET /cards/inventory
- Body: none
- Query: none
- Use when:
	- Initial load of Card Wrapper / Cards home.
	- After successful buy/open/generate to re-sync if you are not fully trusting local optimistic state.
- Avoid calling on every tab/card click.
- Response shape:
	{
		inventory: {
			cabbageId: number,
			coins: number,
			packs: Array<{ packName: string, quantity: number }>
		},
		packCosts: Record<string, number>
	}

Route: GET /cards/collection
- Body: none
- Query: none
- Use when:
	- User enters Collection page/modal.
	- Manual refresh on Collection page.
- Avoid calling when switching around non-collection card UI sections.
- Response shape:
	{
		collection: Array<{
			id: number,
			cabbageId: number,
			cardName: string,
			quantity: number,
			shinyQuantity: number,
			negativeQuantity: number,
			lastObtainedAt: string | null
		}>
	}

Route: POST /cards/buy
- Body required:
	{
		packName: string,
		quantity: 1 | 5 | 10
	}
- Use when:
	- User confirms a pack purchase from shop UI.
- Response shape:
	{
		purchased: {
			packName: string,
			quantity: number,
			totalCost: number
		},
		inventory: {
			cabbageId: number,
			coins: number,
			packs: Array<{ packName: string, quantity: number }>
		}
	}

Route: POST /cards/open
- Body required:
	{
		packName: string,
		quantity: 1 | 5 | 10
	}
- Use when:
	- User confirms opening packs on Open Packs page.
- Response shape:
	{
		packName: string,
		packsOpened: number,
		cardsPerPack: number,
		openedCards: Array<{
			name: string,
			rarity: number,
			type: string,
			finish: "normal" | "shiny" | "negative",
			shiny?: boolean,
			negative?: boolean,
			url?: string,
			description?: string
		}>,
		inventory: {
			cabbageId: number,
			coins: number,
			packs: Array<{ packName: string, quantity: number }>
		}
	}

Route: POST /cards/generate (testing tool)
- Body required:
	{
		bossName: string,
		quantity: 1 | 5 | 10
	}
- Use when:
	- Internal/testing-only controls, not normal player flow.
	- Admin/dev button to seed rewards.

- Important change:
	- This route now returns HTTP ack only.
	- Generated pack/inventory data is now delivered via SSE event tower-reward.
	- This route grants packs/coins only and does not roll cards.
	- Collection should not change from /cards/generate.

- HTTP response shape:
	{
		success: true,
		message: string
	}

SSE note: generate route completion event
- Event name: tower-reward
- Sent only to the requesting player (if online).
- Frontend should:
	- Trigger POST /cards/generate.
	- Treat HTTP response as ack only.
	- Listen for tower-reward event and update UI from payload.
	- Use a timeout fallback to GET /cards/inventory if no SSE arrives.

SSE payload shape:
{
	rsn: string,
	source: string,
	reason: "cards-generate",
	rewards: {
		packs: string[],
		packRewards: Array<{ packName: string, quantity: number }>,
		coins: number
	},
	generatedCards: [],
	inventory: {
		cabbageId: number,
		coins: number,
		packs: Array<{ packName: string, quantity: number }>
	}
}

SSE example (tower-reward from /cards/generate):
{
	"rsn": "PlayerOne",
	"source": "chambers of xeric",
	"reason": "cards-generate",
	"rewards": {
		"packs": ["Chambers of Xeric", "Zeah"],
		"packRewards": [
			{ "packName": "Chambers of Xeric", "quantity": 5 },
			{ "packName": "Zeah", "quantity": 5 }
		],
		"coins": 25000
	},
	"generatedCards": [],
	"inventory": {
		"cabbageId": 42,
		"coins": 145000,
		"packs": [
			{ "packName": "Chambers of Xeric", "quantity": 7 },
			{ "packName": "Zeah", "quantity": 10 }
		]
	}
}

Error handling (all routes)
- 400 for invalid/missing body fields or business rules (not enough coins/packs).
- 401 when session is missing/expired.
- 500 for unexpected server error.

SSE note: player reward event from tower source rewards
- Event name: tower-reward
- Sent only to the specific player (if online) when:
	- Tower loot source grants packs/coins, or
	- /cards/generate grants testing rewards.
- For generate flow, payload.reason is cards-generate.
- Frontend should:
	- Listen for tower-reward event.
	- Merge/replace local inventory from payload.inventory.
	- For /cards/generate, do not expect card-roll data; use rewards + inventory only.
	- Show toast/notification for rewards.packRewards (or rewards.packs) and rewards.coins.

Server recommendation summary
- Prefer sending url in openedCards/generatedCards whenever available to avoid broken fallback images.
- Rarity in openedCards/generatedCards is 1-based for frontend tier mapping.
- Use normalized type values such as boss, npc, monster, loot, item, weapon, armor, pet, clue.

SSE payload shape:
{
	rsn: string,
	source: string,
	rewards: {
		packs: string[],
		coins: number
	},
	inventory: {
		cabbageId: number,
		coins: number,
		packs: Array<{ packName: string, quantity: number }>
	}
}

SSE example #1 (single player, no party):
{
	"rsn": "PlayerOne",
	"source": "chambers of xeric",
	"rewards": {
		"packs": ["Chambers of Xeric", "Zeah"],
		"coins": 5000
	},
	"inventory": {
		"cabbageId": 42,
		"coins": 128000,
		"packs": [
			{ "packName": "Chambers of Xeric", "quantity": 3 },
			{ "packName": "Zeah", "quantity": 6 }
		]
	}
}

SSE example #2 (party loot):
- Each online party member receives their own tower-reward event with their own inventory snapshot.
- Do not assume one shared payload for all party members.
*/
