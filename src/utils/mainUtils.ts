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
