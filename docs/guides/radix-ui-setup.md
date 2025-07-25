# Radix UI Integration Guide

This guide explains how to set up and use Radix UI in Tetraspore for rapid UI prototyping.

## Why Radix UI?

Radix UI provides:

- **Unstyled components** - Full control over appearance with Tailwind
- **Accessibility built-in** - WAI-ARIA compliant out of the box
- **Tiny bundle size** - ~149B per primitive, tree-shakeable
- **TypeScript support** - Excellent type definitions
- **AI-agent friendly** - Clear docs and predictable APIs

## Installation

Install only the components you need:

```bash
# Core components for Tetraspore
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select
npm install @radix-ui/react-slider
npm install @radix-ui/react-switch
npm install @radix-ui/react-tabs
npm install @radix-ui/react-tooltip
npm install @radix-ui/react-popover
npm install @radix-ui/react-separator

# Icons (optional but useful)
npm install @radix-ui/react-icons
```

## Basic Usage Pattern

Radix UI components are primitives that you style with Tailwind:

```tsx
import * as Dialog from "@radix-ui/react-dialog";

export const GameDialog: FC<GameDialogProps> = ({
  open,
  onOpenChange,
  title,
  children,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-lg p-6 shadow-xl">
          <Dialog.Title className="text-xl font-bold text-white mb-4">
            {title}
          </Dialog.Title>
          {children}
          <Dialog.Close className="absolute top-2 right-2 text-gray-400 hover:text-white">
            <Cross2Icon />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
```

## Component Patterns for Tetraspore

### 1. Dropdown Menu (for Region Actions)

```tsx
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export const RegionActionsMenu: FC<RegionActionsMenuProps> = ({
  region,
  onAction,
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="p-2 rounded hover:bg-gray-700">
        <DotsHorizontalIcon />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="bg-gray-800 rounded-md p-1 shadow-lg">
          <DropdownMenu.Item
            className="px-3 py-2 hover:bg-gray-700 cursor-pointer"
            onSelect={() => onAction({ type: "migrate_species" })}
          >
            Migrate Species Here
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-600 my-1" />

          <DropdownMenu.Item
            className="px-3 py-2 hover:bg-gray-700 cursor-pointer"
            onSelect={() => onAction({ type: "terraform" })}
          >
            Terraform Region
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
```

### 2. Select (for Species Filter)

```tsx
import * as Select from "@radix-ui/react-select";

export const SpeciesFilter: FC<SpeciesFilterProps> = ({
  species,
  value,
  onChange,
}) => {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-md">
        <Select.Value placeholder="Select species..." />
        <Select.Icon>
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="bg-gray-800 rounded-md shadow-lg">
          <Select.Viewport className="p-1">
            {species.map((s) => (
              <Select.Item
                key={s.id}
                value={s.id}
                className="px-3 py-2 hover:bg-gray-700 cursor-pointer"
              >
                <Select.ItemText>{s.name}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
```

### 3. Slider (for Time Control)

```tsx
import * as Slider from "@radix-ui/react-slider";

export const TimelineSlider: FC<TimelineSliderProps> = ({
  currentTurn,
  maxTurn,
  onTurnChange,
}) => {
  return (
    <Slider.Root
      className="relative flex items-center w-full h-5"
      value={[currentTurn]}
      onValueChange={([turn]) => onTurnChange(turn)}
      max={maxTurn}
      step={1}
    >
      <Slider.Track className="bg-gray-700 relative grow rounded-full h-1">
        <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
      </Slider.Track>
      <Slider.Thumb
        className="block w-5 h-5 bg-white rounded-full shadow-lg hover:bg-gray-100"
        aria-label="Turn"
      />
    </Slider.Root>
  );
};
```

### 4. Tabs (for View Switching)

```tsx
import * as Tabs from "@radix-ui/react-tabs";

export const GameViewTabs: FC<GameViewTabsProps> = ({
  currentView,
  onViewChange,
}) => {
  return (
    <Tabs.Root value={currentView} onValueChange={onViewChange}>
      <Tabs.List className="flex gap-1 bg-gray-800 p-1 rounded-lg">
        <Tabs.Trigger
          value="planet"
          className="px-4 py-2 rounded data-[state=active]:bg-gray-700"
        >
          Planet
        </Tabs.Trigger>
        <Tabs.Trigger
          value="evolution"
          className="px-4 py-2 rounded data-[state=active]:bg-gray-700"
        >
          Evolution
        </Tabs.Trigger>
        <Tabs.Trigger
          value="technology"
          className="px-4 py-2 rounded data-[state=active]:bg-gray-700"
        >
          Technology
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  );
};
```

