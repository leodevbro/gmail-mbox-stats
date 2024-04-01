/*

gmail-mbox-stats v1.0.8
Created by leodevbro (Levan Katsadze)
* linkedin.com/in/leodevbro
* github.com/leodevbro
* facebook.com/leodevbro

If you feel like donating
* buymeacoffee.com/leodevbro
* ko-fi.com/leodevbro

*/

// ===
// ===
// ===

/*

https://support.google.com/mail/answer/7190
In Gmail, find mail (message) by id
just type like this:
rfc822msgid:CAA_p-vyCSYhMN=mGZBd7GibPgaBxNX7ayh4sheQgPYqCS97P3A@mail.gmail.com
the id is after the ":" (colon).

*/

//
//
//

// TODO: listFile parter to be 500K lines. // TODO

import nodeMbox from "node-mbox";
import { stringify as stringify2dArrIntoCsv } from "csv-stringify/sync";

import { createReadStream, writeFileSync } from "node:fs";

import {
  MailParser,
  Headers as TyMailparserHeaders,
  // simpleParser,
} from "mailparser";

// import { parse as parseCsvInto2dArr } from "csv-parse";

import {
  getEnvItemValue,
  getSlimDateTime,
  waitSomeSeconds,
} from "./utils/mainUtils";
import {
  prepareOutputFolderStructure,
  writeStatsIntoFiles,
} from "./utils/stepUtils";
import {
  TyMainInfoForMail,
  TyMboxMailHeaders,
  TyZenMainInfoForMail,
} from "./types/mailparserTypes";
import {
  addOneMailInfoToStats,
  isMaybeCorrectNotationOfAddress,
} from "./utils/statsBuilder";
import {
  // combineTwoFamiliesIntoZenArr,
  getZenParticipantsFromFamily,
} from "./utils/sweetUtils";
import { slimStartDateTime, str } from "./constants";
import { groundFolder } from "./utils/groundFolderMaker";
// import { handleOneLineOfMailboxIndex } from "./utils/mailboxIndexMaker";

const startDateTimeStr = `Start datetime: ${slimStartDateTime.v}`;

console.time("Full Execution Time");

export const logExecutionStartMessage = () => {
  console.log("\n");

  console.log(str.authoringText + "\n\n");

  console.log("Started MBOX file analyzation");
  // console.log("Relax a bit, here you can see the progress:\n");

  console.log(startDateTimeStr);
};

const logExecutionEndMessage = () => {
  console.log("\n");
  console.log(startDateTimeStr);
  console.log(`->End datetime: ${getSlimDateTime(new Date())}\n`);
  console.timeEnd("Full Execution Time");
  console.log("\n");
  console.log(str.authoringText + "\n");
  console.log(str.donationText);
  console.log("\n");
  console.log("\n");
};

const argNameForMyEmailAddress = "mymail"; // main input !!!
const argNameForMboxFilePath = "mboxpath"; // main input !!!

// export const myEmail = "leodevbro@gmail.com";

const myEmailRaw: string = getEnvItemValue(argNameForMyEmailAddress) as string;
if (
  !myEmailRaw ||
  typeof myEmailRaw !== "string" ||
  !isMaybeCorrectNotationOfAddress(myEmailRaw)
) {
  throw new Error(`mymail notation is not valid --- ${myEmailRaw}`);
}

export const myEmail = myEmailRaw.toLowerCase();

const mboxFilePath = getEnvItemValue(argNameForMboxFilePath);

if (!mboxFilePath || typeof mboxFilePath !== "string") {
  throw new Error("mboxpath notation is not valid");
}

prepareOutputFolderStructure(mboxFilePath);

const mailbox = createReadStream(mboxFilePath);
const mbox = nodeMbox.MboxStream(mailbox, {
  /* options */
});

export const step: {
  v: number;
  countOfFullCountCheckForTimer: number;
  //
  countOfMessagesWithSenderCategory: {
    me: number;
    notMe: number;
    empty: number;
    hidden: number;
  };
} = {
  v: 0,
  countOfFullCountCheckForTimer: 0,
  //
  countOfMessagesWithSenderCategory: {
    me: 0,
    notMe: 0,
    empty: 0,
    hidden: 0,
  },
};

const checkFullCount = async (currCandidateCount: number): Promise<number> => {
  step.countOfFullCountCheckForTimer += 1;
  await waitSomeSeconds(5);

  if (currCandidateCount === step.v) {
    console.log("Full count:", step.v);
    return step.v;
  } else {
    if (step.countOfFullCountCheckForTimer >= 5) {
      console.log(
        `Something's wrong --- could not determine full count of messages, current count is: ${step.v}`,
      );
      return step.v;
    }
    return await checkFullCount(step.v);
  }
};

