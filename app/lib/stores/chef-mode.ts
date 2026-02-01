/**
 * Chef Mode Store
 * 
 * Manages the Chef Mode state including:
 * - Chef Mode enabled/disabled state
 * - Compiled PageSpec
 * - Compilation diagnostics
 * - Real-time compilation on file save
 */

import { atom, type WritableAtom } from 'nanostores';
import { createDebouncedCompiler, isChefFile, type PageSpec, type Diagnostic } from '~/lib/chef-mode/compiler-hook';

export interface ChefModeState {
    /** Whether Chef Mode is enabled */
    enabled: boolean;
    /** The current file being edited (must be a .chef.ts file) */
    activeFile: string | null;
    /** Whether we're currently compiling */
    isCompiling: boolean;
    /** The compiled PageSpec (null if compilation failed) */
    pageSpec: PageSpec | null;
    /** Compiler diagnostics (errors and warnings) */
    diagnostics: Diagnostic[];
    /** Last successful compile timestamp */
    lastCompileTime: number | null;
}

const initialState: ChefModeState = {
    enabled: false,
    activeFile: null,
    isCompiling: false,
    pageSpec: null,
    diagnostics: [],
    lastCompileTime: null,
};

export class ChefModeStore {
    /** The main state atom */
    state: WritableAtom<ChefModeState> = atom(initialState);

    /** Debounced compiler instance */
    #compiler = createDebouncedCompiler(300);

    /** Callbacks to notify when compilation completes */
    #onCompileCallbacks: Array<(state: ChefModeState) => void> = [];

    /**
     * Toggle Chef Mode on/off
     */
    setEnabled(enabled: boolean) {
        const current = this.state.get();
        this.state.set({ ...current, enabled });

        if (!enabled) {
            // Clear compiler state when disabled
            this.#compiler.cancel();
            this.state.set({
                ...this.state.get(),
                pageSpec: null,
                diagnostics: [],
                isCompiling: false,
            });
        }
    }

    /**
     * Check if a file is a Chef DSL file
     */
    isChefFile(filePath: string): boolean {
        return isChefFile(filePath);
    }

    /**
     * Set the active file being edited
     */
    setActiveFile(filePath: string | null) {
        const current = this.state.get();
        const isChef = filePath ? this.isChefFile(filePath) : false;

        this.state.set({
            ...current,
            activeFile: isChef ? filePath : null,
        });
    }

    /**
     * Compile the current Chef DSL file
     */
    compile(source: string, filePath: string) {
        if (!this.state.get().enabled) {
            return;
        }

        if (!this.isChefFile(filePath)) {
            return;
        }

        // Set compiling state
        this.state.set({
            ...this.state.get(),
            isCompiling: true,
            activeFile: filePath,
        });

        this.#compiler.compile(source, filePath, (result) => {
            const newState: ChefModeState = {
                ...this.state.get(),
                isCompiling: false,
                pageSpec: result.pageSpec,
                diagnostics: result.diagnostics,
                lastCompileTime: Date.now(),
            };

            this.state.set(newState);

            // Notify callbacks
            for (const callback of this.#onCompileCallbacks) {
                callback(newState);
            }
        });
    }

    /**
     * Called when a file is saved - triggers compilation for .chef.ts files
     */
    onFileSaved(filePath: string, content: string) {
        if (this.state.get().enabled && this.isChefFile(filePath)) {
            this.compile(content, filePath);
        }
    }

    /**
     * Called when file content changes - triggers debounced compilation
     */
    onFileChanged(filePath: string, content: string) {
        if (this.state.get().enabled && this.isChefFile(filePath)) {
            this.compile(content, filePath);
        }
    }

    /**
     * Register a callback for compilation completion
     */
    onCompile(callback: (state: ChefModeState) => void) {
        this.#onCompileCallbacks.push(callback);
        return () => {
            const index = this.#onCompileCallbacks.indexOf(callback);
            if (index > -1) {
                this.#onCompileCallbacks.splice(index, 1);
            }
        };
    }

    /**
     * Get current errors
     */
    getErrors(): Diagnostic[] {
        return this.state.get().diagnostics.filter(d => d.severity === 'error');
    }

    /**
     * Get current warnings
     */
    getWarnings(): Diagnostic[] {
        return this.state.get().diagnostics.filter(d => d.severity === 'warning');
    }

    /**
     * Check if current compilation was successful
     */
    isValid(): boolean {
        return this.state.get().pageSpec !== null;
    }

    /**
     * Reset to initial state
     */
    reset() {
        this.#compiler.cancel();
        this.state.set(initialState);
    }
}

// Singleton instance
export const chefModeStore = new ChefModeStore();
