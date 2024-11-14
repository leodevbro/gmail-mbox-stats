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

  totalSizeOfAttachmentsWithSenderCategory: TyNumForEachSenderCategory; // ===> MB ===> million bytes
  totalCountOfAttachmentsWithSenderCategory: TyNumForEachSenderCategory;
  countOfMailsWithAtLeastOneAttachmentWithSenderCategory: TyNumForEachSenderCategory;
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
