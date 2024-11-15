import { isMaybeCorrectNotationOfAddress, myEmail } from "../basicStarter";
import {
  TyGmailMailHeadersAsObj,
  TyMailAddress,
  TyMailDomain,
  TyZenFamilyKind,
  TyZenMainInfoForMail,
  TyZenParticipant,
} from "../types/mailparserTypes";
import { groundFolder } from "./groundFolderMaker";

import {
  combineAddressAndName,
  // str_EMPTY
} from "./sweetUtils";

export type TyAttachmMapsCollection<TyKey extends string> = {
  attachmTotalSize: Map<TyKey, number>;
  attachmTotalCount: Map<TyKey, number>;
  mailCountWithNonZeroCountOfAttachments: Map<TyKey, number>;
};

export type TyAttachmData = {
  sumOfSizesOfAttachmentsOfOneMail: number;
  countOfAttachmentsInThisMail: number;
  //
  //
  //
  maps: {
    forSender: {
      forAddress: TyAttachmMapsCollection<TyMailAddress>;
      forDomain: TyAttachmMapsCollection<TyMailDomain>;
    };

    forReceiver: {
      forAddress: TyAttachmMapsCollection<TyMailAddress>;
      forDomain: null;
    };

    forCc: null;
    forBcc: null;
  };
};

// export type TyParticipantRole = "sender" | "receiver" | "cc" | "bcc";

const gmailMessageIdSearchParam = "rfc822msgid";
const gmailMessageIdSearcher = `${gmailMessageIdSearchParam}:`;

export const generateSearchableIdOfMail = (nonCleanId: string): string => {
  const asArr = nonCleanId.split(/[<>]/);
  const cleanId = asArr.join("");
  const searchable = `${gmailMessageIdSearcher}${cleanId}`;
  return searchable;
};

export const getSearchableIdForToBeEasyToCopy = (nonCleanId: string) => {
  return `Search: ===${generateSearchableIdOfMail(nonCleanId)}===`;
};

//
//
//
//
//
//

//
//
//
//
//
//
//

// type TyUnknownValForItem = Record<TyParticipantRole, string>;

// export const unknownVal: {
//   address: TyUnknownValForItem;
//   domain: TyUnknownValForItem;
// } = {
//   address: {
//     sender: "(unknown address of sender)",
//     receiver: "(unknown address of receiver)",
//     cc: "zZz",
//     bcc: "zZz",
//   },
//   domain: {
//     sender: "(unknown domain of sender)",
//     receiver: "(unknown domain of receiver)",
//     cc: "zZz",
//     bcc: "zZz",
//   },
// } as const;

const msFolders = groundFolder.innerFolders.mboxStats.innerFolders;

const resultsInnerFilesCategories = {
  me: msFolders.forMailsWhereSenderIsMe.innerFiles,
  notMe: msFolders.forMailsWhereSenderIsNotMeOrIsUnknown.innerFiles,
} as const;

const incrementInMap = <
  TKey extends string,
  TMap extends Map<TKey, number>,
>(theProps: {
  theMap: TMap;
  key: TKey;
  stepN: number;
  participantRole: TyZenFamilyKind;
}) => {
  const { theMap, key, stepN, participantRole } = theProps;

  if (
    !key
    // || key === str_EMPTY
  ) {
    console.log(
      `${stepN} - here (${participantRole}): maybe error, value is somehow nullish: ${key}, type is: ${typeof key}`,
    );
    return;
  }
  const outdatedVal = theMap.get(key) || 0;
  theMap.set(key, outdatedVal + 1);
};

const advancedIncrInMap = <
  TMap extends Map<TKey, number>,
  TKey extends string,
  TIncr extends number,
>(theProps: {
  theMap: TMap;
  key: TKey;
  incr: TIncr;
  stepN: number;
  participantRole: null | TyZenFamilyKind;
}) => {
  const { theMap, key, incr, stepN, participantRole } = theProps;

  if (!key) {
    console.log(
      `${stepN} - here (${
        participantRole || ""
      }): maybe error, value is somehow nullish: ${key}, type is: ${typeof key}`,
    );
    return;
  }
  const outdatedVal = theMap.get(key) || 0;
  theMap.set(key, outdatedVal + incr);
}; //

const getDomainFromAddress = (address: string) => {
  // if address notation is incorrect, just return the input
  if (!isMaybeCorrectNotationOfAddress(address)) {
    return address;
  }

  const indexOfTheAtSymbol = address.indexOf("@");
  const domain = address.slice(indexOfTheAtSymbol) as TyMailDomain;
  return domain;
};

