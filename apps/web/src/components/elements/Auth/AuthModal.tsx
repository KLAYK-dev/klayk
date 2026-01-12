// components/AuthModal.tsx
"use client";
import { Button } from "@klayk/ui/components/ui/button";
import { Input } from "@klayk/ui/components/ui/input";
import { Label } from "@klayk/ui/components/ui/label";
import { Separator } from "@klayk/ui/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@klayk/ui/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, Loader2, Mail, Phone, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useId, useState } from "react";

type AuthView = "signin" | "signup" | "phone" | "otp" | "reset-password" | "reset-password-sent";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: AuthView;
  onLogin?: () => void;
}

export default function AuthModal({
  isOpen = false,
  onClose,
  defaultView = "phone",
  onLogin,
}: AuthModalProps) {
  // Защита от undefined
  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  // Сброс состояния при закрытии модального окна
  useEffect(() => {
    if (!isOpen) {
      setView(defaultView);
      setPreviousView(null);
      setPhoneNumber("");
      setEmail("");
      setPassword("");
      setOtp(["", "", "", "", "", ""]);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, defaultView]);

  const [view, setView] = useState<AuthView>(defaultView);
  const [previousView, setPreviousView] = useState<AuthView | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const phoneId = useId();
  const emailId = useId();
  const passwordId = useId();
  const resetEmailId = useId();

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const navigateTo = (newView: AuthView) => {
    setPreviousView(view);
    setView(newView);
    setError(null);
  };

  const goBack = () => {
    if (previousView) {
      setView(previousView);
      setPreviousView(null);
      setError(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        handleSuccessLogin();
      }
    } catch (_err) {
      setError("Сталася неочікувана помилка");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn(provider, { redirect: false });
      handleSuccessLogin();
    } catch (_err) {
      setError("Не вдалося увійти через соціальну мережу");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessLogin = () => {
    if (typeof onLogin === "function") {
      onLogin();
    }
    handleClose();
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, damping: 25, stiffness: 500 },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  } as const;

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl text-center"
              style={{ background: "#fff" }}
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={handleClose}
                  className="absolute right-0 top-0 rounded-full p-1 text-black hover:bg-gray-100 hover:text-black"
                  aria-label="Закрити"
                >
                  <X className="h-5 w-5" />
                </button>

                {previousView && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="absolute left-0 top-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Назад"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}

                <div className="mb-6 mt-4 text-center">
                  <div className="flex items-center justify-center">
                    {view === "otp" ? (
                      <Check className="h-10 w-10 bg-[#FF8000] text-white rounded-full p-2" />
                    ) : view === "phone" ? (
                      <Phone className="h-10 w-10 bg-[#FF8000] text-white rounded-full p-2" />
                    ) : view.includes("reset-password") ? (
                      <Mail className="h-10 w-10 bg-[#FF8000] text-white rounded-full p-2" />
                    ) : null}
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-gray-900">
                    {view === "signin" && "Ласкаво просимо"}
                    {view === "signup" && "Створити обліковий запис"}
                    {view === "phone" && "Перевірка телефону"}
                    {view === "otp" && "Введіть код підтвердження"}
                    {view === "reset-password" && "Скидання паролю"}
                    {view === "reset-password-sent" && "Перевірте вашу пошту"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {view === "signin" && "Увійдіть до вашого облікового запису"}
                    {view === "signup" && "Приєднуйтесь до нашої платформи"}
                    {view === "phone" && "Ми надішлемо код для перевірки вашого телефону"}
                    {view === "otp" && `Код надіслано на ${phoneNumber}`}
                    {view === "reset-password" &&
                      "Введіть вашу електронну пошту для скидання паролю"}
                    {view === "reset-password-sent" &&
                      "Ми надіслали посилання для скидання на вашу пошту"}
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
                )}

                {(view === "signin" || view === "signup") && (
                  <Tabs defaultValue="phone" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="phone">Телефон</TabsTrigger>
                      <TabsTrigger value="email">Електронна пошта</TabsTrigger>
                    </TabsList>
                    <TabsContent value="phone" className="space-y-4">
                      <form onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-2">
                          <Label htmlFor={phoneId}>Номер телефону</Label>
                          <div className="flex">
                            <div className="flex items-center justify-center rounded-l-md border border-black border-r-0 bg-gray-50 px-3 text-sm">
                              +380
                            </div>
                            <Input
                              id={phoneId}
                              type="tel"
                              className="rounded-l-none border-black focus:border-[#FF8000] focus:ring-[#FF8000]"
                              placeholder="97 123 4567"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          className="w-full mt-4 bg-[#FF8000] text-white rounded-md py-2 px-4 font-semibold transition-colors duration-200 border-none hover:bg-[#e86c00]"
                          disabled={isLoading}
                          onClick={() => navigateTo("otp")}
                        >
                          Надіслати код підтвердження
                        </button>
                      </form>
                      <div className="mt-4 text-center text-sm text-gray-500">
                        <button
                          type="button"
                          className="font-medium text-gray-500 hover:underline p-0 bg-transparent"
                          onClick={() => setView("signin")}
                        >
                          <span className="text-[#000000FF]">Увійти через email</span>
                        </button>
                      </div>
                    </TabsContent>
                    <TabsContent value="email" className="space-y-4">
                      <form onSubmit={view === "signin" ? handleEmailSignIn : handleEmailSignIn}>
                        <div className="space-y-2">
                          <Label htmlFor={emailId}>Email</Label>
                          <Input
                            id={emailId}
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="border-black focus:border-[#FF8000] focus:ring-[#FF8000]"
                          />
                        </div>
                        <div className="space-y-2 mt-4">
                          <Label htmlFor={passwordId}>Пароль</Label>
                          <Input
                            id={passwordId}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="border-black focus:border-[#FF8000] focus:ring-[#FF8000]"
                          />
                        </div>
                        {view === "signin" && (
                          <div className="mt-2 text-right text-gray-500">
                            <button
                              type="button"
                              className="text-sm text-gray-500 hover:underline font-semibold"
                              onClick={() => navigateTo("reset-password")}
                            >
                              <span className="text-[#030303FF]">Забули пароль?</span>
                            </button>
                          </div>
                        )}
                        <button
                          type="submit"
                          className="w-full mt-4 bg-[#FF8000] text-white rounded-md py-2 px-4 font-semibold transition-colors duration-200 border-none hover:bg-[#e86c00] disabled:opacity-60"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {view === "signin" ? "Вхід..." : "Реєстрація..."}
                            </>
                          ) : view === "signin" ? (
                            "Увійти"
                          ) : (
                            "Зареєструватися"
                          )}
                        </button>
                      </form>
                    </TabsContent>
                  </Tabs>
                )}

                {view === "phone" && (
                  <div className="space-y-4">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <div className="space-y-2">
                        <Label htmlFor={phoneId}>Номер телефону</Label>
                        <div className="flex">
                          <div className="flex items-center justify-center rounded-l-md border border-black border-r-0 bg-gray-50 px-3 text-sm">
                            +380
                          </div>
                          <Input
                            id={phoneId}
                            type="tel"
                            className="rounded-l-none border-black focus:border-[#FF8000] focus:ring-[#FF8000]"
                            placeholder="97 123 4567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        className="w-full mt-4"
                        disabled={isLoading}
                        onClick={() => navigateTo("otp")}
                      >
                        Надіслати код підтвердження
                      </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                      <button
                        type="button"
                        className="font-medium text-[#FF7B00FF] hover:underline"
                        onClick={() => setView("signin")}
                      >
                        Увійти через email
                      </button>
                    </div>
                  </div>
                )}

                {view === "otp" && (
                  <div className="space-y-4">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <div className="space-y-2">
                        <Label htmlFor="otp-0">Код підтвердження</Label>
                        <div className="flex justify-between gap-2">
                          {otp.map((digit, index) => (
                            <Input
                              key={`otp-${index}`}
                              id={`otp-${index}`}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={1}
                              className="h-12 w-12 text-center text-lg border-green-500 focus:border-green-600 focus:ring-green-600"
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(index, e)}
                              required
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-center text-xs text-gray-500">
                          Не отримали код?{" "}
                          <button
                            type="button"
                            className="text-[#FF8000] hover:underline font-semibold"
                            disabled={isLoading}
                          >
                            Надіслати повторно
                          </button>
                        </p>
                      </div>
                      <Button
                        type="button"
                        className="w-full mt-4"
                        disabled={isLoading || otp.some((d) => !d)}
                        onClick={() => {
                          setIsLoading(true);
                          setTimeout(() => {
                            setIsLoading(false);
                            onClose();
                            router.refresh();
                          }, 1500);
                        }}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Перевірка...
                          </>
                        ) : (
                          "Підтвердити"
                        )}
                      </Button>
                    </form>
                  </div>
                )}

                {view === "reset-password" && (
                  <div className="space-y-4">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <div className="space-y-2">
                        <Label htmlFor={resetEmailId}>Електронна пошта</Label>
                        <Input
                          id={resetEmailId}
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="border-green-500 focus:border-green-600 focus:ring-green-600"
                        />
                      </div>
                      <Button
                        type="button"
                        className="w-full mt-4"
                        disabled={isLoading}
                        onClick={() => navigateTo("reset-password-sent")}
                      >
                        Надіслати посилання для скидання
                      </Button>
                    </form>
                  </div>
                )}

                {view === "reset-password-sent" && (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                      <p>
                        Ми надіслали посилання для скидання паролю на <strong>{email}</strong>. Будь
                        ласка, перевірте вашу скриньку та папку спам.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => navigateTo("signin")}
                    >
                      Повернутися до входу
                    </Button>
                  </div>
                )}

                {(view === "signin" || view === "signup") && (
                  <>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-2 text-xs text-gray-600">
                          Або продовжити з
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11"
                        onClick={() => handleSocialSignIn("google")}
                        disabled={isLoading}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                        >
                          <title>Google</title>
                          <path
                            d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                            fill="#EA4335"
                          />
                          <path
                            d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                            fill="#4285F4"
                          />
                          <path
                            d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                            fill="#34A853"
                          />
                        </svg>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11"
                        onClick={() => handleSocialSignIn("facebook")}
                        disabled={isLoading}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                        >
                          <title>Facebook</title>
                          <path
                            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                            fill="#1877F2"
                          />
                        </svg>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11"
                        onClick={() => handleSocialSignIn("apple")}
                        disabled={isLoading}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                        >
                          <title>Apple</title>
                          <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
                        </svg>
                      </Button>
                    </div>
                  </>
                )}
                {(view === "signin" || view === "signup") && (
                  <p className="mt-4 text-xs text-center text-gray-600">
                    Всі дані будуть зашифровані. Продовжуючи, ви погоджуєтеся з нашими{" "}
                    <button
                      type="button"
                      className="text-[#FF8000] hover:underline font-semibold bg-transparent p-0"
                    >
                      Умовами використання
                    </button>{" "}
                    і{" "}
                    <button
                      type="button"
                      className="text-[#FF8000] hover:underline font-semibold bg-transparent p-0"
                    >
                      Політикою Конфіденційності
                    </button>
                    .
                  </p>
                )}

                {(view === "signin" || view === "signup") && (
                  <div className="mt-6 text-center text-sm">
                    {view === "signin" ? (
                      <>
                        Немає облікового запису?{" "}
                        <button
                          type="button"
                          className="font-medium text-[#FF8000] hover:underline"
                          onClick={() => navigateTo("signup")}
                        >
                          Зареєструватися
                        </button>
                      </>
                    ) : (
                      <>
                        Вже маєте обліковий запис?{" "}
                        <button
                          type="button"
                          className="w-auto bg-[#FF8000] text-white rounded-md py-2 px-4 font-semibold transition-colors duration-200 border-none hover:bg-[#e86c00]"
                          onClick={() => navigateTo("signin")}
                        >
                          Увійти
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
