import { motion } from 'framer-motion'
import { ChoiceWithUI, CategoryColors, CategoryDisplayNames } from '../../types'

interface ChoiceCardProps {
  choice: ChoiceWithUI
  onSelect: (choice: ChoiceWithUI) => void
  className?: string
}

export const ChoiceCard = ({ choice, onSelect, className = '' }: ChoiceCardProps) => {
  const colors = CategoryColors[choice.category]
  const isDisabled = choice.disabled || false

  const handleSelect = () => {
    if (!isDisabled) {
      onSelect(choice)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelect()
    }
  }

  return (
    <motion.div
      className={`
        relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200
        ${colors.bg} ${colors.border}
        ${isDisabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:shadow-lg hover:scale-105 active:scale-95'
        }
        ${className}
      `}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      tabIndex={isDisabled ? -1 : 0}
      role="button"
      aria-label={`Select ${choice.title}`}
      aria-disabled={isDisabled}
      whileHover={isDisabled ? {} : { y: -2 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Category Badge */}
      <div className={`
        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3
        ${colors.bg} ${colors.text}
      `}>
        {CategoryDisplayNames[choice.category]}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {choice.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
        {choice.description}
      </p>

      {/* Prerequisites */}
      {choice.prerequisites && choice.prerequisites.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Prerequisites:
          </p>
          <div className="flex flex-wrap gap-1">
            {choice.prerequisites.map((prereq) => (
              <span
                key={prereq}
                className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
              >
                {prereq}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Flavor Text */}
      {choice.flavorText && (
        <blockquote className="text-xs italic text-gray-500 dark:text-gray-400 border-l-2 border-gray-300 dark:border-gray-600 pl-3 mb-4">
          {choice.flavorText}
        </blockquote>
      )}

      {/* Footer with Cost and Select Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        {choice.cost && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span className="mr-1">💎</span>
            <span>{choice.cost}</span>
          </div>
        )}
        
        <motion.button
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${isDisabled 
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : `${colors.text} bg-white dark:bg-gray-800 border ${colors.border} hover:bg-gray-50 dark:hover:bg-gray-700`
            }
          `}
          whileHover={isDisabled ? {} : { scale: 1.05 }}
          whileTap={isDisabled ? {} : { scale: 0.95 }}
          disabled={isDisabled}
          onClick={(e) => {
            e.stopPropagation()
            handleSelect()
          }}
        >
          {isDisabled ? 'Locked' : 'Select'}
        </motion.button>
      </div>

      {/* Disabled Overlay */}
      {isDisabled && (
        <div className="absolute inset-0 bg-gray-900/20 rounded-lg flex items-center justify-center">
          <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
            🔒 Locked
          </div>
        </div>
      )}
    </motion.div>
  )
}