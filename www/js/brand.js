const PERSONAL_BRAND = {
  monogram: 'LL',
  ownerName: 'Lauren Landman',
  ariaLabel: "Lauren Landman's class planner",
};

const DEFAULT_BRAND = {
  monogram: 'N',
  ownerName: 'Namast',
  ariaLabel: 'Namast class planner',
};

export function resolveBrand(brand = PERSONAL_BRAND) {
  const monogram = String(brand?.monogram || '').trim();
  const ownerName = String(brand?.ownerName || '').trim();
  return {
    monogram: monogram || DEFAULT_BRAND.monogram,
    ownerName: ownerName || DEFAULT_BRAND.ownerName,
    ariaLabel: brand?.ariaLabel || DEFAULT_BRAND.ariaLabel,
  };
}

export function getBrand() {
  return resolveBrand(PERSONAL_BRAND);
}
