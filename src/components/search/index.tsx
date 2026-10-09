import { FC, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import { IconClear, IconSearch } from "@/assets/svg";

interface SearchOption {
    name: string;
    value: string | number;
}
interface SearchProps {
    expandable?: boolean;
    options?: SearchOption[];
    onClick?: (option: SearchOption) => void;
}

export const Search: FC<SearchProps> = (props) => {
    const { expandable, options, onClick } = props;
    const [focused, setFocused] = useState<boolean>(false);
    const [value, setValue] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [suggestions, setSuggestions] = useState<SearchOption[]>([]);
    const suggestionsRef = useRef<SearchOption[]>(suggestions);
    const [activeSuggestionIndex, setActiveSuggestionIndex] =
        useState<number>(-1);

    useEffect(() => {
        if (options) {
            if (value.length === 0) {
                const temp = options.slice(0, 10);
                setSuggestions(temp);
                suggestionsRef.current = temp;
            } else {
                const temp = options.filter((option) =>
                    option.name.includes(value),
                );
                setSuggestions(temp);
                suggestionsRef.current = temp;
            }
            setActiveSuggestionIndex(-1);
        }
    }, [options, value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveSuggestionIndex((prevIndex) => {
                const nextIndex = prevIndex + 1;
                return nextIndex >= suggestionsRef.current.length
                    ? 0
                    : nextIndex;
            });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveSuggestionIndex((prevIndex) => {
                const nextIndex = prevIndex - 1;
                return nextIndex < 0
                    ? suggestionsRef.current.length - 1
                    : nextIndex;
            });
        } else if (e.key === "Enter") {
            if (
                activeSuggestionIndex >= 0 &&
                activeSuggestionIndex < suggestionsRef.current.length
            ) {
                const selectedOption =
                    suggestionsRef.current[activeSuggestionIndex];
                if (onClick) onClick(selectedOption);
                setValue(selectedOption.name);
                setActiveSuggestionIndex(-1);
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [activeSuggestionIndex, onClick]);

    const HighlightText = (a: string, b: string) => {
        const highlightedText = a
            .split(new RegExp(`(${b})`, "gi"))
            .map((part, index) =>
                part.toLowerCase() === b.toLowerCase() ? (
                    <em
                        key={`search-suggestion-em-${index}`}
                        className="text-text-9 not-italic"
                    >
                        {part}
                    </em>
                ) : (
                    part
                ),
            );

        return <span>{highlightedText}</span>;
    };

    return (
        <div className="h-[38px]" ref={containerRef}>
            <div
                className={twMerge(
                    "relative bg-hover-1 border border-solid border-border-1 h-10 box-border",
                    "transition-colors duration-300 hover:bg-white",
                    "pl-1 pr-12 flex items-center",
                    focused ? "bg-white opacity-100" : "opacity-90",
                    focused && expandable
                        ? "rounded-t-lg border-b-0"
                        : "rounded-lg",
                )}
            >
                <div
                    className={twMerge(
                        "w-full px-2 border-2 h-8 border-solid border-transparent flex items-center rounded-md",
                        focused && "bg-border-1",
                    )}
                >
                    <input
                        onFocus={() => setFocused(true)}
                        type="text"
                        className="flex-1 pr-2 text-text-1 border-0 border-transparent outline-0"
                        onChange={(e) => {
                            setValue(e.target.value);
                        }}
                        ref={inputRef}
                        value={value}
                    />
                    <div
                        className={twMerge(
                            "text-base text-icon-2 hover:text-icon-1 cursor-pointer",
                            value.length === 0 && "invisible",
                        )}
                        onClick={() => {
                            setValue("");
                            if (inputRef.current) {
                                inputRef.current.focus();
                            }
                        }}
                    >
                        <IconClear />
                    </div>
                </div>
                <div className="absolute top-[3px] right-[7px] flex items-center justify-center w-8 h-8 rounded-md cursor-pointer hover:bg-border-1">
                    <IconSearch />
                </div>
            </div>
            {expandable && focused && (
                <div className="max-h-[612px] overflow-y-auto w-full border border-solid border-border-1 rounded-b-lg pt-[13px] pb-4 box-border border-t-0 bg-white z-[999]">
                    {suggestions.map((item, index) => (
                        <div
                            key={`search-suggestion-${index}`}
                            className={twMerge(
                                "h-8 text-sm text-left text-nowrap overflow-ellipsis overflow-hidden max-w-80 cursor-pointer px-4 mb-1 hover:bg-gray-1 flex items-center justify-start bg-white z-[99999]",
                                activeSuggestionIndex === index && "bg-gray-1",
                            )}
                            onClick={() => {
                                if (onClick) onClick(item);
                                if (inputRef.current) {
                                    inputRef.current.focus();
                                    setValue(item.name);
                                }
                            }}
                        >
                            {HighlightText(item.name, value)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
