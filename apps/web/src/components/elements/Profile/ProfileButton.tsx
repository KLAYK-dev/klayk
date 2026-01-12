// components/ProfileButton.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import AuthModal from "@/components/elements/Auth/AuthModal";
import { Avatar, AvatarFallback, AvatarImage } from "@klayk/ui/components/ui/avatar";

interface ProfileButtonProps {}

export default function ProfileButton({}: ProfileButtonProps) {
  const { data: session, status } = useSession();
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const router = useRouter();

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      setModalOpen(false);
    }
  }, [status]);

  const handleProfileClick = useCallback(async () => {
    try {
      if (status === "authenticated") {
        await router.push("/profile");
      } else {
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Profile navigation error:", error);
      setModalOpen(true);
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center text-sm text-white/90 p-1">
        <Avatar className="h-8 w-8">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleProfileClick}
        className="flex flex-col items-center text-sm text-white/90 hover:text-green-300 p-1 rounded-md border border-transparent hover:border-green-300 transition-colors"
        aria-label="Профіль"
        title="Профіль"
      >
        <Avatar className="h-8 w-8">
          {status === "authenticated" ? (
            <>
              <AvatarImage src={session?.user?.image ?? "/4a03.jfif"} />
              <AvatarFallback>
                {session?.user?.name?.charAt(0) || "KLAYK"}
              </AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage src="/4a03.jfif" />
              <AvatarFallback>KLAYK</AvatarFallback>
            </>
          )}
        </Avatar>
      </button>

      {isModalOpen && (
        <AuthModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          defaultView="signin"
        />
      )}
    </>
  );
}
