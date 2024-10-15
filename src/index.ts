import { parseTraceFile } from "./parsers/traceParser.js";
import { TestComparisonService } from "./services/testComparisonService.js";
import { OpenAIService } from "./services/openAIService.js";
import { TestStepComparisonService } from "./services/testStepComparisonService.js";
import { generateHtmlReport } from "./reporters/htmlReporter.js";
import { Logger } from "./utils/logger.js";
import { config } from "./config.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function main(tracePath: string, outputPath = "report.html") {
	const logger = new Logger();
	try {
		const tests = parseTraceFile(tracePath);
		logger.info(`Parsed ${tests.length} tests from the trace file(s).`);

		const openAIService = new OpenAIService(config, logger);
		const aiTextComparisonService = new TestStepComparisonService(logger);
		await aiTextComparisonService.initialize();

		const comparisonService = new TestComparisonService(openAIService, aiTextComparisonService, logger);
		const results = await comparisonService.compareTests(tests);
		logger.info(`Completed ${results.length} test comparisons.`);

		const htmlReport = generateHtmlReport(results);
		// Ensure the output directory exists
		const outputDir = path.dirname(outputPath);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}
		// Write the report
		const absoluteOutputPath = path.resolve(outputPath);
		fs.writeFileSync(absoluteOutputPath, htmlReport);
		console.log(`HTML report generated successfully at: ${absoluteOutputPath}`);
		logger.info(`HTML report generated successfully at: ${absoluteOutputPath}`);
	} catch (error) {
		logger.error(`An error occurred: ${(error as Error).message}`);
		throw error;
	}
}

// This part is only for direct execution of this file
if (import.meta.url === `file://${__filename}`) {
	const [, , tracePath, outputFile] = process.argv;
	if (!tracePath) {
		console.error("Please provide a path to the trace file or directory.");
		process.exit(1);
	}
	main(tracePath, outputFile).catch((error) => {
		console.error(error);
		process.exit(1);
	});
}