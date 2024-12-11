import Sort from "@/components/sort";
import { getFiles } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import FileCard from "@/components/file-card";
import { convertFileSize, getFileTypesParams } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/user.actions";

const Page = async ({ params, searchParams }: SearchParamProps) => {
  const type = ((await params)?.type as string) || "";
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";

  const types = getFileTypesParams(type) as FileType[];
  const files = await getFiles({ types, searchText, sort });
  const user = await getCurrentUser();
  const isAdmin = user ? user.isAdmin : false;
  const totalSize = files
    ? files.documents.reduce(
        (acc: number, file: Models.Document) => acc + file.size,
        0,
      )
    : 0;
  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>
        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">{convertFileSize(totalSize)}</span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden text-light-200 sm:block">Sort by:</p>
            <Sort />
          </div>
        </div>
      </section>

      {files.total > 0 ? (
        <section className="file-list">
          {files.documents.map((file: Models.Document, index: number) => (
            <FileCard key={index} file={file} isAdmin={isAdmin} />
          ))}
        </section>
      ) : (
        <p className="empty-list">No files uploaded</p>
      )}
    </div>
  );
};

export default Page;
