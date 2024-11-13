export type TyNumForEachSenderCategory = {
  me: number;
  notMe: number;
  empty: number;
  hidden: number;
};

const generateInitialNumsForEachSenderCateg =
  (): TyNumForEachSenderCategory => {
    const obj: TyNumForEachSenderCategory = {
      me: 0,
      notMe: 0,
      empty: 0,
      hidden: 0,
    };

    return obj;
  };

type TyStep = {
  v: number; // This is count of all mails, not only succesfuly proccessed mails.
  succeededV: number; // count of mails which are processed successfully
  //
  countOfFullCountCheckForTimer: number;
  //
  countOfMessagesWithSenderCategory: TyNumForEachSenderCategory; // count

  //
  //

  totalSizeOfAttachmentsWithSenderCategory: TyNumForEachSenderCategory; // total bytes
  totalCountOfAttachmentsWithSenderCategory: TyNumForEachSenderCategory; // total count
  countOfMailsWithAtLeastOneAttachmentWithSenderCategory: TyNumForEachSenderCategory; // total bytes
};

export const step: TyStep = {
  v: 0,
  succeededV: 0,
  //
  countOfFullCountCheckForTimer: 0,
  //
  countOfMessagesWithSenderCategory: generateInitialNumsForEachSenderCateg(),
  //
  //
  totalSizeOfAttachmentsWithSenderCategory:
    generateInitialNumsForEachSenderCateg(),

  totalCountOfAttachmentsWithSenderCategory:
    generateInitialNumsForEachSenderCateg(),

  countOfMailsWithAtLeastOneAttachmentWithSenderCategory:
    generateInitialNumsForEachSenderCateg(),
};
