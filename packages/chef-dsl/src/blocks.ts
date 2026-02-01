/**
 * @xala/chef-dsl/blocks - Block Factory Functions
 */

import type {
    HeaderBlock,
    HeaderBlockConfig,
    TableBlock,
    TableBlockConfig,
    FilterBarBlock,
    FilterBarBlockConfig,
    SectionBlock,
    SectionBlockConfig,
    StatsBlock,
    StatsBlockConfig,
    CardBlock,
    CardBlockConfig,
    TabsBlock,
    TabsBlockConfig,
    TimelineBlock,
    TimelineBlockConfig,
    EmptyStateBlock,
    EmptyStateBlockConfig,
    FormFieldBlock,
    FormFieldConfig,
    FormSectionBlock,
    FormSectionConfig,
    WizardStepBlock,
    WizardStepConfig,
    WizardNavBlock,
    WizardNavConfig,
    ActionButtonConfig,
} from "./types";

export function Header(config: HeaderBlockConfig): HeaderBlock {
    return { __blockType: "Header", config } as const;
}

export function Table(config: TableBlockConfig): TableBlock {
    return { __blockType: "Table", config } as const;
}

export function FilterBar(config: FilterBarBlockConfig): FilterBarBlock {
    return { __blockType: "FilterBar", config } as const;
}

export function Section(config: SectionBlockConfig): SectionBlock {
    return { __blockType: "Section", config } as const;
}

export function Stats(config: StatsBlockConfig): StatsBlock {
    return { __blockType: "Stats", config } as const;
}

export function Card(config: CardBlockConfig): CardBlock {
    return { __blockType: "Card", config } as const;
}

export function Tabs(config: TabsBlockConfig): TabsBlock {
    return { __blockType: "Tabs", config } as const;
}

export function Timeline(config: TimelineBlockConfig): TimelineBlock {
    return { __blockType: "Timeline", config } as const;
}

export function EmptyState(config: EmptyStateBlockConfig): EmptyStateBlock {
    return { __blockType: "EmptyState", config } as const;
}

export function Field(config: FormFieldConfig): FormFieldBlock {
    return { __blockType: "FormField", config } as const;
}

export function FormSection(config: FormSectionConfig): FormSectionBlock {
    return { __blockType: "FormSection", config } as const;
}

export function WizardStep(config: WizardStepConfig): WizardStepBlock {
    return { __blockType: "WizardStep", config } as const;
}

export function WizardNav(config: WizardNavConfig): WizardNavBlock {
    return { __blockType: "WizardNav", config } as const;
}

export function Button(config: ActionButtonConfig): ActionButtonConfig {
    return config;
}
