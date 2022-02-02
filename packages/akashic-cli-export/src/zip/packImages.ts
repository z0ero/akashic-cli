import * as fs from "fs";
import * as path from "path";
import { writeFile, unlink } from "@akashic/akashic-cli-commons/lib/FileSystem";
import { GameConfiguration, AssetConfiguration } from "@akashic/akashic-cli-commons/lib/GameConfiguration";
import { mkdirpSync } from "@akashic/akashic-cli-commons/lib/Util";
import type { Bin, IRectangle } from "maxrects-packer";
import type { PNG } from "pngjs";
import { makeUniqueAssetPath } from "./GameConfigurationUtil";

interface ImageAssetRectangle extends IRectangle {
	assetIds: string[];
	path: string;
	area: number;
	hash: string;
}

export interface PackImageResultOutput {
	path: string;
	width: number;
	height: number;
	content: Buffer | string;
}

/**
 * パッキング結果。
 */
export interface PackImageResult {
	/**
	 * パッキングによって生成された (保存されるべき) 画像データ。
	 */
	outputs: PackImageResultOutput[];

	/**
	 * パッキングの結果不要になった (削除されるべき) ファイルのパス。
	 */
	discardables: string[];
}

/**
 * コンテンツ内の小さい画像 (PNG ファイル) を、一定サイズに収まる限りでパッキングして一つにまとめる処理の内部実装。
 * コンテンツ自体は変更せず、パッキングした画像データや削除すべきファイルを戻り値で返す。
 * ただし引数 `gamejson` は破壊的に変更する。
 *
 * @param gamejson PNG のパッキングを行うコンテンツの game.json 。破壊的に変更される。
 * @param basepath コンテンツのルートディレクトリのパス。
 */
export async function packSmallImagesImpl(gamejson: GameConfiguration, basepath: string): Promise<PackImageResult> {
	// このサイズ一枚におさまる限りで画像を詰め込む。
	// 値は「余計に読み込んでも許容できる程度のサイズ」であればよく、調整の余地がある。
	const binWidth = 1024;
	const binHeight = 1024;

	// Akashic Engine が slice 指定をサポートしていないバージョンのコンテンツなら何もしない。
	const sandboxRuntimeVer = gamejson.environment["sandbox-runtime"] ?? "1";
	if (/^[12]$/.test(sandboxRuntimeVer)) return { outputs: [], discardables: [] };

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const { MaxRectsPacker } = await import("maxrects-packer");

	const pathToIdsTable = Object.keys(gamejson.assets).reduce((acc, aid) => {
		const decl = gamejson.assets[aid];
		if (isPackableImage(decl, binWidth, binHeight) && !decl.slice) // 既に slice があるものは単純化のため除外
			(acc[decl.path] ?? (acc[decl.path] = [])).push(aid);
		return acc;
	}, Object.create(null) as { [path: string]: string[] });

	let rects = Object.keys(pathToIdsTable).map(p => {
		const assetIds = pathToIdsTable[p]!;
		const decl = gamejson.assets[assetIds[0]!]!;
		return createImageAssetRectangle(decl.width!, decl.height!, assetIds, path.join(basepath, decl.path));
	});

	if (rects.length === 0) return { outputs: [], discardables: [] };

	// サイズ昇順で詰めていって、一定面積 (binWidth * binHeight) を少し超えるであろう画像群までをパッキングする。
	rects.sort((a, b) => a.area - b.area);
	let i = 0;
	for (let areaAcc = 0; i < rects.length && areaAcc < binWidth * binHeight; ++i) {
		areaAcc += rects[i].area;
	}
	rects = rects.slice(0, i);

	const packer = new MaxRectsPacker<ImageAssetRectangle>(binWidth, binHeight, 2, {
		smart: true,
		pot: false,
		square: false,
		allowRotation: false,
		tag: true
	});
	packer.addArray(rects);
	const bins = packer.bins;

	// 一枚に収まらない場合があるので、もっとも画像を詰め込まれた bin を実際のパッキングの対象にする。
	const bin = bins.reduce((a, b) => ((a.rects.length >= b.rects.length) ? a : b), bins[0]!);

	// 一枚以下しか詰め込めなければパッキングする意味がない。(最小でも binWidth, binHeiht より少し小さい画像しかないなど)
	if (bin.rects.length <= 1) return { outputs: [], discardables: [] };

	const packedData = await renderPNG(bin);
	const packedPath = makeUniqueAssetPath(gamejson, "assets/aez_packed_image.png");
	const absPackedPath = path.join(basepath, packedPath);

	const discardables: string[] = [];
	bin.rects.forEach(rect => {
		discardables.push(rect.path);
		rect.assetIds.forEach(aid => {
			const orig = gamejson.assets[aid];
			gamejson.assets[aid] = {
				...orig,
				path: packedPath,
				width: bin.width,
				height: bin.height,
				virtualPath: orig.virtualPath ?? orig.path,
				slice: [rect.x, rect.y, rect.width, rect.height]
			};
		});
	});

	return {
		outputs: [{
			path: absPackedPath,
			width: bin.width,
			height: bin.height,
			content: packedData
		}],
		discardables
	};
}

