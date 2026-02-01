/**
 * @xala/chef-dsl - Helper Functions
 *
 * The ONLY four helper functions allowed in Chef DSL files.
 * These create type-safe binding and navigation references.
 */

import type { Binding, ControllerRef, Navigation, TranslationKey } from "./types";

/**
 * Allowed binding prefixes for runtime data references.
 */
const ALLOWED_PREFIXES = [
    "vm.",
    "form.",
    "route.params.",
    "user.",
    "config.",
    "i18n.",
] as const;

/**
 * Create a binding to runtime data.
 */
export function bind(path: string): Binding {
    const isValid = ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));

    if (!isValid) {
        throw new Error(
            `Invalid binding path: "${path}". ` +
            `Must start with one of: ${ALLOWED_PREFIXES.join(", ")}`
        );
    }

    return {
        __type: "binding",
        path,
    } as const;
}

/**
 * Create a reference to a controller hook.
 */
export function ref(controller: string): ControllerRef {
    if (!controller || !/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/i.test(controller)) {
        throw new Error(
            `Invalid controller reference: "${controller}". ` +
            `Must be a dot-separated path like "app.users.list"`
        );
    }

    return {
        __type: "controllerRef",
        controller,
    } as const;
}

/**
 * Create a navigation action to another route.
 */
export function go(
    routeId: string,
    params?: Record<string, Binding | string>
): Navigation {
    if (!routeId || !/^[a-z][a-z0-9-]*$/i.test(routeId)) {
        throw new Error(
            `Invalid route ID: "${routeId}". ` +
            `Must be lowercase alphanumeric with hyphens (e.g., "user-detail")`
        );
    }

    return {
        __type: "navigation",
        routeId,
        params,
    } as const;
}

/**
 * Create a translation key reference.
 */
export function key(i18nKey: string): TranslationKey {
    if (!i18nKey || !/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/i.test(i18nKey)) {
        throw new Error(
            `Invalid translation key: "${i18nKey}". ` +
            `Must be a dot-separated path like "pages.users.title"`
        );
    }

    return {
        __type: "translationKey",
        key: i18nKey,
    } as const;
}
