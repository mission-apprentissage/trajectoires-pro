import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import Page from "#/app/(statistiques)/statistiques/details/page";
import { faker } from "@faker-js/faker";
import moment from "moment";

describe("Page", () => {
  it("renders a page", async () => {
    const adresse_ip = [faker.internet.ipv4(), faker.internet.ipv4()];
    const date = moment(faker.date.anytime()).format("YYYY-MM");
    const consumer = faker.string.alphanumeric(10);

    await act(async () =>
      render(
        await Page({
          searchParams: {
            adresse_ip: adresse_ip.join(","),
            date,
            consumer,
          },
        })
      )
    );

    const heading = screen.getByRole("heading", {
      name: consumer,
    });
    expect(heading).toBeInTheDocument();

    const iframe = screen.getByTitle("Metabase iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", expect.stringContaining(process.env.METABASE_SITE_URL || ""));
    expect(iframe).toHaveAttribute("src", expect.stringContaining(`adresse_ip=${adresse_ip[0]}`));
    expect(iframe).toHaveAttribute("src", expect.stringContaining(`adresse_ip=${adresse_ip[1]}`));
    expect(iframe).toHaveAttribute("src", expect.stringContaining(`date_r%25C3%25A9f%25C3%25A9rence=${date}`));
  });
});
