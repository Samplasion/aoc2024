// Add your utilities here
export function create2DArray<T>(width: number, height: number, value: T): T[][] {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => value));
}

export function combinationsOf<T>(elements: T[], length: number): T[][] {
  if (length === 0) {
    return [[]];
  }

  const result: T[][] = [];
  
  for (const element of elements) {
    for (const combination of combinationsOf(elements, length - 1)) {
      result.push([element, ...combination]);
    }
  }

  return result;
}

export function mod(v: number, n: number) {
  return ((v % n) + n) % n;
}

export function sum(arr: number[]): number {
  return arr.reduce((acc, v) => acc + v, 0);
}

export function swap<T>(arr: T[], i: number, j: number) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

export function lastIndexWhere<T>(arr: T[], predicate: (v: T) => boolean, startingFrom?: number): number {
  for (let i = startingFrom ?? (arr.length - 1); i >= 0; i--) {
    if (predicate(arr[i])) {
      return i;
    }
  }

  return -1;
}

export function arrayIntersection<T>(a: T[], b: T[]): T[] {
  return a.filter((v) => b.includes(v));
}

export function arrayEquality<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function transpose<T>(matrix: T[][]): T[][] {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

export function occurrences<T>(arr: T[]): Map<T, number> {
  return arr.reduce((acc, v) => acc.set(v, (acc.get(v) ?? 0) + 1), new Map<T, number>());
}