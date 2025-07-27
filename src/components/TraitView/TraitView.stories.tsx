import type { Meta, StoryObj } from '@storybook/react-vite';
import { TraitView } from './TraitView';
import { 
  type Trait, 
  type TraitEdge, 
  type PlayerTraitState,
  AdoptedTraitCategory,
  EnvironmentalTraitCategory 
} from './types';

// Mock traits for different scenarios
const allTraits: Trait[] = [
  // Biological traits
  {
    id: 'photosynthesis',
    name: 'Photosynthesis',
    category: AdoptedTraitCategory.Biological,
    description: 'Ability to convert sunlight into energy',
    isEnvironmental: false,
  },
  {
    id: 'chloroplasts',
    name: 'Chloroplasts',
    category: AdoptedTraitCategory.Biological,
    description: 'Specialized organelles for photosynthesis',
    isEnvironmental: false,
  },
  {
    id: 'c4-photosynthesis',
    name: 'C4 Photosynthesis',
    category: AdoptedTraitCategory.Biological,
    description: 'Advanced form of photosynthesis for hot climates',
    isEnvironmental: false,
  },
  {
    id: 'cells',
    name: 'Cells',
    category: AdoptedTraitCategory.Biological,
    description: 'Basic units of life',
    isEnvironmental: false,
  },
  
  // Technological traits
  {
    id: 'tool-use',
    name: 'Tool Use',
    category: AdoptedTraitCategory.Technological,
    description: 'Ability to create and use tools',
    isEnvironmental: false,
  },
  {
    id: 'stone-tools',
    name: 'Stone Tools',
    category: AdoptedTraitCategory.Technological,
    description: 'Tools made from stone materials',
    isEnvironmental: false,
  },
  {
    id: 'metal-working',
    name: 'Metal Working',
    category: AdoptedTraitCategory.Technological,
    description: 'Ability to work with metals',
    isEnvironmental: false,
  },
  {
    id: 'fire-making',
    name: 'Fire Making',
    category: AdoptedTraitCategory.Technological,
    description: 'Ability to create and control fire',
    isEnvironmental: false,
  },

  // Social traits  
  {
    id: 'cooperation',
    name: 'Cooperation',
    category: AdoptedTraitCategory.Social,
    description: 'Ability to work together effectively',
    isEnvironmental: false,
  },
  {
    id: 'language',
    name: 'Language',
    category: AdoptedTraitCategory.Social,
    description: 'Complex communication system',
    isEnvironmental: false,
  },

  // Behavioral traits
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    category: AdoptedTraitCategory.Behavioral,
    description: 'Advanced cognitive abilities',
    isEnvironmental: false,
  },

  // Environmental traits
  {
    id: 'rocky-terrain',
    name: 'Rocky Terrain',
    category: EnvironmentalTraitCategory.Geological,
    description: 'Environment characterized by rocky surfaces',
    isEnvironmental: true,
  },
  {
    id: 'abundant-minerals',
    name: 'Abundant Minerals',
    category: EnvironmentalTraitCategory.Geological,
    description: 'Rich mineral deposits available',
    isEnvironmental: true,
  },
  {
    id: 'forest-ecosystem',
    name: 'Forest Ecosystem',
    category: EnvironmentalTraitCategory.Ecological,
    description: 'Dense forest environment',
    isEnvironmental: true,
  },
];

