export function shuffle <T>(items: T[], random: () => number = Math.random): T[]{
  if(items.length === 0){
    const emptyArray:T[] = [];
    return emptyArray;
  }
  const copyItems: T[] = items.slice();
  for(let i = copyItems.length-1; i>=0; i--){
    const j:number = Math.floor(random()* (i+1));
    const a = copyItems[i];
    const b = copyItems[j];
    if (a === undefined || b === undefined) continue;
    copyItems[i] = b;
    copyItems[j] = a;
  }
  return copyItems;
}