import { TreeNode, TreeData, Category, TreeFeature } from '../types/tree'

const createFeature = (id: string, name: string, description: string, category: Category): TreeFeature => ({
  id,
  name,
  description,
  effects: [],
  prerequisites: [],
  category
})

const createNode = (id: string, feature: TreeFeature, category: Category, unlockTurn?: number): TreeNode => ({
  id,
  feature,
  category,
  children: [],
  unlockTurn,
  isUnlocked: unlockTurn !== undefined && unlockTurn <= 0
})

export const mockTreeData: TreeData = {
  root: {
    id: 'root',
    feature: createFeature('root', 'Primordial Life', 'The origin of all life forms', 'physical'),
    category: 'physical',
    children: [
      {
        id: 'physical-branch',
        feature: createFeature('physical-branch', 'Cell Walls', 'Basic structural protection', 'physical'),
        category: 'physical',
        unlockTurn: 1,
        children: [
          {
            id: 'mobility',
            feature: createFeature('mobility', 'Mobility', 'Ability to move through environment', 'physical'),
            category: 'physical',
            unlockTurn: 3,
            children: [
              {
                id: 'senses',
                feature: createFeature('senses', 'Enhanced Senses', 'Improved environmental awareness', 'physical'),
                category: 'physical',
                unlockTurn: 5,
                children: [
                  createNode('vision', createFeature('vision', 'Vision', 'Light detection and image formation', 'physical'), 'physical', 7),
                  createNode('hearing', createFeature('hearing', 'Hearing', 'Sound wave detection', 'physical'), 'physical', 8)
                ]
              },
              createNode('speed', createFeature('speed', 'Speed', 'Rapid movement capability', 'physical'), 'physical', 6)
            ]
          },
          createNode('armor', createFeature('armor', 'Natural Armor', 'Hardened protective covering', 'physical'), 'physical', 4)
        ]
      },
      {
        id: 'cognitive-branch',
        feature: createFeature('cognitive-branch', 'Basic Reactions', 'Simple stimulus response', 'cognitive'),
        category: 'cognitive',
        unlockTurn: 2,
        children: [
          {
            id: 'memory',
            feature: createFeature('memory', 'Memory', 'Information storage and recall', 'cognitive'),
            category: 'cognitive',
            unlockTurn: 4,
            children: [
              {
                id: 'learning',
                feature: createFeature('learning', 'Learning', 'Behavior modification through experience', 'cognitive'),
                category: 'cognitive',
                unlockTurn: 6,
                children: [
                  createNode('abstract-thought', createFeature('abstract-thought', 'Abstract Thought', 'Conceptual reasoning', 'cognitive'), 'cognitive', 9),
                  createNode('creativity', createFeature('creativity', 'Creativity', 'Novel problem solving', 'cognitive'), 'cognitive', 10)
                ]
              },
              createNode('pattern-recognition', createFeature('pattern-recognition', 'Pattern Recognition', 'Identifying regularities', 'cognitive'), 'cognitive', 7)
            ]
          }
        ]
      },
      {
        id: 'social-branch',
        feature: createFeature('social-branch', 'Chemical Signals', 'Basic inter-organism communication', 'social'),
        category: 'social',
        unlockTurn: 3,
        children: [
          {
            id: 'vocalization',
            feature: createFeature('vocalization', 'Vocalization', 'Sound-based communication', 'social'),
            category: 'social',
            unlockTurn: 5,
            children: [
              {
                id: 'language',
                feature: createFeature('language', 'Language', 'Complex symbolic communication', 'social'),
                category: 'social',
                unlockTurn: 8,
                children: [
                  createNode('writing', createFeature('writing', 'Writing', 'Persistent information storage', 'social'), 'social', 11),
                  createNode('art', createFeature('art', 'Art', 'Aesthetic expression', 'social'), 'social', 12)
                ]
              },
              createNode('cooperation', createFeature('cooperation', 'Cooperation', 'Coordinated group behavior', 'social'), 'social', 7)
            ]
          }
        ]
      },
      {
        id: 'technological-branch',
        feature: createFeature('technological-branch', 'Tool Use', 'Manipulating objects for tasks', 'technological'),
        category: 'technological',
        unlockTurn: 10,
        children: [
          {
            id: 'tool-making',
            feature: createFeature('tool-making', 'Tool Making', 'Creating specialized implements', 'technological'),
            category: 'technological',
            unlockTurn: 12,
            children: [
              createNode('agriculture', createFeature('agriculture', 'Agriculture', 'Controlled food production', 'technological'), 'technological', 15),
              createNode('construction', createFeature('construction', 'Construction', 'Building permanent structures', 'technological'), 'technological', 16)
            ]
          }
        ]
      }
    ]
  },
  categories: {
    physical: '#ef4444',
    cognitive: '#3b82f6',
    social: '#10b981',
    technological: '#f59e0b'
  }
}