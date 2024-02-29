import { mainRoles } from "..";
import {
  TyGroupOfParticipants,
  TyMailAddress,
  TyMainInfoForMail,
} from "../types/mailparserTypes";
import {
  TyParticipantRole,
  getSearchableIdForToBeEasyToCopy,
  unknownVal,
} from "./statsBuilder";

export const getAddressesFromGroup = (
  group: TyGroupOfParticipants,
): TyMailAddress[] => {
  const arrRaw = (group?.value || []).map((x) => x.address);
  const arr = arrRaw.filter((x) => x) as TyMailAddress[];

  return arr;
};

export const getLogicalAddressesOfReceivers = ({
  mailMainInfo,
  stepN,
}: {
  mailMainInfo: TyMainInfoForMail;
  stepN: number;
}): TyMailAddress[] => {
  const theTo = getAddressesFromGroup(mailMainInfo.to);
  const theDeliveredTo = getAddressesFromGroup(mailMainInfo["delivered-to"]);

  const combinedArr = [...theTo, ...theDeliveredTo];

  const theSet = new Set(combinedArr);

  if (theSet.size === 0) {
    console.log(
      `${stepN} - here: ${"receiver"} address not found - ${JSON.stringify(
        mailMainInfo,
      )} - ${getSearchableIdForToBeEasyToCopy(mailMainInfo.messageId)}`,
    );
  }

  const finalArr = [...theSet];

  return finalArr;
};

export const getOneAddressOrArr = (
  participant: TyGroupOfParticipants | undefined | null,
  participantRole: TyParticipantRole,
) => {
  const isMainParticipant = mainRoles.includes(participantRole);

  if (!participant) {
    if (isMainParticipant) {
      console.log(`${participantRole} address not found`);
    }
    return unknownVal.address[participantRole];
  }

  const arr = participant.value;
  const fullArrOfAddresses = arr
    .map((x) => x.address)
    .filter((x) => x) as TyMailAddress[];
  const withOnlyUniqueValues = [...new Set(fullArrOfAddresses)];

  if (withOnlyUniqueValues.length === 0) {
    if (isMainParticipant) {
      console.log(`${participantRole} address not found`);
    }
    return unknownVal.address[participantRole];
  }

  if (withOnlyUniqueValues.length === 1) {
    return withOnlyUniqueValues[0];
  }

  return withOnlyUniqueValues;
};
