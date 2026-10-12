import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Event } from "@/lib/models";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: ({ queryKey }: { queryKey: string[] }) =>
    queryKey[0] === "event"
      ? { data: endedEvent, isPending: false, isError: false }
      : { data: [], isPending: false, isError: false },
}));
vi.mock("@/components/goup/auth", () => ({
  useAuth: () => ({
    token: "",
    user: null,
    favoriteIds: new Set<number>(),
    favoritePending: false,
    toggleFavorite: vi.fn(),
  }),
}));
vi.mock("@/components/goup/account", () => ({ DeleteEvent: () => null }));

import { EventCard } from "@/components/goup/common";
import { DetailsPage } from "@/components/goup/details";

const endedEvent: Event = {
  id: 1,
  title: "Show de ontem",
  description: "Descrição",
  eventDate: "2026-10-11",
  startTime: "12:00:00",
  endTime: "14:00:00",
  price: 0,
  status: "PUBLISHED",
  ended: true,
  ageRating: "FREE",
  user: { id: 2, name: "Ana" },
  location: {
    id: 3,
    placeId: "place-1",
    name: "Teatro",
    address: "Rua A",
    city: "Blumenau",
    state: "SC",
    latitude: -26.9,
    longitude: -49.0,
  },
  category: null,
};

describe("ended events", () => {
  it("marks an ended event card", () => {
    const container = document.createElement("div");
    container.innerHTML = renderToStaticMarkup(<EventCard event={endedEvent} />);
    expect(container.querySelector(".event-card.ended .event-ended-badge")?.textContent).toBe(
      "Encerrado",
    );
  });

  it("shows the ended notice on the event detail page", () => {
    const container = document.createElement("div");
    container.innerHTML = renderToStaticMarkup(<DetailsPage id="1" />);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "Esse evento já acabou!",
    );
    expect(container.querySelector('[role="alert"] a[href="/eventos"]')?.textContent).toBe(
      "Veja outros eventos",
    );
  });
});
