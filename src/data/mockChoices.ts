import { ChoiceWithUI } from '../types'

export const mockChoices: ChoiceWithUI[] = [
  {
    id: 'cell-walls',
    title: 'Develop Cell Walls',
    description: 'Create rigid barriers to protect cellular contents and maintain structural integrity.',
    category: 'physical',
    flavorText: '"The first fortress is built not of stone, but of chemistry."',
    cost: 10
  },
  {
    id: 'sensory-organs',
    title: 'Basic Sensory Organs',
    description: 'Develop primitive light-sensitive spots and chemical receptors to perceive the environment.',
    category: 'physical',
    flavorText: '"To see is to begin to understand the world beyond oneself."',
    cost: 15,
    prerequisites: ['cell-walls']
  },
  {
    id: 'chemical-signaling',
    title: 'Chemical Signaling',
    description: 'Establish basic communication between organisms through chemical markers.',
    category: 'social',
    flavorText: '"The first words were not spoken, but secreted."',
    cost: 12
  },
  {
    id: 'pattern-recognition',
    title: 'Pattern Recognition',
    description: 'Develop neural pathways to identify and respond to environmental patterns.',
    category: 'cognitive',
    flavorText: '"Intelligence begins with the recognition that this has happened before."',
    cost: 20,
    prerequisites: ['sensory-organs']
  },
  {
    id: 'simple-tools',
    title: 'Simple Tool Use',
    description: 'Learn to manipulate environmental objects to achieve goals.',
    category: 'technological',
    flavorText: '"The stick becomes an extension of intention."',
    cost: 25,
    prerequisites: ['pattern-recognition'],
    disabled: true
  },
  {
    id: 'cellular-cooperation',
    title: 'Cellular Cooperation',
    description: 'Enable multiple cells to work together for mutual benefit.',
    category: 'social',
    flavorText: '"Together, we are more than the sum of our parts."',
    cost: 18,
    prerequisites: ['chemical-signaling']
  },
  {
    id: 'memory-formation',
    title: 'Memory Formation',
    description: 'Develop the ability to store and recall information over time.',
    category: 'cognitive',
    flavorText: '"The past becomes a tool for shaping the future."',
    cost: 22,
    prerequisites: ['pattern-recognition']
  },
  {
    id: 'mobility',
    title: 'Active Mobility',
    description: 'Develop mechanisms for self-directed movement through the environment.',
    category: 'physical',
    flavorText: '"Freedom is the ability to choose where you belong."',
    cost: 16,
    prerequisites: ['sensory-organs']
  },
  {
    id: 'energy-storage',
    title: 'Energy Storage',
    description: 'Create internal reserves to survive periods of scarcity.',
    category: 'physical',
    flavorText: '"Feast today, survive tomorrow."',
    cost: 14,
    prerequisites: ['cell-walls']
  },
  {
    id: 'collective-decision',
    title: 'Collective Decision Making',
    description: 'Enable groups to make coordinated choices through primitive consensus.',
    category: 'social',
    flavorText: '"The wisdom of many exceeds the knowledge of one."',
    cost: 30,
    prerequisites: ['cellular-cooperation', 'memory-formation'],
    disabled: true
  }
]