const handleParticipantArrIntoTheMaps = ({
  // messageId,
  participantArr,
  mapForAddress,
  mapForDomain,
  mapForAANInfo, // AAN -> Address and Name
  stepN,
  participantRole,
  attachmDataForCurrCateg,
}: {
  messageId: TyGmailMailHeadersAsObj["message-id"];
  participantArr: TyZenParticipant[];
  mapForAddress: Map<TyMailAddress, number>;
  mapForDomain: null | Map<TyMailDomain, number>;
  mapForAANInfo: null | Map<string, number>; // AAN -> Address and Name
  participantRole: TyZenFamilyKind;
  stepN: number;
  attachmDataForCurrCateg: null | TyAttachmData;
}): void => {
  // const majorRoles: string[] = ["from", "to", "zenTo"];

  // const isMajorRole = majorRoles.includes(participantRole);

  if (!participantArr) {
    // console.log(
    //   `${stepN} - here: ${participantRole} not found - ${getSearchableIdForToBeEasyToCopy(
    //     messageId,
    //   )}`,
    // );
    throw new Error(
      `participantArr (${participantRole}) is falsy --- handleParticipantIntoFreqMap`,
    );
  }

  // if (!participantArr.length && isMajorRole) {
  //   throw new Error("participantArr is empty --- handleParticipantIntoFreqMap");
  // }

  if (!participantArr.length && participantRole === "from") {
    throw new Error("Sender not found --- handleParticipantIntoFreqMap");
  }

  const categSelectorObj: Record<TyZenFamilyKind, keyof TyAttachmData["maps"]> =
    {
      from: "forSender",
      zenTo: "forReceiver",
      cc: "forCc",
      bcc: "forBcc",
    };

  const categSelector = categSelectorObj[participantRole];

  const attachmMapsWrapOfCurrCateg =
    attachmDataForCurrCateg?.maps[categSelector];

  participantArr.forEach((prtc) => {
    // first, Address and domain

    incrementInMap({
      theMap: mapForAddress,
      key: prtc.address,
      stepN,
      participantRole,
    });

    const theDomain = getDomainFromAddress(prtc.address);

    if (attachmMapsWrapOfCurrCateg) {
      type TySuperPropsForIncr<TyKey extends string> = {
        theMap: Map<TyKey, number>;
        incr: number;
      };

      const handleByKey = (theKey: "forAddress" | "forDomain") => {
        const currSpaceOfMaps = attachmMapsWrapOfCurrCateg[theKey];

        if (!currSpaceOfMaps) {
          return;
        }
        const superArrByAddress: TySuperPropsForIncr<string>[] = [
          {
            theMap: currSpaceOfMaps.attachmTotalSize,
            incr: attachmDataForCurrCateg.sumOfSizesOfAttachmentsOfOneMail,
          },
          {
            theMap: currSpaceOfMaps.attachmTotalCount,
            incr: attachmDataForCurrCateg.countOfAttachmentsInThisMail,
          },
          {
            theMap: currSpaceOfMaps.mailCountWithNonZeroCountOfAttachments,
            incr: attachmDataForCurrCateg.countOfAttachmentsInThisMail && 1,
          },
        ];

        superArrByAddress.forEach(({ theMap, incr }) => {
          advancedIncrInMap({
            stepN,
            theMap,
            participantRole,
            key: theKey === "forDomain" ? theDomain : prtc.address,
            incr,
          });
        });
      };

      handleByKey("forAddress");
      handleByKey("forDomain");
    }

    // this mapForDomain is for freq, not for attachments
    if (mapForDomain) {
      incrementInMap({
        theMap: mapForDomain,
        key: theDomain,
        stepN,
        participantRole,
      });
    }

    // AddressAndName
    if (mapForAANInfo) {
      incrementInMap({
        theMap: mapForAANInfo,
        key: combineAddressAndName(prtc.address, prtc.name),
        stepN,
        participantRole,
      });
    }
  });
};

