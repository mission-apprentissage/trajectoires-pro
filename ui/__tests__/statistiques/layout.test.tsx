import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Layout } from "#/app/statistiques/layout";

describe("Layout", () => {
  it("renders a layout", async () => {
    await act(async () =>
      render(
        <Layout>
          <></>
        </Layout>
      )
    );

    const heading = screen.getByRole("heading", {
      name: /Statistiques du projet Exposition d'InserJeunes/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it("render the children", async () => {
    await act(async () =>
      render(
        <Layout>
          <div data-testid="children" />
        </Layout>
      )
    );

    const children = screen.getByTestId("children");
    expect(children).toBeInTheDocument();
  });
});
