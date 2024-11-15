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

export const isMaybeCorrectNotationOfAddress = (notation: string): boolean => {
  const indexOfTheAtSymbol = notation.indexOf("@");
  const theAtSymbolIsAtCorrectIndex =
    indexOfTheAtSymbol >= 1 && indexOfTheAtSymbol <= notation.length - 3;

  if (!theAtSymbolIsAtCorrectIndex) {
    return false;
  }

  return true;
};

const argNameForMyEmailAddress = "mymail"; // main input !!!
const argNameForMboxFilePath = "mboxpath"; // main input !!!

// export const myEmail = "leodevbro@gmail.com";

const myEmailRaw: string = getEnvItemValue(argNameForMyEmailAddress) as string;
if (
  !myEmailRaw ||
  typeof myEmailRaw !== "string" ||
  !isMaybeCorrectNotationOfAddress(myEmailRaw)
) {
  throw new Error(`mymail notation is not valid --- ${myEmailRaw}`);
}

export const myEmail = myEmailRaw.toLowerCase();

export const mboxFilePath = getEnvItemValue(argNameForMboxFilePath) as string;

if (!mboxFilePath || typeof mboxFilePath !== "string") {
  throw new Error("mboxpath notation is not valid");
}
