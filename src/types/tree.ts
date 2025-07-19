export type Category = 'physical' | 'cognitive' | 'social' | 'technological'

export interface TreeFeature {
  id: string
  name: string
  description: string
  effects: unknown[]
  prerequisites: string[]
  category: Category
}

export interface TreeNode {
  id: string
  feature: TreeFeature
  category: Category
  children: TreeNode[]
  unlockTurn?: number
  isUnlocked?: boolean
  x?: number
  y?: number
}

export interface TreeData {
  root: TreeNode
  categories: Record<Category, string>
}