/*
import { TyZenMainInfoForMail } from "../types/mailparserTypes";
import { generateSearchableIdOfMail } from "./statsBuilder";
import { groundFolder } from "./stepUtils";
import { prepareZenParticipantArrAsMainListItemStr } from "./sweetUtils";
import { stringify as stringify2dArrIntoCsv } from "csv-stringify/sync";
import { writeFileSync } from "node:fs";

const allMailboxIndexFile =
  groundFolder.innerFolders.mboxStats.innerFiles.allMailList_csv;
*/

// maybe not needed, currently not used.
/*
export const handleOneLineOfMailboxIndex = ({
  zenMainInfoForThisMail,
  stepV,
}: {
  zenMainInfoForThisMail: TyZenMainInfoForMail;
  stepV: number;
}) => {
  const mainInfoForThisMail_asArr_forCsvLine = [
    // sender
    prepareZenParticipantArrAsMainListItemStr({
      messageId: zenMainInfoForThisMail["message-id"],
      ptcProp: "address",
      step: stepV,
      zenFamilyKind: "from",
      zenParticipants: zenMainInfoForThisMail.from,
    }),
    prepareZenParticipantArrAsMainListItemStr({
      messageId: zenMainInfoForThisMail["message-id"],
      ptcProp: "name",
      step: stepV,
      zenFamilyKind: "from",
      zenParticipants: zenMainInfoForThisMail.from,
    }),

    // receiver
    prepareZenParticipantArrAsMainListItemStr({
      messageId: zenMainInfoForThisMail["message-id"],
      ptcProp: "address",
      step: stepV,
      zenFamilyKind: "zenTo",
      zenParticipants: zenMainInfoForThisMail.zenTo,
    }),

    // cc
    prepareZenParticipantArrAsMainListItemStr({
      messageId: zenMainInfoForThisMail["message-id"],
      ptcProp: "address",
      step: stepV,
      zenFamilyKind: "cc",
      zenParticipants: zenMainInfoForThisMail.cc,
    }),

    // bcc
    prepareZenParticipantArrAsMainListItemStr({
      messageId: zenMainInfoForThisMail["message-id"],
      ptcProp: "address",
      step: stepV,
      zenFamilyKind: "bcc",
      zenParticipants: zenMainInfoForThisMail.bcc,
    }),

    //
    zenMainInfoForThisMail.date?.toISOString() || "",
    generateSearchableIdOfMail(zenMainInfoForThisMail["message-id"]),
  ];

  const csvCurrLineForAllMailListFile = stringify2dArrIntoCsv(
    [mainInfoForThisMail_asArr_forCsvLine],
    {
      header: false,
      columns: undefined,
    },
  );

  // TODO: maybe for future
  writeFileSync(
    allMailboxIndexFile.pathAbsOrRel,
    csvCurrLineForAllMailListFile,
    {
      flag: "a+",
    },
  );
};
*/

export const abc = {};
