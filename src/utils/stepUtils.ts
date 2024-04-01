import path from "node:path";

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { TyMailAddress, TyMailDomain } from "../types/mailparserTypes";
import { stringify as stringify2dArrIntoCsv } from "csv-stringify/sync";
import { step } from "..";
import { slimStartDateTime, str } from "../constants";
import { combineAddressAndName } from "./sweetUtils";

const dotCsv = ".csv";
// const dotTxt = ".txt";

const str_frequency = "_freq";
const str_Sender = "Sender";
const str_Receiver = "Receiver";
const str_Cc = "Cc";
const str_Bcc = "Bcc";
// const str_Address = "Address";
const str_Domain = "Domain";
const str_AddressAndName = "PlusName";

//

export const keyForMessageCountBySender: keyof TyOneResultCategory["innerFiles"] =
  "frequencySenderAddress";

export type TyOneFileIndicator = {
  fileName: `${string}${typeof dotCsv}`;
  pathAbsOrRel: string;
  freqMap: Map<string, number>;
  messagesWhereRelevantValuesFound: number;
  legitCount: number;
  hiddenCount: number;
  emptyCount: number;
};

export type TyOneFolderIndicator = {
  folderName: string;
  pathAbsOrRel: string;
  innerFiles: {
    [Key: string]: TyOneFileIndicator;
  };
  innerFolders: {
    [Key: string]: TyOneFolderIndicator;
  };
};

type TyCheckThatTObjExtendsTSource<TSource, TObj extends TSource> = TObj &
  never;

export type TySenderCategory = "me" | "notMe";

const sculptCommonInitialPropsOfFile = () => {
  const commonInitialPropsOfFile = {
    pathAbsOrRel: "" as string,
    freqMap: new Map<TyMailAddress, number>([]),
    messagesWhereRelevantValuesFound: 0 as number,
    legitCount: 0 as number,
    hiddenCount: 0 as number,
    emptyCount: 0 as number,
  } as const;

  type TyDoTheCheck0 = TyCheckThatTObjExtendsTSource<
    Omit<TyOneFileIndicator, "fileName">,
    typeof commonInitialPropsOfFile
  >;
  null as TyDoTheCheck0;

  return commonInitialPropsOfFile;
};

const createResultsObjForSpecificSenderCategory = (
  category: TySenderCategory,
) => {
  const sCatStr = category === "me" ? "senderIsMe" : "senderIsNotMe";

  // const resultsFolderForSpecificSenderCategory: TyOneFolderIndicator
  const resultsFolderForSpecificSenderCategory = {
    folderName: "results", // will become "forMailsWhereSenderIsMe" or "forMailsWhereSenderIsNotMe"
    pathAbsOrRel: "" as string,
    innerFolders: {},
    innerFiles: {
      frequencySenderAddress: {
        fileName: `${sCatStr}${str_frequency}${str_Sender}${dotCsv}`,
        ...sculptCommonInitialPropsOfFile(),
      },
      frequencySenderDomain: {
        fileName: `${sCatStr}${str_frequency}${str_Sender}${str_Domain}${dotCsv}`,
        ...sculptCommonInitialPropsOfFile(),
        freqMap: new Map<TyMailDomain, number>([]),
      },
      frequencySenderAddressAndName: {
        fileName: `${sCatStr}${str_frequency}${str_Sender}${str_AddressAndName}${dotCsv}`,
        ...sculptCommonInitialPropsOfFile(),
        freqMap: new Map<string, number>([]),
      },

      // not just first receiver, but includes all receivers. So, count of receivers can me more than count of senders

      frequencyReceiverAddress: {
        fileName: `${sCatStr}${str_frequency}${str_Receiver}${dotCsv}`,
        ...sculptCommonInitialPropsOfFile(),
      },
      // frequencyReceiverDomain: {
      //   fileName: `${sCatStr}${str_frequency}${str_Receiver}${str_Domain}${dotCsv}`,
      //   pathAbsOrRel: "" as string,
      //   freqMap: new Map<TyMailDomain, number>([]),
      // },
      // frequencyReceiverAddressAndName: {
      //   fileName: `${sCatStr}${str_frequency}${str_Receiver}${str_AddressAndName}${dotCsv}`,
      //   pathAbsOrRel: "" as string,
      //   freqMap: new Map<string, number>([]),
      // },

      // cc:

      frequencyCcAddress: {
        fileName: `${sCatStr}${str_frequency}${str_Cc}${dotCsv}`,
        ...sculptCommonInitialPropsOfFile(),
      },
      // frequencyCcDomain: {
      //   fileName: `${sCatStr}${str_frequency}${str_Cc}${str_Domain}${dotCsv}`,
      //   pathAbsOrRel: "" as string,
      //   freqMap: new Map<TyMailDomain, number>([]),
      // },
      // frequencyCcAddressAndName: {
      //   fileName: `${sCatStr}${str_frequency}${str_Cc}${str_AddressAndName}${dotCsv}`,
      //   pathAbsOrRel: "" as string,
      //   freqMap: new Map<string, number>([]),
      // },

      // bcc:

      frequencyBccAddress: {
        fileName: `${sCatStr}${str_frequency}${str_Bcc}${dotCsv}`,
        ...sculptCommonInitialPropsOfFile(),
      },
      // frequencyBccDomain: {
      //   fileName: `${sCatStr}${str_frequency}${str_Bcc}${str_Domain}${dotCsv}`,
      //   pathAbsOrRel: "" as string,
      //   freqMap: new Map<TyMailDomain, number>([]),
      // },
      // frequencyBccAddressAndName: {
      //   fileName: `${sCatStr}${str_frequency}${str_Bcc}${str_AddressAndName}${dotCsv}`,
      //   pathAbsOrRel: "" as string,
      //   freqMap: new Map<string, number>([]),
      // },
    },
  } as const;

  type TyDoTheCheck1 = TyCheckThatTObjExtendsTSource<
    TyOneFolderIndicator,
    typeof resultsFolderForSpecificSenderCategory
  >;
  null as TyDoTheCheck1;

  return resultsFolderForSpecificSenderCategory;
};

