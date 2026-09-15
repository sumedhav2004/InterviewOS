import { Heading } from "./heading";
import { Label } from "./label";
import { FragmentedFlow } from "./visuals/fragmented-flow";


export function Problem() {
  return (
    <section className="px-4 py-28 sm:px-6 sm:py-40">
      <div className="mx-auto max-w-7xl text-center">
        <Label>The old way breaks focus</Label>

        <Heading>
          Stop conducting interviews
          <br className="hidden sm:block" /> across six different tabs.
        </Heading>

        <FragmentedFlow />
      </div>
    </section>
  );
}