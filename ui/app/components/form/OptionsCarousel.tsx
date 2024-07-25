/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import Button from "../Button";
import { Box } from "../MaterialUINext";
import { useCallback, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { BoxProps } from "@mui/material";
import { FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";

const Gradient = styled(Box, {
  shouldForwardProp: (prop) => !["reverse"].includes(prop),
})<BoxProps & { reverse?: boolean }>`
  pointer-events: none;
  position: absolute;
  ${({ reverse }) => (reverse ? "right: 34px" : "left: 34px")};
  display: block;
  width: 48px;
  height: 100%;
  background-image: ${({ reverse }) =>
    reverse
      ? "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)"
      : "linear-gradient(270deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)"};
`;

export default function OptionsCarousel<T>({
  selected,
  defaultValue,
  options,
  onClick,
}: {
  selected?: T[];
  defaultValue?: T;
  options: { option: string; value: T; icon?: never | FrIconClassName | RiIconClassName }[];
  onClick?: (selected: T) => void;
}): React.ReactNode {
  const scollOffset = 400;

  const refContainer = useRef<HTMLDivElement>(null);
  const refOptions = useRef<(HTMLDivElement | null)[]>([]);

  const [currentIndex, setCurrentIndex] = useState(
    selected && selected.length > 0 ? options.findIndex((o) => o.value === selected[0]) : 0
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScrollMax, setIsScrollMax] = useState(-1); // -1 = max left, 1 = max right

  const scrollList = (offset: number) => {
    if (!refContainer?.current) {
      return;
    }

    refContainer.current.scrollLeft = offset;
  };

  const scollToCb = useCallback((index: number) => {
    if (!refOptions?.current[index] || !refContainer?.current) {
      return;
    }

    const currentRef = refOptions.current[index];
    if (!currentRef || !currentRef.getBoundingClientRect || !currentRef.getBoundingClientRect()) {
      return;
    }

    const newScrollPosition =
      currentRef.getBoundingClientRect().x -
      refContainer.current.getBoundingClientRect().x +
      refContainer.current.scrollLeft;

    scrollList(newScrollPosition - 100);
    setCurrentIndex(index);
  }, []);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      const target = event.target as HTMLElement;
      if (!target) {
        return;
      }

      const { scrollLeft, scrollWidth, offsetWidth } = target;
      setIsScrollMax(scrollLeft === 0 ? -1 : scrollLeft + offsetWidth === scrollWidth ? 1 : 0);
    },
    [refContainer]
  );

  useEffect(() => {
    if (!isLoaded) {
      scollToCb(currentIndex);
      setIsLoaded(true);
    }
  }, [currentIndex, isLoaded]);

  return (
    <Box style={{ display: "flex", position: "relative" }}>
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          left: 0,
          backgroundColor: "white",
          visibility: isScrollMax === -1 ? "hidden" : undefined,
        }}
      >
        <Button
          iconOnly
          size="large"
          rounded
          iconId="fr-icon-arrow-left-s-line"
          onClick={() => refContainer?.current && scrollList(refContainer.current.scrollLeft - scollOffset)}
          priority="tertiary no outline"
          title="Domaines de formations précédents"
          style={{
            border: "1px solid var(--grey-900-175)",
          }}
        />
      </Box>
      <Box
        css={css`
          &::-webkit-scrollbar {
            display: none;
          }

          /* Hide scrollbar for IE, Edge and Firefox */
          & {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
            ${isLoaded ? "scroll-behavior: smooth;" : ""}

            display: flex;
            flex-direction: row;
            overflow: scroll;
            overflow-y: scroll;
            gap: 0 1rem;
            margin-right: 2px;
            margin-left: 2px;
          }
        `}
        ref={refContainer}
        onScroll={handleScroll}
      >
        {options.map((option, index) => {
          const isSelected =
            !selected?.length && defaultValue !== undefined
              ? defaultValue === option.value
              : !!selected?.find((s) => option.value == s);

          return (
            <Box
              ref={(el) => (refOptions.current[index] = el as HTMLDivElement)}
              key={option.option}
              style={{ flexShrink: "0" }}
            >
              <Button
                {...(option.icon ? { iconId: option.icon } : { iconId: undefined })}
                priority={isSelected ? undefined : "tertiary no outline"}
                size="small"
                rounded
                style={{ paddingTop: "5px" }}
                css={css`
                  &:hover {
                    background-color: var(--active-tint) !important;
                  }

                  &:active {
                    background-color: var(--hover-tint) !important;
                  }
                `}
                onClick={() => {
                  const currentContainer = refContainer.current;
                  const currentRef = refOptions.current[index];

                  if (!currentContainer || !currentRef) {
                    return;
                  }

                  // If element is not full
                  const rightSide =
                    currentRef.offsetLeft +
                    currentRef.offsetWidth -
                    (currentContainer.offsetWidth + currentContainer.scrollLeft);

                  const leftSide = currentRef.offsetLeft - currentContainer.scrollLeft;

                  if (rightSide > -50) {
                    if (currentRef.offsetWidth > currentContainer.offsetWidth - 50) {
                      // Mobile
                      scrollList(refContainer.current.scrollLeft + leftSide - 50);
                    } else {
                      scrollList(refContainer.current.scrollLeft + rightSide);
                    }
                  }

                  if (leftSide < 50) {
                    scrollList(refContainer.current.scrollLeft + leftSide - 50);
                  }
                  onClick && onClick(option.value);
                }}
              >
                {option.option}
              </Button>
            </Box>
          );
        })}
      </Box>
      <Gradient style={{ visibility: isScrollMax === -1 ? "hidden" : undefined }} />
      <Gradient reverse style={{ visibility: isScrollMax === 1 ? "hidden" : undefined }} />
      <Box style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Button
          iconOnly
          size="large"
          rounded
          iconId="fr-icon-arrow-right-s-line"
          onClick={() => refContainer?.current && scrollList(refContainer.current.scrollLeft + scollOffset)}
          priority="tertiary no outline"
          title="Domaines de formations suivants"
          style={{
            border: "1px solid var(--grey-900-175)",
            visibility: isScrollMax === 1 ? "hidden" : undefined,
          }}
        />
      </Box>
    </Box>
  );
}
