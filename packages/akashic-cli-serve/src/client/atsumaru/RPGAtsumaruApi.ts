import { Trigger } from "@akashic/trigger";
import type { Observer } from "rxjs";
import type { ScoreboardData } from "./ScoreboardData";
import type { ScreenshotModalResults } from "./ScreenshotModalResults";
import type { SelfInformation} from "./SelfInformation";
import { dummySelfInfomation } from "./SelfInformation";
import type { TweetSettings } from "./TweetSettings";
import type { UserIdName} from "./UserIdName";
import { dummyUserIdName } from "./UserIdName";
import type { UserInformation} from "./UserInformation";
import { dummyUserInformation } from "./UserInformation";

interface SubscriptionMock {
	unsubscribe(): void;
	add(teardown: any): any;
	remove(subscription: any): void;
}

export interface RPGAtsumaruApiLike {
	comment: {
		verbose: boolean;
		changeScene: (sceneName: string) => void;
		resetAndChangeScene: (sceneName: string) => void;
		pushContextFactor: (factor: string) => void;
		pushMinorContext: () => void;
		setContext: (context: string) => void;
	};
	storage: {
		getItems: () => Promise<{key: string; value: string}[]>;
		setItems: (items: {key: string; value: string}[]) => Promise<void>;
		removeItem: (key: string) => Promise<void>;
	};
	volume: {
		getCurrentValue: () => number;
		changed: {
			// マスターボリュームの情報はserve側で持っていてコンテンツ側で監視すべきものでないので、Subscriptionのmockを返している
			subscribe: (observer: Observer<number> | ((volume: number) => void)) => SubscriptionMock;
		};
	};
	popups: {
		openLink: (url: string, comment?: string) => Promise<void>;
		displayCreatorInformationModal: (niconicoUserId?: number | null) => Promise<void>;
	};
	query: {[key: string]: string};
	user: {
		getSelfInformation: () => Promise<SelfInformation>;
		getUserInformation: (userId: number) => Promise<UserInformation>;
		getRecentUsers: () => Promise<UserIdName[]>;
		getActiveUserCount: (minutes: number) => Promise<number>;
	};
	scoreboards: {
		setRecord: (boardId: number, score: number) => Promise<void>;
		display: (boardId: number) => Promise<void>;
		getRecords: (boardId: number) => Promise<ScoreboardData>;
	};
	screenshot: {
		displayModal: () => Promise<ScreenshotModalResults>;
		setScreenshotHandler: (handler: () => Promise<string>) => void;
		setTweetMessage: (tweetSettings: TweetSettings | null) => void;
	};
}

export interface RPGAtsumaruAPIParameterObject {
	getVolumeCallback: () => number;
}

export class RPGAtsumaruApi implements RPGAtsumaruApiLike {
	comment = {
		verbose: false,
		changeScene: (sceneName: string): void => {
			console.log(`called window.RPGAtsumaru.comment.changeScene (sceneName: ${sceneName})`);
		},
		resetAndChangeScene: (sceneName: string): void => {
			console.log(`called window.RPGAtsumaru.comment.resetAndChangeScene (sceneName: ${sceneName})`);
		},
		pushContextFactor: (factor: string): void => {
			console.log(`called window.RPGAtsumaru.comment.pushContextFactor (factor: ${factor})`);
		},
		pushMinorContext: (): void => {
			console.log("called window.RPGAtsumaru.comment.pushMinorContext");
		},
		setContext: (context: string): void => {
			console.log(`called window.RPGAtsumaru.comment.setContext (context: ${context})`);
		}
	};

	storage = {
		getItems: (): Promise<{ key: string; value: string }[]> => {
			// コンパイルを通すためにダミーのセーブデータを用意
			const items = [{key: "data1", value: "hoge"}, {key: "data2", value: "fuga"}];
			console.log(`called window.RPGAtsumaru.storage.getItems. it will return ${items}.`);
			return Promise.resolve().then(() => items);
		},
		setItems: (items: { key: string; value: string }[]): Promise<void> => {
			console.log(`called window.RPGAtsumaru.storage.setItems (items: ${items})`);
			return Promise.resolve();
		},
		removeItem: (key: string): Promise<void> => {
			console.log(`called window.RPGAtsumaru.storage.removeItem (key: ${key})`);
			return Promise.resolve();
		}
	};

	volume = {
		getCurrentValue: (): number => {
			console.log("called window.RPGAtsumaru.volume.getCurrentValue");
			return this._param.getVolumeCallback();
		},
		changed: {
			subscribe: (observer: Observer<number> | ((volume: number) => void)) => {
				console.log("called window.RPGAtsumaru.volume.changed.subscribe");
				const func = (vol: number): void => {
					if (observer.hasOwnProperty("next")) {
						(observer as Observer<number>).next(vol);
					} else {
						(observer as Function)(vol);
					}
				};
				this.volumeTrigger.add(func);
				return {
					unsubscribe: (): void => {
						this.volumeTrigger.remove(func);
					},
					add: (_teardown: any): void => {}, // eslint-disable-line @typescript-eslint/no-empty-function
					remove: (_subscription: any): void => {} // eslint-disable-line @typescript-eslint/no-empty-function
				};
			}
		}
	};

