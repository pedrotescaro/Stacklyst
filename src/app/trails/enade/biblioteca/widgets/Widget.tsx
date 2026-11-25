'use client';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import styles from './widgets.module.css';

type WidgetProps = { props: Record<string, string> };

const loading = () => <div className={styles.loading} aria-busy="true" />;
const load = (factory: () => Promise<ComponentType<WidgetProps>>) =>
  dynamic(factory, { ssr: false, loading });

/** Interactive pieces referenced from Markdown as `::widget name key=value`. */
export const WIDGETS: Record<string, ComponentType<WidgetProps>> = {
  'truth-table': load(() => import('./TruthTable').then((m) => m.TruthTable)),
  'rup-whale': load(() => import('./RupWhale').then((m) => m.RupWhale)),
  'modelo-v': load(() => import('./VModel').then((m) => m.VModel)),
  'incremental-escalonado': load(() => import('./VModel').then((m) => m.IncrementalTimeline)),
  'boehm-espiral': load(() => import('./ProcessSpirals').then((m) => m.BoehmSpiral)),
  'boehm-custo-mudanca': load(() => import('./LifecycleCurves').then((m) => m.ChangeCostCurve)),
  'curva-banheira': load(() => import('./LifecycleCurves').then((m) => m.BathtubCurve)),
  'sommerville-espiral-requisitos': load(() =>
    import('./ProcessSpirals').then((m) => m.RequirementsSpiral)
  ),
  cyclomatic: load(() => import('./Cyclomatic').then((m) => m.Cyclomatic)),
  'stack-queue': load(() => import('./StackQueue').then((m) => m.StackQueue)),
  'linked-list': load(() => import('./LinkedList').then((m) => m.LinkedList)),
  bst: load(() => import('./BinarySearchTree').then((m) => m.BinarySearchTree)),
  'arvore-b-mais': load(() => import('./BPlusTree').then((m) => m.BPlusTree)),
  sorting: load(() => import('./Sorting').then((m) => m.Sorting)),
  'big-o': load(() => import('./BigO').then((m) => m.BigO)),
  'lorenz-gini': load(() => import('./LorenzGini').then((m) => m.LorenzGini)),
  venn: load(() => import('./Venn').then((m) => m.Venn)),
  'base-converter': load(() => import('./BaseConverter').then((m) => m.BaseConverter)),
  'stats-calculator': load(() => import('./StatsCalculator').then((m) => m.StatsCalculator)),
  scheduling: load(() => import('./Scheduling').then((m) => m.Scheduling)),
  'layers-flow': load(() => import('./LayersFlow').then((m) => m.LayersFlow)),
  'hash-table': load(() => import('./HashTable').then((m) => m.HashTable)),
  'graph-traversal': load(() => import('./GraphTraversal').then((m) => m.GraphTraversal)),
  'osi-layers': load(() => import('./OsiLayers').then((m) => m.OsiLayers)),
  uml: load(() => import('./UmlDiagrams').then((m) => m.UmlDiagram)),
};

export function Widget({ name, props }: { name: string; props: Record<string, string> }) {
  const Component = WIDGETS[name];
  if (!Component) return null;
  return (
    <div className={styles.frame} data-widget={name}>
      <Component props={props} />
    </div>
  );
}