const allEdges: TraitEdge[] = [
  // Biological relationships
  { from: 'cells', to: 'photosynthesis', description: 'Cells enable photosynthesis' },
  { from: 'photosynthesis', to: 'chloroplasts', description: 'Photosynthesis leads to specialized organelles' },
  { from: 'chloroplasts', to: 'c4-photosynthesis', description: 'Advanced photosynthesis mechanisms' },
  
  // Technological relationships
  { from: 'tool-use', to: 'stone-tools', description: 'Tool use enables stone tool creation' },
  { from: 'stone-tools', to: 'fire-making', description: 'Stone tools help with fire creation' },
  { from: 'fire-making', to: 'metal-working', description: 'Fire enables metal working' },
  
  // Cross-domain relationships
  { from: 'problem-solving', to: 'tool-use', description: 'Cognitive abilities enable tool use' },
  { from: 'cooperation', to: 'language', description: 'Working together develops communication' },
  { from: 'language', to: 'problem-solving', description: 'Communication enhances problem solving' },
  
  // Environmental influences
  { from: 'rocky-terrain', to: 'stone-tools', description: 'Rocky environment provides stone materials' },
  { from: 'abundant-minerals', to: 'metal-working', description: 'Mineral availability enables metalworking' },
  { from: 'forest-ecosystem', to: 'cooperation', description: 'Complex environment promotes cooperation' },
  { from: 'forest-ecosystem', to: 'photosynthesis', description: 'Forest environment favors photosynthesis' },
];

const basicPlayerState: PlayerTraitState = {
  adoptedTraits: new Set(['cells', 'photosynthesis']),
  discoveredTraits: new Set(['cells', 'photosynthesis', 'chloroplasts', 'tool-use', 'cooperation']),
  environmentalTraits: new Set(['rocky-terrain', 'forest-ecosystem']),
};

const advancedPlayerState: PlayerTraitState = {
  adoptedTraits: new Set(['cells', 'photosynthesis', 'chloroplasts', 'tool-use', 'stone-tools', 'cooperation', 'language']),
  discoveredTraits: new Set(['cells', 'photosynthesis', 'chloroplasts', 'c4-photosynthesis', 'tool-use', 'stone-tools', 'fire-making', 'metal-working', 'cooperation', 'language', 'problem-solving']),
  environmentalTraits: new Set(['rocky-terrain', 'abundant-minerals', 'forest-ecosystem']),
  adoptableChoices: [{
    id: 'choice-1',
    options: ['c4-photosynthesis', 'fire-making'],
    choiceType: 'adopt',
  }],
  losableChoices: [{
    id: 'choice-2', 
    options: ['stone-tools'],
    choiceType: 'lose',
  }],
};

const allVisibleTraits = new Set(allTraits.map(t => t.id));

const meta = {
  title: 'Components/TraitView',
  component: TraitView,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onTraitClick: { action: 'trait clicked' },
    onTraitHover: { action: 'trait hovered' },
    onChoiceSelect: { action: 'choice selected' },
  },
} satisfies Meta<typeof TraitView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicEvolution: Story = {
  args: {
    traits: allTraits.slice(0, 8), // First 8 traits
    edges: allEdges.slice(0, 6),  // First 6 edges
    playerState: basicPlayerState,
    visibleTraits: new Set(allTraits.slice(0, 8).map(t => t.id)),
    onTraitClick: () => {},
    onTraitHover: () => {},
  },
};

export const AdvancedCivilization: Story = {
  args: {
    traits: allTraits,
    edges: allEdges,
    playerState: advancedPlayerState,
    visibleTraits: allVisibleTraits,
    onTraitClick: () => {},
    onTraitHover: () => {},
  },
};

export const EarlyStage: Story = {
  args: {
    traits: allTraits.slice(0, 5),
    edges: allEdges.slice(0, 3),
    playerState: {
      adoptedTraits: new Set(['cells']),
      discoveredTraits: new Set(['cells', 'photosynthesis']),
      environmentalTraits: new Set(['forest-ecosystem']),
    },
    visibleTraits: new Set(allTraits.slice(0, 5).map(t => t.id)),
    onTraitClick: () => {},
    onTraitHover: () => {},
  },
};

export const WithChoices: Story = {
  args: {
    traits: allTraits.slice(0, 10),
    edges: allEdges.slice(0, 8),
    playerState: {
      adoptedTraits: new Set(['cells', 'photosynthesis', 'tool-use']),
      discoveredTraits: new Set(['cells', 'photosynthesis', 'chloroplasts', 'tool-use', 'stone-tools', 'cooperation']),
      environmentalTraits: new Set(['rocky-terrain']),
      adoptableChoices: [{
        id: 'choice-1',
        options: ['chloroplasts', 'stone-tools'],
        choiceType: 'adopt',
      }],
    },
    visibleTraits: new Set(allTraits.slice(0, 10).map(t => t.id)),
    onTraitClick: () => {},
    onTraitHover: () => {},
  },
};

