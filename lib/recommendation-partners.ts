export type WheelPartner = {
  availability: string;
  id: string;
  name: string;
  price: string;
  shipping: string;
  url: string;
};

export type WheelProductMock = {
  imageAlt: string;
  imageSrc: string;
  partners: WheelPartner[];
};

export const WHEEL_TEST_IMAGE_SRC =
  "/recommendations/pravila-vubora-koles-velosipoeda.jpg";

const partnerCatalog = [
  {
    availability: "En stock",
    id: "velo-store",
    name: "Vélo Store Paris",
    priceOffset: 0,
    shipping: "Retrait atelier sous 24h",
  },
  {
    availability: "Stock limité",
    id: "cycle-market",
    name: "Cycle Market",
    priceOffset: -2,
    shipping: "Livraison 48h",
  },
  {
    availability: "Disponible en ligne",
    id: "pro-bike-center",
    name: "Pro Bike Center",
    priceOffset: 4,
    shipping: "Livraison offerte dès 80 €",
  },
] as const;

export function getWheelProductMock(
  model: string,
  price: string | number,
): WheelProductMock {
  return {
    imageAlt: `Photo de roue pour ${model}`,
    imageSrc: WHEEL_TEST_IMAGE_SRC,
    partners: partnerCatalog.map((partner) => ({
      availability: partner.availability,
      id: partner.id,
      name: partner.name,
      price: formatPartnerPrice(price, partner.priceOffset),
      shipping: partner.shipping,
      url: buildPartnerUrl(partner.id, model),
    })),
  };
}

function buildPartnerUrl(partnerId: string, model: string) {
  return `https://shop.michelin-ride.example/${partnerId}/${slugify(model)}`;
}

function formatPartnerPrice(price: string | number, offset: number) {
  const parsed = Number(price);
  const value = Number.isFinite(parsed) ? parsed + offset : 0;

  return `${value.toFixed(2)} €`;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
