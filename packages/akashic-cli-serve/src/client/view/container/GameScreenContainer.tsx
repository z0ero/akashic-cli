import { observer } from "mobx-react";
import * as React from "react";
import type { SandboxConfig } from "../../../common/types/SandboxConfig";
import type { GameViewManager } from "../../akashic/GameViewManager";
import type { Operator } from "../../operator/Operator";
import type { DevtoolUiStore } from "../../store/DevtoolUiStore";
import type { LocalInstanceEntity } from "../../store/LocalInstanceEntity";
import type { ProfilerStore } from "../../store/ProfilerStore";
import type { ToolBarUiStore } from "../../store/ToolBarUiStore";
import type { PlayerInfoResolverDialogProps } from "../molecule/PlayerInfoResolverDialog";
import type { ProfilerCanvasProps } from "../molecule/ProfilerCanvas";
import { GameScreen } from "../organism/GameScreen";

export interface GameScreenContainerProps {
	sandboxConfig: SandboxConfig;
	toolBarUiStore: ToolBarUiStore;
	devtoolUiStore: DevtoolUiStore;
	profilerStore: ProfilerStore;
	localInstance: LocalInstanceEntity;
	gameViewManager: GameViewManager;
	operator: Operator;
}

@observer
export class GameScreenContainer extends React.Component<GameScreenContainerProps, {}> {
	render(): React.ReactNode {
		const gameViewSize = this.props.localInstance.gameViewSize;
		return <GameScreen
			backgroundImage={this.props.sandboxConfig.backgroundImage}
			showsGrid={this.props.toolBarUiStore.showsGrid}
			showsBackgroundImage={this.props.toolBarUiStore.showsBackgroundImage}
			showsDesignGuideline={this.props.toolBarUiStore.showsDesignGuideline}
			gameWidth={gameViewSize.width}
			gameHeight={gameViewSize.height}
			screenElement={this.props.gameViewManager.getRootElement()}
			playerInfoResolverDialogProps={this._makePlayerInfoResolverDialogProps()}
			profilerCanvasProps={this._makeProfilerCanvasProps()}
			shouldStopPropagationFunc={this._handleShouldStopPropgation}
			onMouseMoveCapture={this._handleMouseMoveCapture}
			onClickCapture={this._handleClickCapture}
		/>;
	}

	private _handleShouldStopPropgation = (): boolean => {
		return this.props.devtoolUiStore.isSelectingEntity;
	};

	private _handleMouseMoveCapture = (p: { x: number; y: number}): void => {
		if (!this.props.devtoolUiStore.isSelectingEntity)
			return;
		this.props.operator.devtool.selectEntityByPoint(p.x, p.y);
	};

	private _handleClickCapture = (p: { x: number; y: number}): void => {
		if (!this.props.devtoolUiStore.isSelectingEntity)
			return;
		this.props.operator.devtool.finishEntitySelection(p.x, p.y);
	};

	private _makePlayerInfoResolverDialogProps = (): PlayerInfoResolverDialogProps | undefined => {
		const coeLimitedPlugin = this.props.localInstance.coeLimitedPlugin;
		return coeLimitedPlugin.isDisplayingResolver ? {
			remainingSeconds: coeLimitedPlugin.remainingSeconds,
			name: coeLimitedPlugin.name,
			guestName: coeLimitedPlugin.guestName,
			onClick: coeLimitedPlugin.sendName
		} : undefined;
	};

	private _makeProfilerCanvasProps = (): ProfilerCanvasProps | undefined => {
		return this.props.toolBarUiStore.showsProfiler ? {
			profilerDataArray: this.props.profilerStore.profilerDataArray,
			profilerStyleSetting: this.props.profilerStore.profilerStyleSetting,
			profilerWidth: this.props.profilerStore.profilerWidth,
			profilerHeight: this.props.profilerStore.profilerHeight
		} : undefined;
	};
}
