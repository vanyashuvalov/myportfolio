/* ANCHOR: project_folder_layout_config */
/* FSD: shared/config → reusable project folder placement presets */
/* PURPOSE: Centralized absolute positions for project folder widgets on the desktop canvas */
/* WHY: Keeps project folder placement data out of rendering logic so the layout can scale to new projects without duplicating coordinates */
/* CONNECTED: Used by features/desktop-canvas and folder widgets */

/**
 * Maximum number of project folders rendered on the desktop canvas.
 * The layout intentionally caps the visible set so the workspace stays readable.
 */
export const PROJECT_FOLDER_LIMIT = 10;

/**
 * Absolute placement presets for project folders.
 * Each slot keeps a stable canvas position while staying perfectly level for the cleaner desktop composition.
 */
export const PROJECT_FOLDER_LAYOUT = [
  { left: '32%', top: '14%', rotation: 0 },
  { left: '48%', top: '14%', rotation: 0 },
  { left: '38%', top: '37%', rotation: 0 },
  { left: '56%', top: '36%', rotation: 0 },
  { left: '22%', top: '37%', rotation: 0 },
  { left: '14%', top: '56%', rotation: 0 },
  { left: '32%', top: '56%', rotation: 0 },
  { left: '50%', top: '56%', rotation: 0 },
  { left: '68%', top: '56%', rotation: 0 },
  { left: '76%', top: '36%', rotation: 0 }
];

/**
 * Resolve the project folder placement for a given index.
 * @param {number} index - Zero-based project index
 * @returns {{left: string, top: string, rotation: number}} Placement preset
 */
export function getProjectFolderLayout(index) {
  return PROJECT_FOLDER_LAYOUT[index] || PROJECT_FOLDER_LAYOUT[PROJECT_FOLDER_LAYOUT.length - 1];
}
