"use server";

import { createAdminClient } from "@/lib/appwrite";
import {
  constructFileUrl,
  getFileType,
  handleError,
  parseStringify,
} from "@/lib/utils";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, database } = await createAdminClient();
  try {
    const inputFile = InputFile.fromBuffer(file, file.name);
    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile,
    );
    const { type, extension } = getFileType(file.name);
    const fileDocument = {
      type,
      extension,
      accountId,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    const newFile = await database
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument,
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Error creating file");
      });

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Error uploading file");
  }
};

const createQueries = (
  // currentUser: Models.Document,
  types: FileType[],
  searchText: string,
  sort: string,
  limit?: number,
) => {
  const queries = [
    // Query.or([
    //   Query.equal("owner", currentUser.$id),
    //   Query.contains("users", currentUser.email),
    // ]),
  ];
  if (types.length > 0) {
    queries.push(Query.equal("type", types));
  }
  if (searchText) {
    queries.push(Query.contains("name", searchText));
  }
  if (limit) {
    queries.push(Query.limit(limit));
  }
  const [sortBy, orderBy] = sort.split("-");
  queries.push(
    orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
  );
  return queries;
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  const { database } = await createAdminClient();

  try {
    // const currentUser = await getCurrentUser();
    // if (!currentUser) throw new Error("No user found");
    const queries = createQueries(types, searchText, sort, limit);

    const files = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries,
    );

    return parseStringify(files);
  } catch (error) {
    handleError(error, "Error getting files");
  }
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { database } = await createAdminClient();
  try {
    const newName = `${name}.${extension}`;
    const updatedFile = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { name: newName },
    );
    revalidatePath(path);

    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Error renaming file");
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { database } = await createAdminClient();
  try {
    const updatedFile = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { users: emails },
    );
    revalidatePath(path);

    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Error sharing file");
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { database, storage } = await createAdminClient();
  try {
    const deletedFile = await database.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );
    if (deletedFile) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }
    revalidatePath(path);

    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Error deleting file");
  }
};

export const getTotalSpaceUsed = async () => {
  const { database } = await createAdminClient();
  try {
    const files = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.select(["size", "type", "$createdAt"])],
    );
    return files
      ? files.documents.reduce(
          (acc, file) => {
            if (file.type === "image") {
              acc.image.size += file.size;
              if (
                acc.image.latestDate === "" ||
                file.$createdAt > acc.image.latestDate
              ) {
                acc.image.latestDate = file.$createdAt;
              }
            } else if (file.type === "document") {
              acc.document.size += file.size;
              if (
                acc.document.latestDate === "" ||
                file.$createdAt > acc.document.latestDate
              ) {
                acc.document.latestDate = file.$createdAt;
              }
            } else if (file.type === "video") {
              acc.video.size += file.size;
              if (
                acc.video.latestDate === "" ||
                file.$createdAt > acc.video.latestDate
              ) {
                acc.video.latestDate = file.$createdAt;
              }
            } else if (file.type === "audio") {
              acc.audio.size += file.size;
              if (
                acc.audio.latestDate === "" ||
                file.$createdAt > acc.audio.latestDate
              ) {
                acc.audio.latestDate = file.$createdAt;
              }
            } else {
              acc.other.size += file.size;
              if (
                acc.other.latestDate === "" ||
                file.$createdAt > acc.other.latestDate
              ) {
                acc.other.latestDate = file.$createdAt;
              }
            }
            acc.used += file.size;
            return acc;
          },
          {
            image: { size: 0, latestDate: "" },
            document: { size: 0, latestDate: "" },
            video: { size: 0, latestDate: "" },
            audio: { size: 0, latestDate: "" },
            other: { size: 0, latestDate: "" },
            used: 0,
            all: 2 * 1024 * 1024 * 1024, // 2GB available bucket storage
          },
        )
      : {
          image: { size: 0, latestDate: "" },
          document: { size: 0, latestDate: "" },
          video: { size: 0, latestDate: "" },
          audio: { size: 0, latestDate: "" },
          other: { size: 0, latestDate: "" },
          used: 0,
          all: 2 * 1024 * 1024 * 1024, // 2GB available bucket storage
        };
  } catch (error) {
    handleError(error, "Error getting total space used");
  }
};