export async function flushPackResult(packResult: PackImageResult): Promise<void> {
	for (let output of packResult.outputs) {
		mkdirpSync(path.dirname(output.path)); // TODO ほかの利用箇所と合わせて非同期版を作って移行する
		await writeFile(output.path, output.content);
	}
	for (let discardable of packResult.discardables) {
		await unlink(discardable);
	}
}

/**
 * コンテンツ内の小さい画像 (PNG ファイル) を、一定サイズに収まる限りでパッキングして一つにまとめる。
 *
 * よりファイル数を削減しやすいよう小さい画像を優先的にまとめるが、
 * (パッキング処理の) 効率のため、必ずしも完全に画像のサイズ順に対象が決まるわけではない。
 * 不可逆圧縮である JPEG ファイルは対象にしない。
 *
 * @param gamejson PNG のパッキングを行うコンテンツの game.json 。破壊的に変更される。
 * @param basepath コンテンツのルートディレクトリのパス。このパス以下のファイルは破壊的に変更される。
 */
export async function packSmallImages(gamejson: GameConfiguration, basepath: string): Promise<void> {
	return flushPackResult(await packSmallImagesImpl(gamejson, basepath));
}

function createImageAssetRectangle(width: number, height: number, assetIds: string[], path: string): ImageAssetRectangle {
	// x, y は maxrects-packer の型定義に合わせるため必要 (README を見る限り不要だが IRectangle に定義されている) 。
	// hash は不要だが、あると packing 結果が安定する。
	// ref: https://github.com/soimy/maxrects-packer/blob/d107163dc214e1f4f45d1bf4241efe8e5b1b34b3/src/maxrects-packer.ts#L147
	return { assetIds, path, width, height, area: width * height, x: 0, y: 0, hash: path };
}

function isPackableImage(decl: AssetConfiguration, widthThreshold: number, heightThreshold: number): boolean {
	return (
		decl.type === "image" &&
		decl.path.endsWith(".png") &&
		decl.width < widthThreshold &&
		decl.height < heightThreshold
	);
}

async function readPNG(input: string): Promise<PNG> {
	const { PNG } = await import("pngjs");
	return new Promise((resolve, reject) => {
		const stream = fs.createReadStream(input).pipe(new PNG());
		stream.on("parsed", () => void resolve(stream));
		stream.on("error", err => reject(err));
	});
}

async function renderPNG(bin: Bin<ImageAssetRectangle>): Promise<Buffer> {
	const { PNG } = await import("pngjs");
	const png = new PNG({ width: bin.width, height: bin.height });
	const rects = bin.rects;
	for (let i = 0; i < rects.length; i++) {
		const rect = rects[i];
		const src = await readPNG(rect.path);
		src.bitblt(png, 0, 0, src.width, src.height, rect.x, rect.y);
	}
	return PNG.sync.write(png);
}
