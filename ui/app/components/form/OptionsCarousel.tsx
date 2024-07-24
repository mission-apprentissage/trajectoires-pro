/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import Button from "../Button";
import { Box } from "../MaterialUINext";
import { useCallback, useEffect, useRef, useState } from "react";

export default function OptionsCarousel<T>({
  selected,
  defaultValue,
  options,
  onClick,
}: {
  selected?: T[];
  defaultValue?: T;
  options: { option: string; value: T }[];
  onClick?: (selected: T) => void;
}): React.ReactNode {
  const scollOffset = 400;
  const refContainer = useRef<HTMLDivElement>(null);
  const refOptions = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(
    selected && selected.length > 0 ? options.findIndex((o) => o.value === selected[0]) : 0
  );
  const [isLoaded, setIsLoaded] = useState(false);

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

  useEffect(() => {
    if (!isLoaded) {
      scollToCb(currentIndex);
      setIsLoaded(true);
    }
  }, [currentIndex, isLoaded]);

  console.log(selected, defaultValue, !selected?.length && defaultValue !== undefined);
  return (
    <Box style={{ display: "flex", position: "relative" }}>
      <Box style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Button
          iconOnly
          size="large"
          rounded
          iconId="fr-icon-arrow-left-s-first-line"
          onClick={() => refContainer?.current && scrollList(refContainer.current.scrollLeft - scollOffset)}
          priority="tertiary no outline"
          title="Domaines de formations précédents"
          style={{
            border: "1px solid var(--text-action-high-blue-france)",
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
          }
        `}
        sx={{
          display: "flex",
          flexDirection: "row",
          overflow: "scroll",
          overflowY: "scroll",
          gap: "0 1rem",
          marginRight: "1px",
          marginLeft: "1px",
          paddingRight: "200px",
          paddingLeft: "1rem",
        }}
        ref={refContainer}
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
                priority={isSelected ? undefined : "tertiary no outline"}
                size="small"
                rounded
                onClick={() => {
                  if (!refContainer.current) {
                    return;
                  }

                  const currentRef = refOptions.current[index];
                  if (!currentRef || !currentRef.getBoundingClientRect || !currentRef.getBoundingClientRect()) {
                    return;
                  }

                  // If element is not full
                  const rightSide =
                    currentRef.getBoundingClientRect().x +
                    currentRef.getBoundingClientRect().width -
                    (refContainer.current.getBoundingClientRect().width +
                      refContainer.current.getBoundingClientRect().x);

                  const leftSide =
                    currentRef.getBoundingClientRect().x - refContainer.current.getBoundingClientRect().x;

                  if (rightSide > -50) {
                    scrollList(refContainer.current.scrollLeft + rightSide + 50);
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
      <Box
        style={{
          pointerEvents: "none",
          position: "absolute",
          left: "35px",

          display: "block",

          width: "20px",
          height: "100%",
          backgroundImage: "linear-gradient(270deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
        }}
      ></Box>

      <Box
        style={{
          pointerEvents: "none",
          position: "absolute",
          right: "35px",

          display: "block",

          width: "20px",
          height: "100%",
          backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
        }}
      ></Box>
      <Box style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Button
          iconOnly
          size="large"
          rounded
          iconId="fr-icon-arrow-right-s-last-line"
          onClick={() => refContainer?.current && scrollList(refContainer.current.scrollLeft + scollOffset)}
          priority="tertiary no outline"
          title="Domaines de formations suivants"
          style={{ border: "1px solid var(--text-action-high-blue-france)" }}
        />
      </Box>
    </Box>
  );
}
