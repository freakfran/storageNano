"use client";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getFiles } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import Thumbnail from "@/components/thumbnail";
import FormattedDateTime from "@/components/formatted-date-time";
import { useDebounce } from "use-debounce";

const Search = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const [results, setResults] = useState<Models.Document[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
    }
  }, [searchQuery]);

  useEffect(() => {
    const fetchFiles = async () => {
      if (debouncedQuery.length === 0) {
        setResults([]);
        setIsOpen(false);
        return router.push(pathname.replace(searchParams.toString(), ""));
      }
      const files = await getFiles({
        types: [],
        searchText: debouncedQuery,
      });
      setResults(files.documents);
      setIsOpen(true);
    };
    fetchFiles().then();
  }, [debouncedQuery, pathname, router, searchParams]);

  const handleClickItem = (file: Models.Document) => {
    setIsOpen(false);
    setResults([]);
    router.push(
      `/${file.type === "video" || file.type === "audio" ? "media" : file.type + "s"}?query=${query}`,
    );
  };

  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image
          src="/assets/icons/search.svg"
          alt="search"
          width={24}
          height={24}
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="search-input"
        />
      </div>

      {isOpen && (
        <ul className="search-result">
          {results.length > 0 ? (
            results.map((file) => (
              <li
                className="flex items-center justify-between"
                key={file.$id}
                onClick={() => handleClickItem(file)}
              >
                <div className="flex cursor-pointer items-center gap-4">
                  <Thumbnail
                    type={file.type}
                    extension={file.extension}
                    url={file.url}
                    className="size-9 min-w-9"
                  />
                  <p className="subtitle-2 line-clamp-1 text-light-100">
                    {file.name}
                  </p>
                </div>
                <FormattedDateTime
                  date={file.$createdAt}
                  className="caption line-clamp-1 text-light-200"
                />
              </li>
            ))
          ) : (
            <p className="empty-result">No results found</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default Search;
