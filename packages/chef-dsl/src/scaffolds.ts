/**
 * @xala/chef-dsl - Scaffold Functions
 *
 * The ONLY five scaffold types allowed as default exports.
 * Each scaffold maps 1-to-1 to a Gazetteer layoutType.
 */

import type {
    PageConfig,
    ListPageConfig,
    DetailPageConfig,
    FormPageConfig,
    WizardPageConfig,
    DashboardPageConfig,
} from "./types";

export function ListPage(config: ListPageConfig): PageConfig {
    return {
        __scaffoldType: "ListPage",
        config,
    } as const;
}

export function DetailPage(config: DetailPageConfig): PageConfig {
    return {
        __scaffoldType: "DetailPage",
        config,
    } as const;
}

export function FormPage(config: FormPageConfig): PageConfig {
    return {
        __scaffoldType: "FormPage",
        config,
    } as const;
}

export function WizardPage(config: WizardPageConfig): PageConfig {
    return {
        __scaffoldType: "WizardPage",
        config,
    } as const;
}

export function DashboardPage(config: DashboardPageConfig): PageConfig {
    return {
        __scaffoldType: "DashboardPage",
        config,
    } as const;
}
