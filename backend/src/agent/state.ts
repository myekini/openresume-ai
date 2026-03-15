import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

export interface EditPatch {
  item_id: string;
  section_title: string;
  original: string;
  proposed: string;
  reason: string;
  note?: string;
  status: "pending" | "accepted" | "reverted";
}

export const AgentStateAnnotation = Annotation.Root({
  sessionId: Annotation<string>(),
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  resumeAst: Annotation<any>(),
  jdText: Annotation<string>(),
  jdParsed: Annotation<any>(),
  pendingEdits: Annotation<EditPatch[]>(),
  approvedEdits: Annotation<EditPatch[]>(),
  iterationCount: Annotation<number>(),
});
