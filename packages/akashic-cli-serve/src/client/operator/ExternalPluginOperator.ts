import type { GameViewManager } from "../akashic/GameViewManager";

export class ExternalPluginOperator {
	constructor(gameViewManager: GameViewManager) {
		gameViewManager.registerExternalPlugin({
			name: "coe",
			onload: (_game: agv.GameLike, _dataBus: any, gameContent: agv.GameContent) => {
				gameContent.onExternalPluginRegister.fire("coe");
			}
		});
		gameViewManager.registerExternalPlugin({
			name: "nico",
			onload: (_game: agv.GameLike, _dataBus: any, gameContent: agv.GameContent) => {
				gameContent.onExternalPluginRegister.fire("nico");
			}
		});
		gameViewManager.registerExternalPlugin({
			name: "send",
			onload: (_game: agv.GameLike, _dataBus: any, gameContent: agv.GameContent) => {
				gameContent.onExternalPluginRegister.fire("send");
			}
		});
		gameViewManager.registerExternalPlugin({
			name: "coeLimited",
			onload: (_game: agv.GameLike, _dataBus: any, gameContent: agv.GameContent) => {
				gameContent.onExternalPluginRegister.fire("coeLimited");
			}
		});
	}
}
