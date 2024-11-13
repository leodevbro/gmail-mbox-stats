import { myEmail } from "..";
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

export type TyAttachmData = {
  sumOfSizesOfAttachmentsOfOneMail: number;
  countOfAttachmentsInThisMail: number;
  //
  //
  //
  maps: {
    forAddress: {
      attachmTotalSize: Map<TyMailAddress, number>;
      attachmTotalCount: Map<TyMailAddress, number>;
      mailCountWithNonZeroCountOfAttachments: Map<TyMailAddress, number>;
    };

    forDomain: {
      attachmTotalSize: Map<TyMailDomain, number>;
      attachmTotalCount: Map<TyMailDomain, number>;
      mailCountWithNonZeroCountOfAttachments: Map<TyMailDomain, number>;
    };
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

export const isMaybeCorrectNotationOfAddress = (notation: string): boolean => {
  const indexOfTheAtSymbol = notation.indexOf("@");
  const theAtSymbolIsAtCorrectIndex =
    indexOfTheAtSymbol >= 1 && indexOfTheAtSymbol <= notation.length - 3;

  if (!theAtSymbolIsAtCorrectIndex) {
    return false;
  }

  return true;
};

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

  participantArr.forEach((prtc) => {
    // first, Address and domain

    incrementInMap({
      theMap: mapForAddress,
      key: prtc.address,
      stepN,
      participantRole,
    });

    const theDomain = getDomainFromAddress(prtc.address);

    if (attachmDataForCurrCateg) {
      // attachments map for address for size
      advancedIncrInMap({
        stepN,
        theMap: attachmDataForCurrCateg.maps.forAddress.attachmTotalSize,
        participantRole,
        key: prtc.address,
        incr: attachmDataForCurrCateg.sumOfSizesOfAttachmentsOfOneMail,
      });

      // for domain:
      advancedIncrInMap({
        stepN,
        theMap: attachmDataForCurrCateg.maps.forDomain.attachmTotalSize,
        participantRole,
        key: theDomain,
        incr: attachmDataForCurrCateg.sumOfSizesOfAttachmentsOfOneMail,
      });

      if (attachmDataForCurrCateg.countOfAttachmentsInThisMail >= 1) {
        // attachments map for address for count of attachments
        advancedIncrInMap({
          stepN,
          theMap: attachmDataForCurrCateg.maps.forAddress.attachmTotalCount,
          participantRole,
          key: prtc.address,
          incr: attachmDataForCurrCateg.countOfAttachmentsInThisMail,
        });
        // for domain:
        advancedIncrInMap({
          stepN,
          theMap: attachmDataForCurrCateg.maps.forDomain.attachmTotalCount,
          participantRole,
          key: theDomain,
          incr: attachmDataForCurrCateg.countOfAttachmentsInThisMail,
        });

        //
        //

        // attachments map for address for mailCountWithNonZeroCountOfAttachments
        advancedIncrInMap({
          stepN,
          theMap:
            attachmDataForCurrCateg.maps.forAddress
              .mailCountWithNonZeroCountOfAttachments,
          participantRole,
          key: prtc.address,
          incr: 1,
        });

        // for domain:
        advancedIncrInMap({
          stepN,
          theMap:
            attachmDataForCurrCateg.maps.forDomain
              .mailCountWithNonZeroCountOfAttachments,
          participantRole,
          key: theDomain,
          incr: 1,
        });
      }
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
  sumOfSizesOfAttachmentsOfOneMail: number; // bytes
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
    attachmDataForCurrCateg: null,
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
