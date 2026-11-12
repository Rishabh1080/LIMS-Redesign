// Task registry. Order here is the order in the tracker. The tasks run on the
// prototype's own screens and follow one inward from creation to its COA.
// (labAtAGlance, createInward and allocateTests are the earlier replica's
// chapters, kept for reference.)
import {
  addResults,
  allocateTests,
  approveResults,
  createInward,
  generateCoa,
  requestApproval,
  sendForApproval,
} from './protoTasks';

export const chapters = [createInward, sendForApproval, allocateTests, addResults, requestApproval, approveResults, generateCoa];
