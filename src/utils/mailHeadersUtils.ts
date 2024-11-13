import { ParsedMail, Headers as TyMailparserHeaders } from "mailparser";
import { step } from "../gloAccu";
import {
  TyMainInfoForMail,
  TyMboxMailHeaders,
  TyZenMainInfoForMail,
} from "../types/mailparserTypes";
import { getZenParticipantsFromFamily } from "./sweetUtils";
import { addOneMailInfoToStats } from "./statsBuilder";

export const scanHeaders = (
  headersMap: TyMailparserHeaders,
): TyMainInfoForMail => {
  const headers = headersMap as TyMboxMailHeaders;

  const init_From = headers.get("from");
  const init_To = headers.get("to");
  // const init_deliveredTo = headers.get("delivered-to");
  const init_cc = headers.get("cc");
  const init_bcc = headers.get("bcc");
  //
  const init_date = headers.get("date");
  const init_messageId = headers.get("message-id");

  // for testing:
  /*
    if ([7, 14].includes(step.v)) {
      init_From?.value?.forEach((val, index) => {
        // @ts-ignore
        val.address = `hidden${index}${step.v}`;
      });
    }

    if ([21].includes(step.v)) {
      init_From = undefined;
    }

    if ([29, 30].includes(step.v)) {
      init_From?.value?.forEach((val) => {
        // @ts-ignore
        val.address = ``;
        // val.name = ``;
      });
    }
    */

  // if (
  //   init_messageId ===
  //   "<CAA_p-vxkKrYGM+QcZMbjvTkxQ6biC+6zdH4Mcp+bmAYzBXaxfQ@mail.gmail.com>"
  // ) {
  //   console.log("baaa", JSON.stringify([...headers]));
  // }

  const initialMainInfoForThisMail: TyMainInfoForMail = {
    from: init_From,
    to: init_To,
    // "delivered-to": init_deliveredTo,
    cc: init_cc,
    bcc: init_bcc,
    //
    date: init_date,
    ["message-id"]: init_messageId,
  };

  return initialMainInfoForThisMail;

  // if (step.v === 23) {
  //   const rrr = initialMainInfoForThisMail.to?.value;
  //   if (rrr) {
  //     rrr.forEach((x) => {
  //       x.address = undefined;
  //     });
  //   }

  //   const rrr2 = initialMainInfoForThisMail["delivered-to"]?.value;
  //   if (rrr2) {
  //     rrr2.forEach((x) => {
  //       x.address = undefined;
  //     });
  //   }
  //   console.log(initialMainInfoForThisMail["message-id"]);
  // }
};

export const processParsedMail = (theParsedMail: ParsedMail) => {
  const initialMainInfoForThisMail = scanHeaders(theParsedMail.headers);

  // bytes
  const sumOfSizesOfAttachmentsOfOneMail = theParsedMail.attachments.reduce(
    (accu, curr) => accu + curr.size,
    0,
  );

  const countOfAttachmentsInThisMail = theParsedMail.attachments.length;

  const zenMainInfoForThisMail: TyZenMainInfoForMail = {
    from: getZenParticipantsFromFamily({
      family: initialMainInfoForThisMail.from,
      step: step.succeededV,
      familyKind: "from",
      messageId: initialMainInfoForThisMail["message-id"],
      fromCombiner: false,
    }),
    // zenTo: combineTwoFamiliesIntoZenArr({
    //   step: step.v,
    //   messageId: initialMainInfoForThisMail["message-id"],
    //   twoFamilies: [
    //     {
    //       familyKind: "to",
    //       participationInfo: initialMainInfoForThisMail.to,
    //     },
    //     {
    //       familyKind: "delivered-to",
    //       participationInfo: initialMainInfoForThisMail["delivered-to"],
    //     },
    //   ],
    // }),
    zenTo: getZenParticipantsFromFamily({
      family: initialMainInfoForThisMail.to,
      step: step.succeededV,
      familyKind: "to",
      messageId: initialMainInfoForThisMail["message-id"],
      fromCombiner: false,
    }),
    cc: getZenParticipantsFromFamily({
      family: initialMainInfoForThisMail.cc,
      step: step.succeededV,
      familyKind: "cc",
      messageId: initialMainInfoForThisMail["message-id"],
      fromCombiner: false,
    }),
    bcc: getZenParticipantsFromFamily({
      family: initialMainInfoForThisMail.bcc,
      step: step.succeededV,
      familyKind: "bcc",
      messageId: initialMainInfoForThisMail["message-id"],
      fromCombiner: false,
    }),
    //
    date: initialMainInfoForThisMail.date,
    "message-id": initialMainInfoForThisMail["message-id"],
  };

  // TODO: maybe for future
  /*
  handleOneLineOfMailboxIndex({
    stepV: step.v,
    zenMainInfoForThisMail,
  });
  */
  //

  // maybe more logical for "addOneMailInfoToStats" to be here:
  addOneMailInfoToStats({
    oneMail: zenMainInfoForThisMail,
    stepN: step.succeededV,
    //
    sumOfSizesOfAttachmentsOfOneMail,
    countOfAttachmentsInThisMail,
  });
};
