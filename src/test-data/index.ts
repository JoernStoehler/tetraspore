import basicTreeData from './tree-scenarios/basic-tree.json';
import complexTreeData from './tree-scenarios/complex-tree.json';
import extinctionEventData from './tree-scenarios/extinction-event.json';
import turn8To10ReplayData from './tree-scenarios/turn-8-to-10-replay.json';
import type { TreeNode } from '../components/TreeOfLife/types';

export const basicTree = basicTreeData as TreeNode[];
export const complexTree = complexTreeData as TreeNode[];
export const extinctionEvent = extinctionEventData as TreeNode[];
export const turn8To10Replay = turn8To10ReplayData as TreeNode[];

export const treeScenarios = {
  basic: basicTree,
  complex: complexTree,
  extinctionEvent,
  turn8To10Replay,
};