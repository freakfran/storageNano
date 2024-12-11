import { Button } from "@/components/ui/button";
import Image from "next/image";
import Search from "@/components/search";
import FileUploader from "@/components/file-uploader";
import { signOutUser } from "@/lib/actions/user.actions";
import Link from "next/link";

const Header = ({
  userId,
  accountId,
  isLoggedIn,
}: {
  userId: string;
  accountId: string;
  isLoggedIn: boolean;
}) => {
  return (
    <header className="header">
      <Search />
      {isLoggedIn ? (
        <div className="header-wrapper">
          <FileUploader ownerId={userId!} accountId={accountId!} />
          <form
            action={async () => {
              "use server";
              await signOutUser();
            }}
          >
            <Button type="submit" className="sign-out-button">
              <Image
                src="/assets/icons/logout.svg"
                alt="sign out"
                width={24}
                height={24}
                className="w-6"
              />
            </Button>
          </form>
        </div>
      ) : (
        <div className="header-wrapper">
          <Link href="/sign-in" className="sign-in-button">
            <Button
              type="button"
              className="border-0 border-none bg-transparent text-brand shadow-none hover:bg-transparent"
            >
              <Image
                src="/assets/icons/login.svg"
                alt="sign in"
                width={24}
                height={24}
                className="w-6"
              />
              Sign In
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
