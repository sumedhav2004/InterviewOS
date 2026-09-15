type HeadingProps = {
  children: React.ReactNode;
};

export function Heading({ children }: HeadingProps) {
  return (
    <h2 className="text-balance text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
      {children}
    </h2>
  );
}