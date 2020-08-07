import { ServiceType } from "../ServiceType";

export interface CliConfigServe {
	hostname?: string;
	port?: number;
	autoStart?: boolean;
	verbose?: boolean;
	targetService?: ServiceType;
	debugPlaylog?: string;
	debugUntrusted?: boolean;
	debugProxyAudio?: boolean;
	allowExternal?: boolean;
	targetDirs?: string[];
}
