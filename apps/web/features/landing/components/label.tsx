type LabelProps = {
  children: React.ReactNode;
};

export function Label({ children }: LabelProps) {
  return (
    <p className="mb-5 font-mono text-[10px] font-medium uppercase tracking-widest text-primary">
      {children}
    </p>
  );
}