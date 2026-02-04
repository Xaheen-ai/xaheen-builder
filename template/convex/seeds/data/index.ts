/**
 * Export all seed data
 */

export { LOKALER_RESOURCES } from "./lokaler";
export { SPORT_RESOURCES } from "./sport";
export { ARRANGEMENTER_RESOURCES } from "./arrangementer";
export { TORGET_RESOURCES } from "./torget";

import { LOKALER_RESOURCES } from "./lokaler";
import { SPORT_RESOURCES } from "./sport";
import { ARRANGEMENTER_RESOURCES } from "./arrangementer";
import { TORGET_RESOURCES } from "./torget";

export const ALL_RESOURCES = [
    ...LOKALER_RESOURCES,
    ...SPORT_RESOURCES,
    ...ARRANGEMENTER_RESOURCES,
    ...TORGET_RESOURCES,
];
