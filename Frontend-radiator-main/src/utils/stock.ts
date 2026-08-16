// @ts-nocheck
export const LOW_STOCK_THRESHOLD = 10;

export const isLowStock = (quantity) => quantity > 0 && quantity <= LOW_STOCK_THRESHOLD;
export const isOutOfStock = (quantity) => quantity === 0;
