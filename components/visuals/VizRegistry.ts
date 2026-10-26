import { NumberLineViz, type NumberLineVizProps } from "./NumberLineViz";
import { FractionBarViz, type FractionBarVizProps } from "./FractionBarViz";
import { EquationStepReveal, type EquationStepRevealProps } from "./EquationStepReveal";
import { AreaGridViz, type AreaGridVizProps } from "./AreaGridViz";
import { AngleViz, type AngleVizProps } from "./AngleViz";
import { CoordinatePlaneViz, type CoordinatePlaneVizProps } from "./CoordinatePlaneViz";
import { BarModelViz, type BarModelVizProps } from "./BarModelViz";
import { TreeDiagramViz, type TreeDiagramVizProps } from "./TreeDiagramViz";
import { LessonIntroViz, type LessonIntroVizProps } from "./LessonIntroViz";
import { AnimatedCurveViz, type AnimatedCurveVizProps } from "./AnimatedCurveViz";

export {
  NumberLineViz,
  FractionBarViz,
  EquationStepReveal,
  AreaGridViz,
  AngleViz,
  CoordinatePlaneViz,
  BarModelViz,
  TreeDiagramViz,
  LessonIntroViz,
  AnimatedCurveViz,
};

// Single source of truth mapping a storyboard beat's `component` string to
// the React component that renders it. Keep in sync with the discriminated
// union in lib/content/lessonSchema.ts.
export const VizRegistry = {
  NumberLineViz,
  FractionBarViz,
  EquationStepReveal,
  AreaGridViz,
  AngleViz,
  CoordinatePlaneViz,
  BarModelViz,
  TreeDiagramViz,
  LessonIntroViz,
  AnimatedCurveViz,
} as const;

export type VizComponentName = keyof typeof VizRegistry;

export type VizPropsMap = {
  NumberLineViz: NumberLineVizProps;
  FractionBarViz: FractionBarVizProps;
  EquationStepReveal: EquationStepRevealProps;
  AreaGridViz: AreaGridVizProps;
  AngleViz: AngleVizProps;
  CoordinatePlaneViz: CoordinatePlaneVizProps;
  BarModelViz: BarModelVizProps;
  TreeDiagramViz: TreeDiagramVizProps;
  LessonIntroViz: LessonIntroVizProps;
  AnimatedCurveViz: AnimatedCurveVizProps;
};