// export const groundFolder: TyOneFolderIndicator
export const groundFolder = {
  folderName: "groundFolder",
  pathAbsOrRel: "" as string,
  innerFiles: {},
  innerFolders: {
    mboxStats: {
      folderName: `mboxStats_${slimStartDateTime.v}`,
      pathAbsOrRel: "" as string,
      innerFiles: {
        // not yet used in prod
        allMailList_csv: {
          fileName: `index__sender-senderName-receiver-cc-bcc-time-id${dotCsv}`,
          ...sculptCommonInitialPropsOfFile(), // maybe only 'pathAbsOrRel' is applicable here.
        },

        generalStats: {
          fileName: `generalStats${dotCsv}`,
          ...sculptCommonInitialPropsOfFile(), // maybe only 'pathAbsOrRel' is applicable here.
        },
      },
      innerFolders: {
        forMailsWhereSenderIsMe: {
          ...createResultsObjForSpecificSenderCategory("me"),
          folderName: "forMailsWhereSenderIsMe",
        } as const,
        forMailsWhereSenderIsNotMe: {
          ...createResultsObjForSpecificSenderCategory("notMe"),
          folderName: "forMailsWhereSenderIsNotMe",
        } as const,
      },
    },
  },
} as const;

export type TyResultsCategories =
  typeof groundFolder.innerFolders.mboxStats.innerFolders;

export type TyOneResultCategory =
  TyResultsCategories[keyof TyResultsCategories];

type TyDoTheCheck = TyCheckThatTObjExtendsTSource<
  TyOneFolderIndicator,
  typeof groundFolder
>;
null as TyDoTheCheck;

export const prepareResultsFolderForSenderCategory = (
  mboxStatsFolderPath: string,
  folderOfSpecificSenderCategory: TyOneResultCategory,
) => {
  const resultsFolderPath = path.join(
    mboxStatsFolderPath,
    folderOfSpecificSenderCategory.folderName,
  );

  // create results Folder
  try {
    if (!existsSync(resultsFolderPath)) {
      mkdirSync(resultsFolderPath);
    }

    folderOfSpecificSenderCategory[
      // @ts-ignore
      "pathAbsOrRel"
    ] = resultsFolderPath;
  } catch (err) {
    console.error(err);
  }

  //===================================
  //===================================
  //===================================

  const resultsFoldersInnerFiles = folderOfSpecificSenderCategory.innerFiles;

  //

  const arrOfObjKeysOfCandFiles = Object.keys(
    resultsFoldersInnerFiles,
  ) as (keyof typeof resultsFoldersInnerFiles)[];

  // create results files:
  for (const propName of arrOfObjKeysOfCandFiles) {
    const thePath = path.join(
      resultsFolderPath,
      resultsFoldersInnerFiles[propName].fileName,
    );
    try {
      writeFileSync(thePath, "");

      resultsFoldersInnerFiles[propName][
        // @ts-ignore
        "pathAbsOrRel"
      ] = thePath;
    } catch (err) {
      console.error(err);
    }
  }
};

