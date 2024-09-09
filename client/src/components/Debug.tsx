export function Debug({ children }: { children: unknown }) {
  return (
    <div>
      <pre style={{ textAlign: 'left' }}>{JSON.stringify(children, null, 2)}</pre>
    </div>
  );
}
