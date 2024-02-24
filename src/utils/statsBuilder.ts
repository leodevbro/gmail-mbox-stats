import {
  TyFromOrTo,
  TyMailAddress,
  TyMailDomain,
  TyMainInfoForMail,
} from "../types/mailparserTypes";
import { groundFolder } from "./stepUtils";

const resultsInnerFiles =
  groundFolder.innerFolders.mboxStats.innerFolders.results.innerFiles;

const incrementInMap = <TKey extends string, TMap extends Map<TKey, number>>(
  theMap: TMap,
  key: TKey,
) => {
  theMap.set(key, (theMap.get(key) || 0) + 1);
};

const handleSenderOrReceiverAddressAndDomain = ({
  senderOrReceiver,
  mapForAddress,
  mapForDomain,
  mapForFullInfo,
}: {
  senderOrReceiver: TyFromOrTo;
  mapForAddress: Map<TyMailAddress, number>;
  mapForDomain: Map<TyMailDomain, number>;
  mapForFullInfo: Map<string, number>;
}): void => {
  const senderOrReceiver_arr = senderOrReceiver.value; // probably there will be always one sender, no more, no less, but still.

  // for: ${str_frequency}${str_Sender}${str_Address} - or for receiver
  senderOrReceiver_arr.forEach((senderOrReceiver) => {
    incrementInMap(mapForAddress, senderOrReceiver.address);
  });

  // for: ${str_frequency}${str_Sender}${str_Domain} - for or receiver
  senderOrReceiver_arr.forEach((senderOrReceiver) => {
    const address = senderOrReceiver.address;
    const indexOfTheAtSymbol = address.indexOf("@");
    if (indexOfTheAtSymbol <= 0) {
      throw new Error(`Email address is not correct --- ${address}`);
    }
    const domain = address.slice(indexOfTheAtSymbol) as TyMailDomain;
    incrementInMap(mapForDomain, domain);
  });

  // for: ${str_frequency}${str_Sender}${str_FullInfo} - for or receiver
  incrementInMap(mapForFullInfo, senderOrReceiver.text);
};

export const addOneBrickToStats = (
  mainInfoOfOneMail: TyMainInfoForMail,
): void => {
  // for sender
  handleSenderOrReceiverAddressAndDomain({
    senderOrReceiver: mainInfoOfOneMail.from,
    mapForAddress: resultsInnerFiles.frequencySenderAddress.freqMap,
    mapForDomain: resultsInnerFiles.frequencySenderDomain.freqMap,
    mapForFullInfo: resultsInnerFiles.frequencySenderFullInfo.freqMap,
  });

  // for receiver
  handleSenderOrReceiverAddressAndDomain({
    senderOrReceiver: mainInfoOfOneMail.to,
    mapForAddress: resultsInnerFiles.frequencyReceiverAddress.freqMap,
    mapForDomain: resultsInnerFiles.frequencyReceiverDomain.freqMap,
    mapForFullInfo: resultsInnerFiles.frequencyReceiverFullInfo.freqMap,
  });
};
