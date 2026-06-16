import { afterEach, describe, expect, it, vi } from "vitest";
import {
  connecter,
  MSG_GATT_INDISPONIBLE,
  parseTrame,
} from "@/app/_lib/ble";

describe("BLE helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses only complete numeric ESP frames", () => {
    expect(
      parseTrame({
        bat: 91,
        d: 42.3,
        pf: 2.1,
        pr: 2.2,
        v: 31.5,
        wf: 12,
        wr: 18,
      }),
    ).toEqual({
      bat: 91,
      d: 42.3,
      pf: 2.1,
      pr: 2.2,
      v: 31.5,
      wf: 12,
      wr: 18,
    });

    expect(parseTrame(null)).toBeNull();
    expect(parseTrame({ pf: 2.1 })).toBeNull();
    expect(
      parseTrame({
        bat: 91,
        d: 42.3,
        pf: 2.1,
        pr: 2.2,
        v: "31.5",
        wf: 12,
        wr: 18,
      }),
    ).toBeNull();
    expect(
      parseTrame({
        bat: 91,
        d: 42.3,
        pf: 2.1,
        pr: 2.2,
        v: Number.NaN,
        wf: 12,
        wr: 18,
      }),
    ).toBeNull();
  });

  it("fails defensively when a Bluetooth device exposes no GATT service", async () => {
    vi.stubGlobal("navigator", {
      bluetooth: {
        requestDevice: vi.fn().mockResolvedValue({
          addEventListener: vi.fn(),
          name: "Capteur sans GATT",
        }),
      },
    });

    await expect(connecter()).rejects.toThrow(MSG_GATT_INDISPONIBLE);
  });
});
