import * as express from "express";
import * as socketio from "socket.io";
import {
	createHandlerToCreatePlay,
	createHandlerToGetPlays,
	createHandlerToGetPlay,
	createHandlerToDeletePlay,
	createHandlerToPatchPlay,
	createHandlerToGetPlayTree,
	createHandlerToAddChildPlay,
	createHandlerToRemoveChildPlay
} from "../controller/PlayController";
import { createHandlerToCreatePlayToken } from "../controller/PlayTokenController";
import { createHandlerToBroadcast } from "../controller/BroadcastController";
import {
	createHandlerToCreateRunner,
	createHandlerToDeleteRunner,
	createHandlerToPatchRunner,
	createHandlerToGetRunners
} from "../controller/RunnerController";
import { PlayStore } from "../domain/PlayStore";
import { RunnerStore } from "../domain/RunnerStore";
import { SocketIOAMFlowManager } from "../domain/SocketIOAMFlowManager";
import { createHandlerToGetSandboxConfig } from "../controller/SandboxConfigController";
import {handleToGetStartupOptions} from "../controller/ConfigController";
import { PlayTreeStore } from "../domain/PlayTreeStore";

export interface ApiRouterParameterObject {
	playStore: PlayStore;
	playTreeStore: PlayTreeStore;
	runnerStore: RunnerStore;
	amflowManager: SocketIOAMFlowManager;
	io: socketio.Server;
}

export const createApiRouter = (params: ApiRouterParameterObject): express.Router => {
	const apiRouter = express.Router();

	// TODO 全体的に複数形にして普通のREST APIっぽくする
	apiRouter.post("/plays", createHandlerToCreatePlay(params.playStore, params.playTreeStore));
	apiRouter.get("/plays", createHandlerToGetPlays(params.playStore));
	apiRouter.get("/plays/:playId(\\d+)", createHandlerToGetPlay(params.playStore));
	apiRouter.delete("/plays/:playId(\\d+)", createHandlerToDeletePlay(params.playStore, params.playTreeStore));
	apiRouter.patch("/plays/:playId(\\d+)", createHandlerToPatchPlay(params.playStore));
	apiRouter.post("/plays/:playId(\\d+)/children", createHandlerToAddChildPlay(params.playStore, params.playTreeStore));
	apiRouter.get("/plays/children", createHandlerToGetPlayTree(params.playTreeStore));
	apiRouter.delete("/plays/:playId(\\d+)/children/:childId(\\d+)", createHandlerToRemoveChildPlay(params.playStore, params.playTreeStore));

	apiRouter.post("/plays/:playId(\\d+)/token", createHandlerToCreatePlayToken(params.amflowManager));
	apiRouter.post("/plays/:playId(\\d+)/broadcast", createHandlerToBroadcast(params.io));

	apiRouter.get("/runners", createHandlerToGetRunners(params.runnerStore));
	apiRouter.post("/runners", createHandlerToCreateRunner(params.playStore, params.runnerStore));
	apiRouter.delete("/runners/:runnerId", createHandlerToDeleteRunner(params.runnerStore));
	apiRouter.patch("/runners/:runnerId", createHandlerToPatchRunner(params.runnerStore));

	apiRouter.get("/options", handleToGetStartupOptions);

	return apiRouter;
};
