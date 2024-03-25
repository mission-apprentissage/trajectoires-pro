"use client";
import Header from "@codegouvfr/react-dsfr/Header";
import { makeStyles } from "tss-react/dsfr";

export default function CustomHeader({
  title,
  tagline,
  quickAccessItems,
}: {
  title: string;
  tagline?: string;
  quickAccessItems?: JSX.Element[];
}) {
  const { classes, cx } = useStyles();

  return (
    <Header
      className={cx(classes.root)}
      brandTop={
        <>
          RÉPUBLIQUE
          <br />
          FRANÇAISE
        </>
      }
      serviceTitle={title}
      serviceTagline={tagline}
      homeLinkProps={{
        href: "/",
        title,
      }}
      quickAccessItems={quickAccessItems}
    />
  );
}

CustomHeader.displayName = CustomHeader.name;

const useStyles = makeStyles({ name: CustomHeader.name })((theme) => ({
  root: {
    ul: {
      flexGrow: "1",
      li: {
        flexGrow: 1,
      },
    },
    ".fr-header__tools": {
      flex: "1 1 auto",
    },
  },
}));
