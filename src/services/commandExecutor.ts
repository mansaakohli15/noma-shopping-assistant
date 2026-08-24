import type { Product, ShoppingItem } from '../types';
import type { ParsedCommand, ParseResult } from './commandParser';
import { findMatchingProduct, createCustomProduct } from '../lib/productMatcher';
import { getHomeRecommendations } from './recommendationService';

export interface ShoppingListActions {
  addProduct: (product: Product, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  setQuantity: (itemId: string, quantity: number) => void;
}

export interface CommandExecutionResult {
  ok: boolean;
  message: string;
}

function resolveProduct(item: string): Product {
  return findMatchingProduct(item) ?? createCustomProduct(item);
}

function findListItem(items: ShoppingItem[], product: Product): ShoppingItem | undefined {
  return items.find((item) => item.product.id === product.id);
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function pluralize(word: string): string {
  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;
  if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch')) return `${word}es`;
  return `${word}s`;
}

function describeQuantity(quantity: number, unit: string | undefined, item: string): string {
  if (!unit || unit === 'piece' || unit === 'pieces' || unit === 'unit') {
    return `${quantity} ${quantity === 1 ? item : pluralize(item)}`;
  }
  const unitLabel = quantity === 1 ? unit : `${unit}s`;
  return `${quantity} ${unitLabel} of ${item}`;
}

function describeUpdatedQuantity(quantity: number, unit: string | undefined, item: string): string {
  if (!unit || unit === 'piece' || unit === 'pieces' || unit === 'unit') {
    return `${quantity} ${quantity === 1 ? item : pluralize(item)}`;
  }
  const unitLabel = quantity === 1 ? unit : `${unit}s`;
  return `${quantity} ${unitLabel}`;
}

function runCommand(
  command: ParsedCommand,
  items: ShoppingItem[],
  actions: ShoppingListActions,
): CommandExecutionResult {
  if (command.intent === 'suggest') {
    const recs = getHomeRecommendations(items);
    const topRecs = [...recs.replenishment, ...recs.usuals];

    if (topRecs.length > 0) {
      const suggestedItem = topRecs[0].product;
      actions.addProduct(suggestedItem, 1);
      return {
        ok: true,
        message: `Based on your purchase rhythm, you are due for ${suggestedItem.name}. Added it to your list!`,
      };
    }

    return {
      ok: true,
      message: 'Your list looks up to date! Check the Insights tab for full seasonal and restock suggestions.',
    };
  }

  const product = resolveProduct(command.item);

  if (command.intent === 'add') {
    const quantity = command.quantity ?? 1;
    actions.addProduct(product, quantity);
    return { ok: true, message: `Added ${describeQuantity(quantity, command.unit, command.item)}.` };
  }

  if (command.intent === 'remove') {
    const existing = findListItem(items, product);
    if (!existing) {
      return { ok: false, message: `${capitalize(command.item)} isn't on your list.` };
    }
    actions.removeItem(existing.id);
    return { ok: true, message: `Removed ${command.item}.` };
  }

  // update
  const existing = findListItem(items, product);
  if (!existing) {
    return { ok: false, message: `${capitalize(command.item)} isn't currently on your list.` };
  }
  if (command.quantity === undefined) {
    return {
      ok: false,
      message: `I heard you, but I couldn't figure out the new quantity for ${command.item}.`,
    };
  }
  actions.setQuantity(existing.id, command.quantity);
  return {
    ok: true,
    message: `Updated ${command.item} to ${describeUpdatedQuantity(command.quantity, existing.unit, command.item)}.`,
  };
}

export function executeParsedCommands(
  parseResult: ParseResult,
  items: ShoppingItem[],
  actions: ShoppingListActions,
): CommandExecutionResult {
  if (!parseResult.understood || parseResult.commands.length === 0) {
    if (parseResult.reason === 'missing_item') {
      return { ok: false, message: 'Which item would you like me to add?' };
    }
    return {
      ok: false,
      message: 'I heard you, but I couldn\'t figure out the shopping action. Try: "Add two bottles of milk" or "What should I buy?"',
    };
  }

  const results = parseResult.commands.map((command) => runCommand(command, items, actions));

  const isMultiAdd =
    parseResult.commands.length > 1 && parseResult.commands.every((command) => command.intent === 'add');

  if (isMultiAdd) {
    const succeeded = results.filter((result) => result.ok).length;
    return {
      ok: succeeded > 0,
      message: `Added ${succeeded} item${succeeded === 1 ? '' : 's'} to your list.`,
    };
  }

  return results[0];
}