	popups = {
		openLink: (url: string, comment?: string): Promise<void> => {
			console.log(`called window.RPGAtsumaru.popups.openLink (url: ${url}, comment: ${comment})`);
			return Promise.resolve();
		},
		displayCreatorInformationModal: (niconicoUserId?: number | null): Promise<void> => {
			console.log(`called window.RPGAtsumaru.popups.displayCreatorInformationModal (niconicoUserId: ${niconicoUserId})`);
			return Promise.resolve();
		}
	};

	// コンパイルを通すためにダミーのデータを返す
	query = {
		"param1": "hoge",
		"param2": "fuga",
		"param3": "hogehoge"
	};

	user = {
		getSelfInformation: (): Promise<SelfInformation> => {
			console.log(`called window.RPGAtsumaru.user.getSelfInformation. it will return ${JSON.stringify(dummySelfInfomation)}.`);
			return Promise.resolve().then(() => dummySelfInfomation);
		},
		getUserInformation: (userId: number): Promise<UserInformation> => {
			const info = {
				...dummyUserInformation,
				id: userId
			};
			console.log(`called window.RPGAtsumaru.user.getUserInformation (userId: ${userId}). it will return ${JSON.stringify(info)}.`);
			return Promise.resolve().then(() => info);
		},
		getRecentUsers: (): Promise<UserIdName[]> => {
			console.log(`called window.RPGAtsumaru.user.getRecentUsers. it will return ${JSON.stringify([dummyUserIdName])}.`);
			return Promise.resolve().then(() => [dummyUserIdName]);
		},
		// ダミー情報を返すため引数の値は利用しないので、アンダースコアを付与する
		getActiveUserCount: (_minutes: number): Promise<number> => {
			const dummyCount = 1; // ダミーの値として固定値を返す
			console.log(`called window.RPGAtsumaru.user.getActiveUserCount. it will return ${dummyCount}.`);
			return Promise.resolve().then(() => dummyCount);
		}
	};

	scoreboards = {
		setRecord: (boardId: number, score: number): Promise<void> => {
			console.log(`called window.RPGAtsumaru.scoreboards.setRecord (boardId: ${boardId}, score: ${score})`);
			return Promise.resolve();
		},
		display: (boardId: number): Promise<void> => {
			console.log(`called window.RPGAtsumaru.scoreboards.display (boardId: ${boardId})`);
			return Promise.resolve();
		},
		getRecords: (boardId: number): Promise<ScoreboardData> => {
			const dummyScoreboardData = {
				"myRecord": {
					"isNewRecord": false,
					"rank": 5,
					"score": 0
				},
				"ranking": [
					{
						"rank": 1,
						"score": 1000,
						"userName": "atsumalion",
						"userId": 123456
					},
					{
						"rank": 2,
						"score": 500,
						"userName": "atsumatiger",
						"userId": 123457
					},
					{
						"rank": 3,
						"score": 100,
						"userName": "atsumagorilla",
						"userId": 123458
					}
				],
				"myBestRecord": {
					"rank": 1,
					"score": 1000,
					"userName": "atsumalion",
					"userId": 123456
				},
				"boardId": boardId,
				"boardName": "スコアボードの名前"
			};
			console.log(
				`called window.RPGAtsumaru.scoreboards.getRecords (boardId: ${boardId}).`
				+ ` it will return ${JSON.stringify(dummyScoreboardData)}.`
			);
			return Promise.resolve().then(() => dummyScoreboardData);
		}
	};

	screenshot = {
		displayModal: (): Promise<ScreenshotModalResults> => {
			const dummyData = { tweeted: true };
			console.log(`called window.RPGAtsumaru.screenshot.displayModal. it will return ${JSON.stringify(dummyData)}.`);
			return Promise.resolve().then(() => dummyData);
		},
		// TODO: API本実装時に引数に付与したアンダースコアを除去する
		setScreenshotHandler: (_handler: () => Promise<string>): void => {
			console.log("called window.RPGAtsumaru.screenshot.setScreenshotHandler");
		},
		setTweetMessage: (tweetSettings: TweetSettings | null): void => {
			console.log(`called window.RPGAtsumaru.screenshot.setTweetMessage (tweetSettings: ${JSON.stringify(tweetSettings)})`);
		}
	};

	// アツマールAPIでexperimentalはdeprecated扱いになったが、ゲームアツマールでまだ対応しているのでserveでも利用できるようにしておく
	experimental = {
		popups: {
			displayCreatorInformationModal: this.popups.displayCreatorInformationModal
		},
		query: this.query,
		user: this.user,
		scoreboards: this.scoreboards,
		screenshot: this.screenshot
	};

	volumeTrigger: Trigger<number>;
	private _param: RPGAtsumaruAPIParameterObject;

	constructor(param: RPGAtsumaruAPIParameterObject) {
		this._param = param;
		this.volumeTrigger = new Trigger<number>();
	}
}
