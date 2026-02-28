import { formatSolution as formatSolutionImpl, toPlainText } from "../../utils/formatSolution.js";

export type SolutionFormatMetadata = {
  hasSteps: boolean;
  hasFormula: boolean;
  hasDiagramPlaceholder: boolean;
};

export type FormattedSolutionResult = {
  formattedAnswerHtml: string;
  metadata: SolutionFormatMetadata;
};

export const formatSolution = (
  questionText: string,
  rawAnswerHtml: string,
): FormattedSolutionResult =>
  formatSolutionImpl(questionText, rawAnswerHtml) as FormattedSolutionResult;

export { toPlainText };

