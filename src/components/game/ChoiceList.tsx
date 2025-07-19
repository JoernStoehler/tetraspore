import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChoiceWithUI, ChoiceCategory, CategoryDisplayNames } from '../../types'
import { ChoiceCard } from './ChoiceCard'

interface ChoiceListProps {
  choices: ChoiceWithUI[]
  onSelectChoice: (choice: ChoiceWithUI) => void
  className?: string
}

const categories: (ChoiceCategory | 'All')[] = ['All', 'physical', 'cognitive', 'social', 'technological']

export const ChoiceList = ({ choices, onSelectChoice, className = '' }: ChoiceListProps) => {
  const [selectedCategory, setSelectedCategory] = useState<ChoiceCategory | 'All'>('All')

  const filteredChoices = useMemo(() => {
    if (selectedCategory === 'All') {
      return choices
    }
    return choices.filter(choice => choice.category === selectedCategory)
  }, [choices, selectedCategory])

  const getCategoryCount = (category: ChoiceCategory | 'All'): number => {
    if (category === 'All') return choices.length
    return choices.filter(choice => choice.category === category).length
  }

  const handleChoiceSelect = (choice: ChoiceWithUI) => {
    console.log('Choice selected:', choice)
    onSelectChoice(choice)
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Category Filter Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {categories.map((category) => {
            const isActive = selectedCategory === category
            const count = getCategoryCount(category)
            
            return (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {category === 'All' ? 'All' : CategoryDisplayNames[category]}
                <span className={`
                  ml-2 px-2 py-0.5 rounded-full text-xs
                  ${isActive 
                    ? 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {count}
                </span>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-md -z-10"
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Choice Cards Grid */}
      <AnimatePresence mode="wait">
        {filteredChoices.length > 0 ? (
          <motion.div
            key={selectedCategory}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filteredChoices.map((choice, index) => (
              <motion.div
                key={choice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
              >
                <ChoiceCard
                  choice={choice}
                  onSelect={handleChoiceSelect}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-gray-400 dark:text-gray-600 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">
              No choices available
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-600">
              {selectedCategory === 'All' 
                ? 'There are no choices to display.' 
                : `No choices available in the ${selectedCategory} category.`
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      {filteredChoices.length > 0 && (
        <motion.div 
          className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {filteredChoices.length} choice{filteredChoices.length !== 1 ? 's' : ''}
              {selectedCategory !== 'All' && ` in ${CategoryDisplayNames[selectedCategory]}`}
            </span>
            <span>
              {filteredChoices.filter(c => !c.disabled).length} available
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}