export const prepareOutputFolderStructure = (mboxFilePath: string) => {
  if (!mboxFilePath || typeof mboxFilePath !== "string") {
    throw new Error("mboxPath notation is not valid");
  }

  const mboxStatsFolderPath = path.join(
    path.dirname(mboxFilePath),
    groundFolder.innerFolders.mboxStats.folderName,
  );

  // console.log("haaaa_end", process.argv, process.env.npm_config_sss); // npm run go --aaabbbrt="sdfs"
  // console.log("imushavaa", mboxFilePath, mboxStatsFolderPath);

  // create mboxStats Folder
  try {
    if (!existsSync(mboxStatsFolderPath)) {
      mkdirSync(mboxStatsFolderPath);
    }
    groundFolder.innerFolders.mboxStats[
      // @ts-ignore
      "pathAbsOrRel"
    ] = mboxStatsFolderPath;
  } catch (err) {
    console.error(err);
  }

  // create generalStats file (empty now)
  const generalStatsFilePath = path.join(
    mboxStatsFolderPath,
    groundFolder.innerFolders.mboxStats.innerFiles.generalStats.fileName,
  );

  try {
    writeFileSync(generalStatsFilePath, "");

    groundFolder.innerFolders.mboxStats.innerFiles.generalStats[
      // @ts-ignore
      "pathAbsOrRel"
    ] = generalStatsFilePath;
  } catch (err) {
    console.error(err);
  }

  // create main index csv file
  // TODO: maybe for future
  /*
  const allMailListFilePath = path.join(
    mboxStatsFolderPath,
    groundFolder.innerFolders.mboxStats.innerFiles.allMailList_csv.fileName,
  );

  try {
    writeFileSync(allMailListFilePath, "");

    groundFolder.innerFolders.mboxStats.innerFiles.allMailList_csv[
      // @ts-ignore
      "pathAbsOrRel"
    ] = allMailListFilePath;
  } catch (err) {
    console.error(err);
  }
  */

  //

  prepareResultsFolderForSenderCategory(
    mboxStatsFolderPath,
    groundFolder.innerFolders.mboxStats.innerFolders.forMailsWhereSenderIsMe,
  );

  prepareResultsFolderForSenderCategory(
    mboxStatsFolderPath,
    groundFolder.innerFolders.mboxStats.innerFolders.forMailsWhereSenderIsNotMe,
  );
};

type TySenderCategoryBig = "me" | "notMeOrUnknown";

export type TyCoolCounts = {
  fullSumOfNumbers: number;
  countOfLegitValues: number;
  countOfEmptyValues: number;
  countOfHiddenValues: number;
  uniqueCountOfHiddenValues: number; // strange values
};

const generateCoolCounts = (
  propName: keyof typeof theFilesObj,
  theFilesObj: TyOneResultCategory["innerFiles"],
): TyCoolCounts => {
  const currFile = theFilesObj[propName];

  const freqDataAsSortedArr = [...currFile.freqMap].sort((a, b) => b[1] - a[1]);
  const fullSumOfNumbers = freqDataAsSortedArr.reduce<number>((accu, item) => {
    const currItemFreqNumber = item[1];
    return accu + currItemFreqNumber;
  }, 0);

  //

  const countOfEmptyValues =
    (propName !== "frequencySenderAddressAndName"
      ? currFile.freqMap.get(str.EMPTY_ADDR as any)
      : currFile.freqMap.get(
          combineAddressAndName(str.EMPTY_ADDR, str.EMPTY_NAME) as any,
        )) || 0;

  const uniqueCountOfHiddenValues_obj = {
    v: 0,
  };

  const countOfHiddenValues = freqDataAsSortedArr.reduce<number>(
    (accu, item) => {
      const [currItemKey, currItemFreqNumber] = item;

      if (currItemKey.includes(str.STRANGE)) {
        uniqueCountOfHiddenValues_obj.v += 1;
        return accu + currItemFreqNumber;
      }

      return accu;
    },
    0,
  );

  const countOfLegitValues =
    fullSumOfNumbers - (countOfEmptyValues + countOfHiddenValues);

  const outObj: TyCoolCounts = {
    fullSumOfNumbers,
    countOfLegitValues,
    countOfEmptyValues,
    countOfHiddenValues,
    uniqueCountOfHiddenValues: uniqueCountOfHiddenValues_obj.v,
  };

  return outObj;
};

// This will be executed two times. One for "me" and one for "notMeOrUnknown"
const recordMajorCounts = (
  theFilesObj: TyOneResultCategory["innerFiles"],
  senderCategory: TySenderCategoryBig,
): TyCoolCounts => {
  // frequencySenderAddress --> keyForMessageCountBySender

  // We count messages (where sender is me or not me) with sender address,
  // because sender is most likely just one for each message.

  const majorCountsForCurrCategory = generateCoolCounts(
    keyForMessageCountBySender,
    theFilesObj,
  );

  const {
    fullSumOfNumbers,
    countOfEmptyValues,
    countOfHiddenValues,
    countOfLegitValues,
  } = majorCountsForCurrCategory;

  if (senderCategory === "me") {
    // here, guarateed that fullSumOfNumbers equals countOfLegitValues
    // because, in "me" category, sender addresses are known as just my address.
    step.countOfMessagesWithSenderCategory[senderCategory] = fullSumOfNumbers;
  } else {
    // senderCategory === "notMe" ---> or unknown (strange/hidden/empty)

    // Only Senders, not other things.

    step.countOfMessagesWithSenderCategory["empty"] = countOfEmptyValues;
    step.countOfMessagesWithSenderCategory["hidden"] = countOfHiddenValues;

    step.countOfMessagesWithSenderCategory["notMe"] = countOfLegitValues;
  }

  return majorCountsForCurrCategory;
};

