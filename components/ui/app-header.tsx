import Image from "next/image";
import { signOut } from "@/auth";
import { Logo } from "@/components/ui/logo";

interface AppHeaderProps {
  user?: {
    name?: string | null;
    image?: string | null;
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Logo />
        <div className="flex items-center gap-4">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              Sign out
            </button>
          </form>
          <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-border bg-bg-soft">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "You"}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : null}
          </span>
        </div>
      </div>
    </header>
  );
}