const analyzeMbox = () => {
  const scanHeaders = (headersMap: TyMailparserHeaders): void => {
    step.v += 1;
    const headers = headersMap as TyMboxMailHeaders;

    try {
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
      if ([7, 14, 18].includes(step.v)) {
        init_From?.value?.forEach((val, index) => {
          // @ts-ignore
          val.address = `huhahuha${index}${step.v}`;
        });
      }

      if ([21, 25].includes(step.v)) {
        init_From = undefined;
      }

      if ([29, 30].includes(step.v)) {
        init_From?.value?.forEach((val) => {
          // @ts-ignore
          val.address = ``;
          val.name = ``;
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

      const zenMainInfoForThisMail: TyZenMainInfoForMail = {
        from: getZenParticipantsFromFamily({
          family: initialMainInfoForThisMail.from,
          step: step.v,
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
          step: step.v,
          familyKind: "to",
          messageId: initialMainInfoForThisMail["message-id"],
          fromCombiner: false,
        }),
        cc: getZenParticipantsFromFamily({
          family: initialMainInfoForThisMail.cc,
          step: step.v,
          familyKind: "cc",
          messageId: initialMainInfoForThisMail["message-id"],
          fromCombiner: false,
        }),
        bcc: getZenParticipantsFromFamily({
          family: initialMainInfoForThisMail.bcc,
          step: step.v,
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
      addOneMailInfoToStats(zenMainInfoForThisMail, step.v);

      // counter.v += 1;
    } catch (err) {
      console.log(err);
    }

    // just for CLI visualization:
    const asStr = String(step.v);
    const le = asStr.length;
    if (asStr.slice(le - 3) === "000") {
      console.log(step.v);
    }
  };

  mbox.on("data", function (msg) {
    // parse message using MailParser

    // TODO: maybe for future
    /*
    simpleParser(msg, {
      //
    }).then((parsed) => {
      const attt = parsed.attachments;
      const fullSize = attt.reduce<number>((accu, item) => {
        return accu + item.size;
      }, 0);
      if (fullSize === 0) {
        return;
      }
      console.log(
        "sttt:",
        step.v,
        "size:",
        fullSize,
        "id",
        parsed.headers.get("message-id"),
      );
    });
    */

    const mailparser = new MailParser({
      // streamAttachments: true
    });
    mailparser.on("headers", scanHeaders);
    mailparser.write(msg);
    mailparser.end();
  });

  mbox.on("error", function (err) {
    console.log("got an error", err);
  });

  mbox.on("finish", async function () {
    console.log(
      `Probably finished reading mbox file. Current count: ${step.v}. Please wait.`,
    );

    await checkFullCount(step.v);

    console.log("Please wait several seconds more to generate stats files.");

    await waitSomeSeconds(3);

    writeStatsIntoFiles(); // this does not include generalStats,
    //                        because generalStats needs writeStatsIntoFiles function to execute first to calculate general stats.
    //                        So, The generalStats will be handled down below.

    console.log("\n");
    //
    const line_fullCount = `Full count of messages: ${step.v}`;
    console.log("Success.");
    console.log(line_fullCount);
    //
    const line_fullCountAsMe = `Messages where sender is me: ${step.countOfMessagesWithSenderCategory.me}`;
    console.log(line_fullCountAsMe);
    //
    const line_countAsLegitNotMe = `Messages where sender is not me: ${step.countOfMessagesWithSenderCategory.notMe}`;
    console.log(line_countAsLegitNotMe);

    const line_countAsHidden = `Messages where sender is hidden: ${step.countOfMessagesWithSenderCategory.hidden}`;
    console.log(line_countAsHidden);

    const line_countAsEmpty = `Messages where sender is empty: ${step.countOfMessagesWithSenderCategory.empty}`;
    console.log(line_countAsEmpty);

    console.log(
      `\nCreated new folder "${groundFolder.innerFolders.mboxStats.folderName}"`,
    );

    const generalStats2dArrNotation: (string | number)[][] = [
      [
        "MBOX file name:",
        (() => {
          const nameWithFormat = mboxFilePath.split(/[/\\]/).at(-1);
          if (!nameWithFormat) {
            return mboxFilePath;
          }

          return nameWithFormat;
        })(),
      ],
      ["My mail:", myEmail],
      ["Full count of messages:", step.v],
      [
        "Messages where sender is me:",
        step.countOfMessagesWithSenderCategory.me,
      ],
      [
        "Messages where sender is not me:",
        step.countOfMessagesWithSenderCategory.notMe,
      ],
      [
        "Messages where sender is empty:",
        step.countOfMessagesWithSenderCategory.empty,
      ],
      [
        "Messages where sender is hidden:",
        step.countOfMessagesWithSenderCategory.hidden,
      ],
    ];

    //
    // const mePlusNotMe =
    //   step.countOfMessagesWithSenderCategory.me +
    //   step.countOfMessagesWithSenderCategory.notMe;

    // if (mePlusNotMe !== step.v) {
    //   const line_countingError = `Strange - Some kind of error of counting --- "me" (${step.countOfMessagesWithSenderCategory.me}) + "notMe" (${step.countOfMessagesWithSenderCategory.notMe}) should be totalCount (${step.v}), but the sum is ${mePlusNotMe}`;
    //   console.log(line_countingError);
    //   // linesOfGeneralStats.push(line_countingError);
    //   generalStats2dArrNotation.push(["Error:", line_countingError]);
    // }

    type TyUniAndFull = [
      unique: number,
      fullLegit: number,
      hidden: number,
      empty: number,
      messagesWhereFound: number,
    ];

    type TyInpStats = {
      senderAddresses: TyUniAndFull;
      senderDomains: TyUniAndFull;
      senderPlusNames: TyUniAndFull;
      receiverAddresses: TyUniAndFull;
      ccAddresses: TyUniAndFull;
      BccAddresses: TyUniAndFull;
    };

    const generateSideStatsForOneCategory = (
      category: "me" | "not me",
      stats: TyInpStats,
    ) => {
      const arr = [
        ["", ""],
        [`For messages where sender is ${category}`],
        [
          "Description",

          // like TyUniAndFull
          "Unique count",
          "Legit Count",
          "Hidden",
          "Empty",
          "Messages Where Found",
        ],
        //
        ["Sender addresses", ...stats.senderAddresses],
        ["Sender domains", ...stats.senderDomains],
        ["SenderPlusNames", ...stats.senderPlusNames],
        ["Receiver addresses", ...stats.receiverAddresses],
        ["CC addresses", ...stats.ccAddresses],
        ["BCC addresses", ...stats.BccAddresses],
        //
        ["", ""],
      ];

      return arr;
    };

    const folder_me =
      groundFolder.innerFolders.mboxStats.innerFolders.forMailsWhereSenderIsMe
        .innerFiles;

    const folder_notMeOrUnknown =
      groundFolder.innerFolders.mboxStats.innerFolders
        .forMailsWhereSenderIsNotMeOrIsUnknown.innerFiles;

    const fol = {
      me: folder_me,
      notMeOrUnknown: folder_notMeOrUnknown,
    };

    const generateStatsObj = (meOrNotMe: keyof typeof fol): TyInpStats => {
      const currFolder = fol[meOrNotMe];

      const sculptOneFileStat = (fileKey: keyof typeof currFolder) => {
        const arr: TyUniAndFull = [
          currFolder[fileKey].freqMap.size,
          currFolder[fileKey].legitCount,
          currFolder[fileKey].hiddenCount,
          currFolder[fileKey].emptyCount,
          currFolder[fileKey].messagesWhereRelevantValuesFound,
        ];
        return arr;
      };

      const obj: TyInpStats = {
        senderAddresses: sculptOneFileStat("frequencySenderAddress"),
        senderDomains: sculptOneFileStat("frequencySenderDomain"),
        senderPlusNames: sculptOneFileStat("frequencySenderAddressAndName"),
        receiverAddresses: sculptOneFileStat("frequencyReceiverAddress"),
        ccAddresses: sculptOneFileStat("frequencyCcAddress"),
        BccAddresses: sculptOneFileStat("frequencyBccAddress"),
      };

      return obj;
    };

    generalStats2dArrNotation.push(
      ...[
        ["", ""],
        [`Let's count unique addresses and more`],

        ["Participant --> Sender/Receiver/CC/BCC"],
        [
          "Hidden address --> Participant exists but address value is other kind of text instead of email address",
        ],
        ["Empty address --> Participant exists but address value is empty"],
        [
          "- - - - - - - - - - - - - Also another case: Participant does not exist at all (only for Sender/Receiver, not for CC/BCC)",
        ],
      ],
      ...generateSideStatsForOneCategory("me", generateStatsObj("me")),
      ...generateSideStatsForOneCategory(
        "not me",
        generateStatsObj("notMeOrUnknown"),
      ),
    );

    const generalStatsPath =
      groundFolder.innerFolders.mboxStats.innerFiles.generalStats.pathAbsOrRel;

    const finalDataStringOfGeneralStats = stringify2dArrIntoCsv(
      generalStats2dArrNotation,
      {
        header: false,
        columns: undefined,
      },
    );

    writeFileSync(generalStatsPath, finalDataStringOfGeneralStats, {
      flag: "a+",
    });

    logExecutionEndMessage();
  });
};

analyzeMbox();

/*

const myData = [
  ['"""""""""5"`jj\t\t\t', 'k88k\t\t\t', `7\t\t\t`],
  ['"""5"`jj\t\t\t', 'k88\n\n\n\n\n\n\n\n\\45k\t\t\t', `52v"'\`\t\t\t`],
];

console.log('haaaa_start');
try {
  // const opts = {};
  // const parser = new Parser({
  //   header: false,
  // });
  // const csv = parser.parse(myData);

  const csv = stringify2dArrIntoCsv(myData, {
    header: false,
    columns: undefined,
  });

  // console.log(csv);
  wr_stream.write(csv);
  const countOfNls = csv.split('').reduce((accu, curr) => {
    if (curr === '\n') {
      return accu + 1;
    }
    return accu;
  }, 0);
  console.log(countOfNls);

  setTimeout(() => {
    // Using the first line of the CSV data to discover the column names
    const rs = createReadStream(mainOutputFilename);
    const parser = parseCsvInto2dArr({ columns: false }, function (err, data) {
      console.log(data);
      
    });
    rs.pipe(parser);
  }, 3);
} catch (err) {
  console.error(err);
}
console.log('haaaa_end', process.argv, process.env.npm_config_aaabbbrt); // npm run go --aaabbbrt="sdfs"

*/
