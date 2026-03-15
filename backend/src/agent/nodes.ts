import { interrupt } from "@langchain/langgraph";
import { AgentStateAnnotation } from "./state";

export const parseJd = async (state: typeof AgentStateAnnotation.State) => {
  return { jdParsed: {} };
};

export const analyzeGaps = async (state: typeof AgentStateAnnotation.State) => {
  return { messages: [] };
};

export const generateEdits = async (state: typeof AgentStateAnnotation.State) => {
  return { 
    pendingEdits: [], 
    iterationCount: (state.iterationCount || 0) + 1 
  };
};

export const humanReview = (state: typeof AgentStateAnnotation.State) => {
  interrupt({
    type: "checkpoint",
    pending_edits: state.pendingEdits,
  });
  return {};
};

export const applyApproved = (state: typeof AgentStateAnnotation.State) => {
  return { resumeAst: state.resumeAst };
};
