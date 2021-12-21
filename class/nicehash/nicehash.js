import axios from "axios";
import moment from "moment";
import fs from "fs";
import Table from "tty-table";

var btcPrice = 0;
var rigDataSet = undefined;

var datafile = "data-nicehash.json";

class Nicehash {
	constructor({
		apiHost,
		apiVersion,
		apiKey,
		apiSecret,
		organizationId,
		btcAddress,
	}) {
		this.host = apiHost;
		this.version = apiVersion;
		this.key = apiKey;
		this.secret = apiSecret;
		this.orgId = organizationId;
		this.address = btcAddress;
	}

	showTime = function () {
		return console.log(
			"\x1b[32m",
			moment().format("DD MMMM YYYY, HH:mm:ss (x)", "\x1b[0m")
		);
	};

	getRigsDetailExternal() {
		this.showTime();
		var url =
			this.host +
			"/main/api/" +
			this.version +
			"/mining/external/" +
			this.address +
			"/rigs2";

		axios
			.get(url, {
				headers: {},
			})
			.then((response) => {
				//console.log("RESPONSE :", response);
				//console.log("RESPONSE");
				rigDataSet = response.data;
				this.setData("RIGDATASET", rigDataSet);
			})
			.catch((err) => {
				console.log("\x1b[31m", "GET RIGS DETAIL ERROR", "\x1b[0m");
				console.log(err);
			});
	}

	getMarketPrice() {
		var url = this.host + "/exchange/api/" + this.version + "/info/prices";

		btcPrice = this.getData("BTCUSDT");
		//console.log("BTCUSDT FROM DATA:", btcPrice);

		axios
			.get(url, {
				headers: {},
			})
			.then((response) => {
				//console.log(response.data);
				var prices = response.data;
				//console.log("BTCUSDT", prices.BTCUSDT);
				btcPrice = parseFloat(prices.BTCUSDT).toFixed(2);
				console.log("BTCUSDT:", btcPrice);
				this.setData("BTCUSDT", btcPrice);
			})
			.catch((err) => {
				console.log("\x1b[31m", "GET MARKET PRICE ERROR", "\x1b[0m");
				console.log(err);
			});
	}

	getData(key) {
		try {
			let rawdata = fs.readFileSync(datafile);
			let data = JSON.parse(rawdata);
			//console.log(data[key]);
			return data[key];
		} catch (err) {
			console.log("GET-DATA ERROR");
			//console.log("ERROR:", err);
			return null;
		}

		// require("dotenv").config();
		// return process.env[param];
	}

	setData(key, value) {
		//console.log("SETDATA : ", key, value);

		try {
			let raw = fs.readFileSync(datafile);
			var save = JSON.parse(raw);

			save[key] = value;

			//console.log(save);

			fs.writeFile(datafile, JSON.stringify(save), function (err, data) {
				if (err) {
					return console.log("ERROR:", err);
				}
				//console.log(data);
			});
		} catch (err) {
			console.log("SET-DATA ERROR");
			//console.log("ERROR:", err);

			this.repairData();
		}
		// require("dotenv").config();
		// process.env[param] = data;
	}

	repairData() {
		var initData = {
			BTCUSDT: 0,
			RIGDATASET: "undefined",
			GPUDATASET: "undefined",
		};

		fs.writeFile(datafile, JSON.stringify(initData), function (err, data) {
			if (err) {
				return console.log("ERROR REPAIR INITIAL DATA:", datafile, err);
			}
			//console.log(data);
		});
	}

