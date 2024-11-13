import path from "node:path";

import { existsSync, mkdirSync, writeFileSync } from "node:fs";

import { stringify as stringify2dArrIntoCsv } from "csv-stringify/sync";
import { step, TyNumForEachSenderCategory } from "../gloAccu";
import { str } from "../constants";
import { combineAddressAndName } from "./sweetUtils";
import {
  TyOneResultCategory,
  groundFolder,
  keyForMessageCountBySender,
  keysForSenders,
} from "./groundFolderMaker";

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
    groundFolder.innerFolders.mboxStats.innerFolders
      .forMailsWhereSenderIsNotMeOrIsUnknown,
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

export const getSumOfAllValuesOfMap = (myMap: Map<string, number>): number => {
  const asArr = [...myMap];
  const sumOfValues = asArr.reduce((accu, curr) => accu + curr[1], 0);
  return sumOfValues;
};

const generateCoolCounts = (
  propName: keyof typeof theFilesObj,
  theFilesObj: TyOneResultCategory["innerFiles"],
): TyCoolCounts => {
  const currFile = theFilesObj[propName];

  const freqDataAsSortedArr = [...currFile.freqMap].sort((a, b) => b[1] - a[1]);
  const fullSumOfNumbers = getSumOfAllValuesOfMap(currFile.freqMap);

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

  const recordAttachmMainStats = (
    currCaget: keyof TyNumForEachSenderCategory,
  ) => {
    const currFileForAttachments = theFilesObj.attachmentsBySender;

    //
    //
    //
    step.totalSizeOfAttachmentsWithSenderCategory[currCaget] =
      getSumOfAllValuesOfMap(currFileForAttachments.attachmTotalSizeMap);

    step.totalCountOfAttachmentsWithSenderCategory[currCaget] =
      getSumOfAllValuesOfMap(currFileForAttachments.attachmTotalCountMap);

    step.countOfMailsWithAtLeastOneAttachmentWithSenderCategory[currCaget] =
      getSumOfAllValuesOfMap(
        currFileForAttachments.mailCountWithNonZeroCountOfAttachmentsMap,
      );

    // console.log("zazaaaaaaa===>>>>>>:", senderCategory);
  };

  if (senderCategory === "me") {
    // here, guarateed that fullSumOfNumbers equals countOfLegitValues
    // because, in "me" category, sender addresses are known as just my address.
    step.countOfMessagesWithSenderCategory[senderCategory] = fullSumOfNumbers;

    //
    recordAttachmMainStats(senderCategory);
  } else {
    // senderCategory === "notMe" ---> or unknown (strange/hidden/empty)

    // Only Senders, not other things.

    step.countOfMessagesWithSenderCategory["empty"] = countOfEmptyValues;
    step.countOfMessagesWithSenderCategory["hidden"] = countOfHiddenValues;

    step.countOfMessagesWithSenderCategory["notMe"] = countOfLegitValues;

    //
    //

    // I think specific senderCategory will always be me or notMe, never empty, never hidden.
    recordAttachmMainStats("notMe");
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
  // recordMajorCounts(theFilesObj, senderCategory);

  //

  type TyAllKeysOfFiles = keyof typeof theFilesObj;

  const theKeysOfFilesObj = Object.keys(theFilesObj) as TyAllKeysOfFiles[];

  const fnForFreqFiles = (
    propName: TyAllKeysOfFiles,
    currFile: TyOneResultCategory["innerFiles"][TyAllKeysOfFiles],
  ): {
    final2dArr: (string | number)[][];
  } => {
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

    const isKeyForSenders = keysForSenders.includes(propName);

    const notApplicable_hiddEmpt = senderCategory === "me" && isKeyForSenders;

    const sideArr = [
      ["File name:", currFile.fileName.slice(0, currFile.fileName.length - 4)],
      ["100% (All Occurrences):", fullSumOfNumbers],
      ["Legit Occurrences:", countOfLegitValues],
      ["Empty:", notApplicable_hiddEmpt ? "-" : countOfEmptyValues],
      ["Hidden:", notApplicable_hiddEmpt ? "-" : countOfHiddenValues],
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

    return { final2dArr };
  };

  theKeysOfFilesObj.forEach((propName) => {
    const currFile = theFilesObj[propName];

    let final2dArr = [["", 0]];

    if (propName.includes("attachm")) {
      // final2dArr = fnForFreqFiles(propName, currFile).final2dArr;
    } else {
      final2dArr = fnForFreqFiles(propName, currFile).final2dArr;
    }

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
    groundFolder.innerFolders.mboxStats.innerFolders
      .forMailsWhereSenderIsNotMeOrIsUnknown,
    "notMeOrUnknown",
  );
};