export const addOneMailInfoToStats = ({
  oneMail,
  stepN,
  //
  sumOfSizesOfAttachmentsOfOneMail,
  countOfAttachmentsInThisMail,
}: {
  oneMail: TyZenMainInfoForMail;
  stepN: number;
  //
  sumOfSizesOfAttachmentsOfOneMail: number; // MB => million bytes
  countOfAttachmentsInThisMail: number;
}): void => {
  const currSenderAddress = oneMail.from[0].address; // assumes there will be always 1 sender, not less, not more.

  const currSenderCategory: keyof typeof resultsInnerFilesCategories =
    currSenderAddress.toLowerCase() === myEmail ? "me" : "notMe";

  const innerFilesForThisCategory =
    resultsInnerFilesCategories[currSenderCategory];

  const key_messagesCount = "messagesWhereRelevantValuesFound";

  if (oneMail.from.length >= 1) {
    // @ts-ignore
    innerFilesForThisCategory.frequencySenderAddress[key_messagesCount] += 1;
    // @ts-ignore
    innerFilesForThisCategory.frequencySenderDomain[key_messagesCount] += 1;

    (innerFilesForThisCategory.frequencySenderAddressAndName as any)[
      key_messagesCount
    ] += 1;
  } else {
    throw new Error(
      `oneMail.from.length is less than 1. It should be 1 or more.`,
    );
  }

  //
  //
  //

  const attachmDataForCurrCateg: TyAttachmData = {
    countOfAttachmentsInThisMail,
    sumOfSizesOfAttachmentsOfOneMail,
    maps: {
      forSender: {
        forAddress: {
          attachmTotalSize:
            innerFilesForThisCategory.attachmentsBySender.attachmTotalSizeMap,

          attachmTotalCount:
            innerFilesForThisCategory.attachmentsBySender.attachmTotalCountMap,

          mailCountWithNonZeroCountOfAttachments:
            innerFilesForThisCategory.attachmentsBySender
              .mailCountWithNonZeroCountOfAttachmentsMap,
        },

        forDomain: {
          attachmTotalSize:
            innerFilesForThisCategory.attachmentsByDomain.attachmTotalSizeMap,

          attachmTotalCount:
            innerFilesForThisCategory.attachmentsByDomain.attachmTotalCountMap,

          mailCountWithNonZeroCountOfAttachments:
            innerFilesForThisCategory.attachmentsByDomain
              .mailCountWithNonZeroCountOfAttachmentsMap,
        },
      },

      forReceiver: {
        forAddress: {
          attachmTotalSize:
            innerFilesForThisCategory.attachmentsByReceiver.attachmTotalSizeMap,

          attachmTotalCount:
            innerFilesForThisCategory.attachmentsByReceiver
              .attachmTotalCountMap,

          mailCountWithNonZeroCountOfAttachments:
            innerFilesForThisCategory.attachmentsByReceiver
              .mailCountWithNonZeroCountOfAttachmentsMap,
        },
        forDomain: null,
      },

      forCc: null,
      forBcc: null,
    },
  };

  //
  //
  //

  // for sender
  handleParticipantArrIntoTheMaps({
    messageId: oneMail["message-id"],
    participantArr: oneMail.from,
    mapForAddress: innerFilesForThisCategory.frequencySenderAddress.freqMap,
    mapForDomain: innerFilesForThisCategory.frequencySenderDomain.freqMap,
    mapForAANInfo:
      innerFilesForThisCategory.frequencySenderAddressAndName.freqMap,
    participantRole: "from",
    stepN,
    attachmDataForCurrCateg,
  });

  //

  if (oneMail.zenTo.length >= 1) {
    // @ts-ignore
    innerFilesForThisCategory.frequencyReceiverAddress[key_messagesCount] += 1;
  } else {
    throw new Error(
      `oneMail.zenTo.length is less than 1. It should be 1 or more.`,
    );
  }

  // for receiver
  handleParticipantArrIntoTheMaps({
    messageId: oneMail["message-id"],
    participantArr: oneMail.zenTo,
    mapForAddress: innerFilesForThisCategory.frequencyReceiverAddress.freqMap,
    mapForDomain: null,
    mapForAANInfo: null,
    participantRole: "zenTo",
    stepN,
    attachmDataForCurrCateg,
  });

  //

  if (oneMail.cc.length >= 1) {
    // @ts-ignore
    innerFilesForThisCategory.frequencyCcAddress[key_messagesCount] += 1;
  }

  // for cc
  handleParticipantArrIntoTheMaps({
    messageId: oneMail["message-id"],
    participantArr: oneMail.cc,
    mapForAddress: innerFilesForThisCategory.frequencyCcAddress.freqMap,
    mapForDomain: null,
    mapForAANInfo: null,
    participantRole: "cc",
    stepN,
    attachmDataForCurrCateg: null,
  });

  if (oneMail.bcc.length >= 1) {
    // @ts-ignore
    innerFilesForThisCategory.frequencyBccAddress[key_messagesCount] += 1;
  }

  // for bcc
  handleParticipantArrIntoTheMaps({
    messageId: oneMail["message-id"],
    participantArr: oneMail.bcc,
    mapForAddress: innerFilesForThisCategory.frequencyBccAddress.freqMap,
    mapForDomain: null,
    mapForAANInfo: null,
    participantRole: "bcc",
    stepN,
    attachmDataForCurrCateg: null,
  });
};
