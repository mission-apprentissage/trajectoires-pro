import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import Page from "#/app/(statistiques)/statistiques/page";
import config from "#/app/(statistiques)/statistiques/config";

describe("Page", () => {
  it("renders a page", async () => {
    await act(async () => render(await Page()));

    expect(screen.getByTitle("Metabase iframe")).toBeInTheDocument();
    expect(screen.getByTitle("Metabase iframe")).toHaveAttribute(
      "src",
      expect.stringContaining(process.env.METABASE_SITE_URL)
    );
  });
});
