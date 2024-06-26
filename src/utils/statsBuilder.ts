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

const incrementInMap = <TKey extends string, TMap extends Map<TKey, number>>(
  theMap: TMap,
  key: TKey,
  stepN: number,
  participantRole: TyZenFamilyKind,
) => {
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

const handleParticipantIntoFreqMap = ({
  // messageId,
  participantArr,
  mapForAddress,
  mapForDomain,
  mapForAANInfo, // AAN -> Address and Name
  stepN,
  participantRole,
}: {
  messageId: TyGmailMailHeadersAsObj["message-id"];
  participantArr: TyZenParticipant[];
  mapForAddress: Map<TyMailAddress, number>;
  mapForDomain: null | Map<TyMailDomain, number>;
  mapForAANInfo: null | Map<string, number>; // AAN -> Address and Name
  participantRole: TyZenFamilyKind;
  stepN: number;
}): void => {
  const majorRoles: string[] = ["from", "to", "zenTo"];

  const isMajorRole = majorRoles.includes(participantRole);

  if (!participantArr) {
    // console.log(
    //   `${stepN} - here: ${participantRole} not found - ${getSearchableIdForToBeEasyToCopy(
    //     messageId,
    //   )}`,
    // );
    throw new Error("participantArr is falsy --- handleParticipantIntoFreqMap");
  }

  if (!participantArr.length && isMajorRole) {
    throw new Error("participantArr is empty --- handleParticipantIntoFreqMap");
  }

  // Address and domain
  participantArr.forEach((prtc) => {
    incrementInMap(mapForAddress, prtc.address, stepN, participantRole);

    if (mapForDomain) {
      if (isMaybeCorrectNotationOfAddress(prtc.address)) {
        const indexOfTheAtSymbol = prtc.address.indexOf("@");
        const domain = prtc.address.slice(indexOfTheAtSymbol) as TyMailDomain;
        incrementInMap(mapForDomain, domain, stepN, participantRole);
      } else {
        incrementInMap(mapForDomain, prtc.address, stepN, participantRole);
      }
    }

    // AddressAndName
    if (mapForAANInfo) {
      incrementInMap(
        mapForAANInfo,
        combineAddressAndName(prtc.address, prtc.name),
        stepN,
        participantRole,
      );
    }
  });
};

export const addOneMailInfoToStats = (
  oneMail: TyZenMainInfoForMail,
  stepN: number,
): void => {
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

  // for sender
  handleParticipantIntoFreqMap({
    messageId: oneMail["message-id"],
    participantArr: oneMail.from,
    mapForAddress: innerFilesForThisCategory.frequencySenderAddress.freqMap,
    mapForDomain: innerFilesForThisCategory.frequencySenderDomain.freqMap,
    mapForAANInfo:
      innerFilesForThisCategory.frequencySenderAddressAndName.freqMap,
    participantRole: "from",
    stepN,
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
  handleParticipantIntoFreqMap({
    messageId: oneMail["message-id"],
    participantArr: oneMail.zenTo,
    mapForAddress: innerFilesForThisCategory.frequencyReceiverAddress.freqMap,
    mapForDomain: null,
    mapForAANInfo: null,
    participantRole: "zenTo",
    stepN,
  });

  //

  if (oneMail.cc.length >= 1) {
    // @ts-ignore
    innerFilesForThisCategory.frequencyCcAddress[key_messagesCount] += 1;
  }

  // for cc
  handleParticipantIntoFreqMap({
    messageId: oneMail["message-id"],
    participantArr: oneMail.cc,
    mapForAddress: innerFilesForThisCategory.frequencyCcAddress.freqMap,
    mapForDomain: null,
    mapForAANInfo: null,
    participantRole: "cc",
    stepN,
  });

  if (oneMail.bcc.length >= 1) {
    // @ts-ignore
    innerFilesForThisCategory.frequencyBccAddress[key_messagesCount] += 1;
  }

  // for bcc
  handleParticipantIntoFreqMap({
    messageId: oneMail["message-id"],
    participantArr: oneMail.bcc,
    mapForAddress: innerFilesForThisCategory.frequencyBccAddress.freqMap,
    mapForDomain: null,
    mapForAANInfo: null,
    participantRole: "bcc",
    stepN,
  });
};
