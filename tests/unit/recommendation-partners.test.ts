import { describe, expect, it } from "vitest";
import {
  WHEEL_TEST_IMAGE_SRC,
  getWheelProductMock,
} from "@/lib/recommendation-partners";

describe("recommendation partner mocks", () => {
  it("returns image and partner offers for a known wheel", () => {
    const product = getWheelProductMock("Michelin Road Performance", "59.90");

    expect(product.imageSrc).toBe(WHEEL_TEST_IMAGE_SRC);
    expect(product.imageAlt).toBe(
      "Photo de roue pour Michelin Road Performance",
    );
    expect(product.partners).toHaveLength(3);
    expect(product.partners[0]).toMatchObject({
      availability: "En stock",
      name: "Vélo Store Paris",
      price: "59.90 €",
    });
    expect(product.partners[0].url).toContain("michelin-road-performance");
  });

  it("falls back to a generic wheel image and shop links", () => {
    const product = getWheelProductMock("Unknown Michelin Tire", 42);

    expect(product.imageSrc).toBe(WHEEL_TEST_IMAGE_SRC);
    expect(product.partners).toHaveLength(3);
    expect(product.partners[1].price).toBe("40.00 €");
    expect(product.partners[1].url).toContain("unknown-michelin-tire");
  });
});
