export type IsInArray<A extends readonly unknown[], X> = X extends A[number]
  ? true
  : false;

export type HasUniqueItems<A extends readonly unknown[]> = A extends readonly [
  infer X,
  ...infer Rest,
]
  ? IsInArray<Rest, X> extends true
    ? [false, "Encountered value with duplicates:", X]
    : HasUniqueItems<Rest>
  : true;

type TyEnum<K extends string> = {
  [Key in K]: Key;
};

type TyStrToInd<K extends string> = {
  [Key in K]: number;
};

type TyCoolEnum<Tuple extends Readonly<string[]>> = {
  asArr: Tuple;
  asObjEnum: Readonly<TyEnum<Tuple[number]>>;
  asSet: Set<Tuple[number]>;
  asStrToInd: Readonly<TyStrToInd<Tuple[number]>>;
};

// generate type-safe object (as enum) from array of strings
export const createCoolEnum = <
  // prettier-ignore
  TupleInput extends (
    number extends TupleInput["length"] ? `Should be as const` :
    HasUniqueItems<Exclude<TupleInput, string>> extends true ? Readonly<string[]> :
    `Should have unique elements, found duplicate`
  ),
  Tuple extends Exclude<TupleInput, string>,
>(
  arrInput: TupleInput,
): TyCoolEnum<Tuple> => {
  const arr = arrInput as unknown as Tuple;
  const asSet = new Set<Tuple[number]>(arr);

  if (asSet.size !== arr.length) {
    throw new Error("groupIdsArr should have unique elements");
  }

  type TheObjEnum = TyEnum<Tuple[number]>;

  const asObjEnum: TheObjEnum = arr.reduce((accu, curr) => {
    accu[curr] = curr;

    return accu;
  }, {} as Record<string, string>) as TheObjEnum;

  type TheStrToInd = TyStrToInd<Tuple[number]>;

  const asStrToInd: TheStrToInd = arr.reduce((accu, curr, index) => {
    accu[curr] = index;

    return accu;
  }, {} as Record<string, number>) as TheStrToInd;

  const final: TyCoolEnum<Tuple> = {
    asArr: arr,
    asObjEnum,
    asSet,
    asStrToInd,
  };

  return final;
};

// test:
// let jijdfdf = ["vbvvbvbbvb", "qeqeqeqe", "i7777", "i7777"] as const;

// const qqdqd = createCoolEnum(jijdfdf);
// const qqdqd2 = createCoolEnum(["dfdf", "bbbbb"]);
// qqdqd.asObjEnum.i7777;
// qqdqd2.asObjEnum.dfdf;
