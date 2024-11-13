import {
  // AttachmentStream,
  // MessageText,
  // MailParser,
  simpleParser,
} from "mailparser";
import { processParsedMail } from "./mailHeadersUtils";
import { step } from "../gloAccu";

const print000SuccessCount = () => {
  // just for CLI visualization:
  const curr = step.succeededV;
  const asStr = String(curr);
  const le = asStr.length;

  if (asStr.slice(le - 3) === "000") {
    console.log(curr);
  }
};

export const parseOneMail = async (rawMail: Buffer) => {
  const parsedMail = await simpleParser(rawMail, {});
  return parsedMail;

  /*
   simpleParser(rawMail, {}).then((parsed) => {
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
  //
  //

  // low level class, but problematic with reading file-sizes of attachments

  /*
    const mailparser = new MailParser({
      // streamAttachments: true
    });
    mailparser.on("headers", scanHeaders);
    // mailparser.on("data", (data: AttachmentStream | MessageText) => {
    //   if (data.type === "attachment") {
    //     const attData = data as AttachmentStream;
    //     console.log(
    //       "data.filename:",
    //       attData.filename,
    //       "attData.size:",
    //       attData.size,
    //       attData.headers,
    //     );
    //     // attData.content.pipe(process.stdout);
    //     attData.content.on("end", () => attData.release());
    //   }
    // });
    mailparser.write(rawMail);
    mailparser.end(() => {
      console.log("mail ===========================");
    });
    */
};

export const processOneMail = async (rawMail: Buffer) => {
  const parsedMail = await parseOneMail(rawMail);

  // const allZ = parsedMail.headers.get('x-gmail-labels');

  processParsedMail(parsedMail);

  // const attArr = parsedMail.attachments;
  // if (attArr.length !== 0) {
  //   console.log(
  //     "attArr.len--",
  //     attArr.length,
  //     attArr[0]?.size,
  //     attArr[0]?.filename,
  //   );
  // }

  //
  //
  //

  step.succeededV += 1; // count of mails which are processed successfully
  print000SuccessCount();
};
