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
export const createCoolEnum = <Tuple extends Readonly<string[]>>(
  arr: Tuple,
): TyCoolEnum<Tuple> => {
  const asSet = new Set<Tuple[number]>(arr);

  if (asSet.size !== arr.length) {
    throw new Error("groupIdsArr should have unique elements");
  }

  type TheObjEnum = TyEnum<Tuple[number]>;

  const asObjEnum: TheObjEnum = arr.reduce((accu, curr) => {
    accu[curr] = curr;

    return accu;
  }, {} as { [Key: string]: string }) as TheObjEnum;

  type TheStrToInd = TyStrToInd<Tuple[number]>;

  const asStrToInd: TheStrToInd = arr.reduce((accu, curr, index) => {
    accu[curr] = index;

    return accu;
  }, {} as { [Key: string]: number }) as TheStrToInd;

  const final: TyCoolEnum<Tuple> = {
    asArr: arr,
    asObjEnum,
    asSet,
    asStrToInd,
  };

  return final;
};
