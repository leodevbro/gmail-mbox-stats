import path from "node:path";

import { existsSync, mkdirSync, writeFileSync } from "node:fs";

import { stringify as stringify2dArrIntoCsv } from "csv-stringify/sync";
import { step, TyNumForEachSenderCategory } from "../gloAccu";
import { str } from "../constants";
import {
  combineAddressAndName,
  generatePercentStr,
  getSumOfAllValuesOfMap,
  TyPercentStr,
} from "./sweetUtils";
import {
  TyOneResultCategory,
  groundFolder,
  keyForMessageCountBySender,
  keysForSenders,
} from "./groundFolderMaker";
import { mboxFilePath, myEmail } from "../basicStarter";

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

  const fnForAttachmStatFiles = (
    propName: TyAllKeysOfFiles,
    currFile: TyOneResultCategory["innerFiles"][TyAllKeysOfFiles],
  ): {
    final2dArr: (string | number)[][];
  } => {
    const isForDomain = propName.toLowerCase().includes("domain");

    const allMailCountPropFinder: Partial<
      Record<TyAllKeysOfFiles, TyAllKeysOfFiles>
    > = {
      attachmentsBySender: "frequencySenderAddress",
      attachmentsByDomain: "frequencySenderDomain",
      attachmentsByReceiver: "frequencyReceiverAddress",
    };

    const {
      //
      // @ts-ignore
      fullSumOfNumbers, //
      //
      countOfEmptyValues,
      countOfHiddenValues, //
      countOfLegitValues,

      // @ts-ignore
      uniqueCountOfHiddenValues,
    } =
      propName === keyForMessageCountBySender
        ? majorCounts
        : generateCoolCounts(propName, theFilesObj);

    currFile[ //
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

    const sideArr = [
      ["File name:", currFile.fileName.slice(0, currFile.fileName.length - 4)],
      ["", ""],
      ["Legend:", ""],
      ["", ""],
      ["A:", isForDomain ? "domain" : "address"],
      ["", ""],
      ["B:", "total size of attachments (MB => million Bytes)"],
      ["C:", "percent"],
      ["", ""],
      ["D:", "count of attachments"],
      // ["E", "percent"],
      ["", ""],
      ["E", "count of mails with at least one attachment"],
      // ["G", "percent"],
      ["", ""],
      ["F", "count of all mails"],
      ["G", "percent"],
    ];

    const attachmTotalSizeDataAsSortedArr = [
      ...currFile.attachmTotalSizeMap,
    ].sort((a, b) => b[1] - a[1]);

    const final2dArr = attachmTotalSizeDataAsSortedArr.map((line) => {
      const currAddressOrDomain = line[0];

      const buildCoolLinePair = (
        currMap: Map<string, number>,
        // mapName: string,
      ): [number, TyPercentStr] => {
        // console.log("jaaaaaaaaa-currMap.size", mapName, currMap.size);
        const num = currMap.get(currAddressOrDomain) || 0;
        // if (num === undefined) {
        //   console.log(JSON.stringify([...currMap]));
        //   throw new Error(
        //     `${currAddressOrDomain} not found in ${mapName} for ${currFile.fileName} - size - ${currMap.size} --- buildCoolLinePair`,
        //   );
        // }

        const ofAllItems = getSumOfAllValuesOfMap(currMap);

        const percentStr = generatePercentStr(ofAllItems, num);

        return [num, percentStr];
      };

      const pair_totalSizeOfAttachments = buildCoolLinePair(
        currFile.attachmTotalSizeMap,
        // "attachmTotalSizeMap",
      );
      const pair_countOfAttachments = buildCoolLinePair(
        currFile.attachmTotalCountMap,
        // "attachmTotalCountMap",
      );
      const pair_countOfMailsWithAtLeastOneAttachment = buildCoolLinePair(
        currFile.mailCountWithNonZeroCountOfAttachmentsMap,
        // "mailCountWithNonZeroCountOfAttachmentsMap",
      );

      const mapFinderKey = allMailCountPropFinder[propName];

      if (!mapFinderKey) {
        throw new Error(
          `!mapFinderKey --- fnForAttachmStatFiles --- propName: ${propName}`,
        );
      }

      const pair_countOfAllMails = buildCoolLinePair(
        theFilesObj[mapFinderKey].freqMap,
      );
      //

      const coolLine = [
        currAddressOrDomain,
        ...pair_totalSizeOfAttachments,
        pair_countOfAttachments[0],
        pair_countOfMailsWithAtLeastOneAttachment[0],
        ...pair_countOfAllMails,
      ];
      return coolLine;
    });

    const deltaheight = sideArr.length - final2dArr.length;

    if (deltaheight >= 1) {
      Array(deltaheight)
        .fill("-")
        .forEach(() => {
          const forLeftEmptyAreaToFill = Array(
            (final2dArr[0] || []).length,
          ).fill("");
          final2dArr.push(forLeftEmptyAreaToFill);
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

    const isAttachmentStatFile = propName.toLowerCase().includes("attachm");

    const { final2dArr } = isAttachmentStatFile
      ? fnForAttachmStatFiles(propName, currFile)
      : fnForFreqFiles(propName, currFile);

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

type TyGeneralStats = {
  generalStats2dArr: (string | number)[][];
};

export const generateGeneralStats = (): TyGeneralStats => {
  console.log("\n");
  //
  const line_fullCount = `Full count of messages: ${step.v}`;
  console.log("Success.");
  console.log(line_fullCount + "\n");

  const generateOneConsoleLineOfSenderCategory = (
    senderCateg: keyof TyNumForEachSenderCategory,
  ) => {
    let categRender: string = senderCateg;
    if (senderCateg === "me") {
      categRender = `--> me`;
    } else if (senderCateg === "notMe") {
      categRender = "not me";
    }

    const currSpace =
      groundFolder.innerFolders.mboxStats.innerFolders[
        senderCateg === "me"
          ? "forMailsWhereSenderIsMe"
          : "forMailsWhereSenderIsNotMeOrIsUnknown"
      ];

    const senderAddressFreqFile = currSpace.innerFiles.frequencySenderAddress;
    const senderDomainFreqFile = currSpace.innerFiles.frequencySenderDomain;
    const receiverAddressFreqFile =
      currSpace.innerFiles.frequencyReceiverAddress;

    const arr = [
      `Messages where sender is ${categRender}: ${step.countOfMessagesWithSenderCategory[senderCateg]}`,
      `Count of mails with at least one attachment: ${step.countOfMailsWithAtLeastOneAttachmentWithSenderCategory[senderCateg]}`,
      `Total count of attachments: ${step.totalCountOfAttachmentsWithSenderCategory[senderCateg]}`,
      `Total size of attachments: ${step.totalSizeOfAttachmentsWithSenderCategory[senderCateg]} MB => Million Bytes`,
      `Unique sender addresses: ${senderAddressFreqFile.freqMap.size}`,
      `Unique sender domains: ${senderDomainFreqFile.freqMap.size}`,
      `Unique receiver addresses: ${receiverAddressFreqFile.freqMap.size}`,
    ];

    return arr.join(`\n${" ".repeat(33)}`) + "\n";
  };

  //
  const line_fullCountAsMe = generateOneConsoleLineOfSenderCategory("me");
  console.log(line_fullCountAsMe);
  //
  const line_countAsLegitNotMe =
    generateOneConsoleLineOfSenderCategory("notMe");
  console.log(line_countAsLegitNotMe);

  // const line_countAsHidden = generateOneConsoleLineOfSenderCategory("hidden");
  // console.log(line_countAsHidden);

  // const line_countAsEmpty = generateOneConsoleLineOfSenderCategory("empty");
  // console.log(line_countAsEmpty);

  console.log(
    `\nCreated new folder "${groundFolder.innerFolders.mboxStats.folderName}"`,
  );

  const generalStats2dArrNotation: (string | number)[][] = [
    [
      "MBOX file name:",
      (() => {
        const nameWithFormat = mboxFilePath.split(/[/\\]/).at(-1);
        if (!nameWithFormat) {
          return mboxFilePath;
        }

        return nameWithFormat;
      })(),
    ],
    ["My mail:", myEmail],
    ["Full count of messages:", step.v],
    ["Messages where sender is me:", step.countOfMessagesWithSenderCategory.me],
    [
      "Messages where sender is not me:",
      step.countOfMessagesWithSenderCategory.notMe,
    ],
    [
      "Messages where sender is empty:",
      step.countOfMessagesWithSenderCategory.empty,
    ],
    [
      "Messages where sender is hidden:",
      step.countOfMessagesWithSenderCategory.hidden,
    ],
  ];

  //
  // const mePlusNotMe =
  //   step.countOfMessagesWithSenderCategory.me +
  //   step.countOfMessagesWithSenderCategory.notMe;

  // if (mePlusNotMe !== step.v) {
  //   const line_countingError = `Strange - Some kind of error of counting --- "me" (${step.countOfMessagesWithSenderCategory.me}) + "notMe" (${step.countOfMessagesWithSenderCategory.notMe}) should be totalCount (${step.v}), but the sum is ${mePlusNotMe}`;
  //   console.log(line_countingError);
  //   // linesOfGeneralStats.push(line_countingError);
  //   generalStats2dArrNotation.push(["Error:", line_countingError]);
  // }

  type TyUniAndFull = [
    unique: number,
    fullLegit: number,
    hidden: number | "-",
    empty: number | "-",
    messagesWhereFound: number,
  ];

  type TyInpStats = {
    senderAddresses: TyUniAndFull;
    senderDomains: TyUniAndFull;
    senderPlusNames: TyUniAndFull;
    receiverAddresses: TyUniAndFull;
    ccAddresses: TyUniAndFull;
    BccAddresses: TyUniAndFull;
  };

  const generateSideStatsForOneCategory = (
    category: "me" | "not me or unknown",
    stats: TyInpStats,
  ) => {
    const categOfStepObj: keyof TyNumForEachSenderCategory =
      category === "me" ? category : "notMe";

    const currSpace =
      groundFolder.innerFolders.mboxStats.innerFolders[
        category === "me"
          ? "forMailsWhereSenderIsMe"
          : "forMailsWhereSenderIsNotMeOrIsUnknown"
      ];

    const senderAddressFreqFile = currSpace.innerFiles.frequencySenderAddress;
    const senderDomainFreqFile = currSpace.innerFiles.frequencySenderDomain;
    const receiverAddressFreqFile =
      currSpace.innerFiles.frequencyReceiverAddress;

    const arr = [
      ["", ""],
      [`For messages where sender is ${category}`],
      [
        "", // "Description",

        // like TyUniAndFull
        "Unique",
        "Legit",
        "Hidden",
        "Empty",
        "Messages Where Found",
      ],
      //
      ["Sender addresses", ...stats.senderAddresses],
      ["Sender domains", ...stats.senderDomains],
      ["SenderPlusNames", ...stats.senderPlusNames],
      ["Receiver addresses", ...stats.receiverAddresses],
      ["CC addresses", ...stats.ccAddresses],
      ["BCC addresses", ...stats.BccAddresses],
      //
      ["", ""],
      ["", ""],
      [
        "Count of mails with at least one attachment",
        step.countOfMailsWithAtLeastOneAttachmentWithSenderCategory[
          categOfStepObj
        ],
      ],
      [
        "Total count of attachments",
        step.totalCountOfAttachmentsWithSenderCategory[categOfStepObj],
      ],
      [
        "Total size of attachments (MB => million Bytes)",
        step.totalSizeOfAttachmentsWithSenderCategory[categOfStepObj],
      ],
      ["Unique sender addresses", senderAddressFreqFile.freqMap.size],
      ["Unique sender domains", senderDomainFreqFile.freqMap.size],
      ["Unique receiver addresses", receiverAddressFreqFile.freqMap.size],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
    ];

    return arr;
  };

  const folder_me =
    groundFolder.innerFolders.mboxStats.innerFolders.forMailsWhereSenderIsMe
      .innerFiles;

  const folder_notMeOrUnknown =
    groundFolder.innerFolders.mboxStats.innerFolders
      .forMailsWhereSenderIsNotMeOrIsUnknown.innerFiles;

  const fol = {
    me: folder_me,
    notMeOrUnknown: folder_notMeOrUnknown,
  };

  const generateStatsObj = (meOrNotMe: keyof typeof fol): TyInpStats => {
    const currFolder = fol[meOrNotMe];

    const sculptOneFileStat = (fileKey: keyof typeof currFolder) => {
      const isKeyForSenders = keysForSenders.includes(fileKey);

      const notApplicable_hiddEmpt = meOrNotMe === "me" && isKeyForSenders;

      const arr: TyUniAndFull = [
        currFolder[fileKey].freqMap.size,
        currFolder[fileKey].legitCount,
        notApplicable_hiddEmpt ? "-" : currFolder[fileKey].hiddenCount,
        notApplicable_hiddEmpt ? "-" : currFolder[fileKey].emptyCount,
        currFolder[fileKey].messagesWhereRelevantValuesFound,
      ];
      return arr;
    };

    const obj: TyInpStats = {
      senderAddresses: sculptOneFileStat("frequencySenderAddress"),
      senderDomains: sculptOneFileStat("frequencySenderDomain"),
      senderPlusNames: sculptOneFileStat("frequencySenderAddressAndName"),
      receiverAddresses: sculptOneFileStat("frequencyReceiverAddress"),
      ccAddresses: sculptOneFileStat("frequencyCcAddress"),
      BccAddresses: sculptOneFileStat("frequencyBccAddress"),
    };

    return obj;
  };

  generalStats2dArrNotation.push(
    ...[
      ["", ""],
      // [`Let's count unique addresses and more`],

      ["Participant --> Sender/Receiver/CC/BCC"],
      [
        "Hidden address --> Participant exists but address value is other kind of text instead of email address",
      ],
      [
        "Empty address --> Participant exists but address is empty. Or: participant (only for sender/receiver) does not exist at all.",
      ],
      ["Unknown address -> hidden or empty address"],
    ],
    ...generateSideStatsForOneCategory("me", generateStatsObj("me")),
    ...generateSideStatsForOneCategory(
      "not me or unknown",
      generateStatsObj("notMeOrUnknown"),
    ),
  );

  const returnObj: TyGeneralStats = {
    generalStats2dArr: generalStats2dArrNotation,
  };

  return returnObj;
};
