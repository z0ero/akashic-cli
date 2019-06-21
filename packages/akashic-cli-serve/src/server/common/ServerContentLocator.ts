import { ContentLocator } from "../../common/ContentLocator";
import { serverGlobalConfig } from "./ServerGlobalConfig";

export class ServerContentLocator extends ContentLocator {
	asAbsoluteUrl(): string {
		const host = this.host || `http://${serverGlobalConfig.hostname}:${serverGlobalConfig.port}`;
		return host + this.asRootRelativeUrl();
	}
}