	tableSet() {
		rigDataSet = this.getData("RIGDATASET");

		try {
			if (rigDataSet != undefined || rigDataSet != "undefined") {
				//console.log("RIGDATASET");

				btcPrice = this.getData("BTCUSDT");
				//console.log("BTCUSDT:", btcPrice);

				const o1 = {
					borderStyle: "solid",
					borderColor: "white",
					headerAlign: "center",
					footerAlign: "right",
					align: "left",
					color: "white",
					truncate: "...",
					width: "100%",
				};

				const h1 = [
					{
						value: "algorithm",
						alias: "Algorithm",
						headerColor: "white",
						color: "white",
						align: "left",
						width: "20%",
					},
					{
						value: "profitability",
						alias: "Profitability",
						align: "right",
						width: "30%",
						headerColor: "white",
						color: "green",
					},
					{
						value: "unpaid",
						alias: "Unpaid",
						color: "green",
						align: "right",
						width: "25%",
						headerColor: "white",
						formatter: function (value) {
							return value;
						},
					},
					{
						value: "speed",
						alias: "Speed",
						color: "green",
						align: "right",
						width: "25%",
						headerColor: "white",
						formatter: function (value) {
							return value;
						},
					},
				];

				var data = rigDataSet;

				//console.log(data.miningRigs);
				var dataMiningRigs = data.miningRigs;

				//console.log(dataMiningRigs[0].rigId);
				//var rigId = dataMiningRigs[0].rigId;
				//console.log(rigId);

				var stats = dataMiningRigs[0].stats;
				//console.log(stats);

				var rows = [];
				var totalProfit = 0;
				var totalUnpaid = 0;
				var totalSpeed = 0;

				for (var x = 0; x < stats.length; x++) {
					var algo = [];
					algo[x] = stats[x].algorithm.enumName;

					var profit = [];
					profit[x] = stats[x].profitability.toFixed(8);

					var unpaid = [];
					unpaid[x] = stats[x].unpaidAmount;

					var speed = [];
					speed[x] = stats[x].speedAccepted.toFixed(2);

					var temp = {
						algorithm: algo[x],
						profitability: profit[x],
						unpaid: unpaid[x],
						speed: speed[x],
					};

					totalProfit += parseFloat(profit[x]);
					totalUnpaid += parseFloat(unpaid[x]);
					totalSpeed += parseFloat(speed[x]);

					rows.push(temp);
				}

				const summaryData = [
					{
						total: "BTC",
						profitability: totalProfit.toFixed(8),
						unpaid: totalUnpaid.toFixed(8),
						status: totalProfit.toFixed(8),
					},
					{
						total: "USD",
						profitability: parseFloat(totalProfit * btcPrice).toFixed(2),
						unpaid: parseFloat(totalUnpaid * btcPrice).toFixed(2),
						status: totalProfit.toFixed(8),
					},
				];

				const h2 = [
					{
						value: "total",
						alias: "TOTAL",
						headerColor: "white",
						color: "white",
						align: "right",
						width: "20%",
					},
					{
						value: "profitability",
						alias: "Profitability",
						headerColor: "white",
						color: "white",
						align: "right",
						width: "30%",
						formatter: function (value) {
							if (value > 0.00028) {
								return this.style(value, "cyan", "bold");
							} else if (value > 0.0002) {
								return this.style(value, "green", "bold");
							} else if (value > 0.00018) {
								return this.style(value, "yellow", "bold");
							} else {
								return this.style(value, "red", "bold");
							}
						},
					},
					{
						value: "unpaid",
						alias: "Unpaid",
						headerColor: "white",
						color: "white",
						align: "right",
						width: "25%",
						formatter: function (value) {
							if (value > 0.00004) {
								return this.style(value, "cyan", "bold");
							} else if (value > 0.00003) {
								return this.style(value, "green", "bold");
							} else if (value > 0.00002) {
								return this.style(value, "yellow", "bold");
							} else {
								return this.style(value, "red", "bold");
							}
						},
					},
					{
						value: "status",
						alias: "Status",
						align: "right",
						width: "25%",
						headerColor: "white",
						color: "green",
						formatter: function (value) {
							var colorStat = "\x1b[41m	\x1b[0m";
							if (value > 0.00028) {
								colorStat = "\x1b[46m	\x1b[0m";
								return colorStat;
							} else if (value > 0.0002) {
								colorStat = "\x1b[42m	\x1b[0m";
								return colorStat;
							} else if (value > 0.00018) {
								colorStat = "\x1b[43m	\x1b[0m";
								return colorStat;
							} else {
								colorStat = "\x1b[41m	\x1b[0m";
								return colorStat;
							}
						},
					},
				];

				try {
					const t1 = Table(h1, rows, o1).render();
					console.log(t1);

					const t2 = Table(h2, summaryData, o1).render();
					console.log(t2);
				} catch (err) {
					console.log("ERROR:", err);
				}

				//total(totalProfit.toFixed(8), totalUnpaid.toFixed(8));
			}
		} catch (err) {
			console.log("ERROR:");
			console.log(err);
		}
	}
}

export default Nicehash;