export const writeStatsOfSpecificSenderCategoryIntoFiles = (
  folderOfSpecificSenderCategory: TyOneResultCategory,
  senderCategory: TySenderCategoryBig,
) => {
  const theFilesObj = folderOfSpecificSenderCategory.innerFiles;

  //

  const majorCounts = recordMajorCounts(theFilesObj, senderCategory);

  //

  const theKeysOfFilesObj = Object.keys(
    theFilesObj,
  ) as (keyof typeof theFilesObj)[];

  theKeysOfFilesObj.forEach((propName) => {
    const currFile = theFilesObj[propName];

    const {
      fullSumOfNumbers,
      countOfEmptyValues,
      countOfHiddenValues,
      countOfLegitValues,

      // @ts-ignore
      uniqueCountOfHiddenValues,
    } =
      propName === keyForMessageCountBySender
        ? majorCounts
        : generateCoolCounts(propName, theFilesObj);

    currFile[
      // @ts-ignore
      "legitCount"
    ] = countOfLegitValues;

    currFile[
      // @ts-ignore
      "hiddenCount"
    ] = countOfHiddenValues;

    currFile[
      // @ts-ignore
      "emptyCount"
    ] = countOfEmptyValues;

    const messagesWhereWeSearched =
      senderCategory === "me"
        ? step.countOfMessagesWithSenderCategory["me"]
        : step.v - step.countOfMessagesWithSenderCategory["me"];

    // const legitUniqueAddresses =
    //   currFile.freqMap.size -
    //   (currFile.emptyCount === 0 ? 0 : 1) -
    //   uniqueCountOfHiddenValues;

    const sideArr = [
      ["File name:", currFile.fileName.slice(0, currFile.fileName.length - 4)],
      ["100% (All Occurrences):", fullSumOfNumbers],
      ["Legit Occurrences:", countOfLegitValues],
      ["Empty:", countOfEmptyValues],
      ["Hidden:", countOfHiddenValues],
      ["Unique Count:", currFile.freqMap.size],
      ["Messages Where We Searched:", messagesWhereWeSearched],
      ["Messages Where Found:", currFile.messagesWhereRelevantValuesFound],
      [
        "Messages Where Not Found:",
        messagesWhereWeSearched - currFile.messagesWhereRelevantValuesFound,
      ],
    ];

    const freqDataAsSortedArr = [...currFile.freqMap].sort(
      (a, b) => b[1] - a[1],
    );

    const final2dArr = freqDataAsSortedArr.map((line) => {
      const freq = line[1];
      const percentage = (100 * freq) / fullSumOfNumbers;

      // const fixedStr =
      //   percentage >= 0.02 ? percentage.toFixed(2) : percentage.toFixed(5);

      const fixedStr = percentage.toFixed(12);

      const percentageStr = `${fixedStr}%`;
      const coolLine = [...line, percentageStr];
      return coolLine;
    });

    const deltaheight = sideArr.length - final2dArr.length;

    if (deltaheight >= 1) {
      Array(deltaheight)
        .fill("-")
        .forEach(() => {
          final2dArr.push(["", "", ""]); // to fill left area
        });
    }

    sideArr.forEach((tupleItem, index) => {
      final2dArr[index].push("", ...tupleItem);
    });

    //
    //

    const csvStringBy2dArr = stringify2dArrIntoCsv(final2dArr, {
      header: false,
      columns: undefined,
    });

    if (!currFile.pathAbsOrRel) {
      console.log(
        `Something's wrong --- path of ${currFile.fileName} not found`,
      );
      return;
    }

    writeFileSync(currFile.pathAbsOrRel, csvStringBy2dArr, {
      flag: "a+",
    });
  });
};

export const writeStatsIntoFiles = () => {
  writeStatsOfSpecificSenderCategoryIntoFiles(
    groundFolder.innerFolders.mboxStats.innerFolders.forMailsWhereSenderIsMe,
    "me",
  );

  writeStatsOfSpecificSenderCategoryIntoFiles(
    groundFolder.innerFolders.mboxStats.innerFolders.forMailsWhereSenderIsNotMe,
    "notMeOrUnknown",
  );
};
