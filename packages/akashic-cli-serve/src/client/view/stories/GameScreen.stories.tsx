import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { GameScreen } from "../organism/GameScreen";

function createDummyDiv(width: number, height: number): HTMLElement {
	const e = document.createElement("div");
	e.setAttribute("style", `width: ${width}px; height: ${height}px;`);
	return e;
}

storiesOf("o-GameScreen", module)
	.add("basic", () => (
		<GameScreen
			showsBackgroundImage={false}
			showsGrid={false}
			showsDesignGuideline={false}
			backgroundImage={null}
			gameWidth={320}
			gameHeight={240}
			screenElement={createDummyDiv(320, 240)}
			playerInfoResolverDialogProps={undefined}
			profilerCanvasProps={undefined}
			shouldStopPropagationFunc={() => {
				action("shouldStopPropagation");
				return false;
			}}
			onMouseMoveCapture={action("onMouseMoveCapture")}
			onClickCapture={action("onClickCapture")}
		/>
	))
	.add("background", () => (
		<GameScreen
			showsBackgroundImage={true}
			showsGrid={false}
			showsDesignGuideline={false}
			backgroundImage={null}
			gameWidth={320}
			gameHeight={240}
			screenElement={createDummyDiv(320, 240)}
			playerInfoResolverDialogProps={undefined}
			profilerCanvasProps={undefined}
			shouldStopPropagationFunc={() => {
				action("shouldStopPropagation");
				return false;
			}}
			onMouseMoveCapture={action("onMouseMoveCapture")}
			onClickCapture={action("onClickCapture")}
		/>
	))
	.add("background&grid", () => (
		<GameScreen
			showsBackgroundImage={true}
			showsGrid={true}
			showsDesignGuideline={false}
			backgroundImage={null}
			gameWidth={320}
			gameHeight={240}
			screenElement={createDummyDiv(320, 240)}
			playerInfoResolverDialogProps={undefined}
			profilerCanvasProps={undefined}
			shouldStopPropagationFunc={() => {
				action("shouldStopPropagation");
				return false;
			}}
			onMouseMoveCapture={action("onMouseMoveCapture")}
			onClickCapture={action("onClickCapture")}
		/>
	))
	.add("designGuideline", () => (
		<GameScreen
			showsBackgroundImage={false}
			showsGrid={false}
			showsDesignGuideline={true}
			backgroundImage={null}
			gameWidth={320}
			gameHeight={240}
			screenElement={createDummyDiv(320, 240)}
			playerInfoResolverDialogProps={undefined}
			profilerCanvasProps={undefined}
			shouldStopPropagationFunc={() => {
				action("shouldStopPropagation");
				return false;
			}}
			onMouseMoveCapture={action("onMouseMoveCapture")}
			onClickCapture={action("onClickCapture")}
		/>
	))
	.add("confirmDialog", () => (
		<GameScreen
			showsBackgroundImage={false}
			showsGrid={false}
			showsDesignGuideline={false}
			backgroundImage={null}
			gameWidth={320}
			gameHeight={240}
			screenElement={createDummyDiv(320, 240)}
			playerInfoResolverDialogProps={{
				remainingSeconds: 15,
				name: "プレイヤー名X",
				guestName: "ゲスト名Y",
				onClick: action("onClick")
			}}
			profilerCanvasProps={undefined}
			shouldStopPropagationFunc={() => {
				action("shouldStopPropagation");
				return false;
			}}
			onMouseMoveCapture={action("onMouseMoveCapture")}
			onClickCapture={action("onClickCapture")}
		/>
	))
	.add("profiler", () => (
		<GameScreen
			showsBackgroundImage={false}
			showsGrid={false}
			showsDesignGuideline={false}
			backgroundImage={null}
			gameWidth={320}
			gameHeight={240}
			screenElement={createDummyDiv(320, 240)}
			playerInfoResolverDialogProps={undefined}
			profilerCanvasProps={{
				profilerDataArray: [
					{
						name: "fps",
						data: [30, 31, 28, 32, 35, 30, 31, 28, 32, 35],
						max: 35,
						min: 28,
						fixed: 2
					},
					{
						name: "skipped",
						data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						max: 0,
						min: 0,
						fixed: 1
					},
					{
						name: "interval",
						data: [36, 31, 32, 32, 34, 36, 33, 33, 30, 30],
						max: 36,
						min: 30,
						fixed: 1
					},
					{
						name: "frame",
						data: [4, 1, 0, 0, 0, 1, 2, 0, 0, 0],
						max: 4,
						min: 0,
						fixed: 1
					},
					{
						name: "rendering",
						data: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
						max: 1,
						min: 0,
						fixed: 1
					}
				],
				profilerStyleSetting: {
					margin: 5,
					padding: 5,
					align: "horizontal",
					bgColor: "gray",
					fontColor: "white",
					fontSize: 17,
					fontMaxColor: "deeppink",
					fontMinColor: "dodgerblue",
					fontMinMaxColor: "black",
					graphColor: "lavender",
					graphWidth: 3,
					graphWidthMargin: 1,
					graphPadding: 5
				},
				profilerWidth: 150,
				profilerHeight: 61
			}}
			shouldStopPropagationFunc={() => {
				action("shouldStopPropagation");
				return false;
			}}
			onMouseMoveCapture={action("onMouseMoveCapture")}
			onClickCapture={action("onClickCapture")}
		/>
	));
