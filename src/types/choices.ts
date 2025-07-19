import type { Choice as BaseChoice } from './state'

export type ChoiceCategory = 'physical' | 'cognitive' | 'social' | 'technological'

// Re-export the base Choice type
export type Choice = BaseChoice

// Extended choice interface for UI components with additional properties
export interface ChoiceWithUI extends BaseChoice {
  cost?: number
  disabled?: boolean
}

export interface ChoiceFilter {
  category?: ChoiceCategory
  showLocked?: boolean
}

export const CategoryColors: Record<ChoiceCategory, { bg: string; border: string; text: string }> = {
  physical: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-700',
    text: 'text-green-700 dark:text-green-300'
  },
  cognitive: {
    bg: 'bg-blue-50 dark:bg-blue-900/20', 
    border: 'border-blue-200 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-300'
  },
  social: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-700', 
    text: 'text-yellow-700 dark:text-yellow-300'
  },
  technological: {
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    border: 'border-cyan-200 dark:border-cyan-700',
    text: 'text-cyan-700 dark:text-cyan-300'
  }
}

// Display names for categories
export const CategoryDisplayNames: Record<ChoiceCategory, string> = {
  physical: 'Physical',
  cognitive: 'Cognitive', 
  social: 'Social',
  technological: 'Technological'
}