### 5. Tooltip (for Species Info)

```tsx
import * as Tooltip from "@radix-ui/react-tooltip";

export const SpeciesTooltip: FC<SpeciesTooltipProps> = ({
  species,
  children,
}) => {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-900 text-white px-3 py-2 rounded-md shadow-lg"
            sideOffset={5}
          >
            <div className="font-bold">{species.name}</div>
            <div className="text-sm text-gray-300">
              Population: {species.totalPopulation.toLocaleString()}
            </div>
            <div className="text-sm text-gray-300">
              Status: {species.populationTrend}
            </div>
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
```

## Styling Best Practices

### 1. Create Consistent Variants

```tsx
// utils/radix-styles.ts
export const buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-700 hover:bg-gray-600 text-gray-100",
  danger: "bg-red-600 hover:bg-red-700 text-white",
};

export const menuItemStyles =
  "px-3 py-2 hover:bg-gray-700 cursor-pointer rounded";
```

### 2. Use Data Attributes

Radix provides data attributes for state-based styling:

```css
/* Tailwind utilities using data attributes */
.data-\[state\=open\]\:rotate-180 {
  transform: rotate(180deg);
}

.data-\[disabled\]\:opacity-50 {
  opacity: 0.5;
}
```

### 3. Animation with Tailwind

```tsx
<Dialog.Overlay
  className="fixed inset-0 bg-black/50 animate-in fade-in duration-300"
/>

<Dialog.Content
  className="animate-in slide-in-from-bottom duration-300"
/>
```

## Accessibility Features

Radix UI handles accessibility automatically:

- **Keyboard navigation** - Tab, arrow keys, escape
- **Screen readers** - Proper ARIA labels and roles
- **Focus management** - Traps focus in modals
- **Announcements** - Live regions for dynamic content

You just need to provide semantic HTML and labels:

```tsx
<Select.Trigger aria-label="Select species to view">
  <Select.Value />
</Select.Trigger>
```

## Integration with Storybook

Create stories for each Radix-based component:

```tsx
// GameDialog.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { GameDialog } from "./GameDialog";

const meta = {
  title: "UI/GameDialog",
  component: GameDialog,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof GameDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    title: "Species Evolution",
    children: <p>Evolution options here...</p>,
  },
};

export const WithForm: Story = {
  args: {
    open: true,
    title: "Create New Species",
    children: (
      <form className="space-y-4">
        <input
          className="w-full px-3 py-2 bg-gray-800 rounded"
          placeholder="Species name..."
        />
        <button className="px-4 py-2 bg-blue-600 rounded">Create</button>
      </form>
    ),
  },
};
```

## Performance Tips

1. **Import only what you use** - Each component is separate
2. **Lazy load heavy components** - Use React.lazy for modals
3. **Memoize callbacks** - Prevent unnecessary re-renders
4. **Use portal for overlays** - Renders outside component tree

```tsx
const handleAction = useCallback(
  (action: RegionAction) => {
    executeCommand({
      type: "REGION_ACTION",
      payload: action,
    });
  },
  [executeCommand],
);
```

## Common Patterns

### Controlled vs Uncontrolled

```tsx
// Controlled (recommended for game state)
<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>

// Uncontrolled (for simple UI state)
<Dialog.Root defaultOpen={false}>
```

### Composition Pattern

```tsx
// Create game-specific wrappers
export const GameSelect = forwardRef<HTMLButtonElement, GameSelectProps>(
  ({ label, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <label className="text-sm text-gray-400">{label}</label>}
        <Select.Root {...props}>{/* Standard game styling */}</Select.Root>
      </div>
    );
  },
);
```

## Troubleshooting

### Components not appearing

Ensure you're using Portal for overlay components:

```tsx
<Dialog.Portal>
  <Dialog.Overlay />
  <Dialog.Content />
</Dialog.Portal>
```

### Styling not applied

Check Tailwind content paths include Radix components:

```js
// tailwind.config.js
content: [
  "./src/**/*.{ts,tsx}",
  "./node_modules/@radix-ui/**/*.js", // If using Radix wrappers
];
```

### TypeScript errors

Radix has excellent types, but you may need:

```tsx
import type { ComponentPropsWithoutRef } from "react";

type DialogProps = ComponentPropsWithoutRef<typeof Dialog.Root> & {
  // Your additions
};
```

## Next Steps

1. Install needed Radix components
2. Create wrapper components with game styling
3. Build Storybook stories for each
4. Test with mock data
5. Integrate with command system

This setup provides a solid foundation for rapid UI prototyping while maintaining quality and accessibility.
