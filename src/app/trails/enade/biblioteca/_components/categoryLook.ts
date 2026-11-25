import {
  BarChart3,
  Binary,
  BookOpen,
  Boxes,
  Briefcase,
  Building2,
  ClipboardList,
  Database,
  FlaskConical,
  Globe2,
  Layers,
  Shapes,
  ShieldCheck,
  Sigma,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

/** Icon and hue of each library category, so it is recognisable everywhere it appears. */
const LOOKS: Record<string, { icon: LucideIcon; hue: number }> = {
  workflow: { icon: Workflow, hue: 211 },
  layers: { icon: Layers, hue: 262 },
  clipboard: { icon: ClipboardList, hue: 32 },
  shapes: { icon: Shapes, hue: 330 },
  boxes: { icon: Boxes, hue: 152 },
  building: { icon: Building2, hue: 190 },
  binary: { icon: Binary, hue: 280 },
  test: { icon: FlaskConical, hue: 100 },
  sigma: { icon: Sigma, hue: 12 },
  chart: { icon: BarChart3, hue: 45 },
  database: { icon: Database, hue: 225 },
  shield: { icon: ShieldCheck, hue: 168 },
  briefcase: { icon: Briefcase, hue: 22 },
  globe: { icon: Globe2, hue: 200 },
};

export function categoryLook(icon: string | undefined) {
  return LOOKS[icon ?? ''] ?? { icon: BookOpen, hue: 211 };
}
