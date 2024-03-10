import path from "node:path";

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { TyMailAddress, TyMailDomain } from "../types/mailparserTypes";
import { stringify as stringify2dArrIntoCsv } from "csv-stringify/sync";
import { step } from "..";

const dotCsv = ".csv";

const str_frequency = "frequency";
const str_Sender = "Sender";
const str_Receiver = "Receiver";
const str_Cc = "Cc";
const str_Bcc = "Bcc";
const str_Address = "Address";
const str_Domain = "Domain";
const str_AddressAndName = "AddressAndName";

export type TyOneFileIndicator = {
  fileName: `${string}.csv`;
  pathAbsOrRel: string;
  freqMap: Map<string, number>;
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

const createResultsObjForSpecificSenderCategory = (
  category: TySenderCategory,
) => {
  const sCatStr = category === "me" ? "senderIsMe" : "senderIsNotMe";

  // const resultsFolderForSpecificSenderCategory: TyOneFolderIndicator
  const resultsFolderForSpecificSenderCategory = {
    folderName: "results",
    pathAbsOrRel: "" as string,
    innerFolders: {},
    innerFiles: {
      frequencySenderAddress: {
        fileName: `${sCatStr}${str_frequency}${str_Sender}${str_Address}${dotCsv}`,
        pathAbsOrRel: "" as string,
        freqMap: new Map<TyMailAddress, number>([]),
      },
      frequencySenderDomain: {
        fileName: `${sCatStr}${str_frequency}${str_Sender}${str_Domain}${dotCsv}`,
        pathAbsOrRel: "" as string,
        freqMap: new Map<TyMailDomain, number>([]),
      },
      frequencySenderAddressAndName: {
        fileName: `${sCatStr}${str_frequency}${str_Sender}${str_AddressAndName}${dotCsv}`,
        pathAbsOrRel: "" as string,
        freqMap: new Map<string, number>([]),
      },

      // not just first receiver, but includes all receivers. So, count of receivers can me more than count of senders

      frequencyReceiverAddress: {
        fileName: `${sCatStr}${str_frequency}${str_Receiver}${str_Address}${dotCsv}`,
        pathAbsOrRel: "" as string,
        freqMap: new Map<TyMailAddress, number>([]),
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
        fileName: `${sCatStr}${str_frequency}${str_Cc}${str_Address}${dotCsv}`,
        pathAbsOrRel: "" as string,
        freqMap: new Map<TyMailAddress, number>([]),
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
        fileName: `${sCatStr}${str_frequency}${str_Bcc}${str_Address}${dotCsv}`,
        pathAbsOrRel: "" as string,
        freqMap: new Map<TyMailAddress, number>([]),
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
      folderName: "mboxStats",
      pathAbsOrRel: "" as string,
      innerFiles: {
        allMailList_csv: {
          fileName: `index__sender-senderName-receiver-cc-bcc-time-id${dotCsv}`,
          pathAbsOrRel: "" as string,
          freqMap: new Map<string, number>([]),
        },
      },
      innerFolders: {
        resultsForMailsWithSenderAsMe: {
          ...createResultsObjForSpecificSenderCategory("me"),
          folderName: "resultsForMailsWithSenderAsMe",
        } as const,
        resultsForMailsWithSenderAsNotMe: {
          ...createResultsObjForSpecificSenderCategory("notMe"),
          folderName: "resultsForMailsWithSenderAsNotMe",
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

export const getPrettyDateTime = (): string => {
  const newDate = new Date();
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

  const str = `${eachStr.year}-${eachStr.month}-${eachStr.monthDay}_${eachStr.hour}-${eachStr.minute}-${eachStr.seconds}`;

  return str;
};

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
    groundFolder.innerFolders.mboxStats.folderName + "_" + getPrettyDateTime(),
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

  const allMailListFilePath = path.join(
    mboxStatsFolderPath,
    groundFolder.innerFolders.mboxStats.innerFiles.allMailList_csv.fileName,
  );

  // create main list csv file
  try {
    writeFileSync(allMailListFilePath, "");

    groundFolder.innerFolders.mboxStats.innerFiles.allMailList_csv[
      // @ts-ignore
      "pathAbsOrRel"
    ] = allMailListFilePath;
  } catch (err) {
    console.error(err);
  }

  //

  prepareResultsFolderForSenderCategory(
    mboxStatsFolderPath,
    groundFolder.innerFolders.mboxStats.innerFolders
      .resultsForMailsWithSenderAsMe,
  );

  prepareResultsFolderForSenderCategory(
    mboxStatsFolderPath,
    groundFolder.innerFolders.mboxStats.innerFolders
      .resultsForMailsWithSenderAsNotMe,
  );
};

export const writeStatsOfSpecificSenderCategoryIntoFiles = (
  folderOfSpecificSenderCategory: TyOneResultCategory,
  senderCategory: keyof typeof step.countOfMailsWithSenderCategory,
) => {
  const theFilesObj = folderOfSpecificSenderCategory.innerFiles;

  const theKeysOfFilesObj = Object.keys(
    theFilesObj,
  ) as (keyof typeof theFilesObj)[];

  theKeysOfFilesObj.forEach((propName) => {
    const currFile = theFilesObj[propName];
    if (!currFile.pathAbsOrRel) {
      console.log(
        `Something's wrong --- path of ${currFile.fileName} not found`,
      );
      return;
    }

    const freqDataAsSortedArr = [...currFile.freqMap].sort(
      (a, b) => b[1] - a[1],
    );
    const fullSumOfNumbers = freqDataAsSortedArr.reduce<number>(
      (accu, item) => {
        const currItemFreqNumber = item[1];
        return accu + currItemFreqNumber;
      },
      0,
    );

    if (currFile.fileName === theFilesObj.frequencySenderAddress.fileName) {
      step.countOfMailsWithSenderCategory[senderCategory] = fullSumOfNumbers;
    }

    const final2dArr = freqDataAsSortedArr.map((line, lineIndex) => {
      const coolLine = [...line, lineIndex === 0 ? fullSumOfNumbers : ""];
      return coolLine;
    });

    //
    //

    const csvStringBy2dArr = stringify2dArrIntoCsv(final2dArr, {
      header: false,
      columns: undefined,
    });

    writeFileSync(currFile.pathAbsOrRel, csvStringBy2dArr, {
      flag: "a+",
    });
  });
};

export const writeStatsIntoFiles = () => {
  writeStatsOfSpecificSenderCategoryIntoFiles(
    groundFolder.innerFolders.mboxStats.innerFolders
      .resultsForMailsWithSenderAsMe,
    "me",
  );

  writeStatsOfSpecificSenderCategoryIntoFiles(
    groundFolder.innerFolders.mboxStats.innerFolders
      .resultsForMailsWithSenderAsNotMe,
    "notMe",
  );
};
