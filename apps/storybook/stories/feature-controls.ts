/** Explicit Controls shared by feature playgrounds; recipe fields are not public component props. */
export const textControl = { control: 'text' as const };
export const booleanControl = { control: 'boolean' as const };
export const choiceControl = (options: readonly (string | number | null)[]) => ({ control: 'select' as const, options: [...options] });
export const rangeControl = (min: number, max: number, step = 1) => ({ control: { type: 'range' as const, min, max, step } });
export const numberControl = { control: { type: 'number' as const, min: 0 } };
export const recipeControl = <T extends object>(control: T, description: string) => ({ ...control, description, table: { category: '组合示例' } });
