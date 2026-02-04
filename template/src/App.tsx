import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Heading, Paragraph, Spinner } from "@digdir/designsystemet-react";

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--ds-color-neutral-background-default)",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          height: "4rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 var(--ds-spacing-4)",
          borderBottom: "1px solid var(--ds-color-neutral-border-default)",
          background: "var(--ds-color-neutral-background-default)",
        }}
      >
        <Heading level={2} data-size="md">Chef</Heading>
        <SignOutButton />
      </header>
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--ds-spacing-8)",
        }}
      >
        <div style={{ width: "100%", maxWidth: "28rem" }}>
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Spinner aria-label="Loading..." />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-spacing-6)", alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <Heading level={1} data-size="2xl">Cook with Chef</Heading>
        <Authenticated>
          <Paragraph data-size="lg">
            Welcome back, {loggedInUser?.email ?? "friend"}!
          </Paragraph>
        </Authenticated>
        <Unauthenticated>
          <Paragraph data-size="lg">Sign in to get started</Paragraph>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </div>
  );
}
