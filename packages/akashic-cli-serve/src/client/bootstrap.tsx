import * as React from "react";
import * as ReactDOM from "react-dom";
import { configure as mobxConfigure } from "mobx";
import { Store } from "./store/Store";
import { Operator } from "./operator/Operator";
import { GameViewManager } from "./akashic/GameViewManager";
import { App } from "./view/App";
import { storage } from "./store/storage";

mobxConfigure({ enforceActions: "observed" });

const gameViewManager = new GameViewManager({
	width: 0,
	height: 0
});
const store = new Store();
const operator = new Operator({ store, gameViewManager });

window.addEventListener("load", async () => {
	try {
		await operator.assertInitialized();
		ReactDOM.render(
			<App store={store} operator={operator} gameViewManager={gameViewManager} />,
			document.getElementById("container")
		);
		operator.bootstrap();

		if (!window.opener && store.appOptions.experimentalOpen) {
			for (let i = 0; i < store.appOptions.experimentalOpen; i++) {
				operator.play.openNewClientInstance();
			}
			// 保存数,順序を保つため、指定数 window を開いたら localStorage に対象のデータが残っていてもクリアする。
			localStorage.removeItem(store.contentStore.defaultContent().gameName);
		}
	} catch (e) {
		console.error(e);
	}
});

window.addEventListener("unload", () => {
	if (!(window as any).isChildWin || !store.appOptions.experimentalOpen) return;

	// experimental-open オプションが有効の時、子ウィンドウのみ情報を保存
	const maxSaveCount = store.appOptions.experimentalOpen;
	if (maxSaveCount) {
		const name = store.contentStore.defaultContent().gameName;
		const savedDataStr = localStorage.getItem(name);
		const saveData = savedDataStr ? JSON.parse(savedDataStr) : [];
		if (saveData.length >= maxSaveCount) return;

		const windowData = {
			width: window.innerWidth,
			height: window.innerHeight,
			x: window.screenX,
			y: window.screenY
		};
		saveData.push(windowData);
		localStorage.setItem(name, JSON.stringify(saveData));
	}
});

(window as any).__testbed = { gameViewManager, store, operator };
