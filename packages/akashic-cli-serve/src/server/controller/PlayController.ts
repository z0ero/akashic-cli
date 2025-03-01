import type * as express from "express";
import type {
	PlayApiResponseData,
	PlayDeleteApiResponseData,
	PlayPatchApiResponseData
} from "../../common/types/ApiResponse";
import { BadRequestError, NotFoundError } from "../common/ApiError";
import { responseSuccess } from "../common/ApiResponse";
import { ServerContentLocator } from "../common/ServerContentLocator";
import type { PlayStore } from "../domain/PlayStore";

export const createHandlerToCreatePlay = (playStore: PlayStore): express.RequestHandler => {
	return async (req, res, next) => {
		try {
			if (!req.body.contentLocator || (!req.body.contentLocator.contentId && !req.body.contentLocator.path)) {
				throw new BadRequestError({ errorMessage: "handleCreatePlay(): contentLocator is not given or invalid" });
			}
			const audioState = req.body.audioState ?? { muteType: "none", soloPlayerId: null };
			const contentLocator = new ServerContentLocator(req.body.contentLocator);
			const playId = await playStore.createPlay(contentLocator, audioState, null);
			responseSuccess<PlayApiResponseData>(res, 200, playStore.getPlayInfo(playId));
		} catch (e) {
			next(e);
		}
	};
};

export const createHandlerToGetPlay = (playStore: PlayStore): express.RequestHandler => {
	return (req, res, next) => {
		try {
			const playId = req.params.playId;
			const playInfo = playStore.getPlayInfo(playId);
			if (!playInfo) {
				throw new NotFoundError({
					errorMessage: "Play is not found"
				});
			}
			responseSuccess<PlayApiResponseData>(res, 200, playInfo);
		} catch (e) {
			next(e);
		}
	};
};

export const createHandlerToGetPlays = (playStore: PlayStore): express.RequestHandler => {
	return (_req, res, next) => {
		try {
			const plays = playStore.getPlays();
			responseSuccess<PlayApiResponseData[]>(
				res,
				200,
				plays.map(play => playStore.getPlayInfo(play.playId))
			);
		} catch (e) {
			next(e);
		}
	};
};

export const createHandlerToDeletePlay = (playStore: PlayStore): express.RequestHandler => {
	return async (req: express.Request, res: express.Response, next: Function) => {
		try {
			if (!req.params.playId) {
				throw new BadRequestError({ errorMessage: "PlayId is not given" });
			}
			const playId = req.params.playId;
			await playStore.stopPlay(playId);
			responseSuccess<PlayDeleteApiResponseData>(res, 200, { playId });
		} catch (e) {
			next(e);
		}
	};
};

export const createHandlerToPausePlayDuration = (playStore: PlayStore): express.RequestHandler => {
	return async (req: express.Request, res: express.Response, next: Function) => {
		try {
			if (!req.params.playId) {
				throw new BadRequestError({ errorMessage: "PlayId is not given" });
			}
			const playId = req.params.playId;
			await playStore.pausePlayDuration(playId);
			responseSuccess<PlayDeleteApiResponseData>(res, 200, { playId });
		} catch (e) {
			next(e);
		}
	};
};

export const createHandlerToResumePlayDuration = (playStore: PlayStore): express.RequestHandler => {
	return async (req: express.Request, res: express.Response, next: Function) => {
		try {
			if (!req.params.playId) {
				throw new BadRequestError({ errorMessage: "PlayId is not given" });
			}
			const playId = req.params.playId;
			await playStore.resumePlayDuration(playId);
			responseSuccess<PlayDeleteApiResponseData>(res, 200, { playId });
		} catch (e) {
			next(e);
		}
	};
};

export const createHandlerToPatchPlay = (playStore: PlayStore): express.RequestHandler => {
	return async (req, res, next) => {
		try {
			const playId = req.params.playId;
			if (!playId) {
				throw new BadRequestError({ errorMessage: "PlayId is not given" });
			}
			const status = req.body.status;
			if (status != null) {
				if (status !== "running" && status !== "paused") {
					throw new BadRequestError({ errorMessage: "Invalid status: " + status });
				}
				if (status === "paused") {
					await playStore.pausePlayDuration(playId);
				} else {
					await playStore.resumePlayDuration(playId);
				}

				if (req.body.step) await playStore.stepPlayDuration(playId);
			}
			responseSuccess<PlayPatchApiResponseData>(res, 200, { playId, status });
		} catch (e) {
			next(e);
		}
	};
};

export const createHandlerToGetPlaylog = (playStore: PlayStore): express.RequestHandler => {
	return (req, res, next) => {
		try {
			if (!req.params.playId) {
				throw new BadRequestError({ errorMessage: "PlayId is not given" });
			}
			const playId = req.params.playId;
			const amflow = playStore.createAMFlow(playId);
			if (!amflow) {
				throw new NotFoundError({ errorMessage: `PlayLog is not found. playId:${playId}` });
			}
			const dumpData = amflow.dump();
			const dumpJsonStr = JSON.stringify(dumpData);
			const fileName = `playlog_${playId}_${Date.now()}.json`;

			res.setHeader("Content-disposition", "attachment; filename=" + fileName);
			res.setHeader("Content-type", "application/x-download");
			res.send(dumpJsonStr);
		} catch (e) {
			next(e);
		}
	};
};

export const createHandlerToPatchAudioState = (playStore: PlayStore): express.RequestHandler => {
	return async (req, res, next) => {
		try {
			const playId = req.params.playId;
			if (!playId) {
				throw new BadRequestError({ errorMessage: "PlayId is not given" });
			}
			const { audioState } = req.body;
			if (!audioState) {
				throw new BadRequestError({ errorMessage: "audioState is not given" });
			}
			playStore.setPlayAudioState(playId, audioState);
			responseSuccess<void>(res, 200, null);
		} catch (e) {
			next(e);
		}
	};
};

