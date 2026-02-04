"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Textfield, Paragraph, Divider } from "@digdir/designsystemet-react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-spacing-4)", width: "100%" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error: Error) => {
            let toastTitle = "";
            if (error.message.includes("Invalid password")) {
              toastTitle = "Invalid password. Please try again.";
            } else {
              toastTitle =
                flow === "signIn"
                  ? "Could not sign in, did you mean to sign up?"
                  : "Could not sign up, did you mean to sign in?";
            }
            toast.error(toastTitle);
            setSubmitting(false);
          });
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-spacing-4)" }}>
          <Textfield
            type="email"
            name="email"
            label="Email"
            placeholder="Enter your email"
            required
          />
          <Textfield
            type="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            required
          />
          <Button type="submit" data-color="accent" disabled={submitting}>
            {flow === "signIn" ? "Sign in" : "Sign up"}
          </Button>
        </div>
      </form>

      <div style={{ display: "flex", gap: "var(--ds-spacing-2)", alignItems: "center", justifyContent: "center" }}>
        <Paragraph data-size="sm">
          {flow === "signIn"
            ? "Don't have an account?"
            : "Already have an account?"}
        </Paragraph>
        <Button
          type="button"
          variant="tertiary"
          data-size="sm"
          onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
        >
          {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
        </Button>
      </div>

      <div style={{ display: "flex", gap: "var(--ds-spacing-4)", alignItems: "center" }}>
        <Divider style={{ flex: 1 }} />
        <Paragraph data-size="sm">or</Paragraph>
        <Divider style={{ flex: 1 }} />
      </div>

      <Button variant="secondary" onClick={() => void signIn("anonymous")}>
        Sign in anonymously
      </Button>
    </div>
  );
}
