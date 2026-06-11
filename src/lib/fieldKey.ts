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
