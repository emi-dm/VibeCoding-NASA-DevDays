import { describe, expect, it } from "vitest";

import {
  NASA_YEAR_MAX,
  NASA_YEAR_MIN,
  parseYearInput,
  validateYearOrderMessage,
} from "@/lib/nasa-year-input";

describe("parseYearInput", () => {
  it("returns null for empty input", () => {
    expect(parseYearInput("  ")).toBeNull();
  });

  it("returns null for non YYYY formats", () => {
    expect(parseYearInput("20")).toBeNull();
    expect(parseYearInput("abcd")).toBeNull();
    expect(parseYearInput("2024-01")).toBeNull();
  });

  it("returns null for years outside NASA bounds", () => {
    expect(parseYearInput(String(NASA_YEAR_MIN - 1))).toBeNull();
    expect(parseYearInput(String(NASA_YEAR_MAX + 1))).toBeNull();
  });

  it("returns parsed year for valid YYYY inputs", () => {
    expect(parseYearInput(String(NASA_YEAR_MIN))).toBe(NASA_YEAR_MIN);
    expect(parseYearInput(" 1998 ")).toBe(1998);
    expect(parseYearInput(String(NASA_YEAR_MAX))).toBe(NASA_YEAR_MAX);
  });
});

describe("validateYearOrderMessage", () => {
  it("returns error when start year is greater than end year", () => {
    expect(validateYearOrderMessage(2024, 2020)).toBe(
      "El año inicial no puede ser mayor que el año final.",
    );
  });

  it("returns null when order is valid or one value is missing", () => {
    expect(validateYearOrderMessage(2020, 2024)).toBeNull();
    expect(validateYearOrderMessage(null, 2024)).toBeNull();
    expect(validateYearOrderMessage(2020, null)).toBeNull();
  });
});