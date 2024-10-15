import type { Logger } from "../utils/logger";

interface ParsedStep {
	action: string;
	selector: string;
	value?: string;
	assertion?: string;
	count?: number;
}

export class TestStepComparisonService {
	private readonly logger: Logger;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	initialize() {
		this.logger.info('Test Step Comparison service initialized');
	}

	compareSteps(step1: string, step2: string): number {
		const parsedStep1 = this.parseStep(step1);
		const parsedStep2 = this.parseStep(step2);

		return this.calculateSimilarity(parsedStep1, parsedStep2);
	}

	private parseStep(step: string): ParsedStep {
		const [actionPart, ...rest] = step.split(' | ');
		const [action, selector] = actionPart.split(': ');
		const result: ParsedStep = { action, selector };

		rest.forEach(part => {
			const [key, value] = part.split(': ');
			if (key === 'value' || key === 'assertion') {
				result[key] = value;
			} else if (key === 'count') {
				result[key] = parseInt(value, 10);
			}
		});

		return result;
	}

	private calculateSimilarity(step1: ParsedStep, step2: ParsedStep): number {
		let similarity = 0;

		// Compare action (highest weight)
		if (step1.action === step2.action) similarity += 0.4;

		// Compare selector (high weight)
		if (step1.selector === step2.selector) similarity += 0.3;
		else if (this.isSimilarSelector(step1.selector, step2.selector)) similarity += 0.2;

		// Compare value (lower weight, allow for small differences)
		if (step1.value && step2.value) {
			if (step1.value === step2.value) similarity += 0.15;
			else if (this.isValueSimilar(step1.value, step2.value)) similarity += 0.1;
		}

		// Compare assertion (if present)
		if (step1.assertion && step2.assertion && step1.assertion === step2.assertion) similarity += 0.15;

		// Compare count (if present)
		if (step1.count !== undefined && step2.count !== undefined) {
			if (step1.count === step2.count) similarity += 0.15;
			else if (Math.abs(step1.count - step2.count) <= 1) similarity += 0.05;
		}

		return similarity;
	}

	private isSimilarSelector(selector1: string, selector2: string): boolean {
		return selector1.length === selector2.length &&
			selector1.split('').filter((char, i) => char !== selector2[i]).length <= 1;
	}

	private isValueSimilar(value1: string, value2: string): boolean {
		const maxDifference = 2;
		if (Math.abs(value1.length - value2.length) > maxDifference) return false;

		let differences = 0;
		for (let i = 0; i < Math.max(value1.length, value2.length); i++) {
			if (value1[i] !== value2[i]) differences++;
			if (differences > maxDifference) return false;
		}
		return true;
	}
}