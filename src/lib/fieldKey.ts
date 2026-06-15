/** Converts a display label to an internal field key (e.g. "Property Type" → "property_type"). */
export function labelToFieldKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

/** Field indices whose key was manually edited and should not be auto-synced from the label. */
export function getManualFieldKeyIndices(fields: { label: string; key: string }[]): Set<number> {
  const manual = new Set<number>();
  fields.forEach((field, index) => {
    if (field.key && field.label && field.key !== labelToFieldKey(field.label)) {
      manual.add(index);
    }
  });
  return manual;
}

/** Move an item within an array (returns a new array). */
export function reorderArrayItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  if (moved === undefined) return items;
  next.splice(toIndex, 0, moved);
  return next;
}
