import axios from "axios";
import moment from "moment";
import fs from "fs";
import Table from "tty-table";

var gpudataset = undefined;
var datafile = "data-hiveos.json";

class HiveOS {
	constructor({ apiHost, apiVersion, apiToken, farmId, workerId }) {
		this.host = apiHost;
		this.version = apiVersion;
		this.token = apiToken;
		this.farm = farmId;
		this.worker = workerId;
	}

	getGPUSInfo() {
		var url =
			this.host + "/api/" + this.version + "/farms/" + this.farm + "/workers";

		axios
			.get(url, {
				headers: {
					Authorization: "Bearer " + this.token,
				},
			})
			.then((response) => {
				//console.log("RESPONSE :", response);
				//console.log("RESPONSE");
				gpudataset = response.data;
				this.setData("GPUDATASET", gpudataset);
			})
			.catch((err) => {
				console.log("\x1b[31m", "GET GPUS DETAIL ERROR", "\x1b[0m");
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
			//console.log("ERROR GET DATA:", err);
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
					return console.log("ERROR WRITE DATA:", err);
				}
				//console.log(data);
			});
		} catch (err) {
			console.log("SET-DATA ERROR");
			//console.log("ERROR:", err);
		}
		// require("dotenv").config();
		// process.env[param] = data;
	}

	tableSet() {
		gpudataset = this.getData("GPUDATASET");

		var combined = [];

		try {
			if (gpudataset != undefined || gpudataset != "undefined") {
				//console.log("GPUDATASET:", gpudataset.data);

				var gpudata = gpudataset.data[0];

				//console.log("GPUDATA:", gpudata);

				const gpustats = gpudata.gpu_stats;
				const gpuinfos = gpudata.gpu_info;

				//console.log("STAT:", gpustats);
				//console.log("INFO:", gpuinfo);

				var x = 0;

				gpustats.forEach((stat) => {
					//console.log(stat);
					gpuinfos.forEach((info) => {
						//console.log(info);
						if (info.bus_id == stat.bus_id) {
							//console.log(info.bus_id);
							var temp = Object.assign({}, info, stat);
							//console.log(temp);
							combined.push(temp);
						}
					});

					x++;
				});

				//console.log("GPUS:", combined);

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
						value: "model",
						alias: "Model",
						headerColor: "white",
						color: "white",
						align: "left",
						width: "30%",
					},
					{
						value: "brand",
						alias: "Chip",
						headerColor: "white",
						color: "white",
						align: "left",
						width: "10%",
						formatter: function (value) {
							if (value == "amd") {
								return this.style("AMD", "red", "bold");
							} else if (value == "nvidia") {
								return this.style("NVIDIA", "green", "bold");
							}
						},
					},
					{
						value: "temperature",
						alias: "Temp",
						headerColor: "white",
						color: "white",
						align: "center",
						width: "5%",
						formatter: function (value) {
							if (value > 63) {
								return this.style(value, "red", "bold");
							} else if (value > 55) {
								return this.style(value, "yellow", "bold");
							} else if (value > 50) {
								return this.style(value, "green", "bold");
							} else if (value > 45) {
								return this.style(value, "cyan", "bold");
							} else {
								return this.style(value, "white", "bold");
							}
						},
					},
					{
						value: "stat_temp",
						alias: "-",
						headerColor: "white",
						color: "white",
						align: "center",
						width: "5%",
						formatter: function (value) {
							if (value > 63) {
								return "\x1b[41m	\x1b[0m";
							} else if (value > 55) {
								return "\x1b[43m	\x1b[0m";
							} else if (value > 50) {
								return "\x1b[42m	\x1b[0m";
							} else if (value > 45) {
								return "\x1b[46m	\x1b[0m";
							} else {
								return "\x1b[107m	\x1b[0m";
							}
						},
					},
					{
						value: "fan",
						alias: "Fan Speed",
						headerColor: "white",
						color: "white",
						align: "right",
						width: "10%",
						formatter: function (value) {
							if (value > 65) {
								return this.style(value + " %", "red", "bold");
							} else if (value > 59) {
								return this.style(value + " %", "yellow", "bold");
							} else if (value > 45) {
								return this.style(value + " %", "green", "bold");
							} else if (value > 35) {
								return this.style(value + " %", "cyan", "bold");
							} else if (value > 10) {
								return this.style(value + " %", "white", "bold");
							} else {
								return this.style(value + " %", "white", "bold");
							}
						},
					},
					{
						value: "stat_fan",
						alias: "-",
						headerColor: "white",
						color: "white",
						align: "left",
						width: "5%",
						formatter: function (value) {
							if (value > 65) {
								return "\x1b[41m	\x1b[0m";
							} else if (value > 59) {
								return "\x1b[43m	\x1b[0m";
							} else if (value > 45) {
								return "\x1b[42m	\x1b[0m";
							} else if (value > 35) {
								return "\x1b[46m	\x1b[0m";
							} else if (value > 10) {
								return "\x1b[47m	\x1b[0m";
							} else {
								return "\x1b[40m	\x1b[0m";
							}
						},
					},
					{
						value: "power",
						alias: "Power",
						headerColor: "white",
						color: "white",
						align: "right",
						width: "10%",
						formatter: function (value) {
							var show = value + " Watt";
							return show;
						},
					},
					{
						value: "hash",
						alias: "Hashrate",
						headerColor: "white",
						color: "white",
						align: "right",
						width: "15%",
						formatter: function (value) {
							var hr = parseFloat(value / 1024).toFixed(3);
							return hr + " Mh/s";
						},
					},
				];

				var rows = [];

				for (var x = 0; x < combined.length; x++) {
					var model = [];
					model[x] = combined[x].model;

					var brand = [];
					brand[x] = combined[x].brand;

					var temperature = [];
					temperature[x] = combined[x].temp;

					var fan = [];
					fan[x] = combined[x].fan;

					var power = [];
					power[x] = combined[x].power;

					var hash = [];
					hash[x] = combined[x].hash;

					var temporary = {
						model: model[x],
						brand: brand[x],
						temperature: temperature[x],
						stat_temp: temperature[x],
						fan: fan[x],
						stat_fan: fan[x],
						power: power[x],
						hash: hash[x],
					};

					rows.push(temporary);
				}

				try {
					const t1 = Table(h1, rows, o1).render();
					console.log(t1);
				} catch (err) {
					console.log("ERROR:", err);
				}
			}
		} catch (err) {
			console.log("ERROR:", err);
		}
	}
}

export default HiveOS;
