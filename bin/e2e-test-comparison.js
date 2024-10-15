#!/usr/bin/env node
import { Command } from "commander";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { main } from "../dist/index.js";

const packageJson = JSON.parse(
	await readFile(new URL("../package.json", import.meta.url)),
);

const program = new Command();

program
	.version(packageJson.version)
	.description("Compare and analyze e2e tests")
	.argument("<logfile>", "Path to the log file")
	.option("-o, --output <file>", "Output file name", "report.html")
	.action((logfile, options) => {
		const outputPath = resolve(options.output);
		main(logfile, outputPath)
			.then(() => {})
			.catch(console.error);
	});

program.parse(process.argv);
