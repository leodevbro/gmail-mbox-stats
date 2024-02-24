import {
  TyExampleObjOfHeaders,
  TyFromOrTo,
  TyMailAddress,
  TyMailDomain,
  TyMainInfoForMail,
} from "../types/mailparserTypes";
import { groundFolder } from "./stepUtils";

const unknowAddressStr = "(unknown address)";
const unknowDomainStr = "(unknown domain)";

const resultsInnerFiles =
  groundFolder.innerFolders.mboxStats.innerFolders.results.innerFiles;

const isMaybeCorrectNotationOfAddress = (notation: string): boolean => {
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
  theMap.set(key, (theMap.get(key) || 0) + 1);
};

const handleSenderOrReceiverAddressAndDomain = ({
  messageId,
  senderOrReceiver,
  mapForAddress,
  mapForDomain,
  mapForFullInfo,
  participant,
}: {
  messageId: TyExampleObjOfHeaders["message-id"];
  senderOrReceiver: TyFromOrTo;
  mapForAddress: Map<TyMailAddress, number>;
  mapForDomain: Map<TyMailDomain, number>;
  mapForFullInfo: Map<string, number>;
  participant: "sender" | "receiver";
}): void => {
  const senderOrReceiver_arr = senderOrReceiver.value.map((x) => x.address); // probably there will be always one sender, no more, no less, but still.

  const withUniqueAddresses = [...new Set(senderOrReceiver_arr)];

  // for: ${str_frequency}${str_Sender}${str_Address} - or for receiver
  withUniqueAddresses.forEach(
    (senderOrReceiver: TyMailAddress | undefined | null) => {
      if (senderOrReceiver) {
        if (isMaybeCorrectNotationOfAddress(senderOrReceiver)) {
          incrementInMap(mapForAddress, senderOrReceiver);
          //
          const indexOfTheAtSymbol = senderOrReceiver.indexOf("@");
          const domain = senderOrReceiver.slice(
            indexOfTheAtSymbol,
          ) as TyMailDomain;
          incrementInMap(mapForDomain, domain);
        } else {
          console.log(
            `${participant} address notation is incorrect - "${senderOrReceiver}", mailId: ${messageId}`,
          );
          incrementInMap(mapForAddress, senderOrReceiver);
          incrementInMap(mapForDomain, senderOrReceiver);
        }
      } else {
        console.log(
          `${participant} address not found - ${typeof senderOrReceiver} - ${senderOrReceiver}, mailId: ${messageId}`,
        );
        incrementInMap(mapForAddress, unknowAddressStr as any);
        incrementInMap(mapForDomain, unknowDomainStr as any);
      }
    },
  );

  // for: ${str_frequency}${str_Sender}${str_FullInfo} - for or receiver
  incrementInMap(mapForFullInfo, senderOrReceiver.text);
};

export const addOneMailInfoToStats = (
  mainInfoOfOneMail: TyMainInfoForMail,
): void => {
  // for sender
  handleSenderOrReceiverAddressAndDomain({
    messageId: mainInfoOfOneMail.messageId,
    senderOrReceiver: mainInfoOfOneMail.from,
    mapForAddress: resultsInnerFiles.frequencySenderAddress.freqMap,
    mapForDomain: resultsInnerFiles.frequencySenderDomain.freqMap,
    mapForFullInfo: resultsInnerFiles.frequencySenderFullInfo.freqMap,
    participant: "sender",
  });

  // for receiver
  handleSenderOrReceiverAddressAndDomain({
    messageId: mainInfoOfOneMail.messageId,
    senderOrReceiver: mainInfoOfOneMail.to,
    mapForAddress: resultsInnerFiles.frequencyReceiverAddress.freqMap,
    mapForDomain: resultsInnerFiles.frequencyReceiverDomain.freqMap,
    mapForFullInfo: resultsInnerFiles.frequencyReceiverFullInfo.freqMap,
    participant: "receiver",
  });
};
