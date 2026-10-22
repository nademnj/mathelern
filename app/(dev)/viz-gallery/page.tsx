import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  NumberLineViz,
  FractionBarViz,
  EquationStepReveal,
  AreaGridViz,
  AngleViz,
  CoordinatePlaneViz,
  BarModelViz,
} from "@/components/visuals/VizRegistry";

export default function VizGalleryPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const items: { name: string; node: React.ReactNode }[] = [
    { name: "NumberLineViz", node: <NumberLineViz min={0} max={20} highlight={[7]} jumpTo={7} /> },
    {
      name: "FractionBarViz",
      node: (
        <FractionBarViz numerator={3} denominator={8} compareNumerator={6} compareDenominator={16} label="Pizza" />
      ),
    },
    {
      name: "EquationStepReveal",
      node: (
        <EquationStepReveal
          steps={[
            { label: "Start", expression: "2385" },
            { label: "Tausender", expression: "2 · 1000" },
            { label: "Summe", expression: "2000 + 300 + 80 + 5" },
          ]}
        />
      ),
    },
    { name: "AreaGridViz", node: <AreaGridViz width={5} height={3} /> },
    { name: "AngleViz", node: <AngleViz degrees={60} /> },
    {
      name: "CoordinatePlaneViz",
      node: <CoordinatePlaneViz range={5} points={[{ x: 2, y: 3, label: "A" }]} />,
    },
    {
      name: "BarModelViz",
      node: (
        <BarModelViz
          total={100}
          unit="%"
          parts={[
            { value: 60, label: "Richtig" },
            { value: 40, label: "Übung" },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <h1 className="text-xl font-semibold">Viz Gallery (dev only)</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <Card key={item.name}>
            <CardHeader>
              <CardTitle className="text-sm">{item.name}</CardTitle>
            </CardHeader>
            <CardContent>{item.node}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
