import config from "./config";
import HiveOS from "./class/hiveos/hiveos";
import Nicehash from "./class/nicehash/nicehash";

const hiveos = new HiveOS(config.hiveos);
const nicehash = new Nicehash(config.nicehash);

function doStuff() {
	console.clear();

	nicehash.getRigsDetailExternal();
	nicehash.getMarketPrice();
	nicehash.tableSet();

	hiveos.getGPUSInfo();
	hiveos.tableSet();
}

function run() {
	doStuff();
	setInterval(doStuff, 27666);
}

run();
