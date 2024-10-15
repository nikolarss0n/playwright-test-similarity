import type { Test } from "../types";
import type { OpenAIService, EvaluationReport } from "./openAIService";
import type { Logger } from "../utils/logger";
import type { TestStepComparisonService } from "./testStepComparisonService";

export class TestComparisonService {
	private readonly openAIService: OpenAIService;
	private readonly testStepComparisonService: TestStepComparisonService;
	private readonly logger: Logger;

	constructor(openAIService: OpenAIService, testStepComparisonService: TestStepComparisonService, logger: Logger) {
		this.openAIService = openAIService;
		this.testStepComparisonService = testStepComparisonService;
		this.logger = logger;
	}

	public async compareTests(tests: Test[]): Promise<EvaluationReport[]> {
		const results: EvaluationReport[] = [];

		for (let i = 0; i < tests.length; i++) {
			for (let j = i + 1; j < tests.length; j++) {
				const test1 = tests[i];
				const test2 = tests[j];

				const { similarity, matchedSteps } = this.compareTestSteps(
					test1.testSteps,
					test2.testSteps
				);

				this.logger.info(
					`Similarity between "${test1.testId}" and "${test2.testId}": ${similarity.toFixed(2)}%`
				);

				const report = await this.openAIService.evaluateAndReport(
					[test1.testId, test1.testSteps],
					[test2.testId, test2.testSteps],
					similarity,
					matchedSteps
				);

				results.push(report);
			}
		}

		return results;
	}

	private compareTestSteps(
		steps1: string[],
		steps2: string[]
	): { similarity: number; matchedSteps: [number, number][] } {
		const matchedSteps: [number, number][] = [];
		let totalSimilarity = 0;

		for (let i = 0; i < steps1.length; i++) {
			let maxSimilarity = 0;
			let bestMatch = -1;

			for (let j = 0; j < steps2.length; j++) {
				const similarity = this.testStepComparisonService.compareSteps(steps1[i], steps2[j]);
				if (similarity > maxSimilarity) {
					maxSimilarity = similarity;
					bestMatch = j;
				}
			}

			if (bestMatch !== -1) {
				matchedSteps.push([i, bestMatch]);
				totalSimilarity += maxSimilarity;
			}
		}

		const averageSimilarity = (totalSimilarity / Math.max(steps1.length, steps2.length)) * 100;

		return {
			similarity: Number(averageSimilarity.toFixed(2)),
			matchedSteps,
		};
	}
}