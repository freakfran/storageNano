import { Models } from "node-appwrite";
import Link from "next/link";
import Thumbnail from "@/components/thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "@/components/formatted-date-time";
import ActionsDropdown from "@/components/actions-dropdown";

interface FileCardProps {
  file: Models.Document;
  isAdmin: boolean;
}

const FileCard = ({ file, isAdmin }: FileCardProps) => {
  return (
    <Link href={file.url} target="_blank" className="file-card">
      <div className="flex justify-between">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          className="!size-20"
          imageClassName="!size-11"
        />
        <div className="flex flex-col items-end justify-between">
          <ActionsDropdown file={file} isAdmin={isAdmin} />
          <p className="body-1">{convertFileSize(file.size)}</p>
        </div>
      </div>

      <div className="file-card-details">
        <p className="subtitle-2 line-clamp-1">{file.name}</p>
        <FormattedDateTime
          date={file.$createdAt}
          className="body-2 text-light-100"
        />
        <p className="caption line-clamp-1 text-light-200">
          {file.owner.fullName}
        </p>
      </div>
    </Link>
  );
};

export default FileCard;
