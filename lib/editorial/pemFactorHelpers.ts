import {
  pemFactorCatalog,
  type PemFactorDefinition,
  type PemFactorGroup,
} from "./pemFactorCatalog";

export function getPemFactorsByGroup(
  group: PemFactorGroup
): PemFactorDefinition[] {
  return pemFactorCatalog
    .filter((item) => item.group === group)
    .sort((a, b) => b.priority - a.priority);
}

export function getPemFactorById(
  id: string,
  group?: PemFactorGroup
): PemFactorDefinition | undefined {
  if (group) {
    return pemFactorCatalog.find(
      (item) => item.group === group && item.id === id
    );
  }

  return pemFactorCatalog.find((item) => item.id === id);
}

export function getPemLabel(
  id: string,
  group?: PemFactorGroup
): string {
  return getPemFactorById(id, group)?.label ?? id;
}

export function getPemIcon(
  id: string,
  group?: PemFactorGroup
): string | undefined {
  return getPemFactorById(id, group)?.icon;
}
