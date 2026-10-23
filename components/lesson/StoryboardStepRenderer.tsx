import type { StoryboardBeat } from "@/lib/content/lessonSchema";
import {
  NumberLineViz,
  FractionBarViz,
  EquationStepReveal,
  AreaGridViz,
  AngleViz,
  CoordinatePlaneViz,
  BarModelViz,
  TreeDiagramViz,
} from "@/components/visuals/VizRegistry";

// Thin dispatcher: storyboard beat -> the matching Viz component. A switch
// (not a generic lookup) keeps each branch's props type-checked against the
// component it's paired with.
export function StoryboardStepRenderer({ beat }: { beat: StoryboardBeat }) {
  switch (beat.component) {
    case "NumberLineViz":
      return <NumberLineViz {...beat.props} />;
    case "FractionBarViz":
      return <FractionBarViz {...beat.props} />;
    case "EquationStepReveal":
      return <EquationStepReveal {...beat.props} />;
    case "AreaGridViz":
      return <AreaGridViz {...beat.props} />;
    case "AngleViz":
      return <AngleViz {...beat.props} />;
    case "CoordinatePlaneViz":
      return <CoordinatePlaneViz {...beat.props} />;
    case "BarModelViz":
      return <BarModelViz {...beat.props} />;
    case "TreeDiagramViz":
      return <TreeDiagramViz {...beat.props} />;
    default:
      return null;
  }
}
