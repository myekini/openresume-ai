import { StateGraph, END } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { AgentStateAnnotation } from "./state";
import { parseJd, analyzeGaps, generateEdits, humanReview, applyApproved } from "./nodes";

const shouldContinue = (state: typeof AgentStateAnnotation.State) => {
  if (state.iterationCount >= 3) {
    return END;
  }
  return "generateEdits";
};

export const buildGraph = () => {
  const workflow = new StateGraph(AgentStateAnnotation)
    .addNode("parseJd", parseJd)
    .addNode("analyzeGaps", analyzeGaps)
    .addNode("generateEdits", generateEdits)
    .addNode("humanReview", humanReview)
    .addNode("applyApproved", applyApproved)
    
    .addEdge("__start__", "parseJd")
    .addEdge("parseJd", "analyzeGaps")
    .addEdge("analyzeGaps", "generateEdits")
    .addEdge("generateEdits", "humanReview")
    .addEdge("humanReview", "applyApproved")
    .addConditionalEdges("applyApproved", shouldContinue, {
      generateEdits: "generateEdits",
      __end__: END,
    });

  const checkpointer = new MemorySaver();
  
  return workflow.compile({ checkpointer });
};
