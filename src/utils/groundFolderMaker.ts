import { slimStartDateTime } from "../constants";
import { TyMailAddress, TyMailDomain } from "../types/mailparserTypes";

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

export type TySenderCategory = "me" | "notMeOrUnkn"; // for names of files

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
  const sCatStr = category;

  // const resultsFolderForSpecificSenderCategory: TyOneFolderIndicator
  const resultsFolderForSpecificSenderCategory = {
    folderName: "results", // will become "forMailsWhereSenderIsMe" or "forMailsWhereSenderIsNotMeOrIsUnknown"
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
      folderName: `mailStats_${slimStartDateTime.v}`,
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
        forMailsWhereSenderIsNotMeOrIsUnknown: {
          ...createResultsObjForSpecificSenderCategory("notMeOrUnkn"),
          folderName: "forMailsWhereSenderIsNotMeOrIsUnknown",
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
