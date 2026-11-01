export default function CertificatesLoading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex min-h-[60dvh] max-w-2xl items-center justify-center px-6 text-dd-muted"
    >
      <p role="status">Consultando certificados e critérios de conquista…</p>
    </main>
  );
}
