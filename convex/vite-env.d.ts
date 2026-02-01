// Type declaration for Vite's import.meta.glob
interface ImportMeta {
    glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}
