import { myEmail } from "..";
import {
  TyGmailMailHeadersAsObj,
  TyMailAddress,
  TyMailDomain,
  TyZenFamilyKind,
  TyZenMainInfoForMail,
  TyZenParticipant,
} from "../types/mailparserTypes";
import { groundFolder } from "./stepUtils";
import { combineAddressAndName, str_EMPTY } from "./sweetUtils";

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
  me: msFolders.resultsForMailsWithSenderAsMe.innerFiles,
  notMe: msFolders.resultsForMailsWithSenderAsNotMe.innerFiles,
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
) => {
  if (!key || key === str_EMPTY) {
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
}: // participantRole,
// stepN,
{
  messageId: TyGmailMailHeadersAsObj["message-id"];
  participantArr: TyZenParticipant[];
  mapForAddress: Map<TyMailAddress, number>;
  mapForDomain: null | Map<TyMailDomain, number>;
  mapForAANInfo: null | Map<string, number>; // AAN -> Address and Name
  participantRole: TyZenFamilyKind;
  stepN: number;
}): void => {
  if (!participantArr) {
    // console.log(
    //   `${stepN} - here: ${participantRole} not found - ${getSearchableIdForToBeEasyToCopy(
    //     messageId,
    //   )}`,
    // );
    throw new Error("participantArr is falsy --- handleParticipantIntoFreqMap");
  }

  if (!participantArr.length) {
    throw new Error("participantArr is empty --- handleParticipantIntoFreqMap");
  }

  // Address and domain
  participantArr.forEach((prtc) => {
    incrementInMap(mapForAddress, prtc.address);

    if (mapForDomain) {
      if (isMaybeCorrectNotationOfAddress(prtc.address)) {
        const indexOfTheAtSymbol = prtc.address.indexOf("@");
        const domain = prtc.address.slice(indexOfTheAtSymbol) as TyMailDomain;
        incrementInMap(mapForDomain, domain);
      } else {
        incrementInMap(mapForDomain, prtc.address);
      }
    }

    // AddressAndName
    if (mapForAANInfo) {
      incrementInMap(
        mapForAANInfo,
        combineAddressAndName(prtc.address, prtc.name),
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
    currSenderAddress === myEmail ? "me" : "notMe";

  const innerFilesForThisCategory =
    resultsInnerFilesCategories[currSenderCategory];

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
