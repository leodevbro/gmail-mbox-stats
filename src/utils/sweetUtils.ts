import {
  TyFamilyKind,
  TyGmailMailHeadersAsObj,
  TyParticipationFamilyInfo,
  TyZenFamilyKind,
  TyZenParticipant,
} from "../types/mailparserTypes";
import { getSearchableIdForToBeEasyToCopy } from "./statsBuilder";

type TyFamilyMeta = {
  familyKind: TyFamilyKind;
  participationInfo?: TyParticipationFamilyInfo;
};

// export const getAddressesFromFamily = (
//   family?: TyParticipationFamilyInfo,
// ): TyMailAddress[] => {
//   if (!family) {
//     return [];
//   }
//   family;

//   const arrRaw = family.value.map((x) => x.address);
//   const arr = arrRaw.filter((x) => x) as TyMailAddress[];

//   return arr;
// };

// export const getLogicalAddressesOfReceivers = ({
//   mailMainInfo,
//   stepN,
// }: {
//   mailMainInfo: TyMainInfoForMail;
//   stepN: number;
// }): TyMailAddress[] => {
//   const theTo = getAddressesFromFamily(mailMainInfo.to);
//   const theDeliveredTo = getAddressesFromFamily(mailMainInfo["delivered-to"]);

//   const combinedArr = [...theTo, ...theDeliveredTo];

//   const theSet = new Set(combinedArr);

//   if (theSet.size === 0) {
//     console.log(
//       `${stepN} - here: ${"receiver"} address not found - ${JSON.stringify(
//         mailMainInfo,
//       )} - ${getSearchableIdForToBeEasyToCopy(mailMainInfo.messageId)}`,
//     );
//   }

//   const finalArr = [...theSet];

//   return finalArr;
// };

// export const getOneAddressOrArr = (
//   participant: TyGroupOfParticipants | undefined | null,
//   participantRole: TyParticipantRole,
// ) => {
//   const isMainParticipant = mainRoles.includes(participantRole);

//   if (!participant) {
//     if (isMainParticipant) {
//       console.log(`${participantRole} address not found`);
//     }
//     return unknownVal.address[participantRole];
//   }

//   const arr = participant.value;
//   const fullArrOfAddresses = arr
//     .map((x) => x.address)
//     .filter((x) => x) as TyMailAddress[];
//   const withOnlyUniqueValues = [...new Set(fullArrOfAddresses)];

//   if (withOnlyUniqueValues.length === 0) {
//     if (isMainParticipant) {
//       console.log(`${participantRole} address not found`);
//     }
//     return unknownVal.address[participantRole];
//   }

//   if (withOnlyUniqueValues.length === 1) {
//     return withOnlyUniqueValues[0];
//   }

//   return withOnlyUniqueValues;
// };

export const getZenParticipantsFromFamily = ({
  family,
}: // familyKind,
// step,
{
  family?: TyParticipationFamilyInfo;
  familyKind: TyFamilyKind;
  step: number;
}): TyZenParticipant[] => {
  if (!family) {
    return [];
  }

  if (!family.value) {
    return [];
  }

  const zenArr: TyZenParticipant[] = family.value
    .map((ptc) => {
      const zenPtc: TyZenParticipant = {
        address: ptc.address || "",
        name: ptc.name || "",
      };

      return zenPtc;
    })
    .filter((x) => x.address);

  const uniqified = new Map<string, TyZenParticipant>(
    zenArr.map((p) => [p.address, p]),
  );

  const final = [...uniqified].map((duo) => duo[1]);

  return final;
};

export const combineTwoFamiliesIntoZenArr = ({
  twoFamilies,
  step,
}: {
  twoFamilies: [TyFamilyMeta, TyFamilyMeta];
  step: number;
}): TyZenParticipant[] => {
  const firstFamilyMeta = twoFamilies[0];
  const secondFamilyMeta = twoFamilies[1];

  if (
    !firstFamilyMeta.participationInfo &&
    !secondFamilyMeta.participationInfo
  ) {
    return [];
  }

  const zenOfFirst = getZenParticipantsFromFamily({
    familyKind: firstFamilyMeta.familyKind,
    step,
    family: firstFamilyMeta.participationInfo,
  });

  const zenOfSecond = getZenParticipantsFromFamily({
    familyKind: secondFamilyMeta.familyKind,
    step,
    family: secondFamilyMeta.participationInfo,
  });

  const uniqified = new Map<string, TyZenParticipant>(
    [...zenOfFirst, ...zenOfSecond].map((p) => [p.address, p]),
  );

  const final = [...uniqified].map((duo) => duo[1]);

  return final;
};

export const combineAddressAndName = (address: string, name: string) => {
  return `${address} --- ${name}`;
};

export const prepareZenParticipantArrAsMainListItemStr = ({
  zenParticipants,
  ptcProp,
  zenFamilyKind,
  step,
  messageId,
}: {
  zenParticipants: TyZenParticipant[];
  ptcProp: keyof TyZenParticipant | "AddressAndName";
  zenFamilyKind: TyZenFamilyKind;
  step: number;
  messageId: TyGmailMailHeadersAsObj["message-id"];
}): string => {
  if (zenParticipants.length === 0) {
    if (
      ptcProp === "address" &&
      (["from", "zenTo"] as TyZenFamilyKind[]).includes(zenFamilyKind)
    ) {
      console.log(
        `${step} - here: '${zenFamilyKind}' ${ptcProp} not found  - ${getSearchableIdForToBeEasyToCopy(
          messageId,
        )}`,
      );
    }

    return "";
  }

  if (zenParticipants.length === 1) {
    if (ptcProp === "AddressAndName") {
      const strItem = combineAddressAndName(
        zenParticipants[0]["address"],
        zenParticipants[0]["name"],
      );
      return strItem;
    }
    const strItem = zenParticipants[0][ptcProp];
    return strItem;
  }

  // here, length is more than 1

  const strArr = zenParticipants.map((prt) => {
    if (ptcProp === "AddressAndName") {
      const str = combineAddressAndName(prt["address"], prt["name"]);
      return str;
    }
    const str = prt[ptcProp];
    return str;
  });

  return JSON.stringify(strArr);
};
