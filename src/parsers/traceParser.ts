import fs from 'node:fs';
import path from 'node:path';
import type { Test } from '../types';

export class TraceParser {
	private tracePath: string;

	constructor(tracePath: string) {
		this.tracePath = tracePath;
	}

	public parse(): Test[] {
		console.log(`Attempting to parse file: ${this.tracePath}`);

		try {
			const traceContent = fs.readFileSync(this.tracePath, 'utf-8');
			console.log('File content:', traceContent);

			const traceData = JSON.parse(traceContent);
			console.log('Parsed JSON data:', JSON.stringify(traceData, null, 2));

			if (Array.isArray(traceData.traces)) {
				console.log(`Found ${traceData.traces.length} traces in the file`);
				const tests = traceData.traces.map(trace => ({
					testId: trace.title,
					testSteps: this.extractSteps(trace.actions)
				}));
				console.log('Parsed tests:', JSON.stringify(tests, null, 2));
				return tests;
			}
			console.log('Invalid trace file format. "traces" is not an array.');
			throw new Error('Invalid trace file format. Expected an object with a "traces" array.');
		} catch (error) {
			console.error('Error parsing trace file:', error);
			throw error;
		}
	}

	private extractSteps(actions: any[]): string[] {
		console.log('Extracting steps from actions:', JSON.stringify(actions, null, 2));
		const steps = actions
			.filter(action => action.type === 'action')
			.map(action => {
				let step = `${action.action}: ${action.selector || action.url || ''}`;
				if (action.value !== undefined) {
					step += ` | value: ${action.value}`;
				}
				if (action.assertion !== undefined) {
					step += ` | assertion: ${action.assertion}`;
				}
				if (action.count !== undefined) {
					step += ` | count: ${action.count}`;
				}
				if (action.text !== undefined) {
					step += ` | text: ${action.text}`;
				}
				return step;
			});
		console.log('Extracted steps:', steps);
		return steps;
	}
}

export function parseTraceFile(tracePath: string): Test[] {
	console.log('parseTraceFile called with path:', tracePath);
	const parser = new TraceParser(tracePath);
	return parser.parse();
}