export const OnlyEnvironmental: Story = {
  args: {
    traits: allTraits.filter(t => t.isEnvironmental),
    edges: allEdges.filter(e => {
      const fromTrait = allTraits.find(t => t.id === e.from);
      const toTrait = allTraits.find(t => t.id === e.to);
      return fromTrait?.isEnvironmental || toTrait?.isEnvironmental;
    }),
    playerState: {
      adoptedTraits: new Set(),
      discoveredTraits: new Set(),
      environmentalTraits: new Set(['rocky-terrain', 'abundant-minerals', 'forest-ecosystem']),
    },
    visibleTraits: new Set(allTraits.filter(t => t.isEnvironmental).map(t => t.id)),
    onTraitClick: () => {},
    onTraitHover: () => {},
  },
};

export const SparseGraph: Story = {
  args: {
    traits: [
      allTraits[0], // photosynthesis
      allTraits[5], // tool-use  
      allTraits[11], // rocky-terrain
    ],
    edges: [
      allEdges[9], // rocky-terrain -> stone-tools (but stone-tools not visible)
    ],
    playerState: {
      adoptedTraits: new Set(['photosynthesis']),
      discoveredTraits: new Set(['photosynthesis', 'tool-use']),
      environmentalTraits: new Set(['rocky-terrain']),
    },
    visibleTraits: new Set(['photosynthesis', 'tool-use', 'rocky-terrain']),
    onTraitClick: () => {},
    onTraitHover: () => {},
  },
};

export const LargeGraph: Story = {
  args: {
    traits: allTraits,
    edges: allEdges,
    playerState: {
      adoptedTraits: new Set(['cells', 'photosynthesis', 'chloroplasts', 'tool-use', 'cooperation']),
      discoveredTraits: new Set(allTraits.filter(t => !t.isEnvironmental).map(t => t.id)),
      environmentalTraits: new Set(allTraits.filter(t => t.isEnvironmental).map(t => t.id)),
      adoptableChoices: [{
        id: 'choice-1',
        options: ['c4-photosynthesis', 'stone-tools', 'language', 'problem-solving'],
        choiceType: 'adopt',
      }],
    },
    visibleTraits: allVisibleTraits,
    onTraitClick: () => {},
    onTraitHover: () => {},
  },
};

export const InteractiveFeatures: Story = {
  name: 'Interactive Features (Tooltips & Detail Panel)',
  args: {
    traits: allTraits.slice(0, 8),
    edges: allEdges.slice(0, 6),
    playerState: {
      adoptedTraits: new Set(['photosynthesis', 'cells']),
      discoveredTraits: new Set(['photosynthesis', 'chloroplasts', 'cells', 'tool-use']),
      environmentalTraits: new Set(['rocky-terrain']),
      adoptableChoices: [{
        id: 'choice-1',
        options: ['chloroplasts'],
        choiceType: 'adopt',
      }],
    },
    visibleTraits: new Set(allTraits.slice(0, 8).map(t => t.id)),
    onTraitClick: () => {},
    onTraitHover: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Hover over nodes to see tooltips and hover effects. Click on nodes to open the detail panel. Try hovering over edges to see relationship descriptions.',
      },
    },
  },
};

export const NotDiscoveredTraits: Story = {
  name: 'Not Discovered Traits (Ghosted)',
  args: {
    traits: allTraits.slice(0, 6),
    edges: allEdges.slice(0, 4),
    playerState: {
      adoptedTraits: new Set(['cells']),
      discoveredTraits: new Set(['cells', 'photosynthesis']),
      environmentalTraits: new Set(['rocky-terrain']),
    },
    visibleTraits: new Set(allTraits.slice(0, 6).map(t => t.id)),
    onTraitClick: () => {},
    onTraitHover: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how not-discovered traits appear ghosted with reduced opacity. Notice how the undiscovered traits (chloroplasts, tool-use, etc.) are very faint.',
      },
    },
  },
};