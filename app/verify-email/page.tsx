"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";

type FormData = {
  code0: string;
  code1: string;
  code2: string;
  code3: string;
  code4: string;
  code5: string;
};

const fieldNames = [
  "code0",
  "code1",
  "code2",
  "code3",
  "code4",
  "code5",
] as const;

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { control, handleSubmit } = useForm<FormData>();
  const [serverErrors, setServerErrors] = useState("");

  const { data: session, status } = useSession();

  if (session && status === "authenticated") {
    redirect("/");
  }

  const email = searchParams.get("email");

  if (!email) {
    redirect("/");
  }

  const onSubmit = async (data: FormData) => {
    const code = Object.values(data).join("");
    const payload = {
      code,
      email,
    };

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };

    const register = await fetch("/api/auth/verify-email", options);

    if (register.status === 404) {
      setServerErrors("User not found");
    }

    if (register.status === 400) {
      setServerErrors("Invalid or expired verification code");
    }

    if (register.status === 500) {
      setServerErrors("Server error, try again later");
    }

    if (register.ok) {
      router.push("/");
    }
  };

  return (
    <>
      <div>
        <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-12">
          <div className="relative bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
            <div className="mx-auto flex w-full max-w-md flex-col space-y-6">
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="text-3xl font-bold tracking-tight">
                  Email Verification
                </div>
                <div className="flex flex-row text-sm font-medium text-gray-500">
                  <div>
                    We have sent a code to your email{" "}
                    <span className="text-gray-700 font-semibold">{email}</span>
                  </div>
                </div>
              </div>

              {serverErrors && (
                <div
                  className="mb-4 rounded-lg border border-red-600 bg-red-50 p-4 text-sm text-red-800"
                  role="alert">
                  {serverErrors}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col space-y-16">
                  <div className="flex flex-row items-center justify-between mx-auto w-full max-w-md space-x-4">
                    {fieldNames.map((fieldName, index) => (
                      <div key={index} className="w-16 h-16">
                        <Controller
                          control={control}
                          name={fieldName}
                          render={({ field }) => (
                            <input
                              {...field}
                              className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                              type="text"
                              maxLength={1}
                              placeholder="0"
                              // Additional input props as needed
                            />
                          )}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col space-y-5">
                    <div>
                      <button className="flex flex-row items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-blue-700 border-none text-white text-sm shadow-sm">
                        Verify Account
                      </button>
                    </div>

                    <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                      <p>Didn&apos;t recieve code?</p>{" "}
                      <a
                        className="flex flex-row items-center text-blue-600"
                        href="http://"
                        target="_blank"
                        rel="noopener noreferrer">
                        Resend
                      </a>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
