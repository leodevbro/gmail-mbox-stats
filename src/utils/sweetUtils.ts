import { str } from "../constants";
import {
  TyFamilyKind,
  TyGmailMailHeadersAsObj,
  TyParticipationFamilyInfo,
  // TyZenFamilyKind,
  TyZenParticipant,
} from "../types/mailparserTypes";
import {
  getSearchableIdForToBeEasyToCopy,
  isMaybeCorrectNotationOfAddress,
} from "./statsBuilder";

// type TyFamilyMeta = {
//   familyKind: TyFamilyKind;
//   participationInfo?: TyParticipationFamilyInfo;
// };

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

const emptyZenParticipant: TyZenParticipant = {
  address: str.EMPTY_ADDR,
  name: str.EMPTY_NAME,
} as const;

const sculptEmptyZenParticipant = (): TyZenParticipant => {
  const totallyNew = structuredClone(emptyZenParticipant);
  return totallyNew;
};

export const getZenParticipantsFromFamily = ({
  family,
  messageId,
  familyKind,
  step,
  fromCombiner,
}: {
  family?: TyParticipationFamilyInfo;
  familyKind: TyFamilyKind;
  step: number;
  messageId: TyGmailMailHeadersAsObj["message-id"];
  fromCombiner: boolean;
}): TyZenParticipant[] => {
  const majorKindsOfFamily: TyFamilyKind[] = ["from", "to"];

  const isMajorFamily = majorKindsOfFamily.includes(familyKind);

  if (!family) {
    if (!fromCombiner) {
      if (isMajorFamily) {
        console.log(
          `${step} - here: '${familyKind}' participant not found - ${getSearchableIdForToBeEasyToCopy(
            messageId,
          )} '!family'`,
        );
      }
    }

    return isMajorFamily ? [sculptEmptyZenParticipant()] : [];
  }

  if (!family.value) {
    if (!fromCombiner) {
      if (isMajorFamily) {
        console.log(
          `${step} - here: '${familyKind}' participant not found - ${getSearchableIdForToBeEasyToCopy(
            messageId,
          )} '!family.value'`,
        );
      }
    }
    return isMajorFamily ? [sculptEmptyZenParticipant()] : [];
  }

  if (family.value.length === 0) {
    if (!fromCombiner) {
      if (isMajorFamily) {
        console.log(
          `${step} - here: '${familyKind}' participant not found - ${getSearchableIdForToBeEasyToCopy(
            messageId,
          )} 'family.value.length === 0'`,
        );
      }
    }
    return isMajorFamily ? [sculptEmptyZenParticipant()] : [];
  }

  const zenArr: TyZenParticipant[] = family.value.map((ptc) => {
    const zenPtc: TyZenParticipant = {
      address: ptc.address
        ? isMaybeCorrectNotationOfAddress(ptc.address)
          ? ptc.address.toLowerCase()
          : `${str.STRANGE}${ptc.address}`
        : str.EMPTY_ADDR,
      name: ptc.name || str.EMPTY_NAME,
    };

    return zenPtc;
  });

  const uniqified = new Map<string, TyZenParticipant>(
    zenArr.map((p) => [p.address, p]),
  );

  const final = [...uniqified].map((duo) => {
    const prt = duo[1];

    if (!fromCombiner) {
      if (prt.address === str.EMPTY_ADDR) {
        console.log(
          `${step} - here: '${familyKind}' participant address is empty - ${getSearchableIdForToBeEasyToCopy(
            messageId,
          )} 'prt.address === str_EMPTY'`,
        );
      }

      if (prt.address.includes(str.STRANGE)) {
        console.log(
          `${step} - here: '${familyKind}' participant address is strange: "${prt.address.slice(
            str.STRANGE.length,
          )}" - ${getSearchableIdForToBeEasyToCopy(
            messageId,
          )} 'prt.address.includes(str_STRANGE)'`,
        );
      }
    }

    return prt;
  });

  return final;
};

/*
export const combineTwoFamiliesIntoZenArr = ({
  twoFamilies,
  step,
  messageId,
}: {
  twoFamilies: [TyFamilyMeta, TyFamilyMeta];
  step: number;
  messageId: TyGmailMailHeadersAsObj["message-id"];
}): TyZenParticipant[] => {
  const firstFamilyMeta = twoFamilies[0];
  const secondFamilyMeta = twoFamilies[1];

  if (
    !firstFamilyMeta.participationInfo &&
    !secondFamilyMeta.participationInfo
  ) {
    console.log(
      `${step} - here: participant not found - ${getSearchableIdForToBeEasyToCopy(
        messageId,
      )} --- both families are falsy`,
    );
    return [sculptEmptyZenParticipant()];
  }

  const zenOfFirst = getZenParticipantsFromFamily({
    familyKind: firstFamilyMeta.familyKind,
    step,
    family: firstFamilyMeta.participationInfo,
    messageId,
    fromCombiner: true,
  });

  const zenOfSecond = getZenParticipantsFromFamily({
    familyKind: secondFamilyMeta.familyKind,
    step,
    family: secondFamilyMeta.participationInfo,
    messageId,
    fromCombiner: true,
  });

  const uniqified = new Map<string, TyZenParticipant>(
    [...zenOfFirst, ...zenOfSecond].map((p) => [p.address, p]),
  );

  const final = [...uniqified]
    .map((duo) => duo[1])
    .filter((x) => x.address && !x.address.includes(str_EMPTY));

  if (final.length === 0) {
    const blameKind =
      zenOfFirst.length === 0
        ? firstFamilyMeta.familyKind
        : secondFamilyMeta.familyKind;

    console.log(
      `${step} - here: participant "${blameKind}" not found - ${getSearchableIdForToBeEasyToCopy(
        messageId,
      )} 'final.length === 0 --- combineTwoFamilies'`,
    );

    return [sculptEmptyZenParticipant()];
  }

  final.forEach((prt) => {
    if (!prt.address || prt.address === str_EMPTY) {
      console.log(
        `${step} - here: participant address is empty - ${getSearchableIdForToBeEasyToCopy(
          messageId,
        )} 'prt.address === str_EMPTY' --- 'combineTwoFamilies'`,
      );
    }

    if (prt.address.includes(str_STRANGE)) {
      console.log(
        `${step} - here: participant address is strange - ${getSearchableIdForToBeEasyToCopy(
          messageId,
        )} 'prt.address.includes(str_STRANGE)' --- 'combineTwoFamilies'`,
      );
    }
  });

  return final;
};
*/

export const combineAddressAndName = (address: string, name: string) => {
  return `${address} --- ${name}`;
};

/*
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
    console.log(
      `${step} - error!!! here: '${zenFamilyKind}' ${ptcProp} not found - ${getSearchableIdForToBeEasyToCopy(
        messageId,
      )}`,
    );

    return str.EMPTY_ADDR;
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
*/
