import path from "node:path";

import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const dotCsv = ".csv";

const str_frequency = "frequency";
const str_Sender = "Sender";
const str_Receiver = "Receiver";
const str_Address = "Address";
const str_Domain = "Domain";
const str_FullInfo = "FullInfo";

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
          fileName: `allMailList${dotCsv}`,
          pathAbsOrRel: "" as string,
          freqMap: new Map<string, number>([]),
        },
      },
      innerFolders: {
        results: {
          folderName: "results",
          pathAbsOrRel: "" as string,
          innerFolders: {},
          innerFiles: {
            frequencySenderAddress: {
              fileName: `${str_frequency}${str_Sender}${str_Address}${dotCsv}`,
              pathAbsOrRel: "" as string,
              freqMap: new Map<string, number>([]),
            },
            frequencySenderDomain: {
              fileName: `${str_frequency}${str_Sender}${str_Domain}${dotCsv}`,
              pathAbsOrRel: "" as string,
              freqMap: new Map<string, number>([]),
            },
            frequencySenderFullInfo: {
              fileName: `${str_frequency}${str_Sender}${str_FullInfo}${dotCsv}`,
              pathAbsOrRel: "" as string,
              freqMap: new Map<string, number>([]),
            },

            // not just first receiver, but includes all receivers. So, count of receivers can me more than count of senders

            frequencyReceiverAddress: {
              fileName: `${str_frequency}${str_Receiver}${str_Address}${dotCsv}`,
              pathAbsOrRel: "" as string,
              freqMap: new Map<string, number>([]),
            },
            frequencyReceiverDomain: {
              fileName: `${str_frequency}${str_Receiver}${str_Domain}${dotCsv}`,
              pathAbsOrRel: "" as string,
              freqMap: new Map<string, number>([]),
            },
            frequencyReceiverFullInfo: {
              fileName: `${str_frequency}${str_Receiver}${str_FullInfo}${dotCsv}`,
              pathAbsOrRel: "" as string,
              freqMap: new Map<string, number>([]),
            },
          },
        },
      },
    },
  },
} as const;

type TyCheckThatTObjExtendsTSource<TSource, TObj extends TSource> = TObj &
  never;
export type TyDoTheCheck = TyCheckThatTObjExtendsTSource<
  TyOneFolderIndicator,
  typeof groundFolder
>;

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

  const resultsFolderPath = path.join(
    mboxStatsFolderPath,
    groundFolder.innerFolders.mboxStats.innerFolders.results.folderName,
  );

  // create results Folder
  try {
    if (!existsSync(resultsFolderPath)) {
      mkdirSync(resultsFolderPath);
    }

    groundFolder.innerFolders.mboxStats.innerFolders.results[
      // @ts-ignore
      "pathAbsOrRel"
    ] = resultsFolderPath;
  } catch (err) {
    console.error(err);
  }

  //===================================
  //===================================
  //===================================

  const resultsFoldersInnerFiles =
    groundFolder.innerFolders.mboxStats.innerFolders.results.innerFiles;

  //

  const arrOfObjKeysOfCandFiles = Object.keys(
    resultsFoldersInnerFiles,
  ) as (keyof typeof resultsFoldersInnerFiles)[];

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