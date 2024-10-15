export interface Test {
	testId: string;
	testSteps: string[];
}

export interface TraceAction {
	type: string;
	action: string;
	selector?: string;
	url?: string;
	// Add more properties as needed based on the trace file structure
}

export interface TraceData {
	title: string;
	actions: TraceAction[];
	// Add more properties as needed based on the trace file structure
}