/*

process.argv looks liek this:

[
  'C:\\Program Files\\nodejs\\node.exe',
  'C:\\Users\\leodevbroUser\\AppData\\Local\\npm-cache\\_npx\\6b3a38aa2be73d0e\\node_modules\\gmail-mbox-stats\\bin.js',
  'enbbbb=  qqq   kkkk'
]

*/

export const getEnvItemValue = (name: string) => {
  const allEnvItems = process.argv;

  for (const item of allEnvItems) {
    const nameAndVal = item.split("=");
    const theKey = nameAndVal[0];
    if (theKey === name) {
      // we have the key. now let's find value.

      if (nameAndVal.length === 1) {
        return true;
      }

      if (nameAndVal.length !== 2) {
        throw new Error(
          `argument notation probably is not correct >>>${item}<<<`,
        );
      }

      // now, nameAndVal.length is exactly 2
      const theValue = nameAndVal[1];
      if (theValue && typeof theValue === "string") {
        return theValue;
      } else {
        throw new Error(
          `argument notation probably is not correct >>>${item}<<<`,
        );
      }
    }
  }

  return undefined;
};

export const waitSomeSeconds = async (seconds: number) => {
  const smartPromise = new Promise<true>((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, seconds * 1000);
  });

  return smartPromise;
};

type tySlimDatetime =
  `${string}-${string}-${string}_${string}-${string}-${string}`;

export const getSlimDateTime = (myDate: Date): tySlimDatetime => {
  const newDate = myDate;
  const localDT = {
    year: newDate.getFullYear(),
    month: newDate.getMonth() + 1,
    monthDay: newDate.getDate(),
    //
    hour: newDate.getHours(),
    minute: newDate.getMinutes(),
    seconds: newDate.getSeconds(),
  };

  const eachStr: Record<keyof typeof localDT, string> = {
    year: String(localDT.year),
    month: String(localDT.month).padStart(2, "0"),
    monthDay: String(localDT.monthDay).padStart(2, "0"),
    //
    hour: String(localDT.hour).padStart(2, "0"),
    minute: String(localDT.minute).padStart(2, "0"),
    seconds: String(localDT.seconds).padStart(2, "0"),
  };

  const str: tySlimDatetime = `${eachStr.year}-${eachStr.month}-${eachStr.monthDay}_${eachStr.hour}-${eachStr.minute}-${eachStr.seconds}`;

  return str;
};

// not yet used
export const countOccurrences = (fullStr: string, partStr: string) => {
  const regExp = new RegExp(partStr, "g");
  const count = (fullStr.match(regExp) || []).length;
  return count;
};
