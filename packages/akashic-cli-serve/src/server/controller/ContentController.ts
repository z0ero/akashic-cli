import * as express from "express";
import { ContentGetApiResponseData } from "../../common/types/ApiResponse";
import * as EngineConfig from "../domain/EngineConfig";
import { serverGlobalConfig } from "../common/ServerGlobalConfig";
import { responseSuccess } from "../common/ApiResponse";
import { NotFoundError, BadRequestError } from "../common/ApiError";
import { loadSandboxConfigJs } from "../domain/SandboxConfigs";

export const createHandlerToGetContents = (targetDirs: string[]): express.RequestHandler => {
	return (req, res, next) => {
		try {
			// サーバ開始後、sandbox.config.js がここで初めて読み込まれる。この処理以前に sandbox.config.js が必要な場合は、その部分で `loadSandboxConfigJs()` を行うこと。
			const contents = targetDirs.map((targetDir, i) => ({
				contentLocatorData: { contentId: "" + i },
				sandboxConfig: loadSandboxConfigJs(i.toString(), targetDir)
			}));
			responseSuccess<ContentGetApiResponseData[]>(res, 200, contents);
		} catch (e) {
			next(e);
		}
	};
};

export const createHandlerToGetContent = (): express.RequestHandler => {
	return (req, res, next) => {
		try {
			if (!req.params.contentId) {
				throw new BadRequestError({ errorMessage: "ContentId is not given" });
			}
			const contentId = req.params.contentId;
			const content = {
				contentLocatorData: { contentId: contentId },
				sandboxConfig: loadSandboxConfigJs(contentId)
			};
			responseSuccess<ContentGetApiResponseData>(res, 200, content);
		} catch (e) {
			next(e);
		}
	};
};

export const createHandlerToGetEngineConfig = (dirPaths: string[], isRaw: boolean): express.RequestHandler => {
	return (req, res, next) => {
		try {
			const contentId = Number(req.params.contentId);
			if (!dirPaths[contentId]) {
				throw new NotFoundError({ errorMessage: `contentId:${contentId} is not found.` });
			}
			const urlInfo = req.header("host").split(":");
			// ポート番号が見つからなかった場合、httpのデフォルト番号の80とする
			if (urlInfo.length === 1) {
				urlInfo.push("80");
			}
			const hostname = serverGlobalConfig.useGivenHostname ? serverGlobalConfig.hostname : urlInfo[0];
			const port = serverGlobalConfig.useGivenPort ? serverGlobalConfig.port : parseInt(urlInfo[1], 10);
			const baseUrl = `http://${hostname}:${port}`;
			const engineConfigJson = EngineConfig.getEngineConfig({ baseUrl, contentId, baseDir: dirPaths[contentId], isRaw });
			// akashic-gameview側でレスポンスがengineConfigJsonの形式なっていることを前提にしているので、resoponseSuccessは使わない
			res.status(200).json(engineConfigJson);
		} catch (e) {
			next(e);
		}
	};
};

