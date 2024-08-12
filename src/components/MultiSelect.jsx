import React, {
  useState,
  useRef,
  useContext,
  createContext,
  useCallback,
  useEffect,
} from "react";
import clsx from "clsx";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

const MultiSelectContext = createContext();

function MultiSelect({ children, DefaultValue, onChange }) {
  const [selectedValue, setSelectedValue] = useState(
    DefaultValue ? [DefaultValue] : []
  );
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef([]);
  const triggerRef = useRef();

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      onChange(selectedValue);
    }
  }, [selectedValue, onChange]);

  const handleSelection = useCallback(
    (data) => {
      setSelectedValue((prevSelected) =>
        prevSelected.includes(data)
          ? prevSelected.filter((item) => item !== data)
          : [...prevSelected, data]
      );
    },
    [setSelectedValue]
  );

  return (
    <MultiSelectContext.Provider
      value={{
        selectedValue,
        handleSelection,
        toggleDropdown: () => setIsOpen((prevIsOpen) => !prevIsOpen),
        isOpen,
        dropdownRef,
        highlightedIndex,
        setHighlightedIndex,
        setIsOpen,
        triggerRef,
      }}
    >
      <div className="relative">{children}</div>
    </MultiSelectContext.Provider>
  );
}

function SelectTrigger({ children, className }) {
  const {
    toggleDropdown,
    isOpen,
    setIsOpen,
    dropdownRef,
    highlightedIndex,
    setHighlightedIndex,
    triggerRef,
  } = useContext(MultiSelectContext);

  const handleKeyDown = (event) => {
    const itemCount = dropdownRef.current.length;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prevIndex) => (prevIndex + 1) % itemCount);
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((prevIndex) =>
          prevIndex === 0 ? itemCount - 1 : prevIndex - 1
        );
        break;
      case "Enter":
        if (highlightedIndex !== -1) {
          const selectedItem = dropdownRef.current[highlightedIndex];
          if (selectedItem) {
            selectedItem.click();
          }
        }
        break;
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleBlur = (event) => {
    if (!dropdownRef.current.includes(event.relatedTarget)) {
      setIsOpen(false);
    }
  };

  return (
    <button
      ref={triggerRef}
      onClick={toggleDropdown}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={clsx(
        "relative p-2 max-w-60 w-fit text-left bg-white rounded-lg shadow-md cursor-default flex gap-2 sm:text-sm focus:border-2 border-2 border-white focus-visible:border-2",
        className
      )}
    >
      {children}
      <span className="">
        {isOpen ? (
          <ChevronUp className=" text-gray-500 h-4" />
        ) : (
          <ChevronDown className=" text-gray-500 h-4" />
        )}
      </span>
    </button>
  );
}

function SelectValue({ placeholder }) {
  const { selectedValue } = useContext(MultiSelectContext);

  return (
    <span className="block truncate min-w-24 ">
      {selectedValue.length > 0 ? selectedValue.join(", ") : placeholder}
    </span>
  );
}

function SelectContent({ children }) {
  const {
    isOpen,
    dropdownRef,
    highlightedIndex,
    setHighlightedIndex,
    setIsOpen,
    triggerRef,
  } = useContext(MultiSelectContext);

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
    }
  }, [isOpen, setHighlightedIndex]);

  useEffect(() => {
    if (isOpen && highlightedIndex !== -1) {
      const item = dropdownRef.current[highlightedIndex];
      item?.focus();
    }
  }, [isOpen, highlightedIndex, dropdownRef]);

  const handleKeyDown = (event) => {
    const itemCount = dropdownRef.current.length;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prevIndex) => (prevIndex + 1) % itemCount);
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((prevIndex) =>
          prevIndex === 0 ? itemCount - 1 : prevIndex - 1
        );
        break;
      case "Enter":
        if (highlightedIndex !== -1) {
          const selectedItem = dropdownRef.current[highlightedIndex];
          if (selectedItem) {
            selectedItem.click(); // Trigger the click event programmatically
          }
        }
        break;
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    isOpen && (
      <div
        onKeyDown={handleKeyDown}
        className="absolute left-0 z-10 mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        tabIndex={-1}
        style={{
          minWidth: triggerRef.current
            ? triggerRef.current.offsetWidth
            : "auto",
          top: "100%",
        }}
      >
        {children}
      </div>
    )
  );
}

function SelectItem({ value, children }) {
  const {
    selectedValue,
    handleSelection,
    highlightedIndex,
    setHighlightedIndex,
    dropdownRef,
    setIsOpen,
    triggerRef,
  } = useContext(MultiSelectContext);
  const index = useRef(null);
  const isSelected = selectedValue.some((data) => data === value);

  const handleBlur = (event) => {
    if (
      !dropdownRef.current.includes(event.relatedTarget) &&
      event.relatedTarget !== triggerRef.current
    ) {
      setIsOpen(false);
      triggerRef.current.focus();
    }
  };

  return (
    <div
      onBlur={handleBlur}
      className={clsx(
        "cursor-default select-none relative py-2 pl-10 pr-4 min-w-fit",
        isSelected ? "bg-amber-100 text-amber-900" : "text-gray-900",
        highlightedIndex === index.current ? "bg-blue-500 text-white" : ""
      )}
      onClick={() => handleSelection(value)}
      onMouseEnter={() => setHighlightedIndex(index.current)}
      ref={(el) => {
        if (el) {
          const elemIndex = Array.from(el.parentNode.children).indexOf(el);
          index.current = elemIndex;
          dropdownRef.current[elemIndex] = el;
        }
      }}
      tabIndex={-1}
    >
      <span
        className={clsx(
          isSelected ? "font-medium" : "font-normal",
          "block truncate"
        )}
      >
        {children}
      </span>
      {isSelected && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
          <Check />
        </span>
      )}
    </div>
  );
}

export { MultiSelect, SelectTrigger, SelectValue, SelectContent, SelectItem };
