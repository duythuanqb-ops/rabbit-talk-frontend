import AuthView from "@/features/auth/views/AuthView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "RibbitTalk | Sign up",
  description: "Join RibbitTalk today and start your learning journey.",
};

export default function SignUpPage() {
  return <AuthView />;
}
