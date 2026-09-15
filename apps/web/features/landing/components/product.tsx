import { Heading } from "./heading";
import { Label } from "./label";
import { ProductShowcase } from "./visuals/product-showcase";


export function Product() {
  return (
    <section
      id="product"
      className="border-y border-border bg-card/30 px-4 py-28 sm:px-6 sm:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <Label>Inside InterviewOS</Label>

          <Heading>
            The entire interview,
            <br />
            beautifully connected.
          </Heading>
        </div>

        <ProductShowcase />
      </div>
    </section>
  );
}