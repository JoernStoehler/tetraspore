import { TreeData, TreeNode, Category, TreeFeature } from '../types/tree'

// Helper to create features
const createFeature = (id: string, name: string, description: string, category: Category): TreeFeature => ({
  id,
  name,
  description,
  effects: [],
  prerequisites: [],
  category
})

// Helper to create tree nodes
const createNode = (feature: TreeFeature, unlockTurn?: number, children: TreeNode[] = []): TreeNode => ({
  id: feature.id,
  feature,
  category: feature.category,
  children,
  unlockTurn
})

// Generate many features for each category
const generatePhysicalFeatures = (): TreeNode[] => {
  const features: TreeNode[] = []
  const categories = ['Cellular', 'Muscular', 'Skeletal', 'Nervous', 'Sensory']
  
  categories.forEach((cat, catIdx) => {
    const subFeatures: TreeNode[] = []
    for (let i = 0; i < 10; i++) {
      const feature = createFeature(
        `physical-${cat.toLowerCase()}-${i}`,
        `${cat} Enhancement ${i + 1}`,
        `Advanced ${cat.toLowerCase()} system improvement`,
        'physical'
      )
      subFeatures.push(createNode(feature, 5 + catIdx * 2 + i))
    }
    
    const mainFeature = createFeature(
      `physical-${cat.toLowerCase()}`,
      `${cat} System`,
      `Basic ${cat.toLowerCase()} development`,
      'physical'
    )
    features.push(createNode(mainFeature, 2 + catIdx, subFeatures))
  })
  
  return features
}

const generateCognitiveFeatures = (): TreeNode[] => {
  const features: TreeNode[] = []
  const categories = ['Memory', 'Learning', 'Problem Solving', 'Pattern Recognition', 'Abstract Thinking']
  
  categories.forEach((cat, catIdx) => {
    const subFeatures: TreeNode[] = []
    for (let i = 0; i < 8; i++) {
      const feature = createFeature(
        `cognitive-${cat.toLowerCase().replace(' ', '-')}-${i}`,
        `${cat} Level ${i + 1}`,
        `Enhanced ${cat.toLowerCase()} capabilities`,
        'cognitive'
      )
      subFeatures.push(createNode(feature, 10 + catIdx * 3 + i))
    }
    
    const mainFeature = createFeature(
      `cognitive-${cat.toLowerCase().replace(' ', '-')}`,
      cat,
      `Basic ${cat.toLowerCase()} ability`,
      'cognitive'
    )
    features.push(createNode(mainFeature, 5 + catIdx * 2, subFeatures))
  })
  
  return features
}

const generateSocialFeatures = (): TreeNode[] => {
  const features: TreeNode[] = []
  const categories = ['Communication', 'Cooperation', 'Leadership', 'Empathy', 'Culture']
  
  categories.forEach((cat, catIdx) => {
    const subFeatures: TreeNode[] = []
    for (let i = 0; i < 6; i++) {
      const feature = createFeature(
        `social-${cat.toLowerCase()}-${i}`,
        `${cat} Trait ${i + 1}`,
        `Advanced ${cat.toLowerCase()} behavior`,
        'social'
      )
      subFeatures.push(createNode(feature, 15 + catIdx * 4 + i))
    }
    
    const mainFeature = createFeature(
      `social-${cat.toLowerCase()}`,
      `${cat} Basics`,
      `Fundamental ${cat.toLowerCase()} skills`,
      'social'
    )
    features.push(createNode(mainFeature, 8 + catIdx * 2, subFeatures))
  })
  
  return features
}

const generateTechnologicalFeatures = (): TreeNode[] => {
  const features: TreeNode[] = []
  const categories = ['Tools', 'Agriculture', 'Construction', 'Energy', 'Computing']
  
  categories.forEach((cat, catIdx) => {
    const subFeatures: TreeNode[] = []
    for (let i = 0; i < 7; i++) {
      const feature = createFeature(
        `tech-${cat.toLowerCase()}-${i}`,
        `${cat} Tech ${i + 1}`,
        `Advanced ${cat.toLowerCase()} technology`,
        'technological'
      )
      subFeatures.push(createNode(feature, 20 + catIdx * 5 + i))
    }
    
    const mainFeature = createFeature(
      `tech-${cat.toLowerCase()}`,
      `${cat} Technology`,
      `Basic ${cat.toLowerCase()} capabilities`,
      'technological'
    )
    features.push(createNode(mainFeature, 12 + catIdx * 3, subFeatures))
  })
  
  return features
}

// Root feature
const rootFeature = createFeature(
  'primordial-life',
  'Primordial Life',
  'The origin of your species',
  'physical'
)

// Main branches
const physicalBranch = createNode(
  createFeature('physical-branch', 'Physical Evolution', 'Development of body systems', 'physical'),
  1,
  generatePhysicalFeatures()
)

const cognitiveBranch = createNode(
  createFeature('cognitive-branch', 'Cognitive Evolution', 'Development of mental capabilities', 'cognitive'),
  2,
  generateCognitiveFeatures()
)

const socialBranch = createNode(
  createFeature('social-branch', 'Social Evolution', 'Development of group behaviors', 'social'),
  3,
  generateSocialFeatures()
)

const technologicalBranch = createNode(
  createFeature('tech-branch', 'Technological Evolution', 'Development of tool use and technology', 'technological'),
  4,
  generateTechnologicalFeatures()
)

// Large tree data with 100+ nodes
export const mockTreeDataLarge: TreeData = {
  root: createNode(rootFeature, 0, [
    physicalBranch,
    cognitiveBranch,
    socialBranch,
    technologicalBranch
  ]),
  categories: {
    physical: '#ef4444',
    cognitive: '#3b82f6',
    social: '#10b981',
    technological: '#f59e0b'
  }
}

// Count total nodes
let nodeCount = 0
const countNodes = (node: TreeNode) => {
  nodeCount++
  node.children.forEach(countNodes)
}
countNodes(mockTreeDataLarge.root)
console.log(`Large tree has ${nodeCount} total nodes`)