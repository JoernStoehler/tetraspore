import { Choice, Species, Feature } from '../../types'
import { GameEvent } from '../../types/events'
import { LLMService, GameContext } from './types'

export class MockLLMService implements LLMService {
  private readonly delay = 800 // Simulate realistic API delay

  private async mockDelay<T>(data: T): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, this.delay + Math.random() * 400))
    return data
  }

  async generateChoices(context: GameContext): Promise<Choice[]> {
    const choices = this.getChoicesForContext(context)
    return this.mockDelay(choices)
  }

  async generateNarration(event: GameEvent): Promise<string> {
    const narration = this.getNarrationForEvent(event)
    return this.mockDelay(narration)
  }

  async generateSpeciesDescription(species: Species): Promise<string> {
    const description = this.getSpeciesDescription(species)
    return this.mockDelay(description)
  }

  async evolveSpeciesName(species: Species, feature: Feature): Promise<string> {
    const newName = this.generateEvolvedName(species, feature)
    return this.mockDelay(newName)
  }

  private getChoicesForContext(context: GameContext): Choice[] {
    const { currentTurn } = context
    const availableChoices = [...this.physicalChoices, ...this.cognitiveChoices, ...this.socialChoices, ...this.technologicalChoices]
    
    // Select 4-6 choices based on turn and context
    const numChoices = 4 + Math.floor(Math.random() * 3)
    const selectedChoices: Choice[] = []
    
    // Ensure variety across categories
    const categories: Array<Choice['category']> = ['physical', 'cognitive', 'social', 'technological']
    categories.forEach(category => {
      const categoryChoices = availableChoices.filter(c => c.category === category)
      if (categoryChoices.length > 0) {
        const randomChoice = categoryChoices[Math.floor(Math.random() * categoryChoices.length)]
        selectedChoices.push({
          ...randomChoice,
          id: `${category}-${currentTurn}-${Date.now()}`
        })
      }
    })

    // Fill remaining slots with random choices
    while (selectedChoices.length < numChoices) {
      const randomChoice = availableChoices[Math.floor(Math.random() * availableChoices.length)]
      if (!selectedChoices.some(c => c.title === randomChoice.title)) {
        selectedChoices.push({
          ...randomChoice,
          id: `random-${currentTurn}-${Date.now()}-${selectedChoices.length}`
        })
      }
    }

    return selectedChoices
  }

  private readonly physicalChoices: Omit<Choice, 'id'>[] = [
    {
      title: "Enhanced Sensory Organs",
      description: "Develop more sophisticated eyes, ears, or other sensory apparatus",
      category: "physical",
      flavorText: "The world becomes clearer as new sensory pathways emerge"
    },
    {
      title: "Protective Shell Development",
      description: "Grow hardened external protection against environmental threats",
      category: "physical",
      flavorText: "A fortress of chitin and bone shields vulnerable flesh"
    },
    {
      title: "Improved Locomotion",
      description: "Enhanced movement capabilities - faster, more agile, or new forms of travel",
      category: "physical",
      flavorText: "Swift limbs carry the species to new horizons"
    },
    {
      title: "Size Adaptation",
      description: "Significant increase or decrease in body size for efficiency",
      category: "physical",
      flavorText: "Scale brings its own advantages and challenges"
    },
    {
      title: "Environmental Resistance",
      description: "Develop immunity to toxins, radiation, or extreme temperatures",
      category: "physical",
      flavorText: "What once was poison becomes mere sustenance"
    },
    {
      title: "Regenerative Abilities",
      description: "Capacity to regrow lost limbs and heal rapidly from injuries",
      category: "physical",
      flavorText: "Death becomes a temporary inconvenience"
    },
    {
      title: "Bioluminescence",
      description: "Ability to produce and control natural light",
      category: "physical",
      flavorText: "Inner light pierces the darkest depths"
    },
    {
      title: "Specialized Appendages",
      description: "Develop tools integrated into the body - claws, tendrils, or manipulation organs",
      category: "physical",
      flavorText: "The body becomes its own workshop"
    }
  ]

  private readonly cognitiveChoices: Omit<Choice, 'id'>[] = [
    {
      title: "Pattern Recognition",
      description: "Enhanced ability to identify complex patterns in environment and behavior",
      category: "cognitive",
      flavorText: "Order emerges from chaos in the mind's eye"
    },
    {
      title: "Memory Palace",
      description: "Vast improvement in memory capacity and recall abilities",
      category: "cognitive",
      flavorText: "The past becomes as vivid as the present"
    },
    {
      title: "Abstract Reasoning",
      description: "Capacity for symbolic thought and mathematical understanding",
      category: "cognitive",
      flavorText: "Mind grasps concepts beyond the physical world"
    },
    {
      title: "Emotional Intelligence",
      description: "Deep understanding of internal and external emotional states",
      category: "cognitive",
      flavorText: "Hearts become as readable as landscapes"
    },
    {
      title: "Temporal Processing",
      description: "Enhanced ability to perceive and plan across extended time periods",
      category: "cognitive",
      flavorText: "The future unfolds like a map in the mind"
    },
    {
      title: "Creative Synthesis",
      description: "Ability to combine unrelated concepts into novel solutions",
      category: "cognitive",
      flavorText: "Innovation springs from unexpected connections"
    },
    {
      title: "Metacognition",
      description: "Awareness and understanding of one's own thought processes",
      category: "cognitive",
      flavorText: "The mind turns its gaze upon itself"
    },
    {
      title: "Intuitive Leaps",
      description: "Capacity for sudden insights that bypass logical reasoning",
      category: "cognitive",
      flavorText: "Truth arrives unbidden, complete and certain"
    }
  ]

  private readonly socialChoices: Omit<Choice, 'id'>[] = [
    {
      title: "Hierarchical Organization",
      description: "Develop complex social structures with specialized roles",
      category: "social",
      flavorText: "Order brings strength to the scattered many"
    },
    {
      title: "Cooperative Hunting",
      description: "Coordinated group tactics for resource acquisition",
      category: "social",
      flavorText: "United predators become unstoppable force"
    },
    {
      title: "Knowledge Transmission",
      description: "Systematic methods for passing information between generations",
      category: "social",
      flavorText: "Wisdom flows like a river through time"
    },
    {
      title: "Empathic Bonding",
      description: "Deep emotional connections that strengthen group cohesion",
      category: "social",
      flavorText: "Hearts beat as one across the tribe"
    },
    {
      title: "Territorial Expansion",
      description: "Organized expansion into new regions through group coordination",
      category: "social",
      flavorText: "Borders stretch as communities grow bold"
    },
    {
      title: "Ritual Development",
      description: "Ceremonial practices that reinforce social bonds and identity",
      category: "social",
      flavorText: "Sacred acts bind souls across generations"
    },
    {
      title: "Specialized Castes",
      description: "Division of labor into distinct social and functional roles",
      category: "social",
      flavorText: "Each finds their purpose in the greater whole"
    },
    {
      title: "Collective Intelligence",
      description: "Shared decision-making that harnesses group wisdom",
      category: "social",
      flavorText: "Many minds become one unstoppable intellect"
    }
  ]

  private readonly technologicalChoices: Omit<Choice, 'id'>[] = [
    {
      title: "Tool Crafting",
      description: "Development of external implements to enhance capabilities",
      category: "technological",
      flavorText: "Stone and bone become extensions of will"
    },
    {
      title: "Fire Mastery",
      description: "Control and utilization of combustion for warmth, cooking, and protection",
      category: "technological",
      flavorText: "The first flame banishes primordial darkness"
    },
    {
      title: "Shelter Construction",
      description: "Building permanent or semi-permanent protective structures",
      category: "technological",
      flavorText: "Home becomes fortress against the wild"
    },
    {
      title: "Agriculture Innovation",
      description: "Systematic cultivation and domestication of food sources",
      category: "technological",
      flavorText: "Wild growth bends to cultivated purpose"
    },
    {
      title: "Metal Working",
      description: "Extraction and shaping of metallic materials for tools and art",
      category: "technological",
      flavorText: "Earth's hidden treasures yield to clever hands"
    },
    {
      title: "Energy Harnessing",
      description: "Capture and direction of natural forces like wind, water, or solar power",
      category: "technological",
      flavorText: "The world's own power serves new masters"
    },
    {
      title: "Information Storage",
      description: "Systems for preserving and organizing knowledge outside of memory",
      category: "technological",
      flavorText: "Thoughts outlive thinkers in lasting form"
    },
    {
      title: "Transportation Networks",
      description: "Infrastructure for rapid movement across distances",
      category: "technological",
      flavorText: "Distance crumbles before ingenuity's advance"
    }
  ]

  private getNarrationForEvent(event: GameEvent): string {
    switch (event.type) {
      case 'CREATE_SPECIES':
        return this.getSpeciesCreationNarration(event)
      case 'EXTINCT_SPECIES':
        return this.getExtinctionNarration(event)
      case 'SPECIES_ENTERS_REGION':
        return this.getMigrationNarration(event, 'enters')
      case 'SPECIES_LEAVES_REGION':
        return this.getMigrationNarration(event, 'leaves')
      case 'CREATE_REGION':
        return this.getRegionCreationNarration(event)
      case 'CREATE_FEATURE':
        return this.getFeatureCreationNarration(event)
      case 'DELETE_FEATURE':
        return this.getFeatureDeletionNarration(event)
      case 'CHOICE_SELECTED':
        return this.getChoiceNarration(event)
      case 'TURN_PROCESSED':
        return this.getTurnNarration(event)
      default:
        return "The wheel of time turns, bringing change to all things."
    }
  }

  private getSpeciesCreationNarration(event: { name: string; description: string; parentSpecies?: string }): string {
    const narrations = [
      `In the crucible of evolution, ${event.name} emerges with remarkable adaptations. ${event.description} This new chapter in life's grand story begins with promise and uncertainty.`,
      `The spark of change ignites as ${event.name} takes its first steps into existence. Born from the pressure of survival, this species carries the hopes of its lineage forward.`,
      `Through countless generations of subtle change, ${event.name} has crossed the threshold into something entirely new. Nature's endless creativity manifests in unexpected forms.`,
      `The dance of genetics and environment culminates in the birth of ${event.name}. Each adaptation tells a story of challenges overcome and possibilities embraced.`
    ]
    return narrations[Math.floor(Math.random() * narrations.length)]
  }

  private getExtinctionNarration(event: { speciesName: string; reason?: string }): string {
    const narrations = [
      `The final chapter closes for ${event.speciesName}. ${event.reason || 'The changing world no longer holds a place for them.'} Yet their legacy lives on in the complex web of life they helped weave.`,
      `Silence falls where once ${event.speciesName} thrived. Though their voice is stilled, the echoes of their existence will resonate through the ages.`,
      `The last of ${event.speciesName} fades into memory, joining the countless forms that have walked this path before. In their passing, space is made for new life to flourish.`,
      `${event.speciesName} becomes one with the fossil record, their story preserved in stone and memory. Evolution's wheel turns ever onward.`
    ]
    return narrations[Math.floor(Math.random() * narrations.length)]
  }

  private getMigrationNarration(event: { speciesName: string; regionName: string }, direction: 'enters' | 'leaves'): string {
    if (direction === 'enters') {
      const narrations = [
        `${event.speciesName} sets foot in ${event.regionName}, their eyes bright with the promise of new opportunities. The land watches as these newcomers begin to make their mark.`,
        `The boundaries of ${event.regionName} expand to welcome ${event.speciesName}. New relationships form as species and landscape begin their ancient dance of adaptation.`,
        `Like waves reaching a distant shore, ${event.speciesName} arrives in ${event.regionName}. The ecosystem holds its breath as balance shifts to accommodate these new participants.`
      ]
      return narrations[Math.floor(Math.random() * narrations.length)]
    } else {
      const narrations = [
        `${event.speciesName} turns away from ${event.regionName}, carrying memories of this chapter in their journey. The land grows quieter in their absence.`,
        `The path leads ${event.speciesName} beyond the borders of ${event.regionName}. Behind them, ecological niches slowly shift to fill the space they once occupied.`,
        `With the changing seasons, ${event.speciesName} departs ${event.regionName} for horizons unknown. The cycle of arrival and departure continues its eternal rhythm.`
      ]
      return narrations[Math.floor(Math.random() * narrations.length)]
    }
  }

  private getRegionCreationNarration(event: { name: string; description: string }): string {
    const narrations = [
      `${event.name} emerges from the mists of time, its unique character now defined and ready to host life's endless experiment. ${event.description}`,
      `The map of the world grows richer with the recognition of ${event.name}. This distinct realm offers new possibilities for those bold enough to explore its mysteries.`,
      `Geography and ecology converge to birth ${event.name}, a place where the environment itself tells stories of deep time and patient transformation.`
    ]
    return narrations[Math.floor(Math.random() * narrations.length)]
  }

  private getFeatureCreationNarration(event: { name: string; category: string; regionName: string }): string {
    const narrations = [
      `${event.name} manifests in ${event.regionName}, adding new complexity to an already rich tapestry. This ${event.category} feature will reshape the possibilities for all who encounter it.`,
      `The landscape of ${event.regionName} gains depth with the emergence of ${event.name}. Like a new note in a familiar melody, it harmonizes with existing patterns while adding its own voice.`,
      `Change comes to ${event.regionName} in the form of ${event.name}. This development opens new pathways for evolution and adaptation.`
    ]
    return narrations[Math.floor(Math.random() * narrations.length)]
  }

  private getFeatureDeletionNarration(event: { featureName: string; regionName: string }): string {
    const narrations = [
      `${event.featureName} fades from ${event.regionName}, its time of influence drawing to a close. The region adapts to this absence, finding new equilibrium.`,
      `The familiar presence of ${event.featureName} in ${event.regionName} becomes memory. What was once essential transforms into space for new possibilities.`,
      `${event.regionName} evolves as ${event.featureName} disappears, the ecosystem flowing around this change like water around a removed stone.`
    ]
    return narrations[Math.floor(Math.random() * narrations.length)]
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getChoiceNarration(_event: { choiceId: string }): string {
    const narrations = [
      `A pivotal decision echoes across the generations. The path chosen today will shape countless tomorrows, setting species on courses yet unimagined.`,
      `In the crucial moment of choice, wisdom and instinct combine to chart a new direction. The consequences will unfold like ripples across the pond of time.`,
      `The die is cast, the choice made. What seemed like a simple decision reveals itself as a turning point in the grand narrative of evolution.`
    ]
    return narrations[Math.floor(Math.random() * narrations.length)]
  }

  private getTurnNarration(event: { turnNumber: number }): string {
    const narrations = [
      `Turn ${event.turnNumber} draws to a close as the world processes the accumulated changes. Each decision made resonates through the intricate web of cause and effect.`,
      `The great wheel completes another revolution. Turn ${event.turnNumber} has woven new threads into the tapestry of existence, creating patterns both beautiful and complex.`,
      `Time's passage brings Turn ${event.turnNumber} to its natural conclusion. The seeds planted in this cycle will bloom in ways yet to be discovered.`
    ]
    return narrations[Math.floor(Math.random() * narrations.length)]
  }

  private getSpeciesDescription(species: Species): string {
    const descriptiveStyles = [
      `${species.name} represents a fascinating convergence of form and function. ${species.description} Their presence in the ecosystem demonstrates nature's endless capacity for innovation and adaptation.`,
      `In the grand theater of evolution, ${species.name} plays a unique role. ${species.description} Each individual carries within them the accumulated wisdom of countless generations.`,
      `${species.name} embodies the principle that life finds a way. ${species.description} They have carved out their niche through patience, adaptation, and the inexorable pressure of survival.`,
      `The story of ${species.name} is written in every cell and behavior. ${species.description} They stand as testament to evolution's creative power and the beauty of natural selection.`
    ]
    return descriptiveStyles[Math.floor(Math.random() * descriptiveStyles.length)]
  }

  private generateEvolvedName(species: Species, feature: Feature): string {
    // Generate contextual name evolution based on feature category
    const baseName = species.name
    const featureType = feature.category
    
    const prefixes = {
      ecology: ['Forest', 'Verdant', 'Wild', 'Canopy', 'Root', 'Bloom'],
      geology: ['Stone', 'Crystal', 'Mountain', 'Deep', 'Mineral', 'Cave'],
      technology: ['Craft', 'Tool', 'Forge', 'Construct', 'Maker', 'Builder'],
      culture: ['Wise', 'Sacred', 'Ancient', 'Noble', 'Elder', 'Mystic']
    }
    
    const suffixes = {
      ecology: ['walker', 'tender', 'keeper', 'dweller', 'grower', 'nurturer'],
      geology: ['delver', 'shaper', 'miner', 'carver', 'seeker', 'guardian'],
      technology: ['smith', 'wright', 'builder', 'worker', 'crafter', 'designer'],
      culture: ['speaker', 'teacher', 'elder', 'keeper', 'guide', 'sage']
    }

    // Sometimes use prefix, sometimes suffix, sometimes both
    const evolutionType = Math.random()
    
    if (evolutionType < 0.3) {
      // Prefix only
      const prefix = prefixes[featureType][Math.floor(Math.random() * prefixes[featureType].length)]
      return `${prefix} ${baseName}`
    } else if (evolutionType < 0.6) {
      // Suffix only
      const suffix = suffixes[featureType][Math.floor(Math.random() * suffixes[featureType].length)]
      return `${baseName} ${suffix}`
    } else {
      // Combined evolution
      const prefix = prefixes[featureType][Math.floor(Math.random() * prefixes[featureType].length)]
      const suffix = suffixes[featureType][Math.floor(Math.random() * suffixes[featureType].length)]
      return `${prefix} ${baseName} ${suffix}`
    }
  }
}