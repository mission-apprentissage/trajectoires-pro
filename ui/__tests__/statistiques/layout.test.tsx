import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import BaseLayout from "#/app/(statistiques)/BaseLayout";

describe("Layout", () => {
  it("renders a layout", async () => {
    await act(async () =>
      render(
        <BaseLayout>
          <></>
        </BaseLayout>
      )
    );
  });

  it("render the children", async () => {
    await act(async () =>
      render(
        <BaseLayout>
          <div data-testid="children" />
        </BaseLayout>
      )
    );

    const children = screen.getByTestId("children");
    expect(children).toBeInTheDocument();
  });
});
